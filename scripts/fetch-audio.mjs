#!/usr/bin/env node
import { execFile, execFileSync } from "node:child_process";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const registryPath = path.join(root, "data/audio_sources.json");
const outputDir = path.join(root, "public/audio");
const tempDir = path.join(root, ".tmp/assets/audio");
const logPath = path.join(root, "data/asset-log/audio-fetch-log.json");
const runtimeDataPath = path.join(root, "src/data/audio.json");
const force = process.argv.includes("--force");

function hasCommand(command) {
  try {
    execFileSync("/bin/sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function tokens(value) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean),
  );
}

function scoreCandidate(candidate, source, clip) {
  const title = candidate.title.toLowerCase();
  const wanted = `${source.preferTitle ?? ""} ${source.query ?? ""} ${clip.canonical ?? ""}`.trim();
  const wantedTokens = tokens(wanted);
  const titleTokens = tokens(title);
  let score = 0;

  for (const token of wantedTokens) {
    if (titleTokens.has(token)) score += 2;
    if (title.includes(token)) score += 1;
  }

  if (source.preferTitle && title.includes(source.preferTitle.toLowerCase())) score += 8;
  if (source.query && title.includes(source.query.toLowerCase())) score += 5;
  return score;
}

async function fetchBuffer(url) {
  if (hasCommand("curl")) {
    const { stdout } = await execFileAsync("curl", [
      "-LfsS",
      "--max-time",
      "45",
      "-A",
      "BRAINROT-MAZE asset fetcher; hackathon prototype",
      "-H",
      "accept: */*",
      url,
    ], {
      encoding: "buffer",
      maxBuffer: 1024 * 1024 * 64,
    });
    return stdout;
  }

  const response = await fetch(url, {
    headers: {
      "user-agent": "BRAINROT-MAZE asset fetcher; hackathon prototype",
      "accept": "*/*",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function scrapeMyInstants(source, clip) {
  const searchUrl = `https://www.myinstants.com/en/search/?name=${encodeURIComponent(source.query)}`;
  const html = (await fetchBuffer(searchUrl)).toString("utf8");
  const candidates = [];
  const pattern = /<button class="small-button" onclick="play\('([^']+)'[^)]*\)" title="Play ([^"]+) sound"[\s\S]*?<a href="([^"]+)" class="instant-link[^"]*">([^<]+)<\/a>/g;
  let match;

  while ((match = pattern.exec(html))) {
    const mediaPath = decodeHtml(match[1]);
    const buttonTitle = decodeHtml(match[2]);
    const pagePath = decodeHtml(match[3]);
    const linkTitle = decodeHtml(match[4]);
    const title = linkTitle || buttonTitle;
    candidates.push({
      title,
      url: new URL(mediaPath, "https://www.myinstants.com").toString(),
      pageUrl: new URL(pagePath, "https://www.myinstants.com").toString(),
    });
  }

  if (!candidates.length) {
    throw new Error(`No MyInstants candidates for "${source.query}"`);
  }

  candidates.sort((a, b) => scoreCandidate(b, source, clip) - scoreCandidate(a, source, clip));
  return {
    ...candidates[0],
    source: "myinstants",
    searchUrl,
  };
}

async function normalizeAudio(inputPath, outputPath, maxDurationSeconds) {
  const ffmpeg = hasCommand("ffmpeg") ? "ffmpeg" : "/opt/homebrew/bin/ffmpeg";
  if (!hasCommand("ffmpeg") && !existsSync(ffmpeg)) {
    await rename(inputPath, outputPath);
    return;
  }

  const args = [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    inputPath,
    "-t",
    String(maxDurationSeconds ?? 3),
    "-vn",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-b:a",
    "96k",
    "-af",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
    outputPath,
  ];
  await execFileAsync(ffmpeg, args, { maxBuffer: 1024 * 1024 * 8 });
}

async function trySource(clip, source) {
  const tempInput = path.join(tempDir, `${clip.id}-${Date.now()}.input`);
  const tempOutput = path.join(tempDir, `${clip.id}-${Date.now()}.mp3`);

  if (source.type === "myinstants_search") {
    const candidate = await scrapeMyInstants(source, clip);
    await writeFile(tempInput, await fetchBuffer(candidate.url));
    await normalizeAudio(tempInput, tempOutput, clip.maxDurationSeconds);
    return { tempOutput, winner: candidate };
  }

  if (source.type === "direct") {
    await writeFile(tempInput, await fetchBuffer(source.url));
    await normalizeAudio(tempInput, tempOutput, clip.maxDurationSeconds);
    return {
      tempOutput,
      winner: { source: "direct", url: source.url, title: source.title ?? clip.canonical },
    };
  }

  if (source.type === "yt_dlp") {
    if (!hasCommand("yt-dlp")) throw new Error("yt-dlp not found");
    const ytInput = path.join(tempDir, `${clip.id}-${Date.now()}.download.%(ext)s`);
    await execFileAsync("yt-dlp", ["-x", "--audio-format", "mp3", "-o", ytInput, source.url], {
      maxBuffer: 1024 * 1024 * 16,
    });
    const downloaded = ytInput.replace("%(ext)s", "mp3");
    const clipped = path.join(tempDir, `${clip.id}-${Date.now()}.clip.mp3`);
    const ffmpeg = hasCommand("ffmpeg") ? "ffmpeg" : "/opt/homebrew/bin/ffmpeg";
    await execFileAsync(ffmpeg, [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      String(source.start ?? 0),
      "-t",
      String(source.duration ?? clip.maxDurationSeconds ?? 3),
      "-i",
      downloaded,
      "-af",
      "loudnorm=I=-16:TP=-1.5:LRA=11",
      clipped,
    ]);
    return {
      tempOutput: clipped,
      winner: { source: "yt-dlp", url: source.url, title: source.title ?? clip.canonical },
    };
  }

  if (source.type === "tts_say") {
    if (!hasCommand("say")) throw new Error("macOS say command not found");
    const aiffPath = path.join(tempDir, `${clip.id}-${Date.now()}.aiff`);
    const sayArgs = ["-o", aiffPath];
    if (source.voice) sayArgs.push("-v", source.voice);
    sayArgs.push(source.text);
    await execFileAsync("say", sayArgs, { maxBuffer: 1024 * 1024 * 4 });
    await normalizeAudio(aiffPath, tempOutput, clip.maxDurationSeconds);
    return {
      tempOutput,
      winner: { source: "tts_say", text: source.text, title: clip.canonical },
    };
  }

  throw new Error(`Unsupported source type ${source.type}`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await mkdir(tempDir, { recursive: true });
  await mkdir(path.dirname(logPath), { recursive: true });
  await mkdir(path.dirname(runtimeDataPath), { recursive: true });

  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const previousLog = await readPreviousLog();
  const log = {
    generatedAt: new Date().toISOString(),
    clips: [],
  };
  const runtime = [];

  for (const clip of registry.clips) {
    const outputPath = path.join(outputDir, `${clip.id}.mp3`);

    if (!force && existsSync(outputPath)) {
      const info = await stat(outputPath);
      const previous = previousLog.get(clip.id);
      log.clips.push({
        id: clip.id,
        status: "skipped_existing",
        output: `/audio/${clip.id}.mp3`,
        bytes: info.size,
        winner: previous?.winner,
        failures: previous?.failures ?? [],
      });
      runtime.push({
        id: clip.id,
        canonical: clip.canonical,
        era: clip.era,
        audio: `/audio/${clip.id}.mp3`,
      });
      continue;
    }

    const failures = [];
    let completed = false;

    for (const source of clip.sources) {
      try {
        const { tempOutput, winner } = await trySource(clip, source);
        await rename(tempOutput, outputPath);
        const info = await stat(outputPath);
        log.clips.push({
          id: clip.id,
          status: "fetched",
          output: `/audio/${clip.id}.mp3`,
          bytes: info.size,
          winner,
          failures,
        });
        runtime.push({
          id: clip.id,
          canonical: clip.canonical,
          era: clip.era,
          audio: `/audio/${clip.id}.mp3`,
        });
        console.log(`audio ok ${clip.id} <- ${winner.source}`);
        completed = true;
        break;
      } catch (error) {
        failures.push({ source, error: error.message });
      }
    }

    if (!completed) {
      log.clips.push({
        id: clip.id,
        status: "failed",
        output: null,
        failures,
      });
      console.warn(`audio failed ${clip.id}`);
    }
  }

  await writeFile(logPath, `${JSON.stringify(log, null, 2)}\n`);
  await writeFile(runtimeDataPath, `${JSON.stringify(runtime, null, 2)}\n`);
  await rm(tempDir, { recursive: true, force: true });
}

async function readPreviousLog() {
  try {
    const previous = JSON.parse(await readFile(logPath, "utf8"));
    return new Map((previous.clips ?? []).map((item) => [item.id, item]));
  } catch {
    return new Map();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
