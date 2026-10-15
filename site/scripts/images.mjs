// The site's pictures: originals live in media/ (not published); this writes a WebP of each into public/img/, at most
// 1600 px wide (enough for the full-size view), keeping transparency for the cut-outs. Run `npm run images` after adding
// or replacing a picture in media/, and refer to it as /img/<name>.webp.
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname } from "node:path";
import sharp from "sharp";

const SRC = new URL("../media/", import.meta.url);
const OUT = new URL("../public/img/", import.meta.url);
mkdirSync(OUT, { recursive: true });

let before = 0;
let after = 0;
for (const file of readdirSync(SRC).sort()) {
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
  const src = new URL(file, SRC).pathname;
  const out = new URL(`${basename(file, ext)}.webp`, OUT).pathname;
  const cutout = ext === ".png";
  await sharp(src)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp(cutout ? { quality: 86, alphaQuality: 90, effort: 6 } : { quality: 80, effort: 6 })
    .toFile(out);
  before += statSync(src).size;
  after += statSync(out).size;
}
console.log(`media/ ${(before / 1048576).toFixed(1)} MB → public/img/ ${(after / 1048576).toFixed(1)} MB`);
