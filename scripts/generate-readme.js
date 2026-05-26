// Regenerates README.md from the .js files in the repo root.
//
// For each script: ask Claude for a description + usage notes (cached on
// content hash so unchanged scripts cost nothing), minify into a bookmarklet,
// emit a uniform entry. The repo's own header/intro above the AUTO-GENERATED
// start sentinel is preserved verbatim.

import OpenAI from "openai";
import { minify } from "terser";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// ---- Config -----------------------------------------------------------------

const REPO        = process.env.GITHUB_REPOSITORY ?? "CobblestoneLearning/Chrome-Scripts";
const BRANCH      = process.env.GITHUB_REF_NAME   ?? "main";
const CACHE_PATH  = ".github/cache/script-descriptions.json";
const README_PATH = "README.md";

const SENTINEL_START = "<!-- AUTO-GENERATED:START — do not edit below this line -->";
const SENTINEL_END   = "<!-- AUTO-GENERATED:END -->";

// Small per-script delay so a repo of 50+ scripts doesn't bunch up against the
// per-minute rate limit on a cold cache run. Cheap insurance.
const REQUEST_DELAY_MS = 250;

// ---- OpenAI client ----------------------------------------------------------

const client = new OpenAI(); // reads OPENAI_API_KEY
// gpt-4.1-nano: 1M context, ~$0.10/1M input tokens. Cheaper than gpt-4o-mini
// (which caps at 128K context and chokes on scripts above ~300KB). Override
// via the OPENAI_MODEL repo variable if you want a beefier/cheaper model.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-nano";

const SYSTEM_PROMPT = `You document browser bookmarklets and userscripts for a public README.

For each script you receive, produce:
1. "description": one tight paragraph (1–3 sentences) explaining what the script does and why someone would run it. Plain English, present tense, no marketing fluff. Don't restate the filename.
2. "usage": 2–4 short bullets covering how to invoke it, what page/context it expects, and any caveats (permissions, prompts, side effects). Skip generic bookmarklet install instructions — those are documented separately.

Be concrete. If the script targets a specific site, name it. If it mutates the DOM, say so. If it prompts the user, mention what for.`;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    description: { type: "string" },
    usage:       { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
  },
  required: ["description", "usage"],
  additionalProperties: false,
};

// ---- Helpers ----------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadCache() {
  try {
    return JSON.parse(await fs.readFile(CACHE_PATH, "utf-8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    return {};
  }
}

async function saveCache(cache) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
}

async function listScripts() {
  const entries = await fs.readdir(".", { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".js") && e.name !== "README.md")
    .map((e) => e.name)
    .sort();
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function describeScript(filename, source) {
  // OpenAI chat.completions with structured-output. The strict schema makes the
  // model return JSON that conforms to OUTPUT_SCHEMA — no parsing-of-prose
  // brittleness. `strict: true` enforces additionalProperties:false and required.
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: `Filename: ${filename}\n\n\`\`\`javascript\n${source}\n\`\`\`` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "script_doc",
        strict: true,
        schema: OUTPUT_SCHEMA,
      },
    },
    max_tokens: 1024,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error(`No content in response for ${filename}`);
  return JSON.parse(content);
}

// Anything bigger than this gets a loader bookmarklet instead of an inline one.
// Rationale: ~50KB minified turns into ~150KB URL-encoded — past the safe length
// for most browsers' bookmark UIs (Firefox truncates around there; sync paths
// often choke earlier). The loader is a tiny stub that script-tags the file
// from jsDelivr — always works, always small.
const INLINE_BOOKMARKLET_MAX_BYTES = 50 * 1024;

async function buildBookmarklet(source, jsDelivrUrl_) {
  // Wrap in an IIFE so top-level `let`/`const` and `return` are legal, then
  // minify aggressively. terser handles comments, semicolon insertion, and
  // string escaping correctly — a regex-based strip would not.
  //
  // `ecma: 2020` is critical: without it terser targets ES5 and silently
  // corrupts modern syntax (?., ??, optional catch, etc.) on output.
  const wrapped = `(function(){\n${source}\n})();`;
  const result = await minify(wrapped, {
    ecma: 2020,
    compress: { ecma: 2020 },
    mangle: true,
    format: { comments: false, ecma: 2020 },
  });
  if (!result.code) throw new Error("terser returned empty output");

  if (Buffer.byteLength(result.code, "utf8") > INLINE_BOOKMARKLET_MAX_BYTES) {
    // Loader: a tiny stub that fetches the live script from jsDelivr. The
    // appended `?t=` cache-buster reads jsDelivr's purge-on-tag behaviour — for
    // an `@main` URL the CDN already serves the latest commit, so we just
    // append a stable revision marker (date string) to bust any HTTP cache.
    const loader = `(function(){var s=document.createElement('script');s.src=${JSON.stringify(jsDelivrUrl_)};s.crossOrigin='anonymous';document.head.appendChild(s);})();`;
    return { url: `javascript:${encodeURIComponent(loader)}`, kind: "loader" };
  }
  return { url: `javascript:${encodeURIComponent(result.code)}`, kind: "inline" };
}

