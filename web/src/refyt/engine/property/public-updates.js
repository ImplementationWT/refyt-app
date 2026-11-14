// Refyt · v5.1: actualizaciones públicas, checklists editables, Orders abre en All, texto que se ajusta.
import {
  A, CHKG, DB, IN, ME, MODALS, OPENP, PEO, S, SEC5, TODAY, VERSIONS, VIEWS, addDays, area, auto, av,
  chkChips, effChk, empty, esc, fld, fmtDy, his, ico, mfoot, mlab, modal, nx, prOf, render,
  renderLayer, roleOfP, scOf, secOn, setChkTab, setUpdTab, toast, wrapCloTab, wrapInsTab, wrapRetTab
} from "../index.js";
/* =================== v5.1: public updates, checklists you can edit, Orders opens on All, text that wraps =================== */
/* Orders: All first, then Open, then each status */
S.f.ost = 'all';
/* Updates: every post is public on the property; mentions are optional and only notify */
A.postOpen = el => { const p = prOf(el.dataset.v); S.modal = {k:'post8', pr:p.id, to:[], tt:'', t:'', task:false, d:addDays(TODAY, 4), from:''}; renderLayer(); };
MODALS.post8 = m => { const p = prOf(m.pr), ok = (m.t || '').trim() && (!m.task || (m.to.length && (m.tt || '').trim() && m.d));
  return modal('Post an update', `${esc(p.ad)}, ${p.id}. A public update on the property: everyone who can open it sees it in Updates. Mention people to notify them.`,
    area('Update', 'm', 't', m.t, 'What happened, what is next, and who needs to act', true)
    + mlab('Mention, optional') + `<div class="rf-ppl">${Object.entries(PEO).filter(([k]) => k !== 'kel' && k !== ME()).map(([k, x]) => `<button type="button" class="rf-pp${m.to.includes(k) ? ' on' : ''}" data-act="postTo" data-v="${k}">${av(k, 22)}<span><b>${x.n}</b><small>${x.r}</small></span></button>`).join('')}</div>`
    + (m.to.length ? `<button type="button" class="rf-cons${m.task ? ' on' : ''}" data-act="mset" data-k="task" data-v="${m.task ? '' : '1'}"><span class="rf-ck">${m.task ? ico('check', 14, 2.6) : ''}</span>Also create a task for ${PEO[m.to[0]].n}</button>` + (m.task ? `<div class="rf-2">${fld('Task', 'm', 'tt', m.tt, {req:true, ph:'e.g. Chase the invoice'})}${fld('Due date', 'm', 'd', m.d, {type:'date', req:true})}</div>` : '') : ''),
    mfoot('Post publicly', 'postOk', !!ok), 680); };
A.postTo = el => { const k = el.dataset.v, w = S.modal.to; S.modal.to = w.includes(k) ? w.filter(x => x !== k) : [...w, k]; if(!S.modal.to.length) S.modal.task = false; renderLayer(); };
A.postOk = () => { const m = S.modal, p = prOf(m.pr), post = {id:'UP-' + Date.now(), by:ME(), on:TODAY, t:m.t.trim(), to:[...m.to], tk:null, from:m.from, pub:true};
  if(m.task && m.to.length){ const k = {id:'TK-' + (++DB.seq.tk), t:m.tt.trim(), desc:m.t.trim(), who:m.to[0], r:roleOfP(m.to[0]), due:m.d, src:'Job', pr:p.id, done:false, doneOn:null}; DB.tk.push(k); post.tk = k.id; }
  p.th = p.th || []; p.th.push(post); S.modal = null;
  his(p, `${PEO[ME()].n} posted a public update${m.to.length ? ` and mentioned ${m.to.map(k => PEO[k].n).join(', ')}` : ''}`, ME());
  if(m.to.length) auto(p, S.view, `notified ${m.to.map(k => PEO[k].n).join(', ')}${post.tk ? ` and added the task to ${PEO[m.to[0]].n}’s My tasks` : ''}`);
  else { render(); toast('Posted publicly in the property’s Updates.'); } };
