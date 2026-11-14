// Refyt · migración de la v3.29 a la v5.44: el script con el que se hizo (PR #4). Queda como registro y
// para repetirla; no forma parte del build ni de CI, y se niega a correr con CI=true.
//
// Qué hace: mueve las 38 capas del HTML (v3.30 a v5.44, de L9869 a L11912) a módulos de
// web/src/refyt/engine, los registra en engine/index.js antes de mount.js, convierte las reasignaciones
// entre módulos al mecanismo del repo (dispatcher con wrapX / setX en el módulo que declara la función),
// aplica las adaptaciones de sesión del repo dentro de las capas, extrae los estilos (3 bloques del
// <head> y 5 que las capas inyectaban) a web/src/refyt/styles y recalcula los imports de todos los
// módulos con eslint-scope.
//
// Entradas: el HTML del original (por defecto artifact/app.html, o la ruta que se pase como primer
//   argumento) y el árbol del repo en la v3.29 con los cambios puntuales ya aplicados (sección 2 del
//   mapa de cambios; se aplicaron aparte, igual que las adaptaciones de los commits siguientes).
// Salidas: los módulos y CSS nuevos, los dispatchers en los módulos existentes, engine/index.js,
//   styles/index.css y los bloques de import reescritos. Imprime los wrappers creados, las
//   adaptaciones aplicadas y los nombres sin resolver (debe ser {}). Se detiene sin escribir los
//   módulos nuevos si algo no coincide, pero puede haber tocado módulos existentes: córrelo sobre un
//   árbol limpio de git. Sobre main (v3.29) más los cambios puntuales reproduce el commit
//   «Refyt v5.44 desde artifact», salvo los retoques que se hicieron a mano después (allowed(),
//   mount.js, 11-app.css y un espacio doble en apps/delivery/ready-to-install.js).
//
// Cómo se corre (acorn y eslint-scope no son dependencias del repo):
//   npm i --prefix /tmp/refyt-migrate acorn@8.19.0 eslint-scope@8.4.0
//   REFYT_MIGRATE_DEPS=/tmp/refyt-migrate node scripts/refyt-migrate.mjs [ruta/al/original.html]
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
  [9869, "apps/delivery/delivery-feedback.js", "v3.30: feedback de Delivery (fechas en cada cambio, visibilidad por persona)."],
  [9971, "apps/director/suppliers-dashboard.js", "v3.32: vuelta a v3.30, con Suppliers como dashboard propio."],
  [10000, "apps/one-workspace.js", "v4.0: un solo espacio de trabajo, la propiedad al centro, permisos por rol, equipo y persona."],
  [10294, "shell/header-sections.js", "v5: secciones en el encabezado, cada una con su menú; Overview por rol."],
  [10649, "property/public-updates.js", "v5.1: actualizaciones públicas, checklists editables, Orders abre en All, texto que se ajusta."],
  [10744, "property/next-status.js", "v5.2: pasar al siguiente estado desde la propiedad, casillas clicables, historial como icono."],
  [10831, "apps/commercial/margins-search.js", "v5.3: Margins con búsqueda, botón de filtros y gráfico de margen que sigue los filtros."],
  [10869, "apps/commercial/quotes-dashboard.js", "v5.4: Quotes and budgets como dashboard, con el archivo del presupuesto."],
  [10943, "apps/delivery/ready-to-install.js", "v5.5: Ready to install como tabla filtrable, con el presupuesto y un menú por propiedad."],
  [11003, "ui/search-bar.js", "v5.8: una sola barra de búsqueda para toda la app, con los filtros dentro."],
  [11065, "apps/commercial/margins-dashboard.js", "v5.9: Margins como dashboard: cifras clave, margen por esquema, aprobación del cliente, una tabla."],
  [11115, "apps/director/quality-compliance.js", "v5.11: Quality and compliance en Director: acreditaciones y seguros, auditorías y renovaciones."],
  [11209, "ui/floating-popups.js", "v5.12: cada pop up flota sobre la pantalla en vez de empujarla."],
  [11228, "apps/commercial/variations-and-rates.js", "v5.13: Variations and additional costs y Rates en el nuevo diseño; búsqueda en Quotes."],
  [11283, "ui/card-tables.js", "v5.14: todas las listas en el nuevo diseño: tablas en tarjeta, etiquetas de estado, cifras clave."],
  [11330, "apps/director/reports-search.js", "v5.15: los informes de Director usan la barra de búsqueda estándar con filtros."],
  [11350, "apps/director/suppliers-spend.js", "v5.17: Suppliers: gráfico de gasto y Needs a look con el diseño de Margins."],
  [11366, "apps/delivery/close-out.js", "v5.18: Close out en el mismo diseño: cifras clave, avance, Needs a look, búsqueda y tabla."],
  [11407, "apps/director/capacity-staffing.js", "v5.19: Capacity and staffing como dashboard de rendimiento del equipo."],
  [11461, "apps/retrofit/bookings-calendar.js", "v5.20: Assessment bookings con un calendario grande y arrastrar y soltar en los calendarios."],
  [11514, "meetings/calendar-week-first.js", "v5.21: todo calendario abre en la semana, luego el mes, con la lista debajo."],
  [11524, "meetings/hour-grid.js", "v5.22: la rejilla por horas de Meetings es el calendario semanal de Tasks y Assessment bookings."],
  [11550, "apps/retrofit/client-system-updates.js", "v5.24: Client system updates en el nuevo diseño, cada pendiente a un clic."],
  [11581, "apps/retrofit/client-system-cards.js", "v5.25: Client system updates como tarjetas: una por propiedad, pasos y checklist pendiente."],
  [11600, "apps/retrofit/assessment-queue.js", "v5.26: In assessment como dashboard de la cola de revisión y diseño."],
  [11636, "apps/retrofit/with-the-client.js", "v5.27: With the client (survey pack y sistemas del cliente) en el nuevo diseño."],
  [11664, "ui/status-labels.js", "v5.28: las etiquetas de estado se reducen a su icono sin espacio; cabeceras alineadas."],
  [11683, "apps/alerts-dashboard.js", "v5.30: Alerts (Needs attention) en el nuevo diseño: cifras clave, búsqueda con filtros, tarjetas."],
  [11705, "apps/home-design.js", "v5.31: Home en el nuevo diseño: cabeceras con iconos, etiquetas con iconos, barras de margen."],
  [11717, "property/properties-design.js", "v5.32: Properties en el nuevo diseño: cifras clave, colores por fase, cabeceras de grupo."],
  [11735, "apps/director/operations-exceptions.js", "v5.34: Operations como dashboard de excepciones de Delivery."],
  [11770, "ui/queue-overview.js", "v5.35: el panel Queue overview junto a Meetings, Assessment bookings y Quality and compliance."],
  [11788, "ui/key-figures.js", "v5.36: cada fila de cifras clave con el estilo de Capacity and staffing."],
  [11797, "apps/tasks/team-progress-battery.js", "v5.37: All tasks by team: una batería de avance por equipo."],
  [11809, "apps/director/finance-overview.js", "v5.38: Finance como resumen financiero."],
  [11839, "apps/delivery/site-forms-design.js", "v5.40: Site forms (y el formulario del assessor) con el diseño de la app."],
  [11851, "ui/sales-visuals.js", "v5.41: visuales de la referencia comercial: variaciones en cifras clave, medidores, barras."],
  [11877, "apps/director/financial-health.js", "v5.42 a v5.44: Finance con la puntuación de salud financiera y la distribución en semicírculo."]
];
const LAST = 11912;
LAYERS.forEach(([s], i) => { if (!/^\/\* =================== v/.test(H[s - 1])) die(`no layer marker at L${s}`); });
if (!/STARTUP/.test(H[LAST])) die("STARTUP not after L" + LAST);

