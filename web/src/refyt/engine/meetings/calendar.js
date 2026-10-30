// Refyt · Reuniones por estado, con calendario.
import {
  A, S, TODAY, VERSIONS, actsTxt, esc, go, mtActs, pill, plural, render
} from "../index.js";
export const MTST = [['today', 'Today'], ['up', 'Upcoming'], ['pend', 'Summary pending'], ['open', 'Actions open'], ['closed', 'Closed']];
export const mtSt = m => m.d === TODAY ? 'today' : m.d > TODAY ? 'up' : !m.ready ? 'pend' : mtActs(m).some(k => !k.done) ? 'open' : 'closed';
export const mtTag = m => { const s = mtSt(m); return pill({today:'tb', up:'tk', pend:'ta', open:'tb', closed:'tg'}[s], MTST.find(x => x[0] === s)[1]); };
export const mtChip = m => `<button class="rf-ev mt-${mtSt(m)}" data-act="mtOpen" data-v="${m.id}" data-tt="${esc(m.ty)}, ${m.h}, ${plural(m.who.length, 'attendee', 'attendees')}"><b>${m.h} ${esc(m.ty.replace(' team meeting', '').replace(' follow up', ' follow up'))}</b><small>${MTST.find(x => x[0] === mtSt(m))[1]}${m.d < TODAY ? ', ' + (mtActs(m).length ? actsTxt(m) : 'no actions') : ''}</small></button>`;
A.mtv = el => { S.f.mtv = el.dataset.v; S.f.mto = 0; S.f.mtd = null; render(); };
A.mtNav = el => { S.f.mto = el.dataset.v === '0' ? 0 : (S.f.mto || 0) + (+el.dataset.v); render(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/4dxRfJKKFGiffZGtY265iR'; } });
VERSIONS.push({v:'v3.5', date:TODAY, major:false, current:true, url:null, title:'Meetings by status, with a calendar', sum:'Meetings are grouped by status (today, upcoming, summary pending, actions open, closed) and have a week and month calendar.', steps:[
  {t:'Meetings by status and on a calendar', min:.5, dolor:'Before, meetings were split only into upcoming and past.', show:['Today, upcoming, summary pending, actions open and closed, each with its count.', 'Week and month calendar, with the next meeting and the summaries pending on the side.'], say:'You see which meetings still owe something.', go:() => { S.role = 'dir'; S.f.mtd = null; S.f.mtv = 'month'; go('dir', 'mtg'); }},
]});
