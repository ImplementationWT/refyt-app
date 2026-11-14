// Refyt · Piezas comunes de la interfaz.
import {
  $, APPN, APPT, GRAD, HOME, ME, MEAS, MON, PEO, PHS, S, TODAY, WHO, alerts, clamp, dDiff, daysIn, esc,
  fmtDy, fromIso, ico, ini, late, norm, pc, render, seenSet
} from "../index.js";
export const bd = n => n ? `<span class="bd">${n > 99 ? '99+' : n}</span>` : '';
export const sbItem = (cur, act) => ([k, n, ic, c, soft]) => k === '-' ? `<div class="sb-sec">${n}</div>` : `<button class="nav" data-act="${act}" data-v="${k}" aria-current="${cur === k}"><span class="ni">${ico(ic, 17)}</span>${n}${c ? `<span class="cnt${soft === 1 ? ' soft' : soft === 2 ? ' amb' : ''}">${c}</span>` : ''}</button>`;
export const HELPNAV = [['-', 'Help'], ['help', 'How it works', 'info']];
export const sbar = (items, cur, act, extra = '') => `<aside class="sb">${items.map(sbItem(cur, act)).join('')}${extra}${HELPNAV.map(sbItem(cur, act)).join('')}</aside>`;
export const oph = (t, p, a = '') => `<div class="op-h"><div><h1>${t}</h1>${p ? `<p>${p}</p>` : ''}</div>${a ? `<div class="eh-a">${a}</div>` : ''}</div>`;
export const stat = (tone, s, b, ss = '', act = '', v = '', on) => act ? `<button class="stat sbtn ${tone}${on ? ' ds-on' : ''}" aria-pressed="${!!on}" data-act="${act}" data-v="${v}"><small>${s}</small><b>${b}</b>${ss ? `<span class="ss">${ss}</span>` : ''}</button>` : `<div class="stat ${tone}"><small>${s}</small><b>${b}</b>${ss ? `<span class="ss">${ss}</span>` : ''}</div>`;
export const pill = (tone, t) => `<span class="pill ${tone}">${t}</span>`;
export const crumb = (act, lbl, t, v = '') => `<div class="crumb"><button data-act="${act}" data-v="${v}">${lbl}</button>${ico('chev', 14)}<span>${t}</span></div>`;
export const modal = (t, p, body, foot, w) => `<div class="scrim" data-act="mclose"></div><div class="modal" role="dialog" aria-label="${esc(t)}"${w ? ` style="width:min(${w}px, calc(100% - 24px))"` : ''}><div class="md-h"><div><h2>${t}</h2>${p ? `<p>${p}</p>` : ''}</div><button class="ib" data-act="mclose" aria-label="Close">${ico('x', 18)}</button></div><div class="md-b">${body}</div><div class="md-f">${foot}</div></div>`;
export const mfoot = (btn, act, ok = true, note = '') => `<span class="note" id="mnote">${note}</span><button class="btn sec lg" data-act="mclose">Cancel</button><button class="btn pri lg" id="mok" data-act="${act}" ${ok ? '' : 'disabled'}>${btn}</button>`;
export const av = (k, sz = 30) => { const p = PEO[k] || {n:k, ar:'ldr'}; return `<span class="ca" style="background:${GRAD[APPT[p.ar]]};color:#fff;width:${sz}px;height:${sz}px;border-radius:${Math.round(sz / 3)}px;display:inline-grid;place-items:center;font-size:${sz > 32 ? 13 : 11}px;font-weight:800;flex:none">${ini(p.n)}</span>`; };
export const person = (k, sub) => `<span class="who">${av(k, 26)}<span>${esc((PEO[k] || {n:k}).n)}${sub ? `<small class="mini" style="display:block">${sub}</small>` : ''}</span></span>`;
export const bar1 = (p, tone = '') => `<div class="bar1 ${tone}"><i style="width:${clamp(p, 0, 100)}%"></i></div>`;
export const hint = t => `<p class="hint">${t}</p>`;
export const empty = t => `<div class="empty">${t}</div>`;
export const grpH = (t, n) => `<div class="gh">${t}<span>${n}</span></div>`;
export const rdiv = (cells, hl, id) => `<div class="mbr nc${hl ? ' hl2' : ''}"${id ? ` data-hl="${id}"` : ''}>${cells}</div>`;
export const cell = (b, s, w) => `<div class="mbc"${w ? ` style="flex:${w}"` : ''}><b>${b}</b><small>${s || ''}</small></div>`;
export const rowO = (act, v, cells, hl) => `<div class="mbr um-row${hl ? ' hl2' : ''}" data-act="${act}" data-v="${esc(v)}" data-hl="${esc(v)}" tabindex="0">${cells}</div>`;
export const tcell = (act, v, b, s, w) => `<div class="mbc"${w ? ` style="flex:${w}"` : ''}><button class="um-tt" data-act="${act}" data-v="${esc(v)}">${b}</button><small>${s || ''}</small></div>`;
export const th = cells => rdiv(cells).replace('mbr nc', 'mbr nc uy-th');
export const btns = h => `<div class="mbc" style="flex:0 0 190px;flex-direction:row;gap:6px;align-items:center;justify-content:flex-start">${h}</div>`;
export const nx = (act, v, t, tone = 'pri') => `<button class="btn ${tone} sm" data-act="${act}" data-v="${esc(v)}">${t}</button>`;
export const seg = (act, cur, opts) => `<div class="seg2 um-seg">${opts.map(([k, n, c]) => `<button data-act="${act}" data-v="${k}" aria-pressed="${cur === k}">${n}${c != null ? ` <small>${c}</small>` : ''}</button>`).join('')}</div>`;
export const fld0 = (lbl, inn, k, v, o = {}) => `<label class="tsel"><small>${lbl}${o.req ? ' <em class="req">required</em>' : ''}</small><input class="um-in" ${o.type === 'number' ? 'type="text" inputmode="decimal"' : ''} data-in="${inn}" data-k="${k}" value="${esc(v ?? '')}" placeholder="${esc(o.ph || '')}" autocomplete="off"></label>`;
/* Dates: our own calendar, the same in Safari, Chrome and Firefox; never the browser picker */
export const DSEM = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export function dpCal(v){ const m = S.dp.m, f = fromIso(m + '-01'), off = (f.getDay() + 6) % 7, nd = new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate(), cells = [];
  for(let i = 0; i < off; i++) cells.push('<span></span>');
  for(let d = 1; d <= nd; d++){ const x = `${m}-${String(d).padStart(2, '0')}`; cells.push(`<button type="button" class="cm-dpd${x === TODAY ? ' hoy' : ''}${x === v ? ' on' : ''}" data-act="dpp" data-v="${x}">${d}</button>`); }
  return `<div class="cm-dp" role="dialog" aria-label="Calendar"><div class="cm-dph"><button type="button" class="ib" data-act="dpm" data-v="-1" aria-label="Previous month">${ico('back', 15)}</button><b>${MON[f.getMonth()]} ${f.getFullYear()}</b><button type="button" class="ib" data-act="dpm" data-v="1" aria-label="Next month">${ico('chev', 15)}</button></div><div class="cm-dpg">${DSEM.map(x => `<small>${x}</small>`).join('')}${cells.join('')}</div><div class="cm-dpf"><button type="button" class="btn sec sm" data-act="dpp" data-v="${TODAY}">Today</button><span></span><button type="button" class="btn sec sm" data-act="dpx">Close</button></div></div>`; }
