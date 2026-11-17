// Refyt · v5.45: Install tracker, Programme of works y Complaints, rellenados en la app y descargados como los Excel que REFYT ya usa.
import {
  A, CHK55, DB, DEL4, DSH, HELP, HV, ITEMS4, ME, MEAS, MSH, PEO, RATE, S, SEC5, TODAY, TOUR,
  VERSIONS, VIEWS, abrir, addDays, dDiff, empty, esc, fmtDy, fromIso, go, ico, iso, mk, norm, oph,
  pIdx, render, saveFile4, scOf, scPill55, seg, stat, sum, toast, trBar, wrapRender
} from "../../index.js";
/* =================== v5.45: Install tracker, Programme of works and Complaints, filled in the app and downloaded as the Excel files REFYT already uses =================== */
export const V45 = {sel:new Set(), ed:null, dr:null, drag:null, refocus:null};
export const EON45 = p => ['SC-01', 'SC-02', 'SC-03', 'SC-04'].includes(p.sc);
export const wd45 = (s, n) => { let d = s, k = 0; const st = n < 0 ? -1 : 1; while(k < Math.abs(n)){ d = addDays(d, st); const w = fromIso(d).getDay(); if(w !== 0 && w !== 6) k++; } return d; };
export const nwd45 = (s, e) => { if(!s || !e) return null; let n = 0, d = s; for(let i = 0; i < 400 && d <= e; i++){ const w = fromIso(d).getDay(); if(w !== 0 && w !== 6) n++; d = addDays(d, 1); } return n; };
export const sh45 = s => s ? `${MSH[fromIso(s).getMonth()]} ${fromIso(s).getDate()}` : '';

/* ---------- More E.ON jobs, so the tracker and the programme look like a real month (fictitious addresses and residents) ---------- */
(() => { if(DB.pr.some(p => p.id === 'PR-2101')) return;
  const src = {C:'PR-2006', D:'PR-2002', E:'PR-2004', F:'PR-2005', X:'PR-2012'}, PHN = {C:'C. Client approval', D:'D. Prepare to install', E:'E. Install', F:'F. Close out', X:'Cancelled'};
  [['14 Hollywood Lane', 'ME2 3AQ', 'SC-01', 'E', ['SPV', 'LI', 'DMEV'], 'Mark Ellison'], ['77 Barnsole Road', 'ME7 2JG', 'SC-01', 'E', ['SPV'], 'Priya Shah'], ['5 Cliffe Road', 'ME2 3DL', 'SC-01', 'D', ['SPV', 'DMEV'], 'Owen Talbot'],
   ['39 Kingswood Road', 'ME7 1DZ', 'SC-01', 'D', ['SPV', 'LI', 'DMEV'], 'Grace Mensah'], ['18 Lumsden Close', 'ME4 6UP', 'SC-01', 'C', ['SPV'], 'Tom Harding'], ['62 Rock Avenue', 'ME7 5PX', 'SC-01', 'F', ['SPV', 'LI'], 'Helen Ward'],
   ['11 Northdown Hill', 'CT10 3HT', 'SC-02', 'E', ['SPV', 'CWI', 'DMEV'], 'Ali Rahman'], ['8 Ethelbert Road', 'CT9 1RX', 'SC-02', 'E', ['SPV'], 'Joan Pritchard'], ['25 Grange Road', 'CT11 9NA', 'SC-02', 'D', ['SPV'], 'Leo Martins'],
   ['3 Dumpton Park Drive', 'CT10 1RJ', 'SC-02', 'C', ['LI', 'DMEV'], 'Nadia Kowalska'], ['46 Pegwell Road', 'CT11 0JL', 'SC-02', 'F', ['SPV'], 'Ruth Okafor'], ['90 Station Road', 'CT7 9RA', 'SC-02', 'X', ['SPV'], 'Ian Doyle']
  ].forEach(([ad, pc, sc, ph, ms, res], i) => { const b = DB.pr.find(p => p.id === src[ph]); if(!b) return; const p = JSON.parse(JSON.stringify(b)), r = RATE['E.ON'] || {};
    Object.assign(p, {id:'PR-' + (2101 + i), ad, pc, sc, res, ref:'EON-' + (49120 + i * 7), ph:PHN[ph], phOn:addDays(TODAY, -(3 + i % 6)), his:[[addDays(TODAY, -70 + i), `Job received from ${scOf(sc).cl}, reference EON-${49120 + i * 7}`, 'sar']],
      ms:ms.map(m => ({m, q:r[m] || 1500, b:Math.round((r[m] || 1500) * .74), dsg:ph !== 'C', dap:ph !== 'C', ip:ph === 'F' ? 100 : ph === 'E' ? 55 : 0})), cancel:ph === 'X' ? {why:'Roof not suitable for panels', at:'D. Prepare to install', abort:true} : null});
    DB.pr.push(p); }); })();

/* ---------- Installation tasks: the rows of the Programme of works, and the installation columns of the tracker ---------- */
export const PST45 = ['Not started', 'Scheduled', 'In progress', 'On hold', 'Complete', 'Cancelled'];
export const PSTC45 = {'Not started':'nb', 'Scheduled':'bc', 'In progress':'ap', 'On hold':'bk', 'Complete':'ok', 'Cancelled':'na'};
export const XST45 = {'Not started':'Not Started', 'Scheduled':'Scheduled', 'In progress':'In Progress', 'On hold':'On Hold', 'Complete':'Complete', 'Cancelled':'Cancelled'};
export const ENAB45 = ['DPI', 'Scaffold erect', 'Scaffold dismantle', 'Roof repair'];
export const PMEAS45 = ['DPI', 'Scaffold erect', 'Ventilation', 'Loft insulation', 'Cavity wall insulation', 'External wall insulation', 'Solar PV', 'Storage heaters', 'Roof repair', 'Scaffold dismantle', 'Other'];
export const INST45 = ['Medway Electrical Ltd', 'Brightline Electrical', 'Kent Solar Fitters'];
export const trk45 = () => DB.pr.filter(p => EON45(p) && (pIdx(p.ph) >= 2 || p.ph === 'Cancelled') && !(p.ph === 'Cancelled' && p.cancel && p.cancel.at && pIdx(p.cancel.at) < 2));
export const prOf45 = id => DB.pr.find(p => p.id === id);
DB.pow = DB.pow || [];
DB.itr = DB.itr || {};
DB.cmp45 = DB.cmp45 || [];
(() => { if(DB.pow.length) return; let n = 1;
  const plan = p => { const has = m => p.ms.some(x => x.m === m), t = [];
    if(has('SPV')) t.push(['DPI', 0, 0]); if(has('SPV') || has('EWI')) t.push(['Scaffold erect', 2, 2]); if(has('DMEV')) t.push(['Ventilation', 3, 3]); if(has('LI')) t.push(['Loft insulation', 3, 3]);
    if(has('CWI')) t.push(['Cavity wall insulation', 4, 4]); if(has('EWI')) t.push(['External wall insulation', 4, 12]); if(has('SPV')) t.push(['Solar PV', 4, 6]); if(has('SPV') || has('EWI')) t.push(['Scaffold dismantle', has('EWI') ? 15 : 9, has('EWI') ? 15 : 9]); return t; };
  trk45().forEach((p, k) => { const ph = p.ph, base = ph === 'D. Prepare to install' ? wd45(TODAY, 3 + k % 5 * 2) : ph === 'E. Install' ? wd45(TODAY, -6 + k % 3) : ['F. Close out', 'Paid'].includes(ph) ? wd45(TODAY, -38 - k * 2) : ph === 'Cancelled' ? wd45(TODAY, -12) : null;
    const preOnly = ph === 'D. Prepare to install' && k % 3 === 2;
    plan(p).forEach(([m, a, b]) => { const dated = base && !(preOnly && !ENAB45.includes(m));
      const s = dated ? wd45(base, a) : null, e = dated ? wd45(base, b) : null;
      let st = 'Not started'; if(ph === 'Cancelled') st = 'Cancelled'; else if(['F. Close out', 'Paid'].includes(ph)) st = 'Complete'; else if(s){ st = e < TODAY ? 'Complete' : s <= TODAY ? 'In progress' : 'Scheduled'; }
      DB.pow.push({id:'PW-' + (n++), pr:p.id, m, s, e, st, by:m === 'Solar PV' ? INST45[k % 3] : '', nt:''}); }); }); })();
export const tasks45 = p => DB.pow.filter(t => t.pr === p.id);
export const instT45 = p => tasks45(p).filter(t => !ENAB45.includes(t.m));
export const taskOf45 = (p, m) => tasks45(p).find(t => m === 'Other' ? ['External wall insulation', 'Storage heaters', 'Other'].includes(t.m) : t.m === m);

