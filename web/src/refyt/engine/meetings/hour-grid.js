// Refyt · v5.22: la rejilla por horas de Meetings es el calendario semanal de Tasks y Assessment bookings.
import {
  BKST, D0, DSH, H0, H1, HH, PEO, RN, S, TODAY, VERSIONS, addDays, bkSt, calEvts, esc, fromIso, ico,
  m2tm, monday, pName, prOf, tkCal, tkChip2, tkTone, tm2m
} from "../index.js";
/* =================== v5.22: the hour grid of Meetings is the weekly calendar for Tasks and Assessment bookings too =================== */
export function tg71(days, evs, allday){ const hrs = Array.from({length:H1 - H0}, (_, i) => H0 + i), nowM = 10 * 60 + 42, cols = `58px repeat(${days.length}, minmax(120px, 1fr))`;
  const lane = es => { const s = es.slice().sort((a, b) => a.t0 - b.t0), ends = []; s.forEach(e => { let i = ends.findIndex(x => x <= e.t0); if(i < 0){ i = ends.length; ends.push(0); } ends[i] = e.t0 + e.dur; e.l = i; }); s.forEach(e => { e.n = ends.length; }); return s; };
  return `<div class="rf-tgw tg71"><div class="rf-tgh" style="grid-template-columns:${cols}"><div></div>${days.map(d => `<div class="${d === TODAY ? 'today' : ''}"><small>${DSH[fromIso(d).getDay()]}</small><b>${fromIso(d).getDate()}</b></div>`).join('')}</div>`
    + (allday ? `<div class="tg71-ad" style="grid-template-columns:${cols}"><div class="tg71-adl">No time</div>${days.map(d => `<div class="tg71-adc${d === TODAY ? ' today' : ''}" data-date="${d}">${allday.filter(e => e.d === d).map(e => e.chip).join('')}</div>`).join('')}</div>` : '')
    + `<div class="rf-tg"><div class="rf-tgb" style="height:${(H1 - H0) * HH}px;grid-template-columns:${cols};min-width:${58 + days.length * 120}px"><div class="rf-tgt">${hrs.map(h => `<span style="top:${(h - H0) * HH}px">${String(h).padStart(2, '0')}:00</span>`).join('')}</div>`
    + days.map(d => `<div class="rf-tgcol${d === TODAY ? ' today' : ''}" data-d="${d}">${hrs.map(h => `<i class="rf-tgl" style="top:${(h - H0) * HH}px"></i>`).join('')}${d === TODAY ? `<i class="rf-now" style="top:${(nowM / 60 - H0) * HH}px"></i>` : ''}${lane(evs.filter(e => e.d === d).map(e => ({...e, t0:tm2m(e.h)}))).map(e => { const top = (e.t0 / 60 - H0) * HH, hgt = Math.max(22, e.dur / 60 * HH - 2), w = 100 / e.n; return `<button class="rf-tev ${e.cls}" style="top:${top}px;height:${hgt}px;left:calc(${e.l * w}% + 4px);right:auto;width:calc(${w}% - 8px)" data-act="${e.act}" data-v="${e.v}" data-tip="${esc(e.tip)}"><b>${esc(e.title)}</b><small>${esc(e.sub)}</small></button>`; }).join('')}</div>`).join('') + `</div></div></div>`; }
/* Tasks: a task with a time sits on the hour grid; one without sits in the No time row. Drag a task onto the grid to give it a time. */
/* Tasks keep their own day columns for the week (asked to go back); this hour grid version is kept for reference only */
{ const oCal = tkCal; const tkHour71 = xs => { if(S.f.tkvw !== 'week') return oCal(xs); const m0 = monday(S.f.tkc || TODAY), d7 = Array.from({length:7}, (_, i) => addDays(m0, i)), days = d7.filter((d, i) => i < 5 || xs.some(k => k.due === d));
    const sub = k => `${pName(k.who) || RN(k.r)}${k.pr ? ', ' + prOf(k.pr).ad : ''}`;
    const evs = xs.filter(k => k.h && days.includes(k.due)).map(k => ({act:'tkView', v:k.id, d:k.due, h:k.h, dur:k.dur || 30, cls:'tk71 ' + tkTone(k), title:k.t, sub:`${k.h}, ${sub(k)}`, tip:`${k.t}, ${k.h}, ${sub(k)}. Drag to move it.`}));
    const ad = xs.filter(k => !k.h && days.includes(k.due)).map(k => ({d:k.due, chip:tkChip2(k)}));
    return `<div class="tg71-note">${ico('info', 13)}Tasks without a time sit in the first row. Drag one onto the hours to give it a time, or to another day to move it.</div>` + tg71(days, evs, ad); }; }
/* Assessment bookings: each visit on the hour grid, 90 minutes, coloured by where it stands */
export const BKT71 = {booked:'bk-b', revisit:'bk-r', review:'bk-v', done:'bk-d'};
export function bkWeek71(){ const mon = addDays(D0, (S.f.bko || 0) * 7), days = Array.from({length:5}, (_, i) => addDays(mon, i));
  const evs = calEvts().filter(p => days.includes(p.b.on)).map(p => { const k = bkSt(p), lab = BKST.find(x => x[0] === k)[1], who = PEO[p.b.who] ? PEO[p.b.who].n : ''; return {act:'prRet', v:p.id, d:p.b.on, h:p.b.h || '09:00', dur:p.b.dur || 90, cls:BKT71[k] || 'bk-b', title:p.ad, sub:`${p.b.h || '09:00'} to ${m2tm(tm2m(p.b.h || '09:00') + (p.b.dur || 90))}, ${who}, ${lab}`, tip:`${p.ad}, ${who}, ${lab}. Drag to another day or hour to move it.`}; });
  return tg71(days, evs, null); }
document.addEventListener('mousedown', e => { if(e.target.closest && e.target.closest('.tg71 .rf-tgcol')) e.stopPropagation(); }, true);
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.21') v.url = 'https://claude.ai/artifact/VgpWP9tFejg9fkZYu6Mtdr'; } });
VERSIONS.push({v:'v5.22', date:TODAY, major:false, current:true, url:null, title:'Assessment bookings on the weekly hour grid', sum:'Assessment bookings uses the Meetings hour grid for its week; visits sit at their time and can be dragged to another day or hour. Tasks keep their day columns.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.22') v.url = 'https://claude.ai/artifact/PC7bVkR9iZQgGxxkGcwjT5'; } });
VERSIONS.push({v:'v5.23', date:TODAY, major:false, current:true, url:null, title:'Forms in the Apple style', sum:'Forms use neutral segmented controls with a white selected thumb, system blue for the selected date and confirmations, and a red asterisk instead of the Required label.', steps:[]});
