// Refyt · v3.25: app Director, cambios de la revisión con Yahaya (4 de noviembre).
// Copia del original ("Refyt, demo v3.27.html"), con el mismo código.
import {
  $, A, CTYPES, DB, DD, IN, LIMIT, ME, MODALS, OPENP, PEO, PTYPE, RN, ROLES, S, TODAY, VERSIONS,
  VIEWS, addDays, approvals, area, av, cell, dDiff, daysIn, empty, esc, fPr, fSc, fk, fld, fm,
  fmtDy, go, his, holdOpen, ico, isBlocked, late, m2tm, mfoot, modal, mtOf, numIn, nx, ovEmpty,
  ovRow, pIdx, pMoney, pc, pill, plural, prOf, prsOf, rdiv, render, renderLayer, scMoney, scOf,
  seg, spend, sum, th, tm2m, toast, wrapAlerts, wrapRender, wrapScFicha
} from "../../index.js";
/* =================== v3.25: Director app, feedback from the review with Yahaya (Nov 4) =================== */
/* Only the Director app. Integrations (Xero, Microsoft 365, Read AI, Fellow, email) and the parts that need
   information from REFYT (stages per contract, payment terms per contract, compliance measures) are left out. */
export const PDAYS = {'4w':28, q:91, y:365}, PLBL = {'4w':'last 4 weeks', q:'last quarter', y:'last 12 months'};
export const inPer = d => d && dDiff(d) >= -PDAYS[DD().dr] && dDiff(d) <= 0;
export const pName = k => PEO[k] ? PEO[k].n : '';
export const roleP = r => ROLES[r] && PEO[ROLES[r][1]] ? PEO[ROLES[r][1]].n : RN(r);
export const PAL = ['#105666', '#839958', '#D3968C', '#0A3323', '#7FA8B1', '#B9C78F', '#E6BDB5', '#64748B'];
export function donut(segs, center, sub){ const tot = sum(segs, s => s.v) || 1, R = 46, C = 2 * Math.PI * R; let off = 0;
  const arcs = segs.filter(s => s.v > 0).map((s, i) => { const l = s.v / tot * C, a = `<circle r="${R}" cx="60" cy="60" fill="none" stroke="${s.c || PAL[i % PAL.length]}" stroke-width="18" stroke-dasharray="${l} ${C - l}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"></circle>`; off += l; return a; }).join('');
  return `<div class="dz"><svg viewBox="0 0 120 120" width="132" height="132" role="img" aria-label="${esc(center)}"><circle r="${R}" cx="60" cy="60" fill="none" stroke="var(--line)" stroke-width="18"></circle>${arcs}<text x="60" y="58" text-anchor="middle" class="dz-c">${center}</text><text x="60" y="74" text-anchor="middle" class="dz-s">${sub || ''}</text></svg><div class="dz-l">${segs.filter(s => s.v > 0).map((s, i) => `<${s.act ? `button data-act="${s.act}" data-v="${esc(s.v2 || '')}"` : 'div'} class="dz-i"><i style="background:${s.c || PAL[i % PAL.length]}"></i><span>${esc(s.l)}</span><b>${s.f ? s.f(s.v) : s.v}</b></${s.act ? 'button' : 'div'}>`).join('')}</div></div>`; }
export const hbar = (l, v, mx, f, sub, act, av, tone) => `<${act ? `button data-act="${act}" data-v="${esc(av || '')}"` : 'div'} class="hb"><span class="hb-l"><b>${esc(l)}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="hb-t"><i class="${tone || ''}" style="width:${mx ? Math.max(2, v / mx * 100) : 0}%"></i></span><span class="hb-v">${f ? f(v) : v}</span></${act ? 'button' : 'div'}>`;

/* ---------- 1. My tasks: meeting action points, follow ups, done tasks cleared after 14 days ---------- */
export const TK_KEEP = 14, tkArch = k => k.done && k.doneOn && dDiff(k.doneOn) < -TK_KEEP;
DB.tk.forEach(k => { if(!k.by){ const m = k.src && mtOf(k.src); if(m && m.who.includes('yah') && k.who !== 'yah') k.by = 'yah'; } });
{ const o = A.tkOk5; A.tkOk5 = el => { const n = DB.tk.length; o(el); if(DB.tk.length > n) DB.tk[DB.tk.length - 1].by = ME(); }; }
A.tsrc = el => { S.f.tsrc = el.dataset.v; render(); };
{ const f = VIEWS.dir.pages.tasks; VIEWS.dir.pages.tasks = (...x) => { const all = DB.tk, src = S.f.tsrc || '', isMt = k => !!(k.src && mtOf(k.src));
    const keep = all.filter(k => !tkArch(k) && (!src || (src === 'mt' ? isMt(k) : src === 'by' ? k.by === ME() && k.who !== ME() : !isMt(k))));
    DB.tk = keep; let h; try { h = f(...x); } finally { DB.tk = all; }
    const live = all.filter(k => !tkArch(k) && !k.done), segH = seg('tsrc', src, [['', 'All sources'], ['mt', 'Meeting action points', live.filter(isMt).length], ['job', 'From jobs and added', live.filter(k => !isMt(k)).length], ['by', 'Assigned by me', live.filter(k => k.by === ME() && k.who !== ME()).length]]);
    h = h.replace('<div class="rf-bar">', `<div class="rf-bar">${segH}`);
    return h.replace(/(<button class="rf-dtg"[\s\S]*?<\/button>)/, `$1<small class="tk-arch">Done tasks are cleared automatically ${TK_KEEP} days after they are completed.</small>`); }; }
