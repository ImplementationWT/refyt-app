// Refyt · Apps por equipo sobre la misma información.
import {
  AUTH, A, APPN, DB, GRAD, PHOWN, PHS, RGROUPS, RN, ROLES, S, TODAY, addDays, approvals, cell, empty, esc,
  fmtDy, grpH, his, ico, numIn, oph, pIdx, pill, prOf, ptOf, rdiv, ready, render, scOf, sum, toast
} from "../index.js";
ROLES.sit = ['Site manager', 'akr'];
prOf('PR-2020').cs = 4;
Object.assign(PHS, {'A. Job received':'tb', 'B. Assess and design':'tb', 'C. Client approval':'tb', 'D. Prepare to install':'tb', 'E. Install':'tb', 'F. Close out':'tb', 'Paid':'tg', 'Cancelled':'tk'});
Object.assign(GRAD, {tk:'#0A3323', tb:'#105666', tg:'#105666', ta:'#3A5DB0', tt:'#0A3323', tv:'#105666', tp:'#3A5DB0', to:'#105666', tred:'#0A3323'});
export const LAPPS = {
  dir:{team:'Directors', roles:['dir'], line:'The whole business at a glance, drill down to a cost line, new schemes, roles and approvals above the scheme limits.'},
  com:{team:'Commercial', roles:['com'], line:'Rates, quotes and budgets per measure, live margins, variations, additional costs and scheme settings.'},
  acc:{team:'Accounts', roles:['acc'], line:'Payment triggers, invoices due and overdue, supplier invoices to match and subcontractor payments.'},
  ret:{team:'Retrofit services', roles:['sad', 'ass', 'aap', 'dsg', 'dap'], line:'Phases A and B, from job received to survey pack, with the assessor’s mobile form.'},
  del:{team:'Delivery', roles:['inc', 'oap', 'pap', 'sit', 'hse'], line:'Phases D, E and F: preparation, install, purchasing, close out, health and safety and site forms.'},
  tsk:{team:'Everyone', roles:[], line:'Tasks from meetings and jobs, with the Monday and Thursday team meetings.'},
};
export const allowed = app => {
  if(app === 'db' || app === 'home') return true;
  // Sesión real: solo las apps que dan los permisos del usuario (refyt.director, refyt.delivery…).
  if(AUTH.apps && app !== 'tsk' && !AUTH.apps.includes(app)) return false;
  if(AUTH.apps && !AUTH.viewAs) return true;
  return S.role === 'dir' || app === 'tsk' || (LAPPS[app] && LAPPS[app].roles.includes(S.role));
};
export const WAITR = {dir:['dir'], com:['com'], ret:['aap', 'dap'], del:['oap', 'pap']};
export const nWait = app => approvals().filter(a => (WAITR[app] || []).includes(a.role)).length;
export const later = t => `<span class="rf-later" title="Integration to scope after the six apps">${t}: Later</span>`;
export const lockCard = () => `<div class="rf-lock">${ico('lock', 17)}<div><b>Quotes, budgets and margins are not shown here</b><small>Visible to Director, Commercial and Accounts.</small></div></div>`;

