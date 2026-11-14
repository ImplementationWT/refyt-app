// Refyt · v4.0: un solo espacio de trabajo, la propiedad al centro, permisos por rol, equipo y persona.
import {
  $, A, ATABS, AUTH, AUTO, DB, IN, ME, MODALS, OPENP, PEO, PH, PHOWN, RN, ROLES, RP, S, TODAY,
  VERSIONS, VIEWS, abrir, addDays, area, av, btns, canSee, cbx, cell, crumb, dDiff, empty, esc, fld,
  fmtDy, go, grpH, hint, his, ico, kv, later, mfoot, mlab, modal, mseg, nWait, nx, oph, pend, person,
  pill, prOf, rdiv, render, renderLayer, scOf, seesAll, stat, th, toast, visOf, wrapDrawPop,
  wrapPrFicha, wrapRender
} from "../index.js";
import { jsPDF } from "jspdf";
/* =================== v4.0: one workspace, properties at the centre, permissions by role, team and person =================== */
/* The five team apps stop being separate menus: there is one menu for everyone, and each role sees only the items it may open.
   Every screen exists once. The property card is the same from everywhere; the role decides its tabs and whether money shows. */
export const RET4 = ['sad', 'ass', 'aap', 'dsg', 'dap'], DEL4 = ['inc', 'oap', 'pap', 'sit', 'hse'], MON4 = ['dir', 'com', 'acc'];
export const homeApp = (r = S.role) => r === 'dir' ? 'dir' : r === 'com' ? 'com' : r === 'acc' ? 'acc' : RET4.includes(r) ? 'ret' : 'del';
export const isAdmin = () => S.role === 'dir';
export const WAIT4 = {dir:'dir', com:'com', aap:'ret', dap:'ret', oap:'del', pap:'del'};
DB.perm = DB.perm || {};
DB.uac = DB.uac || {};
DB.req = DB.req || [{id:'RQ-1', by:'akr', role:'sit', pr:'PR-2002', sc:null, why:'I am covering the Pier Road install next week.', on:addDays(TODAY, -1), st:'Pending'}];
DB.teams = DB.teams || [
  {id:'TM-1', n:'Retrofit services', lead:'ram', mem:['sar', 'afa', 'xen', 'ahm'], sc:[], pr:[]},
  {id:'TM-2', n:'Delivery', lead:'dre', mem:['akr', 'hse'], sc:[], pr:[]},
  {id:'TM-3', n:'Commercial and accounts', lead:'lan', mem:['tom'], sc:[], pr:[]},
];
window.__cs2 = (p, k) => (visOf(k).pr || []).includes(p.id) || DB.teams.some(t => (t.lead === k || t.mem.includes(k)) && (t.sc.includes(p.sc) || t.pr.includes(p.id)));
window.__canMoney = () => { const u = DB.uac[ME()]; return u && u.money != null ? u.money : MON4.includes(S.role); };
export const ALL4 = 'all';
export const NAV4 = [
  ['', [
    {k:'home', n:'Home', ic:'inbox', to:() => homeApp() + ':ovw', r:ALL4},
    {k:'tasks', n:'My tasks', ic:'check', to:() => homeApp() + ':tasks', r:ALL4, c:() => DB.tk.filter(t => !t.done && t.r === S.role).length},
    {k:'wait', n:'Approvals', ic:'stamp', to:() => (WAIT4[S.role] || 'dir') + ':wait', r:['dir', 'com', 'aap', 'dap', 'oap', 'pap'], c:() => nWait(WAIT4[S.role] || 'dir'), soft:2},
    {k:'atn', n:'Needs attention', ic:'alert', to:() => S.role === 'dir' ? 'dir:dec' : homeApp() + ':atn', r:ALL4, c:() => pend(homeApp()).length, soft:2},
  ]],
  ['Properties', [
    {k:'prs', n:'All properties', ic:'home', to:() => 'dir:prs', r:ALL4, c:() => DB.pr.filter(p => OPENP.includes(p.ph) && (seesAll(ME()) || canSee(p, ME()))).length},
    {k:'sch', n:'Schemes', ic:'layers', to:() => 'dir:sch', r:['dir', 'com', 'acc']},
    {k:'rq', n:'In assessment', ic:'clip', to:() => 'ret:rq', r:[...RET4, 'dir']},
    {k:'pk', n:'With the client', ic:'send', to:() => 'ret:pk', r:[...RET4, 'dir', 'com']},
    {k:'rdy', n:'Ready to install', ic:'flag', to:() => 'del:rdy', r:[...DEL4, 'dir']},
    {k:'hold', n:'Redbridge tracker', ic:'gauge', to:() => 'del:hold', r:[...DEL4, 'dir']},
    {k:'clo', n:'Close out', ic:'award', to:() => 'del:clo', r:[...DEL4, 'dir', 'acc']},
    {k:'cs', n:'Client systems', ic:'globe', to:() => 'del:cs', r:[...DEL4, 'dir', 'sad']},
  ]],
  ['Calendar', [
    {k:'bk', n:'Assessment bookings', ic:'cal', to:() => 'ret:bk', r:[...RET4, 'dir']},
    {k:'mtg', n:'Meetings', ic:'users', to:() => homeApp() + ':mtg', r:ALL4},
  ]],
  ['Purchasing', [
    {k:'ord', n:'Orders', ic:'cart', to:() => 'del:ord', r:[...DEL4, ...MON4]},
    {k:'sup', n:'Suppliers', ic:'factory', to:() => 'del:sup', r:[...DEL4, ...MON4]},
    {k:'mat', n:'Invoice matching', ic:'receipt', to:() => 'acc:sup', r:['dir', 'acc']},
    {k:'sub', n:'Subcontractor payments', ic:'wallet', to:() => 'acc:sub', r:['dir', 'acc', 'pap']},
  ]],
  ['Money', [
    {k:'mrg', n:'Margins', ic:'chart', to:() => 'com:mrg', r:MON4},
    {k:'quo', n:'Quotes and budgets', ic:'calc', to:() => 'com:quo', r:['dir', 'com']},
    {k:'var', n:'Variations and costs', ic:'swap', to:() => 'com:var', r:['dir', 'com']},
    {k:'trg', n:'Payment triggers', ic:'target', to:() => 'acc:trg', r:['dir', 'acc']},
    {k:'inv', n:'Invoices', ic:'money', to:() => 'acc:inv', r:['dir', 'acc']},
    {k:'rate', n:'Rates', ic:'tag', to:() => 'com:rate', r:['dir', 'com']},
  ]],
  ['Reports', [
    {k:'myt', n:'My team', ic:'users', to:() => 'dir:myt', r:ALL4, only:() => DB.teams.some(t => t.lead === ME())},
    {k:'dbiz', n:'Business overview', ic:'chart', to:() => 'dir:dbiz', r:['dir']},
    {k:'dperf', n:'Scheme performance', ic:'up', to:() => 'dir:dperf', r:['dir', 'com']},
    {k:'dfin', n:'Finance', ic:'money', to:() => 'dir:dfin', r:['dir', 'com', 'acc']},
    {k:'dops', n:'Operations', ic:'route', to:() => 'dir:dops', r:['dir', 'inc']},
    {k:'dcap', n:'Capacity and staffing', ic:'cal', to:() => 'dir:dcap', r:['dir']},
    {k:'dqual', n:'Quality and compliance', ic:'shield', to:() => 'dir:dqual', r:['dir', 'hse']},
    {k:'dsup', n:'Suppliers and subcontractors', ic:'factory', to:() => 'dir:dsup', r:['dir', 'com']},
  ]],
  ['On site', [
    {k:'site', n:'Site forms', ic:'tool', to:() => 'del:site', r:[...DEL4, 'dir']},
    {k:'asf', n:'Assessor form', ic:'camera', to:() => 'ret:asf', r:[...RET4, 'dir']},
  ]],
  ['Administration', [
    {k:'usr', n:'Users and access', ic:'user', to:() => 'dir:usr', r:['dir'], fixed:true},
    {k:'tms', n:'Teams', ic:'users', to:() => 'dir:tms', r:['dir'], fixed:true},
    {k:'req', n:'Access requests', ic:'lock', to:() => 'dir:req', r:['dir'], fixed:true, c:() => DB.req.filter(q => q.st === 'Pending').length, soft:2},
    {k:'prm', n:'Roles and permissions', ic:'shield', to:() => 'dir:prm', r:['dir'], fixed:true},
    {k:'vis', n:'Access by scheme', ic:'layers', to:() => 'dir:vis', r:['dir'], fixed:true},
    {k:'nsc', n:'Schemes and templates', ic:'folder', to:() => 'dir:nsc', r:['dir'], fixed:true},
    {k:'sset', n:'Scheme settings', ic:'edit', to:() => 'com:sset', r:['dir'], fixed:true},
    {k:'cls', n:'Clients', ic:'globe', to:() => 'dir:cls', r:['dir'], fixed:true},
    {k:'int', n:'Integrations', ic:'split', to:() => 'dir:int', r:['dir'], fixed:true},
    {k:'dmap', n:'Data map', ic:'db', to:() => 'db:', r:['dir'], fixed:true},
  ]],
];
export const FOOT4 = [{k:'aut', n:'Automations', ic:'play', to:() => 'dir:aut', r:ALL4}, {k:'help', n:'How it works', ic:'search', to:() => homeApp() + ':help', r:ALL4}];
export const ITEMS4 = [...NAV4.flatMap(([s, xs]) => xs.map(x => ({...x, sec:s || 'Home'}))), ...FOOT4.map(x => ({...x, sec:'Help'}))];
export const defOn = (it, r) => it.r === ALL4 || it.r.includes(r);
export const canNav = (it, r = S.role) => { if(it.only && !it.only()) return false; if(it.fixed) return r === 'dir'; const o = (DB.perm[it.k] || {})[r]; return o != null ? o : defOn(it, r); };
export const curKey = () => S.view === 'db' ? 'db:' : S.view + ':' + (S.page[S.view] || '');
export const curItem = () => ITEMS4.find(it => canNav(it) && it.to() === curKey());
S.uniMin = false;
export function uniSide(){ const cur = curKey(), it = (x, soft) => { const to = x.to(), c = x.c ? x.c() : 0;
    return `<button class="nav" data-act="uni" data-v="${to}" aria-current="${cur === to}" title="${esc(x.n)}"><span class="ni">${ico(x.ic, 17)}</span><span class="nl">${x.n}</span>${c ? `<span class="cnt${(x.soft || soft) === 2 ? ' amb' : ' soft'}">${c}</span>` : ''}</button>`; };
  let h = `<aside class="sb"><button class="sb-tg" data-act="sbMin" title="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-label="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-expanded="${!S.uniMin}">${ico('chev', 16)}<span class="nl">Collapse</span></button>`;
  NAV4.forEach(([sec, xs]) => { const vis = xs.filter(x => canNav(x)); if(!vis.length) return; if(sec) h += `<div class="sb-sec">${sec}</div>`; h += vis.map(x => it(x)).join(''); });
  return h + `<div class="sb-line"></div>` + FOOT4.filter(x => canNav(x)).map(x => it(x)).join('') + `</aside>`; }
