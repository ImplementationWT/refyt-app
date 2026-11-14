// Refyt · v5.31: Home en el nuevo diseño: cabeceras con iconos, etiquetas con iconos, barras de margen.
import {
  TODAY, VERSIONS, gKey64, ico, wrapRender
} from "../index.js";
/* =================== v5.31: Home in the new design: card headers with icons, status labels with icons, scheme margin bars =================== */
export function home81(){ const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || !/:ovw$/.test(gKey64())) return; const g = op.querySelector('.ov-g'); if(!g || g.dataset.h81) return; g.dataset.h81 = '1';
  const IC = {'Needs you now':'alert', 'My day':'clock', 'Schemes at a glance':'chart', 'Work in progress':'grid', 'Money':'money'};
  g.querySelectorAll('.ov-card .ov-h h3').forEach(h => { const t = h.textContent.trim(); h.insertAdjacentHTML('afterbegin', `<span class="hm81-i">${ico(IC[t] || 'grid', 16, 2.2)}</span>`); });
  g.querySelectorAll('.ov-card').forEach(c => { const h = c.querySelector('.ov-h h3'); if(!h || !/Schemes at a glance/.test(h.textContent)) return;
    c.querySelectorAll('.ov-r').forEach(r => { const n = r.querySelector('.ov-num'); if(!n) return; const v = parseFloat(n.textContent), t = parseFloat((n.querySelector('small') || {}).textContent.replace(/[^0-9.]/g, '')); if(isNaN(v)) return; const mx = 50, ok = isNaN(t) || v >= t;
      n.insertAdjacentHTML('beforebegin', `<span class="hm81-b" title="Forecast margin ${v}%${isNaN(t) ? '' : `, target ${t}%`}"><i style="width:${Math.min(100, v / mx * 100)}%;background:${ok ? '#6366F1' : '#F97316'}"></i>${isNaN(t) ? '' : `<em style="left:${Math.min(100, t / mx * 100)}%"></em>`}</span>`); }); }); }
{ wrapRender(r81 => (...x) => { const o = r81(...x); try { home81(); } catch(e) { console.warn(e); } return o; }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.30') v.url = 'https://claude.ai/artifact/84navqBkeKiXdj1EKMX7tr'; } });
VERSIONS.push({v:'v5.31', date:TODAY, major:false, current:true, url:null, title:'Home in the new design', sum:'Home keeps every card, row and action, with the new card style, icons in the card headers, status labels with icons, and a margin bar with its target for each scheme.', steps:[]});