/* ---------- The tracker's columns, in the spreadsheet's groups ---------- */
export const hasM45 = m => p => p.ms.some(x => x.m === m);
export const spv45 = hasM45('SPV'), li45 = hasM45('LI');
export const FLD45 = [
  ['roof', 'Roof condition', 'txt', null, 'pre', 'SPV Preinstall Checks'], ['scf', 'Scaffold access', 'txt', null, 'pre', 'SPV Preinstall Checks'], ['inv', 'Space for inverter', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45],
  ['base', 'Basement', 'ch', ['Yes', 'No'], 'pre', 'SPV Preinstall Checks'], ['elec', 'Electrical comments', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45], ['pan', 'Number of panels', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45],
  ['invm', 'Inverter', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45], ['dc', 'Notes and DC run', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45], ['asb', 'Asbestos', 'txt', null, 'pre', 'SPV Preinstall Checks'],
  ['scl', 'Scaffold location', 'ch', ['Front', 'Rear', 'Side'], 'pre', 'Install Checks'], ['pav', 'Pavement licence', 'ch', ['Yes', 'No', 'Not required'], 'pre', 'Install Checks'], ['lift', 'Extra lift', 'ch', ['Yes', 'No', 'Not required'], 'pre', 'Install Checks'],
  ['sto', 'Storeys', 'ch', ['1', '2', '3', '4+'], 'pre', 'Install Checks'], ['rear', 'Extra rear required', 'ch', ['Yes', 'No'], 'pre', 'Install Checks'], ['sat', 'Satellite dish', 'ch', ['None', 'Present, not interacting', 'May interact'], 'pre', 'Install Checks'],
  ['qch', 'Quote changes', 'txt', null, 'pre', 'Install Checks'],
  ['con', 'Construction approval', 'yn', null, 'en', 'Enabling'], ['quo', 'Quote approved', 'yn', null, 'en', 'Enabling'], ['bat', 'Fully approved and batched', 'yn', null, 'en', 'Enabling'],
  ['dpi', 'DPI', 'pow', 'DPI', 'en', 'Enabling'], ['scon', 'Scaffold on', 'pow', 'Scaffold erect', 'en', 'Enabling'], ['dyn', 'Dynamics notified', 'st', null, 'en', 'Enabling'], ['cal', 'Booking calendar', 'st', null, 'en', 'Enabling'],
  ['mat', 'Materials booked', 'date', null, 'en', 'Enabling'], ['iaa', 'IAA notified', 'st', null, 'en', 'Enabling'], ['mould', 'Mould removal', 'st', null, 'en', 'Enabling'],
  ['vent', 'Ventilation install', 'pow', 'Ventilation', 'ins', 'Installation'], ['loft', 'Loft install', 'pow', 'Loft insulation', 'ins', 'Installation'], ['spv', 'SPV install', 'pow', 'Solar PV', 'ins', 'Installation'],
  ['cav', 'Cavity install', 'pow', 'Cavity wall insulation', 'ins', 'Installation'], ['oth', 'Other install', 'pow', 'Other', 'ins', 'Installation'], ['dynu', 'Dynamics updated', 'st', null, 'ins', 'Installation'], ['waste', 'Waste collection', 'st', null, 'ins', 'Installation'],
  ['fin', 'Final inspection and sign off', 'date', null, 'cmp', 'Completion'], ['scoff', 'Scaffold off', 'pow', 'Scaffold dismantle', 'cmp', 'Completion'],
  ['lph', 'Loft photo docs', 'st', null, 'cmp', 'Loft Handover', li45], ['libg', 'Loft IBG', 'st', null, 'cmp', 'Loft Handover', li45],
  ['sph', 'SPV photo docs', 'st', null, 'cmp', 'SPV Handover', spv45], ['sibg', 'SPV IBG', 'st', null, 'cmp', 'SPV Handover', spv45], ['mcs', 'MCS application', 'st', null, 'cmp', 'SPV Handover', spv45], ['eic', 'EIC and BN', 'st', null, 'cmp', 'SPV Handover', spv45],
  ['arr', 'Solar array certificate', 'st', null, 'cmp', 'SPV Handover', spv45], ['comm', 'Commissioning reports', 'st', null, 'cmp', 'SPV Handover', spv45], ['nic', 'NICEIC regs', 'st', null, 'cmp', 'SPV Handover', spv45],
].map(([k, n, kind, o, b, xg, app]) => ({k, n, kind, o, b, xg, app}));
export const FK45 = Object.fromEntries(FLD45.map(f => [f.k, f]));
export const BLK45 = [['pre', 'Pre-install checks', 'search'], ['en', 'Enabling', 'flag'], ['ins', 'Installation', 'tool'], ['cmp', 'Completion and handover', 'award']];
export const STV45 = ['Done', 'Pending', 'Missing', 'N/A'];
export const IT45 = p => DB.itr[p.id] || (DB.itr[p.id] = {notes:[], his:[], hold:''});
export const app45 = (p, f) => f.kind === 'pow' ? !!taskOf45(p, f.o) : (!f.app || f.app(p));
export const val45 = (p, f) => f.kind === 'pow' ? taskOf45(p, f.o) : IT45(p)[f.k];
export const done45 = (p, f) => { const v = val45(p, f); if(f.kind === 'pow') return !!v && v.st === 'Complete'; if(f.kind === 'st') return v === 'Done' || v === 'N/A'; if(f.kind === 'yn') return v === 'Yes'; return v != null && v !== ''; };
export const pct45 = (p, b) => { const fs = FLD45.filter(f => f.b === b && app45(p, f)); return fs.length ? Math.round(fs.filter(f => done45(p, f)).length / fs.length * 100) : null; };

/* seed the tracker with values that match each job's phase */
(() => { const R = ['Concrete tiles, good condition, felt present', 'Pan tiles, rafters look good, felt present', 'Flat tiles, no felt, check flashing', 'Slate roof, sound, one cracked tile at the rear'], E = ['TN-C-S earthing, space for the DPI', 'Old board, space for the PV board and DPI', 'TT system, meter under the stairs'];
  trk45().forEach((p, k) => { const it = IT45(p), i = pIdx(p.ph), late = ['F. Close out', 'Paid'].includes(p.ph), ins = p.ph === 'E. Install', can = p.ph === 'Cancelled', d = i >= 3 || late || can, sp = spv45(p), ts = instT45(p), allDone = ts.length && ts.every(t => t.st === 'Complete');
    Object.assign(it, {roof:R[k % 4], scf:k % 3 ? 'Access via the alley' : 'Front access, no issues', base:k % 4 === 1 ? 'Yes' : 'No', asb:k % 5 === 2 ? 'Cement pipes may contain asbestos, do not touch' : 'None found on survey'});
    if(sp) Object.assign(it, {inv:k % 3 === 1 ? 'Tight, may need an external enclosure' : 'Plenty of space', elec:E[k % 3], pan:`${k % 2 ? 'Front' : 'Rear'} ${5 + k % 4}`, invm:k % 2 ? 'Fox ESS 3.68kW hybrid' : 'F Series 3kW string', dc:'DC run through the loft, out at the soffit, in conduit to the inverter'});
    if(d) Object.assign(it, {scl:['Front', 'Rear', 'Side'][k % 3], pav:k % 3 === 0 ? 'Yes' : 'Not required', lift:k % 4 === 3 ? 'Yes' : 'Not required', sto:k % 6 === 4 ? '3' : '2', rear:'No', sat:k % 5 === 1 ? 'May interact' : 'None', qch:k % 4 === 3 ? 'One lift added' : 'No change'});
    Object.assign(it, {con:'Yes', quo:d ? 'Yes' : k % 2 ? 'Yes' : '', bat:d ? 'Yes' : ''});
    if(d && !can) Object.assign(it, {dyn:ins || late ? 'Done' : 'Pending', cal:'Done', mat:ins || late ? addDays(TODAY, -9 - k % 4) : k % 2 ? addDays(TODAY, 2) : '', iaa:ins || late ? 'Done' : 'Pending', mould:k % 6 === 1 ? 'Pending' : 'N/A'});
    if(ins || late) Object.assign(it, {dynu:allDone || late ? 'Done' : 'Pending', waste:late ? 'Done' : 'Pending'});
    if(late) Object.assign(it, {fin:addDays(TODAY, -24 - k % 5), lph:'Done', libg:'Done', sph:'Done', sibg:'Done', mcs:'Done', eic:k % 2 ? 'Missing' : 'Done', arr:'Done', comm:'Done', nic:k % 3 ? 'Done' : 'Pending'});
    else if(allDone) Object.assign(it, {lph:'Pending', libg:'Pending', sph:'Pending', sibg:'Pending', mcs:'Pending', eic:'Pending', arr:'Pending', comm:'Pending', nic:'Pending'});
    if(p.id === 'PR-2105') it.hold = 'Customer wants a site visit before accepting the scope.';
    if(p.id === 'PR-2101') it.notes.push({on:addDays(TODAY, -2), by:'dre', t:'Customer asked to keep the side gate closed for the dog.'});
    if(p.id === 'PR-2004') it.notes.push({on:addDays(TODAY, -1), by:'dre', t:'Inverter commissioning failed on the first attempt; installer back on Thursday.'});
    if(p.id === 'PR-2108') it.notes.push({on:addDays(TODAY, -4), by:'akr', t:'Make sure we have the right flashing, there is no felt.'}); }); })();
(() => { if(DB.cmp45.length) return; const c = (id, on, stage, ty, pr, own, iss, act, aon, ron, st) => ({id, on:addDays(TODAY, on), stage, ty, pr, own, iss, act, aon:aon == null ? '' : addDays(TODAY, aon), ron:ron == null ? '' : addDays(TODAY, ron), st});
  DB.cmp45.push(c('CP-1', -26, 'Mid install', 'Roof issue', 'PR-2004', 'dre', 'Supporting beam in the loft is bowing', 'Go back to reinforce it before the panels go on', -20, null, 'Open'),
    c('CP-2', -17, 'Post install', 'Scaffold issue', 'PR-2111', 'akr', 'Scaffold left a mark on the front paving', 'Clean and photograph', -15, -12, 'Closed'),
    c('CP-3', -9, 'Post install', 'Install issue', 'PR-2005', 'dre', 'dMEV in the bathroom is noisy', 'Installer to return and check the fan', -6, null, 'Open'),
    c('CP-4', -3, 'Pre install', 'Customer service', 'PR-2103', 'tom', 'Customer says nobody confirmed the install date', 'Call the customer and confirm by email', -2, null, 'Open')); })();

/* ---------- Bands: where each job sits, worked out from its data instead of moving rows by hand ---------- */
export const BANDS45 = ['Pending approval', 'Pre installation', 'Jobs on hold', 'Booked installation', 'Install in progress', 'Completed installation', 'Submitted jobs', 'Cancelled'];
export const BNDC45 = {'Pending approval':'nb', 'Pre installation':'bc', 'Jobs on hold':'bk', 'Booked installation':'ap', 'Install in progress':'rq', 'Completed installation':'ok', 'Submitted jobs':'ok', 'Cancelled':'na'};
export const band45 = p => { if(p.ph === 'Cancelled') return 'Cancelled'; if(IT45(p).hold) return 'Jobs on hold'; if(pIdx(p.ph) <= 2) return 'Pending approval'; if(['F. Close out', 'Paid'].includes(p.ph)) return 'Submitted jobs';
  const ts = instT45(p); if(!ts.length || ts.every(t => !t.s)) return 'Pre installation'; if(ts.every(t => t.st === 'Complete')) return 'Completed installation'; if(ts.some(t => ['In progress', 'Complete'].includes(t.st))) return 'Install in progress'; return 'Booked installation'; };
export const council45 = p => scOf(p.sc).n.replace(/^E\.ON\s*/, '');
export const delMon45 = p => { const t = instT45(p).filter(x => x.s).sort((a, b) => a.s < b.s ? -1 : 1)[0]; return t ? MSH[fromIso(t.s).getMonth()] : ''; };
export const mPills45 = p => p.ms.map(x => `<span class="v45-m">${esc(MEAS[x.m].s)}</span>`).join('');
export const bPill45 = b => `<span class="v45-st ${BNDC45[b]}">${esc(b)}</span>`;

/* ---------- One cell: shows the value and opens its editor ---------- */
export const STC45 = {Done:['ok', CHK55], Pending:['bk', ''], Missing:['bl', ''], 'N/A':['na', '']};
export function cellIn45(p, f){ if(!app45(p, f)) return '<span class="v45-na">n/a</span>'; const v = val45(p, f);
  if(f.kind === 'pow'){ const t = v; return t.s ? `<span class="v45-pw"><b>${sh45(t.s)}${t.e && t.e !== t.s ? `<i>to ${sh45(t.e)}</i>` : ''}</b><span class="v45-st ${PSTC45[t.st]}">${esc(t.st)}</span></span>` : `<span class="v45-st ${PSTC45[t.st]}">${t.st === 'Not started' ? 'Not booked' : esc(t.st)}</span>`; }
  if(v == null || v === '') return '<span class="v45-e">Add</span>';
  if(f.kind === 'st'){ const [c, ic] = STC45[v] || ['nb', '']; return `<span class="v45-st ${c}">${ic}${esc(v)}</span>`; }
  if(f.kind === 'yn') return `<span class="v45-st ${v === 'Yes' ? 'ok' : 'bl'}">${v === 'Yes' ? CHK55 : ''}${esc(v)}</span>`;
  if(f.kind === 'date') return `<span class="v45-dt">${ico('cal', 13, 2)}${sh45(v)}</span>`;
  if(f.kind === 'ch') return `<span class="v45-ch">${esc(v)}</span>`;
  return `<span class="v45-tx" title="${esc(v)}">${esc(v)}</span>`; }
