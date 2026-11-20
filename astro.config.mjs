import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_ORIGIN || 'https://moenyofficial.github.io',
  base: process.env.BASE_PATH || '/DevEquip',
  trailingSlash: 'ignore',
  integrations: [vue(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
