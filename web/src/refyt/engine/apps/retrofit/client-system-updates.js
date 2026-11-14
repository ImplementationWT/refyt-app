// Refyt · v5.24: Client system updates en el nuevo diseño, cada pendiente a un clic.
import {
  A, DB, PEO, RN, S, TODAY, VERSIONS, VIEWS, cHand68, csName, dDiff, empty, esc, fbar57, fmtDy, ico,
  norm, oph, phGate, plural, ptOf, re57, scOf, stat, sum, swap57, trBar, visNote
} from "../../index.js";
/* =================== v5.24: Client system updates in the new design, with every pending item one click away =================== */
S.f.csq = ''; S.f.cssy = ''; S.f.cssc = ''; S.f.csx = null;
export const csSteps74 = t => { const parts = String(t || '').split(/,\s*then\s+|,\s*/).map(s => s.trim()).filter(Boolean); const verb = (parts[0] || '').split(' ')[0];
  return parts.map((s, i) => { s = s.replace(/^then\s+/i, ''); if(i && !/^[A-Z]/.test(s)) s = (/^(press|send|tick|attach|add|mark|confirm|submit|wait)/i.test(s) ? '' : verb + ' ') + s; return s[0].toUpperCase() + s.slice(1); }); };
export const csPend74 = p => { const sys = ptOf(p).sys, g = [];
  g.push({t:`In ${sys}`, ic:'globe', xs:csSteps74(p.csTodo).map(s => ({n:s}))});
  const gate = phGate(p); if(gate.miss && gate.miss.length) g.push({t:`To finish ${p.ph}`, ic:'flag', xs:gate.miss.map(s => ({n:s}))});
  if(p.ph === 'F. Close out'){ const gm = (gate.miss || []).join(' | '), left = cHand68(p).left.filter(s => !gm.includes(s)); if(left.length) g.push({t:'Handover pack', ic:'clip', xs:left.map(s => ({n:s}))}); }
  const tk = DB.tk.filter(k => k.pr === p.id && !k.done); if(tk.length) g.push({t:'Open tasks', ic:'check', xs:tk.map(k => ({n:k.t, d:`${PEO[k.who] ? PEO[k.who].n : RN(k.r)}, due ${fmtDy(k.due)}`, od:dDiff(k.due) < 0}))});
  return g; };
