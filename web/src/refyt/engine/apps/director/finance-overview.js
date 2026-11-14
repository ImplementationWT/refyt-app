// Refyt · v5.38: Finance como resumen financiero.
import {
  CHK55, DB, DD, MEAS, OPENP, TODAY, VERSIONS, VIEWS, addDays, dDiff, dHead, esc, fPr, fk, fm,
  health93, ico, mMoney, pMoney, plural, prOf, ring69, stat, sum
} from "../../index.js";
/* =================== v5.38: Finance as the financial overview =================== */
export const FCOL88 = ['#6366F1', '#F97316', '#10B981', '#06B6D4', '#EC4899', '#EAB308'];
VIEWS.dir.pages.dfin = function dFin88(){ const d = DD(), days = d.dr === 'y' ? 365 : 28, from = addDays(TODAY, -days), ps = fPr(), pids = new Set(ps.map(p => p.id)), inP = on => on >= from && on <= TODAY;
  const ors = DB.or.filter(o => !['Requested', 'Rejected'].includes(o.st) && inP(o.on) && o.al.some(a => pids.has(a.pr))), sps = DB.sp.filter(s => ['Approved', 'Paid'].includes(s.st) && inP(s.on) && pids.has(s.pr));
  const spend = sum(ors, o => o.amt) + sum(sps, s => s.amt), byT = {}; ors.forEach(o => { byT[o.ct] = (byT[o.ct] || 0) + o.amt; }); sps.forEach(s => { byT['Subcontract labour'] = (byT['Subcontract labour'] || 0) + s.amt; });
  const types = Object.entries(byT).sort((a, b) => b[1] - a[1]), bySup = {}; ors.forEach(o => { bySup[o.sup] = (bySup[o.sup] || 0) + o.amt; }); sps.forEach(s => { bySup[s.sub] = (bySup[s.sub] || 0) + s.amt; }); const sups = Object.entries(bySup).sort((a, b) => b[1] - a[1]);
  const mm = ps.filter(p => OPENP.includes(p.ph)).map(pMoney), bud = sum(mm, x => x.b), rem = Math.max(0, sum(mm, x => x.b - x.act - x.com));
  const clients = [...new Map(DB.sc.filter(s => ps.some(p => p.sc === s.id)).map(s => [s.cl, s])).values()].map(s => { const scIds = DB.sc.filter(x => x.cl === s.cl).map(x => x.id), inv = DB.inv.filter(v => scIds.includes(prOf(v.pr).sc)), paid = inv.filter(v => v.paid), late = inv.filter(v => !v.paid && dDiff(v.due) < 0), avg = paid.length ? Math.round(sum(paid, v => dDiff(v.paid) - dDiff(v.on)) / paid.length) : null, worst = late.length ? Math.max(...late.map(v => -dDiff(v.due))) : 0, terms = s.set.terms;
    return {n:s.cl, sc:DB.sc.filter(x => x.cl === s.cl).map(x => x.n).join(', '), avg, terms, worst, none:!inv.length, slow:avg != null && avg > terms}; });
  const delays = clients.filter(c => c.worst || c.slow).length;
  const meas = Object.keys(MEAS).map(m => { let b = 0, a = 0; ps.forEach(p => p.ms.filter(x => x.m === m).forEach(x => { const k = mMoney(p, x); b += k.b; a += k.act; })); return {m, n:MEAS[m].n, b, a}; }).filter(x => x.b > 0);
  const kc = (cls, ic, lab, val, sub, act, v) => `<${act ? `button type="button" data-act="${act}" data-v="${v}"` : 'div'} class="f88-k ${cls}"><span class="f88-i">${ico(ic, 22, 2.2)}</span><div><small>${lab}</small><b>${val}</b><em>${sub}</em></div>${act ? ico('chev', 16, 2.4) : ''}</${act ? 'button' : 'div'}>`;
  const per = d.dr === 'y' ? 'last 12 months' : 'last 4 weeks';
  const donut = ring69(types.map(([n, v], i) => [n, v, FCOL88[i % FCOL88.length]]), fk(spend), per, 170, 22);
  const tleg = types.map(([n, v], i) => `<div><span style="background:${FCOL88[i % FCOL88.length]}"></span><b>${esc(n)}</b><em>${fk(v)}</em><i>${spend ? Math.round(v / spend * 100) : 0}%</i></div>`).join('') || '<p class="hint">No spend in this period.</p>';
  const smx = Math.max(1, ...sups.map(x => x[1]));
  const supRows = sups.slice(0, 7).map(([n, v]) => `<button type="button" class="f88-sr" data-act="supOpen" data-v="${esc(n)}" data-tip="${esc(n)}: ${fm(v)}, ${per}"><b>${esc(n)}</b><span class="f88-bar"><i style="width:${v / smx * 100}%"></i></span><em>${fm(v)}</em></button>`).join('') || '<p class="hint">No spend in this period.</p>';
  const cRow = c => { const pill = c.worst ? `<span class="rd55-p bl">${ico('alert', 13, 2.2)}${c.worst} days late</span>` : c.slow ? `<span class="rd55-p bk">${ico('clock', 13, 2.2)}Above terms</span>` : c.none ? '<span class="rd55-dash">–</span>' : `<span class="rd55-p ok">${CHK55}On track</span>`;
    return `<div class="f88-cr"><div><b>${esc(c.n)}</b><small>${esc(c.sc)}</small></div><div class="f88-cd"><b>${c.none ? 'No invoices yet' : c.avg == null ? 'Not paid yet' : `${c.avg} days`}</b><small>terms ${c.terms}</small></div>${pill}</div>`; };
  const mRow = x => { const pct = x.b ? Math.round(x.a / x.b * 100) : 0; return `<tr><td class="rd55-pr"><b class="v63-id">${esc(x.n)}</b></td><td class="m59-n">${fm(x.b)}</td><td class="m59-n">${fm(x.a)}</td><td class="f88-pg"><span class="f88-bar"><i style="width:${Math.min(100, pct)}%;background:${pct > 100 ? '#EF4444' : '#6366F1'}"></i></span><em>${pct}%</em></td></tr>`; };
  return dHead('Finance', 'Spend, budgets and supplier costs across the jobs, and how fast each client pays.')
    + `<div class="cstats ov-k m59-k">${stat('tk', 'Total spend', fm(spend), per)}${stat('tg', 'Budget remaining', fm(rem), `≈ ${bud ? Math.round(rem / bud * 100) : 0}% of the budget of open jobs`)}${stat(delays ? 'ta' : 'tg', 'Client payment delays', plural(delays, 'client', 'clients'), 'late or above terms', 'gogo', 'acc:inv')}${stat('tred', 'Active suppliers', new Set([...ors.map(o => o.sup), ...sps.map(s => s.sub)]).size, per, 'gogo', 'del:sup')}</div>`
    + `<div class="f88-g2">${health93()}<section class="rsec q54-c"><div class="q54-ch"><h3>${ico('users', 17)}Spend by supplier</h3></div><div class="f88-sl">${supRows}</div></section></div>`
    + `<div class="f88-g3"><section class="rsec q54-c"><div class="q54-ch"><h3>${ico('clock', 17)}Days to pay, per client <span class="q54-cnt">${clients.length}</span></h3></div><div class="f88-cl">${clients.map(cRow).join('')}</div></section><section class="rsec q54-c"><div class="q54-ch"><h3>${ico('grid', 17)}Budget vs actual, per measure <span class="q54-cnt">${meas.length}</span></h3></div><div class="rd55-w"><table class="rd55-t f88-t"><thead><tr><th>Measure</th><th>Budget</th><th>Actual</th><th>Progress</th></tr></thead><tbody>${meas.map(mRow).join('')}</tbody></table></div></section></div>`; };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.37') v.url = 'https://claude.ai/artifact/Wa9K1F6S25Rgnucgy2cDqJ'; } });
VERSIONS.push({v:'v5.38', date:TODAY, major:false, current:true, url:null, title:'Finance as the financial overview', sum:'Finance shows total spend, budget remaining, client payment delays and active suppliers; spend by cost type and by supplier; days to pay per client against their terms; and budget against actual per measure.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.38') v.url = 'https://claude.ai/artifact/LVmmZSAG4musKS2v8qt9Wy'; } });
VERSIONS.push({v:'v5.39', date:TODAY, major:false, current:true, url:null, title:'Soft lavender background', sum:'Every page background uses #FCFDFF, an almost white with a touch of blue, behind the white cards with their fine border.', steps:[]});
