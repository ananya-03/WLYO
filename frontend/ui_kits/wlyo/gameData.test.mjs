import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, createContext } from 'node:vm';

const source = readFileSync(new URL('./gameData.js', import.meta.url), 'utf8');
const context = createContext({ window: {}, console });
new Script(source, { filename: 'gameData.js' }).runInContext(context);

const game = context.window.BRAINROT_GAME;

assert.ok(game, 'BRAINROT_GAME global is exposed');
assert.equal(game.MAZE_GATES.length, 7, 'maze has seven gates');
assert.ok(game.MAZE_GATES.some((gate) => gate.kind.startsWith('audio_')), 'maze includes audio doors');
assert.ok(game.MAZE_GATES.some((gate) => gate.kind.startsWith('fork_')), 'maze includes fork gates');

for (const gate of game.MAZE_GATES) {
  assert.equal(gate.options.length, 4, `${gate.id} has four options`);
  for (const option of gate.options) {
    assert.ok(option.next, `${gate.id}/${option.id} has next route`);
    assert.ok(option.timelineCopy, `${gate.id}/${option.id} has no-fail timeline copy`);
    assert.ok(option.axis_deltas, `${gate.id}/${option.id} has axis deltas`);
  }
  if (gate.kind.startsWith('audio_')) {
    assert.ok(gate.audio, `${gate.id} has an audio clip`);
    assert.ok(gate.fallbackPrompt, `${gate.id} has fallback copy`);
  }
}

let youngRun = game.createInitialRun(game.SEED_POOL.find((meme) => meme.era === 'genalpha'));
for (const gate of game.MAZE_GATES) {
  const newest = gate.options.reduce((best, option) => (
    option.era_pull > best.era_pull ? option : best
  ));
  youngRun = game.applyAnswer(youngRun, gate, newest);
}
assert.equal(game.deriveEra(youngRun).id, 'genalpha', 'newest route reaches Gen Alpha room');

let oldRun = game.createInitialRun(game.SEED_POOL.find((meme) => meme.era === 'boomer'));
for (const gate of game.MAZE_GATES) {
  const oldest = gate.options.reduce((best, option) => (
    option.era_pull < best.era_pull ? option : best
  ));
  oldRun = game.applyAnswer(oldRun, gate, oldest);
}
assert.equal(game.deriveEra(oldRun).id, 'boomer', 'oldest route reaches Boomer room');

const replayed = game.applyAuraTaxReplay({ ...youngRun, axes: { ...youngRun.axes, aura: 12 } });
assert.equal(replayed.axes.aura, 7, 'Aura Tax Replay subtracts five aura');
assert.equal(replayed.replays, youngRun.replays + 1, 'Aura Tax Replay increments replay count');

const displayAxes = game.buildDisplayAxes(youngRun);
for (const [axis, value] of Object.entries(displayAxes)) {
  assert.ok(value >= 10 && value <= 100, `${axis} axis stays in display range`);
}

const share = game.createShareCardData(youngRun);
assert.equal(share.product, 'BRAINROT MAZE');
assert.equal(share.size.width, 1200);
assert.equal(share.size.height, 630);
assert.ok(share.pathThumbs.length <= 5, 'share card path summary is compact');

assert.ok(game.MAZE_LAYOUT, 'top-down maze layout exists');
assert.equal(game.MAZE_LAYOUT.nodes.length, 8, 'maze has start plus seven decision nodes');
assert.ok(game.MAZE_LAYOUT.nodes.every((node) => Number.isInteger(node.x) && Number.isInteger(node.y)), 'maze nodes have grid positions');

const initialRun = game.createInitialRun(game.SEED_POOL[0]);
const firstDecision = game.buildDecisionGame(0, initialRun);
assert.ok(['audio_match_meme', 'meme_match_name', 'meme_match_era'].includes(firstDecision.kind), 'decision game has playable kind');
assert.equal(firstDecision.options.length, 4, 'decision game has four choices');
assert.ok(firstDecision.options.every((option) => option.image || option.audio || option.label), 'decision choices are concrete assets or labels');

const audioDecision = game.buildDecisionGame(1, initialRun);
assert.equal(audioDecision.kind, 'audio_match_meme', 'second decision is audio matching game');
assert.ok(audioDecision.audio?.audio, 'audio matching game has clip');
assert.ok(audioDecision.options.some((option) => option.memeId === audioDecision.answerMemeId), 'audio matching options include matching meme');
assert.ok(audioDecision.options.every((option) => option.image), 'audio matching uses meme images');

const memeDecision = game.buildDecisionGame(2, initialRun);
assert.equal(memeDecision.kind, 'meme_match_name', 'third decision is meme naming game');
assert.ok(memeDecision.meme?.image, 'meme naming game shows meme image');
assert.ok(memeDecision.options.some((option) => option.memeId === memeDecision.meme.id && option.label === memeDecision.meme.canonical), 'meme naming options include correct label');

const movedRun = game.applyAnswer(initialRun, audioDecision, audioDecision.options[0]);
assert.notDeepEqual(movedRun.avatar, initialRun.avatar, 'answer moves avatar through maze');
assert.ok(movedRun.path.at(-1).from && movedRun.path.at(-1).to, 'path records maze movement');
