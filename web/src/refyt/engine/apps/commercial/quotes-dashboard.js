// Refyt · v5.4: Quotes and budgets como dashboard, con el archivo del presupuesto.
import {
  A, DB, IN, ME, MEAS, MODALS, PEO, S, TODAY, VERSIONS, VIEWS, empty, esc, fm, fmtDy, his, ico,
  mMoney, modal, oph, pIdx, pMoney, pc, pill, plural, prOf, qBar63, qQ63, quoPage3, render,
  renderLayer, scOf, setQuoPage3, stat, sum, toast
} from "../../index.js";
/* =================== v5.4: Quotes and budgets as a dashboard, with the quote file =================== */
S.f.qsc = ''; S.f.qm = ''; S.f.qst = ''; S.f.qby = 'sc'; S.f.qdv = 'val';
export const QC54 = {q:'#6366F1', b:'#F97316', ok:'#10B981', wait:'#F59E0B'};
export const qBase54 = () => DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled');
export const qSt54 = (p, st) => !st || (st === 'ok' ? p.quoteOk : st === 'wait' ? !p.quoteOk : !p.qf);
export const qF54 = (skip = '') => qBase54().filter(p => (skip === 'sc' || !S.f.qsc || p.sc === S.f.qsc) && (skip === 'm' || !S.f.qm || p.ms.some(x => x.m === S.f.qm)) && (skip === 'st' || qSt54(p, S.f.qst)));
export const kfm54 = v => '£' + (v >= 10000 ? Math.round(v / 1000) + 'k' : v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : Math.round(v));
export function qBars54(){ const by = S.f.qby, ps = qF54(by === 'sc' ? 'sc' : 'm'), sel = by === 'sc' ? S.f.qsc : S.f.qm;
  const gs = by === 'sc' ? [...new Set(ps.map(p => p.sc))].map(id => { const xs = ps.filter(p => p.sc === id); return {k:id, n:scOf(id).n, q:sum(xs, p => pMoney(p).q), b:sum(xs, p => pMoney(p).b)}; })
    : Object.keys(MEAS).map(m => { let q = 0, b = 0; ps.forEach(p => p.ms.filter(x => x.m === m).forEach(x => { const k = mMoney(p, x); q += k.q; b += k.b; })); return {k:m, n:MEAS[m].s, q, b}; }).filter(g => g.q > 0);
  if(!gs.length) return empty('Nothing to chart with these filters.');
  const W = 620, H = 250, L = 46, B = 40, T = 12, iw = W - L - 8, ih = H - B - T, mx = Math.max(...gs.map(g => g.q)) * 1.12 || 1, gw = iw / gs.length, bw = Math.min(30, gw * .28);
  const y = v => T + ih - v / mx * ih, grid = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - 8}" y1="${y(mx * f)}" y2="${y(mx * f)}" class="q54-gl"/><text x="${L - 8}" y="${y(mx * f) + 4}" text-anchor="end" class="q54-ax">${kfm54(mx * f)}</text>`).join('');
  const bars = gs.map((g, i) => { const cx = L + gw * i + gw / 2, dim = sel && sel !== g.k, nm = esc(g.n), lines = g.n.length > 13 && g.n.includes(' ') ? [g.n.slice(0, g.n.lastIndexOf(' ', 13) > 0 ? g.n.lastIndexOf(' ', 13) : g.n.indexOf(' ')), g.n.slice((g.n.lastIndexOf(' ', 13) > 0 ? g.n.lastIndexOf(' ', 13) : g.n.indexOf(' ')) + 1)] : [g.n];
    const tip = `${g.n}: quoted ${fm(g.q)}, budget ${fm(g.b)}. Click to ${sel === g.k ? 'show all' : 'filter'}.`;
    return `<g class="q54-bar${dim ? ' dim' : ''}${sel === g.k ? ' on' : ''}" data-act="qBar54" data-v="${esc(g.k)}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="${cx - gw / 2 + 2}" y="${T}" width="${gw - 4}" height="${ih}" class="q54-hit" rx="8"/><rect x="${cx - bw - 3}" y="${y(g.q)}" width="${bw}" height="${T + ih - y(g.q)}" rx="5" fill="${QC54.q}"/><rect x="${cx + 3}" y="${y(g.b)}" width="${bw}" height="${T + ih - y(g.b)}" rx="5" fill="${QC54.b}"/>${lines.map((t, j) => `<text x="${cx}" y="${H - B + 18 + j * 14}" text-anchor="middle" class="q54-xl">${esc(t)}</text>`).join('')}</g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Quoted and budget by ${by === 'sc' ? 'scheme' : 'measure'}">${grid}${bars}</svg>`; }
export function qDonut54(){ const ps = qF54('st'), val = S.f.qdv === 'val', f = p => val ? pMoney(p).q : 1, ok = sum(ps.filter(p => p.quoteOk), f), wt = sum(ps.filter(p => !p.quoteOk), f), tot = ok + wt;
  if(!tot) return empty('No quotes with these filters.');
  const r = 64, C = 2 * Math.PI * r, segs = [['ok', 'Approved', ok, QC54.ok], ['wait', 'Waiting for the client', wt, QC54.wait]].filter(s => s[2] > 0); let off = 0;
  const arcs = segs.map(([k, n, v, c]) => { const len = v / tot * C, gap = segs.length > 1 ? 2.5 : 0, tip = `${n}: ${val ? fm(v) : plural(v, 'property', 'properties')}, ${pc(v / tot * 100)}. Click to ${S.f.qst === k ? 'show all' : 'filter'}.`, a = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${c}" stroke-width="${S.f.qst === k ? 32 : 26}" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)" class="q54-seg${S.f.qst && S.f.qst !== 'nofile' && S.f.qst !== k ? ' dim' : ''}" data-act="qSt54" data-v="${k}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"/>`; off += len; return a; }).join('');
  return `<div class="q54-dn"><svg viewBox="0 0 180 180" class="q54-dsvg">${arcs}<text x="90" y="88" text-anchor="middle" class="q54-big">${pc(ok / tot * 100)}</text><text x="90" y="108" text-anchor="middle" class="q54-sm">approved</text></svg><div class="q54-lg">${[['ok', 'Approved', ok, QC54.ok], ['wait', 'Waiting', wt, QC54.wait]].map(([k, n, v, c]) => `<button type="button" class="q54-li${S.f.qst === k ? ' on' : ''}" data-act="qSt54" data-v="${k}"><span style="background:${c}"></span><b>${n}</b><em>${val ? kfm54(v) : v}</em></button>`).join('')}</div></div>`; }
export function qRow54(p){ const m = pMoney(p), f = p.qf;
  const fb = f ? `<button type="button" class="q54-fb has" data-act="qfView54" data-v="${p.id}" title="View the quote file: ${esc(f.name)}" aria-label="View the quote file for ${esc(p.ad)}">${ico('file', 16)}<span>View</span></button>`
    : `<label class="q54-fb" data-act="qfLab54" title="Add the quote file (PDF or image)">${ico('upload', 15)}<span>Add file</span><input type="file" accept="application/pdf,.pdf,image/*" data-in="qf54" data-k="${p.id}" aria-label="Add the quote file for ${esc(p.ad)}"></label>`;
  return `<div class="q54-row" data-act="prQuo3" data-v="${p.id}" tabindex="0"><div class="q54-p"><b>${esc(p.ad)}</b><small>${esc(scOf(p.sc).n)}</small></div><div class="q54-ms">${p.ms.map(x => `<span>${MEAS[x.m].s}</span>`).join('')}</div><div class="q54-v"><b>${fm(m.q)}</b><small>budget ${fm(m.b)}</small></div><div class="q54-st">${p.quoteOk ? pill('tg', 'Approved') : pill('tk', 'Waiting')}</div><div class="q54-f">${fb}</div></div>`; }
setQuoPage3(function(){ const tb = qF54('st'), ps = qF54().filter(qQ63), q = sum(tb, p => pMoney(p).q), b = sum(tb, p => pMoney(p).b), ok = tb.filter(p => p.quoteOk), wt = tb.filter(p => !p.quoteOk), fl = tb.filter(p => p.qf).length;
  const tile = (k, cls, ic, v, n, s) => stat({k1:'tk', k2:'tg', k3:'ta', k4:'tb'}[cls], n, v, s, 'qSt54', k, S.f.qst === k && k !== '');
  const chips = [S.f.qsc && ['qBar54sc', S.f.qsc, scOf(S.f.qsc).n], S.f.qm && ['qBar54m', S.f.qm, MEAS[S.f.qm].n], S.f.qst && ['qSt54', S.f.qst, {ok:'Approved', wait:'Waiting for the client', nofile:'No quote file'}[S.f.qst]]].filter(Boolean);
  return oph('Quotes and budgets', 'One quote per property, from the scheme’s rates.')
    + `<div class="cstats q54-ks">${tile('', 'k1', 'money', kfm54(q), 'Quoted', `budget ${kfm54(b)}`)}${tile('ok', 'k2', 'check', kfm54(sum(ok, p => pMoney(p).q)), 'Approved', plural(ok.length, 'property', 'properties'))}${tile('wait', 'k3', 'clock', kfm54(sum(wt, p => pMoney(p).q)), 'Waiting', plural(wt.length, 'property', 'properties'))}${tile('nofile', 'k4', 'file', `${fl}/${tb.length}`, 'Quote files', 'click to see the missing ones')}</div>`
    + `<div class="q54-cs"><section class="rsec q54-c"><div class="q54-ch"><h3>Quoted and budget</h3><div class="q54-tg">${[['sc', 'Scheme'], ['m', 'Measure']].map(([k, n]) => `<button type="button" data-act="qBy54" data-v="${k}" aria-pressed="${S.f.qby === k}">${n}</button>`).join('')}</div></div><div class="q54-leg"><span><i style="background:${QC54.q}"></i>Quoted</span><span><i style="background:${QC54.b}"></i>Budget</span></div>${qBars54()}</section>`
    + `<section class="rsec q54-c"><div class="q54-ch"><h3>Client approval</h3><div class="q54-tg">${[['val', '£'], ['cnt', '#']].map(([k, n]) => `<button type="button" data-act="qDv54" data-v="${k}" aria-pressed="${S.f.qdv === k}" aria-label="${k === 'val' ? 'By value' : 'By number of properties'}">${n}</button>`).join('')}</div></div>${qDonut54()}</section></div>`
    + qBar63() + `<section class="rsec q54-list"><div class="q54-ch"><h3>Quotes <span class="q54-cnt">${ps.length}</span></h3></div>${ps.length ? ps.map(qRow54).join('') : empty('No quotes match these filters.')}</section>`; });
VIEWS.com.pages.quo = quoPage3;
A.qBar54 = el => { const k = S.f.qby === 'sc' ? 'qsc' : 'qm'; S.f[k] = S.f[k] === el.dataset.v ? '' : el.dataset.v; render(); };
A.qBar54sc = () => { S.f.qsc = ''; render(); };
A.qBar54m = () => { S.f.qm = ''; render(); };
A.qSt54 = el => { S.f.qst = S.f.qst === el.dataset.v ? '' : el.dataset.v; render(); };
A.qBy54 = el => { S.f.qby = el.dataset.v; render(); };
A.qDv54 = el => { S.f.qdv = el.dataset.v; render(); };
A.qClr54 = () => { S.f.qsc = ''; S.f.qm = ''; S.f.qst = ''; render(); };
/* The quote file: upload a PDF or an image, then view it */
IN.qf54 = t => { const f = t.files && t.files[0], p = prOf(t.dataset.k); if(!f || !p) return;
  if(f.size > 8 * 1024 * 1024){ toast('That file is over 8 MB. Use a smaller PDF or image.'); return; }
  const r = new FileReader(); r.onload = () => { const old = p.qf; p.qf = {name:f.name, type:f.type || (/\.pdf$/i.test(f.name) ? 'application/pdf' : ''), size:f.size, url:r.result, by:ME(), on:TODAY};
    his(p, `Quote file ${old ? 'replaced' : 'added'}: ${f.name}`, ME()); if(S.modal && S.modal.k === 'qf54'){ S.modal = {k:'qf54', pr:p.id}; renderLayer(); setTimeout(qfDraw54, 30); } render(); toast(`Quote file ${old ? 'replaced' : 'added'}.`); }; r.readAsDataURL(f); };
A.qfView54 = el => { S.modal = {k:'qf54', pr:el.dataset.v}; renderLayer(); setTimeout(qfDraw54, 30); };
A.qfDel54 = () => { const p = prOf(S.modal.pr); his(p, `Quote file removed: ${p.qf.name}`, ME()); p.qf = null; S.modal = null; renderLayer(); render(); toast('Quote file removed.'); };
MODALS.qf54 = m => { const p = prOf(m.pr), f = p.qf; if(!f) return '';
  const img = /^image\//.test(f.type), pdf = /pdf/.test(f.type);
  return modal(`Quote, ${esc(p.ad)}`, `${esc(f.name)}, ${f.size < 1048576 ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : (f.size / 1048576).toFixed(1) + ' MB'}. Added by ${PEO[f.by].n}, ${fmtDy(f.on)}.`,
    img ? `<div class="q54-view"><img src="${f.url}" alt="Quote for ${esc(p.ad)}"></div>` : pdf ? `<div class="q54-view" id="qv54"><p class="hint">Opening the PDF...</p></div>` : `<div class="q54-view"><p class="hint">There is no preview for this type of file.</p></div>`,
    `<button class="btn sec lg" data-act="qfDel54">Remove</button><label class="btn sec lg q54-rep" data-act="qfLab54">${ico('upload', 15)}Replace<input type="file" accept="application/pdf,.pdf,image/*" data-in="qf54" data-k="${p.id}"></label><button class="btn pri lg" data-act="mclose">Close</button>`, 860); };
export let PDFJS54 = null;
export const loadPdf54 = () => PDFJS54 || (PDFJS54 = new Promise((ok, ko) => { if(window.pdfjsLib) return ok(window.pdfjsLib); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload = () => { const L = window.pdfjsLib; if(!L){ PDFJS54 = null; return ko(new Error('pdf.js')); } L.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; ok(L); };
  s.onerror = () => { PDFJS54 = null; ko(new Error('pdf.js')); }; document.head.appendChild(s); }));
export async function qfDraw54(){ const box = document.getElementById('qv54'); if(!box || !S.modal || S.modal.k !== 'qf54') return; const f = prOf(S.modal.pr).qf; if(!f) return;
  try { const L = await loadPdf54(), bin = atob(f.url.split(',')[1]), u8 = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const doc = await L.getDocument({data:u8, isEvalSupported:false}).promise; if(!document.body.contains(box)) return; box.innerHTML = '';
    const w = Math.max(280, box.clientWidth - 2), dpr = window.devicePixelRatio || 1;
    for(let i = 1; i <= Math.min(doc.numPages, 12); i++){ const pg = await doc.getPage(i), v0 = pg.getViewport({scale:1}), vp = pg.getViewport({scale:w / v0.width * dpr}), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; c.style.width = w + 'px'; c.setAttribute('aria-label', `Page ${i}`); box.appendChild(c); await pg.render({canvasContext:c.getContext('2d'), viewport:vp}).promise; }
    if(doc.numPages > 12) box.insertAdjacentHTML('beforeend', `<p class="hint">Showing the first 12 of ${doc.numPages} pages.</p>`);
  } catch(e){ if(document.body.contains(box)) box.innerHTML = `<p class="hint">The preview could not open this PDF here. The file is saved on the property.</p>`; } }
/* Tooltips on the charts */
{ let tip = null; const tipEl = () => tip || (tip = Object.assign(document.body.appendChild(document.createElement('div')), {id:'tip54'}));
  document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('[data-tip]'); const d = tipEl(); if(!t){ d.classList.remove('on'); return; } d.textContent = t.dataset.tip; d.classList.add('on'); });
  document.addEventListener('mousemove', e => { const d = tip; if(!d || !d.classList.contains('on')) return; d.style.left = Math.max(8, Math.min(innerWidth - d.offsetWidth - 8, e.clientX + 14)) + 'px'; d.style.top = Math.min(innerHeight - d.offsetHeight - 8, e.clientY + 16) + 'px'; });
  document.addEventListener('keydown', e => { const t = e.target; if(e.key === 'Enter' && t && t.matches && t.matches('[data-tip][data-act]')){ e.preventDefault(); t.dispatchEvent(new MouseEvent('click', {bubbles:true})); } }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.3') v.url = 'https://claude.ai/artifact/Kumc6Csu5nN1U1Av9ioPBL'; } });
VERSIONS.push({v:'v5.4', date:TODAY, major:false, current:true, url:null, title:'Quotes and budgets as a dashboard, with the quote file', sum:'Quotes and budgets shows four figures, a quoted and budget chart by scheme or measure and a client approval chart; clicking any of them filters the list. Each property can carry its quote file, a PDF or an image, and it opens in the app.', steps:[]});
