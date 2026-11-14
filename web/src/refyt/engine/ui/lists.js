// Refyt · Listas compartidas por las apps.
import {
  A, DB, MEAS, OPENP, PH, PHOWN, RN, S, abrir, canMoney, cell, daysIn, empty, esc, grpH, ico, late,
  lateTag, mgTag, norm, pIdx, pMoney, phGate, phTag, prsOf, render, rowO, scOf, seg, tcell, th
} from "../index.js";
export const prHead = money => th(cell('Property', 'Scheme', 2.4) + cell('Phase', 'Owner', 1.5) + cell('Measures', '') + cell('Next', '', 2) + (money ? cell('Days in phase', 'or forecast margin') : cell('In phase', '')));
export const prRow = (p, money) => { const g = phGate(p), sc = scOf(p.sc); return rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), `${p.id}, ${sc.n}`, 2.4) + `<div class="mbc" style="flex:1.5"><b>${phTag(p)}</b><small>${RN(PHOWN[p.ph])}</small></div>` + cell(p.ms.map(x => MEAS[x.m].s).join(', '), p.ht || '') + cell(OPENP.includes(p.ph) ? (g.ok ? `Ready for ${PH[pIdx(p.ph) + 1].slice(3)}` : esc(g.miss[0])) : p.ph, g.miss.length > 1 ? `and ${g.miss.length - 1} more` : '', 2) + (money && pIdx(p.ph) >= 2 && p.ph !== 'Cancelled' ? `<div class="mbc"><b>${mgTag(pMoney(p).mgp, sc.set.mg)}</b><small></small></div>` : `<div class="mbc"><b class="${late(p) === 'red' ? 'rf-od' : late(p) ? 'lt79' : ''}" title="${late(p) ? 'Over the phase limit' : ''}">${OPENP.includes(p.ph) ? daysIn(p) + ' days' : ''}</b><small></small></div>`), S.hl === p.id); };
function prList0(xs, key){ const app = S.view, sf = key === 'all' ? '' : S.f.sc || '', q = norm(S.f.prq), v = S.f.prf || 'open';
  const ys = xs.filter(p => (!sf || p.sc === sf) && (v === 'all' || (v === 'open' ? OPENP.includes(p.ph) : !OPENP.includes(p.ph))) && (!q || norm(p.ad + p.id + p.res + p.pc + p.ref).includes(q)));
  return `<div class="rf-bar"><div class="isearch" style="flex:1;min-width:240px">${ico('search', 18)}<input type="search" data-in="f" data-k="prq" placeholder="Search an address, postcode, customer or client reference" value="${esc(S.f.prq || '')}"></div>${seg('prf', v, [['open', 'Open'], ['closed', 'Paid and cancelled'], ['all', 'All']])}</div>` + (key === 'all' ? '' : `<div class="rf-bar">${seg('scf', sf, [['', 'All schemes'], ...DB.sc.map(s => [s.id, s.n, prsOf(s.id).filter(p => OPENP.includes(p.ph)).length])])}</div>`)
    + prHead(canMoney(app)) + (PH.map(ph => { const zs = ys.filter(p => p.ph === ph); return zs.length ? grpH(ph, zs.length) + zs.map(p => prRow(p, canMoney(app))).join('') : ''; }).join('') || empty('No properties match.')); }
A.prf = el => { S.f.prf = el.dataset.v; render(); };
A.scf = el => { S.f.sc = el.dataset.v; render(); };
A.prOpen = el => { const [id, t] = el.dataset.v.split('|'); abrir(S.view, id, t || 'res'); };
A.prMon = el => abrir(S.view, el.dataset.v, 'mon');

/* Later versions wrap or replace prList (the original reassigns it). Kept as var: no temporal dead zone. */
var prListW = null;
export function prList(...x){ return (prListW || prList0)(...x); }
export const setPrList = f => { prListW = f; };
