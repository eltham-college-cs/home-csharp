// Build-time check: warns about missing video files and files over 50 MB.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { AstroIntegration } from 'astro';

const LIMIT = 50 * 1024 * 1024;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d): string[] =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)],
  );
}

export default function videoCheck(): AstroIntegration {
  return {
    name: 'video-check',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const root = process.cwd();
        for (const f of walk(join(root, 'public', 'videos'))) {
          const size = statSync(f).size;
          if (size > LIMIT) logger.warn(`${f.replace(root + '/', '')} is ${(size / 1048576).toFixed(0)} MB. Keep videos under 50 MB.`);
        }
        const missing: string[] = [];
        for (const f of walk(join(root, 'src', 'content', 'lessons')).filter((p) => p.endsWith('.mdx'))) {
          const text = readFileSync(f, 'utf8');
          const year = text.match(/^year:\s*(\d+)/m)?.[1];
          const front = text.split(/^---$/m)[1] ?? '';
          for (const m of front.matchAll(/(?:file|captions|poster):\s*["']?([\w.-]+\.(?:mp4|vtt|jpg|png))/g)) {
            if (!existsSync(join(root, 'public', 'videos', `year-${year}`, m[1]))) missing.push(`year-${year}/${m[1]}`);
          }
        }
        if (missing.length) logger.warn(`Video files listed in lessons but not found in public/videos: ${missing.join(', ')}`);
      },
    },
  };
}
