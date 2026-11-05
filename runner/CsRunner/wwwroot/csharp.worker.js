// Runs C# in the browser: the .NET runtime and the Roslyn compiler, inside a Web Worker.
// Loaded once per page and kept alive between runs. If a run takes too long, the page
// terminates this worker and starts a new one (see src/lib/cs.ts).
//
// Messages in:  {type:'init'}
//               {type:'compile', id, code}
//               {type:'run', id, input, interactive, seed}
// Messages out: {type:'progress', loaded, total, stage:'download'|'starting'}
//               {type:'ready'} | {type:'failed', message}
//               {type:'result', id, result} | {type:'failed', id, message}
import { dotnet } from './_framework/dotnet.js';

// ---- Loading progress ----
// sizes.json (written by scripts/build-runner.mjs) gives each file's download size.
// Each file counts up to its size as its bytes arrive, so the bar is right whether the
// server sends the .gz bytes as they are or unzips them on the way (larger byte counts).
const progress = { total: 0, sizes: {}, loaded: new Map(), last: 0 };

function fileName(url) {
  return url.split('?')[0].split('/').pop();
}

function report(stage = 'download', force = false) {
  const now = Date.now();
  if (!force && now - progress.last < 100) return;
  progress.last = now;
  let loaded = 0;
  for (const v of progress.loaded.values()) loaded += v;
  self.postMessage({ type: 'progress', stage, loaded, total: progress.total });
}

function counted(url, n, done) {
  const name = fileName(url);
  const size = progress.sizes[name];
  const sofar = (progress.loaded.get(name) ?? 0) + n;
  progress.loaded.set(name, size ? Math.min(done ? size : sofar, size) : 0);
  report('download', done);
}

/** Fetch a file and read it all, reporting progress as the bytes arrive. */
async function fetchBytes(url, countAs) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`${res.status} ${url}`);
  const reader = res.body.getReader();
  const chunks = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    length += value.length;
    counted(countAs, value.length, false);
  }
  counted(countAs, 0, true);
  const bytes = new Uint8Array(length);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.length;
  }
  return bytes;
}

// Each runtime file is published next to a .gz copy. Fetch that and unzip it in the browser,
// so the download is about 6.5 MB instead of 18 MB on any host, compressed or not.
// Some servers send .gz files with "Content-Encoding: gzip", so the browser has already unzipped
// them by the time we see them: only unzip when the bytes still start with the gzip header.
async function gunzip(url) {
  const type = url.split('?')[0].endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream';
  let bytes;
  if (typeof DecompressionStream === 'undefined') {
    bytes = await fetchBytes(url, url);
  } else {
    try {
      bytes = await fetchBytes(url + '.gz', url);
    } catch {
      bytes = await fetchBytes(url, url);
    }
  }
  const zipped = bytes[0] === 0x1f && bytes[1] === 0x8b;
  const body = zipped ? new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')) : bytes;
  return new Response(body, { headers: { 'content-type': type } });
}

async function loadSizes() {
  try {
    const res = await fetch(new URL('sizes.json', import.meta.url));
    const data = await res.json();
    progress.total = data.totalBytes;
    progress.sizes = data.files;
  } catch {
    // No sizes: the page shows "Getting C# ready…" without a percentage.
  }
}

let runner = null;

async function load() {
  if (!runner) {
    runner = (async () => {
      await loadSizes();
      report('download', true);
      const runtime = await dotnet
        .withResourceLoader((type, name, defaultUri) =>
          // dotnet.js and its sibling .js modules are imported, not fetched, so leave them alone.
          type === 'dotnetjs' || type === 'js-module-runtime' || type === 'js-module-native' || type === 'js-module-threads'
            ? defaultUri
            : gunzip(defaultUri),
        )
        .create();
      const exports = await runtime.getAssemblyExports(runtime.getConfig().mainAssemblyName);
      const r = exports.CsRunner.Runner;
      report('starting', true);
      // Let the "starting" message reach the page before the warm-up blocks this worker.
      await new Promise((resolve) => setTimeout(resolve, 0));
      // Warm Roslyn up now (about a second), so the first real compile is quick.
      r.Compile('System.Console.Write("");');
      return r;
    })();
  }
  return runner;
}

self.onmessage = async (event) => {
  const msg = event.data;
  try {
    const r = await load();
    if (msg.type === 'init') {
      self.postMessage({ type: 'ready' });
      return;
    }
    const json =
      msg.type === 'compile' ? r.Compile(msg.code) : r.Run(msg.input, !!msg.interactive, msg.seed | 0);
    self.postMessage({ type: 'result', id: msg.id, result: JSON.parse(json) });
  } catch (err) {
    self.postMessage({ type: 'failed', id: msg.type === 'init' ? -1 : msg.id, message: String(err) });
  }
};
