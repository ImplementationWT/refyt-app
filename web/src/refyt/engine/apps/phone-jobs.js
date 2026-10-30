// Refyt · Teléfono: mis propiedades y lo que debo hacer.
import {
  A, DB, DSH, PEO, ROLES, S, SITEP, TODAY, VERSIONS, VIEWS, esc, fmtDy, fromIso, go, ico, phoneStage,
  pill, plural, prOf, render, scOf, sfCur, sfItems, sum
} from "../index.js";
export const TRADE = key => { const [kind, k] = key.split(':'); return kind === 'g' ? {stl:'akr', wal:'akr', ven:'sub:Medway Electrical Ltd', rof:'akr', win:'akr', ewi:'sub:Redbridge Render Co', led:'sub:Medway Electrical Ltd', hnd:'akr', pre:'akr'}[k] : {LI:'sub:Insulation Supplies Direct', CWI:'sub:Insulation Supplies Direct', EWI:'sub:Redbridge Render Co', IWI:'sub:Insulation Supplies Direct', SPV:'sub:Medway Electrical Ltd', DMEV:'sub:Medway Electrical Ltd', LED:'sub:Medway Electrical Ltd', WIN:'akr'}[k]; };
export const SUSERS = [['akr', 'Akram', 'Site manager, sees every job on site'], ['sub:Redbridge Render Co', 'Redbridge Render Co', 'Wall insulation subcontractor'], ['sub:Medway Electrical Ltd', 'Medway Electrical Ltd', 'Solar, ventilation and lighting'], ['sub:Insulation Supplies Direct', 'Insulation Supplies Direct', 'Loft and cavity fitters']];
export const AUSERS = [['afa', 'Afaq Ahmad', 'Assessor'], ['xen', 'Xeni Ratkoceri', 'Assessor']];
if(!SITEP.some(x => x[0] === 'sub:Insulation Supplies Direct')) SITEP.push(['sub:Insulation Supplies Direct', 'Insulation Supplies Direct fitters']);
export const suName = u => (SUSERS.find(x => x[0] === u) || ['', u])[1];
export const jobType = it => it.hp && it.st !== 'Completed' ? 'Inspection' : it.st === 'Not started' ? 'Start work' : 'Progress update';
export const JT = {'Inspection':'ta', 'Start work':'tk', 'Progress update':'tb', 'Site assessment':'tb', 'Revisit':'ta'};
export const pctOf = (p, key) => { const c = sfCur(p, key); return c && c < 100 ? ` ${c}%` : ''; };
export function siteJobs(u){ return DB.pr.filter(p => p.ph === 'E. Install').map(p => ({p, items:sfItems(p).filter(i => i.st !== 'Completed' && (u === 'akr' || TRADE(i.key) === u))})).filter(x => x.items.length); }
export const userSide = (users, cur, act) => `<div class="seg2 um-seg">${users.map(([k, n, r]) => `<button type="button" class="${cur === k ? 'on' : ''}" aria-pressed="${cur === k}" data-act="${act}" data-v="${k}"><span style="display:flex;flex-direction:column;align-items:flex-start"><b>${n}</b><small style="font-weight:500">${r}</small></span></button>`).join('')}</div>`;
export const sideFix = h => h.replace('<small class="rf-ph" style="margin-top:6px">Property</small>', '<small class="rf-ph" style="margin-top:6px">Signed in as</small>');
export const swapSide = (h, side) => { const i = h.indexOf('<div class="rf-stgp">'), j = h.indexOf('<button class="btn', i); return i < 0 || j < 0 ? h : h.slice(0, i) + '<div class="rf-stgp">' + side + '</div>' + h.slice(j); };
/* Delivery site app */
export const prevSite = VIEWS.del.pages.site;
VIEWS.del.pages.site = () => { const u = S.f.su || 'akr', jobs = siteJobs(u), side = userSide(SUSERS, u, 'suSet');
  if(S.f.mp && S.f.sfi && S.f.sff) return sideFix(swapSide(prevSite(), side));
  const p = S.f.mp && jobs.find(j => j.p.id === S.f.mp) ? prOf(S.f.mp) : null;
  let inner;
  if(!p) inner = `<div class="rf-hi"><small>${DSH[fromIso(TODAY).getDay()]}, ${fmtDy(TODAY)}</small><b>Hi ${suName(u).split(' ')[0]}</b><span>${plural(jobs.length, 'property', 'properties')}, ${plural(sum(jobs, j => j.items.length), 'job', 'jobs')} assigned to you</span></div><small class="rf-ph">My properties</small>`
    + (jobs.length ? jobs.map(({p: q, items}) => `<button class="rf-jc" data-act="phProp" data-v="${q.id}"><div class="rf-jch"><b>${esc(q.ad)}</b><small>${scOf(q.sc).n}${q.ht ? ', ' + q.ht : ''}</small></div>${items.slice(0, 3).map(i => `<div class="rf-jl">${pill(JT[jobType(i)], jobType(i))}<span>${i.n}${pctOf(q, i.key)}</span></div>`).join('')}${items.length > 3 ? `<small class="rf-more3">and ${items.length - 3} more</small>` : ''}${ico('chev', 14)}</button>`).join('') : '<div class="rf-free" style="padding:20px 0">Nothing assigned to you right now.</div>');
  else { const mine = jobs.find(j => j.p.id === p.id).items, others = sfItems(p).filter(i => !mine.includes(i) && i.st !== 'Completed').length, rec = p.sfr || {};
    inner = `<button class="lnk4" data-act="phHome" style="margin-bottom:8px">${ico('chev', 12)} My properties</button><div class="rf-ph-h"><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}${p.ht ? ', ' + p.ht : ''}. ${esc(p.res)}</small></div><small class="rf-ph">What you are assigned to do here</small>`
      + mine.map(i => { const r = rec[i.key], t = jobType(i); return `<button class="rf-dl rf-tap" data-act="sfOpen" data-v="${i.key}"><span class="rf-ck"></span><div><b>${i.n}${pctOf(p, i.key)}</b><small>${t === 'Inspection' ? `Hold point: ${i.hp}` : r ? `Last: ${r.st}, ${fmtDy(r.on)}, ${r.whoN}` : t === 'Start work' ? 'Not started yet' : 'Record today’s progress'}</small></div>${pill(JT[t], t)}</button>`; }).join('')
      + (others ? `<small class="rf-free" style="display:block;margin:6px 2px">${plural(others, 'other job', 'other jobs')} on this property ${others === 1 ? 'is' : 'are'} assigned to other teams.</small>` : '') + `<button class="btn sec" style="width:100%;margin-top:8px" data-act="mFlag" data-v="${p.id}">${ico('flag', 15)}Flag a problem</button>`; }
  return sideFix(phoneStage('del', 'Site forms', side, inner)); };
