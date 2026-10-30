// Refyt · Tareas y reuniones.
import {
  A, DB, MODALS, OPENP, RN, ROLES, RP, S, approvals, btns, cell, dDiff, esc, fld, fm, fmtD, grpH,
  isBlocked, late, mfoot, mgTag, mlab, modal, mseg, nx, oph, pill, prsOf, rdiv, render, renderLayer,
  scMoney, seg, stat, sum, th, toast
} from "../../index.js";
export function tkPage(){ return oph('Tasks', 'Tasks from the weekly meetings and from jobs, by role.', nx('tkNew', '', 'Add a task')) + th(cell('Task', 'From', 3) + cell('Owner', '') + cell('Due', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + DB.tk.slice().sort((a, b) => a.due < b.due ? -1 : 1).map(k => rdiv(cell(esc(k.t), k.src, 3) + cell(RN(k.r), RP(k.r)) + `<div class="mbc"><b>${k.done ? pill('tg', 'Done') : dDiff(k.due) < 0 ? pill('tred', fmtD(k.due)) : fmtD(k.due)}</b><small></small></div>` + btns(k.done ? '' : nx('tkDone', k.id, 'Mark done', 'sec')))).join(''); }
A.tkDone = el => { DB.tk.find(k => k.id === el.dataset.v).done = true; render(); toast('Done.'); };
A.tkNew = () => { S.modal = {k:'tk', t:'', r:'', d:''}; renderLayer(); };
MODALS.tk = m => modal('Add a task', 'With an owner role and a due date.', fld('Task', 'm', 't', m.t, {req:true, ph:'e.g. Send Waverley archetype list'}) + mlab('Owner', true) + mseg('r', m.r, Object.entries(ROLES).map(([k, [n]]) => [k, n])) + fld('Due', 'm', 'd', m.d, {type:'date', req:true}), mfoot('Add task', 'tkOk', m.t.trim() && m.r && m.d), 600);
A.tkOk = () => { const m = S.modal; DB.tk.push({id:'TK-' + (++DB.seq.tk), t:m.t.trim(), r:m.r, due:m.d, src:'Meeting', done:false}); S.modal = null; render(); toast('Task added.'); };
export function repPage(){ const w = S.f.mt || 'mon', xs = DB.tk.filter(k => !k.done);
  const sch = DB.sc.map(s => { const ps = prsOf(s.id); return rdiv(cell(s.n, s.cl, 2) + OPENP.map(ph => cell(ps.filter(p => p.ph === ph).length, ph.slice(0, 1))).join('') + cell(ps.filter(p => isBlocked(p) || late(p)).length, 'blocked or late')); }).join('');
  return oph('Meeting reports', 'Run the meetings from here: Monday and Thursday for the whole team with no money, Tuesday for the directors.') + `<div class="rf-bar">${seg('mt', w, [['mon', 'Monday, team'], ['thu', 'Thursday, follow up'], ['tue', 'Tuesday, directors']])}</div>`
    + (w === 'mon' ? grpH('Progress per scheme', DB.sc.length) + sch + grpH('Tasks due this week', xs.filter(k => dDiff(k.due) <= 7).length) + xs.filter(k => dDiff(k.due) <= 7).map(k => rdiv(cell(esc(k.t), RN(k.r), 3) + cell(fmtD(k.due), ''))).join('')
      : w === 'thu' ? grpH('Actions and tasks', xs.length) + xs.map(k => rdiv(cell(esc(k.t), k.src, 3) + cell(RN(k.r), RP(k.r)) + cell(fmtD(k.due), ''))).join('')
      : `<div class="cstats">${stat('tv', 'Approvals waiting', approvals().length)}${stat('to', 'Owed to us', fm(sum(DB.sc, s => scMoney(s).owed)))}${stat('tk', 'Owed by us', fm(sum(DB.sc, s => scMoney(s).sup)))}${stat('ta', 'Variations and extra costs', fm(sum(DB.va, v => v.amt)))}</div>` + grpH('Margin per scheme', DB.sc.length) + DB.sc.map(s => { const m = scMoney(s); return rdiv(cell(s.n, `target ${s.set.mg}%`, 2) + cell(fm(m.won), 'won') + `<div class="mbc"><b>${m.won ? mgTag(m.mgp, s.set.mg) : ''}</b><small></small></div>`); }).join('')); }
A.mt = el => { S.f.mt = el.dataset.v; render(); };
