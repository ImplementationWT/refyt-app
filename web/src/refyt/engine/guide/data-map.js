// Refyt · Datos: el proceso de la A a la Z.
import {
  $, A, APPI, APPN, APPS, APPT, BSTEPS, DB, DITEMS, HELP, IN, PEO, PROGS, RATE, RGROUPS, ROLES, S, SUP,
  abrir, go, grpH, hint, ico, num, oph, pageAct, patchLayer, refocus, render, renderLayer, scrollHL,
  seenSet, stat, sum, toast
} from "../index.js";
export const AZRULE = 'A <b>programme</b> manages <b>schemes</b>; each scheme brings <b>properties</b> with their <b>measures</b>. Retrofit evidences and designs, the client approves in its own system, Delivery prepares and installs, <b>purchasing</b> turns into committed then actual cost, and Accounts raises the <b>invoice</b> when the trigger is met. Five apps, one database.';
export const AZFLOW = ['A. Job received', 'B. Assess and design', 'C. Client approval', 'D. Prepare', 'E. Install', 'F. Close out and payment'];
export const AZ = [
  ['A and B, Retrofit', [['ret', 'bk', 'Import and book', 'Jobs come from the client’s list.', ['pr', 'cu', 'sc']], ['ret', 'wait', 'Review, revisits, design', 'Rejections book and count a revisit.', ['rs', 'pm']], ['ret', 'pk', 'Survey pack', 'Reminder to update the client system.', ['pr']]]],
  ['C, Commercial', [['com', 'quo', 'Quote and budget per measure', 'Locked when the client approves.', ['qc', 'rt']]]],
  ['D and E, Delivery', [['del', 'rdy', 'Ready to install', 'Sets itself.', ['in', 'pr']], ['del', 'ord', 'Orders', 'Committed, then actual cost.', ['pu', 'va']], ['del', 'hold', 'Install and hold points', 'Hold points block the next group.', ['in']]]],
  ['F, Delivery and Accounts', [['del', 'clo', 'Close out', 'Handover, lodgement, uploads.', ['ho']], ['acc', 'trg', 'Invoice and payment', 'When the trigger is met.', ['iv', 'sp']]]],
];
export const DGR = {wrk:['Schemes and properties', 'tb'], ops:['Operations', 'tb'], mon:['Money, restricted', 'tk'], cfg:['Settings and team', 'tk']};
export const R_ = (n, t) => [n, t];
export const B = (k, n, g, d, f, c) => ({k, n, g, d, md:'Database table', f:f.map(x => R_(x[0], x[1])), c});
export const DBS = [
  B('pg', 'Programmes', 'wrk', 'One row per programme manager.', [['Schemes', '→ Contracts (schemes)']], () => PROGS.length),
  B('sc', 'Contracts (schemes)', 'wrk', 'Settings, client system and contract lead.', [['Programme', '→ Programmes'], ['Margin target and limits', 'Numbers']], () => DB.sc.length),
  B('cu', 'Customers', 'wrk', 'The person living in the home.', [['Property', '→ Projects (properties)']], () => DB.pr.length),
  B('pr', 'Projects (properties)', 'wrk', 'The main record.', [['Scheme', '→ Contracts (schemes)'], ['Client job reference', 'Text'], ['Phase', 'Status'], ['Ready to install', 'Formula']], () => DB.pr.length),
  B('pm', 'Property measures', 'wrk', 'One row per measure per property.', [['Property', '→ Projects (properties)'], ['Design and approval', 'Status']], () => sum(DB.pr, p => p.ms.length)),
  B('rs', 'Retrofit Surveys', 'ops', 'Evidence, revisits, predicted rating.', [['Property', '→ Projects (properties)'], ['Revisits', 'Numbers']], () => DB.pr.length),
  B('in', 'Installation', 'ops', 'Phase D items, hold points, groups.', [['Property', '→ Projects (properties)']], () => DB.pr.length),
  B('ho', 'Handover', 'ops', 'Handover pack and uploads.', [['Property', '→ Projects (properties)']], () => DB.pr.length),
  B('ps', 'Pipeline Stages', 'cfg', 'Per programme type, with time limits.', [['Programme type', 'Dropdown']], () => 6),
  B('ct', 'Checklist Templates', 'cfg', 'By programme, measure and house type.', [['Measure', 'Dropdown']], () => BSTEPS.length + DITEMS.length + RGROUPS.length),
  B('rt', 'Rates', 'mon', 'Agreed price per measure.', [['Programme type', 'Dropdown']], () => sum(Object.values(RATE), o => Object.keys(o).length)),
  B('qc', 'Quotes & Costs', 'mon', 'Per measure: quoted, budget, committed, forecast.', [['Property measure', '→ Property measures']], () => sum(DB.pr, p => p.ms.length)),
  B('pu', 'Purchasing', 'mon', 'Orders, split across properties.', [['Property', '→ Projects (properties)'], ['Status', 'Status']], () => DB.or.length),
  B('va', 'Variations and additional costs', 'mon', 'Reason, amount, evidence.', [['Property measure', '→ Property measures']], () => DB.va.length),
  B('sp', 'Subcontractor payments', 'mon', 'Against a completed stage.', [['Property', '→ Projects (properties)']], () => DB.sp.length),
  B('iv', 'Invoices', 'mon', 'Trigger met, raised, due, paid.', [['Property', '→ Projects (properties)']], () => DB.inv.length),
  B('tm', 'Team', 'cfg', 'People and regions.', [['Role', 'Dropdown']], () => Object.keys(PEO).length),
  B('ro', 'Roles per scheme', 'cfg', 'Who fills each placeholder role.', [['Scheme', '→ Contracts (schemes)'], ['Person', 'People']], () => Object.keys(ROLES).length * DB.sc.length),
  B('tk', 'Tasks', 'cfg', 'From meetings and jobs.', [['Owner role', 'Dropdown']], () => DB.tk.length),
  B('mt', 'Meetings', 'cfg', 'Monday, Thursday, Tuesday.', [['Tasks', '→ Tasks']], () => 3),
  B('sl', 'Settings log', 'cfg', 'Who changed which setting.', [['Scheme', '→ Contracts (schemes)']], () => sum(DB.sc, s => s.log.length)),
];
export const ACC = {
  dir:{pg:'w', sc:'w', pr:'r', pm:'r', rs:'r', in:'r', ho:'r', ps:'w', ct:'w', rt:'r', qc:'r', pu:'r', va:'w', sp:'w', iv:'r', tm:'w', ro:'w', tk:'w', mt:'r', sl:'r'},
  com:{pg:'r', sc:'w', pr:'r', pm:'r', rt:'w', qc:'w', pu:'r', va:'w', sp:'r', iv:'w', ro:'r', tk:'w', sl:'r'},
  acc:{pg:'r', sc:'r', pr:'r', pm:'r', ho:'r', qc:'r', pu:'w', va:'r', sp:'w', iv:'w', ro:'r', tk:'w'},
  ret:{sc:'r', cu:'w', pr:'w', pm:'w', rs:'w', ps:'r', ct:'r', tm:'r', ro:'r', tk:'w'},
  del:{sc:'r', cu:'w', pr:'w', pm:'w', rs:'r', in:'w', ho:'w', ps:'r', ct:'r', pu:'w', va:'w', sp:'w', tm:'r', ro:'r', tk:'w'},
  tsk:{pr:'r', tk:'w', mt:'w', ro:'r'},
};

