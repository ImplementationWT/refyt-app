// Refyt · v3.30: feedback de Delivery (fechas en cada cambio, visibilidad por persona).
import {
  A, CTYPES, DB, DITEMS, IN, ME, MODALS, PEO, RN, ROLES, S, SETIT, SUPS, TODAY, VERSIONS, VIEWS,
  addDays, cell, dDiff, empty, esc, fld, fm, fmtDy, go, ico, mfoot, modal, numIn, nx, oph, pageAct,
  pill, prOf, rdiv, ready, render, renderLayer, sbItem, scOf, seg, sum, toast, trBar, wrapAlerts,
  wrapRender, wrapRenderLayer
} from "../../index.js";
/* =================== v3.30: Delivery feedback =================== */
/* 1. Ready to install shows the date of every change.  2. Health and safety leaves Delivery (it moves to a Director view later).
   3. Each person sees only their properties; Director and general admins see all (a sample, the rules come later).
   4. Suppliers and orders can be added by hand or from a PDF (the PDF reading is simulated in the demo).
   5. Meeting detail aligned.  6. Raise an order: picking a property works. */

/* ---------- 6. Raise an order: the property and measure pickers ---------- */
IN.oal = t => { const k = t.dataset.k, i = +((k.match(/\d+$/) || ['0'])[0]), f = /^oap/.test(k) ? 'pr' : 'm', a = S.modal && S.modal.al && S.modal.al[i]; if(!a) return;
  a[f] = t.value; if(f === 'pr'){ const p = prOf(t.value); a.m = p && p.ms[0] ? p.ms[0].m : ''; } };

/* ---------- 2. Health and safety leaves Delivery ---------- */
{ const o = VIEWS.del.side; VIEWS.del.side = () => o().replace(/<button class="nav" data-act="pg_del" data-v="hs"[\s\S]*?<\/button>/, ''); }
{ wrapAlerts(a0 => () => a0().filter(a => !(a.fix && a.fix[2] === 'del:hs'))); }
if(S.page.del === 'hs') S.page.del = 'ovw';

/* ---------- 3. Each person sees only their properties ---------- */
export const scBy = n => (DB.sc.find(s => s.n.includes(n)) || {}).id;
DB.vis = DB.vis || {yah:{all:true}, lan:{all:true, admin:true}, tom:{sc:DB.sc.map(s => s.id)}, dre:{sc:[scBy('Medway'), scBy('Redbridge')]}, akr:{sc:[scBy('Redbridge')]},
  sar:{sc:DB.sc.filter(s => s.ty === 'E.ON').map(s => s.id)}, ram:{sc:[scBy('Medway'), scBy('Thanet'), scBy('GLA')]}, ahm:{sc:[scBy('Medway'), scBy('Thanet'), scBy('GLA'), scBy('Redbridge')]}, afa:{own:true, sc:[]}, xen:{own:true, sc:[]}, hse:{sc:[]}};
export const visOf = k => DB.vis[k] || (DB.vis[k] = {sc:[]});
export const seesAll = k => S.role === 'dir' || !!visOf(k).all;
export const canSee = (p, k) => { const v = visOf(k); return v.all || (window.__cs2 && window.__cs2(p, k)) || (v.sc || []).includes(p.sc) || p.b.who === k || (p.b.visit && p.b.visit.by === k); };
export let VISN = null;
export const visWrap = fn => (...x) => { const me = ME(); if(seesAll(me) || VISN) return fn(...x); const all = DB.pr, vis = all.filter(p => canSee(p, me)); vis.find = (...a) => all.find(...a); vis.findIndex = (...a) => all.findIndex(...a);
  DB.pr = vis; window.__prAll = all; VISN = {n:vis.length, t:all.length}; try { return fn(...x); } finally { DB.pr = all; VISN = null; } };
