// Refyt · v5.21: todo calendario abre en la semana, luego el mes, con la lista debajo.
import {
  S, TODAY, VERSIONS, VIEWS, ico
} from "../index.js";
/* =================== v5.21: every calendar opens on the week, then month, with the list underneath =================== */
export const calFirst71 = (k, label) => f => (...x) => { if(!['week', 'month'].includes(S.f[k])) S.f[k] = 'week';
  const cal = f(...x), keep = S.f[k]; S.f[k] = 'list'; let lst = f(...x); S.f[k] = keep; const i = lst.indexOf('<div class="rf-tw">'); lst = i >= 0 ? lst.slice(i) : '';
  return cal.replace(new RegExp(`<button[^>]*data-act="${k}" data-v="list"[^>]*>[\\s\\S]*?</button>`), '') + (lst ? `<div class="qc-h"><h2>${ico('list', 18)}${label}</h2></div>${lst}` : ''); };
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const v = VIEWS[a]; if(!v || !v.pages) return; if(v.pages.mtg) v.pages.mtg = calFirst71('mtv', 'All meetings')(v.pages.mtg); if(v.pages.tasks) v.pages.tasks = calFirst71('tkvw', 'All tasks')(v.pages.tasks); });
S.f.mtv = 'week'; S.f.tkvw = 'week'; S.f.bkc = 'week';
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.20') v.url = 'https://claude.ai/artifact/4dMnxSbX9deSdHQc5LeUVC'; } });
VERSIONS.push({v:'v5.21', date:TODAY, major:false, current:true, url:null, title:'Calendars open on the week, list underneath', sum:'Assessment bookings, Meetings and My tasks open on the weekly calendar, can switch to the month, and always show the full list underneath.', steps:[]});
