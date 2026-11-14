// Refyt · acceso por rol con la sesión real. No viene de la demo: es una adaptación del repo.
// Desde v4.0 el original abre todas las apps (allowed = app => true) y solo el menú decide qué ve
// cada rol; aquí la misma definición del menú (ITEMS4 y canNav, que también arman las secciones
// del encabezado) decide qué se puede abrir, también por enlace directo (#view=…), go() y abrir().
// Sin sesión (AUTH.apps null) no limita nada, como la demo.
import { AUTH, ITEMS4, S, canNav, homeApp, isAdmin, wrapRender } from "./index.js";

/** The role in use is one of the user's roles, unless refyt.view_as (the tour also changes S.role). */
export function enforceRole(){
  if(AUTH.apps && !AUTH.viewAs && AUTH.roles.length && !AUTH.roles.includes(S.role)) S.role = AUTH.roles[0];
}

/** A screen the role reaches: an item of its menu, or any page of its own team app. */
export function canOpen(view, page){
  if(!AUTH.apps) return true;
  if(!AUTH.apps.length) return false;
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
