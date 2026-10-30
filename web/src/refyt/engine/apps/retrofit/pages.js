// Refyt · Retrofit: fases A y B.
import {
  A, BSTEPS, DB, EVID, RN, S, abrir, btns, cell, csName, docsOf, esc, nx, oph, ptOf, rowO, scOf, tcell,
  th
} from "../../index.js";

export function rqPage(){ const xs = DB.pr.filter(p => p.ph === 'B. Assess and design');
  return oph('Review and design queue', 'Each property in phase B with the step it is on. Reviews go to the Approvals inbox.') + th(cell('Property', 'Scheme', 2.4) + cell('Step', 'Owner', 2) + cell('Evidence', '') + cell('Rating', '')) + xs.map(p => { const st = BSTEPS.find(([k]) => !(k === 'bk' ? p.b.bk : k === 'vis' ? p.b.vis : k === 'rev' ? p.b.rev === 'Approved' : k === 'docs' ? docsOf(p).every(n => p.b.docs.includes(n)) : k === 'mod' ? !!p.b.mod : k === 'dsg' ? p.ms.every(x => x.dsg) : k === 'drev' ? p.ms.every(x => x.dap) : p.b.ts)) || [null, 'Survey pack ready', 'sad'];
    return rowO('prRet', p.id, tcell('prRet', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + cell(st[1], RN(st[2]), 2) + cell(`${p.b.ev.length} of ${EVID.length}`, '') + cell(p.b.mod ? `${p.b.mod.pre} to ${p.b.mod.post}` : '', ''), S.hl === p.id); }).join(''); }
A.prRet = el => abrir(S.view, el.dataset.v, 'ret');
export function packPage(){ const xs = DB.pr.filter(p => ['B. Assess and design', 'C. Client approval'].includes(p.ph));
  return oph('Survey pack and client systems', 'Where each pack stands in the client’s own system, and what is waiting to be updated there.') + th(cell('Property', 'Scheme', 2.4) + cell('Client system', 'Status', 2) + cell('Waiting on', '', 2) + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + xs.map(p => rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + cell(ptOf(p).sys, csName(p), 2) + cell(p.csTodo ? 'Us: update ' + ptOf(p).sys : p.ph === 'C. Client approval' ? 'The client' : 'Our checks', p.csTodo || '', 2) + btns(p.csTodo ? nx('csDone', p.id, 'Mark as updated') : p.ph === 'C. Client approval' ? nx('csStep', p.id, 'Next status', 'sec') : ''), S.hl === p.id)).join(''); }
