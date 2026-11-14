// Refyt · v5.14: todas las listas en el nuevo diseño: tablas en tarjeta, etiquetas de estado, cifras clave.
import {
  A, DB, S, TODAY, VERSIONS, curKey, dDiff, esc, fm, ico, norm, plural, render, stat, sum,
  wrapRender
} from "../index.js";
/* =================== v5.14: every list in the new design: card tables, status labels, search bar with filters, key figures =================== */
S.g64 = {};
export const G64 = ['dir:tasks', 'dir:mtg', 'tsk:all', 'dir:sch', 'acc:trg', 'acc:inv', 'acc:sup', 'acc:sub', 'ret:bk', 'ret:rq', 'ret:pk', 'del:clo', 'del:cs'];
export const gNorm64 = t => { let s = (t || '').trim().replace(/^\d[\d,.]*\s+(days?|weeks?|hours?)\s+/i, '').replace(/^\d[\d,.]*\s+/, ''); return s ? s[0].toUpperCase() + s.slice(1) : ''; };
export const gKey64 = () => { try { return curKey(); } catch(e) { return S.view; } };
export const KPI64 = {
  'acc:inv':() => { const xs = DB.inv, paid = xs.filter(v => v.paid), od = xs.filter(v => !v.paid && dDiff(v.due) < 0), wt = xs.filter(v => !v.paid && dDiff(v.due) >= 0);
    return [stat('tk', 'Invoiced', fm(sum(xs, v => v.amt)), plural(xs.length, 'invoice', 'invoices')), stat('tg', 'Paid', fm(sum(paid, v => v.amt)), plural(paid.length, 'invoice', 'invoices'), 'g64St', 'Paid'), stat('ta', 'Waiting', fm(sum(wt, v => v.amt)), plural(wt.length, 'invoice', 'invoices'), 'g64St', 'Waiting'), stat(od.length ? 'tred' : 'tg', 'Overdue', fm(sum(od, v => v.amt)), plural(od.length, 'invoice', 'invoices'), 'g64St', 'Overdue')]; },
  'acc:sub':() => { const xs = DB.sp, by = s => xs.filter(x => x.st === s);
    return [stat('tk', 'Subcontractor payments', fm(sum(xs, x => x.amt)), plural(xs.length, 'payment', 'payments')), stat('ta', 'Waiting approval', fm(sum(by('Waiting approval'), x => x.amt)), plural(by('Waiting approval').length, 'payment', 'payments'), 'g64St', 'Waiting approval'), stat('tb', 'Approved, to pay', fm(sum(by('Approved'), x => x.amt)), plural(by('Approved').length, 'payment', 'payments'), 'g64St', 'Approved'), stat('tg', 'Paid', fm(sum(by('Paid'), x => x.amt)), plural(by('Paid').length, 'payment', 'payments'), 'g64St', 'Paid')]; },
  'acc:sup':() => { const dl = DB.or.filter(o => o.st === 'Delivered'), iv = DB.or.filter(o => o.st === 'Invoiced'), od = DB.or.filter(o => o.st === 'Ordered');
    return [stat('tk', 'To match', fm(sum(dl, o => o.amt)), `${plural(dl.length, 'order', 'orders')} delivered`), stat('ta', 'On order', fm(sum(od, o => o.amt)), plural(od.length, 'order', 'orders')), stat('tg', 'Matched', fm(sum(iv, o => o.amt)), plural(iv.length, 'invoice', 'invoices')), stat('tb', 'Suppliers', new Set(DB.or.map(o => o.sup)).size, 'with orders')]; }
};
export function lists64(){ document.querySelectorAll('.op').forEach(op => { if(op.closest('#layer')) return;
  /* 1. Runs of rows become one card table */
  const kids = [...op.querySelectorAll('.mbr')].filter(r => !r.closest('.lst64') && !r.closest('.rd55') && !r.closest('#layer')); const seen = new Set();
  kids.forEach(r => { if(seen.has(r)) return; const run = [r]; let n = r.nextElementSibling; while(n && n.classList.contains('mbr')){ run.push(n); n = n.nextElementSibling; } run.forEach(x => seen.add(x)); const w = document.createElement('div'); w.className = 'lst64'; r.parentNode.insertBefore(w, r); run.forEach(x => w.appendChild(x)); });
  op.querySelectorAll('.lst64 .pill').forEach(p => { if(!p.dataset.g64) p.dataset.g64 = gNorm64(p.textContent); }); }); }
