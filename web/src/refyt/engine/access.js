// Refyt · acceso por rol con la sesión real. No viene de la demo: es una adaptación del repo.
// Desde v4.0 el original abre todas las apps (allowed = app => true) y solo el menú decide qué ve
// cada rol; aquí la misma definición del menú (ITEMS4 y canNav, que también arman las secciones
// del encabezado) decide qué se puede abrir, también por enlace directo (#view=…), go() y abrir().
// Sin sesión (AUTH.apps null) no limita nada, como la demo.
import { A, AUTH, ITEMS4, S, SEC5, canNav, drawPop, homeApp, ico, isAdmin, wrapDrawPop, wrapRender } from "./index.js";

/** The role in use is one of the user's roles, unless refyt.view_as (the tour also changes S.role). */
export function enforceRole(){
  if(AUTH.apps && !AUTH.viewAs && AUTH.roles.length && !AUTH.roles.includes(S.role)) S.role = AUTH.roles[0];
}

/* Las pantallas de administración de la demo solo viven en memoria (no guardan nada): con la sesión
   real quedan fuera del menú y del acceso directo, también para el Director. El código sigue ahí. */
export const DEMO_ADMIN = ['usr', 'tms', 'prm'];
const demoAdmin = (view, page) => view === 'dir' && DEMO_ADMIN.includes(page);
[...ITEMS4, ...SEC5.flatMap(s => s.groups.flatMap(([, xs]) => xs))].forEach(it => {
  if(!it || !DEMO_ADMIN.includes(it.k) || it.demoAdmin) return;
  const only = it.only; it.demoAdmin = true; it.only = () => !AUTH.apps && (!only || only()); });

/** A screen the role reaches: an item of its menu, or any page of its own team app. */
export function canOpen(view, page){
  if(!AUTH.apps) return true;
  if(!AUTH.apps.length || demoAdmin(view, page)) return false;
  if(isAdmin() || view === homeApp()) return true;
  const key = view === 'db' ? 'db:' : view + ':' + (page || '');
  return ITEMS4.some(it => canNav(it) && it.to() === key);
}

/** A property or scheme card opens in a view the role reaches through its menu (Properties lives in Director). */
export function canOpenCard(view){
  if(!AUTH.apps) return true;
  if(isAdmin() || view === homeApp()) return true;
  return ITEMS4.some(it => canNav(it) && it.to().split(':')[0] === view);
}

/** Where a screen the role may not open lands: its Overview. */
export function firstScreen(){
  const a = homeApp(); S.view = a; S.page[a] = 'ovw'; S.fi[a] = null; S.sec5 = 'ovw';
}

/* Backstop for every other way in: the last wrapper registered runs first, before anything is drawn. */
wrapRender(r => (...x) => {
  enforceRole();
  const card = S.view !== 'db' && S.fi[S.view];
  if(card ? !canOpenCard(S.view) : !canOpen(S.view, S.page[S.view])) firstScreen();
  return r(...x);
});

/* Settings (la rueda del Director): sin las fichas de la administración de la demo y, en su lugar,
   la administración real (Users, Roles) que permiten los permisos del usuario. */
const REAL_ADMIN = [['/users', 'Users', 'user'], ['/roles', 'Roles', 'shield']];
wrapDrawPop(dp => () => { dp(); const el = document.getElementById('rfpop'); if(!AUTH.apps || !el) return;
  if(S.pop === 'more') el.querySelectorAll('[data-act="popSet5"] small').forEach(x => { x.textContent = 'Access, schemes and clients'; });
  if(S.pop !== 'set5') return;
  el.querySelectorAll('.v5-tile[data-act="setGo5"]').forEach(t => { const [v, pg] = t.dataset.v.split(':'); if(demoAdmin(v, pg)) t.remove(); });
  el.querySelectorAll('.v5-tiles').forEach(g => { if(!g.children.length){ g.previousElementSibling?.remove(); g.remove(); } });
  const first = el.querySelector('.v5-tile[data-act="setGo5"]'), fs = el.querySelector('.v5-spx');
  if(fs) { if(first) fs.dataset.v = first.dataset.v; else fs.remove(); }
  const links = REAL_ADMIN.filter(([to]) => AUTH.admin.includes(to));
  if(links.length) el.querySelector('.v5-sph')?.insertAdjacentHTML('afterend', `<div class="v5-spg"><small>Administration</small><span></span></div><div class="v5-tiles">${links.map(([to, n, ic]) => `<button class="v5-tile" data-act="realAdm" data-v="${to}"><span class="v5-ti">${ico(ic, 26, 1.7)}</span><span class="v5-tl">${n}</span></button>`).join('')}</div>`); });

/** Opens a screen of the real administration (the React app listens to the browser history). */
A.realAdm = el => { S.pop = null; drawPop(); history.pushState(null, '', el.dataset.v); dispatchEvent(new PopStateEvent('popstate')); };
