// Refyt · v5.17: Suppliers: gráfico de gasto y Needs a look con el diseño de Margins.
import {
  TODAY, VERSIONS, empty, esc, fm, ico, kfm54, plural
} from "../../index.js";
/* =================== v5.17: Suppliers: spend chart and Needs a look in the Margins design =================== */
export function supChart67(rs){ const xs = rs.filter(r => r.q).sort((a, b) => b.q - a.q).slice(0, 8); if(!xs.length) return empty('No spend this quarter.');
  const W = 680, rowH = 58, T = 10, L = 190, R = 70, B = 30, H = T + xs.length * rowH + B, iw = W - L - R, top = Math.max(...xs.map(r => r.q)), step = Math.max(1000, Math.ceil(top / 4 / 1000) * 1000), mx = step * 4;
  const x = v => L + v / mx * iw, bh = 30;
  const grid = [0, 1, 2, 3, 4].map(i => `<line x1="${x(step * i)}" x2="${x(step * i)}" y1="${T}" y2="${T + xs.length * rowH}" class="q54-gl"/><text x="${x(step * i)}" y="${H - 8}" text-anchor="middle" class="q54-ax">${kfm54(step * i)}</text>`).join('');
  const bars = xs.map((r, i) => { const y = T + i * rowH + (rowH - bh) / 2, lab = /labour/i.test(r.ct || '') ? '#F97316' : /plant|hire|scaffold/i.test(r.ct || '') ? '#06B6D4' : '#6366F1', tip = `${r.n}: ${fm(r.q)} last 3 months, ${plural(r.open, 'open order', 'open orders')}. Click for its orders.`;
    return `<g class="q54-bar s67-bar" data-act="supOpen" data-v="${esc(r.n)}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="0" y="${T + i * rowH + 2}" width="${W}" height="${rowH - 4}" class="q54-hit" rx="8"/><text x="${L - 12}" y="${y + bh / 2 - 1}" text-anchor="end" class="s67-n">${esc(r.n)}</text><text x="${L - 12}" y="${y + bh / 2 + 12}" text-anchor="end" class="s67-ct">${esc(r.ct || '')}</text><rect x="${L}" y="${y}" width="${Math.max(4, x(r.q) - L)}" height="${bh}" rx="7" fill="${lab}"/><text x="${x(r.q) + 8}" y="${y + bh / 2 + 5}" class="m59-bv">${kfm54(r.q)}</text></g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Spend by supplier, last 3 months">${grid}${bars}</svg>`; }
export function supLook67(rs){ const xs = rs.filter(r => r.open || r.match).sort((a, b) => (b.match - a.match) || (b.open - a.open)).slice(0, 4);
  if(!xs.length) return `<div class="m59-in gr"><span class="m59-ii">${ico('check', 18, 2.2)}</span><div><b>All clear</b><p>No open orders or invoices waiting.</p></div></div>`;
  return xs.map(r => { const m = r.match > 0, cls = m ? 'am' : 'bl';
    return `<div class="m59-in ${cls}"><span class="m59-ii">${ico(m ? 'alert' : 'clock', 18, 2.2)}</span><div><b>${esc(r.n)}</b><p>${plural(r.open, 'open order', 'open orders')}${m ? `, ${r.match} delivered without the supplier invoice.` : ', nothing to match yet.'}</p><button type="button" class="m59-ib" data-act="supOpen" data-v="${esc(r.n)}">${m ? 'Match invoices' : 'See orders'}${ico('chev', 12, 2.4)}</button></div></div>`; }).join(''); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.16') v.url = 'https://claude.ai/artifact/CC2XWRCCvsSquTkTgMK3qc'; } });
VERSIONS.push({v:'v5.17', date:TODAY, major:false, current:true, url:null, title:'Suppliers: chart and Needs a look like Margins', sum:'Spend by supplier keeps horizontal bars in the Margins chart design, coloured by cost type and clickable; Needs a look shows insight cards with an action each.', steps:[]});