export function kpi64(){ const k = gKey64(), f = KPI64[k]; if(!f) return; const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || op.querySelector('.cstats')) return; const h = op.querySelector('.op-h'); if(!h) return; h.insertAdjacentHTML('afterend', `<div class="cstats ov-k m59-k g64-k">${f().join('')}</div>`); }
export function bar64(){ const k = gKey64(); if(!G64.includes(k)) return; const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || op.querySelector('.v5-fs')) return;
  const lists = [...op.querySelectorAll('.lst64')]; if(!lists.length) return; const st = S.g64[k] = S.g64[k] || {q:'', st:[], gr:[], open:false};
  const rows = lists.flatMap(l => [...l.querySelectorAll('.mbr:not(.uy-th)')]), grpOf = r => { let p = r.closest('.lst64').previousElementSibling; while(p && !p.matches('.grp-h,.gh,.lst64')) p = p.previousElementSibling; return p && !p.matches('.lst64') ? (p.querySelector('b,h3,span') || p).textContent.trim().replace(/\s+\d+$/, '') : ''; };
  rows.forEach(r => { r.dataset.g64s = [...new Set([...r.querySelectorAll('.pill')].map(p => p.dataset.g64).filter(Boolean))].join('|'); r.dataset.g64g = grpOf(r); });
  const sts = [...new Set(rows.flatMap(r => r.dataset.g64s ? r.dataset.g64s.split('|') : []))], grs = [...new Set(rows.map(r => r.dataset.g64g).filter(Boolean))];
  const first = lists[0], anchor = (first.previousElementSibling && first.previousElementSibling.matches('.grp-h,.gh')) ? first.previousElementSibling : first;
  const wrap = document.createElement('div'); wrap.className = 'g64-w'; anchor.parentNode.insertBefore(wrap, anchor);
  const paint = () => { const q = norm(st.q), match = (r, o = {}) => { const s2 = o.st || st.st, g2 = o.gr || st.gr; return (!q || norm(r.textContent).includes(q)) && (!s2.length || s2.some(x => (r.dataset.g64s || '').split('|').includes(x))) && (!g2.length || g2.includes(r.dataset.g64g)); };
    rows.forEach(r => r.classList.toggle('g64-hide', !match(r))); lists.forEach(l => { const any = [...l.querySelectorAll('.mbr:not(.uy-th)')].some(r => !r.classList.contains('g64-hide')); l.classList.toggle('g64-hide', !any); const p = l.previousElementSibling; if(p && p.matches('.grp-h,.gh')) p.classList.toggle('g64-hide', !any); });
    const nf = st.st.length + st.gr.length, shown = rows.filter(r => !r.classList.contains('g64-hide')).length, cnt = o => rows.filter(r => match(r, o)).length;
    const cols = [...(sts.length ? [{t:'Status', a:'st', opts:sts}] : []), ...(grs.length > 1 ? [{t:'Group', a:'gr', opts:grs}] : [])];
    const panel = `<div class="v5-fp v5-noanim"><div class="v5-fph"><b>Filter by</b><button class="v5-fclr" data-g64="clr" ${nf ? '' : 'disabled'}>Clear all</button></div><div class="v5-fcols">${cols.map(c => `<div class="v5-fc"><small>${c.t}</small><button class="v5-fo${!st[c.a].length ? ' on' : ''}" data-g64="all" data-c="${c.a}"><span>All</span><small>${cnt({[c.a]:[]})}</small></button>${c.opts.map(o => `<button class="v5-fo${st[c.a].includes(o) ? ' on' : ''}" data-g64="opt" data-c="${c.a}" data-o="${esc(o)}"><span>${esc(o)}</span><small>${cnt({[c.a]:[o]})}</small></button>`).join('')}</div>`).join('')}</div></div>`;
    wrap.innerHTML = `<div class="v5-fs"><div class="v5-fsb${st.open ? ' open' : ''}">${ico('search', 18)}<input type="search" data-g64="q" placeholder="Search this list" value="${esc(st.q)}" aria-label="Search this list">${cols.length ? `<button class="v5-fbtn${nf ? ' on' : ''}" data-g64="tog" title="Filters" aria-label="Filters" aria-expanded="${st.open}">${ico('filter', 17)}${nf ? `<em>${nf}</em>` : ''}</button>` : ''}</div>${st.open && cols.length ? panel : ''}</div><div class="v5-fchips">${nf ? [...st.st.map(o => ['st', o]), ...st.gr.map(o => ['gr', o])].map(([c, o]) => `<button class="v5-fchip" data-g64="opt" data-c="${c}" data-o="${esc(o)}">${esc(o)}${ico('x', 12)}</button>`).join('') + '<button class="v5-fclr" data-g64="clr">Clear all</button>' : ''}<span class="v5-fn">${plural(shown, 'item', 'items')}</span></div>`;
    op.querySelectorAll('.g64-k [data-act=g64St]').forEach(b => b.closest('.stat') && b.closest('.stat').classList.toggle('ds-on', st.st.length === 1 && st.st[0] === b.dataset.v)); };
  wrap._paint = paint; wrap._st = st; paint(); }
