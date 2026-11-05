// Refyt · v3.22: Director, avance por equipo y la barra para volver.
// Copia del original ("Refyt, demo v3.27.html"), con el mismo código.
import {
  $, A, APPI, APPN, APPS, DB, DD, LIMIT, PEO, PROGS, RN, S, TODAY, VERSIONS, VIEWS, allowed,
  approvals, buckets, cbx, chart, daysIn, esc, fPr, fSc, fk, fm, fmtDy, go, grpPct, holdOpen, ico,
  isBlocked, late, mgTag, nx, oph, ovCard, ovEmpty, ovLink, ovRow, pIdx, pMoney, pageAct, pc, pill,
  plural, prOf, ready, render, sbItem, scMoney, scOf, stat, sum, toast, tvals
} from "../../index.js";
/* =================== v3.22: Progress by team, and a way back =================== */
/* The director reads each team's progress in one place, with the same structure for every team.
   Nothing is copied: every figure and view opens the team's own screen, with a bar to come back. */

/* Back bar: jumps from the content keep the trail; the menu, the app switcher and Viewing as clear it */
S.trail = null;
export const trLabel = (a, p) => { const m = (VIEWS[a] && VIEWS[a].side ? VIEWS[a].side() : '').match(new RegExp(`data-v="${p}"[^>]*>(?:<span class="ni">[\\s\\S]*?</span>)?([^<]+)`)); return m ? m[1].trim() : (p === 'ovw' ? 'Overview' : p); };
export const trBar = () => S.trail ? `<div class="tr-back"><button data-act="trBack"><span class="tr-ic">${ico('chev', 14)}</span>Back to ${APPN[S.trail.app]}, ${esc(S.trail.lbl)}</button></div>` : '';
export const PRGL = {pcom:'Commercial progress', pret:'Retrofit progress', pdel:'Delivery progress'};
export const trPush = () => { const pg = S.page[S.view]; S.trail = {app:S.view, page:pg, lbl:S.view === 'dir' && PRGL[pg] ? PRGL[pg] : trLabel(S.view, pg)}; };
A.trBack = () => { const t = S.trail; S.trail = null; if(t) go(t.app, t.page); };
A.trGo = el => { const [a, p] = el.dataset.v.split(':'); if(!allowed(a)) return toast(`${APPN[a]} is not available for ${RN(S.role)}.`); trPush(); go(a, p); };
{ const og = A.gogo; A.gogo = el => { const [a, p] = el.dataset.v.split(':'); if(allowed(a) && (a !== S.view || p !== S.page[S.view])) trPush(); og(el); }; }
{ const ov = A.view, os = A.setRole; A.view = el => { S.trail = null; ov(el); }; A.setRole = el => { S.trail = null; os(el); }; }
APPS.forEach(([a]) => { const k = pageAct(a), o = A[k]; if(o) A[k] = el => { S.trail = null; o(el); }; });

/* Shared pieces of a team progress page. v3.23: monitoring from the Director app.
   Filter by programme and scheme; each figure opens, right here, the list behind it; rows open the record in the panel. */
export const prgF = v => Number.isInteger(v) ? String(v) : v.toFixed(1);
export const prgView = (team, to, t, d) => `<div class="pg-v"><div><b>${t}</b><small>${d}</small></div>${nx('trGo', to, `Open in ${APPN[team]}`, 'sec')}</div>`;
export const pgRow = (p, side) => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${p.id}">${esc(p.ad)}</button>`, `${scOf(p.sc).n}, ${p.ph}`, side);
export const prgStuck = (p, why, tone) => pgRow(p, pill(tone, why));
export const prgPlan = team => { const live = fSc().filter(s => s.st === 'Live'), t = sum(live, s => s.tgt || 0); return Math.max(1, Math.round(t / ({ret:40, del:52}[team] || 40))); };
export const inSc = p => p && fSc().some(s => s.id === p.sc);
A.pgK = el => { S.f.pgk = S.f.pgk === el.dataset.v ? null : el.dataset.v; render(); };
export function prgPage(team, line, kpis, ch, stuck, views, dash){
  const d = DD(), sel = kpis.find(k => S.f.pgk === `${team}:${k[0]}`), rows = sel ? sel[5]() : [];
  const flt = `<div class="rf-df pg-df">${cbx('Programme', 'dfpg', [['', 'All programmes'], ...PROGS.map(x => [x.id, x.n])], d.pg, 'df')}${cbx('Scheme and client', 'dfsc', [['', 'All schemes'], ...DB.sc.filter(x => !d.pg || x.prog === d.pg).map(x => [x.id, x.n, x.cl])], d.sc, 'df')}${d.pg || d.sc ? `<div class="pg-clr">${nx('dReset', '', 'Clear filters', 'sec')}</div>` : ''}</div>`;
  return oph(`${APPN[team]} progress`, line) + flt
    + `<div class="cstats ov-k">${kpis.map(([k, tone, l, v, ss]) => stat(tone, l, v, ss, 'pgK', `${team}:${k}`, S.f.pgk === `${team}:${k}`)).join('')}</div>`
    + (sel ? `<div class="pg-det">${ovCard(sel[2], `${plural(rows.length, 'item', 'items')}${d.sc ? ' in ' + esc(scOf(d.sc).n) : ''}. Open a row to see the full record; click the figure again to close.`, rows.slice(0, 12).join('') || ovEmpty('Nothing here.'), rows.length > 12 ? `<small class="pg-n">and ${rows.length - 12} more</small>` : '')}</div>` : '')
    + ch
    + `<div class="ov-g">${ovCard('Stuck or at risk', stuck.length ? `${plural(stuck.length, 'item', 'items')}, the most urgent first.` : 'Nothing stuck.', stuck.slice(0, 6).join('') || ovEmpty('Nothing over its limit.'), stuck.length > 6 ? `<small class="pg-n">and ${stuck.length - 6} more</small>` : '')}`
    + ovCard(`In the ${APPN[team]} app`, `Only when you need the team’s full screen. It opens in their app in monitoring mode, with a bar to come back.`, views.join(''), dash.map(([to, t]) => ovLink(to, t)).join('')) + '</div>';
}

