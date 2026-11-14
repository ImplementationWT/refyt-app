// Refyt · v5.11: Quality and compliance en Director: acreditaciones y seguros, auditorías y renovaciones.
import {
  A, CHK55, DB, IN, ME, MODALS, PEO, S, TODAY, VERSIONS, VIEWS, addDays, dDiff, empty, esc, fbar57,
  fld, fmtDy, fromIso, ico, isAdmin, iso, loadPdf54, mfoot, modal, norm, oph, plural, re57,
  renderLayer, stat, sum, swap57, toast, trBar
} from "../../index.js";
/* =================== v5.11: Quality and compliance in Director: accreditations and insurances, audits and the renewals calendar in one dashboard =================== */
DB.qc = [
  {id:'QC1', n:'MCS certification', ty:'Accreditation', by:'MCS', no:'NAP-58213', d:25},
  {id:'QC2', n:'TrustMark registration', ty:'Accreditation', by:'TrustMark', no:'TM-1180473', d:60},
  {id:'QC3', n:'PAS 2030 certification', ty:'Accreditation', by:'BSI', no:'PAS-2030-4417', d:200},
  {id:'QC4', n:'Constructionline Gold', ty:'Accreditation', by:'Constructionline', no:'CL-772901', d:75},
  {id:'QC5', n:'Public liability insurance', ty:'Insurance', by:'Hiscox, £5m cover', no:'PL-90311', d:9},
  {id:'QC6', n:'Employers liability insurance', ty:'Insurance', by:'Hiscox, £10m cover', no:'EL-90312', d:140},
  {id:'QC7', n:'Professional indemnity insurance', ty:'Insurance', by:'QBE, £2m cover', no:'PI-55120', d:305},
  {id:'QC8', n:'Contractors all risk insurance', ty:'Insurance', by:'Aviva', no:'CAR-20834', d:-4}
].map(x => ({...x, exp:addDays(TODAY, x.d), file:null, his:[]}));
DB.aud = [
  {id:'AU1', n:'TrustMark annual audit', who:'TrustMark', sc:'Workmanship and customer care', on:addDays(TODAY, -20), res:'Passed', act:0},
  {id:'AU2', n:'PAS 2030 surveillance', who:'BSI', sc:'Installation process and records', on:addDays(TODAY, -45), res:'Passed with actions', act:2},
  {id:'AU3', n:'Site health and safety audit', who:'Helen Price', sc:'Two live sites, RAMS and PPE', on:addDays(TODAY, -8), res:'Passed with actions', act:1},
  {id:'AU4', n:'MCS surveillance audit', who:'MCS', sc:'Solar PV installs and paperwork', on:addDays(TODAY, 18), res:'Scheduled', act:0},
  {id:'AU5', n:'Retrofit records file audit', who:'Helen Price', sc:'PAS 2035 files, 10 properties', on:addDays(TODAY, 40), res:'Scheduled', act:0}
];
S.f.qcq = ''; S.f.qct = ''; S.f.qcs = ''; S.f.qcm = 0;
export const qcEd60 = () => isAdmin() || S.role === 'hse';
export const qcSt60 = x => { const d = dDiff(x.exp); return d < 0 ? 'exp' : d <= 60 ? 'soon' : 'ok'; };
export const QCS60 = {ok:['Valid', 'ok'], soon:['Expiring soon', 'bk'], exp:['Expired', 'bl']};
export const qcPill60 = x => { const s = qcSt60(x), [l, c] = QCS60[s]; return `<span class="rd55-p ${c}">${s === 'ok' ? CHK55 : ico('alert', 13, 2.2)}${l}</span>`; };
export const AUC60 = {'Passed':'ok', 'Passed with actions':'bk', 'Failed':'bl', 'Scheduled':'ap'};
export const dLeft60 = x => { const d = dDiff(x.exp); return d < 0 ? `${-d} days ago` : d === 0 ? 'today' : `in ${d} days`; };
export function qcEvents60(){ return [...DB.qc.map(x => ({on:x.exp, k:'qc', id:x.id, n:x.n, c:qcSt60(x)})), ...DB.aud.map(a => ({on:a.on, k:'au', id:a.id, n:a.n, c:'aud'}))]; }
export function qcCal60(){ const base = fromIso(TODAY), first = new Date(base.getFullYear(), base.getMonth() + S.f.qcm, 1), y = first.getFullYear(), mo = first.getMonth(), days = new Date(y, mo + 1, 0).getDate(), lead = (first.getDay() + 6) % 7, ev = qcEvents60();
  const cells = []; for(let i = 0; i < lead; i++) cells.push('<div class="qc-d out"></div>');
  for(let d = 1; d <= days; d++){ const ds = iso(new Date(y, mo, d)), es = ev.filter(e => e.on === ds), today = ds === TODAY;
    cells.push(`<div class="qc-d${today ? ' today' : ''}${es.length ? ' has' : ''}"><span class="qc-dn">${d}</span>${es.slice(0, 2).map(e => `<button type="button" class="qc-ev ${e.c}" data-act="${e.k === 'qc' ? 'qcOpen60' : 'auOpen60'}" data-v="${e.id}" data-tip="${esc(e.n)}, ${esc(fmtDy(e.on))}">${esc(e.n)}</button>`).join('')}${es.length > 2 ? `<small class="qc-more">+${es.length - 2} more</small>` : ''}</div>`); }
  const label = first.toLocaleDateString('en-GB', {month:'long', year:'numeric'});
  return `<div class="q54-ch"><h3>${ico('cal', 17)}Renewals calendar</h3><div class="qc-nav"><button type="button" class="qc-nb" data-act="qcM60" data-v="-1" aria-label="Previous month">${ico('chev', 16, 2.2)}</button><b>${label}</b><button type="button" class="qc-nb nx" data-act="qcM60" data-v="1" aria-label="Next month">${ico('chev', 16, 2.2)}</button>${S.f.qcm ? `<button type="button" class="btn sec sm" data-act="qcM60" data-v="0">Today</button>` : ''}</div></div>
    <div class="qc-leg"><span><i class="exp"></i>Expired</span><span><i class="soon"></i>Expiring in 60 days</span><span><i class="ok"></i>Valid</span><span><i class="aud"></i>Audit</span></div>
    <div class="qc-wk">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span>${d}</span>`).join('')}</div><div class="qc-grid">${cells.join('')}</div>`; }
export function qcNext60Base(){ const ev = qcEvents60().filter(e => dDiff(e.on) >= -30).sort((a, b) => a.on < b.on ? -1 : 1).slice(0, 7);
  return `<div class="q54-ch"><h3>${ico('clock', 17)}Coming up</h3></div><div class="qc-up">${ev.map(e => { const d = dDiff(e.on); return `<button type="button" class="qc-ui" data-act="${e.k === 'qc' ? 'qcOpen60' : 'auOpen60'}" data-v="${e.id}"><span class="qc-ud ${e.c}"><b>${fromIso(e.on).getDate()}</b><small>${fromIso(e.on).toLocaleDateString('en-GB', {month:'short'})}</small></span><span class="qc-ut"><b>${esc(e.n)}</b><small>${e.k === 'au' ? 'Audit' : 'Expires'} ${d < 0 ? `${-d} days ago` : d === 0 ? 'today' : `in ${d} days`}</small></span>${ico('chev', 14, 2.2)}</button>`; }).join('')}</div>`; }
export function qcRows60(){ const q = norm(S.f.qcq); return DB.qc.filter(x => (!S.f.qct || x.ty === S.f.qct) && (!S.f.qcs || qcSt60(x) === S.f.qcs) && (!q || norm(`${x.n} ${x.by} ${x.no}`).includes(q))).sort((a, b) => a.exp < b.exp ? -1 : 1); }
export function qcBar60(){ const c = patch => swap57(patch, () => qcRows60().length), nf = (S.f.qct ? 1 : 0) + (S.f.qcs ? 1 : 0);
  return fbar57({id:'qc', qk:'f', qv:['qcq'], ph:'Search a certificate, insurer or number', nf, clr:'qcClr60', count:plural(qcRows60().length, 'item', 'items'),
    cols:[{t:'Type', opts:[['', 'All types'], ['Accreditation', 'Accreditations'], ['Insurance', 'Insurances']].map(([k, n]) => ({a:'qcTy60', v:k, n, c:c({qct:k}), on:S.f.qct === k}))},
      {t:'Status', opts:[['', 'All statuses'], ['exp', 'Expired'], ['soon', 'Expiring in 60 days'], ['ok', 'Valid']].map(([k, n]) => ({a:'qcSt60', v:k, n, c:c({qcs:k}), on:S.f.qcs === k}))}],
    chips:[...(S.f.qct ? [['qcTy60', '', S.f.qct === 'Insurance' ? 'Insurances' : 'Accreditations']] : []), ...(S.f.qcs ? [['qcSt60', '', QCS60[S.f.qcs][0]]] : [])]}); }
VIEWS.dir.pages.dqual = function dQual60(){ const ex = DB.qc.filter(x => qcSt60(x) === 'exp'), so = DB.qc.filter(x => qcSt60(x) === 'soon'), ok = DB.qc.filter(x => qcSt60(x) === 'ok'), acts = sum(DB.aud, a => a.act), nx = DB.aud.filter(a => a.res === 'Scheduled').sort((a, b) => a.on < b.on ? -1 : 1)[0], ed = qcEd60();
  const rows = qcRows60().map(x => `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="qcOpen60" data-v="${x.id}">${esc(x.n)}</button><small>${esc(x.no)}</small></td><td><span class="rd55-sc" style="background:${x.ty === 'Insurance' ? '#CFFAFE;color:#155E75' : '#EDE9FE;color:#5B21B6'}">${x.ty}</span></td><td class="qc-l">${esc(x.by)}</td><td class="m59-n">${fmtDy(x.exp)}<small>${dLeft60(x)}</small></td><td>${qcPill60(x)}</td><td>${x.file ? `<button type="button" class="rd55-q has" data-act="qcFile60" data-v="${x.id}">${ico('file', 15, 2)}View</button>` : '<span class="rd55-dash" title="No certificate file yet">–</span>'}</td><td>${ed ? `<button type="button" class="rd56-tlb" data-act="qcOpen60" data-v="${x.id}">${ico('upload', 14, 2)}Renew</button>` : ''}</td></tr>`).join('');
  const aud = DB.aud.slice().sort((a, b) => a.on < b.on ? 1 : -1).map(a => `<tr><td class="m59-n">${fmtDy(a.on)}<small>${dDiff(a.on) >= 0 ? `in ${dDiff(a.on)} days` : `${-dDiff(a.on)} days ago`}</small></td><td class="rd55-pr"><button class="rd55-pn" data-act="auOpen60" data-v="${a.id}">${esc(a.n)}</button><small>${esc(a.sc)}</small></td><td class="qc-l">${esc(a.who)}</td><td><span class="rd55-p ${AUC60[a.res]}">${a.res === 'Passed' ? CHK55 : a.res === 'Scheduled' ? ico('cal', 13, 2.2) : ico('alert', 13, 2.2)}${a.res}</span></td><td>${a.act ? `<span class="qc-act">${plural(a.act, 'action', 'actions')} open</span>` : '<span class="rd55-dash">–</span>'}</td><td>${ed ? `<button type="button" class="rd56-tlb" data-act="auOpen60" data-v="${a.id}">${ico('edit', 14, 2)}${a.res === 'Scheduled' ? 'Record result' : 'Update'}</button>` : ''}</td></tr>`).join('');
  return trBar() + oph('Quality and compliance', 'Company accreditations and insurances, audits and every renewal date, in one place.')
    + `<div class="cstats ov-k m59-k">${[stat('tk', 'Valid', ok.length, `of ${plural(DB.qc.length, 'item', 'items')}`, 'qcSt60', 'ok', S.f.qcs === 'ok'), stat('ta', 'Expiring in 60 days', so.length, so.length ? `next: ${so.slice().sort((a, b) => a.exp < b.exp ? -1 : 1)[0].n}` : 'nothing due', 'qcSt60', 'soon', S.f.qcs === 'soon'), stat(ex.length ? 'tred' : 'tg', 'Expired', ex.length, ex.length ? ex.map(x => x.n).join(', ') : 'all in date', 'qcSt60', 'exp', S.f.qcs === 'exp'), stat(acts ? 'ta' : 'tg', 'Audit actions open', acts, nx ? `next audit ${fmtDy(nx.on).replace(/, \d{4}$/, '')}` : '')].join('')}</div>`
    + `<div class="qc-top"><section class="rsec q54-c">${qcCal60()}</section><section class="rsec q54-c">${qcNext60()}</section></div>`
    + `<div class="qc-h"><h2>${ico('shield', 18)}Accreditations and insurances</h2>${ed ? `<button type="button" class="btn sec sm" data-act="qcNew60">${ico('plus', 14)}Add</button>` : ''}</div>${qcBar60()}`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t qc-t"><thead><tr><th>Name</th><th>Type</th><th>Issuer or insurer</th><th>Expires</th><th>Status</th><th>Certificate</th><th><span class="sr">Renew</span></th></tr></thead><tbody>${rows || `<tr><td colspan="7">${empty('Nothing matches the search or the filters.')}</td></tr>`}</tbody></table></div></section>`
    + `<div class="qc-h"><h2>${ico('clip', 18)}Audits</h2>${ed ? `<button type="button" class="btn sec sm" data-act="auNew60">${ico('plus', 14)}Add audit</button>` : ''}</div>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t qc-t"><thead><tr><th>Date</th><th>Audit</th><th>Auditor</th><th>Result</th><th>Actions</th><th><span class="sr">Update</span></th></tr></thead><tbody>${aud}</tbody></table></div></section>`
    + `<p class="hint" style="margin-top:12px">Sample items to show the layout; the real list comes from REFYT’s compliance manager.</p>`; };
