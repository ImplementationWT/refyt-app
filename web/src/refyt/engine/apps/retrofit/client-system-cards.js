// Refyt · v5.25: Client system updates como tarjetas: una por propiedad, pasos y checklist pendiente.
import {
  DB, S, TODAY, VERSIONS, VIEWS, csName, csPend74, csRows74, empty, esc, fbar57, ico, oph, plural,
  ptOf, scOf, stat, sum, swap57, trBar, visNote
} from "../../index.js";
/* =================== v5.25: Client system updates as clean cards: one per property, steps, pending checklist =================== */
VIEWS.del.pages.cs = function csPage75(){ const all = DB.pr.filter(p => p.csTodo), xs = csRows74(), c = patch => swap57(patch, () => csRows74().length), syss = [...new Set(DB.pr.map(p => ptOf(p).sys))], scs = [...new Set(all.map(p => p.sc))], nAll = p => sum(csPend74(p), g => g.xs.length);
  const k = [stat('tk', 'Updates to make', all.length, plural(sum(all, nAll), 'pending item', 'pending items')), ...syss.slice(0, 3).map((s, i) => { const n = all.filter(p => ptOf(p).sys === s).length; return stat(n ? ['ta', 'tb', 'tg'][i] : 'tg', s, n, n ? 'waiting for an update' : 'up to date', 'csSy74', s, S.f.cssy === s); })].join('');
  const bar = fbar57({id:'cs', qk:'f', qv:['csq'], ph:'Search a property, scheme, system or task', nf:(S.f.cssy ? 1 : 0) + (S.f.cssc ? 1 : 0), clr:'csClr74', count:plural(xs.length, 'update', 'updates'),
    cols:[{t:'System', opts:[{a:'csSy74', v:'', n:'All systems', c:c({cssy:''}), on:!S.f.cssy}, ...syss.map(s => ({a:'csSy74', v:s, n:s, c:c({cssy:s}), on:S.f.cssy === s}))]},
      {t:'Scheme', opts:[{a:'csSc74', v:'', n:'All schemes', c:c({cssc:''}), on:!S.f.cssc}, ...scs.map(id => ({a:'csSc74', v:id, n:scOf(id).n, c:c({cssc:id}), on:S.f.cssc === id}))]}],
    chips:[...(S.f.cssy ? [['csSy74', '', S.f.cssy]] : []), ...(S.f.cssc ? [['csSc74', '', scOf(S.f.cssc).n]] : [])]});
  const card = p => { const pt = ptOf(p), st = pt.st.length, at = (p.cs || 0) + 1, open = S.f.csx === p.id, src = {[`In ${pt.sys}`]:pt.sys, 'Handover pack':'Handover', 'Open tasks':'Task'};
    const items = csPend74(p).flatMap(g => g.xs.map(x => ({...x, src:src[g.t] || (g.t.startsWith('To finish') ? 'Phase ' + p.ph.slice(0, 1) : g.t)}))), shown = open ? items : items.slice(0, 3);
    return `<article class="cs75"><header class="cs75-h"><div class="cs75-t"><button class="cs75-n" data-act="ficha" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(scOf(p.sc).n)} · ${esc(p.ph)}</small></div>
      <div class="cs75-s"><span class="cs75-sys">${ico('globe', 14)}${esc(pt.sys)}</span><div class="cs75-st"><b>${esc(csName(p))}</b><small>Step ${at} of ${st}</small></div><div class="cs75-pg" aria-label="Step ${at} of ${st}">${pt.st.map((_, i) => `<i class="${i < at - 1 ? 'd' : i === at - 1 ? 'c' : ''}"></i>`).join('')}</div></div>
      <button type="button" class="btn pri cs75-ok" data-act="csDone" data-v="${p.id}">${ico('check', 15, 2.4)}Mark as updated</button></header>
      <div class="cs75-b"><div class="cs75-bh"><b>Pending</b><span class="cs75-c">${items.length}</span></div><ul class="cs75-l">${shown.map(x => `<li class="${x.od ? 'od' : ''}"><span class="cs75-ck" aria-hidden="true"></span><div><b>${esc(x.n)}</b>${x.d ? `<small>${esc(x.d)}${x.od ? ', overdue' : ''}</small>` : ''}</div><em>${esc(x.src)}</em></li>`).join('')}</ul>${items.length > 3 ? `<button type="button" class="cs75-more" data-act="csX74" data-v="${p.id}" aria-expanded="${open}">${open ? 'Show less' : `Show ${items.length - 3} more`}</button>` : ''}</div></article>`; };
  return trBar() + oph('Client system updates', 'Dynamics, Shareworks and PAS Hub are updated by hand. Each card shows the step the job is on and what is still pending.') + visNote()
    + `<div class="cstats ov-k m59-k">${k}</div>` + bar
    + (xs.length ? `<div class="cs75-w">${xs.map(card).join('')}</div>` : empty(all.length ? 'Nothing matches the search or the filters.' : 'All client systems are up to date.')); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.24') v.url = 'https://claude.ai/artifact/9d1SdChHAjpC4xyrhqNC4p'; } });
VERSIONS.push({v:'v5.25', date:TODAY, major:false, current:true, url:null, title:'Client system updates as cards', sum:'Each property is a card: the client system and its step with a progress bar, Mark as updated, and a pending checklist that shows three items and expands to the rest.', steps:[]});