/* the note on the property lists */
export const visNote = () => { if(!VISN) return ''; const v = visOf(ME());
  return `<div class="vis-n">${ico('eye', 15)}<span>You see <b>${VISN.n} of ${VISN.t}</b> properties: ${v.own ? 'the ones you assess' : `the schemes you work on${(v.sc || []).length ? ` (${v.sc.map(id => esc(scOf(id).n)).join(', ')})` : ''}`}. The Director and general admins see all of them.</span></div>`; };
[['del', ['pro', 'rdy', 'hold', 'clo', 'cs', 'ord']], ['ret', ['bk', 'rq', 'pk']], ['com', ['quo', 'mrg']], ['acc', ['trg', 'inv']]].forEach(([a, ks]) => ks.forEach(k => { const f = VIEWS[a].pages[k]; if(!f) return; VIEWS[a].pages[k] = (...x) => { const h = f(...x), n = visNote(); if(!n) return h; const i = h.indexOf('</div></div>', h.indexOf('<div class="op-h">')); return i > 0 ? h.slice(0, i + 12) + n + h.slice(i + 12) : n + h; }; }));
/* Director: Who sees what */
A.visAll = el => { const v = visOf(el.dataset.v); v.all = !v.all; render(); };
A.visSc = el => { const [k, sc] = el.dataset.v.split('|'), v = visOf(k); v.sc = v.sc || []; v.sc = v.sc.includes(sc) ? v.sc.filter(x => x !== sc) : [...v.sc, sc]; render(); };
A.visAs = el => { const r = Object.keys(ROLES).find(x => ROLES[x][1] === el.dataset.v); if(!r) return toast('No role uses this person yet.'); A.setRole({dataset:{v:r}}); };
VIEWS.dir.pages.vis = () => trBar() + oph('Who sees what', 'A sample of property visibility. Each person sees the properties of the schemes ticked here, plus the ones they are assigned to directly (an assessor sees the jobs they assess). The Director and anyone marked as general admin see everything. The final rules will be agreed with REFYT.')
  + `<div class="el-wide"><div class="rf-mx vis-t"><table><thead><tr><th>Person</th><th>Sees every property</th>${DB.sc.map(s => `<th>${esc(s.n)}</th>`).join('')}<th>Sees</th><th></th></tr></thead><tbody>${Object.keys(PEO).map(k => { const v = visOf(k), dir = k === ROLES.dir[1], n = dir || v.all ? DB.pr.length : DB.pr.filter(p => canSee(p, k)).length;
    return `<tr><td><b>${esc(PEO[k].n)}</b><small class="mini" style="display:block">${esc(PEO[k].r)}${v.own ? ', plus the jobs they assess' : ''}</small></td><td>${dir ? pill('tb', 'Director') : `<button class="vis-b${v.all ? ' on' : ''}" data-act="visAll" data-v="${k}" aria-pressed="${!!v.all}">${v.all ? ico('check', 13) + ' General admin' : 'No'}</button>`}</td>${DB.sc.map(s => `<td>${dir || v.all ? '<b class="z">all</b>' : `<button class="vis-c${(v.sc || []).includes(s.id) ? ' on' : ''}" data-act="visSc" data-v="${k}|${s.id}" aria-pressed="${(v.sc || []).includes(s.id)}" aria-label="${esc(PEO[k].n)} sees ${esc(s.n)}">${(v.sc || []).includes(s.id) ? ico('check', 13) : ''}</button>`}</td>`).join('')}<td><b>${n}</b> of ${DB.pr.length}</td><td>${dir ? '' : nx('visAs', k, 'View as', 'sec')}</td></tr>`; }).join('')}</tbody></table></div></div>`;
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => { const h = o(); if(typeof SETIT !== 'undefined' && !SETIT.some(x => x[0] === 'vis')) SETIT.push(['vis', 'Who sees what']); return h.replace('<div class="sb-sec">Settings</div>', `<div class="sb-sec">Settings</div>${sbItem(S.page.dir, pageAct('dir'))(['vis', 'Who sees what', 'user'])}`); }; }

