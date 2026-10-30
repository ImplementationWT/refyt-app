// Refyt · Registro de apps.
import {
  A, APPS, DB, OPENP, S, approvals, aprPage, atnPage, bkPage, csPage, frmPage, holdPage, invPage,
  mrgPage, nscPage, oph, ordPage, ovwPage, packPage, pend, prList, ratePage, rdyPage, render, repPage,
  rolPage, rqPage, sbar, subPage, tkPage, varPage
} from "../index.js";
export const pageAct = a => 'pg_' + a;
export const VIEWS = {};
export const nAp = r => approvals().filter(a => !r || a.role === r).length;
VIEWS.dir = {side:() => sbar([['-', 'Decide'], ['dec', 'Needs your decision', 'bell', pend('dir').length, 2], ['-', 'Business'], ['ovw', 'Business overview', 'chart'], ['prs', 'All properties', 'home', DB.pr.filter(p => OPENP.includes(p.ph)).length, 1], ['-', 'Settings'], ['rol', 'Roles', 'users']], S.page.dir, pageAct('dir')),
  pages:{dec:() => atnPage('dir', 'Needs your decision', 'Approvals above the scheme limits, margins below target and jobs over time. Each one opens with its context.'), ovw:ovwPage, prs:() => oph('All properties', 'Every property of every scheme, by phase.') + prList(DB.pr, 'dir'), rol:rolPage}};
VIEWS.apr = {side:() => sbar([['-', 'Approve'], ['apr', 'Waiting for approval', 'checks', nAp(), 2]], S.page.apr, pageAct('apr')), pages:{apr:aprPage}};
VIEWS.ret = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('ret').length, 2], ['bk', 'Bookings', 'cal', DB.pr.filter(p => p.ph === 'A. Job received').length, 1], ['rq', 'Review queue', 'todo', DB.pr.filter(p => p.ph === 'B. Assess and design').length, 1], ['pk', 'Survey pack', 'send']], S.page.ret, pageAct('ret')),
  pages:{atn:() => atnPage('ret', 'Needs attention', 'Jobs to book, revisits, packs ready to send and client system updates at survey stage.'), bk:bkPage, rq:rqPage, pk:packPage}};
VIEWS.del = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('del').length, 2], ['pro', 'Properties', 'home', DB.pr.filter(p => ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph)).length, 1], ['rdy', 'Ready to install', 'checks', DB.pr.filter(p => p.ph === 'D. Prepare to install').length, 1], ['hold', 'Redbridge tracker', 'building'], ['cs', 'Client systems', 'sync', DB.pr.filter(p => p.csTodo).length, 2]], S.page.del, pageAct('del')),
  pages:{atn:() => atnPage('del', 'Needs attention', 'Ready to install, hold points and client systems to update.'), pro:() => oph('Properties', 'Per scheme, every property by phase. Open one for its install checklist, hold points and close out.') + prList(DB.pr, 'del'), rdy:rdyPage, hold:holdPage, cs:csPage}};
VIEWS.pur = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('pur').length, 2], ['ord', 'Orders', 'cart', DB.or.filter(o => o.st !== 'Invoiced' && o.st !== 'Rejected').length, 1]], S.page.pur, pageAct('pur')), pages:{atn:() => atnPage('pur', 'Needs attention', 'Deliveries waiting for the supplier invoice.'), ord:ordPage}};
VIEWS.com = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('com').length, 2], ['mrg', 'Margins', 'trend'], ['var', 'Variations and extra costs', 'swap', DB.va.filter(v => v.st !== 'Approved' && v.st !== 'Rejected').length, 1], ['-', 'Settings'], ['rate', 'Rates', 'tag']], S.page.com, pageAct('com')),
  pages:{atn:() => atnPage('com', 'Needs attention', 'Margins below target, costs over budget and variations waiting for the client.'), mrg:mrgPage, var:varPage, rate:ratePage}};
VIEWS.acc = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('acc').length, 2], ['inv', 'Invoices', 'receipt'], ['sub', 'Subcontractors', 'wallet']], S.page.acc, pageAct('acc')), pages:{atn:() => atnPage('acc', 'Needs attention', 'Payment triggers met, overdue invoices and subcontractors to pay.'), inv:invPage, sub:subPage}};
VIEWS.mob = {side:() => sbar([['-', 'On site'], ['frm', 'Site forms', 'phone']], S.page.mob, pageAct('mob')), pages:{frm:frmPage}};
VIEWS.tsk = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('tsk').length, 2], ['tk', 'Tasks', 'todo', DB.tk.filter(k => !k.done).length, 1], ['rep', 'Meeting reports', 'chart']], S.page.tsk, pageAct('tsk')), pages:{atn:() => atnPage('tsk', 'Needs attention', 'Overdue tasks.'), tk:tkPage, rep:repPage}};
VIEWS.new = {side:() => sbar([['-', 'Schemes'], ['nsc', 'New scheme', 'plus']], S.page.new, pageAct('new')), pages:{nsc:nscPage}};
APPS.forEach(([a]) => { A[pageAct(a)] = el => { S.fi[a] = null; S.page[a] = el.dataset.v; render(true); }; });