/* Automations: every run is shown, and written on the property’s history */
DB.runs = [];
export function auto(p, app, text){ if(p) his(p, 'The system ' + text, 'sys'); DB.runs.push([TODAY, app, text, p ? p.id : '']); render(); toast(`<b>Automation:</b> The system ${esc(text)}`); }
export const wrap = (k, fn) => { const o = A[k]; A[k] = (el, x) => fn(o, el, x); };
wrap('dSet', (o, el) => { const p = prOf(el.dataset.v.split('|')[0]), was = ready(p); o(el); if(!was && ready(p)) auto(p, 'del', 'set Ready to install and notified the Install coordinator'); });
wrap('arNo', (o, el, x) => { o(el, x); const p = prOf(el.dataset.v); setTimeout(() => auto(p, 'ret', `booked a revisit for the Assessor, counted it (${p.b.revisits}) and notified the Assessor`), 0); });
wrap('bVis', (o, el) => { o(el); auto(prOf(el.dataset.v), 'ret', 'notified the Assessment approver that the evidence is ready for review'); });
wrap('bStep', (o, el) => { o(el); const [id, k] = el.dataset.v.split('|'); if(k === 'dsg') auto(prOf(id), 'ret', 'notified the Design approver'); });
wrap('phNext', (o, el) => { const p = prOf(el.dataset.v), from = p.ph; o(el); if(p.ph !== from) auto(p, pIdx(p.ph) <= 2 ? 'ret' : 'del', `set the owner to ${RN(PHOWN[p.ph])} and recorded the date it entered ${p.ph}${p.csTodo ? `, and created a reminder to update ${ptOf(p).sys}` : ''}`); });
wrap('orOk', (o, el) => { const ord = DB.or.find(x => x.id === el.dataset.v); o(el); auto(ord.al[0].pr ? prOf(ord.al[0].pr) : null, 'del', `recorded ${ord.id} as committed cost on ${ord.al.length > 1 ? ord.al.length + ' properties' : 'its property and measure'}`); });
wrap('orInv', (o, el) => { const ord = DB.or.find(x => x.id === el.dataset.v); o(el); auto(ord.al[0].pr ? prOf(ord.al[0].pr) : null, 'acc', `recorded the supplier invoice on ${ord.id} as actual cost`); });
wrap('gSet', (o, el) => { const [id, k] = el.dataset.v.split('|'), p = prOf(id), hp = RGROUPS.find(g => g[0] === k)[3]; o(el); if(hp && p.g[k] === 'Complete') auto(p, 'del', 'unlocked the next group and notified the site team'); });
wrap('invNew', (o, el) => { const p = prOf(el.dataset.v); o(el); auto(p, 'acc', `set the due date from ${scOf(p.sc).n}’s payment terms (${scOf(p.sc).set.terms} days)`); });
wrap('vaClient', (o, el) => { const v = DB.va.find(x => x.id === el.dataset.v); o(el); auto(prOf(v.pr), 'com', 'updated the quoted value and the budget of the measure'); });
wrap('cnOk', (o, el) => { const id = S.modal.id; o(el); const p = prOf(id); if(p.cancel && p.cancel.abort) auto(p, 'com', 'recorded the reason and the phase, and created an abortive work invoice line'); });
wrap('orOk2', (o, el) => { const m = S.modal, p = prOf(m.al[0].pr), tot = sum(m.al, a => numIn(a.a)), over = tot > scOf(p.sc).set.ord; o(el); auto(p, 'del', over ? `sent the order to the Director, above the ${scOf(p.sc).n} limit` : 'sent the order to the Order approver'); });
wrap('csDone', (o, el) => { o(el); });
export const AUTO = {
  dir:['A new scheme from a template (E.ON, GLA, Redbridge or blank), or copied from another, arrives with its stages, checklists and settings, and appears on the dashboard.', 'Every change to a scheme setting is logged with who, when, and the old and new value.', 'Orders, payments, variations and additional costs above the scheme limit go to the Director.', 'Directors get a daily summary instead of individual alerts, plus an immediate alert for approvals waiting on them and red flags.', 'An invoice still unpaid after Accounts was notified is escalated to the Director.'],
  com:['When measures are chosen after modelling, a quote line per measure is created from the scheme’s rates.', 'When the client approves, the quote becomes the approved value and the budget is locked.', 'An approved variation updates the quoted value and the budget; an approved additional cost adds to forecast cost.', 'Variations above the scheme limit go to the Director before the client.', 'Forecast cost over budget, or margin below the scheme target, alerts Commercial and the Director.', 'A cancelled job with work done creates an abortive work invoice line.'],
  acc:['When a payment trigger is met (E.ON install complete, GLA final upload accepted, Redbridge Cotality registered), Accounts is notified and the invoice line is prepared.', 'The due date is set from the scheme’s payment terms.', 'A trigger met with no invoice within the set days raises an alert.', 'An overdue invoice notifies Accounts, then the Director.', 'A supplier invoice recorded against an order becomes actual cost on its property and measure.', 'A payment marked as paid updates the outstanding balance per scheme.'],
  ret:['A stage submitted for review notifies its approver.', 'A rejected assessment books a revisit, counts it and notifies the Assessor.', 'When a property moves stage, the new owner is assigned from the scheme’s roles and the date is recorded.', 'A property past its stage time limit turns amber then red, notifying the owner and then the head of team.', 'When measures are chosen, the checklist is built from the templates by programme, measure and house type.', 'When a stage needs the client system updated, the owner gets a reminder with a tick.'],
  del:['When every phase D item that applies is done, the property is set to Ready to install and the Install coordinator is notified.', 'On Redbridge, groups that do not apply to the house type or the PO are marked not applicable.', 'A hold point blocks the next group; once passed, it unlocks it and notifies the site team.', 'An order goes to the Order approver, or the Director above the scheme limit; once approved it is committed cost.', 'A subcontractor payment goes to the Payment approver and an additional cost to the Order approver, or the Director above the limit.', 'A client query logged on a property creates a task for the Install coordinator.', 'Insurances and accreditations alert the HSSE lead before they expire.', 'A cancelled job records the reason and the phase reached.'],
  tsk:['An action agreed in a meeting creates a task with an owner and a due date.', 'Owners are reminded before a task is due; overdue tasks are flagged to the owner and go in the head of team’s daily summary.'],
};
export function autoPage(app){ const runs = DB.runs.filter(r => r[1] === app);
  return oph('Automations in this app', `What the system does by itself in ${APPN[app]}, so nobody has to.`) + AUTO[app].map(t => `<div class="rf-dl ok"><span class="rf-ck">${ico('sync', 13, 2.4)}</span><div><b style="font-weight:600">${t}</b></div>${pill('tg', 'On')}</div>`).join('')
    + grpH('Ran in this session', runs.length) + (runs.length ? runs.slice().reverse().map(r => rdiv(cell('The system ' + esc(r[2]), r[3] ? `${r[3]} ${prOf(r[3]).ad}` : '', 3) + cell(fmtDy(r[0]), ''))).join('') : empty('Nothing yet. Approve, book or complete something and it shows here.')); }

/* Alerts: Accounts matches supplier invoices; the HSSE lead hears before anything expires */
export const HSD = [['Public liability insurance', 9], ['Employers liability insurance', 140], ['TrustMark registration', 60], ['MCS certification', 25], ['PAS 2030 certification', 200], ['CSCS cards, site team', 18]].map(([n, d]) => ({n, exp:addDays(TODAY, d)}));
