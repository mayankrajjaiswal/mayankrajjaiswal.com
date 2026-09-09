import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

/**
 * Maps each blog slug to its most recent date (updatedDate, falling back to
 * pubDate), read directly from frontmatter. astro.config.mjs runs outside the
 * Astro content-collection context, so this is plain fs rather than
 * `getCollection()` -- cheap and correct since frontmatter is already
 * plain-text YAML.
 */
function readBlogLastmod() {
  const dir = new URL('./src/content/blog/', import.meta.url);
  const lastmodBySlug = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
    const raw = readFileSync(new URL(file, dir), 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const pubDate = fm.match(/^pubDate:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1];
    const updatedDate = fm.match(/^updatedDate:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1];
    const slug = file.replace(/\.mdx?$/, '');
    if (updatedDate || pubDate) lastmodBySlug[slug] = updatedDate ?? pubDate;
  }
  return lastmodBySlug;
}

const blogLastmod = readBlogLastmod();

// https://astro.build/config
export default defineConfig({
  site: 'https://mayankrajjaiswal.com',
  // GitHub Pages serves directory-style URLs and 301-redirects /blog/foo to
  // /blog/foo/. Declaring 'always' makes Astro's generated URLs (sitemap, RSS,
  // canonicals) match what the host actually serves, so internal links resolve
  // in one hop instead of via a redirect. Internal hrefs carry the slash too.
  trailingSlash: 'always',
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => page !== 'https://mayankrajjaiswal.com/404/' && page !== 'https://mayankrajjaiswal.com/404',
      // Attaches <lastmod> to blog post URLs from their own frontmatter, which
      // helps crawlers prioritize recrawling. Other routes are left without
      // one rather than guessing a build-time date that doesn't reflect real
      // content changes.
      serialize(item) {
        const match = item.url.match(/\/blog\/([a-z0-9-]+)\/$/);
        const slug = match?.[1];
        if (slug && blogLastmod[slug]) {
          return { ...item, lastmod: blogLastmod[slug] };
        }
        return item;
      }
    }),
    mdx()
  ],
});
