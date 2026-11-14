// Refyt · v5.28: las etiquetas de estado se reducen a su icono sin espacio; cabeceras alineadas.
import {
  TODAY, VERSIONS, wrapRender
} from "../index.js";
/* =================== v5.28: status labels shrink to their icon when there is no room; column headers line up =================== */
export function heads78(){ document.querySelectorAll('.mbr.uy-th').forEach(r => { const cs = [...r.querySelectorAll(':scope > .mbc')]; if(r.dataset.h78) return; r.dataset.h78 = '1';
  const two = cs.some(c => { const b = c.querySelector(':scope > b'), s = c.querySelector(':scope > small'); return b && s && b.textContent.trim() && s.textContent.trim(); });
  cs.forEach(c => { let b = c.querySelector(':scope > b'), s = c.querySelector(':scope > small'); if(!b){ b = document.createElement('b'); c.prepend(b); } if(!s){ s = document.createElement('small'); c.appendChild(s); }
    if(!b.textContent.trim() && s.textContent.trim()){ b.textContent = s.textContent; s.textContent = ''; }
    if(two && !s.textContent.trim()) s.innerHTML = '&nbsp;'; }); }); }
export const PILL78 = '.lst64 .pill, .rd55 .rd55-p, .rd55 .pill';
export function pills78(){ document.querySelectorAll(PILL78).forEach(p => { const t = p.textContent.trim(); if(t && !p.title) p.title = t; if(t && !p.getAttribute('aria-label')) p.setAttribute('aria-label', t); p.classList.remove('ico78'); });
  document.querySelectorAll('.lst64').forEach(l => { if(!l.offsetParent) return; const ps = [...l.querySelectorAll('.mbr:not(.uy-th) .pill')]; if(ps.some(p => { const c = p.closest('.mbc') || p.parentElement, cr = c.getBoundingClientRect(), pr = p.getBoundingClientRect(); return pr.right > cr.right + 1 || p.scrollWidth > p.clientWidth + 1; })) ps.forEach(p => p.classList.add('ico78')); });
  document.querySelectorAll('.rd55-w').forEach(w => { if(!w.offsetParent) return; if(w.scrollWidth > w.clientWidth + 2) w.querySelectorAll('.rd55-p, .pill').forEach(p => { if(p.closest('td') && !p.closest('td').classList.contains('rd55-pr')) p.classList.add('ico78'); }); }); }
export const fit78 = () => { try { heads78(); pills78(); } catch(e) {} };
{ wrapRender(r78 => (...x) => { const o = r78(...x); fit78(); requestAnimationFrame(fit78); return o; }); }
{ let t78; addEventListener('resize', () => { clearTimeout(t78); t78 = setTimeout(fit78, 120); }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.27') v.url = 'https://claude.ai/artifact/3sVFC2V5UqWpym9ndw4TPf'; } });
VERSIONS.push({v:'v5.28', date:TODAY, major:false, current:true, url:null, title:'Status labels that fit, aligned headers', sum:'When a list or table runs out of room, status labels show only their icon, with the text on hover. Column headers always put the name on the first line, and when any column has a second line every column keeps it, so the rows line up.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.28') v.url = 'https://claude.ai/artifact/85fxt2CXnKAQAaePD32qkm'; } });
VERSIONS.push({v:'v5.29', date:TODAY, major:false, current:true, url:null, title:'Calendars in the Assessment bookings design', sum:'Meetings and My tasks keep their calendars and side panels but use the Assessment bookings look: white cards, soft day cells, the day outlined in indigo, and tinted event chips by status.', steps:[]});
