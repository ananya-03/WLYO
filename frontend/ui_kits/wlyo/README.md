# WLYO / BRAINROT MAZE — UI Kit

## Overview
High-fidelity interactive prototype of the BRAINROT MAZE web app. Click-through from landing → seed flash → maze gates → era room → vibe report.

## Stack
- React + Babel (inline JSX)
- All tokens from `../../colors_and_type.css`
- Google Fonts: Bagel Fat One, Space Grotesk, Comic Neue

## Screens
1. **Landing** — Full-screen portal background, TURN UP toggle, Enter Maze CTA
2. **Seed Flash** — 700ms meme flash, hard cut to black
3. **Maze Gate (Fork)** — Text/image trivia options, 7-pip progress
4. **Maze Gate (Audio)** — Audio door with waveform, 4 answer tiles
5. **Era Room** — Verdict reveal sequence (title → age → roast)
6. **Vibe Report** — Radar + share card

## Files
- `index.html` — Full interactive prototype entry
- `Landing.jsx` — Landing screen component
- `SeedFlash.jsx` — Seed flash + first gate lead-in
- `MazeGate.jsx` — Fork gate + audio door components
- `EraRoom.jsx` — Era room reveal
- `VibeReport.jsx` — Radar chart + share card

## Notes
- Meme images are placeholders (colored blocks with era labels)
- Audio clips are simulated (waveform animation only)
- Radar values are mock data — real scoring from zustand in prod
- Share card uses html-to-image in production; here it's a styled div