['dir', 'com', 'acc', 'ret', 'del', 'tsk'].forEach(a => { if(VIEWS[a]) VIEWS[a].side = uniSide; });
A.uni = el => { const [a, pg] = el.dataset.v.split(':'); S.trail = null; S.back4 = null; S.pop = null; S.modal = null;
  if(a === 'db'){ S.view = 'db'; render(true); return; } S.fi[a] = null; go(a, pg); };
A.sbMin = () => { S.uniMin = !S.uniMin; render(); };

/* Everyone lands on Home; switching "Viewing as" lands on that role's Home */
{ const os = A.setRole; A.setRole = el => { os(el); if(S.role !== el.dataset.v) return; S.trail = null; S.back4 = null; const a = homeApp(); S.view = a; S.page[a] = 'ovw'; S.fi[a] = null; render(true); toast(`Viewing as ${RN(S.role)}, ${RP(S.role)}: the menu shows what this role can open.`); }; }

/* A property opens in the context of the person's own work, so their tabs can be edited; Back returns to the list they came from */
window.__ab4 = null;
window.__eapp = app => isAdmin() ? app : homeApp();
{ const ob = A.fichaback; A.fichaback = el => { const b = S.back4; if(ob) ob(el); else { S.fi[S.view] = null; render(); } if(b && b.app !== S.view){ S.back4 = null; S.fi[S.view] = null; S.view = b.app; S.page[b.app] = b.page; S.fi[b.app] = null; render(); } }; }