/* Follow ups: tasks the Director gave to someone else that are due today or overdue */
wrapAlerts(a0 => () => { const xs = a0(); DB.tk.filter(k => !k.done && k.by && k.by !== k.who && dDiff(k.due) <= 0).forEach(k => { const od = -dDiff(k.due);
    xs.push({id:'fu' + k.id, app:'dir', tone:od ? 'tred' : 'ta', k:'Follow up', t:k.t, d:`You gave this to ${pName(k.who) || RN(k.r)}. ${od ? `${plural(od, 'day', 'days')} overdue` : 'Due today'}${k.pr ? `, ${prOf(k.pr).ad}` : ''}.`, fix:[`Remind ${(pName(k.who) || RN(k.r)).split(' ')[0]}`, 'tkNudge', k.id]}); }); return xs.filter(a => !S.dis[a.id]); });
A.tkNudge = el => { const k = DB.tk.find(x => x.id === el.dataset.v); k.nudged = TODAY; if(k.pr) his(prOf(k.pr), `Reminder sent to ${pName(k.who)}: ${k.t}`, ME()); S.dis['fu' + k.id] = {t:k.t, k:'Follow up', why:`reminder sent to ${pName(k.who) || RN(k.r)}`, on:TODAY, by:ME()}; render(); toast(`Reminder sent to ${esc(pName(k.who) || RN(k.r))}. It shows in their notifications.`); };

