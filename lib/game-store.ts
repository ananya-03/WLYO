import memeDeck from "../src/data/memes.json";
import audioDeck from "../src/data/audio.json";

export type GameScreen =
  | "landing"
  | "maze"
  | "seed-flash"
  | "gate"
  | "era-room"
  | "vibe-report";

export type Era = "boomer" | "millennial" | "older-gen-z" | "gen-z-core" | "gen-alpha";
export type GateType = "image" | "audio";

export interface Position {
  x: number;
  y: number;
}

export interface AxisDeltas {
  rizz: number;
  aura: number;
  sigma: number;
}

export interface MemeCard {
  id: string;
  image: string;
  canonical: string;
  era: Era;
  axes: AxisDeltas;
  difficulty: 1 | 2 | 3;
}

export interface AudioClip {
  id: string;
  canonical: string;
  era: Era;
  audio: string;
}

export interface TextAnswerOption {
  id: string;
  text: string;
  era: Era;
  isCorrect?: boolean;
  eraPull: -2 | -1 | 0 | 1 | 2;
  axisDeltas: AxisDeltas;
  timelineCopy: string;
}

export type GateStimulus =
  | { kind: "image"; imageUrl: string; memeId: string }
  | { kind: "audio"; audioUrl: string; clipId: string; memeId: string };

export interface GeneratedGate {
  id: string;
  type: GateType;
  kind: "meme_name" | "meme_phrase" | "meme_origin" | "audio_reference" | "audio_era";
  portalLabel: string;
  prompt: string;
  stimulus: GateStimulus;
  fallbackStimulus?: Extract<GateStimulus, { kind: "image" }>;
  fallbackPrompt?: string;
  options: TextAnswerOption[];
}

export interface GeneratedMaze {
  layout: string[];
  start: Position;
  exit: Position;
  gatePositions: Position[];
  gates: Position[];
}

export interface GeneratedRun {
  seed: number;
  seedMeme: MemeCard;
  maze: GeneratedMaze;
  gates: GeneratedGate[];
}

export interface SelectedAnswer {
  gateId: string;
  optionId: string;
  era: Era;
  isCorrect: boolean;
  eraPull?: number;
  axisDeltas?: AxisDeltas;
}

export interface GameState {
  currentScreen: GameScreen;
  currentGateIndex: number;
  completedGates: string[];
  selectedAnswers: SelectedAnswer[];
  scores: {
    rizz: number;
    aura: number;
    sigma: number;
    era: number;
  };
  finalEra: Era | null;
  estimatedAge: number | null;
  audioEnabled: boolean;
  replayUsed: boolean;
  reducedMotion: boolean;
}

export const initialGameState: GameState = {
  currentScreen: "landing",
  currentGateIndex: 0,
  completedGates: [],
  selectedAnswers: [],
  scores: { rizz: 0, aura: 0, sigma: 0, era: 0 },
  finalEra: null,
  estimatedAge: null,
  audioEnabled: true,
  replayUsed: false,
  reducedMotion: false,
};

const eraOrder: Era[] = ["boomer", "millennial", "older-gen-z", "gen-z-core", "gen-alpha"];

const eraPull: Record<Era, -2 | -1 | 0 | 1 | 2> = {
  boomer: -2,
  millennial: -1,
  "older-gen-z": 0,
  "gen-z-core": 1,
  "gen-alpha": 2,
};

const eraLabels: Record<Era, string> = {
  boomer: "Boomer web fossil",
  millennial: "OG internet core",
  "older-gen-z": "Older Gen Z relic",
  "gen-z-core": "Gen Z core",
  "gen-alpha": "Gen Alpha brainrot",
};

function meme(id: string) {
  return `/memes/${id}.webp`;
}

function normalizeEra(value: string): Era {
  if (value === "older_genz") return "older-gen-z";
  if (value === "genz_core") return "gen-z-core";
  if (value === "genalpha") return "gen-alpha";
  return value as Era;
}

