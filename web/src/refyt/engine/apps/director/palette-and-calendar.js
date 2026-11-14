// Refyt · v3.27: paleta nueva y una sola forma de mostrar un calendario.
// Copia del original ("Refyt, demo v3.27.html"), con el mismo código.
import {
  $, DSH, MSH, RN, S, TODAY, VERSIONS, VIEWS, addDays, esc, fmtDy, fromIso, go, iso, monday, nx,
  pName, plural, prOf, seg, setTkCal, sum, tkCal, tkList, tkOver, tkTone
} from "../../index.js";
/* =================== v3.27: the new palette, and one way to show a calendar =================== */
/* Palette: REFYT navy #16306E and blue #1E3A8A for the brand; Delft blue #1D2A62, Carolina blue #87AECE, Beige #F5F3D8, Pistachio #AFD06E and Fern green #43711B for the rest, on a white background.
   Calendars: every calendar uses the same bar (List, Week, Month, then Previous, Today, Next) and the same month grid.
   Things with a time (meetings) use the hour grid in Week; things with only a date (tasks, assessment bookings) use the day list. */
export const tkCalBar = vw => { const wk = vw === 'week', mo = vw === 'month';
  return `<div class="rf-bar cal-bar">${seg('tkvw', vw, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}${wk || mo ? `${nx('tkcn', '-1', wk ? 'Previous week' : 'Previous month', 'sec')}${nx('tkcn', '0', 'Today', 'sec')}${nx('tkcn', '1', wk ? 'Next week' : 'Next month', 'sec')}<span class="cal-lg"><i class="rf-chip xod"></i>Overdue<i class="rf-chip xtd"></i>Due today<i class="rf-chip xop"></i>Open<i class="rf-chip xmt"></i>Meeting action point<i class="rf-chip xdn"></i>Done</span>` : ''}</div>`; };
export const tkChip2 = k => `<button class="rf-chip ${tkTone(k)}" data-act="tkView" data-v="${k.id}" data-tt="${esc(k.t)}, ${esc(pName(k.who) || RN(k.r))}"><b>${esc(k.t)}</b><small>${esc(pName(k.who) || RN(k.r))}${k.pr ? ', ' + esc(prOf(k.pr).ad) : ''}</small></button>`;
setTkCal(xs => { const wk = S.f.tkvw === 'week', base = S.f.tkc || TODAY, by = {}; xs.forEach(k => { (by[k.due] = by[k.due] || []).push(k); }); const srt = ks => ks.slice().sort((a, b) => a.done - b.done || tkOver(b) - tkOver(a));
  if(wk){ const m0 = monday(base), days = Array.from({length:7}, (_, i) => addDays(m0, i)).filter((d, i) => i < 5 || (by[d] || []).length);
    return `<div class="rf-cal cw"><div class="rf-calh">Week of ${fmtDy(m0)}</div><div class="rf-wg" style="grid-template-columns:repeat(${days.length}, minmax(140px, 1fr))">${days.map(d => { const ks = srt(by[d] || []), dd = fromIso(d);
      return `<div data-date="${d}" class="rf-wd${d === TODAY ? ' today' : ''}"><div class="rf-wdh"><b>${DSH[dd.getDay()]} ${dd.getDate()}</b><small>${MSH[dd.getMonth()]}${d === TODAY ? ', today' : ''}</small></div>${ks.map(tkChip2).join('') || '<small class="rf-free">No tasks</small>'}<small class="rf-load">${plural(ks.filter(k => !k.done).length, 'open task', 'open tasks')}</small></div>`; }).join('')}</div></div>`; }
  const f = fromIso(base); f.setDate(1); const y = f.getFullYear(), mo = f.getMonth(), start = monday(iso(f)), cells = Array.from({length:42}, (_, i) => addDays(start, i)), rows = Math.ceil(((f.getDay() + 6) % 7 + new Date(y, mo + 1, 0).getDate()) / 7);
  return `<div class="rf-cal cm"><div class="rf-calh">${MSH[mo]} ${y}</div><div class="rf-mg">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="rf-mdh">${d}</div>`).join('')}${cells.slice(0, rows * 7).map(d => { const ks = srt(by[d] || []), dd = fromIso(d);
    return `<div data-date="${d}" class="rf-md${dd.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' today' : ''}"><small>${dd.getDate()}</small>${ks.slice(0, 3).map(tkChip2).join('')}${ks.length > 3 ? `<button class="rf-more" data-act="tkDay" data-v="${d}">+${ks.length - 3} more</button>` : ''}</div>`; }).join('')}</div></div>`; });
{ const f = VIEWS.dir.pages.tasks; VIEWS.dir.pages.tasks = (...x) => { const vw = S.f.tkvw || 'list'; S.f.tkvw = 'list'; let h; try { h = f(...x); } finally { S.f.tkvw = vw; }
    h = h.replace(/<div class="seg2 um-seg">(?:(?!<\/div>)[\s\S])*?data-act="tkvw"[\s\S]*?<\/div>/, '');
    const i = h.indexOf('<div class="rf-tw">'); if(i < 0) return h;
    return h.slice(0, i) + tkCalBar(vw) + (vw === 'list' ? h.slice(i) : tkCal(tkList())); }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/T54n1L3hYAxV499m7UBRCj'; } });
VERSIONS.push({v:'v3.27', date:TODAY, major:false, current:true, url:null, title:'New palette, and one calendar style', sum:'The app takes the new palette on a white background: dark green menu and header, midnight green for links and charts, moss and rosy brown as accents. Every calendar uses the same bar and the same month grid.', steps:[
  {t:'The new palette', min:.5, dolor:'Before, the app was navy on a grey background.', show:['White background everywhere; the menu and the header in dark green, the current item in white.', 'Key figures with a soft accent; charts in midnight and moss green.'], say:'Calmer, and the important things stand out.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
  {t:'One way to show a calendar', min:.5, dolor:'Before, tasks, meetings and bookings each had their own calendar.', show:['List, Week and Month, then Previous, Today and Next, in the same place everywhere.', 'Meetings, which have a time, use the hour grid; tasks and bookings, which only have a date, use the day list.'], say:'Learn one calendar, use it everywhere.', go:() => { S.role = 'dir'; S.trail = null; S.f.tkv3 = 'all'; S.f.tkvw = 'month'; go('dir', 'tasks'); }},
]});
