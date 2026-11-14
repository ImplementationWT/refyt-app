// Refyt · v5.3: Margins con búsqueda, botón de filtros y gráfico de margen que sigue los filtros.
import {
  A, DB, IC, IN, S, TODAY, VERSIONS, VIEWS, cell, empty, esc, fm, grpH, ico, mgTag, mrgPage, norm,
  oph, pIdx, pMoney, pc, plural, refocus, render, rowO, scOf, setMrgPage, sum, tcell
} from "../../index.js";
/* =================== v5.3: Margins with search, a filter button and a margin chart that follows the filters =================== */
IC.filter = '<path d="M3 5h18l-7 8.5V19l-4 2v-7.5L3 5z"/>';
S.f.mq = ''; S.f.msc = []; S.f.mph = []; S.f.mpop = false;
export const MCOL53 = ['#6366F1', '#F97316', '#10B981', '#EC4899', '#06B6D4', '#EAB308', '#8B5CF6', '#EF4444'];
export const MPH53 = ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out', 'Paid'];
export const mAll53 = () => DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled');
export let mProps53 = () => { const q = norm(S.f.mq); return mAll53().filter(p => (!S.f.msc.length || S.f.msc.includes(p.sc)) && (!S.f.mph.length || S.f.mph.includes(p.ph)) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))); };
export const mSum53 = ps => { const q = sum(ps, p => pMoney(p).q), fc = sum(ps, p => pMoney(p).fc), t = q ? sum(ps, p => pMoney(p).q * scOf(p.sc).set.mg) / q : 0; return {q, fc, mg:q - fc, mgp:q ? (q - fc) / q * 100 : 0, t}; };
export function donut53(sl, mid, sub){ const r = 66, C = 2 * Math.PI * r, tot = sum(sl, x => x.v); let off = 0;
  const arcs = tot > 0 ? sl.map(x => { const len = x.v / tot * C, gap = sl.length > 1 ? Math.min(2.5, len / 3) : 0, a = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${x.c}" stroke-width="26" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)"><title>${esc(x.n)}: ${fm(x.v)}, ${pc(x.v / tot * 100)}</title></circle>`; off += len; return a; }).join('') : `<circle cx="90" cy="90" r="${r}" fill="none" stroke="#E2E8F0" stroke-width="26"/>`;
  return `<svg class="mc53-svg" viewBox="0 0 180 180" role="img" aria-label="Forecast margin by ${esc(sub)}">${arcs}<text x="90" y="86" text-anchor="middle" class="mc53-big">${mid}</text><text x="90" y="108" text-anchor="middle" class="mc53-sm">${esc(sub)}</text></svg>`; }
export function mChart53(ps){ if(!ps.length) return '';
  const m = mSum53(ps), scs = [...new Set(ps.map(p => p.sc))], byS = scs.length > 1;
  const groups = byS ? scs.map(id => { const xs = ps.filter(p => p.sc === id), s = scOf(id), k = mSum53(xs); return {n:s.n, v:k.mg, q:k.q, mgp:k.mgp, t:s.set.mg, cnt:xs.length}; }) : ps.map(p => { const k = pMoney(p); return {n:p.ad, v:k.mg, q:k.q, mgp:k.mgp, t:scOf(p.sc).set.mg, cnt:1, ph:p.ph}; });
  groups.sort((a, b) => b.v - a.v); groups.forEach((g, i) => { g.c = MCOL53[i % MCOL53.length]; });
  const pos = groups.filter(g => g.v > 0), neg = groups.filter(g => g.v <= 0), totPos = sum(pos, g => g.v), ok = m.mgp >= m.t, d = Math.round(Math.abs(m.mgp - m.t));
  const lead = `<p class="mc53-lead"><b>${fm(m.mg)}</b> margin on ${fm(m.q)} quoted, ${plural(ps.length, 'property', 'properties')}. ${ok ? `<span class="mc53-up">${plural(d, 'point', 'points')} above target</span>` : `<span class="mc53-dn">${plural(d, 'point', 'points')} below target</span>`}</p>`;
  const legend = groups.map(g => `<li><span class="mc53-dot" style="background:${g.v > 0 ? g.c : '#CBD5E1'}"></span><div class="mc53-li"><div class="mc53-r1"><b>${esc(g.n)}</b><span>${fm(g.v)}${g.v > 0 && totPos ? `, ${pc(g.v / totPos * 100)}` : ''}</span></div><small>Target ${g.t}%</small></div>${mgTag(g.mgp, g.t)}</li>`).join('');
  return `<section class="rsec mc53"><div class="mc53-g"><div class="mc53-c">${donut53(pos.map(g => ({n:g.n, v:g.v, c:g.c})), pc(m.mgp), `target ${pc(m.t)}`)}</div><div class="mc53-e">${lead}<ul class="mc53-l">${legend}</ul><p class="mc53-note">${ico('target', 14)}<span>Target: the minimum margin agreed for each scheme, set in Scheme settings.${neg.length ? ' Grey: no margin left.' : ''}</span></p></div></div></section>`; }
export function mBar53Base(){ const n = S.f.msc.length + S.f.mph.length, scs = [...new Set(mAll53().map(p => p.sc))].map(scOf);
  const pop = S.f.mpop ? `<div class="mf53-pop" role="dialog" aria-label="Filters"><small>Scheme</small><div class="mf53-ops">${scs.map(s => `<button type="button" class="mf53-op${S.f.msc.includes(s.id) ? ' on' : ''}" data-act="mf53Sc" data-v="${s.id}" aria-pressed="${S.f.msc.includes(s.id)}">${S.f.msc.includes(s.id) ? ico('check', 13, 2.6) : ''}${esc(s.n)}</button>`).join('')}</div><small>Status</small><div class="mf53-ops">${MPH53.map(ph => `<button type="button" class="mf53-op${S.f.mph.includes(ph) ? ' on' : ''}" data-act="mf53Ph" data-v="${ph}" aria-pressed="${S.f.mph.includes(ph)}">${S.f.mph.includes(ph) ? ico('check', 13, 2.6) : ''}${ph}</button>`).join('')}</div><div class="mf53-pf"><button type="button" class="btn sec sm" data-act="mf53Clr">Clear filters</button><button type="button" class="btn pri sm" data-act="mf53Tog">Done</button></div></div>` : '';
  const chips = [...S.f.msc.map(id => [`mf53Sc`, id, scOf(id).n]), ...S.f.mph.map(ph => ['mf53Ph', ph, ph])].map(([a, v, t]) => `<button type="button" class="mf53-chip" data-act="${a}" data-v="${esc(v)}" title="Remove this filter">${esc(t)}${ico('x', 12, 2.4)}</button>`).join('');
  return `<div class="mf53-bar"><label class="mf53-s">${ico('search', 16)}<input data-in="mq53" value="${esc(S.f.mq)}" placeholder="Search a property, postcode or scheme" aria-label="Search margins"></label><div class="mf53-fw"><button type="button" class="mf53-fb${n ? ' on' : ''}" data-act="mf53Tog" aria-label="Filter by scheme or status" aria-expanded="${S.f.mpop}" title="Filter by scheme or status">${ico('filter', 17)}${n ? `<span class="mf53-n">${n}</span>` : ''}</button>${pop}</div></div>${chips ? `<div class="mf53-chips">${chips}<button type="button" class="lnk4" data-act="mf53Clr">Clear all</button></div>` : ''}`; }
setMrgPage(function(){ const ps = mProps53(), scs = [...new Set(ps.map(p => p.sc))];
  return oph('Margins', 'Quoted value, forecast cost and margin per scheme and property, against each scheme’s target.') + mChart53(ps) + mBar53()
    + (ps.length ? scs.map(id => { const s = scOf(id), xs = ps.filter(p => p.sc === id), k = mSum53(xs); return grpH(`${s.n}, target ${s.set.mg}%`, k.q ? pc(k.mgp) : '') + xs.map(p => { const x = pMoney(p); return rowO('prMon', p.id, tcell('prMon', p.id, esc(p.ad), p.ph, 2.4) + cell(fm(x.q), 'quoted') + cell(fm(x.fc), `budget ${fm(x.b)}`) + `<div class="mbc"><b>${mgTag(x.mgp, s.set.mg)}</b><small>${x.over ? 'over budget' : fm(x.mg)}</small></div>`); }).join(''); }).join('') : empty('No properties match the search or the filters.')); });
VIEWS.com.pages.mrg = mrgPage;
IN.mq53 = t => { S.f.mq = t.value; refocus(render); };
A.mf53Tog = () => { S.f.mpop = !S.f.mpop; render(); };
A.mf53Sc = el => { const v = el.dataset.v; S.f.msc = S.f.msc.includes(v) ? S.f.msc.filter(x => x !== v) : [...S.f.msc, v]; render(); };
A.mf53Ph = el => { const v = el.dataset.v; S.f.mph = S.f.mph.includes(v) ? S.f.mph.filter(x => x !== v) : [...S.f.mph, v]; render(); };
A.mf53Clr = () => { S.f.msc = []; S.f.mph = []; render(); };
document.addEventListener('click', e => { if(S.f.mpop && e.target.closest && !e.target.closest('.mf53-fw')){ S.f.mpop = false; if(!e.target.closest('[data-act]')) render(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.mpop){ S.f.mpop = false; render(); } });
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.2') v.url = 'https://claude.ai/artifact/KGRERhaBmxGRBAiHyGM2yp'; } });
VERSIONS.push({v:'v5.3', date:TODAY, major:false, current:true, url:null, title:'Margins: search, filters and a margin chart', sum:'Margins has a search bar and a filter button by scheme and status. A chart splits the forecast margin by scheme, or by property when one scheme is left, and explains each scheme’s target.', steps:[]});
/* Later layers wrap or replace mBar53 (the original reassigns it). Kept as var: no temporal dead zone. */
export var mBar53W = null;
export function mBar53(...x){ return (mBar53W || mBar53Base)(...x); }
export const setMBar53 = f => { mBar53W = f; };
/* A later layer replaces mProps53 (the original reassigns it). */
export const setMProps53 = f => { mProps53 = f; };
