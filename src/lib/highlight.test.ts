import { describe, expect, it } from 'vitest';
import { highlightHtml, tokenize } from './highlight';

const join = (code: string) => tokenize(code).map((t) => t.text).join('');
const types = (code: string) => tokenize(code).filter((t) => t.type !== 'text').map((t) => t.type);

describe('tokenize', () => {
  it('keeps every character', () => {
    const code = 'string name = Console.ReadLine();\nConsole.WriteLine($"Hello, {name}!"); // hi\n/* a\nb */ x / 2;\n';
    expect(join(code)).toBe(code);
  });
  it('keeps every character of unfinished code', () => {
    for (const code of ['Console.WriteLine("Hi', '/* not closed', "char c = 'a", 'x = $', 'a / b']) {
      expect(join(code)).toBe(code);
    }
  });
  it('labels keywords, built-ins, numbers and strings', () => {
    expect(types('while (x < 3) Console.WriteLine("a");')).toEqual(['kw', 'name', 'num', 'name', 'bi', 'str']);
  });
  it('treats an interpolated string as one string', () => {
    expect(types('$"Total: {a + b}"')).toEqual(['str']);
  });
  it('labels comments', () => {
    expect(types('// note')).toEqual(['com']);
  });
  it('escapes HTML', () => {
    expect(highlightHtml('List<int> xs;')).toContain('&lt;');
  });
});
