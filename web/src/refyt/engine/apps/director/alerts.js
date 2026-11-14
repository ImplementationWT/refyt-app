// Refyt · Director: alertas y aprobaciones.
import {
  A, ATABS, DB, LIMIT, ME, MEAS, MODALS, PEO, PHOWN, RN, ROLES, RP, S, TODAY, VERSIONS, VIEWS, addDays,
  alerts, area, auto, av, cell, dDiff, daysIn, empty, esc, fld, fm, fmtDy, go, grpH, his, ico, mMoney,
  mfoot, mlab, modal, nx, oAl, oph, ordOf, pMoney, pc, pend, phGate, pill, prOf, rdiv, render,
  renderLayer, roleOfP, scOf, th, toast, vaOf
} from "../../index.js";
S.dis = {};
export const alProp = a => { const m = (a.t || '').match(/PR-\d+/); return m ? prOf(m[0]) : null; };
/* What is happening, what blocks it, and who should act */
export function alWhy(a){ const p = alProp(a); if(!p) return null; const sc = scOf(p.sc);
  if(a.k === 'Margin below target'){ const m = pMoney(p), lows = p.ms.map(x => [x, mMoney(p, x)]).sort((x, y) => x[1].mgp - y[1].mgp), w = lows[0];
    return {p, what:`Forecast margin ${pc(m.mgp)} against ${sc.n}’s ${sc.set.mg}% target: ${fm(m.q)} quoted, ${fm(m.fc)} forecast cost.`, block:[`${MEAS[w[0].m].n}: forecast ${fm(w[1].fc)} against a budget of ${fm(w[1].b)}${w[1].over ? ', over budget' : ''}`, ...vaOf(p.id).filter(v => v.st !== 'Rejected').map(v => `${v.ty} ${v.id}: ${v.why}, ${fm(v.amt)}, ${v.st.toLowerCase()}`), ...ordOf(p.id).filter(o => o.ct === 'Other' && o.st !== 'Rejected').map(o => `${o.id} ${o.sup}: ${fm(oAl(o, p.id))} not in the original budget`)],
      ask:['Ask Commercial to review', ROLES.com[1], `Review the margin on ${p.ad}`, `The forecast margin on ${p.ad} is ${pc(m.mgp)} against our ${sc.set.mg}% target. Please review the costs and the open variation and come back with options: recover it through the variation, cut cost, or accept it.`], tab:'mon'}; }
  if(a.k === 'Over time'){ const g = phGate(p), inv = DB.inv.find(v => v.pr === p.id && !v.paid), pay = inv && g.miss.includes('Payment received'), hold = p.hold || p.hold2, role = pay ? 'acc' : PHOWN[p.ph];
    const block = g.miss.map(x => x === 'Payment received' && inv ? `Payment received: ${inv.id}, ${fm(inv.amt)}, ${dDiff(inv.due) < 0 ? `${-dDiff(inv.due)} days overdue` : `due ${fmtDy(inv.due)}`} with ${sc.cl}` : x).concat(hold ? [hold] : []);
    return {p, what:`${daysIn(p)} days in ${p.ph}, against a limit of ${LIMIT[p.ph]}. Owner of the phase: ${RN(PHOWN[p.ph])}, ${RP(PHOWN[p.ph])}.`, block,
      ask:[pay ? 'Ask Accounts to chase the payment' : `Ask ${RP(role)} for an update`, ROLES[role][1], pay ? `Chase ${inv.id} with ${sc.cl}` : `Unblock ${p.ad}`, pay ? `${inv.id} for ${p.ad} is ${-dDiff(inv.due)} days overdue with ${sc.cl}. Please chase it this week and tell me the date they commit to pay.` : `${p.ad} has been ${daysIn(p)} days in ${p.ph}. What is blocking it, and what do you need to move it this week?`], tab:pay ? 'res' : 'res'}; }
  return null; }
