// Refyt · v5.13: Variations and additional costs y Rates en el nuevo diseño; búsqueda en Quotes.
import {
  A, BUD, CHK55, DB, MEAS, RATE, ROLES, S, TODAY, VERSIONS, VIEWS, empty, esc, fbar57, fm, ico,
  isAdmin, norm, nx, oph, pc, plural, prOf, qBase54, qF54, re57, scOf, stat, sum, swap57, trBar
} from "../../index.js";
/* =================== v5.13: Variations and additional costs, and Rates, in the new design; Quotes gets the search bar =================== */
S.f.vq = ''; S.f.vty = ''; S.f.vst = ''; S.f.vsc = ''; S.f.rtq = ''; S.f.rtp = ''; S.f.qq = '';
export const VST63 = {'Waiting internal approval':['bk', 'clock', 'Waiting approval'], 'Waiting client approval':['rq', 'send', 'Waiting client'], 'Approved':['ok', '', 'Approved'], 'Rejected':['bl', 'x', 'Rejected']};
export const vaWho63 = v => { const sc = scOf(prOf(v.pr).sc); return v.amt > sc.set.vr ? 'dir' : v.ty === 'Variation' ? 'com' : 'oap'; };
export const vaRows63 = () => { const q = norm(S.f.vq); return DB.va.filter(v => (!S.f.vty || v.ty === S.f.vty) && (!S.f.vst || v.st === S.f.vst) && (!S.f.vsc || prOf(v.pr).sc === S.f.vsc) && (!q || norm(`${v.id} ${v.why} ${prOf(v.pr).ad} ${MEAS[v.m].n} ${v.ev}`).includes(q))).slice().reverse(); };
VIEWS.com.pages.var = function varPage63(){ const all = DB.va, wi = all.filter(v => v.st === 'Waiting internal approval'), wc = all.filter(v => v.st === 'Waiting client approval'), apV = all.filter(v => v.st === 'Approved' && v.ty === 'Variation'), apC = all.filter(v => v.st === 'Approved' && v.ty !== 'Variation'), xs = vaRows63(), c = patch => swap57(patch, () => vaRows63().length), scs = [...new Set(all.map(v => prOf(v.pr).sc))];
  const k = [stat('tk', 'Waiting approval', fm(sum(wi, v => v.amt)), plural(wi.length, 'item', 'items'), 'vSt63', 'Waiting internal approval', S.f.vst === 'Waiting internal approval'), stat('ta', 'Waiting for the client', fm(sum(wc, v => v.amt)), plural(wc.length, 'variation', 'variations'), 'vSt63', 'Waiting client approval', S.f.vst === 'Waiting client approval'), stat('tg', 'Variations approved', fm(sum(apV, v => v.amt)), 'added to what is quoted'), stat(apC.length ? 'tred' : 'tg', 'Additional costs approved', fm(sum(apC, v => v.amt)), 'added to forecast cost')].join('');
  const bar = fbar57({id:'var', qk:'f', qv:['vq'], ph:'Search a reason, property, measure or ID', nf:(S.f.vty ? 1 : 0) + (S.f.vst ? 1 : 0) + (S.f.vsc ? 1 : 0), clr:'vClr63', count:plural(xs.length, 'item', 'items'),
    cols:[{t:'Type', opts:[['', 'All types'], ['Variation', 'Variations'], ['Additional cost', 'Additional costs']].map(([v, n]) => ({a:'vTy63', v, n, c:c({vty:v}), on:S.f.vty === v}))},
      {t:'Status', opts:[['', 'All statuses'], ...Object.keys(VST63).map(s => [s, s])].map(([v, n]) => ({a:'vSt63', v, n, c:c({vst:v}), on:S.f.vst === v}))},
      {t:'Scheme', opts:[{a:'vSc63', v:'', n:'All schemes', c:c({vsc:''}), on:!S.f.vsc}, ...scs.map(id => ({a:'vSc63', v:id, n:scOf(id).n, c:c({vsc:id}), on:S.f.vsc === id}))]}],
    chips:[...(S.f.vty ? [['vTy63', '', S.f.vty === 'Variation' ? 'Variations' : 'Additional costs']] : []), ...(S.f.vst ? [['vSt63', '', S.f.vst]] : []), ...(S.f.vsc ? [['vSc63', '', scOf(S.f.vsc).n]] : [])]});
  const row = v => { const p = prOf(v.pr), [cl, ic, l] = VST63[v.st] || ['nb', '', v.st], who = vaWho63(v), mine = S.role === who || isAdmin(), vt = v.ty === 'Variation';
    const act = v.st === 'Waiting internal approval' && mine ? `<button type="button" class="rd56-tlb" data-act="vaOk" data-v="${v.id}">${ico('check', 14, 2.4)}Approve</button>` : v.st === 'Waiting client approval' && (S.role === 'com' || isAdmin()) ? `<button type="button" class="rd56-tlb" data-act="vaClient" data-v="${v.id}">${ico('check', 14, 2.4)}Client approved</button>` : '';
    return `<tr><td class="rd55-pr"><b class="v63-id">${v.id}</b><small class="v63-why">${esc(v.why)}</small></td><td class="rd55-pr"><button class="rd55-pn" data-act="prMon" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(MEAS[v.m].n)}</small></td><td><span class="rd55-sc" style="${vt ? 'background:#E0E7FF;color:#3730A3' : 'background:#FFEDD5;color:#9A3412'}">${vt ? 'Variation' : 'Additional cost'}</span></td><td class="m59-n">${fm(v.amt)}<small>${vt ? 'to the quote' : 'to the cost'}</small></td><td class="v63-ev">${v.ev ? `${ico('clip', 13, 2)}<span>${esc(v.ev)}</span>` : '–'}</td><td><span class="rd55-p ${cl}">${cl === 'ok' ? CHK55 : ic ? ico(ic, 13, 2.2) : ''}${l}</span>${v.st === 'Waiting internal approval' ? `<small class="v63-who">with ${ROLES[who][0]}</small>` : ''}</td><td>${act}</td></tr>`; };
  return trBar() + oph('Variations and additional costs', 'Variations add scope the client pays for; additional costs are extra cost we carry.', nx('vaNew', '', `${ico('plus', 14)}Raise one`))
    + `<div class="cstats ov-k m59-k">${k}</div>` + bar
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t v63-t"><thead><tr><th>Item</th><th>Property</th><th>Type</th><th>Amount</th><th>Evidence</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="7">${empty(all.length ? 'Nothing matches the search or the filters.' : 'No variations or additional costs yet.')}</td></tr>`}</tbody></table></div></section>`; };
A.vTy63 = el => { S.f.vty = el.dataset.v; re57(); };
A.vSt63 = el => { S.f.vst = el.closest('.stat') && S.f.vst === el.dataset.v ? '' : el.dataset.v; re57(); };
A.vSc63 = el => { S.f.vsc = el.dataset.v; re57(); };
A.vClr63 = () => { S.f.vty = ''; S.f.vst = ''; S.f.vsc = ''; re57(); };

/* Rates */
export const rtProg63 = () => S.f.rtp ? [S.f.rtp] : Object.keys(RATE);
export const rtRows63 = () => { const q = norm(S.f.rtq); return Object.keys(MEAS).filter(m => (!q || norm(`${MEAS[m].n} ${MEAS[m].s}`).includes(q)) && rtProg63().some(t => RATE[t][m])); };
VIEWS.com.pages.rate = function ratePage63(){ const progs = Object.keys(RATE), ms = rtRows63(), cols = rtProg63(), vals = progs.flatMap(t => Object.values(RATE[t]).filter(Boolean)), top = Math.max(...vals);
  const topM = progs.flatMap(t => Object.entries(RATE[t]).filter(([, v]) => v === top).map(([m]) => `${MEAS[m].n}, ${t}`))[0] || '';
  const k = [stat('tk', 'Programmes', progs.length, progs.join(', ')), stat('tg', 'Measures priced', Object.keys(MEAS).filter(m => progs.some(t => RATE[t][m])).length, `of ${Object.keys(MEAS).length} measures`), stat('ta', 'Budget', pc(BUD * 100), 'of each rate, the cost budget'), stat('tb', 'Highest rate', fm(top), topM)].join('');
  const bar = fbar57({id:'rate', qk:'f', qv:['rtq'], ph:'Search a measure', nf:S.f.rtp ? 1 : 0, clr:'rtClr63', count:plural(ms.length, 'measure', 'measures'),
    cols:[{t:'Programme', opts:[{a:'rtP63', v:'', n:'All programmes', c:null, on:!S.f.rtp}, ...progs.map(t => ({a:'rtP63', v:t, n:t, c:Object.values(RATE[t]).filter(Boolean).length, on:S.f.rtp === t}))]}],
    chips:S.f.rtp ? [['rtP63', '', S.f.rtp]] : []});
  const row = m => `<tr><td class="rd55-pr"><b class="v63-id">${esc(MEAS[m].n)}</b><small>${esc(MEAS[m].s)}</small></td>${cols.map(t => `<td class="m59-n">${RATE[t][m] ? `${fm(RATE[t][m])}<small>budget ${fm(RATE[t][m] * BUD)}</small>` : '<span class="rd55-dash" title="Not priced in this programme">–</span>'}</td>`).join('')}</tr>`;
  return trBar() + oph('Rates', 'The agreed price per measure and programme. Each quote is built from these; they are loaded with the scheme template.')
    + `<div class="cstats ov-k m59-k">${k}</div>` + bar
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t r63-t"><thead><tr><th>Measure</th>${cols.map(t => `<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>${ms.map(row).join('') || `<tr><td colspan="${cols.length + 1}">${empty('No measure matches the search.')}</td></tr>`}</tbody></table></div></section>`; };
A.rtP63 = el => { S.f.rtp = el.dataset.v; re57(); };
A.rtClr63 = () => { S.f.rtp = ''; re57(); };

/* Quotes: search bar with filters */
export const qQ63 = p => { const q = norm(S.f.qq); return !q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n} ${p.ms.map(x => MEAS[x.m].n).join(' ')}`).includes(q); };
export function qBar63(){ const c = patch => swap57(patch, () => qF54().filter(qQ63).length), scs = [...new Set(qBase54().map(p => p.sc))], ms = Object.keys(MEAS).filter(m => qBase54().some(p => p.ms.some(x => x.m === m))), stN = {ok:'Approved', wait:'Waiting for the client', nofile:'No quote file'};
  return fbar57({id:'quo', qk:'f', qv:['qq'], ph:'Search a property, postcode, scheme or measure', nf:(S.f.qsc ? 1 : 0) + (S.f.qm ? 1 : 0) + (S.f.qst ? 1 : 0), clr:'qClr54', count:plural(qF54().filter(qQ63).length, 'quote', 'quotes'),
    cols:[{t:'Scheme', opts:[{a:'qSc63', v:'', n:'All schemes', c:c({qsc:''}), on:!S.f.qsc}, ...scs.map(id => ({a:'qSc63', v:id, n:scOf(id).n, c:c({qsc:id}), on:S.f.qsc === id}))]},
      {t:'Measure', opts:[{a:'qM63', v:'', n:'All measures', c:c({qm:''}), on:!S.f.qm}, ...ms.map(m => ({a:'qM63', v:m, n:MEAS[m].n, c:c({qm:m}), on:S.f.qm === m}))]},
      {t:'Status', opts:[['', 'All statuses'], ['ok', 'Approved'], ['wait', 'Waiting for the client'], ['nofile', 'No quote file']].map(([v, n]) => ({a:'qSt63', v, n, c:c({qst:v}), on:S.f.qst === v}))}],
    chips:[...(S.f.qsc ? [['qSc63', '', scOf(S.f.qsc).n]] : []), ...(S.f.qm ? [['qM63', '', MEAS[S.f.qm].n]] : []), ...(S.f.qst ? [['qSt63', '', stN[S.f.qst]]] : [])]}); }
A.qSc63 = el => { S.f.qsc = el.dataset.v; re57(); };
A.qM63 = el => { S.f.qm = el.dataset.v; re57(); };
A.qSt63 = el => { S.f.qst = el.dataset.v; re57(); };
{ const oc = A.qClr54; A.qClr54 = () => { S.f.qq = ''; oc(); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.12') v.url = 'https://claude.ai/artifact/Y1MmR29MerrmsB9YY633ud'; } });
VERSIONS.push({v:'v5.13', date:TODAY, major:false, current:true, url:null, title:'Variations, Rates and Quotes in the new design', sum:'Variations and additional costs and Rates use the key figures, the search bar with filters and the new table. Variations can be approved or marked client approved from the list. Quotes and budgets gets the search bar with filters.', steps:[]});