/* The same tabs everywhere; the role decides which ones */
export const TABS4 = [['res', 'Summary'], ['rsd', 'Resident'], ['mea', 'Measures'], ['ret', 'Assess and design'], ['ins', 'Prepare and install'], ['mon', 'Orders'], ['inv', 'Invoices'], ['clo', 'Close out'], ['chk', 'Checklists'], ['upd', 'Updates'], ['his', 'History']];
export const TABR4 = {ret:[...RET4, 'dir', 'com'], ins:[...DEL4, 'dir'], mon:[...DEL4, ...MON4], inv:['dir', 'acc'], clo:[...DEL4, 'dir', 'acc'], chk:[...RET4, ...DEL4, 'dir']};
export const roleTabs = () => TABS4.filter(([k]) => !TABR4[k] || TABR4[k].includes(S.role)).map(([k, n]) => k === 'mon' ? ['mon', window.__canMoney() ? 'Money and orders' : 'Orders'] : [k, n]);
Object.keys(ATABS).forEach(a => Object.defineProperty(ATABS, a, {get:roleTabs, configurable:true, enumerable:true}));

/* The resident: contact, consent and every call and note, in one place */
export const rsdOf = p => { if(!p.rs){ const n = PH.indexOf(p.ph), dig = String(7700900000 + parseInt(p.id.slice(3), 10) * 137).slice(0, 10), first = String(p.res || 'Resident').split(' ')[0].toLowerCase();
    p.rs = {ph:'0' + dig.slice(0, 4) + ' ' + dig.slice(4), em:`${first}.${String(p.res || '').split(' ').slice(-1)[0].toLowerCase()}@example.co.uk`, pref:n % 2 ? 'Phone' : 'Text message', cons:n >= 1 ? p.phOn : null,
      log:[{on:addDays(p.phOn, -3), k:'Call', t:'Introduced REFYT and the scheme; resident happy to proceed.', by:'sar'}].concat(n >= 2 ? [{on:addDays(p.phOn, -1), k:'Note', t:'Prefers mornings. Dog in the garden, call before arriving.', by:'sar'}] : [])}; }
  return p.rs; };
export function rsdTab(app, p){ const r = rsdOf(p);
  return kv([['Resident', esc(p.res)], ['Phone', r.ph], ['Email', r.em], ['Preferred contact', r.pref], ['Consent', r.cons ? 'Recorded ' + fmtDy(r.cons) : 'Not recorded yet']])
    + `<div class="rf-bar v4-acts">${nx('rsdLog', p.id + '|Call', 'Log a call')}${nx('rsdLog', p.id + '|Note', 'Add a note', 'sec')}${nx('rsdLog', p.id + '|Email', 'Log an email', 'sec')}${later('Aircall')}${later('Customer messages')}</div>`
    + grpH('Contact history', r.log.length) + (r.log.length ? r.log.slice().reverse().map(x => rdiv(cell(esc(x.t), `${x.k} by ${esc((PEO[x.by] || {n:'Someone'}).n)}`, 3) + cell(fmtDy(x.on), ''))).join('') : empty('No contact recorded yet.')); }
A.rsdLog = el => { const [id, kind] = el.dataset.v.split('|'); S.modal = {k:'rsd4', id, kind, t:''}; renderLayer(); };
MODALS.rsd4 = m => modal(m.kind === 'Call' ? 'Log a call' : m.kind === 'Email' ? 'Log an email' : 'Add a note', `${esc(prOf(m.id).res)}, ${esc(prOf(m.id).ad)}. It is kept on the resident's contact history.`, area('What was said', 'rsd4t', 't', m.t, 'For example: confirmed the survey date, asked about parking.', true), mfoot('Save', 'rsdOk', !!m.t.trim()));
IN.rsd4t = t => { S.modal.t = t.value; const b = $('#mok'); if(b) b.disabled = !t.value.trim(); };
A.rsdOk = () => { const m = S.modal, p = prOf(m.id), r = rsdOf(p); r.log.push({on:TODAY, k:m.kind, t:m.t.trim(), by:ME()}); his(p, `${m.kind} with the resident logged`); S.modal = null; render(); toast(`${m.kind} saved on the resident's history.`); };

/* Who a property is shared with, and asking for access */
export const viewers4 = p => Object.keys(PEO).filter(k => k === ROLES.dir[1] || visOf(k).all || canSee(p, k));
export const shareBar4 = p => !isAdmin() ? '' : `<div class="v4-share">${ico('users', 16)}<span><b>Shared with ${viewers4(p).length} people</b><small>${viewers4(p).slice(0, 6).map(k => esc(PEO[k].n.split(' ')[0])).join(', ')}${viewers4(p).length > 6 ? ' and more' : ''}</small></span><button class="btn sec sm" data-act="shrOpen" data-v="${p.id}">Share</button></div>`;
export const shareWhy = (p, k) => k === ROLES.dir[1] ? 'Director, sees everything' : visOf(k).all ? 'Sees every property' : (visOf(k).pr || []).includes(p.id) ? 'Shared directly' : (visOf(k).sc || []).includes(p.sc) ? `Through ${scOf(p.sc).n}` : DB.teams.some(t => (t.lead === k || t.mem.includes(k)) && (t.sc.includes(p.sc) || t.pr.includes(p.id))) ? 'Through their team' : p.b.who === k ? 'Assigned to assess it' : '';
A.shrOpen = el => { S.modal = {k:'shr4', id:el.dataset.v}; renderLayer(); };
MODALS.shr4 = m => { const p = prOf(m.id);
  return modal('Share this property', `${esc(p.ad)}, ${esc(scOf(p.sc).n)}. What each person sees inside it still depends on their role.`, grpH('Teams', DB.teams.length) + DB.teams.map(t => { const on = t.pr.includes(p.id) || t.sc.includes(p.sc);
      return `<div class="v4-sr"><span>${ico('users', 15)}<b>${esc(t.n)}</b><small>${t.mem.length + 1} people, led by ${esc(PEO[t.lead].n)}</small></span>${t.sc.includes(p.sc) ? pill('tk', 'Through the scheme') : `<button class="btn ${on ? 'pri' : 'sec'} sm" data-act="shrTeam" data-v="${t.id}|${p.id}">${on ? 'Shared' : 'Share'}</button>`}</div>`; }).join('')
    + grpH('People', Object.keys(PEO).length) + Object.keys(PEO).map(k => { const why = shareWhy(p, k), direct = (visOf(k).pr || []).includes(p.id), locked = why && !direct;
      return `<div class="v4-sr"><span>${av(k, 26)}<b>${esc(PEO[k].n)}</b><small>${esc(PEO[k].r)}${why ? ', ' + why.toLowerCase() : ''}</small></span>${locked ? pill('tg', 'Can see it') : `<button class="btn ${direct ? 'pri' : 'sec'} sm" data-act="shrPer" data-v="${k}|${p.id}">${direct ? 'Shared' : 'Share'}</button>`}</div>`; }).join(''),
    `<span class="note"></span><button class="btn pri lg" data-act="mclose">Done</button>`, 620); };