export function pgCom(){ const ps = fPr().filter(p => pIdx(p.ph) >= 2), m = ps.map(p => [p, pMoney(p)]).filter(x => x[1].q), q = sum(m, x => x[1].q), fc = sum(m, x => x[1].fc), mg = q ? (q - fc) / q * 100 : 0;
  const scs = fSc().filter(s => scMoney(s).won), tg = scs.length ? sum(scs, s => s.set.mg) / scs.length : 22, below = m.filter(([p, x]) => x.mgp < scOf(p.sc).set.mg), over = m.filter(x => x[1].over), va = DB.va.filter(v => inSc(prOf(v.pr)) && !['Approved', 'Rejected'].includes(v.st)), b = buckets();
  const mgSide = ([p, x]) => `<span class="ov-num">${mgTag(x.mgp, scOf(p.sc).set.mg)}<small>target ${pc(scOf(p.sc).set.mg)}</small></span>`;
  const stuck = below.map(([p, x]) => prgStuck(p, `Margin ${pc(x.mgp)}, target ${pc(scOf(p.sc).set.mg)}`, 'tred')).concat(over.filter(([p]) => !below.some(y => y[0] === p)).map(([p]) => prgStuck(p, 'Over budget', 'ta')));
  return prgPage('com', 'Is the work making money? Margins against target, budgets and the changes that move them.',
    [['mg', mg < tg ? 'ta' : 'tk', 'Forecast margin', pc(mg), `average target ${pc(tg)}`, () => m.slice().sort((a, b2) => a[1].mgp - b2[1].mgp).map(x => pgRow(x[0], mgSide(x)))],
     ['below', below.length ? 'tred' : 'tk', 'Below target', below.length, 'properties', () => below.map(x => pgRow(x[0], mgSide(x)))],
     ['over', over.length ? 'ta' : 'tk', 'Over budget', over.length, 'properties', () => over.map(([p, x]) => pgRow(p, `<span class="ov-num">${fk(x.fc)}<small>budget ${fk(x.b)}</small></span>${pill('ta', 'Over budget')}`))],
     ['va', va.length ? 'ta' : 'tk', 'Variations and costs open', fk(sum(va, v => v.amt)), plural(va.length, 'item', 'items'), () => va.map(v => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${v.pr}">${v.id}, ${esc(prOf(v.pr).ad)}</button>`, `${v.ty}: ${esc(v.why)}`, `<span class="ov-num">${fm(v.amt)}</span>${pill('ta', esc(v.st))}`))]],
    chart(tvals(mg, 'cmg', b.n).map(v => Math.round(v)), b.lab, pc, `Forecast margin by ${DD().tr}, against the average target`, Array(b.n).fill(Math.round(tg)), ['Forecast margin', 'Target']),
    stuck,
    [prgView('com', 'com:mrg', 'Margins', 'Forecast and actual margin per scheme and property.'), prgView('com', 'com:quo', 'Quotes and budgets', 'Quote, budget, committed and forecast cost per measure.'), prgView('com', 'com:var', 'Variations and costs', 'What moves the margin, and what the client pays back.')],
    [['dir:dsup', 'Suppliers'], ['dir:dperf', 'Scheme performance']]); }

export function pgRet(){ const ps = fPr(), as = ps.filter(p => p.b.vis), rvp = ps.filter(p => p.b.revisits), rv = sum(rvp, p => p.b.revisits), rft = as.length ? Math.round((as.length - Math.min(rv, as.length)) / as.length * 100) : 100;
  const rq = approvals().filter(a => ['aap', 'dap'].includes(a.role) && inSc(a.p)), pk = ps.filter(p => p.ph === 'C. Client approval'), b = buckets(), plan = prgPlan('ret');
  const ab = ps.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph));
  const stuck = ab.filter(p => late(p)).sort((x, y) => daysIn(y) / LIMIT[y.ph] - daysIn(x) / LIMIT[x.ph]).map(p => prgStuck(p, `${daysIn(p)} days, limit ${LIMIT[p.ph]}`, late(p) === 'red' ? 'tred' : 'ta'))
    .concat(ab.filter(p => !late(p) && p.b.revisits).map(p => prgStuck(p, `Revisit ${p.b.revisits}`, 'ta')));
  return prgPage('ret', 'Phases A and B: are assessments booked, done right first time and turned into survey packs on time?',
    [['done', 'tk', 'Assessments done', as.length, 'visits completed', () => as.slice().sort((x, y) => (x.b.on || '') < (y.b.on || '') ? 1 : -1).map(p => pgRow(p, `<span class="ov-num">${p.b.on ? fmtDy(p.b.on) : ''}<small>${p.b.who ? PEO[p.b.who].n : ''}</small></span>`))],
     ['rft', rft < 80 ? 'ta' : 'tk', 'Right first time', pc(rft), plural(rv, 'revisit', 'revisits'), () => rvp.map(p => pgRow(p, pill('ta', `Revisit ${p.b.revisits}`)))],
     ['rq', rq.length ? 'ta' : 'tk', 'Waiting for review', rq.length, 'assessments, documents, designs', () => rq.map(a => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${a.p.id}">${esc(a.t)}</button>`, a.k, pill('tb', RN(a.role))))],
     ['pk', pk.length ? 'ta' : 'tk', 'With the client', pk.length, 'survey packs to approve', () => pk.map(p => pgRow(p, `<span class="ov-num">${daysIn(p)} days<small>limit ${LIMIT[p.ph]}</small></span>`))]],
    chart(tvals(Math.max(1, Math.round(as.length / 3)), 'rass', b.n).map(Math.round), b.lab, prgF, `Assessments completed by ${DD().tr}, against plan`, Array(b.n).fill(plan), ['Completed', 'Plan']),
    stuck,
    [prgView('ret', 'ret:bk', 'Bookings', 'Each assessor’s calendar, by week or month.'), prgView('ret', 'ret:rq', 'Review queue', 'Everything waiting for review, with its documents.'), prgView('ret', 'ret:pk', 'Survey pack', 'What each client has received.')],
    [['dir:dprod', 'Team productivity'], ['dir:dqual', 'Quality and compliance']]); }

export function pgDel(){ const ps = fPr(), dn = ps.filter(p => ['F. Close out', 'Paid'].includes(p.ph)), rd = ps.filter(p => p.ph === 'D. Prepare to install' && ready(p)), ho = ps.filter(p => p.ph === 'E. Install' && holdOpen(p));
  const def = ps.filter(p => ['D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph)), lt = def.filter(p => late(p)), b = buckets(), plan = prgPlan('del');
  const lim = p => `<span class="ov-num">${daysIn(p)} days<small>limit ${LIMIT[p.ph]}</small></span>`;
  const stuck = ho.map(p => prgStuck(p, 'Hold point', 'tred')).concat(def.filter(p => !ho.includes(p) && isBlocked(p)).map(p => prgStuck(p, 'Blocked', 'tred')), lt.filter(p => !ho.includes(p) && !isBlocked(p)).sort((x, y) => daysIn(y) / LIMIT[y.ph] - daysIn(x) / LIMIT[x.ph]).map(p => prgStuck(p, `${daysIn(p)} days, limit ${LIMIT[p.ph]}`, late(p) === 'red' ? 'tred' : 'ta')), ps.filter(p => p.csTodo).map(p => prgStuck(p, 'System update', 'ta')));
  return prgPage('del', 'Phases D, E and F: are jobs ready, installing and closing out on time?',
    [['dn', 'tk', 'Installs completed', dn.length, 'in close out or paid', () => dn.map(p => pgRow(p, pill(p.ph === 'Paid' ? 'tg' : 'tb', p.ph === 'Paid' ? 'Paid' : 'Close out')))],
     ['rd', rd.length ? 'tg' : 'tk', 'Ready to install', rd.length, 'every phase D item done', () => rd.map(p => pgRow(p, pill('tg', 'Ready to install')))],
     ['ho', ho.length ? 'tred' : 'tk', 'Hold points open', ho.length, 'blocking the next group', () => ho.map(p => pgRow(p, `<span class="ov-num">${grpPct(p)}%<small>installed</small></span>${pill('tred', 'Hold point')}`))],
     ['lt', lt.length ? 'tred' : 'tk', 'Over the phase limit', lt.length, `of ${def.length} in phases D to F`, () => lt.map(p => pgRow(p, lim(p)))]],
    chart(tvals(Math.max(1, Math.round(dn.length / 2)), 'dinst', b.n).map(Math.round), b.lab, prgF, `Installs completed by ${DD().tr}, against plan`, Array(b.n).fill(plan), ['Completed', 'Plan']),
    stuck,
    [prgView('del', 'del:pro', 'Properties', 'Every property by phase and scheme.'), prgView('del', 'del:hold', 'Redbridge tracker', 'Progress per group, hold points and blocks.'), prgView('del', 'del:clo', 'Close out', 'Handover packs and lodgement.'), prgView('del', 'del:ord', 'Purchasing', 'Orders by status and supplier.')],
    [['dir:dops', 'Operations'], ['dir:dcap', 'Capacity and staffing']]); }

/* Director menu: Progress by team after Business; the dashboards keep the business questions */
{ const o = VIEWS.dir.side, act = pageAct('dir');
  const stuckN = t => t === 'com' ? DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled' && pMoney(p).q && (pMoney(p).mgp < scOf(p.sc).set.mg || pMoney(p).over)).length : t === 'ret' ? DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && late(p)).length : DB.pr.filter(p => ['D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph) && (late(p) || (p.ph === 'E. Install' && holdOpen(p)))).length;
  VIEWS.dir.side = () => { const it = sbItem(S.page.dir, act), h = o().replace(new RegExp(`<button class="nav" data-act="${act}" data-v="(dops|dprod|dsup)"[\\s\\S]*?</button>`, 'g'), '');
    const sec = it(['-', 'Progress by team']) + [['pcom', 'com'], ['pret', 'ret'], ['pdel', 'del']].map(([k, t]) => it([k, APPN[t], APPI[t] || 'chart', stuckN(t), 2])).join('');
    return h.replace('<div class="sb-sec">Dashboards</div>', sec + '<div class="sb-sec">Dashboards</div>'); };
  Object.assign(VIEWS.dir.pages, {pcom:pgCom, pret:pgRet, pdel:pgDel}); }

/* Every page shows the back bar while there is a trail */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => Object.keys(VIEWS[a].pages).forEach(k => { const f = VIEWS[a].pages[k]; VIEWS[a].pages[k] = (...x) => trBar() + f(...x); }));

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/4A8UcahFoaAAXq5YQ3zKBo'; } });
VERSIONS.push({v:'v3.22', date:TODAY, major:false, current:true, url:null, title:'Progress by team, with a way back', sum:'The director reads Commercial, Retrofit and Delivery progress in one place, with the same structure for each team, and opens the team’s own screens with a bar to come back. Dashboards keep the business questions.', steps:[
  {t:'Progress by team', min:.5, dolor:'Before, team progress was spread across eight dashboards and three apps.', show:['A new section in the Director menu: Commercial, Retrofit and Delivery.', 'The count shows how many items are stuck in each team.'], say:'One place to read how each team is doing.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'pret'); }},
  {t:'The same four parts for every team', min:1, dolor:'Before, each dashboard had its own layout.', show:['Four figures, the trend against plan, what is stuck, and where to look.', 'Commercial shows margins; Retrofit, assessments; Delivery, installs.'], say:'Read one team and you can read them all.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'pdel'); }},
  {t:'Open the team’s screen, and come back', min:.5, dolor:'Before, a figure took you to another app with no way back.', show:['Open a view or click a figure: it opens in the team’s app.', 'The bar at the top says Back to Director, and returns to the same page.'], say:'Go to where the work is done, and come back in one click.', go:() => { S.role = 'dir'; S.trail = {app:'dir', page:'pret', lbl:'Retrofit progress'}; go('ret', 'rq'); }},
  {t:'Dashboards answer the business questions', min:.5, dolor:'Before, Operations, Team productivity and Suppliers sat next to the business dashboards.', show:['Dashboards: Business overview, Scheme performance, Finance, Capacity and staffing, Quality and compliance.', 'Operations, Team productivity and Suppliers open from the team pages.'], say:'Business at the top, teams below.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dbiz'); }},
]});
