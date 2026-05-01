import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/dist',
  integrations: [react()],
  build: {
    format: 'file'
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    },
    plugins: [tailwindcss()]
  }
});