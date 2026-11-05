// Draws output with spaces shown as · and the differing characters highlighted.
import { diffLine, normalise } from './compare';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Escape text and draw each space as a muted dot. */
export function dots(text: string): string {
  return escape(text).replace(/ /g, '<span class="sp">·</span>');
}

const linesOf = (s: string) => (s === '' ? [] : s.split('\n'));

export function renderLines(text: string): string {
  const lines = linesOf(normalise(text));
  if (!lines.length) return '<span class="nothing">(nothing printed)</span>';
  return lines.map((l) => `<span class="line">${dots(l) || '&nbsp;'}</span>`).join('');
}

/** HTML for the "You got" box, comparing line by line with the expected output. */
export function renderGot(expectedRaw: string, gotRaw: string): string {
  const e = linesOf(normalise(expectedRaw));
  const g = linesOf(normalise(gotRaw));
  if (!g.length) return '<span class="nothing">(nothing printed)</span>';
  const out: string[] = [];
  const n = Math.max(e.length, g.length);
  for (let i = 0; i < n; i++) {
    const el = e[i];
    const gl = g[i];
    if (gl === undefined) {
      out.push('<span class="line"><mark class="diff missing">(missing line)</mark></span>');
      continue;
    }
    if (el === undefined) {
      out.push(`<span class="line"><mark class="diff">${dots(gl) || '&nbsp;'}</mark></span>`);
      continue;
    }
    const d = diffLine(el, gl);
    if (!d) {
      out.push(`<span class="line">${dots(gl) || '&nbsp;'}</span>`);
      continue;
    }
    const before = dots(gl.slice(0, d.start));
    const mid = gl.slice(d.start, d.end);
    const after = dots(gl.slice(d.end));
    const marked = mid ? `<mark class="diff">${dots(mid)}</mark>` : '<mark class="diff gap" title="something is missing here">‸</mark>';
    out.push(`<span class="line">${before}${marked}${after}</span>`);
  }
  return out.join('');
}