A.suSet = el => { S.f.su = el.dataset.v; S.f.mp = null; S.f.sfi = null; S.f.sff = null; render(); };
A.phProp = el => { S.f.mp = el.dataset.v; S.f.sfi = null; S.f.sff = null; render(); };
A.phHome = () => { S.f.mp = null; S.f.sfi = null; S.f.sff = null; render(); };
/* Retrofit assessor app */
export const asJobs = u => DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && p.b.who === u && p.b.bk).sort((a, b) => (a.b.on || '') < (b.b.on || '') ? -1 : 1);
export const asSt = p => !p.b.vis ? (p.b.revisits ? 'Revisit' : 'Site assessment') : p.b.rev === 'Approved' ? 'Approved' : 'In review';
export const prevAsf = VIEWS.ret.pages.asf;
VIEWS.ret.pages.asf = () => { const u = S.f.au || (S.role === 'ass' ? ROLES.ass[1] : 'afa'), jobs = asJobs(u), side = userSide(AUSERS, u, 'auSet');
  if(S.f.ap2 && jobs.some(p => p.id === S.f.ap2)){ S.f.ap = S.f.ap2; const h = sideFix(swapSide(prevAsf(), side)); return h.replace('<div class="rf-scroll">', `<div class="rf-scroll"><button class="lnk4" data-act="phHomeA" style="margin-bottom:8px">${ico('chev', 12)} My visits</button>`); }
  const up = jobs.filter(p => !p.b.vis), rv = jobs.filter(p => p.b.vis);
  const card = p => `<button class="rf-jc" data-act="phAs" data-v="${p.id}"><div class="rf-jch"><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}, ${p.ref}</small></div><div class="rf-jl">${pill(asSt(p) === 'Approved' ? 'tg' : JT[asSt(p)] || 'tk', asSt(p))}<span>${p.b.on ? `${fmtDy(p.b.on)}, ${p.b.h}` : ''}</span></div>${ico('chev', 14)}</button>`;
  const inner = `<div class="rf-hi"><small>${DSH[fromIso(TODAY).getDay()]}, ${fmtDy(TODAY)}</small><b>Hi ${PEO[u].n.split(' ')[0]}</b><span>${plural(up.length, 'visit', 'visits')} to do, ${rv.length} submitted</span></div><small class="rf-ph">To visit</small>${up.map(card).join('') || '<div class="rf-free" style="padding:8px 0">No visits booked for you.</div>'}${rv.length ? `<small class="rf-ph" style="margin-top:10px">Submitted</small>${rv.map(card).join('')}` : ''}`;
  return sideFix(phoneStage('ret', 'Assessor form', side, inner)); };
A.auSet = el => { S.f.au = el.dataset.v; S.f.ap2 = null; render(); };
A.phAs = el => { S.f.ap2 = el.dataset.v; render(); };
A.phHomeA = () => { S.f.ap2 = null; render(); };
{ const o = A.setRole; A.setRole = el => { o(el); if(S.role === 'ass'){ S.f.au = ROLES.ass[1]; S.f.ap2 = null; } if(S.role === 'sit'){ S.f.su = 'akr'; S.f.mp = null; } }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/1T6dPuosxbjx8ifKSoafTY'; } });
VERSIONS.push({v:'v3.13', date:TODAY, major:false, current:true, url:null, title:'Phone app: my properties and what I must do there', sum:'The site and assessor phone apps open on the properties assigned to the signed-in person, with what they must do in each: an inspection, starting work, a progress update, a site assessment or a revisit.', steps:[
  {t:'My properties on the phone', min:.5, dolor:'Before, the property was picked outside the phone, and everyone saw everything.', show:['Signed in as a subcontractor, the phone lists only their properties and jobs.', 'Each job says what to do: inspection, start work or progress update.', 'The assessor sees their booked visits and revisits, and what they submitted.'], say:'Each person opens the app and sees their day.', go:() => { S.role = 'sit'; S.f.su = 'sub:Medway Electrical Ltd'; S.f.mp = null; go('del', 'site'); }},
]});
