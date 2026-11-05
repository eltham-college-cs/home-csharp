import { describe, expect, it } from 'vitest';
import { classify, diffLine, normalise, outputsMatch, programOutput, type RunResult } from './compare';
import type { CheckerConfig } from './checker-config';

const out = (text: string, error: RunResult['error'] = null): RunResult => ({
  segments: [{ kind: 'out', text }],
  error,
});
const exact: CheckerConfig = { trimLineEnds: false };

describe('normalise', () => {
  it('converts Windows line endings', () => {
    expect(normalise('a\r\nb\r\n')).toBe('a\nb');
  });
  it('removes only one trailing newline', () => {
    expect(normalise('a\n\n')).toBe('a\n');
  });
  it('keeps trailing spaces unless trimLineEnds is on', () => {
    expect(normalise('a  \nb ', exact)).toBe('a  \nb ');
    expect(normalise('a  \nb ', { ...exact, trimLineEnds: true })).toBe('a\nb');
  });
});

describe('outputsMatch', () => {
  it('matches Console.WriteLine() output with its newline', () => {
    expect(outputsMatch('Hello, Susie!', 'Hello, Susie!\n', exact)).toBe(true);
  });
  it('is exact about spaces and capitals', () => {
    expect(outputsMatch('Total: 25', 'Total:  25\n', exact)).toBe(false);
    expect(outputsMatch('Your age is', 'your age is\n', exact)).toBe(false);
  });
});

describe('programOutput', () => {
  const segments: RunResult['segments'] = [
    { kind: 'out', text: 'Name? ' },
    { kind: 'in', text: 'Sam\n' },
    { kind: 'out', text: 'Hello Sam\n' },
  ];
  it('never includes what the user typed', () => {
    expect(programOutput(segments)).toBe('Name? Hello Sam\n');
  });
});

describe('classify (lesson 3: hello-name)', () => {
  it('passes the model answer', () => {
    expect(classify('Hello, Susie!', out('Hello, Susie!\n'), exact)).toBe('pass');
  });
  it('spots capital letters', () => {
    expect(classify('Hello, Ade!', out('hello, Ade!\n'), exact)).toBe('capitals');
  });
  it('spots an extra space', () => {
    expect(classify('Hello, Sam!', out('Hello,  Sam!\n'), exact)).toBe('spaces');
  });
  it('spots a missing space', () => {
    expect(classify('Hello, Sam!', out('Hello,Sam!\n'), exact)).toBe('spaces');
  });
  it('spots punctuation', () => {
    expect(classify('Hello, Sam!', out('Hello Sam.\n'), exact)).toBe('punctuation');
  });
  it('spots an extra line', () => {
    expect(classify('Hello, Sam!', out('Hello,\nSam!\n'), exact)).toBe('lines');
  });
  it('falls back to a line by line comparison', () => {
    expect(classify('Hello, Sam!', out('Goodbye\n'), exact)).toBe('other');
  });
});

describe('classify (lesson 3: errors)', () => {
  it('reports a compile error before anything else', () => {
    const r = out('', { type: 'CS0029', message: "Cannot implicitly convert type 'string' to 'int'", line: 1, compile: true });
    expect(classify('In 10 years you will be 22', r, exact)).toBe('compile');
  });
  it('reports a FormatException from int.Parse("cat")', () => {
    const r = out('', { type: 'FormatException', message: 'Format_InvalidStringWithValue, cat', line: 1 });
    expect(classify('3 minutes is 180 seconds', r, exact)).toBe('error');
  });
  it('reports an error even when some output was printed first', () => {
    const r = out('Hello\n', { type: 'NullReferenceException', message: '', line: 2 });
    expect(classify('Hello\nHello Sam', r, exact)).toBe('error');
  });
  it('reports a timeout before anything else', () => {
    expect(classify('5', { segments: [], error: null, timeout: true }, exact)).toBe('timeout');
  });
});

describe('diffLine', () => {
  it('highlights the first differing letter', () => {
    expect(diffLine('Hello, Ade!', 'hello, Ade!')).toEqual({ start: 0, end: 1 });
  });
  it('highlights an inserted space', () => {
    expect(diffLine('Round 3', 'Round  3')).toEqual({ start: 6, end: 7 });
  });
  it('returns null for equal lines', () => {
    expect(diffLine('a', 'a')).toBeNull();
  });
});
