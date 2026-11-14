// Refyt · v5.27: With the client (survey pack y sistemas del cliente) en el nuevo diseño.
import {
  A, DB, S, TODAY, VERSIONS, VIEWS, csName, empty, esc, fbar57, ico, norm, oph, plural, ptOf, re57,
  scOf, stat, swap57, trBar, visNote
} from "../../index.js";
/* =================== v5.27: With the client (survey pack and client systems) in the new design, without charts =================== */
S.f.pkq = ''; S.f.pksy = ''; S.f.pkw = ''; S.f.pkc = '';
export const pkWho77 = p => p.csTodo ? 'us' : p.ph === 'C. Client approval' ? 'client' : 'checks';
export const PKW77 = {us:['Us', 'Us: update the client system', '#2563EB', 'ap'], client:['The client', 'Waiting on the client', '#7C3AED', 'pv'], checks:['Our checks', 'Our own checks first', '#059669', 'ok']};
export const pkAll77 = () => DB.pr.filter(p => ['B. Assess and design', 'C. Client approval'].includes(p.ph));
export const pkRows77 = () => { const q = norm(S.f.pkq); return pkAll77().filter(p => (!S.f.pksy || ptOf(p).sys === S.f.pksy) && (!S.f.pkw || pkWho77(p) === S.f.pkw) && (!S.f.pkc || p.sc === S.f.pkc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${p.ref} ${scOf(p.sc).n} ${ptOf(p).sys}`).includes(q))); };
VIEWS.ret.pages.pk = function pkPage77(){ const all = pkAll77(), xs = pkRows77(), c = patch => swap57(patch, () => pkRows77().length), syss = [...new Set(all.map(p => ptOf(p).sys))], scs = [...new Set(all.map(p => p.sc))], n = w => all.filter(p => pkWho77(p) === w).length;
  const k = [stat('tk', 'With the client', all.length, 'properties in phases B and C'), stat(n('us') ? 'tred' : 'tg', 'Waiting on us', n('us'), n('us') ? 'update the client system' : 'nothing to update', 'pkW77', 'us', S.f.pkw === 'us'), stat('tb', 'Waiting on the client', n('client'), 'approval in their system', 'pkW77', 'client', S.f.pkw === 'client'), stat('tg', 'Our checks', n('checks'), 'still in phase B', 'pkW77', 'checks', S.f.pkw === 'checks')].join('');
  const bar = fbar57({id:'pk', qk:'f', qv:['pkq'], ph:'Search a property, postcode or reference', nf:(S.f.pksy ? 1 : 0) + (S.f.pkw ? 1 : 0) + (S.f.pkc ? 1 : 0), clr:'pkClr77', count:plural(xs.length, 'property', 'properties'),
    cols:[{t:'Next step depends on', opts:[{a:'pkW77', v:'', n:'Anyone', c:c({pkw:''}), on:!S.f.pkw}, ...Object.entries(PKW77).map(([v, [nm]]) => ({a:'pkW77', v, n:nm, c:c({pkw:v}), on:S.f.pkw === v}))]},
      {t:'Client system', opts:[{a:'pkSy77', v:'', n:'All systems', c:c({pksy:''}), on:!S.f.pksy}, ...syss.map(s => ({a:'pkSy77', v:s, n:s, c:c({pksy:s}), on:S.f.pksy === s}))]},
      {t:'Scheme', opts:[{a:'pkC77', v:'', n:'All schemes', c:c({pkc:''}), on:!S.f.pkc}, ...scs.map(id => ({a:'pkC77', v:id, n:scOf(id).n, c:c({pkc:id}), on:S.f.pkc === id}))]}],
    chips:[...(S.f.pkw ? [['pkW77', '', PKW77[S.f.pkw][0]]] : []), ...(S.f.pksy ? [['pkSy77', '', S.f.pksy]] : []), ...(S.f.pkc ? [['pkC77', '', scOf(S.f.pkc).n]] : [])]});
  const tick = (on, col) => on ? `<span class="pk77-t" style="background:${col}">${ico('check', 12, 3)}</span>` : '<span class="pk77-n">–</span>';
  const row = p => { const pt = ptOf(p), w = pkWho77(p), [wn, wd, wc, wp] = PKW77[w];
    const act = w === 'us' ? `<button type="button" class="rd56-tlb on" data-act="csDone" data-v="${p.id}">${ico('check', 14, 2.4)}Mark as updated</button>` : w === 'client' ? `<button type="button" class="rd56-tlb" data-act="csStep" data-v="${p.id}">Next status${ico('chev', 12, 2.4)}</button>` : '';
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="ficha" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(p.pc || '')}, ${esc(scOf(p.sc).n)}</small></td><td><span class="cs75-sys">${ico('globe', 13)}${esc(pt.sys)}</span></td><td><span class="rd55-p ${wp}">${esc(csName(p))}</span><small class="pk77-s">Step ${(p.cs || 0) + 1} of ${pt.st.length}</small></td><td class="pk77-w"><b style="color:${wc}">${wn}</b>${w === 'us' ? `<small>${esc(p.csTodo)}</small>` : `<small>${wd}</small>`}</td><td>${tick(w === 'us', PKW77.us[2])}</td><td>${tick(w === 'client', PKW77.client[2])}</td><td>${tick(w === 'checks', PKW77.checks[2])}</td><td class="pk77-a">${act}<button type="button" class="pk77-o" data-act="ficha" data-v="${p.id}" aria-label="Open ${esc(p.ad)}">${ico('chev', 14, 2.4)}</button></td></tr>`; };
  return trBar() + oph('Survey pack and client systems', 'Properties in phases B and C: where each survey pack stands in the client’s own system (Dynamics, Shareworks or PAS Hub) and who the next step depends on.') + visNote()
    + `<div class="cstats ov-k m59-k">${k}</div>` + bar
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t pk77-tb"><thead><tr><th>Property</th><th>Client system</th><th>Client status</th><th>Next step depends on</th><th>Us: update</th><th>The client</th><th>Our checks</th><th><span class="sr">Next step</span></th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="8">${empty(all.length ? 'No property matches the search or the filters.' : 'No properties in phases B or C.')}</td></tr>`}</tbody></table></div></section>`; };
A.pkW77 = el => { S.f.pkw = el.closest('.stat') && S.f.pkw === el.dataset.v ? '' : el.dataset.v; re57(); };
A.pkSy77 = el => { S.f.pksy = el.dataset.v; re57(); };
A.pkC77 = el => { S.f.pkc = el.dataset.v; re57(); };
A.pkClr77 = () => { S.f.pksy = ''; S.f.pkw = ''; S.f.pkc = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.26') v.url = 'https://claude.ai/artifact/Ki6KS2a24WTqyyn8Cj96fC'; } });
VERSIONS.push({v:'v5.27', date:TODAY, major:false, current:true, url:null, title:'With the client in the new design', sum:'Survey pack and client systems shows key figures by who the next step depends on, the search bar with filters, and a table with client system, client status and step, who acts next with a tick per party, and Mark as updated or Next status.', steps:[]});
