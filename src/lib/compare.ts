import { checkerConfig, type CheckerConfig } from './checker-config';

/** One piece of what the program wrote. `in` is what the user typed (echo only). */
export type Segment = { kind: 'out' | 'in'; text: string };

/**
 * Why a program stopped. A compile error (`compile: true`) means it never ran: `type` is the
 * compiler's code, such as CS1002, and `more` counts the other compile errors not shown.
 * Otherwise `type` is the exception, such as FormatException.
 */
export type RunError = {
  type: string;
  message: string;
  line: number | null;
  column?: number;
  compile?: boolean;
  more?: number;
};

export type RunResult = {
  segments: Segment[];
  error: RunError | null;
  needInput?: boolean;
  timeout?: boolean;
};

export type HintCategory =
  | 'pass'
  | 'timeout'
  | 'compile'
  | 'error'
  | 'capitals'
  | 'spaces'
  | 'punctuation'
  | 'lines'
  | 'other';

/** Convert \r\n to \n and remove one trailing newline (SPEC § 7 step 4). */
export function normalise(text: string, config: CheckerConfig = checkerConfig): string {
  let s = text.replace(/\r\n/g, '\n');
  if (s.endsWith('\n')) s = s.slice(0, -1);
  if (config.trimLineEnds) s = s.split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n');
  return s;
}

/** The text a checker compares: what the program printed, never what was typed in. */
export function programOutput(segments: Segment[]): string {
  return segments
    .filter((s) => s.kind === 'out')
    .map((s) => s.text)
    .join('');
}

export function outputsMatch(expected: string, got: string, config: CheckerConfig = checkerConfig): boolean {
  return normalise(expected, config) === normalise(got, config);
}

const stripPunctuation = (s: string) => s.replace(/[^\p{L}\p{N}\s]/gu, '');
const lineCount = (s: string) => (s === '' ? 0 : s.split('\n').length);

/**
 * Work out why a test failed, in the order SPEC § 7 sets out.
 * A compile error, an exception or a timeout always wins: the output of a program
 * that didn't run to the end is incomplete, so comparing it would point the child
 * at the wrong thing.
 */
export function classify(
  expectedRaw: string,
  result: RunResult,
  config: CheckerConfig = checkerConfig,
): HintCategory {
  if (result.timeout) return 'timeout';
  if (result.error?.compile) return 'compile';
  if (result.error) return 'error';
  const expected = normalise(expectedRaw, config);
  const got = normalise(programOutput(result.segments), config);
  if (expected === got) return 'pass';

  if (expected.toLowerCase() === got.toLowerCase()) return 'capitals';
  const collapse = (s: string) => s.replace(/[ \t]+/g, ' ');
  const remove = (s: string) => s.replace(/[ \t]+/g, '');
  if (collapse(expected) === collapse(got) || remove(expected) === remove(got)) return 'spaces';
  if (stripPunctuation(expected) === stripPunctuation(got)) return 'punctuation';
  if (lineCount(expected) !== lineCount(got)) return 'lines';
  return 'other';
}

export const defaultHints: Record<Exclude<HintCategory, 'pass'>, string> = {
  timeout: "Your program didn't finish. Is something repeating forever?",
  compile:
    "Your code didn't build, so it couldn't run. Go to the line number in the message: the mistake is on that line or the one just before it.",
  error: 'Your program started, then stopped with an error. The message names the problem and the line.',
  capitals: 'Check your capital letters. C# treats A and a as different.',
  spaces: 'Check your spaces. The dots show where each space is.',
  punctuation: 'Check your punctuation: commas, full stops, colons and exclamation marks.',
  lines: 'You have an extra line or a missing line. Count the lines in each box.',
  other: 'Compare your output with the expected output line by line.',
};

/** Character-level difference for one line: the part of `got` that differs. */
export function diffLine(expected: string, got: string): { start: number; end: number } | null {
  if (expected === got) return null;
  let start = 0;
  while (start < expected.length && start < got.length && expected[start] === got[start]) start++;
  let endE = expected.length;
  let endG = got.length;
  while (endE > start && endG > start && expected[endE - 1] === got[endG - 1]) {
    endE--;
    endG--;
  }
  return { start, end: endG };
}