const memes: MemeCard[] = (memeDeck as Array<{
  id: string;
  image: string;
  canonical: string;
  era: string;
  axes: AxisDeltas;
  difficulty: 1 | 2 | 3;
}>).map((item) => ({ ...item, era: normalizeEra(item.era) }));

const audioClips: AudioClip[] = (audioDeck as Array<{
  id: string;
  canonical: string;
  era: string;
  audio: string;
}>).map((item) => ({ ...item, era: normalizeEra(item.era) }));

const memeById = Object.fromEntries(memes.map((item) => [item.id, item]));

export const imagePromptSafeMemeIds = [
  "dancing_baby",
  "hampster_dance",
  "star_wars_kid",
  "dial_up_modem",
  "rickroll",
  "leeroy_jenkins",
  "numa_numa",
  "trollface",
  "pepe",
  "harambe",
  "dat_boi",
  "salt_bae",
  "mocking_spongebob",
  "roll_safe",
  "evil_kermit",
  "drake_hotline_bling",
  "we_are_number_one",
  "woman_yelling_cat",
  "big_chungus",
  "baby_yoda",
  "bernie_chair",
  "surgery_grape",
  "among_us",
  "vine_boom",
  "skibidi_toilet",
  "aura_farming",
  "fanum_tax",
  "ohio",
  "mewing",
] as const;

const imagePromptSafeSet = new Set<string>(imagePromptSafeMemeIds);
const imagePromptMemes = memes.filter((item) => imagePromptSafeSet.has(item.id));

const audioToMemeId: Record<string, string> = {
  dial_up_modem: "dial_up_modem",
  youve_got_mail: "dancing_baby",
  lightsaber_whoosh: "star_wars_kid",
  rickroll_intro: "rickroll",
  leeroy_jenkins: "leeroy_jenkins",
  numa_numa: "numa_numa",
  trollface_laugh: "trollface",
  nyan_cat: "nyan_cat",
  doge_such_wow: "doge",
  harambe: "harambe",
  wednesday_my_dudes: "dat_boi",
  we_are_number_one: "we_are_number_one",
  vine_boom: "vine_boom",
  and_i_oop: "woman_yelling_cat",
  ok_boomer: "ok_boomer",
  among_us_kill: "among_us",
  to_be_continued: "to_be_continued",
  skibidi_toilet: "skibidi_toilet",
  what_the_sigma: "what_the_sigma",
  ayo_pizza_here: "pizza_here",
  low_taper_fade: "low_taper_fade",
  six_seven: "six_seven",
  ohio_final_boss: "ohio",
  fanum_tax: "fanum_tax",
  gyatt: "gyatt",
};

const phraseBank: Record<string, { answer: string; distractors: Array<{ text: string; memeId: string }> }> = {
  doge: {
    answer: "such wow",
    distractors: [
      { text: "all your base", memeId: "all_your_base" },
      { text: "never gonna give you up", memeId: "rickroll" },
      { text: "erm what the sigma", memeId: "what_the_sigma" },
    ],
  },
  what_the_sigma: {
    answer: "erm what the sigma",
    distractors: [
      { text: "you've got mail", memeId: "dial_up_modem" },
      { text: "such wow", memeId: "doge" },
      { text: "ayo the pizza here", memeId: "pizza_here" },
    ],
  },
  pizza_here: {
    answer: "ayo the pizza here",
    distractors: [
      { text: "leeroy jenkins", memeId: "leeroy_jenkins" },
      { text: "it's wednesday my dudes", memeId: "dat_boi" },
      { text: "6 7", memeId: "six_seven" },
    ],
  },
  six_seven: {
    answer: "6 7",
    distractors: [
      { text: "chocolate rain", memeId: "numa_numa" },
      { text: "ok boomer", memeId: "ok_boomer" },
      { text: "such wow", memeId: "doge" },
    ],
  },
};