export const cell45 = (p, f, r, c) => app45(p, f) ? `<button type="button" class="v45-c" data-act="v45ed" data-p="${p.id}" data-f="${f.k}" data-r="${r}" data-c="${c}" aria-label="${esc(f.n)}, ${esc(p.ad)}">${cellIn45(p, f)}</button>` : cellIn45(p, f);
export const bar45 = (v, act, id, b) => v == null ? '<span class="v45-na">n/a</span>' : `<button type="button" class="v45-pb" data-act="${act}" data-v="${id}" data-b="${b}" title="${v}% done"><span><i style="width:${v}%;background:${v === 100 ? '#16A34A' : v >= 50 ? '#2F5BD3' : '#F59E0B'}"></i></span><b>${v}%</b></button>`;

/* ---------- Install tracker ---------- */
VIEWS.del.pages.itr = () => { const all = trk45(), q = norm(S.f.v45q), sc = S.f.v45s || 'all', bd = S.f.v45b || 'all', bk = S.f.v45k || 'sum';
  const base = all.filter(p => (sc === 'all' || p.sc === sc) && (!q || norm(`${p.ad} ${p.pc} ${p.id} ${p.ref} ${p.res}`).includes(q))), xs = base.filter(p => bd === 'all' || band45(p) === bd);
  const cnt = b => base.filter(p => band45(p) === b).length, fs = bk === 'sum' ? [] : FLD45.filter(f => f.b === bk && xs.some(p => app45(p, f)));
  const hand = all.filter(p => ['Completed installation', 'Submitted jobs'].includes(band45(p))).reduce((t, p) => t + FLD45.filter(f => f.b === 'cmp' && f.kind === 'st' && app45(p, f) && ['Pending', 'Missing', undefined, ''].includes(val45(p, f))).length, 0);
  const head = `<tr><th>Property</th><th>Scheme</th>${bk === 'sum' ? `<th>Measures</th><th>Install</th>${BLK45.map(([, n]) => `<th>${esc(n)}</th>`).join('')}<th>Latest note</th>` : fs.map(f => `<th>${esc(f.n)}</th>`).join('')}</tr>`;
  let r = 0; const row = p => { r++; const it = IT45(p), nt = it.notes[it.notes.length - 1], t1 = instT45(p).filter(t => t.s).sort((a, b) => a.s < b.s ? -1 : 1)[0];
    return `<tr${V45.sel.has(p.id) ? ' class="v45-on"' : ''}><td class="rd55-pr"><span class="v45-pr"><input type="checkbox" data-v45sel="${p.id}" aria-label="Select ${esc(p.ad)}"${V45.sel.has(p.id) ? ' checked' : ''}><span><button class="rd55-pn" data-act="v45dr" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(p.ref)}, ${esc(p.pc || '')}</small></span></span></td><td>${scPill55(p.sc)}</td>`
      + (bk === 'sum' ? `<td><span class="v45-ms">${mPills45(p)}</span></td><td>${t1 ? `<span class="v45-dt">${ico('cal', 13, 2)}${sh45(t1.s)}</span>` : '<span class="v45-na">Not booked</span>'}</td>${BLK45.map(([b]) => `<td>${bar45(pct45(p, b), 'v45dr', p.id, b)}</td>`).join('')}<td class="v45-nt">${nt ? `<span title="${esc(nt.t)}">${esc(nt.t)}</span><small>${esc((PEO[nt.by] || {}).n || '')}, ${sh45(nt.on)}</small>` : '<span class="v45-na">No notes</span>'}</td>`
        : fs.map((f, c) => `<td>${cell45(p, f, r, c)}</td>`).join('')) + '</tr>'; };
  const ncol = bk === 'sum' ? 9 : fs.length + 2;
  const body = BANDS45.map(b => { const ps = xs.filter(p => band45(p) === b); return ps.length ? `<tr class="v45-band"><td colspan="${ncol}"><span>${bPill45(b)}<small>${ps.length}</small></span></td></tr>` + ps.map(row).join('') : ''; }).join('');
  const nSel = [...V45.sel].filter(id => xs.some(p => p.id === id)).length;
  return trBar() + oph('Install tracker', 'Every E.ON job from approval to handover, with the columns of the install tracker spreadsheet. Fill it in here; download it as Excel when you need to send it.', `<button class="btn sec" data-act="v45dl" data-v="itrb">${ico('file', 15)}Blank template</button><button class="btn pri" data-act="v45dl" data-v="itr">${ico('down', 15)}Download Excel</button>`)
    + `<div class="cstats">${stat('tb', 'Jobs in the tracker', all.filter(p => p.ph !== 'Cancelled').length)}${stat('ta', 'Booked or installing', all.filter(p => ['Booked installation', 'Install in progress'].includes(band45(p))).length)}${stat('tred', 'Handover items open', hand, 'pending or missing')}${stat('tv', 'Open complaints', DB.cmp45.filter(c => c.st === 'Open').length, 'see Complaints', 'v45go', 'cmp')}</div>`
    + `<div class="v45-row">${seg('v45b', bd, [['all', 'All', base.length], ...BANDS45.filter(cnt).map(b => [b, b, cnt(b)])])}</div>`
    + `<div class="v45-row">${seg('v45k', bk, [['sum', 'Summary'], ...BLK45.map(([k, n]) => [k, n])])}</div>`
    + `<div class="v45-fb"><label class="v45-q">${ico('search', 16)}<input id="v45q" data-v45in="v45q" value="${esc(S.f.v45q || '')}" placeholder="Search a property, postcode, reference or resident"></label><select data-v45in="v45s" aria-label="Scheme"><option value="all">All E.ON schemes</option>${DB.sc.filter(s => EON45({sc:s.id})).map(s => `<option value="${s.id}"${sc === s.id ? ' selected' : ''}>${esc(s.n)}</option>`).join('')}</select></div>`
    + (nSel ? `<div class="v45-bulk" role="region" aria-label="Selected jobs"><b>${nSel} selected</b><button class="btn pri sm" data-act="v45bulk">${ico('edit', 14)}Set a field for all</button><button class="btn sec sm" data-act="v45unsel">Clear selection</button><small>Pick a column and a value; every selected job gets it at once.</small></div>` : '')
    + `<p class="v45-hint">${bk === 'sum' ? 'Click a bar to open the job at that group, or pick a group above to fill its columns like a spreadsheet.' : 'Click a cell to fill it. Arrow keys move between cells and Enter opens one.'}</p>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t v45-t"><thead>${head}</thead><tbody>${body || `<tr><td colspan="${ncol}">${empty('No jobs match these filters.')}</td></tr>`}</tbody></table></div></section>`; };

/* ---------- Programme of works ---------- */
export const DW45 = 30;
export const win45 = () => { const m = S.f.v45m || TODAY.slice(0, 7), [y, mo] = m.split('-').map(Number), a = `${m}-01`, b = iso(new Date(y, mo, 0)); return {m, a, b, n:dDiff(b) - dDiff(a) + 1, y, mo}; };
VIEWS.del.pages.pow = () => { const W = win45(), q = norm(S.f.v45pq), sc = S.f.v45ps || 'all', st = S.f.v45pst || 'all';
  const ps = trk45().filter(p => (sc === 'all' || p.sc === sc) && (!q || norm(`${p.ad} ${p.pc} ${p.ref}`).includes(q)));
  const inWin = t => t.s && t.s <= W.b && (t.e || t.s) >= W.a, ts = DB.pow.filter(t => ps.some(p => p.id === t.pr)), tm = ts.filter(inWin);
  const vis = t => (st === 'all' || t.st === st) && (inWin(t) || !t.s);
  const groups = ps.map(p => [p, tasks45(p).filter(vis)]).filter(([, x]) => x.length && x.some(t => inWin(t) || !t.s)).sort((a, b) => { const f = g => (g[0].ph === 'Cancelled' ? 'Z' : '') + ((g[1].find(t => t.s) || {}).s || '9999'); return f(a) < f(b) ? -1 : 1; });
  const days = Array.from({length:W.n}, (_, i) => addDays(W.a, i)), wk = d => [0, 6].includes(fromIso(d).getDay());
  const grid = `<span class="v45-wk">${days.map((d, i) => wk(d) ? `<i style="left:${i * DW45}px"></i>` : '').join('')}${TODAY >= W.a && TODAY <= W.b ? `<em class="v45-now" style="left:${(dDiff(TODAY) - dDiff(W.a)) * DW45 + DW45 / 2}px"></em>` : ''}</span>`;
  const barH = t => { if(!t.s) return '<span class="v45-ns">Not scheduled, click to add dates</span>'; const s = t.s < W.a ? W.a : t.s, e = (t.e || t.s) > W.b ? W.b : (t.e || t.s), l = (dDiff(s) - dDiff(W.a)) * DW45, w = (dDiff(e) - dDiff(s) + 1) * DW45;
    return `<span class="v45-bar s-${PSTC45[t.st]}" data-v45bar="${t.id}" style="left:${l + 2}px;width:${w - 4}px" title="${esc(t.m)}: ${sh45(t.s)} to ${sh45(t.e || t.s)}, ${t.st}. Drag to move, drag the right edge to change the end.">${t.s < W.a ? '‹' : ''}${w > 60 ? esc(t.m) : ''}<i data-v45end="${t.id}"></i></span>`; };
  const trow = t => `<tr><td class="v45-gm"><button class="v45-gl" data-act="v45tk" data-v="${t.id}">${esc(t.m)}</button>${t.by ? `<small>${esc(t.by)}</small>` : ''}</td><td>${t.s ? sh45(t.s) : '–'}</td><td>${t.e ? sh45(t.e) : '–'}</td><td>${nwd45(t.s, t.e) ?? '–'}</td><td><button class="v45-c" data-act="v45tk" data-v="${t.id}"><span class="v45-st ${PSTC45[t.st]}">${esc(t.st)}</span></button></td><td class="v45-tl"><div class="v45-tr" style="width:${W.n * DW45}px">${grid}${barH(t)}</div></td></tr>`;
  const hdr = `<tr><th class="v45-gm">Measure</th><th>Start</th><th>End</th><th title="Working days">Days</th><th>Status</th><th class="v45-tl"><div class="v45-days" style="width:${W.n * DW45}px">${days.map(d => `<span class="${wk(d) ? 'we' : ''}${d === TODAY ? ' td' : ''}"><small>${DSH[fromIso(d).getDay()][0]}</small>${fromIso(d).getDate()}</span>`).join('')}</div></th></tr>`;
  const body = groups.map(([p, x]) => `<tr class="v45-band"><td colspan="6"><span><button class="rd55-pn" data-act="v45dr" data-v="${p.id}">${esc(p.ad)}</button>${scPill55(p.sc)}${bPill45(band45(p))}<button class="v45-add" data-act="v45add" data-v="${p.id}">${ico('plus', 13)}Add a task</button></span></td></tr>` + x.map(trow).join('')).join('');
  const prev = iso(new Date(W.y, W.mo - 2, 1)).slice(0, 7), next = iso(new Date(W.y, W.mo, 1)).slice(0, 7);
  return trBar() + oph('Programme of works', 'Every measure per property on a calendar: drag a bar to move it, drag its right edge to change the end, or click it to change dates and status. The installation columns of the Install tracker read the same dates.', `<button class="btn sec" data-act="v45dl" data-v="powb">${ico('file', 15)}Blank template</button><button class="btn pri" data-act="v45dl" data-v="pow">${ico('down', 15)}Download Excel</button>`)
    + `<div class="v45-meta"><span class="v45-mn"><button class="ib" data-act="v45mon" data-v="${prev}" aria-label="Previous month">${ico('back', 15)}</button><b>${MONTHS45[W.mo - 1]} ${W.y}</b><button class="ib" data-act="v45mon" data-v="${next}" aria-label="Next month"><span style="display:inline-flex;transform:rotate(180deg)">${ico('back', 15)}</span></button></span><span><small>Prepared by</small><b>${esc((PEO[ME()] || {}).n || 'You')}</b></span><span><small>Date</small><b>${fmtDy(TODAY)}</b></span></div>`
    + `<div class="cstats">${stat('tb', 'Tasks this month', tm.length)}${stat('ta', 'Scheduled', tm.filter(t => t.st === 'Scheduled').length)}${stat('tv', 'In progress', tm.filter(t => t.st === 'In progress').length)}${stat('tg', 'Complete', tm.filter(t => t.st === 'Complete').length)}${stat('tred', 'On hold', ts.filter(t => t.st === 'On hold').length)}</div>`
    + `<div class="v45-row">${seg('v45pst', st, [['all', 'All'], ...PST45.map(s => [s, s, ts.filter(t => t.st === s && (inWin(t) || !t.s)).length])])}</div>`
    + `<div class="v45-fb"><label class="v45-q">${ico('search', 16)}<input id="v45pq" data-v45in="v45pq" value="${esc(S.f.v45pq || '')}" placeholder="Search a property, postcode or reference"></label><select data-v45in="v45ps" aria-label="Scheme"><option value="all">All E.ON schemes</option>${DB.sc.filter(s => EON45({sc:s.id})).map(s => `<option value="${s.id}"${sc === s.id ? ' selected' : ''}>${esc(s.n)}</option>`).join('')}</select></div>`
    + `<div class="v45-leg">${PST45.map(s => `<span><i class="s-${PSTC45[s]}"></i>${s}</span>`).join('')}<span><i class="we"></i>Weekend</span></div>`
    + `<section class="rd55"><div class="rd55-w v45-gw"><table class="rd55-t v45-g"><thead>${hdr}</thead><tbody>${body || `<tr><td colspan="6">${empty('No tasks this month with these filters.')}</td></tr>`}</tbody></table></div></section>`; };
