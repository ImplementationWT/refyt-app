// Refyt · Cálculos: una sola fuente para cada número.
import {
  BUD, DITEMS, PTYPE, dDiff, genDB, pIdx, sum
} from "../index.js";
export const scOf = id => DB.sc.find(s => s.id === id);
export const prOf = id => DB.pr.find(p => p.id === id);
export const prsOf = sc => DB.pr.filter(p => p.sc === sc);
export const tyOf = p => scOf(p.sc).ty;
export const ptOf = p => PTYPE[tyOf(p)];
export const csName = p => ptOf(p).st[p.cs] || ptOf(p).st[0];
export const oAl = (o, pr, m) => sum(o.al.filter(a => a.pr === pr && (!m || a.m === m)), a => a.a);
export const ordOf = (pr, m) => DB.or.filter(o => o.al.some(a => a.pr === pr && (!m || a.m === m)));
export const vaOf = (pr, m) => DB.va.filter(v => v.pr === pr && (!m || v.m === m));
/* Per measure: quoted, budget, committed, actual, forecast. Forecast = actual + committed + budget left on what is not yet ordered */
export function mMoney(p, x){ const os = ordOf(p.id, x.m).filter(o => o.st !== 'Rejected'), act = sum(os.filter(o => o.st === 'Invoiced'), o => oAl(o, p.id, x.m)) + sum(DB.sp.filter(s => s.pr === p.id && s.m === x.m && s.st === 'Paid'), s => s.amt), com = sum(os.filter(o => ['Ordered', 'Delivered'].includes(o.st)), o => oAl(o, p.id, x.m));
  const vq = sum(vaOf(p.id, x.m).filter(v => v.ty === 'Variation' && v.st === 'Approved'), v => v.amt), ad = sum(vaOf(p.id, x.m).filter(v => v.ty === 'Additional cost' && v.st === 'Approved'), v => v.amt);
  const left = pIdx(p.ph) >= 5 || p.ph === 'Cancelled' ? 0 : Math.max(0, x.b - act - com), fc = act + com + left + ad, q = x.q + vq;
  return {q, b:x.b + vq * BUD, act, com, fc, mg:q - fc, mgp:q ? (q - fc) / q * 100 : 0, over:fc > x.b + vq * BUD + 1}; }
export function pMoney(p){ const xs = p.ms.map(x => mMoney(p, x)); const q = sum(xs, x => x.q), fc = sum(xs, x => x.fc); return {q, b:sum(xs, x => x.b), act:sum(xs, x => x.act), com:sum(xs, x => x.com), fc, mg:q - fc, mgp:q ? (q - fc) / q * 100 : 0, over:xs.some(x => x.over)}; }
export function scMoney(sc){ const ps = prsOf(sc.id).filter(p => p.ph !== 'Cancelled' && pIdx(p.ph) >= 2), ms = ps.map(pMoney), q = sum(ms, x => x.q), fc = sum(ms, x => x.fc);
  const inv = DB.inv.filter(v => prOf(v.pr).sc === sc.id); return {won:q, fc, mgp:q ? (q - fc) / q * 100 : 0, inv:sum(inv, v => v.amt), paid:sum(inv.filter(v => v.paid), v => v.amt), owed:sum(inv.filter(v => !v.paid), v => v.amt), sup:sum(DB.or.filter(o => o.st === 'Delivered' || (o.st === 'Invoiced' && !o.paid)), o => sum(o.al.filter(a => a.pr && prOf(a.pr).sc === sc.id), a => a.a))}; }
export const rating = sc => { const m = scMoney(sc), blocked = prsOf(sc.id).filter(isBlocked).length; return !m.won ? ['tk', 'Not started'] : m.mgp < sc.set.mg - 5 || blocked > 1 ? ['tred', 'Off target'] : m.mgp < sc.set.mg || blocked ? ['ta', 'At risk'] : ['tg', 'On target']; };
/* Ready to install: every phase D item that applies is done */
export const dApplies = p => DITEMS.filter(([k]) => !p.dna[k]);
export const ready = p => dApplies(p).every(([k]) => p.d[k] === 'Done');
export const isBlocked = p => Object.values(p.g).includes('Blocked') || Object.values(p.g).includes('Waiting on decision');
export const LIMIT = {'A. Job received':5, 'B. Assess and design':14, 'C. Client approval':7, 'D. Prepare to install':14, 'E. Install':21, 'F. Close out':14};
export const daysIn = p => Math.max(0, -dDiff(p.phOn));
export const late = p => { const l = LIMIT[p.ph]; if(!l) return null; const d = daysIn(p); return d > l * 1.5 ? 'red' : d > l ? 'amber' : null; };
export const grpPct = p => { const xs = Object.values(p.g).filter(s => s !== 'Not applicable'); return xs.length ? Math.round(xs.filter(s => s === 'Complete').length / xs.length * 100) : 0; };
export const holdOpen = p => tyOf(p) === 'Redbridge' && ((p.g.stl && ['Not started', 'In progress', 'Waiting on decision', 'Blocked'].includes(p.g.stl) && p.g.stl !== 'Not applicable') || p.g.ewi === 'Blocked');
export const MONEY = ['dir', 'com', 'acc'];
export const canMoney = app => window.__canMoney ? window.__canMoney() : MONEY.includes(app);
export let DB = genDB();
