// Refyt · v5.8: una sola barra de búsqueda para toda la app, con los filtros dentro.
import {
  $, A, DB, DITEMS, MPH53, OST, RGROUPS, S, TODAY, VERSIONS, esc, holdOpen, ico, mAll53, mProps53,
  norm, plural, prOf, rdRows56, render, scOf, setMBar53
} from "../index.js";
/* =================== v5.8: one search bar for the whole app, with the filters inside it, like Properties =================== */
S.f.fo57 = null; S.f.fo57a = false; S.f.oct = ''; S.f.supct = '';
export const re57 = () => { const m = $('#main'), y = m ? m.scrollTop : 0; render(); if(m) m.scrollTop = y; };
export function fbar57({id, qk, qv, ph, cols, nf, clr, chips = [], count = ''}){ const open = S.f.fo57 === id;
  const panel = `<div class="v5-fp${S.f.fo57a ? '' : ' v5-noanim'}" role="dialog" aria-label="Filters"><div class="v5-fph"><b>Filter by</b><button class="v5-fclr" data-act="${clr}" ${nf ? '' : 'disabled'}>Clear all</button></div><div class="v5-fcols">${cols.map(c => `<div class="v5-fc"><small>${c.t}</small>${c.opts.map(o => `<button class="v5-fo${o.on ? ' on' : ''}" data-act="${o.a}" data-v="${esc(o.v)}" aria-pressed="${!!o.on}"><span>${esc(o.n)}</span><small>${o.c == null ? '' : o.c}</small></button>`).join('')}</div>`).join('')}</div></div>`;
  return `<div class="v5-fs" data-fs="${id}"><div class="v5-fsb${open ? ' open' : ''}">${ico('search', 18)}<input type="search" data-in="${qk}"${qk === 'f' ? ` data-k="${qv[0]}"` : ''} placeholder="${esc(ph)}" value="${esc(qk === 'f' ? (S.f[qv[0]] || '') : qv)}" aria-label="${esc(ph)}"><button class="v5-fbtn${nf ? ' on' : ''}" data-act="fo57" data-v="${id}" title="Filters" aria-label="Filters" aria-expanded="${open}">${ico('filter', 17)}${nf ? `<em>${nf}</em>` : ''}</button></div>${open ? panel : ''}</div>`
    + `<div class="v5-fchips">${chips.length ? chips.map(([a, v, l]) => `<button class="v5-fchip" data-act="${a}" data-v="${esc(v)}" title="Remove this filter">${esc(l)}${ico('x', 12)}</button>`).join('') + `<button class="v5-fclr" data-act="${clr}">Clear all</button>` : ''}${count ? `<span class="v5-fn">${count}</span>` : ''}</div>`; }
A.fo57 = el => { const id = el.dataset.v; S.f.fo57 = S.f.fo57 === id ? null : id; S.f.fo57a = !!S.f.fo57; re57(); S.f.fo57a = false; };
document.addEventListener('click', e => { if(S.f.fo57 && e.target.closest && !e.target.closest('.v5-fs')){ S.f.fo57 = null; setTimeout(() => { if([...document.querySelectorAll('.v5-fp')].some(x => x.offsetParent && !x.closest('.v5-fs').querySelector('[data-act=prFo]'))) re57(); }, 0); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.fo57){ S.f.fo57 = null; re57(); } });
export const swap57 = (patch, fn) => { const keep = {}; Object.keys(patch).forEach(k => { keep[k] = S.f[k]; S.f[k] = patch[k]; }); try { return fn(); } finally { Object.assign(S.f, keep); } };

/* Margins */
setMBar53(function(){ const n = S.f.msc.length + S.f.mph.length, scs = [...new Set(mAll53().map(p => p.sc))], c = patch => swap57(patch, () => mProps53().length);
  return fbar57({id:'mrg', qk:'mq53', qv:S.f.mq, ph:'Search a property, postcode or scheme', nf:n, clr:'mf53Clr', count:plural(mProps53().length, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'mf53ScAll', v:'', n:'All schemes', c:c({msc:[]}), on:!S.f.msc.length}, ...scs.map(id => ({a:'mf53Sc', v:id, n:scOf(id).n, c:c({msc:[id]}), on:S.f.msc.includes(id)}))]},
      {t:'Status', opts:MPH53.map(ph => ({a:'mf53Ph', v:ph, n:ph, c:c({mph:[ph]}), on:S.f.mph.includes(ph)}))}],
    chips:[...S.f.msc.map(id => ['mf53Sc', id, scOf(id).n]), ...S.f.mph.map(ph => ['mf53Ph', ph, ph])]}); });
