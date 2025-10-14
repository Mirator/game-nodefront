import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    modulePreload: {
      // Avoid injecting the fetch-based modulepreload polyfill. Firefox blocks
      // those fetches when the bundle is opened directly from the filesystem,
      // which produced noisy `TypeError: NetworkError` console errors.
      polyfill: false,
    },
    outDir: 'docs',
    assetsDir: '',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