export function alertsPage(){ const xs = pend('dir'), done = Object.entries(S.dis);
  return oph('Alerts', 'Things that are going wrong and need a decision from you: margins below target and jobs over their time limit. Approvals are in Approvals.') + (xs.length ? xs.map(a => { const w = alWhy(a);
    return `<div class="ds-exc c-${a.tone} rf-al2${S.hl === a.id ? ' hl2' : ''}" data-hl="${a.id}"><div class="ds-exh">${pill(a.tone, a.k)}<b>${esc(a.t)}</b><span>${w ? scOf(w.p.sc).n : ''}</span></div><p>${esc(w ? w.what : a.d)}</p>${w && w.block.length ? `<div class="rf-blk"><small class="rf-ph">What is blocking it</small>${w.block.map(b => `<div>${ico('alert', 13)}<span>${esc(b)}</span></div>`).join('')}</div>` : ''}<div class="ds-exb">${w ? `<button class="btn pri sm" data-act="postAsk" data-v="${a.id}">${ico('send', 13)}${w.ask[0]}</button><button class="btn sec sm" data-act="postOpen" data-v="${w.p.id}">Post an update</button>` : ''}<button class="btn sec sm" data-act="alAccept" data-v="${a.id}">Accept, with a reason</button>${w ? `<button class="btn sec sm" data-act="prOpen" data-v="${w.p.id}|${w.tab}">Open the property</button>` : `<button class="btn sec sm" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button>`}</div></div>`; }).join('') : empty('Nothing needs a decision right now.'))
    + (done.length ? grpH('Accepted', done.length) + done.map(([id, x]) => rdiv(cell(esc(x.t), `${x.k}: ${esc(x.why)}`, 3) + cell(fmtDy(x.on), PEO[x.by].n))).join('') : ''); }
A.alAccept = el => { const a = alerts().find(x => x.id === el.dataset.v); S.modal = {k:'acc8', id:a.id, t:a.t, kk:a.k, why:''}; renderLayer(); };
MODALS.acc8 = m => modal('Accept the alert', `${esc(m.t)}: ${m.kk}. It leaves Alerts and your reason goes on the property’s history.`, area('Why you accept it', 'm', 'why', m.why, 'e.g. Margin recovered through the variation once Kanopi approves it', true), mfoot('Accept', 'accOk8', !!(m.why || '').trim()), 560);
A.accOk8 = () => { const m = S.modal; S.dis[m.id] = {t:m.t, k:m.kk, why:m.why.trim(), by:ME(), on:TODAY}; const p = prOf((m.t.match(/PR-\d+/) || [])[0]); if(p) his(p, `${PEO[ME()].n} accepted the alert “${m.kk}”: ${m.why.trim()}`, ME()); S.modal = null; render(); toast('Accepted. It moves to the Accepted list.'); };

/* Updates: a thread on every property; a post can create the task for the person who must act */
A.postAsk = el => { const a = alerts().find(x => x.id === el.dataset.v), w = alWhy(a); S.modal = {k:'post8', pr:w.p.id, to:[w.ask[1]], tt:w.ask[2], t:w.ask[3], task:true, d:addDays(TODAY, 4), from:a.k}; renderLayer(); };
A.postOpen = el => { const p = prOf(el.dataset.v); S.modal = {k:'post8', pr:p.id, to:[ROLES[PHOWN[p.ph]] ? ROLES[PHOWN[p.ph]][1] : 'dre'], tt:'', t:'', task:false, d:addDays(TODAY, 4), from:''}; renderLayer(); };
MODALS.post8 = m => { const p = prOf(m.pr), ok = (m.t || '').trim() && m.to.length && (!m.task || ((m.tt || '').trim() && m.d));
  return modal('Post an update', `${esc(p.ad)}, ${p.id}. Everyone mentioned is notified; the post stays in the property’s Updates.`, mlab('To', true) + `<div class="rf-ppl">${Object.entries(PEO).filter(([k]) => k !== 'kel' && k !== ME()).map(([k, x]) => `<button type="button" class="rf-pp${m.to.includes(k) ? ' on' : ''}" data-act="postTo" data-v="${k}">${av(k, 22)}<span><b>${x.n}</b><small>${x.r}</small></span></button>`).join('')}</div>` + area('Message', 'm', 't', m.t, 'What you need, and by when', true)
    + `<button type="button" class="rf-cons${m.task ? ' on' : ''}" data-act="mset" data-k="task" data-v="${m.task ? '' : '1'}"><span class="rf-ck">${m.task ? ico('check', 14, 2.6) : ''}</span>Also create a task for ${m.to.length ? PEO[m.to[0]].n : 'the first person'}</button>` + (m.task ? `<div class="rf-2">${fld('Task', 'm', 'tt', m.tt, {req:true, ph:'e.g. Chase the invoice'})}${fld('Due date', 'm', 'd', m.d, {type:'date', req:true})}</div>` : ''), mfoot('Post', 'postOk', !!ok), 680); };
