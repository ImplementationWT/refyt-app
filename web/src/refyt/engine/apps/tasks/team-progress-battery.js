// Refyt · v5.37: All tasks by team: una batería de avance por equipo.
import {
  APPS, DB, S, TEAM69, TODAY, VERSIONS, dDiff, esc, ico, tkArch, wrapRender
} from "../../index.js";
/* =================== v5.37: All tasks by team: a progress battery per team =================== */
export function bat87(){ const op = document.querySelector('#a-tsk .op'); if(!op || !op.offsetParent || op.querySelector('.bt87')) return; const h = op.querySelector('.op-h'); if(!h) return;
  const tks = DB.tk.filter(k => !tkArch || !tkArch(k)), cur = S.f.ttm || '';
  const teams = [['', 'All teams'], ...APPS.filter(a => a[0] !== 'tsk').map(a => [a[0], a[1]])].map(([k, n]) => { const xs = k ? tks.filter(t => TEAM69(t.r) === k) : tks, d = xs.filter(t => t.done).length, od = xs.filter(t => !t.done && dDiff(t.due) < 0).length, op2 = xs.length - d - od; return {k, n, tot:xs.length, d, od, op:op2, pct:xs.length ? Math.round(d / xs.length * 100) : 0}; }).filter(t => t.tot || !t.k);
  const cell = t => { const w = x => (t.tot ? x / t.tot * 100 : 0).toFixed(1), col = t.pct >= 70 ? '#10B981' : t.pct >= 40 ? '#F59E0B' : '#EF4444';
    return `<button type="button" class="bt87-c${cur === t.k ? ' on' : ''}" data-act="ttm" data-v="${t.k}" title="${esc(`${t.n}: ${t.d} done, ${t.op} open, ${t.od} overdue`)}"><div class="bt87-h"><b>${esc(t.n)}</b><em style="color:${col}">${t.pct}%</em></div><div class="bt87-b" aria-label="${t.pct}% done"><span class="bt87-f"><i style="width:${w(t.d)}%;background:#10B981"></i><i style="width:${w(t.op)}%;background:#93C5FD"></i><i style="width:${w(t.od)}%;background:#F97316"></i></span><span class="bt87-cap"></span></div><small>${t.d} done · ${t.op} open · ${t.od} overdue</small></button>`; };
  h.insertAdjacentHTML('afterend', `<section class="rsec q54-c bt87"><div class="q54-ch"><h3>${ico('chart', 17)}Team progress</h3><div class="q54-leg" style="margin:0"><span><i style="background:#10B981"></i>Done</span><span><i style="background:#93C5FD"></i>Open</span><span><i style="background:#F97316"></i>Overdue</span></div></div><div class="bt87-g">${teams.map(cell).join('')}</div></section>`); }
{ wrapRender(r87 => (...x) => { const o = r87(...x); try { bat87(); } catch(e) { console.warn(e); } return o; }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.36') v.url = 'https://claude.ai/artifact/QwNuQFLTW3UAcQstvr1WdJ'; } });
VERSIONS.push({v:'v5.37', date:TODAY, major:false, current:true, url:null, title:'Team progress batteries', sum:'All tasks by team opens with a progress battery per team: done in green, open in blue and overdue in orange, with the percentage done; clicking a battery shows that team.', steps:[]});
