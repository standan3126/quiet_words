import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import preact from '@preact/preset-vite'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// GitHub Pages serves the game from /<repository>/; the deploy workflow sets BASE_PATH.
// Everywhere else (the home Wi-Fi server, tests) it's served from the root.
const base = process.env.BASE_PATH ?? '/'

// GameHub's shared toolbox, bundled in at build time (`@shared/...`). Locally it's the hub
// folder next to this one; the deploy workflow checks the hub repo out and sets SHARED_DIR.
const shared = resolve(process.env.SHARED_DIR ?? '../hub/shared/v1')

// Writes offline-files.json: every file in the build, so GameHub's warmOffline() can save the
// whole game (all level packs and scenery) for offline play, as the old precache did.
function offlineFiles(): Plugin {
  let outDir = 'dist'
  return {
    name: 'offline-files',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const files: string[] = []
      const walk = (dir: string) => {
        for (const name of readdirSync(dir)) {
          const path = join(dir, name)
          if (statSync(path).isDirectory()) walk(path)
          else files.push(relative(outDir, path).split(sep).join('/'))
        }
      }
      walk(outDir)
      const urls = files
        .filter((f) => f !== 'sw.js' && f !== 'offline-files.json')
        .map((f) => (f === 'index.html' ? base : base + f))
        .sort()
      writeFileSync(join(outDir, 'offline-files.json'), JSON.stringify(urls))
    },
  }
}

export default defineConfig({
  base,
  // Quiet Words lives inside GameHub, whose single offline helper and install cover the whole
  // site. public/sw.js only removes the old Quiet Words helper from phones that still have it.
  plugins: [preact(), offlineFiles()],
  resolve: { alias: { '@shared': shared } },
  server: { host: true, fs: { allow: ['.', shared] } },
  // e2e/ holds Playwright specs, which run separately via `npm run e2e`.
  test: { exclude: ['e2e/**', 'node_modules/**'] },
})
