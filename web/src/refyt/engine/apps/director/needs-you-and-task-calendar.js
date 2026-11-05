// Refyt · v3.26: Necesita tu atención por tipo, y tareas con tres filtros y calendario.
// Copia del original ("Refyt, demo v3.27.html"), con el mismo código.
import {
  $, A, DB, DSH, ME, MODALS, MON, RN, S, TODAY, VERSIONS, VIEWS, addDays, alerts, apKey, approvals,
  dDiff, esc, fm, fmtDy, fromIso, go, ico, ini, iso, modal, mtOf, nx, ovCard, ovEmpty, ovLink,
  ovWaitRoles, pName, pend, plural, prOf, render, renderLayer, scOf, seg, sum, tkArch, tkOver,
  wrapOvNow
} from "../../index.js";
/* =================== v3.26: Needs you now by kind, and tasks with three filters and a calendar =================== */
/* Director app. Approvals in green from the palette, alerts in red, each row: kind, what, the actions, and the eye at the end.
   My tasks: only My tasks, All team tasks and Meeting action points; a list, a week or a month. */

/* ---------- 1. Needs you now ---------- */
export const nyRow = (tag, main, sub, acts, eye) => `<div class="ny-r ny-${tag === 'Approval' ? 'ap' : 'al'}"><span class="ny-t">${tag}</span><div class="ny-m"><b>${main}</b>${sub ? `<small>${sub}</small>` : ''}</div><div class="ny-a">${acts}</div>${eye}</div>`;
export const nyEye = (act, v, what) => `<button class="ny-eye" data-act="${act}" data-v="${esc(v)}" title="See the detail of this ${what}" aria-label="See the detail of this ${what}">${ico('eye', 16)}</button>`;
wrapOvNow(o => app => { if(app !== 'dir') return o(app);
    const ap = approvals().filter(a => ovWaitRoles(app).includes(a.role)), al = typeof pend === 'function' ? pend(app) : [];
    const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}, als = al.slice().sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
    const rows = ap.slice(0, 3).map(a => nyRow('Approval', esc(a.t), `${a.k}${a.amt ? ', ' + fm(a.amt) : ''}`, `<button class="btn pri sm ny-ok" data-act="${a.ok}" data-v="${esc(apKey(a))}">Approve</button><button class="btn sec sm" data-act="apNo" data-v="${esc(a.no + '|' + apKey(a))}">Reject</button>`, nyEye('apView', a.id, 'approval')))
      .concat(als.slice(0, Math.max(0, 5 - Math.min(ap.length, 3))).map(a => nyRow('Alert', esc(a.t), `${esc(a.k)}. ${esc(a.d.length > 80 ? a.d.slice(0, 78) + '...' : a.d)}`, `<button class="btn sec sm ny-fix" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button><button class="btn sec sm" data-act="alseen" data-v="${a.id}">Seen</button>`, nyEye('alView', a.id, 'alert'))));
    const n = ap.length + al.length, foot = [ap.length ? ovLink('dir:wait', `All approvals (${ap.length})`) : '', al.length ? ovLink('dir:dec', `Alerts (${al.length})`) : ''].filter(Boolean).join('');
    const sub = n ? `<span class="ny-k ny-ap">${plural(ap.length, 'approval', 'approvals')}</span> <span class="ny-k ny-al">${plural(al.length, 'alert', 'alerts')}</span> waiting, the most urgent first.` : 'Nothing waiting on you.';
    return ovCard('Needs you now', sub, rows.length ? rows.join('') : ovEmpty('All clear. Approvals and alerts for you will show up here.'), foot); });
{ const f = VIEWS.dir.pages.ovw; VIEWS.dir.pages.ovw = (...x) => f(...x).replace('<div class="ov-g">', '<div class="ov-g ov-dir">'); }
/* The eye on an alert: what it is about and what to do */
A.alView = el => { S.modal = {k:'alv', id:el.dataset.v}; renderLayer(); };
MODALS.alv = m => { const a = (typeof pend === 'function' ? pend('dir') : []).find(x => x.id === m.id) || alerts().find(x => x.id === m.id);
  if(!a) return modal('Alert', 'This alert has been dealt with.', '', `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 520);
  const pid = (a.fix[2] || '').split('|')[0], p = /^PR-/.test(pid) ? prOf(pid) : null, k = a.fix[1] === 'tkNudge' ? DB.tk.find(x => x.id === a.fix[2]) : null;
  const rows = [['Kind', a.k], ['Property', p ? `<button class="lnk4" data-act="prOpen" data-v="${p.id}|upd">${esc(p.ad)}</button>` : ''], ['Scheme and client', p ? `${esc(scOf(p.sc).n)}, ${esc(scOf(p.sc).cl)}` : ''], ['Owner', k ? `${pName(k.who)}<small>${RN(k.r)}</small>` : ''], ['Due', k ? `${fmtDy(k.due)}<small>${dDiff(k.due) < 0 ? plural(-dDiff(k.due), 'day', 'days') + ' overdue' : 'today'}</small>` : '']].filter(x => x[1]);
  return modal(a.t, `${a.k}. Alerts come from the work itself; deal with it or mark it as seen.`, `<div class="apv-g al-g">${rows.map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div><p class="apv-d">${esc(a.d)}</p>${k && k.desc ? `<p class="hint">${esc(k.desc)}</p>` : ''}`,
    `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="alseen" data-v="${a.id}">Seen</button><button class="btn pri lg" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button></div>`, 620); };
{ const fx = new Set(); const wrapClose = n => { if(fx.has(n) || !A[n]) return; fx.add(n); const o = A[n]; A[n] = (el, ...r) => { if(S.modal && S.modal.k === 'alv') S.modal = null; return o(el, ...r); }; };
  ['alseen', 'tkNudge', 'prOpen', 'gogo'].forEach(wrapClose); const oa = A.alView; A.alView = el => { const a = (pend('dir') || []).find(x => x.id === el.dataset.v); if(a) wrapClose(a.fix[1]); oa(el); }; }

/* ---------- 2. My tasks: three filters, and a calendar ---------- */
export const TKV = [['mine', 'My tasks'], ['all', 'All team tasks'], ['mt', 'Meeting action points']];
export const tkIsMt = k => !!(k.src && mtOf(k.src));
export const tkList = () => { const v = S.f.tkv3 || 'mine'; return DB.tk.filter(k => !tkArch(k) && (v === 'mine' ? k.who === ME() : v === 'mt' ? tkIsMt(k) : true)); };
A.tkv3 = el => { S.f.tkv3 = el.dataset.v; render(); };
A.tkvw = el => { S.f.tkvw = el.dataset.v; render(); };
A.tkcn = el => { const d = +el.dataset.v, w = S.f.tkvw === 'week'; S.f.tkc = d === 0 ? null : addDays(S.f.tkc || TODAY, w ? d * 7 : 0); if(!w && d){ const x = fromIso(S.f.tkc || TODAY); x.setDate(1); x.setMonth(x.getMonth() + d); S.f.tkc = iso(x); } render(); };
export const tkTone = k => 'x' + (k.done ? 'dn' : tkOver(k) ? 'od' : dDiff(k.due) === 0 ? 'td' : tkIsMt(k) ? 'mt' : 'op');
export const tkChip = k => `<button class="tkc ${tkTone(k)}" data-act="tkView" data-v="${k.id}" title="${esc(k.t)}, ${esc(pName(k.who) || RN(k.r))}"><span>${esc(k.t)}</span><i>${ini(pName(k.who) || RN(k.r))}</i></button>`;
export const monday = s => { const d = fromIso(s), w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return iso(d); };
export function tkCal0(xs){ const wk = S.f.tkvw === 'week', base = S.f.tkc || TODAY, by = {}; xs.forEach(k => { (by[k.due] = by[k.due] || []).push(k); });
  const legend = `<div class="tk-lg"><span><i class="xod"></i>Overdue</span><span><i class="xtd"></i>Due today</span><span><i class="xop"></i>Open</span><span><i class="xmt"></i>Meeting action point</span><span><i class="xdn"></i>Done</span></div>`;
  if(wk){ const m0 = monday(base), days = Array.from({length:7}, (_, i) => addDays(m0, i)), lbl = `${fmtDy(days[0]).replace(/, \d{4}$/, '')} to ${fmtDy(days[6])}`;
    return `<div class="tk-cb"><div class="tk-nav"><b>${lbl}</b>${nx('tkcn', '-1', 'Previous week', 'sec')}${nx('tkcn', '0', 'Today', 'sec')}${nx('tkcn', '1', 'Next week', 'sec')}</div>${legend}</div><div class="tk-wk">${days.map(d => { const ks = (by[d] || []).sort((a, b) => a.done - b.done), dd = fromIso(d);
      return `<div class="tk-wd${d === TODAY ? ' now' : ''}"><div class="tk-wh"><small>${DSH[dd.getDay()]}</small><b>${dd.getDate()}</b></div><div class="tk-wl">${ks.map(k => `<button class="tkw ${tkTone(k)}" data-act="tkView" data-v="${k.id}"><b>${esc(k.t)}</b><small>${esc(pName(k.who) || RN(k.r))}${k.pr ? ', ' + esc(prOf(k.pr).ad) : ''}</small></button>`).join('') || '<span class="tk-e">No tasks</span>'}</div></div>`; }).join('')}</div>`; }
  const f = fromIso(base); f.setDate(1); const first = monday(iso(f)), mo = f.getMonth(), cells = Array.from({length:42}, (_, i) => addDays(first, i)), rows = cells.slice(35).some(d => fromIso(d).getMonth() === mo) ? 6 : 5;
  return `<div class="tk-cb"><div class="tk-nav"><b>${MON[mo]} ${f.getFullYear()}</b>${nx('tkcn', '-1', 'Previous month', 'sec')}${nx('tkcn', '0', 'Today', 'sec')}${nx('tkcn', '1', 'Next month', 'sec')}</div>${legend}</div><div class="tk-mo"><div class="tk-mh">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => `<span>${x}</span>`).join('')}</div><div class="tk-mg">${cells.slice(0, rows * 7).map(d => { const ks = (by[d] || []).sort((a, b) => a.done - b.done), dd = fromIso(d);
    return `<div class="tk-md${dd.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' now' : ''}"><b>${dd.getDate()}</b>${ks.slice(0, 3).map(tkChip).join('')}${ks.length > 3 ? `<button class="tk-more" data-act="tkDay" data-v="${d}">+${ks.length - 3} more</button>` : ''}</div>`; }).join('')}</div></div>`; }
A.tkDay = el => { S.f.tkvw = 'week'; S.f.tkc = el.dataset.v; render(); };
{ const f = VIEWS.dir.pages.tasks; VIEWS.dir.pages.tasks = (...x) => { const v = S.f.tkv3 || 'mine', vw = S.f.tkvw || 'list';
    S.f.tkm = v === 'mine' ? 'mine' : 'all'; S.f.ttm = ''; S.f.tsrc = v === 'mt' ? 'mt' : ''; S.f.tkf = 'open';
    let h = f(...x).replace(/Every team’s tasks, from meetings and from jobs\. Filter by team\./, 'Your tasks, the whole team’s and the meeting action points, as a list or on a calendar.');
    h = h.replace(/<div class="rf-bar">[\s\S]*?<\/div>(?=<div class="rf-tw">)/, `<div class="rf-bar tk-bar">${seg('tkv3', v, TKV.map(([k, n]) => [k, n, (TKALL || DB.tk).filter(t => !t.done && !tkArch(t) && (k === 'mine' ? t.who === ME() : k === 'mt' ? tkIsMt(t) : true)).length]))}${seg('tkvw', vw, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}</div>`);
    h = h.replace(/<button class="stat sbtn ([^"]*)" aria-pressed="[^"]*" data-act="tkf" data-v="[^"]*">([\s\S]*?)<\/button>/g, '<div class="stat $1">$2</div>').replace(/<span class="ss">filtering the list<\/span>/g, '');
    if(vw === 'list') return h;
    const i = h.indexOf('<div class="rf-tw">'); return i > 0 ? h.slice(0, i) + tkCal(tkList()) : h; }; }
/* the v3.25 source filter is replaced by these three, so tkList decides what the page shows */
export let TKALL = null;
{ const f = VIEWS.dir.pages.tasks; VIEWS.dir.pages.tasks = (...x) => { const all = DB.tk; TKALL = all; if((S.f.tkv3 || 'mine') === 'mt'){ DB.tk = all.filter(tkIsMt); } try { return f(...x); } finally { DB.tk = all; TKALL = null; } }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/VMgTXjcJJzbaGF36XbYtUi'; } });
VERSIONS.push({v:'v3.26', date:TODAY, major:false, current:true, url:null, title:'Needs you now by kind, and tasks on a calendar', sum:'In Needs you now, approvals are green and alerts red, each with its actions and the eye at the end. My tasks has three filters, My tasks, All team tasks and Meeting action points, and a week and month calendar.', steps:[
  {t:'Approvals and alerts, told apart', min:.5, dolor:'Before, approvals and alerts looked alike in Needs you now.', show:['Approval in green, Alert in red, always at the start of the row.', 'The actions next to it, and the eye at the end opens the full detail.'], say:'You see at a glance what to approve and what to fix.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
  {t:'Three filters for tasks', min:.5, dolor:'Before, My tasks had team, source and status filters.', show:['My tasks, All team tasks and Meeting action points. Nothing else to set.'], say:'Simple to find what you need.', go:() => { S.role = 'dir'; S.trail = null; S.f.tkv3 = 'mt'; S.f.tkvw = 'list'; go('dir', 'tasks'); }},
  {t:'Tasks on a calendar', min:.5, dolor:'Before, tasks were only a list.', show:['Week or Month: each task on its due date, coloured by status.', 'Click a task to open it; +more opens that week.'], say:'See the load of the week before it arrives.', go:() => { S.role = 'dir'; S.trail = null; S.f.tkv3 = 'all'; S.f.tkvw = 'month'; go('dir', 'tasks'); }},
]});
/* v3.27 replaces the calendar; the original reassigns tkCal. */
var tkCalW = null;
export function tkCal(xs){ return (tkCalW || tkCal0)(xs); }
export const setTkCal = f => { tkCalW = f; };