setUpdTab(function(app, p){ const th = (p.th || []).slice().reverse();
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap"><p class="hint" style="margin:0;flex:1 1 260px">Public updates on this property. Everyone who can open it sees them; the people mentioned are also notified, and a post can create the task for whoever must act.</p>${nx('postOpen', p.id, 'Post an update')}</div>`
    + (th.length ? th.map(u => { const k = u.tk && DB.tk.find(x => x.id === u.tk); return `<div class="rf-post">${av(u.by, 30)}<div style="min-width:0;flex:1"><div class="rf-ph2"><b>${PEO[u.by].n}</b><small>${PEO[u.by].r}, ${fmtDy(u.on)}${u.from ? `, about ${u.from.toLowerCase()}` : ''}</small><span class="up51-pub">${ico('globe', 12)}Public</span></div><p>${esc(u.t)}</p>${u.to.length || k ? `<div class="rf-pt">${u.to.map(x => `<span>@${PEO[x].n}</span>`).join('')}${k ? `<button class="rf-chipb" data-act="tkView" data-v="${k.id}">Task: ${esc(k.t)}, ${k.done ? 'done' : 'due ' + fmtDy(k.due)}</button>` : ''}</div>` : ''}</div></div>`; }).join('') : empty('No updates yet. Post the first one; everyone on the property will see it.')); });

/* Checklists: add, edit and delete items on each property */
S.ck51 = null; S.ck51a = {}; export let CX51 = 0;
export const CKTAB51 = {ev:'ret', docs:'ret', d:'ins', hand:'clo'};
export const ckG51 = g => CHKG.find(c => c[0] === g);
export const ckLbl51 = (p, g, x) => { const c = (p.cx || {})[g] || [], own = c.find(i => i.k === x); if(own) return own.t; return ((p.rn || {})[g] || {})[x] || ckG51(g)[3](x); };
export const ckEditing51 = key => S.ck51 && S.ck51.k === key;
export function ckRow51(p, g, x, ed, own){ const key = `${p.id}|${g}|${x}`, it = own ? ((p.cx || {})[g] || []).find(i => i.k === x) : null, rn = !own && ((p.rn || {})[g] || {})[x];
  if(ed && ckEditing51(key)) return `<div class="ck51-row ck51-ed"><input class="ck51-in" data-in="ck51e" data-k="${esc(key)}" value="${esc(S.ck51.v)}" aria-label="Item name" maxlength="120"><div class="ck51-act">${nx('ck51Save', key, 'Save')}${nx('ck51Cancel', key, 'Cancel', 'sec')}</div></div>`;
  const ck = own ? `<button type="button" class="rf-ck ck51-ck${it.done ? ' on' : ''}" data-act="${ed ? 'ck51Done' : ''}" data-v="${esc(key)}" aria-label="${it.done ? 'Mark as not done' : 'Mark as done'}" ${ed ? '' : 'disabled'}>${it.done ? ico('check', 14, 2.6) : ''}</button>` : `<span class="ck51-dot" aria-hidden="true"></span>`;
  const tag = own ? '<em class="ck51-tag">Added here</em>' : rn ? `<em class="ck51-tag">Renamed here, was ${esc(ckG51(g)[3](x))}</em>` : '';
  return `<div class="ck51-row${own && it.done ? ' done' : ''}">${ck}<div class="ck51-t"><b>${esc(ckLbl51(p, g, x))}</b>${tag}</div>${ed ? `<div class="ck51-act"><button type="button" class="ib ck51-ib" data-act="ck51Edit" data-v="${esc(key)}" title="Edit" aria-label="Edit ${esc(ckLbl51(p, g, x))}">${ico('edit', 15)}</button><button type="button" class="ib ck51-ib" data-act="ck51Del" data-v="${esc(key)}" title="${own ? 'Delete' : 'Remove from this property'}" aria-label="Delete ${esc(ckLbl51(p, g, x))}">${ico('x', 15)}</button></div>` : ''}</div>`; }
