// Refyt · v5.9: Margins como dashboard: cifras clave, margen por esquema, aprobación del cliente, una tabla.
import {
  A, MPH53, S, TODAY, VERSIONS, VIEWS, empty, esc, fbar57, fm, ico, kfm54, mAll53, mBar53, mProps53,
  mSum53, mgTag, mrgPage, norm, oph, pMoney, pc, plural, re57, scOf, scPill55, setMBar53,
  setMProps53, setMrgPage, stat, sum, swap57
} from "../../index.js";
/* =================== v5.9: Margins as a dashboard: key figures, margin by scheme, client approval, insights, one table =================== */
S.f.mms = []; S.f.mby = 'pct';
export const mSt59 = p => { const x = pMoney(p), t = scOf(p.sc).set.mg; return x.over ? 'over' : x.mgp < t ? 'below' : 'above'; };
export const MST59 = {above:'Above target', below:'Below target', over:'Over budget'};
setMProps53(() => { const q = norm(S.f.mq); return mAll53().filter(p => (!S.f.msc.length || S.f.msc.includes(p.sc)) && (!S.f.mph.length || S.f.mph.includes(p.ph)) && (!S.f.mms.length || S.f.mms.includes(mSt59(p))) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))); });
setMBar53(function(){ const n = S.f.msc.length + S.f.mph.length + S.f.mms.length, scs = [...new Set(mAll53().map(p => p.sc))], c = patch => swap57(patch, () => mProps53().length);
  return fbar57({id:'mrg', qk:'mq53', qv:S.f.mq, ph:'Search a property, postcode or scheme', nf:n, clr:'mf53Clr', count:plural(mProps53().length, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'mf53ScAll', v:'', n:'All schemes', c:c({msc:[]}), on:!S.f.msc.length}, ...scs.map(id => ({a:'mf53Sc', v:id, n:scOf(id).n, c:c({msc:[id]}), on:S.f.msc.includes(id)}))]},
      {t:'Status', opts:MPH53.map(ph => ({a:'mf53Ph', v:ph, n:ph, c:c({mph:[ph]}), on:S.f.mph.includes(ph)}))},
      {t:'Margin', opts:Object.entries(MST59).map(([k, l]) => ({a:'mf59Ms', v:k, n:l, c:c({mms:[k]}), on:S.f.mms.includes(k)}))}],
    chips:[...S.f.msc.map(id => ['mf53Sc', id, scOf(id).n]), ...S.f.mph.map(ph => ['mf53Ph', ph, ph]), ...S.f.mms.map(k => ['mf59Ms', k, MST59[k]])]}); });
