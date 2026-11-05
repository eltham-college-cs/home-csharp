# C# at Home: build specification

> Adapted from the Python at Home specification. The site, components and teaching pattern
> are the same; the language runner and the checker's error handling are C#-specific.

## 1. Purpose and audience

- **Students:** Year 9 (age 13–14) who need support, new to C# and to programming. Short, confidence-building
  sessions of about 15 minutes, with instant feedback that matches CodeBash.
- **Parents:** may know no C#. Each page tells them exactly what to do.
- **Teacher (Mr Gordon):** adds one lesson by adding one folder. Records short
  screen videos and drops them in.

## 2. Site map and URLs

```
/                                   Home: start the course, "This week" links
/parents/                           Start here, for parents (read once)
/year-9/                            Course overview: units and lessons in order
/year-9/csharp-basics/              Unit page (optional, lists its lessons)
/year-9/csharp-basics/lesson-3-input-and-conversion/
/error-decoder/                     Shared; filter: build errors / runtime errors
/key-words/                         Shared glossary, A to Z, with the lessons that use each word
```

Base path: the site is served from `https://eltham-college-cs.github.io/home-csharp/`,
so set `site` and `base` in `astro.config.mjs` and use `import.meta.env.BASE_URL`
for every internal link and asset.

## 3. Repository layout

```
home-csharp/
├── CLAUDE.md
├── docs/SPEC.md
├── design/                         reference designs only, not built
├── astro.config.mjs
├── src/
│   ├── content.config.ts           collection schemas (zod)
│   ├── content/
│   │   ├── years/year-9.md         title, units in order, "this week" lesson
│   │   └── lessons/year-9/01-csharp-basics/03-input-and-conversion/
│   │       ├── index.mdx           page content
│   │       └── tasks.json          checker tests
│   ├── components/
│   │   ├── Mascot.astro            Hash the hedgehog, moods: idle | happy | tryagain
│   │   ├── CsChecker.astro         editor + Run + Check + results
│   │   ├── OutputDiff.astro        expected vs got, spaces as ·
│   │   ├── Celebrate.ts            particle burst
│   │   ├── InputFlow.astro         keyboard → ReadLine() → "15" → int.Parse() → 15
│   │   ├── TraceTable.astro        fills row by row
│   │   ├── SpotTheDifference.astro pairs of outputs with reveal
│   │   ├── Parsons.astro           drag lines into order (keyboard accessible)
│   │   ├── QuizMe.astro            questions with reveal
│   │   ├── SelfRating.astro        not yet / sort of / yes
│   │   ├── LessonVideo.astro       see § 9
│   │   └── ParentTip.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro        header, nav, footer, theme
│   │   └── LessonLayout.astro      eyebrow, title, progress, sections
│   ├── styles/themes.css           theme tokens (§ 5)
│   └── lib/cs.ts                   main-thread side of the C# runner
├── runner/CsRunner/                .NET WebAssembly + Roslyn runner (see runner/README.md)
├── public/runner/                  built runner, copied in by `npm run runner` (git-ignored)
│   └── pages/ …
├── public/videos/year-9/ …         self-hosted clips, captions, posters
└── .github/workflows/deploy.yml
```

## 4. Content model

Lesson frontmatter (validate with zod in `content.config.ts`):

```yaml
---
year: 9
unit: C# basics
unitSlug: csharp-basics
lesson: 3
title: Input and conversion
summary: Today we teach the computer to listen, and to turn words into numbers.
minutes: 15
keywords: [Console.ReadLine, int.Parse, string, FormatException, concatenation]
codebashTopic: Input, Output and Variables
videos:
  bigIdea:    { file: y7-l03-big-idea.mp4,    captions: y7-l03-big-idea.vtt }
  predictRun: { file: y7-l03-predict-run.mp4, captions: y7-l03-predict-run.vtt }
  fixBug:     { youtube: "" }               # empty = placeholder shown
draft: false
---
```

Order lessons by the numeric folder prefixes. `draft: true` pages build locally but
are excluded from production. The `keywords` field drives the glossary and the
error decoder filter.

`tasks.json`, the same shape as CodeBash test cases:

```json
{
  "tasks": [
    {
      "id": "hello-name",
      "title": "Hello, what's your name?",
      "starter": "string name = Console.ReadLine();\nConsole.WriteLine(\"Hello, \" + name + \"!\");",
      "tests": [
        { "input": "Susie", "output": "Hello, Susie!" }
      ],
      "hints": { "spaces": "…", "capitals": "…", "punctuation": "…" }
    }
  ]
}
```

`input` may contain several lines separated by `\n`, one per `Console.ReadLine()` call.

## 5. Theme

One course, for Year 9 students who need support (age 13–14). It uses Eltham navy and gold
with the calmer look first designed for Year 8 in Python at Home. The body has
`data-year="9"`; tokens are in `themes.css`.

| Token | Value |
|---|---|
| `--navy` / `--navy-2` | #0A1B2E / #163351 |
| `--gold` / `--gold-light` | #DDA93E / #E3C783 |
| `--blue` | #2A5A8C |
| `--page` / `--panel` | #F7F8FA / #FFFFFF |
| `--border` | #D7E3EF |
| `--text` / `--muted` | #1A1D21 / #555D68 |
| Display / body font | Lexend 600 / Lexend |
| Code font | JetBrains Mono |
| Body size, H1 / H2 | 18px, 48 / 32px |
| Radius (cards) | 14–16px |
| Mascot | Lesson header and hint boxes (big in the home page hero) |
| Motion | Light: mascot moods, celebration burst, trace rows |

Feedback colours: pass `#E6F4EC` / `#1F7A4D`, nearly `#FDF1D9` /
`#D9A21E`, error highlight `#FCE9E7` / `#B3261E`. Never use red for a failed test;
use amber "nearly".

