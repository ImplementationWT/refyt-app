// Refyt · v5.18: Close out en el mismo diseño: cifras clave, avance, Needs a look, búsqueda y tabla.
import {
  A, CHK55, DB, HAND, S, TODAY, VERSIONS, VIEWS, csName, empty, esc, fbar57, ico, later, norm, oph,
  plural, ptOf, re57, scOf, scPill55, stat, swap57, trBar, visNote
} from "../../index.js";
/* =================== v5.18: Close out in the same design: key figures, progress chart, Needs a look, search and table =================== */
S.f.cq = ''; S.f.csc = ''; S.f.cst = '';
export const cHand68 = p => { const n = HAND.filter(h => !(h.includes('solar') && !p.ms.some(x => x.m === 'SPV') && !(p.u52 || {})['h:' + h]) && p.hand[h] !== 'na'), d = n.filter(h => p.hand[h]).length; return {n:n.length, d, left:n.filter(h => !p.hand[h])}; };
export const cTm68 = p => !!p.hand['TrustMark lodgement'];
export const cCs68 = p => { const st = ptOf(p).st; return {sys:ptOf(p).sys, s:csName(p), fin:(p.cs || 0) >= st.length - 1, i:(p.cs || 0) + 1, n:st.length}; };
export const cTags68 = p => { const h = cHand68(p), c = cCs68(p); return [h.d >= h.n ? 'hand' : 'handleft', cTm68(p) ? 'lodged' : 'tolodge', c.fin ? 'csdone' : 'cspend']; };
export const CTAG68 = {hand:'Handover complete', handleft:'Handover items left', tolodge:'To lodge with TrustMark', lodged:'Lodged with TrustMark', cspend:'Client system to finish', csdone:'Client system finished'};
export const cAll68 = () => DB.pr.filter(p => p.ph === 'F. Close out');
export const cRows68 = () => { const q = norm(S.f.cq); return cAll68().filter(p => (!S.f.csc || p.sc === S.f.csc) && (!S.f.cst || cTags68(p).includes(S.f.cst)) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))); };
export function cChart68(xs){ if(!xs.length) return empty('No properties in close out.');
  const W = 680, rowH = 58, T = 10, L = 190, R = 90, B = 30, H = T + xs.length * rowH + B, iw = W - L - R, x = v => L + v / 100 * iw, bh = 30;
  const grid = [0, 25, 50, 75, 100].map(v => `<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${T + xs.length * rowH}" class="q54-gl"/><text x="${x(v)}" y="${H - 8}" text-anchor="middle" class="q54-ax">${v}%</text>`).join('');
  const bars = xs.map((p, i) => { const h = cHand68(p), pct = h.n ? h.d / h.n * 100 : 100, done = pct >= 100 && cTm68(p) && cCs68(p).fin, col = done ? '#10B981' : pct >= 100 ? '#6366F1' : '#F59E0B', y = T + i * rowH + (rowH - bh) / 2, tip = `${p.ad}: handover ${h.d} of ${h.n}, ${cTm68(p) ? 'lodged with TrustMark' : 'to lodge with TrustMark'}, ${cCs68(p).sys} ${cCs68(p).s}. Click to open.`;
    return `<g class="q54-bar s67-bar" data-act="prClo" data-v="${p.id}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="0" y="${T + i * rowH + 2}" width="${W}" height="${rowH - 4}" class="q54-hit" rx="8"/><text x="${L - 12}" y="${y + bh / 2 - 1}" text-anchor="end" class="s67-n">${esc(p.ad)}</text><text x="${L - 12}" y="${y + bh / 2 + 12}" text-anchor="end" class="s67-ct">${esc(scOf(p.sc).n)}</text><rect x="${L}" y="${y}" width="${iw}" height="${bh}" rx="7" fill="#EEF2F6"/><rect x="${L}" y="${y}" width="${Math.max(6, x(pct) - L)}" height="${bh}" rx="7" fill="${col}"/><text x="${L + iw + 8}" y="${y + bh / 2 + 5}" class="m59-bv">${h.d}/${h.n}</text></g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Handover progress per property">${grid}${bars}</svg>`; }
export function cLook68(xs){ const items = [];
  xs.forEach(p => { const h = cHand68(p), c = cCs68(p);
    if(!cTm68(p) && h.d >= h.n - 1) items.push([0, 'am', 'alert', p, 'Lodge with TrustMark', `Handover ${h.d} of ${h.n}; the TrustMark lodgement is still to do.`, 'Lodge']);
    else if(h.left.length) items.push([1, 'bl', 'clock', p, `${plural(h.left.length, 'handover item', 'handover items')} left`, h.left.slice(0, 2).join(', ') + (h.left.length > 2 ? ` and ${h.left.length - 2} more.` : '.'), 'Finish handover']);
    if(!c.fin) items.push([2, 'rd', 'globe', p, `${c.sys}: ${c.s}`, `Step ${c.i} of ${c.n} in the client system; it closes the job and triggers payment.`, 'Update']); });
  const xs2 = items.sort((a, b) => a[0] - b[0]).slice(0, 4);
  if(!xs2.length) return `<div class="m59-in gr"><span class="m59-ii">${ico('check', 18, 2.2)}</span><div><b>All clear</b><p>Every handover, lodgement and client system update is done.</p></div></div>`;
  return xs2.map(([, cls, ic, p, t, s, btn]) => `<div class="m59-in ${cls}"><span class="m59-ii">${ico(ic, 18, 2.2)}</span><div><b>${esc(p.ad)}</b><p><strong>${esc(t)}.</strong> ${esc(s)}</p><button type="button" class="m59-ib" data-act="prClo" data-v="${p.id}">${btn}${ico('chev', 12, 2.4)}</button></div></div>`).join(''); }
VIEWS.del.pages.clo = function cloPage68(){ const all = cAll68(), xs = cRows68(), hc = all.filter(p => { const h = cHand68(p); return h.d >= h.n; }), tl = all.filter(p => !cTm68(p)), cp = all.filter(p => !cCs68(p).fin), c = patch => swap57(patch, () => cRows68().length), scs = [...new Set(all.map(p => p.sc))];
  const k = [stat('tk', 'In close out', all.length, 'properties in phase F'), stat('tg', 'Handover complete', `${hc.length} of ${all.length}`, 'every item in the pack', 'cSt68', 'hand', S.f.cst === 'hand'), stat(tl.length ? 'ta' : 'tg', 'To lodge with TrustMark', tl.length, tl.length ? 'lodgement still to do' : 'all lodged', 'cSt68', 'tolodge', S.f.cst === 'tolodge'), stat(cp.length ? 'tred' : 'tg', 'Client system to finish', cp.length, 'final upload or acceptance', 'cSt68', 'cspend', S.f.cst === 'cspend')].join('');
  const bar = fbar57({id:'clo', qk:'f', qv:['cq'], ph:'Search a property, postcode or scheme', nf:(S.f.csc ? 1 : 0) + (S.f.cst ? 1 : 0), clr:'cClr68', count:plural(xs.length, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'cSc68', v:'', n:'All schemes', c:c({csc:''}), on:!S.f.csc}, ...scs.map(id => ({a:'cSc68', v:id, n:scOf(id).n, c:c({csc:id}), on:S.f.csc === id}))]},
      {t:'Status', opts:[{a:'cSt68', v:'', n:'All statuses', c:c({cst:''}), on:!S.f.cst}, ...Object.entries(CTAG68).map(([v, n]) => ({a:'cSt68', v, n, c:c({cst:v}), on:S.f.cst === v}))]}],
    chips:[...(S.f.csc ? [['cSc68', '', scOf(S.f.csc).n]] : []), ...(S.f.cst ? [['cSt68', '', CTAG68[S.f.cst]]] : [])]});
  const row = p => { const h = cHand68(p), cs = cCs68(p), pct = h.n ? Math.round(h.d / h.n * 100) : 100;
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="prClo" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.pc || '')}</small></td><td>${scPill55(p.sc)}</td><td class="c68-h"><b>${h.d} of ${h.n}</b><span class="rd56-bar"><i style="width:${pct}%"></i></span></td><td>${cTm68(p) ? `<span class="rd55-p ok">${CHK55}TM-${720000 + parseInt(p.id.slice(3))}</span>` : `<span class="rd55-p bk">${ico('alert', 13, 2.2)}To lodge</span>`}</td><td class="c68-cs"><b>${esc(cs.sys)}</b><span class="rd55-p ${cs.fin ? 'ok' : 'rq'}">${cs.fin ? CHK55 : ico('clock', 13, 2.2)}${esc(cs.s)}</span></td></tr>`; };
  return trBar() + oph('Close out', 'Handover pack, lodgement with its TrustMark reference and the final uploads to the client system.', later('DocuSign sign off')) + visNote()
    + `<div class="cstats ov-k m59-k">${k}</div>`
    + bar + `<section class="rd55"><div class="rd55-w"><table class="rd55-t c68-t"><thead><tr><th>Property</th><th>Scheme</th><th>Handover</th><th>TrustMark</th><th>Client system</th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="5">${empty(all.length ? 'No property matches the search or the filters.' : 'No properties in close out.')}</td></tr>`}</tbody></table></div></section>`; };
A.cSc68 = el => { S.f.csc = el.dataset.v; re57(); };
A.cSt68 = el => { S.f.cst = el.closest('.stat') && S.f.cst === el.dataset.v ? '' : el.dataset.v; re57(); };
A.cClr68 = () => { S.f.csc = ''; S.f.cst = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.17') v.url = 'https://claude.ai/artifact/RMQqXH7eBG7CuePYhzK28R'; } });
VERSIONS.push({v:'v5.18', date:TODAY, major:false, current:true, url:null, title:'Close out in the new design', sum:'Close out has key figures, the search bar with filters and the new table with handover, TrustMark and client system.', steps:[]});
