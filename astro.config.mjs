// @ts-check
import { defineConfig } from 'astro/config';
import Icons from 'unplugin-icons/vite'

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
    }
});
