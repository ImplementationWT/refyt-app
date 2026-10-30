// Refyt · Delivery: formularios de obra que se rellenan.
import logoUrl from "../../../assets/refyt-logo.png";
import {
  A, DB, IN, MEAS, RGROUPS, ROLES, S, TODAY, VERSIONS, addDays, area, auto, cbx, esc, fld, fmtDy, go,
  his, ico, mlab, mseg, oph, pill, plural, prOf, refocus, render, scOf, seg, toast, tyOf
} from "../../index.js";
export const SITEP = [['akr', 'Akram, site manager'], ['sub:Redbridge Render Co', 'Redbridge Render Co'], ['sub:Medway Electrical Ltd', 'Medway Electrical Ltd'], ['sub:Kent Scaffold Hire', 'Kent Scaffold Hire'], ['sub:Insulation Supplies Direct', 'Insulation Supplies Direct fitters']];
export const sfItems = p => tyOf(p) === 'Redbridge' ? RGROUPS.filter(([k]) => p.g[k] !== 'Not applicable').map(([k, n, , hp]) => ({key:'g:' + k, n, hp, st:p.g[k] === 'Complete' ? 'Completed' : ['In progress', 'Waiting on decision', 'Blocked'].includes(p.g[k]) ? p.g[k] : 'Not started'}))
  : p.ms.map(x => ({key:'m:' + x.m, n:MEAS[x.m].n, hp:'', st:x.ip >= 100 ? 'Completed' : x.ip > 0 ? 'In progress' : 'Not started'}));
export const SFT = {'Not started':'tk', 'In progress':'tb', 'Completed':'tg', 'Waiting on decision':'ta', 'Blocked':'tred'};
export function frmPage(){ const xs = DB.pr.filter(x => x.ph === 'E. Install'), p = prOf(S.f.mp && xs.some(x => x.id === S.f.mp) ? S.f.mp : xs[0].id), it = S.f.sfi && sfItems(p).find(i => i.key === S.f.sfi), rec = p.sfr || {};
  const list = () => `<div class="rf-ph-h"><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}${p.ht ? ', ' + p.ht : ''}</small></div><small class="rf-ph">Tap an item to record its progress</small>${sfItems(p).map(i => { const r = rec[i.key]; return `<button class="rf-dl rf-tap${i.st === 'Completed' ? ' ok' : ''}" data-act="sfOpen" data-v="${i.key}"><span class="rf-ck">${i.st === 'Completed' ? ico('check', 14, 2.6) : ''}</span><div><b>${i.n}${i.hp ? ' <em class="rf-ap">hold point</em>' : ''}</b><small>${r ? `${r.st}, ${fmtDy(r.on)}, ${r.whoN}, ${plural(r.ph.length, 'photo', 'photos')}` : i.hp || 'Not recorded yet'}</small></div>${pill(SFT[i.st] || 'tk', i.st)}</button>`; }).join('')}<button class="btn sec" style="width:100%;margin-top:8px" data-act="mFlag" data-v="${p.id}">${ico('flag', 15)}Flag a problem</button>`;
  const form = () => { const m = S.f.sff, ok = sfValid(it, m); return `<button class="lnk4" data-act="sfBack" style="margin-bottom:8px">${ico('chev', 12)} Back to the checklist</button><div class="rf-ph-h"><b>${it.n}</b><small>${esc(p.ad)}${it.hp ? `, hold point: ${it.hp}` : ''}</small></div>`
    + mlab('Status', true) + mseg('st', m.st, ['In progress', 'Completed']) + `<div class="rf-2">${fld('Date', 'sf', 'on', m.on, {type:'date', req:true})}${fld('Time', 'sf', 'h', m.h, {req:true, ph:'14:30'})}</div>`
    + cbx('Done by', 'sfwho', SITEP, m.who, 'sf', {req:true, ph:'Who did the work?'})
    + mlab('Photos, with location and time', m.st === 'Completed') + `<label class="btn sec el-up" style="width:100%;justify-content:center">${ico('camera', 15)}${m.ph.length ? 'Add more photos' : 'Take or upload photos'}<input type="file" accept="image/*" multiple data-in="sfPh"></label>${m.ph.map(f => `<small class="mini" style="display:block">${esc(f)}</small>`).join('')}`
    + (it.hp && m.st === 'Completed' ? cbx('Inspected by', 'sfins', [['MDA', 'MDA structural engineers'], ['EWI Pro', 'EWI Pro'], ['Cotality', 'Cotality'], ['IAA', 'IAA']], m.ins, 'sf', {req:true, ph:'Who inspected?'}) + mlab('Inspection result', true) + mseg('res', m.res, ['Pass', 'Fail']) : '')
    + (m.st === 'Completed' ? `<button type="button" class="rf-cons${m.qc ? ' on' : ''}" data-act="sfQc"><span class="rf-ck">${m.qc ? ico('check', 14, 2.6) : ''}</span>Quality check done, work matches the design <em class="req">required</em></button>` : '')
    + area(m.res === 'Fail' ? 'What failed and what is needed' : 'Notes', 'sf', 'notes', m.notes, m.res === 'Fail' ? 'e.g. Pull-out test failed on the rear elevation' : 'Optional', m.res === 'Fail')
    + `<button class="btn pri" style="width:100%;margin-top:10px" data-act="sfOk" ${ok ? '' : 'disabled'}>${m.st === 'Completed' ? 'Mark completed' : 'Save progress'}</button>${ok ? '' : `<small class="mini" style="display:block;text-align:center;margin-top:6px">${sfMissing(it, m)}</small>`}`; };
  return oph('Site forms', 'What a site team or subcontractor sees on the phone. No account needed. Each item is recorded with who did it, when, photos with location and time, and the quality check.') + `<div class="rf-bar">${seg('mp', p.id, xs.map(x => [x.id, x.ad]))}</div><div class="rf-phone">${it && S.f.sff ? form() : list()}</div>`; }
