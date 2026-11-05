# C# at Home

A home-learning website for Eltham College Year 9 students (age 13–14) who need support
with C# and are new to programming, and for their parents. Parents do not need to know C#:
the site gives them a clear role (read aloud, ask "what will happen?", check answers).

It is a C# version of [Python at Home](https://github.com/eltham-college-cs/home-python):
the same site, components and teaching pattern, with the Python runner swapped for C#.
The Python site's Year 7 and Year 8 material is one course here, under a single Year 9 link.
Live at https://eltham-college-cs.github.io/home-csharp/.

Read `docs/SPEC.md` before writing any code. It is the source of truth.
The `design/` folder holds the approved Python at Home page designs as reference HTML:
match their layout, colours, type and spacing (the Year 8 design is closest), but not their
Python content or mascot, and do not ship those files.

## Stack

- Astro (static output), TypeScript, content collections for lessons (MDX).
- C# runs in the browser: .NET WebAssembly and the Roslyn compiler inside a Web Worker
  (`runner/`, see `runner/README.md`). No server.
- Hosted on GitHub Pages from the `eltham-college-cs` organisation,
  deployed by GitHub Actions on push to `main`.

## Rules

- No student data leaves the browser. No analytics, no cookies, no accounts.
- Every animation respects `prefers-reduced-motion` (show the end state instead).
- Output checking must behave exactly like CodeBash (see SPEC § Checker).
- Pin every external script and package to an exact version. The C# runner is self-hosted.
- British English in all copy. Sentence case for headings and buttons.
- Accessible: real buttons and labels, visible focus, text contrast at least 4.5:1,
  touch targets at least 44px, works at phone width.
- Code is only the statements that go inside `Main`, as on CodeBash: never `class Program` or
  `static void Main` in starters, answers or copy. The runner compiles them as top-level statements.
  `Console.WriteLine` / `Console.ReadLine`, `int.Parse` for conversion. Nullable warnings are off.
- The mascot is **Hash** the hedgehog (`Mascot.astro`, `src/lib/mascot.ts`): sharp spines for
  C sharp, and a # ("hash") on its tummy.

## Commands

- `npm run dev`: local preview (builds the C# runner first if it has changed)
- `npm run build`: production build into `dist/`
- `npm run runner`: build the C# runner into `public/runner/` (needs the .NET 10 SDK)
- `npm run verify`: run every model answer in `solutions.json` through the C# runner
- `npm run check`: Astro type check
- `npm test`: unit tests for the checker, highlighter and error decoder (Vitest)
- `/dev/runner/` (dev server only): runs ~40 C# programs through the real runner and checks
  output, input, compile and runtime errors, timeouts and the error decoder.

## Decisions made while building

- One course, Year 9 (`data-year="9"`), using the calmer look first designed for Year 8.
  Lessons are numbered 1, 2, 3… through the whole course. The error decoder filters by
  build errors and runtime errors; the key words page is A to Z.
- CodeBash supports C#. Its course and topic names are in `src/lib/codebash.ts`.
- `LessonVideo` takes `clip="bigIdea"`, not `slot=` (reserved by Astro). Videos named by the
  convention in docs/VIDEOS.md are found without any frontmatter.
- Lesson components are passed to MDX by the lesson page, so `index.mdx` needs no imports.
  `CsChecker task="id"` looks the task up in the lesson's own tasks.json.
- Checker order: compile error, then timeout, then runtime exception, then output comparison
  (a program that didn't finish has incomplete output). `trimLineEnds` lives in
  `src/lib/checker-config.ts`.
- A compile error shows only the first error (with "and N more"): beginners fix one at a time.
  Messages that mention things students never write are reworded in the runner
  (CS5001 "no static 'Main' method" becomes "There's no code to run yet.").
- Runtime errors name the student's line using markers the runner inserts before each statement
  (Roslyn can't write PDBs in single-threaded WebAssembly). Compile errors come from compiling
  the student's code unchanged, so their positions are exact.
- Run is interactive: when the program calls `Console.ReadLine()` with no answer queued, the page
  asks, then re-runs the program with the answers so far. `new Random()` is seeded per Run so
  replays match. In Check, running out of input makes `ReadLine()` return null, as a real console does.
- `Console.Write("Name: ")` before `ReadLine()` is ordinary output, so it is compared like any other.
- Programs that print more than 100,000 characters are stopped and treated as a timeout.
- The runner's files are published with .gz copies, unzipped in the browser, so students download
  about 6.5 MB whatever compression the host uses.
- Model answers live in git-ignored `solutions.json` files next to each `tasks.json`, checked
  by `npm run verify`. The `codegrade/` folder is git-ignored too.
- See docs/ADDING-LESSONS.md for the lesson format.
