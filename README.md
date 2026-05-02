# BRAINROT MAZE — Design System

> "How brainrotted are you?" — A wacky, phonk-chaos hackathon web app that tests meme recognition across five internet eras.

---

## Company / Product Overview

**BRAINROT MAZE** (project alias: WLYO — "Who Let You Online?") is a one-day hackathon web app built under the theme *"stupidity."* It is a meme-recognition maze game where users:

1. See a **Seed Flash** — a meme displayed for 700ms
2. Navigate **Maze Gates** — 7 branching trivia/audio obstacles
3. Land in an **Era Room** — one of 5 generation-themed verdict rooms
4. Receive a **Vibe Report** — a 4-axis radar (Rizz, Aura, Sigma, Era) + shareable card

The product is purely client-side (Next.js + Tailwind + Framer Motion), intended for demo on one hackathon day and deployed on Vercel.

### Sources

- **PRD:** `ananya-03/WLYO@main — PRD.md` (https://github.com/ananya-03/WLYO/blob/main/PRD.md)
- **Frontend PRD:** `ananya-03/WLYO@main — FRONTEND_PRD.md` (https://github.com/ananya-03/WLYO/blob/main/FRONTEND_PRD.md)
- No Figma link provided. No existing codebase beyond the PRDs.

---

## Products / Surfaces

| Surface | Description |
|---|---|
| **Web App** | Primary product. Full-screen browser game. Mobile-first but desktop-friendly. |
| **Share Card** | 1200×630 exported social image — the "trophy" artifact. |

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Voice:** Unhinged, absurdist, self-aware. The app knows it's a bit — it leans in hard.
- **Tone:** Brash, fast, funny. Never serious. Never explains itself. Never apologizes.
- **Person:** 2nd person ("you", "your"). Direct. Confrontational in a fun way.
- **Sentence length:** Short. One phrase. Sometimes one word. No punctuation on headlines.

### Casing
- **Headlines / product name:** ALL CAPS or Title Case — "BRAINROT MAZE", "Enter Maze"
- **CTAs:** Short all-caps or title-case: "Enter Maze", "Run It Back", "TURN UP"
- **Microcopy / jokes:** lowercase for casual asides — "signal cooked", "clip got fanum taxed"
- **Error states:** lowercase, absurd — "visual gate unlocked instead", "aura taxed"

### Emoji & Special Characters
- **Emoji:** Not used in UI copy (kept clean for legibility against noisy backgrounds)
- **Gen Alpha slang:** Used as actual UI copy — "Aura Tax", "Rizz", "Sigma", "Era", "bussin", "cooked", "glazed"
- **Punctuation:** Minimal. No commas in headlines. Periods optional.

### Copy Examples (from PRD)
- `BRAINROT MAZE`
- `How brainrotted are you?`
- `Enter Maze`
- `Aura Tax Replay`
- `Pick the cursed timeline`
- `Signal cooked`
- `Run It Back`
- `Download Share Card`
- `Skibidi Ohio Rizz, Sigma Fanum Tax Mewing Bop` (easter egg)
- `Clip got fanum taxed` (audio fallback)
- `You chose this cursed timeline` (wrong-answer reveal)

### Writing Rules
- Do NOT describe the verdict as AI-generated or scientifically accurate
- Do NOT use long instructions or tutorial walls
- Do NOT use serious quiz language
- DO use slang from the correct era for era-specific rooms

---

## VISUAL FOUNDATIONS

### Color System
**Base palette — phonk arcade on near-black:**

| Token | Hex | Role |
|---|---|---|
| `--void` | `#08070f` | True background, deepest layer |
| `--ink` | `#151124` | Card / panel fill |
| `--hot-magenta` | `#ff2bd6` | Danger, drama, active gates |
| `--acid-green` | `#39ff14` | Correct, unlocked, hit states |
| `--electric-blue` | `#00f0ff` | Navigation, portal energy |
| `--warning-orange` | `#ff9f1c` | Warnings, countdowns, aura tax |
| `--off-white` | `#f7f0ff` | Primary text |
| `--muted-lavender` | `#b9aee8` | Secondary text, labels |

Rules:
- Never pure black (#000) or pure white (#fff)
- All 4 accent colors must have jobs — not just blue/purple neon
- Glow effects use the accent color at low opacity (box-shadow / drop-shadow)

### Typography
**Three-tier type system:**

| Tier | Usage | Font | Style |
|---|---|---|---|
| Display | Headlines, product name, verdict | **Bagel Fat One** (Google Fonts) | Chunky, compressed, LOUD |
| Body | Gate prompts, blurbs, UI labels | **Space Grotesk** (Google Fonts) | Readable, personality |
| Punchline | Reveal jokes, absurd microcopy, era labels | **Comic Neue** (Google Fonts) | Comic Sans energy, slightly cleaner |

*Note: PRD mentions Druk / Anton as alternatives. Bagel Fat One is the primary. Comic Neue substitutes for Comic Sans on web.*

### Backgrounds & Textures
- **Base:** Near-black `#08070f` with `#151124` panels
- **CRT scanlines:** Repeating horizontal lines at ~2px interval, 4% opacity — always on
- **Chromatic aberration:** Red/cyan channel offset on transitions (~2–3px)
- **Pixel noise:** Subtle grain overlay, low opacity
- **Portal glow:** Radial gradient behind active nodes in the accent color
- **Particles:** Floating dollar signs `$`, fire `🔥`-like SVG sparks, warning triangles — tsParticles or hand-rolled canvas

### Motion & Animation
- **Philosophy:** Chaos with intention. Everything reacts, nothing is still.
- **Easing:** Snap-in / elastic for impact; ease-out for settle
- **Button press:** 100–160ms scale down + color deepen
- **Tile select:** 180–260ms shake + glow flash
- **Node transition (warp):** 450–900ms portal-swirl with motion blur
- **Era room reveal:** Sequence over 1.2–1.8s (title → age → roast)
- **Idle:** Nodes pulse with sinusoidal glow; background portals drift slowly
- **Reduced motion:** Replace all shakes/warps with fades + quick cuts

### Hover / Press States
- **Hover:** Tile lifts (translateY -2px), glow intensifies (box-shadow expands), slight scale up
- **Press:** Tile compresses (scale 0.96), color deepens
- **Wrong answer:** No fail color — looks like "you chose the cursed timeline" — orange flash

### Borders & Corners
- **Cards/tiles:** `border-radius: 8px` to `12px`. Never pill-shaped for game tiles.
- **Borders:** 1px glowing border in accent color, with `box-shadow` glow matching border
- **Focus ring:** High-contrast offset outline, 2–3px, electric-blue

### Shadow System
- **Glow shadows:** `0 0 12px rgba(accent, 0.5)` — used on active elements
- **Portal glow:** `0 0 40px rgba(accent, 0.3)` — large halo for portals
- **No drop shadows for depth** — glow is the shadow system here

### Cards
- Fill: `--ink` (`#151124`)
- Border: 1px solid accent color (context-dependent)
- Glow: box-shadow with matching accent
- Rounding: 8–12px
- No elevation/lift by default — only on hover

### Layout
- Mobile-first, full-viewport
- No marketing cards or feature grids
- Gates: single-column on mobile, 2-col on tablet+
- Fixed/sticky: progress pips (7 corrupted pips), audio toggle
- Content never floats in empty space on desktop — use stage composition

### Imagery
- Meme images: full-bleed or contained in portal frames
- No decorative photography
- Era rooms have distinct skin: terminal/beige (boomer), rage-comic collage (millennial), scrapbook (older genz), wojak overlay (genz core), sticker spam (gen alpha)

---

## ICONOGRAPHY

### Approach
- No dedicated icon font or icon library specified in the PRD
- Icons are minimal; interactivity relies on text CTAs more than icons
- **Where icons appear:** Audio play/replay buttons, mute toggle, progress pips, axis labels on radar
- **Style:** Simple geometric / symbolic — matches the "arcade" energy. Not Lucide/Heroicons linework style.
- **Emoji:** Not used in UI — slang is text-based
- **Unicode chars:** Not used as icons

### Substitution
This design system uses **Lucide Icons** (CDN) for utility icons (play, volume, repeat, etc.) as a substitution, since no proprietary icon set was defined. Flag: swap with custom icons if the team defines a set.

### Asset Inventory
See `assets/` folder:
- `assets/logos/` — Wordmark and badge versions of BRAINROT MAZE identity
- `assets/illustrations/` — Era room concept illustrations (placeholder SVGs)
- No existing logo files were found in the repo — originals must be provided by the team.

---

## FILE INDEX

```
README.md                     ← This file
SKILL.md                      ← Agent skill definition
colors_and_type.css           ← All CSS custom properties (colors, type, spacing)
PRD.md                        ← Full product requirements
FRONTEND_PRD.md               ← Frontend-specific requirements

assets/
  logos/                      ← Brand wordmark + badge (placeholder)
  illustrations/              ← Era room illustrations (placeholder)

fonts/                        ← Web fonts (Google Fonts via @import — see colors_and_type.css)

preview/
  colors-base.html            ← Base color palette swatches
  colors-semantic.html        ← Semantic color roles
  type-display.html           ← Display / headline type specimen
  type-body.html              ← Body + punchline type specimen
  type-scale.html             ← Full type scale
  spacing-tokens.html         ← Spacing + border radius tokens
  shadows-glows.html          ← Shadow / glow system
  components-buttons.html     ← Button system
  components-tiles.html       ← Gate option tiles
  components-portal.html      ← Portal node component
  components-pips.html        ← Progress pips
  components-radar.html       ← Radar chart
  brand-identity.html         ← Logo + wordmark
  brand-era-rooms.html        ← Era room skins

ui_kits/
  wlyo/
    README.md                 ← UI kit notes
    index.html                ← Full interactive prototype
    Landing.jsx               ← Landing screen component
    SeedFlash.jsx             ← Seed flash screen
    MazeGate.jsx              ← Fork gate + audio door components
    EraRoom.jsx               ← Era room verdict screen
    VibeReport.jsx            ← Radar + share card screen
    ShareCard.jsx             ← Share card export component
```