const originBank: Record<string, { answer: string; distractors: Array<{ text: string; memeId: string }> }> = {
  fanum_tax: {
    answer: "Kai Cenat stream orbit",
    distractors: [
      { text: "AOL mailbox", memeId: "dial_up_modem" },
      { text: "rage-comic basement", memeId: "trollface" },
      { text: "Vine graveyard", memeId: "vine_boom" },
    ],
  },
  skibidi_toilet: {
    answer: "surreal YouTube Shorts brainrot",
    distractors: [
      { text: "Newgrounds flash loop", memeId: "all_your_base" },
      { text: "rage-comic forum thread", memeId: "trollface" },
      { text: "Vine compilation", memeId: "vine_boom" },
    ],
  },
  rickroll: {
    answer: "bait link to Rick Astley",
    distractors: [
      { text: "dial-up startup screen", memeId: "dial_up_modem" },
      { text: "Doge caption grammar", memeId: "doge" },
      { text: "Ohio final boss edit", memeId: "ohio" },
    ],
  },
};

export const eraConfig: Record<Era, {
  name: string;
  ageRange: string;
  color: string;
  bgClass: string;
  midpoint: number;
  heroImage: string;
  roast: string;
}> = {
  boomer: {
    name: "Certified Boomer",
    ageRange: "45+",
    color: "var(--warning)",
    bgClass: "from-warning/30 via-warning/10 to-transparent",
    midpoint: 50,
    heroImage: meme("dancing_baby"),
    roast: "You peaked at dial-up. The browser has moved on.",
  },
  millennial: {
    name: "Millennial Coded",
    ageRange: "30-44",
    color: "var(--electric)",
    bgClass: "from-electric/30 via-electric/10 to-transparent",
    midpoint: 37,
    heroImage: meme("rickroll"),
    roast: "You got rickrolled and still clicked the link.",
  },
  "older-gen-z": {
    name: "Elder Zillennial",
    ageRange: "22-30",
    color: "var(--acid)",
    bgClass: "from-acid/30 via-acid/10 to-transparent",
    midpoint: 26,
    heroImage: meme("doge"),
    roast: "Your aura still has Doge compression artifacts.",
  },
  "gen-z-core": {
    name: "Gen Z Core",
    ageRange: "18-25",
    color: "var(--magenta)",
    bgClass: "from-magenta/30 via-magenta/10 to-transparent",
    midpoint: 22,
    heroImage: meme("among_us"),
    roast: "Your timeline said sus and the portal believed it.",
  },
  "gen-alpha": {
    name: "Brainrot Native",
    ageRange: "<=18",
    color: "var(--lavender)",
    bgClass: "from-lavender/30 via-lavender/10 to-transparent",
    midpoint: 15,
    heroImage: meme("skibidi_toilet"),
    roast: "Skibidi Ohio Rizz, Sigma Fanum Tax Mewing Bop.",
  },
};

const titles: Record<Era, string[]> = {
  boomer: ["Boomer With Rizz", "Aura Dial-Up Survivor", "OG Sigma Boomer"],
  millennial: ["Accidental Rizzler", "Millennial Aura Check", "Sigma Dad Energy"],
  "older-gen-z": ["Low-Key Rizz Relic", "Elder Aura Farmer", "Ironic Sigma Survivor"],
  "gen-z-core": ["Certified Rizzler", "Aura Manager", "Sigma Grindset"],
  "gen-alpha": ["Rizz God", "Aura God", "Sigma Overlord"],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scoreToEra(value: number): Era {
  if (value <= -8) return "boomer";
  if (value <= -4) return "millennial";
  if (value <= 1) return "older-gen-z";
  if (value <= 6) return "gen-z-core";
  return "gen-alpha";
}

function deterministicPick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function randomSeed() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] || 1;
  }
  return Math.floor(Math.random() * 0xffffffff) || 1;
}

function createRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function optionFromMeme(item: MemeCard, text: string, isCorrect: boolean, timelineCopy = `${item.canonical} bent the corridor`): TextAnswerOption {
  return {
    id: `${item.id}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    text,
    era: item.era,
    eraPull: eraPull[item.era],
    axisDeltas: item.axes,
    timelineCopy,
    isCorrect,
  };
}

function buildMemeChoiceSet(target: MemeCard, rng: () => number): MemeCard[] {
  const seeded = shuffle(memes.filter((item) => item.id !== target.id), rng);
  const old = seeded.find((item) => item.era === "boomer") ?? seeded[0];
  const newEra = seeded.find((item) => item.era === "gen-alpha") ?? seeded[1];
  return uniqueById([target, old, newEra, ...seeded]).slice(0, 4);
}

function findAudioTargets(): Array<{ clip: AudioClip; meme: MemeCard }> {
  return audioClips
    .map((clip) => ({ clip, meme: memeById[audioToMemeId[clip.id]] }))
    .filter((item): item is { clip: AudioClip; meme: MemeCard } => Boolean(item.meme));
}

function makeImageGate(index: number, target: MemeCard, rng: () => number): GeneratedGate {
  const phrase = phraseBank[target.id];
  const origin = originBank[target.id];
  const mode: GeneratedGate["kind"] = phrase && index % 3 === 1 ? "meme_phrase" : origin && index % 3 === 2 ? "meme_origin" : "meme_name";
  let prompt = "What is this meme?";
  let options: TextAnswerOption[];

  if (mode === "meme_phrase" && phrase) {
    prompt = "The image flash is gone. Which phrase did it point to?";
    options = [
      optionFromMeme(target, phrase.answer, true, `${target.canonical} phrase unlocked`),
      ...phrase.distractors.map((item) => optionFromMeme(memeById[item.memeId] ?? target, item.text, false)),
    ];
  } else if (mode === "meme_origin" && origin) {
    prompt = "The meme is judging you. What reference does it come from?";
    options = [
      optionFromMeme(target, origin.answer, true, `${target.canonical} origin accepted`),
      ...origin.distractors.map((item) => optionFromMeme(memeById[item.memeId] ?? target, item.text, false)),
    ];
  } else {
    options = buildMemeChoiceSet(target, rng).map((item) =>
      optionFromMeme(item, item.canonical, item.id === target.id, item.id === target.id ? "memory rune accepts you" : `${item.canonical} detour unlocked`)
    );
  }

  return {
    id: `gate-${index + 1}`,
    type: "image",
    kind: mode,
    portalLabel: ["Name Gate", "Phrase Fork", "Origin Check"][index % 3],
    prompt,
    stimulus: { kind: "image", imageUrl: target.image, memeId: target.id },
    options: shuffle(options, rng),
  };
}

function makeAudioGate(index: number, target: { clip: AudioClip; meme: MemeCard }, rng: () => number): GeneratedGate {
  const kind: GeneratedGate["kind"] = index % 2 === 0 ? "audio_reference" : "audio_era";
  let prompt = "Play the clip. What meme or reference is it?";
  let options: TextAnswerOption[];
  const fallbackStimulus = imagePromptSafeSet.has(target.meme.id)
    ? { kind: "image" as const, imageUrl: target.meme.image, memeId: target.meme.id }
    : undefined;

  if (kind === "audio_era") {
    prompt = "Play the clip. Which era owns this audio curse?";
    let choices = shuffle(eraOrder, rng).slice(0, 4);
    if (!choices.includes(target.meme.era)) choices = [target.meme.era, ...choices.slice(1)];
    options = shuffle(choices, rng).map((era) => ({
      id: era,
      text: eraLabels[era],
      era,
      eraPull: eraPull[era],
      axisDeltas: era === target.meme.era ? target.meme.axes : { rizz: 1, aura: 2, sigma: eraPull[era] < 0 ? 3 : 1 },
      timelineCopy: era === target.meme.era ? "speaker era synced" : `${eraLabels[era]} detour unlocked`,
      isCorrect: era === target.meme.era,
    }));
  } else {
    options = buildMemeChoiceSet(target.meme, rng).map((item) =>
      optionFromMeme(item, item.canonical, item.id === target.meme.id, item.id === target.meme.id ? "speaker door unlocks" : `${item.canonical} sends you sideways`)
    );
  }

  return {
    id: `gate-${index + 1}`,
    type: "audio",
    kind,
    portalLabel: "Audio Lock",
    prompt,
    stimulus: { kind: "audio", audioUrl: target.clip.audio, clipId: target.clip.id, memeId: target.meme.id },
    fallbackStimulus,
    fallbackPrompt: fallbackStimulus
      ? "Signal cooked. Match the fallback meme instead."
      : "Signal cooked. Choose the matching text from memory.",
    options,
  };
}

function generateGates(seedMeme: MemeCard, rng: () => number): GeneratedGate[] {
  const imageTargets = uniqueById([seedMeme, ...shuffle(imagePromptMemes, rng)]).slice(0, 4);
  const audioTargets = shuffle(findAudioTargets(), rng).slice(0, 3);
  const imageGates = imageTargets.map((target, index) => makeImageGate(index, target, rng));
  const audioGates = audioTargets.map((target, index) => makeAudioGate(index + imageGates.length, target, rng));
  return shuffle([...imageGates, ...audioGates], rng).map((gate, index) => ({ ...gate, id: `gate-${index + 1}` }));
}

function neighbors(position: Position, width: number, height: number): Position[] {
  return [
    { x: position.x + 2, y: position.y },
    { x: position.x - 2, y: position.y },
    { x: position.x, y: position.y + 2 },
    { x: position.x, y: position.y - 2 },
  ].filter((item) => item.x > 0 && item.y > 0 && item.x < width - 1 && item.y < height - 1);
}

function findPath(layout: string[][], start: Position, exit: Position): Position[] {
  const queue = [start];
  const parent = new Map<string, string>();
  const seen = new Set([`${start.x},${start.y}`]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current.x === exit.x && current.y === exit.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { x: current.x + dx, y: current.y + dy };
      const key = `${next.x},${next.y}`;
      if (seen.has(key) || layout[next.y]?.[next.x] === "W") continue;
      parent.set(key, `${current.x},${current.y}`);
      seen.add(key);
      queue.push(next);
    }
  }

  const path: Position[] = [];
  let cursor = `${exit.x},${exit.y}`;
  while (cursor) {
    const [x, y] = cursor.split(",").map(Number);
    path.unshift({ x, y });
    if (cursor === `${start.x},${start.y}`) break;
    cursor = parent.get(cursor) ?? "";
  }
  return path;
}

function farthestReachable(layout: string[][], start: Position): Position {
  const queue = [start];
  const seen = new Set([`${start.x},${start.y}`]);
  let farthest = start;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    farthest = current;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { x: current.x + dx, y: current.y + dy };
      const key = `${next.x},${next.y}`;
      if (seen.has(key) || layout[next.y]?.[next.x] === "W") continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return farthest;
}

function generateMaze(rng: () => number, gateCount = 7): GeneratedMaze {
  const width = 17;
  const height = 9;
  const layout = Array.from({ length: height }, () => Array.from({ length: width }, () => "W"));
  const start = { x: 1, y: 1 };
  const stack = [start];
  const visited = new Set([`${start.x},${start.y}`]);
  layout[start.y][start.x] = "P";

  while (stack.length) {
    const current = stack[stack.length - 1];
    const next = shuffle(neighbors(current, width, height), rng).find((item) => !visited.has(`${item.x},${item.y}`));
    if (!next) {
      stack.pop();
      continue;
    }
    const wall = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 };
    layout[wall.y][wall.x] = "P";
    layout[next.y][next.x] = "P";
    visited.add(`${next.x},${next.y}`);
    stack.push(next);
  }

  const exit = farthestReachable(layout, start);
  const route = findPath(layout, start, exit);
  const candidates = route.slice(1, -1);
  const gatePositions: Position[] = [];
  for (let index = 0; index < gateCount; index += 1) {
    const routeIndex = Math.min(candidates.length - 1, Math.max(0, Math.floor(((index + 1) * candidates.length) / (gateCount + 1))));
    const candidate = candidates[routeIndex];
    if (candidate && !gatePositions.some((gate) => gate.x === candidate.x && gate.y === candidate.y)) gatePositions.push(candidate);
  }
  for (const candidate of candidates) {
    if (gatePositions.length >= gateCount) break;
    if (!gatePositions.some((gate) => gate.x === candidate.x && gate.y === candidate.y)) gatePositions.push(candidate);
  }

  for (const gate of gatePositions) layout[gate.y][gate.x] = "G";
  layout[start.y][start.x] = "S";
  layout[exit.y][exit.x] = "E";

  return {
    layout: layout.map((row) => row.join("")),
    start,
    exit,
    gatePositions: gatePositions.slice(0, gateCount),
    gates: gatePositions.slice(0, gateCount),
  };
}

export function createGameRun(seed = randomSeed()): GeneratedRun {
  const normalizedSeed = seed >>> 0 || 1;
  const rng = createRng(normalizedSeed);
  const seedMeme = pick(imagePromptMemes, rng);
  return {
    seed: normalizedSeed,
    seedMeme,
    maze: generateMaze(rng, 7),
    gates: generateGates(seedMeme, rng),
  };
}

export const memeGates = createGameRun(1).gates;

export function calculateResults(answers: SelectedAnswer[]): {
  scores: { rizz: number; aura: number; sigma: number; era: number };
  finalEra: Era;
  estimatedAge: number;
  title: string;
  roast: string;
} {
  const totals = answers.reduce(
    (acc, answer) => {
      const deltas = answer.axisDeltas ?? { rizz: 0, aura: 0, sigma: 0 };
      const pull = answer.eraPull ?? eraPull[answer.era] ?? 0;
      if (answer.isCorrect) {
        acc.eraPull += pull;
        acc.rizz += deltas.rizz;
        acc.aura += deltas.aura;
        acc.sigma += deltas.sigma;
        acc.correct += 1;
      } else {
        acc.eraPull -= 2;
        acc.rizz -= 1;
        acc.aura -= 1;
        acc.sigma += 1;
        acc.incorrect += 1;
      }
      return acc;
    },
    { eraPull: 0, rizz: 0, aura: 0, sigma: 0, correct: 0, incorrect: 0 }
  );

  const finalEra = scoreToEra(totals.eraPull);
  const answeredCount = Math.max(answers.length, 1);
  const accuracy = totals.correct / answeredCount;
  const missRate = totals.incorrect / answeredCount;
  const scores = {
    rizz: clamp(Math.round(18 + totals.rizz * 8 + accuracy * 18 - missRate * 24), 10, 100),
    aura: clamp(Math.round(18 + totals.aura * 8 + accuracy * 18 - missRate * 22), 10, 100),
    sigma: clamp(Math.round(18 + totals.sigma * 8 + accuracy * 12 - missRate * 12), 10, 100),
    era: clamp(Math.round(((totals.eraPull + 16) / 32) * 90 + 10), 10, 100),
  };
  const chaosLean = Math.round((scores.rizz + scores.aura - scores.sigma) / 55);
  const estimatedAge = clamp(eraConfig[finalEra].midpoint + totals.incorrect * 4 - totals.correct - chaosLean, 12, 60);
  const strongestAxisIndex = scores.rizz >= scores.aura && scores.rizz >= scores.sigma
    ? 0
    : scores.aura >= scores.sigma
      ? 1
      : 2;

  return {
    scores,
    finalEra,
    estimatedAge,
    title: deterministicPick(titles[finalEra], strongestAxisIndex),
    roast: eraConfig[finalEra].roast,
  };
}
