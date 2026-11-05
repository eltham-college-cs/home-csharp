// Main-thread side of the C# worker: one worker per page, queued runs,
// and a hard timeout that replaces the worker if a program never finishes.
//
// Each job compiles (only when the code has changed since the worker last compiled it),
// then runs. A program that doesn't compile never runs: its first compile error comes
// back as the result's error, with `compile: true`.
import { TIMEOUT_MS } from './checker-config';
import type { RunResult } from './compare';

type Status = 'loading' | 'ready' | 'failed';
type CompileResult = {
  ok: boolean;
  errors: { line: number; column: number; code: string; message: string }[];
};
type RawRun = Omit<RunResult, 'timeout'> & { tooMuchOutput: boolean };

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let compiled: string | null = null; // the code the current worker last compiled
let nextId = 1;
let chain: Promise<unknown> = Promise.resolve();
const listeners = new Set<(s: Status) => void>();
let status: Status = 'loading';

/** Loading progress: bytes downloaded so far (total is 0 if unknown), then 'starting'. */
export type Progress = { stage: 'download' | 'starting'; loaded: number; total: number };
const progressListeners = new Set<(p: Progress) => void>();
let lastProgress: Progress | null = null;

/** Follow the C# runner's loading progress. Called straight away with the latest progress, if any. */
export function onProgress(fn: (p: Progress) => void) {
  progressListeners.add(fn);
  if (lastProgress && status === 'loading') fn(lastProgress);
  return () => progressListeners.delete(fn);
}

function setStatus(s: Status) {
  status = s;
  listeners.forEach((fn) => fn(s));
}

export function onStatus(fn: (s: Status) => void) {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

function workerUrl() {
  return `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}runner/csharp.worker.js`;
}

function spawn(): Promise<void> {
  worker = new Worker(workerUrl(), { type: 'module' });
  compiled = null;
  setStatus('loading');
  readyPromise = new Promise<void>((resolve, reject) => {
    const w = worker!;
    const fail = (message: string) => {
      w.removeEventListener('message', onMsg);
      setStatus('failed');
      readyPromise = null;
      reject(new Error(message));
    };
    const onMsg = (e: MessageEvent) => {
      if (e.data.type === 'progress') {
        lastProgress = { stage: e.data.stage, loaded: e.data.loaded, total: e.data.total };
        progressListeners.forEach((fn) => fn(lastProgress!));
      } else if (e.data.type === 'ready') {
        w.removeEventListener('message', onMsg);
        setStatus('ready');
        resolve();
      } else if (e.data.type === 'failed') fail(e.data.message);
    };
    w.addEventListener('message', onMsg);
    w.addEventListener('error', (e) => fail(e.message || 'The C# runner could not start.'), { once: true });
    w.postMessage({ type: 'init' });
  });
  return readyPromise;
}

/** Start loading C# in the background. Safe to call many times. */
export function warmUp(): Promise<void> {
  if (!readyPromise) return spawn();
  return readyPromise;
}

/** Send one message and wait for its result. A timeout replaces the worker and resolves null. */
function ask<T>(msg: Record<string, unknown>, timeoutMs: number | null): Promise<T | null> {
  return new Promise<T | null>((resolve, reject) => {
    const w = worker!;
    const id = nextId++;
    const timer =
      timeoutMs === null
        ? 0
        : window.setTimeout(() => {
            w.removeEventListener('message', onMsg);
            w.terminate();
            worker = null;
            readyPromise = null;
            warmUp().catch(() => {});
            resolve(null);
          }, timeoutMs);
    const onMsg = (e: MessageEvent) => {
      if (e.data.id !== id) return;
      window.clearTimeout(timer);
      w.removeEventListener('message', onMsg);
      if (e.data.type === 'result') resolve(e.data.result as T);
      else reject(new Error(e.data.message));
    };
    w.addEventListener('message', onMsg);
    w.postMessage({ ...msg, id });
  });
}

async function runOnce(code: string, inputs: string[], mode: 'run' | 'test', seed: number): Promise<RunResult> {
  await warmUp();
  if (compiled !== code) {
    // Compiling has no timeout: it can't loop forever, and the first one can take a second.
    const c = await ask<CompileResult>({ type: 'compile', code }, null);
    if (!c!.ok) {
      compiled = null;
      const first = c!.errors[0];
      return {
        segments: [],
        error: {
          type: first.code,
          message: first.message,
          line: first.line,
          column: first.column,
          compile: true,
          more: c!.errors.length - 1,
        },
      };
    }
    compiled = code;
  }
  const r = await ask<RawRun>({ type: 'run', input: inputs.join('\n'), interactive: mode === 'run', seed }, TIMEOUT_MS);
  if (r === null) return { segments: [], error: null, timeout: true };
  if (r.tooMuchOutput) return { segments: r.segments, error: null, timeout: true };
  return { segments: r.segments, error: r.error, needInput: r.needInput };
}

/**
 * Run a program. In 'run' mode, a Console.ReadLine() with no queued answer stops the
 * program and returns needInput, so the page can ask and then run it again.
 * In 'test' mode, running out of input makes ReadLine() return null, as a real console does.
 */
export function runCSharp(code: string, inputs: string[], mode: 'run' | 'test', seed = 42): Promise<RunResult> {
  const job = chain.then(() => runOnce(code, inputs, mode, seed));
  chain = job.catch(() => {});
  return job;
}