A.postTo = el => { const k = el.dataset.v, w = S.modal.to; S.modal.to = w.includes(k) ? w.filter(x => x !== k) : [...w, k]; renderLayer(); };
A.postOk = () => { const m = S.modal, p = prOf(m.pr), post = {id:'UP-' + Date.now(), by:ME(), on:TODAY, t:m.t.trim(), to:[...m.to], tk:null, from:m.from};
  if(m.task){ const k = {id:'TK-' + (++DB.seq.tk), t:m.tt.trim(), desc:m.t.trim(), who:m.to[0], r:roleOfP(m.to[0]), due:m.d, src:'Job', pr:p.id, done:false, doneOn:null}; DB.tk.push(k); post.tk = k.id; }
  p.th = p.th || []; p.th.push(post); his(p, `${PEO[ME()].n} posted an update to ${m.to.map(k => PEO[k].n).join(', ')}`, ME()); S.modal = null;
  auto(p, S.view, `notified ${m.to.map(k => PEO[k].n).join(', ')}${post.tk ? ` and added the task to ${PEO[m.to[0]].n}’s My tasks` : ''}`); };
function updTab0(app, p){ const th = (p.th || []).slice().reverse();
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap"><p class="hint" style="margin:0">Posts about this property between the teams. A post can create the task for the person who must act.</p>${nx('postOpen', p.id, 'Post an update')}</div>`
    + (th.length ? th.map(u => { const k = u.tk && DB.tk.find(x => x.id === u.tk); return `<div class="rf-post">${av(u.by, 30)}<div><div class="rf-ph2"><b>${PEO[u.by].n}</b><small>${PEO[u.by].r}, ${fmtDy(u.on)}${u.from ? `, about ${u.from.toLowerCase()}` : ''}</small></div><p>${esc(u.t)}</p><div class="rf-pt">${u.to.map(x => `<span>@${PEO[x].n}</span>`).join('')}${k ? `<button class="rf-chipb" data-act="tkView" data-v="${k.id}">Task: ${esc(k.t)}, ${k.done ? 'done' : 'due ' + fmtDy(k.due)}</button>` : ''}</div></div></div>`; }).join('') : empty('No updates yet.')); }
Object.keys(ATABS).forEach(a => { const t = ATABS[a]; if(!t.some(x => x[0] === 'upd')) t.splice(t.length - 1, 0, ['upd', 'Updates']); });
/* Director: Alerts and Approvals */
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => o().replace('Needs your decision<', 'Alerts<').replace('My approvals<', 'Approvals<');
  VIEWS.dir.pages.dec = alertsPage; const ow = VIEWS.dir.pages.wait; VIEWS.dir.pages.wait = () => ow().replace('Waiting for my approval', 'Approvals'); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/4J1JiWkFjezDt6mneENwZh'; } });
VERSIONS.push({v:'v3.8', date:TODAY, major:false, current:true, url:null, title:'Director: Alerts and Approvals, and every alert ends in a decision', sum:'Director separates Approvals from Alerts. Each alert explains what is happening, what blocks it and who should act, and lets the director ask that person, post an update or accept it with a reason. Every property has an Updates thread.', steps:[
  {t:'Alerts that end in a decision', min:1, dolor:'Before, an alert led to a page with nothing to decide.', show:['2 Saxton Street: 22 days in close out because invoice INV-3302 is overdue with Medway Council.', 'Ask Accounts to chase the payment: the post creates Lana’s task.', 'Or accept the alert with a reason, kept on the property’s history.'], say:'Every alert ends in a decision or an instruction.', go:() => { S.role = 'dir'; go('dir', 'dec'); }},
]});

/* Later versions wrap or replace updTab (the original reassigns it). Kept as var: no temporal dead zone. */
var updTabW = null;
export function updTab(...x){ return (updTabW || updTab0)(...x); }
export const setUpdTab = f => { updTabW = f; };