/* ---------- 1. Ready to install: the date of every change ---------- */
export const DSEQ = k => k === 'mat' ? ['Requested', 'Approved', 'Delivered', 'Done'] : ['Booked', 'Done'];
export const DBY = {Approved:'dre', Requested:'dre', Booked:'dre', Delivered:'akr', Done:'dre'};
DB.dh = DB.dh || {}; DB.dcl = DB.dcl || {}; DB.drd = DB.drd || {};
DB.pr.forEach((p, pi) => { const inD = p.ph === 'D. Prepare to install', past = ['E. Install', 'F. Close out', 'Paid'].includes(p.ph); if(!inD && !past) return;
  const base = inD ? p.phOn : addDays(p.phOn, -16); let last = base;
  DITEMS.forEach(([k], ki) => { if(p.dna[k]) return; const seq = DSEQ(k), cur = past ? 'Done' : p.d[k], n = seq.indexOf(cur) + 1; if(n <= 0) return;
    DB.dh[`${p.id}|${k}`] = seq.slice(0, n).map((st, i) => { let on = addDays(base, 1 + i * 2 + (ki + pi) % 3); if(dDiff(on) > 0) on = TODAY; if(on > last) last = on; return {st, on, by:k === 'rams' && st === 'Done' ? 'hse' : DBY[st]}; }); });
  if(past || (inD && ready(p))) DB.drd[p.id] = last; if(past) DB.dcl[p.id] = dDiff(p.phOn) <= 0 && p.ph === 'E. Install' ? p.phOn : addDays(last, 2); });
/* every change made in the app is stamped with the date and the person */
export const dTrack = () => { DB.pr.forEach(p => { if(p.ph === 'D. Prepare to install'){ DITEMS.forEach(([k]) => { if(p.dna[k]) return; const h = DB.dh[`${p.id}|${k}`] || (DB.dh[`${p.id}|${k}`] = []), cur = p.d[k];
      if(cur !== 'Not booked' && (!h.length || h[h.length - 1].st !== cur)) h.push({st:cur, on:TODAY, by:ME()}); }); if(ready(p) && !DB.drd[p.id]) DB.drd[p.id] = TODAY; if(!ready(p)) delete DB.drd[p.id]; }
    else if(['E. Install', 'F. Close out', 'Paid'].includes(p.ph) && DB.drd[p.id] && !DB.dcl[p.id]) DB.dcl[p.id] = TODAY; }); };
A.rdyTl = el => { S.f.rdyTl = S.f.rdyTl === el.dataset.v ? null : el.dataset.v; render(); };
A.rdySeg = el => { S.f.rdyS = el.dataset.v; S.f.rdyTl = null; render(); };
export const dLast = (p, k) => { const h = DB.dh[`${p.id}|${k}`] || []; return h[h.length - 1]; };
export function rdyTimeline(p){ const steps = DITEMS.filter(([k]) => !p.dna[k]).map(([k, n]) => { const h = DB.dh[`${p.id}|${k}`] || [];
    return `<div class="tl-i"><b>${esc(n)}</b><div class="tl-s">${h.length ? h.map(x => `<span class="tl-c ${x.st === 'Done' ? 'ok' : ''}"><em>${x.st}</em>${fmtDy(x.on)}<small>${esc(PEO[x.by] ? PEO[x.by].n : RN('inc'))}</small></span>`).join(`<i class="tl-ar">${ico('chev', 12)}</i>`) : '<span class="tl-c no"><em>Not booked yet</em></span>'}</div></div>`; }).join('');
  const ms = [['Entered phase D', p.ph === 'D. Prepare to install' ? p.phOn : addDays(p.phOn, -16)], ['Ready to install', DB.drd[p.id]], ['Closed, moved to install', DB.dcl[p.id]]];
  return `<div class="tl"><div class="tl-m">${ms.map(([l, d]) => `<div class="${d ? 'on' : ''}"><small>${l}</small><b>${d ? fmtDy(d) : 'Not yet'}</b></div>`).join('')}</div>${steps}</div>`; }
