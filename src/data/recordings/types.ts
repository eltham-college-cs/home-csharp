// Recording plans: one screen ("board") and one script per lesson video.
// Boards are shown at /record/ when running `npm run dev` (not built for the live site).

export type Block =
  | { kind: 'code'; code: string; label?: string; reveal?: boolean }
  | { kind: 'output'; text: string; label?: string; reveal?: boolean }
  | { kind: 'error'; text: string; reveal?: boolean }
  | { kind: 'blank'; label: string; lines?: number }
  | { kind: 'boxes'; boxes: { name: string; value: string }[]; reveal?: boolean }
  | { kind: 'list'; name: string; items: string[]; reveal?: boolean }
  | { kind: 'flow'; typed: string; reveal?: boolean }
  | { kind: 'table'; columns: string[]; rows: string[][]; label?: string; reveal?: boolean }
  | { kind: 'points'; items: string[]; reveal?: boolean }
  | { kind: 'big'; text: string; reveal?: boolean };

export type Step = {
  /** What to do on screen: annotate, press Space, pause. */
  do?: string;
  /** What to say. */
  say: string;
};

export type VideoPlan = {
  year: 7 | 8;
  lesson: number;
  clip: 'bigIdea' | 'predictRun' | 'fixBug';
  title: string;
  minutes: string;
  board: { heading: string; sub?: string; left: Block[]; right?: Block[] };
  script: Step[];
};
