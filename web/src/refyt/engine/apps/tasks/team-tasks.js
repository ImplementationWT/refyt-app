// Refyt · Tareas por equipo.
import {
  A, APPS, AU, DB, HOME, LAPPS, RN, RP, S, TODAY, VIEWS, addDays, allowed, autoPage, btns, cell, dDiff,
  empty, esc, fmtD, fmtDy, grpH, mtgPage, nx, oph, pageAct, pill, rdiv, render, sbItem, sbar, seg,
  stat, th
} from "../../index.js";
[['Match October supplier invoices to orders', 'acc', 2, 'Job PR-2003'], ['Chase Medway Council for Saxton Street', 'acc', -2, 'Monday team meeting'], ['Review the Dane Road design pack', 'dap', 1, 'Job PR-2008'], ['Book the first Waverley assessments', 'sad', 4, 'Thursday follow up'], ['Price the windows variation, Fencepiece Road', 'com', 2, 'Job PR-2020'], ['Confirm the scaffold date, Manford Way', 'inc', 1, 'Job PR-2021'], ['Send the Tuesday margin pack', 'dir', 1, 'Tuesday directors']].forEach(([t, r, d, src]) => DB.tk.push({id:'TK-' + (++DB.seq.tk), t, r, due:addDays(TODAY, d), src, done:false}));
export const firstApp = () => (APPS.find(([k]) => k !== 'tsk' && allowed(k)) || ['tsk'])[0];
export const teamOf = r => r === 'dir' ? 'dir' : (Object.keys(LAPPS).find(a => LAPPS[a].roles.includes(r)) || 'tsk');
export const tkSt = k => k.done ? pill('tg', 'Done') : dDiff(k.due) < 0 ? pill('tred', 'Overdue') : pill('tk', 'Open');
export const tkSrc = k => k.src.startsWith('Job ') ? `<button class="lnk4" data-act="prOpen" data-v="${k.src.slice(4)}">From job ${k.src.slice(4)}</button>` : `From ${esc(k.src)}`;
export const tkRow = k => rdiv(`<div class="mbc" style="flex:3"><b>${esc(k.t)}</b><small>${tkSrc(k)}</small></div>` + cell(RN(k.r), RP(k.r), 1.4) + `<div class="mbc"><b${!k.done && dDiff(k.due) < 0 ? ' class="rf-od"' : ''}>${fmtDy(k.due)}</b><small>${k.done ? '' : fmtD(k.due)}</small></div>` + `<div class="mbc"><b>${tkSt(k)}</b><small></small></div>` + btns(k.done ? '' : nx('tkDone', k.id, 'Mark done', 'sec')), !k.done && dDiff(k.due) < 0);
export const tkHead = () => th(cell('Task', 'Created from', 3) + cell('Owner', '', 1.4) + cell('Due', '') + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>');
export function teamTasks(app){ const xs = DB.tk.filter(k => teamOf(k.r) === app), op = xs.filter(k => !k.done).sort((a, b) => a.due < b.due ? -1 : 1), dn = xs.filter(k => k.done);
  return oph('Tasks', `${LAPPS[app].team}: tasks from the weekly meetings and from jobs, with owner, due date and status. Overdue first.`, nx('tkNew', '', 'Add a task')) + `<div class="cstats">${stat('tk', 'Open', op.length)}${stat(op.some(k => dDiff(k.due) < 0) ? 'tred' : 'tg', 'Overdue', op.filter(k => dDiff(k.due) < 0).length)}${stat('tk', 'Due this week', op.filter(k => dDiff(k.due) >= 0 && dDiff(k.due) <= 7).length)}</div>` + tkHead() + (op.length ? op.map(tkRow).join('') : empty('Nothing open for this team.')) + (dn.length ? grpH('Done', dn.length) + dn.map(tkRow).join('') : ''); }
export function allTasks(){ const tm = S.f.ttm || '', xs = DB.tk.filter(k => !tm || teamOf(k.r) === tm).sort((a, b) => (a.done - b.done) || (a.due < b.due ? -1 : 1));
  return oph('All tasks by team', 'Every team’s tasks in one view, from meetings and from jobs. Filter by team.', nx('tkNew', '', 'Add a task')) + `<div class="rf-bar">${seg('ttm', tm, [['', 'All teams', DB.tk.filter(k => !k.done).length], ...APPS.filter(a => a[0] !== 'tsk').map(([k, n]) => [k, n, DB.tk.filter(t => !t.done && teamOf(t.r) === k).length])])}</div>` + tkHead() + xs.map(tkRow).join(''); }
A.ttm = el => { S.f.ttm = el.dataset.v; render(); };
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side, act = pageAct(a), anc = `<button class="nav" data-act="${act}" data-v="auto"`;
  VIEWS[a].side = () => o().replace(anc, sbItem(S.page[a], act)(['tasks', 'Tasks', 'todo', DB.tk.filter(k => !k.done && teamOf(k.r) === a).length, DB.tk.some(k => !k.done && teamOf(k.r) === a && dDiff(k.due) < 0) ? 2 : 1]) + anc);
  VIEWS[a].pages.tasks = () => teamTasks(a); });
HOME.tsk = 'mon'; S.page.tsk = 'mon';
VIEWS.tsk = {side:() => sbar([['-', 'Meetings'], ['mon', 'Monday meeting', 'cal'], ['thu', 'Thursday meeting', 'cal'], ['-', 'Tasks'], ['all', 'All tasks by team', 'list', DB.tk.filter(k => !k.done).length, 1], AU], S.page.tsk, pageAct('tsk')), pages:{mon:() => mtgPage('mon'), thu:() => mtgPage('thu'), all:allTasks, auto:() => autoPage('tsk')}};
