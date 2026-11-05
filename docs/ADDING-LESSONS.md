# Adding a lesson

One lesson is one folder. Copy an existing lesson folder and change it.

```
src/content/lessons/year-9/05-lists/16-searching-a-list/
├── index.mdx      the page
└── tasks.json     the code tasks and their tests
```

- The number at the start of each folder sets the order. Units are folders too
  (`05-lists`), and must also be listed in `src/content/years/year-9.md`.
- `lesson:` in the frontmatter is the lesson number shown on the page and used in
  video file names. Number lessons 1, 2, 3… through the whole course.
- `mascotSays:` is what Hash says in the lesson header (optional).
- Code is only the statements that would go inside `Main`, like CodeBash: never write
  `class Program` or `static void Main` in a starter or a model answer.
- `draft: true` shows the lesson when you run `npm run dev`, but leaves it out of the live site.
- To feature a lesson on the home page, add its folder path to `thisWeek:` in
  `src/content/years/year-9.md`.

## Components you can use in index.mdx

No imports needed.

| Component | Example |
|---|---|
| ParentTip | `<ParentTip>Read the big idea aloud.</ParentTip>` |
| Note | `<Note title="Remember">...</Note>` |
| CsChecker | `<CsChecker task="hello-name" predict="What will it print?" />` or `brief="Your task..."` |
| TraceTable | `<TraceTable code={...} columns={[...]} rows={[{ line: 1, cells: [...] }]} />` |
| SpotTheDifference | `<SpotTheDifference pairs={[{ kind, a, b, answer }]} />` |
| Parsons | `<Parsons prompt="..." lines={["line 1", "    line 2"]} />` |
| InputFlow | `<InputFlow typed="15" />` |
| MemoryBoxes | `<MemoryBoxes boxes={[{ name: "age", value: "12" }]} />` or `list={{ name, items }}` |
| OutputDiff | `<OutputDiff expected="Hello, Sam!" got="hello, Sam!" />` |
| QuizMe | `<QuizMe questions={[{ q: "...", a: "..." }]} />` (use backticks for code) |
| SelfRating | `<SelfRating question="Could you explain...?" />` |
| LessonVideo | `<LessonVideo clip="bigIdea" />` (see VIDEOS.md) |

Each `## Heading` becomes a numbered section and a dot in the progress bar.

## tasks.json

```json
{
  "tasks": [
    {
      "id": "hello-name",
      "title": "Hello, what's your name?",
      "starter": "string name = Console.ReadLine();\n",
      "tests": [{ "input": "Susie", "output": "Hello, Susie!" }],
      "hints": { "capitals": "…", "spaces": "…", "punctuation": "…", "lines": "…", "compile": "…", "error": "…", "timeout": "…", "other": "…" }
    }
  ]
}
```

- Each `Console.ReadLine()` reads one line of `input`. Several inputs go in one string
  separated by `\n`. Anything the program prints with `Console.Write("Name: ")` is part of
  the output and must be in `output` too, so most checked tasks print no question first.
- `compile` is the hint for code that doesn't build; `error` is for a runtime error.
- Put the model answers in `solutions.json` next to `tasks.json`, as `{ "task-id": "code" }`.
  `npm run verify` runs every answer against its tests with the site's own C# runner. These files are
  git-ignored so answers never appear in the public repository; keep your own backup.
- Any hint you leave out falls back to a general one. For errors, the hint falls back to
  the matching error decoder entry (`src/data/errors.ts`).

## Before you push

```
npm test
npm run verify
npm run build
```
