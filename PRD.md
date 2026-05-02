# PRD: BRAINROT MAZE (working name)

> A flashy, phonky web app where the user is shown a meme for a split-second, then dropped into a branching maze of meme-recognition obstacles (audio-locked doors + fork-in-the-road trivia gates). The path they walk decides which of 5 **era rooms** they end up in. That room reveals their estimated age and a 4-axis vibe report: **Rizz / Aura / Sigma / Era**. Hackathon theme: stupidity. Goal: max brainrot, not correctness.

---

## 1. Context

We are building a one-day hackathon web app under the theme **"stupidity"**. The premise:

> *"How brainrotted are you?"*

The user is given a sub-second flash of a "seed meme", then must navigate a branching maze. Every node is one of two obstacle types, both of which test meme recognition:

1. **Fork-in-the-road trivia gates** - 2-4 visual/text options, pick the right one to take that branch.
2. **Audio-locked doors** - a short clip plays, user identifies the matching meme to unlock the door.

After ~7 obstacles, the path the user walked deposits them in one of 5 **era rooms** (boomer / millennial / older_genz / genz_core / genalpha). That room *is* their verdict. The same answers also feed three chaos axes (rizz / aura / sigma), producing a final 4-axis radar plus an estimated age and a shareable card.

We are **explicitly not optimizing for correctness or fairness**. We want max wackiness, max phonk, max color, max chaos. Judges should laugh.

### Meme vocabulary by era (cross-generational)

The deck is bucketed into five eras. Each meme is tagged with exactly one era; that's how we estimate the player's age.

**Era 1 - BOOMER / EARLY WEB (pre-2005, est. age 45+)**
- Dancing baby (1996), hampster dance, "you've got mail", Star Wars Kid (2003), All Your Base Are Belong To Us, dial-up modem.

**Era 2 - OG INTERNET / MILLENNIAL (2005-2012, est. age 30-44)**
- Rickroll, Leeroy Jenkins, LOLcats / "I can has cheezburger", Numa Numa, Chocolate Rain, Trollface, Y U NO Guy, Forever Alone, Me Gusta, Nyan Cat, Bad Luck Brian, Success Kid, Philosoraptor, Scumbag Steve, Advice Animals.

**Era 3 - PEAK 2010s / OLDER GEN Z (2013-2018, est. age 22-30)**
- Doge ("such wow"), Pepe the Frog, Harambe, Dat Boi, Salt Bae, Distracted Boyfriend, Mocking Spongebob, Roll Safe, Arthur's Fist, Evil Kermit, Drake hotline-bling, Left Exit 12, "It's Wednesday my dudes", Tide Pods, We Are Number One.

**Era 4 - LATE 2010s / GEN Z CORE (2018-2022, est. age 18-25)**
- Stonks, Woman Yelling at Cat, "OK Boomer", Big Chungus, Baby Yoda, "Bernie sitting in chair" (2021), "they did surgery on a grape", Wojaks (Coomer/Doomer/Bloomer/NPC), Among Us / "sus", "ratio + L + you fell off", Vine boom culture, "and I oop", VSCO girl, "to be continued".

**Era 5 - GEN ALPHA BRAINROT (2023-2026, est. age <=18)**
- Skibidi Toilet, Rizz, Aura / aura farming, Sigma ("erm what the sigma"), Gyatt, Fanum Tax, Ohio, Mewing, Delulu, low taper fade, "6 7", chopped, cooked, lock in, glaze, NPC (modern usage), GOAT, bussin, slay, no cap, bet, mid, goofy ahh, mogging, looksmaxxing, AYO THE PIZZA HERE.

Easter-egg phrase: **"Skibidi Ohio Rizz, Sigma Fanum Tax Mewing Bop"**.

---

## 2. Goals & Non-Goals

### Goals
- Ship a deployable web app in <= 1 hackathon day.
- Click/tap input only - works in every browser, no mic permission, no Chrome lock-in.
- Cross-generational deck so the maze meaningfully ages users instead of just rewarding Gen Alpha.
- Visually unhinged: phonk colors, motion, glitch, screen shake, particles.
- Final shareable card so judges/audience post it (organic demo).
- Robust audio pipeline with multiple fallbacks (a missing clip never blocks an obstacle).

