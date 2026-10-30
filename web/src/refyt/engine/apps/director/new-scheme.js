// Refyt · Alta de esquemas.
import {
  A, DB, ME, MODALS, PROGS, S, TODAY, abrir, fld, mfoot, mlab, modal, mseg, numIn, render, renderLayer,
  scOf, toast
} from "../../index.js";

A.nsTpl = el => { const s = scOf(el.dataset.v); DB.tpl.push({n:`${s.n} template`, from:s.id}); render(); toast(`${s.n} saved as a template.`); };
A.nsOpen = el => { const s = el.dataset.v ? scOf(el.dataset.v) : null; S.modal = {k:'ns', from:el.dataset.v, n:'', cl:'', reg:s ? s.reg : '', prog:s ? s.prog : 'NONE', tgt:''}; renderLayer(); };
MODALS.ns = m => { const s = m.from ? scOf(m.from) : null; return modal('New scheme', s ? `Starting from ${s.n}: ${s.ty} stages, checklists and settings.` : 'Blank: phases A and B, settings to fill in.', `<div class="rf-2">${fld('Scheme name', 'm', 'n', m.n, {req:true, ph:'e.g. E.ON Swale'})}${fld('Client', 'm', 'cl', m.cl, {req:true, ph:'e.g. Swale Borough Council'})}</div><div class="rf-2">${fld('Region', 'm', 'reg', m.reg, {ph:'e.g. Kent'})}${fld('Target properties', 'm', 'tgt', m.tgt, {type:'number'})}</div>` + mlab('Programme manager') + mseg('prog', m.prog, PROGS.map(p => [p.id, p.n])), mfoot('Create scheme', 'nsOk', m.n.trim() && m.cl.trim()), 620); };
A.nsOk = () => { const m = S.modal, s0 = m.from ? scOf(m.from) : null, id = 'SC-' + String(DB.sc.length + 1).padStart(2, '0'); DB.sc.push({id, n:m.n.trim(), prog:m.prog, cl:m.cl.trim(), ty:s0 ? s0.ty : 'GLA', reg:m.reg, st:'Starting', tgt:numIn(m.tgt) || 0, lead:'dre', set:s0 ? {...s0.set} : {mg:20, ord:2000, pay:2500, vr:1000, terms:30}, log:[[TODAY, ME(), 'created', s0 ? 'copied from ' + s0.n : 'blank', 'live']]}); S.modal = null; abrir(S.view, id, 'set'); toast('Scheme created. It already shows in the Director overview.'); };
