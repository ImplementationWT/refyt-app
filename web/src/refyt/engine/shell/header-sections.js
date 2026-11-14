// Refyt · v5: secciones en el encabezado, cada una con su menú; Overview por rol.
import {
  $, A, ALL4, DB, IC, IN, ITEMS4, ME, MEAS, NAV4, OPENP, PEO, PH, S, TODAY, TOUR, TOUR_MAS, VIEWS,
  WAIT4, abrir, addDays, approvals, av, canMoney, canNav, dDiff, drawPop, empty, esc, fmtDy, go,
  grpH, homeApp, ico, isAdmin, norm, pend, prHead, prRow, render, scOf, setDrawVs, setPrList, toast,
  wrapDrawPop, wrapDrawTour, wrapRender
} from "../index.js";
/* =================== v5: sections across the header, each with its own menu; Overview by role =================== */
/* The header holds what everyone shares (Overview, Properties, Meetings) and the team sections (Director, Commercial,
   Accounts, Retrofit, Delivery). The left menu shows only the selected section. A role sees the team sections it may open. */
export const I4 = k => ITEMS4.find(x => x.k === k);
export const mk = (k, n, ic, to, r, extra = {}) => ({k, n, ic, to, r, ...extra});
export const SEC5 = [
  {k:'ovw', n:'Overview', ic:'inbox', tone:'#2F5BD3', sub:'What needs you today', groups:[['', [I4('home'), I4('tasks'), I4('atn'), I4('wait'), I4('mtg'), mk('tka', 'All tasks by team', 'check', () => 'tsk:all', ALL4), I4('myt')]]]},
  {k:'prp', n:'Properties', ic:'home', tone:'#0E7C74', sub:'The ones shared with you', groups:[['', [I4('prs'), I4('sch')]]]},
  {k:'dir', n:'Director', ic:'crown', tone:'#16306E', sub:'Reports and administration', team:true, groups:[['Reports', ['dbiz', 'dperf', 'dfin', 'dops', 'dcap', 'dqual', 'dsup'].map(I4)]]},
  {k:'com', n:'Commercial', ic:'calc', tone:'#B45309', sub:'Quotes, budgets and margins', team:true, groups:[['', ['mrg', 'quo', 'var', 'rate'].map(I4).concat([mk('sset', 'Scheme settings', 'edit', () => 'com:sset', ['dir', 'com'])])]]},
  {k:'acc', n:'Accounts', ic:'receipt', tone:'#15803D', sub:'Invoices and payments', team:true, groups:[['', ['trg', 'inv', 'mat', 'sub'].map(I4)]]},
  {k:'ret', n:'Retrofit', ic:'clip', tone:'#0369A1', sub:'Phases A and B', team:true, groups:[['Work', ['bk', 'rq', 'pk'].map(I4)], ['On site', [I4('asf')]]]},
  {k:'adm', n:'Settings', ic:'shield', tone:'#2F5BD3', sub:'Administration', hidden:true, groups:[['', ['usr', 'tms', 'req', 'prm', 'vis', 'nsc', 'cls', 'int'].map(I4)]]},
  {k:'del', n:'Delivery', ic:'home', tone:'#C2410C', sub:'Phases C to F', team:true, groups:[['Work', ['rdy', 'hold', 'clo', 'cs'].map(I4)], ['Purchasing', ['ord', 'sup'].map(I4)], ['On site', [I4('site')]]]},
];
/* the permissions page and the menu read the same list */
NAV4.length = 0; SEC5.forEach(s => s.groups.forEach(([g, xs]) => NAV4.push([s.n + (g ? ', ' + g : ''), xs])));
ITEMS4.length = 0; SEC5.forEach(s => { s.groups.forEach(([, xs]) => xs.forEach(x => ITEMS4.push({...x, sec:s.n}))); (s.foot || []).forEach(x => ITEMS4.push({...x, sec:s.n})); });
export const secItems = s => s.groups.flatMap(([, xs]) => xs).filter(x => canNav(x));
export const secOn = s => s.hidden ? isAdmin() : !s.team || secItems(s).length > 0;
S.sec5 = 'ovw';
export const curK5 = () => S.view === 'db' ? 'db:' : S.view + ':' + (S.page[S.view] || '');
export const syncSec = () => { const cur = curK5(), mine = SEC5.find(s => s.k === S.sec5);
  const has = s => [...s.groups.flatMap(([, xs]) => xs), ...(s.foot || [])].some(x => canNav(x) && x.to() === cur);
  if(mine && has(mine)) return; const f = SEC5.find(s => secOn(s) && has(s)); if(f) S.sec5 = f.k; };
