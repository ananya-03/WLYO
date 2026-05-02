#!/usr/bin/env node
import { execFile, execFileSync } from "node:child_process";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const registryPath = path.join(root, "data/meme_targets.json");
const outputDir = path.join(root, "public/memes");
const tempDir = path.join(root, ".tmp/assets/memes");
const imgflipCachePath = path.join(root, "data/raw/imgflip/get_memes.json");
const logPath = path.join(root, "data/asset-log/meme-fetch-log.json");
const runtimeDataPath = path.join(root, "src/data/memes.json");
const force = process.argv.includes("--force");
const idsArg = process.argv.find((arg) => arg.startsWith("--ids="));
const onlyIds = idsArg ? new Set(idsArg.slice("--ids=".length).split(",").map((id) => id.trim()).filter(Boolean)) : null;

const eraColors = {
  boomer: ["#ff9f1c", "#151124"],
  millennial: ["#00f0ff", "#08070f"],
  older_genz: ["#39ff14", "#151124"],
  genz_core: ["#ff2bd6", "#08070f"],
  genalpha: ["#f7f0ff", "#ff2bd6"],
};

function hasCommand(command) {
  return Boolean(findCommand(command));
}

function findCommand(command) {
  if (command === "tinyfish" && process.env.TINYFISH_BIN && existsSync(process.env.TINYFISH_BIN)) {
    return process.env.TINYFISH_BIN;
  }
  const known = {
    tinyfish: "/Users/nottanjune/.yarn/bin/tinyfish",
    magick: "/opt/homebrew/bin/magick",
    ffmpeg: "/opt/homebrew/bin/ffmpeg",
  };
  if (known[command] && existsSync(known[command])) return known[command];

  try {
    execFileSync("/bin/sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });
    return command;
  } catch {
    return null;
  }
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function escapeDrawtext(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(":", "\\:")
    .replaceAll("'", "\\'")
    .replaceAll("%", "\\%");
}

function pickTool(name, fallback) {
  if (hasCommand(name)) return name;
  if (fallback && existsSync(fallback)) return fallback;
  return name;
}

async function fetchBuffer(url, accept = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8") {
  if (hasCommand("curl")) {
    const { stdout } = await execFileAsync("curl", [
      "-LfsS",
      "--max-time",
      "120",
      "--retry",
      "2",
      "--retry-delay",
      "1",
      "-A",
      "BRAINROT-MAZE asset fetcher; hackathon prototype",
      "-H",
      `accept: ${accept}`,
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
      "accept": accept,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function loadImgflipTemplates() {
  if (existsSync(imgflipCachePath) && !force) {
    const cached = JSON.parse(await readFile(imgflipCachePath, "utf8"));
    return cached.data?.memes ?? cached.memes ?? [];
  }

  await mkdir(path.dirname(imgflipCachePath), { recursive: true });
  const json = JSON.parse((await fetchBuffer("https://api.imgflip.com/get_memes", "application/json")).toString("utf8"));
  await writeFile(imgflipCachePath, `${JSON.stringify(json, null, 2)}\n`);
  return json.data?.memes ?? [];
}

function findImgflipTemplate(templates, name) {
  const wanted = normalize(name);
  let exact = templates.find((template) => normalize(template.name) === wanted);
  if (exact) return exact;
  exact = templates.find((template) => normalize(template.name).includes(wanted) || wanted.includes(normalize(template.name)));
  if (exact) return exact;
  return null;
}

async function wikimediaSearch(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "5");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const json = JSON.parse((await fetchBuffer(url.toString(), "application/json")).toString("utf8"));
  const pages = Object.values(json.query?.pages ?? {});
  const image = pages
    .flatMap((page) => page.imageinfo?.map((info) => ({ ...info, title: page.title })) ?? [])
    .find((info) => info.url && info.mime?.startsWith("image/"));

  if (!image) throw new Error(`No Wikimedia image for "${query}"`);
  return {
    url: image.url,
    title: image.title,
    source: "wikimedia",
  };
}

function collectUrlsFromJson(value, urls = []) {
  if (!value) return urls;
  if (typeof value === "string") {
    if (/^https?:\/\/.+\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(value)) urls.push(value);
    return urls;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUrlsFromJson(item, urls);
    return urls;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) collectUrlsFromJson(item, urls);
  }
  return urls;
}

function scoreImageUrl(url, query) {
  let score = 0;
  const lower = url.toLowerCase();
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);

  if (/\.(jpe?g|png|webp)(\?|$)/i.test(url)) score += 10;
  if (lower.includes("kym-cdn.com/entries/icons/original")) score += 40;
  if (lower.includes("kym-cdn.com/entries/icons/newsfeed")) score += 34;
  if (lower.includes("kym-cdn.com/entries/icons/mobile")) score += 28;
  if (lower.includes("i.imgflip.com")) score += 24;
  if (lower.includes("wikimedia.org")) score += 18;
  if (lower.includes("ytimg.com")) score += 12;
  if (lower.includes("original")) score += 8;
  if (lower.includes("newsfeed")) score += 6;

  for (const token of queryTokens) {
    if (token.length > 2 && lower.includes(token)) score += 4;
  }

  if (lower.endsWith(".svg") || lower.includes(".svg?")) score -= 80;
  if (lower.includes("blank-")) score -= 80;
  if (lower.includes("/assets/")) score -= 50;
  if (lower.includes("/profiles/icons/")) score -= 45;
  if (lower.includes("/tiny/")) score -= 30;
  if (lower.includes("logo")) score -= 25;
  if (lower.includes("avatar")) score -= 25;

  return score;
}

function pickImageUrl(urls, query) {
  return [...new Set(urls)]
    .filter((url) => /^https?:\/\//.test(url))
    .filter((url) => /\.(jpe?g|png|webp)(\?|$)/i.test(url))
    .map((url) => ({ url, score: scoreImageUrl(url, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.url;
}

function extractAgentImage(result) {
  if (!result) return null;
  if (typeof result === "string") {
    const match = result.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return extractAgentImage(JSON.parse(match[0]));
    } catch {
      return null;
    }
  }
  if (typeof result !== "object") return null;
  return result.image_url ?? result.imageUrl ?? result.url ?? null;
}

function defaultKymUrl(query) {
  const clean = query
    .toLowerCase()
    .replace(/\bmeme\b/g, " ")
    .replace(/\bimage\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const overrides = {
    "hampster dance": "hampster-dance",
    "trollface": "trollface",
    "bad luck brian": "bad-luck-brian",
    "philosoraptor": "philosoraptor",
    "dat boi": "dat-boi",
    "vine boom": "vine-boom-sound-effect",
    "to be continued": "to-be-continued",
    "aura farming": "aura-farming",
    "fanum tax": "fanum-tax",
    "only in ohio": "only-in-ohio",
    "ohio": "only-in-ohio",
    "mewing": "mewing",
    "low taper fade": "low-taper-fade",
    "6 7": "6-7",
    "six seven": "six-seven",
    "ayo the pizza here": "ayo-the-pizza-here",
  };
  const slug = overrides[clean] ?? clean.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://knowyourmeme.com/memes/${slug}`;
}

async function tinyfishAgentImage(query, startUrl) {
  const tinyfish = findCommand("tinyfish");
  if (!tinyfish) throw new Error("tinyfish CLI not found");

  const url = startUrl || defaultKymUrl(query);
  const goal = [
    `Find the best representative meme image for "${query}".`,
    "Return only JSON with keys image_url, title, confidence, and reason.",
    "Prefer a direct jpg/png/webp image URL from i.kym-cdn.com, i.imgflip.com, or Wikimedia.",
    "Avoid svg icons, blank placeholders, profile avatars, logos, and unrelated sidebar images.",
    "If the starting page is not the right entry, use site search or navigation to find the closest Know Your Meme entry first.",
  ].join(" ");

  const { stdout } = await execFileAsync(tinyfish, ["agent", "run", goal, "--url", url, "--sync"], {
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 16,
  });
  const response = JSON.parse(stdout);
  const imageUrl = extractAgentImage(response.result);
  if (!imageUrl) throw new Error(`TinyFish agent returned no image_url for "${query}"`);
  return {
    url: imageUrl,
    title: response.result?.title ?? query,
    source: "tinyfish_agent",
    runId: response.run_id,
    runUrl: response.run_url,
    reason: response.result?.reason,
  };
}

async function tinyfishSearch(query) {
  const tinyfish = findCommand("tinyfish");
  if (!tinyfish) throw new Error("tinyfish CLI not found");

  if (process.env.TINYFISH_AGENT === "1") {
    return tinyfishAgentImage(query);
  }

  const { stdout } = await execFileAsync(tinyfish, ["search", "query", query], {
    timeout: 45000,
    maxBuffer: 1024 * 1024 * 8,
  });
  const json = JSON.parse(stdout);
  let imageUrl = pickImageUrl(collectUrlsFromJson(json), query);

  if (!imageUrl) {
    const pageUrls = (json.results ?? []).map((result) => result.url).filter(Boolean).slice(0, 3);
    for (const pageUrl of pageUrls) {
      try {
        const fetched = await execFileAsync(tinyfish, [
          "fetch",
          "content",
          "get",
          "--format",
          "json",
          "--image-links",
          pageUrl,
        ], {
          timeout: 60000,
          maxBuffer: 1024 * 1024 * 16,
        });
        imageUrl = pickImageUrl(collectUrlsFromJson(JSON.parse(fetched.stdout)), query);
        if (imageUrl) break;
      } catch {
        // Try the next search result.
      }
    }
  }

  if (!imageUrl) {
    return tinyfishAgentImage(query);
  }

  if (!imageUrl) throw new Error(`No image URL in TinyFish result for "${query}"`);
  return {
    url: imageUrl,
    title: query,
    source: "tinyfish",
  };
}

async function convertImage(inputPath, outputPath) {
  const magick = pickTool("magick", "/opt/homebrew/bin/magick");
  if (hasCommand("magick") || existsSync(magick)) {
    await execFileAsync(magick, [inputPath, "-auto-orient", "-resize", "800x800>", "-quality", "82", outputPath], {
      maxBuffer: 1024 * 1024 * 8,
    });
    return;
  }

  const ffmpeg = pickTool("ffmpeg", "/opt/homebrew/bin/ffmpeg");
  await execFileAsync(ffmpeg, [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    inputPath,
    "-vf",
    "scale='min(800,iw)':-2",
    outputPath,
  ]);
}

async function generateCard(meme, outputPath) {
  const magick = pickTool("magick", "/opt/homebrew/bin/magick");
  const [accent, base] = eraColors[meme.era] ?? ["#00f0ff", "#08070f"];
  const title = escapeDrawtext(meme.canonical.toUpperCase());
  const era = escapeDrawtext(meme.era.replace("_", " ").toUpperCase());
  const font = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";

  if (hasCommand("magick") || existsSync(magick)) {
    await execFileAsync(magick, [
      "-size",
      "800x800",
      `gradient:${base}-${accent}`,
      "-fill",
      "rgba(8,7,15,0.35)",
      "-draw",
      "rectangle 44,44 756,756",
      "-font",
      font,
      "-gravity",
      "center",
      "-fill",
      "#f7f0ff",
      "-pointsize",
      "58",
      "-interline-spacing",
      "10",
      "-annotate",
      "0",
      meme.canonical,
      "-gravity",
      "south",
      "-pointsize",
      "28",
      "-fill",
      "#08070f",
      "-undercolor",
      accent,
      "-annotate",
      "+0+48",
      era,
      "-quality",
      "82",
      outputPath,
    ]);
    return;
  }

  const ffmpeg = pickTool("ffmpeg", "/opt/homebrew/bin/ffmpeg");
  await execFileAsync(ffmpeg, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${base}:s=800x800`,
    "-vf",
    `drawbox=x=48:y=48:w=704:h=704:color=${accent}@0.85:t=12,drawtext=fontfile='${font}':text='${title}':fontcolor=white:fontsize=54:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=fontfile='${font}':text='${era}':fontcolor=${base}:fontsize=28:x=(w-text_w)/2:y=h-90:box=1:boxcolor=${accent}@1:boxborderw=16`,
    "-frames:v",
    "1",
    outputPath,
  ]);
}

async function trySource(meme, source, templates) {
  const tempInput = path.join(tempDir, `${meme.id}-${Date.now()}.input`);
  const tempOutput = path.join(tempDir, `${meme.id}-${Date.now()}.webp`);

  if (source.type === "imgflip_template") {
    const template = findImgflipTemplate(templates, source.name);
    if (!template) throw new Error(`No Imgflip template named "${source.name}"`);
    await writeFile(tempInput, await fetchBuffer(template.url));
    await convertImage(tempInput, tempOutput);
    return {
      tempOutput,
      winner: { source: "imgflip", title: template.name, url: template.url, id: template.id },
    };
  }

  if (source.type === "direct_image") {
    await writeFile(tempInput, await fetchBuffer(source.url));
    await convertImage(tempInput, tempOutput);
    return {
      tempOutput,
      winner: { source: "direct", title: source.title ?? meme.canonical, url: source.url },
    };
  }

  if (source.type === "wikimedia_search") {
    const image = await wikimediaSearch(source.query);
    await writeFile(tempInput, await fetchBuffer(image.url));
    await convertImage(tempInput, tempOutput);
    return {
      tempOutput,
      winner: image,
    };
  }

  if (source.type === "tinyfish_search") {
    const image = await tinyfishSearch(source.query);
    await writeFile(tempInput, await fetchBuffer(image.url));
    await convertImage(tempInput, tempOutput);
    return {
      tempOutput,
      winner: image,
    };
  }

  if (source.type === "tinyfish_agent") {
    const image = await tinyfishAgentImage(source.query ?? meme.canonical, source.url);
    await writeFile(tempInput, await fetchBuffer(image.url));
    await convertImage(tempInput, tempOutput);
    return {
      tempOutput,
      winner: image,
    };
  }

  if (source.type === "generated_card") {
    await generateCard(meme, tempOutput);
    return {
      tempOutput,
      winner: { source: "generated_card", title: meme.canonical },
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
  const templates = await loadImgflipTemplates();
  const previousLog = await readPreviousLog();
  const log = {
    generatedAt: new Date().toISOString(),
    memes: [],
  };
  const runtime = [];

  for (const meme of registry.memes) {
    const outputPath = path.join(outputDir, `${meme.id}.webp`);
    const shouldForce = force && (!onlyIds || onlyIds.has(meme.id));
    if (!shouldForce && existsSync(outputPath)) {
      const info = await stat(outputPath);
      const previous = previousLog.get(meme.id);
      log.memes.push({
        id: meme.id,
        status: "skipped_existing",
        output: `/memes/${meme.id}.webp`,
        bytes: info.size,
        winner: previous?.winner,
        failures: previous?.failures ?? [],
      });
      runtime.push({
        id: meme.id,
        image: `/memes/${meme.id}.webp`,
        canonical: meme.canonical,
        era: meme.era,
        axes: meme.axes,
        difficulty: meme.difficulty,
      });
      continue;
    }

    const failures = [];
    let completed = false;

    for (const source of meme.sources) {
      try {
        const { tempOutput, winner } = await trySource(meme, source, templates);
        await rename(tempOutput, outputPath);
        const info = await stat(outputPath);
        log.memes.push({
          id: meme.id,
          status: "fetched",
          output: `/memes/${meme.id}.webp`,
          bytes: info.size,
          winner,
          failures,
        });
        runtime.push({
          id: meme.id,
          image: `/memes/${meme.id}.webp`,
          canonical: meme.canonical,
          era: meme.era,
          axes: meme.axes,
          difficulty: meme.difficulty,
        });
        console.log(`meme ok ${meme.id} <- ${winner.source}`);
        completed = true;
        break;
      } catch (error) {
        failures.push({ source, error: error.message });
      }
    }

    if (!completed) {
      log.memes.push({
        id: meme.id,
        status: "failed",
        output: null,
        failures,
      });
      console.warn(`meme failed ${meme.id}`);
    }
  }

  await writeFile(logPath, `${JSON.stringify(log, null, 2)}\n`);
  await writeFile(runtimeDataPath, `${JSON.stringify(runtime, null, 2)}\n`);
  await rm(tempDir, { recursive: true, force: true });
}

async function readPreviousLog() {
  try {
    const previous = JSON.parse(await readFile(logPath, "utf8"));
    return new Map((previous.memes ?? []).map((item) => [item.id, item]));
  } catch {
    return new Map();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
