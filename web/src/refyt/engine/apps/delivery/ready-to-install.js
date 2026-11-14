// Refyt · v5.5: Ready to install como tabla filtrable, con el presupuesto y un menú por propiedad.
import {
  A, DB, DITEMS, IN, OPENP, RGROUPS, S, TODAY, VERSIONS, VIEWS, bar57rd, dLast, empty, esc, fmtDy,
  grpPct, holdOpen, holdRows57, ico, norm, oph, pc, rdyTimeline, ready, refocus, render, scOf, seg,
  stat, sum, trBar, tyOf, visNote, wrapRender
} from "../../index.js";
/* =================== v5.5: Ready to install as a filterable table, with the quote file and a menu per property =================== */
S.f.rq = ''; S.f.rsc = ''; S.f.rst = ''; S.f.ri = ''; S.f.rk = null;
export const RSC55 = [['#E0E7FF', '#3730A3'], ['#EDE9FE', '#5B21B6'], ['#DCFCE7', '#166534'], ['#FCE7F3', '#9D174D'], ['#CFFAFE', '#155E75'], ['#FEF3C7', '#92400E']];
export const scPill55 = id => { const i = Math.max(0, DB.sc.findIndex(s => s.id === id)), [bg, fg] = RSC55[i % RSC55.length]; return `<span class="rd55-sc" style="background:${bg};color:${fg}">${esc(scOf(id).n)}</span>`; };
export const CHK55 = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#16A34A"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const ST55 = {'Done':['ok', CHK55], 'Requested':['rq', ico('send', 13, 2.2)], 'Booked':['bk', ico('cal', 13, 2.2)], 'Approved':['ap', ico('check', 13, 2.6)], 'Delivered':['ap', ico('truck', 13, 2.2)], 'Not booked':['nb', ''], 'Not needed':['na', ico('lock', 12, 2.2)]};
export const rdV55 = (p, k, closed) => p.dna[k] ? 'Not needed' : closed ? 'Done' : (p.d[k] || 'Not booked');
export const rdPill55 = (p, k, closed) => { const v = rdV55(p, k, closed), [c, ic] = ST55[v] || ['bk', ''], l = dLast(p, k), d = l ? fmtDy(l.on).replace(/, \d{4}$/, '') : '';
  if(k === 'date' && (v === 'Done' || v === 'Booked') && d) return `<span class="rd55-dt" title="Install date ${v === 'Done' ? 'agreed' : 'booked'}, ${esc(fmtDy(l.on))}">${ico('cal', 15, 2)}${d}</span>`;
  return `<span class="rd55-p ${c}" title="${esc(v)}${d ? `, ${esc(fmtDy(l.on))}` : ''}">${ic}${v}</span>`; };
export const rdItems55 = () => S.f.ri ? DITEMS.filter(([k]) => k === S.f.ri) : DITEMS;
export function rdRows55(xs, closed){ const q = norm(S.f.rq), st = S.f.rst, ks = rdItems55().map(([k]) => k);
  return xs.filter(p => (!S.f.rsc || p.sc === S.f.rsc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))
    && (!st || (st === 'ready' ? (closed || ready(p)) : st === 'notready' ? (!closed && !ready(p)) : ks.some(k => rdV55(p, k, closed) === st)))); }
export const isCl56 = p => !!DB.dcl[p.id] && p.ph !== 'D. Prepare to install';
export const rdyOn56 = p => DB.drd[p.id] || (isCl56(p) ? null : (ready(p) ? TODAY : null));
export function rdRows56(xs){ const q = norm(S.f.rq), st = S.f.rst, ks = rdItems55().map(([k]) => k);
  return xs.filter(p => { const cl = isCl56(p); return (!S.f.rsc || p.sc === S.f.rsc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))
    && (!st || (st === 'ready' ? !!rdyOn56(p) : st === 'notready' ? !rdyOn56(p) : st === 'closed' ? cl : ks.some(k => rdV55(p, k, cl) === st))); }); }
