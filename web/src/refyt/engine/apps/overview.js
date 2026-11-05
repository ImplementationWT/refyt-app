// Refyt · v3.21: cada app abre en su Resumen (cifras, lo que me necesita, mi día y el trabajo de la app).
// Copia del original ("Refyt, demo v3.27.html"), con el mismo código.
import {
  $, A, APPN, DB, HOME, ME, OPENP, PEO, RN, S, TODAY, VERSIONS, VIEWS, WAITR, approvals, canMoney,
  dDiff, esc, fk, fm, fmtDy, go, grpPct, holdOpen, ico, isBlocked, late, mgTag, mtOf, mtSees, nx,
  oph, pIdx, pMoney, pageAct, pc, pct, pend, pill, plural, prOf, prsOf, rating, ready, sbItem,
  scMoney, scOf, stat, sum, tkOver, tyOf
} from "../index.js";
/* =================== v3.21: every app opens on its Overview =================== */
/* Three or four modules per app, chosen for the start of the day: key figures, what needs me now,
   my day (tasks and meetings) and one module of the app's own work. Everything acts in place or
   opens the list behind it, already filtered. Changes with Viewing as. */
export const OV_ATN = {dir:'dec', com:'atn', acc:'atn', ret:'atn', del:'atn'};
export const OV_ALL = {dir:'Alerts', com:'Needs attention', acc:'Needs attention', ret:'Needs attention', del:'Needs attention'};
export const ovLink = (to, t) => `<button class="ov-more" data-act="gogo" data-v="${to}">${t}${ico('chev', 13)}</button>`;
export const ovCard = (t, sub, body, foot = '', cls = '') => `<section class="ov-card${cls ? ' ' + cls : ''}"><div class="ov-h"><div><h3>${t}</h3>${sub ? `<p>${sub}</p>` : ''}</div></div><div class="ov-b">${body}</div>${foot ? `<div class="ov-f">${foot}</div>` : ''}</section>`;
export const ovRow = (main, sub, side = '', acts = '', attrs = '') => `<div class="ov-r"${attrs}><div class="ov-rm"><b>${main}</b>${sub ? `<small>${sub}</small>` : ''}</div>${side ? `<div class="ov-rs">${side}</div>` : ''}${acts ? `<div class="ov-ra">${acts}</div>` : ''}</div>`;
export const ovEmpty = t => `<div class="ov-e">${ico('check', 15)}<span>${t}</span></div>`;
export const ovHello = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

/* Who is looking: their approvals, inside this app */
export const ovWaitRoles = app => { const rs = WAITR[app] || []; return S.role === 'dir' ? rs : rs.filter(r => r === S.role); };

/* Module 2: what needs me now. Approvals first, then the most urgent alerts. Five at most. */
export function ovNow0(app){
  const ap = approvals().filter(a => ovWaitRoles(app).includes(a.role)), al = (typeof pend === 'function' ? pend(app) : []);
  const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}; const als = al.slice().sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
  const rows = ap.slice(0, 3).map(a => ovRow(esc(a.t), `Approval: ${a.k.toLowerCase()}${a.amt && canMoney(app) ? ', ' + fm(a.amt) : ''}`, '',
      `<button class="btn pri sm" data-act="${a.ok}" data-v="${esc(a.ref || (a.o ? a.o.id : a.p.id))}">Approve</button><button class="btn sec sm" data-act="apNo" data-v="${esc(a.no + '|' + (a.ref || (a.o ? a.o.id : a.p.id)))}">Reject</button>`))
    .concat(als.slice(0, Math.max(0, 5 - Math.min(ap.length, 3))).map(a => ovRow(esc(a.t), esc(a.d.length > 90 ? a.d.slice(0, 88) + '...' : a.d), pill(a.tone, a.k),
      `<button class="btn pri sm" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button><button class="btn sec sm" data-act="alseen" data-v="${a.id}">Seen</button>`)));
  const n = ap.length + al.length, foot = [ap.length && VIEWS[app].pages.wait ? ovLink(`${app}:wait`, `All approvals (${ap.length})`) : '', al.length ? ovLink(`${app}:${OV_ATN[app]}`, `${OV_ALL[app]} (${al.length})`) : ''].filter(Boolean).join('');
  return ovCard('Needs you now', n ? `${plural(n, 'item', 'items')} waiting, most urgent first.` : 'Nothing waiting on you.', rows.length ? rows.join('') : ovEmpty('All clear. Approvals and alerts for you will show up here.'), foot);
}