A.mf53ScAll = () => { S.f.msc = []; re57(); };
{ const a = A.mf53Sc, b = A.mf53Ph, cl = A.mf53Clr; A.mf53Sc = el => { const v = el.dataset.v; S.f.msc = S.f.msc.includes(v) ? S.f.msc.filter(x => x !== v) : [...S.f.msc, v]; re57(); }; A.mf53Ph = el => { const v = el.dataset.v; S.f.mph = S.f.mph.includes(v) ? S.f.mph.filter(x => x !== v) : [...S.f.mph, v]; re57(); }; A.mf53Clr = () => { S.f.msc = []; S.f.mph = []; re57(); }; }

/* Ready to install and Redbridge tracker */
export function holdRows57(all){ const q = norm(S.f.rq), st = S.f.rst, ks = (S.f.ri ? RGROUPS.filter(g => g[0] === S.f.ri) : RGROUPS).map(g => g[0]);
  return all.filter(p => (!S.f.rsc || p.sc === S.f.rsc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${p.ht}`).includes(q)) && (!st || (st === 'hold' ? !!(holdOpen(p) && (p.hold || p.hold2)) : ks.some(k => (p.g[k] || 'Not started') === st)))); }
export function bar57rd(kind, base){ const rows = () => kind === 'rdy' ? rdRows56(base) : holdRows57(base), c = patch => swap57(patch, () => rows().length), seg0 = S.f.rdyS || 'open';
  const sts = kind === 'rdy' ? [['ready', 'Ready to install'], ['notready', 'Not ready yet'], ...(seg0 !== 'open' ? [['closed', 'Closed, moved to install']] : []), ...['Done', 'Delivered', 'Approved', 'Booked', 'Requested', 'Not booked', 'Not needed'].map(v => [v, v])]
    : [['hold', 'Hold point open'], ['Complete', 'Complete'], ['In progress', 'In progress'], ['Waiting on decision', 'Waiting on decision'], ['Blocked', 'Blocked'], ['Not started', 'Not started'], ['Not applicable', 'Not needed']];
  const its = kind === 'rdy' ? DITEMS.map(([k, n]) => [k, n]) : RGROUPS.map(([k, n]) => [k, n]), stN = v => (sts.find(s => s[0] === v) || ['', v])[1], itN = v => (its.find(s => s[0] === v) || ['', v])[1];
  const nf = (S.f.rsc ? 1 : 0) + (S.f.rst ? 1 : 0) + (S.f.ri ? 1 : 0), cnt = rows().length;
  return fbar57({id:kind, qk:'rq55', qv:S.f.rq, ph:'Search a property, postcode or ID', nf, clr:'rdClr57', count:plural(cnt, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'rd57Sc', v:'', n:'All schemes', c:c({rsc:''}), on:!S.f.rsc}, ...[...new Set(base.map(p => p.sc))].map(id => ({a:'rd57Sc', v:id, n:scOf(id).n, c:c({rsc:id}), on:S.f.rsc === id}))]},
      {t:'Status', opts:[{a:'rd57St', v:'', n:'All statuses', c:c({rst:''}), on:!S.f.rst}, ...sts.map(([k, n]) => ({a:'rd57St', v:k, n, c:c({rst:k}), on:S.f.rst === k}))]},
      {t:kind === 'rdy' ? 'Item' : 'Group', opts:[{a:'rd57It', v:'', n:kind === 'rdy' ? 'All items' : 'All groups', c:null, on:!S.f.ri}, ...its.map(([k, n]) => ({a:'rd57It', v:k, n, c:null, on:S.f.ri === k}))]}],
    chips:[...(S.f.rsc ? [['rd57Sc', '', scOf(S.f.rsc).n]] : []), ...(S.f.rst ? [['rd57St', '', stN(S.f.rst)]] : []), ...(S.f.ri ? [['rd57It', '', itN(S.f.ri)]] : [])]}); }
A.rd57Sc = el => { S.f.rsc = el.dataset.v; re57(); };
A.rd57St = el => { S.f.rst = el.dataset.v; re57(); };
A.rd57It = el => { S.f.ri = el.dataset.v; re57(); };
A.rdClr57 = () => { S.f.rq = ''; S.f.rsc = ''; S.f.rst = ''; S.f.ri = ''; re57(); };

/* Orders */
export function ordBar57(st){ const q = norm(S.f.oq), base = DB.or.filter(o => !q || norm(o.id + ' ' + o.sup + ' ' + (o.al || []).map(a => prOf(a.pr).ad).join(' ')).includes(q)), inS = (o, s) => s === 'all' || (s === 'open' ? o.st !== 'Invoiced' && o.st !== 'Rejected' : o.st === s), cts = [...new Set(DB.or.map(o => o.ct).filter(Boolean))];
  const nf = (st !== 'all' ? 1 : 0) + (S.f.oct ? 1 : 0), stL = {all:'All', open:'Open'};
  return fbar57({id:'ord', qk:'f', qv:['oq'], ph:'Search a supplier, property or order', nf, clr:'ord57Clr', count:plural(base.filter(o => inS(o, st) && (!S.f.oct || o.ct === S.f.oct)).length, 'order', 'orders'),
    cols:[{t:'Status', opts:[['all', 'All'], ['open', 'Open'], ...OST.map(s => [s, s])].map(([k, n]) => ({a:'ost', v:k, n, c:base.filter(o => inS(o, k) && (!S.f.oct || o.ct === S.f.oct)).length, on:st === k}))},
      {t:'Cost type', opts:[{a:'oct57', v:'', n:'All cost types', c:base.filter(o => inS(o, st)).length, on:!S.f.oct}, ...cts.map(t => ({a:'oct57', v:t, n:t, c:base.filter(o => inS(o, st) && o.ct === t).length, on:S.f.oct === t}))]}],
    chips:[...(st !== 'all' ? [['ost', 'all', stL[st] || st]] : []), ...(S.f.oct ? [['oct57', '', S.f.oct]] : [])]}); }
A.ost = el => { S.f.ost = el.dataset.v; re57(); };
A.oct57 = el => { S.f.oct = el.dataset.v; re57(); };
A.ord57Clr = () => { S.f.ost = 'all'; S.f.oct = ''; re57(); };

/* Suppliers */
export function supBar57(rs, xs){ const cts = [...new Set(rs.map(r => r.ct).filter(Boolean))], q = norm(S.f.supq), byQ = rs.filter(r => !q || norm(r.n + ' ' + r.ct + ' ' + (r.x.email || '')).includes(q));
  return fbar57({id:'sup', qk:'f', qv:['supq'], ph:'Search a supplier, cost type or email', nf:S.f.supct ? 1 : 0, clr:'sup57Clr', count:plural(xs.length, 'supplier', 'suppliers'),
    cols:[{t:'Cost type', opts:[{a:'sup57Ct', v:'', n:'All cost types', c:byQ.length, on:!S.f.supct}, ...cts.map(t => ({a:'sup57Ct', v:t, n:t, c:byQ.filter(r => r.ct === t).length, on:S.f.supct === t}))]}],
    chips:S.f.supct ? [['sup57Ct', '', S.f.supct]] : []}); }
A.sup57Ct = el => { S.f.supct = el.dataset.v; re57(); };
A.sup57Clr = () => { S.f.supct = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.6') v.url = 'https://claude.ai/artifact/SHmgcL3qhAvC1vzqmr3nkd'; } });
VERSIONS.push({v:'v5.7', date:TODAY, major:false, current:true, url:null, title:'One design for every row of key figures', sum:'Every row of key figures in the app uses the Overview design: the first figure in Delft blue, soft accent shapes, and the same tones.', steps:[]});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.7') v.url = 'https://claude.ai/artifact/PcUvzCWoXcWKtC7hTBHY1f'; } });
VERSIONS.push({v:'v5.8', date:TODAY, major:false, current:true, url:null, title:'One search bar for the whole app', sum:'Every list searches the same way as Properties: one bar with the filter button inside it, a Filter by panel with counts, chips for what is applied and Clear all. Margins, Ready to install, the Redbridge tracker, Orders and Suppliers use it.', steps:[]});
