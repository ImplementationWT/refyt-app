// Refyt · v5.40: Site forms (y el formulario del assessor) con el diseño de la app.
import {
  TODAY, VERSIONS, esc, ico, ini, wrapRender
} from "../../index.js";
/* =================== v5.40: Site forms (and the assessor form) in the app design =================== */
export function site91(){ document.querySelectorAll('.rf-stage').forEach(st => { if(!st.offsetParent || st.dataset.s91) return; st.dataset.s91 = '1';
  const pnl = st.querySelector('.rf-stgs'); if(pnl) pnl.classList.add('s91-p');
  st.querySelectorAll('.rf-stgp .seg2 button').forEach(b => { if(b.querySelector('.s91-av')) return; const n = (b.querySelector('b') || {}).textContent || ''; b.insertAdjacentHTML('afterbegin', `<span class="s91-av">${esc(ini(n) || n.slice(0, 2).toUpperCase())}</span>`); b.insertAdjacentHTML('beforeend', `<span class="s91-ck">${ico('check', 12, 3)}</span>`); });
  const hi = st.querySelector('.rf-hi'); if(hi && !st.querySelector('.s91-k')){ const pills = [...st.querySelectorAll('.rf-scroll .rf-jl .pill')].map(p => p.textContent.trim()), cnt = t => pills.filter(x => x === t).length, types = [...new Set(pills)].slice(0, 3), TONE = {Inspection:'ta', 'Start work':'tk', 'Progress update':'tb', 'Sign off':'tg', 'Visit':'tk'};
    hi.insertAdjacentHTML('afterend', `<div class="s91-k">${types.map(t => `<div class="s91-kc ${TONE[t] || 'tk'}"><b>${cnt(t)}</b><small>${esc(t)}</small></div>`).join('')}</div>`); }
  st.querySelectorAll('.rf-scroll .pill').forEach(p => { const t = p.textContent.trim(); p.classList.add('s91-pl', /inspect/i.test(t) ? 's91-in' : /start/i.test(t) ? 's91-st' : /progress|update/i.test(t) ? 's91-up' : /sign|done|complete/i.test(t) ? 's91-ok' : 's91-ot'); }); }); }
{ wrapRender(r91 => (...x) => { const o = r91(...x); try { site91(); } catch(e) { console.warn(e); } return o; }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.39') v.url = 'https://claude.ai/artifact/KyWe9qpw8RqRfGFqYiewzP'; } });
VERSIONS.push({v:'v5.40', date:TODAY, major:false, current:true, url:null, title:'Site forms in the app design', sum:'Site forms and the assessor form use the app design: a card for who is signed in with avatars and a check, key figures by job type inside the phone, white property cards and colour-coded job labels with icons.', steps:[]});
