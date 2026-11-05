// A small C# highlighter shared by the code editor and static code blocks.
// It only needs to cope with the C# taught in the course, and must never lose a character.

export type Token = { type: 'kw' | 'bi' | 'str' | 'num' | 'com' | 'name' | 'text'; text: string };

const KEYWORDS = new Set([
  'bool', 'break', 'case', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else',
  'false', 'for', 'foreach', 'if', 'in', 'int', 'new', 'null', 'private', 'public', 'return',
  'static', 'string', 'switch', 'true', 'using', 'var', 'void', 'while',
]);

/** Method names worth picking out, highlighted only when followed by "(". */
const BUILTINS = new Set([
  'WriteLine', 'Write', 'ReadLine', 'Parse', 'TryParse', 'ToInt32', 'ToDouble', 'ToString',
  'Add', 'Insert', 'Remove', 'RemoveAt', 'Contains', 'IndexOf', 'Clear', 'Sort', 'Reverse',
  'Next', 'Round', 'Sqrt', 'Pow', 'Abs', 'Max', 'Min', 'ToUpper', 'ToLower', 'Substring',
]);

const PATTERN = new RegExp(
  [
    String.raw`(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))`, // 1 comment
    String.raw`(\$?@?"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)`, // 2 string or char ($"..." and @"..." too)
    String.raw`(\b\d+(?:\.\d+)?[dDfFmM]?\b)`, // 3 number
    String.raw`([A-Za-z_][A-Za-z0-9_]*)`, // 4 word
    String.raw`(\s+|[^\sA-Za-z0-9_/"'$]+|[/$])`, // everything else
  ].join('|'),
  'g',
);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  for (const m of code.matchAll(PATTERN)) {
    const [text, com, str, num, word] = m;
    if (com) tokens.push({ type: 'com', text });
    else if (str) tokens.push({ type: 'str', text });
    else if (num) tokens.push({ type: 'num', text });
    else if (word) {
      const after = code.slice((m.index ?? 0) + text.length).match(/^\s*\(/);
      if (KEYWORDS.has(word)) tokens.push({ type: 'kw', text });
      else if (BUILTINS.has(word) && after) tokens.push({ type: 'bi', text });
      else tokens.push({ type: 'name', text });
    } else tokens.push({ type: 'text', text });
  }
  return tokens;
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function highlightHtml(code: string): string {
  return tokenize(code)
    .map((t) => (t.type === 'text' ? escape(t.text) : `<span class="tok-${t.type}">${escape(t.text)}</span>`))
    .join('');
}
