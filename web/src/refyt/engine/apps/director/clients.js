// Refyt · Director: clientes.
import {
  A, ACC, B, CBK, DB, DBS, IN, ME, MODALS, PROGS, S, TODAY, VERSIONS, VIEWS, abrir, cbx, cell, esc,
  fld, go, mfoot, mlab, modal, mseg, numIn, nx, oph, plural, prsOf, rdiv, render, renderLayer, sbItem,
  scOf, sum, th, toast
} from "../../index.js";
export const REGIONS = ['London', 'Essex', 'Kent', 'Surrey', 'Oxfordshire'];
export const CLTYPES = ['Council', 'Housing association', 'Grant body', 'Main contractor', 'Other'];
DB.cl = [
  {id:'CL-01', n:'Medway Council', ty:'Council', reg:'Kent', sys:'Dynamics', terms:30, ct:'Retrofit programme team'},
  {id:'CL-02', n:'Thanet District Council', ty:'Council', reg:'Kent', sys:'Dynamics', terms:30, ct:'Housing standards team'},
  {id:'CL-03', n:'Waverley Borough Council', ty:'Council', reg:'Surrey', sys:'Dynamics', terms:30, ct:'Sustainability officer'},
  {id:'CL-04', n:'Cottsway Housing Association', ty:'Housing association', reg:'Oxfordshire', sys:'Dynamics', terms:30, ct:'Asset management'},
  {id:'CL-05', n:'GLA', ty:'Grant body', reg:'London', sys:'Shareworks', terms:30, ct:'Warmer Homes team'},
  {id:'CL-06', n:'London Borough of Redbridge', ty:'Council', reg:'London', sys:'PAS Hub', terms:45, ct:'Via Kanopi Works'},
  {id:'CL-07', n:'Kanopi Works', ty:'Main contractor', reg:'London', sys:'PAS Hub', terms:45, ct:'Project manager, Redbridge'},
];
DB.seq.cl = 7;
export const clOfSc = s => DB.cl.find(c => s.cl === c.n || s.cl.startsWith(c.n + ' ('));
export const scOfCl = c => DB.sc.filter(s => clOfSc(s) === c);
export function clPage(){ return oph('Clients', 'Councils, housing associations, grant bodies and main contractors. Each client is entered once and every scheme links to it, so payment times and margins can be compared per client.', nx('clNew', '', 'Add a client'))
  + `<div class="rf-tw">` + th(cell('Client', 'Type', 2.2) + cell('Region', '') + cell('Schemes', '', 2) + cell('Client system', '') + cell('Payment terms', '') + cell('Contact', '', 1.4)) + DB.cl.map(c => { const ss = scOfCl(c); return rdiv(cell(esc(c.n), c.ty, 2.2) + cell(c.reg, '') + `<div class="mbc" style="flex:2"><b style="font-weight:600">${ss.length ? ss.map(s => `<button class="lnk4" data-act="ficha" data-v="${s.id}">${esc(s.n)}</button>`).join(', ') : 'No schemes yet'}</b><small>${plural(sum(ss, s => prsOf(s.id).length), 'property', 'properties')}</small></div>` + cell(c.sys, '') + cell(`${c.terms} days`, '') + cell(esc(c.ct || ''), '', 1.4), S.hl === c.id, c.id); }).join('') + '</div>'; }
