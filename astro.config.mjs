import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://example.com',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  adapter: cloudflare(),
  integrations: [react(), markdoc(), sitemap()],
  markdown: {
    remarkPlugins: [remarkGfm],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});
