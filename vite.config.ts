import preact from '@preact/preset-vite'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the game from /<repository>/; the deploy workflow sets BASE_PATH.
// Everywhere else (the home Wi-Fi server, tests) it's served from the root.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Quiet Words',
        short_name: 'Quiet Words',
        description: 'A calm word game for bedtime and breaks.',
        theme_color: '#1a0c00',
        background_color: '#1a0c00',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Levels, scenery and audio are all cached so the game works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,json,webp,jpg,jpeg,png,mp3,ogg}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  server: { host: true },
  // e2e/ holds Playwright specs, which run separately via `npm run e2e`.
  test: { exclude: ['e2e/**', 'node_modules/**'] },
})
