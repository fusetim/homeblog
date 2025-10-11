// @ts-check
import { defineConfig } from 'astro/config';
import Icons from 'unplugin-icons/vite'

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://fusetim.me',
  base: `/`,

  vite: {
      plugins: [
          Icons({
              compiler: 'astro',
          }),
      ],
  },

  integrations: [sitemap()]
});