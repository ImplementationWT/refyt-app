// Refyt · Director: plantillas de esquema.
import {
  A, ADOCS, BUD, DB, DITEMS, EVID, HAND, IN, LIMIT, ME, MODALS, PTYPE, RATE, S, TODAY, VERSIONS, esc,
  fld, go, mfoot, mlab, modal, mseg, numIn, refocus, render, renderLayer, scOf, toast
} from "../../index.js";
export const mkTpl = (id, n, ty, from) => { const pt = PTYPE[ty] || {sys:'None', st:['Received', 'In progress', 'Complete'], trig:'Work accepted by the client', terms:30}, s = from ? scOf(from) : null;
  return {id, n, ty, sys:pt.sys, st:[...pt.st], trig:pt.trig, ms:Object.keys(RATE[ty] || {LI:1, CWI:1}), rates:{...(RATE[ty] || {LI:1250, CWI:1900})}, bud:Math.round(BUD * 100), set:s ? {...s.set} : {mg:20, ord:2000, pay:2500, vr:1000, terms:pt.terms}, lim:{...LIMIT}, ev:[...EVID], docs:[...ADOCS], d:DITEMS.map(x => x[0]).filter(k => ty === 'Redbridge' || k !== 'gas' || true), hand:[...HAND], groups:ty === 'Redbridge'}; };
