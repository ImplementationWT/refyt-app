// Refyt · Director: guardar plantilla.
import {
  A, DB, ME, MODALS, S, TODAY, VERSIONS, VIEWS, esc, go, ico, modal, render, renderLayer, toast,
  tpClone, tpOf
} from "../../index.js";
export const TPF = ['n', 'sys', 'st', 'trigk', 'ms', 'rates', 'units', 'bud', 'set', 'lim', 'ev', 'docs', 'd', 'hand', 'groups'];
export const tpSnap = t => JSON.stringify(TPF.map(f => t[f]));
export const tpDirty = d => d.isNew || (d.editOf && tpOf(d.editOf) && tpSnap(tpOf(d.editOf)) !== tpSnap(d));
A.tpEdit = el => { const src = tpOf(el.dataset.v), d = tpClone(src, src.n); d.draft = true; d.editOf = src.id; S.f.tpe = d.id; render(true); };
['tpOk9', 'tpDup', 'tpFromSc'].forEach(k => { const o = A[k]; A[k] = el => { o(el); const t = tpOf(S.f.tpe); if(t){ t.draft = true; t.isNew = true; t.editOf = null; render(); } }; });
export const tpCheck = d => !(d.n || '').trim() ? 'Give the template a name.' : d.st.length < 2 ? 'Add at least two statuses.' : !d.ms.length ? 'Include at least one measure.' : d.ms.some(m => !(d.rates[m] > 0)) ? 'Every included measure needs a price.' : '';
export function tpSave(id){ const d = tpOf(id), err = tpCheck(d); if(err){ toast(err); return null; } let keep;
  if(d.editOf && tpOf(d.editOf)){ keep = tpOf(d.editOf); TPF.forEach(f => keep[f] = JSON.parse(JSON.stringify(d[f]))); DB.tpl = DB.tpl.filter(x => x.id !== d.id); }
  else { keep = d; d.draft = false; d.isNew = false; }
  keep.on = TODAY; keep.by = ME(); return keep; }
A.tpSave = el => { const t = tpSave(el.dataset.v); if(!t) return; S.f.tpe = null; S.hl = t.id; render(true); toast(`${esc(t.n)} saved. New schemes made from it start with these settings.`); };
A.tpDiscard = el => { const d = tpOf(el.dataset.v); DB.tpl = DB.tpl.filter(x => x.id !== d.id); S.f.tpe = null; S.modal = null; render(true); toast(d.isNew ? 'Template discarded.' : 'Changes discarded. The template is as it was.'); };
A.tpBack = () => { const d = S.f.tpe && tpOf(S.f.tpe); if(d && d.draft && tpDirty(d)){ S.modal = {k:'tpq', id:d.id}; renderLayer(); return; } if(d && d.draft) DB.tpl = DB.tpl.filter(x => x.id !== d.id); S.f.tpe = null; render(true); };
MODALS.tpq = m => modal('Unsaved changes', `${esc(tpOf(m.id).n)} has changes that are not saved.`, '<p class="rf-sum">Save them to use them in new schemes, or discard them.</p>', `<span class="note"></span><button class="btn sec lg" data-act="tpDiscard" data-v="${m.id}">Discard</button><button class="btn pri lg" data-act="tpSaveM" data-v="${m.id}">Save template</button>`, 480);
A.tpSaveM = el => { S.modal = null; A.tpSave(el); };
{ const o = A.nsOpenT; A.nsOpenT = el => { const t = tpOf(el.dataset.v); if(t && t.draft && !t.base){ const k = tpSave(t.id); if(!k) return; S.f.tpe = null; return o({dataset:{v:k.id}}); } o(el); }; }
{ const o = VIEWS.dir.pages.nsc; VIEWS.dir.pages.nsc = () => { const h = o(), d = !S.f.wz && S.f.tpe && tpOf(S.f.tpe); if(!d || !d.draft) return h; const dirty = tpDirty(d);
  return h + `<div class="rf-savebar"><span>${dirty ? `${ico('alert', 15)}${d.isNew ? 'New template, not saved yet' : 'Unsaved changes'}` : 'No changes'}</span><div><button class="btn sec" data-act="tpDiscard" data-v="${d.id}">${d.isNew ? 'Discard' : 'Discard changes'}</button><button class="btn pri" data-act="tpSave" data-v="${d.id}" ${dirty ? '' : 'disabled'}>Save template</button></div></div>`; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/SZVFXMEALapjRospgKCSRN'; } });
VERSIONS.push({v:'v3.18', date:TODAY, major:false, current:true, url:null, title:'Save template', sum:'A template is edited as a draft and kept with Save template at the bottom; leaving with unsaved changes asks to save or discard.', steps:[
  {t:'Save template', min:.5, dolor:'Before, there was no way to save a template.', show:['A bar at the bottom: unsaved changes, Discard and Save template.', 'Leaving with unsaved changes asks to save or discard.'], say:'Templates only change when you save them.', go:() => { S.role = 'dir'; S.f.wz = null; go('dir', 'nsc'); A.tpEdit({dataset:{v:'TP-1'}}); }},
]});