A.qcM60 = el => { const v = +el.dataset.v; S.f.qcm = v === 0 ? 0 : S.f.qcm + v; re57(); };
A.qcTy60 = el => { S.f.qct = el.dataset.v; re57(); };
A.qcSt60 = el => { S.f.qcs = S.f.qcs === el.dataset.v && el.closest('.stat') ? '' : el.dataset.v; re57(); };
A.qcClr60 = () => { S.f.qct = ''; S.f.qcs = ''; re57(); };
/* Renew or view an item */
export const qcOf60 = id => DB.qc.find(x => x.id === id);
A.qcOpen60 = el => { const x = qcOf60(el.dataset.v); S.modal = {k:'qc60', id:x.id, d:x.exp, f:null}; renderLayer(); };
A.qcNew60 = () => { S.modal = {k:'qcn60', n:'', ty:'Accreditation', by:'', no:'', d:addDays(TODAY, 365), f:null}; renderLayer(); };
export const qcFileIn60 = () => `<label class="btn sec lg q54-rep">${ico('upload', 15)}${S.modal.f ? esc(S.modal.f.name) : 'Add the certificate, PDF or image'}<input type="file" accept="application/pdf,.pdf,image/*" data-in="qcf60"></label>`;
IN.qcf60 = t => { const f = t.files && t.files[0]; if(!f || !S.modal) return; const r = new FileReader(); r.onload = () => { S.modal.f = {name:f.name, type:f.type || (/\.pdf$/i.test(f.name) ? 'application/pdf' : ''), size:f.size, url:r.result, by:ME(), on:TODAY}; renderLayer(); }; r.readAsDataURL(f); };
MODALS.qc60 = m => { const x = qcOf60(m.id), ed = qcEd60();
  return modal(esc(x.n), `${x.ty}, ${esc(x.by)}. Number ${esc(x.no)}. Expires ${fmtDy(x.exp)}, ${dLeft60(x)}.`,
    `<div class="qc-mst">${qcPill60(x)}${x.file ? `<button type="button" class="rd55-q has" data-act="qcFile60" data-v="${x.id}">${ico('file', 15, 2)}View certificate</button>` : ''}</div>`
    + (ed ? `<p class="hint" style="margin:14px 0 8px">Renew: the new expiry date and the new certificate.</p><div class="rf-2">${fld('New expiry date', 'm', 'd', m.d, {type:'date', req:true})}<div>${qcFileIn60()}</div></div>` : '')
    + (x.his.length ? `<small class="rf-ph" style="display:block;margin-top:14px">History</small>${x.his.slice().reverse().map(h => `<p class="hint" style="margin:4px 0">${esc(h)}</p>`).join('')}` : ''),
    ed ? mfoot('Save renewal', 'qcSave60', !!m.d && m.d !== x.exp || !!m.f) : `<button class="btn pri lg" data-act="mclose">Close</button>`, 620); };
