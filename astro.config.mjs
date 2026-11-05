// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeCsharp from './src/lib/rehype-csharp.ts';
import rehypeExternalLinks from './src/lib/rehype-external-links.ts';
import videoCheck from './src/lib/video-check.ts';

export default defineConfig({
  site: 'https://eltham-college-cs.github.io',
  base: '/home-csharp',
  trailingSlash: 'always',
  integrations: [mdx(), videoCheck()],
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [rehypeCsharp, rehypeExternalLinks],
  },
  build: { format: 'directory' },
});
