import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

import { VitePWA } from 'vite-plugin-pwa';

// Manifest für die PWA definieren
const manifest = {
  name: 'PayWatch',
  short_name: 'PayWatch',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#027be3',
  icons: [
    {
      src: 'icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: 'icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};

export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      '/test': 'http://localhost:3000/',
    },
  },
  extras: ['fontawesome-v6'],
  plugins: [
    vue({
      template: { transformAssetUrls }, 
    }),

    VitePWA({
      registerType: 'autoUpdate',
      manifest
    }),

    quasar({
      sassVariables: 'src/quasar-variables.sass',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
