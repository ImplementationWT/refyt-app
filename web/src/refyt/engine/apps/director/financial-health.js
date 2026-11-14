// Refyt · v5.42 a v5.44: Finance con la puntuación de salud financiera y la distribución en semicírculo.
import {
  DB, OPENP, TODAY, VERSIONS, VIEWS, dDiff, esc, fPr, fm, ico, mMoney, num, pIdx, pMoney, pc, plural,
  scOf, sum
} from "../../index.js";
/* =================== v5.42: Finance: financial health score (credit score style) with its factors =================== */
export function hGauge93(score, lab){ const cx = 160, cy = 150, r = 120, segs = [[0, 30, '#F87171'], [30, 50, '#FB923C'], [50, 70, '#FACC15'], [70, 85, '#3B82F6'], [85, 100, '#34D399']], ang = v => Math.PI + v / 100 * Math.PI, pt = (v, rr = r) => [cx + rr * Math.cos(ang(v)), cy + rr * Math.sin(ang(v))];
  const arcs = segs.map(([a, b, c]) => { const [x0, y0] = pt(a + 1.2), [x1, y1] = pt(b - 1.2); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/>`; }).join('');
  const [px, py] = pt(score), col = (segs.find(([a, b]) => score >= a && score <= b) || segs[4])[2];
  return `<svg viewBox="0 0 320 190" class="h93" role="img" aria-label="Financial health ${score}, ${lab}">${arcs}<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="12" fill="#fff" stroke="${col}" stroke-width="6"/><text x="${cx}" y="${cy - 8}" text-anchor="middle" class="h93-n">${score}</text><text x="${cx}" y="${cy + 22}" text-anchor="middle" class="h93-l">${lab}</text><text x="${cx - r}" y="${cy + 30}" text-anchor="middle" class="h93-m">0</text><text x="${cx + r}" y="${cy + 30}" text-anchor="middle" class="h93-m">100</text></svg>`; }
export function health93(){ const ps = fPr(), open = ps.filter(p => OPENP.includes(p.ph)), priced = ps.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled'), mm = priced.map(p => ({m:pMoney(p), t:scOf(p.sc).set.mg}));
  const mg = mm.length ? sum(mm, x => x.m.mgp) / mm.length : 0, tgt = mm.length ? sum(mm, x => x.t) / mm.length : 22;
  const inv = DB.inv.filter(v => ps.some(p => p.id === v.pr)), owed = inv.filter(v => !v.paid), od = owed.filter(v => dDiff(v.due) < 0), owedAmt = sum(owed, v => v.amt), odAmt = sum(od, v => v.amt);
  const paid = inv.filter(v => v.paid), dtp = paid.length ? Math.round(sum(paid, v => dDiff(v.paid) - dDiff(v.on)) / paid.length) : null;
  const ms = []; ps.forEach(p => p.ms.forEach(x => { const k = mMoney(p, x); if(k.b) ms.push({over:k.act + k.com > k.b}); })); const overN = ms.filter(x => x.over).length;
  const om = open.map(pMoney), bud = sum(om, x => x.b), used = bud ? sum(om, x => x.act + x.com) / bud * 100 : 0;
  const s1 = 30 * Math.min(1, Math.max(0, mg / (tgt || 1))), s2 = 25 * Math.pow(owedAmt ? 1 - odAmt / owedAmt : 1, 2), s3 = 25 * (ms.length ? 1 - overN / ms.length : 1), s4 = 20 * (dtp == null ? 1 : Math.max(0, Math.min(1, 1 - (dtp - 30) / 10)));
  const score = Math.round(s1 + s2 + s3 + s4), lab = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : score >= 30 ? 'Weak' : 'Poor';
  const f = (ok, v, l, sub) => `<div class="h93-f ${ok === true ? 'ok' : ok === false ? 'bad' : 'mid'}"><b>${v}</b><small>${l}</small>${sub ? `<em>${sub}</em>` : ''}</div>`;
  return `<section class="rsec q54-c h93-c"><div class="q54-ch"><h3>${ico('shield', 17)}Financial health</h3><span class="h93-h">Margin, cash coming in, budgets and how fast clients pay</span></div><div class="h93-g"><div class="h93-gw">${hGauge93(score, lab)}</div><div><small class="rf-ph h93-ft">Health factors</small><div class="h93-fs">`
    + f(mg >= tgt, pc(mg), 'Forecast margin', `target ${pc(tgt)}`)
    + f(odAmt ? false : true, fm(odAmt), 'Overdue from clients', `${plural(od.length, 'invoice', 'invoices')} past due`)
    + f(overN ? (overN > 1 ? false : null) : true, `${overN} of ${ms.length}`, 'Measures over budget', 'actual and committed')
    + f(dtp == null ? null : dtp <= 30, dtp == null ? '–' : `${dtp} days`, 'Average days to pay', 'terms 30 to 45 days')
    + f(used <= 85 ? true : used <= 100 ? null : false, pc(used), 'Budget used', 'open jobs, actual and committed')
    + f(owedAmt <= 40000 ? true : null, fm(owedAmt), 'Owed to us', `${plural(owed.length, 'invoice', 'invoices')} open`)
    + `</div></div></div></section>`; }
{ const oF = VIEWS.dir.pages.dfin; VIEWS.dir.pages.dfin = (...x) => { const h = oF(...x), i = -1; return i < 0 ? h : h.slice(0, i) + health93() + h.slice(i); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.41') v.url = 'https://claude.ai/artifact/GvKzSCfMvxa9YWWDRNzj2o'; } });
VERSIONS.push({v:'v5.42', date:TODAY, major:false, current:true, url:null, title:'Financial health score', sum:'Finance shows a financial health score from 0 to 100 on a coloured gauge, built from forecast margin against target, overdue money, measures over budget and days to pay, with six health factors beside it.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.42') v.url = 'https://claude.ai/artifact/2ocbD8339A1ixxxm51yTM8'; } });
VERSIONS.push({v:'v5.43', date:TODAY, major:false, current:true, url:null, title:'No gradients', sum:'Bars, gauges, progress bars, the activity labels, the trend areas and the active menu icon use solid colours instead of gradients.', steps:[]});

/* v5.44: segmented half-circle distribution (task distribution style) */
export function dist95(segs, big, sub){ const n = 18, tot = sum(segs, s => s[1]) || 1, cx = 160, cy = 154, r1 = 98, r2 = 146; let counts = segs.map(s => Math.round(s[1] / tot * n)), diff = n - sum(counts, x => x); counts[counts.indexOf(Math.max(...counts))] += diff; counts = counts.map((c, i) => segs[i][1] > 0 ? Math.max(1, c) : 0); while(sum(counts, x => x) > n){ const i = counts.indexOf(Math.max(...counts)); counts[i]--; }
  const cols = []; segs.forEach((s, i) => { for(let k = 0; k < counts[i]; k++) cols.push(s[2]); }); while(cols.length < n) cols.push('#E2E8F0');
  const bars = cols.map((c, i) => { const deg = 180 + i / (n - 1) * 180; return `<rect x="${r1}" y="-7" width="${r2 - r1}" height="14" rx="7" fill="${c}" transform="translate(${cx} ${cy}) rotate(${deg.toFixed(2)})"/>`; }).join('');
  return `<div class="d95"><svg viewBox="0 0 320 166" class="d95-s" role="img" aria-label="${esc(segs.map(s => `${s[0]} ${s[1]}`).join(', '))}">${bars}<text x="${cx}" y="${cy - 34}" text-anchor="middle" class="d95-t">Total tasks</text><text x="${cx}" y="${cy - 2}" text-anchor="middle" class="d95-b">${big}</text><text x="${cx}" y="${cy + 10}" text-anchor="middle" class="d95-u">${esc(sub || '')}</text></svg><div class="d95-l">${segs.map(([nm, v, c]) => `<div style="--c:${c}"><small>${esc(nm)}</small><b>${num(v)}<i>tasks</i></b></div>`).join('')}</div></div>`; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.43') v.url = 'https://claude.ai/artifact/6JZX4eL1eB3GUUjoRdWpGW'; } });
VERSIONS.push({v:'v5.44', date:TODAY, major:false, current:true, url:null, title:'Overall completion as a segmented half circle', sum:'Capacity and staffing shows overall completion as a half circle of blocks split into completed, upcoming and overdue, with the total in the middle and the three counts underneath.', steps:[]});
