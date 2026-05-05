/**
 * fix-thumb-urls.mjs
 *
 * Fix two problems left by optimize-gallery-thumbs.mjs:
 *   1. Double-encoded %20 -> %2520  (filenames with spaces are broken)
 *   2. Hero carousel <img> got proxied; we want those to load full-res direct
 *      from R2 so the LCP isn't gated on the proxy.
 *
 * Strategy:
 *   - For every <img src="https://images.weserv.nl/?url=ENCODED..."> we
 *     decode the url= value once and rebuild the proxy URL with manual
 *     percent-encoding (only encoding what's strictly required).
 *   - For <img> tags whose class includes "hero-slide-image" we revert the
 *     src back to the original `https://<R2>/...` URL.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w):\//, "$1:/"),
  ".."
);
const FILES = ["index.html", "gallery.html", "gallery-2023.html"].map((f) =>
  path.join(ROOT, f)
);

// Match <img ... src="https://images.weserv.nl/?url=...&...">
//   - Capture the entire src URL so we can rebuild it.
//   - Capture surrounding tag so we can detect hero-slide-image class.
const IMG_TAG_RE =
  /<img\b([^>]*?)\bsrc\s*=\s*"(https:\/\/images\.weserv\.nl\/\?[^"]+)"([^>]*)>/gi;

function getProxyUrlParam(proxyUrl) {
  // proxyUrl: https://images.weserv.nl/?url=ENCODED&w=...&...
  const q = proxyUrl.split("?")[1] || "";
  for (const part of q.split("&")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const k = part.slice(0, eq);
    if (k === "url") return part.slice(eq + 1);
  }
  return null;
}

function rebuildProxyUrl(originalUrl, width = 600, quality = 78) {
  // Encode only what's required so existing %20 etc. survive.
  // The url= value can contain literal characters except & " < > # ?
  // We re-encode reserved chars but leave existing percent-escapes alone.
  const safe = originalUrl
    .replace(/&/g, "%26")
    .replace(/#/g, "%23")
    .replace(/\?/g, "%3F")
    .replace(/=/g, "%3D");
  return `https://images.weserv.nl/?url=${safe}&w=${width}&output=webp&q=${quality}`;
}

function isHeroImg(beforeAttrs, afterAttrs) {
  const all = `${beforeAttrs} ${afterAttrs}`;
  const m = all.match(/class\s*=\s*"([^"]*)"/i);
  return m ? /\bhero-slide-image\b/.test(m[1]) : false;
}

async function processFile(file) {
  let src;
  try {
    src = await readFile(file, "utf8");
  } catch {
    console.log(`  skip ${path.basename(file)}`);
    return;
  }

  let fixedDouble = 0;
  let revertedHero = 0;

  src = src.replace(IMG_TAG_RE, (full, before, srcUrl, after) => {
    const enc = getProxyUrlParam(srcUrl);
    if (!enc) return full;

    // Decode once. If the result still has %20 / %25 etc., leave alone.
    let originalUrl;
    try {
      originalUrl = decodeURIComponent(enc);
    } catch {
      return full;
    }

    // Hero slides: revert to original full URL
    if (isHeroImg(before, after)) {
      revertedHero++;
      return `<img${before}src="${originalUrl}"${after}>`;
    }

    // Otherwise rebuild a clean proxy URL
    const fixed = rebuildProxyUrl(originalUrl);
    if (fixed !== srcUrl) fixedDouble++;
    return `<img${before}src="${fixed}"${after}>`;
  });

  await writeFile(file, src, "utf8");
  console.log(
    `  ${path.basename(file)}: ${fixedDouble} URLs cleaned, ${revertedHero} hero slides reverted`
  );
}

async function main() {
  for (const f of FILES) await processFile(f);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