A.shrPer = el => { const [k, id] = el.dataset.v.split('|'), v = visOf(k), p = prOf(id); v.pr = v.pr || []; const on = v.pr.includes(id); v.pr = on ? v.pr.filter(x => x !== id) : [...v.pr, id]; his(p, `${on ? 'Stopped sharing with' : 'Shared with'} ${PEO[k].n}`); renderLayer(); render(); };
A.shrTeam = el => { const [t, id] = el.dataset.v.split('|'), tm = DB.teams.find(x => x.id === t), p = prOf(id), on = tm.pr.includes(id); tm.pr = on ? tm.pr.filter(x => x !== id) : [...tm.pr, id]; his(p, `${on ? 'Stopped sharing with' : 'Shared with'} the ${tm.n} team`); renderLayer(); render(); };
export const reqOf = id => DB.req.find(q => q.pr === id && q.by === ME() && q.st === 'Pending');
export function lockPage4(p){ const q = reqOf(p.id);
  return crumb('fichaback', 'Back', esc(p.ad)) + `<div class="v4-lock">${ico('lock', 28)}<h2>${esc(p.ad)} is not shared with you</h2><p>${esc(scOf(p.sc).n)}. Ask the administrator for access: they choose whether you get this property or the whole scheme.</p>${q ? pill('ta', 'Request sent ' + fmtDy(q.on)) : `<button class="btn pri" data-act="reqOpen" data-v="${p.id}">Request access</button>`}</div>`; }
A.reqOpen = el => { S.modal = {k:'req4', id:el.dataset.v, scope:'pr', t:''}; renderLayer(); };
MODALS.req4 = m => { const p = prOf(m.id);
  return modal('Request access', `${esc(p.ad)}, ${esc(scOf(p.sc).n)}. The request goes to the administrator.`, mlab('What you need', true) + mseg('scope', m.scope, [['pr', 'This property'], ['sc', 'The whole scheme']]) + area('Why', 'req4t', 't', m.t, 'For example: I am covering this install next week.'), mfoot('Send request', 'reqOk', true)); };
IN.req4t = t => { S.modal.t = t.value; };
A.reqOk = () => { const m = S.modal, p = prOf(m.id); DB.req.push({id:'RQ-' + (DB.req.length + 1), by:ME(), role:S.role, pr:p.id, sc:m.scope === 'sc' ? p.sc : null, why:m.t.trim(), on:TODAY, st:'Pending'}); S.modal = null; render(); toast('Request sent to the administrator. You will see the property once it is approved.'); };
{ wrapPrFicha(pf => (app, p) => !isAdmin() && !seesAll(ME()) && !canSee(p, ME()) ? lockPage4(p) : pf(app, p)); }

/* All properties: only the ones shared with you, plus the rest of your schemes to ask for */
{ const f = VIEWS.dir.pages.prs; VIEWS.dir.pages.prs = (...x) => { if(isAdmin() || seesAll(ME())) return f(...x);
    const all = window.__prAll || DB.pr, mine = DB.pr.filter(p => canSee(p, ME())), rest = all.filter(p => OPENP.includes(p.ph) && !canSee(p, ME()));
    const h0 = DB.pr; DB.pr = mine; let h; try { h = f(...x); } finally { DB.pr = h0; }
    const note = `<div class="vis-n">${ico('eye', 15)}<span>You see <b>${mine.length} of ${all.length}</b> properties: the ones shared with you, your team or your schemes. The administrator decides who sees what.</span></div>`;
    const i = h.indexOf('</div></div>', h.indexOf('<div class="op-h">')); h = i > 0 ? h.slice(0, i + 12) + note + h.slice(i + 12) : note + h;
    return h + grpH('Not shared with you', rest.length) + (rest.length ? rest.slice(0, 8).map(p => { const q = reqOf(p.id);
      return rdiv(cell(`${ico('lock', 13)} ${esc(p.ad)}`, `${esc(scOf(p.sc).n)}, ${p.ph}`, 3) + btns(q ? pill('ta', 'Requested') : nx('reqOpen', p.id, 'Request access', 'sec'))); }).join('') + (rest.length > 8 ? hint(`And ${rest.length - 8} more. Use Request access on any of them.`) : '') : empty('Nothing else open.')); }; }