VIEWS.del.pages.rdy = (...x) => { const seg0 = S.f.rdyS || 'open', open = DB.pr.filter(p => p.ph === 'D. Prepare to install'), closed = DB.pr.filter(p => DB.dcl[p.id] && p.ph !== 'D. Prepare to install' && p.ph !== 'Cancelled'), xs = seg0 === 'open' ? open : closed;
  const cellD = (p, k) => { if(p.dna[k]) return '<b class="z">n/a</b>'; const v = seg0 === 'open' ? p.d[k] : 'Done', l = dLast(p, k); return `${v === 'Done' ? pill('tg', 'Done') : v === 'Not booked' ? pill('tk', 'Not booked') : pill('ta', v)}${l ? `<small class="rd-d">${fmtDy(l.on).replace(/, \d{4}$/, '')}</small>` : ''}`; };
  return trBar() + oph('Ready to install', 'Every phase D item per property, with the date of its last change. Open Timeline for each step: requested, approved, booked, delivered, done, and when the property was ready and closed.')
    + `<div class="rf-bar">${seg('rdySeg', seg0, [['open', 'In phase D', open.length], ['closed', 'Closed, moved to install', closed.length]])}</div>`
    + `<div class="el-wide"><div class="rf-mx rd-t"><table><thead><tr><th>Property</th>${DITEMS.map(([, n]) => `<th>${n.split(' ').slice(0, 2).join(' ')}</th>`).join('')}<th>${seg0 === 'open' ? 'Ready' : 'Closed'}</th><th></th></tr></thead><tbody>${xs.map(p => `<tr><td><button class="lnk4" data-act="prIns" data-v="${p.id}"><b>${esc(p.ad)}</b></button><small class="mini" style="display:block">${scOf(p.sc).n}</small></td>${DITEMS.map(([k]) => `<td>${cellD(p, k)}</td>`).join('')}<td>${seg0 === 'open' ? (ready(p) ? `${pill('tg', 'Ready')}<small class="rd-d">since ${fmtDy(DB.drd[p.id] || TODAY).replace(/, \d{4}$/, '')}</small>` : '') : `${pill('tb', 'Closed')}<small class="rd-d">${fmtDy(DB.dcl[p.id]).replace(/, \d{4}$/, '')}</small>`}</td><td>${nx('rdyTl', p.id, S.f.rdyTl === p.id ? 'Hide timeline' : 'Timeline', 'sec')}</td></tr>${S.f.rdyTl === p.id ? `<tr class="tl-row"><td colspan="${DITEMS.length + 3}">${rdyTimeline(p)}</td></tr>` : ''}`).join('') || `<tr><td colspan="${DITEMS.length + 3}">${empty(seg0 === 'open' ? 'No properties in phase D.' : 'No properties closed yet.')}</td></tr>`}</tbody></table></div></div>`; };
VIEWS.del.pages.rdy = (f => (...x) => { const h = f(...x), n = visNote(); return n ? h.replace('<div class="rf-bar">', n + '<div class="rf-bar">') : h; })(VIEWS.del.pages.rdy);

