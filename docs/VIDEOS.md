# Recording videos for C# at Home

## Where each video goes

Each lesson has up to three video slots. Record one clip per slot.

| Slot | What to show | Length |
|---|---|---|
| bigIdea | The analogy, with the idea drawn or shown on screen | 1–2 min |
| predictRun | Read the code, pause for a prediction, then run it | 2–3 min |
| fixBug | Run the broken code, read the error aloud, fix it | 2–3 min |

## File names

`y<year>-l<lesson two digits>-<slot>.mp4`, for example `y7-l03-predict-run.mp4`.
Put it in `public/videos/year-7/`, with a captions file and a poster image of the same name:

```
public/videos/year-7/y7-l03-predict-run.mp4
public/videos/year-7/y7-l03-predict-run.vtt
public/videos/year-7/y7-l03-predict-run.jpg
```

That's it: a file with the right name is picked up automatically on the next build, with
its captions and poster if they are there. Until then, `npm run dev` shows a "Video coming soon"
box naming the exact file it is looking for, and the live site hides the slot.

You only need the lesson's `videos:` frontmatter if a file has a different name, or for YouTube.
Slot names become kebab case in file names: `bigIdea` → `big-idea`.

In a lesson, a slot is placed with `<LessonVideo clip="predictRun" />`. (Astro reserves the
attribute name `slot`, so the prop is called `clip`.)

## Recording settings

- 1920×1080, 30 fps. Zoom the editor so code is at least 24px on screen.
- Hide notifications, bookmarks and anything showing names or email.
- Export as MP4 (H.264). Aim for under 25 MB per clip. Keep every file under 50 MB.
- Speak slowly. Pause for 3 seconds after each "what do you think will happen?"

## Captions

Captions help every viewer, and some students rely on them. Export a `.vtt`
file from your recording or editing tool, or ask Claude Code to add a script
that creates one, then correct it by hand.

## Longer videos

Anything over about 5 minutes is better as an unlisted YouTube video. Put
`youtube: <video id>` in the slot instead of `file:`.

## Recording boards and scripts

Run `npm run dev` and open `http://localhost:4321/home-csharp/record/`. Every video has:

- **A board**: a 1920×1080 screen to record and annotate over. Press `F` for full screen,
  `Space` to reveal the next answer, `Backspace` to hide it, `[` and `]` for the previous or
  next video, `H` to hide the key help. Blank trace tables and prediction boxes are there for
  you to write on.
- **A script**: open `/record/scripts/year-7/` or `/record/scripts/year-8/` on a second screen,
  or print it. "Do" is what to annotate; the quoted text is what to say.

Boards and scripts live in `src/data/recordings/year-7.ts` and `year-8.ts`. They are not part of
the live site.
