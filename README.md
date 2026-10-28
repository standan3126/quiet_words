# Quiet Words

A calm word game for bedtime and breaks: the swipe-a-word crossword from *Wordscapes* and
*Words of Paradise*, without the ads, timers, coin pressure or obscure words. It has nature
sounds and music, painted scenery with lazy moving creatures, your own photo albums, and a
night mode with no blue light.

It's a web app and part of [GameHub](https://standan3126.github.io/), the one installable app
for these games: it runs in any phone or computer browser, and works offline inside GameHub
once it has been played. Everything a player saves (progress, settings, photo albums)
stays on their own device.

## Playing

- **Online:** `https://standan3126.github.io/quiet_words/`, or from GameHub
  (`https://standan3126.github.io/`), which is what goes on the home screen.
- **At home, on this computer:** `npm run dev`, then open the address it prints. Phones on the
  same Wi-Fi can use the `Network:` address.
- **Moving to a new phone:** the gear → *Move your progress* → a transfer code or a backup file.
  Progress and settings travel; photo album pictures stay on the phone they were added on.

## Publishing changes

Every push to `main` runs the tests, builds the game and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). GameHub's shared toolbox (`../hub/shared/v1`, or the hub repo
in the workflow) is bundled in as `@shared`. Phones pick up the new version the next time
it's opened; reload once or twice if it doesn't appear.

## In GameHub

Quiet Words sits in GameHub's frame and uses its shared toolbox (see the hub's
`shared/CONTRACT.md`): Hub or Home top left, the Settings gear top right, the launch page with
Play and Levels, the shared Settings panel (with Quiet Words' own sections), GameHub's settings
as the starting point, the sleep timer, and the toolbox's Sound (the same generated notes, music
and nature sounds Quiet Words always had). Saves live in its own IndexedDB database,
`quiet-words`, and settings in localStorage under `quiet-words:`.

Scenery is painted in code for every place (the AI nature photos were retired on 2026-10-28),
or the player's own photo album by day.

## Words and levels

All levels are generated ahead of time from free word lists (sources and licences are in
`data/SOURCES.md`):

```sh
npm run lexicon      # data/answers.txt (common words) and data/valid.txt (bonus words)
npm run levels       # public/levels/: 990 journey levels
npm run definitions  # public/definitions.json (needs WordNet; see data/SOURCES.md)
npm run show -- 1 120 650   # print levels as text grids to check them by eye
```

To keep a word out of the crosswords (it still counts as a bonus word), add it to
`data/blocklist.txt` and rerun all three. Regenerating can change levels people are partway
through, so check the early levels still match when you do.

## Tests

```sh
npm test          # unit tests, including checks on every generated level
npm run e2e       # browser tests: gameplay, GameHub's frame and panel, sound, no blue light at night, albums
```

The audio test saves a WAV of every sound to `audio-previews/` for listening.

## Where things are

| Folder | What's in it |
| --- | --- |
| `src/game/` | the wheel, grid, word checking, hints, level loading |
| `src/modes/` | the crossword board, journey, quiz and word-search breaks |
| `src/hub.ts` | where it plugs into GameHub: the toolbox's Sound, the shared Settings panel and the frame |
| `src/audio/` | which nature sounds go with each place (played by the toolbox's Sound) |
| `src/theme/` | colours, painted scenes, moving creatures, scenery choice |
| `src/meta/` | saving: settings, progress, photo albums |
| `src/ui/` | the launch page, Levels (postcards), albums and other screens |
| `tools/` | the scripts that build the word lists, levels and definitions |
| `e2e/` | browser tests |
