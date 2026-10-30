// Refyt · Eventos.
import {
  setEmp, A, DB, EMP, EMP0, IN, S, TODAY, TOUR, VIEWS, abrir, alerts, approvals, drawVs, fromIso, go, iso,
  pMoney, phGate, render, renderLayer, store
} from "../index.js";
export const lay = () => S.modal ? renderLayer() : render();
A.dpo = el => { S.dp = S.dp && S.dp.key === el.dataset.v ? null : {key:el.dataset.v, m:(el.dataset.cur || TODAY).slice(0, 7)}; lay(); };
A.dpm = el => { const f = fromIso(S.dp.m + '-01'); f.setMonth(f.getMonth() + (+el.dataset.v)); S.dp.m = iso(f).slice(0, 7); lay(); };
A.dpx = () => { S.dp = null; lay(); };
document.addEventListener('click', e => { if(S.dp && !(e.target.closest && e.target.closest('.cm-dt'))){ S.dp = null; if(!(e.target.closest && e.target.closest('[data-act]'))) lay(); } }, true);
A.dpp = el => { const ix = S.dp.key.indexOf('|'), inn = S.dp.key.slice(0, ix), k = S.dp.key.slice(ix + 1); S.dp = null; if(inn === 'm'){ S.modal[k] = el.dataset.v; renderLayer(); } else { IN[inn]({dataset:{k, in:inn}, value:el.dataset.v}); lay(); } };
A.view = el => { S.view = el.dataset.v; S.modal = null; render(true); };
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if(!el || el.disabled) return; const f = A[el.dataset.act]; if(!f) return; e.preventDefault(); f(el, e); });
document.addEventListener('click', e => { if(S.cbo && !e.target.closest('.cbx')){ S.cbo = null; S.cbq = ''; if(!e.target.closest('[data-act]')) (S.modal ? renderLayer() : render()); } }, true);
export const inHandle = t => { const k = t.dataset && t.dataset.in; if(k && IN[k]) IN[k](t); };
document.addEventListener('input', e => { const t = e.target; if(t.type === 'date' || t.type === 'file') return; inHandle(t); });
document.addEventListener('change', e => { const t = e.target; if(t.type === 'date' || t.type === 'file') inHandle(t); });
document.addEventListener('keydown', e => {
  if(e.target.id === 'emp' && e.key === 'Enter'){ e.preventDefault(); e.target.blur(); }
  if(e.key === 'Enter' && e.target.classList && e.target.classList.contains('um-row')) e.target.click();
  if(e.key === 'Escape'){ if(S.cbo){ S.cbo = null; S.modal ? renderLayer() : render(); } else if(S.modal){ S.modal = null; renderLayer(); } else if(S.vs.open){ S.vs.open = false; drawVs(); } }
});
document.addEventListener('dblclick', e => { if(e.target.id !== 'emp') return; const b = e.target; b.contentEditable = 'true'; b.focus(); const rg = document.createRange(); rg.selectNodeContents(b); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); });
document.addEventListener('focusout', e => { if(e.target.id !== 'emp') return; const b = e.target; b.contentEditable = 'false'; setEmp(b.textContent.trim().slice(0, 60) || EMP0); b.textContent = EMP; store.set('rft-demo-emp', EMP); render(); });
if(/debug/.test(location.hash)) window.__RB = {get DB(){ return DB; }, S, A, go, abrir, alerts, phGate, approvals, pMoney, TOUR}; window.__V = VIEWS;

export const RIMG = {};