export function uniSide5(){ syncSec(); const s = SEC5.find(x => x.k === S.sec5) || SEC5[0], cur = curK5();
  const it = x => { const to = x.to(), c = x.c ? x.c() : 0;
    return `<button class="nav" data-act="uni5" data-v="${s.k}|${to}" aria-current="${cur === to && !S.fi[S.view]}" title="${esc(x.n)}"><span class="ni">${ico(x.ic, 17)}</span><span class="nl">${x.n}</span>${c ? `<span class="cnt${x.soft === 2 ? ' amb' : ' soft'}">${c}</span>` : ''}</button>`; };
  let h = `<aside class="sb v5-sb" style="--sec:${s.tone}"><button class="sb-tg" data-act="sbMin" title="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-label="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-expanded="${!S.uniMin}">${ico('chev', 16)}<span class="nl">Collapse</span></button>`
    + `<div class="sb-sec v5-top">${s.n}</div>`;
  s.groups.forEach(([g, xs]) => { const vis = xs.filter(x => canNav(x)); if(!vis.length) return; if(g) h += `<div class="sb-sec">${g}</div>`; h += vis.map(it).join(''); });
  const ft = (s.foot || []).filter(x => canNav(x)); if(ft.length) h += `<div class="sb-line"></div>` + ft.map(it).join('');
  return h + `</aside>`; }
['dir', 'com', 'acc', 'ret', 'del', 'tsk'].forEach(a => { if(VIEWS[a]) VIEWS[a].side = uniSide5; });
export const nav5 = (sec, to) => { const [a, pg] = to.split(':'); S.sec5 = sec; S.trail = null; S.pop = null; S.modal = null; if(a === 'db'){ S.view = 'db'; render(true); return; } S.fi[a] = null; go(a, pg); };
A.v5home = () => nav5('ovw', homeApp() + ':ovw');
A.uni5 = el => { const [sec, to] = el.dataset.v.split('|'); nav5(sec, to); };
A.sec5 = el => { const s = SEC5.find(x => x.k === el.dataset.v), first = s && secItems(s)[0]; if(first) nav5(s.k, first.to()); };
{ const os = A.setRole; A.setRole = el => { os(el); if(S.role !== el.dataset.v) return; S.sec5 = 'ovw'; render(true); }; }

