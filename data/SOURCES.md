# Word data sources

| File | Source | License |
| --- | --- | --- |
| `raw/enable1.txt` | ENABLE2K word list, via github.com/dolph/dictionary | Public domain |
| `raw/en_50k.txt` | FrequencyWords (OpenSubtitles 2018, top 50k English), github.com/hermitdave/FrequencyWords | CC BY-SA 4.0 |
| `raw/scowl-american-english.txt` | SCOWL American English word list (Debian `wamerican`), wordlist.aspell.net | SCOWL license (permissive, attribution) |
| `raw/wordnet/` (not committed, 69 MB) | WordNet 3.1, wordnetcode.princeton.edu/wn3.1.dict.tar.gz — unpack into `data/raw/wordnet/` | WordNet license (permissive, attribution) |
| `definitions-extra.txt` | Ours: definitions for grammar words WordNet leaves out | — |
| `raw/profanity_en.txt` | List of Dirty, Naughty, Obscene and Otherwise Bad Words, github.com/LDNOOBW | CC BY 4.0 |

`blocklist.txt` is ours: words that are fine as bonus words but shouldn't be crossword answers
(interjections, grim words that don't suit a calm game). Edit it freely, then rerun
`npm run lexicon && npm run levels && npm run definitions`.

An answer word must appear **lowercase** in the SCOWL list. SCOWL capitalises names, so this keeps
names that happen to be Scrabble words ("robbins", "joe") out of the grid.

Subtitle frequencies are used on purpose: they rank everyday spoken words highly, which is
exactly what makes a crossword answer feel fair.