document.addEventListener('input', e => { const t = e.target; if(t.dataset && t.dataset.g64 === 'q'){ const w = t.closest('.g64-w'); w._st.q = t.value; const pos = t.selectionStart; w._paint(); const ni = w.querySelector('input[data-g64=q]'); ni.focus(); try { ni.setSelectionRange(pos, pos); } catch(e) {} } }, true);
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-g64]'); const w = e.target.closest && e.target.closest('.g64-w');
  if(!b || !w){ document.querySelectorAll('.g64-w').forEach(x => { if(x._st && x._st.open && !x.contains(e.target)){ x._st.open = false; x._paint(); } }); return; }
  const st = w._st, a = b.dataset.g64; if(a === 'q') return; e.preventDefault(); e.stopPropagation();
  if(a === 'tog') st.open = !st.open; else if(a === 'clr'){ st.st = []; st.gr = []; } else if(a === 'all') st[b.dataset.c] = []; else if(a === 'opt'){ const c = b.dataset.c, o = b.dataset.o; st[c] = st[c].includes(o) ? st[c].filter(x => x !== o) : [...st[c], o]; }
  w._paint(); }, true);
A.g64St = el => { const st = S.g64[gKey64()] = S.g64[gKey64()] || {q:'', st:[], gr:[], open:false}, v = el.dataset.v; st.st = st.st.length === 1 && st.st[0] === v ? [] : [v]; const w = document.querySelector('.op .g64-w'); if(w && w.offsetParent){ w._paint(); } else render(); };
document.addEventListener('keydown', e => { if(e.key === 'Escape') document.querySelectorAll('.g64-w').forEach(x => { if(x._st && x._st.open){ x._st.open = false; x._paint(); } }); });
{ wrapRender(r64 => (...x) => { const o = r64(...x); try { lists64(); kpi64(); bar64(); } catch(e) { console.warn(e); } return o; }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.13') v.url = 'https://claude.ai/artifact/5EJCJeDvU8A9vQLhpFoyV7'; } });
VERSIONS.push({v:'v5.14', date:TODAY, major:false, current:true, url:null, title:'Every list in the new design', sum:'Every list in the app is a card table with status labels. Task, meeting, scheme, Accounts, Retrofit and Delivery lists get the search bar with filters by status and group, and Invoices, Invoice matching and Subcontractor payments get key figures.', steps:[]});
