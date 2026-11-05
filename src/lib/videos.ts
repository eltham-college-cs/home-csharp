// Works out which video (if any) belongs in a lesson's video slot.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type VideoSlot = { file?: string; captions?: string; poster?: string; youtube?: string } | null | undefined;

export const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/** y7-l03-predict-run: the name every file for this slot shares. */
export function baseName(year: number, lesson: number, clip: string) {
  return `y${year}-l${String(lesson).padStart(2, '0')}-${kebab(clip)}`;
}

export type ResolvedVideo =
  | { kind: 'file'; src: string; captions?: string; poster?: string }
  | { kind: 'youtube'; id: string }
  | { kind: 'empty'; expected: string };

const publicFile = (year: number, name: string) => join(process.cwd(), 'public', 'videos', `year-${year}`, name);

/**
 * Frontmatter wins. With nothing in the frontmatter, a file that follows the naming
 * convention (see docs/VIDEOS.md) is picked up automatically.
 */
export function resolveVideo(year: number, lesson: number, clip: string, slot: VideoSlot, base: string): ResolvedVideo {
  if (slot?.youtube) return { kind: 'youtube', id: slot.youtube };
  const name = baseName(year, lesson, clip);
  const file = slot?.file || `${name}.mp4`;
  if (!existsSync(publicFile(year, file))) return { kind: 'empty', expected: `public/videos/year-${year}/${file}` };
  const stem = file.replace(/\.mp4$/i, '');
  const optional = (given: string | undefined, fallback: string) => {
    const n = given || fallback;
    return existsSync(publicFile(year, n)) ? `${base}/videos/year-${year}/${n}` : undefined;
  };
  return {
    kind: 'file',
    src: `${base}/videos/year-${year}/${file}`,
    captions: optional(slot?.captions, `${stem}.vtt`),
    poster: optional(slot?.poster, `${stem}.jpg`),
  };
}
