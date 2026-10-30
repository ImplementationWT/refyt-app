// Refyt · Roles, programas, esquemas y datos de ejemplo.
import {
  TODAY, addDays, pc, sum
} from "../index.js";
export const EMP0 = 'Refyt';
/* People are examples: every step is owned by a role, and a role is assigned to a person in Director > Roles */
export const PEO = {
  yah:{n:'Yahaya Mohamed', r:'Director', ar:'dir'},
  dre:{n:'Dren Ferati', r:'Install coordinator', ar:'del'},
  ahm:{n:'Ahmed Ghele', r:'Designer', ar:'ret'},
  afa:{n:'Afaq Ahmad', r:'Assessor', ar:'ret'},
  xen:{n:'Xeni Ratkoceri', r:'Assessor', ar:'ret'},
  sar:{n:'Sara Okon', r:'Survey admin', ar:'ret'},
  ram:{n:'Ramesh Patel', r:'Assessment approver', ar:'ret'},
  lan:{n:'Lana', r:'Accounts', ar:'acc'},
  tom:{n:'Tom Gale', r:'Commercial', ar:'com'},
  akr:{n:'Akram', r:'Site manager', ar:'mob'},
  hse:{n:'Helen Price', r:'HSSE lead', ar:'tsk'},
};
export const ROLES = {
  sad:['Survey admin', 'sar'], ass:['Assessor', 'afa'], aap:['Assessment approver', 'ram'], dsg:['Designer', 'ahm'], dap:['Design approver', 'ram'],
  inc:['Install coordinator', 'dre'], oap:['Order approver', 'dre'], pap:['Payment approver', 'yah'], com:['Commercial', 'tom'], acc:['Accounts', 'lan'], dir:['Director', 'yah'], hse:['HSSE lead', 'hse'],
};
export const RN = r => ROLES[r][0], RP = r => PEO[ROLES[r][1]] ? PEO[ROLES[r][1]].n : 'To assign';
export const rTag = r => `<span class="rf-role">${RN(r)}</span>`;
export const MEAS = {
  LI:{n:'Loft insulation', s:'Loft', t:'tb'}, CWI:{n:'Cavity wall insulation', s:'Cavity', t:'tv'}, EWI:{n:'External wall insulation', s:'EWI', t:'to'}, IWI:{n:'Internal wall insulation', s:'IWI', t:'tp'},
  SPV:{n:'Solar PV', s:'Solar PV', t:'ta'}, DMEV:{n:'dMEV ventilation', s:'dMEV', t:'tt'}, WIN:{n:'Windows and doors', s:'Windows', t:'tk'}, LED:{n:'LED lighting', s:'LED', t:'tg'},
};
/* The six phases every property goes through */
export const PH = ['A. Job received', 'B. Assess and design', 'C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out', 'Paid', 'Cancelled'];
export const PHS = {'A. Job received':'tk', 'B. Assess and design':'tb', 'C. Client approval':'tv', 'D. Prepare to install':'ta', 'E. Install':'to', 'F. Close out':'tp', 'Paid':'tg', 'Cancelled':'tk'};
export const OPENP = PH.slice(0, 6);
export const pIdx = s => PH.indexOf(s);
export const PHOWN = {'A. Job received':'sad', 'B. Assess and design':'aap', 'C. Client approval':'com', 'D. Prepare to install':'inc', 'E. Install':'inc', 'F. Close out':'inc', 'Paid':'acc', 'Cancelled':'com'};
/* Phase B steps: the same on every programme */
export const BSTEPS = [['bk', 'Book assessment', 'sad'], ['vis', 'Assessment visit', 'ass'], ['rev', 'Assessment review', 'aap', true], ['docs', 'Assessment documents', 'aap'], ['mod', 'Modelling', 'aap'], ['dsg', 'Retrofit design, per measure', 'dsg'], ['drev', 'Design review', 'dap', true], ['ts', 'Technical survey', 'aap']];
export const EVID = ['Floor plan and measurements', 'Wall and window sizes', 'Loft photos', 'Ventilation photos', 'Heating system', 'Every elevation photographed'];
export const ADOCS = ['Condition report', 'Occupancy assessment', 'RdSAP report', 'Ventilation assessment', 'Floor plan', 'Pre EPC'];
/* Phase D: booked, then done. Ready to install sets itself when every item that applies is done */
export const DITEMS = [['asb', 'Asbestos survey'], ['pibi', 'PIBI'], ['date', 'Install date agreed with customer'], ['trd', 'Trade teams planned'], ['scf', 'Scaffold erected'], ['gas', 'Gas works done'], ['mat', 'Materials delivered'], ['rams', 'Risk assessment and method statement signed off']];
/* Programme types: stages of the client system and close out rules */
export const PTYPE = {
  'E.ON':{sys:'Dynamics', st:['Awaiting survey date', 'Awaiting paperwork approval', 'Retrofit survey complete', 'Awaiting technical survey date', 'Awaiting quotation approval', 'Awaiting install date', 'Awaiting compliance', 'Install complete'], trig:'Install complete in Dynamics', terms:30},
  'GLA':{sys:'Shareworks', st:['Customer received', 'Pre EPC, documents and price uploaded', 'GLA approved', 'Install date uploaded', 'Handover pack uploaded', 'Lodgement and post EPC uploaded', 'GLA accepted'], trig:'GLA accepts the final upload', terms:30},
  'Redbridge':{sys:'PAS Hub', st:['PO received', 'Evidence in progress', 'Evidence uploaded to PAS Hub', 'Cotality checking', 'Cotality registered'], trig:'Cotality registers the job', terms:45},
};
/* Redbridge is tracked by group; only the hold points block the next group */
export const RGROUPS = [['pre', 'Pre start', 'All', ''], ['stl', 'Steel frame check', 'BISF', 'MDA decide and repairs done'], ['wal', 'Rebuild outer wall', 'BISF', ''], ['ven', 'Ventilation', 'DMEV', ''], ['rof', 'Roof edge and loft', 'LI', ''], ['win', 'Windows and doors', 'WIN', ''], ['ewi', 'Wall insulation', 'All', 'Fixing tests passed (No Fines and Airey)'], ['led', 'Lighting', 'LED', ''], ['hnd', 'Handover', 'All', '']];
export const GST = ['Not started', 'In progress', 'Waiting on decision', 'Blocked', 'Complete', 'Not applicable'];
export const GSTT = {'Not started':'tk', 'In progress':'tb', 'Waiting on decision':'ta', 'Blocked':'tred', 'Complete':'tg', 'Not applicable':'tk'};
export const CTYPES = ['Materials', 'Subcontract labour', 'Scaffold', 'Gas works', 'Asbestos survey', 'Skips and plant', 'Other'];
export const OST = ['Requested', 'Rejected', 'Ordered', 'Delivered', 'Invoiced'];
export const HAND = ['All measures complete', 'Photos checked, with location and time', 'Customer sign off', 'Client sign off', 'Our final inspection', 'Guarantee (IBG) issued', 'TrustMark lodgement', 'MCS certificate (solar)', 'DNO notification (solar)'];
export const CANCEL = ['Customer withdrew', 'Home unsuitable', 'Measures will not reach the required rating', 'Client cancelled'];
export const PROGS = [{id:'EON', n:'E.ON'}, {id:'NONE', n:'No programme manager'}];
export const SC0 = [
  {id:'SC-01', n:'E.ON Medway', prog:'EON', cl:'Medway Council', ty:'E.ON', reg:'Kent', st:'Live', tgt:60, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-02', n:'E.ON Thanet', prog:'EON', cl:'Thanet District Council', ty:'E.ON', reg:'Kent', st:'Live', tgt:40, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-03', n:'E.ON Waverley', prog:'EON', cl:'Waverley Borough Council', ty:'E.ON', reg:'Surrey', st:'Starting Oct 2026', tgt:35, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-04', n:'E.ON Cottsway', prog:'EON', cl:'Cottsway Housing Association', ty:'E.ON', reg:'Oxfordshire', st:'Starting Oct 2026', tgt:30, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-05', n:'GLA Warmer Homes', prog:'NONE', cl:'GLA', ty:'GLA', reg:'London', st:'Starting', tgt:50, lead:'dre', set:{mg:25, ord:2000, pay:2500, vr:1000, terms:30}},
  {id:'SC-06', n:'Redbridge', prog:'NONE', cl:'London Borough of Redbridge (Kanopi Works main contractor)', ty:'Redbridge', reg:'London', st:'Live', tgt:24, lead:'dre', set:{mg:18, ord:5000, pay:6000, vr:2500, terms:45}},
];
/* Agreed price and budget cost per measure (E.ON and GLA have fixed rates) */
export const RATE = {'E.ON':{LI:1250, CWI:1900, EWI:9800, SPV:5200, DMEV:780, IWI:6400}, 'GLA':{LI:1300, SPV:5600, DMEV:820, IWI:6600, CWI:2000}, 'Redbridge':{EWI:16500, DMEV:900, LI:1400, WIN:5200, LED:450}};
export const BUD = .74;
/* id, address, postcode, scheme, customer, measures, phase, house type, days in phase, client system step */
export const PR0 = [
  ['PR-2001', '14 Canterbury Street', 'ME7 5TU', 'SC-01', 'Joan Fletcher', ['LI', 'SPV'], 'B. Assess and design', '', 6, 1],
  ['PR-2002', '61 Pier Road', 'ME7 1UB', 'SC-01', 'Tariq Hussain', ['LI', 'DMEV'], 'D. Prepare to install', '', 9, 5],
  ['PR-2003', '9 Balmoral Road', 'ME7 4PG', 'SC-01', 'Grace Mensah', ['CWI', 'LI', 'DMEV'], 'D. Prepare to install', '', 4, 5],
  ['PR-2004', '33 Copenhagen Road', 'ME7 4RY', 'SC-01', 'Daniel Byrne', ['SPV'], 'E. Install', '', 3, 5],
  ['PR-2005', '2 Saxton Street', 'ME7 5EG', 'SC-01', 'Fatima Begum', ['EWI', 'DMEV'], 'F. Close out', '', 22, 7],
  ['PR-2006', '120 Gillingham Road', 'ME7 4EP', 'SC-01', 'Peter Walsh', ['LI'], 'C. Client approval', '', 5, 4],
  ['PR-2007', '45 Ordnance Street', 'ME4 6SE', 'SC-01', 'Siobhan Kelly', ['LI', 'CWI'], 'A. Job received', '', 2, 0],
  ['PR-2008', '7 Dane Road', 'CT9 2AA', 'SC-02', 'Hamza Ali', ['SPV', 'LI'], 'B. Assess and design', '', 19, 2],
  ['PR-2009', '28 Northdown Road', 'CT9 2RW', 'SC-02', 'Margaret Okafor', ['CWI'], 'C. Client approval', '', 3, 4],
  ['PR-2010', '81 Ramsgate Road', 'CT9 4EY', 'SC-02', 'Raj Patel', ['LI', 'DMEV'], 'F. Close out', '', 8, 7],
  ['PR-2011', '5 Hawley Square', 'CT9 1PF', 'SC-02', 'Lucy Adeyemi', ['SPV'], 'Paid', '', 0, 7],
  ['PR-2012', '16 Victoria Road', 'CT9 1SB', 'SC-02', 'Michael Doyle', ['IWI'], 'Cancelled', '', 0, 1],
  ['PR-2013', '3 Farnham Road', 'GU7 1HS', 'SC-03', 'Amina Yusuf', ['LI', 'SPV'], 'A. Job received', '', 1, 0],
  ['PR-2014', '12 Witney Road', 'OX29 7AB', 'SC-04', 'Tomasz Nowak', ['CWI', 'LI'], 'A. Job received', '', 1, 0],
  ['PR-2015', '40 Leytonstone Road', 'E15 1TE', 'SC-05', 'Patricia Reid', ['SPV'], 'B. Assess and design', '', 5, 0],
  ['PR-2016', '18 Romford Road', 'E7 9HZ', 'SC-05', 'Yusuf Demir', ['LI', 'DMEV'], 'C. Client approval', '', 6, 1],
  ['PR-2017', '22 Clayhall Avenue', 'IG5 0LG', 'SC-06', 'Neil Sharma', ['EWI', 'DMEV', 'LI', 'WIN'], 'E. Install', 'BISF', 12, 1],
  ['PR-2018', '9 Roding Lane North', 'IG8 8NE', 'SC-06', 'Helen Morris', ['EWI', 'DMEV', 'LED'], 'E. Install', 'No Fines', 7, 1],
  ['PR-2019', '57 Tomswood Hill', 'IG6 2QG', 'SC-06', 'Kwame Boateng', ['EWI', 'LI'], 'E. Install', 'Airey', 5, 1],
  ['PR-2020', '4 Fencepiece Road', 'IG7 5DS', 'SC-06', 'Leila Haddad', ['EWI', 'DMEV', 'WIN', 'LED'], 'F. Close out', 'BISF', 6, 3],
  ['PR-2021', '31 Manford Way', 'IG7 4BU', 'SC-06', 'Owen Price', ['EWI', 'DMEV'], 'D. Prepare to install', 'BISF', 4, 0],
];
export const SUPS = ['Insulation Supplies Direct', 'SIG Distribution', 'Solar Wholesale UK', 'Kent Scaffold Hire', 'EWI Pro', 'Medway Electrical Ltd', 'Thames Gas Services'];
export function genDB(){
  const D = {sc:SC0.map(s => ({...s, set:{...s.set}, log:[]})), pr:[], or:[], va:[], sp:[], ap:[], tk:[], inv:[], tpl:[{n:'E.ON type', from:'SC-01'}, {n:'GLA type', from:'SC-05'}, {n:'Redbridge type', from:'SC-06'}], seq:{or:700, va:40, sp:80, ap:300, tk:120, inv:3300}};
  PR0.forEach(([id, ad, pc, sc, res, meas, ph, ht, din, cs], ix) => {
    const S0 = SC0.find(x => x.id === sc), ty = S0.ty, i = pIdx(ph), cancelled = ph === 'Cancelled', done = i >= 2 && !cancelled;
    const p = {id, ad, pc, sc, res, ref:ty === 'E.ON' ? 'EON-' + (48210 + ix * 37) : ty === 'GLA' ? 'GLA-WH-' + (1200 + ix) : 'PO-RB-' + (3100 + ix), ht, ph, phOn:addDays(TODAY, -din), cs, csTodo:null,
      ms:meas.map(m => ({m, q:RATE[ty][m] || 1500, b:Math.round((RATE[ty][m] || 1500) * BUD), dsg:done, dap:done, ip:i >= 5 && !cancelled ? 100 : i === 4 ? 40 : 0})),
      b:{bk:i >= 1 || cancelled, vis:i >= 1, rev:done ? 'Approved' : null, docs:done ? [...ADOCS] : [], mod:done ? {pre:'E', post:'C'} : null, ts:done, ev:done ? [...EVID] : [], revisits:0},
      d:Object.fromEntries(DITEMS.map(([k]) => [k, i >= 4 && !cancelled ? 'Done' : 'Not booked'])), dna:{}, g:{}, hand:{}, his:[], rev:null, paid:null, cancel:null, quoteOk:i >= 3 && !cancelled};
    if(ty === 'Redbridge'){ RGROUPS.forEach(([k, n, ap]) => { p.g[k] = ap === 'All' ? 'Not started' : ap === 'BISF' ? (ht === 'BISF' ? 'Not started' : 'Not applicable') : meas.includes(ap) ? 'Not started' : 'Not applicable'; }); }
    if(!meas.includes('SPV') && !meas.includes('EWI')) p.dna.scf = true;
    if(!meas.some(m => ['SPV'].includes(m))) p.dna.gas = true;
    if(i >= 5 && !cancelled) HAND.forEach(h => p.hand[h] = !(h.includes('solar') && !meas.includes('SPV')));
    p.his.push([addDays(p.phOn, -14 * Math.max(1, i)), `Job received from ${S0.cl}, reference ${p.ref}`, 'sar']);
    if(cancelled){ p.cancel = {why:'Home unsuitable', at:'B. Assess and design', abort:true}; p.his.push([addDays(TODAY, -12), 'Cancelled at B. Assess and design: home unsuitable. Assessment flagged as abortive work.', 'tom']); }
    D.pr.push(p);
  });
  const P = id => D.pr.find(p => p.id === id);
  /* live cases */
  Object.assign(P('PR-2001').b, {bk:true, vis:true, rev:'Pending', ev:EVID.slice(0, 4), revisits:1}); P('PR-2001').his.push([addDays(TODAY, -9), 'Assessment rejected: loft photos missing. Revisit booked, revisits 1.', 'ram']);
  Object.assign(P('PR-2008').b, {bk:true, vis:true, rev:'Approved', ev:[...EVID], docs:[...ADOCS], mod:{pre:'D', post:'C'}}); P('PR-2008').ms.forEach(x => { x.dsg = x.m === 'LI'; x.dap = false; });
  Object.assign(P('PR-2015').b, {bk:true, vis:false});
  P('PR-2006').cs = 4; P('PR-2009').cs = 4; P('PR-2016').cs = 1;
  Object.assign(P('PR-2002').d, {asb:'Done', pibi:'Done', date:'Done', trd:'Done', mat:'Done', rams:'Done'}); P('PR-2002').dna.scf = true;
  Object.assign(P('PR-2003').d, {asb:'Done', pibi:'Booked', date:'Done', trd:'Booked', mat:'Requested', rams:'Not booked'});
  Object.assign(P('PR-2021').d, {asb:'Done', pibi:'Done', date:'Booked', trd:'Done', scf:'Booked', mat:'Delivered', rams:'Done'}); P('PR-2021').d.mat = 'Done';
  Object.assign(P('PR-2017').g, {pre:'Complete', stl:'Waiting on decision', wal:'Not started'}); P('PR-2017').hold = 'MDA inspected the stanchions on Oct 21: corrosion on two columns, decision on repair pending.';
  Object.assign(P('PR-2018').g, {pre:'Complete', ven:'Complete', ewi:'In progress', led:'Not started'});
  Object.assign(P('PR-2019').g, {pre:'Complete', rof:'Complete', ewi:'Blocked'}); P('PR-2019').hold2 = 'Fixing pull-out test failed on the rear elevation; EWI Pro retesting.';
  Object.keys(P('PR-2020').g).forEach(k => { if(P('PR-2020').g[k] !== 'Not applicable') P('PR-2020').g[k] = 'Complete'; });
  P('PR-2020').hand['Client sign off'] = false; P('PR-2020').hand['TrustMark lodgement'] = false;
  P('PR-2005').cs = 7; P('PR-2005').hand['TrustMark lodgement'] = true; P('PR-2010').cs = 6; P('PR-2010').hand['TrustMark lodgement'] = false; P('PR-2010').csTodo = 'Upload start and finish dates, photos and the TrustMark number in Dynamics, then press submit';
  P('PR-2004').ms[0].ip = 60;
  P('PR-2011').paid = addDays(TODAY, -6);
  /* orders: committed when approved, actual when the supplier invoice is matched */
  const ord = (pr, m, ct, sup, amt, st, on, split) => { const o = {id:'PO-' + (++D.seq.or), al:split || [{pr, m, a:amt}], ct, sup, amt, st, on:addDays(TODAY, on), by:'dre', inv:st === 'Invoiced' ? 'SINV-' + (9000 + D.seq.or) : null, ok:st !== 'Requested'}; D.or.push(o); return o; };
  D.pr.filter(p => pIdx(p.ph) >= 4 && p.ph !== 'Cancelled').forEach(p => p.ms.forEach(x => { ord(p.id, x.m, 'Materials', SUPS[x.m === 'SPV' ? 2 : x.m === 'EWI' ? 4 : 0], Math.round(x.b * .42), pIdx(p.ph) >= 5 ? 'Invoiced' : 'Delivered', -20); ord(p.id, x.m, 'Subcontract labour', 'Medway Electrical Ltd', Math.round(x.b * .4), pIdx(p.ph) >= 5 ? 'Invoiced' : 'Ordered', -15); }));
  ord('PR-2003', 'CWI', 'Materials', 'Insulation Supplies Direct', 640, 'Requested', -1);
  ord('PR-2021', 'EWI', 'Scaffold', 'Kent Scaffold Hire', 6800, 'Requested', 0);
  ord(null, null, 'Materials', 'Insulation Supplies Direct', 2160, 'Ordered', -3, [{pr:'PR-2002', m:'LI', a:720}, {pr:'PR-2003', m:'LI', a:720}, {pr:'PR-2006', m:'LI', a:720}]);
  /* the EWI on Clayhall Avenue is running over budget */
  ord('PR-2017', 'EWI', 'Other', 'EWI Pro', 4800, 'Ordered', -4);
  D.va.push({id:'VA-' + (++D.seq.va), ty:'Variation', pr:'PR-2017', m:'EWI', why:'Two stanchions need repair after the MDA inspection', amt:3400, st:'Waiting internal approval', ev:'MDA report 21 Oct.pdf', on:addDays(TODAY, -2)});
  D.va.push({id:'VA-' + (++D.seq.va), ty:'Additional cost', pr:'PR-2019', m:'EWI', why:'Return visit for a second fixing test', amt:420, st:'Approved', ev:'EWI Pro test sheet.pdf', on:addDays(TODAY, -5)});
  D.sp.push({id:'SP-' + (++D.seq.sp), sub:'Medway Electrical Ltd', pr:'PR-2004', m:'SPV', stage:'Panels and inverter fitted', ev:'Photos 24 Oct (location and time)', amt:1650, st:'Waiting approval', on:addDays(TODAY, -1)});
  D.sp.push({id:'SP-' + (++D.seq.sp), sub:'Redbridge Render Co', pr:'PR-2018', m:'EWI', stage:'Insulation boards fixed', ev:'Photos 23 Oct', amt:7200, st:'Waiting approval', on:addDays(TODAY, -2)});
  D.inv.push({id:'INV-' + (++D.seq.inv), pr:'PR-2011', amt:sum(P('PR-2011').ms, x => x.q), on:addDays(TODAY, -38), due:addDays(TODAY, -8), paid:addDays(TODAY, -6)});
  D.inv.push({id:'INV-' + (++D.seq.inv), pr:'PR-2005', amt:sum(P('PR-2005').ms, x => x.q), on:addDays(TODAY, -40), due:addDays(TODAY, -10), paid:null});
  [['Chase E.ON for the Thanet survey pack comments', 'sad', 1, 'Monday team meeting'], ['Send the GLA close out document list to Ariana', 'com', 3, 'Thursday follow up'], ['Agree margin targets for Waverley and Cottsway', 'dir', -1, 'Tuesday directors'], ['Renew public liability certificate', 'hse', 9, 'HSSE'], ['Book MDA revisit for Clayhall Avenue', 'inc', 0, 'Job PR-2017']].forEach(([t, r, d, src]) => D.tk.push({id:'TK-' + (++D.seq.tk), t, r, due:addDays(TODAY, d), src, done:false}));
  return D;
}