export const fld = (lbl, inn, k, v, o = {}) => { if(o.type !== 'date') return fld0(lbl, inn, k, v, o); const key = `${inn}|${k}`, open = S.dp && S.dp.key === key;
  return `<div class="tsel cm-dt"><small>${lbl}${o.req ? ' <em class="req">required</em>' : ''}</small><button type="button" class="cbx-b${v ? '' : ' ph'}" data-act="dpo" data-v="${key}" data-cur="${esc(v || '')}"><span>${v ? fmtDy(v) : 'Choose a date'}</span>${ico('cal', 16)}</button>${open ? dpCal(v || '') : ''}</div>`; };
export const area = (lbl, inn, k, v, ph = '', req = false) => `<label class="tsel"><small>${lbl}${req ? ' <em class="req">required</em>' : ''}</small><textarea class="um-in" data-in="${inn}" data-k="${k}" placeholder="${esc(ph)}" rows="3">${esc(v || '')}</textarea></label>`;
export const mseg = (k, cur, opts) => `<div class="seg2 um-seg tw-mseg">${opts.map(o => { const [v, n] = Array.isArray(o) ? o : [o, o]; return `<button type="button" data-act="mset" data-k="${k}" data-v="${esc(v)}" aria-pressed="${cur === v}">${esc(n)}</button>`; }).join('')}</div>`;
export const mlab = (t, req) => `<small class="tw-lab">${t}${req ? ' <em class="req">required</em>' : ''}</small>`;
export const cbx = (lbl, key, opts, val, inn, o = {}) => { const open = S.cbo === key, cur = opts.find(x => x[0] === val), q = norm(S.cbq);
  const list = opts.filter(x => !open || !q || norm(x[1] + ' ' + (x[2] || '')).includes(q));
  return `<div class="tsel cbx${open ? ' open' : ''}"><small>${lbl}${o.req ? ' <em class="req">required</em>' : ''}</small><button type="button" class="cbx-b${cur ? '' : ' ph'}" data-act="cbo" data-v="${key}"><span>${cur ? esc(cur[1]) : esc(o.ph || 'Choose...')}</span>${ico('chev', 16)}</button>`
    + (open ? `<div class="cbx-p"><div class="cbx-s">${ico('search', 16)}<input data-in="cbq" data-k="${key}" value="${esc(S.cbq)}" placeholder="Type to search..." autocomplete="off"><button type="button" class="cbx-x" data-act="cbc" aria-label="Hide the list">${ico('x', 14)}</button></div><div class="cbx-l">${list.map(x => `<button type="button" class="cbx-o${x[0] === val ? ' on' : ''}" data-act="cbp" data-key="${key}" data-inn="${inn}" data-v="${esc(x[0])}"><span>${esc(x[1])}</span>${x[2] ? `<small>${esc(x[2])}</small>` : ''}</button>`).join('') || '<div class="cbx-e">No matches</div>'}</div></div>` : '') + '</div>'; };