/* ---------- 2. Meetings: pick the time from a list, and edit a scheduled meeting ---------- */
export const SLOTS = Array.from({length:(20 - 7) * 4 + 1}, (_, i) => m2tm(7 * 60 + i * 15));
export const tsel = (lbl, k, v) => `<label class="tsel"><small>${lbl} <em class="req">required</em></small><select class="um-in" data-in="m" data-k="${k}"><option value="">Choose</option>${SLOTS.map(t => `<option value="${t}"${t === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
{ const o = MODALS.mt7; MODALS.mt7 = m => { let h = o(m);
    h = h.replace(/<label[^>]*>(?:(?!<\/label>)[\s\S])*?data-k="h"[\s\S]*?<\/label>/, tsel('Start', 'h', m.h)).replace(/<label[^>]*>(?:(?!<\/label>)[\s\S])*?data-k="end"[\s\S]*?<\/label>/, tsel('End', 'end', m.end));
    if(m.edit) h = h.replace('Schedule a meeting', 'Edit the meeting').replace('>Schedule<', '>Save changes<');
    return h; }; }
{ const o = IN.m; IN.m = t => { o(t); const m = S.modal; if(m && m.k === 'mt7' && t.dataset.k === 'h' && m.h && (!m.end || tm2m(m.end) <= tm2m(m.h))){ m.end = m2tm(Math.min(20 * 60, tm2m(m.h) + 60)); renderLayer(); } }; }
A.mtEdit = el => { const x = mtOf(el.dataset.v); S.modal = {k:'mt7', edit:x.id, ty:x.ty, name:x.name || '', d:x.d, h:x.h, end:m2tm(tm2m(x.h) + (x.dur || 60)), who:[...x.who], ag:x.ag || ''}; renderLayer(); };
{ const o = A.mtOk7; A.mtOk7 = el => { const m = S.modal; if(!m || !m.edit) return o(el); const x = mtOf(m.edit);
    Object.assign(x, {ty:m.ty, d:m.d, h:m.h, dur:Math.max(15, tm2m(m.end) - tm2m(m.h)), who:[...m.who], ag:m.ag}); if(m.name) x.name = m.name; S.modal = null; render(); toast(`Meeting updated: ${fmtDy(x.d)}, ${x.h} to ${m.end}. Everyone invited sees the change.`); }; }
{ const f = VIEWS.dir.pages.mtg; VIEWS.dir.pages.mtg = (...x) => { const h = f(...x), m = S.f.mtd && mtOf(S.f.mtd); if(!m || m.d < TODAY) return h;
    return h.replace(/(<div class="crumb">[\s\S]*?<\/div>)/, `$1<div class="mt-ed">${nx('mtEdit', m.id, 'Edit date, time and attendees', 'sec')}</div>`); }; }

/* ---------- 3. Approvals: the full detail, and a conversation kept on the property ---------- */
DB.apth = DB.apth || {};
export const apObj = a => a.o || (a.ref && (DB.sp.find(s => s.id === a.ref) || DB.va.find(v => v.id === a.ref))) || null;
export const apDoc = a => { if(a.ok !== 'docOk') return null; const [, n] = a.ref.split('|'), d = a.p.b.dx[n]; return d && d.v[d.v.length - 1]; };
export const apBy = a => { const o = apObj(a), d = apDoc(a); return (o && o.by) || (d && d.by) || (a.ok === 'arOk' ? (a.p.b.visit && a.p.b.visit.by) || a.p.b.who : a.ok === 'drOk' ? 'ahm' : null) || (a.p ? scOf(a.p.sc).lead : null); };
export const apSince = a => { const o = apObj(a), d = apDoc(a), t0 = (DB.apth[a.id] || []).find(x => x.act === 'Requested'); return (t0 && t0.on) || (o && o.on) || (d && d.on) || (a.p && a.p.b.visit && a.ok === 'arOk' && a.p.b.visit.on) || (a.p && a.p.phOn) || TODAY; };
export const apKey = a => a.ref || (a.o ? a.o.id : a.p.id);
export const apTh = id => DB.apth[id] || (DB.apth[id] = []);
export const apLog = (a, act, t) => { apTh(a.id).push({by:ME(), on:TODAY, act, t:t || ''}); if(a.p){ a.p.th = a.p.th || []; const to = apBy(a); a.p.th.push({by:ME(), on:TODAY, t:`${act}: ${a.k}, ${a.t}.${t ? ' ' + t : ''}`, to:to && to !== ME() ? [to] : [], from:'Approval: ' + a.k}); } };
['arOk', 'drOk', 'orOk', 'spOk', 'vaOk', 'docOk', 'arNo', 'drNo', 'orNo', 'spNo', 'vaNo', 'docNo'].forEach(n => { const o = A[n]; if(!o) return;
  A[n] = (el, why) => { const v = el.dataset.v, a = approvals().find(x => (x.ok === n || x.no === n) && apKey(x) === v); o(el, why); if(a) apLog(a, a.ok === n ? 'Approved' : 'Rejected', why); }; });
/* Seed: one conversation already running, so the history shows from day one */
{ const a = approvals().find(x => x.k === 'Material order' && x.role === 'dir'); if(a && !DB.apth[a.id]){ const by = apBy(a) || 'dre'; DB.apth[a.id] = [{by, on:addDays(TODAY, -2), act:'Requested', t:'Scaffold needed for the full rear elevation; the quote includes two weeks of hire.'}, {by:'tom', on:addDays(TODAY, -1), act:'Comment', t:'Rate is in line with the last two Kent jobs.'}]; } }
A.apView = el => { S.modal = {k:'apv', id:el.dataset.v, note:''}; renderLayer(); };
A.apReply = () => { const m = S.modal, a = approvals().find(x => x.id === m.id); if(!a || !m.note.trim()) return; apLog(a, 'Comment', m.note.trim()); m.note = ''; renderLayer(); toast(`Reply sent to ${esc(pName(apBy(a)) || 'the requester')}. It is also on the property’s updates.`); };
A.apYes = () => { const m = S.modal, a = approvals().find(x => x.id === m.id); if(!a) return; const note = m.note.trim(); if(note) apLog(a, 'Comment', note); S.modal = null; A[a.ok]({dataset:{v:apKey(a)}}); render(); };
A.apRej = () => { const m = S.modal, a = approvals().find(x => x.id === m.id); if(!a || !m.note.trim()) return; S.modal = null; A[a.no]({dataset:{v:apKey(a)}}, m.note.trim()); render(); };
MODALS.apv = m => { const a = approvals().find(x => x.id === m.id), th = DB.apth[m.id] || [];
  if(!a) return modal('Approval', 'This item has already been decided.', th.map(apMsg).join('') || empty('No conversation.'), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 620);
  const by = apBy(a), since = apSince(a), days = -dDiff(since), sc = a.p ? scOf(a.p.sc) : null;
  const grid = `<div class="apv-g">${[['What', a.k], ['Property', a.p ? `<button class="lnk4" data-act="prOpen" data-v="${a.p.id}|upd">${esc(a.p.ad)}</button>` : 'Several properties'], ['Scheme and client', sc ? `${esc(sc.n)}, ${esc(sc.cl)}` : ''], ['Requested by', by ? `${pName(by)}<small>${PEO[by].r}</small>` : ''], ['Waiting since', `${fmtDy(since)}<small>${days ? plural(days, 'day', 'days') : 'today'}</small>`], ['Approver', `${roleP(a.role)}<small>${RN(a.role)}${a.role === 'dir' ? ', above the scheme limit' : ''}</small>`], ...(a.amt ? [['Amount', fm(a.amt)]] : [])].map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div><p class="apv-d">${esc(a.d)}</p>`;
  const conv = `<div class="apv-h"><b>Conversation</b><small>Kept on the property’s updates, with every approval and rejection.</small></div>${th.length ? th.map(apMsg).join('') : `<p class="hint">No messages yet. Ask a question or add context; ${esc(pName(by) || 'the requester')} is notified.</p>`}`;
  return modal(a.t, `${a.k}, waiting for ${roleP(a.role)}.`, grid + conv + area('Your message', 'm', 'note', m.note, 'Ask a question, or give the reason if you reject'),
    `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="apReply" ${m.note.trim() ? '' : 'disabled'}>Reply</button><button class="btn sec lg" data-act="apRej" ${m.note.trim() ? '' : 'disabled title="Write the reason first"'}>Reject with this message</button><button class="btn pri lg" data-act="apYes">Approve</button></div>`, 700); };
export const apMsg = x => `<div class="apv-m ${x.act === 'Approved' ? 'ok' : x.act === 'Rejected' ? 'no' : ''}">${av(x.by, 26)}<div><div><b>${pName(x.by)}</b><small>${fmtDy(x.on)}${x.act !== 'Comment' ? ', ' + x.act.toLowerCase() : ''}</small></div>${x.t ? `<p>${esc(x.t)}</p>` : ''}</div></div>`;
{ const f = VIEWS.dir.pages.wait; VIEWS.dir.pages.wait = (...x) => f(...x).replace(/data-hl="([^"]+)"([\s\S]*?)<div class="ds-exb">/g, (s, id, mid) => `data-hl="${id}"${mid}<div class="ds-exb"><button class="btn sec sm" data-act="apView" data-v="${id}">${ico('eye', 14)}Details and conversation${(DB.apth[id] || []).length ? ` (${DB.apth[id].length})` : ''}</button>`); }

/* ---------- 4. Schemes: the target of properties, easy to change, with the change logged ---------- */
A.tgtOpen = el => { const s = scOf(el.dataset.v); S.modal = {k:'tgt', id:s.id, v:String(s.tgt)}; renderLayer(); };
MODALS.tgt = m => { const s = scOf(m.id), n = numIn(m.v); return modal(`Target properties, ${s.n}`, 'The number of properties in the contract. It changes during the contract; every change is logged in the scheme settings.', fld('Target', 'm', 'v', m.v, {type:'number', req:true}) + `<p class="hint">Now ${s.tgt}. Completed so far: ${prsOf(s.id).filter(p => pIdx(p.ph) >= 5 && p.ph !== 'Cancelled').length}.</p>`, mfoot('Save', 'tgtOk', n > 0 && n !== s.tgt), 520); };
A.tgtOk = () => { const m = S.modal, s = scOf(m.id), n = numIn(m.v), old = s.tgt; s.tgt = n; s.log.push([TODAY, ME(), 'Target properties', old, n]); S.modal = null; render(); toast(`${esc(s.n)}: target changed from ${old} to ${n} properties. Logged in Scheme settings.`); };
{ const f = VIEWS.dir.pages.sset; if(f) VIEWS.dir.pages.sset = (...x) => { let i = 0; return f(...x).replace('<th>Scheme</th>', '<th>Scheme</th><th>Target properties</th>').replace(/(<tr><td><b>[\s\S]*?<\/td>)/g, (s0, c) => { const s = DB.sc[i++]; return s ? `${c}<td><button class="tgt-b" data-act="tgtOpen" data-v="${s.id}">${s.tgt}${ico('edit', 13)}</button></td>` : c; }); }; }

wrapScFicha(o => (app, s) => { const h = o(app, s); return ['dir', 'com'].includes(app) ? h.replace(/<div class="stat ([^"]*)"><small>Properties<\/small><b>(\d+) of (\d+)<\/b>([\s\S]*?)<\/div>/, `<button class="stat sbtn $1" data-act="tgtOpen" data-v="${s.id}" title="Change the target"><small>Properties</small><b>$2 of $3</b><span class="ss">target, click to change</span></button>`) : h; });

/* ---------- 5. Settings move from the menu to the header ---------- */
export let SETIT = [];
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => { const h = o(), i = h.indexOf('<div class="sb-sec">Settings</div>'); if(i < 0) return h; const j = h.indexOf('<div class="sb-sec">', i + 10), sec = h.slice(i, j < 0 ? h.indexOf('</aside>') : j);
    SETIT = [...sec.matchAll(/data-v="([^"]+)"[^>]*>(?:<span class="ni">[\s\S]*?<\/span>)?(?:<span class="nl">)?([^<]+)/g)].map(x => [x[1], x[2].trim()]);
    return window.innerWidth > 620 ? h.replace(sec, '') : h; }; }
A.setPop = () => { S.setPop = !S.setPop; drawSetPop(); };
export function drawSetPop(){ let el = document.getElementById('setpop'); if(!el){ el = document.createElement('div'); el.id = 'setpop'; document.body.appendChild(el); }
  const b = document.querySelector('[data-act="setPop"]'); if(!S.setPop || !b){ el.innerHTML = ''; return; } const r = b.getBoundingClientRect();
  el.innerHTML = `<div class="rf-pop set-pop" style="top:${r.bottom + 6}px;right:${Math.max(8, window.innerWidth - r.right)}px"><small class="rf-ph">Settings</small>${SETIT.map(([k, n]) => `<button class="rf-pi${S.view === 'dir' && S.page.dir === k ? ' on' : ''}" data-act="setGo" data-v="${k}"><b>${esc(n)}</b></button>`).join('')}</div>`; }
A.setGo = el => { S.setPop = false; drawSetPop(); S.trail = null; go('dir', el.dataset.v); };
document.addEventListener('click', e => { if(S.setPop && !e.target.closest('.set-pop') && !e.target.closest('[data-act="setPop"]')){ S.setPop = false; drawSetPop(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.setPop){ S.setPop = false; drawSetPop(); } });
wrapRender(r1 => (...x) => { r1(...x); const t = $('#tools'); if(t && S.view === 'dir' && window.innerWidth > 620 && SETIT.length){ const on = SETIT.some(([k]) => k === S.page.dir); t.insertAdjacentHTML('afterbegin', `<button class="rf-hb${on ? ' on' : ''}" data-act="setPop" title="Settings" aria-label="Settings">${ico('cog', 16)}</button>`); } drawSetPop(); });
{ let w0 = window.innerWidth; window.addEventListener('resize', () => { const w = window.innerWidth; if((w0 > 620) !== (w > 620)) render(); w0 = w; }); }

/* ---------- 6. Commercial progress: a snapshot per scheme, and where the money goes ---------- */
A.pgDr = el => { S.f.d.dr = el.dataset.v; render(); };
{ const f = VIEWS.dir.pages.pcom; VIEWS.dir.pages.pcom = (...x) => { const h = f(...x), ss = fSc(), rows = ss.map(s => { const ps = prsOf(s.id).filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled'), q = sum(ps, p => pMoney(p).q), fc = sum(ps, p => pMoney(p).fc), mg = q ? (q - fc) / q * 100 : null; return {s, q, fc, mg}; }).filter(r => r.q);
    const st = r => r.mg < r.s.set.mg ? ['tred', 'Below target'] : r.mg >= r.s.set.mg + 5 ? ['tg', 'Above target'] : ['tb', 'On track'];
    const snap = `<section class="ov-card ov-wide pg-snap"><div class="ov-h"><div><h3>Snapshot per scheme</h3><p>Revenue, cost and margin of the approved work in each scheme. Open a scheme to drill down.</p></div></div><div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Scheme</th><th>Revenue</th><th>Forecast cost</th><th>Margin</th><th>Target</th><th>Status</th></tr></thead><tbody>${rows.map(r => `<tr><td><button class="lnk4" data-act="ficha" data-v="${r.s.id}"><b>${esc(r.s.n)}</b></button><small class="mini" style="display:block">${esc(r.s.cl)}</small></td><td><b>${fm(r.q)}</b></td><td>${fm(r.fc)}</td><td><b>${pc(r.mg)}</b></td><td>${pc(r.s.set.mg)}</td><td>${pill(...st(r))}</td></tr>`).join('')}<tr class="tot"><td><b>All schemes</b></td><td><b>${fm(sum(rows, r => r.q))}</b></td><td><b>${fm(sum(rows, r => r.fc))}</b></td><td><b>${pc(sum(rows, r => r.q) ? (sum(rows, r => r.q) - sum(rows, r => r.fc)) / sum(rows, r => r.q) * 100 : 0)}</b></td><td></td><td></td></tr></tbody></table></div></div></section>`;
    const sp = CTYPES.map(c => [c, sum(DB.or.filter(o => o.st !== 'Rejected' && o.ct === c && inPer(o.on)), o => sum(o.al.filter(a => !a.pr || fPr(true).some(p => p.id === a.pr)), a => a.a)) + (c === 'Subcontract labour' ? sum(DB.sp.filter(s => s.st !== 'Rejected' && inPer(s.on) && fPr(true).some(p => p.id === s.pr)), s => s.amt) : 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    const mx = Math.max(1, ...sp.map(x => x[1]));
    const spend = `<section class="ov-card ov-wide"><div class="ov-h"><div><h3>Where the money goes, ${PLBL[DD().dr]}</h3><p>Orders and subcontractor payments by cost type, in the schemes selected above. Click a type to see the orders behind it.</p></div>${seg('pgDr', DD().dr, [['4w', '4 weeks'], ['q', 'Quarter'], ['y', '12 months']])}</div><div class="ov-b">${sp.length ? sp.map(([c, v]) => hbar(c, v, mx, fk, '', 'pgCt', c)).join('') : ovEmpty('No spend in this period.')}</div></section>`;
    const i = h.lastIndexOf('<div class="ov-g">'); return h.slice(0, i) + `<div class="ov-g pg-top">${snap}${spend}</div>` + h.slice(i); }; }
A.pgCt = el => { S.modal = {k:'ctl', c:el.dataset.v}; renderLayer(); };
MODALS.ctl = m => { const xs = DB.or.filter(o => o.st !== 'Rejected' && o.ct === m.c && inPer(o.on)).sort((a, b) => a.on < b.on ? 1 : -1), ys = m.c === 'Subcontract labour' ? DB.sp.filter(s => s.st !== 'Rejected' && inPer(s.on)) : [];
  return modal(`${m.c}, ${PLBL[DD().dr]}`, `${plural(xs.length + ys.length, 'line', 'lines')}, ${fm(sum(xs, o => o.amt) + sum(ys, s => s.amt))}.`, xs.map(o => rdiv(cell(`${o.id} ${esc(o.sup)}`, o.al.length > 1 ? `split across ${o.al.length} properties` : esc(prOf(o.al[0].pr).ad) + ', ' + scOf(prOf(o.al[0].pr).sc).n, 2.4) + cell(fm(o.amt), fmtDy(o.on)) + cell(pill('tk', o.st), ''))).join('') + ys.map(s => rdiv(cell(esc(s.sub), `${esc(prOf(s.pr).ad)}, ${esc(s.stage)}`, 2.4) + cell(fm(s.amt), fmtDy(s.on)) + cell(pill('tk', s.st), ''))).join('') || empty('Nothing in this period.'), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 760); };

/* ---------- 7. Business overview: each contract with its own stages, what is waiting and who it is waiting on ---------- */
export const stageOf = p => { const T = PTYPE[scOf(p.sc).ty]; return T ? T.st[Math.min(p.cs || 0, T.st.length - 1)] : p.ph; };
export function waitItems(){ const xs = [];
  approvals().forEach(a => { if(!a.p || !fPr().some(p => p.id === a.p.id)) return; xs.push({p:a.p, what:`${a.k} waiting for approval`, who:roleP(a.role), r:RN(a.role), d:-dDiff(apSince(a)), id:a.id, ap:true}); });
  fPr().filter(p => OPENP.includes(p.ph)).forEach(p => { if(p.ph === 'E. Install' && holdOpen(p)) xs.push({p, what:'Hold point open', who:'External inspector', r:scOf(p.sc).ty === 'Redbridge' ? 'MDA, EWI Pro or Cotality' : 'Client', d:daysIn(p)});
    else if(isBlocked(p)) xs.push({p, what:'Blocked', who:roleP('inc'), r:RN('inc'), d:daysIn(p)});
    else if(p.ph === 'C. Client approval') xs.push({p, what:'Waiting for the client to approve', who:scOf(p.sc).cl, r:'Client', d:daysIn(p)});
    else if(late(p) === 'red') xs.push({p, what:`Over the limit in ${p.ph.slice(3).toLowerCase()}`, who:pName(scOf(p.sc).lead), r:'Contract lead', d:daysIn(p)}); });
  return xs.sort((a, b) => b.d - a.d); }
{ const f = VIEWS.dir.pages.dbiz; VIEWS.dir.pages.dbiz = (...x) => { let h = f(...x); const ss = fSc(), ps = fPr().filter(p => OPENP.includes(p.ph)), wi = waitItems();
    h = h.replace('properties by phase, value won', 'value won, where the work is waiting');
    const won = ss.map((s, i) => ({l:s.n, v:scMoney(s).won, f:fk, act:'ficha', v2:s.id, c:PAL[i % PAL.length]}));
    const stg = `<section class="ov-card"><div class="ov-h"><div><h3>Open properties, each contract with its own stages</h3><p>Every scheme shows the stages of its own contract, so they are not forced into one list. Click a stage to see the properties.</p></div></div><div class="ov-b">${ss.map(s => { const xs = ps.filter(p => p.sc === s.id); if(!xs.length) return ''; const by = {}; xs.forEach(p => { const k = stageOf(p); by[k] = (by[k] || []).concat(p); }); const mx = Math.max(...Object.values(by).map(v => v.length));
      return `<div class="bz-s"><div class="bz-h"><button class="lnk4" data-act="ficha" data-v="${s.id}"><b>${esc(s.n)}</b></button><small>${plural(xs.length, 'open property', 'open properties')}, ${PTYPE[s.ty] ? PTYPE[s.ty].sys : ''}</small></div>${Object.entries(by).sort((x, y) => (PTYPE[s.ty] ? PTYPE[s.ty].st.indexOf(x[0]) - PTYPE[s.ty].st.indexOf(y[0]) : 0)).map(([k, v]) => hbar(k, v.length, mx, null, `avg ${Math.round(sum(v, daysIn) / v.length)} days here`, 'bzSt', `${s.id}|${k}`, v.some(p => late(p) === 'red') ? 'red' : v.some(p => late(p)) ? 'amb' : '')).join('')}</div>`; }).join('') || ovEmpty('No open properties.')}</div></section>`;
    const vw = `<section class="ov-card"><div class="ov-h"><div><h3>Value won per scheme</h3><p>Approved by clients, in the schemes selected above.</p></div></div><div class="ov-b">${donut(won, fk(sum(won, w => w.v)), 'value won')}</div></section>`;
    const wt = `<section class="ov-card ov-wide"><div class="ov-h"><div><h3>What is waiting, and who it is waiting on</h3><p>Approvals, hold points, blocks, client approvals and jobs over their limit, the longest wait first.</p></div></div><div class="ov-b">${wi.slice(0, 10).map(w => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${w.p.id}">${esc(w.p.ad)}</button>`, `${esc(scOf(w.p.sc).n)}. ${w.what}`, `<span class="ov-num">${esc(w.who)}<small>${esc(w.r)}</small></span>${pill(w.d > 14 ? 'tred' : w.d > 7 ? 'ta' : 'tk', w.d ? plural(w.d, 'day', 'days') : 'today')}`, w.ap ? `<button class="btn sec sm" data-act="apView" data-v="${w.id}">${ico('eye', 14)}Details</button>` : '')).join('') || ovEmpty('Nothing waiting.')}</div>${wi.length > 10 ? `<div class="ov-f"><small class="pg-n">and ${wi.length - 10} more</small></div>` : ''}</section>`;
    const a = h.indexOf('<div class="gh">Properties by phase, per scheme'), b = h.indexOf('<div class="gh">Compare schemes side by side');
    return a > 0 && b > a ? h.slice(0, a) + `<div class="ov-g bz-g">${stg.replace('<section class="ov-card">', '<section class="ov-card ov-wide">')}${vw}${wt.replace('ov-card ov-wide', 'ov-card')}</div>` + h.slice(b) : h; }; }
A.bzSt = el => { const [sid, k] = el.dataset.v.split('|'); S.modal = {k:'bzl', sid, st:k}; renderLayer(); };
MODALS.bzl = m => { const s = scOf(m.sid), xs = fPr().filter(p => p.sc === s.id && OPENP.includes(p.ph) && stageOf(p) === m.st).sort((a, b) => daysIn(b) - daysIn(a));
  return modal(`${s.n}: ${m.st}`, plural(xs.length, 'property', 'properties'), xs.map(p => `<div class="mbr um-row" data-act="prOpen" data-v="${p.id}" tabindex="0">${cell(esc(p.ad), p.ref, 2)}${cell(`${daysIn(p)} days`, `limit ${LIMIT[p.ph] || '-'}`)}${cell(late(p) ? pill(late(p) === 'red' ? 'tred' : 'ta', 'Over time') : pill('tg', 'On time'), '')}</div>`).join(''), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 640); };
{ const o = A.prOpen; A.prOpen = el => { if(S.modal && ['bzl', 'cxl', 'apv'].includes(S.modal.k)) S.modal = null; o(el); }; }

/* ---------- 8. Scheme performance: the list of cancellations and why; edit the target in place ---------- */
A.cxOpen = el => { S.modal = {k:'cxl', sid:el.dataset.v || ''}; renderLayer(); };
MODALS.cxl = m => { const xs = fPr(true).filter(p => p.ph === 'Cancelled' && (!m.sid || p.sc === m.sid)), by = {}; xs.forEach(p => { const w = (p.cancel && p.cancel.why) || 'No reason'; by[w] = (by[w] || 0) + 1; }); const mx = Math.max(1, ...Object.values(by));
  return modal(`Cancellations${m.sid ? ', ' + scOf(m.sid).n : ''}`, `${plural(xs.length, 'cancellation', 'cancellations')}. The reasons first, to spot a pattern; then each job.`, (xs.length ? `<div class="cx-r">${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([w, n]) => hbar(w, n, mx, null, '', '', '', 'red')).join('')}</div>` : '')
    + (xs.map(p => `<div class="mbr um-row" data-act="prOpen" data-v="${p.id}" tabindex="0">${cell(esc(p.ad), `${esc(scOf(p.sc).n)}, ${p.ref}`, 2)}${cell(esc((p.cancel && p.cancel.why) || ''), `at ${(p.cancel && p.cancel.at) || ''}`, 2)}${cell(fmtDy(p.phOn), p.cancel && p.cancel.abort ? 'abortive work invoiced' : 'no work done')}</div>`).join('') || empty('No cancellations.')), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 760); };
{ const f = VIEWS.dir.pages.dperf; VIEWS.dir.pages.dperf = (...x) => { let h = f(...x);
    h = h.replace(/<div class="stat ([^"]*)"><small>Cancellations<\/small>/, '<button class="stat sbtn $1" data-act="cxOpen" data-v=""><small>Cancellations</small>').replace(/(<button class="stat sbtn [^"]*" data-act="cxOpen"[\s\S]*?)<\/div>/, '$1</button>');
    const ss = fSc(); let i = 0, j = 0;
    h = h.replace(/(<td>)(\d+) of (\d+)(<\/td>)/g, (s0, a, d, t, b) => { const s = ss[i++]; return s ? `${a}${d} of <button class="tgt-b" data-act="tgtOpen" data-v="${s.id}" title="Change the target">${t}${ico('edit', 12)}</button>${b}` : s0; });
    return h; }; }

/* ---------- 9. Finance: spend with its period, by supplier, by cost type and by scheme ---------- */
{ const f = VIEWS.dir.pages.dfin; VIEWS.dir.pages.dfin = (...x) => { let h = f(...x); const ps = fPr(true), ss = fSc();
    const lines = DB.or.filter(o => o.st !== 'Rejected' && inPer(o.on)).flatMap(o => o.al.filter(a => a.pr && ps.some(p => p.id === a.pr)).map(a => ({sup:o.sup, ct:o.ct, sc:prOf(a.pr).sc, v:a.a})))
      .concat(DB.sp.filter(s => s.st !== 'Rejected' && inPer(s.on) && ps.some(p => p.id === s.pr)).map(s => ({sup:s.sub, ct:'Subcontract labour', sc:prOf(s.pr).sc, v:s.amt})));
    const agg = k => { const o = {}; lines.forEach(l => { o[l[k]] = (o[l[k]] || 0) + l.v; }); return Object.entries(o).sort((a, b) => b[1] - a[1]); };
    const sup = agg('sup'), ct = agg('ct'), mxs = Math.max(1, ...sup.map(x => x[1])), tot = sum(lines, l => l.v);
    const supB = `<div class="gh">Spend by supplier, ${PLBL[DD().dr]}<span>${sup.length}</span></div>${sup.map(([n, v]) => hbar(n, v, mxs, fk, '', 'dSup', n)).join('') || empty('No spend in this period.')}`;
    const ctB = `<div class="gh">Spend by cost type, ${PLBL[DD().dr]}<span>${ct.length}</span></div>${donut(ct.map(([n, v], i) => ({l:n, v, f:fk, act:'fdd', v2:'ct|' + n, c:PAL[i % PAL.length]})), fk(tot), PLBL[DD().dr])}`;
    const a1 = h.indexOf('<div class="gh">Spend by supplier'), b1 = h.indexOf('</div></div><div class="rf-g2">', a1);
    if(a1 > 0 && b1 > a1) h = h.slice(0, a1) + supB + h.slice(b1);
    const a2 = h.indexOf('<div class="gh">Spend by cost type'), b2 = h.indexOf('</div><div><div class="gh">Budget against actual', a2);
    if(a2 > 0 && b2 > a2) h = h.slice(0, a2) + ctB + h.slice(b2);
    const mt = `<section class="ov-card ov-wide fin-sc"><div class="ov-h"><div><h3>Spend by scheme and cost type, ${PLBL[DD().dr]}</h3><p>Which schemes, contracts and clients the money is going to.</p></div></div><div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Scheme and client</th>${CTYPES.map(c => `<th>${c}</th>`).join('')}<th>Total</th></tr></thead><tbody>${ss.map(s => { const ls = lines.filter(l => l.sc === s.id); return `<tr><td><button class="lnk4" data-act="ficha" data-v="${s.id}"><b>${esc(s.n)}</b></button><small class="mini" style="display:block">${esc(s.cl)}</small></td>${CTYPES.map(c => { const v = sum(ls.filter(l => l.ct === c), l => l.v); return `<td>${v ? fk(v) : '<b class="z">-</b>'}</td>`; }).join('')}<td><b>${fk(sum(ls, l => l.v))}</b></td></tr>`; }).join('')}</tbody></table></div></div></section>`;
    const c1 = h.indexOf('<div class="gh">Compare schemes side by side');
    h = c1 > 0 ? h.slice(0, c1) + mt + h.slice(c1) : h + mt;
    return h; }; }

/* ---------- 10. Capacity and staffing: a workload view per person, like Monday’s ---------- */
export const CAPH = {afa:37.5, xen:22.5, ahm:37.5, ram:37.5, dre:37.5, sar:30, akr:37.5, tom:37.5};
export const WLP = [['afa', 'Retrofit'], ['xen', 'Retrofit'], ['ram', 'Retrofit'], ['ahm', 'Retrofit'], ['sar', 'Retrofit'], ['dre', 'Delivery'], ['akr', 'Delivery'], ['tom', 'Commercial']];
export function wlHours(k, ps){ const A1 = ps.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph)), half = (xs, i) => xs.filter((p, j) => j % 2 === i);
  return {afa:sum(half(A1, 0), () => 7.5), xen:sum(half(A1, 1), () => 7.5), ram:approvals().filter(a => ['aap', 'dap'].includes(a.role)).length * 3 + A1.length * 1.5, ahm:sum(ps.filter(p => p.ph === 'B. Assess and design'), p => 4 * p.ms.length),
    sar:ps.filter(p => p.ph === 'A. Job received').length * 4 + 10, dre:ps.filter(p => ['D. Prepare to install', 'E. Install'].includes(p.ph)).length * 5 + 6, akr:sum(ps.filter(p => ['D. Prepare to install', 'E. Install'].includes(p.ph)), p => 4 * p.ms.length), tom:ps.filter(p => p.ph === 'C. Client approval').length * 3 + DB.va.length * 2}[k] || 0; }
A.capv = el => { S.f.capv = el.dataset.v; render(); };
{ const f = VIEWS.dir.pages.dcap; VIEWS.dir.pages.dcap = (...x) => { let h = f(...x); const ps = fPr(), mo = S.f.capv === 'month', cols = mo ? ['Nov', 'Dec', 'Jan'] : ['W45', 'W46', 'W47', 'W48'], shape = mo ? [1, .8, .55] : [1, .9, .75, .6];
    const ppl = WLP.filter(([k]) => !DD().per || k === DD().per);
    const cellH = (k, i) => { const w = wlHours(k, ps), c = CAPH[k] * (mo ? 4.33 : 1), l = Math.round(w * shape[i] * (mo ? 4.33 : 1)), p = Math.round(l / c * 100), tone = p > 100 ? 'red' : p > 85 ? 'amb' : p < 40 ? 'low' : 'ok';
      return `<td><div class="wl ${tone}" title="${pName(k)}: ${l}h of ${Math.round(c)}h"><span style="width:${Math.min(100, p)}%"></span><b>${l}h</b><small>${p}%</small></div></td>`; };
    const grid = `<div class="gh">Workload per person<span>${ppl.length}</span></div><div class="wl-bar">${seg('capv', mo ? 'month' : 'week', [['week', 'By week'], ['month', 'By month']])}<span class="wl-k"><i class="ok"></i>Room<i class="amb"></i>Nearly full<i class="red"></i>Over capacity<i class="low"></i>Free</span></div><div class="el-wide"><div class="rf-mx wl-t"><table><thead><tr><th>Person</th><th>Capacity</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${ppl.map(([k, t]) => `<tr><td><button class="lnk4" data-act="dPer" data-v="${k}"><b>${pName(k)}</b></button><small class="mini" style="display:block">${PEO[k].r === t ? t : `${PEO[k].r}, ${t}`}</small></td><td><b>${CAPH[k]}h</b><small class="mini" style="display:block">${CAPH[k] < 37.5 ? 'part time' : 'full time'}, a week</small></td>${cols.map((c, i) => cellH(k, i)).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    const a = h.indexOf('<div class="gh">Booked against weekly capacity'), b = h.indexOf('<div class="gh">Pipeline by team and trade');
    return a > 0 && b > a ? h.slice(0, a) + grid + h.slice(b) : h; }; }

/* ---------- 11. The eye on approvals in the Director Overview ---------- */
{ const f = VIEWS.dir.pages.ovw; VIEWS.dir.pages.ovw = (...x) => f(...x).replace(/<button class="btn pri sm" data-act="(\w+)" data-v="([^"]*)">Approve<\/button>/g, (s0, ok, v) => { const a = approvals().find(y => y.ok === ok && apKey(y) === v); return a ? `<button class="btn sec sm ov-eye" data-act="apView" data-v="${a.id}" title="Details and conversation" aria-label="Details and conversation">${ico('eye', 14)}</button>${s0}` : s0; }); }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/NcKJiSvM2gG5RJrWGwQDER'; } });
VERSIONS.push({v:'v3.25', date:TODAY, major:false, current:true, url:null, title:'Director app: feedback from the review with Yahaya', sum:'Approvals with full detail and a conversation kept on the property; follow ups on tasks you gave; meeting action points in My tasks; meetings you can edit; settings in the header; a per scheme snapshot and spend breakdown; contracts with their own stages; cancellations you can open; editable targets; a workload view.', steps:[
  {t:'Approvals: detail and conversation', min:1, dolor:'Before, approving was a button and a rejection a one way note.', show:['The eye on Overview and Details and conversation in Approvals open everything about the request: who asked, since when, the amount and the evidence.', 'Reply, approve or reject in the same place; every message stays on the property’s Updates.'], say:'Every approval has its history, on the property.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'wait'); }},
  {t:'My tasks: meeting action points and follow ups', min:.5, dolor:'Before, meeting actions mixed with job tasks, and you forgot what you had asked of others.', show:['Filter Meeting action points or Assigned by me.', 'Alerts shows the tasks you gave that are due today or overdue, with Remind.', 'Done tasks are cleared 14 days after they are completed.'], say:'One list, and nothing you asked for gets lost.', go:() => { S.role = 'dir'; S.trail = null; S.f.tsrc = 'mt'; go('dir', 'tasks'); }},
  {t:'Meetings you can edit', min:.5, dolor:'Before, the time was typed by hand and a scheduled meeting could not be changed.', show:['Start and end come from a list, in 15 minute steps.', 'Open an upcoming meeting and use Edit date, time and attendees.'], say:'Move a meeting in two clicks.', go:() => { S.role = 'dir'; S.trail = null; S.f.mtd = (DB.mt.find(m => m.d >= TODAY) || {}).id; go('dir', 'mtg'); }},
  {t:'Business overview and Scheme performance', min:1, dolor:'Before, every contract was forced into the same phases, and cancellations were just a number.', show:['Each scheme shows its own contract’s stages, and what is waiting and on whom.', 'Click Cancellations for the reasons and the jobs; click a target to change it.'], say:'The real stages of each contract, and the patterns behind the numbers.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dbiz'); }},
  {t:'Money and people, at a glance', min:1, dolor:'Before, spend had no period and capacity was a table of percentages.', show:['Commercial progress: snapshot per scheme and where the money goes.', 'Finance: spend by supplier, cost type and scheme, for the period chosen.', 'Capacity: a workload view per person, by week or month.'], say:'See it at a glance, then click into the detail.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'pcom'); }},
]});