S.ck51g = null;
export const ckEdRow51 = (p, g, x, own) => ckRow51(p, g, x, true, own).replace(/<button type="button" class="rf-ck ck51-ck[^>]*>[\s\S]*?<\/button>/, '<span class="ck51-dot" aria-hidden="true"></span>');
setChkTab(function(app, p){ const s = scOf(p.sc), e = effChk(p), ed = ['dir', 'ret', 'del'].includes(app) && OPENP.includes(p.ph);
  return `<p class="hint" style="margin-top:0">Inherited from <b>${esc(s.n)}</b>. Change them here for this property only; changes on the scheme apply to every property except what was changed here.</p>` + CHKG.map(([g, n, all]) => { const cx = (p.cx || {})[g] || [], ak = `${p.id}|${g}`, editing = ed && S.ck51g === ak, own = !!(p.chk || {})[g] || cx.length || Object.keys((p.rn || {})[g] || {}).length;
    const head = `<div class="rs-h"><h3>${n}</h3><p>${editing ? 'Editing: add, rename or delete items' : own ? 'Changed on this property' : 'As the scheme'}</p></div>` + (ed && !editing ? `<button type="button" class="ck51-eb" data-act="ck51Open" data-v="${esc(ak)}" title="Edit ${esc(n)}" aria-label="Edit ${esc(n)}">${ico('edit', 18)}</button>` : '');
    if(editing){ const gone = all().filter(x => !e[g].includes(x));
      return `<section class="rsec ck51 ck51-on">${head}` + e[g].map(x => ckEdRow51(p, g, x, false)).join('') + cx.map(i => ckEdRow51(p, g, i.k, true)).join('')
        + (!e[g].length && !cx.length ? `<p class="hint">No items on this property.</p>` : '')
        + `<div class="ck51-add"><input class="ck51-in" data-in="ck51a" data-k="${esc(ak)}" value="${esc(S.ck51a[ak] || '')}" placeholder="Add an item to ${esc(n)}" aria-label="New item for ${esc(n)}" maxlength="120">${nx('ck51Add', ak, `${ico('plus', 14)}Add`, 'sec')}</div>`
        + (gone.length ? `<div class="ck51-gone"><small>Removed from this property:</small>${gone.map(x => `<button type="button" class="rf-chip2" data-act="ck51Back" data-v="${esc(ak + '|' + x)}" title="Put it back">${ico('plus', 12)}${esc(ckLbl51(p, g, x))}</button>`).join('')}</div>` : '')
        + `<div class="ck51-foot">${nx('ck51Close', ak, `${ico('check', 15)}Confirm`)}</div></section>`; }
    const lb = x => ckLbl51(p, g, x);
    let chips = ed ? chkChips(e[g], all(), lb, 'pchk', ak, s.chk[g]) : `<div class="rf-chips">${e[g].map(x => `<span class="rf-chip2 on">${esc(lb(x))}</span>`).join('')}</div>`;
    const cc = cx.filter(i => ed || !i.off).map(i => ed ? `<button type="button" class="rf-chip2${i.off ? '' : ' on'} ch" data-act="ck51Tog" data-v="${esc(ak + '|' + i.k)}" title="Added on this property">${i.off ? '' : ico('check', 12, 2.6)}${esc(i.t)}</button>` : `<span class="rf-chip2 on">${esc(i.t)}</span>`).join('');
    chips = chips.slice(0, -6) + cc + '</div>';
    return `<section class="rsec ck51">${head}${chips}${(p.chk || {})[g] && ed ? `<button class="btn sec sm" data-act="pchkReset" data-v="${p.id}|${g}">Reset to the scheme</button>` : ''}</section>`; }).join(''); });
A.ck51Open = el => { S.ck51g = el.dataset.v; S.ck51 = null; render(); };
A.ck51Close = () => { S.ck51g = null; S.ck51 = null; render(); toast('Checklist updated.'); };
A.ck51Tog = el => { const [id, g, x] = el.dataset.v.split('|'), p = prOf(id), it = ((p.cx || {})[g] || []).find(y => y.k === x); if(!it) return; it.off = !it.off; his(p, `Checklist changed on this property: ${it.off ? 'removed' : 'added'} ${it.t}`, ME()); render(); };
IN.ck51e = t => { if(S.ck51) S.ck51.v = t.value; };
IN.ck51a = t => { S.ck51a[t.dataset.k] = t.value; };
export const ckFocus51 = sel => setTimeout(() => { const i = document.querySelector(sel); if(i){ i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch(e) {} } }, 30);
A.ck51Edit = el => { const [id, g, x] = el.dataset.v.split('|'); S.ck51 = {k:el.dataset.v, v:ckLbl51(prOf(id), g, x)}; render(); ckFocus51('.ck51-ed .ck51-in'); };
A.ck51Cancel = () => { S.ck51 = null; render(); };
A.ck51Save = () => { if(!S.ck51) return; const [id, g, x] = S.ck51.k.split('|'), p = prOf(id), v = (S.ck51.v || '').trim(), old = ckLbl51(p, g, x);
  if(!v){ toast('Write a name for the item, or delete it.'); return; }
  const own = ((p.cx || {})[g] || []).find(i => i.k === x);
  if(own) own.t = v; else { p.rn = p.rn || {}; p.rn[g] = p.rn[g] || {}; if(v === ckG51(g)[3](x)) delete p.rn[g][x]; else p.rn[g][x] = v; }
  S.ck51 = null; if(v !== old) his(p, `Checklist item renamed on this property: ${old} to ${v}`, ME()); render(); toast('Item saved.'); };
A.ck51Add = el => { const [id, g] = el.dataset.v.split('|'), p = prOf(id), v = (S.ck51a[el.dataset.v] || '').trim();
  if(!v){ toast('Write the item first.'); ckFocus51(`.ck51-add .ck51-in[data-k="${el.dataset.v}"]`); return; }
  p.cx = p.cx || {}; p.cx[g] = p.cx[g] || []; p.cx[g].push({k:'CX' + (++CX51), t:v, done:false}); S.ck51a[el.dataset.v] = '';
  his(p, `Checklist item added on this property, ${ckG51(g)[1]}: ${v}`, ME()); render(); toast('Item added to this property.'); ckFocus51(`.ck51-add .ck51-in[data-k="${el.dataset.v}"]`); };
A.ck51Del = el => { const [id, g, x] = el.dataset.v.split('|'), p = prOf(id), cx = (p.cx || {})[g] || [], i = cx.findIndex(y => y.k === x), name = ckLbl51(p, g, x);
  if(i >= 0){ cx.splice(i, 1); his(p, `Checklist item deleted on this property: ${name}`, ME()); render(); toast('Item deleted.'); return; }
  if((p.rn || {})[g]) delete p.rn[g][x]; A.pchk({dataset:{v:`${id}|${g}|${x}`}}); toast('Removed from this property. You can put it back below.'); };
A.ck51Back = el => { A.pchk(el); toast('Back on this property.'); };
A.ck51Done = el => { const [id, g, x] = el.dataset.v.split('|'), p = prOf(id), it = ((p.cx || {})[g] || []).find(y => y.k === x); if(!it) return; it.done = !it.done; his(p, `${it.t}: ${it.done ? 'done' : 'not done'}`, ME()); render(); };
{ const oReset = A.pchkReset; A.pchkReset = el => { const [id, g] = el.dataset.v.split('|'), p = prOf(id); if(p.rn) delete p.rn[g]; oReset(el); }; }
document.addEventListener('keydown', e => { const t = e.target; if(!t || !t.dataset || e.key !== 'Enter' && e.key !== 'Escape') return;
  if(t.dataset.in === 'ck51a' && e.key === 'Enter'){ e.preventDefault(); A.ck51Add({dataset:{v:t.dataset.k}}); }
  if(t.dataset.in === 'ck51e'){ e.preventDefault(); if(e.key === 'Enter') A.ck51Save(); else A.ck51Cancel(); } });
/* The same names and the added items show where the work is done: Assess and design, Prepare and install, Close out */
export const ckWrap51 = (fn, tab) => function(app, p){ let h = fn(app, p); const rn = p.rn || {};
  Object.keys(rn).forEach(g => Object.entries(rn[g]).forEach(([x, v]) => { const old = ckG51(g)[3](x); h = h.split(`<b>${old}</b>`).join(`<b>${esc(v)}</b>`).split(`<b>${esc(old)}</b>`).join(`<b>${esc(v)}</b>`); }));
  const on51 = g => ((p.cx || {})[g] || []).filter(i => !i.off), gs = Object.keys(CKTAB51).filter(g => CKTAB51[g] === tab && on51(g).length), ed = ['dir', 'ret', 'del'].includes(app) && OPENP.includes(p.ph);
  if(gs.length) h += `<section class="rsec ck51" style="margin-top:16px"><div class="rs-h"><h3>Added on this property</h3><p>Items added in Checklists for this property only.</p></div>${gs.map(g => `<small class="rf-ph">${ckG51(g)[1]}</small>` + on51(g).map(i => ckRow51(p, g, i.k, false, true).replace('disabled', ed ? '' : 'disabled').replace('data-act=""', ed ? 'data-act="ck51Done"' : 'data-act=""')).join('')).join('')}</section>`;
  return h; };
wrapRetTab(prev => ckWrap51(prev, 'ret')); wrapInsTab(prev => ckWrap51(prev, 'ins')); wrapCloTab(prev => ckWrap51(prev, 'clo'));

/* The menu on phones and tablets also lists every section, so nothing hides off screen */
['dir', 'com', 'acc', 'ret', 'del', 'tsk'].forEach(a => { if(VIEWS[a] && VIEWS[a].side){ const o = VIEWS[a].side; VIEWS[a].side = (...x) => { const h = o(...x), secs = SEC5.filter(s => secOn(s) && !s.hidden);
  const m = `<div class="v51-secm" role="group" aria-label="Sections">${secs.map(s => `<button type="button" class="v51-sec" data-act="sec5" data-v="${s.k}" aria-current="${S.sec5 === s.k}">${s.n}</button>`).join('')}</div>`;
  return h.replace(/(<aside class="sb v5-sb"[^>]*>)/, `$1${m}`); }; } });

/* The drawer opens right under the header, whatever its height on this screen */
{ const oT = A.sbTog; A.sbTog = (...x) => { oT(...x); requestAnimationFrame(() => { const hd = document.querySelector('header.top'), sb = document.querySelector('.oapp.sbopen>.sb'); if(hd && sb) sb.style.setProperty('top', Math.max(0, Math.round(hd.getBoundingClientRect().bottom)) + 'px', 'important'); }); }; }
VERSIONS.forEach(v => { if(v.current) v.current = false; });
VERSIONS.push({v:'v5', date:TODAY, major:false, current:false, url:'https://claude.ai/artifact/R1thJhkP3VVmnUviCzR8ch', title:'Sections across the header, each with its own menu', sum:'Overview, Properties and the team sections across the top; the left menu shows only the selected section, and Overview changes with the role.', steps:[]});
VERSIONS.push({v:'v5.1', date:TODAY, major:false, current:true, url:null, title:'Public updates, checklists you can edit, Orders on All, text that fits every screen', sum:'Post an update now posts publicly on the property, with optional mentions. Checklists keep their selectable items, and an edit button on each group adds, renames and deletes items, then Confirm. Orders opens on All, then Open, then each status. Long names wrap instead of being cut, and the phone menu lists every section.', steps:[]});