/* Administration: users and access */
export const rolesOf = k => Object.keys(ROLES).filter(r => ROLES[r][1] === k);
export const teamsOf = k => DB.teams.filter(t => t.lead === k || t.mem.includes(k));
export const scopeOf = k => k === ROLES.dir[1] || visOf(k).all ? 'all' : visOf(k).own ? 'own' : 'sc';
VIEWS.dir.pages.usr = () => oph('Users and access', 'Each person has a role, which decides what they can open and do; a property scope, which decides which properties they see; and whether they see money. Use View as to check it.')
  + `<div class="cstats">${stat('tk', 'People', Object.keys(PEO).length)}${stat('tk', 'See every property', Object.keys(PEO).filter(k => scopeOf(k) === 'all').length)}${stat('tk', 'Teams', DB.teams.length)}${stat(DB.req.some(q => q.st === 'Pending') ? 'ta' : 'tg', 'Access requests', DB.req.filter(q => q.st === 'Pending').length, 'waiting', 'uni', 'dir:req')}</div>`
  + `<div class="el-wide"><div class="rf-mx v4-ut"><table><thead><tr><th>Person</th><th>Role</th><th>Team</th><th>Properties they see</th><th>Money</th><th class="r">Sees</th><th></th></tr></thead><tbody>${Object.keys(PEO).map(k => { const dir = k === ROLES.dir[1], sc = scopeOf(k), rs = rolesOf(k), u = DB.uac[k] || {}, money = u.money != null ? u.money : rs.some(r => MON4.includes(r)), n = dir || sc === 'all' ? DB.pr.length : DB.pr.filter(p => canSee(p, k)).length;
    return `<tr><td>${person(k)}</td><td>${rs.length ? rs.map(r => esc(RN(r))).join(', ') : '<span class="mini">No role yet</span>'}</td><td>${teamsOf(k).map(t => esc(t.n) + (t.lead === k ? ' <small class="mini">(leader)</small>' : '')).join(', ') || '-'}</td>`
      + `<td>${dir ? pill('tb', 'Administrator, every property') : `<div class="seg2 um-seg">${[['all', 'Every property'], ['sc', 'Their schemes'], ['own', 'Only assigned']].map(([v, l]) => `<button data-act="usrSc" data-v="${k}|${v}" aria-pressed="${sc === v}">${l}</button>`).join('')}</div>`}</td>`
      + `<td>${dir ? pill('tg', 'Yes') : `<button class="vis-b${money ? ' on' : ''}" data-act="usrMon" data-v="${k}" aria-pressed="${money}">${money ? ico('check', 13) + ' Sees money' : 'No'}</button>`}</td><td class="r"><b>${n}</b> <small class="mini">of ${DB.pr.length}</small></td><td>${rs.length && !dir ? `<button class="btn sec sm" data-act="visAs" data-v="${k}">View as</button>` : ''}</td></tr>`; }).join('')}</tbody></table></div></div>`
  + hint('Their schemes: the schemes ticked for them in Access by scheme, plus their team’s schemes and anything shared with them directly. Only assigned: the jobs they are assigned to and anything shared with them.');
A.usrSc = el => { const [k, v] = el.dataset.v.split('|'), x = visOf(k); x.all = v === 'all'; x.own = v === 'own'; render(); toast(`${PEO[k].n} now sees ${v === 'all' ? 'every property' : v === 'own' ? 'only the jobs assigned or shared' : 'the properties of their schemes'}.`); };
A.usrMon = el => { const k = el.dataset.v, rs = rolesOf(k), u = DB.uac[k] || (DB.uac[k] = {}), cur = u.money != null ? u.money : rs.some(r => MON4.includes(r)); u.money = !cur; render(); toast(`${PEO[k].n} ${u.money ? 'now sees' : 'no longer sees'} quotes, costs and margins.`); };

/* Administration: teams and their leaders */
export const tkOfP = k => DB.tk.filter(t => !t.done && ROLES[t.r] && ROLES[t.r][1] === k);
export const ownOfP = k => DB.pr.filter(p => OPENP.includes(p.ph) && ((ROLES[PHOWN[p.ph]] || [])[1] === k || p.b.who === k));
export const teamReport = t => th(cell('Person', 'Role', 2.2) + cell('Open tasks', '') + cell('Overdue', '') + cell('Next steps on', 'properties') + cell('Sees', 'properties')) + [t.lead, ...t.mem].map(k => { const tk = tkOfP(k), od = tk.filter(x => dDiff(x.due) < 0).length;
  return rdiv(cell(esc(PEO[k].n), esc((PEO[k] || {}).r) + (k === t.lead ? ', leader' : ''), 2.2) + cell(tk.length, '') + cell(od ? pill('tred', od) : '0', '') + cell(ownOfP(k).length, '') + cell(scopeOf(k) === 'all' ? 'All' : DB.pr.filter(p => canSee(p, k)).length, '')); }).join('');
VIEWS.dir.pages.tms = () => oph('Teams', 'A team has a leader and members. The leader sees the team’s report; schemes shared with a team reach every member.', nx('tmNew', '', 'New team'))
  + DB.teams.map(t => `<section class="rsec v4-team"><div class="rs-h"><h3>${esc(t.n)}</h3><p>Led by ${esc(PEO[t.lead].n)}, ${t.mem.length} ${t.mem.length === 1 ? 'member' : 'members'}</p></div>`
    + `<div class="v4-row"><small class="tw-lab">Leader</small><div class="seg2 um-seg">${[t.lead, ...t.mem].map(k => `<button data-act="tmLead" data-v="${t.id}|${k}" aria-pressed="${t.lead === k}">${esc(PEO[k].n.split(' ')[0])}</button>`).join('')}</div></div>`
    + `<div class="v4-row"><small class="tw-lab">Members</small><div class="v4-chips">${t.mem.map(k => `<span class="v4-chip">${esc(PEO[k].n)}<button data-act="tmRm" data-v="${t.id}|${k}" aria-label="Remove ${esc(PEO[k].n)}">${ico('x', 12)}</button></span>`).join('')}${cbx('', 'tmadd' + t.id, Object.keys(PEO).filter(k => k !== t.lead && !t.mem.includes(k)).map(k => [k, PEO[k].n, PEO[k].r]), null, 'tmAdd', {ph:'Add a person'})}</div></div>`
    + `<div class="v4-row"><small class="tw-lab">Schemes shared with the team</small><div class="v4-chips">${DB.sc.map(s => `<button class="vis-b${t.sc.includes(s.id) ? ' on' : ''}" data-act="tmSc" data-v="${t.id}|${s.id}" aria-pressed="${t.sc.includes(s.id)}">${t.sc.includes(s.id) ? ico('check', 12) + ' ' : ''}${esc(s.n)}</button>`).join('')}</div></div>`
    + `<div class="v4-sub">Team report</div>` + teamReport(t) + `</section>`).join('');
