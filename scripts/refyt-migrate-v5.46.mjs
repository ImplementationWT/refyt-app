// Refyt · migración de la v5.44 a la v5.46: el script con el que se hizo. Queda como registro y para
// repetirla; no forma parte del build ni de CI, y se niega a correr con CI=true.
//
// Es refyt-migrate.mjs (v3.29 → v5.44) acotado a las dos capas nuevas del original:
//   v5.45 (L11913) → apps/delivery/install-tracker.js
//   v5.46 (L12294) → apps/delivery/quantities-rates-cancelled.js
// Las registra en engine/index.js antes de access.js (el guardián tiene que seguir siendo el último
// wrapRender, para que corra primero), convierte las reasignaciones a wrapX / setX, aplica las
// adaptaciones del repo, extrae el <style id="wt-v545"> y los estilos del botón Comment a CSS y
// recalcula los imports con eslint-scope.
//
// Entrada: el HTML del original v5.46 (por defecto artifact/app.html). Córrelo sobre main (v5.44)
// en un árbol limpio de git. Debe imprimir "unknown free names: {}".
//
// Cómo se corre (acorn y eslint-scope no son dependencias del repo):
//   npm i --prefix /tmp/refyt-migrate acorn@8.19.0 eslint-scope@8.4.0
//   REFYT_MIGRATE_DEPS=/tmp/refyt-migrate node scripts/refyt-migrate-v5.46.mjs [ruta/al/original.html]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.CI) { console.error("refyt-migrate: no corre en CI."); process.exit(1); }
if (!process.env.REFYT_MIGRATE_DEPS) { console.error("refyt-migrate: falta REFYT_MIGRATE_DEPS (ver la cabecera)."); process.exit(1); }
const need = createRequire(join(process.env.REFYT_MIGRATE_DEPS, "noop.js"));
const acorn = need("acorn");
const escope = need("eslint-scope");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..") + "/";
const E = ROOT + "web/src/refyt/engine/";
const STYLES = ROOT + "web/src/refyt/styles/";
const H = readFileSync(process.argv[2] || ROOT + "artifact/app.html", "utf8").split("\n");
const report = { wrappers: [], edits: [], styles: [], unknown: {} };
const die = (m) => { console.error("ABORT:", m); process.exit(1); };

// ---------- layers: [start line, module path, header] ----------
const LAYERS = [
  [11913, "apps/delivery/install-tracker.js", "v5.45: Install tracker, Programme of works y Complaints, rellenados en la app y descargados como los Excel que REFYT ya usa."],
  [12294, "apps/delivery/quantities-rates-cancelled.js", "v5.46: Bill of quantities en Quotes and budgets, Subcontractor rates y Cancelled jobs en el formato de Dynamics."]
];
const LAST = 12504;
LAYERS.forEach(([s]) => { if (!/^\/\* =================== v/.test(H[s - 1])) die(`no layer marker at L${s}`); });
if (!/STARTUP/.test(H[LAST])) die("STARTUP not after L" + LAST);

// ---------- names reassigned from another module ----------
const BASE_SITES = { render: { mod: "apps/director/templates-guided.js", existing: true } };
const LAYER_SITES = { set45: 0, edHTML45: 0, drHTML45: 0, itrBook45: 0 }; // functions of v5.45 that v5.46 wraps
const LET_SITES = {};
const REASSIGNED = new Set([...Object.keys(BASE_SITES), ...Object.keys(LAYER_SITES), ...Object.keys(LET_SITES)]);
const cap = (n) => n[0].toUpperCase() + n.slice(1);
const used = {};
const use = (n, k) => (used[n] ??= new Set()).add(k);

