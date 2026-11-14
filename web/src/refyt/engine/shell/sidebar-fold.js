// Refyt · v3.24: el menú conserva su posición, se pliega al supervisar y es un cajón en tableta y móvil.
// Copia del original ("Refyt, demo v3.27.html"), con el mismo código.
import {
  $, A, MONI, S, TODAY, VERSIONS, VIEWS, esc, go, ico, render, sum, wrapRender
} from "../index.js";
/* =================== v3.24: the menu keeps its place, folds away for monitoring, works on every screen =================== */
/* 1. Clicking a menu item no longer jumps the menu back to the top: its scroll is kept, and the current item stays in view.
   2. Desktop: the menu folds into an icon rail. It folds by itself when the Director goes to another app to monitor,
      or follows a link into another app; the button at the top opens or folds it by hand.
   3. Tablet and phone: the menu is a drawer that closes when you pick an item, tap outside or press Escape. */
S.sbMin = {};
export const sbAuto = app => MONI(app) || (!!S.trail && S.trail.app !== app);
export const sbMini = app => window.innerWidth > 900 && (S.sbMin[app] ?? sbAuto(app));
A.sbMin = () => { S.sbMin[S.view] = !sbMini(S.view); render(); };
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side; VIEWS[a].side = () => {
  const h = o().replace(/<button class="nav"([^>]*)>(<span class="ni">[\s\S]*?<\/span>)([^<]+)/g, (m, at, ic, l) => `<button class="nav"${at} title="${esc(l.trim())}">${ic}<span class="nl">${l}</span>`);
  const mini = sbMini(a);
  return h.replace('<aside class="sb">', `<aside class="sb"><button class="sb-tg" data-act="sbMin" title="${mini ? 'Open the menu' : 'Fold the menu'}" aria-label="${mini ? 'Open the menu' : 'Fold the menu'}" aria-expanded="${!mini}">${ico('chev', 16)}<span class="nl">Collapse</span></button>`); }; });
wrapRender(r0 => (...x) => { const app = S.view, sb = document.querySelector(`#a-${app} .sb`), y = sb ? sb.scrollTop : 0;
    r0(...x);
    const el = document.querySelector(`#a-${S.view}`); if(el) el.classList.toggle('sbmini', sbMini(S.view));
    const nb = document.querySelector(`#a-${S.view} .sb`); if(!nb) return;
    if(S.view === app) nb.scrollTop = y;
    const cur = nb.querySelector('.nav[aria-current="true"]');
    if(cur && nb.clientHeight){ const r = cur.getBoundingClientRect(), s = nb.getBoundingClientRect(); if(r.top < s.top) nb.scrollTop -= s.top - r.top + 8; else if(r.bottom > s.bottom) nb.scrollTop += r.bottom - s.bottom + 8; } });
{ const ov = A.view, os = A.setRole; A.view = el => { delete S.sbMin[el.dataset.v]; ov(el); }; A.setRole = el => { S.sbMin = {}; os(el); }; }
/* Drawer: close on a tap outside or Escape; re-check the rail when the window changes size */
export const sbClose = () => document.querySelectorAll('.oapp.sbopen').forEach(o => o.classList.remove('sbopen'));
document.addEventListener('click', e => { if(!document.querySelector('.oapp.sbopen') || e.target.closest('[data-act="sbTog"]')) return; if(e.target.closest('.sb')){ if(e.target.closest('.sb .nav')) setTimeout(sbClose, 0); return; } sbClose(); }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape') sbClose(); });
{ let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if(window.innerWidth > 900) sbClose(); const el = document.querySelector(`#a-${S.view}`); if(el) el.classList.toggle('sbmini', sbMini(S.view)); }, 120); }); }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/NzDhAQAhiokFiCiHKRyi27'; } });
VERSIONS.push({v:'v3.24', date:TODAY, major:false, current:true, url:null, title:'The menu keeps its place and folds away', sum:'The menu no longer jumps back to the top when you pick an item. It folds into icons when the Director goes to another app to monitor, and it is a drawer on tablet and phone.', steps:[
  {t:'The menu keeps its place', min:.5, dolor:'Before, picking an item low in the menu sent the menu back to the top.', show:['Scroll the Director menu down and pick Quality and compliance: the menu stays where it was.'], say:'You never lose your place.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dqual'); }},
  {t:'It folds away when the Director monitors', min:.5, dolor:'Before, the team’s full menu took space the Director does not use.', show:['Open a team app as Director: the menu folds into icons, with the name on hover.', 'The arrow at the top opens or folds it by hand.'], say:'More room for what you came to see.', go:() => { S.role = 'dir'; S.trail = null; delete S.sbMin.del; go('del', 'ovw'); }},
  {t:'Tablet and phone', min:.5, dolor:'Before, the drawer only closed when you picked an item.', show:['The menu button opens the drawer; it closes when you pick an item, tap outside or press Escape.'], say:'The same menu on every screen.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
]});
