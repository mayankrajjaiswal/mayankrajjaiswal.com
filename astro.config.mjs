import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

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
      filter: (page) => page !== 'https://mayankrajjaiswal.com/404/' && page !== 'https://mayankrajjaiswal.com/404'
    }),
    mdx()
  ],
});
