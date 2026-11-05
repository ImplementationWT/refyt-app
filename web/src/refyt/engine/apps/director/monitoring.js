// Refyt · v3.23: el Director supervisa las apps de los equipos en modo solo lectura.
// Copia del original ("Refyt, demo v3.27.html"), con el mismo código.
import {
  $, A, APPN, DB, PEO, RN, S, TODAY, VERSIONS, VIEWS, WAITR, approvals, dDiff, esc, fmtDy, go, ico,
  mtSees, nx, oph, ovCard, ovEmpty, ovKpis, ovLink, ovRow, ovWork, pend, pill, plural, prOf, sum,
  teamOf, tkOver, trBar
} from "../../index.js";
/* =================== v3.23: the Director monitors the teams =================== */
/* A Director who opens a team app sees it as the team sees it, to monitor: no personal tasks,
   no approvals that belong to the team, no action buttons on the Overview. */
export const MONI = app => S.role === 'dir' && app !== 'dir' && ['com', 'acc', 'ret', 'del'].includes(app);
export const monBar = app => MONI(app) ? `<div class="mon-bar">${ico('eye', 15)}<span><b>Monitoring ${APPN[app]} as Director.</b> You see what the team sees; the actions are theirs. Your decisions are in the Director app.</span>${S.trail ? '' : nx('monBack', '', 'Back to Director', 'sec')}</div>` : '';
A.monBack = () => { S.trail = null; S.page.dir = 'ovw'; S.fi.dir = null; go('dir', 'ovw'); };
export const ovRO = h => h.replace(/<div class="ov-ra">[\s\S]*?<\/div>/g, '');

export function ovMonQueue(app){ const rs = WAITR[app] || [], ap = approvals().filter(a => rs.includes(a.role)), al = typeof pend === 'function' ? pend(app) : [];
  const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}, als = al.slice().sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
  const rows = ap.slice(0, 3).map(a => ovRow(a.p ? `<button class="ov-lk" data-act="prOpen" data-v="${a.p.id}">${esc(a.t)}</button>` : esc(a.t), `${a.k}, waiting for ${RN(a.role)}`, pill('tb', 'Approval')))
    .concat(als.slice(0, Math.max(0, 5 - Math.min(ap.length, 3))).map(a => ovRow(esc(a.t), esc(a.d.length > 90 ? a.d.slice(0, 88) + '...' : a.d), pill(a.tone, a.k))));
  return ovCard('The team’s queue', ap.length + al.length ? `${plural(ap.length, 'approval', 'approvals')} and ${plural(al.length, 'alert', 'alerts')} waiting on the team.` : 'Nothing waiting on the team.', rows.join('') || ovEmpty('All clear.'), [ap.length && VIEWS[app].pages.wait ? ovLink(`${app}:wait`, `Approvals (${ap.length})`) : '', al.length ? ovLink(`${app}:atn`, `Needs attention (${al.length})`) : ''].join('')); }

export function ovMonDay(app){ const tk = DB.tk.filter(k => !k.done && teamOf(k.r) === app), soon = tk.filter(k => dDiff(k.due) <= 2).sort((a, b) => (tkOver(b) - tkOver(a)) || (a.due < b.due ? -1 : 1)), od = tk.filter(tkOver);
  const rows = soon.slice(0, 4).map(k => ovRow(`<button class="ov-lk" data-act="tkView" data-v="${k.id}">${esc(k.t)}</button>`, `${PEO[k.who] ? PEO[k.who].n : RN(k.r)}${k.pr ? ', ' + esc(prOf(k.pr).ad) : ''}`, tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', fmtDy(k.due))));
  const ms = DB.mt.filter(m => mtSees(app, m) && m.d >= TODAY).sort((a, b) => a.d + a.h < b.d + b.h ? -1 : 1).slice(0, 2).map(m => ovRow(esc(m.ty), `${m.d === TODAY ? 'Today' : fmtDy(m.d)}, ${m.h}. ${plural(m.who.length, 'attendee', 'attendees')}`, m.d === TODAY ? pill('ta', 'Today') : pill('tk', 'Upcoming')));
  return ovCard('The team’s day', `${plural(tk.length, 'open task', 'open tasks')}${od.length ? `, ${od.length} overdue` : ''}, by owner.`, `<div class="ov-sub">Tasks due soon</div>${rows.join('') || ovEmpty('Nothing due in the next two days.')}<div class="ov-sub">Next meetings</div>${ms.join('') || ovEmpty('No meetings scheduled.')}`, ovLink(`${app}:tasks`, `Team tasks (${tk.length})`)); }

export function ovMon(app){ S.f.tkm = 'all';
  return oph(`${APPN[app]}, as the team sees it`, `Monitoring view for the Director. Every figure and row opens the list or record behind it.`)
    + `<div class="cstats ov-k">${ovKpis(app).join('')}</div>`
    + `<div class="ov-g">${ovMonQueue(app)}${ovMonDay(app)}${ovRO(ovWork(app))}</div>`; }

['com', 'acc', 'ret', 'del'].forEach(a => { Object.keys(VIEWS[a].pages).forEach(k => { const f = VIEWS[a].pages[k]; VIEWS[a].pages[k] = (...x) => { const h = f(...x); if(!MONI(a)) return h; const i = h.indexOf('<div class="tr-back">'); return i === 0 ? h.replace(/^(<div class="tr-back">[\s\S]*?<\/div>)/, '$1' + monBar(a)) : monBar(a) + h; }; });
  const ow = VIEWS[a].pages.ovw; VIEWS[a].pages.ovw = (...x) => MONI(a) ? trBar() + monBar(a) + ovMon(a) : ow(...x); });

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/8AoGHjhvNA1foMuLzS3fzp'; } });
VERSIONS.push({v:'v3.23', date:TODAY, major:false, current:true, url:null, title:'The Director monitors the teams', sum:'Team progress is read inside the Director app: filter by programme and scheme, open the list behind each figure and the record in the panel. When the Director opens a team app, it is a read only monitoring view.', steps:[
  {t:'Filter by programme and scheme', min:.5, dolor:'Before, team progress always showed every scheme together.', show:['Programme and Scheme and client at the top of each team page.', 'Every figure, the chart, what is stuck and the plan follow the filter.'], say:'How is Delivery doing on Redbridge alone?', go:() => { S.role = 'dir'; S.trail = null; S.f.d.sc = 'SC-06'; S.f.pgk = null; go('dir', 'pdel'); }},
  {t:'The list behind each figure, here', min:.5, dolor:'Before, a figure took you to the team’s app.', show:['Click a figure: its list opens below, inside the Director app.', 'Each row opens the property in the panel; click the figure again to close.'], say:'Monitor without leaving your app.', go:() => { S.role = 'dir'; S.trail = null; S.f.d.sc = ''; S.f.pgk = 'ret:rft'; go('dir', 'pret'); }},
  {t:'Team apps in monitoring mode', min:.5, dolor:'Before, a Director in a team app saw his own tasks and the team’s approvals as if they were his.', show:['A bar says you are monitoring; the Overview shows the team’s queue and the team’s day.', 'No action buttons for the Director; Back to Director returns to your app.'], say:'You see what the team sees; the actions stay with the team.', go:() => { S.role = 'dir'; S.trail = null; go('ret', 'ovw'); }},
]});