export const kebab56 = (p, items) => `<td class="rd55-k"><button type="button" class="rd55-kb" data-act="rdK55" data-v="${p.id}" aria-label="More for ${esc(p.ad)}" aria-expanded="${S.f.rk === p.id}">${ico('dots', 18)}</button>${S.f.rk === p.id ? `<div class="rd55-menu" role="menu">${items.map(([a, ic, t]) => `<button type="button" role="menuitem" data-act="${a}" data-v="${p.id}">${ico(ic, 15)}${t}</button>`).join('')}</div>` : ''}</td>`;
export const quoteCell56 = p => `<td>${p.qf ? `<button type="button" class="rd55-q has" data-act="qfView54" data-v="${p.id}" aria-label="View the quote for ${esc(p.ad)}">${ico('eye', 16, 2)}View</button>` : `<label class="rd55-q" data-act="qfLab54" title="Add the quote file (PDF or image)">${ico('clip', 15, 2)}Add file<input type="file" accept="application/pdf,.pdf,image/*" data-in="qf54" data-k="${p.id}" aria-label="Add the quote file for ${esc(p.ad)}"></label>`}</td>`;
export const sel56 = (k, all, opts) => `<label class="rd55-sel"><span class="sr">${all}</span><select data-in="rd55" data-k="${k}" aria-label="${all}"><option value="">${all}</option>${opts}</select>${ico('chev', 14, 2.2)}</label>`;
export const bar56 = (scs, stOpts, itOpts, itAll) => { const any = S.f.rq || S.f.rsc || S.f.rst || S.f.ri; return `<div class="rd55-bar"><label class="rd55-s">${ico('search', 16)}<input data-in="rq55" value="${esc(S.f.rq)}" placeholder="Search property" aria-label="Search property"></label>${sel56('rsc', 'All schemes', scs.map(id => `<option value="${id}"${S.f.rsc === id ? ' selected' : ''}>${esc(scOf(id).n)}</option>`).join(''))}${sel56('rst', 'All statuses', stOpts)}${sel56('ri', itAll, itOpts)}${any ? `<button type="button" class="rd55-clr" data-act="rdClr55">Clear filters${ico('x', 14, 2.4)}</button>` : ''}</div>`; };
export const opt56 = v => `<option value="${v[0]}"${S.f.rst === v[0] ? ' selected' : ''}>${v[1]}</option>`;
VIEWS.del.pages.rdy = (...x) => { const seg0 = S.f.rdyS || 'open', open = DB.pr.filter(p => p.ph === 'D. Prepare to install'), done = DB.pr.filter(p => isCl56(p) && p.ph !== 'Cancelled'), base = seg0 === 'all' ? [...open, ...done] : seg0 === 'open' ? open : done, xs = rdRows56(base), its = rdItems55(), ncol = its.length + 4;
  const stOpts = `<optgroup label="Property">${[['ready', 'Ready to install'], ['notready', 'Not ready yet'], ...(seg0 !== 'open' ? [['closed', 'Closed, moved to install']] : [])].map(opt56).join('')}</optgroup><optgroup label="Item">${['Done', 'Delivered', 'Approved', 'Booked', 'Requested', 'Not booked', 'Not needed'].map(v => opt56([v, v])).join('')}</optgroup>`;
  const head = `<tr><th>Property</th><th>Scheme</th>${its.map(([k, n]) => `<th>${esc(k === 'date' ? 'Install date' : n.split(' ').slice(0, 2).join(' '))}</th>`).join('')}<th>Ready</th><th><span class="sr">Timeline</span></th></tr>`;
  const row = p => { const cl = isCl56(p), on = rdyOn56(p), rd = on ? `<span class="rd55-dt" title="Marked ready on ${esc(fmtDy(on))}">${ico('cal', 15, 2)}${fmtDy(on).replace(/, \d{4}$/, '')}</span>` : `<span class="rd55-dash" title="Not ready yet">–</span>`;
    return `<tr class="${S.f.rdyTl === p.id ? 'tl-open' : ''}"><td class="rd55-pr"><button class="rd55-pn" data-act="prIns" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.pc || '')}${seg0 === 'all' && cl ? ' · moved to install' : ''}</small></td><td>${scPill55(p.sc)}</td>${its.map(([k]) => `<td>${rdPill55(p, k, cl)}</td>`).join('')}<td class="rd55-rd">${rd}</td><td class="rd56-tlc"><button type="button" class="rd56-tlb${S.f.rdyTl === p.id ? ' on' : ''}" data-act="rdyTl" data-v="${p.id}" aria-expanded="${S.f.rdyTl === p.id}" aria-label="${S.f.rdyTl === p.id ? 'Hide the timeline' : 'Show the timeline'} of ${esc(p.ad)}">${ico('clock', 15, 2)}${S.f.rdyTl === p.id ? 'Hide timeline' : 'Timeline'}</button></td></tr>${S.f.rdyTl === p.id ? `<tr class="tl-row"><td colspan="${ncol}">${rdyTimeline(p).replace('<div class="tl">', '<div class="tl rd55-tl">')}</td></tr>` : ''}`; };
  return trBar() + oph('Ready to install', 'Every phase D item per property. Ready sets itself when everything that applies is done.') + visNote()
    + `<div class="rf-bar">${seg('rdySeg', seg0, [['all', 'All', open.length + done.length], ['open', 'In phase D', open.length], ['closed', 'Closed, moved to install', done.length]])}</div>`
    + `${bar57rd('rdy', base)}<section class="rd55"><div class="rd55-w"><table class="rd55-t"><thead>${head}</thead><tbody>${xs.map(row).join('') || `<tr><td colspan="${ncol}">${empty(base.length ? 'No properties match these filters.' : 'No properties here yet.')}</td></tr>`}</tbody></table></div></section>`; };