/* ---------- 4. Suppliers and orders, by hand or from a PDF (simulated) ---------- */
DB.supx = DB.supx || {};
export const SUPPDF = [{n:'Northgate Insulation Ltd', ct:'Materials', email:'orders@northgate-insulation.co.uk', phone:'01634 552 018', terms:'30'}, {n:'Brightline Electrical Services', ct:'Subcontract labour', email:'accounts@brightline-electrical.co.uk', phone:'020 8123 4471', terms:'14'}, {n:'Weald Scaffolding', ct:'Scaffold', email:'hire@wealdscaffolding.co.uk', phone:'01892 330 761', terms:'30'}];
A.supNew = () => { S.modal = {k:'sup', tab:'form', n:'', ct:'Materials', email:'', phone:'', terms:'30'}; renderLayer(); };
A.supTab = el => { S.modal.tab = el.dataset.v; renderLayer(); };
A.supList = () => { S.modal = {k:'supl'}; renderLayer(); };
MODALS.sup = m => { const ok = m.n.trim() && !SUPS.includes(m.n.trim());
  const pdfBox = `<label class="pdf-drop"><input type="file" accept="application/pdf,.pdf" data-pdf="sup">${ico('upload', 20)}<b>${m.reading ? 'Reading the PDF...' : 'Choose the supplier’s PDF'}</b><small>A quote, an invoice or a company profile. The details are filled in for you to check.</small></label><p class="hint">Demo: the reading is simulated. Reading real PDFs comes with the integration.</p>`;
  const form = (m.from ? `<div class="pdf-ok">${ico('check', 14)}<span>Read from <b>${esc(m.from)}</b>. Check the details before saving.</span></div>` : '') + fld('Supplier name', 'm', 'n', m.n, {req:true}) + `<small class="tw-lab">Main cost type</small>${seg('mset', m.ct, CTYPES.map(c => [c, c])).replace(/data-act="mset"/g, 'data-act="mset" data-k="ct"')}` + `<div class="rf-g2f">${fld('Email', 'm', 'email', m.email)}${fld('Phone', 'm', 'phone', m.phone)}</div>` + fld('Payment terms (days)', 'm', 'terms', m.terms, {type:'number'}) + (m.n.trim() && SUPS.includes(m.n.trim()) ? '<p class="hint">This supplier already exists.</p>' : '');
  return modal('Add a supplier', 'Type the details in, or upload a PDF and check what was read.', `${seg('supTab', m.tab, [['form', 'Type it in'], ['pdf', 'From a PDF']])}<div style="margin-top:12px">${m.tab === 'pdf' ? pdfBox : form}</div>`, mfoot('Save supplier', 'supOk', ok), 620); };
