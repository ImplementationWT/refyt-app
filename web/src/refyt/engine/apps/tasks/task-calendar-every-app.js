// Refyt · My tasks como el del Director en todas las apps: tres filtros y el calendario.
// No viene de la demo: lleva a Commercial, Accounts, Retrofit y Delivery lo que v3.25 a v3.27 hacen en
// My tasks del Director (My tasks, All team tasks y Meeting action points; Lista, Semana y Mes).
// En cada app, "All team tasks" son solo las tareas de su equipo.
import {
  DB, LAPPS, ME, S, TKV, TK_KEEP, VERSIONS, VIEWS, go, seg, teamOf, tkArch, tkCal, tkCalBar, tkIsMt
} from "../../index.js";

export const TK_APPS = ['com', 'acc', 'ret', 'del'];
/* La tarea es del equipo de la app, no está archivada y entra en el filtro elegido */
export const tkInApp = (a, v, k) => teamOf(k.r) === a && !tkArch(k) && (v === 'mine' ? k.who === ME() : v === 'mt' ? tkIsMt(k) : true);

TK_APPS.forEach(a => { const f = VIEWS[a].pages.tasks; VIEWS[a].pages.tasks = (...x) => {
    const v = S.f.tkv3 || 'mine', vw = S.f.tkvw || 'list', all = DB.tk;
    S.f.tkm = v === 'mine' ? 'mine' : 'all'; S.f.tkf = 'open';
    DB.tk = all.filter(k => !tkArch(k) && (v !== 'mt' || tkIsMt(k)));
    let h; try { h = f(...x); } finally { DB.tk = all; }
    h = h.replace(`${LAPPS[a].team}: tasks from the Monday and Thursday meetings and from jobs.`, `${LAPPS[a].team}: your tasks, the team’s and the meeting action points, as a list or on a calendar.`);
    h = h.replace(/<div class="rf-bar">[\s\S]*?<\/div>(?=<div class="rf-tw">)/, `<div class="rf-bar tk-bar">${seg('tkv3', v, TKV.map(([k, n]) => [k, n, all.filter(t => !t.done && tkInApp(a, k, t)).length]))}</div>`);
    h = h.replace(/<button class="stat sbtn ([^"]*)" aria-pressed="[^"]*" data-act="tkf" data-v="[^"]*">([\s\S]*?)<\/button>/g, '<div class="stat $1">$2</div>').replace(/<span class="ss">filtering the list<\/span>/g, '');
    h = h.replace(/(<button class="rf-dtg"[\s\S]*?<\/button>)/, `$1<small class="tk-arch">Done tasks are cleared automatically ${TK_KEEP} days after they are completed.</small>`);
    const i = h.indexOf('<div class="rf-tw">'); if(i < 0) return h;
    return h.slice(0, i) + tkCalBar(vw) + (vw === 'list' ? h.slice(i) : tkCal(all.filter(k => tkInApp(a, v, k)))); }; });

/* Un paso más en el recorrido de v3.27 */
VERSIONS[VERSIONS.length - 1].steps.push({t:'My tasks on a calendar, in every app', min:.5, dolor:'Before, only the Director had the calendar in My tasks.', show:['Commercial, Accounts, Retrofit and Delivery: My tasks, All team tasks and Meeting action points.', 'List, Week and Month, the same as in the Director app.'], say:'Every team plans its week the same way.', go:() => { S.role = 'sad'; S.trail = null; S.f.tkv3 = 'all'; S.f.tkvw = 'month'; go('ret', 'tasks'); }});