/* Header: the sections, the role, notifications and the tour; no version selector */
export const navBar5 = () => `<nav class="v5-nav" aria-label="Sections">${SEC5.filter(s => secOn(s) && !s.hidden).map((s, i, xs) => `${s.k === 'dir' ? '<span class="v5-div" aria-hidden="true"></span>' : ''}<button class="v5-tab" data-act="sec5" data-v="${s.k}" aria-current="${S.sec5 === s.k}" style="--sec:${s.tone}"><i aria-hidden="true"></i>${s.n}</button>`).join('')}</nav>`;
{ wrapRender(r5 => (...x) => { syncSec(); r5(...x);
    const sw = $('#appsw'); if(sw) sw.innerHTML = `${S.view !== 'db' ? `<button class="rf-hb rf-menu" data-act="sbTog" aria-label="Menu">${ico('list', 17)}</button>` : ''}` + navBar5();
    document.querySelectorAll('#tools .vsb, #tools [data-act="setPop"], #tools .tourb').forEach(b => b.remove());
    const tl = $('#tools'); if(tl && isAdmin() && !tl.querySelector('.v5-gear')){ const n = DB.req.filter(q => q.st === 'Pending').length, rb = tl.querySelector('[data-act="popRole"]');
      const g = `<button class="rf-hb v5-gear${S.sec5 === 'adm' || S.pop === 'set5' ? ' on' : ''}" data-act="popSet5" title="Settings" aria-label="Settings" aria-expanded="${S.pop === 'set5'}">${ico('cog', 18)}${n ? `<em class="rf-dot">${n}</em>` : ''}</button>`, nb = tl.querySelector('[data-act="popNt"]'); if(nb) nb.insertAdjacentHTML('afterend', g); else tl.insertAdjacentHTML('beforeend', g); }
    let fab = document.getElementById('v5-fab'); if(!fab){ document.body.insertAdjacentHTML('beforeend', '<button id="v5-fab" data-act="tour" aria-label="Demo tour"></button>'); fab = document.getElementById('v5-fab'); }
    fab.innerHTML = S.tour && S.tour.open ? `${ico('x', 18)}<span>Close tour</span>` : `${ico('flag', 18)}<span>Tour</span>`; fab.classList.toggle('on', !!(S.tour && S.tour.open));
    document.title = 'Refyt'; const at = document.querySelector('.v5-tab[aria-current="true"]'); if(at && at.scrollIntoViewIfNeeded) at.scrollIntoViewIfNeeded(false); }); }
{ wrapDrawPop(dp5 => () => { dp5(); const el = document.getElementById('rfpop'); if(!el || S.pop !== 'more') return; const top = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom + 6;
    el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:12px;width:240px">${isAdmin() ? `<button class="rf-pi" data-act="popSet5"><span class="rf-ai">${ico('cog', 15)}</span><b>Settings</b><small>Users, teams and access</small></button>` : '<div class="rf-ni"><small>Nothing else here.</small></div>'}</div>`; });
   wrapDrawPop(dp6 => () => { dp6(); const el = document.getElementById('rfpop'); if(!el || S.pop !== 'set5') return; const hb = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom;
    const its = SEC5.find(s => s.k === 'adm').groups[0][1], grp = [['People and access', ['usr', 'tms', 'req', 'prm', 'vis']], ['Business setup', ['nsc', 'cls', 'int']]];
    const tile = x => { const c = x.c ? x.c() : 0, on = S.sec5 === 'adm' && curK5() === x.to(); return `<button class="v5-tile${on ? ' on' : ''}" data-act="setGo5" data-v="${x.to()}"><span class="v5-ti">${ico(x.ic, 26, 1.7)}${c ? `<em>${c}</em>` : ''}</span><span class="v5-tl">${x.n}</span></button>`; };
    el.innerHTML = `<div class="rf-pop v5-setp" role="dialog" aria-label="Settings" style="top:${hb + 8}px"><div class="v5-sph"><b>Settings</b><button class="v5-spx" data-act="setGo5" data-v="dir:usr" title="Open full screen" aria-label="Open full screen">${ico('expand', 16)}</button><button class="v5-spx" data-act="popSet5" title="Close" aria-label="Close">${ico('x', 16)}</button></div>`
      + grp.map(([g, ks]) => `<div class="v5-spg"><small>${g}</small><span></span></div><div class="v5-tiles">${ks.map(k => its.find(x => x.k === k)).filter(Boolean).map(tile).join('')}</div>`).join('')
      + `<div class="v5-spf">Only the administrator sees Settings. Pick any item to open it full screen.</div></div>`; }); }
A.setGo5 = el => { S.pop = null; drawPop(); nav5('adm', el.dataset.v); };
IC.cog = '<path d="M9.84 4.92 L10.16 1.56 L13.84 1.56 L14.16 4.92 L15.47 5.47 L18.08 3.32 L20.68 5.92 L18.53 8.53 L19.08 9.84 L22.44 10.16 L22.44 13.84 L19.08 14.16 L18.53 15.47 L20.68 18.08 L18.08 20.68 L15.47 18.53 L14.16 19.08 L13.84 22.44 L10.16 22.44 L9.84 19.08 L8.53 18.53 L5.92 20.68 L3.32 18.08 L5.47 15.47 L4.92 14.16 L1.56 13.84 L1.56 10.16 L4.92 9.84 L5.47 8.53 L3.32 5.92 L5.92 3.32 L8.53 5.47 Z"/><circle cx="12" cy="12" r="3.2"/>'; IC.expand = '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>';
A.popSet5 = () => { S.pop = S.pop === 'set5' ? null : 'set5'; drawPop(); };
{ wrapDrawPop(dp7 => () => { dp7(); const g = document.querySelector('.v5-gear'); if(g){ g.classList.toggle('on', S.pop === 'set5' || S.sec5 === 'adm'); g.setAttribute('aria-expanded', S.pop === 'set5'); } }); }
{ wrapDrawTour(tg => () => { tg(); const f = document.getElementById('v5-fab'); if(f){ f.innerHTML = S.tour.open ? `${ico('x', 18)}<span>Close tour</span>` : `${ico('flag', 18)}<span>Tour</span>`; f.classList.toggle('on', S.tour.open); } }); }
setDrawVs(() => { const el = document.getElementById('vsel'); if(el) el.innerHTML = ''; });

/* Style: REFYT blue stays the main colour; each section carries its own accent, in the header and at the top of its menu */
/* Estilos wt-v5: en web/src/refyt/styles (capa refyt), no se inyectan desde aquí. */

/* Estilos wt-v5a: en web/src/refyt/styles (capa refyt), no se inyectan desde aquí. */

/* The tour: every section, every role, from the first job to payment */
export const T5 = (role, sec, to, then) => () => { S.role = role; S.trail = null; S.pop = null; S.modal = null; if(S.tour) S.tour.min = false; nav5(sec, to); if(then) setTimeout(then, 60); };
export const TF = (role, sec, id, tab, then) => () => { S.role = role; S.trail = null; S.sec5 = sec; abrir(sec === 'prp' ? 'dir' : homeApp(role), id, tab); if(then) setTimeout(then, 60); };
TOUR.length = 0;
TOUR.push(
  {t:'One workspace, sections across the top', min:1, dolor:'Before, five apps repeated the same screens and nobody knew where to look.', show:['Across the top: Overview and Properties, which everyone shares; then Director, Commercial, Accounts, Retrofit and Delivery.', 'The left menu shows only the section you picked.', 'Settings, at the top right, is where the administrator manages people and access.'], say:'The same place for the same thing, every time.', go:T5('dir', 'ovw', 'dir:ovw')},
  {t:'Overview changes with the role', min:1, dolor:'Section 14: each team should feel it has its own tool, showing only what it needs.', show:['Viewing as Install coordinator: Dren’s Home, his tasks and what needs him.', 'Only the team sections his role can open appear in the header.'], say:'Change the person behind a role; nothing is rebuilt.', go:T5('inc', 'ovw', 'del:ovw')},
  {t:'Approve in one click, with the full story', min:1, dolor:'Section 12: approvals above the scheme limits go to the Director.', show:['Overview, Approvals: the order, the payment and the variation waiting on Yahaya.', 'The eye opens the detail: who raised it, since when, the limit, and the conversation kept on the property.'], say:'Decide with the context in front of you.', go:T5('dir', 'ovw', 'dir:wait', () => A.apView && A.apView({dataset:{v:'orPO-740'}}))},
  {t:'My tasks and what needs attention', min:1, dolor:'Section 15: meeting actions become tasks with an owner and a due date.', show:['My tasks: due today, open and overdue, as a list or a calendar.', 'Needs attention: hold points, Ready to install and client systems to update, each with its fix.'], say:'Nothing agreed is lost.', go:T5('inc', 'ovw', 'del:tasks')},
  {t:'Properties: only what is shared with you', min:1, dolor:'People should only see the schemes they work on.', show:['As the Site manager: the properties shared with him, his team or his schemes.', 'Below, the rest of the open work, each with Request access.'], say:'Nothing is hidden by accident.', go:T5('sit', 'prp', 'dir:prs')},
  {t:'One card per property', min:1.5, dolor:'Section 3: the property is the main record.', show:['22 Clayhall Avenue: next step and owner, the phases A to F, and the money for roles that may see it.', 'The tabs follow the job: assess and design, prepare and install, orders, close out, checklists, updates and history.'], say:'Everyone looks at the same card.', go:TF('dir', 'prp', 'PR-2017', 'res')},
  {t:'The resident, in one place', min:1, dolor:'Yahaya: a central place for every customer interaction.', show:['Resident: contact, preferred channel and consent.', 'Log a call, an email or a note; the history stays on the property.', 'Calls and customer messages connect later.'], say:'Whoever picks up the phone knows the story.', go:TF('dir', 'prp', 'PR-2002', 'rsd')},
  {t:'Sharing a property', min:.5, dolor:'Access is decided by the administrator, per person or per team.', show:['Shared with: who sees this property and why.', 'Share with a person or a whole team in one click.'], say:'Open the door only to who needs it.', go:TF('dir', 'prp', 'PR-2002', 'res', () => A.shrOpen({dataset:{v:'PR-2002'}}))},
  {t:'The meetings register', min:1, dolor:'Monday and Thursday for everyone; Tuesday for the directors, with the money.', show:['Meetings sit in Overview, in the left menu.', 'Each meeting with its summary, decisions and action points.', 'Every action opens the task it created.'], say:'Every task traces back to its meeting.', go:() => { S.f.mtt = 'past'; S.f.mtd = 'MT-503'; T5('dir', 'ovw', 'dir:mtg')(); }},
  {t:'Retrofit: from the client list to a booked visit', min:1, dolor:'Section 5: book the assessment, then the visit, the review and the documents.', show:['Assessment bookings by status, or on each assessor’s calendar.', 'Import jobs from the client list: nobody types them one by one.'], say:'The job starts here.', go:T5('sad', 'ret', 'ret:bk')},
  {t:'Review, revisits and the survey pack', min:1, dolor:'A rejected assessment books a revisit and counts it.', show:['In assessment: each property in phase B with its evidence.', 'With the client: where each pack stands in Dynamics, Shareworks or PAS Hub.'], say:'Right first time, or back with a reason.', go:T5('aap', 'ret', 'ret:rq')},
  {t:'The assessor on site', min:.5, dolor:'Photos with location and time, from a phone.', show:['The assessor form: the visits of the day and the evidence RdSAP needs.'], say:'No account needed on site.', go:T5('ass', 'ret', 'ret:asf')},
  {t:'Delivery: Ready to install', min:1, dolor:'Section 6: a property is ready only when every phase D item is done.', show:['Each item with the date of its last change, and the timeline per property.', 'It sets itself to Ready and notifies the Install coordinator.'], say:'Nobody starts on site too early.', go:T5('inc', 'del', 'del:rdy')},
  {t:'Redbridge by group, with hold points', min:1, dolor:'Section 9: track Redbridge at group level; only the hold points block.', show:['Percentage per group and overall, by house type.', 'MDA and fixing tests hold the next group until passed.'], say:'The same view as your tracker, live.', go:T5('inc', 'del', 'del:hold')},
  {t:'Purchasing and suppliers', min:1, dolor:'Section 10: every cost tagged to a property and a measure.', show:['Orders by status, raised by hand or from a PDF.', 'Suppliers: spend, open orders and invoices to match.'], say:'Committed, then actual, never lost.', go:T5('inc', 'del', 'del:ord')},
  {t:'Commercial: is the work making money?', min:1, dolor:'Section 10: quote, budget and margin at every point of the job.', show:['Margins per scheme and property against each target.', 'Variations and additional costs with their reason and evidence.'], say:'See it before it hurts.', go:T5('com', 'com', 'com:mrg')},
  {t:'Accounts: from trigger to paid', min:1, dolor:'E.ON pays on Install complete, GLA on the final upload, Redbridge once Cotality registers.', show:['Payment triggers create the invoice as pending, to review and send.', 'Invoices due and overdue, supplier invoices to match.'], say:'Earned work is always invoiced.', go:T5('acc', 'acc', 'acc:trg')},
  {t:'Director: the business at a glance', min:1, dolor:'Section 16: meetings and decisions run from dashboards.', show:['Business overview, scheme performance, finance, operations, capacity and quality.', 'Every total opens the list behind it.'], say:'Zoom from the business to a cost line.', go:T5('dir', 'dir', 'dir:dbiz')},
  {t:'Settings: who sees what', min:1.5, dolor:'Roles are placeholders until the restructure; people, teams and access change without a rebuild.', show:['The gear at the top right opens Settings, only for the administrator.', 'Users and access: role, the properties each person sees, and money.', 'Teams: a leader and members; the leader gets the team report.', 'Roles and permissions: what each role can open.'], say:'One place to decide access.', go:T5('dir', 'adm', 'dir:usr')},
  {t:'Access requests', min:.5, dolor:'Someone who needs a property asks; the administrator decides.', show:['Akram asks for 61 Pier Road.', 'Give the property, the whole scheme, or reject.'], say:'Access with a record.', go:T5('dir', 'adm', 'dir:req')},
  {t:'Export any list', min:.5, dolor:'Dren: send filtered lists to clients.', show:['Every list has Export: a spreadsheet that opens in Excel, or a PDF, with the filters on screen.'], say:'Filter, export, send.', go:T5('dir', 'del', 'del:rdy', () => A.expOpen())},
);
TOUR_MAS.length = 0; TOUR_MAS.push('Retrofit: import jobs from a client list.', 'Commercial: scheme settings with their change log.', 'Director: new scheme from a template.', 'Delivery: site forms on a phone, with progress percentages.', 'Overview: My team, for a team leader such as Ramesh.');
if(/debug/.test(location.hash)) Object.assign(window.__X || (window.__X = {}), {SEC5, nav5, TOUR});


/* =================== Notifications: a side panel like monday, with mentions and what is assigned to me =================== */
/* Mentions are the posts on a property that name you; Assigned to me are your tasks and the approvals waiting on your role.
   Each notification opens what it is about. Read and unread are kept per person. */
[['PR-2017', 'dre', ['yah', 'tom'], 0, 'MDA confirmed corrosion on two stanchions. Can you approve VA-41 today so the scaffold stays up?'],
 ['PR-2019', 'tom', ['yah'], -1, 'Tomswood Hill is now over budget after the second fixing test. Worth a look before Tuesday.'],
 ['PR-2005', 'lan', ['yah'], -2, 'Medway Council is 10 days late on INV-3302. Shall I escalate to their finance lead?'],
 ['PR-2021', 'akr', ['yah', 'dre'], -6, 'Scaffold quote for the full rear elevation attached; two weeks of hire included.'],
 ['PR-2001', 'ram', ['afa', 'sar'], 0, 'Two evidence photos are missing at Canterbury Street: loft hatch and the rear wall. Can you go back this week?'],
 ['PR-2015', 'ram', ['sar'], -1, 'Revisit needed at Leytonstone Road. Please book it with the resident.'],
 ['PR-2019', 'akr', ['dre'], -1, 'EWI Pro retest booked for Thursday morning. I will send the result straight after.'],
 ['PR-2003', 'ram', ['dre'], -4, 'PIBI for Balmoral Road is booked; the design pack is approved.'],
 ['PR-2017', 'yah', ['tom', 'lan'], -1, 'Please review the Clayhall margin before the Tuesday meeting.'],
 ['PR-2005', 'yah', ['lan'], -9, 'Chase Medway Council for Saxton Street, it is our largest overdue invoice.'],
 ['PR-2019', 'dre', ['akr'], -2, 'What did the fixing test show on the rear elevation?'],
].forEach(([id, by, to, d, t], i) => { const p = DB.pr.find(x => x.id === id); if(!p || !PEO[by] || to.some(k => !PEO[k])) return; p.th = p.th || []; p.th.push({id:'UP-N' + i, by, on:addDays(TODAY, d), t, to, tk:null, from:null}); });
S.ntTab = 'all'; S.ntRd = 'all'; S.ntq = '';
export const ntRead = () => { DB.ntr = DB.ntr || {}; return DB.ntr[ME()] || (DB.ntr[ME()] = new Set()); };
export function ntItems(){ const me = ME(), all = window.__prAll || DB.pr, xs = [];
  all.forEach(p => (p.th || []).forEach(u => { if((u.to || []).includes(me) && u.by !== me) xs.push({id:'m' + u.id, kind:'men', by:u.by, on:u.on, verb:'Mentioned you', what:'in an update', body:u.t, ctx:`${p.ad}, ${scOf(p.sc).n}`, go:() => { S.sec5 = 'prp'; abrir(homeApp(), p.id, 'upd'); }}); }));
  DB.tk.filter(k => !k.done && (k.who ? k.who === me : k.r === S.role)).forEach(k => xs.push({id:'t' + k.id, kind:'asg', by:null, ic:'check', on:k.due < TODAY ? k.due : TODAY, verb:'Assigned you', what:'a task', body:k.t, ctx:`${dDiff(k.due) < 0 ? 'Overdue, was due' : 'Due'} ${fmtDy(k.due)}${k.src ? ', from ' + k.src : ''}`, go:() => { nav5('ovw', homeApp() + ':tasks'); if(A.tkView) setTimeout(() => A.tkView({dataset:{v:k.id}}), 30); }}));
  approvals().filter(a => a.role === S.role).forEach(a => xs.push({id:'a' + a.id, kind:'asg', by:null, ic:'stamp', on:TODAY, verb:'Waiting for your approval', what:'', body:`${a.k}: ${a.t}`, ctx:a.d || '', go:() => nav5('ovw', (WAIT4[S.role] || 'dir') + ':wait')}));
  pend(homeApp()).forEach(a => xs.push({id:'l' + a.id, kind:'sys', by:null, ic:'alert', on:TODAY, verb:a.k, what:'', body:a.t, ctx:a.d || '', go:() => nav5('ovw', S.role === 'dir' ? 'dir:dec' : homeApp() + ':atn')}));
  return xs.sort((a, b) => a.on < b.on ? 1 : a.on > b.on ? -1 : 0); }
export const ntUnread = () => { const r = ntRead(); return ntItems().filter(x => !r.has(x.id)).length; };
export const ntAgo = on => { const d = -dDiff(on); return d <= 0 ? 'Today' : d === 1 ? '1 day' : d + ' days'; };
export const ntGroup = on => { const d = -dDiff(on); return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d <= 7 ? 'Last 7 days' : 'Older'; };
export function ntList(){ const r = ntRead(), q = norm(S.ntq || ''), xs = ntItems().filter(x => (S.ntTab === 'all' || x.kind === S.ntTab) && (S.ntRd === 'all' || (S.ntRd === 'unread') === !r.has(x.id)) && (!q || norm([x.body, x.ctx, x.verb, x.by ? PEO[x.by].n : ''].join(' ')).includes(q)));
  if(!xs.length) return `<div class="v5-nte">${ico(S.ntTab === 'men' ? 'msg' : 'check', 28, 1.6)}<b>${q ? 'Nothing matches the search' : S.ntRd === 'unread' ? 'You are all caught up' : 'Nothing here yet'}</b><small>${S.ntTab === 'men' ? 'When someone names you in an update on a property, it shows here.' : S.ntTab === 'asg' ? 'Tasks and approvals that are yours show here.' : 'New activity will show here.'}</small></div>`;
  let g0 = '', h = ''; xs.forEach(x => { const g = ntGroup(x.on), un = !r.has(x.id); if(g !== g0){ h += `<div class="v5-ntg">${g}</div>`; g0 = g; }
    h += `<div class="v5-ntc${un ? ' un' : ''}" data-act="ntGo" data-v="${x.id}" role="button" tabindex="0">${x.by ? av(x.by, 34) : `<span class="v5-nta">${ico(x.ic, 17)}</span>`}<div class="v5-ntm"><div class="v5-ntl1">${x.by ? `<b>${esc(PEO[x.by].n)}</b> ` : ''}<span class="v5-ntv k-${x.kind}">${x.kind === 'men' ? '@ ' : ''}${esc(x.verb)}</span>${x.what ? ` ${x.what}` : ''}</div><p>${esc(x.body)}</p>${x.ctx ? `<small>${esc(x.ctx)}</small>` : ''}</div><div class="v5-ntr"><span>${ntAgo(x.on)}</span><button class="v5-ntd" data-act="ntTog" data-v="${x.id}" title="${un ? 'Mark as read' : 'Mark as unread'}" aria-label="${un ? 'Mark as read' : 'Mark as unread'}"><i></i></button></div></div>`; });
  return h; }
A.popNt = () => { S.pop = S.pop === 'nt5' ? null : 'nt5'; drawPop(); };
{ wrapDrawPop(dp8 => () => { dp8(); const el = document.getElementById('rfpop'); if(!el || S.pop !== 'nt5') return; const hb = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom, its = ntItems(), r = ntRead(), cnt = k => its.filter(x => (k === 'all' || x.kind === k) && !r.has(x.id)).length;
    const h = `<div class="rf-pop v5-ntp" role="dialog" aria-label="Notifications" style="top:${hb + 8}px"><div class="v5-nth"><h2>Notifications</h2><button class="v5-ntx" data-act="ntAll" title="Mark all as read">${ico('check', 15)}<span>Mark all as read</span></button><button class="v5-ntx sq" data-act="popNt" aria-label="Close">${ico('x', 16)}</button></div>`
      + `<div class="v5-ntt" role="tablist">${[['all', 'All'], ['men', 'Mentioned'], ['asg', 'Assigned to me']].map(([k, n]) => `<button role="tab" data-act="ntTab" data-v="${k}" aria-selected="${S.ntTab === k}">${n}${cnt(k) ? `<em>${cnt(k)}</em>` : ''}</button>`).join('')}</div>`
      + `<div class="v5-ntf"><label class="v5-ntq">${ico('search', 15)}<input data-in="ntq" value="${esc(S.ntq || '')}" placeholder="Search by person, property or text" autocomplete="off"></label><div class="seg2 um-seg">${[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([k, n]) => `<button data-act="ntRd" data-v="${k}" aria-pressed="${S.ntRd === k}">${n}</button>`).join('')}</div></div>`
      + `<div class="v5-ntlist">${ntList()}</div></div>`;
    const ex = el.querySelector('.v5-ntp'); if(!ex){ el.innerHTML = h; return; }
    const ol = ex.querySelector('.v5-ntlist'), y = ol ? ol.scrollTop : 0, fq = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.in === 'ntq', t = document.createElement('div'); t.innerHTML = h;
    ex.innerHTML = t.firstElementChild.innerHTML; ex.style.top = t.firstElementChild.style.top;
    const nl = ex.querySelector('.v5-ntlist'); if(nl) nl.scrollTop = y; if(fq){ const q = ex.querySelector('[data-in="ntq"]'); if(q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } } }); }
IN.ntq = t => { S.ntq = t.value; const l = document.querySelector('.v5-ntlist'); if(l) l.innerHTML = ntList(); };
A.ntTab = el => { S.ntTab = el.dataset.v; setTimeout(drawPop, 0); };
A.ntRd = el => { S.ntRd = el.dataset.v; setTimeout(drawPop, 0); };
A.ntAll = () => { const r = ntRead(); ntItems().forEach(x => r.add(x.id)); setTimeout(() => { render(); drawPop(); }, 0); toast('All notifications marked as read.'); };
A.ntTog = el => { const r = ntRead(), id = el.dataset.v; r.has(id) ? r.delete(id) : r.add(id); setTimeout(() => { render(); drawPop(); }, 0); };
A.ntGo = el => { const x = ntItems().find(n => n.id === el.dataset.v); if(!x) return; ntRead().add(x.id); S.pop = null; drawPop(); x.go(); };
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.pop === 'nt5'){ S.pop = null; drawPop(); } if(e.key === 'Enter' && e.target.closest && e.target.closest('.v5-ntc') && !e.target.closest('button')) A.ntGo(e.target.closest('.v5-ntc')); });
{ wrapRender(r6 => (...x) => { r6(...x); const b = document.querySelector('#tools [data-act="popNt"]'); if(!b) return; const n = ntUnread(); let d = b.querySelector('.rf-dot'); if(!n){ if(d) d.remove(); } else { if(!d){ b.insertAdjacentHTML('beforeend', '<em class="rf-dot"></em>'); d = b.querySelector('.rf-dot'); } d.textContent = n > 9 ? '9+' : n; } b.classList.toggle('on', S.pop === 'nt5'); b.setAttribute('aria-expanded', S.pop === 'nt5'); }); }
{ wrapDrawPop(dp9 => () => { dp9(); const b = document.querySelector('#tools [data-act="popNt"]'); if(b) b.classList.toggle('on', S.pop === 'nt5'); }); }
/* Estilos wt-v6: en web/src/refyt/styles (capa refyt), no se inyectan desde aquí. */
{ const t = TOUR.find(x => x.t === 'My tasks and what needs attention'); if(t) TOUR.splice(TOUR.indexOf(t) + 1, 0, {t:'Notifications: mentions and what is assigned to you', min:1, dolor:'Like monday: see who named you and what is waiting on you, without hunting for it.', show:['The bell opens the panel from the right: All, Mentioned and Assigned to me.', 'Filter by unread or read, or search by person, property or text.', 'Click one to open the property update, the task or the approval it is about.'], say:'Nothing that needs you is missed.', go:() => { S.role = 'dir'; nav5('ovw', 'dir:ovw'); setTimeout(() => { S.pop = 'nt5'; S.ntTab = 'men'; drawPop(); }, 60); }}); }


