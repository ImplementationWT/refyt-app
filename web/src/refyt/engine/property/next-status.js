// Refyt · v5.2: pasar al siguiente estado desde la propiedad, casillas clicables, historial como icono.
import {
  A, DEL4, DITEMS, HAND, IC, ME, MODALS, OPENP, PEO, PH, RET4, RGROUPS, S, TODAY, VERSIONS, applyChk,
  effChk, esc, his, ico, isAdmin, mfoot, modal, pIdx, phGate, prOf, render, renderLayer, setPhGate,
  toast, wrapCloTab, wrapInsTab, wrapPhGate, wrapRender, wrapRetTab
} from "../index.js";
/* =================== v5.2: move to the next status from the property, boxes you click, not needed in grey, history as an icon =================== */
IC.history = '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/><path d="M12 7.5v4.5l3 2"/>';
export const nextPh52 = p => p.ph === 'F. Close out' ? 'Paid' : PH[pIdx(p.ph) + 1];
/* 1. Any status can move on. If something is missing, a warning lists it; the person confirms and it moves anyway */
{ const oNext = A.phNext; A.phNext = el => { const p = prOf(el.dataset.v); if(!OPENP.includes(p.ph)) return; const g = phGate(p);
  if(!g.ok && !el.dataset.force){ S.modal = {k:'ph52', pr:p.id}; renderLayer(); return; }
  if(g.ok){ oNext(el); return; }
  const miss = g.miss.slice(), from = p.ph; let real; wrapPhGate(f => { real = f; return () => ({ok:true, miss:[]}); });
  try { oNext(el); } finally { setPhGate(real); }
  if(p.ph !== from){ his(p, `Moved on from ${from} without: ${miss.join('; ')}. Confirmed by ${PEO[ME()].n}.`, ME()); render(); } }; }
MODALS.ph52 = m => { const p = prOf(m.pr), g = phGate(p);
  return modal(`Move to ${nextPh52(p)}?`, `${esc(p.ad)}, ${p.id}. ${p.ph} is not complete yet. You can still move it on; the history records what was missing and who confirmed.`,
    `<div class="ph52-miss"><small>Still missing to finish ${esc(p.ph)}</small><ul>${g.miss.map(x => `<li>${ico('alert', 15)}<span>${esc(x)}</span></li>`).join('')}</ul></div>`,
    mfoot('Move anyway', 'ph52Ok', true), 560); };
A.ph52Ok = () => { const id = S.modal.pr; S.modal = null; renderLayer(); A.phNext({dataset:{v:id, force:'1'}}); };

/* 2 and 3. Not needed items show grey with a lock; done is marked by clicking the box itself */
export const NA52 = /Not needed on this job|Not applicable/;
export const boxAct52 = b => { const a = b.dataset.act, t = (b.textContent || '').trim();
  if(a === 'bStep' && /Mark done/.test(t)) return 'move';
  if(a === 'bBook' || a === 'bVis' || a === 'hSet') return 'move';
  if(a === 'ipSet' && /Signed off/.test(t)) return 'move';
  if(a === 'gSet' && /Passed|Complete/.test(t)) return 'move';
  if(a === 'dSet') return /Mark done/.test(t) ? 'move' : 'copyDone';
  return ''; };
