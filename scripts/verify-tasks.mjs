// Runs every task's model solution (from solutions.json, next to tasks.json) against its tests,
// with the same C# runner the site uses, so a pass here means a pass on the site.
// Also runs each starter, so you can see which starters are meant to fail (fix the bug)
// and which already pass (predict, then run).
//
//     npm run verify
//
// Needs the runner built first (npm run runner). solutions.json files are git-ignored, so in
// CI there is usually nothing to check and the script says so.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

const root = fileURLToPath(new URL('..', import.meta.url));
const framework = join(root, 'public/runner/_framework');
const TIMEOUT_MS = 3000;

if (!existsSync(join(framework, 'dotnet.js'))) {
  console.error('The C# runner is not built yet. Run: npm run runner');
  process.exit(1);
}

// The runner runs in a worker thread, so an infinite loop can be stopped (as on the site).
const workerCode = `
  const { parentPort, workerData } = require('node:worker_threads');
  (async () => {
    const { dotnet } = await import(workerData + '/dotnet.js');
    const rt = await dotnet.create();
    const R = (await rt.getAssemblyExports(rt.getConfig().mainAssemblyName)).CsRunner.Runner;
    parentPort.on('message', (m) => {
      const json = m.type === 'compile' ? R.Compile(m.code) : R.Run(m.input, false, 42);
      parentPort.postMessage(JSON.parse(json));
    });
    parentPort.postMessage('ready');
  })();
`;

let worker = null;
let ready = null;
function start() {
  worker = new Worker(workerCode, { eval: true, workerData: framework });
  ready = new Promise((resolve) => worker.once('message', resolve));
  return ready;
}

function ask(msg, timeoutMs) {
  return new Promise((resolve) => {
    const timer = timeoutMs
      ? setTimeout(() => {
          worker.removeAllListeners('message');
          worker.terminate();
          start();
          resolve(null);
        }, timeoutMs)
      : null;
    worker.once('message', (r) => {
      clearTimeout(timer);
      resolve(r);
    });
    worker.postMessage(msg);
  });
}

/** Returns { out, error } like the site's checker sees them. */
async function run(code, input) {
  await ready;
  const c = await ask({ type: 'compile', code });
  if (!c.ok) {
    const e = c.errors[0];
    return { out: '', error: `${e.code} on line ${e.line}: ${e.message}` };
  }
  const r = await ask({ type: 'run', input }, TIMEOUT_MS);
  if (r === null || r.tooMuchOutput) return { out: '', error: 'Timeout' };
  const out = r.segments.filter((s) => s.kind === 'out').map((s) => s.text).join('');
  return { out, error: r.error ? `${r.error.type}${r.error.line ? ` on line ${r.error.line}` : ''}: ${r.error.message}` : null };
}

const norm = (s) => {
  s = s.replace(/\r\n/g, '\n');
  return s.endsWith('\n') ? s.slice(0, -1) : s;
};

function findTasks(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return findTasks(p);
    return name === 'tasks.json' ? [p] : [];
  });
}

start();
const lessonsDir = join(root, 'src/content/lessons');
let failures = 0;
let checked = 0;
for (const path of findTasks(lessonsDir).sort()) {
  const lesson = relative(lessonsDir, path).replace(/\/tasks\.json$/, '');
  const solPath = path.replace(/tasks\.json$/, 'solutions.json');
  if (!existsSync(solPath)) continue; // kept out of the public repository
  const solutions = JSON.parse(readFileSync(solPath, 'utf8'));
  checked++;
  for (const task of JSON.parse(readFileSync(path, 'utf8')).tasks) {
    const sol = solutions[task.id];
    if (sol === undefined) {
      console.log(`!! ${lesson} ${task.id}: no solution`);
      failures++;
      continue;
    }
    for (const t of task.tests) {
      const { out, error } = await run(sol, t.input);
      if (error || norm(out) !== norm(t.output)) {
        failures++;
        console.log(`FAIL ${lesson} ${task.id} input=${JSON.stringify(t.input)}\n  expected=${JSON.stringify(t.output)}\n  got=${JSON.stringify(out)} ${error ?? ''}`);
      }
    }
    let passes = 0;
    let firstError = '';
    for (const t of task.tests) {
      const { out, error } = await run(task.starter, t.input);
      if (!error && norm(out) === norm(t.output)) passes++;
      if (error && !firstError) firstError = error;
    }
    console.log(`ok   ${lesson.padEnd(58)} ${task.id.padEnd(20)} starter passes ${passes}/${task.tests.length} ${firstError.slice(0, 60)}`);
  }
}

if (!checked) console.log('No solutions.json files found (they are git-ignored), so there is nothing to check.');
else console.log(failures ? `\n${failures} problem(s).` : '\nAll solutions pass.');
await worker.terminate();
process.exit(failures ? 1 : 0);