export const sfMissing = (it, m) => { const x = []; if(!m.st) x.push('status'); if(!m.on || !(m.h || '').trim()) x.push('date and time'); if(!m.who) x.push('who did it'); if(m.st === 'Completed'){ if(!m.ph.length) x.push('photos'); if(!m.qc) x.push('quality check'); if(it.hp && (!m.ins || !m.res)) x.push('inspection'); } if(m.res === 'Fail' && !(m.notes || '').trim()) x.push('what failed'); return x.length ? 'Missing: ' + x.join(', ') : ''; };
export const sfValid = (it, m) => !sfMissing(it, m);
A.sfOpen = el => { const p = prOf(S.f.mp || DB.pr.find(x => x.ph === 'E. Install').id), r = (p.sfr || {})[el.dataset.v]; S.f.sfi = el.dataset.v; S.f.sff = {st:'', on:TODAY, h:'', who:r ? r.who : 'akr', ph:[], ins:'', res:'', qc:false, notes:''}; render(); };
A.sfBack = () => { S.f.sfi = null; S.f.sff = null; render(); };
A.mp = el => { S.f.mp = el.dataset.v; S.f.sfi = null; S.f.sff = null; render(); };
IN.sf = t => { const k = t.dataset.k; S.f.sff[{sfwho:'who', sfins:'ins'}[k] || k] = t.value; if(t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'hidden')) refocus(render); else render(); };
IN.sfPh = t => { const fs = [...(t.files || [])].map(f => `${f.name}, ${fmtDy(S.f.sff.on || TODAY)} ${S.f.sff.h || '10:42'}, 51.59 N 0.08 E`); S.f.sff.ph.push(...fs); render(); };
A.sfQc = () => { S.f.sff.qc = !S.f.sff.qc; render(); };
export const oMset2 = A.mset; A.mset = el => { if(S.f.sff && !S.modal && ['st', 'res'].includes(el.dataset.k)){ S.f.sff[el.dataset.k] = el.dataset.v; render(); return; } oMset2(el); };
A.sfOk = () => { const p = prOf(S.f.mp || DB.pr.find(x => x.ph === 'E. Install').id), key = S.f.sfi, m = S.f.sff, it = sfItems(p).find(i => i.key === key), whoN = (SITEP.find(x => x[0] === m.who) || ['', m.who])[1]; if(!sfValid(it, m)) return;
  p.sfr = p.sfr || {}; p.sfr[key] = {...m, whoN, ph:[...m.ph]}; const [kind, k] = key.split(':'); let msg = '';
  if(kind === 'g'){ if(m.st === 'Completed' && it.hp && m.res === 'Fail'){ p.g[k] = 'Blocked'; p.hold2 = `${it.n}: ${m.notes.trim()}`; DB.tk.push({id:'TK-' + (++DB.seq.tk), t:`Hold point failed: ${it.n}, ${p.ad}`, desc:m.notes.trim(), who:ROLES.inc[1], r:'inc', due:addDays(TODAY, 2), src:'Job', pr:p.id, done:false, doneOn:null}); msg = 'set the group to Blocked and created a task for the Install coordinator'; }
    else if(m.st === 'Completed'){ p.g[k] = 'Complete'; if(it.hp){ p.hold = null; p.hold2 = null; msg = 'unlocked the next group and notified the site team'; } }
    else p.g[k] = 'In progress'; }
  else { const x = p.ms.find(y => y.m === k); x.ip = m.st === 'Completed' ? 100 : Math.max(x.ip, 50); }
  his(p, `${it.n}: ${m.st.toLowerCase()} by ${whoN} on ${fmtDy(m.on)} at ${m.h}, ${plural(m.ph.length, 'photo', 'photos')}${m.ins ? `, inspected by ${m.ins}: ${m.res.toLowerCase()}` : ''}${m.notes ? `. ${m.notes.trim()}` : ''}`, 'akr');
  S.f.sfi = null; S.f.sff = null; if(msg) auto(p, 'del', msg); else { render(); toast(`${it.n} ${m.st === 'Completed' ? 'completed' : 'saved as in progress'}. It shows in Delivery straight away.`); } };
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/HPXKHUd23AWNsvJk9hZPGA'; } });
VERSIONS.push({v:'v3.9', date:TODAY, major:false, current:true, url:null, title:'Site forms you can fill in', sum:'Each item of the site form opens a short form on the phone: status, date and time, who did it, photos with location and time, the quality check and, on hold points, the inspector and the result.', steps:[
  {t:'Completing an item from the phone', min:.5, dolor:'Before, the site form could not be tapped.', show:['Tap a group or measure: status, date, who, photos, quality check.', 'Hold points ask for the inspector and the result; a fail blocks the group and creates the Install coordinator’s task.'], say:'Nothing is ticked without its evidence.', go:() => { S.role = 'sit'; S.f.mp = 'PR-2019'; S.f.sfi = null; go('del', 'site'); }},
]});

export const LOGO = logoUrl;
