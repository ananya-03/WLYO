# Frontend PRD: BRAINROT MAZE

> A modern, funky, phonk-chaos web experience where users sprint through meme-recognition gates, land in an era room, and leave with a loud shareable vibe verdict.

## 1. Brand Glossary

Use these names exactly.

- Product name: **BRAINROT MAZE**
- Core question: **How brainrotted are you?**
- Main flow: **Seed Flash** -> **Maze Gates** -> **Era Room** -> **Vibe Report**
- Verdict room name: **Era Room**
- Results name: **Vibe Report**
- Share artifact: **Share Card**
- Axes: **Rizz**, **Aura**, **Sigma**, **Era**
- Music mode: **TURN UP**
- Replayed seed action: **Aura Tax Replay**
- Easter-egg phrase: **Skibidi Ohio Rizz, Sigma Fanum Tax Mewing Bop**
- AI rule: do not describe the verdict as AI-generated, AI-scored, or scientifically accurate.

## 2. Frontend Goal

Build a browser-first UI that makes the app feel like a playable meme machine, not a form or quiz.

The experience should be fast, loud, funny, and demo-friendly. Judges should understand the premise in one screen, play without instructions, laugh at each gate, and want to share the final card.

This PRD covers only visible UI, interaction behavior, visual system, motion, responsive behavior, and frontend release quality. It does not define backend services, content sourcing, scraping, storage, or deployment pipelines.

## 3. Target Audience

- Hackathon judges watching a live demo.
- Friends playing on one phone or laptop.
- Cross-generational users who may recognize different meme eras.
- Users who want a quick absurd result, not a serious assessment.

Primary session length: 60-120 seconds.

Primary input: click or tap only.

## 4. Experience Principles

1. **Zero-explanation start**
   The first screen sells the joke immediately. No long onboarding, no rules page, no tutorial wall.

2. **Chaos with clear choices**
   Visuals can shake, glitch, and scream, but answer options must stay readable and tappable.

3. **Every choice feels physical**
   Gates slam, portals pulse, audio doors unlock, wrong choices still launch users forward.

4. **No fail state**
   The UI never says the user lost. Every path creates a fun verdict.

5. **Share card is the trophy**
   Results screen must make screenshotting or downloading feel like the natural ending.

## 5. Visual Direction

### Theme

**Phonk arcade meets cursed meme lab.**

The app should feel like a late-night browser game trapped inside a CRT, with modern UI sharpness and readable controls. Use meme-chaos energy, but keep hierarchy disciplined.

### Palette

Use near-black base with high-chroma accents:

- Void: `#08070f`
- Ink: `#151124`
- Hot magenta: `#ff2bd6`
- Acid green: `#39ff14`
- Electric blue: `#00f0ff`
- Warning orange: `#ff9f1c`
- Off-white: `#f7f0ff`
- Muted lavender gray: `#b9aee8`

Rules:

- Do not use pure black or pure white.
- Do not let the UI become only purple-blue neon. Magenta, green, blue, and orange must all have jobs.
- Use electric blue for navigation/portal energy.
- Use acid green for correct/unlocked/hit states.
- Use hot magenta for danger, drama, and active gates.
- Use orange for warnings, countdowns, and "aura tax" moments.

### Typography

- Display face: chunky, meme-friendly headline font such as **Bagel Fat One**, **Anton**, or equivalent.
- Body face: readable sans with personality, not a generic system-only look.
- Punchline face: Comic Sans-style treatment only for reveal jokes, labels, and absurd microcopy.

Rules:

- Headlines can be huge and compressed.
- Gate prompts must stay readable at mobile width.
- Buttons use short labels, not sentences.
- Do not use gradient text.

### Texture

Use layered effects:

- CRT scanlines.
- Subtle chromatic offset during transitions.
- Pixel-noise overlay.
- Portal glow behind active nodes.
- Floating particles: fire, sparkles, dollar signs, warning triangles.

Effects must not reduce option readability.

## 6. App Structure

### 6.1 Landing Screen

Purpose: sell the premise and start the run.

Required UI:

- Full-screen animated maze/portal background.
- Product name **BRAINROT MAZE** as first-viewport signal.
- Core question: **How brainrotted are you?**
- Primary CTA: **Enter Maze**
- Secondary toggle: **TURN UP** for background audio.
- Tiny footer note: memes and sounds belong to their creators.

Behavior:

- Tap **Enter Maze** starts Seed Flash.
- If **TURN UP** is enabled, show clear muted/unmuted state.
- Landing should not show final scoring details.

