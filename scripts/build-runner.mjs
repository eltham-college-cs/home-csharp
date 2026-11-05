// Builds the in-browser C# runner (runner/CsRunner) and copies it into public/runner/,
// where the site loads it from. Skips the .NET build when nothing in runner/CsRunner has
// changed since the last copy. Pass --force to always rebuild.
//
// Needs the .NET 10 SDK (https://dotnet.microsoft.com/download).
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const project = join(root, 'runner/CsRunner');
const publish = join(root, 'runner/publish');
const target = join(root, 'public/runner');
const stamp = join(target, '.built');

function newest(dir) {
  let t = 0;
  for (const name of readdirSync(dir)) {
    if (name === 'bin' || name === 'obj') continue;
    const p = join(dir, name);
    const s = statSync(p);
    t = Math.max(t, s.isDirectory() ? newest(p) : s.mtimeMs);
  }
  return t;
}

const force = process.argv.includes('--force');
if (!force && existsSync(stamp) && statSync(stamp).mtimeMs > newest(project)) {
  console.log('C# runner is up to date.');
  process.exit(0);
}

console.log('Building the C# runner (dotnet publish)…');
rmSync(publish, { recursive: true, force: true });
execFileSync('dotnet', ['publish', project, '-c', 'Release', '-o', publish, '-nologo', '-v', 'quiet'], {
  stdio: 'inherit',
  env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1' },
});

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
const www = join(publish, 'wwwroot');
// Keep the plain files and the .gz copies (unzipped in the browser); drop .br, which we don't use.
cpSync(join(www, '_framework'), join(target, '_framework'), {
  recursive: true,
  filter: (src) => !src.endsWith('.br'),
});
cpSync(join(www, 'csharp.worker.js'), join(target, 'csharp.worker.js'));

// Download sizes, so the page can show a loading progress bar. The worker fetches every
// runtime file except the .js modules, using the .gz copy.
const framework = join(target, '_framework');
const sizes = {};
for (const name of readdirSync(framework)) {
  if (name.endsWith('.gz') || name.endsWith('.js')) continue;
  const gz = join(framework, `${name}.gz`);
  sizes[name] = statSync(existsSync(gz) ? gz : join(framework, name)).size;
}
const totalBytes = Object.values(sizes).reduce((a, b) => a + b, 0);
writeFileSync(join(target, 'sizes.json'), JSON.stringify({ totalBytes, files: sizes }));
console.log(`Download size: ${(totalBytes / 2 ** 20).toFixed(1)} MB in ${Object.keys(sizes).length} files.`);

writeFileSync(stamp, new Date().toISOString());
console.log('C# runner copied to public/runner/.');
