# C# runner

Compiles and runs a student's C# program **inside the browser**, so no code or data
leaves the device. It does for C# what Pyodide does for the Python site.

```
CsChecker ─▶ src/lib/cs.ts ──postMessage──▶ csharp.worker.js ──[JSExport]──▶ Runner.Compile(code)
              (3 s timeout → terminate          (in public/runner/)              Runner.Run(input, interactive, seed)
               and respawn the worker)
```

- `CsRunner/Runner.cs`: Roslyn compile, then run with `Console.SetIn` / `Console.SetOut`.
- `CsRunner/wwwroot/csharp.worker.js`: starts .NET in a module Web Worker, fetching the
  `.gz` copy of each runtime file and unzipping it in the browser.
- `src/lib/cs.ts` (in the site): main-thread wrapper, compile caching and the timeout.
- `src/pages/dev/[...slug].astro`: `/dev/runner/` self-test page (development only).
- `scripts/verify-tasks.mjs`: runs the same runner under Node to check model answers.

## Build and try

```bash
npm run runner        # dotnet publish, then copy into public/runner/
npm run dev           # then open /home-csharp/dev/runner/
```

Needs the .NET 10 SDK. The `wasm-tools` workload is **not** needed.

## Phase 0 results (5 November 2026, .NET 10.0.5, Roslyn 4.14, Chromium)

All 15 checks pass: output, input, integer division, compile errors CS1002 / CS0103 / CS0029
with line and column, `FormatException` and `ArgumentOutOfRangeException` with the student's
line number, "needs more input", `List<T>`, `Random`, `Math`, static state reset between runs,
the 100,000-character output limit, the 3 s infinite-loop timeout, and recovery after it.

| Measure | Result |
|---|---|
| Download (64 files) | 17.1 MB raw · **6.3 MB gzip** · 5.0 MB Brotli |
| Runtime start in worker (files cached) | ~100 ms |
| First compile (Roslyn warm-up) | 0.8–1.2 s |
| Later compiles | 5–20 ms |
| Run a typical program | ~1 ms |
| Restart after a timeout (files cached) | ~0.7 s |

## Things learned

1. **No PDBs.** Roslyn's PDB writer waits on a `Task`; single-threaded WebAssembly can't
   block, so it throws "Cannot wait on monitors". Instead the runner compiles twice: once
   as written (for accurate compile-error positions) and once with `__Trace.Line = n;`
   inserted before each statement (`LineMarker`), which gives runtime-error line numbers.
   The same markers could drive animated trace tables later.
2. **Trimming is on**, but the framework assemblies students use are kept whole with
   `TrimmerRootAssembly`. Student code compiles against the real reference assemblies
   (embedded from the targeting pack), not the trimmed runtime ones.
3. **JSON must be source-generated** (`RunnerJson`); reflection-based JSON is disabled
   in trimmed WebAssembly.
4. **Real exception messages.** Trimmed builds normally replace messages with resource keys
   (`Format_InvalidStringWithValue, twelve`). `<UseSystemResourceKeys>false</UseSystemResourceKeys>`
   keeps the English text for about 0.2 MB.
5. **"Needs more input"** works like the Python site's interactive Run: when `ReadLine()`
   runs out of lines the run stops with `needsInput: true`, the page asks, then re-runs.

6. **Seeded Random.** The running build declares a `Random` class in the global namespace that
   hides `System.Random` and seeds itself, so replays in Run give the same numbers.
7. **Download size on any host.** Each runtime file has a `.gz` copy; the worker fetches that and
   unzips it with `DecompressionStream`, so the download is about 6.5 MB even if the host doesn't
   compress `.wasm`. If the server already decoded it (Content-Encoding: gzip), the worker notices
   from the first two bytes and uses it as it is.
8. **Runs under Node too**, which `npm run verify` uses.

## Still to check

- Real cold-start time on a home connection and on an iPad (Safari).