A.ficha = el => { if(String(getSelection() || '').length > 2) return; S.fi[S.view] = el.dataset.v; S.ft = 'res'; S.hl = null; S.modal = null; render(true); };
A.fichaback = () => { const id = S.fi[S.view]; S.fi[S.view] = null; S.hl = id; render(true); scrollHL(); };
A.ft = el => { S.ft = el.dataset.v; render(); };
A.goid = el => { const [id, t] = el.dataset.v.split('|'); abrir(S.view, id, t || 'res'); };
A.gogo = el => { const [a, p] = el.dataset.v.split(':'); go(a, p); };
A.alseen = el => { seenSet().add(el.dataset.v); render(); toast('Marked as seen.', 'Undo', () => { seenSet().delete(el.dataset.v); render(); }); };
A.alunseen = el => { seenSet().delete(el.dataset.v); render(); };
A.mset = el => { S.modal[el.dataset.k] = el.dataset.v; renderLayer(); };
A.mclose = () => { S.modal = null; renderLayer(); };
A.cbo = el => { S.cbo = S.cbo === el.dataset.v ? null : el.dataset.v; S.cbq = ''; S.modal ? renderLayer() : render(); requestAnimationFrame(() => { const i = document.querySelector('.cbx.open input'); if(i) i.focus(); }); };
A.cbc = () => { S.cbo = null; S.cbq = ''; S.modal ? renderLayer() : render(); };
A.cbp = el => { const k = el.dataset.key, inn = el.dataset.inn, v = el.dataset.v; S.cbo = null; S.cbq = ''; IN[inn]({dataset:{k, in:inn}, value:v}); S.modal ? renderLayer() : render(); };
IN.cbq = t => { S.cbq = t.value; refocus(() => S.modal ? renderLayer() : render()); };
export const CBK = {osup:'sup', vapr:'pr'};
IN.m = t => { if(!S.modal) return; S.modal[CBK[t.dataset.k] || t.dataset.k] = t.value; if(t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.getAttribute('inputmode') !== 'decimal')) patchLayer(); else refocus(renderLayer); };
IN.f = t => { S.f[t.dataset.k] = t.value; refocus(render); };
export function helpPage(app){ const H = HELP[app];
  return oph(`How ${APPN[app]} works`, H.intro) + `<section class="rsec"><div class="rs-h"><h3>The process</h3><p>${H.who}</p></div><div class="hflow">${H.flow.map((x, i) => `<span><i>${i + 1}</i>${x}</span>`).join(`<b>${ico('chev', 14, 2.4)}</b>`)}</div></section>`
    + grpH('Views and user stories', H.views.length) + `<div class="hgrid">${H.views.map(([k, n, ic, d, st]) => `<section class="hcard"><div class="hc-h"><span class="oi2">${ico(ic, 18)}</span><div><b>${n}</b><small>${d}</small></div><button class="btn sec sm" data-act="${pageAct(app)}" data-v="${k}">Open</button></div><ul>${st.map(x => `<li>${x}</li>`).join('')}</ul></section>`).join('')}</div>`
    + grpH('How it connects with the other apps', H.rel.length) + `<div class="hrel">${H.rel.map(([a, dir, t]) => `<div class="hr"><button class="hr-a ${APPT[a]}" data-act="view" data-v="${a}"><span class="si">${ico(APPI[a], 16)}</span>${APPN[a]}</button><em>${dir}</em><p>${t}</p></div>`).join('')}</div>`
    + grpH('Assumptions in this version', SUP.length) + `<div class="xsec"><ul class="supl">${SUP.map(x => `<li>${x}</li>`).join('')}</ul></div>` + hint(`The full data map, and which app reads or writes each database, is in <button class="lnk4 in" data-act="view" data-v="db"><b>Data</b></button>.`); }