A.tmLead = el => { const [id, k] = el.dataset.v.split('|'), t = DB.teams.find(x => x.id === id); if(t.lead === k) return; t.mem = [t.lead, ...t.mem.filter(x => x !== k)]; t.lead = k; render(); toast(`${PEO[k].n} now leads ${t.n} and sees its report.`); };
A.tmRm = el => { const [id, k] = el.dataset.v.split('|'), t = DB.teams.find(x => x.id === id); t.mem = t.mem.filter(x => x !== k); render(); };
A.tmSc = el => { const [id, sc] = el.dataset.v.split('|'), t = DB.teams.find(x => x.id === id); t.sc = t.sc.includes(sc) ? t.sc.filter(x => x !== sc) : [...t.sc, sc]; render(); };
IN.tmAdd = t => { const id = String(t.dataset.k).slice(5), tm = DB.teams.find(x => x.id === id), k = t.value; if(tm && PEO[k] && !tm.mem.includes(k) && tm.lead !== k){ tm.mem.push(k); toast(`${PEO[k].n} added to ${tm.n}.`); } };
A.tmNew = () => { S.modal = {k:'tm4', n:'', lead:''}; renderLayer(); };
MODALS.tm4 = m => modal('New team', 'Name the team and pick its leader. Add members and schemes after.', fld('Team name', 'tm4n', 'n', m.n, {req:true, ph:'For example: Redbridge site team'}) + mlab('Leader', true) + mseg('lead', m.lead, Object.keys(PEO).map(k => [k, PEO[k].n])), mfoot('Create team', 'tmOk', !!(m.n.trim() && m.lead)));
IN.tm4n = t => { S.modal.n = t.value; const b = $('#mok'); if(b) b.disabled = !(S.modal.n.trim() && S.modal.lead); };
A.tmOk = () => { const m = S.modal; DB.teams.push({id:'TM-' + (DB.teams.length + 1), n:m.n.trim(), lead:m.lead, mem:[], sc:[], pr:[]}); S.modal = null; render(); toast(`${m.n.trim()} created, led by ${PEO[m.lead].n}.`); };
VIEWS.dir.pages.myt = () => { const ts = DB.teams.filter(t => t.lead === ME());
  return oph('My team', 'What each person in your team has open, overdue and waiting on them. You see it because you lead the team.') + (ts.length ? ts.map(t => grpH(esc(t.n), t.mem.length + 1) + teamReport(t)).join('') : empty('You do not lead a team.')); };

/* Administration: access requests */
VIEWS.dir.pages.req = () => { const pe = DB.req.filter(q => q.st === 'Pending'), dn = DB.req.filter(q => q.st !== 'Pending');
  return oph('Access requests', 'When someone opens a property that is not shared with them, they can ask for it. Approve with the scope you want, or reject with a reason.')
    + (pe.length ? pe.map(q => { const p = prOf(q.pr);
      return `<div class="ds-exc c-ta"><div class="ds-exh">${pill('ta', 'Request')}<b>${esc(PEO[q.by].n)} asks for ${q.sc ? 'the whole ' + esc(scOf(q.sc).n) + ' scheme' : esc(p.ad)}</b><span>${esc(RN(q.role))}, ${fmtDy(q.on)}</span></div><p>${q.why ? '“' + esc(q.why) + '”' : 'No reason given.'} ${esc(p.ad)} is in ${esc(scOf(p.sc).n)}, ${p.ph}.</p><div class="ds-exb"><button class="btn pri sm" data-act="reqYes" data-v="${q.id}|pr">Give this property</button><button class="btn sec sm" data-act="reqYes" data-v="${q.id}|sc">Give the whole scheme</button><button class="btn sec sm" data-act="reqNo" data-v="${q.id}">Reject</button></div></div>`; }).join('') : empty('No requests waiting.'))
    + (dn.length ? grpH('Answered', dn.length) + dn.slice().reverse().map(q => rdiv(cell(`${esc(PEO[q.by].n)}, ${esc(prOf(q.pr).ad)}`, q.why ? esc(q.why) : '', 3) + cell(q.st === 'Rejected' ? pill('tred', 'Rejected') : pill('tg', q.st), fmtDy(q.on)))).join('') : ''); };
A.reqYes = el => { const [id, sc] = el.dataset.v.split('|'), q = DB.req.find(x => x.id === id), v = visOf(q.by), p = prOf(q.pr);
  if(sc === 'sc'){ v.sc = v.sc || []; if(!v.sc.includes(p.sc)) v.sc.push(p.sc); q.st = 'Approved, whole scheme'; } else { v.pr = v.pr || []; if(!v.pr.includes(p.id)) v.pr.push(p.id); q.st = 'Approved, this property'; }
  his(p, `Access given to ${PEO[q.by].n} (${sc === 'sc' ? 'whole scheme' : 'this property'})`); render(); toast(`${PEO[q.by].n} can now see ${sc === 'sc' ? 'every property in ' + scOf(p.sc).n : p.ad}.`); };
A.reqNo = el => { const q = DB.req.find(x => x.id === el.dataset.v); q.st = 'Rejected'; render(); toast(`Request rejected. ${PEO[q.by].n} is told.`); };

/* Administration: roles and permissions */
S.f.prmR = S.f.prmR || 'inc';
VIEWS.dir.pages.prm = () => { const r = S.f.prmR;
  return oph('Roles and permissions', 'What each role can open in the menu. Which properties a person sees is set in Users and access; inside a property, the role decides the tabs and whether money shows.')
    + `<div class="rf-bar"><div class="seg2 um-seg v4-wrap">${Object.keys(ROLES).filter(x => x !== 'dir').map(x => `<button data-act="prmR" data-v="${x}" aria-pressed="${r === x}">${esc(RN(x))}</button>`).join('')}</div></div>`
    + `<div class="v4-pm">${NAV4.map(([sec, xs]) => { const its = xs.filter(x => !x.only); if(!its.length) return '';
      return `<section class="rsec"><div class="rs-h"><h3>${sec || 'Home'}</h3></div>${its.map(x => { const on = canNav(x, r);
        return `<div class="v4-pr"><span>${ico(x.ic, 15)}<b>${x.n}</b></span>${x.fixed ? pill('tk', 'Administrator only') : `<button class="vis-b${on ? ' on' : ''}" data-act="prmSet" data-v="${x.k}|${r}|${on ? 0 : 1}" aria-pressed="${on}">${on ? ico('check', 12) + ' Can open' : 'Hidden'}</button>`}</div>`; }).join('')}</section>`; }).join('')}</div>`
    + `<section class="rsec"><div class="rs-h"><h3>Inside a property</h3><p>Tabs ${esc(RN(r))} sees</p></div><div class="v4-chips">${TABS4.map(([k, n]) => { const on = !TABR4[k] || TABR4[k].includes(r); return pill(on ? 'tg' : 'tk', (on ? '' : 'No ') + (k === 'mon' ? 'Orders' : n)); }).join('')}${pill(MON4.includes(r) ? 'tg' : 'tk', MON4.includes(r) ? 'Sees money' : 'No money')}</div></section>`; };
