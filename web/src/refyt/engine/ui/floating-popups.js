// Refyt · v5.12: cada pop up flota sobre la pantalla en vez de empujarla.
import {
  TODAY, VERSIONS, patchLayer, wrapPatchLayer, wrapRender, wrapRenderLayer
} from "../index.js";
/* =================== v5.12: every pop up floats over the screen instead of pushing it =================== */
export const FLOAT62 = [['.cm-dp', el => el.parentElement && el.parentElement.querySelector(':scope > .cbx-b, :scope > button')], ['.cbx-p', el => { const c = el.closest('.cbx'); return c && c.querySelector('.cbx-b'); }]];
export function cbOf62(el){ let a = el.parentElement; while(a && a !== document.body){ const cs = getComputedStyle(a); if(cs.transform !== 'none' || cs.filter !== 'none' || cs.perspective !== 'none' || cs.contain === 'paint') return a; a = a.parentElement; } return null; }
export function float62(){ FLOAT62.forEach(([sel, anc]) => document.querySelectorAll(sel).forEach(p => { const a = anc(p); if(!a || !a.offsetParent) return;
  p.classList.add('fl62'); const r = a.getBoundingClientRect(), cb = cbOf62(p), o = cb ? cb.getBoundingClientRect() : {left:0, top:0}, ph = p.offsetHeight, pw = Math.max(p.offsetWidth, Math.min(340, r.width));
  const below = innerHeight - r.bottom - 8, up = below < ph + 8 && r.top > ph + 8;
  let left = Math.min(r.left, innerWidth - pw - 8); left = Math.max(8, left);
  const top = up ? r.top - ph - 6 : r.bottom + 6;
  p.style.left = (left - o.left) + 'px'; p.style.top = (top - o.top) + 'px'; p.style.width = (sel === '.cbx-p' ? Math.max(r.width, 260) : Math.max(280, Math.min(340, r.width))) + 'px'; })); }
{ wrapRender(r62 => (...x) => { const o = r62(...x); try { float62(); } catch(e) {} return o; });
   wrapRenderLayer(l62 => (...x) => { const o = l62(...x); try { float62(); } catch(e) {} return o; });
  if(typeof patchLayer === 'function'){ wrapPatchLayer(p62 => (...x) => { const o = p62(...x); try { float62(); } catch(e) {} return o; }); } }
addEventListener('resize', () => { try { float62(); } catch(e) {} });
document.addEventListener('scroll', () => { try { float62(); } catch(e) {} }, true);
new MutationObserver(() => { if(document.querySelector('.cm-dp:not(.fl62), .cbx-p:not(.fl62)')) try { float62(); } catch(e) {} }).observe(document.body, {childList:true, subtree:true});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.11') v.url = 'https://claude.ai/artifact/HP3kKE2ywSx8nZzmnu3dfP'; } });
VERSIONS.push({v:'v5.12', date:TODAY, major:false, current:true, url:null, title:'Pop ups float over the screen', sum:'Date pickers and option lists open over the screen, above or below their field, instead of pushing the window or the page longer.', steps:[]});
