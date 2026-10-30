// Refyt · Lo que necesita atención: cada alerta trae su solución.
import {
  DB, LIMIT, OPENP, PHOWN, RN, approvals, bDone, dDiff, daysIn, fm, fmtD, holdOpen, late, pIdx, pMoney,
  pc, prOf, ptOf, ready, scOf, trig, tyOf
} from "../index.js";
export function alerts0(){ const xs = [];
  approvals().filter(a => a.role === 'dir').forEach(a => xs.push({id:'ad' + a.id, app:'dir', tone:'tred', k:'Approval above the limit', t:a.t, d:`${a.k}, ${fm(a.amt || 0)}. ${a.d}`, fix:['Open the approvals', 'gogo', 'dir:wait']}));
  DB.pr.forEach(p => { const t = `${p.id} ${p.ad}`, sc = scOf(p.sc), l = late(p);
    if(OPENP.includes(p.ph) && pIdx(p.ph) >= 2){ const m = pMoney(p); if(m.mgp < sc.set.mg) ['dir', 'com'].forEach(app => xs.push({id:'mg' + app + p.id + Math.round(m.mgp), app, tone:'tred', k:'Margin below target', t, d:`Forecast margin ${pc(m.mgp)} against the ${sc.n} target of ${sc.set.mg}%: ${fm(m.q)} quoted, ${fm(m.fc)} forecast cost.`, fix:['Open the money', 'prOpen', p.id + '|mon']})); else if(m.over) xs.push({id:'ob' + p.id, app:'com', tone:'ta', k:'Over budget', t, d:`Forecast cost ${fm(m.fc)} is over the budget of ${fm(m.b)}.`, fix:['Open the money', 'prOpen', p.id + '|mon']}); }
    if(l === 'red') xs.push({id:'lt' + p.id + p.ph, app:'dir', tone:'ta', k:'Over time', t, d:`${daysIn(p)} days in ${p.ph}, limit ${LIMIT[p.ph]}. Owner: ${RN(PHOWN[p.ph])}.`, fix:['Open the property', 'prOpen', p.id]});
    if(l && ['A. Job received', 'B. Assess and design'].includes(p.ph)) xs.push({id:'lr' + p.id + p.ph, app:'ret', tone:l === 'red' ? 'tred' : 'ta', k:'Over time', t, d:`${daysIn(p)} days in ${p.ph}, limit ${LIMIT[p.ph]}.`, fix:['Open the property', 'prOpen', p.id + '|ret']});
    if(['A. Job received', 'B. Assess and design'].includes(p.ph) && !p.b.vis && p.b.revisits) xs.push({id:'rv' + p.id + p.b.revisits, app:'ret', tone:'tred', k:'Revisit', t, d:`Assessment rejected. Revisit ${p.b.revisits} to carry out.`, fix:['Mark revisit done', 'bVis', p.id]});
    if(p.ph === 'A. Job received' && !p.b.bk) xs.push({id:'bk' + p.id, app:'ret', tone:'tb', k:'Book assessment', t, d:`${sc.cl} sent it, reference ${p.ref}. ${ptOf(p).sys === 'Dynamics' ? 'Enter the date in Dynamics once booked.' : ''}`, fix:['Book assessment', 'bBook', p.id]});
    if(p.ph === 'B. Assess and design' && bDone(p)) xs.push({id:'bc' + p.id, app:'ret', tone:'tg', k:'Survey pack ready', t, d:`Phase B checks pass. Send the pack to ${ptOf(p).sys} for client approval.`, fix:['Send to client approval', 'phNext', p.id]});
    if(p.ph === 'D. Prepare to install' && ready(p)) xs.push({id:'ri' + p.id, app:'del', tone:'tg', k:'Ready to install', t, d:'Every phase D item that applies is done.', fix:['Start install', 'phNext', p.id]});
    if(p.ph === 'E. Install' && holdOpen(p) && (p.hold || p.hold2)) xs.push({id:'hp' + p.id, app:'del', tone:'tred', k:'Hold point', t, d:p.hold || p.hold2, fix:['Open the install', 'prOpen', p.id + '|ins']});
    if(p.csTodo) xs.push({id:'cs' + p.id + p.cs, app:p.ph === 'B. Assess and design' || p.ph === 'A. Job received' ? 'ret' : 'del', tone:'ta', k:`Update ${ptOf(p).sys}`, t, d:p.csTodo, fix:['Mark as updated', 'csDone', p.id]});
    const trig = (tyOf(p) === 'E.ON' && p.cs >= 7) || (tyOf(p) === 'GLA' && p.cs >= 6) || (tyOf(p) === 'Redbridge' && p.cs >= 4);
    if(trig && !DB.inv.some(v => v.pr === p.id) && p.ph !== 'Paid') xs.push({id:'tr' + p.id, app:'acc', tone:'tb', k:'Payment trigger met', t, d:`${ptOf(p).trig}. Invoice ${fm(pMoney(p).q)} to ${sc.cl}.`, fix:['Create invoice', 'invNew', p.id]});
  });
  DB.inv.filter(v => !v.paid && dDiff(v.due) < 0).forEach(v => xs.push({id:'od' + v.id, app:'acc', tone:'tred', k:'Invoice overdue', t:`${v.id} ${prOf(v.pr).ad}`, d:`${fm(v.amt)}, due ${fmtD(v.due)}.`, fix:['Mark paid', 'invPaid', v.id]}));
  DB.sp.filter(s => s.st === 'Approved').forEach(s => xs.push({id:'pp' + s.id, app:'acc', tone:'tb', k:'Subcontractor to pay', t:`${s.sub}, ${prOf(s.pr).ad}`, d:`${s.stage}: ${fm(s.amt)} approved.`, fix:['Mark paid', 'spPaid', s.id]}));
  DB.va.filter(v => v.st === 'Waiting client approval').forEach(v => xs.push({id:'vc' + v.id, app:'com', tone:'ta', k:'Client approval', t:`${v.id} ${prOf(v.pr).ad}`, d:`${v.why}: ${fm(v.amt)}.`, fix:['Client approved', 'vaClient', v.id]}));
  DB.or.filter(o => o.st === 'Delivered').slice(0, 3).forEach(o => xs.push({id:'dv' + o.id, app:'pur', tone:'tb', k:'Match supplier invoice', t:`${o.id} ${o.sup}`, d:`Delivered: ${fm(o.amt)}. When the invoice reaches Xero it becomes actual cost.`, fix:['Mark invoiced', 'orInv', o.id]}));
  DB.tk.filter(k => !k.done && dDiff(k.due) < 0).forEach(k => xs.push({id:'tk' + k.id, app:'tsk', tone:'tred', k:'Task overdue', t:k.t, d:`${RN(k.r)}, due ${fmtD(k.due)}. From ${k.src}.`, fix:['Mark done', 'tkDone', k.id]}));
  return xs; }