export const naRow52 = r => { const sm = r.querySelector(':scope > div > small, :scope > .rf-evh > small'); return (sm && NA52.test(sm.textContent)) || [...r.querySelectorAll('.pill')].some(x => /^\s*Not applicable\s*$/.test(x.textContent)); };
export function boxes52(){
  /* Any item that does not apply to the property, in any status: grey, locked, "Not needed on this job" */
  document.querySelectorAll('.rf-dl, .rf-evr').forEach(r => { if(!naRow52(r)) return; r.classList.remove('ok'); r.classList.add('na52');
    const sm = r.querySelector(':scope > div > small, :scope > .rf-evh > small'); if(sm) sm.textContent = 'Not needed on this job';
    r.querySelectorAll('.pill').forEach(x => { if(/Not applicable/.test(x.textContent)) x.remove(); });
    const ck = r.querySelector(':scope > .rf-ck'); if(ck){ ck.innerHTML = ico('lock', 12, 2.2); ck.title = 'Not needed on this job'; ['act', 'v'].forEach(k => delete ck.dataset[k]); ck.classList.remove('ck52'); ck.removeAttribute('role'); ck.removeAttribute('tabindex'); }
    if(r.classList.contains('rf-dl')) r.querySelectorAll('[data-act]').forEach(x => x.remove()); });
  document.querySelectorAll('b.z').forEach(z => { if(/^\s*n\/a\s*$/i.test(z.textContent)){ z.className = 'na52c'; z.title = 'Not needed on this job'; z.innerHTML = `${ico('lock', 11, 2.2)}Not needed`; } });
  /* Done is marked by clicking the box itself */
  document.querySelectorAll('.rf-dl:not(.na52)').forEach(r => { const ck = r.querySelector(':scope > .rf-ck'); if(!ck || ck.dataset.act) return;
    const b = [...r.querySelectorAll('[data-act]')].find(x => x !== ck && boxAct52(x)); if(!b) return;
    const how = boxAct52(b), done = r.classList.contains('ok');
    ck.dataset.act = b.dataset.act; ck.dataset.v = how === 'copyDone' ? b.dataset.v.replace(/\|[^|]*$/, '|Done') : b.dataset.v;
    ck.setAttribute('role', 'button'); ck.tabIndex = 0; ck.classList.add('ck52');
    const name = (r.querySelector(':scope > div > b') || {}).textContent || 'this item';
    ck.setAttribute('aria-label', `${done ? 'Mark as not done' : 'Mark as done'}: ${name}`); ck.title = done ? 'Click to mark as not done' : 'Click to mark as done';
    b.remove(); }); }
