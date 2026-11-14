// Refyt · v5.15: los informes de Director usan la barra de búsqueda estándar con filtros.
import {
  A, APPS, DB, DD, MEAS, PEO, PROGS, S, TODAY, VERSIONS, fPr, fbar57, plural, re57, scOf
} from "../../index.js";
/* =================== v5.15: Director reports use the standard search bar with the filters inside it =================== */
S.f.dq = S.f.dq || '';
export const dCnt65 = patch => { const keep = S.f.d; S.f.d = {...keep, ...patch}; try { return fPr().length; } finally { S.f.d = keep; } };
export function dBar65(){ const d = DD(), nf = ['pg', 'sc', 'tm', 'per', 'm'].filter(k => d[k]).length, o = (k, v, n, c) => ({a:'df65', v:`${k}|${v}`, n, c, on:(d[k] || '') === v});
  const scs = DB.sc.filter(s => !d.pg || s.prog === d.pg), teams = APPS.filter(a => a[0] !== 'tsk');
  const lab = {pg:v => (PROGS.find(p => p.id === v) || {}).n, sc:v => scOf(v).n, tm:v => (teams.find(a => a[0] === v) || [, v])[1], per:v => (PEO[v] || {}).n, m:v => (MEAS[v] || {}).n};
  return fbar57({id:'dir', qk:'f', qv:['dq'], ph:'Search a property, postcode or ID in these reports', nf, clr:'dClr65', count:plural(fPr().length, 'property', 'properties'),
    cols:[{t:'Programme', opts:[o('pg', '', 'All programmes', dCnt65({pg:'', sc:''})), ...PROGS.map(p => o('pg', p.id, p.n, dCnt65({pg:p.id, sc:''})))]},
      {t:'Scheme', opts:[o('sc', '', 'All schemes', dCnt65({sc:''})), ...scs.map(s => o('sc', s.id, s.n, dCnt65({sc:s.id})))]},
      {t:'Measure', opts:[o('m', '', 'All measures', dCnt65({m:''})), ...Object.entries(MEAS).map(([k, m]) => o('m', k, m.n, dCnt65({m:k})))]},
      {t:'Team', opts:[o('tm', '', 'All teams', null), ...teams.map(([k, n]) => o('tm', k, n, null))]}, {t:'Person', opts:[o('per', '', 'Everyone', null), ...Object.entries(PEO).filter(([k]) => k !== 'kel').map(([k, p]) => o('per', k, p.n, null))]}],
    chips:['pg', 'sc', 'm', 'tm', 'per'].filter(k => d[k]).map(k => ['df65', `${k}|`, lab[k](d[k]) || d[k]])}); }
A.df65 = el => { const v = el.dataset.v, i = v.indexOf('|'), k = v.slice(0, i), val = v.slice(i + 1), d = S.f.d; d[k] = val; if(k === 'pg' && d.sc && scOf(d.sc).prog !== val && val) d.sc = ''; re57(); };
A.dClr65 = () => { Object.assign(S.f.d, {pg:'', sc:'', tm:'', per:'', m:''}); re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.14') v.url = 'https://claude.ai/artifact/RnoWF2ybJqRVTTupxX3gYW'; } });
VERSIONS.push({v:'v5.15', date:TODAY, major:false, current:true, url:null, title:'Director reports with the standard search bar', sum:'The Programme, Scheme, Team, Person and Measure dropdowns of the Director reports are now one search bar with a Filter by panel; the period and trend controls stay.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.15') v.url = 'https://claude.ai/artifact/7N9akRwTwK4FjuH7axkwcz'; } });
VERSIONS.push({v:'v5.16', date:TODAY, major:false, current:true, url:null, title:'Suppliers in the new design', sum:'Suppliers uses the new table: supplier, cost type label, contact, orders, open orders, spend with last 3 months, last order and Raise an order. The Added column is gone.', steps:[]});
