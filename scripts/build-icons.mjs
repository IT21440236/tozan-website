/**
 * build-icons.mjs
 *
 * One-shot script to:
 *   1. Scan all root-level *.html files for Bootstrap Icons usage
 *      ( <i class="bi bi-FOO ..."></i> )
 *   2. Download each unique icon SVG from the bootstrap-icons CDN
 *   3. Build a single sprite at assets/icons/sprite.svg
 *   4. Rewrite each <i class="bi bi-FOO ..."></i> tag in-place to:
 *        <svg class="bi ...other classes..." aria-hidden="true">
 *          <use href="/assets/icons/sprite.svg#FOO"/>
 *        </svg>
 *   5. Remove the Bootstrap Icons CDN <link> from each HTML file.
 *
 * Run from the repo root:
 *     node scripts/build-icons.mjs
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import https from "node:https";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w):\//, "$1:/"), "..");
const SPRITE_PATH = path.join(ROOT, "assets", "icons", "sprite.svg");
const ICON_CDN = (name) =>
  `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/icons/${name}.svg`;

/* -------- helpers -------- */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

async function listHtmlFiles() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => path.join(ROOT, e.name));
}

/* Match  <i ... class="...bi bi-NAME..." ...></i>  (single-line) */
const I_TAG_RE = /<i\b([^>]*?)class\s*=\s*"([^"]*?\bbi\b[^"]*?)"([^>]*)><\/i>/gi;

function extractClasses(classAttr) {
  return classAttr.split(/\s+/).filter(Boolean);
}

function parseIconName(classes) {
  // Find "bi-XYZ" — the icon name. Skip the bare "bi" marker.
  for (const c of classes) {
    if (c === "bi") continue;
    const m = c.match(/^bi-(.+)$/);
    if (m) return m[1];
  }
  return null;
}

function buildReplacement(beforeAttrs, classes, afterAttrs, iconName) {
  // Drop "bi" and "bi-NAME" from class list, keep other modifiers
  const kept = classes.filter((c) => c !== "bi" && c !== `bi-${iconName}`);
  // Re-add a "bi" marker class so existing CSS targeting `.bi` still applies
  kept.unshift("bi");
  const classAttr = kept.join(" ");
  const otherAttrs = (beforeAttrs + afterAttrs).trim();
  const otherStr = otherAttrs ? " " + otherAttrs : "";
  return `<svg class="${classAttr}" aria-hidden="true" focusable="false"${otherStr}><use href="/assets/icons/sprite.svg#${iconName}"/></svg>`;
}

/* -------- main -------- */
async function main() {
  const files = await listHtmlFiles();
  console.log(`Scanning ${files.length} HTML files...`);

  // Pass 1: collect unique icon names
  const iconsUsed = new Set();
  for (const f of files) {
    const src = await readFile(f, "utf8");
    let m;
    I_TAG_RE.lastIndex = 0;
    while ((m = I_TAG_RE.exec(src)) !== null) {
      const classes = extractClasses(m[2]);
      const name = parseIconName(classes);
      if (name) iconsUsed.add(name);
    }
  }
  console.log(`Found ${iconsUsed.size} unique icons.`);

  // Download each SVG
  const symbols = [];
  let i = 0;
  for (const name of [...iconsUsed].sort()) {
    i++;
    process.stdout.write(`  [${i}/${iconsUsed.size}] ${name}\r`);
    try {
      const svg = await fetchText(ICON_CDN(name));
      // Convert <svg ...>...</svg> into <symbol id="NAME" viewBox="...">...</symbol>
      const viewBoxMatch = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 16 16";
      const inner = svg
        .replace(/<\?xml[^?]*\?>/i, "")
        .replace(/<svg\b[^>]*>/i, "")
        .replace(/<\/svg>\s*$/i, "")
        .trim();
      symbols.push(
        `  <symbol id="${name}" viewBox="${viewBox}">${inner}</symbol>`
      );
    } catch (err) {
      console.warn(`\n  ! failed ${name}: ${err.message}`);
    }
  }
  console.log("");

  // Build sprite
  const sprite = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n${symbols.join("\n")}\n</svg>\n`;
  await mkdir(path.dirname(SPRITE_PATH), { recursive: true });
  await writeFile(SPRITE_PATH, sprite, "utf8");
  console.log(`Wrote ${path.relative(ROOT, SPRITE_PATH)} (${(sprite.length / 1024).toFixed(1)} KB)`);

  // Pass 2: rewrite HTML files
  let totalReplaced = 0;
  for (const f of files) {
    let src = await readFile(f, "utf8");
    let replaced = 0;
    src = src.replace(I_TAG_RE, (full, before, classAttr, after) => {
      const classes = extractClasses(classAttr);
      const name = parseIconName(classes);
      if (!name || !iconsUsed.has(name)) return full;
      replaced++;
      return buildReplacement(before, classes, after, name);
    });

    // Strip the bootstrap-icons CDN <link>
    src = src.replace(
      /\s*<!--[^>]*Bootstrap Icons[^>]*-->\s*<link[^>]*bootstrap-icons[^>]*\/?>/gi,
      ""
    );
    src = src.replace(
      /\s*<link[^>]*bootstrap-icons[^>]*\/?>/gi,
      ""
    );

    await writeFile(f, src, "utf8");
    if (replaced) {
      console.log(`  ${path.basename(f)}: ${replaced} icons rewritten`);
      totalReplaced += replaced;
    }
  }
  console.log(`Total icon tags rewritten: ${totalReplaced}`);
  console.log("Done. Reload the site to verify visuals.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
