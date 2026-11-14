// Refyt · Retrofit: reservas de evaluaciones con calendario.
import {
  A, D0, DB, DSH, ME, MODALS, MSH, PEO, S, TODAY, VERSIONS, addDays, auto, av, btns, cell, dAt, dDiff,
  esc, fld, fmtDy, fromIso, go, grpH, his, ini, iso, mfoot, mlab, modal, nx, oph, pill, plural, prOf,
  render, renderLayer, rowO, scOf, seg, stat, tcell, th, tyOf
} from "../../index.js";
export const ASR = ['afa', 'xen'];
DB.pr.forEach((p, i) => { if(p.b.vis && !p.b.on){ p.b.on = addDays(p.phOn, -9 - (i % 6) * 2); while([0, 6].includes(fromIso(p.b.on).getDay())) p.b.on = addDays(p.b.on, -1); } if(p.b.on && !p.b.who) p.b.who = ASR[i % 2]; if(p.b.on && !p.b.h) p.b.h = ['09:00', '10:30', '12:00', '14:00', '15:30'][i % 5]; });
Object.assign(prOf('PR-2001').b, {bk:true, on:dAt(-3), h:'10:30', who:'afa'});
Object.assign(prOf('PR-2015').b, {bk:true, on:dAt(1), h:'09:00', who:'xen', revisits:1});
Object.assign(prOf('PR-2014').b, {bk:true, on:dAt(2), h:'14:00', who:'afa'}); prOf('PR-2014').his.push([dAt(-1), 'Assessment booked for Wed, Oct 28 at 14:00 with Afaq Ahmad', 'sar']);
prOf('PR-2015').his.push([dAt(-2), 'Assessment rejected: ventilation photos missing. Revisit booked, revisits 1.', 'ram']);
Object.assign(prOf('PR-2008').b, {on:dAt(-12), h:'11:00', who:'afa'});
export const BKST = [['tobook', 'To book', 'tk'], ['booked', 'Booked', 'tb'], ['revisit', 'Revisit booked', 'ta'], ['review', 'Visit done, in review', 'tb'], ['done', 'Assessed', 'tg']];
export const bkSt = p => !p.b.bk ? 'tobook' : !p.b.vis ? (p.b.revisits ? 'revisit' : 'booked') : p.b.rev !== 'Approved' ? 'review' : 'done';
export const bkList = () => DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph));
export const bkTag = p => { const s = BKST.find(x => x[0] === bkSt(p)); return pill(s[2], s[1]); };
function bkPage0(){ const v = S.f.bkv || 'list', xs = bkList();
  const head = oph('Assessment bookings', 'Every assessment, grouped by where it stands. Switch to the calendar to see each assessor’s week or the month.')
    + `<div class="cstats">${BKST.map(([k, n, t]) => stat(k === 'revisit' && xs.some(p => bkSt(p) === k) ? 'ta' : 'tk', n, xs.filter(p => bkSt(p) === k).length)).join('')}</div>`
    + `<div class="rf-bar">${seg('bkv', v, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}${v !== 'list' ? `${nx('bkNav', '-1', v === 'week' ? 'Previous week' : 'Previous month', 'sec')}${nx('bkNav', '0', 'Today', 'sec')}${nx('bkNav', '1', v === 'week' ? 'Next week' : 'Next month', 'sec')}` : ''}${seg('bka', S.f.bka || '', [['', 'Both assessors'], ...ASR.map(k => [k, PEO[k].n])])}</div>`;
  if(v === 'list') return head + `<div class="rf-tw">` + th(cell('Property', 'Scheme and reference', 2.4) + cell('Assessment', 'Assessor', 1.6) + cell('Status', '', 1.3) + cell('Revisits', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + BKST.map(([k, n]) => { const zs = xs.filter(p => bkSt(p) === k && (!S.f.bka || p.b.who === S.f.bka || !p.b.bk)).sort((a, b) => (a.b.on || '9') < (b.b.on || '9') ? -1 : 1); return zs.length ? grpH(n, zs.length) + zs.map(p => rowO('prRet', p.id, tcell('prRet', p.id, esc(p.ad), `${scOf(p.sc).n}, ${p.ref}`, 2.4) + cell(p.b.on ? `${fmtDy(p.b.on)}, ${p.b.h}` : 'Not booked', p.b.who ? PEO[p.b.who].n : '', 1.6) + `<div class="mbc" style="flex:1.3"><b>${bkTag(p)}</b><small></small></div>` + cell(p.b.revisits || '', '') + btns(k === 'tobook' ? nx('bBook', p.id, 'Book') : ['booked', 'revisit'].includes(k) ? nx('bVis', p.id, k === 'revisit' ? 'Revisit done' : 'Visit done', 'sec') + nx('bBook', p.id, 'Move', 'sec') : ''), S.hl === p.id)).join('') : ''; }).join('') + '</div>';
  return head + `<div class="rf-calw">${calView(v)}${calSide()}</div>`; }
export const calEvts = () => DB.pr.filter(p => p.b.on && p.ph !== 'Cancelled' && (!S.f.bka || p.b.who === S.f.bka));
export const evChip = p => { const k = bkSt(p); return `<button class="rf-ev ${k}" data-act="prRet" data-v="${p.id}" data-tt="${esc(p.ad)}, ${esc(PEO[p.b.who].n)}"><b>${p.b.h} ${esc(p.ad)}</b><small>${ini(PEO[p.b.who].n)}, ${BKST.find(x => x[0] === k)[1]}</small></button>`; };
export function calView(v){ const off = S.f.bko || 0, evs = calEvts();
  if(v === 'week'){ const mon = addDays(D0, off * 7), days = Array.from({length:5}, (_, i) => addDays(mon, i));
    return `<div class="rf-cal cw"><div class="rf-calh">Week of ${fmtDy(mon)}</div><div class="rf-wg">${days.map(d => { const es = evs.filter(p => p.b.on === d).sort((a, b) => a.b.h < b.b.h ? -1 : 1); return `<div data-date="${d}" class="rf-wd${d === TODAY ? ' today' : ''}"><div class="rf-wdh"><b>${DSH[fromIso(d).getDay()]} ${fromIso(d).getDate()}</b><small>${MSH[fromIso(d).getMonth()]}${d === TODAY ? ', today' : ''}</small></div>${es.map(evChip).join('') || '<small class="rf-free">No assessments</small>'}<small class="rf-load">${ASR.map(a => `${ini(PEO[a].n)} ${es.filter(p => p.b.who === a).length}`).join(', ')}</small></div>`; }).join('')}</div></div>`; }
  const base = fromIso(D0), first = new Date(base.getFullYear(), base.getMonth() + off, 1), y = first.getFullYear(), mo = first.getMonth(), start = addDays(iso(first), -((first.getDay() + 6) % 7)), cells = Array.from({length:42}, (_, i) => addDays(start, i));
  const rows = Math.ceil(((first.getDay() + 6) % 7 + new Date(y, mo + 1, 0).getDate()) / 7);
  return `<div class="rf-cal cm"><div class="rf-calh">${MSH[mo]} ${y}</div><div class="rf-mg">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="rf-mdh">${d}</div>`).join('')}${cells.slice(0, rows * 7).map(d => { const es = evs.filter(p => p.b.on === d).sort((a, b) => a.b.h < b.b.h ? -1 : 1), dt = fromIso(d); return `<div data-date="${d}" class="rf-md${dt.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' today' : ''}"><small>${dt.getDate()}</small>${es.slice(0, 3).map(evChip).join('')}${es.length > 3 ? `<button class="rf-more2" data-act="bkDay" data-v="${d}">+${es.length - 3} more</button>` : ''}</div>`; }).join('')}</div></div>`; }
export function calSide(){ const xs = bkList().filter(p => bkSt(p) === 'tobook');
  return `<aside class="rf-cals"><b>To book</b><small>${plural(xs.length, 'job waits', 'jobs wait')} for a date</small>${xs.map(p => `<div class="rf-tb"><div><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}, ${p.ref}</small></div>${nx('bBook', p.id, 'Book')}</div>`).join('') || '<small class="rf-free">Everything is booked.</small>'}<div class="rf-leg">${BKST.slice(1).map(([k, n]) => `<span><i class="rf-ev ${k}"></i>${n}</span>`).join('')}</div></aside>`; }
A.bkv = el => { S.f.bkv = el.dataset.v; S.f.bko = 0; render(); };
A.bka = el => { S.f.bka = el.dataset.v; render(); };
A.bkNav = el => { S.f.bko = el.dataset.v === '0' ? 0 : (S.f.bko || 0) + (+el.dataset.v); render(); };
A.bkDay = el => { S.f.bkv = 'week'; const d = el.dataset.v; S.f.bko = Math.floor(dDiff(d) / 7 + (fromIso(D0).getDay() === 1 ? 0 : 0)); render(); };
/* Booking: date, time and assessor in one window, with each assessor’s day */
A.bBook = el => { const p = prOf(el.dataset.v); S.modal = {k:'bk2', id:p.id, d:p.b.on && p.b.on >= TODAY ? p.b.on : '', h:p.b.h || '', who:p.b.who || ''}; renderLayer(); };
MODALS.bk2 = m => { const p = prOf(m.id), ok = m.d && (m.h || '').trim() && m.who;
  return modal(p.b.bk ? 'Move the assessment' : 'Book the assessment', `${esc(p.ad)}, ${scOf(p.sc).n}, ${p.ref}`, `<div class="rf-2">${fld('Date', 'm', 'd', m.d, {type:'date', req:true})}${fld('Time', 'm', 'h', m.h, {req:true, ph:'09:30'})}</div>` + mlab('Assessor', true) + `<div class="rf-who">${ASR.map(a => { const n = m.d ? DB.pr.filter(x => x.b.on === m.d && x.b.who === a && x.id !== p.id).length : null; return `<button type="button" class="rf-wb${m.who === a ? ' on' : ''}" data-act="mset" data-k="who" data-v="${a}">${av(a, 28)}<div><b>${PEO[a].n}</b><small>${n == null ? 'Choose a date to see the day' : `${plural(n, 'assessment', 'assessments')} that day`}</small></div></button>`; }).join('')}</div>`, mfoot(p.b.bk ? 'Move' : 'Book', 'bkOk', !!ok), 600); };
A.bkOk = () => { const m = S.modal, p = prOf(m.id), moved = p.b.bk; Object.assign(p.b, {bk:true, on:m.d, h:m.h.trim(), who:m.who}); if(tyOf(p) === 'E.ON') p.csTodo = 'Enter the assessment date in Dynamics'; his(p, `Assessment ${moved ? 'moved to' : 'booked for'} ${fmtDy(m.d)} at ${p.b.h} with ${PEO[m.who].n}`, ME()); S.modal = null; auto(p, 'ret', `notified ${PEO[m.who].n}${tyOf(p) === 'E.ON' ? ' and created a reminder to enter the date in Dynamics' : ''}`); };

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/SoAA7na5JW5CYKpYEWohwx'; } });
VERSIONS.push({v:'v3.4', date:TODAY, major:false, current:true, url:null, title:'Assessment bookings by status, with a calendar', sum:'Retrofit’s assessment bookings are grouped by status and have a week and month calendar, with booking by date, time and assessor.', steps:[
  {t:'Bookings grouped by status', min:.5, dolor:'Before, bookings were one flat list.', show:['To book, booked, revisit booked, in review and assessed, each with its count.'], say:'You see at once what still needs a date.', go:() => { S.role = 'sad'; S.f.bkv = 'list'; go('ret', 'bk'); }},
  {t:'Week and month calendar', min:.5, dolor:'Before, there was no calendar.', show:['Each assessor’s week, or the month; the jobs to book on the side.', 'Book picks the date, time and assessor, seeing how full the day is.'], say:'Bookings fit around each assessor’s day.', go:() => { S.role = 'sad'; S.f.bkv = 'week'; S.f.bko = 0; go('ret', 'bk'); }},
]});

/* Later versions wrap or replace bkPage (the original reassigns it). Kept as var: no temporal dead zone. */
var bkPageW = null;
export function bkPage(...x){ return (bkPageW || bkPage0)(...x); }
export const wrapBkPage = w => { bkPageW = w(bkPageW || bkPage0); };