export const clForm = (m, pre) => fld('Client name', 'm', pre + 'n', m[pre + 'n'], {req:true, ph:'e.g. Swale Borough Council'}) + mlab('Type', true) + mseg(pre + 'ty', m[pre + 'ty'], CLTYPES) + `<div class="rf-2">${cbx('Region', pre + 'regx', REGIONS.map(r => [r, r]), m[pre + 'reg'], 'm', {req:true, ph:'Choose a region...'})}${cbx('Client system', pre + 'sysx', [['Dynamics', 'Dynamics (E.ON)'], ['Shareworks', 'Shareworks (GLA)'], ['PAS Hub', 'PAS Hub'], ['None', 'None']], m[pre + 'sys'], 'm', {ph:'Choose...'})}</div>`;
Object.assign(CBK, {regx:'reg', sysx:'sys', clx:'clid', nregx:'nreg', nsysx:'nsys', screg:'reg'});
A.clNew = () => { S.modal = {k:'cl9', n:'', ty:'', reg:'', sys:''}; renderLayer(); };
MODALS.cl9 = m => modal('Add a client', 'It becomes available in every scheme form.', clForm(m, ''), mfoot('Add client', 'clOk9', !!((m.n || '').trim() && m.ty && m.reg)), 600);
export const addCl = (n, ty, reg, sys) => { const c = {id:'CL-' + String(++DB.seq.cl).padStart(2, '0'), n:n.trim(), ty, reg, sys:sys || 'None', terms:30, ct:''}; DB.cl.push(c); return c; };
A.clOk9 = () => { const m = S.modal, c = addCl(m.n, m.ty, m.reg, m.sys); S.modal = null; S.hl = c.id; render(); toast(`${esc(c.n)} added to Clients.`); };
/* New scheme: client and region from lists; a new client can be added from the form */
A.nsOpen = el => { const s = el.dataset.v ? scOf(el.dataset.v) : null, c = s ? clOfSc(s) : null; S.modal = {k:'ns9', from:el.dataset.v, n:'', clid:'', reg:s ? s.reg : '', prog:s ? s.prog : 'NONE', tgt:'', nn:'', nty:'', nreg:'', nsys:''}; renderLayer(); };
MODALS.ns9 = m => { const s0 = m.from ? scOf(m.from) : null, isNew = m.clid === '__new', ok = (m.n || '').trim() && m.clid && m.reg && (!isNew || ((m.nn || '').trim() && m.nty && m.nreg));
  return modal('New scheme', s0 ? `Starting from ${esc(s0.n)}: ${s0.ty} stages, checklists and settings.` : 'Blank: phases A and B, settings to fill in.', fld('Scheme name', 'm', 'n', m.n, {req:true, ph:'e.g. E.ON Swale'})
    + cbx('Client', 'clx', [...DB.cl.map(c => [c.id, c.n, `${c.ty}, ${c.reg}`]), ['__new', '+ Add a new client', 'Not in the list yet']], m.clid, 'm', {req:true, ph:'Choose the client...'})
    + (isNew ? `<div class="rf-newcl"><small class="rf-ph">New client</small>${clForm(m, 'n').replace(/data-k="nn"/, 'data-k="nn"')}</div>` : '')
    + `<div class="rf-2">${cbx('Region', 'screg', REGIONS.map(r => [r, r]), m.reg, 'm', {req:true, ph:'Choose a region...'})}${fld('Target properties', 'm', 'tgt', m.tgt, {type:'number', ph:'e.g. 40'})}</div>` + mlab('Programme manager') + mseg('prog', m.prog, PROGS.map(p => [p.id, p.n])), mfoot('Create scheme', 'nsOk9', !!ok), 640); };
{ const o = IN.m; IN.m = t => { o(t); if(S.modal && S.modal.k === 'ns9' && t.dataset.k === 'clx'){ const c = DB.cl.find(x => x.id === S.modal.clid); if(c && !S.modal.reg) S.modal.reg = c.reg; renderLayer(); } if(S.modal && S.modal.k === 'ns9' && t.dataset.k === 'nregx' && !S.modal.reg){ S.modal.reg = S.modal.nreg; renderLayer(); } }; }
A.nsOk9 = () => { const m = S.modal, s0 = m.from ? scOf(m.from) : null, c = m.clid === '__new' ? addCl(m.nn, m.nty, m.nreg, m.nsys) : DB.cl.find(x => x.id === m.clid), id = 'SC-' + String(DB.sc.length + 1).padStart(2, '0');
  DB.sc.push({id, n:m.n.trim(), prog:m.prog, cl:c.n, ty:s0 ? s0.ty : 'GLA', reg:m.reg, st:'Starting', tgt:numIn(m.tgt) || 0, lead:'dre', set:s0 ? {...s0.set} : {mg:20, ord:2000, pay:2500, vr:1000, terms:c.terms || 30}, log:[[TODAY, ME(), 'created', s0 ? 'copied from ' + s0.n : 'blank', 'live']]}); S.modal = null; abrir(S.view, id, 'set'); toast(`Scheme created for ${esc(c.n)}${m.clid === '__new' ? ', a new client now in Clients' : ''}. It already shows in the Director overview.`); };
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => o().replace('<button class="nav" data-act="pg_dir" data-v="nsc"', sbItem(S.page.dir, 'pg_dir')(['cls', 'Clients', 'building', DB.cl.length, 1]) + '<button class="nav" data-act="pg_dir" data-v="nsc"'); VIEWS.dir.pages.cls = clPage; }
DBS.splice(1, 0, B('cl', 'Clients', 'wrk', 'Councils, housing associations, grant bodies and main contractors, entered once.', [['Type', 'Dropdown'], ['Region', 'Dropdown'], ['Client system', 'Dropdown'], ['Schemes', '→ Contracts (schemes)']], () => DB.cl.length));
Object.assign(ACC.dir, {cl:'w'}); Object.assign(ACC.com, {cl:'r'}); Object.assign(ACC.acc, {cl:'r'});
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/AxrcUSFBCYcr9vsRT4Ed9N'; } });
VERSIONS.push({v:'v3.14', date:TODAY, major:false, current:true, url:null, title:'Clients list, and client and region dropdowns', sum:'Clients are entered once in Director, Clients, and linked to their schemes. The new scheme form picks the client and the region from lists, and can add a new client.', steps:[
  {t:'Clients and the new scheme form', min:.5, dolor:'Before, client and region were typed by hand.', show:['Director, Clients: each client once, with its schemes, region, client system and terms.', 'New scheme: client and region from lists; “Add a new client” right there.'], say:'Each client is entered once and reused.', go:() => { S.role = 'dir'; go('dir', 'cls'); }},
]});