DB.tpl = [mkTpl('TP-1', 'E.ON type', 'E.ON', 'SC-01'), mkTpl('TP-2', 'GLA type', 'GLA', 'SC-05'), mkTpl('TP-3', 'Redbridge type', 'Redbridge', 'SC-06')];
DB.seq.tp = 3;
export const tpOf = id => DB.tpl.find(t => t.id === id);
export const TPCTRL = [['Client system and its statuses', 'Dynamics, Shareworks, PAS Hub or none, and the statuses each property moves through, with the reminders to update it.'], ['Measures and rates', 'Which measures the scheme installs, the agreed price per measure and the budget cost.'], ['Settings', 'Margin target, order, payment and variation limits, and payment terms.'], ['Time limits per phase', 'When a property turns amber and red in each phase.'], ['Checklists', 'RdSAP evidence, assessment documents, phase D items and the handover pack.'], ['Install tracking', 'By measure, or by group with hold points as on Redbridge.'], ['Payment trigger', 'The event that tells Accounts to invoice.']];
export const tpLog = (t, what) => { t.on = TODAY; t.by = ME(); };
IN.tp = t => { const [id, f] = t.dataset.k.split('|'), x = tpOf(id); x[f] = t.value; tpLog(x); };
IN.tps = t => { const id = t.dataset.k.split('|')[1], x = tpOf(id); x.sys = t.value; };
IN.tpSt = t => { const [id, i] = t.dataset.k.split('|'); tpOf(id).st[+i] = t.value; };
A.tpStDel = el => { const [id, i] = el.dataset.v.split('|'), x = tpOf(id); if(x.st.length <= 2) return toast('A client system needs at least two statuses.'); x.st.splice(+i, 1); render(); };
A.tpStAdd = el => { tpOf(el.dataset.v).st.push('New status'); render(); };
IN.tpRate = t => { const [id, m] = t.dataset.k.split('|'); tpOf(id).rates[m] = numIn(t.value); refocus(render); };
IN.tpSet = t => { const [id, sk] = t.dataset.k.split('|'); tpOf(id).set[sk] = numIn(t.value); };
IN.tpLim = t => { const [id, ph] = t.dataset.k.split('|'); tpOf(id).lim[ph] = numIn(t.value); };
A.tpTog = el => { const [id, f, v] = el.dataset.v.split('|'), x = tpOf(id), arr = x[f]; if(arr.includes(v)) arr.splice(arr.indexOf(v), 1); else arr.push(v); if(f === 'ms' && !x.rates[v]) x.rates[v] = RATE['E.ON'][v] || RATE.GLA[v] || RATE.Redbridge[v] || 1000; render(); };
A.tpGroups = el => { const [id, v] = el.dataset.v.split('|'); tpOf(id).groups = v === '1'; render(); };
A.tpEdit = el => { S.f.tpe = el.dataset.v; render(true); };
A.tpBack = () => { S.f.tpe = null; render(true); };
export const tpClone = (src, n) => { const t = JSON.parse(JSON.stringify(src)); t.id = 'TP-' + (++DB.seq.tp); t.n = n; DB.tpl.push(t); return t; };
A.tpDup = el => { const t = tpClone(tpOf(el.dataset.v), tpOf(el.dataset.v).n + ' (copy)'); S.f.tpe = t.id; render(true); toast('Template duplicated. Rename it and adjust what you need.'); };
A.tpFromSc = el => { const s = scOf(el.dataset.v), base = DB.tpl.find(t => t.ty === s.ty) || DB.tpl[0], t = tpClone(base, `${s.n} template`); t.set = {...s.set}; S.f.tpe = t.id; render(true); toast(`${esc(s.n)} saved as a template.`); };
A.tpNew = () => { S.modal = {k:'tp9', n:'', from:''}; renderLayer(); };
MODALS.tp9 = m => modal('New template', 'Start blank or from a template you already have, then set what it controls.', fld('Template name', 'm', 'n', m.n, {req:true, ph:'e.g. Warm Homes Local Grant type'}) + mlab('Start from', true) + mseg('from', m.from, [['blank', 'Blank'], ...DB.tpl.map(t => [t.id, t.n])]), mfoot('Create template', 'tpOk9', !!((m.n || '').trim() && m.from)), 560);
A.tpOk9 = () => { const m = S.modal; let t; if(m.from === 'blank'){ t = mkTpl('TP-' + (++DB.seq.tp), m.n.trim(), 'Blank'); t.ms = []; t.rates = {}; DB.tpl.push(t); } else t = tpClone(tpOf(m.from), m.n.trim()); S.modal = null; S.f.tpe = t.id; render(true); toast('Template created. Set what it controls.'); };
/* New scheme from a template: it takes the template’s client system, statuses, rates, settings and checklists */
A.nsOpenT = el => { const t = tpOf(el.dataset.v); S.f.tpe = null; S.modal = {k:'ns9', from:'', tpl:t.id, n:'', clid:'', reg:'', prog:t.sys === 'Dynamics' ? 'EON' : 'NONE', tgt:'', nn:'', nty:'', nreg:'', nsys:''}; renderLayer(); };
{ const oM = MODALS.ns9; MODALS.ns9 = m => { const h = oM(m); return m.tpl ? h.replace(/Blank: phases A and B, settings to fill in\.|Starting from[^<]*\./, `From the template ${esc(tpOf(m.tpl).n)}: its client system, statuses, rates, settings, time limits and checklists.`) : h; };
  const oOk = A.nsOk9; A.nsOk9 = el => { const tid = S.modal.tpl; oOk(el); if(!tid) return; const t = tpOf(tid), s = DB.sc[DB.sc.length - 1], key = t.groups ? 'Redbridge' : (PTYPE[t.ty] ? t.ty : 'TPL ' + t.id);
    if(key.startsWith('TPL')){ PTYPE[key] = {sys:t.sys, st:[...t.st], trig:t.trig, terms:t.set.terms}; RATE[key] = {...t.rates}; }
    else if(t.ty !== 'Blank' && !t.groups){ PTYPE[key] = PTYPE[key] || {sys:t.sys, st:[...t.st], trig:t.trig, terms:t.set.terms}; }
    s.ty = key.startsWith('TPL') ? key : (t.groups ? 'Redbridge' : t.ty); s.tpl = t.id; s.set = {...t.set}; s.log.push([TODAY, ME(), 'template', '', t.n]); render(); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/WD1suQVVVMD7UeWQk5cEKW'; } });
VERSIONS.push({v:'v3.15', date:TODAY, major:false, current:true, url:null, title:'Scheme templates you can see and build', sum:'New scheme setup shows what a template controls and lets a director create, duplicate and edit templates: client system and statuses, measures and rates, settings, time limits, checklists, install tracking and payment trigger.', steps:[
  {t:'Templates', min:1, dolor:'Before, a template was only a name pointing to a scheme.', show:['What a template controls, in seven parts.', 'New template, blank or from another; edit statuses, rates, settings, limits and checklists.', 'Use template creates the scheme with all of it.'], say:'A new programme is a template, set up once.', go:() => { S.role = 'dir'; S.f.tpe = null; go('dir', 'nsc'); }},
]});
