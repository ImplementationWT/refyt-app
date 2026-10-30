// Refyt · Encabezado: selector de apps, ver como, notificaciones.
import {
  A, APPN, APPS, DB, LAPPS, RIMG, RN, RP, S, WAITR, allowed, drawPop, ico, nWait, pend, render, toast
} from "../index.js";
export function launcher(){ const r = S.role;
  return `<div class="rf-hero" style="background-image:linear-gradient(90deg, rgba(22,48,110,.94), rgba(22,48,110,.55)), url(${RIMG.hero})"><div><small>REFYT workspace</small><h1>Six apps, one per team, on the same information</h1><p>Every property is saved once in the REFYT system. Each team works in its own app; what one records, the others see straight away.</p></div><div class="rf-hv"><small>Viewing as</small><button class="rf-rb" data-act="popRole">${RN(r)}<span>${RP(r)}</span>${ico('chev', 13)}</button></div></div>`
    + `<div class="rf-lgrid">${APPS.map(([k, n, ic]) => { const L = LAPPS[k], ok = allowed(k), c = k === 'tsk' ? DB.tk.filter(t => !t.done && t.r === r).length : pend(k).length + (WAITR[k] ? nWait(k) : 0);
      return `<button class="rf-lc${ok ? '' : ' lock'}" data-act="${ok ? 'view' : 'lockedApp'}" data-v="${k}"><span class="rf-lph" style="background-image:url(${RIMG[k]})"></span><span class="rf-lb"><span class="rf-lt"><span class="rf-ai">${ico(ic, 18)}</span><b>${n}</b>${ok && c ? `<em class="rf-cnt">${c}</em>` : ''}</span><small>${L.team}</small><span class="rf-ll">${L.line}</span><span class="rf-lr">${(L.roles.length ? L.roles : ['all']).map(x => `<i>${x === 'all' ? 'Every role' : RN(x)}</i>`).join('')}</span><span class="rf-lgo">${ok ? `Open ${n} ${ico('chev', 13)}` : `${ico('lock', 13)} Not available for ${RN(r)}`}</span></span></button>`; }).join('')}</div>`
    + `<div class="rf-shared">${ico('db', 18)}<div><b>One set of boards behind all six</b><small>Programmes, schemes, properties, property measures, purchasing, quotes and costs, invoices and tasks: 21 boards, each app reads or edits only what its team needs.</small></div><button class="btn sec sm" data-act="view" data-v="db">See the data map</button></div>`; }
A.lockedApp = el => toast(`${APPN[el.dataset.v]} is not available for ${RN(S.role)}. Switch “Viewing as” to a role that uses it.`);
A.goHome = () => { S.view = 'home'; S.pop = null; render(true); };
A.popSw = () => { S.pop = S.pop === 'sw' ? null : 'sw'; drawPop(); };
A.popRole = el => { S.pop = S.pop === 'role' ? null : 'role'; S.popAt = el.getBoundingClientRect(); drawPop(); };
A.popNt = () => { S.pop = S.pop === 'nt' ? null : 'nt'; drawPop(); };
A.setRole = el => { S.role = el.dataset.v; S.pop = null; if(S.view !== 'home' && S.view !== 'db' && !allowed(S.view)) S.view = 'home'; render(true); toast(`Viewing as ${RN(S.role)}: ${APPS.filter(([k]) => allowed(k)).map(a => a[1]).join(', ')}.`); };
export const origView = A.view; A.view = el => { if(!allowed(el.dataset.v)) return A.lockedApp(el); S.pop = null; origView(el); };
document.addEventListener('click', e => { if(S.pop && !e.target.closest('.rf-pop') && !e.target.closest('[data-act^="pop"]')){ S.pop = null; drawPop(); } });
