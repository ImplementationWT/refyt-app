// Refyt · Render.
import {
  $, A, APPS, APPT, APP_FASE, EMP, FICHAR, GRAD, ME, MODALS, PEO, S, VCUR, VIEWS, approvals, bd,
  dbLines, dbPage, drawTour, esc, fichaOf, helpPage, ico, ini, pend, render, store
} from "../index.js";
export let lastKey = '';
/** Recuerda la última vista dibujada para conservar o reiniciar el scroll. */
export function setLastKey(key) { lastKey = key; }
/* Flight plan: opens centered on the chosen date and keeps its scroll position between redraws */
S.fly = {key:'', x:0, y:0};
export function flyScroll(){ const w = document.querySelector(`#v-${S.view} .fl-wrap`); if(!w || !S.flyMeta) return;
  if(S.fly.key !== S.flyMeta.key){ S.fly.key = S.flyMeta.key; S.fly.x = Math.max(0, S.flyMeta.x + 230 - w.clientWidth / 3); S.fly.y = 0; }
  w.scrollLeft = S.fly.x; w.scrollTop = S.fly.y; }
document.addEventListener('scroll', e => { const t = e.target; if(t && t.classList && t.classList.contains('fl-wrap')){ S.fly.x = t.scrollLeft; S.fly.y = t.scrollTop; } }, true);
export function render0(top){
  const b = {}; APPS.forEach(([k]) => { b[k] = k === 'apr' ? approvals().length : pend(k).length; });
  document.title = 'Refyt'; $('#emp').textContent = EMP;
  $('#appsw').innerHTML = APPS.map(([k, n, ic, tone]) => (APP_FASE[k] === 'luego' && APPS.find(x => APP_FASE[x[0]] === 'luego')[0] === k ? '<span class="cf-swf later">Next phase</span>' : '') + `<button class="sw-b ${tone}${APP_FASE[k] === 'luego' ? ' f2' : ''}" data-act="view" data-v="${k}" data-tip="${n}${APP_FASE[k] === 'luego' ? ', next phase' : ''}" aria-label="${n}" aria-current="${S.view === k}"><span class="si">${ico(ic, 17)}</span><span class="swn">${n}</span>${bd(k === S.view ? 0 : b[k])}</button>`).join('') + `<span class="swsep"></span><button class="sw-b tk" data-act="view" data-v="db" data-tip="Data" aria-label="Data" aria-current="${S.view === 'db'}"><span class="si">${ico('db', 17)}</span><span class="swn">Data</span></button>`;
  const w = S.view === 'db' ? null : PEO[ME()];
  $('#tools').innerHTML = `<button class="btn sec sm vsb" data-act="vsel" title="Versions of this app">${VCUR.v}<span class="vs-ch">${ico('chev', 13)}</span></button><button class="btn sec sm tourb" data-act="tour" title="Recommended tour to present the demo">${ico('flag', 14)}Tour</button><button class="ib thm" data-act="theme" aria-label="${isDark() ? 'Switch to light' : 'Switch to dark'}">${ico(isDark() ? 'sun' : 'moon', 18)}</button><div class="me2"><span class="av" style="background:${w ? GRAD[APPT[S.view]] : GRAD.tk}">${w ? ini(w.n) : ico('db', 17)}</span><div><b>${w ? esc(w.n) : 'Architecture'}</b><small>${w ? esc(w.r) : 'How it all connects'}</small></div></div>`;
  for(const [k] of [...APPS, ['db']]) $('#v-' + k).hidden = S.view !== k;
  const key = S.view + ':' + (S.page[S.view] || '') + ':' + (S.fi[S.view] || ''), main = $('#main'), keep = main.scrollTop;
  if(S.view === 'db'){ $('#dbview').innerHTML = `<div class="op">${dbPage()}</div>`; requestAnimationFrame(dbLines); }
  else { const V = VIEWS[S.view], pg = S.page[S.view], fi = S.fi[S.view], c = fichaOf(fi); $('#a-' + S.view).innerHTML = V.side() + `<div class="op">${pg === 'help' ? helpPage(S.view) : c ? FICHAR(S.view, fi) : (V.pages[pg] || Object.values(V.pages)[0])()}</div>`; }
  main.scrollTop = top || key !== lastKey ? 0 : keep; lastKey = key;
  renderLayer(); drawTour(); requestAnimationFrame(sizeKb);
  requestAnimationFrame(flyScroll);
}
export let lastLayer = '';
export function renderLayer(){ let h = ''; if(S.modal){ const f = MODALS[S.modal.k]; if(f) h = f(S.modal); } const lk = S.modal ? S.modal.k + '|' + (S.modal.id || '') : ''; $('#layer').classList.toggle('still', lk !== '' && lk === lastLayer); lastLayer = lk; $('#layer').innerHTML = h; }
/* Typing in a text field never rebuilds the window: only the state is saved and the buttons and notes that depend on it are refreshed */
export function patchLayer(){ if(!S.modal) return; const f = MODALS[S.modal.k]; if(!f) return; const tmp = document.createElement('div'); tmp.innerHTML = f(S.modal);
  const nf = tmp.querySelector('.md-f'), of = document.querySelector('#layer .md-f'); if(nf && of) of.innerHTML = nf.innerHTML;
  tmp.querySelectorAll('.md-b button[data-act]').forEach(nb => { const ob = document.querySelector(`#layer .md-b button[data-act="${nb.dataset.act}"]${nb.dataset.v ? `[data-v="${nb.dataset.v}"]` : ''}`); if(ob){ ob.disabled = nb.disabled; } }); }
export function refocus(fn3){ const a = document.activeElement, d = a && a.dataset && a.dataset.in ? {...a.dataset} : null; let pos = null; try { pos = a.selectionStart; } catch(e) {}
  const mb = $('.md-b'), st = mb ? mb.scrollTop : 0; fn3(); const nmb = $('.md-b'); if(nmb && st) nmb.scrollTop = st;
  if(d){ const sel = `[data-in="${d.in}"]` + (d.k != null ? `[data-k="${d.k}"]` : ''); const n = $(sel); if(n){ n.focus(); try { if(pos != null) n.setSelectionRange(pos, pos); } catch(e) {} } } }
export const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
A.theme = () => { const n = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = n; store.set('rft-demo-theme', n); render(); };
export function sizeKb(){ document.querySelectorAll('.um-kb').forEach(kb => { kb.style.height = 'auto'; const cols = [...kb.querySelectorAll('.um-kc')]; if(!cols.length) return;
  const mxh = Math.max(...cols.map(c => c.querySelector('.um-kch').offsetHeight + c.querySelector('.um-kcb').scrollHeight + 26)), avail = innerHeight - kb.getBoundingClientRect().top - 18; kb.style.height = Math.max(300, Math.min(mxh, avail)) + 'px'; }); }
addEventListener('resize', () => { sizeKb(); if(S.view === 'db') dbLines(); });
