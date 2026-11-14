// Refyt · Selector de app junto al logo.
import {
  AUTH, A, APPN, RN, S, VERSIONS, esc, firstApp, fmtDy, ico, render, toast
} from "../index.js";
export const VC = () => VERSIONS.find(v => v.current);
A.setRole = el => { if(!AUTH.viewAs && !AUTH.roles.includes(el.dataset.v)) return; S.role = el.dataset.v; S.pop = null; S.view = firstApp(); render(true); toast(`Viewing as ${RN(S.role)}: ${APPN[S.view]} opened.`); };
A.goHome = () => { S.view = firstApp(); S.pop = null; render(true); };
function drawVs0(){ let el = document.getElementById('vsel'); if(!el){ el = document.createElement('div'); el.id = 'vsel'; document.body.appendChild(el); } const b = document.querySelector('.vsb'); if(!S.vs.open || !b){ el.innerHTML = ''; return; }
  const r = b.getBoundingClientRect(), w = Math.min(440, innerWidth - 16), left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8));
  el.innerHTML = `<div class="vs-pan" role="dialog" aria-label="Versions" style="top:${r.bottom + 8}px; left:${left}px; width:${w}px"><div class="vs-h"><div><b>Versions</b><small>The app always shows the latest version</small></div><span class="vs-tag">${VC().v}</span><button class="ib" data-act="vsx" aria-label="Close">${ico('x', 15)}</button></div><div class="vs-b">${VERSIONS.filter(v => v.major || v.current).slice().reverse().map(v => `<div class="vs-r${v.current ? ' cur' : ''}"><div class="vs-t"><b>${v.v}</b><span>${fmtDy(v.date)}</span>${v.current ? '<em class="vs-c">Current</em>' : ''}</div><div class="vs-n">${esc(v.title)}</div><p>${esc(v.sum)}</p><div style="display:flex;gap:8px;margin-top:8px">${v.steps && v.steps.length ? `<button class="btn sec sm" data-act="vsTour" data-v="${v.v}">What changed</button>` : ''}${v.url ? `<a class="btn sec sm" href="${v.url}" target="_blank" rel="noopener">Open this version</a>` : ''}</div></div>`).join('')}</div><div class="vs-f">Earlier versions open in a new tab, exactly as they were.</div></div>`; }

/* Later versions wrap or replace drawVs (the original reassigns it). Kept as var: no temporal dead zone. */
var drawVsW = null;
export function drawVs(...x){ return (drawVsW || drawVs0)(...x); }
export const setDrawVs = f => { drawVsW = f; };