/* Redbridge tracker, in the same design */
export const GS56 = {'Complete':['ok', CHK55], 'In progress':['ap', ico('trend', 13, 2.2)], 'Waiting on decision':['bk', ico('alert', 13, 2.2)], 'Blocked':['bl', ico('alert', 13, 2.2)], 'Not started':['nb', ''], 'Not applicable':['na', ico('lock', 12, 2.2)]};
export const gPill56 = (p, k) => { const v = p.g[k] || 'Not started', [c, ic] = GS56[v] || ['nb', ''], l = v === 'Not applicable' ? 'Not needed' : v === 'In progress' ? `${(p.gp || {})[k] || 50}%` : v === 'Waiting on decision' ? 'Waiting' : v;
  return `<span class="rd55-p ${c}" title="${esc(RGROUPS.find(g => g[0] === k)[1])}: ${esc(v === 'Not applicable' ? 'Not needed on this job' : v)}">${ic}${l}</span>`; };
VIEWS.del.pages.hold = (...x) => { const all = DB.pr.filter(p => tyOf(p) === 'Redbridge' && OPENP.includes(p.ph)), q = norm(S.f.rq), st = S.f.rst, gs = S.f.ri ? RGROUPS.filter(g => g[0] === S.f.ri) : RGROUPS, ks = gs.map(g => g[0]), ncol = gs.length + 3;
  const xs = holdRows57(all);
  const stOpts = `<optgroup label="Property">${opt56(['hold', 'Hold point open'])}</optgroup><optgroup label="Group">${[['Complete', 'Complete'], ['In progress', 'In progress'], ['Waiting on decision', 'Waiting on decision'], ['Blocked', 'Blocked'], ['Not started', 'Not started'], ['Not applicable', 'Not needed']].map(opt56).join('')}</optgroup>`;
  const head = `<tr><th>Property</th><th>House</th>${gs.map(([k, n, , h]) => `<th>${esc(n)}${h ? '<em class="rd56-h">hold</em>' : ''}</th>`).join('')}<th>Overall</th></tr>`;
  const row = p => { const pct = grpPct(p), ho = holdOpen(p) && (p.hold || p.hold2);
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="prIns" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.pc || '')}</small>${ho ? `<span class="rd56-ho" title="${esc(p.hold || p.hold2)}">${ico('alert', 12, 2.4)}Hold point</span>` : ''}</td><td><span class="rd55-sc" style="background:#EDE9FE;color:#5B21B6">${esc(p.ht || '')}</span></td>${gs.map(([k]) => `<td>${gPill56(p, k)}</td>`).join('')}<td class="rd56-ov"><b>${pct}%</b><span class="rd56-bar"><i style="width:${pct}%"></i></span></td></tr>`; };
  return trBar() + oph('Redbridge tracker', 'Each install group per property. Overall leaves out groups not needed.') + visNote()
    + `<div class="cstats">${stat('tb', 'Properties', all.length)}${stat('tg', 'Average complete', pc(all.length ? sum(all, grpPct) / all.length : 0))}${stat('tred', 'Hold points open', all.filter(p => holdOpen(p) && (p.hold || p.hold2)).length)}</div>`
    + `${bar57rd('hold', all)}<section class="rd55"><div class="rd55-w"><table class="rd55-t rd56-t"><thead>${head}</thead><tbody>${xs.map(row).join('') || `<tr><td colspan="${ncol}">${empty(all.length ? 'No properties match these filters.' : 'No Redbridge properties open.')}</td></tr>`}</tbody></table></div></section>`; };
/* Filters are kept per page */
{ const KEEP56 = {}; let last = null; wrapRender(oR => (...x) => { const pg = S.view + ':' + ((S.uni5 || '') + (S.page && S.page[S.view] || '')); if(last && pg !== last){ KEEP56[last] = {rq:S.f.rq, rsc:S.f.rsc, rst:S.f.rst, ri:S.f.ri}; Object.assign(S.f, KEEP56[pg] || {rq:'', rsc:'', rst:'', ri:''}); S.f.rk = null; } last = pg; return oR(...x); }); }
IN.rq55 = t => { S.f.rq = t.value; refocus(render); };
IN.rd55 = t => { S.f[t.dataset.k] = t.value; render(); };
A.rdClr55 = () => { S.f.rq = ''; S.f.rsc = ''; S.f.rst = ''; S.f.ri = ''; render(); };
A.rdK55 = el => { S.f.rk = S.f.rk === el.dataset.v ? null : el.dataset.v; render(); };
{ const oTl = A.rdyTl; A.rdyTl = el => { S.f.rk = null; oTl(el); }; const oSeg = A.rdySeg; A.rdySeg = el => { S.f.rk = null; S.f.rst = ''; oSeg(el); }; }
document.addEventListener('click', e => { if(S.f.rk && e.target.closest && !e.target.closest('.rd55-k')){ S.f.rk = null; if(!e.target.closest('[data-act]')) render(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.rk){ S.f.rk = null; render(); } });
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.4') v.url = 'https://claude.ai/artifact/WA3eD8rYWv8D9hXxqGJ24g'; } });
VERSIONS.push({v:'v5.5', date:TODAY, major:false, current:false, url:'https://claude.ai/artifact/8Lh9N2CmtRVwH7PXuWJyFA', title:'Ready to install: search, filters, quote file and a menu per property', sum:'Ready to install has a search bar and filters by scheme, status and item, status labels with icons, the install date, the quote file and a menu with Timeline and Open property.', steps:[]});
VERSIONS.push({v:'v5.6', date:TODAY, major:false, current:true, url:null, title:'Ready to install and Redbridge tracker: search and filters in one design', sum:'Ready to install and the Redbridge tracker share one design: search, filters by scheme, status and item or group, status labels with icons, and the property opens from its name. Ready to install has a Timeline button per property, adds All beside In phase D, and Ready shows the date the property was marked ready.', steps:[]});
