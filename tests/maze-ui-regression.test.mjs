import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/MazeGame.tsx", import.meta.url), "utf8");
const controllerSource = readFileSync(new URL("../components/GameController.tsx", import.meta.url), "utf8");

assert.match(
  source,
  /const\s+playerCenterX\s*=\s*playerPos\.x\s*\*\s*TILE_SIZE\s*\+\s*TILE_SIZE\s*\/\s*2;\s*const\s+playerCenterY\s*=\s*playerPos\.y\s*\*\s*TILE_SIZE\s*\+\s*TILE_SIZE\s*\/\s*2;\s*const\s+cameraX\s*=\s*mazeWidth\s*\/\s*2\s*-\s*playerCenterX;\s*const\s+cameraY\s*=\s*mazeHeight\s*\/\s*2\s*-\s*playerCenterY;/,
  "camera offset should account for the flex-centered maze width, not viewport width"
);

assert.match(
  source,
  /type="button"[\s\S]*?onClick=\{\(\)\s*=>\s*handleAnswer\(option\)\}[\s\S]*?className=\{`block min-h-24 w-full/,
  "answer option should be a full-tile button target"
);

assert.match(
  source,
  /activeStimulus\.audioUrl/,
  "audio playback should live at gate stimulus level"
);

assert.match(
  source,
  /max-h-\[calc\(100dvh-2rem\)\]/,
  "gate panel should constrain height and scroll on small screens"
);

assert.match(
  source,
  /overflow-y-auto/,
  "gate panel should scroll when small screens are height constrained"
);

assert.doesNotMatch(
  source,
  /option\.imageUrl|option\.audioUrl/,
  "answer options should be text-only; media belongs to the gate stimulus"
);

assert.doesNotMatch(
  source,
  /imageStimulus\s*&&\s*!showStimulus/,
  "image gate stimuli should not reappear beside text answer options after the flash"
);

assert.match(
  source,
  /fallbackImage\s*&&/,
  "only audio fallback images should render in the answer panel"
);

assert.match(
  source,
  /affectsGateAudio:\s*false/,
  "judgment audio should not mark gate audio as unavailable"
);

assert.doesNotMatch(
  source,
  /restartRequired|three wrong answers|RUN IT BACK/,
  "wrong answers should not block maze completion after the third miss"
);

assert.match(
  source,
  /MISFIRES\s+\{strikes\}\/\{TOTAL_GATES\}/,
  "miss count should continue through all seven checkpoints"
);

assert.match(
  source,
  /aria-live="polite"/,
  "judgment feedback should be announced without stealing focus"
);

assert.match(
  controllerSource,
  /key=\{`maze-\$\{activeRun\.seed\}`\}/,
  "Run It Back should remount the maze after a three-strike restart"
);