Visual mood:

- Big, brash, instantly meme-coded.
- No marketing cards.
- No feature grid.

### 6.2 Seed Flash Screen

Purpose: create panic and memory pressure.

Required UI:

- Full-bleed meme image for 700ms.
- No caption during flash.
- Hard cut to black/void after flash.
- Countdown blip before flash is allowed, max 1 second.

After flash:

- Show first gate.
- Show small replay control: **Aura Tax Replay**.
- Replay button indicates the cost visually with orange warning treatment.

Behavior:

- Replay flashes the same seed once.
- Replay interaction causes a small "aura drained" visual gag.

### 6.3 Maze Hub / Transition Layer

Purpose: make gates feel connected by a maze, without building a slow literal maze.

Required UI:

- 2.5D node graph with glowing portals.
- Current node centered and active.
- Previous path faintly visible behind user.
- Next possible branches visible as silhouettes or locked portals.
- Progress indicator as seven corrupted pips, not a normal progress bar.

Behavior:

- Between gates, camera pans or warps to next node.
- Transition lasts 450-900ms.
- User should never wait on decorative animation longer than 1 second.

### 6.4 Fork Gate Screen

Purpose: visual/text meme recognition.

Required UI:

- Gate prompt at top.
- 2-4 large answer options.
- Options support text-only, image-only, or image plus label.
- Active gate frame with portal/glitch styling.
- Progress pips persist.

Option states:

- Idle: clear card/tile with strong contrast.
- Hover/focus: tile lifts, glow intensifies.
- Pressed: tile compresses.
- Selected: screen shakes, gate opens, path advances.

Rules:

- Wrong choices do not look like failure. They should look like "you chose this cursed timeline."
- If reveal text appears, keep it short and funny.
- Options must be at least 44px tall on mobile.

### 6.5 Audio Door Screen

Purpose: audio meme recognition with tap-first control.

Required UI:

- Big central locked door or speaker portal.
- Play button with waveform/ripple visualization.
- Prompt text: short and direct.
- Four answer tiles.
- Audio unavailable state that swaps to visual trivia copy without breaking immersion.

Behavior:

- Audio only plays after user taps.
- Replay clip button remains available.
- While clip plays, waveform reacts.
- If audio cannot play, UI presents a cursed "signal lost" treatment and continues with a visual version of the gate.

Rules:

- Never block user on audio.
- Never autoplay obstacle audio.
- Keep controls usable with muted device audio.

### 6.6 Era Room Screen

Purpose: make the verdict feel like entering a boss room.

Required UI:

- Era-specific room skin.
- Verdict title.
- Hero meme or hero visual.
- Estimated age reveal.
- Short roast line.
- CTA to open **Vibe Report**.

Era room skins:

- Boomer / Early Web: dial-up terminal, beige CRT, old-web chaos.
- Millennial: rage-comic collage, Nyan trails, trollface stamps.
- Older Gen Z: Doge/Pepe/Harambe-era internet scrapbook.
- Gen Z Core: stonks, sus, wojak, vine-boom overlays.
- Gen Alpha: Skibidi/rizz/aura overload with unstable labels and zoomer sticker spam.

Behavior:

- Reveal title first.
- Age reveal slams in second.
- Roast line appears last.

### 6.7 Vibe Report Screen

Purpose: final readable result plus share artifact.

Required UI:

- Main title generated from strongest axis and era.
- Estimated age.
- 4-axis radar: Rizz, Aura, Sigma, Era.
- Axis blurbs, max one line each.
- Path summary: 3-5 tiny icons/meme thumbnails from the run.
- Primary action: **Download Share Card**
- Secondary action: **Run It Back**

Rules:

- Radar must be readable on mobile.
- Do not bury share action.
- Results should fit in one scroll on mobile, with share card visible without hunting.

### 6.8 Share Card

Purpose: social-first artifact.

Required content:

- Product name **BRAINROT MAZE**
- Title/verdict.
- Estimated age.
- Radar or simplified axis bars.
- Era label.
- Hero meme visual.
- Short roast line.
- URL or callout: **Take the Brainrot Test**

Format:

- Export target: 1200x630 social image.
- Must still look good as phone screenshot.
- High contrast, large text, no tiny paragraphs.

## 7. Component Requirements

### Global Shell

- Maintains background layers, audio toggle, reduced-motion setting, and scanline overlay.
- Keeps route transitions visually consistent.
- Does not wrap every screen in cards.

### Button System

