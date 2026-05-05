/**
 * Add alias <symbol>s to the icon sprite for icon names that don't exist in
 * Bootstrap Icons (so existing <use href="...#brain"/> markup keeps working).
 *
 * Aliases:
 *   brain    -> lightbulb
 *   chair    -> house-door
 *   hotel    -> building
 *   mountain -> triangle-fill
 *   shoe     -> bag
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import https from "node:https";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w):\//, "$1:/"),
  ".."
);
const SPRITE_PATH = path.join(ROOT, "assets", "icons", "sprite.svg");

const ALIASES = {
  brain: "lightbulb",
  chair: "house-door",
  hotel: "building",
  mountain: "triangle-fill",
  shoe: "bag",
};

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

async function main() {
  let sprite = await readFile(SPRITE_PATH, "utf8");
  const newSymbols = [];
  for (const [aliasName, realName] of Object.entries(ALIASES)) {
    if (sprite.includes(`id="${aliasName}"`)) {
      console.log(`  skip ${aliasName} (already present)`);
      continue;
    }
    const svg = await fetchText(
      `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/icons/${realName}.svg`
    );
    const viewBox =
      (svg.match(/viewBox\s*=\s*"([^"]+)"/i) || [, "0 0 16 16"])[1];
    const inner = svg
      .replace(/<\?xml[^?]*\?>/i, "")
      .replace(/<svg\b[^>]*>/i, "")
      .replace(/<\/svg>\s*$/i, "")
      .trim();
    newSymbols.push(
      `  <symbol id="${aliasName}" viewBox="${viewBox}">${inner}</symbol>`
    );
    console.log(`  alias ${aliasName} -> ${realName}`);
  }
  if (!newSymbols.length) return;
  sprite = sprite.replace(
    /<\/svg>\s*$/,
    `\n${newSymbols.join("\n")}\n</svg>\n`
  );
  await writeFile(SPRITE_PATH, sprite, "utf8");
  console.log("Sprite updated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
