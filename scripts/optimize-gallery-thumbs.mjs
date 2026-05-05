/**
 * optimize-gallery-thumbs.mjs
 *
 * Rewrites <img src="https://pub-b6d85dc4453b487d879f35b1669c3da2.r2.dev/images/FOO.jpg"...>
 * in gallery HTML files to use images.weserv.nl as a free WebP/resize proxy.
 *
 * Lightbox <a href="..."> is left untouched so the full-size image still
 * loads when the user opens the lightbox.
 *
 * The thumb URL form:
 *   https://images.weserv.nl/?url=pub-...r2.dev/images/FOO.jpg&w=600&output=webp&q=78
 *
 * Run from repo root:
 *     node scripts/optimize-gallery-thumbs.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w):\//, "$1:/"),
  ".."
);

const FILES = ["gallery.html", "gallery-2023.html", "index.html"].map((f) =>
  path.join(ROOT, f)
);

const R2_HOST = "pub-b6d85dc4453b487d879f35b1669c3da2.r2.dev";
const PROXY = "https://images.weserv.nl/";

// Match: <img ... src="https://pub-...r2.dev/images/FILE" ...>
//   - We rewrite src only.
//   - We skip URLs that are already proxied (defensive against re-runs).
const IMG_SRC_RE = new RegExp(
  `(<img\\b[^>]*?\\bsrc\\s*=\\s*")(https?://${R2_HOST.replace(/\./g, "\\.")}/images/[^"]+)(")`,
  "gi"
);

function buildProxyUrl(originalUrl, width = 600, quality = 78) {
  const stripped = originalUrl.replace(/^https?:\/\//, "");
  const params = new URLSearchParams({
    url: stripped,
    w: String(width),
    output: "webp",
    q: String(quality),
    we: "", // enlarge if smaller (won't, but harmless)
  });
  return `${PROXY}?${params.toString()}`;
}

async function processFile(file) {
  let src;
  try {
    src = await readFile(file, "utf8");
  } catch (e) {
    console.log(`  skip ${path.basename(file)} (not found)`);
    return;
  }

  let count = 0;
  const updated = src.replace(IMG_SRC_RE, (full, pre, url, post) => {
    if (url.includes("images.weserv.nl")) return full;
    count++;
    return `${pre}${buildProxyUrl(url)}${post}`;
  });

  if (count) {
    await writeFile(file, updated, "utf8");
    console.log(`  ${path.basename(file)}: ${count} thumbnails proxied`);
  } else {
    console.log(`  ${path.basename(file)}: no changes`);
  }
}

async function main() {
  for (const f of FILES) await processFile(f);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
