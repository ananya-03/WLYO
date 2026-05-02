import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { Script, createContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../lib/game-store.ts", import.meta.url), "utf8");
const memeCatalog = JSON.parse(readFileSync(new URL("../src/data/memes.json", import.meta.url), "utf8"));
const audioCatalog = JSON.parse(readFileSync(new URL("../src/data/audio.json", import.meta.url), "utf8"));
const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const eras = ["boomer", "millennial", "older-gen-z", "gen-z-core", "gen-alpha"];

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    resolveJsonModule: true,
    target: ts.ScriptTarget.ES2020,
  },
});

const module = { exports: {} };
const context = createContext({
  console,
  crypto,
  exports: module.exports,
  module,
  require(specifier) {
    if (specifier.endsWith("memes.json")) return { __esModule: true, default: memeCatalog };
    if (specifier.endsWith("audio.json")) return { __esModule: true, default: audioCatalog };
    throw new Error(`Unexpected require: ${specifier}`);
  },
});

new Script(compiled.outputText, { filename: "game-store.cjs" }).runInContext(context);
const game = module.exports;
const imagePromptSafeMemeIds = new Set(game.imagePromptSafeMemeIds);

function publicPathExists(publicUrl) {
  assert.ok(publicUrl.startsWith("/"), `${publicUrl} must be a public-root URL`);
  return existsSync(path.join(repoRoot, "public", publicUrl.slice(1)));
}

function keyRun(run) {
  return JSON.stringify({
    maze: run.maze.layout,
    gates: run.gates.map((gate) => ({
      type: gate.type,
      prompt: gate.prompt,
      stimulus: gate.stimulus,
      options: gate.options.map((option) => option.text),
    })),
  });
}

function assertReachableMaze(maze) {
  const queue = [maze.start];
  const seen = new Set([`${maze.start.x},${maze.start.y}`]);

  for (let i = 0; i < queue.length; i += 1) {
    const current = queue[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { x: current.x + dx, y: current.y + dy };
      const key = `${next.x},${next.y}`;
      if (seen.has(key)) continue;
      const tile = maze.layout[next.y]?.[next.x];
      if (!tile || tile === "W") continue;
      seen.add(key);
      queue.push(next);
    }
  }

  assert.ok(seen.has(`${maze.exit.x},${maze.exit.y}`), "exit should be reachable from start");
  for (const gate of maze.gatePositions) {
    assert.ok(seen.has(`${gate.x},${gate.y}`), `gate ${gate.x},${gate.y} should be reachable`);
  }
}

assert.equal(typeof game.createGameRun, "function", "createGameRun is exported");
assert.ok(imagePromptSafeMemeIds.size >= 4, "image prompt pool should have enough caption-safe memes");

const runA = game.createGameRun(12345);
const runB = game.createGameRun(12345);
const runC = game.createGameRun(67890);

assert.deepEqual(runA, runB, "same seed should produce the same maze and questions");
assert.notEqual(keyRun(runA), keyRun(runC), "different seeds should change maze or questions");

