// Refyt · Tareas y reuniones en cada app.
import {
  A, APPS, CBK, DB, HOME, LAPPS, ME, MODALS, OPENP, PEO, RN, ROLES, RP, S, TODAY, TOUR, TOUR_MAS,
  VERSIONS, VIEWS, abrir, addDays, btns, cbx, cell, dDiff, drawPop, due, esc, firstApp, fld, fmtD,
  fmtDy, go, his, ini, mfoot, mlab, modal, mseg, mtgPage5, nx, pageAct, pill, prOf, render,
  renderLayer, sbItem, scrollHL, tasksPage, teamOf, toast
} from "../index.js";
APPS.splice(APPS.findIndex(a => a[0] === 'tsk'), 1);
export const D0 = '2026-10-26';
export const dAt = n => addDays(D0, n);
/* Meetings: Monday and Thursday for everyone, Tuesday directors only in Director */
DB.mt = [
  {id:'MT-501', ty:'Monday team meeting', d:dAt(-14), h:'09:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:true, sum:'Progress per scheme. Medway and Thanet on pace; Redbridge slowed by the steel frame checks. GLA Warmer Homes still waiting for its close out list.', dec:['Redbridge reported at group level only from now on.', 'GLA close out list to be shared with the build team this week.']},
  {id:'MT-502', ty:'Thursday follow up', d:dAt(-11), h:'15:00', who:['dre', 'sar', 'ram', 'ahm', 'lan', 'tom'], ready:true, sum:'Follow up of Monday’s actions. MDA could not attend Clayhall Avenue; supplier invoices for September matched.', dec:['Book MDA again for Clayhall Avenue before any EWI work.']},
  {id:'MT-503', ty:'Monday team meeting', d:dAt(-7), h:'09:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:true, sum:'Thanet survey pack still has open E.ON comments. Saxton Street invoice is overdue with Medway. Waverley and Cottsway start in October and need first assessments booked.', dec:['Survey admin owns all E.ON comments until they close.', 'Accounts chases overdue invoices every Monday.']},
  {id:'MT-504', ty:'Tuesday directors', d:dAt(-6), h:'10:00', who:['yah', 'tom', 'lan'], ready:true, sum:'Margins per scheme: Redbridge below its 18% target because of the Clayhall Avenue stanchion repair. Cash owed by Medway is overdue. One variation waiting for internal approval.', dec:['Margin targets for Waverley and Cottsway to be agreed by Friday.', 'Price the Fencepiece Road windows variation before it goes to Kanopi Works.']},
  {id:'MT-505', ty:'Thursday follow up', d:dAt(-4), h:'15:00', who:['dre', 'sar', 'ram', 'ahm', 'lan', 'tom'], ready:false, sum:'', dec:[]},
  {id:'MT-506', ty:'Monday team meeting', d:dAt(0), h:'16:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:false, sum:'', dec:[]},
  {id:'MT-507', ty:'Tuesday directors', d:dAt(1), h:'10:00', who:['yah', 'tom', 'lan'], ready:false, sum:'', dec:[]},
  {id:'MT-508', ty:'Thursday follow up', d:dAt(3), h:'15:00', who:['dre', 'sar', 'ram', 'ahm', 'lan', 'tom'], ready:false, sum:'', dec:[]},
  {id:'MT-509', ty:'Monday team meeting', d:dAt(7), h:'09:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:false, sum:'', dec:[]},
];
/* Tasks: from meetings (their actions) and from jobs; the same list everywhere */
DB.tk = [
  ['TK-201', 'Send the GLA close out document list to Ariana', 'com', -7, 'MT-501', null, -10],
  ['TK-202', 'Renew public liability certificate', 'hse', 9, 'MT-501'],
  ['TK-203', 'Book MDA revisit for Clayhall Avenue', 'inc', -3, 'MT-502', 'PR-2017', -4],
  ['TK-204', 'Match September supplier invoices to orders', 'acc', -5, 'MT-502', null, -5],
  ['TK-205', 'Chase E.ON for the Thanet survey pack comments', 'sad', 1, 'MT-503', 'PR-2008'],
  ['TK-206', 'Chase Medway Council for Saxton Street', 'acc', -2, 'MT-503', 'PR-2005'],
  ['TK-207', 'Confirm the scaffold date, Manford Way', 'inc', 0, 'MT-503', 'PR-2021'],
  ['TK-208', 'Book the first Waverley assessments', 'sad', 4, 'MT-503', 'PR-2013'],
  ['TK-209', 'Agree margin targets for Waverley and Cottsway', 'dir', -3, 'MT-504'],
  ['TK-210', 'Price the windows variation, Fencepiece Road', 'com', 2, 'MT-504', 'PR-2020'],
  ['TK-211', 'Send the Tuesday margin pack', 'dir', 0, 'MT-504', null, 0],
  ['TK-212', 'Review the Dane Road design pack', 'dap', 1, 'Job', 'PR-2008'],
  ['TK-213', 'Match October supplier invoices to orders', 'acc', 2, 'Job', 'PR-2003'],
  ['TK-214', 'Upload the corrected handover photos, Fencepiece Road', 'inc', -1, 'Job', 'PR-2020'],
  ['TK-215', 'Check the modelling after the Canterbury Street revisit', 'aap', 0, 'Job', 'PR-2001'],
  ['TK-216', 'Confirm the GLA eligibility list for Leytonstone Road', 'sad', -1, 'Job', 'PR-2015', 0],
].map(([id, t, r, due, src, pr, done]) => ({id, t, r, due:dAt(due), src, pr:pr || null, done:done != null, doneOn:done != null ? dAt(done) : null}));
DB.seq.tk = 216;
export const mtOf = id => DB.mt.find(m => m.id === id);
export const mtActs = m => DB.tk.filter(k => k.src === m.id);
export const mtSees = (app, m) => m.ty !== 'Tuesday directors' || app === 'dir';

/* My tasks: four indicators that filter the list */
export const tkOver = k => !k.done && dDiff(k.due) < 0;
export const TKF = {today:['Due today', k => !k.done && dDiff(k.due) === 0], open:['Open', k => !k.done], over:['Overdue', tkOver], done:['Done this week', k => k.done && k.doneOn >= D0]};
export const tkOrigin = (app, k) => { const m = mtOf(k.src); return m ? (mtSees(app, m) ? `<button class="lnk4" data-act="mtOpen" data-v="${m.id}">${m.ty}, ${fmtDy(m.d)}</button>` : `${m.ty}, ${fmtDy(m.d)}`) : k.pr ? `<button class="lnk4" data-act="prOpen" data-v="${k.pr}">Job ${k.pr}, ${esc(prOf(k.pr).ad)}</button>` : 'Added by hand'; };
export const tkRow5 = (app, k) => `<div class="mbr nc${tkOver(k) ? ' rf-ovr' : ''}${S.hl === k.id ? ' hl2' : ''}" data-hl="${k.id}"><div class="mbc" style="flex:3"><b>${esc(k.t)}</b><small>${k.pr && mtOf(k.src) ? `<button class="lnk4" data-act="prOpen" data-v="${k.pr}">${esc(prOf(k.pr).ad)}</button>` : ''}</small></div>` + cell(RN(k.r), RP(k.r), 1.4) + `<div class="mbc"><b${tkOver(k) ? ' class="rf-od"' : ''}>${fmtDy(k.due)}</b><small>${k.done ? 'done ' + fmtDy(k.doneOn) : fmtD(k.due)}</small></div>` + `<div class="mbc" style="flex:1.8"><b style="font-weight:600">${tkOrigin(app, k)}</b><small>${mtOf(k.src) ? 'meeting action' : 'from a job'}</small></div>` + `<div class="mbc"><b>${k.done ? pill('tg', 'Done') : tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', 'Open')}</b><small></small></div>` + btns(k.done ? '' : nx('tkDone5', k.id, 'Mark done', 'sec')) + `</div>`;
A.tkf = el => { S.f.tkf = el.dataset.v; render(); };
A.tkm = el => { S.f.tkm = el.dataset.v; render(); };
A.tkDone5 = el => { const k = DB.tk.find(x => x.id === el.dataset.v); k.done = true; k.doneOn = TODAY; if(k.pr) his(prOf(k.pr), `Task done: ${k.t}`, ME()); render(); toast('Done. It counts in Done this week.'); };
export const tmRoles = app => app === 'dir' ? Object.keys(ROLES) : LAPPS[app].roles;
A.tkNew5 = () => { S.modal = {k:'tk5', t:'', r:tmRoles(S.view).includes(S.role) ? S.role : '', d:'', pr:''}; renderLayer(); };
MODALS.tk5 = m => modal('Add a task', 'With an owner, a due date and, if it belongs to one, the property.', fld('Task', 'm', 't', m.t, {req:true, ph:'e.g. Send the Waverley archetype list'}) + mlab('Owner', true) + mseg('r', m.r, tmRoles(S.view).map(r => [r, `${RN(r)}, ${RP(r)}`])) + `<div class="rf-2">${fld('Due date', 'm', 'd', m.d, {type:'date', req:true})}${cbx('Property (optional)', 'tkpr', [['', 'No property'], ...DB.pr.filter(p => OPENP.includes(p.ph)).map(p => [p.id, p.ad, p.id])], m.pr, 'm', {ph:'No property'})}</div>`, mfoot('Add task', 'tkOk5', !!(m.t.trim() && m.r && m.d)), 620);
CBK.tkpr = 'pr';
A.tkOk5 = () => { const m = S.modal, k = {id:'TK-' + (++DB.seq.tk), t:m.t.trim(), r:m.r, due:m.d, src:'Job', pr:m.pr || null, done:false, doneOn:null}; if(!k.pr) k.src = 'Added'; DB.tk.push(k); if(k.pr) his(prOf(k.pr), `Task added: ${k.t}, ${RN(k.r)}, due ${fmtDy(k.due)}`, ME()); S.modal = null; S.hl = k.id; render(); toast(`Task added for ${RN(k.r)}.`); };

/* Meetings: a register with upcoming and past, and each meeting’s detail */
export const avs = ks => `<span class="rf-avs">${ks.slice(0, 4).map(k => `<i title="${esc(PEO[k].n)}">${ini(PEO[k].n) || PEO[k].n[0]}</i>`).join('')}${ks.length > 4 ? `<em>+${ks.length - 4}</em>` : ''}</span>`;
A.mtt = el => { S.f.mtt = el.dataset.v; S.f.mtd = null; render(); };
A.mtOpen = el => { S.f.mtd = el.dataset.v; S.fi[S.view] = null; S.page[S.view] = 'mtg'; render(true); };
A.mtBack = () => { const id = S.f.mtd; S.f.mtd = null; S.hl = id; render(true); };
A.tkGo = el => { const k = DB.tk.find(x => x.id === el.dataset.v); S.f.tkf = k.done ? 'done' : 'open'; S.f.tkm = 'all'; S.f.ttm = ''; S.hl = k.id; S.page[S.view] = 'tasks'; S.fi[S.view] = null; render(true); scrollHL(); };

/* Sidebars: Tasks and meetings first, and it is where every app opens */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side, act = pageAct(a);
  VIEWS[a].side = () => o().replace(new RegExp(`<button class="nav" data-act="${act}" data-v="(tasks|tue)"[\\s\\S]*?</button>`, 'g'), '').replace('<aside class="sb">', '<aside class="sb"><div class="sb-sec">Tasks and meetings</div>' + sbItem(S.page[a], act)(['tasks', 'My tasks', 'todo', DB.tk.filter(k => !k.done && (a === 'dir' || teamOf(k.r) === a)).length, DB.tk.some(k => tkOver(k) && (a === 'dir' || teamOf(k.r) === a)) ? 2 : 1]) + sbItem(S.page[a], act)(['mtg', 'Meetings', 'cal', DB.mt.filter(m => mtSees(a, m) && m.d >= TODAY).length, 1]));
  VIEWS[a].pages.tasks = () => tasksPage(a); VIEWS[a].pages.mtg = () => mtgPage5(a); HOME[a] = 'tasks'; S.page[a] = 'tasks'; });
export const op5 = A[pageAct('dir')]; APPS.forEach(([a]) => { const o = A[pageAct(a)]; A[pageAct(a)] = el => { if(el.dataset.v === 'mtg') S.f.mtd = null; o(el); }; });

/* Versions and tour */
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/CjHHZnDYP8wSQzW9v2fcXJ'; } });
VERSIONS.push({v:'v3.2', date:TODAY, major:false, current:true, url:null, title:'Five apps, each opening on Tasks and meetings', sum:'Tasks and meetings is now the first section of every app: my tasks with four indicators, and the meetings register with summaries, decisions and actions. Everything now speaks of the REFYT system.', steps:[
  {t:'Five apps', min:.5, dolor:'Before, Tasks and meetings was a sixth app.', show:['The dropdown lists Director, Commercial, Accounts, Retrofit and Delivery.'], say:'Each team works in one app.', go:() => { S.role = 'dir'; go('dir', 'tasks'); S.pop = 'sw'; drawPop(); }},
  {t:'Tasks and meetings first, in every app', min:1, dolor:'Before, tasks were a section near the bottom.', show:['Due today, open, overdue and done this week; each one filters the list.', 'My tasks or all team tasks; Director filters by team.'], say:'The day starts with what is due.', go:() => { S.role = 'inc'; S.f.tkf = 'open'; go('del', 'tasks'); }},
  {t:'The meetings register', min:1, dolor:'Before, meetings were a report page.', show:['Upcoming and past meetings with attendees, summary status and actions.', 'Open one: summary, decisions and the tasks it created.'], say:'Every action can be traced to the meeting that agreed it.', go:() => { S.role = 'dir'; S.f.mtt = 'past'; S.f.mtd = 'MT-503'; go('dir', 'mtg'); }},
  {t:'The REFYT system', min:.5, dolor:'Before, the demo named another platform.', show:['Automations say “The system...”; the data map shows the REFYT system’s records.'], say:'It is your system.', go:() => { S.role = 'dir'; go('del', 'auto'); }},
]});
TOUR.length = 0;
TOUR.push(
  {t:'Five apps, one per team', min:1.5, dolor:'Section 14: "Each team should feel it has its own tool, showing only what it needs."', show:['The app’s name sits next to the logo; the dropdown lists Director, Commercial, Accounts, Retrofit and Delivery with their team.', 'Every app opens on its Tasks and meetings.'], say:'Five tools, one version of every job.', go:() => { S.role = 'dir'; go('dir', 'tasks'); S.pop = 'sw'; drawPop(); }},
  {t:'Each role opens its own apps', min:1, dolor:'Roles, not names: your restructure decides who fills each one.', show:['Viewing as Assessor: Retrofit opens; the other apps are locked in the dropdown.'], say:'Change the person behind a role; nothing is rebuilt.', go:() => { S.role = 'ass'; S.view = firstApp(); render(true); S.pop = 'sw'; drawPop(); }},
  {t:'The day starts with Tasks and meetings', min:1.5, dolor:'Section 15: actions agreed in a meeting become tasks with an owner and a due date.', show:['Delivery: due today, open, overdue and done this week; click one to filter.', 'The scaffold date for Manford Way is due today; the Fencepiece Road photos are overdue.', 'Add a task with an owner, a due date and its property.'], say:'Nothing agreed is lost between meetings.', go:() => { S.role = 'inc'; S.f.tkf = 'open'; S.f.tkm = 'all'; go('del', 'tasks'); }},
  {t:'The meetings register', min:1.5, dolor:'Monday and Thursday for everyone, Tuesday for the directors with the money.', show:['Past: the Monday meeting of Oct 19 with its summary, decisions and four actions.', 'Each action opens the task it created.'], say:'Every task traces back to its meeting.', go:() => { S.role = 'dir'; S.f.mtt = 'past'; S.f.mtd = 'MT-503'; go('dir', 'mtg'); }},
  {t:'Retrofit: evidence, review and revisits', min:1.5, dolor:'Section 5: if anything is missing, the assessor goes back; the system books and counts the revisit.', show:['Waiting for my approval: the assessment on Canterbury Street.', 'Reject with a comment: the revisit is booked and counted.'], say:'The pack is complete before the client sees it.', go:() => { S.role = 'aap'; go('ret', 'wait'); }},
  {t:'Delivery: Ready to install sets itself', min:1.5, dolor:'Section 6: a property shows Ready to install automatically once every item that applies is done.', show:['9 Balmoral Road: finish the last items and it turns ready.', 'Redbridge tracker with the MDA hold point.'], say:'Delivery runs phases D, E and F from one app.', go:() => { S.role = 'inc'; go('del', 'rdy'); }},
  {t:'One property, each team’s view', min:1.5, dolor:'Section 10: operations see progress and bookings, never prices or margins.', show:['22 Clayhall Avenue in Delivery: install and orders, money locked.', 'Open it in Commercial: 15% margin against an 18% target.'], say:'Same record, each team sees its part.', go:() => { S.role = 'dir'; abrir('del', 'PR-2017', 'res'); }},
  {t:'Director: the dashboards', min:2, dolor:'Rule 4: meetings and decisions run from dashboards.', show:['The eight dashboards of section 16, with filters, trends and schemes side by side.', 'Click a scheme, then a property, then its cost line.'], say:'The Tuesday meeting is already prepared.', go:() => { S.role = 'dir'; go('dir', 'dbiz'); }});
TOUR_MAS.length = 0; TOUR_MAS.push('Accounts: payment triggers and supplier invoices to match.', 'Commercial: scheme settings with their change log.', 'Delivery: health and safety expiry dates.', 'Retrofit: import jobs from the client list.', 'Data map: the records behind the five apps.');
S.view = firstApp();