### Non-Goals
- Accuracy of "generation classification" (it's a bit, not a study).
- Voice / speech recognition (was in the previous PRD, dropped).
- Account system, persistence, leaderboards.
- Mobile-native, offline mode, accessibility certification.

---

## 3. Target stack

- **Next.js (App Router) + TypeScript**, deployed on **Vercel**.
- **Tailwind CSS** + **Framer Motion** for animation.
- **Howler.js** for audio playback (gapless, preload, one-shot SFX).
- **Zustand** for game state (path history, axis tallies, current node).
- **html-to-image** for share-card export.
- No backend required for v1 - all client-side. Optional `/api/share` route for OG image generation later.

---

## 4. The maze

### 4.1 Structure

A directed acyclic graph, depth 7, ~3 branches wide. Each layer narrows the era space. Concretely:

```
Layer 0: seed flash + start
Layer 1: 1 root node (universal opener)
Layer 2: 3 branches (older / mid / newer leaning)
Layer 3-6: each branch sub-branches by 1 obstacle each, tightening era
Layer 7: terminal era room (one of 5)
```

The graph is built so that every era room has at least one path leading to it. Wrong answers don't dead-end; they redirect to a sibling era. The user is never stuck. There is no "fail" state - just different verdicts.

### 4.2 Node shape

```ts
type EraTag = 'boomer' | 'millennial' | 'older_genz' | 'genz_core' | 'genalpha';

type ObstacleOption = {
  id: string;
  label?: string;          // text option
  image?: string;          // /memes/<id>.webp option
  audio?: string;          // /audio/<id>.mp3 option
  next: string;            // next node id
  era_pull: -2 | -1 | 0 | 1 | 2;  // negative = older era, positive = newer
  axis_deltas: { rizz: number; aura: number; sigma: number };
};

type Obstacle =
  | { id: string; kind: 'fork_same_era';      seedRef: string; options: ObstacleOption[] }
  | { id: string; kind: 'fork_phrase';        prompt: string;  options: ObstacleOption[] }
  | { id: string; kind: 'fork_origin';        prompt: string;  options: ObstacleOption[] }
  | { id: string; kind: 'audio_sound_to_meme'; audio: string;  options: ObstacleOption[] }  // 4 image options
  | { id: string; kind: 'audio_meme_to_sound'; image: string;  options: ObstacleOption[] }  // 4 audio options
  | { id: string; kind: 'audio_lyric_to_era';  audio: string;  options: ObstacleOption[] }; // 4 era labels

type EraRoom = {
  id: string;
  era: EraTag;
  title: string;            // "Certified Boomer", "Brainrot Native", etc.
  hero_meme: string;        // image shown in the room
  hero_audio?: string;      // ambient track in the room
};
```

### 4.3 Obstacle taxonomy

**Fork trivia (3 variants)**
- `fork_same_era`: "which of these is from the same era as what you just saw?" 4 thumbnails.
- `fork_phrase`: phrase completion - "Such wow, very ___", "It's ___ my dudes", "Erm what the ___". 4 word options.
- `fork_origin`: "where does Fanum Tax come from?" - Kai Cenat / TikTok / 4chan / Vine. Wrong answers route you to a sibling era.

**Audio doors (3 variants)**
- `audio_sound_to_meme`: play 1-2s clip, pick matching meme image from 4.
- `audio_meme_to_sound`: show meme, pick correct sound from 4 play buttons.
- `audio_lyric_to_era`: play a vocal snippet, pick which era it belongs to.

Mix ~50/50 audio vs trivia across the maze. Any audio obstacle has a `fallback_obstacle` field pointing to an equivalent trivia obstacle - if the audio file fails to load (404, decode error, autoplay block) we silently swap to the fallback. **A missing clip never blocks an obstacle.**

### 4.4 Seed flash

- 700ms hard-cut display of one random meme at the start.
- No label, no caption, full-bleed.
- Contributes a small `era_pull` toward its own era + `axis_deltas` toward whatever the meme is tagged for.
- Also seeds a starting position offset so different users walk slightly different graphs.
- Replay button on the first node ("missed it? hit it again") - costs 1 aura, intentional bit.

### 4.5 Path resolution

- Every option clicked appends `era_pull` and `axis_deltas` to the run state.
- Final era room is determined by the cumulative `era_pull` plus the terminal node's own era tag.
- If two eras tie, the more recent one wins (theme bias toward brainrot).

---

## 5. Scoring & axes

### 5.1 Era / age estimation

Era room maps to age midpoint:

```
boomer     -> 50
millennial -> 37
older_genz -> 26
genz_core  -> 22
genalpha   -> 15
```

`estimatedAge = midpoint(final_era_room) + small_jitter_from_axis_totals`. Jitter is +/-3 years based on whether their chaos-axis pattern leans young (high rizz/aura) or old (high sigma alone, low everything else).

Categorical Era labels:

- avg <= 17 -> "iPad Baby"
- 17-21    -> "Brainrot Native"
- 21-26    -> "Gen Z Core"
- 26-32    -> "Elder Zillennial"
- 32-42    -> "Millennial Coded"
- 42+      -> "Certified Boomer"

The Era axis on the radar is plotted as `(estimatedAge normalized 10-60 -> 0-1)` so it visually fits the chaos axes.

### 5.2 Chaos axes

`rizz`, `aura`, `sigma` accumulate from `axis_deltas` on every chosen option. Normalize to 0-1 against an empirical max (set after a few self-play runs). Display on radar.

### 5.3 Title generation

Title = `chaosAxisMax + eraLabel`, e.g. `max-rizz + Brainrot Native -> "Certified Rizzler"`, `max-sigma + Certified Boomer -> "Sigma Grindset Dad"`, `max-aura + Elder Zillennial -> "Aura Manager Millennial"`. ~24 titles in `src/data/titles.ts`.

---

## 6. Audio pipeline

The hardest practical piece. We need ~20-30 short (1-3s) meme audio clips covering all 5 eras. Strategy: **multiple sources, with fallbacks at every layer**, so one source failing never kills the build.

### 6.1 Source priority (try in order, mix freely)

1. **Myinstants.com** - meme soundboard site, thousands of short clips with direct `.mp3` URLs. Vine boom, sad violin, "to be continued", Skibidi bop, AYO THE PIZZA HERE, sigma rule music, Ohio final boss. Already 1-3s, already normalized. **This is the trunk.**
2. **101soundboards.com** - more variety, character voices, TV/movie-origin memes (SpongeBob, Family Guy, Vine). Use when Myinstants doesn't have it.
3. **Voicy.network** - alternative soundboard, useful for older internet clips.
4. **TuneFlex / soundboardguy.com** - additional soundboard mirrors with overlapping inventory.
5. **yt-dlp + ffmpeg** rip from YouTube/TikTok source. `yt-dlp -x --audio-format mp3 <url>` then `ffmpeg -ss <start> -t 2 -af loudnorm in.mp3 out.mp3`. Slow per-clip but covers any gap.
6. **Freesound.org** - generic "alert", "boom", "fail" SFX for ambience and transitions, not meme-identification clips.
7. **archive.org** - Internet Archive often has old viral video originals (Numa Numa, Star Wars Kid, etc.) when YouTube has taken them down.
8. **ElevenLabs / browser TTS** - only for spoken catchphrases with no canonical voice ("erm what the sigma", "no cap", "bussin"). Don't use for music or character memes.
9. **Hand-record from emulated source** - last resort: play the source on a second device, record with `sox` or QuickTime, trim. Reserve for 1-2 stubborn clips.

Keep a registry in `data/audio_sources.json` mapping each meme id to a prioritized list:

```json
{
  "skibidi_toilet": [
    { "source": "myinstants", "url": "https://myinstants.com/.../skibidi.mp3" },
    { "source": "101soundboards", "url": "https://www.101soundboards.com/.../skibidi.mp3" },
    { "source": "voicy", "url": "https://www.voicy.network/.../skibidi.mp3" },
    { "source": "yt-dlp", "url": "https://youtu.be/...", "start": 3, "duration": 2 },
    { "source": "archive", "url": "https://archive.org/.../skibidi.mp3" },
    { "source": "tts", "text": "skibidi dop dop yes yes" }
  ]
}
```

`scripts/fetch-audio.ts` walks the registry, tries each source until one succeeds, writes the result to `public/audio/<id>.mp3`. **Re-runnable - failed sources are retried, succeeded ones are skipped.** Logs which source won per clip so we can see source health.

### 6.2 Runtime fallback chain

In addition to build-time source fallback, the runtime also has fallbacks:

1. Try to load the mapped clip.
2. On 404 / decode error / autoplay block - swap the obstacle for its `fallback_obstacle` (a trivia variant of the same era).
3. If even that's missing - drop the obstacle, advance to the next node, log to telemetry.

### 6.3 Required audio inventory (target list)

Roughly 20 clips covering all 5 eras:

- **Boomer**: dial-up modem handshake, AOL "you've got mail", Star Wars Kid lightsaber whoosh.
- **Millennial**: rickroll intro 2s, Leeroy Jenkins yell, Numa Numa hook 2s, Trollface laugh (TTS or synthesized).
- **Older Gen Z**: doge "such wow" (TTS), Harambe news clip, "It's Wednesday my dudes" frog voice.
- **Gen Z core**: vine boom, "and I oop", "OK Boomer", Among Us kill sound, "to be continued" jazz riff.
- **Gen Alpha**: Skibidi bop intro, "erm what the sigma" clip, AYO THE PIZZA HERE, low taper fade hook, "6 7" chant, Ohio final boss riff.

All findable on Myinstants in <30 min of curation. Each ~50KB at 96kbps mp3. Total bundle ~1MB - fine for web.

### 6.4 Legal note

Short, transformative, non-commercial hackathon use. Add a "sounds and memes belong to their creators" footer. Don't host on a paid product without revisiting.

---

## 7. Image / meme content pipeline

### 7.1 Sources (priority order)

1. **Hand-curated seed pack (~30-40 memes)** in `/public/memes/` with `memes.json` metadata. Demo-day safety net.
2. **Kaggle: ImgFlip 575K dataset** (https://github.com/schesa/ImgFlip575K_Dataset) - mine top ~200 templates.
3. **Kaggle: 6992 Labeled Meme Images** - extra variety, labels attached.
4. **Know Your Meme** scraping via PerceiveYourMeme Python lib for Gen Alpha entries (Skibidi Toilet, Ohio, Fanum Tax) that ImgFlip lacks.
5. **tinyfish CLI** if available - `tinyfish search "skibidi toilet meme"` for trending images.

### 7.2 Build script: `scripts/build-meme-deck.ts`

Reads `data/raw/{imgflip,kym,tinyfish}/`, normalizes to:

```ts
type MemeCard = {
  id: string;
  image: string;            // /memes/<id>.webp
  canonical: string;
  era: EraTag;
  axes: { rizz: number; aura: number; sigma: number };
  difficulty: 1 | 2 | 3;
};
```

Re-encodes images to webp, max 800px wide, writes to `public/memes/`, emits `src/data/memes.json`. Runs once locally; output committed. Runtime never hits external sources.

---

## 8. Visual / audio direction

- **Palette**: hot magenta `#ff2bd6`, acid green `#39ff14`, electric blue `#00f0ff`, on near-black. CRT scanline overlay.
- **Typography**: chunky display (Druk / Anton / Bagel Fat One via Google Fonts) for headlines; Comic Sans for "answer reveal" punchlines.
- **Maze visual**: 2.5D node-graph rendered as glowing portals on a dark grid. Camera pans between nodes with a subtle motion blur. NOT a literal grid maze - too slow to build, and the node-graph reads better.
- **Motion**: every state change shakes, glitches, or chromatic-aberrates. Idle nodes pulse.
- **Particles**: dollar signs, fire, sparkles on hits via tsParticles or hand-rolled.
- **Background audio**: looping phonk beat (cowbell + 808 slide) muted by default with toggle. SFX: vine boom, airhorn, sad trombone, Windows XP error, door creak on node transition.
- **Easter eggs**: 5+ correct answers in a row -> screen tints red, sigma face slides in. Specific seed memes trigger room-themed ambience.

---

## 9. File / route layout

```
app/
  page.tsx               // landing + start button
  play/page.tsx          // maze loop
  results/page.tsx       // radar + share card
src/
  game/
    useGameStore.ts      // zustand: path, axes, current node
    maze.ts              // graph definition + traversal
    scoring.ts           // axis math + age estimation
    audio.ts             // Howler wrapper + fallback chain
  components/
    SeedFlash.tsx
    NodeView.tsx
    ForkObstacle.tsx
    AudioObstacle.tsx
    EraRoom.tsx
    RadarChart.tsx
    ShareCard.tsx
    PhonkBackground.tsx
  data/
    memes.json           // built artifact
    maze.json            // graph definition
    audio_sources.json   // per-meme prioritized source list
    titles.ts
public/
  memes/*.webp
  audio/*.mp3
scripts/
  build-meme-deck.ts
  fetch-audio.ts         // walks audio_sources.json, downloads with fallback
```

---

## 10. Milestones (hackathon-day order)

1. **0:00 - 1:00** Scaffold Next.js, deploy hello-world to Vercel, lock palette/fonts.
2. **1:00 - 2:30** Hand-curate seed pack (~30 memes, era-tagged).
3. **2:30 - 3:30** Define maze graph in `data/maze.json` (~15 obstacles + 5 era rooms).
4. **3:30 - 5:00** Build node renderer + fork obstacle component + path traversal.
5. **5:00 - 6:30** `fetch-audio.ts` with Myinstants source + at least 1 fallback source. Pull ~15 clips.
6. **6:30 - 7:30** Audio obstacle component + Howler integration + runtime fallback to trivia.
7. **7:30 - 8:30** Era room reveal + radar + share card + titles.
8. **8:30 - 10:00** Polish: phonk audio, particles, glitch shaders, easter eggs, CRT overlay, seed flash timing.
9. **10:00 - 11:00** Stretch: more clips via yt-dlp, more memes via ImgFlip dataset.
10. **11:00 - 12:00** Demo rehearsal, deploy final.

---

## 11. Verification

- **Local smoke**: `yarn dev`, complete a full maze run, confirm era room reveals + radar renders + share card downloads.
- **Maze coverage**: simulated 200-run sweep with random answers - assert every era room is reachable, no node leaves user stuck, no infinite loops.
- **Era estimation sanity**: scripted run picking only era-5 options -> age <=18; only era-1 options -> age 40+. Verify both before demo.
- **Audio fallback**: rename `public/audio/` to break it, run a maze - every audio obstacle should silently swap to its trivia fallback, no broken UI.
- **Audio source fallback**: in `fetch-audio.ts`, point Myinstants URLs to a 404, re-run - should walk down to 101soundboards / voicy / yt-dlp / TTS until each clip exists.
- **Deploy**: `vercel --prod`, open on phone Chrome, desktop Chrome, desktop Safari - confirm all work (no Chrome-only gates this time).

---

## 12. Risks & punts

- **Audio sources go down or hotlink-block.** Punt: the multi-source registry + runtime trivia fallback. Document at least 4 sources we've actually tested.
- **Maze graph imbalance** (one era over-represented). Punt: 200-run simulation script before demo to check the verdict distribution.
- **Autoplay blocked on first audio.** Punt: all audio obstacles require a click to play; never auto-play. The seed flash is image-only, so no autoplay there either.
- **Copyright on memes/audio.** Hackathon scope only. Footer credit, no commercial deployment.
- **Brainrot drift** - terms cringe by demo day. Punt: lean in with a "cringe meter" sub-axis if there's time.

---

## 13. Open questions (parked, not blocking)

- Should the seed flash be replayable for free, costly (-aura), or one-shot? Currently: one-shot but with a costly replay button as a bit.
- Background phonk track on by default or off? Currently: off, with a big "TURN UP" button at start.
- Do we need a backend for share-card OG image, or is client-side `html-to-image` enough? Client first.
- 2-player "rizz-off" mode where two phones pass-and-play through the same maze? v2.
