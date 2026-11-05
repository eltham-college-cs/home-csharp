/**
 * How strictly program output is compared with the expected output.
 * This is the only place to change if CodeBash turns out to behave differently.
 */
export const checkerConfig = {
  /** Ignore spaces at the end of each line before comparing. */
  trimLineEnds: false,
};

export type CheckerConfig = typeof checkerConfig;

/** Milliseconds a single test may run before we assume it repeats forever. */
export const TIMEOUT_MS = 3000;
