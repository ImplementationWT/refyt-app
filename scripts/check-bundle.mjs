// Fails if the built SPA references server-side configuration. The frontend
// only talks to the backend API and must never embed connection data or
// secrets (see docs/TEMPLATE_CONTRACT.md).
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("../web/dist/", import.meta.url);
const FORBIDDEN = [
  "MONGODB_",
  "mongodb://",
  "mongodb+srv://",
  "SESSION_SECRET",
  "INITIAL_ADMIN_PASSWORD",
  "MONDAY_API_TOKEN",
  "VITE_"
];

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

let failures = 0;
let count = 0;
for await (const file of files(ROOT.pathname)) {
  count++;
  const text = await readFile(file, "utf8");
  for (const needle of FORBIDDEN) {
    if (text.includes(needle)) {
      console.error(`${file}: contains "${needle}"`);
      failures++;
    }
  }
}

if (count === 0) {
  console.error("web/dist is empty: run the build first");
  process.exit(1);
}
if (failures > 0) {
  process.exit(1);
}
console.log(`Bundle check passed (${count} files, no server configuration).`);
