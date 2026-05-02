# BRAINROT MAZE Asset Sourcing

This repo uses local, re-runnable scripts to build the hackathon asset pack defined in `PRD.md`.

## Commands

```sh
yarn assets:memes
yarn assets:memes:tinyfish
yarn assets:audio
yarn assets:report
```

`yarn assets` runs all three.

Use `yarn assets:memes:tinyfish` when you want TinyFish browser-agent sourcing instead of the faster direct source pass. It is slower, but it chooses better representative images for newer and obscure memes.

For targeted retries:

```sh
TINYFISH_AGENT=1 yarn assets:memes --force --ids=skibidi_toilet,fanum_tax,ohio
```

## Outputs

- `public/memes/*.webp`: normalized meme images, max 800px.
- `public/audio/*.mp3`: normalized short clips, usually 1-3 seconds.
- `src/data/memes.json`: runtime meme deck metadata.
- `src/data/audio.json`: runtime audio metadata.
- `data/asset-log/*.json`: source winners, failures, and fallback notes.

## Source Order

Images:

1. Imgflip public template API for classic meme templates.
2. Wikimedia Commons search for older public or encyclopedic media.
3. TinyFish CLI, installed with `yarn global add @tiny-fish/cli`, authenticated with `tinyfish auth set`, using `tinyfish search query` plus `tinyfish fetch content get --image-links`.
4. TinyFish browser-agent sourcing, enabled by `TINYFISH_AGENT=1`, using `tinyfish agent run ... --sync` to pick a representative direct image URL from live meme pages.
5. Generated neon fallback card, so the game always has an image.

TinyFish is installed at `/Users/nottanjune/.yarn/bin/tinyfish` on this machine. The script finds that path automatically because the non-login shell PATH does not include Yarn's global bin directory.

Current TinyFish status on this machine:

```json
{"source":"config","key_preview":"sk-tinyfish-...cZsE","authenticated":true}
```

Audio:

1. MyInstants search pages, scraped for direct `/media/sounds/*.mp3` files.
2. macOS `say` TTS for catchphrases where a canonical clip is not required.

`yt-dlp` and manual direct URLs are supported in the script, but the registry only uses them when a concrete source URL is known.

## Legal Note

This is for a short non-commercial hackathon demo. Keep the footer credit from the PRD: "memes and sounds belong to their creators." Revisit rights before paid or public product use.