A.supOk = () => { const m = S.modal, n = m.n.trim(); SUPS.push(n); DB.supx[n] = {ct:m.ct, email:m.email, phone:m.phone, terms:numIn(m.terms) || 30, on:TODAY, by:ME(), from:m.from || ''}; S.modal = null; render(); toast(`${esc(n)} added. It is in the supplier list for new orders.`); };
MODALS.supl = () => modal('Suppliers', `${SUPS.length} suppliers. New ones show who added them and how.`, SUPS.map(n => { const x = DB.supx[n], sp = sum(DB.or.filter(o => o.sup === n && o.st !== 'Rejected'), o => o.amt);
  return rdiv(cell(esc(n), x ? `${x.ct}${x.email ? ', ' + esc(x.email) : ''}` : 'Existing supplier', 2.4) + cell(fm(sp), `${DB.or.filter(o => o.sup === n).length} orders`) + cell(x ? `Added ${fmtDy(x.on)}` : '', x ? (x.from ? 'from a PDF' : 'by hand') : '')); }).join(''), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button><button class="btn pri lg" data-act="supNew">Add a supplier</button></div>`, 760);
A.orPdf = () => { S.modal = {k:'opdf'}; renderLayer(); };
MODALS.opdf = m => modal('Order from a PDF', 'Upload the supplier’s quote or order. The order is filled in for you to check, then it goes for approval like any other.', `<label class="pdf-drop"><input type="file" accept="application/pdf,.pdf" data-pdf="or">${ico('upload', 20)}<b>${m.reading ? 'Reading the PDF...' : 'Choose the PDF'}</b><small>Supplier, cost type, properties and amounts are read from it.</small></label><p class="hint">Demo: the reading is simulated. Reading real PDFs comes with the integration.</p>`, `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Cancel</button></div>`, 560);
document.addEventListener('change', e => { const t = e.target; if(!t.matches || !t.matches('input[type=file][data-pdf]') || !t.files || !t.files[0]) return; const f = t.files[0].name, kind = t.dataset.pdf; S.modal.reading = true; renderLayer();
  setTimeout(() => { if(!S.modal) return; const h = [...f].reduce((a, c) => a + c.charCodeAt(0), 0);
    if(kind === 'sup'){ const s = SUPPDF.find(x => f.toLowerCase().includes(x.n.split(' ')[0].toLowerCase())) || SUPPDF[h % SUPPDF.length]; Object.assign(S.modal, {tab:'form', reading:false, from:f, n:s.n, ct:s.ct, email:s.email, phone:s.phone, terms:s.terms}); renderLayer(); return; }
    const vis = DB.pr.filter(p => p.ph === 'D. Prepare to install' && canSee(p, ME())), p1 = vis[h % Math.max(1, vis.length)] || DB.pr.find(p => p.ph === 'D. Prepare to install'), p2 = vis.length > 1 ? vis[(h + 1) % vis.length] : null, sup = SUPS[h % SUPS.length];
    S.modal = {k:'or', fromPdf:f, sup, ct:'Materials', al:[{pr:p1.id, m:p1.ms[0].m, a:String(800 + h % 900)}, ...(p2 && p2.id !== p1.id ? [{pr:p2.id, m:p2.ms[0].m, a:String(500 + h % 600)}] : [])]}; renderLayer(); }, 900); });
{ const o = MODALS.or; MODALS.or = m => { const h = o(m); return m.fromPdf ? h.replace('<small class="tw-lab">', `<div class="pdf-ok">${ico('check', 14)}<span>Read from <b>${esc(m.fromPdf)}</b>. Check the supplier, properties and amounts before sending.</span></div><small class="tw-lab">`) : h; }; }
{ const f = VIEWS.del.pages.ord; VIEWS.del.pages.ord = (...x) => f(...x).replace(/(<button[^>]*data-act="orNew"[^>]*>[\s\S]*?<\/button>)/, `${nx('supList', '', 'Suppliers', 'sec')}${nx('supNew', '', 'Add a supplier', 'sec')}${nx('orPdf', '', 'Order from a PDF', 'sec')}$1`); }

/* ---------- 5. Meeting detail: aligned ---------- */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const f = VIEWS[a].pages.mtg; if(!f) return; VIEWS[a].pages.mtg = (...x) => { const h = f(...x); return S.f.mtd ? `<div class="mtd">${h}</div>` : h; }; });

/* ---------- render: stamp changes first, then draw what this person may see ---------- */
wrapRender(visWrap); wrapRenderLayer(visWrap);
{ wrapRender(r => (...x) => { dTrack(); return r(...x); }); }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/29wyadFF8i8dPozufMJ3B2'; } });
VERSIONS.push({v:'v3.30', date:TODAY, major:false, current:true, url:null, title:'Delivery: dates on every change, visibility, suppliers and fixes', sum:'Ready to install shows the date of every change and a timeline per property; Health and safety leaves Delivery; each person sees only their properties (a sample); suppliers and orders can be added by hand or from a PDF (simulated); meeting detail aligned; picking a property in Raise an order works.', steps:[
  {t:'Ready to install, with dates', min:1, dolor:'Before, you saw the status of each item but not when it changed.', show:['Each item shows the date of its last change; Ready shows since when.', 'Timeline opens each step with its date and who did it, and when the property was ready and closed.', 'Closed, moved to install lists the properties that already left phase D.'], say:'When things happened, not only where they are.', go:() => { S.role = 'inc'; S.trail = null; go('del', 'rdy'); }},
  {t:'Each person sees their properties', min:1, dolor:'Before, everyone saw every property.', show:['Viewing as Install coordinator: only Medway and Redbridge; a note says what you see.', 'Director: Settings, Who sees what, to tick the schemes per person and mark general admins.'], say:'Less noise for each person; the full picture for the Director.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'vis'); }},
  {t:'Suppliers and orders from a PDF', min:.5, dolor:'Before, suppliers were a fixed list and orders were typed in.', show:['Purchasing: Add a supplier, by hand or from a PDF.', 'Order from a PDF fills Raise an order for you to check.', 'In the demo the PDF reading is simulated.'], say:'Less typing, the same approval.', go:() => { S.role = 'inc'; S.trail = null; go('del', 'ord'); }},
]});