/* The Director (administrator) works on every tab of the property, not only looks */
{ const asEd52 = (f, ea) => function(app, p){ return f(isAdmin() && app === 'dir' ? ea : app, p); };
  wrapRetTab(prev => asEd52(prev, 'ret')); wrapInsTab(prev => asEd52(prev, 'del')); wrapCloTab(prev => asEd52(prev, 'del')); }
{ wrapRender(r52 => (...x) => { const o = r52(...x); try { boxes52(); } catch(e) {} return o; }); }
document.addEventListener('keydown', e => { const t = e.target; if((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('ck52')){ e.preventDefault(); t.click(); } });

/* Not needed items: click the lock to make the item needed on this property; double-click the box to mark it not needed again */
export const can52 = () => isAdmin() || DEL4.includes(S.role) || RET4.includes(S.role);
export const cur52 = () => { const id = S.fi && S.fi[S.view]; return id && String(id).startsWith('PR-') ? prOf(id) : null; };
export const name52 = r => { const b = r.querySelector(':scope > div > b'); if(!b) return ''; let t = ''; b.childNodes.forEach(n => { if(n.nodeType === 3) t += n.textContent; }); return t.trim(); };
export function key52(p, r){ const sec = r.closest('.rsec'), h = sec && sec.querySelector('.rs-h h3'), ht = h ? h.textContent : '', n = name52(r); if(!n) return null;
  const rv = g => { const m = (p.rn || {})[g] || {}; return Object.keys(m).find(k => m[k] === n); };
  if(/^Phase D/.test(ht)){ const k = (DITEMS.find(([, x]) => x === n) || [])[0] || rv('d'); return k ? 'd|' + k : null; }
  if(/^Handover/.test(ht)){ const k = HAND.includes(n) ? n : rv('hand'); return k ? 'h|' + k : null; }
  if(/^Install by group/.test(ht)){ const k = (RGROUPS.find(g => g[1] === n) || [])[0]; return k ? 'g|' + k : null; }
  return null; }
export function lock52(){ const p = cur52(); if(!p || !can52() || !OPENP.includes(p.ph)) return;
  document.querySelectorAll('.rf-dl').forEach(r => { const ck = r.querySelector(':scope > .rf-ck'); if(!ck) return; const k = key52(p, r); if(!k) return;
    ck.dataset.l52 = k;
    if(r.classList.contains('na52')){ ck.title = 'Not needed on this job'; const ed = S.f.ed52 === p.id + '|' + k, nm = esc(name52(r));
      r.insertAdjacentHTML('beforeend', ed ? `<div class="na52-act"><button type="button" class="btn pri sm" data-act="u52b" data-v="${k}">${ico('lock', 13, 2.2)}Unlock: needed on this job</button><button type="button" class="btn sec sm" data-act="e52x">Cancel</button></div>` : `<button type="button" class="na52-ed" data-act="e52" data-v="${k}" title="Edit" aria-label="Edit ${nm}">${ico('edit', 15)}</button>`); }
    else { ck.classList.add('lb52'); ck.title = (ck.title ? ck.title + '. ' : '') + 'Double-click to mark as not needed on this job'; } }); }
export const chkOn52 = (p, g, x, on) => { const inn = effChk(p)[g].includes(x); if(inn !== on) A.pchk({dataset:{v:`${p.id}|${g}|${x}`}}); };
export function setNeed52(p, k, need){ const [t, x] = k.split('|'), solar = t === 'h' && x.includes('solar') && !p.ms.some(m => m.m === 'SPV');
  const lbl = t === 'd' ? (DITEMS.find(y => y[0] === x) || ['', x])[1] : t === 'g' ? RGROUPS.find(g => g[0] === x)[1] : x;
  if(t === 'd'){ p.dna0 = p.dna0 || {}; p.dna0[x] = !need; if(need){ chkOn52(p, 'd', x, true); if(!p.d[x]) p.d[x] = 'Not booked'; } else if(effChk(p).d.includes(x)) chkOn52(p, 'd', x, false); applyChk(p); }
  if(t === 'h'){ p.u52 = p.u52 || {}; if(need){ if(solar) p.u52['h:' + x] = true; chkOn52(p, 'hand', x, true); applyChk(p); if(p.hand[x] === 'na') delete p.hand[x]; } else { delete p.u52['h:' + x]; if(effChk(p).hand.includes(x)) chkOn52(p, 'hand', x, false); else p.hand[x] = 'na'; applyChk(p); } }
  if(t === 'g'){ p.g[x] = need ? 'Not started' : 'Not applicable'; }
  his(p, `${lbl}: ${need ? 'needed on this job again' : 'marked as not needed on this job'}`, ME()); render(); toast(need ? `${lbl} is needed on this job now.` : `${lbl} is not needed on this job. Click the lock to undo.`); }
A.u52 = el => { const p = cur52(); if(p) setNeed52(p, el.dataset.l52, true); };
A.e52 = el => { const p = cur52(); if(!p) return; S.f.ed52 = p.id + '|' + el.dataset.v; render(); };
A.e52x = () => { S.f.ed52 = null; render(); };
A.u52b = el => { const p = cur52(); S.f.ed52 = null; if(p) setNeed52(p, el.dataset.v, true); };
{ let t52 = null;
  document.addEventListener('click', e => { const ck = e.target.closest && e.target.closest('.rf-ck[data-l52]'); if(!ck) return;
    if(ck.classList.contains('lk52')){ e.preventDefault(); e.stopPropagation(); A.u52(ck); return; }
    if(!ck.dataset.act) return; e.preventDefault(); e.stopPropagation(); if(e.detail > 1) return;
    clearTimeout(t52); t52 = setTimeout(() => { t52 = null; const f = A[ck.dataset.act]; if(f && document.body.contains(ck)) f(ck, e); }, 260); }, true);
  document.addEventListener('dblclick', e => { const ck = e.target.closest && e.target.closest('.rf-ck[data-l52]'); if(!ck || ck.classList.contains('lk52')) return; e.preventDefault(); clearTimeout(t52); t52 = null; const p = cur52(); if(p) setNeed52(p, ck.dataset.l52, false); }, true);
  document.addEventListener('keydown', e => { const t = e.target; if((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('lk52')){ e.preventDefault(); A.u52(t); } }); }
{ wrapRender(r52b => (...x) => { const o = r52b(...x); try { lock52(); } catch(e) {} return o; }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.1') v.url = 'https://claude.ai/artifact/4KX5KKxyYN1PHmWPa4KRqh'; } });
VERSIONS.push({v:'v5.2', date:TODAY, major:false, current:true, url:null, title:'Move to the next status from the property, boxes you click, not needed in grey', sum:'Every property shows Move to the next status beside Post an update; if something is missing a warning lists it and Move anyway records it in the history. Done is marked by clicking the box. Items not needed on the job show grey with a lock. Document history is one blue icon button.', steps:[]});