// ---------- names reassigned from another module ----------
const BASE_SITES = {
  render: { mod: "apps/director/templates-guided.js", existing: true },
  alerts: { mod: "apps/director/templates-guided.js", existing: true },
  phGate: { mod: "domain/phases.js" }, retTab: { mod: "apps/retrofit/visits-and-documents.js" },
  insTab: { mod: "property/card.js" }, cloTab: { mod: "property/card.js" }, prList: { mod: "ui/lists.js" },
  bkPage: { mod: "apps/retrofit/bookings.js" }, mrgPage: { mod: "apps/commercial/pages.js" },
  renderLayer: { mod: "shell/render.js" }, patchLayer: { mod: "shell/render.js" }, drawTour: { mod: "shell/tour-panel.js" },
  drawVs: { mod: "shell/app-dropdown.js" }, prFicha: { mod: "apps/director/templates-guided.js" },
  quoPage3: { mod: "apps/team-pages.js" }, drawPop: { mod: "meetings/owners-and-actions.js" },
  updTab: { mod: "apps/director/alerts.js" }, chkTab: { mod: "apps/director/templates-guided.js" }
};
const LAYER_SITES = { mBar53: 6, qcNext60: 11, bkSide70: 19 }; // function declared in that layer
const LET_SITES = { mProps53: 6 }; // let declared in that layer: a setter is enough
const REASSIGNED = new Set([...Object.keys(BASE_SITES), ...Object.keys(LAYER_SITES), ...Object.keys(LET_SITES)]);
const cap = (n) => n[0].toUpperCase() + n.slice(1);
const used = {}; // name -> Set('wrap'|'set')
const use = (n, k) => (used[n] ??= new Set()).add(k);