A.qcSave60 = () => { const m = S.modal, x = qcOf60(m.id); const old = x.exp; if(m.d) x.exp = m.d; if(m.f) x.file = m.f; x.his.push(`${fmtDy(TODAY)}: renewed by ${PEO[ME()].n}, expiry ${fmtDy(old)} to ${fmtDy(x.exp)}${m.f ? `, certificate ${m.f.name}` : ''}`); S.modal = null; renderLayer(); re57(); toast(`${x.n} renewed until ${fmtDy(x.exp)}.`); };
MODALS.qcn60 = m => modal('Add an accreditation or insurance', 'It joins the list and the renewals calendar.',
  `${fld('Name', 'm', 'n', m.n, {req:true, ph:'e.g. Gas Safe registration'})}<div class="q54-tg" style="margin:10px 0">${['Accreditation', 'Insurance'].map(t => `<button type="button" data-act="mset" data-k="ty" data-v="${t}" aria-pressed="${m.ty === t}">${t}</button>`).join('')}</div><div class="rf-2">${fld('Issuer or insurer', 'm', 'by', m.by, {ph:'e.g. Gas Safe Register'})}${fld('Number', 'm', 'no', m.no, {})}</div><div class="rf-2">${fld('Expiry date', 'm', 'd', m.d, {type:'date', req:true})}<div>${qcFileIn60()}</div></div>`,
  mfoot('Add', 'qcAdd60', !!(m.n || '').trim() && !!m.d), 620);