function jsDelivrUrl(filename) {
  return `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/${filename}`;
}

function renderEntry({ name, description, usage, bookmarklet, jsdelivr }) {
  const bullets = usage.map((u) => `- ${u}`).join("\n");
  const isLoader = bookmarklet.kind === "loader";
  const bmHeader = isLoader
    ? `**Bookmarklet** (loader — fetches the live script from jsDelivr on click; use this if you want updates automatically):`
    : `**Bookmarklet** — create a new bookmark and paste this as the URL, or drag the snippet into your bookmarks bar:`;
  return [
    `### \`${name}\``,
    "",
    description,
    "",
    `**Usage**`,
    "",
    bullets,
    "",
    `**jsDelivr URL** (paste into DevTools Console, or load via the bookmarklet below):`,
    "",
    "```",
    jsdelivr,
    "```",
    "",
    bmHeader,
    "",
    "```",
    bookmarklet.url,
    "```",
  ].join("\n");
}

function renderAutoSection(entries) {
  if (entries.length === 0) {
    return "## Scripts\n\n_No scripts found in the repo root yet._\n";
  }
  const body = entries.map(renderEntry).join("\n\n---\n\n");
  return `## Scripts\n\n${body}\n`;
}

async function readReadme() {
  try {
    return await fs.readFile(README_PATH, "utf-8");
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    // Scaffold a sensible default header on first run.
    return [
      "# Chrome-Scripts",
      "",
      "A collection of browser bookmarklets and userscripts maintained by Cobblestone Learning.",
      "",
      "The script catalog below is regenerated automatically by GitHub Actions on every push to `main`. Everything above the `AUTO-GENERATED:START` marker is hand-maintained and safe to edit.",
      "",
      SENTINEL_START,
      SENTINEL_END,
      "",
    ].join("\n");
  }
}

function spliceAutoSection(readme, autoSection) {
  const generatedBlock =
    `${SENTINEL_START}\n<!-- Last generated: ${new Date().toISOString()} -->\n\n${autoSection}\n${SENTINEL_END}`;

  const startIdx = readme.indexOf(SENTINEL_START);
  const endIdx   = readme.indexOf(SENTINEL_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = readme.slice(0, startIdx);
    const after  = readme.slice(endIdx + SENTINEL_END.length);
    return `${before}${generatedBlock}${after}`;
  }

  // Sentinels missing — append rather than guess where to inject.
  return `${readme.trimEnd()}\n\n${generatedBlock}\n`;
}

// ---- Main -------------------------------------------------------------------

async function main() {
  const scripts = await listScripts();
  console.log(`Found ${scripts.length} script(s) in repo root.`);

  const cache = await loadCache();
  const entries = [];
  let generated = 0;
  let cached    = 0;
  const failures = [];

  for (const name of scripts) {
    const source = await fs.readFile(name, "utf-8");
    const hash = sha256(source);

    let described;
    if (cache[name]?.hash === hash) {
      described = cache[name];
      cached++;
      console.log(`  [cache] ${name}`);
    } else {
      try {
        console.log(`  [generate] ${name}`);
        described = await describeScript(name, source);
        described.hash = hash;
        cache[name] = described;
        generated++;
        await sleep(REQUEST_DELAY_MS);
      } catch (err) {
        // One bad script shouldn't tank the whole README. Record the failure,
        // skip the entry, surface a non-zero exit at the end.
        console.error(`  [fail] ${name}: ${err.message}`);
        failures.push({ name, error: err.message });
        continue;
      }
    }

    const jsdelivr = jsDelivrUrl(name);
    let bookmarklet;
    try {
      bookmarklet = await buildBookmarklet(source, jsdelivr);
    } catch (err) {
      console.error(`  [fail] ${name}: terser ${err.message}`);
      failures.push({ name, error: `terser: ${err.message}` });
      continue;
    }

    entries.push({
      name,
      description: described.description,
      usage:       described.usage,
      bookmarklet,
      jsdelivr,
    });
  }

  // Drop cache entries for scripts that no longer exist, so the file doesn't
  // accumulate stale state forever.
  const liveNames = new Set(scripts);
  for (const key of Object.keys(cache)) {
    if (!liveNames.has(key)) delete cache[key];
  }

  const readme = await readReadme();
  const next   = spliceAutoSection(readme, renderAutoSection(entries));
  await fs.writeFile(README_PATH, next);
  await saveCache(cache);

  console.log(`\nDone. ${entries.length} entries written (${generated} generated, ${cached} from cache).`);
  if (failures.length) {
    console.error(`\n${failures.length} script(s) failed:`);
    for (const f of failures) console.error(`  - ${f.name}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