A.prmR = el => { S.f.prmR = el.dataset.v; render(); };
A.prmSet = el => { const [k, r, v] = el.dataset.v.split('|'); (DB.perm[k] = DB.perm[k] || {})[r] = v === '1'; render(); toast(`${RN(r)}: ${ITEMS4.find(x => x.k === k).n} ${v === '1' ? 'shows in the menu' : 'is hidden'}.`); };

/* Administration: integrations, and every automation in one list */
VIEWS.dir.pages.int = () => oph('Integrations', 'The services the system will connect to. Until each one is built, the work is recorded here by hand.')
  + [['Xero', 'Invoices to clients, supplier invoices and payments, matched to orders.'], ['Microsoft 365', 'Email and calendar for assessment visits and meetings.'], ['Fellow', 'Meeting notes and action points into My tasks.'], ['DocuSign', 'Customer and client sign off at handover.'], ['Aircall', 'Calls with residents logged on the property.'], ['Customer messages', 'Booking confirmations and reminders to residents.']].map(([n, d]) => rdiv(cell(n, d, 3) + `<div class="mbc" style="flex:0 0 auto"><b>${later(n)}</b><small></small></div>`)).join('');
VIEWS.dir.pages.aut = () => oph('Automations', 'What the system does by itself, so nobody has to. Every run is shown here and written on the property’s history.')
  + [['ret', 'Assessment and design'], ['del', 'Install and close out'], ['com', 'Quotes and margins'], ['acc', 'Invoices and payments'], ['dir', 'Schemes and approvals'], ['tsk', 'Tasks and meetings']].map(([a, n]) => grpH(n, AUTO[a].length) + AUTO[a].map(t => `<div class="rf-dl ok"><span class="rf-ck">${ico('play', 13, 2.4)}</span><div><b style="font-weight:600">${t}</b></div>${pill('tg', 'On')}</div>`).join('')).join('')
  + grpH('Ran in this session', DB.runs.length) + (DB.runs.length ? DB.runs.slice().reverse().map(r => rdiv(cell('The system ' + esc(r[2]), r[3] ? `${r[3]} ${prOf(r[3]).ad}` : '', 3) + cell(fmtDy(r[0]), ''))).join('') : empty('Nothing yet. Approve, book or complete something and it shows here.'));

/* Export any list: a spreadsheet (CSV) or a PDF of what is on screen */
export const exportRows = () => { const op = document.querySelector(`#a-${S.view} .op`) || document.querySelector('#dbview .op'); if(!op) return {t:'Export', rows:[]};
  const t = (op.querySelector('.op-h h1') || {}).textContent || 'Export', clean = s => (s || '').replace(/\s+/g, ' ').trim(), rows = [];
  op.querySelectorAll('table').forEach(tb => tb.querySelectorAll('tr').forEach(tr => rows.push([...tr.children].map(c => clean(c.innerText)))));
  op.querySelectorAll('.mbr').forEach(r => { const cs = [...r.querySelectorAll(':scope > .mbc')].map(c => clean([c.querySelector('b'), c.querySelector('small')].filter(Boolean).map(x => clean(x.innerText)).filter(Boolean).join(', '))); if(cs.some(Boolean)) rows.push(cs.filter((x, i) => x || i < cs.length - 1)); });
  return {t:clean(t), rows}; };
A.expOpen = () => { const x = exportRows(); S.modal = {k:'exp4', t:x.t, n:x.rows.length}; renderLayer(); };
MODALS.exp4 = m => modal('Export', `${esc(m.t)}: ${m.n} rows, with the filters you have on screen.`, `<div class="v4-exp"><button class="btn sec lg" data-act="expGo" data-v="csv">${ico('receipt', 16)}Spreadsheet (CSV, opens in Excel)</button><button class="btn sec lg" data-act="expGo" data-v="pdf">${ico('folder', 16)}PDF</button></div>`, `<span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button>`, 520);
export const saveFile4 = async (filename, data) => { try { const cl = window.claude && await window.claude.use('downloads'); if(cl){ await cl.save({filename, data}); return true; } } catch(e){ if(e && e.code === 'declined') return false; }
  const b = data instanceof Blob ? data : new Blob([data]), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); return true; };
