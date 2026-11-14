// Refyt · v5.20: Assessment bookings con un calendario grande y arrastrar y soltar en los calendarios.
import {
  A, ASR, BKST, D0, DB, ME, PEO, S, TODAY, VERSIONS, VIEWS, bkList, bkPage, bkSt, bkWeek71, calEvts,
  dDiff, esc, fmtDy, fromIso, ico, iso, m2tm, monday, mtOf, nx, oph, prOf, re57, render, scOf, seg,
  stat, toast, wrapBkPage, wrapRender, yToMin
} from "../../index.js";
/* =================== v5.20: Assessment bookings led by a big calendar, and drag and drop in every calendar except Quality and compliance =================== */
S.f.bkc = S.f.bkc || 'month'; S.f.bkm = S.f.bkm || 0;
export const BKC70 = {booked:'bkb', revisit:'bkr', review:'bkv', done:'bkd'};
export const bkChip70 = p => { const k = bkSt(p), lab = BKST.find(x => x[0] === k)[1]; return `<button class="qc-ev ${BKC70[k] || 'bkb'}" data-act="prRet" data-v="${p.id}" data-tip="${esc(`${p.b.h || ''} ${p.ad}, ${PEO[p.b.who] ? PEO[p.b.who].n : ''}, ${lab}. Drag to another day to move it.`)}">${p.b.h ? `<i>${p.b.h}</i> ` : ''}${esc(p.ad)}</button>`; };
export function bkMonth70(){ const evs = calEvts(), base = fromIso(D0), first = new Date(base.getFullYear(), base.getMonth() + S.f.bkm, 1), y = first.getFullYear(), mo = first.getMonth(), days = new Date(y, mo + 1, 0).getDate(), lead = (first.getDay() + 6) % 7, cells = [];
  for(let i = 0; i < lead; i++) cells.push('<div class="qc-d out"></div>');
  for(let d = 1; d <= days; d++){ const ds = iso(new Date(y, mo, d)), es = evs.filter(p => p.b.on === ds).sort((a, b) => (a.b.h || '') < (b.b.h || '') ? -1 : 1);
    cells.push(`<div class="qc-d bk70-d${ds === TODAY ? ' today' : ''}" data-date="${ds}"><span class="qc-dn">${d}</span>${es.slice(0, 3).map(bkChip70).join('')}${es.length > 3 ? `<button class="qc-more bk70-more" data-act="bkDay" data-v="${ds}">+${es.length - 3} more</button>` : ''}</div>`); }
  const label = first.toLocaleDateString('en-GB', {month:'long', year:'numeric'});
  return `<div class="q54-ch"><h3>${ico('cal', 17)}Assessment calendar</h3><div class="qc-nav"><button type="button" class="qc-nb" data-act="bkM70" data-v="-1" aria-label="Previous month">${ico('chev', 16, 2.2)}</button><b>${label}</b><button type="button" class="qc-nb nx" data-act="bkM70" data-v="1" aria-label="Next month">${ico('chev', 16, 2.2)}</button>${S.f.bkm ? `<button type="button" class="btn sec sm" data-act="bkM70" data-v="0">Today</button>` : ''}</div></div>
    <div class="qc-leg"><span><i class="bkb"></i>Booked</span><span><i class="bkr"></i>Revisit booked</span><span><i class="bkv"></i>Visit done, in review</span><span><i class="bkd"></i>Assessed</span><span class="bk70-hint">${ico('info', 13)}Drag a visit to another day to move it</span></div>
    <div class="qc-wk">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span>${d}</span>`).join('')}</div><div class="qc-grid bk70-g">${cells.join('')}</div>`; }
export function bkSide70Base(){ const up = calEvts().filter(p => dDiff(p.b.on) >= 0 && ['booked', 'revisit'].includes(bkSt(p))).sort((a, b) => (a.b.on + (a.b.h || '')) < (b.b.on + (b.b.h || '')) ? -1 : 1).slice(0, 5), tb = bkList().filter(p => bkSt(p) === 'tobook');
  return `<div class="q54-ch"><h3>${ico('clock', 17)}Coming up</h3></div><div class="qc-up">${up.map(p => { const d = fromIso(p.b.on), k = bkSt(p); return `<button type="button" class="qc-ui" data-act="prRet" data-v="${p.id}"><span class="qc-ud ${k === 'revisit' ? 'soon' : 'aud'}"><b>${d.getDate()}</b><small>${d.toLocaleDateString('en-GB', {month:'short'})}</small></span><span class="qc-ut"><b>${esc(p.ad)}</b><small>${p.b.h || ''}, ${esc(PEO[p.b.who].n)}${k === 'revisit' ? ', revisit' : ''}</small></span>${ico('chev', 14, 2.2)}</button>`; }).join('') || '<p class="hint">No visits booked ahead.</p>'}</div>`
    + `<div class="q54-ch" style="margin-top:14px"><h3>${ico('alert', 17)}To book <span class="q54-cnt">${tb.length}</span></h3></div><div class="qc-up">${tb.map(p => `<div class="qc-ui bk70-tb"><span class="qc-ut"><b>${esc(p.ad)}</b><small>${esc(scOf(p.sc).n)}, ${esc(p.ref || p.id)}</small></span>${nx('bBook', p.id, 'Book')}</div>`).join('') || '<p class="hint">Nothing waiting to be booked.</p>'}</div>`; }
{ wrapBkPage(oBk => function(){ const xs = bkList(), keep = S.f.bkv; S.f.bkv = 'list'; let lst = oBk(); S.f.bkv = keep; const i = lst.indexOf('<div class="rf-tw">'); lst = i >= 0 ? lst.slice(i) : '';
  const wk = S.f.bkc === 'week';
  return oph('Assessment bookings', 'Every assessment on the calendar first, then grouped by where it stands. Drag a visit to another day to move it.')
    + `<div class="cstats">${BKST.map(([k, n]) => stat(k === 'revisit' && xs.some(p => bkSt(p) === k) ? 'ta' : 'tk', n, xs.filter(p => bkSt(p) === k).length)).join('')}</div>`
    + `<div class="rf-bar">${seg('bkc70', S.f.bkc, [['week', 'Week'], ['month', 'Month']])}${wk ? `${nx('bkNav', '-1', 'Previous week', 'sec')}${nx('bkNav', '0', 'This week', 'sec')}${nx('bkNav', '1', 'Next week', 'sec')}` : ''}${seg('bka', S.f.bka || '', [['', 'Both assessors'], ...ASR.map(k => [k, PEO[k].n])])}</div>`
    + `<div class="qc-top bk70-top"><section class="rsec q54-c">${wk ? `<div class="q54-ch"><h3>${ico('cal', 17)}Assessment calendar</h3><span class="bk70-hint">${ico('info', 13)}Drag a visit to another day to move it</span></div>${bkWeek71()}` : bkMonth70()}</section><section class="rsec q54-c">${bkSide70()}</section></div>`
    + `<div class="qc-h"><h2>${ico('list', 18)}All assessments</h2></div>` + lst; });
  VIEWS.ret.pages.bk = bkPage; }
A.bkc70 = el => { S.f.bkc = el.dataset.v; re57(); };
A.bkM70 = el => { const v = +el.dataset.v; S.f.bkm = v === 0 ? 0 : S.f.bkm + v; re57(); };
{ const oDay = A.bkDay; A.bkDay = el => { const d = el.dataset.v; S.f.bkc = 'week'; S.f.bko = Math.round((fromIso(monday(d)) - fromIso(monday(D0))) / 6048e5); render(); }; }

/* Drag and drop: move a meeting, task or assessment to another day (not in Quality and compliance) */
export const DND70 = {mtOpen:'Meeting', tkView:'Task', prRet:'Assessment'};
export function dnd70(){ document.querySelectorAll('.rf-tgcol .rf-tev').forEach(b => { if(DND70[b.dataset.act]) b.classList.add('dd70'); }); document.querySelectorAll('[data-date]').forEach(c => { if(c.closest('#layer')) return; c.querySelectorAll('[data-act]').forEach(b => { if(DND70[b.dataset.act] && !b.closest('.qc-up') && (b.dataset.v || '').match(/^(MT|TK|PR)-/)){ b.classList.add('dd70'); } }); }); }
{ wrapRender(r70 => (...x) => { const o = r70(...x); try { dnd70(); } catch(e) {} return o; }); }
export function move70(a, v, from, d, hh, ad){ if(!d) return; let name = '';
  if(a === 'mtOpen'){ const m = mtOf(v); if(!m) return; if(d === from && (!hh || hh === m.h)) return; m.d = d; if(hh) m.h = hh; name = `${m.ty || ''}${hh ? `, ${hh}` : ''}`; }
  else if(a === 'tkView'){ const k = DB.tk.find(x => x.id === v); if(!k) return; if(d === from && (hh ? hh === k.h : !(ad && k.h))) return; k.due = d; if(hh) k.h = hh; else if(ad) delete k.h; name = `${k.t}${hh ? `, ${hh}` : ''}`; }
  else if(a === 'prRet'){ const p = prOf(v); if(!p || !p.b) return; if(d === from && (!hh || hh === p.b.h)) return; p.b.on = d; if(hh) p.b.h = hh; name = `${p.ad}${hh ? `, ${hh}` : ''}`; p.his.push([TODAY, `Assessment moved from ${fmtDy(from)} to ${fmtDy(d)}${p.b.h ? ` at ${p.b.h}` : ''} with ${PEO[p.b.who] ? PEO[p.b.who].n : 'the assessor'}`, ME()]); }
  render(); toast(`${DND70[a]} moved to ${fmtDy(d)}${name ? `: ${name}` : ''}.`); }
/* Pointer based, so it works the same with a mouse, a trackpad or a finger, in every browser */
export let drag70 = null, eatClick70 = false;
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('.dd70'); if(!b || e.button > 0) return; const c = b.closest('[data-date], .rf-tgcol'); drag70 = {b, a:b.dataset.act, v:b.dataset.v, from:c && (c.dataset.date || c.dataset.d), x:e.clientX, y:e.clientY, on:false, ghost:null, over:null}; });
document.addEventListener('pointermove', e => { const g = drag70; if(!g) return;
  if(!g.on){ if(Math.hypot(e.clientX - g.x, e.clientY - g.y) < 6) return; g.on = true; g.b.classList.add('dragging'); document.body.classList.add('dnd70-on'); const r = g.b.getBoundingClientRect(); g.ghost = g.b.cloneNode(true); g.ghost.classList.add('ghost70'); g.ghost.style.width = r.width + 'px'; g.dx = e.clientX - r.left; g.dy = e.clientY - r.top; document.body.appendChild(g.ghost); const t = document.getElementById('tip54'); if(t) t.classList.remove('on'); }
  e.preventDefault(); g.ghost.style.left = (e.clientX - g.dx) + 'px'; g.ghost.style.top = (e.clientY - g.dy) + 'px';
  g.ghost.style.display = 'none'; const el = document.elementFromPoint(e.clientX, e.clientY); g.ghost.style.display = ''; const c = el && el.closest('.rf-tgcol, [data-date]'); g.ly = e.clientY;
  if(g.over && g.over !== c) g.over.classList.remove('drop70'); g.over = c && !c.closest('#layer') ? c : null; if(g.over) g.over.classList.add('drop70'); }, {passive:false});
export const end70 = e => { const g = drag70; drag70 = null; if(!g) return; document.body.classList.remove('dnd70-on'); if(g.ghost) g.ghost.remove(); g.b.classList.remove('dragging'); if(g.over) g.over.classList.remove('drop70');
  if(g.on){ eatClick70 = true; setTimeout(() => { eatClick70 = false; }, 0); if(e.type === 'pointerup' && g.over){ const tg = g.over.classList.contains('rf-tgcol'); move70(g.a, g.v, g.from, g.over.dataset.date || g.over.dataset.d, tg ? m2tm(yToMin(g.over, (g.ly || e.clientY) - g.dy)) : null, g.over.classList.contains('tg71-adc')); } } };
document.addEventListener('pointerup', end70); document.addEventListener('pointercancel', end70);
document.addEventListener('click', e => { if(eatClick70){ e.preventDefault(); e.stopPropagation(); eatClick70 = false; } }, true);
document.addEventListener('dragstart', e => { if(e.target.closest && e.target.closest('.dd70')) e.preventDefault(); });
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.19') v.url = 'https://claude.ai/artifact/VySaAcZZtnRrP2LDsRjeTa'; } });
VERSIONS.push({v:'v5.20', date:TODAY, major:false, current:true, url:null, title:'Bookings calendar first, drag and drop in calendars', sum:'Assessment bookings opens on a big calendar with Coming up and To book beside it, then the full list. In every calendar except Quality and compliance, meetings, tasks and assessments can be dragged to another day.', steps:[]});
/* Later layers wrap or replace bkSide70 (the original reassigns it). Kept as var: no temporal dead zone. */
export var bkSide70W = null;
export function bkSide70(...x){ return (bkSide70W || bkSide70Base)(...x); }
export const wrapBkSide70 = w => { bkSide70W = w(bkSide70W || bkSide70Base); };
