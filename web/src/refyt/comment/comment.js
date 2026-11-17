// Refyt · botón Comment (abajo a la derecha), el mismo del original ("@@comp comentar v3.1" del kit).
//
// Cambios respecto al kit, que mandaba cada comentario a un webhook:
//  - Envía con send() de CommentButton.tsx, que lo guarda en /api/feedback (el módulo Feedback).
//  - Quién comenta es el usuario con sesión: no pide nombre ni correo.
//  - Sin adjuntos ("Send a file"): Feedback guarda texto.
//  - startComment() / stopComment(): se muestra solo con sesión y con el módulo encendido.
// La cola de "To send" (sin conexión) se conserva por usuario y se reintenta sola.

const $q = (s, r = document) => r.querySelector(s);
const T = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const ls = {get:k => { try { return localStorage.getItem(k); } catch(e) { return null; } }, set:(k, v) => { try { localStorage.setItem(k, v); } catch(e) {} }};
const TIPOS = [['Mejora', 'Improvement or idea', 'E.g. here I also need to see the resident’s phone number'], ['Algo no funciona', 'Something isn’t working', 'E.g. when I save the order it does not appear in the list'], ['Duda', 'Question', 'E.g. where does this amount come from?']];
const IC = {msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>', pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', check:'<path d="M20 6 9 17l-5-5"/>', send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>'};
const ico = (n, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/** cfg: {key, user:{nombre, rol}, send(d) → 'ok' | 'pend' | {error}} */
let cfg = null;
/** The Refyt engine says where the user is (section, screen, property, tab); elsewhere the screen is read. */
let context = null;
export function setCommentContext(fn){ context = fn; }
const st = {open:false, view:'form', tipo:'', txt:'', el:null, sending:false, sent:null, err:''};
let Q = [];
const KEY = () => 'wtfb-refyt-' + cfg.key;
const save = () => ls.set(KEY(), JSON.stringify(Q.slice(-40)));
const okF = () => !!st.tipo && clean(st.txt).length > 2 && !st.sending;

/* ---------- Quién comenta y dónde está ---------- */
const who = () => cfg.user;
const where = () => { if(context){ try { const x = context(); if(x) return x; } catch(e) {} }
  const h1 = clean(([...document.querySelectorAll('.op h1, main h1, h1')].find(h => h.getClientRects().length > 0) || {}).textContent);
  const app = clean(($q('.rf-appdd .rf-adn b') || {}).textContent) || 'Refyt';
  const nav = clean(($q('aside.sb [aria-current="true"]') || {}).textContent);
  return {app, pantalla:nav || h1, pantalla_id:location.pathname, registro:'', registro_nombre:nav && h1 !== nav ? h1 : '', pestana:''}; };
const device = () => `${innerWidth < 700 ? 'phone' : innerWidth < 1100 ? 'tablet' : 'desktop'}, ${innerWidth} px`;
const cid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

/* ---------- Envío: lo que no llega por la conexión queda en cola con el mismo cid ---------- */
async function flush(){ if(!cfg) return; let n = 0;
  for(const q of Q.filter(z => z.st === 'pend')){ const r = await cfg.send(q.d); if(r === 'ok'){ q.st = 'ok'; n++; } else if(r !== 'pend'){ q.st = 'no'; n++; } }
  if(n){ save(); draw(); } }

/* ---------- Señalar un elemento de la pantalla ---------- */
const PICK = '.wt-kc, .mbr, .stat, .hcard, .uy-kv > div, .ds-exc, .rb-next, .kt-ce, .wt-hwd, tr, li, button, a, input, textarea, h1, h2, h3, section, article, [data-v]';
let pick = null;
const target = el => { if(!el || el.closest('#wtfb')) return null; const t = el.closest(PICK) || el; return t === document.body ? null : t; };
const label = el => { const a = el.getAttribute('aria-label') || el.value || el.placeholder || el.title;
  const lines = String(el.innerText || '').split('\n').map(clean).filter(x => x.length > 3);
  const t = clean(lines.length ? lines.slice(0, 2).join(', ') : a); return t.length > 90 ? t.slice(0, 88) + '...' : t; };
function pickStart(){ st.open = false; draw(); pick = {box:document.createElement('div'), bar:document.createElement('div'), cur:null};
  pick.box.className = 'wtfb-hl'; pick.bar.className = 'wtfb-bar'; pick.bar.setAttribute('role', 'status');
  pick.bar.innerHTML = `${ico('pin', 16)}<span>Click what you want to comment on. With the keyboard: Tab and Enter.</span><button type="button" data-wtfb="pickx">Cancel</button>`;
  document.body.append(pick.box, pick.bar); document.documentElement.classList.add('wtfb-picking'); }
const pickShow = el => { pick.cur = el; if(!el){ pick.box.style.display = 'none'; return; } const r = el.getBoundingClientRect(); Object.assign(pick.box.style, {display:'block', left:r.left - 4 + 'px', top:r.top - 4 + 'px', width:r.width + 8 + 'px', height:r.height + 8 + 'px'}); };
function pickEnd(el){ const p = pick; pick = null; p.box.remove(); p.bar.remove(); document.documentElement.classList.remove('wtfb-picking');
  if(!cfg) return; if(el){ st.el = {txt:label(el) || el.tagName.toLowerCase(), node:el}; } st.open = true; draw(); setTimeout(() => { const t = $q('#wtfb textarea'); if(t) t.focus(); }, 30); }

/* ---------- Pantalla ---------- */
const unmark = () => document.querySelectorAll('.wtfb-marked').forEach(x => x.classList.remove('wtfb-marked'));
const pinDraw = () => { let p = $q('.wtfb-pin'); const n = cfg && st.open && st.el && st.el.node && document.contains(st.el.node) ? st.el.node : null;
  if(!n){ if(p) p.remove(); return; } if(!p){ p = document.createElement('div'); p.className = 'wtfb-pin'; p.innerHTML = ico('pin', 14); document.body.appendChild(p); }
  const r = n.getBoundingClientRect(); Object.assign(p.style, {left:r.left - 10 + 'px', top:r.top - 10 + 'px'}); n.classList.add('wtfb-marked'); };
function draw(){ if(!cfg) return;
  let w = $q('#wtfb'); if(!w){ w = document.createElement('div'); w.id = 'wtfb'; document.body.appendChild(w); }
  if(!(st.open && st.el)) unmark();
  const pend = Q.filter(q => q.st === 'pend').length, u = who();
  const fab = `<button type="button" class="wtfb-fab" data-wtfb="toggle" aria-expanded="${st.open}" aria-controls="wtfb-p">${ico('msg', 16)}<span>Comment</span>${pend ? `<em title="To send">${pend}</em>` : ''}</button>`;
  if(!st.open || pick){ w.innerHTML = pick ? '' : fab; pinDraw(); return; }
  const x = where(), tp = TIPOS.find(t => t[0] === st.tipo);
  let body;
  if(st.view === 'done'){ const s = st.sent;
    body = `<div class="wtfb-done" role="status"><span class="wtfb-ok">${ico('check', 26)}</span><b>${s.st === 'ok' ? 'It reached the team' : 'Received'}</b><p>${s.st === 'ok' ? `Thank you${u.nombre ? ', ' + T(u.nombre.split(' ')[0]) : ''}. We will review it for the next version of your system.` : 'Thank you. If the connection fails, we resend it automatically; you don’t need to do anything.'}</p>
      <blockquote>${T((TIPOS.find(t => t[0] === s.d.tipo) || [, s.d.tipo])[1])}: ${T(s.d.comentario)}</blockquote><div class="wtfb-act"><button type="button" class="wtfb-b2" data-wtfb="otro">Comment on something else</button><button type="button" class="wtfb-b1" data-wtfb="close">Done</button></div></div>`;
  } else if(st.view === 'mios'){
    body = `<div class="wtfb-list">${Q.length ? Q.slice().reverse().map(q => `<div><b>${T((TIPOS.find(t => t[0] === q.d.tipo) || [, q.d.tipo])[1])}</b><span>${T(q.d.comentario)}</span><small>${T(q.d.pantalla)}${q.d.elemento ? ', ' + T(q.d.elemento) : ''}. ${q.st === 'pend' ? '<i class="p">To send</i>' : q.st === 'no' ? '<i class="p">Not sent</i>' : '<i>Sent</i>'}</small></div>`).join('') : '<p>You have not commented yet.</p>'}</div><div class="wtfb-act"><button type="button" class="wtfb-b2" data-wtfb="form">Back</button></div>`;
  } else {
    const ok = okF();
    body = `<div class="wtfb-where">${T(x.app)}${x.pantalla && x.pantalla !== x.app ? ', ' + T(x.pantalla) : ''}${x.registro_nombre && x.registro_nombre !== x.pantalla ? ', ' + T(x.registro_nombre) : ''}${x.pestana ? ', ' + T(x.pestana) : ''}</div>
      <fieldset class="wtfb-tipos"><legend>What is it</legend>${TIPOS.map(([k, n]) => `<button type="button" data-wtfb="tipo" data-v="${k}" aria-pressed="${st.tipo === k}">${n}</button>`).join('')}</fieldset>
      <label class="wtfb-f"><span>Your comment</span><textarea rows="4" data-wtfb-in="txt" placeholder="${T(tp ? tp[2] : 'Tell us what you would change, what is missing or what is unclear')}">${T(st.txt)}</textarea></label>
      ${st.el ? `<div class="wtfb-chip">${ico('pin', 14)}<span>You pointed at: ${T(st.el.txt)}</span><button type="button" data-wtfb="unpick" aria-label="Remove what you pointed at">${ico('x', 13)}</button></div>` : `<button type="button" class="wtfb-pk" data-wtfb="pick">${ico('pin', 15)}Point at something on the screen <small>optional</small></button>`}
      <p class="wtfb-me">Commenting as <b>${T(u.nombre)}</b>${u.rol ? `, ${T(u.rol)}` : ''}</p>
      ${st.err ? `<p class="wtfb-err" role="alert">${T(st.err)}</p>` : ''}
      <div class="wtfb-act">${Q.length ? `<button type="button" class="wtfb-lnk" data-wtfb="mios">Your comments (${Q.length})</button>` : '<span></span>'}<button type="button" class="wtfb-b1" data-wtfb="send"${ok ? '' : ' disabled'}>${st.sending ? '<i class="wtfb-spin"></i>Sending...' : `${ico('send', 14)}Send`}</button></div>`;
  }
  w.innerHTML = `<section class="wtfb-p" id="wtfb-p" role="dialog" aria-modal="false" aria-labelledby="wtfb-t"><header><b id="wtfb-t">${st.view === 'mios' ? 'Your comments' : 'Comment on this screen'}</b><button type="button" data-wtfb="close" aria-label="Close">${ico('x', 16)}</button></header>${body}</section>` + fab;
  pinDraw();
}
const open = () => { st.open = true; st.view = 'form'; st.err = ''; draw(); setTimeout(() => { const f = $q('#wtfb [data-wtfb="tipo"]'); if(f) f.focus(); }, 30); };
const close = () => { st.open = false; st.view = 'form'; draw(); const b = $q('.wtfb-fab'); if(b) b.focus(); };
async function send(){ const u = who(), x = where();
  const d = {cid:cid(), tipo:st.tipo, comentario:clean(st.txt), nombre:clean(u.nombre), rol:u.rol || '', app:x.app || '', pantalla:x.pantalla || '', pantalla_id:x.pantalla_id || '', registro:x.registro || '', registro_nombre:x.registro_nombre || '',
    pestana:x.pestana || '', elemento:st.el ? st.el.txt : '', dispositivo:device(), url:location.pathname + location.hash, fecha:new Date().toISOString()};
  st.sending = true; st.err = ''; draw(); const r = await cfg.send(d); st.sending = false;
  if(r !== 'ok' && r !== 'pend'){ st.err = (r && r.error) || 'It could not be sent. Try again.'; draw(); return; }
  const q = {d, st:r}; Q.push(q); save();
  st.sent = q; st.view = 'done'; st.txt = ''; st.tipo = ''; st.el = null; draw(); setTimeout(() => { const b = $q('#wtfb .wtfb-b1'); if(b) b.focus(); }, 30); }

/* ---------- Eventos (una vez; no hacen nada sin sesión) ---------- */
addEventListener('pointermove', e => { if(pick && !e.target.closest('.wtfb-bar')) pickShow(target(e.target)); }, true);
addEventListener('click', e => { if(!pick) return; if(e.target.closest('.wtfb-bar')){ if(e.target.closest('[data-wtfb="pickx"]')){ e.preventDefault(); pickEnd(null); } return; }
  e.preventDefault(); e.stopImmediatePropagation(); pickEnd(target(e.target)); }, true);
addEventListener('focusin', e => { if(pick && !e.target.closest('.wtfb-bar')) pickShow(target(e.target)); }, true);
document.addEventListener('click', e => { if(!cfg) return; const b = e.target.closest('[data-wtfb]'); if(!b || !b.closest('#wtfb')) return; e.preventDefault(); e.stopPropagation(); const a = b.dataset.wtfb;
  if(a === 'toggle') return st.open ? close() : open(); if(a === 'close') return close(); if(a === 'otro' || a === 'form'){ st.view = 'form'; return draw(); } if(a === 'mios'){ st.view = 'mios'; return draw(); }
  if(a === 'tipo'){ st.tipo = b.dataset.v; draw(); const t = $q('#wtfb textarea'); if(t){ t.focus(); t.setSelectionRange(t.value.length, t.value.length); } return; }
  if(a === 'pick') return pickStart(); if(a === 'unpick'){ st.el = null; return draw(); } if(a === 'send') return send(); });
document.addEventListener('input', e => { if(!cfg) return; const k = e.target.dataset && e.target.dataset.wtfbIn; if(!k || !e.target.closest('#wtfb')) return;
  if(k === 'txt') st.txt = e.target.value;
  const b = $q('#wtfb [data-wtfb="send"]'); if(b) b.disabled = !okF(); });
addEventListener('keydown', e => {
  if(pick){ if(e.key === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); pickEnd(null); } else if(e.key === 'Enter' && !e.target.closest('.wtfb-bar')){ e.preventDefault(); e.stopImmediatePropagation(); pickEnd(target(document.activeElement)); } return; }
  if(!cfg) return;
  const inP = e.target.closest && e.target.closest('#wtfb');
  if(st.open && e.key === 'Escape' && (inP || !document.querySelector('[aria-modal="true"]:not(#wtfb-p)'))){ e.preventDefault(); e.stopImmediatePropagation(); close(); return; }
  if(inP && e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); const b = $q('#wtfb [data-wtfb="send"]'); if(b && !b.disabled) send(); }
  if(inP && e.key === 'Tab'){ e.stopImmediatePropagation(); const f = [...document.querySelectorAll('#wtfb-p button:not([disabled]), #wtfb-p textarea, #wtfb-p input')]; if(!f.length) return;
    if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); } else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); } }
}, true);
addEventListener('resize', pinDraw); addEventListener('scroll', pinDraw, true);
addEventListener('online', flush);

/** Shows the Comment button for this user. Called again with a new config, it keeps what is open. */
export function startComment(next){
  const changed = !cfg || cfg.key !== next.key;
  cfg = next;
  if(changed){ Object.assign(st, {open:false, view:'form', tipo:'', txt:'', el:null, sending:false, sent:null, err:''}); try { Q = JSON.parse(ls.get(KEY()) || '[]'); } catch(e) { Q = []; } setTimeout(flush, 1200); }
  draw();
}

/** Removes the button (signed out, or the module switched off). */
export function stopComment(){
  if(pick) pickEnd(null);
  cfg = null; st.open = false; unmark();
  $q('#wtfb')?.remove(); $q('.wtfb-pin')?.remove();
}
