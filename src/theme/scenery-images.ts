import type { SceneImage } from './scenery'

let manifest: Promise<SceneImage[]> | undefined

// public/scenery/manifest.json is written by `npm run scenery` from the image files present.
export function loadSceneryImages(): Promise<SceneImage[]> {
  manifest ??= fetch(`${import.meta.env.BASE_URL}scenery/manifest.json`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => [])
  return manifest
}
