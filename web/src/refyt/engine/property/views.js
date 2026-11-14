// Refyt · La misma propiedad vista desde cada app.
import {
  A, APPI, APPN, DB, abrir, allowed, btns, cell, csName, dDiff, empty, fm, fmtDy, grpH, ico, later, nx,
  pill, ptOf, rdiv, tyOf
} from "../index.js";
export const ATABS = {dir:[['res', 'Summary'], ['mea', 'Measures'], ['ret', 'Assess and design'], ['ins', 'Install'], ['clo', 'Close out'], ['mon', 'Money'], ['his', 'History']], com:[['res', 'Summary'], ['mea', 'Margin per measure'], ['mon', 'Costs and variations'], ['his', 'History']], acc:[['res', 'Summary'], ['inv', 'Invoice and payments'], ['mon', 'Actual costs'], ['his', 'History']], ret:[['res', 'Summary'], ['ret', 'Evidence and design'], ['his', 'History']], del:[['res', 'Summary'], ['mea', 'Measures'], ['ins', 'Prepare and install'], ['mon', 'Orders'], ['clo', 'Close out'], ['his', 'History']], tsk:[['res', 'Summary'], ['his', 'History']]};
export const trig = p => (tyOf(p) === 'E.ON' && p.cs >= 7) || (tyOf(p) === 'GLA' && p.cs >= 6) || (tyOf(p) === 'Redbridge' && p.cs >= 4);
export function invTab(app, p){ const inv = DB.inv.filter(v => v.pr === p.id), sps = DB.sp.filter(s => s.pr === p.id), t = trig(p);
  return `<div class="rf-gate${t ? ' ok' : ''}">${ico(t ? 'check' : 'clock', 17)}<div><b>${t ? 'Payment trigger met' : 'Payment trigger not met yet'}</b><small>${ptOf(p).trig}. ${ptOf(p).sys} shows: ${csName(p)}.</small></div>${t && !inv.length ? nx('invNew', p.id, 'Raise invoice') : ''}</div>`
    + grpH('Invoices', inv.length) + (inv.length ? inv.map(v => rdiv(cell(v.id, `raised ${fmtDy(v.on)}`, 2) + cell(fm(v.amt), `due ${fmtDy(v.due)}`) + `<div class="mbc"><b>${v.paid ? pill('tg', 'Paid ' + fmtDy(v.paid)) : dDiff(v.due) < 0 ? pill('tred', 'Overdue') : pill('tk', 'Waiting')}</b><small></small></div>` + btns(v.paid ? '' : nx('invPaid', v.id, 'Mark paid', 'sec')))).join('') : empty('No invoice yet.'))
    + grpH('Subcontractor payments', sps.length) + (sps.length ? sps.map(s => rdiv(cell(s.sub, s.stage, 2) + cell(fm(s.amt), '') + `<div class="mbc"><b>${pill(s.st === 'Paid' ? 'tg' : 'tk', s.st)}</b><small></small></div>`)).join('') : empty('None.')) + `<p class="hint">${later('Xero')} Invoices and payments are recorded here until the Xero link is built.</p>`; }
export function sameNote(app, p){ return ''; const others = ['ret', 'del', 'com', 'acc', 'dir'].filter(a => a !== app && allowed(a));
  return `<div class="rf-same">${ico(APPI[app], 15)}<span>Same property, seen from the <b>${APPN[app]}</b> app.</span>${others.length ? `<span class="rf-oth">Open in ${others.map(a => `<button class="rf-chipb" data-act="openIn" data-v="${a}|${p.id}">${APPN[a]}</button>`).join('')}</span>` : ''}</div>`; }
A.openIn = el => { const [a, id] = el.dataset.v.split('|'); abrir(a, id, 'res'); };