/* Module 3: my day. My tasks overdue, due today or in the next two days, and my next meetings. */
export function ovDay(app){
  const me = ME(), mine = DB.tk.filter(k => !k.done && k.who === me), soon = mine.filter(k => dDiff(k.due) <= 2).sort((a, b) => (tkOver(b) - tkOver(a)) || (a.due < b.due ? -1 : 1));
  const tk = soon.slice(0, 4).map(k => ovRow(`<button class="ov-lk" data-act="tkView" data-v="${k.id}">${esc(k.t)}</button>`, k.pr ? esc(prOf(k.pr).ad) : (mtOf(k.src) ? `${mtOf(k.src).ty}, ${fmtDy(mtOf(k.src).d)}` : ''),
      tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', fmtDy(k.due)), nx('tkDone5', k.id, 'Mark done', 'sec')));
  const ms = DB.mt.filter(m => mtSees(app, m) && m.d >= TODAY && (m.who.includes(me) || S.role === 'dir')).sort((a, b) => a.d + a.h < b.d + b.h ? -1 : 1).slice(0, 2);
  const mt = ms.map(m => ovRow(esc(m.ty), `${m.d === TODAY ? 'Today' : fmtDy(m.d)}, ${m.h}. ${plural(m.who.length, 'attendee', 'attendees')}`, m.d === TODAY ? pill('ta', 'Today') : pill('tk', 'Upcoming'), nx('mtOpen', m.id, 'Open', 'sec')));
  const teamOver = app === 'dir' && S.role === 'dir' ? DB.tk.filter(tkOver).length : 0;
  const sub = `${plural(mine.length, 'open task', 'open tasks')} for ${PEO[me] ? PEO[me].n : RN(S.role)}${teamOver ? `; ${teamOver} overdue across the teams` : ''}.`;
  return ovCard('My day', sub,
    `<div class="ov-sub">Tasks</div>${tk.join('') || ovEmpty(mine.length ? 'Nothing due in the next two days.' : 'No open tasks.')}<div class="ov-sub">Next meetings</div>${mt.join('') || ovEmpty('No meetings scheduled.')}`,
    ovLink(`${app}:tasks`, `My tasks (${mine.length})`) + ovLink(`${app}:mtg`, 'Meetings'));
}

/* Module 1: key figures, four per app. Each one opens the list behind it. */
export function ovKpis(app){
  const open = DB.pr.filter(p => OPENP.includes(p.ph)), K = (tone, t, v, s, to) => stat(tone, t, v, s, 'gogo', to);
  if(app === 'dir'){ const ms = DB.sc.map(scMoney), won = sum(ms, x => x.won), fc = sum(ms, x => x.fc), owed = sum(ms, x => x.owed), od = DB.inv.filter(v => v.st !== 'Paid' && !v.paid && dDiff(v.due) < 0), lt = open.filter(p => late(p) === 'red');
    return [K('tk', 'Value won', fk(won), 'approved by clients', 'dir:dbiz'), K(won && (won - fc) / won * 100 < 22 ? 'ta' : 'tk', 'Forecast margin', pc(won ? (won - fc) / won * 100 : 0), 'across all schemes', 'dir:dfin'), K(od.length ? 'tred' : 'tk', 'Owed to us', fk(owed), od.length ? `${fk(sum(od, v => v.amt))} overdue` : 'nothing overdue', 'acc:inv'), K(lt.length ? 'tred' : 'tk', 'Jobs over time', lt.length, `of ${open.length} open properties`, 'dir:dops')]; }
  if(app === 'com'){ const ps = DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled'), m = ps.map(p => [p, pMoney(p)]), q = sum(m, x => x[1].q), fc = sum(m, x => x[1].fc), below = m.filter(([p, x]) => x.q && x.mgp < scOf(p.sc).set.mg).length, over = m.filter(x => x[1].over).length, va = DB.va.filter(v => !['Approved', 'Rejected'].includes(v.st));
    return [K('tk', 'Forecast margin', pc(q ? (q - fc) / q * 100 : 0), `on ${fk(q)} quoted`, 'com:mrg'), K(below ? 'tred' : 'tk', 'Below target', below, 'under the scheme target', 'com:atn'), K(over ? 'ta' : 'tk', 'Over budget', over, 'a measure over budget', 'com:atn'), K(va.length ? 'ta' : 'tk', 'Variations open', va.length, va.length ? fk(sum(va, v => v.amt)) + ' waiting' : 'nothing waiting', 'com:var')]; }
  if(app === 'acc'){ const un = DB.inv.filter(v => v.st !== 'Paid' && !v.paid), od = un.filter(v => dDiff(v.due) < 0), pe = DB.inv.filter(v => v.st === 'Pending'), mt = DB.or.filter(o => o.st === 'Delivered' && !o.inv);
    return [K('tk', 'Owed to us', fk(sum(un, v => v.amt)), plural(un.length, 'invoice', 'invoices') + ' open', 'acc:inv'), K(od.length ? 'tred' : 'tk', 'Overdue', fk(sum(od, v => v.amt)), plural(od.length, 'invoice', 'invoices'), 'acc:inv'), K(pe.length ? 'ta' : 'tk', 'To review and send', pe.length, 'created when the trigger was met', 'acc:trg'), K(mt.length ? 'ta' : 'tk', 'Supplier invoices to match', mt.length, 'delivered, not matched', 'acc:sup')]; }
  if(app === 'ret'){ const a = DB.pr.filter(p => p.ph === 'A. Job received'), tb = a.filter(p => !p.b.bk), wk = DB.pr.filter(p => p.b.on && dDiff(p.b.on) >= 0 && dDiff(p.b.on) <= 7), rv = approvals().filter(x => ['aap', 'dap'].includes(x.role)), lt = DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && late(p));
    return [K(tb.length ? 'ta' : 'tk', 'To book', tb.length, 'jobs received, no visit yet', 'ret:bk'), K('tk', 'Visits this week', wk.length, 'booked in the next 7 days', 'ret:bk'), K(rv.length ? 'ta' : 'tk', 'Waiting for review', rv.length, 'assessments and designs', 'ret:wait'), K(lt.length ? 'tred' : 'tk', 'Over time', lt.length, 'in phases A and B', 'ret:atn')]; }
  const rd = DB.pr.filter(p => p.ph === 'D. Prepare to install' && ready(p)), ho = DB.pr.filter(p => p.ph === 'E. Install' && holdOpen(p)), cs = DB.pr.filter(p => p.csTodo), oq = DB.or.filter(o => o.st === 'Requested');
  return [K(rd.length ? 'tg' : 'tk', 'Ready to install', rd.length, 'every phase D item done', 'del:rdy'), K(ho.length ? 'tred' : 'tk', 'Hold points open', ho.length, 'blocking the next group', 'del:hold'), K(cs.length ? 'ta' : 'tk', 'Client systems to update', cs.length, 'Dynamics, Shareworks, PAS Hub', 'del:cs'), K(oq.length ? 'ta' : 'tk', 'Orders requested', oq.length, 'waiting for approval', 'del:ord')];
}

/* Module 4: the app's own work, short */
export function ovWork(app){
  if(app === 'dir'){ const rows = DB.sc.map(s => { const m = scMoney(s), [rt, rl] = rating(s), ps = prsOf(s.id).filter(p => OPENP.includes(p.ph)), lt = ps.filter(p => late(p)).length;
      return ovRow(`<button class="ov-lk" data-act="ficha" data-v="${s.id}">${esc(s.n)}</button>`, `${plural(ps.length, 'open property', 'open properties')}${lt ? `, ${lt} over time` : ''}`, `${m.won ? `<span class="ov-num">${pc(m.mgp)}<small>target ${pc(s.set.mg)}</small></span>` : ''}${pill(rt, rl)}`); });
    return ovCard('Schemes at a glance', 'Rating, forecast margin against target and open work. Open a scheme to drill down.', rows.join(''), ovLink('dir:sch', 'All schemes') + ovLink('dir:dbiz', 'Business overview'), 'ov-wide'); }
  if(app === 'com'){ const rows = DB.sc.map(s => { const m = scMoney(s), bl = prsOf(s.id).filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled' && pMoney(p).q && pMoney(p).mgp < s.set.mg).length;
      return m.won ? ovRow(esc(s.n), `${fk(m.won)} quoted${bl ? `, ${plural(bl, 'property', 'properties')} below target` : ''}`, `<span class="ov-num">${mgTag(m.mgp, s.set.mg)}<small>target ${pc(s.set.mg)}</small></span>`, nx('gogo', 'com:mrg', 'Margins', 'sec')) : ''; }).filter(Boolean);
    return ovCard('Margin per scheme', 'Forecast margin against each scheme’s target.', rows.join('') || ovEmpty('No approved quotes yet.'), ovLink('com:mrg', 'Margins') + ovLink('com:quo', 'Quotes and budgets'), 'ov-wide'); }
  if(app === 'acc'){ const xs = DB.inv.filter(v => v.st !== 'Paid' && !v.paid).sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 5);
    const rows = xs.map(v => { const p = prOf(v.pr), od = dDiff(v.due) < 0; return ovRow(`${v.id}, ${esc(p.ad)}`, `${scOf(p.sc).n}, due ${fmtDy(v.due)}`, `<span class="ov-num">${fm(v.amt)}</span>${v.st === 'Pending' ? pill('ta', 'Pending') : od ? pill('tred', `${-dDiff(v.due)} days overdue`) : pill('tk', 'Sent')}`, v.st === 'Pending' ? nx('invSend', v.id, 'Review and send') : nx('invPaid', v.id, 'Mark paid', 'sec')); });
    return ovCard('Invoices to chase', 'Open invoices, the earliest due first.', rows.join('') || ovEmpty('Every invoice is paid.'), ovLink('acc:inv', 'Invoices') + ovLink('acc:trg', 'Payment triggers'), 'ov-wide'); }
  if(app === 'ret'){ const mine = S.role === 'ass' ? ME() : null, xs = DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && (!mine || p.b.who === mine)).filter(p => !p.b.bk || (p.b.on && dDiff(p.b.on) >= -1 && dDiff(p.b.on) <= 7)).sort((a, b) => (a.b.on || '0') < (b.b.on || '0') ? -1 : 1).slice(0, 6);
    const rows = xs.map(p => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${p.id}">${esc(p.ad)}</button>`, `${scOf(p.sc).n}, ${p.ref}`, p.b.bk ? `<span class="ov-num">${p.b.on === TODAY ? 'Today' : fmtDy(p.b.on)}<small>${p.b.h || ''}${p.b.who ? ', ' + PEO[p.b.who].n : ''}</small></span>${p.b.revisits ? pill('ta', 'Revisit') : pill('tb', 'Booked')}` : pill('ta', 'To book'), p.b.bk ? '' : nx('gogo', 'ret:bk', 'Book', 'sec')));
    return ovCard(mine ? 'My visits' : 'Assessments this week', mine ? 'Your booked visits and revisits for the next 7 days.' : 'Jobs to book and visits booked for the next 7 days.', rows.join('') || ovEmpty('No visits this week.'), ovLink('ret:bk', 'Bookings') + ovLink('ret:rq', 'Review queue'), 'ov-wide'); }
  const xs = DB.pr.filter(p => (p.ph === 'D. Prepare to install' && ready(p)) || p.ph === 'E. Install').sort((a, b) => (holdOpen(b) - holdOpen(a)) || (pIdx(a.ph) - pIdx(b.ph))).slice(0, 6);
  const rows = xs.map(p => { const rb = tyOf(p) === 'Redbridge', pct = rb ? grpPct(p) : Math.round(sum(p.ms, x => x.ip) / Math.max(1, p.ms.length));
    return ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${p.id}">${esc(p.ad)}</button>`, `${scOf(p.sc).n}${rb && p.ht ? ', ' + p.ht : ''}`, p.ph === 'D. Prepare to install' ? pill('tg', 'Ready to install') : `<span class="ov-num">${pct}%<small>installed</small></span>${holdOpen(p) ? pill('tred', 'Hold point') : isBlocked(p) ? pill('ta', 'Blocked') : pill('tb', 'On site')}`, p.ph === 'D. Prepare to install' ? nx('phNext', p.id, 'Start install') : ''); });
  return ovCard('On site this week', 'Properties installing now and those ready to start.', rows.join('') || ovEmpty('Nothing on site.'), ovLink('del:pro', 'Properties') + ovLink('del:hold', 'Redbridge tracker'), 'ov-wide');
}

export function ovPage(app){
  const nm = PEO[ME()] ? PEO[ME()].n.split(' ')[0] : RN(S.role);
  return oph(`${ovHello()}, ${nm}`, `${APPN[app]}: what needs you today. Every figure and row opens the list behind it.`)
    + `<div class="cstats ov-k">${ovKpis(app).join('')}</div>`
    + `<div class="ov-g">${ovNow(app)}${ovDay(app)}${ovWork(app)}</div>`;
}

/* Menu: Overview first, then My tasks and Meetings. The old Delivery overview becomes part of the new one. */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side, act = pageAct(a);
  VIEWS[a].side = () => { let h = o().replace(new RegExp(`<button class="nav" data-act="${act}" data-v="(ovw|hom)"[\\s\\S]*?</button>`, 'g'), '');
    return h.replace('<aside class="sb">', '<aside class="sb">' + sbItem(S.page[a], act)(['ovw', 'Overview', 'grid'])); };
  VIEWS[a].pages.ovw = () => ovPage(a); HOME[a] = 'ovw'; S.page[a] = 'ovw'; });
