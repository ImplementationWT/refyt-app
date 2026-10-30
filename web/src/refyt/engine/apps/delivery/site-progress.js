// Refyt · Delivery: porcentaje de avance.
import {
  A, DB, IN, S, TODAY, VERSIONS, VIEWS, go, pct, prOf, render, toast
} from "../../index.js";
export const sfCur = (p, key) => { const [kind, k] = key.split(':'); return kind === 'm' ? (p.ms.find(x => x.m === k) || {}).ip || 0 : (p.gp || {})[k] || 0; };
export const sfP = () => prOf(S.f.mp || DB.pr.find(x => x.ph === 'E. Install').id);
{ const o = A.mset; A.mset = el => { o(el); if(S.f.sff && !S.modal && el.dataset.k === 'st' && el.dataset.v === 'In progress' && S.f.sff.pct == null){ const c = sfCur(sfP(), S.f.sfi); S.f.sff.pct = c > 0 && c < 100 ? c : 25; render(); } }; }
IN.sfPct = t => { S.f.sff.pct = +t.value; const l = document.getElementById('rf-pctv'); if(l) l.textContent = t.value + '%'; const f = document.getElementById('rf-pctf'); if(f) f.style.width = t.value + '%'; };
A.sfPctSet = el => { S.f.sff.pct = +el.dataset.v; render(); };
{ const o = VIEWS.del.pages.site; VIEWS.del.pages.site = () => { let h = o(); const m = S.f.sff; if(!m || m.st !== 'In progress') return h; const pct = m.pct == null ? 25 : m.pct, cur = sfCur(sfP(), S.f.sfi);
  const ctl = `<div class="rf-pct"><div class="rf-pcth"><b>How far is the trade?</b><span id="rf-pctv">${pct}%</span></div><input type="range" min="5" max="95" step="5" value="${pct}" data-in="sfPct" aria-label="Progress"><div class="rf-pctq">${[25, 50, 75, 90].map(v => `<button type="button" class="${pct === v ? 'on' : ''}" data-act="sfPctSet" data-v="${v}">${v}%</button>`).join('')}</div><small>${cur ? `Last recorded: ${cur}%` : 'Nothing recorded yet'}</small></div>`;
  const i = h.indexOf('<div class="rf-2">', h.indexOf('rf-scroll')); return i < 0 ? h : h.slice(0, i) + ctl + h.slice(i); }; }
{ const o = A.sfOk; A.sfOk = el => { const p = sfP(), key = S.f.sfi, m = S.f.sff; const pct = m && m.st === 'In progress' ? (m.pct == null ? 25 : m.pct) : null; o(el);
  if(pct != null && !S.f.sff){ const [kind, k] = key.split(':'); if(kind === 'm') p.ms.find(x => x.m === k).ip = pct; else { p.gp = p.gp || {}; p.gp[k] = pct; } if(p.sfr && p.sfr[key]) p.sfr[key].st = `In progress, ${pct}%`; const h = p.his[p.his.length - 1]; if(h) h[1] = h[1].replace(': in progress', `: in progress, ${pct}%`); render(); toast(`Saved: ${pct}% done. Delivery and the Redbridge tracker show it straight away.`); } }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/GuHGEmsNQpchy2MeeyAK8h'; } });
VERSIONS.push({v:'v3.11', date:TODAY, major:false, current:true, url:null, title:'Progress percentage in site forms', sum:'Saving an item as In progress asks how far the trade has got, from 5% to 95%; Delivery and the Redbridge tracker show it.', steps:[
  {t:'How far is the trade', min:.5, dolor:'Before, In progress had no percentage.', show:['Choose In progress: a slider and quick 25, 50, 75 and 90%.', 'The percentage shows on the item, in Delivery and in the Redbridge tracker.'], say:'You know how far each trade is.', go:() => { S.role = 'sit'; S.f.mp = 'PR-2018'; S.f.sfi = null; go('del', 'site'); }},
]});