/* =================== Property lists: filters live inside the search bar, like monday =================== */
IC.filter = '<path d="M3.5 5h17l-6.5 7.6V19l-4 1.8v-8.2z"/>';
export const PRF_ST = [['open', 'Open'], ['closed', 'Paid and cancelled'], ['all', 'All']];
export const prMatch = (p, o) => (!o.sf || p.sc === o.sf) && (o.v === 'all' || (o.v === 'open' ? OPENP.includes(p.ph) : !OPENP.includes(p.ph))) && (!o.phs.length || o.phs.includes(p.ph)) && (!o.ms.length || p.ms.some(x => o.ms.includes(x.m))) && (!o.q || norm(p.ad + p.id + p.res + p.pc + p.ref).includes(o.q));
setPrList((xs, key) => { const app = S.view, o = {sf:key === 'all' ? '' : S.f.sc || '', q:norm(S.f.prq), v:(S.f.prph || []).length ? 'all' : 'open', phs:S.f.prph || [], ms:[]}, ys = xs.filter(p => prMatch(p, o));
  const cnt = patch => xs.filter(p => prMatch(p, {...o, v:'all', ...patch})).length, nf = (o.sf ? 1 : 0) + o.phs.length, anim = S.f.prKeep ? ' v5-noanim' : '';
  const opt = (act, k, n, on, c) => `<button class="v5-fo${on ? ' on' : ''}" data-act="${act}" data-v="${esc(k)}" aria-pressed="${on}"><span>${esc(n)}</span><small>${c}</small></button>`;
  const col = (t, body) => `<div class="v5-fc"><small>${t}</small>${body}</div>`, mk = [...new Set(xs.flatMap(p => p.ms.map(x => x.m)))].filter(m => MEAS[m]);
  const panel = `<div class="v5-fp${anim}" role="dialog" aria-label="Filters"><div class="v5-fph"><b>Filter by</b><button class="v5-fclr" data-act="prClr" ${nf ? '' : 'disabled'}>Clear all</button></div><div class="v5-fcols">`
    + (key === 'all' ? '' : col('Scheme', [['', 'All schemes'], ...DB.sc.map(s => [s.id, s.n])].map(([k, n]) => opt('scf', k, n, o.sf === k, xs.filter(p => prMatch(p, {...o, sf:k})).length)).join('')))
    + col('Phase', PH.map(ph => opt('prPh', ph, ph, o.phs.includes(ph), cnt({phs:[ph]}))).join(''))
    + `</div></div>`;
  const chips = [...(o.sf ? [['scf', '', scOf(o.sf).n]] : []), ...o.phs.map(ph => ['prPh', ph, ph])];
  return `<div class="v5-fs"><div class="v5-fsb${S.f.prFo ? ' open' : ''}">${ico('search', 18)}<input type="search" data-in="f" data-k="prq" placeholder="Search an address, postcode, customer or client reference" value="${esc(S.f.prq || '')}" aria-label="Search properties"><button class="v5-fbtn${nf ? ' on' : ''}" data-act="prFo" title="Filters" aria-label="Filters" aria-expanded="${!!S.f.prFo}">${ico('filter', 17)}${nf ? `<em>${nf}</em>` : ''}</button></div>${S.f.prFo ? panel : ''}</div>`
    + `<div class="v5-fchips">${chips.length ? chips.map(([a, v, l]) => `<button class="v5-fchip" data-act="${a}" data-v="${esc(v)}" title="Remove this filter">${esc(l)}${ico('x', 12)}</button>`).join('') + `<button class="v5-fclr" data-act="prClr">Clear all</button>` : ''}<span class="v5-fn">${ys.length} ${ys.length === 1 ? 'property' : 'properties'}</span></div>`
    + prHead(canMoney(app)) + (PH.map(ph => { const zs = ys.filter(p => p.ph === ph); return zs.length ? grpH(ph, zs.length) + zs.map(p => prRow(p, canMoney(app))).join('') : ''; }).join('') || empty('No properties match these filters.')); });
A.prFo = () => { S.f.prFo = !S.f.prFo; render(); };
export const prRe = () => { const m = $('#main'), y = m ? m.scrollTop : 0; S.f.prKeep = true; render(); if(m) m.scrollTop = y; S.f.prKeep = false; };
A.prPh = el => { const a = S.f.prph || [], v = el.dataset.v; S.f.prph = a.includes(v) ? a.filter(x => x !== v) : [...a, v]; prRe(); };
A.prMs = el => { const a = S.f.prm || [], v = el.dataset.v; S.f.prm = a.includes(v) ? a.filter(x => x !== v) : [...a, v]; render(); };
A.prClr = () => { S.f.prf = 'open'; S.f.sc = ''; S.f.prph = []; S.f.prm = []; prRe(); };
{ const os = A.scf; A.scf = el => { if(document.querySelector('.v5-fs')){ S.f.sc = el.dataset.v; prRe(); } else os(el); }; }
document.addEventListener('click', e => { if(S.f.prFo && e.target.closest && !e.target.closest('.v5-fs')){ S.f.prFo = false; render(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.prFo){ S.f.prFo = false; render(); } });
/* Estilos wt-v7: en web/src/refyt/styles (capa refyt), no se inyectan desde aquí. */
