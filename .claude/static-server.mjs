// A plain static file server for the repo's local HTML pages (the labs and site-compare.html), used by the "portfolio" entry in
// launch.json. Node rather than `python3 -m http.server`: the system Python is not allowed into ~/Desktop when started
// from the desktop app, and fails before serving anything. Usage: node .claude/static-server.mjs [port]
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.argv[2] ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".glb": "model/gltf-binary",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".md": "text/plain; charset=utf-8",
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  let file = normalize(join(ROOT, path));
  if (file !== ROOT.replace(/\/$/, "") && !file.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    if (statSync(file).isDirectory()) {
      const index = join(file, "index.html");
      if (!existsSync(index)) {
        // no index page: list the HTML pages in this folder
        const pages = readdirSync(file).filter((f) => f.endsWith(".html")).sort();
        const base = path.endsWith("/") ? path : `${path}/`;
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(`<!doctype html><meta charset="utf-8"><title>Pages</title><body style="font:15px/1.7 system-ui;padding:24px"><h1 style="font-size:18px">Pages in ${base}</h1>${pages.map((f) => `<a href="${base}${f}">${f}</a>`).join("<br>")}`);
        return;
      }
      file = index;
    }
    statSync(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end(`Not found: ${path}`);
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream", "cache-control": "no-store" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Serving ${ROOT} at http://localhost:${PORT}/`));