A.qcAdd60 = () => { const m = S.modal; DB.qc.push({id:'QC' + (DB.qc.length + 1) + '-' + Date.now() % 1000, n:m.n.trim(), ty:m.ty, by:m.by || '', no:m.no || '', exp:m.d, file:m.f, his:[`${fmtDy(TODAY)}: added by ${PEO[ME()].n}`]}); S.modal = null; renderLayer(); re57(); toast('Added to the list and the calendar.'); };
A.qcFile60 = el => { const x = qcOf60(el.dataset.v); if(!x.file) return; S.modal = {k:'qcv60', id:x.id}; renderLayer(); if(/pdf/.test(x.file.type)) setTimeout(() => qfDrawAny60(x.file), 30); };
MODALS.qcv60 = m => { const x = qcOf60(m.id), f = x.file; return modal(esc(x.n), `${esc(f.name)}. Added by ${PEO[f.by].n}, ${fmtDy(f.on)}.`, /^image\//.test(f.type) ? `<div class="q54-view"><img src="${f.url}" alt="${esc(x.n)}"></div>` : /pdf/.test(f.type) ? `<div class="q54-view" id="qv54"><p class="hint">Opening the PDF...</p></div>` : `<div class="q54-view"><p class="hint">There is no preview for this type of file.</p></div>`, `<button class="btn pri lg" data-act="mclose">Close</button>`, 860); };
export async function qfDrawAny60(f){ const box = document.getElementById('qv54'); if(!box) return;
  try { const L = await loadPdf54(), bin = atob(f.url.split(',')[1]), u8 = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const doc = await L.getDocument({data:u8, isEvalSupported:false}).promise; box.innerHTML = ''; const w = Math.max(280, box.clientWidth - 2), dpr = window.devicePixelRatio || 1;
    for(let i = 1; i <= Math.min(doc.numPages, 12); i++){ const pg = await doc.getPage(i), v0 = pg.getViewport({scale:1}), vp = pg.getViewport({scale:w / v0.width * dpr}), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; c.style.width = w + 'px'; box.appendChild(c); await pg.render({canvasContext:c.getContext('2d'), viewport:vp}).promise; }
  } catch(e){ box.innerHTML = '<p class="hint">The preview could not open this PDF here.</p>'; } }
/* Audits */
export const auOf60 = id => DB.aud.find(a => a.id === id);
A.auOpen60 = el => { const a = auOf60(el.dataset.v); S.modal = {k:'au60', id:a.id, n:a.n, who:a.who, sc:a.sc, d:a.on, res:a.res, act:String(a.act)}; renderLayer(); };
A.auNew60 = () => { S.modal = {k:'au60', id:null, n:'', who:'', sc:'', d:addDays(TODAY, 30), res:'Scheduled', act:'0'}; renderLayer(); };
MODALS.au60 = m => { const ed = qcEd60(); return modal(m.id ? esc(m.n) : 'Add an audit', m.id ? `${esc(m.who)}, ${fmtDy(m.d)}. ${esc(m.sc)}.` : 'It joins the audit list and the renewals calendar.',
  (m.id ? '' : `${fld('Audit', 'm', 'n', m.n, {req:true, ph:'e.g. Gas Safe inspection'})}<div class="rf-2">${fld('Auditor', 'm', 'who', m.who, {ph:'Body or person'})}${fld('Scope', 'm', 'sc', m.sc, {})}</div>`)
  + `<div class="rf-2">${fld('Date', 'm', 'd', m.d, {type:'date', req:true})}${fld('Open actions', 'm', 'act', m.act, {ph:'0'})}</div><small class="rf-ph" style="display:block;margin:12px 0 6px">Result</small><div class="mf53-ops">${Object.keys(AUC60).map(r => `<button type="button" class="mf53-op${m.res === r ? ' on' : ''}" data-act="${ed ? 'mset' : ''}" data-k="res" data-v="${r}">${r}</button>`).join('')}</div>`,
  ed ? mfoot(m.id ? 'Save' : 'Add audit', 'auSave60', !!(m.n || '').trim() && !!m.d) : `<button class="btn pri lg" data-act="mclose">Close</button>`, 620); };
A.auSave60 = () => { const m = S.modal, act = Math.max(0, parseInt(m.act, 10) || 0); if(m.id){ Object.assign(auOf60(m.id), {on:m.d, res:m.res, act}); } else DB.aud.push({id:'AU' + Date.now() % 100000, n:m.n.trim(), who:m.who || '', sc:m.sc || '', on:m.d, res:m.res, act}); S.modal = null; renderLayer(); re57(); toast(m.id ? 'Audit updated.' : 'Audit added.'); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.10') v.url = 'https://claude.ai/artifact/28LzGvm1hUL9Nw7ucY1o59'; } });
VERSIONS.push({v:'v5.11', date:TODAY, major:false, current:true, url:null, title:'Quality and compliance in one dashboard', sum:'Director › Quality and compliance brings together company accreditations and insurances, audits and a renewals calendar, with key figures, renewals with the certificate, and audit results.', steps:[]});
/* Later layers wrap or replace qcNext60 (the original reassigns it). Kept as var: no temporal dead zone. */
export var qcNext60W = null;
export function qcNext60(...x){ return (qcNext60W || qcNext60Base)(...x); }
export const wrapQcNext60 = w => { qcNext60W = w(qcNext60W || qcNext60Base); };