/* Entering an app, switching app or changing Viewing as always lands on Overview */
{ const ov = A.view, os = A.setRole, oh = A.goHome;
  A.view = el => { const a = el.dataset.v; if(VIEWS[a] && HOME[a] === 'ovw'){ S.page[a] = 'ovw'; S.fi[a] = null; } ov(el); };
  A.setRole = el => { ['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { S.page[a] = 'ovw'; S.fi[a] = null; }); os(el); };
  if(oh) A.goHome = el => { ['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { S.page[a] = 'ovw'; S.fi[a] = null; }); oh(el); }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/DBM2cr94ddA4x36wdNFtnQ'; } });
VERSIONS.push({v:'v3.21', date:TODAY, major:false, current:true, url:null, title:'Every app opens on its Overview', sum:'Each app starts on a short Overview: four key figures, what needs you now, your day and the app’s own work this week. Everything acts in place or opens the list behind it.', steps:[
  {t:'Overview first, in every app', min:.5, dolor:'Before, every app opened on My tasks and the key figures were two clicks away.', show:['Overview is the first item in the menu and where each app opens.', 'Four figures; each one opens the list behind it.'], say:'The day starts with what matters, in one screen.', go:() => { S.role = 'dir'; go('dir', 'ovw'); }},
  {t:'Needs you now', min:.5, dolor:'Before, approvals and alerts were in separate pages.', show:['Approve or reject, or fix an alert, without leaving the Overview.', 'The links below open the full lists.'], say:'Act on it where you see it.', go:() => { S.role = 'inc'; go('del', 'ovw'); }},
  {t:'My day', min:.5, dolor:'Before, tasks and meetings were two pages.', show:['Your tasks overdue, due today or in the next two days, with Mark done.', 'Your next two meetings.'], say:'Each person sees their own day; change Viewing as to see someone else’s.', go:() => { S.role = 'aap'; go('ret', 'ovw'); }},
  {t:'The app’s own work', min:.5, dolor:'Before, the work of the week was spread across several lists.', show:['Director: schemes at a glance. Commercial: margin per scheme. Accounts: invoices to chase. Retrofit: assessments this week. Delivery: on site this week.'], say:'One short list of what each team works on this week.', go:() => { S.role = 'acc'; go('acc', 'ovw'); }},
]});
/* v3.26 replaces Needs you now in the Director app; the original reassigns ovNow. */
var ovNowW = null;
export function ovNow(app){ return (ovNowW || ovNow0)(app); }
export const wrapOvNow = w => { ovNowW = w(ovNowW || ovNow0); };