export const csRows74 = () => { const q = norm(S.f.csq); return DB.pr.filter(p => p.csTodo && (!S.f.cssy || ptOf(p).sys === S.f.cssy) && (!S.f.cssc || p.sc === S.f.cssc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n} ${ptOf(p).sys} ${p.csTodo}`).includes(q))); };
VIEWS.del.pages.cs = function csPage74(){ const all = DB.pr.filter(p => p.csTodo), xs = csRows74(), c = patch => swap57(patch, () => csRows74().length), syss = [...new Set(DB.pr.map(p => ptOf(p).sys))], scs = [...new Set(all.map(p => p.sc))], nAll = p => sum(csPend74(p), g => g.xs.length);
  const k = [stat('tk', 'Updates to make', all.length, plural(sum(all, nAll), 'pending item', 'pending items')), ...syss.slice(0, 3).map((s, i) => { const n = all.filter(p => ptOf(p).sys === s).length; return stat(n ? ['ta', 'tb', 'tg'][i] : 'tg', s, n, n ? 'waiting for an update' : 'up to date', 'csSy74', s, S.f.cssy === s); })].join('');
  const bar = fbar57({id:'cs', qk:'f', qv:['csq'], ph:'Search a property, scheme, system or task', nf:(S.f.cssy ? 1 : 0) + (S.f.cssc ? 1 : 0), clr:'csClr74', count:plural(xs.length, 'update', 'updates'),
    cols:[{t:'System', opts:[{a:'csSy74', v:'', n:'All systems', c:c({cssy:''}), on:!S.f.cssy}, ...syss.map(s => ({a:'csSy74', v:s, n:s, c:c({cssy:s}), on:S.f.cssy === s}))]},
      {t:'Scheme', opts:[{a:'csSc74', v:'', n:'All schemes', c:c({cssc:''}), on:!S.f.cssc}, ...scs.map(id => ({a:'csSc74', v:id, n:scOf(id).n, c:c({cssc:id}), on:S.f.cssc === id}))]}],
    chips:[...(S.f.cssy ? [['csSy74', '', S.f.cssy]] : []), ...(S.f.cssc ? [['csSc74', '', scOf(S.f.cssc).n]] : [])]});
  const row = p => { const pt = ptOf(p), g = csPend74(p), n = sum(g, x => x.xs.length), open = S.f.csx === p.id, first = g[0].xs[0];
    return `<tr class="${open ? 'tl-open' : ''}"><td class="rd55-pr"><button class="rd55-pn" data-act="ficha" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(scOf(p.sc).n)}, ${esc(p.ph)}</small></td><td class="c68-cs"><b>${esc(pt.sys)}</b><span class="rd55-p rq">${ico('clock', 13, 2.2)}Step ${(p.cs || 0) + 1} of ${pt.st.length}: ${esc(csName(p))}</span></td><td class="cs74-td"><div class="cs74-h"><span class="rd55-p bk">${ico('alert', 13, 2.2)}${plural(n, 'pending', 'pending')}</span><b>${esc(first ? first.n : p.csTodo)}${n > 1 ? `<em> and ${n - 1} more</em>` : ''}</b></div><button type="button" class="cs74-more" data-act="csX74" data-v="${p.id}" aria-expanded="${open}">${open ? 'Hide' : 'See all'} ${n} pending ${ico('chev', 12, 2.4)}</button></td><td><button type="button" class="rd56-tlb on" data-act="csDone" data-v="${p.id}">${ico('check', 14, 2.4)}Mark as updated</button></td></tr>`
      + (open ? `<tr class="tl-row"><td colspan="4"><div class="cs74-pan">${g.map(gr => `<div class="cs74-g"><small>${ico(gr.ic, 14)}${esc(gr.t)} <i>${gr.xs.length}</i></small><ul>${gr.xs.map(x => `<li class="${x.od ? 'od' : ''}"><span class="cs74-b" aria-hidden="true"></span><div><b>${esc(x.n)}</b>${x.d ? `<small>${esc(x.d)}${x.od ? ', overdue' : ''}</small>` : ''}</div></li>`).join('')}</ul></div>`).join('')}</div></td></tr>` : ''); };
  return trBar() + oph('Client system updates', 'Dynamics, Shareworks and PAS Hub are updated by hand. Each line shows what is still pending; mark it as updated once it is done in the client’s system.') + visNote()
    + `<div class="cstats ov-k m59-k">${k}</div>` + bar
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t cs74-t"><thead><tr><th>Property</th><th>System and step</th><th>Pending</th><th><span class="sr">Next step</span></th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="4">${empty(all.length ? 'Nothing matches the search or the filters.' : 'All client systems are up to date.')}</td></tr>`}</tbody></table></div></section>`; };
A.csX74 = el => { S.f.csx = S.f.csx === el.dataset.v ? null : el.dataset.v; re57(); };
A.csSy74 = el => { S.f.cssy = el.closest('.stat') && S.f.cssy === el.dataset.v ? '' : el.dataset.v; re57(); };
A.csSc74 = el => { S.f.cssc = el.dataset.v; re57(); };
A.csClr74 = () => { S.f.cssy = ''; S.f.cssc = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.23') v.url = 'https://claude.ai/artifact/JPE6UMVsV3CNb8BDE9279P'; } });
VERSIONS.push({v:'v5.24', date:TODAY, major:false, current:true, url:null, title:'Client system updates with pending items', sum:'Client system updates uses the new design. Each line shows how many items are pending and the first one; See all opens every pending item: the steps in the client system, what is missing to finish the phase, the handover pack and open tasks.', steps:[]});