export const DBK = k => DBS.find(x => x.k === k);
export function azPage(){ let n = 0; return `<section class="rsec azk"><div class="rs-h"><h3>The rule</h3><p>${AZRULE}</p></div><div class="hflow">${AZFLOW.map((x, i) => `<span><i>${i + 1}</i>${x}</span>`).join(`<b>${ico('chev', 14, 2.4)}</b>`)}</div></section>`
  + AZ.map(([ph, steps]) => `<div class="gh azh">${ph}<span>${steps.length}</span></div><div class="azl">${steps.map(([app, pg, t, d, dbs]) => { n++; const [, an, ic, tone] = APPS.find(x => x[0] === app);
    return `<div class="azs"><div class="azn ${tone}">${n}</div><div class="azc"><div class="azt"><b>${t}</b><button class="azapp ${tone}" data-act="goto" data-a="${app}" data-v="${pg}"><span class="ai2">${ico(ic, 13)}</span>${an}</button></div><p>${d}</p><div class="azd"><small>Data</small>${dbs.map(k => `<button class="rel" data-act="dbselm" data-v="${k}">${DBK(k).n}</button>`).join('')}</div></div></div>`; }).join('')}</div>`).join(''); }
export function dbPage(){
  const sel = S.dbSel && DBK(S.dbSel), mode = S.dbm, rk = t => (DBS.find(x => x.n === t.replace(/^Sum of /, '').slice(2)) || {}).k || '';
  const groups = Object.entries(DGR).map(([g, [n, tone]]) => `<div class="dbg ${tone}"><div class="dbgh"><span class="kd"></span>${n}</div>${DBS.filter(x => x.g === g).map(x => `<button class="dbc${sel && sel.k === x.k ? ' on' : ''}" data-act="dbsel" data-v="${x.k}" data-apps="${APPS.filter(([a]) => ACC[a][x.k]).map(([a]) => a).join(' ')}"><b>${x.n}</b><span>${num(x.c())}</span></button>`).join('')}</div>`).join('');
  const detail = sel ? `<div class="dbd"><div class="dbdh"><div><small>${DGR[sel.g][0]}</small><h3>${sel.n}</h3></div><button class="ib" data-act="dbsel" data-v="" aria-label="Close">${ico('x', 16)}</button></div><p>${sel.d}</p><div class="dbk"><div><small>Records today</small><b>${num(sel.c())}</b></div><div><small>Stored as</small><b class="sm">${sel.md}</b></div></div><h4>Fields</h4><div class="dbf">${sel.f.map(([n, t]) => `<div><span>${n}</span>${t.includes('→') ? `<button class="rel" data-act="dbsel" data-v="${rk(t)}">${t}</button>` : `<em>${t}</em>`}</div>`).join('')}</div><h4>Apps that use it</h4><div class="dba">${APPS.filter(([a]) => ACC[a][sel.k]).map(([a, n, ic, tone]) => `<div class="${tone}"><span class="ai2">${ico(ic, 15)}</span><b>${n}</b><span class="acc ${ACC[a][sel.k]}">${ACC[a][sel.k] === 'w' ? 'Creates and edits' : 'Reads'}</span></div>`).join('')}</div></div>`
    : `<div class="dbd empty2"><span class="oi2">${ico('info', 20)}</span><h3>Choose a database</h3><p>You will see its fields, which databases it connects to and which app creates or reads it.</p></div>`;
  const map = `<div class="dbmap" id="dbmap"><svg class="dbsvg" id="dbsvg"></svg><div class="dbapps">${APPS.map(([a, n, ic, tone]) => `<button class="dbapp ${tone}${S.dbApp === a ? ' on' : ''}" data-act="dbapp" data-v="${a}"><span class="ai2">${ico(ic, 18)}</span><div><b>${n}</b><small>${Object.values(ACC[a]).filter(x => x === 'w').length} create, ${Object.values(ACC[a]).filter(x => x === 'r').length} read</small></div></button>`).join('')}</div><div class="dbgs">${groups}</div>${detail}</div>`;
  const matrix = `<div class="dbmx"><table><thead><tr><th>Database</th>${APPS.map(([a, n, ic, tone]) => `<th class="${tone}"><span class="ai2">${ico(ic, 14)}</span>${n}</th>`).join('')}</tr></thead><tbody>${Object.entries(DGR).map(([g, [n]]) => `<tr class="gr"><td colspan="${APPS.length + 1}">${n}</td></tr>${DBS.filter(x => x.g === g).map(x => `<tr><td><button class="lnk3" data-act="dbselm" data-v="${x.k}">${x.n}</button><small>${num(x.c())} records</small></td>${APPS.map(([a]) => `<td>${ACC[a][x.k] ? `<span class="acc ${ACC[a][x.k]}">${ACC[a][x.k] === 'w' ? 'Creates and edits' : 'Reads'}</span>` : ''}</td>`).join('')}</tr>`).join('')}`).join('')}</tbody></table></div>`;
  return `<div class="op-h"><div><h1>${mode === 'az' ? 'The process from A to Z' : mode === 'mx' ? 'Access table' : 'Databases'}</h1><p>The ${APPS.length} apps work on the same ${DBS.length} databases in the REFYT system. What one app creates, the others see instantly.</p></div><div class="eh-a"><div class="seg2 vm"><button data-act="dbm" data-v="az" aria-pressed="${mode === 'az'}">${ico('route', 15)}From A to Z</button><button data-act="dbm" data-v="map" aria-pressed="${mode === 'map'}">${ico('db', 15)}Map</button><button data-act="dbm" data-v="mx" aria-pressed="${mode === 'mx'}">${ico('grid', 15)}Access table</button></div></div></div>`
    + `<div class="cstats">${stat('tb', 'Databases', DBS.length, 'in the REFYT system')}${stat('tg', 'App to database connections', Object.values(ACC).reduce((a, o) => a + Object.keys(o).length, 0))}${stat('ta', 'Sample records', num(DBS.reduce((a, x) => a + x.c(), 0)))}</div>` + (mode === 'az' ? azPage() : mode === 'mx' ? matrix : map);
}
export function dbLines(){ const map = $('#dbmap'), svg = $('#dbsvg'); if(!map || !svg) return; const R = map.getBoundingClientRect(); svg.setAttribute('width', R.width); svg.setAttribute('height', R.height); const focus = S.dbApp, selK = S.dbSel; let h = '';
  APPS.forEach(([a, , , tone]) => { const ap = map.querySelector(`.dbapp[data-v="${a}"]`); if(!ap) return; const r1 = ap.getBoundingClientRect(), x1 = r1.right - R.left, y1 = r1.top + r1.height / 2 - R.top;
    Object.entries(ACC[a]).forEach(([k, m]) => { const c = map.querySelector(`.dbc[data-v="${k}"]`); if(!c) return; const r2 = c.getBoundingClientRect(), x2 = r2.left - R.left, y2 = r2.top + r2.height / 2 - R.top, mx = (x1 + x2) / 2, on = (focus && focus === a) || (selK && selK === k), dim = (focus && focus !== a) || (selK && selK !== k && !focus);
      h += `<path class="ln ${tone}${m === 'r' ? ' rd' : ''}${on ? ' on' : ''}${dim ? ' dim' : ''}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`; }); });
  svg.innerHTML = h; map.querySelectorAll('.dbc').forEach(c => { const apps = c.dataset.apps.split(' '); c.classList.toggle('dim', !!focus && !apps.includes(focus)); c.classList.toggle('lit', !!focus && apps.includes(focus)); }); }
A.dbsel = el => { S.dbSel = el.dataset.v || null; S.dbApp = null; render(); };
A.dbselm = el => { S.dbSel = el.dataset.v; S.dbm = 'map'; S.dbApp = null; render(); };
A.dbapp = el => { S.dbApp = S.dbApp === el.dataset.v ? null : el.dataset.v; S.dbSel = null; render(); };
A.dbm = el => { S.dbm = el.dataset.v; render(); };
A.goto = el => go(el.dataset.a, el.dataset.v);