Self-host the Google Fonts (e.g. via `@fontsource`) so no third-party requests are made.

## 6. Lesson page structure

Same order on every page. Sections can be omitted per lesson.

1. Header: eyebrow (year, unit, lesson), H1, summary, progress, minutes.
   Hash (idle) with a speech bubble (`mascotSays` in the frontmatter).
2. Parent tip strip.
3. **The big idea**: analogy in plain English + `InputFlow` or a diagram + video slot `bigIdea`.
4. **Predict, then run**: prediction box, `CsChecker`, video slot `predictRun`.
5. **How did it go?**: test results and Hash's feedback.
6. **Spot the difference / Match it exactly**: output-matching practice.
7. **Fix the bug**: broken code, checker, link to error decoder, video slot `fixBug`.
8. **Quiz me**: three questions, answers on reveal (parent asks).
9. **Self-rating**: stored in `localStorage` only, per lesson.

## 7. Checker (must match CodeBash)

The runner (`runner/CsRunner`, built into `public/runner/`) runs in a Web Worker started by
`src/lib/cs.ts`. Start loading it when the student first reaches a checker, and keep the
worker alive between runs.

For each test:
1. Compile the code with Roslyn, unless the worker has already compiled this exact code.
   If it doesn't compile, stop: report the first compile error (code, line, column, message)
   and how many more there are.
2. Load a fresh copy of the compiled program (so static state resets), feed `test.input`
   lines to `Console.ReadLine()` and capture everything written to `Console.Out`.
   When the input runs out, `ReadLine()` returns null in Check, and stops the program with
   "needs input" in Run (the page asks, then runs again with the answers so far).
3. Timeout 3 s: terminate and respawn the worker, show
   "Your program didn't finish. Is something repeating forever?"
   More than 100,000 characters of output counts as a timeout too.
4. Normalise both strings: convert `\r\n` to `\n`, remove one trailing newline.
5. Compare exactly. Text typed in (the input) is never part of the compared output;
   anything the program prints, including `Console.Write("Name: ")`, is.

`trimLineEnds` lives in `src/lib/checker-config.ts` (default off: exact comparison).

Classify a failure in this order and show the matching hint:

| Check | Hint category |
|---|---|
| Didn't compile | `compile`, linked to the error decoder entry for its CS code |
| Timed out | `timeout` |
| Runtime exception | `error`, with the student's line, linked to the error decoder entry |
| Equal after lowercasing | Capital letters |
| Equal after collapsing/removing spaces | Spaces |
| Equal after removing punctuation | Punctuation |
| Different number of lines | Extra or missing line |
| Otherwise | "Compare your output with the expected output line by line." |

`OutputDiff` shows expected and got with spaces drawn as `·` (muted grey) and
differing characters highlighted. Unit-test the comparison, classification and error
decoder matching with Vitest. `/dev/runner/` (development only) checks the real runner.

## 8. Hash the mascot

Hash is a hedgehog: spines are sharp (C sharp), and Hash wears a `#` (a "hash") on its tummy.
Inline SVG in `Mascot.astro` with props `mood`, `size` and `decorative`; the name and
screen-reader labels are in `src/lib/mascot.ts`.

| Mood | When | Face | Motion |
|---|---|---|---|
| `idle` | Page load, waiting | Open eyes, small smile, paws resting | Gentle bob, blink every ~5 s |
| `happy` | All tests pass | Closed happy eyes, open grin, both paws up | Short bounce, paw wave, sparkles |
| `tryagain` | Some tests fail | Determined brows, half smile, fist raised | Short fist-pump |

Animate with CSS classes (not SMIL) so reduced motion can switch everything off.
Expose `setMood()` so `CsChecker` can change mood after a run. Particle burst
(`Celebrate.ts`) only when every test passes. Add `aria-live="polite"` to the
results message so screen readers announce it.

## 9. Videos

Mr Gordon records short screen videos and places them by slot name.

- Slots: `bigIdea`, `predictRun`, `fixBug` (more can be added).
  `<LessonVideo slot="predictRun" />` reads the lesson's `videos` frontmatter.
- **Self-hosted** (preferred for short clips): MP4 in
  `public/videos/year-N/`, with a `.vtt` captions file and a poster image of the
  same name (`y7-l03-predict-run.mp4/.vtt/.jpg`). Use `<video controls preload="none">`.
- **YouTube** (for longer clips): an unlisted video ID, embedded from
  `youtube-nocookie.com`, loaded only after the user presses play (facade).
- **Empty slot:** show a neat "Video coming soon" placeholder in development,
  and hide the slot entirely in production.
- Add a build-time check that warns if a referenced file is missing or over 50 MB.

## 10. Deployment

GitHub Actions: install Node and the .NET SDK (version from `global.json`), `npm test`,
`npm run runner`, `npm run verify`, `npm run build`, deploy with the official Pages action.
Public repository. No secrets needed.

## 11. Build phases

1. Scaffold Astro, theme, layouts, header and nav.
2. C# runner worker, `CsChecker`, `OutputDiff`, comparison logic with tests.
3. Hash and feedback states, `Celebrate`.
4. Lesson pages matching the layout in `design/year-8-lesson.dc.html` (a Python at Home
   design: follow its layout and colours, not its Python content or mascot).
5. Error decoder, key words, parents page, home page.
6. `LessonVideo` with placeholders.

## 12. Done when

- Lesson pages match the design at desktop and phone width.
- The checker passes, fails and classifies the Lesson 3 tests correctly.
- Infinite loops time out without freezing the page.
- Reduced motion shows no animation; keyboard alone can complete the page.
- Lighthouse accessibility score 95 or above.