export const MONTHS45 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ---------- Complaints ---------- */
export const CSTG45 = ['Pre install', 'Mid install', 'Post install'], CTY45 = ['Roof issue', 'Install issue', 'Scaffold issue', 'Customer service', 'Other'];
export const dOpen45 = c => dDiff(c.ron || TODAY) - dDiff(c.on);
VIEWS.del.pages.cmp = () => { const sg = S.f.v45cs || 'Open', xs = DB.cmp45.filter(c => sg === 'all' || c.st === sg).sort((a, b) => a.on < b.on ? 1 : -1), op = DB.cmp45.filter(c => c.st === 'Open');
  const row = c => { const p = prOf45(c.pr) || {ad:'', id:''}, d = dOpen45(c); return `<tr><td>${sh45(c.on)}</td><td class="rd55-pr"><button class="rd55-pn" data-act="v45cm" data-v="${c.id}">${esc(p.ad)}</button><small>${esc(p.ref || '')}</small></td><td><span class="v45-ch">${esc(c.stage)}</span></td><td>${esc(c.ty)}</td><td>${esc((PEO[c.own] || {}).n || '')}</td><td class="v45-nt"><span title="${esc(c.iss)}">${esc(c.iss)}</span></td><td class="v45-nt"><span title="${esc(c.act)}">${esc(c.act || '')}</span></td><td>${c.aon ? sh45(c.aon) : '–'}</td><td>${c.ron ? sh45(c.ron) : '–'}</td><td><span class="v45-st ${c.st === 'Open' ? 'bk' : 'ok'}">${c.st === 'Closed' ? CHK55 : ''}${c.st}</span></td><td><b class="${c.st === 'Open' && d > 14 ? 'v45-red' : ''}">${d}</b></td></tr>`; };
  return trBar() + oph('Complaints', 'Issues raised before, during or after an install, with who owns them and how long they have been open. Days open counts by itself.', `<button class="btn pri" data-act="v45cm" data-v="">${ico('plus', 15)}Log a complaint</button>`)
    + `<div class="cstats">${stat('tred', 'Open', op.length)}${stat('ta', 'Open over 14 days', op.filter(c => dOpen45(c) > 14).length)}${stat('tg', 'Closed', DB.cmp45.filter(c => c.st === 'Closed').length)}${stat('tb', 'Average days open', op.length ? Math.round(sum(op, dOpen45) / op.length) : 0)}</div>`
    + `<div class="v45-row">${seg('v45cs', sg, [['Open', 'Open', op.length], ['Closed', 'Closed', DB.cmp45.length - op.length], ['all', 'All', DB.cmp45.length]])}</div>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t v45-cmt"><thead><tr><th>Date</th><th>Property</th><th>Stage</th><th>Type</th><th>Owner</th><th>Issue</th><th>Action</th><th>Action date</th><th>Resolved</th><th>Status</th><th>Days open</th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="11">${empty('No complaints here.')}</td></tr>`}</tbody></table></div></section>`; };

/* ---------- Menu, help and actions ---------- */
{ const g = SEC5.find(s => s.k === 'del').groups[0][1], r = [...DEL4, 'dir'], add = [mk('itr', 'Install tracker', 'checks', () => 'del:itr', r, {c:() => trk45().filter(p => ['Booked installation', 'Install in progress'].includes(band45(p))).length}), mk('pow', 'Programme of works', 'cal', () => 'del:pow', r), mk('cmp', 'Complaints', 'alert', () => 'del:cmp', r, {c:() => DB.cmp45.filter(c => c.st === 'Open').length, soft:2})];
  g.splice(0, 0, add[0], add[1]); g.splice(g.findIndex(x => x.k === 'clo') + 1, 0, add[2]); add.forEach(x => ITEMS4.push({...x, sec:'Delivery'})); }
if(HELP.del && HELP.del.views) HELP.del.views.unshift(
  HV('itr', 'Install tracker', 'checks', 'The install tracker spreadsheet, filled in the app.', ['As install coordinator I fill pre-install checks, enabling, installation and handover per job, and download the same Excel when I need to send it.', 'As install coordinator I select several jobs and set a column for all of them at once, for example Fully approved and batched.', 'As director I see where every job sits, from Pending approval to Submitted, without anyone moving rows by hand.']),
  HV('pow', 'Programme of works', 'cal', 'Each measure per property on a monthly calendar.', ['As install coordinator I drag a bar to reschedule a measure, and the Install tracker shows the new date.', 'As install coordinator I download the programme of works as the Excel E.ON receives, prepared by me and dated today.']),
  HV('cmp', 'Complaints', 'alert', 'Complaints with their owner and days open.', ['As install coordinator I log a complaint on the property, give it an owner and an action, and see how many days it has been open.']));

export const MON45 = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
A.v45b = el => { S.f.v45b = el.dataset.v; render(); };
A.v45k = el => { S.f.v45k = el.dataset.v; render(); };
A.v45pst = el => { S.f.v45pst = el.dataset.v; render(); };
A.v45cs = el => { S.f.v45cs = el.dataset.v; render(); };
A.v45mon = el => { S.f.v45m = el.dataset.v; render(); };
A.v45go = el => go('del', el.dataset.v);
A.v45unsel = () => { V45.sel.clear(); render(); };
A.v45dr = el => { V45.ed = null; V45.dr = {k:'itr', id:el.dataset.v, b:el.dataset.b || ''}; draw45(); };
A.v45drx = () => { V45.dr = null; V45.ed = null; draw45(); };
A.v45op = el => { V45.dr = null; V45.ed = null; draw45(); abrir(S.view, el.dataset.v, 'ins'); };
A.v45cm = el => { V45.ed = null; V45.dr = {k:'cmp', id:el.dataset.v || null}; draw45(); };
export const rect45 = el => el.getBoundingClientRect();
A.v45ed = el => { V45.ed = {ids:[el.dataset.p], f:el.dataset.f, at:rect45(el)}; draw45(); };
A.v45tk = el => { V45.ed = {task:el.dataset.v, at:rect45(el)}; draw45(); };
A.v45add = el => { V45.ed = {add:el.dataset.v, at:rect45(el)}; draw45(); };
A.v45bulk = el => { V45.ed = {pick:true, at:rect45(el)}; draw45(); };
A.v45bf = el => { const ids = [...V45.sel]; V45.ed = {ids, f:el.dataset.v, at:V45.ed.at}; draw45(); };
A.v45edx = () => { V45.ed = null; draw45(); };
A.v45hold = el => { const p = prOf45(el.dataset.v), it = IT45(p); if(it.hold){ it.hold = ''; log45(p, 'Hold', 'Released'); toast(`${p.ad} is off hold.`); } else { const r = (document.getElementById('v45hr') || {}).value || ''; if(r.trim().length < 3) return toast('Write why the job is on hold.'); it.hold = r.trim(); log45(p, 'Hold', it.hold); toast(`${p.ad} is on hold.`); } render(); };
A.v45note = el => { const p = prOf45(el.dataset.v), t = ((document.getElementById('v45nt') || {}).value || '').trim(); if(t.length < 2) return; IT45(p).notes.push({on:TODAY, by:ME(), t}); toast('Note added.'); render(); };
export const log45 = (p, f, v) => IT45(p).his.push({on:TODAY, by:ME(), f, v:String(v)});
export const fmtV45 = (f, v) => f.kind === 'date' ? (v ? fmtDy(v) : 'cleared') : (v === '' || v == null ? 'cleared' : v);
export function set45Base(ids, fk, v){ const f = FK45[fk]; let n = 0; ids.forEach(id => { const p = prOf45(id); if(!p || !app45(p, f)) return; n++;
    if(f.kind === 'pow'){ const t = taskOf45(p, f.o); Object.assign(t, v); log45(p, f.n, `${t.st}${t.s ? ', ' + sh45(t.s) + (t.e && t.e !== t.s ? ' to ' + sh45(t.e) : '') : ''}`); } else { IT45(p)[fk] = v; log45(p, f.n, fmtV45(f, v)); } });
  V45.ed = null; if(ids.length > 1) V45.sel.clear(); render(); toast(ids.length > 1 ? `${f.n} set on ${n} ${n === 1 ? 'job' : 'jobs'}.` : `${f.n} saved.`); }
A.v45set = el => { const e = V45.ed, v = el.dataset.v; if(e.task) return saveTask45({st:v}); const f = FK45[e.f]; set45(e.ids, e.f, f.kind === 'pow' ? {st:v} : v); };
A.v45today = () => { const i = document.getElementById('v45d1'); if(i) i.value = TODAY; };
A.v45save = () => { const e = V45.ed, g = id => (document.getElementById(id) || {}).value;
  if(e.add){ const m = V45.ed.m || g('v45am'); if(!m) return toast('Pick a measure.'); const s = g('v45d1') || null, en = g('v45d2') || s; DB.pow.push({id:'PW-' + (DB.pow.length + 100), pr:e.add, m, s, e:en, st:s ? 'Scheduled' : 'Not started', by:'', nt:''}); log45(prOf45(e.add), m, 'Task added'); V45.ed = null; render(); return toast(`${m} added to the programme.`); }
  if(e.task) return saveTask45({s:g('v45d1') || null, e:g('v45d2') || g('v45d1') || null, by:g('v45by') || '', nt:g('v45tn') || ''});
  const f = FK45[e.f]; if(f.kind === 'pow') return set45(e.ids, e.f, {s:g('v45d1') || null, e:g('v45d2') || g('v45d1') || null, by:g('v45by') ?? undefined}); set45(e.ids, e.f, f.kind === 'date' ? g('v45d1') || '' : (g('v45tx') || '').trim()); };
export function saveTask45(v){ const t = DB.pow.find(x => x.id === V45.ed.task); if(v.by === undefined) delete v.by; if(v.e && v.s && v.e < v.s) return toast('The end date is before the start.'); Object.assign(t, v); if(v.s && t.st === 'Not started') t.st = 'Scheduled'; log45(prOf45(t.pr), t.m, `${t.st}${t.s ? ', ' + sh45(t.s) : ''}`); V45.ed = null; render(); toast(`${t.m} saved.`); }
A.v45del = () => { const t = DB.pow.find(x => x.id === V45.ed.task); DB.pow.splice(DB.pow.indexOf(t), 1); log45(prOf45(t.pr), t.m, 'Task removed'); V45.ed = null; render(); toast(`${t.m} removed from the programme.`); };
A.v45am = el => { V45.ed.m = el.dataset.v; draw45(); };
A.v45cmsave = () => { const g = id => (document.getElementById(id) || {}).value || '', d = V45.dr, x = d.f || {};
  if(!g('v45cpr') || g('v45ciss').trim().length < 3 || !x.stage || !x.ty) return toast('Pick the property, the stage and the type, and describe the issue.');
  const c = d.id ? DB.cmp45.find(c => c.id === d.id) : {id:'CP-' + (DB.cmp45.length + 1), on:TODAY}; Object.assign(c, {pr:g('v45cpr'), stage:x.stage, ty:x.ty, own:g('v45cow'), iss:g('v45ciss').trim(), act:g('v45cact').trim(), aon:g('v45caon'), ron:g('v45cron'), st:x.st || 'Open'});
  if(c.st === 'Closed' && !c.ron) c.ron = TODAY; if(!d.id) DB.cmp45.push(c); log45(prOf45(c.pr), 'Complaint', `${c.ty}, ${c.st}`); V45.dr = null; render(); toast(d.id ? 'Complaint saved.' : 'Complaint logged.'); };
A.v45cf = el => { const d = V45.dr; d.f = d.f || {}; d.f[el.dataset.k] = el.dataset.v; keep45(); draw45(); };
export const keep45 = () => { const d = V45.dr; if(!d) return; d.keep = {}; document.querySelectorAll('#v45dr [id^="v45c"]').forEach(i => d.keep[i.id] = i.value); };

/* inputs: search, scheme filters and the row checkboxes */
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.v45in; if(!k || e.target.tagName === 'SELECT') return; S.f[k] = e.target.value; V45.refocus = {id:e.target.id, pos:e.target.selectionStart}; render(); });
document.addEventListener('change', e => { const d = e.target.dataset || {}; if(d.v45in && e.target.tagName === 'SELECT'){ S.f[d.v45in] = e.target.value; render(); } if(d.v45sel){ V45.sel[e.target.checked ? 'add' : 'delete'](d.v45sel); render(); } });
/* arrow keys between cells, Escape closes */
document.addEventListener('keydown', e => { if(e.key === 'Escape' && (V45.ed || V45.dr)){ e.stopImmediatePropagation(); if(V45.ed) V45.ed = null; else V45.dr = null; draw45(); return; }
  const c = e.target.closest && e.target.closest('.v45-t .v45-c'); if(!c || !/^Arrow/.test(e.key)) return; e.preventDefault(); let r = +c.dataset.r, k = +c.dataset.c;
  if(e.key === 'ArrowDown') r++; if(e.key === 'ArrowUp') r--; if(e.key === 'ArrowRight') k++; if(e.key === 'ArrowLeft') k--; const n = document.querySelector(`.v45-t .v45-c[data-r="${r}"][data-c="${k}"]`); if(n) n.focus(); }, true);
addEventListener('mousedown', e => { if(V45.ed && !e.target.closest('#v45pop') && !e.target.closest('[data-act^="v45"]') && !e.target.closest('[data-v45bar]')){ V45.ed = null; draw45(); } }, true);

/* drag a bar to move it, or its right edge to change the end */
addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-v45bar]'); if(!b) return; const t = DB.pow.find(x => x.id === b.dataset.v45bar); if(!t) return; e.preventDefault();
  V45.drag = {t, b, x0:e.clientX, l0:parseFloat(b.style.left), w0:parseFloat(b.style.width), end:!!e.target.dataset.v45end, dd:0}; b.setPointerCapture && b.setPointerCapture(e.pointerId); b.classList.add('drag'); });
addEventListener('pointermove', e => { const d = V45.drag; if(!d) return; d.dd = Math.round((e.clientX - d.x0) / DW45); if(d.end) d.b.style.width = Math.max(DW45 - 4, d.w0 + d.dd * DW45) + 'px'; else d.b.style.left = d.l0 + d.dd * DW45 + 'px'; });
addEventListener('pointerup', e => { const d = V45.drag; if(!d) return; V45.drag = null; d.b.classList.remove('drag'); const t = d.t;
  if(!d.dd){ V45.ed = {task:t.id, at:rect45(d.b)}; return draw45(); }
  if(d.end){ const ne = addDays(t.e || t.s, d.dd); t.e = ne < t.s ? t.s : ne; } else { t.s = addDays(t.s, d.dd); t.e = addDays(t.e || t.s, d.dd); }
  if(t.st === 'Not started') t.st = 'Scheduled'; log45(prOf45(t.pr), t.m, `Moved to ${sh45(t.s)}${t.e !== t.s ? ' to ' + sh45(t.e) : ''}`); render(); toast(`${t.m}: ${sh45(t.s)}${t.e !== t.s ? ' to ' + sh45(t.e) : ''}.`); });

/* ---------- The popover editor and the side panel ---------- */
export const chips45 = (vals, cur, act = 'v45set', attr = '') => `<div class="v45-chips">${vals.map(v => `<button type="button" data-act="${act}" data-v="${esc(v)}"${attr} aria-pressed="${cur === v}">${esc(v)}</button>`).join('')}</div>`;
export function edHTML45Base(){ const e = V45.ed;
  if(e.pick){ const bk = S.f.v45k && S.f.v45k !== 'sum' ? S.f.v45k : null; const fs = FLD45.filter(f => !bk || f.b === bk);
    return `<header><b>Set a field for ${V45.sel.size} jobs</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header>${BLK45.filter(([k]) => fs.some(f => f.b === k)).map(([k, n]) => `<small class="v45-pg">${esc(n)}</small><div class="v45-chips">${fs.filter(f => f.b === k).map(f => `<button type="button" data-act="v45bf" data-v="${f.k}">${esc(f.n)}</button>`).join('')}</div>`).join('')}`; }
  if(e.add){ return `<header><b>Add a task</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header><p class="v45-sub">${esc(prOf45(e.add).ad)}</p><small class="v45-pg">Measure</small>${chips45(PMEAS45, e.m, 'v45am')}<div class="v45-2"><label><small>Start</small><input type="date" id="v45d1"></label><label><small>End</small><input type="date" id="v45d2"></label></div><footer><button class="btn sec sm" data-act="v45edx">Cancel</button><button class="btn pri sm" data-act="v45save">Add to the programme</button></footer>`; }
  if(e.task){ const t = DB.pow.find(x => x.id === e.task), p = prOf45(t.pr);
    return `<header><b>${esc(t.m)}</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header><p class="v45-sub">${esc(p.ad)}</p><small class="v45-pg">Status</small>${chips45(PST45, t.st)}<div class="v45-2"><label><small>Start</small><input type="date" id="v45d1" value="${t.s || ''}"></label><label><small>End</small><input type="date" id="v45d2" value="${t.e || ''}"></label></div>`
      + `<label class="v45-f"><small>Installer</small><input id="v45by" list="v45ins" value="${esc(t.by || '')}" placeholder="Who does it"><datalist id="v45ins">${INST45.map(x => `<option value="${esc(x)}">`).join('')}</datalist></label><label class="v45-f"><small>Notes</small><input id="v45tn" value="${esc(t.nt || '')}" placeholder="Shown in the Notes column of the Excel"></label>`
      + `<footer><button class="btn sec sm v45-del" data-act="v45del">Remove</button><button class="btn pri sm" data-act="v45save">Save dates</button></footer>`; }
  const f = FK45[e.f], one = e.ids.length === 1 ? prOf45(e.ids[0]) : null, v = one ? val45(one, f) : null;
  const h = `<header><b>${esc(f.n)}</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header><p class="v45-sub">${one ? esc(one.ad) : `${e.ids.length} selected jobs; jobs where it does not apply are skipped`}</p>`;
  if(f.kind === 'st') return h + chips45(STV45, v) + `<button class="v45-clr" data-act="v45set" data-v="">Clear</button>`;
  if(f.kind === 'yn') return h + chips45(['Yes', 'No'], v) + `<button class="v45-clr" data-act="v45set" data-v="">Clear</button>`;
  if(f.kind === 'ch') return h + chips45(f.o, v) + `<button class="v45-clr" data-act="v45set" data-v="">Clear</button>`;
  if(f.kind === 'date') return h + `<div class="v45-2"><label><small>Date</small><input type="date" id="v45d1" value="${v || ''}"></label><button class="btn sec sm" data-act="v45today">Today</button></div><footer><button class="btn sec sm" data-act="v45set" data-v="">Clear</button><button class="btn pri sm" data-act="v45save">Save</button></footer>`;
  if(f.kind === 'txt') return h + `<textarea id="v45tx" rows="3" placeholder="Type here">${esc(v || '')}</textarea><footer><span class="v45-k">Ctrl + Enter saves</span><button class="btn pri sm" data-act="v45save">Save</button></footer>`;
  const t = v || {}; return h + `<small class="v45-pg">Status</small>${chips45(PST45, one ? t.st : null)}<div class="v45-2"><label><small>Start</small><input type="date" id="v45d1" value="${t.s || ''}"></label><label><small>End</small><input type="date" id="v45d2" value="${t.e || ''}"></label></div>${f.k === 'spv' ? `<label class="v45-f"><small>Installer</small><input id="v45by" list="v45ins" value="${esc(t.by || '')}"><datalist id="v45ins">${INST45.map(x => `<option value="${esc(x)}">`).join('')}</datalist></label>` : ''}<p class="v45-sub">Same dates as the Programme of works.</p><footer><button class="btn sec sm" data-act="v45go" data-v="pow">Open the programme</button><button class="btn pri sm" data-act="v45save">Save dates</button></footer>`; }
export function drHTML45Base(){ const d = V45.dr;
  if(d.k === 'cmp'){ const c = d.id ? DB.cmp45.find(x => x.id === d.id) : null, f = d.f || (d.f = c ? {stage:c.stage, ty:c.ty, st:c.st} : {st:'Open'}), k = d.keep || {}, val = (id, v) => esc(k[id] ?? v ?? '');
    const ps = trk45().filter(p => p.ph !== 'Cancelled'), own = Object.entries(PEO).filter(([, p]) => ['del', 'dir', 'com', 'mob'].includes(p.ar));
    return `<header><div><small>${c ? c.id : 'New'}</small><h2>${c ? 'Complaint' : 'Log a complaint'}</h2></div><button class="ib" data-act="v45drx" aria-label="Close">${ico('x', 17)}</button></header><div class="v45-db">`
      + `<label class="v45-f"><small>Property <em class="req">*</em></small><select id="v45cpr"><option value="">Choose a property...</option>${ps.map(p => `<option value="${p.id}"${(k.v45cpr ?? (c && c.pr)) === p.id ? ' selected' : ''}>${esc(p.ad)}, ${esc(p.pc)}</option>`).join('')}</select></label>`
      + `<small class="v45-pg">Stage <em class="req">*</em></small>${chips45(CSTG45, f.stage, 'v45cf', ' data-k="stage"')}<small class="v45-pg">Type <em class="req">*</em></small>${chips45(CTY45, f.ty, 'v45cf', ' data-k="ty"')}`
      + `<label class="v45-f"><small>Owner</small><select id="v45cow">${own.map(([id, p]) => `<option value="${id}"${(k.v45cow ?? (c ? c.own : 'dre')) === id ? ' selected' : ''}>${esc(p.n)}, ${esc(p.r)}</option>`).join('')}</select></label>`
      + `<label class="v45-f"><small>Issue <em class="req">*</em></small><textarea id="v45ciss" rows="3">${val('v45ciss', c && c.iss)}</textarea></label><label class="v45-f"><small>Action</small><textarea id="v45cact" rows="2">${val('v45cact', c && c.act)}</textarea></label>`
      + `<div class="v45-2"><label><small>Action date</small><input type="date" id="v45caon" value="${val('v45caon', c && c.aon)}"></label><label><small>Resolved on</small><input type="date" id="v45cron" value="${val('v45cron', c && c.ron)}"></label></div><small class="v45-pg">Status</small>${chips45(['Open', 'Closed'], f.st, 'v45cf', ' data-k="st"')}`
      + `</div><footer><button class="btn sec" data-act="v45drx">Cancel</button><button class="btn pri" data-act="v45cmsave">${c ? 'Save' : 'Log the complaint'}</button></footer>`; }
  const p = prOf45(d.id), it = IT45(p), b = band45(p);
  return `<header><div><small>${esc(p.ref)}, ${esc(p.pc)}</small><h2>${esc(p.ad)}</h2><span class="v45-hb">${scPill55(p.sc)}${bPill45(b)}<span class="v45-ms">${mPills45(p)}</span></span></div><button class="ib" data-act="v45drx" aria-label="Close">${ico('x', 17)}</button></header><div class="v45-db">`
    + `<div class="v45-acts"><button class="btn sec sm" data-act="v45op" data-v="${p.id}">${ico('home', 14)}Open the property</button><button class="btn sec sm" data-act="v45go" data-v="pow">${ico('cal', 14)}Programme of works</button></div>`
    + (it.hold ? `<div class="v45-hold">${ico('alert', 15)}<span><b>On hold</b>${esc(it.hold)}</span><button class="btn sec sm" data-act="v45hold" data-v="${p.id}">Release</button></div>` : '')
    + BLK45.map(([k, n, ic]) => { const fs = FLD45.filter(f => f.b === k && app45(p, f)), pc0 = pct45(p, k); if(!fs.length) return '';
      return `<section class="v45-sec${d.b === k ? ' hl' : ''}" id="v45s-${k}"><h3><span class="oi2">${ico(ic, 16)}</span>${esc(n)}<em>${pc0}%</em><span class="v45-sb"><i style="width:${pc0}%"></i></span></h3>${fs.map(f => `<div class="v45-fr"><span>${esc(f.n)}</span>${cell45(p, f, 0, 0)}</div>`).join('')}</section>`; }).join('')
    + `<section class="v45-sec"><h3><span class="oi2">${ico('msg', 16)}</span>Notes<em>${it.notes.length}</em></h3>${it.notes.slice().reverse().map(x => `<div class="v45-n"><b>${esc((PEO[x.by] || {}).n || '')}</b><small>${fmtDy(x.on)}</small><p>${esc(x.t)}</p></div>`).join('') || '<p class="v45-sub">No notes yet.</p>'}<textarea id="v45nt" rows="2" placeholder="Add a note for the team, it is kept with its date and author"></textarea><div class="v45-acts"><button class="btn pri sm" data-act="v45note" data-v="${p.id}">Add the note</button></div></section>`
    + (!it.hold && !['Cancelled', 'Submitted jobs'].includes(b) ? `<section class="v45-sec"><h3><span class="oi2">${ico('alert', 16)}</span>Put on hold</h3><input id="v45hr" placeholder="Why, for example: customer wants a site visit first"><div class="v45-acts"><button class="btn sec sm" data-act="v45hold" data-v="${p.id}">Put on hold</button></div></section>` : '')
    + `<section class="v45-sec"><h3><span class="oi2">${ico('history', 16)}</span>Changes</h3>${it.his.slice(-6).reverse().map(h => `<div class="v45-hi"><b>${esc(h.f)}</b> ${esc(h.v)}<small>${esc((PEO[h.by] || {}).n || '')}, ${fmtDy(h.on)}</small></div>`).join('') || '<p class="v45-sub">Nothing changed in this demo session yet.</p>'}</section></div>`; }
export function draw45(){ let dr = document.getElementById('v45dr');
  if(V45.dr && (V45.dr.k === 'cmp' || prOf45(V45.dr.id))){ if(!dr){ dr = document.createElement('div'); dr.id = 'v45dr'; document.body.appendChild(dr); } const sc = dr.querySelector('.v45-db'), top = sc ? sc.scrollTop : 0, isNew = dr.dataset.k !== `${V45.dr.k}${V45.dr.id}`;
    const ih = drHTML45(), as = dr.querySelector('.v45-pan'); if(isNew || !as) dr.innerHTML = `<div class="v45-scrim" data-act="v45drx"></div><aside class="v45-pan" role="dialog" aria-modal="true" aria-label="Details">${ih}</aside>`; else if(dr._h !== ih) as.innerHTML = ih; dr._h = ih; dr.dataset.k = `${V45.dr.k}${V45.dr.id}`;
    const nb = dr.querySelector('.v45-db'); if(nb){ if(!isNew) nb.scrollTop = top; else if(V45.dr.b){ const s = dr.querySelector('#v45s-' + V45.dr.b); if(s) nb.scrollTop = s.offsetTop - 12; } } }
  else if(dr) dr.remove();
  let w = document.getElementById('v45pop'); if(!V45.ed){ if(w) w.remove(); return; } if(!w){ w = document.createElement('div'); w.id = 'v45pop'; document.body.appendChild(w); }
  w.innerHTML = `<div class="v45-pop" role="dialog" aria-label="Edit">${edHTML45()}</div>`; const p = w.firstChild, a = V45.ed.at || {left:innerWidth / 2 - 160, bottom:120, top:120}, h = p.offsetHeight, wd = p.offsetWidth;
  p.style.left = Math.max(8, Math.min(a.left, innerWidth - wd - 8)) + 'px'; p.style.top = (a.bottom + 6 + h > innerHeight - 8 ? Math.max(8, a.top - h - 6) : a.bottom + 6) + 'px';
  const fi = p.querySelector('textarea, input[type="date"], [aria-pressed="true"], .v45-chips button'); if(fi) fi.focus(); }
document.addEventListener('keydown', e => { if(e.target.id === 'v45tx' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); A.v45save(); } if(e.target.closest && e.target.closest('#v45pop') && e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); A.v45save(); } });

/* ---------- Excel: the same files REFYT already sends, built from the app ---------- */
export let XL45 = null;
export const xl45 = () => XL45 || (XL45 = import('exceljs').then(m => m.default || m).catch(e => { XL45 = null; throw e; }));
export const xd45 = s => { if(!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const col45 = n => { let s = ''; while(n > 0){ const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
export const fill45 = argb => ({type:'pattern', pattern:'solid', fgColor:{argb}});
export const HDR45 = c => { c.font = {name:'Arial', bold:true, color:{argb:'FFFFFFFF'}, size:10}; c.fill = fill45('FF1F3864'); c.alignment = {vertical:'middle', horizontal:'center', wrapText:true}; c.border = {bottom:{style:'thin', color:{argb:'FF0F1F3D'}}}; };
export const XV45 = {Done:'DONE', Pending:'PENDING', Missing:'MISSING', 'N/A':'N/A', Yes:'Y', No:'N'};
export function powBook45(X, blank){ const W = win45(), wb = new X.Workbook(), ws = wb.addWorksheet(`Programme ${MON45[W.mo]} ${W.y}`), days = Array.from({length:W.n}, (_, i) => addDays(W.a, i)), C0 = 9, CL = col45(C0 + days.length - 1);
  ws.properties.defaultRowHeight = 16; ws.getCell('A1').value = 'Refyt/EON GFS - Programme of works'; ws.getCell('A1').font = {name:'Arial', bold:true, size:14, color:{argb:'FF1F3864'}};
  [['A2', 'Month:'], ['D2', 'Prepared by:'], ['F2', 'Date']].forEach(([a, v]) => { ws.getCell(a).value = v; ws.getCell(a).font = {name:'Arial', bold:true, size:10}; });
  ws.getCell('B2').value = xd45(W.a); ws.getCell('B2').numFmt = 'mmm-yy'; ws.getCell('E2').value = (PEO[ME()] || {}).n || ''; ws.getCell('G2').value = xd45(TODAY); ws.getCell('G2').numFmt = 'dd/mm/yyyy'; ['E2', 'G2'].forEach(a => { ws.getCell(a).fill = fill45('FFFFF9E5'); ws.getCell(a).font = {name:'Arial', size:10}; });
  ws.getCell(3, C0).value = `${MONTHS45[W.mo - 1]} ${W.y}`; ws.getCell(3, C0).font = {name:'Arial', bold:true, size:10};
  days.forEach((d, i) => { const c4 = ws.getCell(4, C0 + i); c4.value = DSH[fromIso(d).getDay()][0]; c4.font = {name:'Arial', size:8, color:{argb:'FF64748B'}}; c4.alignment = {horizontal:'center'}; const c5 = ws.getCell(5, C0 + i); c5.value = xd45(d); c5.numFmt = 'd'; HDR45(c5); ws.getColumn(C0 + i).width = 3.6; });
  ['Property', 'Measure', 'Start Date', 'End Date', 'Duration (days)', 'Status', 'Notes'].forEach((h, i) => HDR45(ws.getCell(5, i + 1))); ws.getRow(5).height = 30;
  [38, 26, 12, 12, 10, 13, 40, 2].forEach((w, i) => ws.getColumn(i + 1).width = w);
  const rows = blank ? [] : trk45().flatMap(p => tasks45(p).filter(t => !t.s || (t.s <= W.b && (t.e || t.s) >= W.a)).map(t => [p, t])).sort((a, b) => ((a[1].s || '9') < (b[1].s || '9') ? -1 : 1)).sort((a, b) => a[0].ad === b[0].ad ? 0 : trk45().indexOf(a[0]) - trk45().indexOf(b[0]));
  const order = []; rows.forEach(([p]) => { if(!order.includes(p)) order.push(p); }); const sorted = order.flatMap(p => rows.filter(r => r[0] === p));
  const last = Math.max(160, 6 + sorted.length + 40);
  for(let r = 6; r <= last; r++){ const x = sorted[r - 6]; const row = ws.getRow(r);
    if(x){ const [p, t] = x; row.getCell(1).value = `${p.ad} - ${p.pc}`; row.getCell(2).value = t.m; row.getCell(3).value = xd45(t.s); row.getCell(4).value = xd45(t.e); row.getCell(6).value = XST45[t.st]; row.getCell(7).value = [t.by, t.nt].filter(Boolean).join('. ') || null; }
    row.getCell(5).value = {formula:`IF(AND(C${r}<>"",D${r}<>""),NETWORKDAYS(C${r},D${r}),"")`}; [1, 2, 3, 4, 6, 7].forEach(c => { const cl = row.getCell(c); cl.fill = fill45('FFFFF9E5'); cl.font = {name:'Arial', size:10}; if(c === 3 || c === 4) cl.numFmt = 'dd/mm/yy'; }); row.getCell(5).font = {name:'Arial', size:10}; row.getCell(5).alignment = {horizontal:'center'}; }
  ws.dataValidations.add(`F6:F${last}`, {type:'list', allowBlank:true, formulae:['"Not Started,Scheduled,In Progress,On Hold,Complete,Cancelled"']});
  ws.dataValidations.add(`B6:B${last}`, {type:'list', allowBlank:true, showErrorMessage:false, formulae:[`"${PMEAS45.join(',')}"`]});
  ws.dataValidations.add(`C6:D${last}`, {type:'date', operator:'greaterThan', allowBlank:true, showErrorMessage:true, errorTitle:'Date', error:'Type a date, for example 20/11/2026.', formulae:[new Date(Date.UTC(2020, 0, 1))]});
  const cf = (f, argb) => ({type:'expression', formulae:[f], style:{fill:{type:'pattern', pattern:'solid', bgColor:{argb}}}}), on = `AND($C6<>"",I$5>=$C6,I$5<=IF($D6="",$C6,$D6)`;
  ws.addConditionalFormatting({ref:`F6:F${last}`, rules:[cf('$F6="Complete"', 'FFE2EFDA'), cf('$F6="In Progress"', 'FFDDEBF7'), cf('$F6="On Hold"', 'FFFFF2CC'), cf('$F6="Cancelled"', 'FFEDEDED')].map((r, i) => ({...r, priority:i + 1}))});
  ws.addConditionalFormatting({ref:`I6:${CL}${last}`, rules:[cf(`${on},$F6="Complete")`, 'FF70AD47'), cf(`${on},$F6="On Hold")`, 'FFFFC000'), cf(`${on},$F6="Cancelled")`, 'FFBFBFBF'), cf(`${on},$F6="In Progress")`, 'FF2E75B6'), cf(`${on})`, 'FF9DC3E6'), cf('WEEKDAY(I$5,2)>5', 'FFF2F2F2')].map((r, i) => ({...r, priority:10 + i}))});
  ws.views = [{state:'frozen', xSplit:2, ySplit:5}]; return wb; }
export function itrBook45Base(X, blank){ const wb = new X.Workbook(), ws = wb.addWorksheet('Progress Tracker'), fx = ['Delivery', 'Council', 'No.', 'Address', 'Measures', 'Reference', 'Comments'], pf = FLD45.filter(f => f.xg !== 'Install Checks'), ps = blank ? [] : trk45();
  const cols = [...fx.map(n => ({n})), ...pf.map(f => ({n:f.n, f}))]; let gi = fx.length + 1;
  [...new Set(pf.map(f => f.xg))].forEach(g => { const n = pf.filter(f => f.xg === g).length; ws.mergeCells(1, gi, 1, gi + n - 1); const c = ws.getCell(1, gi); c.value = g; c.font = {name:'Arial', bold:true, size:10, color:{argb:'FF1F3864'}}; c.fill = fill45('FFDDE5F3'); c.alignment = {horizontal:'center'}; gi += n; });
  cols.forEach((c, i) => { const h = ws.getCell(2, i + 1); h.value = c.n; HDR45(h); ws.getColumn(i + 1).width = i === 3 ? 34 : i === 6 ? 36 : c.f && c.f.kind === 'txt' ? 30 : 14; }); ws.getRow(2).height = 34;
  let r = 3, no = 0; const stCols = [];
  cols.forEach((c, i) => { if(c.f && ['st', 'yn', 'ch'].includes(c.f.kind)) stCols.push([col45(i + 1), c.f]); });
  (blank ? BANDS45 : BANDS45.filter(b => ps.some(p => band45(p) === b))).forEach(b => { const br = ws.getRow(r++); br.getCell(1).value = b.toUpperCase(); br.getCell(1).font = {name:'Arial', bold:true, size:10}; for(let c = 1; c <= cols.length; c++) br.getCell(c).fill = fill45('FFF2F2F2');
    ps.filter(p => band45(p) === b).forEach(p => { const row = ws.getRow(r++), it = IT45(p), nt = it.notes[it.notes.length - 1]; no++;
      [delMon45(p), council45(p), no, `${p.ad} ${p.pc}`, p.ms.map(x => MEAS[x.m].s).join(', '), p.ref, [it.hold, nt && nt.t].filter(Boolean).join('. ') || null].forEach((v, i) => row.getCell(i + 1).value = v);
      pf.forEach((f, j) => { const cell = row.getCell(fx.length + 1 + j); if(!app45(p, f)){ cell.value = 'N/A'; cell.font = {name:'Arial', size:10, color:{argb:'FF94A3B8'}}; return; } const v = val45(p, f);
        if(f.kind === 'pow'){ cell.value = v.s ? xd45(v.s) : v.st === 'Not started' ? null : XST45[v.st]; if(v.s) cell.numFmt = 'dd/mm/yy'; if(f.k === 'spv' && v.by){ cell.note = `Installer: ${v.by}`; } }
        else if(f.kind === 'date'){ cell.value = xd45(v); if(v) cell.numFmt = 'dd/mm/yy'; } else cell.value = v ? (XV45[v] || v) : null; cell.font = {name:'Arial', size:10}; });
      row.eachCell(c => { if(!c.font || !c.font.name) c.font = {name:'Arial', size:10}; }); }); });
  const last = Math.max(r + 40, 120); stCols.forEach(([L, f]) => ws.dataValidations.add(`${L}3:${L}${last}`, {type:'list', allowBlank:true, showErrorMessage:false, formulae:[`"${(f.kind === 'st' ? ['DONE', 'PENDING', 'MISSING', 'N/A'] : f.kind === 'yn' ? ['Y', 'N'] : f.o).join(',')}"`]}));
  for(let i = 3; i <= last; i++) [1, 2, 3, 4, 5, 6, 7].forEach(c => { const cl = ws.getCell(i, c); if(cl.value == null && !cl.fill) cl.fill = fill45('FFFFF9E5'); });
  ws.views = [{state:'frozen', xSplit:4, ySplit:2}];
  const cw = wb.addWorksheet('Complaints Tracker'), ch = ['Date of complaint / issue', 'Stage', 'Type', 'Site / address', 'Owner', 'Issue', 'Action', 'Action Date', 'Resolve date', 'Status', 'Days open'];
  ch.forEach((h, i) => { HDR45(cw.getCell(1, i + 1)); cw.getCell(1, i + 1).value = h; cw.getColumn(i + 1).width = [14, 13, 16, 30, 18, 40, 40, 12, 12, 10, 10][i]; }); cw.getRow(1).height = 30;
  const cs = blank ? [] : DB.cmp45.slice().sort((a, b) => a.on < b.on ? -1 : 1), cl2 = Math.max(cs.length + 20, 40);
  for(let i = 0; i < cl2; i++){ const rr = i + 2, row = cw.getRow(rr), c = cs[i]; if(c){ const p = prOf45(c.pr) || {}; [xd45(c.on), c.stage, c.ty, p.ad, (PEO[c.own] || {}).n || '', c.iss, c.act || null, xd45(c.aon), xd45(c.ron), c.st].forEach((v, j) => row.getCell(j + 1).value = v); }
    row.getCell(11).value = {formula:`IF(A${rr}="","",IF(I${rr}<>"",I${rr}-A${rr},TODAY()-A${rr}))`}; [1, 8, 9].forEach(j => row.getCell(j).numFmt = 'dd/mm/yy'); row.eachCell({includeEmpty:true}, x => x.font = {name:'Arial', size:10}); }
  cw.dataValidations.add(`B2:B${cl2 + 1}`, {type:'list', allowBlank:true, formulae:[`"${CSTG45.join(',')}"`]}); cw.dataValidations.add(`C2:C${cl2 + 1}`, {type:'list', allowBlank:true, formulae:[`"${CTY45.join(',')}"`]}); cw.dataValidations.add(`J2:J${cl2 + 1}`, {type:'list', allowBlank:true, formulae:['"Open,Closed"']});
  cw.views = [{state:'frozen', ySplit:1}];
  const iw = wb.addWorksheet('Install Checks'), icf = FLD45.filter(f => ['scl', 'pav', 'lift', 'sto', 'rear', 'base', 'roof', 'sat', 'qch'].includes(f.k)), ih = ['Address', 'Scaff Location', 'Pavement Licence', 'Extra lift', 'Storeys', 'Extra Rear Required', 'Basement', 'Roof Condition', 'Satellite', 'Quote changes'];
  const ik = ['scl', 'pav', 'lift', 'sto', 'rear', 'base', 'roof', 'sat', 'qch']; ih.forEach((h, i) => { const c = iw.getCell(1, i + 1); c.value = h; HDR45(c); iw.getColumn(i + 1).width = i === 0 || i >= 7 ? 32 : 14; }); iw.getRow(1).height = 30;
  (blank ? [] : trk45().filter(p => !['Cancelled', 'Submitted jobs'].includes(band45(p)))).forEach((p, i) => { const row = iw.getRow(i + 2); row.getCell(1).value = `${p.ad} ${p.pc}`; ik.forEach((k, j) => row.getCell(j + 2).value = IT45(p)[k] || null); row.eachCell(x => x.font = {name:'Arial', size:10}); });
  ik.forEach((k, j) => { const f = FK45[k]; if(f.kind === 'ch') iw.dataValidations.add(`${col45(j + 2)}2:${col45(j + 2)}200`, {type:'list', allowBlank:true, showErrorMessage:false, formulae:[`"${f.o.join(',')}"`]}); });
  const xw = wb.addWorksheet('Cancelled Tracker'), xh = ['Status Reason', 'Reference', 'Address', 'Post Code', 'Measures', 'Quoted', 'Cancellation reason', 'Customer Contacted', 'Comments'];
  xh.forEach((h, i) => { const c = xw.getCell(1, i + 1); c.value = h; HDR45(c); xw.getColumn(i + 1).width = [18, 14, 30, 10, 18, 10, 40, 12, 34][i]; }); xw.getRow(1).height = 30;
  (blank ? [] : DB.pr.filter(p => EON45(p) && p.ph === 'Cancelled')).forEach((p, i) => { const row = xw.getRow(i + 2); ['Property Unsuitable', p.ref, p.ad, p.pc, p.ms.map(x => MEAS[x.m].s).join(', '), p.cancel && pIdx(p.cancel.at) >= 2 ? 'yes' : 'no', (p.cancel || {}).why || '', 'yes', null].forEach((v, j) => row.getCell(j + 1).value = v); row.eachCell(x => x.font = {name:'Arial', size:10}); });
  if(blank){ const hw = wb.addWorksheet('How to fill'); [['How to fill this template'], [''], ['One row per property, under its band (Pending approval, Pre installation, and so on).'], ['Yellow cells are the ones you type in. Status columns take DONE, PENDING, MISSING or N/A; approvals take Y or N.'], ['Dates as dd/mm/yy. Write N/A where a column does not apply to the job.'], ['Example row: Nov | Medway | 1 | 12 Example Street ME7 1AA | Solar PV | EON-00000 | Customer prefers mornings'], [''], ['Filling it in the REFYT app is faster: the bands, N/A and the dates of the Programme of works are filled for you.']].forEach((l, i) => { const c = hw.getCell(i + 1, 1); c.value = l[0]; c.font = {name:'Arial', size:i ? 10 : 13, bold:!i}; }); hw.getColumn(1).width = 110; }
  return wb; }
A.v45dl = async el => { const k = el.dataset.v, blank = /b$/.test(k), pw = /^pow/.test(k); if(el.disabled) return; el.disabled = true; const t0 = el.innerHTML; el.innerHTML = `${ico('clock', 15)}Preparing...`;
  try { const X = await xl45(), wb = pw ? powBook45(X, blank) : itrBook45(X, blank), buf = await wb.xlsx.writeBuffer(), W = win45(), d = fromIso(TODAY);
    const name = pw ? (blank ? 'PoW_template.xlsx' : `PoW_${d.getDate()}_${MON45[d.getMonth() + 1]}_${d.getFullYear()}_${MON45[W.mo]}.xlsx`) : (blank ? 'Install_Tracker_template.xlsx' : `Install_Tracker_${d.getDate()}_${MON45[d.getMonth() + 1]}_${d.getFullYear()}.xlsx`);
    const ok = await saveFile4(name, new Blob([buf], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})); if(ok) toast(`${name} is ready.`); }
  catch(e){ toast('The Excel file could not be prepared. Check the connection and try again.'); }
  finally { el.disabled = false; el.innerHTML = t0; } };

/* ---------- After every render: popover, panel, refocus the search, the Tour button in the header ---------- */
{ wrapRender(r45 => (...x) => { r45(...x); draw45(); if(V45.refocus){ const i = document.getElementById(V45.refocus.id); if(i){ i.focus(); try { i.setSelectionRange(V45.refocus.pos, V45.refocus.pos); } catch(e) {} } V45.refocus = null; }
  const tl = document.getElementById('tools'); if(tl && !tl.querySelector('.v45-tour')){ const nb = tl.querySelector('[data-act="popNt"]'), b = `<button class="rf-hb v45-tour" data-act="tour" title="Demo tour" aria-label="Demo tour">${ico('flag', 17)}</button>`; if(nb) nb.insertAdjacentHTML('beforebegin', b); else tl.insertAdjacentHTML('afterbegin', b); }
  const tb = document.querySelector('.v45-tour'); if(tb) tb.classList.toggle('on', !!(S.tour && S.tour.open)); }); }

/* ---------- Comment: the kit's Comment button, in place of the Tour button at the bottom ---------- */
/* Comment: el botón de la app (web/src/refyt/comment) guarda en Feedback, no en el webhook de la demo; de aquí
   lee la pantalla. Solo la pantalla visible: el original caía en el título de una vista oculta. */
export const commentContext = () => { const s = SEC5.find(x => x.k === S.sec5) || {}, pg = S.page[S.view] || '', h1 = document.querySelector('.view:not([hidden]) .op-h h1') || document.querySelector('.view:not([hidden]) h1'), nv = document.querySelector('.view:not([hidden]) aside.sb [aria-current="true"]'), dr = V45.dr && V45.dr.id ? prOf45(V45.dr.id) : null, fi = (S.fi || {})[S.view], pr = dr || (typeof fi === 'string' ? prOf45(fi) : null);
    return {app:s.n || 'REFYT', pantalla:h1 ? h1.textContent.trim() : nv ? nv.title || nv.textContent.trim() : pg, pantalla_id:`${S.view}/${pg}`, registro:pr ? pr.id : '', registro_nombre:pr ? pr.ad : '', pestana:V45.dr && V45.dr.k === 'itr' ? ((BLK45.find(b => b[0] === V45.dr.b) || [])[1] || '') : ''}; };

/* ---------- Tour and version ---------- */
TOUR.push({t:'Install tracker in the app', min:1, dolor:'Before, the install tracker was a spreadsheet outside the system, with rows moved by hand between bands.', show:['Bands set themselves from the job data.', 'Pick a group to fill its columns like a spreadsheet; select several jobs to set a column for all.', 'Download Excel gives the same file as before.'], say:'Fill it here, send the same Excel.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'itr'); }},
  {t:'Programme of works on a calendar', min:1, dolor:'Before, the programme was a second spreadsheet with the same install dates typed again.', show:['Drag a bar to move a measure; the tracker shows the new date.', 'Download Excel keeps the Gantt colours and the status lists.'], say:'One date, in both documents.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'pow'); }});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.44') v.url = 'https://claude.ai/artifact/QncFMz3LHDHynMD5QVegwT'; } });
VERSIONS.push({v:'v5.45', date:TODAY, major:false, current:true, url:null, title:'Install tracker, Programme of works and Complaints, with their Excel files', sum:'The install tracker and the programme of works that lived in spreadsheets are filled in Delivery and download as the same Excel files; complaints have their own list; a Comment button replaces the Tour button at the bottom.', steps:[
  {t:'Install tracker', min:1, dolor:'Before, the install tracker was a spreadsheet outside the app, with bands kept by moving rows.', show:['Delivery › Install tracker: every E.ON job by band, with a progress bar per group.', 'Pick Enabling or Installation to fill the columns cell by cell.'], say:'The same columns, without moving rows.', go:() => { S.role = 'dir'; S.trail = null; S.f.v45k = 'sum'; go('del', 'itr'); }},
  {t:'Fill several jobs at once', min:.5, dolor:'Before, the same value was typed row by row.', show:['Tick several jobs and use Set a field for all.', 'Arrow keys move between cells; Enter opens one.'], say:'One click for a whole batch.', go:() => { S.role = 'dir'; S.trail = null; S.f.v45k = 'en'; go('del', 'itr'); }},
  {t:'Programme of works', min:1, dolor:'Before, the programme repeated the install dates in a second file.', show:['Drag a bar to move it, or its right edge to change the end.', 'The Install tracker reads the same dates.'], say:'One date, in both places.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'pow'); }},
  {t:'Download the Excel files', min:.5, dolor:'Before, the files were the source; now they come out of the app.', show:['Download Excel gives the PoW with its Gantt colours, or the tracker with its tabs.', 'Blank template, for anyone who still fills it outside.'], say:'Same file, no retyping.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'pow'); }},
  {t:'Complaints', min:.5, dolor:'Before, complaints were a tab of the tracker with days open typed by hand.', show:['Log a complaint on a property with owner and action.', 'Days open counts by itself.'], say:'Nothing open gets forgotten.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'cmp'); }},
  {t:'Comment on any screen', min:.5, dolor:'Before, feedback on the demo came by email or in the meeting.', show:['Comment, at the bottom right: say if it is an improvement, something that does not work or a question.', 'Point at something on the screen or send a file.'], say:'Tell us right where you see it.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'itr'); }}]});
/* Later layers wrap or replace set45 (the original reassigns it). Kept as var: no temporal dead zone. */
export var set45W = null;
export function set45(...x){ return (set45W || set45Base)(...x); }
export const wrapSet45 = w => { set45W = w(set45W || set45Base); };
/* Later layers wrap or replace edHTML45 (the original reassigns it). Kept as var: no temporal dead zone. */
export var edHTML45W = null;
export function edHTML45(...x){ return (edHTML45W || edHTML45Base)(...x); }
export const wrapEdHTML45 = w => { edHTML45W = w(edHTML45W || edHTML45Base); };
/* Later layers wrap or replace drHTML45 (the original reassigns it). Kept as var: no temporal dead zone. */
export var drHTML45W = null;
export function drHTML45(...x){ return (drHTML45W || drHTML45Base)(...x); }
export const wrapDrHTML45 = w => { drHTML45W = w(drHTML45W || drHTML45Base); };
/* Later layers wrap or replace itrBook45 (the original reassigns it). Kept as var: no temporal dead zone. */
export var itrBook45W = null;
export function itrBook45(...x){ return (itrBook45W || itrBook45Base)(...x); }
export const wrapItrBook45 = w => { itrBook45W = w(itrBook45W || itrBook45Base); };
