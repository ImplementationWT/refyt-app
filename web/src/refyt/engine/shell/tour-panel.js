// Refyt · Panel del recorrido.
import {
  A, S, TOUR, TOUR_MAS, VERSIONS, clamp, drag, drawVs, esc, ico, sum
} from "../index.js";
S.tour = {open:false, i:0, list:false, min:false, x:null, y:null, set:null, sv:''};
export const TS = () => S.tour.set || TOUR;
S.vs = {open:false};
export const tourMin = () => sum(TS(), s => s.min);
export const tourTop = () => (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:0})}).getBoundingClientRect().bottom + 8;
export const tourPos = () => S.tour.x == null ? '' : ` style="left:${S.tour.x}px; top:${S.tour.y}px; right:auto; bottom:auto"`;
export function tourClamp(){ const p = document.querySelector('#tourp .tp'); if(!p || S.tour.x == null) return; const r = p.getBoundingClientRect(); S.tour.x = clamp(S.tour.x, 8, Math.max(8, innerWidth - r.width - 8)); S.tour.y = clamp(S.tour.y, tourTop(), Math.max(tourTop(), innerHeight - r.height - 8)); Object.assign(p.style, {left:S.tour.x + 'px', top:S.tour.y + 'px', right:'auto', bottom:'auto'}); }
export function drawTour(){
  drawVs(); let el = document.getElementById('tourp'); if(!el){ el = document.createElement('div'); el.id = 'tourp'; document.body.appendChild(el); }
  const T = S.tour; if(!T.open){ el.innerHTML = ''; return; } const s = TS()[T.i];
  const ctl = `<button class="ib" data-act="tourmin" aria-label="${T.min ? 'Expand' : 'Collapse'}">${ico(T.min ? 'up' : 'minus', 15)}</button><button class="ib" data-act="tourx" aria-label="Close">${ico('x', 15)}</button>`, drag = 'title="Drag to move it; double click to put it back"';
  if(T.min){ el.innerHTML = `<div class="tp tp-min"${tourPos()}><div class="tp-h tp-drag" ${drag}><i class="tp-mi">${T.i + 1}</i><div><b>${esc(s.t)}</b><small>Step ${T.i + 1} of ${TS().length}</small></div><button class="ib" data-act="tourstep" data-v="-1" ${T.i ? '' : 'disabled'} aria-label="Previous step">${ico('back', 15)}</button><button class="ib" data-act="tourstep" data-v="1" ${T.i < TS().length - 1 ? '' : 'disabled'} aria-label="Next step">${ico('chev', 15)}</button>${ctl}</div></div>`; return requestAnimationFrame(tourClamp); }
  const head = `<div class="tp-h tp-drag" ${drag}><div><b>${S.tour.set ? 'What changed in ' + S.tour.sv : 'Demo tour'}</b><small>Step ${T.i + 1} of ${TS().length}; ${TS().length} steps, about ${Math.round(tourMin())} minutes</small></div><button class="ib" data-act="tourlist" title="${T.list ? 'See the step' : 'See all steps'}">${ico(T.list ? 'calc' : 'grid', 15)}</button>${ctl}</div>`;
  if(T.list) el.innerHTML = `<div class="tp"${tourPos()}>${head}<div class="tp-b">${TS().map((x, i) => `<button class="tp-li${i === T.i ? ' on' : ''}" data-act="tourto" data-v="${i}"><i>${i + 1}</i><span>${esc(x.t)}</span><small>${x.min} min</small></button>`).join('')}<div class="tp-s">If there is time or if they ask</div><ul class="tp-ul">${TOUR_MAS.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>`;
  else el.innerHTML = `<div class="tp"${tourPos()}>${head}<div class="tp-b"><div class="tp-n"><i>${T.i + 1}</i><b>${esc(s.t)}</b><small>${s.min} min</small></div><div class="tp-s">Why it matters</div><p class="tp-d">${esc(s.dolor)}</p><div class="tp-s">What to show</div><ul class="tp-ul">${s.show.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="tp-s">What to say</div><p class="tp-q">${esc(s.say)}</p></div>
    <div class="tp-f"><button class="btn sec sm" data-act="tourstep" data-v="-1" ${T.i ? '' : 'disabled'}>${ico('back', 13)}Previous</button><button class="btn pri sm" data-act="tourgo">${ico('send', 13)}Go here</button><button class="btn sec sm" data-act="tourstep" data-v="1" ${T.i < TS().length - 1 ? '' : 'disabled'}>Next${ico('chev', 13)}</button></div><div class="tp-dots">${TS().map((x, i) => `<button class="${i === T.i ? 'on' : i < T.i ? 'done' : ''}" data-act="tourto" data-v="${i}" aria-label="Step ${i + 1}"></button>`).join('')}</div></div>`;
  requestAnimationFrame(tourClamp);
}
A.tour = () => { S.tour.set = null; if(S.tour.open && S.tour.min) S.tour.min = false; else S.tour.open = !S.tour.open; drawTour(); };
A.tourx = () => { S.tour.open = false; S.tour.set = null; drawTour(); };
A.tourmin = () => { S.tour.min = !S.tour.min; S.tour.list = false; drawTour(); };
A.tourlist = () => { S.tour.list = !S.tour.list; drawTour(); };
A.tourto = el => { S.tour.i = +el.dataset.v; S.tour.list = false; TS()[S.tour.i].go(); };
A.tourstep = el => { S.tour.i = clamp(S.tour.i + (+el.dataset.v), 0, TS().length - 1); TS()[S.tour.i].go(); };
A.tourgo = () => TS()[S.tour.i].go();
(() => { let d = null;
  document.addEventListener('pointerdown', e => { const h = e.target.closest('#tourp .tp-drag'); if(!h || e.target.closest('button')) return; const p = h.closest('.tp'), r = p.getBoundingClientRect(); d = {dx:e.clientX - r.left, dy:e.clientY - r.top, p}; p.classList.add('dragging'); e.preventDefault(); });
  document.addEventListener('pointermove', e => { if(!d) return; const r = d.p.getBoundingClientRect(); S.tour.x = clamp(e.clientX - d.dx, 8, Math.max(8, innerWidth - r.width - 8)); S.tour.y = clamp(e.clientY - d.dy, tourTop(), Math.max(tourTop(), innerHeight - r.height - 8)); Object.assign(d.p.style, {left:S.tour.x + 'px', top:S.tour.y + 'px', right:'auto', bottom:'auto'}); });
  document.addEventListener('pointerup', () => { if(d){ d.p.classList.remove('dragging'); d = null; } });
  document.addEventListener('dblclick', e => { if(e.target.closest('#tourp .tp-drag') && !e.target.closest('button')){ S.tour.x = S.tour.y = null; drawTour(); } });
  addEventListener('resize', tourClamp); })();
A.vsTour = el => { const v = VERSIONS.find(x => x.v === el.dataset.v); S.vs.open = false; S.tour = Object.assign(S.tour, {open:true, i:0, list:false, min:false, set:v.steps, sv:v.v}); TS()[0].go(); };
A.vsel = () => { S.vs.open = !S.vs.open; drawVs(); };
A.vsx = () => { S.vs.open = false; drawVs(); };
document.addEventListener('click', e => { if(S.vs.open && !e.target.closest('.vs-pan') && !e.target.closest('.vsb')){ S.vs.open = false; drawVs(); } });
