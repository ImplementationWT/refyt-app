// Refyt · v5.41: visuales de la referencia comercial: variaciones en cifras clave, medidores, barras.
import {
  DB, PEO, TODAY, VERSIONS, av, esc, fmtDy, ico, rnd69, wrapRender
} from "../index.js";
/* =================== v5.41: visuals from the sales reference: change pills on key figures, semicircle gauges, bars with change labels, recent activity =================== */
/* 1. Change against the previous period on every key figure (sample history in the demo) */
export const BAD92 = /overdue|expired|over|below|late|delay|alert|risk|blocked|waiting|to lodge|to finish|to book|hold|owed|spend|cost|exception/i;
export function chg92(){ document.querySelectorAll('.cstats .stat.k70').forEach(s => { if(s.querySelector('.ch92')) return; const lab = ((s.querySelector('small') || {}).textContent || '').trim(), val = ((s.querySelector('b') || {}).textContent || '').trim(); if(!lab || !/\d/.test(val)) return;
  const r = rnd69(lab + val), up = r() > .32, pct = Math.max(1, Math.round(2 + r() * 24)), good = BAD92.test(lab) ? !up : up;
  s.insertAdjacentHTML('beforeend', `<span class="ch92 ${good ? 'ok' : 'bad'}" title="Against the previous period (sample history in the demo)">${up ? '↑' : '↓'} ${pct}%<i>vs last month</i></span>`); }); }
/* 2. Semicircle gauge made of blocks */
export function gauge92(pct, big, sub, w = 150){ const n = 22, on = Math.round(Math.max(0, Math.min(100, pct)) / 100 * n), cx = 75, cy = 72, r1 = 50, r2 = 68;
  const seg = Array.from({length:n}, (_, i) => { const a0 = Math.PI + i / n * Math.PI + .02, a1 = Math.PI + (i + 1) / n * Math.PI - .02, p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`, t = i / (n - 1), col = i < on ? '#6366F1' : '#E2E8F0';
    return `<path d="M${p(r1, a0)} L${p(r2, a0)} A${r2} ${r2} 0 0 1 ${p(r2, a1)} L${p(r1, a1)} A${r1} ${r1} 0 0 0 ${p(r1, a0)} Z" fill="${col}"/>`; }).join('');
  return `<svg viewBox="0 0 150 82" class="g92" style="width:${w}px" role="img" aria-label="${esc(big)} ${esc(sub || '')}">${seg}<text x="75" y="${sub ? 64 : 72}" text-anchor="middle" class="g92-b">${big}</text>${sub ? `<text x="75" y="78" text-anchor="middle" class="g92-s">${esc(sub)}</text>` : ''}</svg>`; }
export function gaugeSwap92(){ document.querySelectorAll('.rq76-ring').forEach(r => { if(r.dataset.g92) return; r.dataset.g92 = '1'; const t = (r.querySelector('.rg69-b') || {}).textContent || ''; const v = parseFloat(t); if(isNaN(v)) return; r.innerHTML = gauge92(v, t, '', 96); r.classList.add('g92-w'); }); }
/* 3. Business overview: bars with change labels, the current month in a gradient, the rest with soft stripes */
export function bars92(){ document.querySelectorAll('.rf-ch').forEach(ch => { if(ch.dataset.b92 || !ch.offsetParent) return; const bars = [...ch.querySelectorAll('.rf-bar1')]; if(bars.length < 2) return; ch.dataset.b92 = '1';
  const val = b => { const m = (b.dataset.tt || '').match(/£\s?([\d.,]+)\s*([KM]?)/i); if(!m) return null; return parseFloat(m[1].replace(/,/g, '')) * (m[2] === 'K' ? 1e3 : m[2] === 'M' ? 1e6 : 1); };
  bars.forEach((b, i) => { if(!i) return; const a = val(bars[i - 1]), c = val(b); if(a == null || c == null || !a) return; const d = Math.round((c - a) / a * 100); b.insertAdjacentHTML('beforeend', `<span class="bp92 ${d >= 0 ? 'ok' : 'bad'}">${d >= 0 ? '↑' : '↓'} ${Math.abs(d)}%</span>`); }); }); }
/* 4. Home: recent activity from the property history */
export function act92(){ const g = document.querySelector('.op .ov-g.ov-dir'); if(!g || !g.offsetParent || g.querySelector('.act92')) return;
  const xs = DB.pr.flatMap(p => (p.his || []).map(h => ({p, d:h[0], t:h[1], who:h[2]}))).filter(x => x.d <= TODAY).sort((a, b) => a.d < b.d ? 1 : -1).slice(0, 6);
  if(!xs.length) return; const who = k => PEO[k] ? PEO[k].n : k === 'sys' ? 'The system' : k;
  g.insertAdjacentHTML('beforeend', `<section class="ov-card ov-wide act92"><div class="ov-h"><div><h3><span class="hm81-i">${ico('clock', 16, 2.2)}</span>Recent activity</h3><p>The latest changes across the properties.</p></div></div><div class="act92-l">${xs.map(x => `<button type="button" class="act92-r" data-act="ficha" data-v="${x.p.id}">${PEO[x.who] ? av(x.who, 34) : `<span class="act92-sys">${ico('grid', 15)}</span>`}<div><b>${esc(who(x.who))}</b><span>${esc(x.t)}</span></div><span class="act92-p">${esc(x.p.ad)}</span><small>${fmtDy(x.d)}</small></button>`).join('')}</div></section>`); }
{ wrapRender(r92 => (...x) => { const o = r92(...x); try { chg92(); gaugeSwap92(); bars92(); act92(); } catch(e) { console.warn(e); } return o; }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.40') v.url = 'https://claude.ai/artifact/XTcvHoLboy81xFSL1AEbNh'; } });
VERSIONS.push({v:'v5.41', date:TODAY, major:false, current:true, url:null, title:'Change pills, gauges, bar changes and recent activity', sum:'Key figures show the change against last month (sample history in the demo), the overview panels use semicircle gauges, Value won by month shows the change on each bar, and Home gets a Recent activity feed.', steps:[]});