for (const run of [runA, runC]) {
  assert.equal(run.gates.length, 7, "generated maze should have seven PRD checkpoints");
  assert.equal(run.maze.gatePositions.length, 7, "generated maze should expose seven gate positions");
  assert.equal(run.gates.filter((gate) => gate.type === "image").length, 4, "run should have four image gates");
  assert.equal(run.gates.filter((gate) => gate.type === "audio").length, 3, "run should have three audio gates");
  assertReachableMaze(run.maze);

  assert.ok(publicPathExists(run.seedMeme.image), "seed meme image should exist");
  assert.ok(imagePromptSafeMemeIds.has(run.seedMeme.id), "seed meme should come from the caption-safe image prompt pool");

  for (const gate of run.gates) {
    assert.equal(gate.options.length, 4, `${gate.id} should have four text answer options`);
    assert.equal(gate.options.filter((option) => option.isCorrect).length, 1, `${gate.id} should have one correct option`);
    assert.equal(new Set(gate.options.map((option) => option.text)).size, 4, `${gate.id} options should not duplicate labels`);
    assert.ok(gate.prompt.length > 8, `${gate.id} should have a real recognition prompt`);

    if (gate.type === "image") {
      assert.equal(gate.stimulus.kind, "image", `${gate.id} should show one meme image`);
      assert.ok(publicPathExists(gate.stimulus.imageUrl), `${gate.id} image stimulus should exist`);
      assert.ok(
        imagePromptSafeMemeIds.has(gate.stimulus.memeId),
        `${gate.id} image stimulus should avoid text-heavy meme assets`
      );
    }

    if (gate.type === "audio") {
      assert.equal(gate.stimulus.kind, "audio", `${gate.id} should expose one gate-level audio clip`);
      assert.ok(publicPathExists(gate.stimulus.audioUrl), `${gate.id} audio stimulus should exist`);
      if (gate.fallbackStimulus) {
        assert.equal(gate.fallbackStimulus.kind, "image", `${gate.id} fallback should be an image when present`);
        assert.ok(
          imagePromptSafeMemeIds.has(gate.fallbackStimulus.memeId),
          `${gate.id} fallback image should avoid text-heavy meme assets`
        );
      }
    }

    for (const option of gate.options) {
      assert.equal(typeof option.text, "string", `${gate.id}/${option.id} should have text`);
      assert.ok(eras.includes(option.era), `${gate.id}/${option.id} should have a normalized era`);
      assert.equal(typeof option.eraPull, "number", `${gate.id}/${option.id} should affect era routing`);
      assert.ok(option.axisDeltas, `${gate.id}/${option.id} should affect rizz, aura, and sigma`);
      assert.equal(option.imageUrl, undefined, `${gate.id}/${option.id} should not carry option image media`);
      assert.equal(option.audioUrl, undefined, `${gate.id}/${option.id} should not carry option audio media`);
    }
  }
}

const allGeneratedEras = new Set();
for (let seed = 1; seed <= 200; seed += 1) {
  const run = game.createGameRun(seed);
  assertReachableMaze(run.maze);
  run.gates.forEach((gate) => gate.options.forEach((option) => allGeneratedEras.add(option.era)));
}
assert.deepEqual([...allGeneratedEras].sort(), [...eras].sort(), "generated options should cover all five eras");

const oldAnswers = runA.gates.map((gate) => {
  const option = gate.options.reduce((oldest, item) => item.eraPull < oldest.eraPull ? item : oldest, gate.options[0]);
  return {
    gateId: gate.id,
    optionId: option.id,
    era: option.era,
    isCorrect: Boolean(option.isCorrect),
    eraPull: option.eraPull,
    axisDeltas: option.axisDeltas,
  };
});

const correctAnswers = runA.gates.map((gate) => {
  const option = gate.options.find((item) => item.isCorrect) ?? gate.options[0];
  return {
    gateId: gate.id,
    optionId: option.id,
    era: option.era,
    isCorrect: Boolean(option.isCorrect),
    eraPull: option.eraPull,
    axisDeltas: option.axisDeltas,
  };
});

const allWrongAnswers = runA.gates.map((gate) => {
  const option = gate.options.find((item) => !item.isCorrect) ?? gate.options[0];
  return {
    gateId: gate.id,
    optionId: option.id,
    era: option.era,
    isCorrect: false,
    eraPull: option.eraPull,
    axisDeltas: option.axisDeltas,
  };
});

const twoWrongAnswers = runA.gates.map((gate, index) => {
  const option = index < 2
    ? gate.options.find((item) => !item.isCorrect) ?? gate.options[0]
    : gate.options.find((item) => item.isCorrect) ?? gate.options[0];
  return {
    gateId: gate.id,
    optionId: option.id,
    era: option.era,
    isCorrect: Boolean(option.isCorrect) && index >= 2,
    eraPull: option.eraPull,
    axisDeltas: option.axisDeltas,
  };
});

assert.equal(game.calculateResults(oldAnswers).finalEra, "boomer", "oldest route should reach Boomer room");
assert.equal(game.calculateResults(allWrongAnswers).finalEra, "boomer", "all-wrong route should still finish as an old meme age");
assert.ok(
  game.calculateResults(allWrongAnswers).estimatedAge > game.calculateResults(twoWrongAnswers).estimatedAge,
  "two misses should produce a younger meme age than seven misses"
);
assert.ok(
  game.calculateResults(correctAnswers).scores.rizz > game.calculateResults(allWrongAnswers).scores.rizz,
  "correct answers should produce stronger meme fluency scores than misses"
);
assert.deepEqual(game.calculateResults(correctAnswers), game.calculateResults(correctAnswers), "result calculation should be deterministic");