A.mf59Ms = el => { const v = el.dataset.v; S.f.mms = S.f.mms.includes(v) ? S.f.mms.filter(x => x !== v) : [...S.f.mms, v]; re57(); };
A.mf59Only = el => { S.f.mms = S.f.mms.length === 1 && S.f.mms[0] === el.dataset.v ? [] : [el.dataset.v]; re57(); setTimeout(() => { const t = document.querySelector('.op:not([hidden]) .m59-tbl, .m59-tbl'); const vis = [...document.querySelectorAll('.m59-tbl')].find(x => x.offsetParent); if(vis) vis.scrollIntoView({behavior:'smooth', block:'start'}); }, 30); };
A.mf59Sc = el => { const v = el.dataset.v; S.f.msc = S.f.msc.length === 1 && S.f.msc[0] === v ? [] : [v]; re57(); };
A.mBy59 = el => { S.f.mby = el.dataset.v; re57(); };
{ const oc = A.mf53Clr; A.mf53Clr = () => { S.f.mms = []; oc(); }; }
export function mBars59(){ const ps = swap57({msc:[]}, () => mProps53()), pct = S.f.mby === 'pct', sel = S.f.msc.length === 1 ? S.f.msc[0] : '';
  const gs = [...new Set(ps.map(p => p.sc))].map(id => { const xs = ps.filter(p => p.sc === id), k = mSum53(xs), t = scOf(id).set.mg; return {k:id, n:scOf(id).n, v:pct ? k.mgp : k.mg, t:pct ? t : k.q * t / 100, mgp:k.mgp, tp:t, mg:k.mg, q:k.q}; });
  if(!gs.length) return empty('Nothing to chart with these filters.');
  const W = 680, H = 270, L = 46, B = 44, T = 26, iw = W - L - 10, ih = H - B - T, top = Math.max(...gs.map(g => Math.max(g.v, g.t))) * 1.15 || 1, mx = pct ? Math.max(20, Math.ceil(top / 20) * 20) : top, gw = iw / gs.length, bw = Math.min(46, gw * .38);
  const y = v => T + ih - Math.max(0, v) / mx * ih, lab = v => pct ? Math.round(v) + '%' : kfm54(v);
  const grid = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - 10}" y1="${y(mx * f)}" y2="${y(mx * f)}" class="q54-gl"/><text x="${L - 8}" y="${y(mx * f) + 4}" text-anchor="end" class="q54-ax">${lab(mx * f)}</text>`).join('');
  const bars = gs.map((g, i) => { const cx = L + gw * i + gw / 2, dim = sel && sel !== g.k, ok = g.mgp >= g.tp, tip = `${g.n}: margin ${pc(g.mgp)} (${fm(g.mg)}) on ${fm(g.q)} quoted. Target ${g.tp}%. Click to ${sel === g.k ? 'show all' : 'filter'}.`, nm = g.n.length > 14 && g.n.includes(' ') ? [g.n.slice(0, g.n.lastIndexOf(' ', 14) > 0 ? g.n.lastIndexOf(' ', 14) : g.n.indexOf(' ')), g.n.slice((g.n.lastIndexOf(' ', 14) > 0 ? g.n.lastIndexOf(' ', 14) : g.n.indexOf(' ')) + 1)] : [g.n];
    return `<g class="q54-bar${dim ? ' dim' : ''}${sel === g.k ? ' on' : ''}" data-act="mf59Sc" data-v="${esc(g.k)}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="${cx - gw / 2 + 3}" y="${T - 18}" width="${gw - 6}" height="${ih + 18}" class="q54-hit" rx="10"/><rect x="${cx - bw / 2}" y="${y(g.v)}" width="${bw}" height="${T + ih - y(g.v)}" rx="7" fill="${ok ? '#6366F1' : '#F97316'}"/><text x="${cx}" y="${y(g.v) - 7}" text-anchor="middle" class="m59-bv">${lab(g.v)}</text><line x1="${cx - bw / 2 - 8}" x2="${cx + bw / 2 + 8}" y1="${y(g.t)}" y2="${y(g.t)}" class="m59-tg"/><text x="${cx + bw / 2 + 11}" y="${y(g.t) + 4}" class="m59-tl">${lab(g.t)}</text>${nm.map((t, j) => `<text x="${cx}" y="${H - B + 20 + j * 14}" text-anchor="middle" class="q54-xl">${esc(t)}</text>`).join('')}</g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Margin by scheme against target">${grid}${bars}</svg>`; }
export function mAppr59(ps){ const ok = sum(ps.filter(p => p.quoteOk), p => pMoney(p).q), wt = sum(ps.filter(p => !p.quoteOk), p => pMoney(p).q), tot = ok + wt; if(!tot) return empty('No quotes with these filters.');
  const r = 64, C = 2 * Math.PI * r, segs = [['Approved', ok, '#10B981'], ['Awaiting the client', wt, '#F59E0B']].filter(s => s[1] > 0); let off = 0;
  const arcs = segs.map(([n, v, c]) => { const len = v / tot * C, gap = segs.length > 1 ? 2.5 : 0, a = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${c}" stroke-width="26" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)" class="q54-seg" data-tip="${esc(`${n}: ${fm(v)}, ${pc(v / tot * 100)} of what is quoted`)}"/>`; off += len; return a; }).join('');
  return `<div class="m59-ap"><svg viewBox="0 0 180 180" class="m59-dsvg">${arcs}<text x="90" y="88" text-anchor="middle" class="q54-big">${pc(ok / tot * 100)}</text><text x="90" y="108" text-anchor="middle" class="q54-sm">approved</text></svg><div class="m59-apl">${[['Approved', ok, '#10B981'], ['Awaiting client', wt, '#F59E0B']].map(([n, v, c]) => `<div><span style="background:${c}"></span><b>${n}</b><em>${pc(v / tot * 100)}</em></div>`).join('')}</div></div>`; }
export function mIns59(ps){ const n = k => ps.filter(p => mSt59(p) === k).length, avgT = mSum53(ps).t;
  const card = (k, cls, ic, t, s, btn) => `<div class="m59-in ${cls}"><span class="m59-ii">${ico(ic, 18, 2.2)}</span><div><b>${t}</b><p>${s}</p><button type="button" class="m59-ib" data-act="mf59Only" data-v="${k}" aria-pressed="${S.f.mms.length === 1 && S.f.mms[0] === k}">${btn}${ico('chev', 12, 2.4)}</button></div></div>`;
  return card('below', 'am', 'alert', 'Below target', `${plural(n('below'), 'property is', 'properties are')} under ${pc(avgT)}, the weighted target.`, 'Review')
    + card('over', 'rd', 'trend', 'Over budget', `${plural(n('over'), 'property costs', 'properties cost')} more than the budget.`, 'Investigate')
    + card('above', 'gr', 'check', 'Above target', `${plural(n('above'), 'property is', 'properties are')} on or above target.`, 'Healthy'); }
setMrgPage(function(){ const ps = mProps53(), m = mSum53(ps), d = Math.round(m.mgp - m.t);
  const k = [stat('tk', 'Total quoted', fm(m.q), plural(ps.length, 'property', 'properties')), stat('tg', 'Total margin', fm(m.mg), `${pc(m.mgp)} overall margin`), stat('ta', 'Forecast cost', fm(m.fc), `budget ${fm(sum(ps, p => pMoney(p).b))}`), stat(d >= 0 ? 'tg' : 'tred', 'vs target', `${d >= 0 ? '+' : ''}${d} pp`, `target ${pc(m.t)}`, 'mf59Only', d >= 0 ? 'above' : 'below')].join('');
  const rows = ps.map(p => { const x = pMoney(p), s = mSt59(p), t = scOf(p.sc).set.mg;
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="prMon" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.ph)}</small></td><td>${scPill55(p.sc)}</td><td class="m59-n">${fm(x.q)}</td><td class="m59-n">${fm(x.fc)}<small>budget ${fm(x.b)}</small></td><td>${mgTag(x.mgp, t)}</td><td><span class="m59-st ${s}"><i></i>${MST59[s]}</span></td><td>${p.qf ? `<button type="button" class="rd55-q has" data-act="qfView54" data-v="${p.id}" aria-label="View the quote for ${esc(p.ad)}">${ico('file', 15, 2)}View</button>` : '<span class="rd55-dash" title="No quote file yet">–</span>'}</td></tr>`; }).join('');
  return oph('Margins', 'Quoted value, forecast cost and margin against each scheme’s target.')
    + `<div class="cstats ov-k m59-k">${k}</div>`
    + `<div class="m59-g"><section class="rsec q54-c m59-c1"><div class="q54-ch"><h3>${ico('chart', 17)}Margin by scheme</h3><div class="q54-tg">${[['pct', '%'], ['gbp', '£']].map(([v, n]) => `<button type="button" data-act="mBy59" data-v="${v}" aria-pressed="${S.f.mby === v}" aria-label="${v === 'pct' ? 'As a percentage' : 'In pounds'}">${n}</button>`).join('')}</div></div><div class="q54-leg"><span><i style="background:#6366F1"></i>On or above target</span><span><i style="background:#F97316"></i>Below target</span><span><i class="m59-dash"></i>Target</span></div>${mBars59()}</section>`
    + `<section class="rsec q54-c m59-c3"><div class="q54-ch"><h3>${ico('spark', 17)}Margin insights</h3></div><div class="m59-ins">${mIns59(ps)}</div></section></div>`
    + mBar53()
    + `<section class="rd55 m59-tbl"><div class="rd55-w"><table class="rd55-t m59-t"><thead><tr><th>Property</th><th>Scheme</th><th>Quoted</th><th>Forecast cost</th><th>Margin</th><th>Status</th><th>Quote file</th></tr></thead><tbody>${rows || `<tr><td colspan="7">${empty('No properties match the search or the filters.')}</td></tr>`}</tbody></table></div></section>`; });
VIEWS.com.pages.mrg = mrgPage;
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.8') v.url = 'https://claude.ai/artifact/RK4qD6ned8mkiEXRsroUhJ'; } });
VERSIONS.push({v:'v5.9', date:TODAY, major:false, current:true, url:null, title:'Margins as a dashboard', sum:'Margins shows four key figures, margin by scheme against each target, client approval, three insights that filter the list, and one table with the quote file to view.', steps:[]});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.9') v.url = 'https://claude.ai/artifact/CYGUyavDFZ1ZNLqdNMoeLf'; } });
VERSIONS.push({v:'v5.10', date:TODAY, major:false, current:true, url:null, title:'Fewer Director reports, Margins without client approval', sum:'Director no longer has Daily summary or Team productivity. Margins keeps margin by scheme and the insights, without the client approval chart.', steps:[]});