// ---------- text adaptations of the repo, each must match once ----------
function adapt(i, src) {
  const one = (old, nu, why) => {
    const n = typeof old === "string" ? src.split(old).length - 1 : (src.match(new RegExp(old.source, "g")) || []).length;
    if (n !== 1) die(`layer ${i + 1}: ${n} matches for ${String(old).slice(0, 70)}`);
    src = src.replace(old, (...m) => (typeof nu === "function" ? nu(...m) : nu));
    report.edits.push(`${LAYERS[i][1]}: ${why}`);
  };
  if (i === 0) {
    one(/const xl45 = \(\) => XL45 \|\| \(XL45 = new Promise\(\(ok, ko\) => \{ if\(window\.ExcelJS\)[^\n]*document\.head\.appendChild\(s\); \}\)\);/,
      "const xl45 = () => XL45 || (XL45 = import('exceljs').then(m => m.default || m).catch(e => { XL45 = null; throw e; }));",
      "ExcelJS importado del paquete exceljs (el original lo carga por CDN como window.ExcelJS)");
    one(/window\.WTFB = \{webhook:[^\n]*\n  contexto:([\s\S]*?)\}\};\n/,
      (_m, fn) => "/* Comment: el botón de la app (web/src/refyt/comment) guarda en Feedback, no en el webhook de la demo; de aquí\n   lee la pantalla. Solo la pantalla visible: el original caía en el título de una vista oculta. */\nconst commentContext = "
        + fn.replace("document.querySelector('.view:not([hidden]) .op-h h1') || document.querySelector('.op-h h1')", "document.querySelector('.view:not([hidden]) .op-h h1') || document.querySelector('.view:not([hidden]) h1'), nv = document.querySelector('.view:not([hidden]) aside.sb [aria-current=\"true\"]')")
            .replace("pantalla:h1 ? h1.textContent.trim() : pg,", "pantalla:h1 ? h1.textContent.trim() : nv ? nv.title || nv.textContent.trim() : pg,")
        + "};\n",
      "window.WTFB (webhook de la demo) → commentContext, que mount.js pasa al botón Comment");
    if (!src.includes("nv = document.querySelector") || !src.includes(": nv ? nv.title")) die("commentContext fix did not apply");
  }
  if (i === 1) {
    one("{ const t0 = window.WTFB; if(t0) t0.version = 'v5.46'; }\n", "", "sin window.WTFB: la versión no viaja con el comentario");
  }
  if (/cdnjs|n8n\.whatever|window\.WTFB/.test(src)) die(`layer ${i + 1}: CDN, webhook or WTFB left`);
  if (/insertAdjacentHTML\('beforeend', `<style/.test(src)) die(`layer ${i + 1}: injected style`);
  return src;
}

// ---------- reassignments -> wrapX / setX ----------
const parse = (src, sourceType = "script") => acorn.parse(src, { ecmaVersion: "latest", sourceType, ranges: true, locations: true });
function* nodes(n, parent = null) {
  if (!n || typeof n.type !== "string") return;
  yield [n, parent];
  for (const k of Object.keys(n)) {
    if (k === "parent") continue;
    const v = n[k];
    if (Array.isArray(v)) for (const c of v) yield* nodes(c, n);
    else if (v && typeof v.type === "string") yield* nodes(v, n);
  }
}
function readsOf(node, name) {
  const out = [];
  for (const [n, p] of nodes(node)) {
    if (n.type !== "Identifier" || n.name !== name) continue;
    if (p && p.type === "MemberExpression" && p.property === n && !p.computed) continue;
    if (p && p.type === "Property" && p.key === n && !p.shorthand) continue;
    out.push(n);
  }
  return out;
}
function convert(i, src, declaredHere) {
  const ast = parse(src);
  const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: "script" });
  const edits = [];
  // statement lists to find "const o = X;" before "X = F;"
  const lists = [];
  for (const [n] of nodes(ast)) {
    if (n.type === "Program" || n.type === "BlockStatement") lists.push(n.body);
  }
  for (const [n, p] of nodes(ast)) {
    if (n.type !== "AssignmentExpression" || n.left.type !== "Identifier" || !REASSIGNED.has(n.left.name) || declaredHere.has(n.left.name)) continue;
    if (n.operator !== "=") die(`layer ${i + 1}: operator ${n.operator}`);
    const X = n.left.name, F = n.right, Ftext = src.slice(F.start, F.end);
    if (LET_SITES[X] !== undefined) { // plain setter
      if (readsOf(F, X).length) die(`${X} read while set`);
      edits.push([n.start, n.end, `set${cap(X)}(${Ftext})`]); use(X, "set"); continue;
    }
    const selfReads = readsOf(F, X);
    if (selfReads.length) { // X = g(X, ...)
      if (F.type === "CallExpression" && F.callee.type === "Identifier" && F.arguments.length === 1 && F.arguments[0].type === "Identifier" && F.arguments[0].name === X) {
        edits.push([n.start, n.end, `wrap${cap(X)}(${F.callee.name})`]);
      } else {
        let t = Ftext;
        for (const r of selfReads.sort((a, b) => b.start - a.start)) t = t.slice(0, r.start - F.start) + "prev" + t.slice(r.end - F.start);
        if (readsOf(F, "prev").length) die("prev already used");
        edits.push([n.start, n.end, `wrap${cap(X)}(prev => ${t})`]);
      }
      use(X, "wrap"); continue;
    }
    // const o = X; ... X = F (o only used inside F)
    const stmt = p && p.type === "ExpressionStatement" ? p : null;
    const list = stmt && lists.find((l) => l.includes(stmt));
    let done = false;
    if (list) {
      for (let k = list.indexOf(stmt) - 1; k >= 0 && !done; k--) {
        const d = list[k];
        if (d.type !== "VariableDeclaration" || d.kind !== "const" || d.declarations.length !== 1) continue;
        const dc = d.declarations[0];
        if (dc.id.type !== "Identifier" || !dc.init || dc.init.type !== "Identifier" || dc.init.name !== X) continue;
        const o = dc.id.name;
        const v = sm.acquireAll ? null : null;
        const refs = [];
        for (const sc of sm.scopes) for (const vv of sc.variables) if (vv.name === o && vv.defs.some((df) => df.name === dc.id)) refs.push(...vv.references);
        if (!refs.every((r) => r.init || (r.identifier.start >= F.start && r.identifier.end <= F.end))) die(`layer ${i + 1}: ${o} used outside the new ${X}`);
        edits.push([d.start, d.end, ""]);
        edits.push([n.start, n.end, `wrap${cap(X)}(${o} => ${Ftext})`]);
        use(X, "wrap"); done = true;
      }
    }
    if (!done) { edits.push([n.start, n.end, `set${cap(X)}(${Ftext})`]); use(X, "set"); }
  }
  edits.sort((a, b) => b[0] - a[0]);
  for (let k = 1; k < edits.length; k++) if (edits[k][1] > edits[k - 1][0]) die(`layer ${i + 1}: overlapping edits`);
  for (const [s, e, t] of edits) src = src.slice(0, s) + t + src.slice(e);
  // a removed "const o = X;" may leave "{  " behind: tidy only the double space it leaves
  return src.replace(/\{ {2,}(wrap[A-Z])/g, "{ $1");
}

// ---------- exports on top-level declarations ----------
function exportTop(src) {
  const ast = parse(src);
  const ins = [];
  const names = [];
  for (const st of ast.body) {
    if (st.type === "FunctionDeclaration" || st.type === "ClassDeclaration") { ins.push(st.start); names.push(st.id.name); }
    else if (st.type === "VariableDeclaration") { ins.push(st.start); for (const d of st.declarations) { if (d.id.type !== "Identifier") die("pattern decl"); names.push(d.id.name); } }
  }
  for (const s of ins.sort((a, b) => b - a)) src = src.slice(0, s) + "export " + src.slice(s);
  return { src, names };
}

// ---------- 1. layers -> module bodies ----------
const bodies = [];
const layerDecls = [];
LAYERS.forEach(([s], i) => {
  const e = i + 1 < LAYERS.length ? LAYERS[i + 1][0] - 1 : LAST;
  let src = H.slice(s - 1, e).join("\n").replace(/\n+$/, "") + "\n";
  src = adapt(i, src);
  const decl = new Set();
  for (const st of parse(src).body) {
    if (st.id) decl.add(st.id.name);
    if (st.declarations) st.declarations.forEach((d) => decl.add(d.id.name));
  }
  layerDecls.push(decl);
  bodies.push(src);
});
bodies.forEach((src, i) => { bodies[i] = convert(i, src, layerDecls[i]); });

const dispatcher = (X, base) => {
  const k = used[X] || new Set();
  const lines = [`var ${X}W = null;`, `function ${X}(...x){ return (${X}W || ${base})(...x); }`];
  if (k.has("wrap")) lines.push(`const wrap${cap(X)} = w => { ${X}W = w(${X}W || ${base}); };`);
  if (k.has("set")) lines.push(`const set${cap(X)} = f => { ${X}W = f; };`);
  report.wrappers.push(`${X} (${[...k].map((t) => t + cap(X)).join(", ")}), en ${LAYERS[LAYER_SITES[X]][1]}`);
  return lines;
};
for (const [X, li] of Object.entries(LAYER_SITES)) {
  if (!used[X]) die(`${X} not reassigned?`);
  const base = X + "Base";
  const re = new RegExp(`^function ${X}\\(`, "m");
  if (!re.test(bodies[li])) die(`no function ${X} in layer ${li + 1}`);
  bodies[li] = bodies[li].replace(re, `function ${base}(`) + `/* Later layers wrap or replace ${X} (the original reassigns it). Kept as var: no temporal dead zone. */\n` + dispatcher(X, base).join("\n") + "\n";
}
if (used.render?.has("set")) die("render needs a setter");

// ---------- 2. write new modules ----------
LAYERS.forEach(([, mod, head], i) => {
  const { src } = exportTop(bodies[i]);
  mkdirSync(dirname(E + mod), { recursive: true });
  writeFileSync(E + mod, `// Refyt · ${head}\nimport {\n} from "${relative(dirname(E + mod), E + "index.js").replace(/^(?!\.)/, "./")}";\n${src}`);
});
{
  let s = readFileSync(E + "index.js", "utf8");
  if (s.includes(LAYERS[0][1])) die("barrel already has the layers");
  if (!s.includes('export * from "./access.js";')) die("no access.js in the barrel");
  s = s.replace('export * from "./access.js";', LAYERS.map(([, mod]) => `export * from "./${mod}";`).join("\n") + '\nexport * from "./access.js";');
  writeFileSync(E + "index.js", s);
}

// ---------- 3. CSS ----------
const cssFiles = [];
{
  const at = H.findIndex((l) => l === '<style id="wt-v545">') + 1;
  if (!at) die("no wt-v545");
  const end = H.findIndex((l, k) => k >= at && l.startsWith("</style>"));
  cssFiles.push(["21-refyt-wt-v545.css", `/* Refyt · <style id="wt-v545"> del original (L${at + 1}-L${end}): v5.45 y v5.46. Copia exacta del original. */\n${H.slice(at, end).join("\n")}\n`]);
  const c0 = H.findIndex((l) => l === "  const css = `") + 1;
  const c1 = H.findIndex((l, k) => k >= c0 && /`;$/.test(l));
  if (!c0 || c1 < 0) die("no Comment css");
  cssFiles.push(["22-refyt-comment.css", `/* Refyt · botón Comment: los estilos del kit ("@@comp comentar v3.1", L${c0 + 1}-L${c1 + 1} del original), tal cual. */\n${H.slice(c0, c1 + 1).join("\n").replace(/`;$/, "")}\n`]);
  for (const [f, css] of cssFiles) writeFileSync(STYLES + f, css);
  let s = readFileSync(STYLES + "index.css", "utf8");
  s = s.replace('@import "./11-app.css";', cssFiles.map(([f]) => `@import "./${f}";`).join("\n") + '\n@import "./11-app.css";');
  writeFileSync(STYLES + "index.css", s);
}

// ---------- 5. imports of every module ----------
const files = [];
const walkDir = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walkDir(p); else if (p.endsWith(".js") && !p.endsWith("/index.js")) files.push(p); } };
walkDir(E);
const exportsOf = {};
const src0 = {};
for (const f of files) {
  src0[f] = readFileSync(f, "utf8");
  const ast = parse(src0[f], "module");
  for (const st of ast.body) {
    if (st.type !== "ExportNamedDeclaration" || !st.declaration) continue;
    const d = st.declaration;
    const ns = d.id ? [d.id.name] : d.declarations.map((x) => x.id.name);
    for (const n of ns) { if (exportsOf[n] && exportsOf[n] !== f) die(`export ${n} twice: ${exportsOf[n]} and ${f}`); exportsOf[n] = f; }
  }
}
const GLOBALS = new Set("Object document String Math parseFloat isNaN Date Number localStorage window Set Array Boolean clearTimeout setTimeout requestAnimationFrame getSelection matchMedia innerHeight addEventListener innerWidth location parseInt RegExp undefined setInterval JSON Blob URL FileReader Promise Error atob Uint8Array MouseEvent getComputedStyle MutationObserver console Map URLSearchParams Infinity NaN clearInterval cancelAnimationFrame navigator history structuredClone encodeURIComponent decodeURIComponent HTMLElement Intl Symbol WeakMap queueMicrotask performance Node Event KeyboardEvent CustomEvent ResizeObserver IntersectionObserver isFinite TypeError".split(" "));
let changed = 0;
for (const f of files) {
  const s = src0[f];
  const ast = parse(s, "module");
  const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: "module" });
  const modScope = sm.scopes.find((x) => x.type === "module");
  const imported = new Set();
  let idxImport = null;
  for (const st of ast.body) if (st.type === "ImportDeclaration" && /index\.js$/.test(st.source.value)) idxImport = st;
  const local = new Set(modScope.variables.filter((v) => !v.defs.every((d) => d.type === "ImportBinding")).map((v) => v.name));
  const need = new Set();
  const refs = [...modScope.through];
  // references resolved to the index import bindings count as needs too
  for (const v of modScope.variables) if (v.defs.some((d) => d.type === "ImportBinding" && d.parent.source.value.endsWith("index.js")) && v.references.length) need.add(v.name);
  for (const r of refs) {
    const n = r.identifier.name;
    if (local.has(n)) continue;
    if (exportsOf[n]) need.add(n);
    else if (!GLOBALS.has(n)) (report.unknown[n] ??= new Set()).add(relative(E, f));
  }
  for (const n of need) if (!exportsOf[n]) { (report.unknown[n] ??= new Set()).add(relative(E, f)); need.delete(n); }
  if (idxImport) idxImport.specifiers.forEach((sp) => imported.add(sp.local.name));
  // existing modules keep the names they already import (even unused), unless they no longer exist
  for (const n of imported) if (exportsOf[n] && exportsOf[n] !== f && !local.has(n)) need.add(n);
  const same = need.size === imported.size && [...need].every((n) => imported.has(n));
  if (same && idxImport) continue;
  const path = relative(dirname(f), E + "index.js").replace(/^(?!\.)/, "./");
  const names = [...need].sort();
  const rows = [];
  let row = "";
  for (const n of names) { const add = (row ? " " : "") + n + ","; if (row && row.length + add.length > 99) { rows.push(row); row = n + ","; } else row += add; }
  rows.push(row.replace(/,$/, ""));
  const block = names.length ? `import {\n${rows.map((r) => "  " + r).join("\n")}\n} from "${path}";` : "";
  let out;
  if (idxImport) out = s.slice(0, idxImport.start) + block + s.slice(idxImport.end);
  else { const m = s.match(/^(\/\/[^\n]*\n)*/); out = s.slice(0, m[0].length) + block + "\n" + s.slice(m[0].length); }
  if (!block) out = out.replace(/^\n/m, "");
  writeFileSync(f, out);
  changed++;
}
console.log("import blocks rewritten:", changed);
console.log("wrappers:\n  " + report.wrappers.join("\n  "));
console.log("edits:\n  " + report.edits.join("\n  "));
console.log("css:", cssFiles.map(([f]) => f).join(", "));
console.log("unknown free names:", Object.fromEntries(Object.entries(report.unknown).map(([k, v]) => [k, [...v]])));
