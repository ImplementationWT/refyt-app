// Refyt · arranque. Sustituye al final del original («STARTUP»): el componente React
// RefytWorkspace pone el marcado (encabezado, vistas, capas) y llama a mount() al mostrarse y a
// unmount() al salir, para que el motor dibuje en esos contenedores y no deje paneles abiertos.
import { S, VIEWS, drawPop, drawSetPop, drawTour, drawVs, render, setAuth } from "./index.js";

let started = false;
let lastUser = null;

/** Refyt is light only: its palette has no dark variant for the REFYT brand. */
function forceLight() {
  document.documentElement.dataset.theme = "light";
}

/** Deep links from the original (#view=delivery&page=rdy), read once. */
function readHash() {
  const H = new URLSearchParams(location.hash.slice(1));
  const V = {home:'home', director:'dir', dir:'dir', commercial:'com', com:'com', accounts:'acc', acc:'acc', retrofit:'ret', ret:'ret', delivery:'del', del:'del', tasks:'tsk', tsk:'tsk', data:'db', db:'db'};
  const v = V[(H.get('view') || '').toLowerCase()], p = (H.get('page') || '').toLowerCase();
  if(v){ S.view = v; if(v !== 'db' && p && (VIEWS[v].pages[p] || p === 'help')) S.page[v] = p; }
}

/**
 * auth: the signed-in user (see auth.js). "Viewing as" starts on the user's own Refyt role; with
 * refyt.view_as and no Refyt role it starts as Director, like the demo. A different user resets it.
 */
export function mount(auth) {
  forceLight();
  if(auth){
    const firstTime = auth.userId !== lastUser;
    lastUser = auth.userId;
    setAuth(auth);
    // Without refyt.view_as only the user's own roles; with it, the preview role is kept.
    if(!auth.viewAs) S.role = auth.roles.includes(S.role) ? S.role : (auth.roles[0] ?? S.role);
    else if(firstTime) S.role = auth.roles[0] ?? 'dir';
  }
  if(!started){ readHash(); started = true; }
  // render() itself moves to the first allowed app when the current one is not allowed.
  render(true);
}

/** Closes the floating panels the engine appends to <body> (tour, versions, menus, tooltip). */
export function unmount() {
  S.tour.open = false; S.vs.open = false; S.pop = null; S.modal = null; S.f.fs = false; S.setPop = false;
  drawTour(); drawVs(); drawPop(); drawSetPop();
  document.body.classList.remove('rf-fsb');
  document.querySelectorAll('.oapp.sbopen').forEach(o => o.classList.remove('sbopen'));
  for (const id of ['tourp', 'vsel', 'rfpop', 'rftt', 'setpop']) document.getElementById(id)?.remove();
}
