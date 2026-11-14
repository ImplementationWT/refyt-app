// Rebuilds the original Refyt HTML from its parts in web/src/refyt/: the CSS in the order of
// styles/index.css, the engine modules in the order of engine/index.js (without their imports,
// "export" keywords and header comment), then mount.js, RefytWorkspace.tsx and RefytHeader.tsx as
// they are. Each part is preceded by a /* @file … */ marker. Output: tmp-artifacts/refyt-repo-pack.html
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REFYT = "web/src/refyt";
const OUT = "tmp-artifacts/refyt-repo-pack.html";

const read = (path) => readFile(join(ROOT, path), "utf8");
const marker = (path) => `/* @file ${path} */`;

/** Paths listed by `pattern` (one capture group) in the index file, resolved against its folder. */
async function ordered(index, pattern) {
  const folder = posix.dirname(index);
  return [...(await read(index)).matchAll(pattern)].map((match) => posix.join(folder, match[1]));
}

/** Drops the leading "// Refyt · …" comment, the import block and "export" before declarations. */
function stripModule(source) {
  const lines = source.split("\n");
  let i = 0;
  if (lines[0]?.startsWith("// Refyt ·")) {
    while (i < lines.length && lines[i].startsWith("//")) i++;
  }
  while (i < lines.length && lines[i].startsWith("import ")) {
    while (i < lines.length && !lines[i].trimEnd().endsWith(";")) i++;
    i++;
  }
  return lines
    .slice(i)
    .map((line) => line.replace(/^export (?=(?:const|let|var|function|async function|class)\b)/, ""))
    .join("\n");
}

const styles = await ordered(`${REFYT}/styles/index.css`, /^@import\s+"([^"]+)";/gm);
const modules = (await ordered(`${REFYT}/engine/index.js`, /^export \* from "([^"]+)";/gm)).filter(
  (path) => !path.endsWith("/mount.js")
);
const tail = [`${REFYT}/engine/mount.js`, `${REFYT}/RefytWorkspace.tsx`, `${REFYT}/RefytHeader.tsx`];

const css = [];
for (const path of styles) css.push(marker(path), await read(path));
const js = [];
for (const path of modules) js.push(marker(path), stripModule(await read(path)));
for (const path of tail) js.push(marker(path), await read(path));

const html = [
  "<!doctype html>",
  '<html lang="en">',
  "<head>",
  '<meta charset="utf-8">',
  "<title>Refyt</title>",
  "<style>",
  css.join("\n"),
  "</style>",
  "</head>",
  "<body>",
  "<script>",
  js.join("\n"),
  "</script>",
  "</body>",
  "</html>",
  ""
].join("\n");

await mkdir(join(ROOT, dirname(OUT)), { recursive: true });
await writeFile(join(ROOT, OUT), html);
const { size } = await stat(join(ROOT, OUT));
console.log(`${OUT}: ${styles.length} CSS, ${modules.length} modules + ${tail.length} files, ${size} bytes`);
