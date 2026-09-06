import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://mayankrajjaiswal.com',
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => page !== 'https://mayankrajjaiswal.com/404/' && page !== 'https://mayankrajjaiswal.com/404'
    }),
    mdx()
  ],
});