- Primary: loud filled action for start/share.
- Secondary: outlined or ghost action for replay/run back.
- Icon buttons for audio, replay, mute, and close-like actions when needed.
- Pressed state required.

### Gate Option Tile

- Supports image, text, or mixed content.
- Fixed responsive dimensions to prevent layout shift.
- Clear selected state.
- Works with keyboard focus.

### Portal Node

- Displays idle, current, completed, and next states.
- Uses glow and transform, not layout movement.
- Can show tiny era hint only after selection, never before.

### Radar Chart

- Labels always visible.
- Animation draws polygon after result reveal.
- Values can be exaggerated for comedy but must map consistently to displayed numbers.

### Toast / Micro-Reveal

- Used for quick jokes like "aura taxed" or "timeline corrupted."
- Max duration: 1.6 seconds.
- Never blocks input.

## 8. Motion Direction

Motion should feel chaotic but intentional.

Required moments:

- Landing background portal drift.
- Seed flash hard cut.
- Gate select impact shake.
- Portal warp between nodes.
- Era room slam reveal.
- Radar draw animation.
- Share card pop-in.

Motion rules:

- Use transform and opacity for most animation.
- Keep layout stable.
- Respect reduced motion by replacing shakes and warps with fades and quick cuts.
- Use short timings. Gameplay should feel snappy.

Timing guide:

- Button press: 100-160ms.
- Tile select impact: 180-260ms.
- Node transition: 450-900ms.
- Era reveal sequence: 1.2-1.8s total.

## 9. Responsive Requirements

### Mobile

- Primary layout target.
- Thumb-friendly answer tiles.
- One-column gate options when content is image-heavy.
- Sticky or persistent progress pips.
- Share card preview remains visible before download action.

### Tablet

- Two-column answer grid.
- Larger portal/node graph.
- Room hero and verdict can sit side by side.

### Desktop

- Use wide space for stronger stage composition.
- Gate prompt and options stay close enough for quick scanning.
- Avoid tiny centered content floating in empty space.

Breakpoints should adapt composition, not hide core features.

## 10. Accessibility And Usability

Minimum requirements:

- Click and tap support.
- Keyboard focus for all interactive controls.
- Visible focus style with high contrast.
- Reduced-motion mode.
- Audio controls visible and understandable.
- No color-only answer state.
- Text contrast holds against noisy backgrounds.
- Option text never overlaps images.

Accepted limitation:

- This is not targeting formal accessibility certification for hackathon v1.

## 11. Frontend States

Every major screen needs these states:

- Loading assets.
- Ready.
- Pressed/selected.
- Transitioning.
- Audio unavailable.
- Reduced motion.
- Mobile narrow layout.

No state should show raw technical error text to the user.

Tone for fallback copy:

- "Signal cooked."
- "Clip got fanum taxed."
- "Visual gate unlocked instead."

## 12. UI Copy Direction

Copy should be short, absurd, and direct.

Good:

- "Enter Maze"
- "Aura Tax Replay"
- "Pick the cursed timeline"
- "Signal cooked"
- "Run It Back"
- "Download Share Card"

Avoid:

- Long instructions.
- Serious quiz language.
- Claims of accuracy.
- Explaining meme history during gameplay.

## 13. Frontend SEO And Metadata

Before deployment, frontend should include:

- Descriptive `<title>`: **BRAINROT MAZE - How Brainrotted Are You?**
- Meta description matching the core premise.
- `lang="en"` on `<html>`.
- Canonical URL.
- Open Graph title, description, image, URL, and type.
- Twitter card title, description, and image.
- Theme color using near-black or hot magenta.
- Robots meta tag.
- Favicon and apple-touch-icon.
- 1200x630 preview image, ideally based on Share Card style.
- JSON-LD only if there is a stable public product URL and final copy.

## 14. Out Of Scope

- Backend architecture.
- API contracts.
- Audio scraping or download flow.
- Meme dataset acquisition.
- User accounts.
- Persistence.
- Leaderboards.
- Scientific age accuracy.
- Admin tooling.

## 15. Acceptance Criteria

Frontend is ready when:

- User can start from landing, complete seven gates, enter an Era Room, and view Vibe Report.
- Every gate is usable with click/tap.
- Audio doors have a visible non-blocking fallback state.
- Final Share Card can be downloaded or screenshotted cleanly.
- UI is clearly modern, funky, phonk-chaos, and not a generic quiz.
- Mobile layout works without text overlap.
- Reduced-motion mode removes harsh shake/glitch effects.
- Metadata and preview image requirements are tracked before deployment.
