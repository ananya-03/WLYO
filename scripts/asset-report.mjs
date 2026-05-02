#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function readJson(file) {
  try {
    return JSON.parse(await readFile(path.join(root, file), "utf8"));
  } catch {
    return null;
  }
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

const memes = await readJson("src/data/memes.json") ?? [];
const audio = await readJson("src/data/audio.json") ?? [];
const memeLog = await readJson("data/asset-log/meme-fetch-log.json");
const audioLog = await readJson("data/asset-log/audio-fetch-log.json");

console.log("BRAINROT MAZE asset report");
console.log("");
console.log(`memes: ${memes.length}`);
console.log(countBy(memes, (item) => item.era));
console.log("");
console.log(`audio: ${audio.length}`);
console.log(countBy(audio, (item) => item.era));

if (memeLog) {
  console.log("");
  console.log("meme source winners:");
  console.log(countBy(memeLog.memes ?? [], (item) => item.winner?.source ?? item.status));
}

if (audioLog) {
  console.log("");
  console.log("audio source winners:");
  console.log(countBy(audioLog.clips ?? [], (item) => item.winner?.source ?? item.status));
}