export const kv = xs => `<div class="uy-kv">${xs.filter(Boolean).map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b>${c ? `<small>${c}</small>` : ''}</div>`).join('')}</div>`;
export const tabsBar = tabs => `<div class="seg2 ds-tabs" style="margin-bottom:14px">${tabs.map(([k, n]) => `<button data-act="ft" data-v="${k}" aria-pressed="${S.ft === k}">${n}</button>`).join('')}</div>`;
export const tabOf = tabs => tabs.some(x => x[0] === S.ft) ? S.ft : tabs[0][0];
export const hisList = h => h.length ? `<div class="uyp-his">${h.slice().reverse().map(([f, t, q]) => `<div><span>${fmtDy(f)}</span><p>${esc(t)}</p><small>${esc((PEO[q] || {n:q === 'sys' ? 'Automation' : q}).n)}</small></div>`).join('')}</div>` : empty('Nothing recorded yet.');
export const kcol = (t, n, cards) => `<div class="um-kc"><div class="um-kch"><b>${t}</b><span>${n}</span></div><div class="um-kcb">${cards || '<div class="tw-ke">Nothing here</div>'}</div></div>`;
export const kcard = (id, title, sub, foot, act = 'ficha') => `<div class="um-card${S.hl === id ? ' hl2' : ''}" data-act="${act}" data-v="${id}" data-hl="${id}"><div class="um-ch"><button class="um-tt" data-act="${act}" data-v="${id}">${title}</button></div><small>${sub}</small>${foot ? `<div class="tw-cf">${foot}</div>` : ''}</div>`;
export const due = s => { const n = dDiff(s); return `<span class="tw-due ${n < 0 ? 'late' : n === 0 ? 'today' : ''}">${n < 0 ? `${-n} ${-n === 1 ? 'day' : 'days'} late, ` : n === 0 ? 'today, ' : ''}${fmtDy(s)}</span>`; };
export const roNote = (app, owner, what) => app !== owner ? `<div class="ds-w">${ico('eye', 18)}<div><b>Read-only from ${APPN[app]}</b><small>${what || 'This'} is edited in ${APPN[owner]}. Any change there shows here instantly.</small></div></div>` : '';
export const his = (r, t, q) => r.his.push([TODAY, t, q || ME()]);
export let tT;
export function toast(msg, lbl, fn2){ const t = $('#toast'); t.innerHTML = `${ico('check', 18, 2.4)}<span>${msg}</span>${lbl ? `<button id="tact">${lbl}</button>` : ''}`; t.classList.add('on');
  if(lbl) $('#tact').onclick = () => { t.classList.remove('on'); fn2(); }; clearTimeout(tT); tT = setTimeout(() => t.classList.remove('on'), lbl ? 6500 : 3800); }

export const pend = app => alerts().filter(a => a.app === app && (!a.who || a.who === WHO[app]) && !(S.seen[WHO[app]] && S.seen[WHO[app]].has(a.id)));
export const alCard = a => `<div class="ds-exc c-${a.tone}${S.hl === a.id ? ' hl2' : ''}" data-hl="${a.id}"><div class="ds-exh">${pill(a.tone, a.k)}<b>${esc(a.t)}</b><span>${APPN[a.app]}</span></div><p>${esc(a.d)}</p><div class="ds-exb"><button class="btn pri sm" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button><button class="btn sec sm" data-act="alseen" data-v="${a.id}">Mark as seen</button></div></div>`;
export function atnPage(app, titulo, sub){
  const who = WHO[app], all = alerts().filter(a => a.app === app && (!a.who || a.who === who)), seen = seenSet(), xs = all.filter(a => !seen.has(a.id)), vs = all.filter(a => seen.has(a.id));
  const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}; xs.sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
  const grp = {}; xs.forEach(a => (grp[a.k] = grp[a.k] || []).push(a));
  return oph(titulo, sub) + `<div class="cstats">${Object.entries(grp).slice(0, 4).map(([k, v]) => stat(v[0].tone, k, v.length)).join('') || stat('tg', 'All clear', 0, 'nothing pending')}</div>`
    + (xs.length ? `<div class="cm-al">${xs.map(alCard).join('')}</div>` : empty('Nothing pending. The system will flag here whatever comes up.'))
    + (vs.length ? grpH('Seen', vs.length) + vs.map(a => rdiv(cell(esc(a.t), a.k, 3) + `<div class="mbc" style="flex:0 0 auto"><button class="btn sec sm" data-act="alunseen" data-v="${a.id}">Show again</button></div>`)).join('') : '');
}
export const SHEETS = {}, MODALS = {}, A = {}, IN = {};
export const go = (view, page) => { S.view = view; if(page){ S.page[view] = page; S.fi[view] = null; } S.modal = null; render(true); };
export const abrir = (app, id, tab = 'res', hl = null) => { if(window.__ab4) app = window.__ab4(app, id); S.view = app; if(S.page[app] === 'help') S.page[app] = HOME[app]; S.fi[app] = id; S.ft = tab; S.hl = hl; S.modal = null; render(true); scrollHL(); };
export const scrollHL = () => requestAnimationFrame(() => requestAnimationFrame(() => { const e = document.querySelector('.hl2'); if(e) e.scrollIntoView({block:'center', behavior:'smooth'}); }));
export const phTag = p => pill(PHS[p.ph], p.ph);
export const mTags = p => p.ms.map(x => pill(MEAS[x.m].t, MEAS[x.m].s)).join('');
export const lateTag = p => { const l = late(p); return l ? pill(l === 'red' ? 'tred' : 'ta', `${daysIn(p)} days in phase`) : ''; };
export const mgTag = (v, t) => pill(v < t ? 'tred' : 'tg', pc(v));
export const ME_ROLE = {dir:'dir', apr:'dir', ret:'aap', del:'inc', pur:'oap', com:'com', acc:'acc', mob:'inc', tsk:'dir', new:'dir'};
