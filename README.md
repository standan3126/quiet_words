# Quiet Words

A calm word game for bedtime and breaks: the swipe-a-word crossword from *Wordscapes* and
*Words of Paradise*, without the ads, timers, coin pressure or obscure words. It has nature
sounds and music, painted scenery with lazy moving creatures, your own photo albums, and a
night mode with no blue light.

It's a web app: it runs in any phone or computer browser, installs to the home screen, and
works offline once installed. Everything a player saves (progress, settings, photo albums)
stays on their own device.

## Playing

- **Online:** the GitHub Pages address, `https://standan3126.github.io/quiet_words/`. Open it on
  a phone and use Settings → *Add to your home screen*.
- **At home, on this computer:** `npm run dev`, then open the address it prints. Phones on the
  same Wi-Fi can use the `Network:` address.
- **Moving to a new phone or address:** Settings → *Save a backup*, then *Restore from a
  backup* on the new one.

## Publishing changes

Every push to `main` runs the tests, builds the game and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). Installed copies pick up the new version the next time
they're opened; reload once or twice if it doesn't appear.

## Adding scenery pictures

See `SCENERY-PROMPTS.md` for the image prompts and sizes. Save images into `public/scenery/`
as `<journey>-<number>.jpg` (for example `coast-1.jpg`), run `npm run scenery`, and push.

## Words and levels

All levels are generated ahead of time from free word lists (sources and licences are in
`data/SOURCES.md`):

```sh
npm run lexicon      # data/answers.txt (common words) and data/valid.txt (bonus words)
npm run levels       # public/levels/: 990 journey levels and 365 daily puzzles
npm run definitions  # public/definitions.json (needs WordNet; see data/SOURCES.md)
npm run show -- 1 120 650   # print levels as text grids to check them by eye
```

To keep a word out of the crosswords (it still counts as a bonus word), add it to
`data/blocklist.txt` and rerun all three. Regenerating can change levels people are partway
through, so check the early levels still match when you do.

## Tests

```sh
npm test          # unit tests, including checks on every generated level
npm run e2e       # browser tests: gameplay, sound, night mode has no blue light, albums, backups
```

The audio test saves a WAV of every sound to `audio-previews/` for listening.

## Where things are

| Folder | What's in it |
| --- | --- |
| `src/game/` | the wheel, grid, word checking, hints, level loading, daily puzzle |
| `src/modes/` | the crossword board, journey, daily puzzle, quiz and word-search breaks |
| `src/audio/` | marimba notes, nature sounds and music, all generated in the browser |
| `src/theme/` | colours, painted scenes, moving creatures, scenery choice |
| `src/meta/` | saving: settings, progress, photo albums, backups |
| `src/ui/` | home, settings, albums, postcards and other screens |
| `tools/` | the scripts that build the word lists, levels, definitions and scenery list |
| `e2e/` | browser tests |
