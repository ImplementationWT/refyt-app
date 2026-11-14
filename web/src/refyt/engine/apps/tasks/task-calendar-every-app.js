// Refyt · v3.28: My tasks como calendario en todas las apps (Commercial, Accounts, Retrofit y Delivery),
// con My tasks y Meeting action points; y la entrada v3.28 del historial de versiones.
import {
  DB, ME, S, TKV, TODAY, VERSIONS, VIEWS, go, seg, teamOf, tkArch, tkCal, tkCalBar, tkIsMt
} from "../../index.js";

/* Blue stays the brand: header, menu, main buttons. Accents: Delft blue #1D2A62, Carolina blue #87AECE, Beige #F5F3D8,
   Pistachio #AFD06E, Fern green #43711B, on a white background. My tasks works the same in every app. */
const tkListA = app => { const v = S.f.tkv3 || 'mine', team = k => app === 'dir' || teamOf(k.r) === app;
  return DB.tk.filter(k => !tkArch(k) && (v === 'mine' ? k.who === ME() : v === 'mt' ? tkIsMt(k) && team(k) : team(k))); };
['com', 'acc', 'ret', 'del'].forEach(a => { const f = VIEWS[a].pages.tasks; if(!f) return;
  VIEWS[a].pages.tasks = (...x) => { const all = DB.tk, v = S.f.tkv3 || 'mine', vw = S.f.tkvw || 'list', team = k => teamOf(k.r) === a;
    S.f.tkm = v === 'mine' ? 'mine' : 'all'; S.f.tkf = 'open';
    DB.tk = all.filter(k => !tkArch(k) && (v !== 'mt' || tkIsMt(k)));
    let h; try { h = f(...x); } finally { DB.tk = all; }
    const n = k => all.filter(t => !t.done && !tkArch(t) && (k === 'mine' ? t.who === ME() : k === 'mt' ? tkIsMt(t) && team(t) : team(t))).length;
    h = h.replace(/<div class="rf-bar">[\s\S]*?<\/div>(?=<div class="rf-tw">)/, `<div class="rf-bar tk-bar">${seg('tkv3', v, TKV.map(([k, l]) => [k, l, n(k)]))}</div>`);
    h = h.replace(/<button class="stat sbtn ([^"]*)" aria-pressed="[^"]*" data-act="tkf" data-v="[^"]*">([\s\S]*?)<\/button>/g, '<div class="stat $1">$2</div>').replace(/<span class="ss">filtering the list<\/span>/g, '');
    if(!/class="rf-bar tk-bar"/.test(h)){ const j = h.indexOf('<div class="rf-tw">'); if(j > 0) h = h.slice(0, j) + `<div class="rf-bar tk-bar">${seg('tkv3', v, TKV.map(([k, l]) => [k, l, n(k)]))}</div>` + h.slice(j); }
    const i = h.indexOf('<div class="rf-tw">'); if(i < 0) return h;
    return h.slice(0, i) + tkCalBar(vw) + (vw === 'list' ? h.slice(i) : tkCal(tkListA(a))); }; });

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/9sjZc1mgc2zEvGL4PrNsPb'; } });
VERSIONS.push({v:'v3.28', date:TODAY, major:false, current:true, url:null, title:'REFYT blue, new accents, and My tasks as a calendar everywhere', sum:'The REFYT blue is back for the header, menu and main buttons; Delft blue, Carolina blue, Pistachio, Fern green and Beige are the accents on a white background. My tasks in every app has the three filters and the week and month calendar.', steps:[
  {t:'REFYT blue with new accents', min:.5, dolor:'Before, the green palette replaced the REFYT blue.', show:['Header, menu and main buttons in REFYT blue, on white.', 'Key figures, charts, tags and calendars in Delft blue, Carolina blue, Pistachio and Fern green.'], say:'The brand stays; the accents make it easier to read.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
  {t:'My tasks, the same in every app', min:.5, dolor:'Before, only the Director had the calendar and the three filters.', show:['My tasks, All team tasks and Meeting action points in every app; All team tasks shows that app’s team.', 'List, Week and Month, like Meetings.'], say:'One way to see tasks, wherever you are.', go:() => { S.role = 'inc'; S.trail = null; S.f.tkv3 = 'all'; S.f.tkvw = 'week'; go('del', 'tasks'); }},
]});