A.expGo = async el => { const k = el.dataset.v, x = exportRows(), base = x.t.replace(/[^A-Za-z0-9 ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'export', stamp = TODAY;
  if(!x.rows.length){ S.modal = null; renderLayer(); return toast('Nothing to export on this page.'); }
  if(k === 'csv'){ const csv = x.rows.map(r => r.map(c => /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c).join(',')).join('\n'); S.modal = null; renderLayer(); if(await saveFile4(`refyt-${base}-${stamp}.csv`, '\ufeff' + csv)) toast('Spreadsheet ready.'); return; }
  const J = jsPDF; if(!J){ S.modal = null; renderLayer(); return toast('PDF is not available in this view. Use the spreadsheet.'); }
  const doc = new J({orientation:'landscape', unit:'pt', format:'a4'}), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(); let y = 48;
  doc.setFontSize(16); doc.text(`REFYT, ${x.t}`, 40, y); y += 18; doc.setFontSize(9); doc.setTextColor(110); doc.text(`Exported ${fmtDy(TODAY)} by ${(PEO[ME()] || {n:''}).n}`, 40, y); doc.setTextColor(20); y += 22;
  const cols = Math.max(...x.rows.map(r => r.length)), cw = (W - 80) / cols;
  x.rows.forEach((r, i) => { const cells = r.map(c => doc.splitTextToSize(String(c), cw - 8)), h = Math.max(...cells.map(c => c.length)) * 11 + 6; if(y + h > H - 36){ doc.addPage(); y = 40; }
    if(i === 0){ doc.setFillColor(235, 239, 247); doc.rect(40, y - 9, W - 80, h, 'F'); } cells.forEach((c, j) => doc.text(c, 44 + j * cw, y)); y += h; doc.setDrawColor(225); doc.line(40, y - 8, W - 40, y - 8); });
  S.modal = null; renderLayer(); if(await saveFile4(`refyt-${base}-${stamp}.pdf`, doc.output('blob'))) toast('PDF ready.'); };

/* Header: one workspace instead of an app switcher; notifications are the role's own */
export const sec4 = () => { if(S.view !== 'db' && S.fi[S.view]) return 'Property'; const it = curItem(); return it ? (it.sec === 'Home' ? it.n : it.sec + ', ' + it.n) : S.fi[S.view] ? 'Property' : 'Workspace'; };
{ wrapDrawPop(dp => () => { dp(); const el = document.getElementById('rfpop'); if(!el || !S.pop) return; const top = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom + 6;
    if(S.pop === 'role') el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:16px"><small class="rf-ph">Viewing as. Administrator: Director</small>${Object.entries(ROLES).filter(([k]) => AUTH.viewAs || AUTH.roles.includes(k)).map(([k, [n]]) => `<button class="rf-pi${S.role === k ? ' on' : ''}" data-act="setRole" data-v="${k}"><b>${n}${k === 'dir' ? ', administrator' : ''}</b><small>${RP(k)}, ${ITEMS4.filter(x => canNav(x, k) && !['home', 'help', 'aut'].includes(x.k)).length} menu items</small></button>`).join('')}</div>`;
    if(S.pop === 'nt' && !isAdmin()){ const xs = pend(homeApp()).slice(0, 8); el.innerHTML = `<div class="rf-pop wide" style="top:${top}px;right:16px"><small class="rf-ph">Your items as ${RN(S.role)}</small>${xs.map(a => `<div class="rf-ni"><b>${esc(a.t)}</b><small>${esc(a.k)}</small></div>`).join('') || '<div class="rf-ni"><small>Nothing right now.</small></div>'}</div>`; } }); }
{ wrapRender(r4 => (...x) => { r4(...x);
    const sw = $('#appsw'); if(sw){ const ex = sw.querySelector('.rf-appdd'), html = `<button class="rf-appdd v4-ws" data-act="uni" data-v="${homeApp()}:ovw" title="Home"><span class="rf-ai">${ico('home', 16)}</span><span class="rf-adn"><b>REFYT</b><small>${esc(sec4())}</small></span></button>`; if(ex) ex.outerHTML = html; else if(!sw.querySelector('.v4-ws')) sw.insertAdjacentHTML('beforeend', html); }
    const dot = document.querySelector('#tools [data-act="popNt"] .rf-dot'); if(dot && !isAdmin()){ const n = pend(homeApp()).length; if(n) dot.textContent = n > 9 ? '9+' : n; else dot.remove(); }
    const el = document.querySelector(`#a-${S.view}`); if(el) el.classList.toggle('sbmini', S.uniMin && window.innerWidth > 900);
    const oh = document.querySelector(`#a-${S.view} .op > .op-h, #a-${S.view} .op .op-h`), rows = document.querySelectorAll(`#a-${S.view} .op .mbr, #a-${S.view} .op table tr`).length;
    if(oh && rows > 2 && !oh.querySelector('[data-act="expOpen"]')){ let a = oh.querySelector('.eh-a'); if(!a){ oh.insertAdjacentHTML('beforeend', '<div class="eh-a"></div>'); a = oh.querySelector('.eh-a'); } a.insertAdjacentHTML('afterbegin', `<button class="btn sec" data-act="expOpen">${ico('down', 15)}Export</button>`); } }); }

/* Styles for the v4 pieces, on the theme variables */
/* Estilos wt-v4: en web/src/refyt/styles (capa refyt), no se inyectan desde aquí. */

/* Versions: v3.32 is archived; v4.0 is the reorganised workspace */
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.major = true; v.url = 'https://claude.ai/artifact/7KYarFa4mes41LVAwrjzan'; } });
VERSIONS.push({v:'v4.0', date:TODAY, major:true, current:true, url:null, title:'One workspace, with the property at the centre', sum:'One menu for everyone instead of five apps, where every screen exists once. The property card is the same from everywhere, with the resident’s contact history. Users, teams, roles and access requests in Administration, and export to a spreadsheet or PDF from any list.', steps:[
  {t:'One menu, every screen once', min:1, dolor:'Before, five apps repeated My tasks, Meetings, Needs attention and Approvals, and the same properties showed in seven lists.', show:['Home, Properties, Calendar, Purchasing, Money, Reports, On site and Administration.', 'The lists that were in each app are now views of Properties.', 'Viewing as changes what the menu shows, not where things are.'], say:'You always know where to look.', go:() => { S.role = 'dir'; S.trail = null; S.page.dir = 'ovw'; S.fi.dir = null; go('dir', 'ovw'); }},
  {t:'The property at the centre', min:1, dolor:'Before, the same property looked different from each app, and there was nowhere to keep the conversations with the resident.', show:['Open any property: the same tabs from everywhere, chosen by the role.', 'Resident: contact, consent, and every call, email and note.', 'The administrator sees who the property is shared with and shares it.'], say:'One card per property, for everyone.', go:() => { S.role = 'dir'; abrir('dir', 'PR-2002', 'rsd'); }},
  {t:'Who sees what', min:1, dolor:'Before, access was a sample per app.', show:['Users and access: role, properties they see, and money, per person.', 'Teams: a leader and members; the leader gets the team report.', 'Roles and permissions: what each role can open in the menu.'], say:'The administrator decides, in one place.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'usr'); }},
  {t:'Asking for access', min:.5, dolor:'Before, a property you could not see simply was not there.', show:['As the Site manager, All properties lists what is not shared with you.', 'Request access sends it to the administrator, who gives the property or the whole scheme.'], say:'Nothing is hidden by accident.', go:() => { S.role = 'sit'; S.trail = null; S.view = 'del'; go('dir', 'prs'); }},
  {t:'Export any list', min:.5, dolor:'Dren asked to send filtered lists to clients.', show:['Every list has Export: a spreadsheet that opens in Excel, or a PDF, with the filters on screen.'], say:'Filter, export, send.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'rdy'); }},
]});
if(/debug/.test(location.hash)) window.__X = {S, A, DB, VIEWS, ROLES, PEO, ATABS, ITEMS4, canNav, go, abrir, render:() => render(), exportRows};