// ---------- text adaptations (repo forms of section 1), each must match once ----------
function adapt(i, src) {
  const one = (old, nu, why) => {
    const n = src.split(old).length - 1;
    if (n !== 1) die(`layer ${i + 1}: ${n} matches for ${old.slice(0, 70)}`);
    src = src.replace(old, () => nu);
    report.edits.push(`${LAYERS[i][1]}: ${why}`);
  };
  if (i === 2) {
    one("${Object.entries(ROLES).map(([k, [n]]) => `<button class=\"rf-pi${S.role === k ? ' on' : ''}\" data-act=\"setRole\"",
      "${Object.entries(ROLES).filter(([k]) => AUTH.viewAs || AUTH.roles.includes(k)).map(([k, [n]]) => `<button class=\"rf-pi${S.role === k ? ' on' : ''}\" data-act=\"setRole\"",
      "«Viewing as» solo lista los roles del usuario (salvo refyt.view_as), como en el repo");
    one("{ const os = A.setRole; A.setRole = el => { os(el); S.trail = null;",
      "{ const os = A.setRole; A.setRole = el => { os(el); if(S.role !== el.dataset.v) return; S.trail = null;",
      "setRole: si la sesión no deja cambiar a ese rol, no navega ni avisa");
    one("const J = window.jspdf && window.jspdf.jsPDF;", "const J = jsPDF;", "jsPDF importado del paquete jspdf (el original lo carga por CDN como window.jspdf)");
  }
  if (i === 3) {
    one("{ const os = A.setRole; A.setRole = el => { os(el); S.sec5 = 'ovw';",
      "{ const os = A.setRole; A.setRole = el => { os(el); if(S.role !== el.dataset.v) return; S.sec5 = 'ovw';",
      "setRole: si la sesión no deja cambiar a ese rol, no navega");
    one("document.title = `${EMP}, demo`;", "document.title = 'Refyt';", "título de la pestaña: Refyt");
  }
  if (i === 5) {
    // phGate swapped while moving to the next status: the repo has no getter, wrapPhGate hands the current one.
    one("  const real = phGate, miss = g.miss.slice(), from = p.ph; phGate = () => ({ok:true, miss:[]});\n  try { oNext(el); } finally { phGate = real; }",
      "  const miss = g.miss.slice(), from = p.ph; let real; wrapPhGate(f => { real = f; return () => ({ok:true, miss:[]}); });\n  try { oNext(el); } finally { setPhGate(real); }",
      "phGate se cambia y se restaura con wrapPhGate/setPhGate");
    use("phGate", "wrap"); use("phGate", "set");
  }
  // styles injected from JS -> CSS files in the refyt layer
  src = src.replace(/document\.head\.insertAdjacentHTML\('beforeend', `<style id="(wt-v[0-9a-z]+)">\n([\s\S]*?)<\/style>`\);/g, (_m, id, css) => {
    if (css.includes("${") || css.includes("\\")) die(`dynamic style ${id}`);
    report.styles.push({ id, css, from: LAYERS[i][1] });
    return `/* Estilos ${id}: en web/src/refyt/styles (capa refyt), no se inyectan desde aquí. */`;
  });
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

// dispatchers for functions declared in a layer
const dispatcher = (X, base) => {
  const k = used[X] || new Set();
  const lines = [`var ${X}W = null;`, `function ${X}(...x){ return (${X}W || ${base})(...x); }`];
  if (k.has("wrap")) lines.push(`const wrap${cap(X)} = w => { ${X}W = w(${X}W || ${base}); };`);
  if (k.has("set")) lines.push(`const set${cap(X)} = f => { ${X}W = f; };`);
  report.wrappers.push(`${X} (${[...k].map((t) => t + cap(X)).join(", ")}), en ${X in BASE_SITES ? BASE_SITES[X].mod : LAYERS[LAYER_SITES[X]][1]}`);
  return lines;
};
for (const [X, li] of Object.entries(LAYER_SITES)) {
  const base = X + "Base";
  const re = new RegExp(`^function ${X}\\(`, "m");
  if (!re.test(bodies[li])) die(`no function ${X} in layer ${li + 1}`);
  bodies[li] = bodies[li].replace(re, `function ${base}(`) + `/* Later layers wrap or replace ${X} (the original reassigns it). Kept as var: no temporal dead zone. */\n` + dispatcher(X, base).join("\n") + "\n";
}
for (const [X, li] of Object.entries(LET_SITES)) {
  bodies[li] += `/* A later layer replaces ${X} (the original reassigns it). */\nconst set${cap(X)} = f => { ${X} = f; };\n`;
  report.wrappers.push(`${X} (set${cap(X)}), en ${LAYERS[li][1]}`);
}

// ---------- 2. dispatchers in base modules ----------
const byMod = {};
for (const [X, site] of Object.entries(BASE_SITES)) {
  if (site.existing) { if (used[X]?.has("set")) die(`${X} needs a setter`); continue; }
  if (!used[X]) die(`${X} not reassigned?`);
  (byMod[site.mod] ??= []).push(X);
}
for (const [mod, xs] of Object.entries(byMod)) {
  let s = readFileSync(E + mod, "utf8");
  const blk = [`\n/* Later versions wrap or replace ${xs.join(", ")} (the original reassigns ${xs.length > 1 ? "them" : "it"}). Kept as var: no temporal dead zone. */`];
  for (const X of xs) {
    const re = new RegExp(`^export function ${X}\\(`, "m");
    if ((s.match(new RegExp(re.source, "gm")) || []).length !== 1) die(`base ${X} in ${mod}`);
    s = s.replace(re, `function ${X}0(`);
    blk.push(...dispatcher(X, X + "0").map((l) => (/^(function|const)/.test(l) ? "export " + l : l)));
  }
  writeFileSync(E + mod, s.replace(/\n*$/, "\n") + blk.join("\n") + "\n");
}

// ---------- 3. write new modules ----------
const EXTRA_IMPORTS = { "apps/one-workspace.js": 'import { jsPDF } from "jspdf";' };
LAYERS.forEach(([, mod, head], i) => {
  const { src } = exportTop(bodies[i]);
  mkdirSync(dirname(E + mod), { recursive: true });
  writeFileSync(E + mod, `// Refyt · ${head}\nimport {\n} from "${relative(dirname(E + mod), E + "index.js").replace(/^(?!\.)/, "./")}";\n${EXTRA_IMPORTS[mod] ? EXTRA_IMPORTS[mod] + "\n" : ""}${src}`);
});

// barrel
{
  let s = readFileSync(E + "index.js", "utf8");
  const lines = LAYERS.map(([, mod]) => `export * from "./${mod}";`).join("\n");
  if (s.includes(LAYERS[0][1])) die("barrel already has the layers");
  s = s.replace('export * from "./mount.js";', lines + '\nexport * from "./mount.js";');
  writeFileSync(E + "index.js", s);
}

// ---------- 4. CSS ----------
const HEAD_STYLES = [["wt-v30", 6221], ["wt-v8", 6246], ["wt-v51", 6297]];
const cssFiles = [];
let num = 13;
for (const [id, at] of HEAD_STYLES) {
  if (H[at - 1] !== `<style id="${id}">`) die(`style ${id} at L${at}`);
  const end = H.findIndex((l, k) => k >= at && l.startsWith("</style>"));
  cssFiles.push([`${num++}-refyt-${id}.css`, id, H.slice(at, end).join("\n"), `<style id="${id}"> del <head> (L${at + 1}-L${end})`]);
}
for (const st of report.styles) cssFiles.push([`${num++}-refyt-${st.id}.css`, st.id, st.css.replace(/\n$/, ""), `<style id="${st.id}"> que inyectaba ${st.from}`]);
for (const [file, id, css, from] of cssFiles) writeFileSync(STYLES + file, `/* Refyt · ${from}. Copia exacta del original. */\n${css}\n`);
{
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
