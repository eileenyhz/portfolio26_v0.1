// The site's icons, rendered from the real typeface (Inter Tight 800): white "ez" and a sky-blue full stop on cobalt.
// Writes public/favicon.ico (16, 32 and 48 px inside) and public/apple-touch-icon.png (180 px, square: iOS rounds it).
// Run `npm run icons` after changing the mark below.
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const OUT = new URL("../public/", import.meta.url);
const COBALT = "#1f3ccf";
const STOP = "#9fb8f6";

/** The mark at a size; rounded corners for tabs, square for the phone home screen (the phone applies its own mask). */
const mark = (size, rounded) => `
  <div id="m" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden;background:${COBALT};border-radius:${rounded ? "22%" : "0"}">
    <span style="font:800 ${size * 0.64}px/1 'Inter Tight',Arial,sans-serif;color:#fff;letter-spacing:-.06em;translate:3% -6%;white-space:nowrap">ez<i style="font-style:normal;color:${STOP}">.</i></span>
  </div>`;

const browser = await chromium.launch(process.env.CI ? {} : { channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 1 });
const render = async (size, rounded) => {
  await page.setContent(
    `<!doctype html><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&display=block">
     <style>html,body{margin:0;background:transparent}</style>${mark(size, rounded)}`,
    { waitUntil: "networkidle" },
  );
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return page.locator("#m").screenshot({ omitBackground: true });
};

// favicon.ico: an ICO file whose entries are PNG images (supported by every current browser)
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await render(s, true));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e); // width
  header.writeUInt8(s, e + 1); // height
  header.writeUInt8(0, e + 2); // no palette
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); // colour planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(new URL("favicon.ico", OUT), Buffer.concat([header, ...pngs]));
writeFileSync(new URL("apple-touch-icon.png", OUT), await render(180, false));
console.log("favicon.ico (16, 32, 48) · apple-touch-icon.png (180)");
await browser.close();
