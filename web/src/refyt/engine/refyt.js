// Refyt · motor de la interfaz aprobada por el cliente ("REFYT, demo" v5.46).
//
// Es el código del original, en el mismo orden y en un solo módulo: las versiones de la demo se
// apilan unas sobre otras (cada una envuelve render, drawPop, A.setRole… de las anteriores), así
// que partirlo obligaría a reescribirlo. Cambios respecto al original, todos marcados:
//  - allowed(), secOn() y "Viewing as" respetan la sesión real (auth.js): permisos refyt.* y refyt.view_as.
//  - jsPDF, pdf.js y ExcelJS vienen del propio bundle (la CSP no permite scripts de cdnjs).
//  - Los estilos que el original inyecta desde aquí están en styles/13-refyt-v5-sections.css.
//  - window.WTFB (webhook de la demo) es ahora commentContext: la pantalla en que se comenta, para el
//    botón Comment de la app (../comment), que guarda en /api/feedback.
//  - commentContext toma el título de la pantalla visible (el original caía en el de una vista oculta).
//  - El arranque («STARTUP») está en mount.js.
import { AUTH } from "./auth.js";
export const engine = (() => { 'use strict';
const IC = {
  db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  grid:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
  msg:'<path d="M4 5h16v11H10l-6 4z"/>', plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', truck:'<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>', image:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  phonecall:'<path d="M5 4h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', bell:'<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>',
  back:'<path d="M15 6l-6 6 6 6"/>', chev:'<path d="M9 6l6 6-6 6"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
  fence:'<path d="M5 21V6l2-2 2 2v15M15 21V6l2-2 2 2v15"/><path d="M3 10h18M3 16h18"/>',
  box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v4.5M12 17.5v.01"/>',
  camera:'<path d="M4 7h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  check:'<path d="M5 12l5 5 9-10"/>', checks:'<path d="M2 12.5l4.5 4.5 8-9"/><path d="M11.5 16l1 1 9-10"/>',
  send:'<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-8-8-4z"/>', eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  inbox:'<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>', phone:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>', pin:'<path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  tool:'<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.8-.7-.7-2.8z"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14c2.4.6 4 2.8 4 6"/>',
  dots:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 018 0v4"/>', rock:'<path d="M3 19l4.5-8 3.5 3 3.5-6L21 19z"/>',
  swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>', cloud:'<path d="M7 18h10a4 4 0 00.5-8A6 6 0 006 11a3.5 3.5 0 001 7z"/>',
  ruler:'<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>', file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>', sign:'<path d="M3 17c3-4 5-9 7-9s-1 9 2 9 3-4 5-4 2 3 4 3"/><path d="M3 21h18"/>',
  money:'<rect x="2" y="6" width="20" height="12" rx="2.5"/><circle cx="12" cy="12" r="3"/>', reset:'<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>',
  ship:'<path d="M2.5 14.5h19l-2.6 5.2a1.5 1.5 0 01-1.3.8H6.4a1.5 1.5 0 01-1.3-.8z"/><path d="M5 14.5V10h8.5l3 4.5"/><path d="M8 10V6.5h3.5V10"/>',
  anchor:'<circle cx="12" cy="5" r="2.2"/><path d="M12 7.2V21M8 11h8"/><path d="M4 14a8 8 0 0016 0"/>',
  cont:'<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M7 9v6M10.5 9v6M14 9v6M17.5 9v6"/>',
  stamp:'<path d="M9 3h6v5l3 4H6l3-4z"/><path d="M4 16h16v3H4z"/>',
  calc:'<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  route:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H16a3 3 0 000-6H8a3 3 0 010-6h7.5"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  card:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
  down:'<path d="M12 4v13M6 11l6 6 6-6"/><path d="M4 21h16"/>',
  up:'<path d="M12 20V7M6 13l6-6 6 6"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/>',
  wallet:'<path d="M4 7h15a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11"/><circle cx="16.5" cy="13.5" r="1.3"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
  plane:'<path d="M21 15.5l-8-4.5V5a1.5 1.5 0 00-3 0v6l-8 4.5V17l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4.5l8 2.5z"/>',
  cart:'<path d="M3 4h2.5l2.2 11h10.6L21 7.5H6.3"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
  shirt:'<path d="M9 3L3.5 5.5l2 4L7 8.8V21h10V8.8l1.5.7 2-4L15 3c-.8 1.8-5.2 1.8-6 0z"/>',
  hanger:'<path d="M10 5a2 2 0 1 1 2 2v2l8.6 6.6a1.3 1.3 0 0 1-.8 2.4H4.2a1.3 1.3 0 0 1-.8-2.4L12 9"/>',
  split:'<path d="M4 12h6l4-6h6M10 12l4 6h6"/><path d="M18 4l2 2-2 2M18 16l2 2-2 2"/>',
  award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',

  flask:'<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 006 21h12a1.7 1.7 0 001.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  factory:'<path d="M3 21V10l5 3V10l5 3V6l8 4v11z"/><path d="M7 17h2M12 17h2M17 17h1"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
  map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  mega:'<path d="M3 10v4h3l7 4V6L6 10z"/><path d="M17 8a5 5 0 010 8"/>',
  shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  clip:'<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  gauge:'<path d="M4 18a9 9 0 1116 0"/><path d="M12 14l4-5"/>',
  folder:'<path d="M3 6.5A1.5 1.5 0 014.5 5H9l2 2h8.5A1.5 1.5 0 0121 8.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5z"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/>',
  play:'<path d="M8 5l11 7-11 7z"/>',
  qr:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  upload:'<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>',
  paw:'<circle cx="7" cy="9" r="1.8"/><circle cx="17" cy="9" r="1.8"/><circle cx="10" cy="5.5" r="1.8"/><circle cx="14" cy="5.5" r="1.8"/><path d="M12 12c-3 0-5 3.5-5 5.5S9 20 12 20s5-.5 5-2.5-2-5.5-5-5.5z"/>',
  crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
};
Object.assign(IC, {
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  kanban:'<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
  cog:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  building:'<path d="M4 21V4a1 1 0 011-1h10a1 1 0 011 1v17"/><path d="M16 9h3a1 1 0 011 1v11M8 7h4M8 11h4M8 15h4M3 21h18"/>',
  scale:'<path d="M12 3v18M5 7h14M7 21h10"/><path d="M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z"/>',
  trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  valve:'<path d="M3 8v8l7-4zM21 8v8l-7-4z"/><path d="M12 12V6M8.5 4.5h7"/>',
  skid:'<rect x="3" y="12" width="18" height="4" rx="1"/><path d="M5 16v4M19 16v4M6 12V7h5v5M14 12V5h4v7"/>',
  pipe:'<path d="M3 9h11a4 4 0 014 4v8M3 15h8a1 1 0 011 1v5"/>',
  shelf:'<path d="M4 3v18M20 3v18M4 8h16M4 14h16M4 20h16"/><rect x="6" y="4.5" width="4" height="3.5"/><rect x="13" y="10.5" width="5" height="3.5"/><rect x="7" y="16.5" width="3" height="3.5"/>',
  badge:'<path d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 20l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z"/><path d="M8.5 11.5l2.5 2.5 4.5-5"/>',
  cash:'<rect x="2" y="6" width="20" height="12" rx="2.5"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01M18 15v.01"/>',
});
Object.assign(IC, {
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  wa:'<path d="M4 20l1.3-3.8A8 8 0 1112 20a8 8 0 01-4.2-1.2z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8a4 4 0 01-2.1-2.1l.8-1-1-2z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  sync:'<path d="M4 12a8 8 0 0113.7-5.7L20 8.5M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 01-13.7 5.7L4 15.5M4 20v-4.5h4.5"/>',
  todo:'<rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M7 10l2 2 4-4M7 16h10"/>',
});
const IMGS = {};
const ico = (n, s = 18, w = 1.9) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.info}</svg>`;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sum = (a, f = x => x) => a.reduce((t, x) => t + (f(x) || 0), 0);
const num = n => Math.round(n).toLocaleString('en-GB');
const fm = n => (n < -0.5 ? '-' : '') + '£' + Math.abs(Math.round(n)).toLocaleString('en-GB');
const fk = n => Math.abs(n) >= 1e6 ? '£' + (n / 1e6).toFixed(2) + 'M' : Math.abs(n) >= 1e4 ? '£' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : fm(n);
const pc = n => Math.round(n) + '%';
const plural = (n, a, b) => `${num(n)} ${n === 1 ? a : b}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const numIn = v => { const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; };
const MSH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DSH = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/* =================== Dates: the demo lives on Monday, October 26, 2026, the start of the field week =================== */
const T0 = new Date(2026, 9, 26);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const TODAY = iso(T0);
const dDiff = s => Math.round((fromIso(s) - T0) / 864e5);
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); };
const fmtDy = s => { if(!s) return 'No date'; const d = fromIso(s); return `${MSH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
const fmtD = s => { const n = dDiff(s), d = fromIso(s); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n === -1 ? 'yesterday' : `${DSH[d.getDay()]}, ${MSH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
const ini = s => s.split(/\s+/).filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join('');
const store = { get(k){ try { return localStorage.getItem(k); } catch(e) { return null; } }, set(k, v){ try { localStorage.setItem(k, v); } catch(e) {} } };
const norm = x => String(x || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
let seed = 42; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const ri = (a, b) => Math.floor(a + rnd() * (b - a + 1));

/* =================== Refyt v2: roles, programmes, schemes and sample data, from REFYT’s process document =================== */
const EMP0 = 'Refyt';
/* People are examples: every step is owned by a role, and a role is assigned to a person in Director > Roles */
const PEO = {
  yah:{n:'Yahaya Mohamed', r:'Director', ar:'dir'},
  dre:{n:'Dren Ferati', r:'Install coordinator', ar:'del'},
  ahm:{n:'Ahmed Ghele', r:'Designer', ar:'ret'},
  afa:{n:'Afaq Ahmad', r:'Assessor', ar:'ret'},
  xen:{n:'Xeni Ratkoceri', r:'Assessor', ar:'ret'},
  sar:{n:'Sara Okon', r:'Survey admin', ar:'ret'},
  ram:{n:'Ramesh Patel', r:'Assessment approver', ar:'ret'},
  lan:{n:'Lana', r:'Accounts', ar:'acc'},
  tom:{n:'Tom Gale', r:'Commercial', ar:'com'},
  akr:{n:'Akram', r:'Site manager', ar:'mob'},
  hse:{n:'Helen Price', r:'HSSE lead', ar:'tsk'},
};
const ROLES = {
  sad:['Survey admin', 'sar'], ass:['Assessor', 'afa'], aap:['Assessment approver', 'ram'], dsg:['Designer', 'ahm'], dap:['Design approver', 'ram'],
  inc:['Install coordinator', 'dre'], oap:['Order approver', 'dre'], pap:['Payment approver', 'yah'], com:['Commercial', 'tom'], acc:['Accounts', 'lan'], dir:['Director', 'yah'], hse:['HSSE lead', 'hse'],
};
const RN = r => ROLES[r][0], RP = r => PEO[ROLES[r][1]] ? PEO[ROLES[r][1]].n : 'To assign';
const rTag = r => `<span class="rf-role">${RN(r)}</span>`;
const MEAS = {
  LI:{n:'Loft insulation', s:'Loft', t:'tb'}, CWI:{n:'Cavity wall insulation', s:'Cavity', t:'tv'}, EWI:{n:'External wall insulation', s:'EWI', t:'to'}, IWI:{n:'Internal wall insulation', s:'IWI', t:'tp'},
  SPV:{n:'Solar PV', s:'Solar PV', t:'ta'}, DMEV:{n:'dMEV ventilation', s:'dMEV', t:'tt'}, WIN:{n:'Windows and doors', s:'Windows', t:'tk'}, LED:{n:'LED lighting', s:'LED', t:'tg'},
};
/* The six phases every property goes through */
const PH = ['A. Job received', 'B. Assess and design', 'C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out', 'Paid', 'Cancelled'];
const PHS = {'A. Job received':'tk', 'B. Assess and design':'tb', 'C. Client approval':'tv', 'D. Prepare to install':'ta', 'E. Install':'to', 'F. Close out':'tp', 'Paid':'tg', 'Cancelled':'tk'};
const OPENP = PH.slice(0, 6);
const pIdx = s => PH.indexOf(s);
const PHOWN = {'A. Job received':'sad', 'B. Assess and design':'aap', 'C. Client approval':'com', 'D. Prepare to install':'inc', 'E. Install':'inc', 'F. Close out':'inc', 'Paid':'acc', 'Cancelled':'com'};
/* Phase B steps: the same on every programme */
const BSTEPS = [['bk', 'Book assessment', 'sad'], ['vis', 'Assessment visit', 'ass'], ['rev', 'Assessment review', 'aap', true], ['docs', 'Assessment documents', 'aap'], ['mod', 'Modelling', 'aap'], ['dsg', 'Retrofit design, per measure', 'dsg'], ['drev', 'Design review', 'dap', true], ['ts', 'Technical survey', 'aap']];
const EVID = ['Floor plan and measurements', 'Wall and window sizes', 'Loft photos', 'Ventilation photos', 'Heating system', 'Every elevation photographed'];
const ADOCS = ['Condition report', 'Occupancy assessment', 'RdSAP report', 'Ventilation assessment', 'Floor plan', 'Pre EPC'];
/* Phase D: booked, then done. Ready to install sets itself when every item that applies is done */
const DITEMS = [['asb', 'Asbestos survey'], ['pibi', 'PIBI'], ['date', 'Install date agreed with customer'], ['trd', 'Trade teams planned'], ['scf', 'Scaffold erected'], ['gas', 'Gas works done'], ['mat', 'Materials delivered'], ['rams', 'Risk assessment and method statement signed off']];
/* Programme types: stages of the client system and close out rules */
const PTYPE = {
  'E.ON':{sys:'Dynamics', st:['Awaiting survey date', 'Awaiting paperwork approval', 'Retrofit survey complete', 'Awaiting technical survey date', 'Awaiting quotation approval', 'Awaiting install date', 'Awaiting compliance', 'Install complete'], trig:'Install complete in Dynamics', terms:30},
  'GLA':{sys:'Shareworks', st:['Customer received', 'Pre EPC, documents and price uploaded', 'GLA approved', 'Install date uploaded', 'Handover pack uploaded', 'Lodgement and post EPC uploaded', 'GLA accepted'], trig:'GLA accepts the final upload', terms:30},
  'Redbridge':{sys:'PAS Hub', st:['PO received', 'Evidence in progress', 'Evidence uploaded to PAS Hub', 'Cotality checking', 'Cotality registered'], trig:'Cotality registers the job', terms:45},
};
/* Redbridge is tracked by group; only the hold points block the next group */
const RGROUPS = [['pre', 'Pre start', 'All', ''], ['stl', 'Steel frame check', 'BISF', 'MDA decide and repairs done'], ['wal', 'Rebuild outer wall', 'BISF', ''], ['ven', 'Ventilation', 'DMEV', ''], ['rof', 'Roof edge and loft', 'LI', ''], ['win', 'Windows and doors', 'WIN', ''], ['ewi', 'Wall insulation', 'All', 'Fixing tests passed (No Fines and Airey)'], ['led', 'Lighting', 'LED', ''], ['hnd', 'Handover', 'All', '']];
const GST = ['Not started', 'In progress', 'Waiting on decision', 'Blocked', 'Complete', 'Not applicable'];
const GSTT = {'Not started':'tk', 'In progress':'tb', 'Waiting on decision':'ta', 'Blocked':'tred', 'Complete':'tg', 'Not applicable':'tk'};
const CTYPES = ['Materials', 'Subcontract labour', 'Scaffold', 'Gas works', 'Asbestos survey', 'Skips and plant', 'Other'];
const OST = ['Requested', 'Rejected', 'Ordered', 'Delivered', 'Invoiced'];
const HAND = ['All measures complete', 'Photos checked, with location and time', 'Customer sign off', 'Client sign off', 'Our final inspection', 'Guarantee (IBG) issued', 'TrustMark lodgement', 'MCS certificate (solar)', 'DNO notification (solar)'];
const CANCEL = ['Customer withdrew', 'Home unsuitable', 'Measures will not reach the required rating', 'Client cancelled'];
const PROGS = [{id:'EON', n:'E.ON'}, {id:'NONE', n:'No programme manager'}];
const SC0 = [
  {id:'SC-01', n:'E.ON Medway', prog:'EON', cl:'Medway Council', ty:'E.ON', reg:'Kent', st:'Live', tgt:60, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-02', n:'E.ON Thanet', prog:'EON', cl:'Thanet District Council', ty:'E.ON', reg:'Kent', st:'Live', tgt:40, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-03', n:'E.ON Waverley', prog:'EON', cl:'Waverley Borough Council', ty:'E.ON', reg:'Surrey', st:'Starting Oct 2026', tgt:35, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-04', n:'E.ON Cottsway', prog:'EON', cl:'Cottsway Housing Association', ty:'E.ON', reg:'Oxfordshire', st:'Starting Oct 2026', tgt:30, lead:'dre', set:{mg:22, ord:2500, pay:3000, vr:1500, terms:30}},
  {id:'SC-05', n:'GLA Warmer Homes', prog:'NONE', cl:'GLA', ty:'GLA', reg:'London', st:'Starting', tgt:50, lead:'dre', set:{mg:25, ord:2000, pay:2500, vr:1000, terms:30}},
  {id:'SC-06', n:'Redbridge', prog:'NONE', cl:'London Borough of Redbridge (Kanopi Works main contractor)', ty:'Redbridge', reg:'London', st:'Live', tgt:24, lead:'dre', set:{mg:18, ord:5000, pay:6000, vr:2500, terms:45}},
];
/* Agreed price and budget cost per measure (E.ON and GLA have fixed rates) */
const RATE = {'E.ON':{LI:1250, CWI:1900, EWI:9800, SPV:5200, DMEV:780, IWI:6400}, 'GLA':{LI:1300, SPV:5600, DMEV:820, IWI:6600, CWI:2000}, 'Redbridge':{EWI:16500, DMEV:900, LI:1400, WIN:5200, LED:450}};
const BUD = .74;
/* id, address, postcode, scheme, customer, measures, phase, house type, days in phase, client system step */
const PR0 = [
  ['PR-2001', '14 Canterbury Street', 'ME7 5TU', 'SC-01', 'Joan Fletcher', ['LI', 'SPV'], 'B. Assess and design', '', 6, 1],
  ['PR-2002', '61 Pier Road', 'ME7 1UB', 'SC-01', 'Tariq Hussain', ['LI', 'DMEV'], 'D. Prepare to install', '', 9, 5],
  ['PR-2003', '9 Balmoral Road', 'ME7 4PG', 'SC-01', 'Grace Mensah', ['CWI', 'LI', 'DMEV'], 'D. Prepare to install', '', 4, 5],
  ['PR-2004', '33 Copenhagen Road', 'ME7 4RY', 'SC-01', 'Daniel Byrne', ['SPV'], 'E. Install', '', 3, 5],
  ['PR-2005', '2 Saxton Street', 'ME7 5EG', 'SC-01', 'Fatima Begum', ['EWI', 'DMEV'], 'F. Close out', '', 22, 7],
  ['PR-2006', '120 Gillingham Road', 'ME7 4EP', 'SC-01', 'Peter Walsh', ['LI'], 'C. Client approval', '', 5, 4],
  ['PR-2007', '45 Ordnance Street', 'ME4 6SE', 'SC-01', 'Siobhan Kelly', ['LI', 'CWI'], 'A. Job received', '', 2, 0],
  ['PR-2008', '7 Dane Road', 'CT9 2AA', 'SC-02', 'Hamza Ali', ['SPV', 'LI'], 'B. Assess and design', '', 19, 2],
  ['PR-2009', '28 Northdown Road', 'CT9 2RW', 'SC-02', 'Margaret Okafor', ['CWI'], 'C. Client approval', '', 3, 4],
  ['PR-2010', '81 Ramsgate Road', 'CT9 4EY', 'SC-02', 'Raj Patel', ['LI', 'DMEV'], 'F. Close out', '', 8, 7],
  ['PR-2011', '5 Hawley Square', 'CT9 1PF', 'SC-02', 'Lucy Adeyemi', ['SPV'], 'Paid', '', 0, 7],
  ['PR-2012', '16 Victoria Road', 'CT9 1SB', 'SC-02', 'Michael Doyle', ['IWI'], 'Cancelled', '', 0, 1],
  ['PR-2013', '3 Farnham Road', 'GU7 1HS', 'SC-03', 'Amina Yusuf', ['LI', 'SPV'], 'A. Job received', '', 1, 0],
  ['PR-2014', '12 Witney Road', 'OX29 7AB', 'SC-04', 'Tomasz Nowak', ['CWI', 'LI'], 'A. Job received', '', 1, 0],
  ['PR-2015', '40 Leytonstone Road', 'E15 1TE', 'SC-05', 'Patricia Reid', ['SPV'], 'B. Assess and design', '', 5, 0],
  ['PR-2016', '18 Romford Road', 'E7 9HZ', 'SC-05', 'Yusuf Demir', ['LI', 'DMEV'], 'C. Client approval', '', 6, 1],
  ['PR-2017', '22 Clayhall Avenue', 'IG5 0LG', 'SC-06', 'Neil Sharma', ['EWI', 'DMEV', 'LI', 'WIN'], 'E. Install', 'BISF', 12, 1],
  ['PR-2018', '9 Roding Lane North', 'IG8 8NE', 'SC-06', 'Helen Morris', ['EWI', 'DMEV', 'LED'], 'E. Install', 'No Fines', 7, 1],
  ['PR-2019', '57 Tomswood Hill', 'IG6 2QG', 'SC-06', 'Kwame Boateng', ['EWI', 'LI'], 'E. Install', 'Airey', 5, 1],
  ['PR-2020', '4 Fencepiece Road', 'IG7 5DS', 'SC-06', 'Leila Haddad', ['EWI', 'DMEV', 'WIN', 'LED'], 'F. Close out', 'BISF', 6, 3],
  ['PR-2021', '31 Manford Way', 'IG7 4BU', 'SC-06', 'Owen Price', ['EWI', 'DMEV'], 'D. Prepare to install', 'BISF', 4, 0],
];
const SUPS = ['Insulation Supplies Direct', 'SIG Distribution', 'Solar Wholesale UK', 'Kent Scaffold Hire', 'EWI Pro', 'Medway Electrical Ltd', 'Thames Gas Services'];
function genDB(){
  const D = {sc:SC0.map(s => ({...s, set:{...s.set}, log:[]})), pr:[], or:[], va:[], sp:[], ap:[], tk:[], inv:[], tpl:[{n:'E.ON type', from:'SC-01'}, {n:'GLA type', from:'SC-05'}, {n:'Redbridge type', from:'SC-06'}], seq:{or:700, va:40, sp:80, ap:300, tk:120, inv:3300}};
  PR0.forEach(([id, ad, pc, sc, res, meas, ph, ht, din, cs], ix) => {
    const S0 = SC0.find(x => x.id === sc), ty = S0.ty, i = pIdx(ph), cancelled = ph === 'Cancelled', done = i >= 2 && !cancelled;
    const p = {id, ad, pc, sc, res, ref:ty === 'E.ON' ? 'EON-' + (48210 + ix * 37) : ty === 'GLA' ? 'GLA-WH-' + (1200 + ix) : 'PO-RB-' + (3100 + ix), ht, ph, phOn:addDays(TODAY, -din), cs, csTodo:null,
      ms:meas.map(m => ({m, q:RATE[ty][m] || 1500, b:Math.round((RATE[ty][m] || 1500) * BUD), dsg:done, dap:done, ip:i >= 5 && !cancelled ? 100 : i === 4 ? 40 : 0})),
      b:{bk:i >= 1 || cancelled, vis:i >= 1, rev:done ? 'Approved' : null, docs:done ? [...ADOCS] : [], mod:done ? {pre:'E', post:'C'} : null, ts:done, ev:done ? [...EVID] : [], revisits:0},
      d:Object.fromEntries(DITEMS.map(([k]) => [k, i >= 4 && !cancelled ? 'Done' : 'Not booked'])), dna:{}, g:{}, hand:{}, his:[], rev:null, paid:null, cancel:null, quoteOk:i >= 3 && !cancelled};
    if(ty === 'Redbridge'){ RGROUPS.forEach(([k, n, ap]) => { p.g[k] = ap === 'All' ? 'Not started' : ap === 'BISF' ? (ht === 'BISF' ? 'Not started' : 'Not applicable') : meas.includes(ap) ? 'Not started' : 'Not applicable'; }); }
    if(!meas.includes('SPV') && !meas.includes('EWI')) p.dna.scf = true;
    if(!meas.some(m => ['SPV'].includes(m))) p.dna.gas = true;
    if(i >= 5 && !cancelled) HAND.forEach(h => p.hand[h] = !(h.includes('solar') && !meas.includes('SPV')));
    p.his.push([addDays(p.phOn, -14 * Math.max(1, i)), `Job received from ${S0.cl}, reference ${p.ref}`, 'sar']);
    if(cancelled){ p.cancel = {why:'Home unsuitable', at:'B. Assess and design', abort:true}; p.his.push([addDays(TODAY, -12), 'Cancelled at B. Assess and design: home unsuitable. Assessment flagged as abortive work.', 'tom']); }
    D.pr.push(p);
  });
  const P = id => D.pr.find(p => p.id === id);
  /* live cases */
  Object.assign(P('PR-2001').b, {bk:true, vis:true, rev:'Pending', ev:EVID.slice(0, 4), revisits:1}); P('PR-2001').his.push([addDays(TODAY, -9), 'Assessment rejected: loft photos missing. Revisit booked, revisits 1.', 'ram']);
  Object.assign(P('PR-2008').b, {bk:true, vis:true, rev:'Approved', ev:[...EVID], docs:[...ADOCS], mod:{pre:'D', post:'C'}}); P('PR-2008').ms.forEach(x => { x.dsg = x.m === 'LI'; x.dap = false; });
  Object.assign(P('PR-2015').b, {bk:true, vis:false});
  P('PR-2006').cs = 4; P('PR-2009').cs = 4; P('PR-2016').cs = 1;
  Object.assign(P('PR-2002').d, {asb:'Done', pibi:'Done', date:'Done', trd:'Done', mat:'Done', rams:'Done'}); P('PR-2002').dna.scf = true;
  Object.assign(P('PR-2003').d, {asb:'Done', pibi:'Booked', date:'Done', trd:'Booked', mat:'Requested', rams:'Not booked'});
  Object.assign(P('PR-2021').d, {asb:'Done', pibi:'Done', date:'Booked', trd:'Done', scf:'Booked', mat:'Delivered', rams:'Done'}); P('PR-2021').d.mat = 'Done';
  Object.assign(P('PR-2017').g, {pre:'Complete', stl:'Waiting on decision', wal:'Not started'}); P('PR-2017').hold = 'MDA inspected the stanchions on Oct 21: corrosion on two columns, decision on repair pending.';
  Object.assign(P('PR-2018').g, {pre:'Complete', ven:'Complete', ewi:'In progress', led:'Not started'});
  Object.assign(P('PR-2019').g, {pre:'Complete', rof:'Complete', ewi:'Blocked'}); P('PR-2019').hold2 = 'Fixing pull-out test failed on the rear elevation; EWI Pro retesting.';
  Object.keys(P('PR-2020').g).forEach(k => { if(P('PR-2020').g[k] !== 'Not applicable') P('PR-2020').g[k] = 'Complete'; });
  P('PR-2020').hand['Client sign off'] = false; P('PR-2020').hand['TrustMark lodgement'] = false;
  P('PR-2005').cs = 7; P('PR-2005').hand['TrustMark lodgement'] = true; P('PR-2010').cs = 6; P('PR-2010').hand['TrustMark lodgement'] = false; P('PR-2010').csTodo = 'Upload start and finish dates, photos and the TrustMark number in Dynamics, then press submit';
  P('PR-2004').ms[0].ip = 60;
  P('PR-2011').paid = addDays(TODAY, -6);
  /* orders: committed when approved, actual when the supplier invoice is matched */
  const ord = (pr, m, ct, sup, amt, st, on, split) => { const o = {id:'PO-' + (++D.seq.or), al:split || [{pr, m, a:amt}], ct, sup, amt, st, on:addDays(TODAY, on), by:'dre', inv:st === 'Invoiced' ? 'SINV-' + (9000 + D.seq.or) : null, ok:st !== 'Requested'}; D.or.push(o); return o; };
  D.pr.filter(p => pIdx(p.ph) >= 4 && p.ph !== 'Cancelled').forEach(p => p.ms.forEach(x => { ord(p.id, x.m, 'Materials', SUPS[x.m === 'SPV' ? 2 : x.m === 'EWI' ? 4 : 0], Math.round(x.b * .42), pIdx(p.ph) >= 5 ? 'Invoiced' : 'Delivered', -20); ord(p.id, x.m, 'Subcontract labour', 'Medway Electrical Ltd', Math.round(x.b * .4), pIdx(p.ph) >= 5 ? 'Invoiced' : 'Ordered', -15); }));
  ord('PR-2003', 'CWI', 'Materials', 'Insulation Supplies Direct', 640, 'Requested', -1);
  ord('PR-2021', 'EWI', 'Scaffold', 'Kent Scaffold Hire', 6800, 'Requested', 0);
  ord(null, null, 'Materials', 'Insulation Supplies Direct', 2160, 'Ordered', -3, [{pr:'PR-2002', m:'LI', a:720}, {pr:'PR-2003', m:'LI', a:720}, {pr:'PR-2006', m:'LI', a:720}]);
  /* the EWI on Clayhall Avenue is running over budget */
  ord('PR-2017', 'EWI', 'Other', 'EWI Pro', 4800, 'Ordered', -4);
  D.va.push({id:'VA-' + (++D.seq.va), ty:'Variation', pr:'PR-2017', m:'EWI', why:'Two stanchions need repair after the MDA inspection', amt:3400, st:'Waiting internal approval', ev:'MDA report 21 Oct.pdf', on:addDays(TODAY, -2)});
  D.va.push({id:'VA-' + (++D.seq.va), ty:'Additional cost', pr:'PR-2019', m:'EWI', why:'Return visit for a second fixing test', amt:420, st:'Approved', ev:'EWI Pro test sheet.pdf', on:addDays(TODAY, -5)});
  D.sp.push({id:'SP-' + (++D.seq.sp), sub:'Medway Electrical Ltd', pr:'PR-2004', m:'SPV', stage:'Panels and inverter fitted', ev:'Photos 24 Oct (location and time)', amt:1650, st:'Waiting approval', on:addDays(TODAY, -1)});
  D.sp.push({id:'SP-' + (++D.seq.sp), sub:'Redbridge Render Co', pr:'PR-2018', m:'EWI', stage:'Insulation boards fixed', ev:'Photos 23 Oct', amt:7200, st:'Waiting approval', on:addDays(TODAY, -2)});
  D.inv.push({id:'INV-' + (++D.seq.inv), pr:'PR-2011', amt:sum(P('PR-2011').ms, x => x.q), on:addDays(TODAY, -38), due:addDays(TODAY, -8), paid:addDays(TODAY, -6)});
  D.inv.push({id:'INV-' + (++D.seq.inv), pr:'PR-2005', amt:sum(P('PR-2005').ms, x => x.q), on:addDays(TODAY, -40), due:addDays(TODAY, -10), paid:null});
  [['Chase E.ON for the Thanet survey pack comments', 'sad', 1, 'Monday team meeting'], ['Send the GLA close out document list to Ariana', 'com', 3, 'Thursday follow up'], ['Agree margin targets for Waverley and Cottsway', 'dir', -1, 'Tuesday directors'], ['Renew public liability certificate', 'hse', 9, 'HSSE'], ['Book MDA revisit for Clayhall Avenue', 'inc', 0, 'Job PR-2017']].forEach(([t, r, d, src]) => D.tk.push({id:'TK-' + (++D.seq.tk), t, r, due:addDays(TODAY, d), src, done:false}));
  return D;
}

/* =================== Calculations: one source for every number =================== */
const scOf = id => DB.sc.find(s => s.id === id);
const prOf = id => DB.pr.find(p => p.id === id);
const prsOf = sc => DB.pr.filter(p => p.sc === sc);
const tyOf = p => scOf(p.sc).ty;
const ptOf = p => PTYPE[tyOf(p)];
const csName = p => ptOf(p).st[p.cs] || ptOf(p).st[0];
const oAl = (o, pr, m) => sum(o.al.filter(a => a.pr === pr && (!m || a.m === m)), a => a.a);
const ordOf = (pr, m) => DB.or.filter(o => o.al.some(a => a.pr === pr && (!m || a.m === m)));
const vaOf = (pr, m) => DB.va.filter(v => v.pr === pr && (!m || v.m === m));
/* Per measure: quoted, budget, committed, actual, forecast. Forecast = actual + committed + budget left on what is not yet ordered */
function mMoney(p, x){ const os = ordOf(p.id, x.m).filter(o => o.st !== 'Rejected'), act = sum(os.filter(o => o.st === 'Invoiced'), o => oAl(o, p.id, x.m)) + sum(DB.sp.filter(s => s.pr === p.id && s.m === x.m && s.st === 'Paid'), s => s.amt), com = sum(os.filter(o => ['Ordered', 'Delivered'].includes(o.st)), o => oAl(o, p.id, x.m));
  const vq = sum(vaOf(p.id, x.m).filter(v => v.ty === 'Variation' && v.st === 'Approved'), v => v.amt), ad = sum(vaOf(p.id, x.m).filter(v => v.ty === 'Additional cost' && v.st === 'Approved'), v => v.amt);
  const left = pIdx(p.ph) >= 5 || p.ph === 'Cancelled' ? 0 : Math.max(0, x.b - act - com), fc = act + com + left + ad, q = x.q + vq;
  return {q, b:x.b + vq * BUD, act, com, fc, mg:q - fc, mgp:q ? (q - fc) / q * 100 : 0, over:fc > x.b + vq * BUD + 1}; }
function pMoney(p){ const xs = p.ms.map(x => mMoney(p, x)); const q = sum(xs, x => x.q), fc = sum(xs, x => x.fc); return {q, b:sum(xs, x => x.b), act:sum(xs, x => x.act), com:sum(xs, x => x.com), fc, mg:q - fc, mgp:q ? (q - fc) / q * 100 : 0, over:xs.some(x => x.over)}; }
function scMoney(sc){ const ps = prsOf(sc.id).filter(p => p.ph !== 'Cancelled' && pIdx(p.ph) >= 2), ms = ps.map(pMoney), q = sum(ms, x => x.q), fc = sum(ms, x => x.fc);
  const inv = DB.inv.filter(v => prOf(v.pr).sc === sc.id); return {won:q, fc, mgp:q ? (q - fc) / q * 100 : 0, inv:sum(inv, v => v.amt), paid:sum(inv.filter(v => v.paid), v => v.amt), owed:sum(inv.filter(v => !v.paid), v => v.amt), sup:sum(DB.or.filter(o => o.st === 'Delivered' || (o.st === 'Invoiced' && !o.paid)), o => sum(o.al.filter(a => a.pr && prOf(a.pr).sc === sc.id), a => a.a))}; }
const rating = sc => { const m = scMoney(sc), blocked = prsOf(sc.id).filter(isBlocked).length; return !m.won ? ['tk', 'Not started'] : m.mgp < sc.set.mg - 5 || blocked > 1 ? ['tred', 'Off target'] : m.mgp < sc.set.mg || blocked ? ['ta', 'At risk'] : ['tg', 'On target']; };
/* Ready to install: every phase D item that applies is done */
const dApplies = p => DITEMS.filter(([k]) => !p.dna[k]);
const ready = p => dApplies(p).every(([k]) => p.d[k] === 'Done');
const isBlocked = p => Object.values(p.g).includes('Blocked') || Object.values(p.g).includes('Waiting on decision');
const LIMIT = {'A. Job received':5, 'B. Assess and design':14, 'C. Client approval':7, 'D. Prepare to install':14, 'E. Install':21, 'F. Close out':14};
const daysIn = p => Math.max(0, -dDiff(p.phOn));
const late = p => { const l = LIMIT[p.ph]; if(!l) return null; const d = daysIn(p); return d > l * 1.5 ? 'red' : d > l ? 'amber' : null; };
const grpPct = p => { const xs = Object.values(p.g).filter(s => s !== 'Not applicable'); return xs.length ? Math.round(xs.filter(s => s === 'Complete').length / xs.length * 100) : 0; };
const holdOpen = p => tyOf(p) === 'Redbridge' && ((p.g.stl && ['Not started', 'In progress', 'Waiting on decision', 'Blocked'].includes(p.g.stl) && p.g.stl !== 'Not applicable') || p.g.ewi === 'Blocked');
const MONEY = ['dir', 'com', 'acc'];
const canMoney = app => window.__canMoney ? window.__canMoney() : MONEY.includes(app);
let DB = genDB();

/* =================== Interface state =================== */
const S = {view:'home', role:'dir', pop:null, page:{dir:'ovw', com:'mrg', acc:'trg', ret:'atn', del:'hom', tsk:'my'}, fi:{}, ft:'res', modal:null, f:{prf:'open', prq:'', sc:'', apr:'all', ost:'open', oq:'', mt:'mon'}, seen:{}, hl:null, dbm:'az', dbSel:null, dbApp:null, cbo:null, cbq:''};
let EMP = store.get('rft-demo-emp') || EMP0;
const APPS = [['dir', 'Director', 'crown', 'tb'], ['com', 'Commercial', 'calc', 'tb'], ['acc', 'Accounts', 'receipt', 'tb'], ['ret', 'Retrofit', 'clip', 'tb'], ['del', 'Delivery', 'home', 'tb'], ['tsk', 'Tasks and meetings', 'todo', 'tb']];
const APP_FASE = {};
const APPN = Object.fromEntries(APPS.map(a => [a[0], a[1]])), APPT = Object.fromEntries(APPS.map(a => [a[0], a[3]])), APPI = Object.fromEntries(APPS.map(a => [a[0], a[2]]));
const GRAD = {tk:'linear-gradient(145deg, #4A4F55, #2A2E33)', tb:'linear-gradient(145deg, var(--b500), var(--b700))', tg:'linear-gradient(145deg, #3FA66E, #1E7A4A)', ta:'linear-gradient(145deg, #D9B45A, #A07A1E)', tt:'linear-gradient(145deg, #2EA5A0, #13706B)', tv:'linear-gradient(145deg, #7E68E6, #5440B8)', tp:'linear-gradient(145deg, #E2649A, #B33A70)', to:'linear-gradient(145deg, #F08A4B, #C25A1E)'};
const WHO = {dir:'yah', ret:'sar', del:'dre', com:'tom', acc:'lan', tsk:'hse'};
const ME = () => (ROLES[S.role] || ROLES.dir)[1];
const HOME = {dir:'ovw', com:'mrg', acc:'trg', ret:'atn', del:'hom', tsk:'my'};
const seenSet = () => S.seen[ME()] || (S.seen[ME()] = new Set());

/* ---------- Common pieces ---------- */
const bd = n => n ? `<span class="bd">${n > 99 ? '99+' : n}</span>` : '';
const sbItem = (cur, act) => ([k, n, ic, c, soft]) => k === '-' ? `<div class="sb-sec">${n}</div>` : `<button class="nav" data-act="${act}" data-v="${k}" aria-current="${cur === k}"><span class="ni">${ico(ic, 17)}</span>${n}${c ? `<span class="cnt${soft === 1 ? ' soft' : soft === 2 ? ' amb' : ''}">${c}</span>` : ''}</button>`;
const HELPNAV = [['-', 'Help'], ['help', 'How it works', 'info']];
const sbar = (items, cur, act, extra = '') => `<aside class="sb">${items.map(sbItem(cur, act)).join('')}${extra}${HELPNAV.map(sbItem(cur, act)).join('')}</aside>`;
const oph = (t, p, a = '') => `<div class="op-h"><div><h1>${t}</h1>${p ? `<p>${p}</p>` : ''}</div>${a ? `<div class="eh-a">${a}</div>` : ''}</div>`;
const stat = (tone, s, b, ss = '', act = '', v = '', on) => act ? `<button class="stat sbtn ${tone}${on ? ' ds-on' : ''}" aria-pressed="${!!on}" data-act="${act}" data-v="${v}"><small>${s}</small><b>${b}</b>${ss ? `<span class="ss">${ss}</span>` : ''}</button>` : `<div class="stat ${tone}"><small>${s}</small><b>${b}</b>${ss ? `<span class="ss">${ss}</span>` : ''}</div>`;
const pill = (tone, t) => `<span class="pill ${tone}">${t}</span>`;
const crumb = (act, lbl, t, v = '') => `<div class="crumb"><button data-act="${act}" data-v="${v}">${lbl}</button>${ico('chev', 14)}<span>${t}</span></div>`;
const modal = (t, p, body, foot, w) => `<div class="scrim" data-act="mclose"></div><div class="modal" role="dialog" aria-label="${esc(t)}"${w ? ` style="width:min(${w}px, calc(100% - 24px))"` : ''}><div class="md-h"><div><h2>${t}</h2>${p ? `<p>${p}</p>` : ''}</div><button class="ib" data-act="mclose" aria-label="Close">${ico('x', 18)}</button></div><div class="md-b">${body}</div><div class="md-f">${foot}</div></div>`;
const mfoot = (btn, act, ok = true, note = '') => `<span class="note" id="mnote">${note}</span><button class="btn sec lg" data-act="mclose">Cancel</button><button class="btn pri lg" id="mok" data-act="${act}" ${ok ? '' : 'disabled'}>${btn}</button>`;
const av = (k, sz = 30) => { const p = PEO[k] || {n:k, ar:'ldr'}; return `<span class="ca" style="background:${GRAD[APPT[p.ar]]};color:#fff;width:${sz}px;height:${sz}px;border-radius:${Math.round(sz / 3)}px;display:inline-grid;place-items:center;font-size:${sz > 32 ? 13 : 11}px;font-weight:800;flex:none">${ini(p.n)}</span>`; };
const person = (k, sub) => `<span class="who">${av(k, 26)}<span>${esc((PEO[k] || {n:k}).n)}${sub ? `<small class="mini" style="display:block">${sub}</small>` : ''}</span></span>`;
const bar1 = (p, tone = '') => `<div class="bar1 ${tone}"><i style="width:${clamp(p, 0, 100)}%"></i></div>`;
const hint = t => `<p class="hint">${t}</p>`;
const empty = t => `<div class="empty">${t}</div>`;
const grpH = (t, n) => `<div class="gh">${t}<span>${n}</span></div>`;
const rdiv = (cells, hl, id) => `<div class="mbr nc${hl ? ' hl2' : ''}"${id ? ` data-hl="${id}"` : ''}>${cells}</div>`;
const cell = (b, s, w) => `<div class="mbc"${w ? ` style="flex:${w}"` : ''}><b>${b}</b><small>${s || ''}</small></div>`;
const rowO = (act, v, cells, hl) => `<div class="mbr um-row${hl ? ' hl2' : ''}" data-act="${act}" data-v="${esc(v)}" data-hl="${esc(v)}" tabindex="0">${cells}</div>`;
const tcell = (act, v, b, s, w) => `<div class="mbc"${w ? ` style="flex:${w}"` : ''}><button class="um-tt" data-act="${act}" data-v="${esc(v)}">${b}</button><small>${s || ''}</small></div>`;
const th = cells => rdiv(cells).replace('mbr nc', 'mbr nc uy-th');
const btns = h => `<div class="mbc" style="flex:0 0 190px;flex-direction:row;gap:6px;align-items:center;justify-content:flex-start">${h}</div>`;
const nx = (act, v, t, tone = 'pri') => `<button class="btn ${tone} sm" data-act="${act}" data-v="${esc(v)}">${t}</button>`;
const seg = (act, cur, opts) => `<div class="seg2 um-seg">${opts.map(([k, n, c]) => `<button data-act="${act}" data-v="${k}" aria-pressed="${cur === k}">${n}${c != null ? ` <small>${c}</small>` : ''}</button>`).join('')}</div>`;
const fld0 = (lbl, inn, k, v, o = {}) => `<label class="tsel"><small>${lbl}${o.req ? ' <em class="req">required</em>' : ''}</small><input class="um-in" ${o.type === 'number' ? 'type="text" inputmode="decimal"' : ''} data-in="${inn}" data-k="${k}" value="${esc(v ?? '')}" placeholder="${esc(o.ph || '')}" autocomplete="off"></label>`;
/* Dates: our own calendar, the same in Safari, Chrome and Firefox; never the browser picker */
const DSEM = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
function dpCal(v){ const m = S.dp.m, f = fromIso(m + '-01'), off = (f.getDay() + 6) % 7, nd = new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate(), cells = [];
  for(let i = 0; i < off; i++) cells.push('<span></span>');
  for(let d = 1; d <= nd; d++){ const x = `${m}-${String(d).padStart(2, '0')}`; cells.push(`<button type="button" class="cm-dpd${x === TODAY ? ' hoy' : ''}${x === v ? ' on' : ''}" data-act="dpp" data-v="${x}">${d}</button>`); }
  return `<div class="cm-dp" role="dialog" aria-label="Calendar"><div class="cm-dph"><button type="button" class="ib" data-act="dpm" data-v="-1" aria-label="Previous month">${ico('back', 15)}</button><b>${MON[f.getMonth()]} ${f.getFullYear()}</b><button type="button" class="ib" data-act="dpm" data-v="1" aria-label="Next month">${ico('chev', 15)}</button></div><div class="cm-dpg">${DSEM.map(x => `<small>${x}</small>`).join('')}${cells.join('')}</div><div class="cm-dpf"><button type="button" class="btn sec sm" data-act="dpp" data-v="${TODAY}">Today</button><span></span><button type="button" class="btn sec sm" data-act="dpx">Close</button></div></div>`; }
const fld = (lbl, inn, k, v, o = {}) => { if(o.type !== 'date') return fld0(lbl, inn, k, v, o); const key = `${inn}|${k}`, open = S.dp && S.dp.key === key;
  return `<div class="tsel cm-dt"><small>${lbl}${o.req ? ' <em class="req">required</em>' : ''}</small><button type="button" class="cbx-b${v ? '' : ' ph'}" data-act="dpo" data-v="${key}" data-cur="${esc(v || '')}"><span>${v ? fmtDy(v) : 'Choose a date'}</span>${ico('cal', 16)}</button>${open ? dpCal(v || '') : ''}</div>`; };
const area = (lbl, inn, k, v, ph = '', req = false) => `<label class="tsel"><small>${lbl}${req ? ' <em class="req">required</em>' : ''}</small><textarea class="um-in" data-in="${inn}" data-k="${k}" placeholder="${esc(ph)}" rows="3">${esc(v || '')}</textarea></label>`;
const mseg = (k, cur, opts) => `<div class="seg2 um-seg tw-mseg">${opts.map(o => { const [v, n] = Array.isArray(o) ? o : [o, o]; return `<button type="button" data-act="mset" data-k="${k}" data-v="${esc(v)}" aria-pressed="${cur === v}">${esc(n)}</button>`; }).join('')}</div>`;
const mlab = (t, req) => `<small class="tw-lab">${t}${req ? ' <em class="req">required</em>' : ''}</small>`;
const cbx = (lbl, key, opts, val, inn, o = {}) => { const open = S.cbo === key, cur = opts.find(x => x[0] === val), q = norm(S.cbq);
  const list = opts.filter(x => !open || !q || norm(x[1] + ' ' + (x[2] || '')).includes(q));
  return `<div class="tsel cbx${open ? ' open' : ''}"><small>${lbl}${o.req ? ' <em class="req">required</em>' : ''}</small><button type="button" class="cbx-b${cur ? '' : ' ph'}" data-act="cbo" data-v="${key}"><span>${cur ? esc(cur[1]) : esc(o.ph || 'Choose...')}</span>${ico('chev', 16)}</button>`
    + (open ? `<div class="cbx-p"><div class="cbx-s">${ico('search', 16)}<input data-in="cbq" data-k="${key}" value="${esc(S.cbq)}" placeholder="Type to search..." autocomplete="off"><button type="button" class="cbx-x" data-act="cbc" aria-label="Hide the list">${ico('x', 14)}</button></div><div class="cbx-l">${list.map(x => `<button type="button" class="cbx-o${x[0] === val ? ' on' : ''}" data-act="cbp" data-key="${key}" data-inn="${inn}" data-v="${esc(x[0])}"><span>${esc(x[1])}</span>${x[2] ? `<small>${esc(x[2])}</small>` : ''}</button>`).join('') || '<div class="cbx-e">No matches</div>'}</div></div>` : '') + '</div>'; };
const kv = xs => `<div class="uy-kv">${xs.filter(Boolean).map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b>${c ? `<small>${c}</small>` : ''}</div>`).join('')}</div>`;
const tabsBar = tabs => `<div class="seg2 ds-tabs" style="margin-bottom:14px">${tabs.map(([k, n]) => `<button data-act="ft" data-v="${k}" aria-pressed="${S.ft === k}">${n}</button>`).join('')}</div>`;
const tabOf = tabs => tabs.some(x => x[0] === S.ft) ? S.ft : tabs[0][0];
const hisList = h => h.length ? `<div class="uyp-his">${h.slice().reverse().map(([f, t, q]) => `<div><span>${fmtDy(f)}</span><p>${esc(t)}</p><small>${esc((PEO[q] || {n:q === 'sys' ? 'Automation' : q}).n)}</small></div>`).join('')}</div>` : empty('Nothing recorded yet.');
const kcol = (t, n, cards) => `<div class="um-kc"><div class="um-kch"><b>${t}</b><span>${n}</span></div><div class="um-kcb">${cards || '<div class="tw-ke">Nothing here</div>'}</div></div>`;
const kcard = (id, title, sub, foot, act = 'ficha') => `<div class="um-card${S.hl === id ? ' hl2' : ''}" data-act="${act}" data-v="${id}" data-hl="${id}"><div class="um-ch"><button class="um-tt" data-act="${act}" data-v="${id}">${title}</button></div><small>${sub}</small>${foot ? `<div class="tw-cf">${foot}</div>` : ''}</div>`;
const due = s => { const n = dDiff(s); return `<span class="tw-due ${n < 0 ? 'late' : n === 0 ? 'today' : ''}">${n < 0 ? `${-n} ${-n === 1 ? 'day' : 'days'} late, ` : n === 0 ? 'today, ' : ''}${fmtDy(s)}</span>`; };
const roNote = (app, owner, what) => app !== owner ? `<div class="ds-w">${ico('eye', 18)}<div><b>Read-only from ${APPN[app]}</b><small>${what || 'This'} is edited in ${APPN[owner]}. Any change there shows here instantly.</small></div></div>` : '';
const his = (r, t, q) => r.his.push([TODAY, t, q || ME()]);
let tT;
function toast(msg, lbl, fn2){ const t = $('#toast'); t.innerHTML = `${ico('check', 18, 2.4)}<span>${msg}</span>${lbl ? `<button id="tact">${lbl}</button>` : ''}`; t.classList.add('on');
  if(lbl) $('#tact').onclick = () => { t.classList.remove('on'); fn2(); }; clearTimeout(tT); tT = setTimeout(() => t.classList.remove('on'), lbl ? 6500 : 3800); }

const pend = app => alerts().filter(a => a.app === app && (!a.who || a.who === WHO[app]) && !(S.seen[WHO[app]] && S.seen[WHO[app]].has(a.id)));
const alCard = a => `<div class="ds-exc c-${a.tone}${S.hl === a.id ? ' hl2' : ''}" data-hl="${a.id}"><div class="ds-exh">${pill(a.tone, a.k)}<b>${esc(a.t)}</b><span>${APPN[a.app]}</span></div><p>${esc(a.d)}</p><div class="ds-exb"><button class="btn pri sm" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button><button class="btn sec sm" data-act="alseen" data-v="${a.id}">Mark as seen</button></div></div>`;
function atnPage(app, titulo, sub){
  const who = WHO[app], all = alerts().filter(a => a.app === app && (!a.who || a.who === who)), seen = seenSet(), xs = all.filter(a => !seen.has(a.id)), vs = all.filter(a => seen.has(a.id));
  const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}; xs.sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
  const grp = {}; xs.forEach(a => (grp[a.k] = grp[a.k] || []).push(a));
  return oph(titulo, sub) + `<div class="cstats">${Object.entries(grp).slice(0, 4).map(([k, v]) => stat(v[0].tone, k, v.length)).join('') || stat('tg', 'All clear', 0, 'nothing pending')}</div>`
    + (xs.length ? `<div class="cm-al">${xs.map(alCard).join('')}</div>` : empty('Nothing pending. The system will flag here whatever comes up.'))
    + (vs.length ? grpH('Seen', vs.length) + vs.map(a => rdiv(cell(esc(a.t), a.k, 3) + `<div class="mbc" style="flex:0 0 auto"><button class="btn sec sm" data-act="alunseen" data-v="${a.id}">Show again</button></div>`)).join('') : '');
}
const SHEETS = {}, MODALS = {}, A = {}, IN = {};
const go = (view, page) => { S.view = view; if(page){ S.page[view] = page; S.fi[view] = null; } S.modal = null; render(true); };
const abrir = (app, id, tab = 'res', hl = null) => { if(window.__ab4) app = window.__ab4(app, id); S.view = app; if(S.page[app] === 'help') S.page[app] = HOME[app]; S.fi[app] = id; S.ft = tab; S.hl = hl; S.modal = null; render(true); scrollHL(); };
const scrollHL = () => requestAnimationFrame(() => requestAnimationFrame(() => { const e = document.querySelector('.hl2'); if(e) e.scrollIntoView({block:'center', behavior:'smooth'}); }));
const phTag = p => pill(PHS[p.ph], p.ph);
const mTags = p => p.ms.map(x => pill(MEAS[x.m].t, MEAS[x.m].s)).join('');
const lateTag = p => { const l = late(p); return l ? pill(l === 'red' ? 'tred' : 'ta', `${daysIn(p)} days in phase`) : ''; };
const mgTag = (v, t) => pill(v < t ? 'tred' : 'tg', pc(v));
const ME_ROLE = {dir:'dir', apr:'dir', ret:'aap', del:'inc', pur:'oap', com:'com', acc:'acc', mob:'inc', tsk:'dir', new:'dir'};

/* =================== Approvals: one inbox for every approver =================== */
function approvals0(){ const xs = [];
  DB.pr.forEach(p => { const sc = scOf(p.sc);
    if(p.b.rev === 'Pending') xs.push({id:'ar' + p.id, k:'Assessment review', role:'aap', p, t:`${p.ad}, ${sc.n}`, d:`${p.b.ev.length} of ${EVID.length} evidence items in. ${p.b.revisits ? `Revisits so far: ${p.b.revisits}.` : ''}`, ok:'arOk', no:'arNo'});
    if(p.ph === 'B. Assess and design' && p.ms.every(x => x.dsg) && p.ms.some(x => !x.dap)) xs.push({id:'dr' + p.id, k:'Design review', role:'dap', p, t:`${p.ad}, ${sc.n}`, d:`Designs for ${p.ms.map(x => MEAS[x.m].s).join(', ')} ready for review.`, ok:'drOk', no:'drNo'});
  });
  DB.or.filter(o => o.st === 'Requested').forEach(o => { const p = o.al[0].pr ? prOf(o.al[0].pr) : null, sc = p ? scOf(p.sc) : null, over = sc && o.amt > sc.set.ord; xs.push({id:'or' + o.id, k:'Material order', role:over ? 'dir' : 'oap', p, o, amt:o.amt, t:`${o.id} ${o.sup}`, d:`${o.ct}, ${o.al.length > 1 ? `split across ${o.al.length} properties` : p.ad + ' ' + MEAS[o.al[0].m].s}${over ? `. Over the ${sc.n} order limit of ${fm(sc.set.ord)}` : ''}.`, ok:'orOk', no:'orNo'}); });
  DB.sp.filter(s => s.st === 'Waiting approval').forEach(s => { const p = prOf(s.pr), sc = scOf(p.sc), over = s.amt > sc.set.pay; xs.push({id:'sp' + s.id, k:'Subcontractor payment', role:over ? 'dir' : 'pap', p, amt:s.amt, t:`${s.sub}, ${p.ad}`, d:`${s.stage}. Evidence: ${s.ev}${over ? `. Over the ${sc.n} payment limit of ${fm(sc.set.pay)}` : ''}.`, ok:'spOk', no:'spNo', ref:s.id}); });
  DB.va.filter(v => v.st === 'Waiting internal approval').forEach(v => { const p = prOf(v.pr), sc = scOf(p.sc), over = v.amt > sc.set.vr; xs.push({id:'va' + v.id, k:v.ty, role:over ? 'dir' : v.ty === 'Variation' ? 'com' : 'oap', p, amt:v.amt, t:`${v.id} ${p.ad}`, d:`${MEAS[v.m].s}: ${v.why}. Evidence: ${v.ev}${over ? `. Over the ${sc.n} limit of ${fm(sc.set.vr)}` : ''}.`, ok:'vaOk', no:'vaNo', ref:v.id}); });
  return xs; }
const apCard = (a, app) => `<div class="ds-exc c-${a.role === 'dir' ? 'tred' : 'tb'}${S.hl === a.id ? ' hl2' : ''}" data-hl="${a.id}"><div class="ds-exh">${pill(a.role === 'dir' ? 'tred' : 'tb', a.k)}<b>${esc(a.t)}</b><span>${rTag(a.role)}${a.amt && canMoney(app) || a.amt && ['apr', 'pur'].includes(app) ? ' ' + fm(a.amt) : ''}</span></div><p>${esc(a.d)}</p><div class="ds-exb"><button class="btn pri sm" data-act="${a.ok}" data-v="${a.ref || (a.o ? a.o.id : a.p.id)}">Approve</button><button class="btn sec sm" data-act="apNo" data-v="${a.no}|${a.ref || (a.o ? a.o.id : a.p.id)}">Reject with a comment</button>${a.p ? `<button class="btn sec sm" data-act="prOpen" data-v="${a.p.id}|${a.k.startsWith('Assess') || a.k.startsWith('Design') ? 'ret' : 'mon'}">Open the property</button>` : ''}</div></div>`;
function aprPage(){ const role = S.f.apr || 'all', all = approvals(), xs = all.filter(a => role === 'all' || a.role === role), roles = ['aap', 'dap', 'oap', 'pap', 'com', 'dir'];
  return oph('Approvals inbox', 'Everything waiting for an approval, for every approver. Approve in one click, or reject with a comment that goes back to whoever raised it.') + `<div class="rf-bar">${seg('aprr', role, [['all', 'Everything', all.length], ...roles.map(r => [r, RN(r), all.filter(a => a.role === r).length])])}</div>` + (xs.length ? xs.map(a => apCard(a, 'apr')).join('') : empty('Nothing waiting for this role.')); }
A.aprr = el => { S.f.apr = el.dataset.v; render(); };
A.apNo = el => { const [act, id] = el.dataset.v.split('|'); S.modal = {k:'rej', act, id, note:''}; renderLayer(); };
MODALS.rej = m => modal('Reject with a comment', 'The comment goes back to whoever raised it, on the property’s history.', area('Comment', 'm', 'note', m.note, 'e.g. Loft photos missing on the rear slope', true), mfoot('Reject', 'rejOk', !!(m.note || '').trim()), 520);
A.rejOk = () => { const m = S.modal; A[m.act]({dataset:{v:m.id}}, m.note.trim()); S.modal = null; render(); };
A.arOk = el => { const p = prOf(el.dataset.v); p.b.rev = 'Approved'; p.b.ev = [...evOf(p)]; his(p, 'Assessment review approved', 'ram'); render(); toast('Approved. Assessment documents and modelling are next.'); };
A.arNo = (el, why) => { const p = prOf(el.dataset.v); p.b.rev = null; p.b.vis = false; p.b.revisits++; his(p, `Assessment rejected: ${why || 'evidence missing'}. Revisit booked for the assessor, revisits ${p.b.revisits}.`, 'ram'); toast(`Rejected. Revisit booked and counted (${p.b.revisits}); ${PEO[ROLES.ass[1]].n} is notified.`); };
A.drOk = el => { const p = prOf(el.dataset.v); p.ms.forEach(x => x.dap = true); his(p, 'Designs approved', 'ram'); render(); toast('Designs approved. Technical survey next.'); };
A.drNo = (el, why) => { const p = prOf(el.dataset.v); p.ms.forEach(x => { if(!x.dap) x.dsg = false; }); his(p, `Design returned to the designer: ${why}`, 'ram'); toast('Returned to the designer with your comment.'); };
A.orOk = el => { const o = DB.or.find(x => x.id === el.dataset.v); o.st = 'Ordered'; o.ok = true; render(); toast(`${o.id} approved: ${fm(o.amt)} now counts as committed cost.`); };
A.orNo = (el, why) => { const o = DB.or.find(x => x.id === el.dataset.v); o.st = 'Rejected'; o.why = why; toast('Order rejected and sent back to the Install coordinator.'); };
A.spOk = el => { const s = DB.sp.find(x => x.id === el.dataset.v); s.st = 'Approved'; render(); toast('Approved. Accounts sees it ready to pay.'); };
A.spNo = (el, why) => { const s = DB.sp.find(x => x.id === el.dataset.v); s.st = 'Held'; s.why = why; toast('Payment held with your comment.'); };
A.vaOk = el => { const v = DB.va.find(x => x.id === el.dataset.v); v.st = v.ty === 'Variation' ? 'Waiting client approval' : 'Approved'; render(); toast(v.ty === 'Variation' ? 'Approved internally. Now it needs the client’s approval.' : 'Approved. It adds to forecast cost and reduces the margin.'); };
A.vaNo = (el, why) => { const v = DB.va.find(x => x.id === el.dataset.v); v.st = 'Rejected'; v.why = why; toast('Rejected: it will not be carried out.'); };

/* =================== What needs attention: every alert brings the fix that closes it =================== */
function alerts0(){ const xs = [];
  approvals().filter(a => a.role === 'dir').forEach(a => xs.push({id:'ad' + a.id, app:'dir', tone:'tred', k:'Approval above the limit', t:a.t, d:`${a.k}, ${fm(a.amt || 0)}. ${a.d}`, fix:['Open the approvals', 'gogo', 'dir:wait']}));
  DB.pr.forEach(p => { const t = `${p.id} ${p.ad}`, sc = scOf(p.sc), l = late(p);
    if(OPENP.includes(p.ph) && pIdx(p.ph) >= 2){ const m = pMoney(p); if(m.mgp < sc.set.mg) ['dir', 'com'].forEach(app => xs.push({id:'mg' + app + p.id + Math.round(m.mgp), app, tone:'tred', k:'Margin below target', t, d:`Forecast margin ${pc(m.mgp)} against the ${sc.n} target of ${sc.set.mg}%: ${fm(m.q)} quoted, ${fm(m.fc)} forecast cost.`, fix:['Open the money', 'prOpen', p.id + '|mon']})); else if(m.over) xs.push({id:'ob' + p.id, app:'com', tone:'ta', k:'Over budget', t, d:`Forecast cost ${fm(m.fc)} is over the budget of ${fm(m.b)}.`, fix:['Open the money', 'prOpen', p.id + '|mon']}); }
    if(l === 'red') xs.push({id:'lt' + p.id + p.ph, app:'dir', tone:'ta', k:'Over time', t, d:`${daysIn(p)} days in ${p.ph}, limit ${LIMIT[p.ph]}. Owner: ${RN(PHOWN[p.ph])}.`, fix:['Open the property', 'prOpen', p.id]});
    if(l && ['A. Job received', 'B. Assess and design'].includes(p.ph)) xs.push({id:'lr' + p.id + p.ph, app:'ret', tone:l === 'red' ? 'tred' : 'ta', k:'Over time', t, d:`${daysIn(p)} days in ${p.ph}, limit ${LIMIT[p.ph]}.`, fix:['Open the property', 'prOpen', p.id + '|ret']});
    if(['A. Job received', 'B. Assess and design'].includes(p.ph) && !p.b.vis && p.b.revisits) xs.push({id:'rv' + p.id + p.b.revisits, app:'ret', tone:'tred', k:'Revisit', t, d:`Assessment rejected. Revisit ${p.b.revisits} to carry out.`, fix:['Mark revisit done', 'bVis', p.id]});
    if(p.ph === 'A. Job received' && !p.b.bk) xs.push({id:'bk' + p.id, app:'ret', tone:'tb', k:'Book assessment', t, d:`${sc.cl} sent it, reference ${p.ref}. ${ptOf(p).sys === 'Dynamics' ? 'Enter the date in Dynamics once booked.' : ''}`, fix:['Book assessment', 'bBook', p.id]});
    if(p.ph === 'B. Assess and design' && bDone(p)) xs.push({id:'bc' + p.id, app:'ret', tone:'tg', k:'Survey pack ready', t, d:`Phase B checks pass. Send the pack to ${ptOf(p).sys} for client approval.`, fix:['Send to client approval', 'phNext', p.id]});
    if(p.ph === 'D. Prepare to install' && ready(p)) xs.push({id:'ri' + p.id, app:'del', tone:'tg', k:'Ready to install', t, d:'Every phase D item that applies is done.', fix:['Start install', 'phNext', p.id]});
    if(p.ph === 'E. Install' && holdOpen(p) && (p.hold || p.hold2)) xs.push({id:'hp' + p.id, app:'del', tone:'tred', k:'Hold point', t, d:p.hold || p.hold2, fix:['Open the install', 'prOpen', p.id + '|ins']});
    if(p.csTodo) xs.push({id:'cs' + p.id + p.cs, app:p.ph === 'B. Assess and design' || p.ph === 'A. Job received' ? 'ret' : 'del', tone:'ta', k:`Update ${ptOf(p).sys}`, t, d:p.csTodo, fix:['Mark as updated', 'csDone', p.id]});
    const trig = (tyOf(p) === 'E.ON' && p.cs >= 7) || (tyOf(p) === 'GLA' && p.cs >= 6) || (tyOf(p) === 'Redbridge' && p.cs >= 4);
    if(trig && !DB.inv.some(v => v.pr === p.id) && p.ph !== 'Paid') xs.push({id:'tr' + p.id, app:'acc', tone:'tb', k:'Payment trigger met', t, d:`${ptOf(p).trig}. Invoice ${fm(pMoney(p).q)} to ${sc.cl}.`, fix:['Create invoice', 'invNew', p.id]});
  });
  DB.inv.filter(v => !v.paid && dDiff(v.due) < 0).forEach(v => xs.push({id:'od' + v.id, app:'acc', tone:'tred', k:'Invoice overdue', t:`${v.id} ${prOf(v.pr).ad}`, d:`${fm(v.amt)}, due ${fmtD(v.due)}.`, fix:['Mark paid', 'invPaid', v.id]}));
  DB.sp.filter(s => s.st === 'Approved').forEach(s => xs.push({id:'pp' + s.id, app:'acc', tone:'tb', k:'Subcontractor to pay', t:`${s.sub}, ${prOf(s.pr).ad}`, d:`${s.stage}: ${fm(s.amt)} approved.`, fix:['Mark paid', 'spPaid', s.id]}));
  DB.va.filter(v => v.st === 'Waiting client approval').forEach(v => xs.push({id:'vc' + v.id, app:'com', tone:'ta', k:'Client approval', t:`${v.id} ${prOf(v.pr).ad}`, d:`${v.why}: ${fm(v.amt)}.`, fix:['Client approved', 'vaClient', v.id]}));
  DB.or.filter(o => o.st === 'Delivered').slice(0, 3).forEach(o => xs.push({id:'dv' + o.id, app:'pur', tone:'tb', k:'Match supplier invoice', t:`${o.id} ${o.sup}`, d:`Delivered: ${fm(o.amt)}. When the invoice reaches Xero it becomes actual cost.`, fix:['Mark invoiced', 'orInv', o.id]}));
  DB.tk.filter(k => !k.done && dDiff(k.due) < 0).forEach(k => xs.push({id:'tk' + k.id, app:'tsk', tone:'tred', k:'Task overdue', t:k.t, d:`${RN(k.r)}, due ${fmtD(k.due)}. From ${k.src}.`, fix:['Mark done', 'tkDone', k.id]}));
  return xs; }

/* =================== Moving a property: owner, date and time in phase are recorded on every move =================== */
const bDone = p => p.b.rev === 'Approved' && docsOf(p).every(n => p.b.docs.includes(n)) && p.b.mod && p.ms.every(x => x.dsg && x.dap) && p.b.ts;
function phGate(p){ const miss = [];
  if(p.ph === 'A. Job received' && !p.b.bk) miss.push('Assessment booked');
  if(p.ph === 'B. Assess and design'){ if(p.b.rev !== 'Approved') miss.push(p.b.rev === 'Pending' ? 'Assessment review waiting' : 'Assessment visit and review'); if(!docsOf(p).every(n => p.b.docs.includes(n))) miss.push(`${docsOf(p).filter(n => !p.b.docs.includes(n)).length} assessment documents`); if(!p.b.mod) miss.push('Modelling'); if(p.ms.some(x => !x.dsg)) miss.push('Design for every measure'); else if(p.ms.some(x => !x.dap)) miss.push('Design review'); if(!p.b.ts) miss.push('Technical survey'); }
  if(p.ph === 'C. Client approval' && !p.quoteOk) miss.push(`Client approval in ${ptOf(p).sys === 'PAS Hub' ? 'the PO' : ptOf(p).sys}`);
  if(p.ph === 'D. Prepare to install') dApplies(p).filter(([k]) => p.d[k] !== 'Done').forEach(([, n]) => miss.push(n));
  if(p.ph === 'E. Install'){ if(tyOf(p) === 'Redbridge'){ const xs = RGROUPS.filter(([k]) => !['Complete', 'Not applicable'].includes(p.g[k]) && k !== 'hnd'); if(xs.length) miss.push(`${xs.length} groups to complete`); } else if(p.ms.some(x => x.ip < 100)) miss.push('Every measure installed and signed off'); }
  if(p.ph === 'F. Close out'){ const xs = HAND.filter(h => !(h.includes('solar') && !p.ms.some(x => x.m === 'SPV')) && !p.hand[h]); if(xs.length) miss.push(`Handover: ${xs.join(', ')}`); if(!DB.inv.some(v => v.pr === p.id && v.paid)) miss.push('Payment received'); }
  return {ok:!miss.length, miss}; }
const CSNEXT = {'B. Assess and design':['E.ON', 2, 'Upload the survey pack to Dynamics and wait for paperwork approval'], 'C. Client approval':['E.ON', 5, 'Enter the technical survey date, asbestos survey and price in Dynamics, then submit'], 'E. Install':['E.ON', 6, 'Enter the install date in Dynamics']};
A.phNext = el => { const p = prOf(el.dataset.v), g = phGate(p); if(!g.ok && p.ph !== 'F. Close out') return toast('Not yet: ' + esc(g.miss[0])); const from = p.ph, d = daysIn(p); p.ph = PH[pIdx(p.ph) + 1]; p.phOn = TODAY;
  const c = CSNEXT[from]; if(c && tyOf(p) === c[0]){ p.cs = Math.max(p.cs, c[1] - 1); p.csTodo = c[2]; } else if(tyOf(p) === 'GLA' && from === 'B. Assess and design'){ p.csTodo = 'Upload the pre EPC, assessment documents and price to Shareworks'; }
  his(p, `Moved from ${from} (${d} days) to ${p.ph}. Owner: ${RN(PHOWN[p.ph])}.`); render(); toast(`${p.id} is in ${p.ph}. ${RN(PHOWN[p.ph])} owns it now.${p.csTodo ? ` Reminder created: update ${ptOf(p).sys}.` : ''}`); };
A.csDone = el => { const p = prOf(el.dataset.v); p.cs = Math.min(ptOf(p).st.length - 1, p.cs + 1); his(p, `${ptOf(p).sys} updated: ${csName(p)}`); p.csTodo = null; render(); toast(`${ptOf(p).sys} marked as updated: ${csName(p)}.`); };
A.csStep = el => { const p = prOf(el.dataset.v); p.cs = Math.min(ptOf(p).st.length - 1, p.cs + 1); if(tyOf(p) === 'E.ON' && p.cs === 5 && p.ph === 'C. Client approval') p.quoteOk = true; if(tyOf(p) !== 'E.ON' && p.ph === 'C. Client approval') p.quoteOk = true; his(p, `${ptOf(p).sys}: ${csName(p)}`); render(); toast(`${ptOf(p).sys} now shows: ${csName(p)}.`); };
A.bBook = el => { const p = prOf(el.dataset.v); p.b.bk = true; p.b.on = addDays(TODAY, 3); his(p, `Assessment booked for ${fmtDy(p.b.on)} with ${RP('ass')}`, 'sar'); if(tyOf(p) === 'E.ON') p.csTodo = 'Enter the assessment date in Dynamics'; render(); toast(`Booked for ${fmtDy(p.b.on)}. ${tyOf(p) === 'E.ON' ? 'Reminder: enter the date in Dynamics.' : ''}`); };
A.bVis = el => { const p = prOf(el.dataset.v); p.b.vis = true; p.b.rev = 'Pending'; his(p, 'Assessment visit done, sent for review', 'afa'); render(); toast('Visit done. The Assessment approver has it in the inbox.'); };
A.bStep = el => { const [id, k] = el.dataset.v.split('|'), p = prOf(id);
  if(k === 'docs') p.b.docs = [...ADOCS]; if(k === 'mod') p.b.mod = {pre:'D', post:'C'}; if(k === 'ts') p.b.ts = true; if(k === 'dsg') p.ms.forEach(x => x.dsg = true); if(k === 'ev') p.b.ev = [...evOf(p)];
  his(p, `${(BSTEPS.find(s => s[0] === k) || ['', 'Evidence'])[1]} done`); render(); toast('Saved.' + (k === 'dsg' ? ' The Design approver has it in the inbox.' : '')); };
A.dSet = el => { const [id, k, v] = el.dataset.v.split('|'), p = prOf(id), was = ready(p); p.d[k] = v; his(p, `${DITEMS.find(x => x[0] === k)[1]}: ${v.toLowerCase()}`); render(); toast(!was && ready(p) ? 'Ready to install: every item is done. The Install coordinator is notified.' : 'Saved.'); };
A.gSet = el => { const [id, k] = el.dataset.v.split('|'), p = prOf(id), cur = p.g[k], nx2 = cur === 'Not started' ? 'In progress' : cur === 'In progress' ? 'Complete' : cur === 'Waiting on decision' || cur === 'Blocked' ? 'Complete' : cur; p.g[k] = nx2; if(nx2 === 'Complete' && (k === 'stl' || k === 'ewi')){ p.hold = null; p.hold2 = null; } his(p, `${RGROUPS.find(g => g[0] === k)[1]}: ${nx2}`); render(); toast(nx2 === 'Complete' && RGROUPS.find(g => g[0] === k)[3] ? 'Hold point passed. The next group is unlocked and the site team is notified.' : `${RGROUPS.find(g => g[0] === k)[1]}: ${nx2.toLowerCase()}.`); };
A.ipSet = el => { const [id, m] = el.dataset.v.split('|'), p = prOf(id), x = p.ms.find(y => y.m === m); x.ip = Math.min(100, x.ip + 50); his(p, `${MEAS[m].n} install ${x.ip}%`); render(); };
A.hSet = el => { const [id, i] = el.dataset.v.split('|'), p = prOf(id), h = HAND[+i]; p.hand[h] = !p.hand[h]; render(); };
A.cnOpen = el => { S.modal = {k:'cn', id:el.dataset.v, why:'', note:''}; renderLayer(); };
MODALS.cn = m => { const p = prOf(m.id); return modal('Cancel the job', `${esc(p.ad)}, in ${p.ph}. The reason and the phase are recorded; work already done is flagged as abortive work to invoice.`, mlab('Reason', true) + mseg('why', m.why, CANCEL) + area('Note', 'm', 'note', m.note, 'e.g. The customer no longer wants solar'), mfoot('Cancel the job', 'cnOk', !!m.why), 560); };
A.cnOk = () => { const m = S.modal, p = prOf(m.id), at = p.ph, ab = pIdx(at) >= 1; p.cancel = {why:m.why, at, abort:ab}; p.ph = 'Cancelled'; p.phOn = TODAY; his(p, `Cancelled at ${at}: ${m.why.toLowerCase()}.${ab ? ' Work done flagged as abortive work.' : ''}`); S.modal = null; render(); toast(ab ? 'Cancelled. An abortive work line is ready for Commercial to invoice.' : 'Cancelled.'); };

/* =================== The property: one card, the same from every app; money only for money roles =================== */
const FICHA = {'PR-':prOf, 'SC-':scOf};
const fichaOf = id => id && FICHA[String(id).slice(0, 3)] ? FICHA[String(id).slice(0, 3)](id) : null;
const FICHAR = (app, id) => String(id).startsWith('SC-') ? scFicha(app, scOf(id)) : prFicha(app, prOf(id));
const phBar = p => `<div class="rf-sb">${PH.slice(0, 6).map((s, i) => `<span class="${p.ph === 'Cancelled' ? '' : i < pIdx(p.ph) ? 'dn' : i === pIdx(p.ph) ? 'on' : ''}">${s}</span>`).join('')}</div>`;
function prFicha0(app, p){ const tabs = [['res', 'Summary'], ['mea', 'Measures'], ['ret', 'Assess and design'], ['ins', 'Install'], ['clo', 'Close out'], ...(canMoney(app) ? [['mon', 'Money']] : app === 'pur' || app === 'del' ? [['mon', 'Orders']] : []), ['his', 'History']], t = tabOf(tabs), sc = scOf(p.sc);
  const body = {res:prSum, mea:meaTab, ret:retTab, ins:insTab, clo:cloTab, mon:monTab, his:() => hisList(p.his)}[t](app, p);
  const g = phGate(p), canMove = ['ret', 'del'].includes(app) && ['A. Job received', 'B. Assess and design', 'D. Prepare to install', 'E. Install'].includes(p.ph);
  const acts = (canMove ? `<button class="btn ${g.ok ? 'pri' : 'sec'}" data-act="phNext" data-v="${p.id}" ${g.ok ? '' : 'disabled title="' + esc(g.miss.join('; ')) + '"'}>${ico(g.ok ? 'send' : 'lock', 15)}Move to ${PH[pIdx(p.ph) + 1].slice(3).toLowerCase()}</button>` : '') + (OPENP.includes(p.ph) && ['del', 'ret', 'com', 'dir'].includes(app) ? `<button class="btn sec" data-act="cnOpen" data-v="${p.id}">Cancel job</button>` : '');
  return crumb('fichaback', 'Back', esc(p.ad)) + oph(esc(p.ad), `${p.id}, ${p.pc}, ${sc.n}, ${sc.cl}. Customer ${esc(p.res)}. Client reference ${p.ref}${p.ht ? `, ${p.ht} house` : ''}.`, acts) + `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:-6px 0 14px">${phTag(p)}${mTags(p)}${lateTag(p)}${p.ph === 'D. Prepare to install' && ready(p) ? pill('tg', 'Ready to install') : ''}</div>` + tabsBar(tabs) + body; }
function prSum(app, p){ const g = phGate(p), sc = scOf(p.sc), m = canMoney(app) ? pMoney(p) : null, nxt = !OPENP.includes(p.ph) ? (p.ph === 'Paid' ? 'Paid. Closed.' : `Cancelled at ${p.cancel.at}: ${p.cancel.why.toLowerCase()}.`) : g.ok ? `Ready for ${PH[pIdx(p.ph) + 1]}.` : `To finish ${p.ph}: ${g.miss.join('; ')}.`;
  return `<div class="ds-exc c-${g.ok ? 'tg' : 'ta'}"><div class="ds-exh">${pill(g.ok ? 'tg' : 'ta', 'Next step')}<b>${p.ph}</b><span>${rTag(PHOWN[p.ph])} ${RP(PHOWN[p.ph])}</span></div><p>${esc(nxt)}</p></div>` + phBar(p)
    + (p.csTodo ? `<div class="rf-gate">${ico('alert', 17)}<div><b>Update ${ptOf(p).sys}</b><small>${esc(p.csTodo)}</small></div>${['ret', 'del'].includes(app) ? nx('csDone', p.id, 'Mark as updated') : ''}</div>` : '')
    + `<section class="rsec"><div class="rs-h"><h3>The job</h3></div>${kv([['Scheme', sc.n, `${sc.cl}, ${sc.reg}`], [ptOf(p).sys + ' status', csName(p), ['ret', 'del'].includes(app) && p.cs < ptOf(p).st.length - 1 ? `<button class="lnk4" data-act="csStep" data-v="${p.id}">Next status</button>` : ''], ['Client reference', p.ref, ''], ['In this phase', `${daysIn(p)} days`, LIMIT[p.ph] ? `limit ${LIMIT[p.ph]} days` : ''], ['Rating', p.b.mod ? `${p.b.mod.pre} to ${p.b.mod.post}` : 'Not modelled', 'pre EPC to predicted post'], ['Revisits', p.b.revisits, 'assessment']])}</section>`
    + (m ? `<div class="cstats">${stat('tb', 'Quoted', fm(m.q))}${stat('tk', 'Forecast cost', fm(m.fc), `budget ${fm(m.b)}`)}${stat(m.mgp < sc.set.mg ? 'tred' : 'tg', 'Forecast margin', pc(m.mgp), `target ${sc.set.mg}%`)}${stat('to', 'Actual cost', fm(m.act), `${fm(m.com)} committed`)}</div>` : ''); }
function meaTab(app, p){ const money = canMoney(app), sc = scOf(p.sc);
  return hint('One row per measure: its design, approval, install progress' + (money ? ', quote, budget and forecast.' : '. Prices and margins are only shown to Director, Commercial and Accounts.'))
    + th(cell('Measure', '', 1.6) + cell('Design', 'Review') + cell('Install', 'Progress') + (money ? cell('Quoted', 'Budget') + cell('Forecast', 'Actual and committed') + cell('Margin', '') : '')) + p.ms.map(x => { const mm = mMoney(p, x); return rdiv(cell(MEAS[x.m].n, '', 1.6) + cell(x.dsg ? 'Done' : 'To do', x.dap ? 'Approved' : x.dsg ? 'In review' : '') + `<div class="mbc"><b>${x.ip}%</b>${bar1(x.ip)}</div>` + (money ? cell(fm(mm.q), `budget ${fm(mm.b)}`) + cell(fm(mm.fc), `${fm(mm.act)} actual, ${fm(mm.com)} committed`) + `<div class="mbc"><b>${mgTag(mm.mgp, sc.set.mg)}</b><small>${mm.over ? 'over budget' : ''}</small></div>` : '')); }).join(''); }
function retTab(app, p){ const ed = app === 'ret' && OPENP.includes(p.ph);
  const st = ([k, n, r, ap]) => { const done = k === 'bk' ? p.b.bk : k === 'vis' ? p.b.vis : k === 'rev' ? p.b.rev === 'Approved' : k === 'docs' ? docsOf(p).every(n => p.b.docs.includes(n)) : k === 'mod' ? !!p.b.mod : k === 'dsg' ? p.ms.every(x => x.dsg) : k === 'drev' ? p.ms.every(x => x.dap) : p.b.ts;
    const btn = !ed || done ? '' : k === 'bk' ? nx('bBook', p.id, 'Book') : k === 'vis' ? nx('bVis', p.id, p.b.revisits ? 'Revisit done' : 'Visit done') : ['docs', 'mod', 'dsg', 'ts'].includes(k) ? nx('bStep', `${p.id}|${k}`, 'Mark done') : k === 'rev' && p.b.rev === 'Pending' ? '<small class="mini">In the Approvals inbox</small>' : k === 'drev' && p.ms.every(x => x.dsg) ? '<small class="mini">In the Approvals inbox</small>' : '';
    return `<div class="rf-dl${done ? ' ok' : ''}"><span class="rf-ck">${done ? ico('check', 14, 2.6) : ''}</span><div><b>${n}${ap ? ' <em class="rf-ap">approval</em>' : ''}</b><small>${RN(r)}: ${RP(r)}${k === 'vis' && p.b.revisits ? `, revisits ${p.b.revisits}` : ''}${k === 'mod' && p.b.mod ? `, ${p.b.mod.pre} to ${p.b.mod.post}` : ''}</small></div>${btn}</div>`; };
  return `<div class="rf-cols"><div><small class="rf-ph">Phase B steps</small>${BSTEPS.map(st).join('')}</div><div><small class="rf-ph">RdSAP evidence, checked at review</small>${EVID.map(e => `<div class="rf-dl${p.b.ev.includes(e) ? ' ok' : ''}"><span class="rf-ck">${p.b.ev.includes(e) ? ico('check', 14, 2.6) : ''}</span><div><b>${e}</b></div></div>`).join('')}<small class="rf-ph" style="margin-top:12px">Assessment documents</small>${ADOCS.map(e => `<div class="rf-dl${p.b.docs.includes(e) ? ' ok' : ''}"><span class="rf-ck">${p.b.docs.includes(e) ? ico('check', 14, 2.6) : ''}</span><div><b>${e}</b></div></div>`).join('')}</div></div>`; }
function insTab(app, p){ const ed = ['del', 'mob'].includes(app) && OPENP.includes(p.ph);
  const dRow = ([k, n]) => { const na = p.dna[k], v = p.d[k]; return `<div class="rf-dl${v === 'Done' || na ? ' ok' : ''}"><span class="rf-ck">${v === 'Done' ? ico('check', 14, 2.6) : ''}</span><div><b>${n}</b><small>${na ? 'Not needed on this job' : v}</small></div>${ed && !na && v !== 'Done' && p.ph === 'D. Prepare to install' ? nx('dSet', `${p.id}|${k}|${v === 'Booked' || v === 'Requested' || v === 'Delivered' ? 'Done' : 'Booked'}`, v === 'Booked' || v === 'Requested' || v === 'Delivered' ? 'Mark done' : 'Mark booked', 'sec') : ''}</div>`; };
  const D = `<section class="rsec"><div class="rs-h"><h3>Phase D: ready to install</h3><p>Booked, then done. It sets Ready to install by itself.</p></div>${pIdx(p.ph) >= 3 ? `<div class="rf-gate${ready(p) ? ' ok' : ''}">${ico(ready(p) ? 'check' : 'lock', 17)}<div><b>${ready(p) ? 'Ready to install' : 'Not ready yet'}</b><small>${ready(p) ? 'Every item that applies is done.' : `${dApplies(p).filter(([k]) => p.d[k] !== 'Done').length} items to finish`}</small></div></div>` : ''}${DITEMS.map(dRow).join('')}</section>`;
  const R = tyOf(p) === 'Redbridge' ? `<section class="rsec"><div class="rs-h"><h3>Install by group, ${p.ht} house</h3><p>${grpPct(p)}% complete. Only the hold points block the next group; groups not in the PO are not applicable.</p></div>${p.hold || p.hold2 ? `<div class="rf-gate">${ico('alert', 17)}<div><b>Hold point</b><small>${esc(p.hold || p.hold2)}</small></div></div>` : ''}${RGROUPS.map(([k, n, ap, hp]) => `<div class="rf-dl${p.g[k] === 'Complete' || p.g[k] === 'Not applicable' ? ' ok' : ''}"><span class="rf-ck">${p.g[k] === 'Complete' ? ico('check', 14, 2.6) : ''}</span><div><b>${n}${hp ? ' <em class="rf-ap">hold point</em>' : ''}</b><small>${hp || (ap === 'All' ? 'Every house' : ap === 'BISF' ? 'BISF only' : 'Where in the PO')}</small></div>${pill(GSTT[p.g[k]], p.g[k])}${ed && p.ph === 'E. Install' && !['Complete', 'Not applicable'].includes(p.g[k]) ? nx('gSet', `${p.id}|${k}`, p.g[k] === 'Not started' ? 'Start' : hp ? 'Passed' : 'Complete', 'sec') : ''}</div>`).join('')}</section>`
    : `<section class="rsec"><div class="rs-h"><h3>Install progress</h3><p>Site teams record progress and photos from their phones, with location and time.</p></div>${p.ms.map(x => `<div class="rf-dl${x.ip >= 100 ? ' ok' : ''}"><span class="rf-ck">${x.ip >= 100 ? ico('check', 14, 2.6) : ''}</span><div><b>${MEAS[x.m].n}</b>${bar1(x.ip)}</div><small class="mini">${x.ip}%</small>${ed && p.ph === 'E. Install' && x.ip < 100 ? nx('ipSet', `${p.id}|${x.m}`, x.ip ? 'Signed off' : 'Started', 'sec') : ''}</div>`).join('')}</section>`;
  return D + R; }
function cloTab(app, p){ const ed = ['del'].includes(app) && p.ph === 'F. Close out', hasPV = p.ms.some(x => x.m === 'SPV'), inv = DB.inv.find(v => v.pr === p.id);
  return `<section class="rsec"><div class="rs-h"><h3>Handover checklist</h3><p>Then lodgement and the final uploads to ${ptOf(p).sys}. ${ptOf(p).trig} triggers the invoice.</p></div>${HAND.map((h, i) => { const na = (h.includes('solar') && !hasPV && !(p.u52 || {})['h:' + h]) || p.hand[h] === 'na', ok = na || p.hand[h]; return `<div class="rf-dl${ok ? ' ok' : ''}"><span class="rf-ck">${p.hand[h] ? ico('check', 14, 2.6) : ''}</span><div><b>${h}</b><small>${na ? 'Not applicable' : ok ? 'Done' : 'To do'}</small></div>${ed && !na ? nx('hSet', `${p.id}|${i}`, ok ? 'Undo' : 'Done', 'sec') : ''}</div>`; }).join('')}</section>`
    + `<section class="rsec"><div class="rs-h"><h3>${ptOf(p).sys}</h3></div>${kv([['Status', csName(p), `step ${p.cs + 1} of ${ptOf(p).st.length}`], ['Invoice', inv ? inv.id : 'Not raised', inv ? (inv.paid ? 'Paid ' + fmtDy(inv.paid) : 'Due ' + fmtDy(inv.due)) : ''], ['Payment trigger', ptOf(p).trig, '']])}</section>`; }
function monTab(app, p){ const money = canMoney(app), os = ordOf(p.id), vs = vaOf(p.id), sps = DB.sp.filter(s => s.pr === p.id);
  return (money ? `<div class="cstats">${(m => stat('tb', 'Quoted', fm(m.q), 'with approved variations') + stat('tk', 'Budget', fm(m.b)) + stat('to', 'Forecast cost', fm(m.fc), `${fm(m.act)} actual, ${fm(m.com)} committed`) + stat(m.mgp < scOf(p.sc).set.mg ? 'tred' : 'tg', 'Forecast margin', pc(m.mgp), fm(m.mg)))(pMoney(p))}</div>` : hint('Orders and bookings only. Margins are visible to Director and Commercial.'))
    + grpH('Orders and cost lines', os.length) + (os.length ? th(cell('Order', 'Supplier', 2) + cell('Measure', 'Cost type') + cell('Amount', 'this property') + cell('Status', '')) + os.map(o => rdiv(cell(o.id, o.sup, 2) + cell(o.al.filter(a => a.pr === p.id).map(a => MEAS[a.m].s).join(', '), o.ct) + cell(fm(oAl(o, p.id)), o.al.length > 1 ? `split from ${fm(o.amt)}` : '') + `<div class="mbc"><b>${pill(o.st === 'Invoiced' ? 'tg' : o.st === 'Requested' ? 'ta' : o.st === 'Rejected' ? 'tred' : 'tb', o.st)}</b><small>${o.inv || ''}</small></div>`, S.hl === o.id, o.id)).join('') : empty('No orders yet.'))
    + grpH('Variations and additional costs', vs.length) + (vs.length ? vs.map(v => rdiv(cell(`${v.id} ${v.ty}`, `${MEAS[v.m].s}: ${v.why}`, 3) + cell(fm(v.amt), v.ev) + `<div class="mbc"><b>${pill(v.st === 'Approved' ? 'tg' : 'ta', v.st)}</b><small></small></div>`)).join('') : empty('None.'))
    + (sps.length ? grpH('Subcontractor payments', sps.length) + sps.map(s => rdiv(cell(s.sub, s.stage, 3) + cell(fm(s.amt), s.ev) + `<div class="mbc"><b>${pill(s.st === 'Paid' ? 'tg' : 'ta', s.st)}</b><small></small></div>`)).join('') : '')
    + (['pur', 'del', 'com'].includes(app) && OPENP.includes(p.ph) ? `<div style="display:flex;gap:8px;margin-top:12px">${nx('orNew', p.id, 'Raise an order')}${nx('vaNew', p.id, 'Variation or additional cost', 'sec')}</div>` : ''); }

/* =================== Schemes: settings per scheme, with a change log =================== */
function scFicha0(app, s){ const tabs = [['res', 'Summary'], ['prs', `Properties (${prsOf(s.id).length})`], ...(canMoney(app) ? [['mon', 'Money']] : []), ...(['dir', 'com', 'new'].includes(app) ? [['set', 'Settings']] : [])], t = tabOf(tabs), ps = prsOf(s.id), m = scMoney(s), [rt, rl] = rating(s);
  let body = '';
  if(t === 'res') body = `<div class="cstats">${stat('tk', 'Properties', `${ps.filter(p => p.ph !== 'Cancelled').length} of ${s.tgt}`)}${stat('to', 'Installed', ps.filter(p => pIdx(p.ph) >= 5 && p.ph !== 'Cancelled').length)}${stat('tred', 'Blocked or over time', ps.filter(p => isBlocked(p) || late(p) === 'red').length)}${stat(rt, 'Rating', rl)}</div>` + kv([['Client', s.cl, s.reg], ['Programme', PROGS.find(x => x.id === s.prog).n, `${s.ty} type, ${PTYPE[s.ty].sys}`], ['Contract lead', PEO[s.lead].n, s.st]]) + grpH('Properties by phase', ps.length) + PH.map(ph => { const n = ps.filter(p => p.ph === ph).length; return n ? rdiv(cell(ph, '', 1.6) + `<div class="mbc" style="flex:3;justify-content:center">${bar1(n / ps.length * 100)}</div>` + cell(n, '')) : ''; }).join('');
  if(t === 'prs') body = prList(ps, 'all');
  if(t === 'mon') body = `<div class="cstats">${stat('tb', 'Value won', fm(m.won))}${stat(m.mgp < s.set.mg ? 'tred' : 'tg', 'Forecast margin', pc(m.mgp), `target ${s.set.mg}%`)}${stat('to', 'Invoiced', fm(m.inv), `${fm(m.paid)} paid, ${fm(m.owed)} owed to us`)}${stat('tk', 'Owed to suppliers', fm(m.sup))}</div>` + th(cell('Property', 'Phase', 2.4) + cell('Quoted', '') + cell('Forecast cost', 'Actual') + cell('Margin', '')) + ps.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled').map(p => { const x = pMoney(p); return rowO('prMon', p.id, tcell('prMon', p.id, esc(p.ad), p.ph, 2.4) + cell(fm(x.q), '') + cell(fm(x.fc), fm(x.act)) + `<div class="mbc"><b>${mgTag(x.mgp, s.set.mg)}</b><small>${x.over ? 'over budget' : ''}</small></div>`); }).join('');
  if(t === 'set') body = `<section class="rsec"><div class="rs-h"><h3>Scheme settings</h3><p>Change them at any time, without a rebuild. Every change is logged.</p></div><div class="rf-2">${[['mg', 'Margin target (%)'], ['ord', 'Order approval limit (£)'], ['pay', 'Subcontractor payment limit (£)'], ['vr', 'Variation and additional cost limit (£)'], ['terms', 'Payment terms (days)']].map(([k, n]) => fld(n, 'scs', `${s.id}|${k}`, s.set[k], {type:'number'})).join('')}</div></section>` + grpH('Change log', s.log.length) + (s.log.length ? s.log.slice().reverse().map(([d, w, f, a, b]) => rdiv(cell(f, `${a} to ${b}`, 2) + cell(fmtDy(d), PEO[w].n))).join('') : empty('No changes yet.'));
  return crumb('fichaback', 'Back', esc(s.n)) + oph(esc(s.n), `${s.cl}, ${s.reg}. ${s.ty} type, client system ${PTYPE[s.ty].sys}.`) + tabsBar(tabs) + body; }
IN.scs = t => { const [id, k] = t.dataset.k.split('|'), s = scOf(id), v = numIn(t.value); if(v === s.set[k]) return; const last = s.log[s.log.length - 1]; if(last && last[2] === k && last[0] === TODAY){ last[4] = v; } else s.log.push([TODAY, ME(), k, s.set[k], v]); s.set[k] = v; refocus(render); };

/* =================== Lists shared by the apps =================== */
const prHead = money => th(cell('Property', 'Scheme', 2.4) + cell('Phase', 'Owner', 1.5) + cell('Measures', '') + cell('Next', '', 2) + (money ? cell('Days in phase', 'or forecast margin') : cell('In phase', '')));
const prRow = (p, money) => { const g = phGate(p), sc = scOf(p.sc); return rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), `${p.id}, ${sc.n}`, 2.4) + `<div class="mbc" style="flex:1.5"><b>${phTag(p)}</b><small>${RN(PHOWN[p.ph])}</small></div>` + cell(p.ms.map(x => MEAS[x.m].s).join(', '), p.ht || '') + cell(OPENP.includes(p.ph) ? (g.ok ? `Ready for ${PH[pIdx(p.ph) + 1].slice(3)}` : esc(g.miss[0])) : p.ph, g.miss.length > 1 ? `and ${g.miss.length - 1} more` : '', 2) + (money && pIdx(p.ph) >= 2 && p.ph !== 'Cancelled' ? `<div class="mbc"><b>${mgTag(pMoney(p).mgp, sc.set.mg)}</b><small></small></div>` : `<div class="mbc"><b class="${late(p) === 'red' ? 'rf-od' : late(p) ? 'lt79' : ''}" title="${late(p) ? 'Over the phase limit' : ''}">${OPENP.includes(p.ph) ? daysIn(p) + ' days' : ''}</b><small></small></div>`), S.hl === p.id); };
function prList(xs, key){ const app = S.view, sf = key === 'all' ? '' : S.f.sc || '', q = norm(S.f.prq), v = S.f.prf || 'open';
  const ys = xs.filter(p => (!sf || p.sc === sf) && (v === 'all' || (v === 'open' ? OPENP.includes(p.ph) : !OPENP.includes(p.ph))) && (!q || norm(p.ad + p.id + p.res + p.pc + p.ref).includes(q)));
  return `<div class="rf-bar"><div class="isearch" style="flex:1;min-width:240px">${ico('search', 18)}<input type="search" data-in="f" data-k="prq" placeholder="Search an address, postcode, customer or client reference" value="${esc(S.f.prq || '')}"></div>${seg('prf', v, [['open', 'Open'], ['closed', 'Paid and cancelled'], ['all', 'All']])}</div>` + (key === 'all' ? '' : `<div class="rf-bar">${seg('scf', sf, [['', 'All schemes'], ...DB.sc.map(s => [s.id, s.n, prsOf(s.id).filter(p => OPENP.includes(p.ph)).length])])}</div>`)
    + prHead(canMoney(app)) + (PH.map(ph => { const zs = ys.filter(p => p.ph === ph); return zs.length ? grpH(ph, zs.length) + zs.map(p => prRow(p, canMoney(app))).join('') : ''; }).join('') || empty('No properties match.')); }
A.prf = el => { S.f.prf = el.dataset.v; render(); };
A.scf = el => { S.f.sc = el.dataset.v; render(); };
A.prOpen = el => { const [id, t] = el.dataset.v.split('|'); abrir(S.view, id, t || 'res'); };
A.prMon = el => abrir(S.view, el.dataset.v, 'mon');

/* =================== DIRECTOR OVERVIEW: business, programme, scheme, property, cost line =================== */
function ovwPage(){ const ms = DB.sc.map(s => [s, scMoney(s)]), won = sum(ms, x => x[1].won), fc = sum(ms, x => x[1].fc);
  return oph('Business overview', 'Every programme and scheme at a glance. Click a scheme, then a property, then its money down to the cost line.')
    + `<div class="cstats">${stat('tb', 'Value won', fm(won), 'approved by clients')}${stat(won && (won - fc) / won * 100 < 22 ? 'ta' : 'tg', 'Forecast margin', pc(won ? (won - fc) / won * 100 : 0))}${stat('to', 'Owed to us', fm(sum(ms, x => x[1].owed)), `${fm(sum(ms, x => x[1].paid))} paid`)}${stat('tk', 'Owed by us', fm(sum(ms, x => x[1].sup)), 'suppliers and subcontractors')}</div>`
    + `<div class="cstats">${stat('tred', 'Blocked', DB.pr.filter(isBlocked).length, 'hold points and decisions')}${stat('ta', 'Over time', DB.pr.filter(p => late(p) === 'red').length, 'past the phase limit')}${stat('tv', 'Approvals waiting', approvals().length, `${approvals().filter(a => a.role === 'dir').length} for a director`, 'gogo', 'dir:wait')}${stat('tb', 'Variations and extra costs', fm(sum(DB.va.filter(v => v.st !== 'Rejected'), v => v.amt)), plural(DB.va.length, 'item', 'items'))}</div>`
    + PROGS.map(pg => { const ss = ms.filter(([s]) => s.prog === pg.id); return grpH(pg.n, ss.length) + th(cell('Scheme', 'Client', 2.4) + cell('Properties by phase', '', 2.6) + cell('Won', 'Invoiced') + cell('Margin', 'target') + cell('Rating', '')) + ss.map(([s, m]) => { const ps = prsOf(s.id), [rt, rl] = rating(s); return rowO('ficha', s.id, tcell('ficha', s.id, esc(s.n), `${s.cl}, ${s.st}`, 2.4) + `<div class="mbc" style="flex:2.6"><div class="rf-phb">${OPENP.concat(['Paid']).map(ph => { const n = ps.filter(p => p.ph === ph).length; return `<span class="${PHS[ph]}" style="flex:${n || .0001}" title="${ph}: ${n}">${n || ''}</span>`; }).join('')}</div><small>${ps.filter(p => p.ph !== 'Cancelled').length} of ${s.tgt}</small></div>` + cell(fm(m.won), fm(m.inv)) + `<div class="mbc"><b>${m.won ? mgTag(m.mgp, s.set.mg) : ''}</b><small>${s.set.mg}%</small></div>` + `<div class="mbc"><b>${pill(rt, rl)}</b><small></small></div>`, S.hl === s.id); }).join(''); }).join('')
    + hint('Phases: ' + OPENP.concat(['Paid']).map(ph => `<span class="pill ${PHS[ph]}">${ph}</span>`).join(' ')); }
function rolPage(){ return oph('Roles', 'Every step is owned by a role, not a name. Assign each role to a person; when the restructure changes, change it here.') + th(cell('Role', 'Responsible for', 2.4) + cell('Assigned to', '', 2)) + Object.entries(ROLES).map(([k, [n, w]]) => rdiv(cell(n, ROLEDO[k], 2.4) + `<div class="mbc" style="flex:2">${cbx('', 'rol' + k, Object.entries(PEO).map(([pk, p]) => [pk, p.n, p.r]), w, 'rol', {ph:'To assign'})}</div>`)).join(''); }
const ROLEDO = {sad:'Booking assessments, client system at survey stage', ass:'The assessment visit', aap:'Assessment evidence and modelling', dsg:'Retrofit design', dap:'Design review', inc:'Trades, scaffold, materials, client system at install', oap:'Material orders and trade bookings', pap:'Subcontractor payments', com:'Rates, quotes, budgets, variations', acc:'Invoices and payments', dir:'Approvals above the scheme limits, margin alerts', hse:'Safety paperwork, insurances, accreditations'};
IN.rol = t => { const r = t.dataset.k.slice(3); ROLES[r][1] = t.value; toast(`${RN(r)}: ${PEO[t.value].n}.`); };

/* =================== RETROFIT: phases A and B =================== */
function bkPage(){ const xs = DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph));
  return oph('Assessment bookings', 'New jobs to book, and assessments booked or to revisit. Bookings go to Microsoft 365 calendars once connected.') + th(cell('Property', 'Scheme and reference', 2.4) + cell('Assessment', 'Assessor', 1.6) + cell('Revisits', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + xs.map(p => rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), `${scOf(p.sc).n}, ${p.ref}`, 2.4) + cell(!p.b.bk ? 'Not booked' : p.b.vis ? 'Done' : p.b.revisits ? 'Revisit booked' : `Booked ${p.b.on ? fmtDy(p.b.on) : ''}`, RP('ass'), 1.6) + cell(p.b.revisits || '', '') + btns(!p.b.bk ? nx('bBook', p.id, 'Book') : !p.b.vis ? nx('bVis', p.id, 'Visit done') : ''), S.hl === p.id)).join(''); }
function rqPage(){ const xs = DB.pr.filter(p => p.ph === 'B. Assess and design');
  return oph('Review and design queue', 'Each property in phase B with the step it is on. Reviews go to the Approvals inbox.') + th(cell('Property', 'Scheme', 2.4) + cell('Step', 'Owner', 2) + cell('Evidence', '') + cell('Rating', '')) + xs.map(p => { const st = BSTEPS.find(([k]) => !(k === 'bk' ? p.b.bk : k === 'vis' ? p.b.vis : k === 'rev' ? p.b.rev === 'Approved' : k === 'docs' ? docsOf(p).every(n => p.b.docs.includes(n)) : k === 'mod' ? !!p.b.mod : k === 'dsg' ? p.ms.every(x => x.dsg) : k === 'drev' ? p.ms.every(x => x.dap) : p.b.ts)) || [null, 'Survey pack ready', 'sad'];
    return rowO('prRet', p.id, tcell('prRet', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + cell(st[1], RN(st[2]), 2) + cell(`${p.b.ev.length} of ${EVID.length}`, '') + cell(p.b.mod ? `${p.b.mod.pre} to ${p.b.mod.post}` : '', ''), S.hl === p.id); }).join(''); }
A.prRet = el => abrir(S.view, el.dataset.v, 'ret');
function packPage(){ const xs = DB.pr.filter(p => ['B. Assess and design', 'C. Client approval'].includes(p.ph));
  return oph('Survey pack and client systems', 'Where each pack stands in the client’s own system, and what is waiting to be updated there.') + th(cell('Property', 'Scheme', 2.4) + cell('Client system', 'Status', 2) + cell('Waiting on', '', 2) + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + xs.map(p => rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + cell(ptOf(p).sys, csName(p), 2) + cell(p.csTodo ? 'Us: update ' + ptOf(p).sys : p.ph === 'C. Client approval' ? 'The client' : 'Our checks', p.csTodo || '', 2) + btns(p.csTodo ? nx('csDone', p.id, 'Mark as updated') : p.ph === 'C. Client approval' ? nx('csStep', p.id, 'Next status', 'sec') : ''), S.hl === p.id)).join(''); }

/* =================== DELIVERY: phases D and E, hold points, client systems =================== */
function rdyPage(){ const xs = DB.pr.filter(p => p.ph === 'D. Prepare to install');
  return oph('Ready to install', 'Every phase D item per property. A property shows Ready to install by itself when everything that applies is done.') + `<div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Property</th>${DITEMS.map(([, n]) => `<th>${n.split(' ').slice(0, 2).join(' ')}</th>`).join('')}<th>Ready</th></tr></thead><tbody>${xs.map(p => `<tr><td><button class="lnk4" data-act="prIns" data-v="${p.id}"><b>${esc(p.ad)}</b></button><small class="mini" style="display:block">${scOf(p.sc).n}</small></td>${DITEMS.map(([k]) => `<td>${p.dna[k] ? '<b class="z">n/a</b>' : p.d[k] === 'Done' ? pill('tg', 'Done') : p.d[k] === 'Not booked' ? pill('tk', 'Not booked') : pill('ta', p.d[k])}</td>`).join('')}<td>${ready(p) ? pill('tg', 'Ready') : ''}</td></tr>`).join('')}</tbody></table></div></div>`; }
A.prIns = el => abrir(S.view, el.dataset.v, 'ins');
function holdPage(){ const xs = DB.pr.filter(p => tyOf(p) === 'Redbridge' && OPENP.includes(p.ph));
  return oph('Redbridge tracker', 'Per property, the percentage complete by group and overall, with open hold points. Not applicable groups are left out of the percentages.') + `<div class="cstats">${stat('tb', 'Properties', xs.length)}${stat('tg', 'Average complete', pc(xs.length ? sum(xs, grpPct) / xs.length : 0))}${stat('tred', 'Hold points open', xs.filter(p => p.hold || p.hold2).length)}</div><div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Property</th><th>House</th>${RGROUPS.map(([, n]) => `<th>${n}</th>`).join('')}<th>Overall</th></tr></thead><tbody>${xs.map(p => `<tr><td><button class="lnk4" data-act="prIns" data-v="${p.id}"><b>${esc(p.ad)}</b></button></td><td>${p.ht}</td>${RGROUPS.map(([k]) => `<td>${p.g[k] === 'Not applicable' ? '<b class="z">n/a</b>' : pill(GSTT[p.g[k]], p.g[k] === 'Complete' ? '100%' : p.g[k] === 'In progress' ? ((p.gp || {})[k] || 50) + '%' : p.g[k] === 'Not started' ? '0%' : p.g[k])}</td>`).join('')}<td><b>${grpPct(p)}%</b></td></tr>`).join('')}</tbody></table></div></div>`; }
function csPage(){ const xs = DB.pr.filter(p => p.csTodo);
  return oph('Client system updates', 'Dynamics, Shareworks and PAS Hub are updated by hand: The system reminds the owner and keeps the tick.') + (xs.length ? th(cell('Property', 'Scheme', 2.4) + cell('System', 'Now', 1.6) + cell('To do', '', 3) + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + xs.map(p => rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + cell(ptOf(p).sys, csName(p), 1.6) + cell(esc(p.csTodo), '', 3) + btns(nx('csDone', p.id, 'Mark as updated')), S.hl === p.id)).join('') : empty('All client systems are up to date.')); }

/* =================== PURCHASING: every order, committed when approved, actual when invoiced =================== */
function ordPage(){ const st = S.f.ost || 'all', q = norm(S.f.oq), xs = DB.or.filter(o => (!S.f.oct || o.ct === S.f.oct) && (st === 'all' || (st === 'open' ? o.st !== 'Invoiced' && o.st !== 'Rejected' : o.st === st)) && (!q || norm(o.id + o.sup + o.ct + o.al.map(a => a.pr ? prOf(a.pr).ad : '').join(' ')).includes(q)));
  return oph('Orders', 'One list of every order: requested, rejected, ordered, delivered, invoiced. Open a line for its properties and measures.', nx('orNew', '', 'Raise an order')) + `${ordBar57(st)}`
    + th(cell('Order', 'Supplier', 2) + cell('For', 'Measure and cost type', 2.4) + cell('Amount', '') + cell('Status', 'Approved by') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + xs.map(o => rdiv(cell(o.id, o.sup, 2) + cell(o.al.length > 1 ? `Split across ${o.al.length} properties` : esc(prOf(o.al[0].pr).ad), o.al.length > 1 ? o.al.map(a => `${prOf(a.pr).id} ${fm(a.a)}`).join(', ') : `${MEAS[o.al[0].m].s}, ${o.ct}`, 2.4) + cell(fm(o.amt), fmtDy(o.on)) + `<div class="mbc"><b>${pill(o.st === 'Invoiced' ? 'tg' : o.st === 'Requested' ? 'ta' : o.st === 'Rejected' ? 'tred' : 'tb', o.st)}</b><small>${o.st === 'Requested' ? 'In the Approvals inbox' : o.inv || ''}</small></div>` + btns(o.st === 'Ordered' ? nx('orDel', o.id, 'Delivered', 'sec') : o.st === 'Delivered' ? nx('orInv', o.id, 'Invoice matched', 'sec') : ''), S.hl === o.id, o.id)).join(''); }
A.ost = el => { S.f.ost = el.dataset.v; render(); };
A.orDel = el => { const o = DB.or.find(x => x.id === el.dataset.v); o.st = 'Delivered'; render(); toast('Delivered to site.'); };
A.orInv = el => { const o = DB.or.find(x => x.id === el.dataset.v); o.st = 'Invoiced'; o.inv = 'SINV-' + (9000 + (++DB.seq.or)); render(); toast(`Supplier invoice matched: ${fm(o.amt)} is now actual cost.`); };
A.orNew = el => { const pr = el.dataset.v || ''; S.modal = {k:'or', al:pr ? [{pr, m:prOf(pr).ms[0].m, a:''}] : [{pr:'', m:'', a:''}], sup:'', ct:'Materials'}; renderLayer(); };
MODALS.or = m => { const tot = sum(m.al, a => numIn(a.a)), p0 = m.al[0].pr ? prOf(m.al[0].pr) : null, lim = p0 ? scOf(p0.sc).set.ord : 0, ok = m.sup && m.al.every(a => a.pr && a.m && numIn(a.a) > 0);
  return modal('Raise an order', 'Every order is tagged to a property and a measure. A bulk order is split across the properties it was bought for.', cbx('Supplier', 'osup', SUPS.map(s => [s, s]), m.sup, 'm', {req:true, ph:'Choose a supplier...'}) + mlab('Cost type', true) + mseg('ct', m.ct, CTYPES)
    + mlab('Properties and measures', true) + m.al.map((a, i) => `<div class="rf-al">${cbx('', 'oapr' + i, DB.pr.filter(p => OPENP.includes(p.ph)).map(p => [p.id, p.ad, p.id]), a.pr, 'oal', {ph:'Property...'})}${a.pr ? cbx('', 'oam' + i, prOf(a.pr).ms.map(x => [x.m, MEAS[x.m].n]), a.m, 'oal', {ph:'Measure...'}) : '<span></span>'}<input class="um-in" inputmode="decimal" data-in="oaa" data-k="${i}" value="${esc(a.a)}" placeholder="£"></div>`).join('') + `<button type="button" class="btn sec sm" data-act="oAdd">${ico('plus', 13)}Split across another property</button>`
    + `<p class="hint">${tot ? `Total ${fm(tot)}. ${lim && tot > lim ? `Over the ${scOf(p0.sc).n} limit of ${fm(lim)}: it goes to the Director.` : 'It goes to the Order approver.'}` : ''}</p>`, mfoot('Send for approval', 'orOk2', ok), 680); };
IN.oal = t => { const k = t.dataset.k, i = +k.slice(3), f = k.slice(0, 3) === 'oap' ? 'pr' : 'm'; S.modal.al[i][f] = t.value; if(f === 'pr') S.modal.al[i].m = prOf(t.value).ms[0].m; };
IN.oaa = t => { S.modal.al[+t.dataset.k].a = t.value; refocus(renderLayer); };
A.oAdd = () => { S.modal.al.push({pr:'', m:'', a:''}); renderLayer(); };
A.orOk2 = () => { const m = S.modal, o = {id:'PO-' + (++DB.seq.or), al:m.al.map(a => ({pr:a.pr, m:a.m, a:numIn(a.a)})), ct:m.ct, sup:m.sup, amt:sum(m.al, a => numIn(a.a)), st:'Requested', on:TODAY, by:ME()}; DB.or.push(o); S.modal = null; render(); toast(`${o.id} sent for approval. It shows in the Approvals inbox.`); };

/* =================== COMMERCIAL (next phase): margins, variations, rates =================== */
function mrgPage(){ return oph('Margins', 'Quoted value, forecast cost and margin per scheme and property, against each scheme’s target.') + DB.sc.map(s => { const ps = prsOf(s.id).filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled'), m = scMoney(s); return ps.length ? grpH(`${s.n}, target ${s.set.mg}%`, m.won ? pc(m.mgp) : '') + ps.map(p => { const x = pMoney(p); return rowO('prMon', p.id, tcell('prMon', p.id, esc(p.ad), p.ph, 2.4) + cell(fm(x.q), 'quoted') + cell(fm(x.fc), `budget ${fm(x.b)}`) + `<div class="mbc"><b>${mgTag(x.mgp, s.set.mg)}</b><small>${x.over ? 'over budget' : fm(x.mg)}</small></div>`); }).join('') : ''; }).join(''); }
function varPage(){ return oph('Variations and additional costs', 'A variation is extra scope the client pays for; an additional cost is extra cost we carry. Both are tagged to a property and measure, with a reason and evidence.', nx('vaNew', '', 'Raise one')) + th(cell('Item', 'Property and measure', 2.6) + cell('Type', '') + cell('Amount', 'Evidence') + cell('Status', '')) + DB.va.map(v => rdiv(cell(`${v.id} ${esc(v.why)}`, `${prOf(v.pr).ad}, ${MEAS[v.m].s}`, 2.6) + cell(v.ty, '') + cell(fm(v.amt), v.ev) + `<div class="mbc"><b>${pill(v.st === 'Approved' ? 'tg' : v.st === 'Rejected' ? 'tred' : 'ta', v.st)}</b><small></small></div>`)).join(''); }
A.vaNew = el => { S.modal = {k:'va', pr:el.dataset.v || '', m:'', ty:'Variation', why:'', amt:'', ev:''}; renderLayer(); };
MODALS.va = m => { const p = m.pr ? prOf(m.pr) : null, ok = p && m.m && m.why.trim() && numIn(m.amt) > 0 && m.ev; return modal('Variation or additional cost', 'Approved internally, by the Director above the scheme limit; a variation then needs the client.', mlab('Type', true) + mseg('ty', m.ty, ['Variation', 'Additional cost']) + cbx('Property', 'vapr', DB.pr.filter(x => OPENP.includes(x.ph)).map(x => [x.id, x.ad, x.id]), m.pr, 'm', {req:true}) + (p ? mlab('Measure', true) + mseg('m', m.m, p.ms.map(x => [x.m, MEAS[x.m].n])) : '') + fld('Reason', 'm', 'why', m.why, {req:true, ph:'e.g. Extra scaffold lift on the rear'}) + `<div class="rf-2">${fld('Amount (£)', 'm', 'amt', m.amt, {type:'number', req:true})}<label class="tsel"><small>Evidence <em class="req">required</em></small><label class="btn sec sm el-up">${ico('upload', 13)}${m.ev ? esc(m.ev) : 'Upload'}<input type="file" data-in="vaev"></label></label></div>`, mfoot('Send for approval', 'vaOk2', ok), 620); };
IN.vaev = t => { if(t.files && t.files[0]){ S.modal.ev = t.files[0].name; renderLayer(); } };
A.vaOk2 = () => { const m = S.modal; DB.va.push({id:'VA-' + (++DB.seq.va), ty:m.ty, pr:m.pr, m:m.m, why:m.why.trim(), amt:numIn(m.amt), st:'Waiting internal approval', ev:m.ev, on:TODAY}); S.modal = null; render(); toast('Sent for approval. It shows in the Approvals inbox.'); };
A.vaClient = el => { const v = DB.va.find(x => x.id === el.dataset.v); v.st = 'Approved'; render(); toast('Client approved: the quoted value and the budget are updated.'); };
function ratePage(){ return oph('Rates per programme', 'The agreed price per measure, loaded when a scheme is set up. The quote per measure is built from these.') + th(cell('Measure', '', 2) + Object.keys(RATE).map(t => cell(t, 'price')).join('')) + Object.keys(MEAS).map(m => rdiv(cell(MEAS[m].n, '', 2) + Object.keys(RATE).map(t => cell(RATE[t][m] ? fm(RATE[t][m]) : '', RATE[t][m] ? `budget ${fm(RATE[t][m] * BUD)}` : '')).join(''))).join(''); }

/* =================== ACCOUNTS (next phase): triggers, invoices, payments =================== */
function invPage(){ return oph('Invoices', 'Payment triggers met, invoices raised, due and overdue. Invoices are created as drafts in Xero once connected.') + th(cell('Invoice', 'Property', 2.4) + cell('Amount', 'Scheme') + cell('Due', 'Raised') + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + DB.inv.map(v => { const p = prOf(v.pr); return rdiv(cell(v.id, esc(p.ad), 2.4) + cell(fm(v.amt), scOf(p.sc).n) + cell(fmtDy(v.due), fmtDy(v.on)) + `<div class="mbc"><b>${v.paid ? pill('tg', 'Paid') : dDiff(v.due) < 0 ? pill('tred', `${-dDiff(v.due)} days overdue`) : pill('to', 'Waiting')}</b><small></small></div>` + btns(v.paid ? '' : nx('invPaid', v.id, 'Mark paid'))); }).join(''); }
A.invNew = el => { const p = prOf(el.dataset.v), sc = scOf(p.sc), v = {id:'INV-' + (++DB.seq.inv), pr:p.id, amt:pMoney(p).q, on:TODAY, due:addDays(TODAY, sc.set.terms), paid:null}; DB.inv.push(v); his(p, `Invoice ${v.id} for ${fm(v.amt)}, due ${fmtDy(v.due)}`, 'lan'); render(); toast(`${v.id} raised, due in ${sc.set.terms} days (${sc.n} terms).`); };
A.invPaid = el => { const v = DB.inv.find(x => x.id === el.dataset.v), p = prOf(v.pr); v.paid = TODAY; if(p.ph === 'F. Close out'){ p.ph = 'Paid'; p.phOn = TODAY; } his(p, `${v.id} paid`, 'lan'); render(); toast('Paid. The scheme’s numbers update.'); };
function subPage(){ return oph('Subcontractor payments', 'Approved against evidence of the completed stage, then paid.') + th(cell('Subcontractor', 'Property', 2.4) + cell('Stage', 'Evidence', 2) + cell('Amount', '') + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + DB.sp.map(s => rdiv(cell(s.sub, prOf(s.pr).ad, 2.4) + cell(s.stage, s.ev, 2) + cell(fm(s.amt), '') + `<div class="mbc"><b>${pill(s.st === 'Paid' ? 'tg' : 'ta', s.st)}</b><small></small></div>` + btns(s.st === 'Approved' ? nx('spPaid', s.id, 'Mark paid') : ''))).join(''); }
A.spPaid = el => { const s = DB.sp.find(x => x.id === el.dataset.v); s.st = 'Paid'; render(); toast('Paid: it counts as actual cost on its measure.'); };

/* =================== SITE FORMS (next phase): from a phone, no board access =================== */
function frmPage(){ const p = prOf(S.f.mp || 'PR-2018'), xs = DB.pr.filter(x => x.ph === 'E. Install');
  return oph('Site forms', 'What a site team or subcontractor sees on the phone: their job, its checklist, photos with location and time, and a way to flag a problem. No account needed.') + `<div class="rf-bar">${seg('mp', p.id, xs.map(x => [x.id, x.ad]))}</div><div class="rf-phone"><div class="rf-ph-h"><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}</small></div>${(tyOf(p) === 'Redbridge' ? RGROUPS.filter(([k]) => p.g[k] !== 'Not applicable').map(([k, n]) => `<div class="rf-dl${p.g[k] === 'Complete' ? ' ok' : ''}"><span class="rf-ck">${p.g[k] === 'Complete' ? ico('check', 14, 2.6) : ''}</span><div><b>${n}</b><small>${p.g[k]}</small></div></div>`) : p.ms.map(x => `<div class="rf-dl${x.ip >= 100 ? ' ok' : ''}"><span class="rf-ck"></span><div><b>${MEAS[x.m].n}</b><small>${x.ip}%</small></div></div>`)).join('')}<label class="btn pri el-up" style="width:100%;justify-content:center">${ico('camera', 15)}Add photos<input type="file" accept="image/*" data-in="mph" multiple></label>${(p.ph2 || []).map(f => `<small class="mini" style="display:block">${esc(f)}</small>`).join('')}<button class="btn sec" style="width:100%;margin-top:8px" data-act="mFlag" data-v="${p.id}">${ico('flag', 15)}Flag a problem</button></div>`; }
A.mp = el => { S.f.mp = el.dataset.v; render(); };
IN.mph = t => { const p = prOf(S.f.mp || 'PR-2018'); p.ph2 = p.ph2 || []; [...(t.files || [])].forEach(f => p.ph2.push(`${f.name}, ${fmtDy(TODAY)} 10:42, 51.59 N 0.08 E`)); his(p, `${t.files.length} site photos uploaded with location and time`, 'akr'); render(); toast('Photos saved with location and time.'); };
A.mFlag = el => { const p = prOf(el.dataset.v); DB.tk.push({id:'TK-' + (++DB.seq.tk), t:`Problem flagged on site: ${p.ad}`, r:'inc', due:TODAY, src:'Site form', done:false}); render(); toast('Flagged. The Install coordinator has a task.'); };

/* =================== TASKS AND MEETINGS (next phase) =================== */
function tkPage(){ return oph('Tasks', 'Tasks from the weekly meetings and from jobs, by role.', nx('tkNew', '', 'Add a task')) + th(cell('Task', 'From', 3) + cell('Owner', '') + cell('Due', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + DB.tk.slice().sort((a, b) => a.due < b.due ? -1 : 1).map(k => rdiv(cell(esc(k.t), k.src, 3) + cell(RN(k.r), RP(k.r)) + `<div class="mbc"><b>${k.done ? pill('tg', 'Done') : dDiff(k.due) < 0 ? pill('tred', fmtD(k.due)) : fmtD(k.due)}</b><small></small></div>` + btns(k.done ? '' : nx('tkDone', k.id, 'Mark done', 'sec')))).join(''); }
A.tkDone = el => { DB.tk.find(k => k.id === el.dataset.v).done = true; render(); toast('Done.'); };
A.tkNew = () => { S.modal = {k:'tk', t:'', r:'', d:''}; renderLayer(); };
MODALS.tk = m => modal('Add a task', 'With an owner role and a due date.', fld('Task', 'm', 't', m.t, {req:true, ph:'e.g. Send Waverley archetype list'}) + mlab('Owner', true) + mseg('r', m.r, Object.entries(ROLES).map(([k, [n]]) => [k, n])) + fld('Due', 'm', 'd', m.d, {type:'date', req:true}), mfoot('Add task', 'tkOk', m.t.trim() && m.r && m.d), 600);
A.tkOk = () => { const m = S.modal; DB.tk.push({id:'TK-' + (++DB.seq.tk), t:m.t.trim(), r:m.r, due:m.d, src:'Meeting', done:false}); S.modal = null; render(); toast('Task added.'); };
function repPage(){ const w = S.f.mt || 'mon', xs = DB.tk.filter(k => !k.done);
  const sch = DB.sc.map(s => { const ps = prsOf(s.id); return rdiv(cell(s.n, s.cl, 2) + OPENP.map(ph => cell(ps.filter(p => p.ph === ph).length, ph.slice(0, 1))).join('') + cell(ps.filter(p => isBlocked(p) || late(p)).length, 'blocked or late')); }).join('');
  return oph('Meeting reports', 'Run the meetings from here: Monday and Thursday for the whole team with no money, Tuesday for the directors.') + `<div class="rf-bar">${seg('mt', w, [['mon', 'Monday, team'], ['thu', 'Thursday, follow up'], ['tue', 'Tuesday, directors']])}</div>`
    + (w === 'mon' ? grpH('Progress per scheme', DB.sc.length) + sch + grpH('Tasks due this week', xs.filter(k => dDiff(k.due) <= 7).length) + xs.filter(k => dDiff(k.due) <= 7).map(k => rdiv(cell(esc(k.t), RN(k.r), 3) + cell(fmtD(k.due), ''))).join('')
      : w === 'thu' ? grpH('Actions and tasks', xs.length) + xs.map(k => rdiv(cell(esc(k.t), k.src, 3) + cell(RN(k.r), RP(k.r)) + cell(fmtD(k.due), ''))).join('')
      : `<div class="cstats">${stat('tv', 'Approvals waiting', approvals().length)}${stat('to', 'Owed to us', fm(sum(DB.sc, s => scMoney(s).owed)))}${stat('tk', 'Owed by us', fm(sum(DB.sc, s => scMoney(s).sup)))}${stat('ta', 'Variations and extra costs', fm(sum(DB.va, v => v.amt)))}</div>` + grpH('Margin per scheme', DB.sc.length) + DB.sc.map(s => { const m = scMoney(s); return rdiv(cell(s.n, `target ${s.set.mg}%`, 2) + cell(fm(m.won), 'won') + `<div class="mbc"><b>${m.won ? mgTag(m.mgp, s.set.mg) : ''}</b><small></small></div>`); }).join('')); }
A.mt = el => { S.f.mt = el.dataset.v; render(); };

/* =================== NEW SCHEME SETUP (next phase) =================== */
function nscPage(){ return oph('New scheme', 'Create a scheme from a template or copy an existing one: stages, checklists and settings come with it, and it appears in the Director overview.') + `<section class="rsec"><div class="rs-h"><h3>Templates</h3></div>${DB.tpl.map(t => rdiv(cell(t.n, `from ${scOf(t.from).n}`, 2) + btns(nx('nsOpen', t.from, 'Use template')))).join('')}${rdiv(cell('Blank', 'Phases A and B only', 2) + btns(nx('nsOpen', '', 'Start blank', 'sec')))}</section><section class="rsec"><div class="rs-h"><h3>Or copy a scheme</h3></div>${DB.sc.map(s => rdiv(cell(s.n, `${s.ty} type, ${s.cl}`, 2) + btns(nx('nsOpen', s.id, 'Copy', 'sec') + nx('nsTpl', s.id, 'Save as template', 'sec')))).join('')}</section>`; }
A.nsTpl = el => { const s = scOf(el.dataset.v); DB.tpl.push({n:`${s.n} template`, from:s.id}); render(); toast(`${s.n} saved as a template.`); };
A.nsOpen = el => { const s = el.dataset.v ? scOf(el.dataset.v) : null; S.modal = {k:'ns', from:el.dataset.v, n:'', cl:'', reg:s ? s.reg : '', prog:s ? s.prog : 'NONE', tgt:''}; renderLayer(); };
MODALS.ns = m => { const s = m.from ? scOf(m.from) : null; return modal('New scheme', s ? `Starting from ${s.n}: ${s.ty} stages, checklists and settings.` : 'Blank: phases A and B, settings to fill in.', `<div class="rf-2">${fld('Scheme name', 'm', 'n', m.n, {req:true, ph:'e.g. E.ON Swale'})}${fld('Client', 'm', 'cl', m.cl, {req:true, ph:'e.g. Swale Borough Council'})}</div><div class="rf-2">${fld('Region', 'm', 'reg', m.reg, {ph:'e.g. Kent'})}${fld('Target properties', 'm', 'tgt', m.tgt, {type:'number'})}</div>` + mlab('Programme manager') + mseg('prog', m.prog, PROGS.map(p => [p.id, p.n])), mfoot('Create scheme', 'nsOk', m.n.trim() && m.cl.trim()), 620); };
A.nsOk = () => { const m = S.modal, s0 = m.from ? scOf(m.from) : null, id = 'SC-' + String(DB.sc.length + 1).padStart(2, '0'); DB.sc.push({id, n:m.n.trim(), prog:m.prog, cl:m.cl.trim(), ty:s0 ? s0.ty : 'GLA', reg:m.reg, st:'Starting', tgt:numIn(m.tgt) || 0, lead:'dre', set:s0 ? {...s0.set} : {mg:20, ord:2000, pay:2500, vr:1000, terms:30}, log:[[TODAY, ME(), 'created', s0 ? 'copied from ' + s0.n : 'blank', 'live']]}); S.modal = null; abrir(S.view, id, 'set'); toast('Scheme created. It already shows in the Director overview.'); };

/* =================== The ten apps: five now, five in the next phase =================== */
const pageAct = a => 'pg_' + a;
const VIEWS = {};
const nAp = r => approvals().filter(a => !r || a.role === r).length;
VIEWS.dir = {side:() => sbar([['-', 'Decide'], ['dec', 'Needs your decision', 'bell', pend('dir').length, 2], ['-', 'Business'], ['ovw', 'Business overview', 'chart'], ['prs', 'All properties', 'home', DB.pr.filter(p => OPENP.includes(p.ph)).length, 1], ['-', 'Settings'], ['rol', 'Roles', 'users']], S.page.dir, pageAct('dir')),
  pages:{dec:() => atnPage('dir', 'Needs your decision', 'Approvals above the scheme limits, margins below target and jobs over time. Each one opens with its context.'), ovw:ovwPage, prs:() => oph('All properties', 'Every property of every scheme, by phase.') + prList(DB.pr, 'dir'), rol:rolPage}};
VIEWS.apr = {side:() => sbar([['-', 'Approve'], ['apr', 'Waiting for approval', 'checks', nAp(), 2]], S.page.apr, pageAct('apr')), pages:{apr:aprPage}};
VIEWS.ret = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('ret').length, 2], ['bk', 'Bookings', 'cal', DB.pr.filter(p => p.ph === 'A. Job received').length, 1], ['rq', 'Review queue', 'todo', DB.pr.filter(p => p.ph === 'B. Assess and design').length, 1], ['pk', 'Survey pack', 'send']], S.page.ret, pageAct('ret')),
  pages:{atn:() => atnPage('ret', 'Needs attention', 'Jobs to book, revisits, packs ready to send and client system updates at survey stage.'), bk:bkPage, rq:rqPage, pk:packPage}};
VIEWS.del = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('del').length, 2], ['pro', 'Properties', 'home', DB.pr.filter(p => ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph)).length, 1], ['rdy', 'Ready to install', 'checks', DB.pr.filter(p => p.ph === 'D. Prepare to install').length, 1], ['hold', 'Redbridge tracker', 'building'], ['cs', 'Client systems', 'sync', DB.pr.filter(p => p.csTodo).length, 2]], S.page.del, pageAct('del')),
  pages:{atn:() => atnPage('del', 'Needs attention', 'Ready to install, hold points and client systems to update.'), pro:() => oph('Properties', 'Per scheme, every property by phase. Open one for its install checklist, hold points and close out.') + prList(DB.pr, 'del'), rdy:rdyPage, hold:holdPage, cs:csPage}};
VIEWS.pur = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('pur').length, 2], ['ord', 'Orders', 'cart', DB.or.filter(o => o.st !== 'Invoiced' && o.st !== 'Rejected').length, 1]], S.page.pur, pageAct('pur')), pages:{atn:() => atnPage('pur', 'Needs attention', 'Deliveries waiting for the supplier invoice.'), ord:ordPage}};
VIEWS.com = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('com').length, 2], ['mrg', 'Margins', 'trend'], ['var', 'Variations and extra costs', 'swap', DB.va.filter(v => v.st !== 'Approved' && v.st !== 'Rejected').length, 1], ['-', 'Settings'], ['rate', 'Rates', 'tag']], S.page.com, pageAct('com')),
  pages:{atn:() => atnPage('com', 'Needs attention', 'Margins below target, costs over budget and variations waiting for the client.'), mrg:mrgPage, var:varPage, rate:ratePage}};
VIEWS.acc = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('acc').length, 2], ['inv', 'Invoices', 'receipt'], ['sub', 'Subcontractors', 'wallet']], S.page.acc, pageAct('acc')), pages:{atn:() => atnPage('acc', 'Needs attention', 'Payment triggers met, overdue invoices and subcontractors to pay.'), inv:invPage, sub:subPage}};
VIEWS.mob = {side:() => sbar([['-', 'On site'], ['frm', 'Site forms', 'phone']], S.page.mob, pageAct('mob')), pages:{frm:frmPage}};
VIEWS.tsk = {side:() => sbar([['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('tsk').length, 2], ['tk', 'Tasks', 'todo', DB.tk.filter(k => !k.done).length, 1], ['rep', 'Meeting reports', 'chart']], S.page.tsk, pageAct('tsk')), pages:{atn:() => atnPage('tsk', 'Needs attention', 'Overdue tasks.'), tk:tkPage, rep:repPage}};
VIEWS.new = {side:() => sbar([['-', 'Schemes'], ['nsc', 'New scheme', 'plus']], S.page.new, pageAct('new')), pages:{nsc:nscPage}};
APPS.forEach(([a]) => { A[pageAct(a)] = el => { S.fi[a] = null; S.page[a] = el.dataset.v; render(true); }; });

/* =================== VERSIONS: one live link =================== */
const asRole = (r, fn) => () => { S.role = r; S.pop = null; fn(); };
const toHome = () => { S.view = 'home'; render(true); };
const V3STEPS = [
  {t:'A workspace with six apps', min:1, dolor:'Before, ten sections sat in one sidebar and it felt like one app.', show:['The REFYT workspace: six cards, one per team, with the roles that use each.', 'Each app has its own header, sidebar and home.'], say:'One app per team, on the same information.', go:asRole('dir', toHome)},
  {t:'Viewing as a role', min:.5, dolor:'Before, everyone saw everything.', show:['Viewing as Install coordinator: Delivery and Tasks open, the rest locked.'], say:'Each person opens only the apps of their role.', go:asRole('inc', toHome)},
  {t:'Approvals inside each app', min:.5, dolor:'Before, approvals were a separate app.', show:['Waiting for my approval in Retrofit, Delivery, Commercial and Director.', 'The Director only sees what is above a scheme limit.'], say:'Approvers act where they already work.', go:asRole('dir', () => go('del', 'wait'))},
  {t:'Same property, different apps', min:1, dolor:'Before, a property looked the same from everywhere.', show:['22 Clayhall Avenue in Delivery: preparation, install and orders, with money locked.', 'Open it in Commercial for its margin, in Accounts for its invoice.'], say:'One record, seen through each team’s job.', go:asRole('dir', () => abrir('del', 'PR-2017', 'res'))},
  {t:'Automations you can see', min:.5, dolor:'Before, automations were described, not shown.', show:['Each app lists its automations from the proposal.', 'Actions show an Automation toast and a line in the property’s history.'], say:'You see what the system does for you.', go:asRole('dir', () => go('del', 'auto'))},
  {t:'REFYT’s brand, phone forms and integrations later', min:.5, dolor:'Before, the demo had its own colours and the forms looked like desktop pages.', show:['Your logo, blues and fonts; colour only for on target, at risk and blocked.', 'Assessor form and site forms in a phone frame.', 'Xero, Microsoft 365, Fellow and DocuSign marked Later.'], say:'It looks like REFYT.', go:asRole('dir', () => go('ret', 'asf'))},
];
const VERSIONS = [
  {v:'v1', date:'2026-10-26', major:true, title:'First demo', sum:'Built from our calls: one card per property, deliverables per measure, a field calendar, private quotes and costs.', url:'https://claude.ai/artifact/2H5P8awmYXhLTxw4PtCKsJ', steps:[]},
  {v:'v2', date:'2026-10-26', major:true, title:'Built on REFYT’s process document', sum:'Programmes and schemes, placeholder roles, approvals, phase B evidence, Ready to install, Redbridge groups, money per measure.', url:'https://claude.ai/artifact/A79Z1hfuauHyVCaUYj8Uqk', steps:[]},
  {v:'v3', date:TODAY, major:true, current:true, url:null, title:'Six apps, one per team', sum:'A REFYT workspace with six apps, viewing as a role, approvals inside each app, the same property seen from each team, visible automations, phone forms and REFYT’s brand.', steps:V3STEPS},
];
const VCUR = VERSIONS.find(v => v.current);

/* =================== TOUR: the launcher, then each team’s app =================== */
const TOUR = [
  {t:'Six apps, one per team', min:1.5, dolor:'Section 14: "Each team should feel it has its own tool, showing only what it needs."', show:['The REFYT workspace: Director, Commercial, Accounts, Retrofit, Delivery, Tasks and meetings.', 'Each card says which team and roles use it.', 'Below: the same 21 boards behind all six.'], say:'Six tools, one version of every job.', go:asRole('dir', toHome)},
  {t:'Each role opens its own apps', min:1, dolor:'Roles, not names: your restructure decides who fills each one.', show:['Viewing as Assessor: Retrofit and Tasks; the rest locked.', 'Viewing as Director: everything.'], say:'Change the person behind a role; nothing is rebuilt.', go:asRole('ass', toHome)},
  {t:'Retrofit: evidence, review and revisits', min:2, dolor:'Section 5: if anything is missing, the assessor goes back; the system books and counts the revisit.', show:['Waiting for my approval: the assessment on Canterbury Street.', 'Reject with a comment: the revisit is booked and counted, the Automation toast says so.', 'Assessor form: the checklist on a phone.'], say:'The pack is complete before the client sees it.', go:asRole('aap', () => go('ret', 'wait'))},
  {t:'Delivery: Ready to install sets itself', min:2, dolor:'Section 6: "the system should show a property as Ready to install automatically."', show:['Ready to install: 9 Balmoral Road has items left; finish them and it turns ready.', 'Redbridge tracker with the MDA hold point on Clayhall Avenue.', 'Purchasing: an order split across three properties.'], say:'Delivery runs phases D, E and F from one app.', go:asRole('inc', () => go('del', 'rdy'))},
  {t:'One property, four teams', min:2, dolor:'Section 10: operations see progress and bookings, never prices or margins.', show:['22 Clayhall Avenue in Delivery: install and orders, money locked.', 'Open in Commercial: margin per measure, 15% against an 18% target.', 'Open in Accounts: no trigger met yet.'], say:'Same record, each team sees its part.', go:asRole('dir', () => abrir('del', 'PR-2017', 'res'))},
  {t:'Accounts: triggers and invoices', min:1.5, dolor:'Section 10: the invoice is raised when the programme’s trigger is met.', show:['Payment triggers: Cotality registered on Fencepiece Road, Redbridge, ready to invoice.', 'Raise it: the due date comes from the scheme’s terms.'], say:'Nothing billable waits for someone to notice.', go:asRole('acc', () => go('acc', 'trg'))},
  {t:'Director: the whole business, and Tuesday', min:2, dolor:'Rule 4: meetings and decisions run from dashboards.', show:['Business overview: schemes rated, drill down to a cost line.', 'Daily summary instead of alerts one by one.', 'Tuesday directors’ meeting from the same numbers.'], say:'The Tuesday meeting is already prepared.', go:asRole('dir', () => go('dir', 'ovw'))},
  {t:'Tasks and meetings', min:1, dolor:'Section 15: Monday and Thursday meetings with no money.', show:['Monday meeting: progress per scheme, blocked and overdue, tasks due.', 'Every action with an owner role and a date.'], say:'Every action has an owner.', go:asRole('dir', () => go('tsk', 'mon'))},
];
const TOUR_MAS = ['Commercial, Scheme settings: change a limit and see the log.', 'Director, New scheme setup: copy E.ON Medway.', 'Delivery, Health and safety: certificates about to expire.', 'Accounts, Supplier invoices to match.', 'Retrofit, Import jobs from the client list.', 'Data: the 21 boards and which app edits or reads each.'];

/* =================== HOW EACH APP WORKS =================== */
const SUP = ['Built on REFYT’s process document and Whatever Tech’s proposal of October 2026. Addresses, customers, references, amounts and dates are sample data.', 'Roles are placeholders; the people assigned are examples until the restructure is final.', 'Rates, budgets, margin targets, limits and time limits are examples to replace with yours.', 'Dynamics, Shareworks and PAS Hub are updated by hand with reminders.', 'Xero, Microsoft 365, Fellow and DocuSign are marked Later: to scope once the six apps are stable.', 'Customer booking messages are an option, not part of this build.'];
const HV = (k, n, ic, d, st) => [k, n, ic, d, st];
const HELP = {
  dir:{who:'[Director].', intro:'The whole business at a glance with drill down to a cost line, approvals above the scheme limits, the daily summary, new schemes, roles and the Tuesday meeting.', flow:['Business overview', 'Scheme', 'Property', 'Cost line'], views:[HV('ovw', 'Business overview', 'chart', 'Programmes and schemes, rated.', ['As director I want to click from a total into the detail behind it.']), HV('wait', 'Waiting for my approval', 'checks', 'Above the scheme limits.', ['As director I want only what exceeds a limit.']), HV('sum', 'Daily summary', 'mail', 'Instead of alerts one by one.', ['As director I want one summary a day.']), HV('nsc', 'New scheme setup', 'plus', 'Templates and copies.', ['As director I want a new E.ON scheme ready in minutes.'])], rel:[['com', 'reads', 'Margins per scheme.'], ['acc', 'reads', 'Owed to us and by us.']]},
  com:{who:'[Commercial], with [Director].', intro:'Rates, quotes and budgets per measure, live margins, variations, additional costs and scheme settings.', flow:['Rates', 'Quote per measure', 'Client approval locks the budget', 'Forecast', 'Variations'], views:[HV('mrg', 'Margins', 'trend', 'Against each scheme’s target.', ['As commercial I want to see which jobs fall below target.']), HV('quo', 'Quotes and budgets', 'calc', 'Per measure.', ['As commercial I want quotes built from the agreed rates.']), HV('sset', 'Scheme settings', 'cog', 'Limits and targets, logged.', ['As commercial I want to change a limit without a rebuild.'])], rel:[['del', 'receives from', 'Orders and additional costs.'], ['dir', 'sends to', 'Margins and variations.']]},
  acc:{who:'[Accounts].', intro:'Payment triggers, invoices due and overdue, supplier invoices to match and subcontractor payments.', flow:['Trigger met', 'Invoice raised', 'Due', 'Paid'], views:[HV('trg', 'Payment triggers', 'flag', 'Per programme.', ['As accounts I want to know what to invoice.']), HV('sup', 'Supplier invoices to match', 'checks', 'Actual cost.', ['As accounts I want each supplier invoice on its order.'])], rel:[['del', 'receives from', 'Delivered orders and approved payments.']]},
  ret:{who:'[Survey admin], [Assessor], [Assessment approver], [Designer], [Design approver].', intro:'Phases A and B: bulk import of jobs, bookings, evidence, review, modelling, design and the survey pack, with the assessor’s mobile form.', flow:['Import', 'Book', 'Visit', 'Review', 'Modelling and design', 'Survey pack'], views:[HV('bk', 'Assessment bookings', 'cal', 'With import from the client list.', ['As survey admin I want to import the client’s list.']), HV('wait', 'Waiting for my approval', 'checks', 'Assessment and design reviews.', ['As assessment approver I want to reject with a comment and have the revisit booked.']), HV('asf', 'Assessor form', 'phone', 'On a phone.', ['As assessor I want the evidence checklist on site.'])], rel:[['del', 'sends to', 'Jobs approved by the client.']]},
  del:{who:'[Install coordinator], [Order approver], [Payment approver], site managers, [HSSE lead].', intro:'Phases D, E and F: Ready to install, install and hold points, purchasing, close out, health and safety and site forms.', flow:['Client approval', 'Prepare', 'Ready to install', 'Install', 'Close out'], views:[HV('hom', 'Overview', 'grid', 'Per scheme.', ['As install coordinator I want each scheme’s phases at a glance.']), HV('rdy', 'Ready to install', 'checks', 'Sets itself.', ['As install coordinator I want ready to set itself.']), HV('ord', 'Purchasing', 'cart', 'Split across properties.', ['As install coordinator I want to split one order.']), HV('hs', 'Health and safety', 'shield', 'Expiry dates.', ['As HSSE lead I want to hear before anything expires.'])], rel:[['acc', 'sends to', 'Delivered orders and triggers.'], ['com', 'sends to', 'Committed cost.']]},
  tsk:{who:'Everyone.', intro:'Tasks from meetings and jobs, and the Monday and Thursday team meetings.', flow:['Meeting', 'Action', 'Task with owner and date', 'Follow up'], views:[HV('my', 'My tasks', 'todo', 'By role.', ['As anyone I want my own list.']), HV('mon', 'Monday meeting', 'cal', 'No money.', ['As head of team I want the Monday view ready.'])], rel:[['dir', 'reads', 'Directors meet on Tuesday in Director.']]},
};

/* =================== DATA: THE PROCESS FROM A TO Z =================== */
const AZRULE = 'A <b>programme</b> manages <b>schemes</b>; each scheme brings <b>properties</b> with their <b>measures</b>. Retrofit evidences and designs, the client approves in its own system, Delivery prepares and installs, <b>purchasing</b> turns into committed then actual cost, and Accounts raises the <b>invoice</b> when the trigger is met. Five apps, one database.';
const AZFLOW = ['A. Job received', 'B. Assess and design', 'C. Client approval', 'D. Prepare', 'E. Install', 'F. Close out and payment'];
const AZ = [
  ['A and B, Retrofit', [['ret', 'bk', 'Import and book', 'Jobs come from the client’s list.', ['pr', 'cu', 'sc']], ['ret', 'wait', 'Review, revisits, design', 'Rejections book and count a revisit.', ['rs', 'pm']], ['ret', 'pk', 'Survey pack', 'Reminder to update the client system.', ['pr']]]],
  ['C, Commercial', [['com', 'quo', 'Quote and budget per measure', 'Locked when the client approves.', ['qc', 'rt']]]],
  ['D and E, Delivery', [['del', 'rdy', 'Ready to install', 'Sets itself.', ['in', 'pr']], ['del', 'ord', 'Orders', 'Committed, then actual cost.', ['pu', 'va']], ['del', 'hold', 'Install and hold points', 'Hold points block the next group.', ['in']]]],
  ['F, Delivery and Accounts', [['del', 'clo', 'Close out', 'Handover, lodgement, uploads.', ['ho']], ['acc', 'trg', 'Invoice and payment', 'When the trigger is met.', ['iv', 'sp']]]],
];
const DGR = {wrk:['Schemes and properties', 'tb'], ops:['Operations', 'tb'], mon:['Money, restricted', 'tk'], cfg:['Settings and team', 'tk']};
const R_ = (n, t) => [n, t];
const B = (k, n, g, d, f, c) => ({k, n, g, d, md:'Database table', f:f.map(x => R_(x[0], x[1])), c});
const DBS = [
  B('pg', 'Programmes', 'wrk', 'One row per programme manager.', [['Schemes', '→ Contracts (schemes)']], () => PROGS.length),
  B('sc', 'Contracts (schemes)', 'wrk', 'Settings, client system and contract lead.', [['Programme', '→ Programmes'], ['Margin target and limits', 'Numbers']], () => DB.sc.length),
  B('cu', 'Customers', 'wrk', 'The person living in the home.', [['Property', '→ Projects (properties)']], () => DB.pr.length),
  B('pr', 'Projects (properties)', 'wrk', 'The main record.', [['Scheme', '→ Contracts (schemes)'], ['Client job reference', 'Text'], ['Phase', 'Status'], ['Ready to install', 'Formula']], () => DB.pr.length),
  B('pm', 'Property measures', 'wrk', 'One row per measure per property.', [['Property', '→ Projects (properties)'], ['Design and approval', 'Status']], () => sum(DB.pr, p => p.ms.length)),
  B('rs', 'Retrofit Surveys', 'ops', 'Evidence, revisits, predicted rating.', [['Property', '→ Projects (properties)'], ['Revisits', 'Numbers']], () => DB.pr.length),
  B('in', 'Installation', 'ops', 'Phase D items, hold points, groups.', [['Property', '→ Projects (properties)']], () => DB.pr.length),
  B('ho', 'Handover', 'ops', 'Handover pack and uploads.', [['Property', '→ Projects (properties)']], () => DB.pr.length),
  B('ps', 'Pipeline Stages', 'cfg', 'Per programme type, with time limits.', [['Programme type', 'Dropdown']], () => 6),
  B('ct', 'Checklist Templates', 'cfg', 'By programme, measure and house type.', [['Measure', 'Dropdown']], () => BSTEPS.length + DITEMS.length + RGROUPS.length),
  B('rt', 'Rates', 'mon', 'Agreed price per measure.', [['Programme type', 'Dropdown']], () => sum(Object.values(RATE), o => Object.keys(o).length)),
  B('qc', 'Quotes & Costs', 'mon', 'Per measure: quoted, budget, committed, forecast.', [['Property measure', '→ Property measures']], () => sum(DB.pr, p => p.ms.length)),
  B('pu', 'Purchasing', 'mon', 'Orders, split across properties.', [['Property', '→ Projects (properties)'], ['Status', 'Status']], () => DB.or.length),
  B('va', 'Variations and additional costs', 'mon', 'Reason, amount, evidence.', [['Property measure', '→ Property measures']], () => DB.va.length),
  B('sp', 'Subcontractor payments', 'mon', 'Against a completed stage.', [['Property', '→ Projects (properties)']], () => DB.sp.length),
  B('iv', 'Invoices', 'mon', 'Trigger met, raised, due, paid.', [['Property', '→ Projects (properties)']], () => DB.inv.length),
  B('tm', 'Team', 'cfg', 'People and regions.', [['Role', 'Dropdown']], () => Object.keys(PEO).length),
  B('ro', 'Roles per scheme', 'cfg', 'Who fills each placeholder role.', [['Scheme', '→ Contracts (schemes)'], ['Person', 'People']], () => Object.keys(ROLES).length * DB.sc.length),
  B('tk', 'Tasks', 'cfg', 'From meetings and jobs.', [['Owner role', 'Dropdown']], () => DB.tk.length),
  B('mt', 'Meetings', 'cfg', 'Monday, Thursday, Tuesday.', [['Tasks', '→ Tasks']], () => 3),
  B('sl', 'Settings log', 'cfg', 'Who changed which setting.', [['Scheme', '→ Contracts (schemes)']], () => sum(DB.sc, s => s.log.length)),
];
const ACC = {
  dir:{pg:'w', sc:'w', pr:'r', pm:'r', rs:'r', in:'r', ho:'r', ps:'w', ct:'w', rt:'r', qc:'r', pu:'r', va:'w', sp:'w', iv:'r', tm:'w', ro:'w', tk:'w', mt:'r', sl:'r'},
  com:{pg:'r', sc:'w', pr:'r', pm:'r', rt:'w', qc:'w', pu:'r', va:'w', sp:'r', iv:'w', ro:'r', tk:'w', sl:'r'},
  acc:{pg:'r', sc:'r', pr:'r', pm:'r', ho:'r', qc:'r', pu:'w', va:'r', sp:'w', iv:'w', ro:'r', tk:'w'},
  ret:{sc:'r', cu:'w', pr:'w', pm:'w', rs:'w', ps:'r', ct:'r', tm:'r', ro:'r', tk:'w'},
  del:{sc:'r', cu:'w', pr:'w', pm:'w', rs:'r', in:'w', ho:'w', ps:'r', ct:'r', pu:'w', va:'w', sp:'w', tm:'r', ro:'r', tk:'w'},
  tsk:{pr:'r', tk:'w', mt:'w', ro:'r'},
};

A.ficha = el => { if(String(getSelection() || '').length > 2) return; S.fi[S.view] = el.dataset.v; S.ft = 'res'; S.hl = null; S.modal = null; render(true); };
A.fichaback = () => { const id = S.fi[S.view]; S.fi[S.view] = null; S.hl = id; render(true); scrollHL(); };
A.ft = el => { S.ft = el.dataset.v; render(); };
A.goid = el => { const [id, t] = el.dataset.v.split('|'); abrir(S.view, id, t || 'res'); };
A.gogo = el => { const [a, p] = el.dataset.v.split(':'); go(a, p); };
A.alseen = el => { seenSet().add(el.dataset.v); render(); toast('Marked as seen.', 'Undo', () => { seenSet().delete(el.dataset.v); render(); }); };
A.alunseen = el => { seenSet().delete(el.dataset.v); render(); };
A.mset = el => { S.modal[el.dataset.k] = el.dataset.v; renderLayer(); };
A.mclose = () => { S.modal = null; renderLayer(); };
A.cbo = el => { S.cbo = S.cbo === el.dataset.v ? null : el.dataset.v; S.cbq = ''; S.modal ? renderLayer() : render(); requestAnimationFrame(() => { const i = document.querySelector('.cbx.open input'); if(i) i.focus(); }); };
A.cbc = () => { S.cbo = null; S.cbq = ''; S.modal ? renderLayer() : render(); };
A.cbp = el => { const k = el.dataset.key, inn = el.dataset.inn, v = el.dataset.v; S.cbo = null; S.cbq = ''; IN[inn]({dataset:{k, in:inn}, value:v}); S.modal ? renderLayer() : render(); };
IN.cbq = t => { S.cbq = t.value; refocus(() => S.modal ? renderLayer() : render()); };
const CBK = {osup:'sup', vapr:'pr'};
IN.m = t => { if(!S.modal) return; S.modal[CBK[t.dataset.k] || t.dataset.k] = t.value; if(t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.getAttribute('inputmode') !== 'decimal')) patchLayer(); else refocus(renderLayer); };
IN.f = t => { S.f[t.dataset.k] = t.value; refocus(render); };
function helpPage(app){ const H = HELP[app];
  return oph(`How ${APPN[app]} works`, H.intro) + `<section class="rsec"><div class="rs-h"><h3>The process</h3><p>${H.who}</p></div><div class="hflow">${H.flow.map((x, i) => `<span><i>${i + 1}</i>${x}</span>`).join(`<b>${ico('chev', 14, 2.4)}</b>`)}</div></section>`
    + grpH('Views and user stories', H.views.length) + `<div class="hgrid">${H.views.map(([k, n, ic, d, st]) => `<section class="hcard"><div class="hc-h"><span class="oi2">${ico(ic, 18)}</span><div><b>${n}</b><small>${d}</small></div><button class="btn sec sm" data-act="${pageAct(app)}" data-v="${k}">Open</button></div><ul>${st.map(x => `<li>${x}</li>`).join('')}</ul></section>`).join('')}</div>`
    + grpH('How it connects with the other apps', H.rel.length) + `<div class="hrel">${H.rel.map(([a, dir, t]) => `<div class="hr"><button class="hr-a ${APPT[a]}" data-act="view" data-v="${a}"><span class="si">${ico(APPI[a], 16)}</span>${APPN[a]}</button><em>${dir}</em><p>${t}</p></div>`).join('')}</div>`
    + grpH('Assumptions in this version', SUP.length) + `<div class="xsec"><ul class="supl">${SUP.map(x => `<li>${x}</li>`).join('')}</ul></div>` + hint(`The full data map, and which app reads or writes each database, is in <button class="lnk4 in" data-act="view" data-v="db"><b>Data</b></button>.`); }
const DBK = k => DBS.find(x => x.k === k);
function azPage(){ let n = 0; return `<section class="rsec azk"><div class="rs-h"><h3>The rule</h3><p>${AZRULE}</p></div><div class="hflow">${AZFLOW.map((x, i) => `<span><i>${i + 1}</i>${x}</span>`).join(`<b>${ico('chev', 14, 2.4)}</b>`)}</div></section>`
  + AZ.map(([ph, steps]) => `<div class="gh azh">${ph}<span>${steps.length}</span></div><div class="azl">${steps.map(([app, pg, t, d, dbs]) => { n++; const [, an, ic, tone] = APPS.find(x => x[0] === app);
    return `<div class="azs"><div class="azn ${tone}">${n}</div><div class="azc"><div class="azt"><b>${t}</b><button class="azapp ${tone}" data-act="goto" data-a="${app}" data-v="${pg}"><span class="ai2">${ico(ic, 13)}</span>${an}</button></div><p>${d}</p><div class="azd"><small>Data</small>${dbs.map(k => `<button class="rel" data-act="dbselm" data-v="${k}">${DBK(k).n}</button>`).join('')}</div></div></div>`; }).join('')}</div>`).join(''); }
function dbPage(){
  const sel = S.dbSel && DBK(S.dbSel), mode = S.dbm, rk = t => (DBS.find(x => x.n === t.replace(/^Sum of /, '').slice(2)) || {}).k || '';
  const groups = Object.entries(DGR).map(([g, [n, tone]]) => `<div class="dbg ${tone}"><div class="dbgh"><span class="kd"></span>${n}</div>${DBS.filter(x => x.g === g).map(x => `<button class="dbc${sel && sel.k === x.k ? ' on' : ''}" data-act="dbsel" data-v="${x.k}" data-apps="${APPS.filter(([a]) => ACC[a][x.k]).map(([a]) => a).join(' ')}"><b>${x.n}</b><span>${num(x.c())}</span></button>`).join('')}</div>`).join('');
  const detail = sel ? `<div class="dbd"><div class="dbdh"><div><small>${DGR[sel.g][0]}</small><h3>${sel.n}</h3></div><button class="ib" data-act="dbsel" data-v="" aria-label="Close">${ico('x', 16)}</button></div><p>${sel.d}</p><div class="dbk"><div><small>Records today</small><b>${num(sel.c())}</b></div><div><small>Stored as</small><b class="sm">${sel.md}</b></div></div><h4>Fields</h4><div class="dbf">${sel.f.map(([n, t]) => `<div><span>${n}</span>${t.includes('→') ? `<button class="rel" data-act="dbsel" data-v="${rk(t)}">${t}</button>` : `<em>${t}</em>`}</div>`).join('')}</div><h4>Apps that use it</h4><div class="dba">${APPS.filter(([a]) => ACC[a][sel.k]).map(([a, n, ic, tone]) => `<div class="${tone}"><span class="ai2">${ico(ic, 15)}</span><b>${n}</b><span class="acc ${ACC[a][sel.k]}">${ACC[a][sel.k] === 'w' ? 'Creates and edits' : 'Reads'}</span></div>`).join('')}</div></div>`
    : `<div class="dbd empty2"><span class="oi2">${ico('info', 20)}</span><h3>Choose a database</h3><p>You will see its fields, which databases it connects to and which app creates or reads it.</p></div>`;
  const map = `<div class="dbmap" id="dbmap"><svg class="dbsvg" id="dbsvg"></svg><div class="dbapps">${APPS.map(([a, n, ic, tone]) => `<button class="dbapp ${tone}${S.dbApp === a ? ' on' : ''}" data-act="dbapp" data-v="${a}"><span class="ai2">${ico(ic, 18)}</span><div><b>${n}</b><small>${Object.values(ACC[a]).filter(x => x === 'w').length} create, ${Object.values(ACC[a]).filter(x => x === 'r').length} read</small></div></button>`).join('')}</div><div class="dbgs">${groups}</div>${detail}</div>`;
  const matrix = `<div class="dbmx"><table><thead><tr><th>Database</th>${APPS.map(([a, n, ic, tone]) => `<th class="${tone}"><span class="ai2">${ico(ic, 14)}</span>${n}</th>`).join('')}</tr></thead><tbody>${Object.entries(DGR).map(([g, [n]]) => `<tr class="gr"><td colspan="${APPS.length + 1}">${n}</td></tr>${DBS.filter(x => x.g === g).map(x => `<tr><td><button class="lnk3" data-act="dbselm" data-v="${x.k}">${x.n}</button><small>${num(x.c())} records</small></td>${APPS.map(([a]) => `<td>${ACC[a][x.k] ? `<span class="acc ${ACC[a][x.k]}">${ACC[a][x.k] === 'w' ? 'Creates and edits' : 'Reads'}</span>` : ''}</td>`).join('')}</tr>`).join('')}`).join('')}</tbody></table></div>`;
  return `<div class="op-h"><div><h1>${mode === 'az' ? 'The process from A to Z' : mode === 'mx' ? 'Access table' : 'Databases'}</h1><p>The ${APPS.length} apps work on the same ${DBS.length} databases in the REFYT system. What one app creates, the others see instantly.</p></div><div class="eh-a"><div class="seg2 vm"><button data-act="dbm" data-v="az" aria-pressed="${mode === 'az'}">${ico('route', 15)}From A to Z</button><button data-act="dbm" data-v="map" aria-pressed="${mode === 'map'}">${ico('db', 15)}Map</button><button data-act="dbm" data-v="mx" aria-pressed="${mode === 'mx'}">${ico('grid', 15)}Access table</button></div></div></div>`
    + `<div class="cstats">${stat('tb', 'Databases', DBS.length, 'in the REFYT system')}${stat('tg', 'App to database connections', Object.values(ACC).reduce((a, o) => a + Object.keys(o).length, 0))}${stat('ta', 'Sample records', num(DBS.reduce((a, x) => a + x.c(), 0)))}</div>` + (mode === 'az' ? azPage() : mode === 'mx' ? matrix : map);
}
function dbLines(){ const map = $('#dbmap'), svg = $('#dbsvg'); if(!map || !svg) return; const R = map.getBoundingClientRect(); svg.setAttribute('width', R.width); svg.setAttribute('height', R.height); const focus = S.dbApp, selK = S.dbSel; let h = '';
  APPS.forEach(([a, , , tone]) => { const ap = map.querySelector(`.dbapp[data-v="${a}"]`); if(!ap) return; const r1 = ap.getBoundingClientRect(), x1 = r1.right - R.left, y1 = r1.top + r1.height / 2 - R.top;
    Object.entries(ACC[a]).forEach(([k, m]) => { const c = map.querySelector(`.dbc[data-v="${k}"]`); if(!c) return; const r2 = c.getBoundingClientRect(), x2 = r2.left - R.left, y2 = r2.top + r2.height / 2 - R.top, mx = (x1 + x2) / 2, on = (focus && focus === a) || (selK && selK === k), dim = (focus && focus !== a) || (selK && selK !== k && !focus);
      h += `<path class="ln ${tone}${m === 'r' ? ' rd' : ''}${on ? ' on' : ''}${dim ? ' dim' : ''}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`; }); });
  svg.innerHTML = h; map.querySelectorAll('.dbc').forEach(c => { const apps = c.dataset.apps.split(' '); c.classList.toggle('dim', !!focus && !apps.includes(focus)); c.classList.toggle('lit', !!focus && apps.includes(focus)); }); }
A.dbsel = el => { S.dbSel = el.dataset.v || null; S.dbApp = null; render(); };
A.dbselm = el => { S.dbSel = el.dataset.v; S.dbm = 'map'; S.dbApp = null; render(); };
A.dbapp = el => { S.dbApp = S.dbApp === el.dataset.v ? null : el.dataset.v; S.dbSel = null; render(); };
A.dbm = el => { S.dbm = el.dataset.v; render(); };
A.goto = el => go(el.dataset.a, el.dataset.v);
/* =================== Render =================== */
let lastKey = '';
/* Flight plan: opens centered on the chosen date and keeps its scroll position between redraws */
S.fly = {key:'', x:0, y:0};
function flyScroll(){ const w = document.querySelector(`#v-${S.view} .fl-wrap`); if(!w || !S.flyMeta) return;
  if(S.fly.key !== S.flyMeta.key){ S.fly.key = S.flyMeta.key; S.fly.x = Math.max(0, S.flyMeta.x + 230 - w.clientWidth / 3); S.fly.y = 0; }
  w.scrollLeft = S.fly.x; w.scrollTop = S.fly.y; }
document.addEventListener('scroll', e => { const t = e.target; if(t && t.classList && t.classList.contains('fl-wrap')){ S.fly.x = t.scrollLeft; S.fly.y = t.scrollTop; } }, true);
function render0(top){
  const b = {}; APPS.forEach(([k]) => { b[k] = k === 'apr' ? approvals().length : pend(k).length; });
  document.title = 'Refyt'; $('#emp').textContent = EMP;
  $('#appsw').innerHTML = APPS.map(([k, n, ic, tone]) => (APP_FASE[k] === 'luego' && APPS.find(x => APP_FASE[x[0]] === 'luego')[0] === k ? '<span class="cf-swf later">Next phase</span>' : '') + `<button class="sw-b ${tone}${APP_FASE[k] === 'luego' ? ' f2' : ''}" data-act="view" data-v="${k}" data-tip="${n}${APP_FASE[k] === 'luego' ? ', next phase' : ''}" aria-label="${n}" aria-current="${S.view === k}"><span class="si">${ico(ic, 17)}</span><span class="swn">${n}</span>${bd(k === S.view ? 0 : b[k])}</button>`).join('') + `<span class="swsep"></span><button class="sw-b tk" data-act="view" data-v="db" data-tip="Data" aria-label="Data" aria-current="${S.view === 'db'}"><span class="si">${ico('db', 17)}</span><span class="swn">Data</span></button>`;
  const w = S.view === 'db' ? null : PEO[ME()];
  $('#tools').innerHTML = `<button class="btn sec sm vsb" data-act="vsel" title="Versions of this app">${VCUR.v}<span class="vs-ch">${ico('chev', 13)}</span></button><button class="btn sec sm tourb" data-act="tour" title="Recommended tour to present the demo">${ico('flag', 14)}Tour</button><button class="ib thm" data-act="theme" aria-label="${isDark() ? 'Switch to light' : 'Switch to dark'}">${ico(isDark() ? 'sun' : 'moon', 18)}</button><div class="me2"><span class="av" style="background:${w ? GRAD[APPT[S.view]] : GRAD.tk}">${w ? ini(w.n) : ico('db', 17)}</span><div><b>${w ? esc(w.n) : 'Architecture'}</b><small>${w ? esc(w.r) : 'How it all connects'}</small></div></div>`;
  for(const [k] of [...APPS, ['db']]) $('#v-' + k).hidden = S.view !== k;
  const key = S.view + ':' + (S.page[S.view] || '') + ':' + (S.fi[S.view] || ''), main = $('#main'), keep = main.scrollTop;
  if(S.view === 'db'){ $('#dbview').innerHTML = `<div class="op">${dbPage()}</div>`; requestAnimationFrame(dbLines); }
  else { const V = VIEWS[S.view], pg = S.page[S.view], fi = S.fi[S.view], c = fichaOf(fi); $('#a-' + S.view).innerHTML = V.side() + `<div class="op">${pg === 'help' ? helpPage(S.view) : c ? FICHAR(S.view, fi) : (V.pages[pg] || Object.values(V.pages)[0])()}</div>`; }
  main.scrollTop = top || key !== lastKey ? 0 : keep; lastKey = key;
  renderLayer(); drawTour(); requestAnimationFrame(sizeKb);
  requestAnimationFrame(flyScroll);
}
let lastLayer = '';
function renderLayer(){ let h = ''; if(S.modal){ const f = MODALS[S.modal.k]; if(f) h = f(S.modal); } const lk = S.modal ? S.modal.k + '|' + (S.modal.id || '') : ''; $('#layer').classList.toggle('still', lk !== '' && lk === lastLayer); lastLayer = lk; $('#layer').innerHTML = h; }
/* Typing in a text field never rebuilds the window: only the state is saved and the buttons and notes that depend on it are refreshed */
function patchLayer(){ if(!S.modal) return; const f = MODALS[S.modal.k]; if(!f) return; const tmp = document.createElement('div'); tmp.innerHTML = f(S.modal);
  const nf = tmp.querySelector('.md-f'), of = document.querySelector('#layer .md-f'); if(nf && of) of.innerHTML = nf.innerHTML;
  tmp.querySelectorAll('.md-b button[data-act]').forEach(nb => { const ob = document.querySelector(`#layer .md-b button[data-act="${nb.dataset.act}"]${nb.dataset.v ? `[data-v="${nb.dataset.v}"]` : ''}`); if(ob){ ob.disabled = nb.disabled; } }); }
function refocus(fn3){ const a = document.activeElement, d = a && a.dataset && a.dataset.in ? {...a.dataset} : null; let pos = null; try { pos = a.selectionStart; } catch(e) {}
  const mb = $('.md-b'), st = mb ? mb.scrollTop : 0; fn3(); const nmb = $('.md-b'); if(nmb && st) nmb.scrollTop = st;
  if(d){ const sel = `[data-in="${d.in}"]` + (d.k != null ? `[data-k="${d.k}"]` : ''); const n = $(sel); if(n){ n.focus(); try { if(pos != null) n.setSelectionRange(pos, pos); } catch(e) {} } } }
const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
A.theme = () => { const n = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = n; store.set('rft-demo-theme', n); render(); };
function sizeKb(){ document.querySelectorAll('.um-kb').forEach(kb => { kb.style.height = 'auto'; const cols = [...kb.querySelectorAll('.um-kc')]; if(!cols.length) return;
  const mxh = Math.max(...cols.map(c => c.querySelector('.um-kch').offsetHeight + c.querySelector('.um-kcb').scrollHeight + 26)), avail = innerHeight - kb.getBoundingClientRect().top - 18; kb.style.height = Math.max(300, Math.min(mxh, avail)) + 'px'; }); }
addEventListener('resize', () => { sizeKb(); if(S.view === 'db') dbLines(); });

/* =================== Tour: collapses without losing the step and can be dragged =================== */
S.tour = {open:false, i:0, list:false, min:false, x:null, y:null, set:null, sv:''};
const TS = () => S.tour.set || TOUR;
S.vs = {open:false};
const tourMin = () => sum(TS(), s => s.min);
const tourTop = () => (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:0})}).getBoundingClientRect().bottom + 8;
const tourPos = () => S.tour.x == null ? '' : ` style="left:${S.tour.x}px; top:${S.tour.y}px; right:auto; bottom:auto"`;
function tourClamp(){ const p = document.querySelector('#tourp .tp'); if(!p || S.tour.x == null) return; const r = p.getBoundingClientRect(); S.tour.x = clamp(S.tour.x, 8, Math.max(8, innerWidth - r.width - 8)); S.tour.y = clamp(S.tour.y, tourTop(), Math.max(tourTop(), innerHeight - r.height - 8)); Object.assign(p.style, {left:S.tour.x + 'px', top:S.tour.y + 'px', right:'auto', bottom:'auto'}); }
function drawTour(){
  drawVs(); let el = document.getElementById('tourp'); if(!el){ el = document.createElement('div'); el.id = 'tourp'; document.body.appendChild(el); }
  const T = S.tour; if(!T.open){ el.innerHTML = ''; return; } const s = TS()[T.i];
  const ctl = `<button class="ib" data-act="tourmin" aria-label="${T.min ? 'Expand' : 'Collapse'}">${ico(T.min ? 'up' : 'minus', 15)}</button><button class="ib" data-act="tourx" aria-label="Close">${ico('x', 15)}</button>`, drag = 'title="Drag to move it; double click to put it back"';
  if(T.min){ el.innerHTML = `<div class="tp tp-min"${tourPos()}><div class="tp-h tp-drag" ${drag}><i class="tp-mi">${T.i + 1}</i><div><b>${esc(s.t)}</b><small>Step ${T.i + 1} of ${TS().length}</small></div><button class="ib" data-act="tourstep" data-v="-1" ${T.i ? '' : 'disabled'} aria-label="Previous step">${ico('back', 15)}</button><button class="ib" data-act="tourstep" data-v="1" ${T.i < TS().length - 1 ? '' : 'disabled'} aria-label="Next step">${ico('chev', 15)}</button>${ctl}</div></div>`; return requestAnimationFrame(tourClamp); }
  const head = `<div class="tp-h tp-drag" ${drag}><div><b>${S.tour.set ? 'What changed in ' + S.tour.sv : 'Demo tour'}</b><small>Step ${T.i + 1} of ${TS().length}; ${TS().length} steps, about ${Math.round(tourMin())} minutes</small></div><button class="ib" data-act="tourlist" title="${T.list ? 'See the step' : 'See all steps'}">${ico(T.list ? 'calc' : 'grid', 15)}</button>${ctl}</div>`;
  if(T.list) el.innerHTML = `<div class="tp"${tourPos()}>${head}<div class="tp-b">${TS().map((x, i) => `<button class="tp-li${i === T.i ? ' on' : ''}" data-act="tourto" data-v="${i}"><i>${i + 1}</i><span>${esc(x.t)}</span><small>${x.min} min</small></button>`).join('')}<div class="tp-s">If there is time or if they ask</div><ul class="tp-ul">${TOUR_MAS.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>`;
  else el.innerHTML = `<div class="tp"${tourPos()}>${head}<div class="tp-b"><div class="tp-n"><i>${T.i + 1}</i><b>${esc(s.t)}</b><small>${s.min} min</small></div><div class="tp-s">Why it matters</div><p class="tp-d">${esc(s.dolor)}</p><div class="tp-s">What to show</div><ul class="tp-ul">${s.show.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="tp-s">What to say</div><p class="tp-q">${esc(s.say)}</p></div>
    <div class="tp-f"><button class="btn sec sm" data-act="tourstep" data-v="-1" ${T.i ? '' : 'disabled'}>${ico('back', 13)}Previous</button><button class="btn pri sm" data-act="tourgo">${ico('send', 13)}Go here</button><button class="btn sec sm" data-act="tourstep" data-v="1" ${T.i < TS().length - 1 ? '' : 'disabled'}>Next${ico('chev', 13)}</button></div><div class="tp-dots">${TS().map((x, i) => `<button class="${i === T.i ? 'on' : i < T.i ? 'done' : ''}" data-act="tourto" data-v="${i}" aria-label="Step ${i + 1}"></button>`).join('')}</div></div>`;
  requestAnimationFrame(tourClamp);
}
A.tour = () => { S.tour.set = null; if(S.tour.open && S.tour.min) S.tour.min = false; else S.tour.open = !S.tour.open; drawTour(); };
A.tourx = () => { S.tour.open = false; S.tour.set = null; drawTour(); };
A.tourmin = () => { S.tour.min = !S.tour.min; S.tour.list = false; drawTour(); };
A.tourlist = () => { S.tour.list = !S.tour.list; drawTour(); };
A.tourto = el => { S.tour.i = +el.dataset.v; S.tour.list = false; TS()[S.tour.i].go(); };
A.tourstep = el => { S.tour.i = clamp(S.tour.i + (+el.dataset.v), 0, TS().length - 1); TS()[S.tour.i].go(); };
A.tourgo = () => TS()[S.tour.i].go();
(() => { let d = null;
  document.addEventListener('pointerdown', e => { const h = e.target.closest('#tourp .tp-drag'); if(!h || e.target.closest('button')) return; const p = h.closest('.tp'), r = p.getBoundingClientRect(); d = {dx:e.clientX - r.left, dy:e.clientY - r.top, p}; p.classList.add('dragging'); e.preventDefault(); });
  document.addEventListener('pointermove', e => { if(!d) return; const r = d.p.getBoundingClientRect(); S.tour.x = clamp(e.clientX - d.dx, 8, Math.max(8, innerWidth - r.width - 8)); S.tour.y = clamp(e.clientY - d.dy, tourTop(), Math.max(tourTop(), innerHeight - r.height - 8)); Object.assign(d.p.style, {left:S.tour.x + 'px', top:S.tour.y + 'px', right:'auto', bottom:'auto'}); });
  document.addEventListener('pointerup', () => { if(d){ d.p.classList.remove('dragging'); d = null; } });
  document.addEventListener('dblclick', e => { if(e.target.closest('#tourp .tp-drag') && !e.target.closest('button')){ S.tour.x = S.tour.y = null; drawTour(); } });
  addEventListener('resize', tourClamp); })();
/* Version selector: one live link */
function drawVs(){ let el = document.getElementById('vsel'); if(!el){ el = document.createElement('div'); el.id = 'vsel'; document.body.appendChild(el); } const b = document.querySelector('.vsb'); if(!S.vs.open || !b){ el.innerHTML = ''; return; }
  const r = b.getBoundingClientRect(), w = Math.min(440, innerWidth - 16), left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8));
  el.innerHTML = `<div class="vs-pan" role="dialog" aria-label="Versions" style="top:${r.bottom + 8}px; left:${left}px; width:${w}px"><div class="vs-h"><div><b>Versions</b><small>The app always shows the latest version</small></div><span class="vs-tag">${VCUR.v}</span><button class="ib" data-act="vsx" aria-label="Close">${ico('x', 15)}</button></div><div class="vs-b">${VERSIONS.filter(v => v.major || v.current).slice().reverse().map(v => `<div class="vs-r${v.current ? ' cur' : ''}"><div class="vs-t"><b>${v.v}</b><span>${fmtDy(v.date)}</span>${v.current ? '<em class="vs-c">Current</em>' : ''}</div><div class="vs-n">${esc(v.title)}</div><p>${esc(v.sum)}</p><div style="display:flex;gap:8px;margin-top:8px">${v.steps && v.steps.length ? `<button class="btn sec sm" data-act="vsTour" data-v="${v.v}">What changed</button>` : ''}${v.url ? `<a class="btn sec sm" href="${v.url}" target="_blank" rel="noopener">Open this version</a>` : ''}</div></div>`).join('')}</div><div class="vs-f">Earlier versions open in a new tab, exactly as they were.</div></div>`; }
A.vsTour = el => { const v = VERSIONS.find(x => x.v === el.dataset.v); S.vs.open = false; S.tour = Object.assign(S.tour, {open:true, i:0, list:false, min:false, set:v.steps, sv:v.v}); TS()[0].go(); };
A.vsel = () => { S.vs.open = !S.vs.open; drawVs(); };
A.vsx = () => { S.vs.open = false; drawVs(); };
document.addEventListener('click', e => { if(S.vs.open && !e.target.closest('.vs-pan') && !e.target.closest('.vsb')){ S.vs.open = false; drawVs(); } });

/* =================== EVENTS =================== */
const lay = () => S.modal ? renderLayer() : render();
A.dpo = el => { S.dp = S.dp && S.dp.key === el.dataset.v ? null : {key:el.dataset.v, m:(el.dataset.cur || TODAY).slice(0, 7)}; lay(); };
A.dpm = el => { const f = fromIso(S.dp.m + '-01'); f.setMonth(f.getMonth() + (+el.dataset.v)); S.dp.m = iso(f).slice(0, 7); lay(); };
A.dpx = () => { S.dp = null; lay(); };
document.addEventListener('click', e => { if(S.dp && !(e.target.closest && e.target.closest('.cm-dt'))){ S.dp = null; if(!(e.target.closest && e.target.closest('[data-act]'))) lay(); } }, true);
A.dpp = el => { const ix = S.dp.key.indexOf('|'), inn = S.dp.key.slice(0, ix), k = S.dp.key.slice(ix + 1); S.dp = null; if(inn === 'm'){ S.modal[k] = el.dataset.v; renderLayer(); } else { IN[inn]({dataset:{k, in:inn}, value:el.dataset.v}); lay(); } };
A.view = el => { S.view = el.dataset.v; S.modal = null; render(true); };
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if(!el || el.disabled) return; const f = A[el.dataset.act]; if(!f) return; e.preventDefault(); f(el, e); });
document.addEventListener('click', e => { if(S.cbo && !e.target.closest('.cbx')){ S.cbo = null; S.cbq = ''; if(!e.target.closest('[data-act]')) (S.modal ? renderLayer() : render()); } }, true);
const inHandle = t => { const k = t.dataset && t.dataset.in; if(k && IN[k]) IN[k](t); };
document.addEventListener('input', e => { const t = e.target; if(t.type === 'date' || t.type === 'file') return; inHandle(t); });
document.addEventListener('change', e => { const t = e.target; if(t.type === 'date' || t.type === 'file') inHandle(t); });
document.addEventListener('keydown', e => {
  if(e.target.id === 'emp' && e.key === 'Enter'){ e.preventDefault(); e.target.blur(); }
  if(e.key === 'Enter' && e.target.classList && e.target.classList.contains('um-row')) e.target.click();
  if(e.key === 'Escape'){ if(S.cbo){ S.cbo = null; S.modal ? renderLayer() : render(); } else if(S.modal){ S.modal = null; renderLayer(); } else if(S.vs.open){ S.vs.open = false; drawVs(); } }
});
document.addEventListener('dblclick', e => { if(e.target.id !== 'emp') return; const b = e.target; b.contentEditable = 'true'; b.focus(); const rg = document.createRange(); rg.selectNodeContents(b); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); });
document.addEventListener('focusout', e => { if(e.target.id !== 'emp') return; const b = e.target; b.contentEditable = 'false'; EMP = b.textContent.trim().slice(0, 60) || EMP0; b.textContent = EMP; store.set('rft-demo-emp', EMP); render(); });
if(/debug/.test(location.hash)) window.__RB = {get DB(){ return DB; }, S, A, go, abrir, alerts, phGate, approvals, pMoney, TOUR}; window.__V = VIEWS;

const RIMG = {};
/* =================== v3: six apps, one per team, on the same information =================== */
ROLES.sit = ['Site manager', 'akr'];
prOf('PR-2020').cs = 4;
Object.assign(PHS, {'A. Job received':'tb', 'B. Assess and design':'tb', 'C. Client approval':'tb', 'D. Prepare to install':'tb', 'E. Install':'tb', 'F. Close out':'tb', 'Paid':'tg', 'Cancelled':'tk'});
Object.assign(GRAD, {tk:'#16306E', tb:'#1E3A8A', tg:'#2B4C9E', ta:'#3A5DB0', tt:'#16306E', tv:'#2B4C9E', tp:'#3A5DB0', to:'#1E3A8A', tred:'#16306E'});
const LAPPS = {
  dir:{team:'Directors', roles:['dir'], line:'The whole business at a glance, drill down to a cost line, new schemes, roles and approvals above the scheme limits.'},
  com:{team:'Commercial', roles:['com'], line:'Rates, quotes and budgets per measure, live margins, variations, additional costs and scheme settings.'},
  acc:{team:'Accounts', roles:['acc'], line:'Payment triggers, invoices due and overdue, supplier invoices to match and subcontractor payments.'},
  ret:{team:'Retrofit services', roles:['sad', 'ass', 'aap', 'dsg', 'dap'], line:'Phases A and B, from job received to survey pack, with the assessor’s mobile form.'},
  del:{team:'Delivery', roles:['inc', 'oap', 'pap', 'sit', 'hse'], line:'Phases D, E and F: preparation, install, purchasing, close out, health and safety and site forms.'},
  tsk:{team:'Everyone', roles:[], line:'Tasks from meetings and jobs, with the Monday and Thursday team meetings.'},
};
const allowed = app => app === 'db' || app === 'home' || app === 'tsk' || !AUTH.apps || AUTH.apps.includes(app);
/* Real session: without refyt.view_as, “Viewing as” lists only the user’s own roles */
const roleOk = r => AUTH.viewAs || AUTH.roles.includes(r);
const WAITR = {dir:['dir'], com:['com'], ret:['aap', 'dap'], del:['oap', 'pap']};
const nWait = app => approvals().filter(a => (WAITR[app] || []).includes(a.role)).length;
const later = t => `<span class="rf-later" title="Integration to scope after the six apps">${t}: Later</span>`;
const lockCard = () => `<div class="rf-lock">${ico('lock', 17)}<div><b>Quotes, budgets and margins are not shown here</b><small>Visible to Director, Commercial and Accounts.</small></div></div>`;

/* Automations: every run is shown, and written on the property’s history */
DB.runs = [];
function auto(p, app, text){ if(p) his(p, 'The system ' + text, 'sys'); DB.runs.push([TODAY, app, text, p ? p.id : '']); render(); toast(`<b>Automation:</b> The system ${esc(text)}`); }
const wrap = (k, fn) => { const o = A[k]; A[k] = (el, x) => fn(o, el, x); };
wrap('dSet', (o, el) => { const p = prOf(el.dataset.v.split('|')[0]), was = ready(p); o(el); if(!was && ready(p)) auto(p, 'del', 'set Ready to install and notified the Install coordinator'); });
wrap('arNo', (o, el, x) => { o(el, x); const p = prOf(el.dataset.v); setTimeout(() => auto(p, 'ret', `booked a revisit for the Assessor, counted it (${p.b.revisits}) and notified the Assessor`), 0); });
wrap('bVis', (o, el) => { o(el); auto(prOf(el.dataset.v), 'ret', 'notified the Assessment approver that the evidence is ready for review'); });
wrap('bStep', (o, el) => { o(el); const [id, k] = el.dataset.v.split('|'); if(k === 'dsg') auto(prOf(id), 'ret', 'notified the Design approver'); });
wrap('phNext', (o, el) => { const p = prOf(el.dataset.v), from = p.ph; o(el); if(p.ph !== from) auto(p, pIdx(p.ph) <= 2 ? 'ret' : 'del', `set the owner to ${RN(PHOWN[p.ph])} and recorded the date it entered ${p.ph}${p.csTodo ? `, and created a reminder to update ${ptOf(p).sys}` : ''}`); });
wrap('orOk', (o, el) => { const ord = DB.or.find(x => x.id === el.dataset.v); o(el); auto(ord.al[0].pr ? prOf(ord.al[0].pr) : null, 'del', `recorded ${ord.id} as committed cost on ${ord.al.length > 1 ? ord.al.length + ' properties' : 'its property and measure'}`); });
wrap('orInv', (o, el) => { const ord = DB.or.find(x => x.id === el.dataset.v); o(el); auto(ord.al[0].pr ? prOf(ord.al[0].pr) : null, 'acc', `recorded the supplier invoice on ${ord.id} as actual cost`); });
wrap('gSet', (o, el) => { const [id, k] = el.dataset.v.split('|'), p = prOf(id), hp = RGROUPS.find(g => g[0] === k)[3]; o(el); if(hp && p.g[k] === 'Complete') auto(p, 'del', 'unlocked the next group and notified the site team'); });
wrap('invNew', (o, el) => { const p = prOf(el.dataset.v); o(el); auto(p, 'acc', `set the due date from ${scOf(p.sc).n}’s payment terms (${scOf(p.sc).set.terms} days)`); });
wrap('vaClient', (o, el) => { const v = DB.va.find(x => x.id === el.dataset.v); o(el); auto(prOf(v.pr), 'com', 'updated the quoted value and the budget of the measure'); });
wrap('cnOk', (o, el) => { const id = S.modal.id; o(el); const p = prOf(id); if(p.cancel && p.cancel.abort) auto(p, 'com', 'recorded the reason and the phase, and created an abortive work invoice line'); });
wrap('orOk2', (o, el) => { const m = S.modal, p = prOf(m.al[0].pr), tot = sum(m.al, a => numIn(a.a)), over = tot > scOf(p.sc).set.ord; o(el); auto(p, 'del', over ? `sent the order to the Director, above the ${scOf(p.sc).n} limit` : 'sent the order to the Order approver'); });
wrap('csDone', (o, el) => { o(el); });
const AUTO = {
  dir:['A new scheme from a template (E.ON, GLA, Redbridge or blank), or copied from another, arrives with its stages, checklists and settings, and appears on the dashboard.', 'Every change to a scheme setting is logged with who, when, and the old and new value.', 'Orders, payments, variations and additional costs above the scheme limit go to the Director.', 'Directors get a daily summary instead of individual alerts, plus an immediate alert for approvals waiting on them and red flags.', 'An invoice still unpaid after Accounts was notified is escalated to the Director.'],
  com:['When measures are chosen after modelling, a quote line per measure is created from the scheme’s rates.', 'When the client approves, the quote becomes the approved value and the budget is locked.', 'An approved variation updates the quoted value and the budget; an approved additional cost adds to forecast cost.', 'Variations above the scheme limit go to the Director before the client.', 'Forecast cost over budget, or margin below the scheme target, alerts Commercial and the Director.', 'A cancelled job with work done creates an abortive work invoice line.'],
  acc:['When a payment trigger is met (E.ON install complete, GLA final upload accepted, Redbridge Cotality registered), Accounts is notified and the invoice line is prepared.', 'The due date is set from the scheme’s payment terms.', 'A trigger met with no invoice within the set days raises an alert.', 'An overdue invoice notifies Accounts, then the Director.', 'A supplier invoice recorded against an order becomes actual cost on its property and measure.', 'A payment marked as paid updates the outstanding balance per scheme.'],
  ret:['A stage submitted for review notifies its approver.', 'A rejected assessment books a revisit, counts it and notifies the Assessor.', 'When a property moves stage, the new owner is assigned from the scheme’s roles and the date is recorded.', 'A property past its stage time limit turns amber then red, notifying the owner and then the head of team.', 'When measures are chosen, the checklist is built from the templates by programme, measure and house type.', 'When a stage needs the client system updated, the owner gets a reminder with a tick.'],
  del:['When every phase D item that applies is done, the property is set to Ready to install and the Install coordinator is notified.', 'On Redbridge, groups that do not apply to the house type or the PO are marked not applicable.', 'A hold point blocks the next group; once passed, it unlocks it and notifies the site team.', 'An order goes to the Order approver, or the Director above the scheme limit; once approved it is committed cost.', 'A subcontractor payment goes to the Payment approver and an additional cost to the Order approver, or the Director above the limit.', 'A client query logged on a property creates a task for the Install coordinator.', 'Insurances and accreditations alert the HSSE lead before they expire.', 'A cancelled job records the reason and the phase reached.'],
  tsk:['An action agreed in a meeting creates a task with an owner and a due date.', 'Owners are reminded before a task is due; overdue tasks are flagged to the owner and go in the head of team’s daily summary.'],
};
function autoPage(app){ const runs = DB.runs.filter(r => r[1] === app);
  return oph('Automations in this app', `What the system does by itself in ${APPN[app]}, so nobody has to.`) + AUTO[app].map(t => `<div class="rf-dl ok"><span class="rf-ck">${ico('sync', 13, 2.4)}</span><div><b style="font-weight:600">${t}</b></div>${pill('tg', 'On')}</div>`).join('')
    + grpH('Ran in this session', runs.length) + (runs.length ? runs.slice().reverse().map(r => rdiv(cell('The system ' + esc(r[2]), r[3] ? `${r[3]} ${prOf(r[3]).ad}` : '', 3) + cell(fmtDy(r[0]), ''))).join('') : empty('Nothing yet. Approve, book or complete something and it shows here.')); }

/* Alerts: Accounts matches supplier invoices; the HSSE lead hears before anything expires */
const HSD = [['Public liability insurance', 9], ['Employers liability insurance', 140], ['TrustMark registration', 60], ['MCS certification', 25], ['PAS 2030 certification', 200], ['CSCS cards, site team', 18]].map(([n, d]) => ({n, exp:addDays(TODAY, d)}));
function alerts(){ const xs = alerts0().map(a => ({...a, app:a.app === 'pur' ? 'acc' : a.app}));
  HSD.filter(h => dDiff(h.exp) < 30).forEach(h => xs.push({id:'hs' + h.n + h.exp, app:'del', tone:'ta', k:'Expiring', t:h.n, d:`Expires ${fmtD(h.exp)}. HSSE lead to renew.`, fix:['Open health and safety', 'gogo', 'del:hs']}));
  return xs; }

/* =================== The same property, seen from each app =================== */
const ATABS = {dir:[['res', 'Summary'], ['mea', 'Measures'], ['ret', 'Assess and design'], ['ins', 'Install'], ['clo', 'Close out'], ['mon', 'Money'], ['his', 'History']], com:[['res', 'Summary'], ['mea', 'Margin per measure'], ['mon', 'Costs and variations'], ['his', 'History']], acc:[['res', 'Summary'], ['inv', 'Invoice and payments'], ['mon', 'Actual costs'], ['his', 'History']], ret:[['res', 'Summary'], ['ret', 'Evidence and design'], ['his', 'History']], del:[['res', 'Summary'], ['mea', 'Measures'], ['ins', 'Prepare and install'], ['mon', 'Orders'], ['clo', 'Close out'], ['his', 'History']], tsk:[['res', 'Summary'], ['his', 'History']]};
const trig = p => (tyOf(p) === 'E.ON' && p.cs >= 7) || (tyOf(p) === 'GLA' && p.cs >= 6) || (tyOf(p) === 'Redbridge' && p.cs >= 4);
function invTab(app, p){ const inv = DB.inv.filter(v => v.pr === p.id), sps = DB.sp.filter(s => s.pr === p.id), t = trig(p);
  return `<div class="rf-gate${t ? ' ok' : ''}">${ico(t ? 'check' : 'clock', 17)}<div><b>${t ? 'Payment trigger met' : 'Payment trigger not met yet'}</b><small>${ptOf(p).trig}. ${ptOf(p).sys} shows: ${csName(p)}.</small></div>${t && !inv.length ? nx('invNew', p.id, 'Raise invoice') : ''}</div>`
    + grpH('Invoices', inv.length) + (inv.length ? inv.map(v => rdiv(cell(v.id, `raised ${fmtDy(v.on)}`, 2) + cell(fm(v.amt), `due ${fmtDy(v.due)}`) + `<div class="mbc"><b>${v.paid ? pill('tg', 'Paid ' + fmtDy(v.paid)) : dDiff(v.due) < 0 ? pill('tred', 'Overdue') : pill('tk', 'Waiting')}</b><small></small></div>` + btns(v.paid ? '' : nx('invPaid', v.id, 'Mark paid', 'sec')))).join('') : empty('No invoice yet.'))
    + grpH('Subcontractor payments', sps.length) + (sps.length ? sps.map(s => rdiv(cell(s.sub, s.stage, 2) + cell(fm(s.amt), '') + `<div class="mbc"><b>${pill(s.st === 'Paid' ? 'tg' : 'tk', s.st)}</b><small></small></div>`)).join('') : empty('None.')) + `<p class="hint">${later('Xero')} Invoices and payments are recorded here until the Xero link is built.</p>`; }
function sameNote(app, p){ return ''; const others = ['ret', 'del', 'com', 'acc', 'dir'].filter(a => a !== app && allowed(a));
  return `<div class="rf-same">${ico(APPI[app], 15)}<span>Same property, seen from the <b>${APPN[app]}</b> app.</span>${others.length ? `<span class="rf-oth">Open in ${others.map(a => `<button class="rf-chipb" data-act="openIn" data-v="${a}|${p.id}">${APPN[a]}</button>`).join('')}</span>` : ''}</div>`; }
A.openIn = el => { const [a, id] = el.dataset.v.split('|'); abrir(a, id, 'res'); };
function prFicha(app, p){ const tabs = ATABS[app] || ATABS.dir, t = tabOf(tabs), sc = scOf(p.sc);
  let body = {res:prSum, mea:meaTab, ret:retTab, ins:insTab, clo:cloTab, mon:monTab, inv:invTab, his:(a, x) => hisList(x.his)}[t](app, p);
  if(!canMoney(app) && ['res', 'mea'].includes(t)) body += lockCard();
  const g = phGate(p), canMove = (app === 'ret' && ['A. Job received', 'B. Assess and design'].includes(p.ph)) || (app === 'del' && ['D. Prepare to install', 'E. Install'].includes(p.ph));
  const acts = (canMove ? `<button class="btn ${g.ok ? 'pri' : 'sec'}" data-act="phNext" data-v="${p.id}" ${g.ok ? '' : 'disabled title="' + esc(g.miss.join('; ')) + '"'}>${ico(g.ok ? 'send' : 'lock', 15)}Move to ${PH[pIdx(p.ph) + 1].slice(3).toLowerCase()}</button>` : '') + (OPENP.includes(p.ph) && ['del', 'ret', 'com', 'dir'].includes(app) ? `<button class="btn sec" data-act="cnOpen" data-v="${p.id}">Cancel job</button>` : '');
  return crumb('fichaback', 'Back', esc(p.ad)) + sameNote(app, p) + oph(esc(p.ad), `${p.id}, ${p.pc}, ${sc.n}. Customer ${esc(p.res)}. Client reference ${p.ref}${p.ht ? `, ${p.ht} house` : ''}.`, acts) + `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:-6px 0 14px">${phTag(p)}${mTags(p)}${lateTag(p)}${p.ph === 'D. Prepare to install' && ready(p) ? pill('tg', 'Ready to install') : ''}</div>` + tabsBar(tabs) + body; }

/* =================== Pages of the six apps =================== */
function waitPage(app){ const rs = WAITR[app], xs = approvals().filter(a => rs.includes(a.role));
  return oph('Waiting for my approval', `${rs.map(RN).join(' and ')}: approve in one click, or reject with a comment that goes back to whoever raised it.${app === 'dir' ? ' Only what is above a scheme limit comes here.' : ''}`) + (xs.length ? xs.map(a => apCard(a, app)).join('') : empty('Nothing waiting for your approval.')); }
function sumItems(){ const al = alerts(); return APPS.map(([k, n]) => [k, n, al.filter(a => a.app === k).length, al.filter(a => a.app === k && a.tone === 'tred').length]); }
function sumPage(){ return oph('Daily summary', `What a director receives at 8:00 instead of individual alerts. Immediate alerts only for approvals waiting on you and red flags.`) + `<div class="cstats">${stat('tk', 'Approvals for you', nWait('dir'))}${stat('tred', 'Red flags', alerts().filter(a => a.tone === 'tred').length)}${stat('tk', 'Tasks overdue', DB.tk.filter(k => !k.done && dDiff(k.due) < 0).length)}</div>` + th(cell('App', '', 2) + cell('Open items', '') + cell('Red flags', '')) + sumItems().map(([k, n, c, r]) => rowO('gogo', `${k}:${HOME[k]}`, cell(n, LAPPS[k].team, 2) + cell(c, '') + `<div class="mbc"><b>${r ? pill('tred', r) : pill('tg', '0')}</b><small></small></div>`)).join(''); }
function schPage(){ return oph('Schemes', 'Every scheme with its settings, properties and money. Open one to drill down.') + th(cell('Scheme', 'Client', 2.4) + cell('Programme', 'Client system') + cell('Properties', 'target') + cell('Rating', '')) + DB.sc.map(s => { const [rt, rl] = rating(s); return rowO('ficha', s.id, tcell('ficha', s.id, esc(s.n), `${s.cl}, ${s.reg}`, 2.4) + cell(PROGS.find(x => x.id === s.prog).n, PTYPE[s.ty].sys) + cell(prsOf(s.id).filter(p => p.ph !== 'Cancelled').length, `of ${s.tgt}`) + `<div class="mbc"><b>${pill(rt, rl)}</b><small></small></div>`, S.hl === s.id); }).join(''); }
function tuePage(){ return oph('Tuesday directors’ meeting', 'Margins per scheme, cash owed and owing, approvals waiting, variations and additional costs.') + `<div class="cstats">${stat('tk', 'Approvals waiting', approvals().length)}${stat('tk', 'Owed to us', fm(sum(DB.sc, s => scMoney(s).owed)))}${stat('tk', 'Owed by us', fm(sum(DB.sc, s => scMoney(s).sup)))}${stat('tk', 'Variations and extra costs', fm(sum(DB.va, v => v.amt)))}</div>` + grpH('Margin per scheme', DB.sc.length) + DB.sc.map(s => { const m = scMoney(s); return rowO('ficha', s.id, cell(s.n, `target ${s.set.mg}%`, 2) + cell(fm(m.won), 'won') + `<div class="mbc"><b>${m.won ? mgTag(m.mgp, s.set.mg) : ''}</b><small></small></div>` + cell(fm(m.owed), 'owed to us')); }).join('') + grpH('Variations and additional costs', DB.va.length) + DB.va.map(v => rdiv(cell(`${v.id} ${v.ty}`, `${prOf(v.pr).ad}: ${esc(v.why)}`, 3) + cell(fm(v.amt), v.st))).join(''); }
function quoPage3(){ const ps = DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled');
  return oph('Quotes and budgets', 'A quote line per measure from the scheme’s rates, and its budget. Approved by the client, the budget is locked.') + th(cell('Property', 'Scheme', 2.4) + cell('Measures', '', 1.6) + cell('Quoted', 'Budget') + cell('Status', '')) + ps.map(p => { const m = pMoney(p); return rowO('prQuo3', p.id, tcell('prQuo3', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + cell(p.ms.map(x => `${MEAS[x.m].s} ${fm(x.q)}`).join(', '), '', 1.6) + cell(fm(m.q), fm(m.b)) + `<div class="mbc"><b>${p.quoteOk ? pill('tg', 'Approved, budget locked') : pill('tk', 'Waiting for the client')}</b><small></small></div>`); }).join(''); }
A.prQuo3 = el => abrir(S.view, el.dataset.v, 'mea');
function ssetPage(){ return oph('Scheme settings', 'Margin target, approval limits and payment terms per scheme. Change them at any time; every change is logged.') + DB.sc.map(s => `<section class="rsec"><div class="rs-h"><h3>${esc(s.n)}</h3><p>${s.log.length ? `Last change ${fmtDy(s.log[s.log.length - 1][0])} by ${PEO[s.log[s.log.length - 1][1]].n}` : 'No changes yet'}</p></div><div class="rf-2">${[['mg', 'Margin target (%)'], ['ord', 'Order limit (£)'], ['pay', 'Payment limit (£)'], ['vr', 'Variation limit (£)'], ['terms', 'Payment terms (days)']].map(([k, n]) => fld(n, 'scs', `${s.id}|${k}`, s.set[k], {type:'number'})).join('')}</div></section>`).join(''); }
function trgPage(){ const ps = DB.pr.filter(p => trig(p) && p.ph !== 'Cancelled'), aw = ps.filter(p => !DB.inv.some(v => v.pr === p.id));
  return oph('Payment triggers', 'Each programme has its own trigger. When it is met, the invoice line is ready to raise.', later('Xero')) + `<div class="cstats">${stat('tk', 'To invoice', aw.length, fm(sum(aw, p => pMoney(p).q)))}${stat('tk', 'Owed to us', fm(sum(DB.sc, s => scMoney(s).owed)))}${stat('tred', 'Overdue', DB.inv.filter(v => !v.paid && dDiff(v.due) < 0).length)}${stat('tk', 'Owed by us', fm(sum(DB.sc, s => scMoney(s).sup)))}</div>` + th(cell('Property', 'Scheme', 2.4) + cell('Trigger', '', 2) + cell('Amount', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + ps.map(p => { const v = DB.inv.find(x => x.pr === p.id); return rowO('prInv', p.id, tcell('prInv', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + cell(ptOf(p).trig, csName(p), 2) + cell(fm(pMoney(p).q), v ? v.id : '') + btns(v ? (v.paid ? pill('tg', 'Paid') : nx('invPaid', v.id, 'Mark paid', 'sec')) : nx('invNew', p.id, 'Raise invoice')), S.hl === p.id); }).join(''); }
A.prInv = el => abrir(S.view, el.dataset.v, 'inv');
function supPage(){ const xs = DB.or.filter(o => ['Delivered', 'Invoiced'].includes(o.st));
  return oph('Supplier invoices to match', 'Match each supplier invoice to its order: it becomes actual cost on the property and measure.', later('Xero')) + th(cell('Order', 'Supplier', 2) + cell('For', '', 2.2) + cell('Amount', '') + cell('Invoice', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + xs.map(o => rdiv(cell(o.id, o.sup, 2) + cell(o.al.length > 1 ? `${o.al.length} properties` : prOf(o.al[0].pr).ad, o.ct, 2.2) + cell(fm(o.amt), '') + cell(o.inv || 'Not matched', '') + btns(o.st === 'Delivered' ? nx('orInv', o.id, 'Match invoice') : pill('tg', 'Actual cost')))).join(''); }
function asfPage(){ const xs = DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && p.b.bk), p = prOf(S.f.ap && xs.some(x => x.id === S.f.ap) ? S.f.ap : xs[0].id);
  return oph('Assessor form', 'What the Assessor sees on site: the evidence RdSAP needs, photos with location and time, and submit for review. No account needed.') + `<div class="rf-bar">${seg('apSel', p.id, xs.map(x => [x.id, x.ad]))}</div><div class="rf-phone"><div class="rf-ph-h"><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}, ${p.ref}</small></div>${evOf(p).map(e => `<button class="rf-dl rf-tap${p.b.ev.includes(e) ? ' ok' : ''}" data-act="evTog" data-v="${p.id}|${e}"><span class="rf-ck">${p.b.ev.includes(e) ? ico('check', 14, 2.6) : ''}</span><div><b>${e}</b></div></button>`).join('')}<label class="btn sec el-up" style="width:100%;justify-content:center;margin-top:6px">${ico('camera', 15)}Add photos<input type="file" accept="image/*" multiple data-in="aph" data-k="${p.id}"></label>${(p.aph || []).map(f => `<small class="mini" style="display:block">${esc(f)}</small>`).join('')}<button class="btn pri" style="width:100%;margin-top:8px" data-act="bVis" data-v="${p.id}" ${p.b.vis && p.b.rev === 'Pending' ? 'disabled' : ''}>${p.b.vis && p.b.rev === 'Pending' ? 'Submitted for review' : 'Submit for review'}</button></div>`; }
A.apSel = el => { S.f.ap = el.dataset.v; render(); };
A.evTog = el => { const [id, e] = el.dataset.v.split('|'), p = prOf(id); p.b.ev = p.b.ev.includes(e) ? p.b.ev.filter(x => x !== e) : [...p.b.ev, e]; render(); };
IN.aph = t => { const p = prOf(t.dataset.k); p.aph = p.aph || []; [...(t.files || [])].forEach(f => p.aph.push(`${f.name}, ${fmtDy(TODAY)} 09:12, 51.39 N 0.55 E`)); his(p, `${t.files.length} assessment photos with location and time`, 'afa'); render(); toast('Photos saved with location and time.'); };
A.impOpen = () => { S.modal = {k:'imp', sc:'SC-03', f:''}; renderLayer(); };
MODALS.imp = m => modal('Import jobs from the client list', 'Upload the client’s list; one job per row, with its client reference. Nobody types them one by one.', mlab('Scheme', true) + mseg('sc', m.sc, DB.sc.map(s => [s.id, s.n])) + `<label class="btn sec el-up" style="margin-top:10px">${ico('upload', 14)}${m.f ? esc(m.f) : 'Choose the list (CSV or Excel)'}<input type="file" data-in="impf"></label>`, mfoot('Import', 'impOk', !!m.f), 600);
IN.impf = t => { if(t.files && t.files[0]){ S.modal.f = t.files[0].name; renderLayer(); } };
A.impOk = () => { const m = S.modal, s = scOf(m.sc), rows = [['11 Upper Hale Road', 'GU9 0JQ', 'Rachel Ward'], ['4 Ridgway Hill Road', 'GU9 8LS', 'Callum Brooks'], ['27 Weybourne Road', 'GU9 9EP', 'Priya Nair']]; let n = 0;
  rows.forEach(([ad, pc, res]) => { const id = 'PR-' + (2001 + DB.pr.length + n++); DB.pr.push({id, ad, pc, sc:s.id, res, ref:'EON-' + (49000 + DB.pr.length), ht:'', ph:'A. Job received', phOn:TODAY, cs:0, csTodo:null, ms:[{m:'LI', q:RATE[s.ty].LI || 1250, b:Math.round((RATE[s.ty].LI || 1250) * BUD), dsg:false, dap:false, ip:0}], b:{bk:false, vis:false, rev:null, docs:[], mod:null, ts:false, ev:[], revisits:0}, d:Object.fromEntries(DITEMS.map(([k]) => [k, 'Not booked'])), dna:{scf:true, gas:true}, g:{}, hand:{}, his:[[TODAY, `Imported from ${m.f}`, 'sys']], rev:null, paid:null, cancel:null, quoteOk:false}); });
  S.modal = null; DB.runs.push([TODAY, 'ret', `created ${rows.length} jobs from ${m.f} and assigned them to the Survey admin`, '']); render(); toast(`<b>Automation:</b> The system created ${rows.length} jobs on ${esc(s.n)} and assigned them to the Survey admin`); };
function delHome(){ const xs = DB.pr.filter(p => ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph));
  return oph('Delivery overview', 'Per scheme: properties by phase, Ready to install, hold points waiting and client systems to update.') + `<div class="cstats">${stat('tk', 'Ready to install', xs.filter(p => p.ph === 'D. Prepare to install' && ready(p)).length, '', 'gogo', 'del:rdy')}${stat('tred', 'Hold points waiting', xs.filter(p => p.hold || p.hold2).length, '', 'gogo', 'del:hold')}${stat('tk', 'Client system updates', DB.pr.filter(p => p.csTodo).length, '', 'gogo', 'del:cs')}${stat('tk', 'Waiting for my approval', nWait('del'), '', 'gogo', 'del:wait')}</div>`
    + th(cell('Scheme', 'Client system', 2.4) + ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out'].map(ph => cell(ph.slice(3), ph.slice(0, 1))).join('') + cell('Blocked', 'or late')) + DB.sc.map(s => { const ps = prsOf(s.id); return rowO('scf2', s.id, cell(s.n, PTYPE[s.ty].sys, 2.4) + ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out'].map(ph => cell(ps.filter(p => p.ph === ph).length, '')).join('') + `<div class="mbc"><b>${ps.filter(p => isBlocked(p) || late(p)).length ? pill('tred', ps.filter(p => isBlocked(p) || late(p)).length) : pill('tg', '0')}</b><small></small></div>`); }).join(''); }
A.scf2 = el => { S.f.sc = el.dataset.v; go('del', 'pro'); };
function cloPage(){ const xs = DB.pr.filter(p => p.ph === 'F. Close out');
  return oph('Close out', 'Handover pack, lodgement with its TrustMark reference and the final uploads to the client system.', later('DocuSign sign off')) + th(cell('Property', 'Scheme', 2.4) + cell('Handover', 'items') + cell('TrustMark', '') + cell('Client system', '', 1.6)) + xs.map(p => { const n = HAND.filter(h => !(h.includes('solar') && !p.ms.some(x => x.m === 'SPV'))), d = n.filter(h => p.hand[h]).length; return rowO('prClo', p.id, tcell('prClo', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + `<div class="mbc"><b>${d} of ${n.length}</b>${bar1(d / n.length * 100)}</div>` + cell(p.hand['TrustMark lodgement'] ? 'TM-' + (720000 + parseInt(p.id.slice(3))) : 'To lodge', '') + cell(ptOf(p).sys, csName(p), 1.6), S.hl === p.id); }).join(''); }
A.prClo = el => abrir(S.view, el.dataset.v, 'clo');
function hsPage(){ const xs = DB.pr.filter(p => p.ph === 'D. Prepare to install');
  return oph('Health and safety', 'Safety paperwork before anyone starts on site, and insurances and accreditations with their expiry dates.') + grpH('Insurances and accreditations', HSD.length) + HSD.map(h => rdiv(cell(h.n, '', 2.4) + cell(fmtDy(h.exp), fmtD(h.exp)) + `<div class="mbc"><b>${dDiff(h.exp) < 30 ? pill('ta', `Expires in ${dDiff(h.exp)} days`) : pill('tg', 'Valid')}</b><small></small></div>`)).join('') + grpH('Risk assessment and method statement', xs.length) + xs.map(p => rowO('prIns', p.id, tcell('prIns', p.id, esc(p.ad), scOf(p.sc).n, 2.4) + `<div class="mbc"><b>${p.d.rams === 'Done' ? pill('tg', 'Signed off') : pill('ta', p.d.rams)}</b><small>${RN('hse')}</small></div>`)).join(''); }
function mtgPage(w){ const xs = DB.tk.filter(k => !k.done);
  if(w === 'thu') return oph('Thursday meeting', 'Action and task follow up. No money.', later('Fellow')) + th(cell('Task', 'From', 3) + cell('Owner', '') + cell('Due', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + xs.map(k => rdiv(cell(esc(k.t), k.src, 3) + cell(RN(k.r), RP(k.r)) + cell(dDiff(k.due) < 0 ? pill('tred', fmtD(k.due)) : fmtD(k.due), '') + btns(nx('tkDone', k.id, 'Mark done', 'sec')))).join('');
  return oph('Monday meeting', 'Progress per scheme, blocked and overdue items, tasks due. No money.', later('Fellow')) + th(cell('Scheme', 'Client', 2) + OPENP.map(ph => cell(ph.slice(0, 1), ph.slice(3))).join('') + cell('Blocked', 'or late')) + DB.sc.map(s => { const ps = prsOf(s.id); return rdiv(cell(s.n, s.cl, 2) + OPENP.map(ph => cell(ps.filter(p => p.ph === ph).length, '')).join('') + `<div class="mbc"><b>${ps.filter(p => isBlocked(p) || late(p)).length}</b><small></small></div>`); }).join('') + grpH('Tasks due this week', xs.filter(k => dDiff(k.due) <= 7).length) + xs.filter(k => dDiff(k.due) <= 7).map(k => rdiv(cell(esc(k.t), k.src, 3) + cell(RN(k.r), RP(k.r)) + cell(fmtD(k.due), ''))).join(''); }
function myTasks(){ const xs = DB.tk.filter(k => !k.done && (k.r === S.role || S.role === 'dir' && k.r === 'dir'));
  return oph('My tasks', `Tasks for ${RN(S.role)}. Switch “Viewing as” to see another role’s list.`, nx('tkNew', '', 'Add a task')) + (xs.length ? xs.map(k => rdiv(cell(esc(k.t), k.src, 3) + cell(dDiff(k.due) < 0 ? pill('tred', fmtD(k.due)) : fmtD(k.due), '') + btns(nx('tkDone', k.id, 'Mark done')))).join('') : empty('Nothing assigned to this role. All tasks by team shows the rest.')); }

/* =================== The six apps =================== */
const S3 = (app, items) => sbar(items, S.page[app], pageAct(app), sbar0(app));
const sbar0 = app => '';
Object.keys(VIEWS).forEach(k => delete VIEWS[k]);
const W = app => ['wait', 'My approvals', 'checks', nWait(app), 2];
const AU = ['auto', 'Automations', 'sync'];
VIEWS.dir = {side:() => S3('dir', [['-', 'Decide'], ['dec', 'Needs your decision', 'bell', pend('dir').length, 2], W('dir'), ['sum', 'Daily summary', 'mail'], ['-', 'Business'], ['ovw', 'Business overview', 'chart'], ['sch', 'Schemes', 'building', DB.sc.length, 1], ['prs', 'Properties', 'home', DB.pr.filter(p => OPENP.includes(p.ph)).length, 1], ['tue', 'Tuesday directors’ meeting', 'cal'], ['-', 'Settings'], ['nsc', 'New scheme setup', 'plus'], ['rol', 'Roles per scheme', 'users'], AU]),
  pages:{dec:() => atnPage('dir', 'Needs your decision', 'Margins below target, jobs over time and approvals above the limits. Each one opens with its context.'), wait:() => waitPage('dir'), sum:sumPage, ovw:ovwPage, sch:schPage, prs:() => oph('Properties', 'Every property of every scheme, by phase.') + prList(DB.pr, 'dir'), tue:tuePage, nsc:nscPage, rol:rolPage, auto:() => autoPage('dir')}};
VIEWS.com = {side:() => S3('com', [['-', 'Work'], ['mrg', 'Margins', 'trend'], ['atn', 'Needs attention', 'bell', pend('com').length, 2], W('com'), ['quo', 'Quotes and budgets', 'calc'], ['var', 'Variations and costs', 'swap', DB.va.filter(v => !['Approved', 'Rejected'].includes(v.st)).length, 1], ['-', 'Settings'], ['rate', 'Rates', 'tag'], ['sset', 'Scheme settings', 'cog'], AU]),
  pages:{mrg:mrgPage, atn:() => atnPage('com', 'Needs attention', 'Margins below target, costs over budget and variations waiting for the client.'), wait:() => waitPage('com'), quo:quoPage3, var:varPage, rate:ratePage, sset:ssetPage, auto:() => autoPage('com')}};
VIEWS.acc = {side:() => S3('acc', [['-', 'Work'], ['trg', 'Payment triggers', 'flag'], ['atn', 'Needs attention', 'bell', pend('acc').length, 2], ['inv', 'Invoices', 'receipt'], ['sup', 'Invoice matching', 'checks', DB.or.filter(o => o.st === 'Delivered').length, 1], ['sub', 'Subcontractors', 'wallet'], AU]),
  pages:{trg:trgPage, atn:() => atnPage('acc', 'Needs attention', 'Triggers met, overdue invoices, subcontractors to pay.'), inv:invPage, sup:supPage, sub:subPage, auto:() => autoPage('acc')}};
VIEWS.ret = {side:() => S3('ret', [['-', 'Work'], ['atn', 'Needs attention', 'bell', pend('ret').length, 2], W('ret'), ['bk', 'Bookings', 'cal', DB.pr.filter(p => p.ph === 'A. Job received').length, 1], ['rq', 'Review queue', 'todo', DB.pr.filter(p => p.ph === 'B. Assess and design').length, 1], ['pk', 'Survey pack', 'send'], ['-', 'On site'], ['asf', 'Assessor form', 'phone'], AU]),
  pages:{atn:() => atnPage('ret', 'Needs attention', 'Jobs to book, revisits, packs ready to send and client system updates at survey stage.'), wait:() => waitPage('ret'), bk:() => bkPage().replace('</p></div>', `</p></div><div class="eh-a">${later('Microsoft 365 calendar')}<button class="btn pri" data-act="impOpen">${ico('upload', 15)}Import jobs from client list</button></div>`), rq:rqPage, pk:packPage, asf:asfPage, auto:() => autoPage('ret')}};
VIEWS.del = {side:() => S3('del', [['-', 'Work'], ['hom', 'Overview', 'grid'], ['atn', 'Needs attention', 'bell', pend('del').length, 2], W('del'), ['pro', 'Properties', 'home', DB.pr.filter(p => ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph)).length, 1], ['rdy', 'Ready to install', 'checks'], ['hold', 'Redbridge tracker', 'building'], ['ord', 'Purchasing', 'cart', DB.or.filter(o => !['Invoiced', 'Rejected'].includes(o.st)).length, 1], ['clo', 'Close out', 'flag'], ['hs', 'Health and safety', 'shield'], ['cs', 'Client systems', 'sync', DB.pr.filter(p => p.csTodo).length, 2], ['-', 'On site'], ['site', 'Site forms', 'phone'], AU]),
  pages:{hom:delHome, atn:() => atnPage('del', 'Needs attention', 'Ready to install, hold points, client systems to update and expiring certificates.'), wait:() => waitPage('del'), pro:() => oph('Properties', 'From client approval to close out, per scheme.') + prList(DB.pr.filter(p => pIdx(p.ph) >= 2), 'del'), rdy:rdyPage, hold:holdPage, ord:ordPage, clo:cloPage, hs:hsPage, cs:csPage, site:frmPage, auto:() => autoPage('del')}};
VIEWS.tsk = {side:() => S3('tsk', [['-', 'Work'], ['my', 'My tasks', 'todo', DB.tk.filter(k => !k.done && k.r === S.role).length, 1], ['tk', 'All tasks by team', 'list', DB.tk.filter(k => !k.done).length, 1], ['-', 'Meetings'], ['mon', 'Monday meeting', 'cal'], ['thu', 'Thursday meeting', 'cal'], AU]),
  pages:{my:myTasks, tk:tkPage, mon:() => mtgPage('mon'), thu:() => mtgPage('thu'), auto:() => autoPage('tsk')}};
APPS.forEach(([a]) => { A[pageAct(a)] = el => { S.fi[a] = null; S.page[a] = el.dataset.v; render(true); }; });
A.gogo = el => { const [a, p] = el.dataset.v.split(':'); if(!allowed(a)) return toast(`${APPN[a]} is not available for ${RN(S.role)}.`); go(a, p); };

/* =================== Workspace: launcher, app header, viewing as, notifications =================== */
function launcher(){ const r = S.role;
  return `<div class="rf-hero" style="background-image:linear-gradient(90deg, rgba(22,48,110,.94), rgba(22,48,110,.55)), url(${RIMG.hero})"><div><small>REFYT workspace</small><h1>Six apps, one per team, on the same information</h1><p>Every property is saved once in the REFYT system. Each team works in its own app; what one records, the others see straight away.</p></div><div class="rf-hv"><small>Viewing as</small><button class="rf-rb" data-act="popRole">${RN(r)}<span>${RP(r)}</span>${ico('chev', 13)}</button></div></div>`
    + `<div class="rf-lgrid">${APPS.map(([k, n, ic]) => { const L = LAPPS[k], ok = allowed(k), c = k === 'tsk' ? DB.tk.filter(t => !t.done && t.r === r).length : pend(k).length + (WAITR[k] ? nWait(k) : 0);
      return `<button class="rf-lc${ok ? '' : ' lock'}" data-act="${ok ? 'view' : 'lockedApp'}" data-v="${k}"><span class="rf-lph" style="background-image:url(${RIMG[k]})"></span><span class="rf-lb"><span class="rf-lt"><span class="rf-ai">${ico(ic, 18)}</span><b>${n}</b>${ok && c ? `<em class="rf-cnt">${c}</em>` : ''}</span><small>${L.team}</small><span class="rf-ll">${L.line}</span><span class="rf-lr">${(L.roles.length ? L.roles : ['all']).map(x => `<i>${x === 'all' ? 'Every role' : RN(x)}</i>`).join('')}</span><span class="rf-lgo">${ok ? `Open ${n} ${ico('chev', 13)}` : `${ico('lock', 13)} Not available for ${RN(r)}`}</span></span></button>`; }).join('')}</div>`
    + `<div class="rf-shared">${ico('db', 18)}<div><b>One set of boards behind all six</b><small>Programmes, schemes, properties, property measures, purchasing, quotes and costs, invoices and tasks: 21 boards, each app reads or edits only what its team needs.</small></div><button class="btn sec sm" data-act="view" data-v="db">See the data map</button></div>`; }
A.lockedApp = el => toast(`${APPN[el.dataset.v]} is not available for ${RN(S.role)}. Switch “Viewing as” to a role that uses it.`);
A.goHome = () => { S.view = 'home'; S.pop = null; render(true); };
A.popSw = () => { S.pop = S.pop === 'sw' ? null : 'sw'; drawPop(); };
A.popRole = el => { S.pop = S.pop === 'role' ? null : 'role'; S.popAt = el.getBoundingClientRect(); drawPop(); };
A.popNt = () => { S.pop = S.pop === 'nt' ? null : 'nt'; drawPop(); };
A.setRole = el => { S.role = el.dataset.v; S.pop = null; if(S.view !== 'home' && S.view !== 'db' && !allowed(S.view)) S.view = 'home'; render(true); toast(`Viewing as ${RN(S.role)}: ${APPS.filter(([k]) => allowed(k)).map(a => a[1]).join(', ')}.`); };
const origView = A.view; A.view = el => { if(!allowed(el.dataset.v)) return A.lockedApp(el); S.pop = null; origView(el); };
function drawPop(){ let el = document.getElementById('rfpop'); if(!el){ el = document.createElement('div'); el.id = 'rfpop'; document.body.appendChild(el); } if(!S.pop){ el.innerHTML = ''; return; }
  const top = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom + 6;
  if(S.pop === 'sw') el.innerHTML = `<div class="rf-pop" style="top:${top}px;left:16px"><small class="rf-ph">Switch app</small>${APPS.map(([k, n, ic]) => `<button class="rf-pi${allowed(k) ? '' : ' lock'}" data-act="${allowed(k) ? 'view' : 'lockedApp'}" data-v="${k}"><span class="rf-ai">${ico(ic, 15)}</span><b>${n}</b><small>${allowed(k) ? LAPPS[k].team : 'Not available'}</small></button>`).join('')}<button class="rf-pi" data-act="goHome"><span class="rf-ai">${ico('grid', 15)}</span><b>REFYT workspace</b><small>All apps</small></button></div>`;
  if(S.pop === 'role') el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:16px"><small class="rf-ph">Viewing as</small>${Object.entries(ROLES).filter(([k]) => roleOk(k)).map(([k, [n]]) => `<button class="rf-pi${S.role === k ? ' on' : ''}" data-act="setRole" data-v="${k}"><b>${n}</b><small>${RP(k)}, ${APPS.filter(([a]) => a === 'tsk' || k === 'dir' || (LAPPS[a].roles || []).includes(k)).map(a => a[1]).join(', ')}</small></button>`).join('')}</div>`;
  if(S.pop === 'nt'){ const head = S.role === 'dir', mine = alerts().filter(a => APPS.some(([k]) => k === a.app && k !== 'tsk' && allowed(k))), now = head ? [...approvals().filter(a => a.role === 'dir').map(a => ({t:a.t, d:a.k + ' above the scheme limit'})), ...mine.filter(a => a.tone === 'tred').map(a => ({t:a.t, d:a.k}))] : mine.slice(0, 8).map(a => ({t:a.t, d:a.k}));
    el.innerHTML = `<div class="rf-pop wide" style="top:${top}px;right:16px"><small class="rf-ph">${head ? 'Immediate: approvals waiting on you and red flags' : `Your items as ${RN(S.role)}`}</small>${now.slice(0, 8).map(x => `<div class="rf-ni"><b>${esc(x.t)}</b><small>${esc(x.d)}</small></div>`).join('') || '<div class="rf-ni"><small>Nothing right now.</small></div>'}${head ? `` : '<p class="hint" style="margin:8px 0 0">Your head of team gets these in a daily summary, not one by one.</p>'}</div>`; } }
document.addEventListener('click', e => { if(S.pop && !e.target.closest('.rf-pop') && !e.target.closest('[data-act^="pop"]')){ S.pop = null; drawPop(); } });
function render(top){
  const ap = APPS.find(a => a[0] === S.view), nt = alerts().filter(a => APPS.some(([k]) => k === a.app && k !== 'tsk' && allowed(k))).length;
  document.title = 'Refyt';
  $('#appsw').innerHTML = ap ? `<button class="rf-hb" data-act="goHome" title="REFYT workspace">${ico('grid', 16)}</button><span class="rf-apph"><span class="rf-ai">${ico(ap[2], 16)}</span><b>${ap[1]}</b></span><button class="rf-hb wide" data-act="popSw">Switch app ${ico('chev', 12)}</button>` : S.view === 'db' ? `<button class="rf-hb" data-act="goHome">${ico('grid', 16)}</button><span class="rf-apph"><span class="rf-ai">${ico('db', 16)}</span><b>Data</b></span>` : `<span class="rf-apph"><b>REFYT workspace</b></span>`;
  $('#tools').innerHTML = `<button class="rf-hb wide" data-act="popRole" title="Change the role">${ico('user', 14)}<span class="rf-vas">Viewing as</span> ${RN(S.role)}</button><button class="rf-hb" data-act="popNt" title="Notifications">${ico('bell', 16)}${nt ? `<em class="rf-dot">${nt > 9 ? '9+' : nt}</em>` : ''}</button><button class="btn sec sm vsb" data-act="vsel" title="Versions">${VCUR.v}<span class="vs-ch">${ico('chev', 13)}</span></button><button class="btn sec sm tourb" data-act="tour">${ico('flag', 14)}Tour</button>`;
  for(const k of [...APPS.map(a => a[0]), 'db', 'home']){ const el = $('#v-' + k); if(el) el.hidden = S.view !== k; }
  const key = S.view + ':' + (S.page[S.view] || '') + ':' + (S.fi[S.view] || ''), main = $('#main'), keep = main.scrollTop;
  if(S.view === 'home') $('#a-home').innerHTML = `<div class="op">${launcher()}</div>`;
  else if(S.view === 'db'){ $('#dbview').innerHTML = `<div class="op">${dbPage()}</div>`; requestAnimationFrame(dbLines); }
  else { const V = VIEWS[S.view], pg = S.page[S.view], fi = S.fi[S.view], c = fichaOf(fi); $('#a-' + S.view).innerHTML = V.side() + `<div class="op">${pg === 'help' ? helpPage(S.view) : c ? FICHAR(S.view, fi) : (V.pages[pg] || Object.values(V.pages)[0])()}</div>`; }
  main.scrollTop = top || key !== lastKey ? 0 : keep; lastKey = key;
  renderLayer(); drawTour(); drawPop(); requestAnimationFrame(sizeKb); }

/* =================== v3.1: straight into an app, tasks per team, Director dashboards =================== */
[['Match October supplier invoices to orders', 'acc', 2, 'Job PR-2003'], ['Chase Medway Council for Saxton Street', 'acc', -2, 'Monday team meeting'], ['Review the Dane Road design pack', 'dap', 1, 'Job PR-2008'], ['Book the first Waverley assessments', 'sad', 4, 'Thursday follow up'], ['Price the windows variation, Fencepiece Road', 'com', 2, 'Job PR-2020'], ['Confirm the scaffold date, Manford Way', 'inc', 1, 'Job PR-2021'], ['Send the Tuesday margin pack', 'dir', 1, 'Tuesday directors']].forEach(([t, r, d, src]) => DB.tk.push({id:'TK-' + (++DB.seq.tk), t, r, due:addDays(TODAY, d), src, done:false}));
const firstApp = () => (APPS.find(([k]) => k !== 'tsk' && allowed(k)) || ['tsk'])[0];
const teamOf = r => r === 'dir' ? 'dir' : (Object.keys(LAPPS).find(a => LAPPS[a].roles.includes(r)) || 'tsk');
const tkSt = k => k.done ? pill('tg', 'Done') : dDiff(k.due) < 0 ? pill('tred', 'Overdue') : pill('tk', 'Open');
const tkSrc = k => k.src.startsWith('Job ') ? `<button class="lnk4" data-act="prOpen" data-v="${k.src.slice(4)}">From job ${k.src.slice(4)}</button>` : `From ${esc(k.src)}`;
const tkRow = k => rdiv(`<div class="mbc" style="flex:3"><b>${esc(k.t)}</b><small>${tkSrc(k)}</small></div>` + cell(RN(k.r), RP(k.r), 1.4) + `<div class="mbc"><b${!k.done && dDiff(k.due) < 0 ? ' class="rf-od"' : ''}>${fmtDy(k.due)}</b><small>${k.done ? '' : fmtD(k.due)}</small></div>` + `<div class="mbc"><b>${tkSt(k)}</b><small></small></div>` + btns(k.done ? '' : nx('tkDone', k.id, 'Mark done', 'sec')), !k.done && dDiff(k.due) < 0);
const tkHead = () => th(cell('Task', 'Created from', 3) + cell('Owner', '', 1.4) + cell('Due', '') + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>');
function teamTasks(app){ const xs = DB.tk.filter(k => teamOf(k.r) === app), op = xs.filter(k => !k.done).sort((a, b) => a.due < b.due ? -1 : 1), dn = xs.filter(k => k.done);
  return oph('Tasks', `${LAPPS[app].team}: tasks from the weekly meetings and from jobs, with owner, due date and status. Overdue first.`, nx('tkNew', '', 'Add a task')) + `<div class="cstats">${stat('tk', 'Open', op.length)}${stat(op.some(k => dDiff(k.due) < 0) ? 'tred' : 'tg', 'Overdue', op.filter(k => dDiff(k.due) < 0).length)}${stat('tk', 'Due this week', op.filter(k => dDiff(k.due) >= 0 && dDiff(k.due) <= 7).length)}</div>` + tkHead() + (op.length ? op.map(tkRow).join('') : empty('Nothing open for this team.')) + (dn.length ? grpH('Done', dn.length) + dn.map(tkRow).join('') : ''); }
function allTasks(){ const tm = S.f.ttm || '', xs = DB.tk.filter(k => !tm || teamOf(k.r) === tm).sort((a, b) => (a.done - b.done) || (a.due < b.due ? -1 : 1));
  return oph('All tasks by team', 'Every team’s tasks in one view, from meetings and from jobs. Filter by team.', nx('tkNew', '', 'Add a task')) + `<div class="rf-bar">${seg('ttm', tm, [['', 'All teams', DB.tk.filter(k => !k.done).length], ...APPS.filter(a => a[0] !== 'tsk').map(([k, n]) => [k, n, DB.tk.filter(t => !t.done && teamOf(t.r) === k).length])])}</div>` + tkHead() + xs.map(tkRow).join(''); }
A.ttm = el => { S.f.ttm = el.dataset.v; render(); };
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side, act = pageAct(a), anc = `<button class="nav" data-act="${act}" data-v="auto"`;
  VIEWS[a].side = () => o().replace(anc, sbItem(S.page[a], act)(['tasks', 'Tasks', 'todo', DB.tk.filter(k => !k.done && teamOf(k.r) === a).length, DB.tk.some(k => !k.done && teamOf(k.r) === a && dDiff(k.due) < 0) ? 2 : 1]) + anc);
  VIEWS[a].pages.tasks = () => teamTasks(a); });
HOME.tsk = 'mon'; S.page.tsk = 'mon';
VIEWS.tsk = {side:() => sbar([['-', 'Meetings'], ['mon', 'Monday meeting', 'cal'], ['thu', 'Thursday meeting', 'cal'], ['-', 'Tasks'], ['all', 'All tasks by team', 'list', DB.tk.filter(k => !k.done).length, 1], AU], S.page.tsk, pageAct('tsk')), pages:{mon:() => mtgPage('mon'), thu:() => mtgPage('thu'), all:allTasks, auto:() => autoPage('tsk')}};

/* =================== Header: the app name next to the logo, and an app dropdown =================== */
const VC = () => VERSIONS.find(v => v.current);
A.setRole = el => { S.role = el.dataset.v; S.pop = null; S.view = firstApp(); render(true); toast(`Viewing as ${RN(S.role)}: ${APPN[S.view]} opened.`); };
A.goHome = () => { S.view = firstApp(); S.pop = null; render(true); };
function drawPop(){ let el = document.getElementById('rfpop'); if(!el){ el = document.createElement('div'); el.id = 'rfpop'; document.body.appendChild(el); } if(!S.pop){ el.innerHTML = ''; return; }
  const top = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom + 6;
  if(S.pop === 'sw') el.innerHTML = `<div class="rf-pop" style="top:${top}px;left:16px"><small class="rf-ph">Apps</small>${APPS.map(([k, n, ic]) => { const ok = allowed(k); return `<button class="rf-pi${ok ? '' : ' lock'}${S.view === k ? ' on' : ''}" data-act="${ok ? 'view' : 'lockedApp'}" data-v="${k}" ${ok ? '' : 'aria-disabled="true"'}><span class="rf-ai">${ico(ok ? ic : 'lock', 15)}</span><b>${n}</b><small>${ok ? LAPPS[k].team : `Not available for ${RN(S.role)}`}</small></button>`; }).join('')}<div class="rf-psep"></div><button class="rf-pi${S.view === 'db' ? ' on' : ''}" data-act="view" data-v="db"><span class="rf-ai">${ico('db', 15)}</span><b>Data map</b><small>The records behind all five apps</small></button></div>`;
  if(S.pop === 'role') el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:16px"><small class="rf-ph">Viewing as</small>${Object.entries(ROLES).filter(([k]) => roleOk(k)).map(([k, [n]]) => `<button class="rf-pi${S.role === k ? ' on' : ''}" data-act="setRole" data-v="${k}"><b>${n}</b><small>${RP(k)}, ${APPS.filter(([a]) => a === 'tsk' || k === 'dir' || (LAPPS[a].roles || []).includes(k)).map(a => a[1]).join(', ')}</small></button>`).join('')}</div>`;
  if(S.pop === 'nt'){ const head = S.role === 'dir', mine = alerts().filter(a => APPS.some(([k]) => k === a.app && k !== 'tsk' && allowed(k))), now = head ? [...approvals().filter(a => a.role === 'dir').map(a => ({t:a.t, d:a.k + ' above the scheme limit'})), ...mine.filter(a => a.tone === 'tred').map(a => ({t:a.t, d:a.k}))] : mine.slice(0, 8).map(a => ({t:a.t, d:a.k}));
    el.innerHTML = `<div class="rf-pop wide" style="top:${top}px;right:16px"><small class="rf-ph">${head ? 'Immediate: approvals waiting on you and red flags' : `Your items as ${RN(S.role)}`}</small>${now.slice(0, 8).map(x => `<div class="rf-ni"><b>${esc(x.t)}</b><small>${esc(x.d)}</small></div>`).join('') || '<div class="rf-ni"><small>Nothing right now.</small></div>'}${head ? `` : '<p class="hint" style="margin:8px 0 0">Your head of team gets these in a daily summary, not one by one.</p>'}</div>`; } }
function drawVs(){ let el = document.getElementById('vsel'); if(!el){ el = document.createElement('div'); el.id = 'vsel'; document.body.appendChild(el); } const b = document.querySelector('.vsb'); if(!S.vs.open || !b){ el.innerHTML = ''; return; }
  const r = b.getBoundingClientRect(), w = Math.min(440, innerWidth - 16), left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8));
  el.innerHTML = `<div class="vs-pan" role="dialog" aria-label="Versions" style="top:${r.bottom + 8}px; left:${left}px; width:${w}px"><div class="vs-h"><div><b>Versions</b><small>The app always shows the latest version</small></div><span class="vs-tag">${VC().v}</span><button class="ib" data-act="vsx" aria-label="Close">${ico('x', 15)}</button></div><div class="vs-b">${VERSIONS.filter(v => v.major || v.current).slice().reverse().map(v => `<div class="vs-r${v.current ? ' cur' : ''}"><div class="vs-t"><b>${v.v}</b><span>${fmtDy(v.date)}</span>${v.current ? '<em class="vs-c">Current</em>' : ''}</div><div class="vs-n">${esc(v.title)}</div><p>${esc(v.sum)}</p><div style="display:flex;gap:8px;margin-top:8px">${v.steps && v.steps.length ? `<button class="btn sec sm" data-act="vsTour" data-v="${v.v}">What changed</button>` : ''}${v.url ? `<a class="btn sec sm" href="${v.url}" target="_blank" rel="noopener">Open this version</a>` : ''}</div></div>`).join('')}</div><div class="vs-f">Earlier versions open in a new tab, exactly as they were.</div></div>`; }
function render(top){
  if(S.view === 'home' || (S.view !== 'db' && !allowed(S.view))) S.view = firstApp();
  const ap = APPS.find(a => a[0] === S.view), nt = alerts().filter(a => APPS.some(([k]) => k === a.app && k !== 'tsk' && allowed(k))).length;
  document.title = 'Refyt';
  $('#appsw').innerHTML = `<button class="rf-appdd" data-act="popSw" aria-haspopup="true" aria-expanded="${S.pop === 'sw'}"><span class="rf-ai">${ico(ap ? ap[2] : 'db', 16)}</span><span class="rf-adn"><b>${ap ? ap[1] : 'Data map'}</b><small>${ap ? LAPPS[ap[0]].team : 'All five apps'}</small></span>${ico('chev', 13)}</button>`;
  $('#tools').innerHTML = `<button class="rf-hb wide" data-act="popRole" title="Change the role">${ico('user', 14)}<span class="rf-vas">Viewing as</span> ${RN(S.role)}</button><button class="rf-hb" data-act="popNt" title="Notifications">${ico('bell', 16)}${nt ? `<em class="rf-dot">${nt > 9 ? '9+' : nt}</em>` : ''}</button><button class="btn sec sm vsb" data-act="vsel" title="Versions">${VC().v}<span class="vs-ch">${ico('chev', 13)}</span></button><button class="btn sec sm tourb" data-act="tour">${ico('flag', 14)}Tour</button>`;
  for(const k of [...APPS.map(a => a[0]), 'db', 'home']){ const el = $('#v-' + k); if(el) el.hidden = S.view !== k; }
  const key = S.view + ':' + (S.page[S.view] || '') + ':' + (S.fi[S.view] || ''), main = $('#main'), keep = main.scrollTop;
  if(S.view === 'db'){ $('#dbview').innerHTML = `<div class="op">${dbPage()}</div>`; requestAnimationFrame(dbLines); }
  else { const V = VIEWS[S.view], pg = S.page[S.view], fi = S.fi[S.view], c = fichaOf(fi); $('#a-' + S.view).innerHTML = V.side() + `<div class="op">${pg === 'help' ? helpPage(S.view) : c ? FICHAR(S.view, fi) : (V.pages[pg] || Object.values(V.pages)[0])()}</div>`; }
  main.scrollTop = top || key !== lastKey ? 0 : keep; lastKey = key;
  renderLayer(); drawTour(); drawPop(); requestAnimationFrame(sizeKb); }

/* =================== DASHBOARDS: section 16, on the same numbers as the apps =================== */
S.f.d = {pg:'', sc:'', tm:'', per:'', m:'', dr:'4w', tr:'week'};
const DD = () => S.f.d;
const fSc = () => DB.sc.filter(s => (!DD().pg || s.prog === DD().pg) && (!DD().sc || s.id === DD().sc));
const fPr = (all) => DB.pr.filter(p => (all || p.ph !== 'Cancelled') && fSc().some(s => s.id === p.sc) && (!DD().m || p.ms.some(x => x.m === DD().m)) && (!S.f.dq || norm(`${p.ad} ${p.id} ${p.pc}`).includes(norm(S.f.dq))));
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const DTEAM = {ret:['A. Job received', 'B. Assess and design'], com:['C. Client approval'], del:['D. Prepare to install', 'E. Install', 'F. Close out'], acc:['Paid'], dir:PH};
const PWHO = {afa:'ass', xen:'ass', ram:'aap', ahm:'dsg', dre:'inc', akr:'sit', lan:'acc', tom:'com', yah:'dir', sar:'sad', hse:'hse'};
IN.df = t => { S.f.d[{dfpg:'pg', dfsc:'sc', dftm:'tm', dfper:'per', dfm:'m'}[t.dataset.k]] = t.value; };
A.ddr = el => { S.f.d.dr = el.dataset.v; render(); }; A.dtr = el => { S.f.d.tr = el.dataset.v; render(); };
A.dReset = () => { Object.assign(S.f.d, {pg:'', sc:'', tm:'', per:'', m:''}); render(); };
function dFilters(){ const d = DD();
  return dBar65()
    + `<div class="rf-bar">${seg('ddr', d.dr, [['4w', 'Last 4 weeks'], ['y', 'Last 12 months']])}<span class="rf-tl">Trend by</span>${seg('dtr', d.tr, [['week', 'Week'], ['month', 'Month']])}</div>`; }
function buckets(){ const d = DD(), win = {'4w':4, q:13, y:52}[d.dr], per = {week:1, month:4.33, quarter:13}[d.tr], n = Math.max(2, Math.min(13, Math.round(win / per)));
  const lab = i => { const back = n - 1 - i; return d.tr === 'week' ? 'W' + (44 - back) : d.tr === 'month' ? MSH[((9 - back) % 12 + 12) % 12] : `Q${((3 - back) % 4 + 4) % 4 + 1}`; };
  return {n, lab:Array.from({length:n}, (_, i) => lab(i)), per}; }
/* Trend values end on the period that matches today’s numbers in the apps */
const tvals = (last, key, n) => Array.from({length:n}, (_, i) => i === n - 1 ? last : Math.max(0, last * (.62 + .38 * i / (n - 1)) * (1 + .12 * Math.sin(i * 1.9 + key.length))));
function chart(vals, labels, f, title, vals2, names){ const mx = Math.max(1, ...vals, ...(vals2 || [])), W = 640, H = 150, bw = W / vals.length, two = !!vals2;
  return `<div class="rf-ch"><div class="rf-chh"><b>${title}</b>${two ? `<span><i class="a"></i>${names[0]}<i class="b"></i>${names[1]}</span>` : ''}</div><svg viewBox="0 0 ${W} ${H + 40}" role="img" aria-label="${esc(title)}"><line x1="0" x2="${W}" y1="${H + 2}" y2="${H + 2}" stroke="#D1D9E2"/><text x="2" y="12" font-size="11" fill="#334155">${f(mx)}</text>${vals.map((v, i) => { const sl = two ? 2 : 1, w = bw * .62 / sl, x0 = i * bw + bw * .19; const bar = (val, j, fill) => { const h = Math.round(val / mx * (H - 20)), x = x0 + j * w; return `<rect x="${x}" y="${H + 2 - h}" width="${w - 2}" height="${h}" rx="3" fill="${fill}"><title>${labels[i]}: ${f(val)}</title></rect>${sl === 1 ? `<text x="${x + w / 2}" y="${H - h - 3}" text-anchor="middle" font-size="10.5" fill="#334155">${f(val)}</text>` : ''}`; };
    return bar(v, 0, i === vals.length - 1 ? '#1E3A8A' : '#6B87C9') + (two ? bar(vals2[i], 1, '#16306E') : '') + `<text x="${i * bw + bw / 2}" y="${H + 20}" text-anchor="middle" font-size="11" fill="#334155">${labels[i]}</text>`; }).join('')}</svg></div>`; }
function cmp(rows){ const ss = fSc();
  return grpH('Compare schemes side by side', ss.length) + `<div class="el-wide"><div class="rf-mx"><table><thead><tr><th></th>${ss.map(s => `<th><button class="lnk4" data-act="ficha" data-v="${s.id}"><b>${esc(s.n)}</b></button></th>`).join('')}</tr></thead><tbody>${rows.map(([l, f]) => `<tr><td><b>${l}</b></td>${ss.map(s => `<td>${f(s)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`; }
const DSHB = [['dbiz', 'Business overview', 'chart'], ['dperf', 'Scheme performance', 'trend'], ['dfin', 'Finance', 'wallet'], ['dops', 'Operations', 'grid'], ['dprod', 'Team productivity', 'users'], ['dcap', 'Capacity and staffing', 'cal'], ['dqual', 'Quality and compliance', 'shield'], ['dsup', 'Suppliers', 'truck']];
const dHead = (t, s) => oph(t, s + ' Filters, trend and comparison use the same records as the six apps; click any total to open what is behind it.') + dFilters();
const actMg = s => { const ps = prsOf(s.id).filter(p => ['F. Close out', 'Paid'].includes(p.ph)), q = sum(ps, p => pMoney(p).q), a = sum(ps, p => pMoney(p).act); return q ? (q - a) / q * 100 : null; };
function dBiz(){ const ss = fSc(), ms = ss.map(s => [s, scMoney(s)]), won = sum(ms, x => x[1].won), fc = sum(ms, x => x[1].fc), b = buckets(), am = ss.map(actMg).filter(x => x != null);
  return dHead('Business overview', 'All programmes and schemes: properties by phase, value won, invoiced and paid, margins, owed to us and by us.')
    + `<div class="cstats">${stat('tk', 'Value won', fm(won), 'approved by clients', 'gogo', 'dir:sch')}${stat('tk', 'Invoiced', fm(sum(ms, x => x[1].inv)), `${fm(sum(ms, x => x[1].paid))} paid`, 'gogo', 'acc:inv')}${stat('tk', 'Forecast margin', pc(won ? (won - fc) / won * 100 : 0), am.length ? `actual ${pc(sum(am) / am.length)} on closed jobs` : 'no closed jobs yet')}${stat('tk', 'Owed to us', fm(sum(ms, x => x[1].owed)), `${fm(sum(ms, x => x[1].sup))} owed by us`, 'gogo', 'acc:trg')}</div>`
    + `<div class="rf-g2">${chart(tvals(won / b.n * 1.4, 'won', b.n), b.lab, fk, 'Value won by period')}${chart(tvals(sum(ms, x => x[1].inv) / b.n * 1.6, 'inv', b.n), b.lab, fk, 'Invoiced and paid', tvals(sum(ms, x => x[1].paid) / b.n * 1.6, 'paid', b.n), ['Invoiced', 'Paid'])}</div>`
    + grpH('Properties by phase, per scheme', fPr().length) + `<div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Scheme</th>${OPENP.concat(['Paid']).map(ph => `<th>${ph}</th>`).join('')}<th>Rating</th></tr></thead><tbody>${ss.map(s => { const [rt, rl] = rating(s); return `<tr><td><button class="lnk4" data-act="ficha" data-v="${s.id}"><b>${esc(s.n)}</b></button></td>${OPENP.concat(['Paid']).map(ph => { const n = fPr().filter(p => p.sc === s.id && p.ph === ph).length; return `<td>${n ? `<b>${n}</b>` : '<b class="z">0</b>'}</td>`; }).join('')}<td>${pill(rt, rl)}</td></tr>`; }).join('')}</tbody></table></div></div>`
    + cmp([['Value won', s => fm(scMoney(s).won)], ['Forecast margin', s => scMoney(s).won ? mgTag(scMoney(s).mgp, s.set.mg) : ''], ['Actual margin, closed', s => actMg(s) == null ? '' : pc(actMg(s))], ['Invoiced', s => fm(scMoney(s).inv)], ['Paid', s => fm(scMoney(s).paid)], ['Owed to us', s => fm(scMoney(s).owed)], ['Owed by us', s => fm(scMoney(s).sup)], ['Rating', s => pill(...rating(s))]]); }
const avgIn = (ps, ph) => { const xs = ps.filter(p => p.ph === ph); return xs.length ? Math.round(sum(xs, daysIn) / xs.length) : null; };
const apprT = s => { const xs = prsOf(s.id).filter(p => p.ph === 'C. Client approval'); return xs.length ? Math.round(sum(xs, daysIn) / xs.length) : {'E.ON':6, 'GLA':8, 'Redbridge':10}[s.ty]; };
function dPerf(){ const ss = fSc(), b = buckets(), done = sum(ss, s => prsOf(s.id).filter(p => pIdx(p.ph) >= 5 && p.ph !== 'Cancelled').length);
  return dHead('Scheme performance', 'Per scheme: completed against target, completions per week, days per phase, margin against target, changes, cancellations and client approval times.')
    + `<div class="cstats">${stat('tk', 'Completed', done, `of ${sum(ss, s => s.tgt)} contracted`)}${stat('tk', 'Cancellations', sum(ss, s => prsOf(s.id).filter(p => p.ph === 'Cancelled').length), 'with reason and phase')}${stat('tk', 'Variations', fm(sum(DB.va.filter(v => v.ty === 'Variation' && ss.some(s => s.id === prOf(v.pr).sc)), v => v.amt)), 'priced to clients', 'gogo', 'com:var')}${stat('tk', 'Additional costs', fm(sum(DB.va.filter(v => v.ty === 'Additional cost' && ss.some(s => s.id === prOf(v.pr).sc)), v => v.amt)), 'carried by REFYT', 'gogo', 'com:var')}</div>`
    + chart(tvals(Math.max(1, done / 3), 'cpl', b.n).map(Math.round), b.lab, num, `Completions per ${DD().tr}`)
    + grpH('Average days in each phase', ss.length) + `<div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Scheme</th>${OPENP.map(ph => `<th>${ph}<br><small>limit ${LIMIT[ph]}</small></th>`).join('')}</tr></thead><tbody>${ss.map(s => `<tr><td><button class="lnk4" data-act="ficha" data-v="${s.id}"><b>${esc(s.n)}</b></button></td>${OPENP.map(ph => { const a = avgIn(prsOf(s.id), ph); return `<td>${a == null ? '<b class="z">-</b>' : a > LIMIT[ph] * 1.5 ? pill('tred', a) : a > LIMIT[ph] ? pill('ta', a) : `<b>${a}</b>`}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div></div>`
    + cmp([['Completed against target', s => `${prsOf(s.id).filter(p => pIdx(p.ph) >= 5 && p.ph !== 'Cancelled').length} of ${s.tgt}`], ['Margin against target', s => scMoney(s).won ? mgTag(scMoney(s).mgp, s.set.mg) + ` <small class="mini">${s.set.mg}%</small>` : ''], ['Variations', s => fm(sum(DB.va.filter(v => v.ty === 'Variation' && prOf(v.pr).sc === s.id), v => v.amt))], ['Additional costs', s => fm(sum(DB.va.filter(v => v.ty === 'Additional cost' && prOf(v.pr).sc === s.id), v => v.amt))], ['Cancellations', s => prsOf(s.id).filter(p => p.ph === 'Cancelled').length], ['Client approval time', s => `${apprT(s)} days`]]); }
const SUPS2 = () => [...new Set(DB.or.map(o => o.sup))];
const spend = (f) => sum(DB.or.filter(o => o.st !== 'Rejected'), o => sum(o.al.filter(a => a.pr && fPr(true).some(p => p.id === a.pr) && f(o, a)), a => a.a));
function dFin(){ const ss = fSc(), b = buckets(), ps = fPr(), inv = DB.inv.filter(v => ps.some(p => p.id === v.pr)), paid = sum(inv.filter(v => v.paid), v => v.amt);
  const inW = w => sum(inv.filter(v => !v.paid && dDiff(v.due) <= w * 7), v => v.amt) + (w >= 8 ? sum(ps.filter(p => p.ph === 'F. Close out' && !DB.inv.some(v => v.pr === p.id)), p => pMoney(p).q) : 0) + (w >= 12 ? sum(ps.filter(p => p.ph === 'E. Install'), p => pMoney(p).q) : 0);
  const outW = w => sum(ps, p => pMoney(p).com) + sum(DB.sp.filter(s => s.st === 'Approved' && ps.some(p => p.id === s.pr)), s => s.amt) + (w >= 8 ? sum(ps.filter(p => p.ph === 'E. Install'), p => Math.max(0, pMoney(p).b - pMoney(p).act - pMoney(p).com)) : 0) + (w >= 12 ? sum(ps.filter(p => p.ph === 'D. Prepare to install'), p => Math.max(0, pMoney(p).b - pMoney(p).com)) : 0);
  const mt = Object.keys(MEAS).filter(m => ps.some(p => p.ms.some(x => x.m === m)));
  return dHead('Finance', 'Income by month, invoiced against paid, days to pay per client, spend by supplier and cost type, budget against actual per measure, margin trend and the cash forecast.')
    + `<div class="cstats">${stat('tk', 'Invoiced', fm(sum(inv, v => v.amt)), '', 'gogo', 'acc:inv')}${stat('tk', 'Paid', fm(paid))}${stat(inv.some(v => !v.paid && dDiff(v.due) < 0) ? 'tred' : 'tk', 'Outstanding', fm(sum(inv.filter(v => !v.paid), v => v.amt)), `${inv.filter(v => !v.paid && dDiff(v.due) < 0).length} overdue`, 'gogo', 'acc:inv')}${stat('tk', 'Committed, not yet invoiced to us', fm(sum(ps, p => pMoney(p).com)), '', 'gogo', 'del:ord')}</div>`
    + `<div class="rf-g2">${chart(tvals(Math.max(paid, 4000) / 2, 'inc', b.n), b.lab, fk, `Income by ${DD().tr}`)}${chart(tvals(Math.max(1, sum(ps.filter(p => pIdx(p.ph) >= 2), p => pMoney(p).mgp) / Math.max(1, ps.filter(p => pIdx(p.ph) >= 2).length)), 'mg', b.n).map(Math.round), b.lab, x => x + '%', 'Forecast margin trend')}</div>`
    + grpH('Cash forecast', 'money due in against money due out') + th(cell('Window', '', 1.4) + cell('Due in', 'invoices and jobs closing') + cell('Due out', 'committed and budget left') + cell('Net', '')) + [4, 8, 12].map(w => rdiv(cell(`Next ${w} weeks`, '', 1.4) + cell(fm(inW(w)), '') + cell(fm(outW(w)), '') + `<div class="mbc"><b>${pill(inW(w) - outW(w) < 0 ? 'tred' : 'tg', fm(inW(w) - outW(w)))}</b><small></small></div>`)).join('')
    + `<div class="rf-g2"><div>${grpH('Days to pay, per client', ss.length)}${ss.map(s => { const xs = DB.inv.filter(v => prOf(v.pr).sc === s.id); const d = xs.length ? Math.round(sum(xs, v => (v.paid ? dDiff(v.paid) : 0) - dDiff(v.on)) / xs.length) : null; return rowO('ficha', s.id, cell(esc(s.cl.split(' (')[0]), s.n, 2) + cell(d == null ? 'No invoices yet' : `${d} days`, `terms ${s.set.terms}`)); }).join('')}</div><div>${grpH('Spend by supplier', SUPS2().length)}${SUPS2().map(sp => rowO('dSup', sp, cell(esc(sp), '', 2) + cell(fm(spend(o => o.sup === sp)), ''))).join('')}</div></div>`
    + `<div class="rf-g2"><div>${grpH('Spend by cost type', CTYPES.length)}${CTYPES.map(c => rowO('fdd', 'ct|' + c, cell(c, 'click for the breakdown', 2) + cell(fm(spend(o => o.ct === c)), ''))).join('')}</div><div>${grpH('Budget against actual, per measure', mt.length)}${mt.map(m => { const b2 = sum(ps, p => sum(p.ms.filter(x => x.m === m), x => mMoney(p, x).b)), a2 = sum(ps, p => sum(p.ms.filter(x => x.m === m), x => mMoney(p, x).act + mMoney(p, x).com)); return rowO('fdd', 'm|' + m, cell(MEAS[m].n, 'click for the breakdown', 2) + cell(fm(b2), 'budget') + `<div class="mbc"><b>${fm(a2)}</b><small>${a2 > b2 ? pill('tred', 'over') : 'actual and committed'}</small></div>`); }).join('')}</div></div>`
    + cmp([['Invoiced', s => fm(scMoney(s).inv)], ['Paid', s => fm(scMoney(s).paid)], ['Owed to us', s => fm(scMoney(s).owed)], ['Owed by us', s => fm(scMoney(s).sup)], ['Forecast margin', s => scMoney(s).won ? mgTag(scMoney(s).mgp, s.set.mg) : '']]); }
A.dSup = el => { S.f.dsup = el.dataset.v; go('dir', 'dsup'); };
function dOps(){ const tm = DD().tm, ps = fPr().filter(p => OPENP.includes(p.ph) && (!tm || (DTEAM[tm] || PH).includes(p.ph))), st = ps.filter(p => LIMIT[p.ph]).sort((a, b) => daysIn(b) / LIMIT[b.ph] - daysIn(a) / LIMIT[a.ph]).slice(0, 6);
  const pr = p => rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), `${scOf(p.sc).n}, ${p.ph}`, 2.4) + `<div class="mbc"><b>${daysIn(p)} days</b><small>${lateTag(p) || (LIMIT[p.ph] ? `limit ${LIMIT[p.ph]}` : '')}</small></div>`, S.hl === p.id);
  return dHead('Operations', 'Properties per stage per scheme, where jobs are stuck longest, overdue items, Ready to install, hold points and client system updates.')
    + `<div class="cstats">${stat('tk', 'Open properties', ps.length)}${stat(ps.some(p => late(p) === 'red') ? 'tred' : 'tk', 'Over the phase limit', ps.filter(p => late(p)).length)}${stat('tk', 'Ready to install', ps.filter(p => p.ph === 'D. Prepare to install' && ready(p)).length, '', 'gogo', 'del:rdy')}${stat(ps.some(p => p.hold || p.hold2) ? 'tred' : 'tk', 'Hold points waiting', ps.filter(p => p.hold || p.hold2).length, '', 'gogo', 'del:hold')}</div>`
    + chart(tvals(ps.filter(p => late(p)).length + 1, 'late', buckets().n).map(Math.round), buckets().lab, num, `Overdue items by ${DD().tr}`)
    + `<div class="rf-g2"><div>${grpH('Stuck longest, against the phase limit', st.length)}${st.map(pr).join('')}</div><div>${grpH('Overdue', ps.filter(p => late(p)).length)}${ps.filter(p => late(p)).map(pr).join('') || empty('Nothing over its limit.')}</div></div>`
    + `<div class="rf-g2"><div>${grpH('Hold points waiting', ps.filter(p => p.hold || p.hold2).length)}${ps.filter(p => p.hold || p.hold2).map(p => rowO('prIns', p.id, tcell('prIns', p.id, esc(p.ad), esc(p.hold || p.hold2), 3))).join('') || empty('None.')}</div><div>${grpH('Client system updates outstanding', ps.filter(p => p.csTodo).length)}${ps.filter(p => p.csTodo).map(p => rowO('ficha', p.id, tcell('ficha', p.id, esc(p.ad), `${ptOf(p).sys}: ${esc(p.csTodo)}`, 3))).join('') || empty('All up to date.')}</div></div>`
    + cmp([['Open', s => ps.filter(p => p.sc === s.id).length], ...OPENP.map(ph => [ph, s => ps.filter(p => p.sc === s.id && p.ph === ph).length]), ['Over the limit', s => { const n = ps.filter(p => p.sc === s.id && late(p)).length; return n ? pill('ta', n) : '0'; }], ['Hold points', s => { const n = ps.filter(p => p.sc === s.id && (p.hold || p.hold2)).length; return n ? pill('tred', n) : '0'; }]]); }
function prodRows(){ const ps = fPr(true), weeks = {'4w':4, q:13, y:52}[DD().dr], as = ps.filter(p => p.b.vis);
  const by = {afa:as.filter((p, i) => i % 2 === 0), xen:as.filter((p, i) => i % 2 === 1)};
  const row = (k, a, d, i, h, rev, turn) => ({k, a, d, i, h, rft:a ? pct(a - rev, a) : null, rv:a ? pct(rev, a) : null, turn, ot:(t => t.length ? pct(t.filter(x => x.done || dDiff(x.due) >= 0).length, t.length) : 100)(DB.tk.filter(x => x.r === PWHO[k]))});
  return [row('afa', by.afa.length, 0, 0, 0, sum(by.afa, p => p.b.revisits), null), row('xen', by.xen.length, 0, 0, 0, sum(by.xen, p => p.b.revisits), null), row('ram', 0, 0, 0, 0, 0, 1.8), row('ahm', 0, sum(ps, p => p.ms.filter(x => x.dsg).length), 0, 0, 0, null), row('akr', 0, 0, ps.filter(p => pIdx(p.ph) >= 5 && p.ph !== 'Cancelled').length, 0, 0, null), row('dre', 0, 0, 0, ps.filter(p => ['F. Close out', 'Paid'].includes(p.ph)).length, 0, 1.2), row('yah', 0, 0, 0, 0, 0, .9)].filter(r => (!DD().per || r.k === DD().per) && (!DD().tm || PEO[r.k].ar === DD().tm || (DD().tm === 'del' && ['akr', 'dre'].includes(r.k)))).map(r => ({...r, w:weeks})); }
function dProd(){ const rs = prodRows(), b = buckets(), pw = (n, w) => n ? (n / w).toFixed(1) : '0';
  return dHead('Team productivity', 'Per person and per team: assessments, designs, installs and handovers per week, right first time, revisit rate, approval turnaround and tasks on time.')
    + `<div class="cstats">${stat('tk', 'Assessments', sum(rs, r => r.a))}${stat('tk', 'Right first time', pc(pct(sum(rs, r => r.a) - sum(fPr(true), p => p.b.revisits), sum(rs, r => r.a) || 1)), 'assessments without a revisit')}${stat('tk', 'Designs', sum(rs, r => r.d))}${stat('tk', 'Installs and handovers', sum(rs, r => r.i + r.h))}</div>`
    + chart(tvals(Math.max(1, sum(rs, r => r.a + r.d + r.i + r.h) / 3), 'prod', b.n).map(Math.round), b.lab, num, `Completed items by ${DD().tr}`)
    + th(cell('Person', 'Role', 2) + cell('Assessments', 'per week') + cell('Designs', 'per week') + cell('Installs', 'per week') + cell('Handovers', 'per week') + cell('Right first time', 'revisit rate') + cell('Approval turnaround', '') + cell('Tasks on time', '')) + rs.map(r => rowO('dPer', r.k, cell(PEO[r.k].n, RN(PWHO[r.k] || 'dir'), 2) + cell(pw(r.a, r.w), `${r.a} in total`) + cell(pw(r.d, r.w), `${r.d}`) + cell(pw(r.i, r.w), `${r.i}`) + cell(pw(r.h, r.w), `${r.h}`) + `<div class="mbc"><b>${r.rft == null ? '' : r.rft < 80 ? pill('ta', r.rft + '%') : r.rft + '%'}</b><small>${r.rv == null ? '' : r.rv + '% revisits'}</small></div>` + cell(r.turn ? r.turn + ' days' : '', '') + `<div class="mbc"><b>${r.ot < 80 ? pill('tred', r.ot + '%') : r.ot + '%'}</b><small></small></div>`, DD().per === r.k)).join('')
    + cmp([['Assessments', s => prsOf(s.id).filter(p => p.b.vis).length], ['Revisits', s => sum(prsOf(s.id), p => p.b.revisits)], ['Designs', s => sum(prsOf(s.id), p => p.ms.filter(x => x.dsg).length)], ['Installs', s => prsOf(s.id).filter(p => pIdx(p.ph) >= 5 && p.ph !== 'Cancelled').length]]); }
A.dPer = el => { S.f.d.per = S.f.d.per === el.dataset.v ? '' : el.dataset.v; render(); };
const TRADES = [['Assessors', ['afa', 'xen'], p => ['A. Job received', 'B. Assess and design'].includes(p.ph) ? 3.5 : 0], ['Design', ['ahm'], p => p.ph === 'B. Assess and design' ? 2 * p.ms.length : 0], ['Insulation', ['akr'], p => ['C. Client approval', 'D. Prepare to install', 'E. Install'].includes(p.ph) ? 7 * p.ms.filter(x => ['LI', 'CWI', 'EWI', 'IWI'].includes(x.m)).length : 0], ['Solar and electrical', [], p => ['C. Client approval', 'D. Prepare to install', 'E. Install'].includes(p.ph) ? 6 * p.ms.filter(x => ['SPV', 'DMEV', 'LED'].includes(x.m)).length : 0], ['Scaffold', [], p => ['D. Prepare to install', 'E. Install'].includes(p.ph) && !p.dna.scf ? 8 : 0]];
function dCap(){ const ps = fPr(), wk = [0, 1, 2, 3].map(i => 'W' + (45 + i)), cap = 37.5;
  const tr = TRADES.map(([n, ppl, f]) => { const h = sum(ps, f), c = (ppl.length || 1.5) * cap, load = [0, 1, 2, 3].map(i => Math.round(h * [.4, .3, .2, .1][i] + h * .08 * i)); return {n, ppl, h, c, load, short:load.findIndex(l => l > c)}; });
  const people = [['afa', 'Assessors'], ['xen', 'Assessors'], ['ahm', 'Design'], ['akr', 'Insulation']].filter(([k]) => !DD().per || k === DD().per).map(([k, t]) => { const T = tr.find(x => x.n === t); return [k, T.load.map(l => Math.round(l / Math.max(1, T.ppl.length)))]; });
  return dHead('Capacity and staffing', 'Booked work against each person’s weekly capacity, the pipeline by team and trade, and when people or subcontractors run short.')
    + grpH('Booked against weekly capacity', `${cap} hours a week`) + `<div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Person</th>${wk.map(w => `<th>${w}</th>`).join('')}</tr></thead><tbody>${people.map(([k, ls]) => `<tr><td><button class="lnk4" data-act="dPer" data-v="${k}"><b>${PEO[k].n}</b></button><small class="mini" style="display:block">${PEO[k].r}</small></td>${ls.map(l => `<td>${l > cap ? pill('tred', pct(l, cap) + '%') : l > cap * .85 ? pill('ta', pct(l, cap) + '%') : pct(l, cap) + '%'}<small class="mini" style="display:block">${l}h</small></td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`
    + grpH('Pipeline by team and trade', tr.length) + th(cell('Trade', 'People', 2) + cell('Work in the pipeline', 'hours') + cell('Capacity', 'per week') + cell('Runs short', '', 1.6)) + tr.map(T => rdiv(cell(T.n, T.ppl.length ? T.ppl.map(k => PEO[k].n).join(', ') : 'Subcontractors', 2) + cell(`${T.h}h`, `${plural(ps.filter(p => TRADES.find(x => x[0] === T.n)[2](p) > 0).length, 'property', 'properties')}`) + cell(`${Math.round(T.c)}h`, '') + `<div class="mbc" style="flex:1.6"><b>${T.short < 0 ? pill('tg', 'Covered for 4 weeks') : pill(T.short === 0 ? 'tred' : 'ta', `Short from ${wk[T.short]}`)}</b><small>${T.short < 0 ? '' : 'hire or book subcontractors'}</small></div>`)).join('')
    + cmp([['Assessments in pipeline', s => prsOf(s.id).filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph)).length], ['Installs in pipeline', s => prsOf(s.id).filter(p => ['C. Client approval', 'D. Prepare to install', 'E. Install'].includes(p.ph)).length], ['Install hours', s => `${sum(prsOf(s.id), p => TRADES[2][2](p) + TRADES[3][2](p))}h`]]); }
function dQual(){ const ps = fPr(true), a = ps.filter(p => p.b.vis), fails = ps.filter(p => p.g && (p.g.ewi === 'Blocked' || p.hold2)), rem = DB.va.filter(v => ps.some(p => p.id === v.pr) && /repair|return/i.test(v.why)), exp = HSD.filter(h => dDiff(h.exp) < 60);
  return dHead('Quality and compliance', 'Right first time, client rejections and queries, failed inspections, remedial work, complaints and insurances and accreditations about to expire.')
    + `<div class="cstats">${stat('tk', 'Right first time', pc(pct(a.length - sum(ps, p => p.b.revisits), a.length || 1)), 'assessments')}${stat('tk', 'Client rejections and queries', ps.filter(p => p.b.revisits || p.csTodo).length, 'revisits and open client comments')}${stat(fails.length ? 'tred' : 'tk', 'Failed inspections', fails.length, '', 'gogo', 'del:hold')}${stat(exp.some(h => dDiff(h.exp) < 30) ? 'ta' : 'tk', 'Expiring within 60 days', exp.length, '', 'gogo', 'del:hs')}</div>`
    + chart(tvals(Math.max(1, sum(ps, p => p.b.revisits)), 'rev', buckets().n).map(Math.round), buckets().lab, num, `Revisits by ${DD().tr}`)
    + `<div class="rf-g2"><div>${grpH('Failed inspections and remedial work', fails.length + rem.length)}${fails.map(p => rowO('prIns', p.id, tcell('prIns', p.id, esc(p.ad), esc(p.hold2 || 'Inspection failed'), 3))).join('')}${rem.map(v => rowO('prMon', v.pr, tcell('prMon', v.pr, esc(prOf(v.pr).ad), `${esc(v.why)}, ${fm(v.amt)}`, 3))).join('')}<div class="mbr nc"><div class="mbc"><b>Complaints</b><small>None logged this period</small></div></div></div><div>${grpH('Insurances and accreditations', HSD.length)}${HSD.slice().sort((x, y) => x.exp < y.exp ? -1 : 1).map(h => rdiv(cell(h.n, fmtDy(h.exp), 2) + `<div class="mbc"><b>${dDiff(h.exp) < 30 ? pill('ta', `${dDiff(h.exp)} days`) : pill('tg', 'Valid')}</b><small></small></div>`)).join('')}</div></div>`
    + cmp([['Right first time', s => { const x = prsOf(s.id).filter(p => p.b.vis); return x.length ? pc(pct(x.length - sum(prsOf(s.id), p => p.b.revisits), x.length)) : ''; }], ['Revisits', s => sum(prsOf(s.id), p => p.b.revisits)], ['Open client comments', s => prsOf(s.id).filter(p => p.csTodo).length], ['Failed inspections', s => { const n = prsOf(s.id).filter(p => p.g && (p.g.ewi === 'Blocked' || p.hold2)).length; return n ? pill('tred', n) : '0'; }], ['Remedial work', s => fm(sum(DB.va.filter(v => prOf(v.pr).sc === s.id && /repair|return/i.test(v.why)), v => v.amt))]]); }
const ONTIME = {'Insulation Supplies Direct':96, 'SIG Distribution':88, 'Solar Wholesale UK':92, 'Kent Scaffold Hire':79, 'EWI Pro':100, 'Medway Electrical Ltd':94, 'Thames Gas Services':85}, VAR = {'Insulation Supplies Direct':2.1, 'SIG Distribution':-1.4, 'Solar Wholesale UK':6.8, 'Kent Scaffold Hire':0, 'EWI Pro':11.2, 'Medway Electrical Ltd':3, 'Thames Gas Services':-.5};
function dSupp(){ const sel = S.f.dsup || '', sp = SUPS2();
  return dHead('Suppliers and subcontractors', 'Spend, delivery on time, prices against the agreed rates and payment status. Click a supplier for its orders.')
    + `<div class="cstats">${stat('tk', 'Spend', fm(spend(() => true)))}${stat('tk', 'Delivered on time', pc(sum(sp, s => ONTIME[s] || 90) / sp.length))}${stat('tk', 'Owed to suppliers', fm(sum(fSc(), s => scMoney(s).sup)))}${stat('tk', 'Subcontractor payments', fm(sum(DB.sp, s => s.amt)), `${DB.sp.filter(s => s.st !== 'Paid').length} not paid`, 'gogo', 'acc:sub')}</div>`
    + chart(tvals(spend(() => true) / buckets().n * 1.3, 'spend', buckets().n), buckets().lab, fk, `Spend by ${DD().tr}`)
    + th(cell('Supplier', '', 2) + cell('Spend', 'orders') + cell('On time', '') + cell('Price against agreed rate', '') + cell('Payment', '')) + sp.map(s => { const os = DB.or.filter(o => o.sup === s && o.st !== 'Rejected'); return rowO('dSup', s, cell(esc(s), '', 2) + cell(fm(spend(o => o.sup === s)), plural(os.length, 'order', 'orders')) + `<div class="mbc"><b>${(ONTIME[s] || 90) < 85 ? pill('ta', (ONTIME[s] || 90) + '%') : (ONTIME[s] || 90) + '%'}</b><small></small></div>` + `<div class="mbc"><b>${(VAR[s] || 0) > 5 ? pill('tred', '+' + VAR[s] + '%') : ((VAR[s] || 0) > 0 ? '+' : '') + (VAR[s] || 0) + '%'}</b><small></small></div>` + cell(fm(sum(os.filter(o => ['Delivered', 'Invoiced'].includes(o.st)), o => o.amt)), 'owed'), sel === s); }).join('')
    + (sel ? grpH(`${sel}: orders`, DB.or.filter(o => o.sup === sel).length) + DB.or.filter(o => o.sup === sel).map(o => rowO('prMon', o.al[0].pr, tcell('prMon', o.al[0].pr, `${o.id}, ${o.ct}`, o.al.map(a => `${prOf(a.pr).ad} ${fm(a.a)}`).join('; '), 3) + cell(fm(o.amt), o.st))).join('') : '')
    + grpH('Subcontractors', DB.sp.length) + DB.sp.map(s => rowO('prMon', s.pr, tcell('prMon', s.pr, s.sub, `${prOf(s.pr).ad}, ${s.stage}`, 3) + cell(fm(s.amt), '') + `<div class="mbc"><b>${pill(s.st === 'Paid' ? 'tg' : 'tk', s.st)}</b><small></small></div>`)).join('')
    + cmp([['Spend', s => fm(sum(DB.or.filter(o => o.st !== 'Rejected'), o => sum(o.al.filter(a => a.pr && prOf(a.pr).sc === s.id), a => a.a)))], ['Orders', s => DB.or.filter(o => o.al.some(a => a.pr && prOf(a.pr).sc === s.id)).length], ['Owed to suppliers', s => fm(scMoney(s).sup)]]); }
{ const o = VIEWS.dir.side, act = pageAct('dir'), anc = '<div class="sb-sec">Settings</div>';
  VIEWS.dir.side = () => o().replace(/<button class="nav" data-act="pg_dir" data-v="ovw"[\s\S]*?<\/button>/, '').replace(anc, '<div class="sb-sec">Dashboards</div>' + DSHB.map(([k, n, ic]) => sbItem(S.page.dir, act)([k, n, ic])).join('') + anc);
  Object.assign(VIEWS.dir.pages, {dbiz:dBiz, dperf:dPerf, dfin:dFin, dops:dOps, dprod:dProd, dcap:dCap, dqual:dQual, dsup:dSupp}); }

/* =================== Versions and tour for v3.1 =================== */
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/USPva18cXGwCuKjwpNYJDa'; } });
VERSIONS.push({v:'v3.1', date:TODAY, major:false, current:true, url:null, title:'Straight into an app, tasks per team, dashboards', sum:'The demo opens in the first app of your role, with an app dropdown next to the logo; each app has its team’s tasks; Director has the eight dashboards of section 16.', steps:[
  {t:'Straight into your app', min:.5, dolor:'Before, a landing page with a card per app came first.', show:['The demo opens in the first app of the role.', 'The app’s name sits next to the logo; the dropdown lists the six, locked ones with a padlock.'], say:'You land where you work.', go:() => { S.role = 'dir'; go('dir', 'dbiz'); S.pop = 'sw'; drawPop(); }},
  {t:'Tasks in every app', min:.5, dolor:'Before, tasks only lived in Tasks and meetings.', show:['Delivery, Tasks: the team’s tasks with owner, due date and status, overdue first.', 'Tasks and meetings keeps Monday, Thursday and every team’s tasks, filterable.'], say:'Each team sees its own list where it works.', go:() => { S.role = 'dir'; go('del', 'tasks'); }},
  {t:'Eight dashboards in Director', min:1, dolor:'Section 16 asks for eight dashboards with filters, trends, comparison and drill down.', show:['Business overview, scheme performance, finance, operations, productivity, capacity, quality, suppliers.', 'Filters, trend by week or month, schemes side by side, click into the detail.'], say:'The Tuesday meeting runs from these.', go:() => { S.role = 'dir'; go('dir', 'dbiz'); }},
]});
TOUR[0] = {t:'Six apps, one per team', min:1.5, dolor:'Section 14: "Each team should feel it has its own tool, showing only what it needs."', show:['The demo opens straight in Director; the app’s name sits next to the logo.', 'The dropdown lists the six apps with their team: Director, Commercial, Accounts, Retrofit, Delivery, Tasks and meetings.'], say:'Six tools, one version of every job.', go:() => { S.role = 'dir'; go('dir', 'dbiz'); S.pop = 'sw'; drawPop(); }};
TOUR[1] = {t:'Each role opens its own apps', min:1, dolor:'Roles, not names: your restructure decides who fills each one.', show:['Viewing as Assessor: Retrofit opens; in the dropdown the rest are locked.', 'Viewing as Director: everything.'], say:'Change the person behind a role; nothing is rebuilt.', go:() => { S.role = 'ass'; S.view = firstApp(); render(true); S.pop = 'sw'; drawPop(); }};
TOUR[6] = {t:'Director: dashboards and Tuesday', min:2, dolor:'Rule 4: meetings and decisions run from dashboards.', show:['Dashboards: the eight of section 16, with filters, trends and schemes side by side.', 'Click a scheme, then a property, then its cost line.', 'Tuesday directors’ meeting from the same numbers.'], say:'The Tuesday meeting is already prepared.', go:() => { S.role = 'dir'; go('dir', 'dbiz'); }};
TOUR[7] = {t:'Tasks per team, meetings together', min:1, dolor:'Section 15: tasks from meetings and jobs, Monday and Thursday with no money.', show:['Every app has its own Tasks, overdue first.', 'Tasks and meetings: Monday and Thursday, and every team’s tasks filterable by team.'], say:'Every action has an owner, where the team works.', go:() => { S.role = 'dir'; go('tsk', 'mon'); }};
HOME.dir = 'dbiz'; S.page.dir = 'dbiz';
S.view = firstApp();

/* =================== v3.2: five apps, each opening on Tasks and meetings =================== */
APPS.splice(APPS.findIndex(a => a[0] === 'tsk'), 1);
const D0 = '2026-10-26';
const dAt = n => addDays(D0, n);
/* Meetings: Monday and Thursday for everyone, Tuesday directors only in Director */
DB.mt = [
  {id:'MT-501', ty:'Monday team meeting', d:dAt(-14), h:'09:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:true, sum:'Progress per scheme. Medway and Thanet on pace; Redbridge slowed by the steel frame checks. GLA Warmer Homes still waiting for its close out list.', dec:['Redbridge reported at group level only from now on.', 'GLA close out list to be shared with the build team this week.']},
  {id:'MT-502', ty:'Thursday follow up', d:dAt(-11), h:'15:00', who:['dre', 'sar', 'ram', 'ahm', 'lan', 'tom'], ready:true, sum:'Follow up of Monday’s actions. MDA could not attend Clayhall Avenue; supplier invoices for September matched.', dec:['Book MDA again for Clayhall Avenue before any EWI work.']},
  {id:'MT-503', ty:'Monday team meeting', d:dAt(-7), h:'09:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:true, sum:'Thanet survey pack still has open E.ON comments. Saxton Street invoice is overdue with Medway. Waverley and Cottsway start in October and need first assessments booked.', dec:['Survey admin owns all E.ON comments until they close.', 'Accounts chases overdue invoices every Monday.']},
  {id:'MT-504', ty:'Tuesday directors', d:dAt(-6), h:'10:00', who:['yah', 'tom', 'lan'], ready:true, sum:'Margins per scheme: Redbridge below its 18% target because of the Clayhall Avenue stanchion repair. Cash owed by Medway is overdue. One variation waiting for internal approval.', dec:['Margin targets for Waverley and Cottsway to be agreed by Friday.', 'Price the Fencepiece Road windows variation before it goes to Kanopi Works.']},
  {id:'MT-505', ty:'Thursday follow up', d:dAt(-4), h:'15:00', who:['dre', 'sar', 'ram', 'ahm', 'lan', 'tom'], ready:false, sum:'', dec:[]},
  {id:'MT-506', ty:'Monday team meeting', d:dAt(0), h:'16:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:false, sum:'', dec:[]},
  {id:'MT-507', ty:'Tuesday directors', d:dAt(1), h:'10:00', who:['yah', 'tom', 'lan'], ready:false, sum:'', dec:[]},
  {id:'MT-508', ty:'Thursday follow up', d:dAt(3), h:'15:00', who:['dre', 'sar', 'ram', 'ahm', 'lan', 'tom'], ready:false, sum:'', dec:[]},
  {id:'MT-509', ty:'Monday team meeting', d:dAt(7), h:'09:00', who:['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], ready:false, sum:'', dec:[]},
];
/* Tasks: from meetings (their actions) and from jobs; the same list everywhere */
DB.tk = [
  ['TK-201', 'Send the GLA close out document list to Ariana', 'com', -7, 'MT-501', null, -10],
  ['TK-202', 'Renew public liability certificate', 'hse', 9, 'MT-501'],
  ['TK-203', 'Book MDA revisit for Clayhall Avenue', 'inc', -3, 'MT-502', 'PR-2017', -4],
  ['TK-204', 'Match September supplier invoices to orders', 'acc', -5, 'MT-502', null, -5],
  ['TK-205', 'Chase E.ON for the Thanet survey pack comments', 'sad', 1, 'MT-503', 'PR-2008'],
  ['TK-206', 'Chase Medway Council for Saxton Street', 'acc', -2, 'MT-503', 'PR-2005'],
  ['TK-207', 'Confirm the scaffold date, Manford Way', 'inc', 0, 'MT-503', 'PR-2021'],
  ['TK-208', 'Book the first Waverley assessments', 'sad', 4, 'MT-503', 'PR-2013'],
  ['TK-209', 'Agree margin targets for Waverley and Cottsway', 'dir', -3, 'MT-504'],
  ['TK-210', 'Price the windows variation, Fencepiece Road', 'com', 2, 'MT-504', 'PR-2020'],
  ['TK-211', 'Send the Tuesday margin pack', 'dir', 0, 'MT-504', null, 0],
  ['TK-212', 'Review the Dane Road design pack', 'dap', 1, 'Job', 'PR-2008'],
  ['TK-213', 'Match October supplier invoices to orders', 'acc', 2, 'Job', 'PR-2003'],
  ['TK-214', 'Upload the corrected handover photos, Fencepiece Road', 'inc', -1, 'Job', 'PR-2020'],
  ['TK-215', 'Check the modelling after the Canterbury Street revisit', 'aap', 0, 'Job', 'PR-2001'],
  ['TK-216', 'Confirm the GLA eligibility list for Leytonstone Road', 'sad', -1, 'Job', 'PR-2015', 0],
].map(([id, t, r, due, src, pr, done]) => ({id, t, r, due:dAt(due), src, pr:pr || null, done:done != null, doneOn:done != null ? dAt(done) : null}));
DB.seq.tk = 216;
const mtOf = id => DB.mt.find(m => m.id === id);
const mtActs = m => DB.tk.filter(k => k.src === m.id);
const mtSees = (app, m) => m.ty !== 'Tuesday directors' || app === 'dir';

/* My tasks: four indicators that filter the list */
const tkOver = k => !k.done && dDiff(k.due) < 0;
const TKF = {today:['Due today', k => !k.done && dDiff(k.due) === 0], open:['Open', k => !k.done], over:['Overdue', tkOver], done:['Done this week', k => k.done && k.doneOn >= D0]};
const tkOrigin = (app, k) => { const m = mtOf(k.src); return m ? (mtSees(app, m) ? `<button class="lnk4" data-act="mtOpen" data-v="${m.id}">${m.ty}, ${fmtDy(m.d)}</button>` : `${m.ty}, ${fmtDy(m.d)}`) : k.pr ? `<button class="lnk4" data-act="prOpen" data-v="${k.pr}">Job ${k.pr}, ${esc(prOf(k.pr).ad)}</button>` : 'Added by hand'; };
const tkRow5 = (app, k) => `<div class="mbr nc${tkOver(k) ? ' rf-ovr' : ''}${S.hl === k.id ? ' hl2' : ''}" data-hl="${k.id}"><div class="mbc" style="flex:3"><b>${esc(k.t)}</b><small>${k.pr && mtOf(k.src) ? `<button class="lnk4" data-act="prOpen" data-v="${k.pr}">${esc(prOf(k.pr).ad)}</button>` : ''}</small></div>` + cell(RN(k.r), RP(k.r), 1.4) + `<div class="mbc"><b${tkOver(k) ? ' class="rf-od"' : ''}>${fmtDy(k.due)}</b><small>${k.done ? 'done ' + fmtDy(k.doneOn) : fmtD(k.due)}</small></div>` + `<div class="mbc" style="flex:1.8"><b style="font-weight:600">${tkOrigin(app, k)}</b><small>${mtOf(k.src) ? 'meeting action' : 'from a job'}</small></div>` + `<div class="mbc"><b>${k.done ? pill('tg', 'Done') : tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', 'Open')}</b><small></small></div>` + btns(k.done ? '' : nx('tkDone5', k.id, 'Mark done', 'sec')) + `</div>`;
function tasksPage(app){ const f = S.f.tkf || 'open', mine = S.f.tkm === 'mine', tm = app === 'dir' ? (S.f.ttm || '') : app;
  const base = DB.tk.filter(k => (!tm || teamOf(k.r) === tm) && (!mine || k.r === S.role)), xs = base.filter(TKF[f][1]).sort((a, b) => (tkOver(b) - tkOver(a)) || (a.due < b.due ? -1 : 1));
  return oph('My tasks', app === 'dir' ? 'Every team’s tasks, from meetings and from jobs. Filter by team.' : `${LAPPS[app].team}: tasks from the Monday and Thursday meetings and from jobs.`, nx('tkNew5', '', 'Add a task'))
    + `<div class="cstats">${Object.entries(TKF).map(([k2, [n, fn]]) => stat(k2 === 'over' && base.some(tkOver) ? 'tred' : 'tk', n, base.filter(fn).length, f === k2 ? 'filtering the list' : '', 'tkf', k2, f === k2)).join('')}</div>`
    + `<div class="rf-bar">${seg('tkm', mine ? 'mine' : 'all', [['mine', 'My tasks'], ['all', 'All team tasks']])}${app === 'dir' ? seg('ttm', tm, [['', 'All teams'], ...APPS.map(([k2, n]) => [k2, n, DB.tk.filter(t => !t.done && teamOf(t.r) === k2).length])]) : ''}</div>`
    + th(cell('Task', 'Property', 3) + cell('Owner', '', 1.4) + cell('Due', '') + cell('Origin', '', 1.8) + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + (xs.length ? xs.map(k => tkRow5(app, k)).join('') : empty(mine ? `Nothing here for ${RN(S.role)}. All team tasks shows the rest.` : 'Nothing here.')); }
A.tkf = el => { S.f.tkf = el.dataset.v; render(); };
A.tkm = el => { S.f.tkm = el.dataset.v; render(); };
A.tkDone5 = el => { const k = DB.tk.find(x => x.id === el.dataset.v); k.done = true; k.doneOn = TODAY; if(k.pr) his(prOf(k.pr), `Task done: ${k.t}`, ME()); render(); toast('Done. It counts in Done this week.'); };
const tmRoles = app => app === 'dir' ? Object.keys(ROLES) : LAPPS[app].roles;
A.tkNew5 = () => { S.modal = {k:'tk5', t:'', r:tmRoles(S.view).includes(S.role) ? S.role : '', d:'', pr:''}; renderLayer(); };
MODALS.tk5 = m => modal('Add a task', 'With an owner, a due date and, if it belongs to one, the property.', fld('Task', 'm', 't', m.t, {req:true, ph:'e.g. Send the Waverley archetype list'}) + mlab('Owner', true) + mseg('r', m.r, tmRoles(S.view).map(r => [r, `${RN(r)}, ${RP(r)}`])) + `<div class="rf-2">${fld('Due date', 'm', 'd', m.d, {type:'date', req:true})}${cbx('Property (optional)', 'tkpr', [['', 'No property'], ...DB.pr.filter(p => OPENP.includes(p.ph)).map(p => [p.id, p.ad, p.id])], m.pr, 'm', {ph:'No property'})}</div>`, mfoot('Add task', 'tkOk5', !!(m.t.trim() && m.r && m.d)), 620);
CBK.tkpr = 'pr';
A.tkOk5 = () => { const m = S.modal, k = {id:'TK-' + (++DB.seq.tk), t:m.t.trim(), r:m.r, due:m.d, src:'Job', pr:m.pr || null, done:false, doneOn:null}; if(!k.pr) k.src = 'Added'; DB.tk.push(k); if(k.pr) his(prOf(k.pr), `Task added: ${k.t}, ${RN(k.r)}, due ${fmtDy(k.due)}`, ME()); S.modal = null; S.hl = k.id; render(); toast(`Task added for ${RN(k.r)}.`); };

/* Meetings: a register with upcoming and past, and each meeting’s detail */
const avs = ks => `<span class="rf-avs">${ks.slice(0, 4).map(k => `<i title="${esc(PEO[k].n)}">${ini(PEO[k].n) || PEO[k].n[0]}</i>`).join('')}${ks.length > 4 ? `<em>+${ks.length - 4}</em>` : ''}</span>`;
function mtgPage5(app){ const id = S.f.mtd; if(id && mtOf(id) && mtSees(app, mtOf(id))) return mtDetail(app, mtOf(id));
  const tab = S.f.mtt || 'up', xs = DB.mt.filter(m => mtSees(app, m) && (tab === 'up' ? m.d >= TODAY : m.d < TODAY)).sort((a, b) => tab === 'up' ? (a.d + a.h < b.d + b.h ? -1 : 1) : (a.d + a.h > b.d + b.h ? -1 : 1));
  return oph('Meetings', app === 'dir' ? 'Monday and Thursday team meetings and the Tuesday directors’ meeting, with their summary, decisions and actions.' : 'Monday and Thursday team meetings, with their summary, decisions and actions. Money stays in the Tuesday directors’ meeting.', later('Fellow notes'))
    + `<div class="rf-bar">${seg('mtt', tab, [['up', 'Upcoming', DB.mt.filter(m => mtSees(app, m) && m.d >= TODAY).length], ['past', 'Past', DB.mt.filter(m => mtSees(app, m) && m.d < TODAY).length]])}</div>`
    + th(cell('Date and time', '', 1.3) + cell('Meeting', '', 1.6) + cell('Attendees', '', 1.6) + cell('Summary', '') + cell('Actions', '')) + xs.map(m => rowO('mtOpen', m.id, cell(fmtDy(m.d), `${m.h}${m.d === TODAY ? ', today' : ''}`, 1.3) + tcell('mtOpen', m.id, m.ty, m.ty === 'Tuesday directors' ? 'Includes money' : 'No money', 1.6) + `<div class="mbc" style="flex:1.6">${avs(m.who)}<small>${plural(m.who.length, 'attendee', 'attendees')}</small></div>` + `<div class="mbc"><b>${m.d >= TODAY ? pill('tk', 'Scheduled') : m.ready ? pill('tg', 'Summary ready') : pill('ta', 'Pending')}</b><small></small></div>` + cell(m.d >= TODAY ? '' : mtActs(m).length, m.d >= TODAY ? '' : 'actions'), S.hl === m.id)).join(''); }
function mtDetail(app, m){ const acts = mtActs(m), past = m.d < TODAY;
  return crumb('mtBack', 'Meetings', `${m.ty}, ${fmtDy(m.d)}`) + oph(`${m.ty}, ${fmtDy(m.d)}`, `${m.h}. ${plural(m.who.length, 'attendee', 'attendees')}.`)
    + `<section class="rsec"><div class="rs-h"><h3>Attendees</h3></div><div class="rf-atl">${m.who.map(k => `<span>${av(k, 26)}<b>${PEO[k].n}</b><small>${RN(Object.keys(ROLES).find(r => ROLES[r][1] === k) || 'dir')}</small></span>`).join('')}</div></section>`
    + `<section class="rsec"><div class="rs-h"><h3>Summary</h3></div>${!past ? empty('Scheduled. The summary, decisions and actions appear here after the meeting.') : m.ready ? `<p class="rf-sum">${esc(m.sum)}</p>` : empty('Pending: the notes are still being processed.')}</section>`
    + (past && m.ready ? `<section class="rsec"><div class="rs-h"><h3>Decisions</h3></div>${m.dec.map(d => `<div class="rf-dl ok"><span class="rf-ck">${ico('check', 14, 2.6)}</span><div><b style="font-weight:600">${esc(d)}</b></div></div>`).join('')}</section>`
      + `<section class="rsec"><div class="rs-h"><h3>Actions agreed</h3><p>Each one created a task with its owner and due date.</p></div>${acts.map(k => rdiv(cell(esc(k.t), k.pr ? prOf(k.pr).ad : '', 3) + cell(RN(k.r), RP(k.r), 1.4) + cell(fmtDy(k.due), '') + `<div class="mbc"><b>${k.done ? pill('tg', 'Done') : tkOver(k) ? pill('tred', 'Overdue') : pill('tk', 'Open')}</b><small></small></div>` + btns(teamOf(k.r) === app || app === 'dir' ? nx('tkGo', k.id, 'Open the task', 'sec') : `<small class="mini">In ${APPN[teamOf(k.r)] || 'its team'}</small>`))).join('') || empty('No actions recorded.')}</section>` : ''); }
A.mtt = el => { S.f.mtt = el.dataset.v; S.f.mtd = null; render(); };
A.mtOpen = el => { S.f.mtd = el.dataset.v; S.fi[S.view] = null; S.page[S.view] = 'mtg'; render(true); };
A.mtBack = () => { const id = S.f.mtd; S.f.mtd = null; S.hl = id; render(true); };
A.tkGo = el => { const k = DB.tk.find(x => x.id === el.dataset.v); S.f.tkf = k.done ? 'done' : 'open'; S.f.tkm = 'all'; S.f.ttm = ''; S.hl = k.id; S.page[S.view] = 'tasks'; S.fi[S.view] = null; render(true); scrollHL(); };

/* Sidebars: Tasks and meetings first, and it is where every app opens */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side, act = pageAct(a);
  VIEWS[a].side = () => o().replace(new RegExp(`<button class="nav" data-act="${act}" data-v="(tasks|tue)"[\\s\\S]*?</button>`, 'g'), '').replace('<aside class="sb">', '<aside class="sb"><div class="sb-sec">Tasks and meetings</div>' + sbItem(S.page[a], act)(['tasks', 'My tasks', 'todo', DB.tk.filter(k => !k.done && (a === 'dir' || teamOf(k.r) === a)).length, DB.tk.some(k => tkOver(k) && (a === 'dir' || teamOf(k.r) === a)) ? 2 : 1]) + sbItem(S.page[a], act)(['mtg', 'Meetings', 'cal', DB.mt.filter(m => mtSees(a, m) && m.d >= TODAY).length, 1]));
  VIEWS[a].pages.tasks = () => tasksPage(a); VIEWS[a].pages.mtg = () => mtgPage5(a); HOME[a] = 'tasks'; S.page[a] = 'tasks'; });
const op5 = A[pageAct('dir')]; APPS.forEach(([a]) => { const o = A[pageAct(a)]; A[pageAct(a)] = el => { if(el.dataset.v === 'mtg') S.f.mtd = null; o(el); }; });

/* Versions and tour */
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/CjHHZnDYP8wSQzW9v2fcXJ'; } });
VERSIONS.push({v:'v3.2', date:TODAY, major:false, current:true, url:null, title:'Five apps, each opening on Tasks and meetings', sum:'Tasks and meetings is now the first section of every app: my tasks with four indicators, and the meetings register with summaries, decisions and actions. Everything now speaks of the REFYT system.', steps:[
  {t:'Five apps', min:.5, dolor:'Before, Tasks and meetings was a sixth app.', show:['The dropdown lists Director, Commercial, Accounts, Retrofit and Delivery.'], say:'Each team works in one app.', go:() => { S.role = 'dir'; go('dir', 'tasks'); S.pop = 'sw'; drawPop(); }},
  {t:'Tasks and meetings first, in every app', min:1, dolor:'Before, tasks were a section near the bottom.', show:['Due today, open, overdue and done this week; each one filters the list.', 'My tasks or all team tasks; Director filters by team.'], say:'The day starts with what is due.', go:() => { S.role = 'inc'; S.f.tkf = 'open'; go('del', 'tasks'); }},
  {t:'The meetings register', min:1, dolor:'Before, meetings were a report page.', show:['Upcoming and past meetings with attendees, summary status and actions.', 'Open one: summary, decisions and the tasks it created.'], say:'Every action can be traced to the meeting that agreed it.', go:() => { S.role = 'dir'; S.f.mtt = 'past'; S.f.mtd = 'MT-503'; go('dir', 'mtg'); }},
  {t:'The REFYT system', min:.5, dolor:'Before, the demo named another platform.', show:['Automations say “The system...”; the data map shows the REFYT system’s records.'], say:'It is your system.', go:() => { S.role = 'dir'; go('del', 'auto'); }},
]});
TOUR.length = 0;
TOUR.push(
  {t:'Five apps, one per team', min:1.5, dolor:'Section 14: "Each team should feel it has its own tool, showing only what it needs."', show:['The app’s name sits next to the logo; the dropdown lists Director, Commercial, Accounts, Retrofit and Delivery with their team.', 'Every app opens on its Tasks and meetings.'], say:'Five tools, one version of every job.', go:() => { S.role = 'dir'; go('dir', 'tasks'); S.pop = 'sw'; drawPop(); }},
  {t:'Each role opens its own apps', min:1, dolor:'Roles, not names: your restructure decides who fills each one.', show:['Viewing as Assessor: Retrofit opens; the other apps are locked in the dropdown.'], say:'Change the person behind a role; nothing is rebuilt.', go:() => { S.role = 'ass'; S.view = firstApp(); render(true); S.pop = 'sw'; drawPop(); }},
  {t:'The day starts with Tasks and meetings', min:1.5, dolor:'Section 15: actions agreed in a meeting become tasks with an owner and a due date.', show:['Delivery: due today, open, overdue and done this week; click one to filter.', 'The scaffold date for Manford Way is due today; the Fencepiece Road photos are overdue.', 'Add a task with an owner, a due date and its property.'], say:'Nothing agreed is lost between meetings.', go:() => { S.role = 'inc'; S.f.tkf = 'open'; S.f.tkm = 'all'; go('del', 'tasks'); }},
  {t:'The meetings register', min:1.5, dolor:'Monday and Thursday for everyone, Tuesday for the directors with the money.', show:['Past: the Monday meeting of Oct 19 with its summary, decisions and four actions.', 'Each action opens the task it created.'], say:'Every task traces back to its meeting.', go:() => { S.role = 'dir'; S.f.mtt = 'past'; S.f.mtd = 'MT-503'; go('dir', 'mtg'); }},
  {t:'Retrofit: evidence, review and revisits', min:1.5, dolor:'Section 5: if anything is missing, the assessor goes back; the system books and counts the revisit.', show:['Waiting for my approval: the assessment on Canterbury Street.', 'Reject with a comment: the revisit is booked and counted.'], say:'The pack is complete before the client sees it.', go:() => { S.role = 'aap'; go('ret', 'wait'); }},
  {t:'Delivery: Ready to install sets itself', min:1.5, dolor:'Section 6: a property shows Ready to install automatically once every item that applies is done.', show:['9 Balmoral Road: finish the last items and it turns ready.', 'Redbridge tracker with the MDA hold point.'], say:'Delivery runs phases D, E and F from one app.', go:() => { S.role = 'inc'; go('del', 'rdy'); }},
  {t:'One property, each team’s view', min:1.5, dolor:'Section 10: operations see progress and bookings, never prices or margins.', show:['22 Clayhall Avenue in Delivery: install and orders, money locked.', 'Open it in Commercial: 15% margin against an 18% target.'], say:'Same record, each team sees its part.', go:() => { S.role = 'dir'; abrir('del', 'PR-2017', 'res'); }},
  {t:'Director: the dashboards', min:2, dolor:'Rule 4: meetings and decisions run from dashboards.', show:['The eight dashboards of section 16, with filters, trends and schemes side by side.', 'Click a scheme, then a property, then its cost line.'], say:'The Tuesday meeting is already prepared.', go:() => { S.role = 'dir'; go('dir', 'dbiz'); }});
TOUR_MAS.length = 0; TOUR_MAS.push('Accounts: payment triggers and supplier invoices to match.', 'Commercial: scheme settings with their change log.', 'Delivery: health and safety expiry dates.', 'Retrofit: import jobs from the client list.', 'Data map: the records behind the five apps.');
S.view = firstApp();

/* =================== v3.3: people as owners, action points, readable charts, responsive =================== */
const roleOfP = w => PWHO[w] || (Object.keys(ROLES).find(r => ROLES[r][1] === w)) || 'dir';
const DESC = {'TK-203':'MDA could not attend on Oct 15. Book a new visit before any EWI work; the steel frame check is a hold point.', 'TK-206':'INV-3302 was due on Oct 16. Call the Medway finance contact and confirm the payment date.', 'TK-207':'Kent Scaffold Hire needs 48 hours notice. The order is waiting for the Director because it is over the Redbridge limit.', 'TK-209':'Waverley and Cottsway start in October. Use the Medway targets as the starting point.', 'TK-214':'Cotality rejected two photos without location and time. Upload them again from the site form.'};
DB.tk.forEach(k => { k.who = k.who || ROLES[k.r][1]; k.desc = k.desc || DESC[k.id] || ''; });
const pOpts = app => Object.entries(PEO).filter(([k]) => k !== 'kel' && (app === 'dir' || teamOf(roleOfP(k)) === app || k === ME())).map(([k, p]) => [k, p.n, p.r]);
const ownerCell = k => cell(PEO[k.who] ? PEO[k.who].n : RP(k.r), PEO[k.who] ? PEO[k.who].r : RN(k.r), 1.4);

/* My tasks: owner is a person; the row opens the task */
function tasksPage(app){ const f = S.f.tkf || 'open', mine = S.f.tkm === 'mine', tm = app === 'dir' ? (S.f.ttm || '') : app;
  const base = DB.tk.filter(k => (!tm || teamOf(k.r) === tm) && (!mine || k.who === ME())), xs = base.filter(TKF[f][1]).sort((a, b) => (tkOver(b) - tkOver(a)) || (a.due < b.due ? -1 : 1));
  const row = k => `<div class="mbr um-row nc${tkOver(k) ? ' rf-ovr' : ''}${S.hl === k.id ? ' hl2' : ''}" data-act="tkView" data-v="${k.id}" data-hl="${k.id}" tabindex="0"><div class="mbc" style="flex:3"><b>${esc(k.t)}</b><small>${k.desc ? esc(k.desc.slice(0, 70)) + (k.desc.length > 70 ? '...' : '') : k.pr ? esc(prOf(k.pr).ad) : ''}</small></div>` + ownerCell(k) + `<div class="mbc"><b${tkOver(k) ? ' class="rf-od"' : ''}>${fmtDy(k.due)}</b><small>${k.done ? 'done ' + fmtDy(k.doneOn) : fmtD(k.due)}</small></div><div class="mbc" style="flex:1.8"><b style="font-weight:600">${tkOrigin(app, k)}</b><small>${mtOf(k.src) ? 'meeting action' : k.pr ? 'from a job' : ''}</small></div><div class="mbc"><b>${k.done ? pill('tg', 'Done') : tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', 'Open')}</b><small></small></div>` + btns(k.done ? '' : nx('tkDone5', k.id, 'Mark done', 'sec')) + '</div>';
  return oph('My tasks', app === 'dir' ? 'Every team’s tasks, from meetings and from jobs. Filter by team.' : `${LAPPS[app].team}: tasks from the Monday and Thursday meetings and from jobs.`, nx('tkNew5', '', 'Add a task'))
    + `<div class="cstats">${Object.entries(TKF).map(([k2, [n, fn]]) => stat(k2 === 'over' && base.some(tkOver) ? 'tred' : 'tk', n, base.filter(fn).length, f === k2 ? 'filtering the list' : '', 'tkf', k2, f === k2)).join('')}</div>`
    + `<div class="rf-bar">${seg('tkm', mine ? 'mine' : 'all', [['mine', 'My tasks'], ['all', 'All team tasks']])}${app === 'dir' ? seg('ttm', tm, [['', 'All teams'], ...APPS.map(([k2, n]) => [k2, n, DB.tk.filter(t => !t.done && teamOf(t.r) === k2).length])]) : ''}</div>`
    + `<div class="rf-tw">` + th(cell('Task', 'Description', 3) + cell('Owner', '', 1.4) + cell('Due', '') + cell('Origin', '', 1.8) + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + (xs.length ? xs.map(row).join('') : empty(mine ? `Nothing here for ${PEO[ME()].n}. All team tasks shows the rest.` : 'Nothing here.')) + '</div>'; }
A.tkView = el => { S.modal = {k:'tkv', id:el.dataset.v}; renderLayer(); };
MODALS.tkv = m => { const k = DB.tk.find(x => x.id === m.id), app = S.view;
  return modal(esc(k.t), `${k.done ? 'Done ' + fmtDy(k.doneOn) : tkOver(k) ? 'Overdue' : 'Open'}, due ${fmtDy(k.due)}`, kv([['Owner', PEO[k.who] ? PEO[k.who].n : RP(k.r), PEO[k.who] ? PEO[k.who].r : RN(k.r)], ['Due', fmtDy(k.due), k.done ? '' : fmtD(k.due)], ['Origin', mtOf(k.src) ? `${mtOf(k.src).ty}, ${fmtDy(mtOf(k.src).d)}` : k.pr ? `Job ${k.pr}` : 'Added by hand', k.pr ? esc(prOf(k.pr).ad) : '']]) + `<section class="rsec" style="margin-top:14px"><div class="rs-h"><h3>Description</h3></div>${k.desc ? `<p class="rf-sum">${esc(k.desc).replace(/\n/g, '<br>')}</p>` : empty('No description.')}</section>`,
    `<span class="note"></span>${mtOf(k.src) && mtSees(app, mtOf(k.src)) ? `<button class="btn sec lg" data-act="mtOpen" data-v="${k.src}">Open the meeting</button>` : ''}${k.pr ? `<button class="btn sec lg" data-act="prOpen" data-v="${k.pr}">Open the property</button>` : ''}${k.done ? '' : `<button class="btn pri lg" data-act="tkDoneM" data-v="${k.id}">Mark done</button>`}`, 620); };
A.tkDoneM = el => { S.modal = null; A.tkDone5(el); };
const oMt = A.mtOpen; A.mtOpen = el => { S.modal = null; oMt(el); };
const oPr = A.prOpen; A.prOpen = el => { S.modal = null; oPr(el); };
A.tkNew5 = () => { S.modal = {k:'tk5', t:'', desc:'', w:pOpts(S.view).some(o => o[0] === ME()) ? ME() : '', d:'', pr:'', mt:''}; renderLayer(); };
const taskForm = m => fld('Task', 'm', 't', m.t, {req:true, ph:'e.g. Send the Waverley archetype list'}) + area('Description', 'm', 'desc', m.desc, 'Optional: what needs doing and why') + `<div class="rf-2">${cbx('Owner', 'tkw', pOpts(S.view), m.w, 'm', {req:true, ph:'Choose a person...'})}${fld('Due date', 'm', 'd', m.d, {type:'date', req:true})}</div>`;
MODALS.tk5 = m => modal('Add a task', 'With an owner, a due date and, if it belongs to one, the property.', taskForm(m) + cbx('Property (optional)', 'tkpr', [['', 'No property'], ...DB.pr.filter(p => OPENP.includes(p.ph)).map(p => [p.id, p.ad, p.id])], m.pr, 'm', {ph:'No property'}), mfoot('Add task', 'tkOk5', !!(m.t.trim() && m.w && m.d)), 640);
CBK.tkw = 'w';
A.tkOk5 = () => { const m = S.modal, k = {id:'TK-' + (++DB.seq.tk), t:m.t.trim(), desc:(m.desc || '').trim(), who:m.w, r:roleOfP(m.w), due:m.d, src:m.mt || (m.pr ? 'Job' : 'Added'), pr:m.pr || null, done:false, doneOn:null}; DB.tk.push(k); if(k.pr) his(prOf(k.pr), `Task added: ${k.t}, ${PEO[k.who].n}, due ${fmtDy(k.due)}`, ME()); S.modal = null; S.hl = k.id; render(); toast(m.mt ? `Action point added and task created for ${PEO[k.who].n}.` : `Task added for ${PEO[k.who].n}.`); };

/* Meetings: action points, and "3 actions, 1 open" in the register */
const actsTxt = m => { const a = mtActs(m); return a.length ? `${plural(a.length, 'action', 'actions')}, ${a.filter(k => !k.done).length} open` : 'No actions'; };
function mtgPage5(app){ const id = S.f.mtd; if(id && mtOf(id) && mtSees(app, mtOf(id))) return mtDetail(app, mtOf(id));
  const tab = S.f.mtt || 'up', xs = DB.mt.filter(m => mtSees(app, m) && (tab === 'up' ? m.d >= TODAY : m.d < TODAY)).sort((a, b) => tab === 'up' ? (a.d + a.h < b.d + b.h ? -1 : 1) : (a.d + a.h > b.d + b.h ? -1 : 1));
  return oph('Meetings', app === 'dir' ? 'Monday and Thursday team meetings and the Tuesday directors’ meeting, with their summary, decisions and action points.' : 'Monday and Thursday team meetings, with their summary, decisions and action points. Money stays in the Tuesday directors’ meeting.', later('Fellow notes'))
    + `<div class="rf-bar">${seg('mtt', tab, [['up', 'Upcoming', DB.mt.filter(m => mtSees(app, m) && m.d >= TODAY).length], ['past', 'Past', DB.mt.filter(m => mtSees(app, m) && m.d < TODAY).length]])}</div>`
    + `<div class="rf-tw">` + th(cell('Date and time', '', 1.3) + cell('Meeting', '', 1.6) + cell('Attendees', '', 1.6) + cell('Summary', '') + cell('Action points', '', 1.3)) + xs.map(m => rowO('mtOpen', m.id, cell(fmtDy(m.d), `${m.h}${m.d === TODAY ? ', today' : ''}`, 1.3) + tcell('mtOpen', m.id, m.ty, m.ty === 'Tuesday directors' ? 'Includes money' : 'No money', 1.6) + `<div class="mbc" style="flex:1.6">${avs(m.who)}<small>${plural(m.who.length, 'attendee', 'attendees')}</small></div>` + `<div class="mbc"><b>${m.d >= TODAY ? pill('tk', 'Scheduled') : m.ready ? pill('tg', 'Summary ready') : pill('ta', 'Pending')}</b><small></small></div>` + cell(m.d >= TODAY && !mtActs(m).length ? '' : actsTxt(m), '', 1.3), S.hl === m.id)).join('') + '</div>'; }
function mtDetail(app, m){ const acts = mtActs(m), past = m.d <= TODAY;
  return crumb('mtBack', 'Meetings', `${m.ty}, ${fmtDy(m.d)}`) + oph(`${m.ty}, ${fmtDy(m.d)}`, `${m.h}. ${plural(m.who.length, 'attendee', 'attendees')}. ${actsTxt(m)}.`)
    + `<section class="rsec"><div class="rs-h"><h3>Attendees</h3></div><div class="rf-atl">${m.who.map(k => `<span>${av(k, 26)}<b>${PEO[k].n}</b><small>${PEO[k].r}</small></span>`).join('')}</div></section>`
    + `<section class="rsec"><div class="rs-h"><h3>Summary</h3></div>${m.d > TODAY ? empty('Scheduled. The summary and decisions appear here after the meeting.') : m.ready ? `<p class="rf-sum">${esc(m.sum)}</p>` : empty('Pending: the notes are still being processed.')}</section>`
    + (m.ready && m.dec.length ? `<section class="rsec"><div class="rs-h"><h3>Decisions</h3></div>${m.dec.map(d => `<div class="rf-dl ok"><span class="rf-ck">${ico('check', 14, 2.6)}</span><div><b style="font-weight:600">${esc(d)}</b></div></div>`).join('')}</section>` : '')
    + `<section class="rsec"><div class="rs-h"><h3>Action points</h3><p>Each one is a task in My tasks, with its owner and due date.</p></div>${past ? `<div class="eh-a" style="margin:-4px 0 10px">${nx('apNew', m.id, 'Add action point')}</div>` : ''}<div class="rf-tw">${acts.length ? th(cell('Action point', 'Description', 3) + cell('Owner', '', 1.4) + cell('Due', '') + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Task</small></div>') + acts.map(k => rdiv(`<div class="mbc" style="flex:3"><b>${esc(k.t)}</b><small>${esc(k.desc || (k.pr ? prOf(k.pr).ad : ''))}</small></div>` + ownerCell(k) + `<div class="mbc"><b${tkOver(k) ? ' class="rf-od"' : ''}>${fmtDy(k.due)}</b><small></small></div><div class="mbc"><b>${k.done ? pill('tg', 'Done') : tkOver(k) ? pill('tred', 'Open, overdue') : pill('tk', 'Open')}</b><small></small></div>` + btns(teamOf(k.r) === app || app === 'dir' ? nx('tkGo', k.id, 'Open the task', 'sec') : `<small class="mini">In ${APPN[teamOf(k.r)] || 'its team'}</small>`))).join('') : empty(past ? 'No action points yet. Add the first one.' : 'Action points are added during or after the meeting.')}</div></section>`; }
A.apNew = el => { S.modal = {k:'ap5', t:'', desc:'', w:ME(), d:addDays(TODAY, 7), pr:'', mt:el.dataset.v}; renderLayer(); };
MODALS.ap5 = m => modal('Add action point', `${mtOf(m.mt).ty}, ${fmtDy(mtOf(m.mt).d)}. It creates the task in My tasks at the same time.`, taskForm(m), mfoot('Add action point', 'tkOk5', !!(m.t.trim() && m.w && m.d)), 640);

/* Charts: full width, at least 280px high, readable axes and a tooltip */
function chart(vals, labels, f, title, vals2, names){ const mx = Math.max(1, ...vals, ...(vals2 || [])), big = /Value won|Invoiced and paid/.test(title), two = !!vals2, ticks = [1, .75, .5, .25, 0];
  return `<div class="rf-ch rf-chf${big ? ' big' : ''}"><div class="rf-chh"><b>${title}</b>${two ? `<span><i class="a"></i>${names[0]}<i class="b"></i>${names[1]}</span>` : ''}</div><div class="rf-cpl"><div class="rf-yax">${ticks.map(t => `<span>${f(mx * t)}</span>`).join('')}</div><div class="rf-cb"><div class="rf-glw">${ticks.map((t, i) => `<i class="rf-gl" style="top:${i * 25}%"></i>`).join('')}</div>${vals.map((v, i) => `<div class="rf-col"><div class="rf-bars">${[[v, two ? 'a' : (i === vals.length - 1 ? 'cur' : 'a')], ...(two ? [[vals2[i], 'b']] : [])].map(([x, c], j) => `<span class="rf-bar1 ${c}" style="height:${Math.max(.5, x / mx * 100)}%" data-tt="${esc(labels[i])}: ${esc(two ? names[j] + ' ' : '')}${esc(f(x))}"></span>`).join('')}</div><small>${labels[i]}</small></div>`).join('')}</div></div></div>`; }
document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('[data-tt]'); let tip = document.getElementById('rftt'); if(!tip){ tip = document.createElement('div'); tip.id = 'rftt'; document.body.appendChild(tip); } if(!t){ tip.style.display = 'none'; return; } const r = t.getBoundingClientRect(); tip.textContent = t.dataset.tt; tip.style.display = 'block'; tip.style.left = Math.min(innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2)) + 'px'; tip.style.top = Math.max(8, r.top - tip.offsetHeight - 8) + 'px'; });

/* Scheme settings: one editable table, units inside the inputs */
const SETS = [['mg', 'Margin target', '%', 0], ['ord', 'Order limit', '£', 1], ['pay', 'Payment limit', '£', 1], ['vr', 'Variation limit', '£', 1], ['terms', 'Payment terms', 'days', 0]];
const uIn = (s, [k, , u, pre]) => `<label class="rf-uin${pre ? ' pre' : ''}">${pre ? `<em>${u}</em>` : ''}<input class="um-in" inputmode="decimal" data-in="scs" data-k="${s.id}|${k}" value="${s.set[k]}" aria-label="${esc(s.n)} ${k}">${pre ? '' : `<em>${u}</em>`}</label>`;
function ssetPage(){ return oph('Scheme settings', 'Margin target, approval limits and payment terms per scheme. Change them at any time; every change is logged.') + `<div class="el-wide rf-st"><div class="rf-mx"><table><thead><tr><th>Scheme</th>${SETS.map(([, n]) => `<th>${n}</th>`).join('')}<th>Last change</th></tr></thead><tbody>${DB.sc.map(s => `<tr><td><b>${esc(s.n)}</b><small class="mini" style="display:block">${s.ty} type</small></td>${SETS.map(x => `<td>${uIn(s, x)}</td>`).join('')}<td><small class="mini">${s.log.length ? `${fmtDy(s.log[s.log.length - 1][0])}, ${PEO[s.log[s.log.length - 1][1]].n}` : 'No changes'}</small></td></tr>`).join('')}</tbody></table></div></div>`; }

/* Header: menu button for the sidebar, compact role, and "..." for version and tour on narrow screens */
A.sbTog = () => { const el = document.querySelector(`#a-${S.view}`); if(el) el.classList.toggle('sbopen'); };
document.addEventListener('click', e => { const n = e.target.closest && e.target.closest('.sb .nav'); if(n){ const o = n.closest('.oapp'); if(o) setTimeout(() => o.classList.remove('sbopen'), 0); } });
A.popMore = () => { S.pop = S.pop === 'more' ? null : 'more'; drawPop(); };
A.moreVs = () => { S.pop = null; drawPop(); S.vs.open = true; drawVs(); };
A.moreTour = () => { S.pop = null; drawPop(); A.tour(); };
function drawPop(){ let el = document.getElementById('rfpop'); if(!el){ el = document.createElement('div'); el.id = 'rfpop'; document.body.appendChild(el); } if(!S.pop){ el.innerHTML = ''; return; }
  const top = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom + 6, sameT = k => LAPPS[k].team === APPN[k];
  if(S.pop === 'sw') el.innerHTML = `<div class="rf-pop" style="top:${top}px;left:12px"><small class="rf-ph">Apps</small>${APPS.map(([k, n, ic]) => { const ok = allowed(k); return `<button class="rf-pi${ok ? '' : ' lock'}${S.view === k ? ' on' : ''}" data-act="${ok ? 'view' : 'lockedApp'}" data-v="${k}" ${ok ? '' : 'aria-disabled="true"'}><span class="rf-ai">${ico(ok ? ic : 'lock', 15)}</span><b>${n}</b><small>${ok ? (sameT(k) ? 'Team app' : LAPPS[k].team) : `Not available for ${RN(S.role)}`}</small></button>`; }).join('')}<div class="rf-psep"></div><button class="rf-pi${S.view === 'db' ? ' on' : ''}" data-act="view" data-v="db"><span class="rf-ai">${ico('db', 15)}</span><b>Data map</b><small>The records behind all five apps</small></button></div>`;
  if(S.pop === 'role') el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:12px"><small class="rf-ph">Viewing as</small>${Object.entries(ROLES).filter(([k]) => roleOk(k)).map(([k, [n]]) => `<button class="rf-pi${S.role === k ? ' on' : ''}" data-act="setRole" data-v="${k}"><b>${n}</b><small>${RP(k)}, ${APPS.filter(([a]) => k === 'dir' || (LAPPS[a].roles || []).includes(k)).map(a => a[1]).join(', ')}</small></button>`).join('')}</div>`;
  if(S.pop === 'more') el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:12px;width:240px"><button class="rf-pi" data-act="moreVs"><span class="rf-ai">${ico('layers', 15)}</span><b>Versions</b><small>Current ${VC().v}</small></button><button class="rf-pi" data-act="moreTour"><span class="rf-ai">${ico('flag', 15)}</span><b>Tour</b><small>${TOUR.length} steps</small></button></div>`;
  if(S.pop === 'nt'){ const head = S.role === 'dir', mine = alerts().filter(a => APPS.some(([k]) => k === a.app && allowed(k))), now = head ? [...approvals().filter(a => a.role === 'dir').map(a => ({t:a.t, d:a.k + ' above the scheme limit'})), ...mine.filter(a => a.tone === 'tred').map(a => ({t:a.t, d:a.k}))] : mine.slice(0, 8).map(a => ({t:a.t, d:a.k}));
    el.innerHTML = `<div class="rf-pop wide" style="top:${top}px;right:12px"><small class="rf-ph">${head ? 'Immediate: approvals waiting on you and red flags' : `Your items as ${RN(S.role)}`}</small>${now.slice(0, 8).map(x => `<div class="rf-ni"><b>${esc(x.t)}</b><small>${esc(x.d)}</small></div>`).join('') || '<div class="rf-ni"><small>Nothing right now.</small></div>'}${head ? `` : '<p class="hint" style="margin:8px 0 0">Your head of team gets these in a daily summary, not one by one.</p>'}</div>`; } }
function render6(top){
  if(S.view === 'home' || (S.view !== 'db' && !allowed(S.view))) S.view = firstApp();
  const ap = APPS.find(a => a[0] === S.view), nt = alerts().filter(a => APPS.some(([k]) => k === a.app && allowed(k))).length;
  document.title = 'Refyt';
  $('#appsw').innerHTML = `${S.view !== 'db' ? `<button class="rf-hb rf-menu" data-act="sbTog" aria-label="Menu">${ico('list', 17)}</button>` : ''}<button class="rf-appdd" data-act="popSw" aria-haspopup="true"><span class="rf-ai">${ico(ap ? ap[2] : 'db', 16)}</span><span class="rf-adn"><b>${ap ? ap[1] : 'Data map'}</b>${ap && LAPPS[ap[0]].team !== ap[1] ? `<small>${LAPPS[ap[0]].team}</small>` : ''}</span>${ico('chev', 13)}</button>`;
  $('#tools').innerHTML = `<button class="rf-hb wide rf-va" data-act="popRole" title="Viewing as ${RN(S.role)}">${ico('user', 14)}<span class="rf-vas">Viewing as</span> <span class="rf-vr">${RN(S.role)}</span></button><button class="rf-hb" data-act="popNt" title="Notifications">${ico('bell', 16)}${nt ? `<em class="rf-dot">${nt > 9 ? '9+' : nt}</em>` : ''}</button><button class="btn sec sm vsb" data-act="vsel" title="Versions">${VC().v}<span class="vs-ch">${ico('chev', 13)}</span></button><button class="btn sec sm tourb" data-act="tour">${ico('flag', 14)}Tour</button><button class="rf-hb rf-more" data-act="popMore" aria-label="More">${ico('dots', 16)}</button>`;
  for(const k of [...APPS.map(a => a[0]), 'db', 'home', 'tsk']){ const el = $('#v-' + k); if(el) el.hidden = S.view !== k; }
  const key = S.view + ':' + (S.page[S.view] || '') + ':' + (S.fi[S.view] || ''), main = $('#main'), keep = main.scrollTop;
  if(S.view === 'db'){ $('#dbview').innerHTML = `<div class="op">${dbPage()}</div>`; requestAnimationFrame(dbLines); }
  else { const V = VIEWS[S.view], pg = S.page[S.view], fi = S.fi[S.view], c = fichaOf(fi); $('#a-' + S.view).innerHTML = V.side() + `<div class="op">${pg === 'help' ? helpPage(S.view) : c ? FICHAR(S.view, fi) : (V.pages[pg] || Object.values(V.pages)[0])()}</div>`; }
  main.scrollTop = top || key !== lastKey ? 0 : keep; lastKey = key;
  renderLayer(); drawTour(); drawPop(); requestAnimationFrame(sizeKb); }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/MMDEWPeHrWn9dMhSFuDnv2'; } });
VERSIONS.push({v:'v3.3', date:TODAY, major:false, current:true, url:null, title:'Owners by name, action points, readable charts, every screen size', sum:'Tasks are owned by a person and have a description; meetings have action points that create tasks; charts are full width; scheme settings are one table; the demo fits desktop, laptop and tablet.', steps:[
  {t:'Tasks owned by people', min:.5, dolor:'Before, tasks were owned by a role.', show:['Owner shows the person, with the role underneath.', 'Add a task: owner is a person, with a description.', 'Open a task to read its full description.'], say:'Every task has a name on it.', go:() => { S.role = 'inc'; S.f.tkm = 'all'; go('del', 'tasks'); }},
  {t:'Action points in every meeting', min:.5, dolor:'Before, meetings only listed the tasks they created.', show:['Action points with owner, due date, status and the task they created.', 'Add action point creates the task at the same time.', 'The register shows “3 actions, 1 open”.'], say:'Nothing agreed is lost.', go:() => { S.role = 'dir'; S.f.mtd = 'MT-503'; go('dir', 'mtg'); }},
  {t:'Readable charts', min:.5, dolor:'Before, the charts were small.', show:['Full width, at least 280 pixels high, with axes, legend and a tooltip.'], say:'The numbers read at a glance.', go:() => { S.role = 'dir'; go('dir', 'dbiz'); }},
  {t:'Scheme settings as one table', min:.5, dolor:'Before, the inputs overflowed their card.', show:['One row per scheme and one column per setting, with the unit inside each input.'], say:'Seven schemes on one screen.', go:() => { S.role = 'dir'; go('com', 'sset'); }},
]});

/* =================== v3.4: assessment bookings grouped by status, with a calendar =================== */
const ASR = ['afa', 'xen'];
DB.pr.forEach((p, i) => { if(p.b.vis && !p.b.on){ p.b.on = addDays(p.phOn, -9 - (i % 6) * 2); while([0, 6].includes(fromIso(p.b.on).getDay())) p.b.on = addDays(p.b.on, -1); } if(p.b.on && !p.b.who) p.b.who = ASR[i % 2]; if(p.b.on && !p.b.h) p.b.h = ['09:00', '10:30', '12:00', '14:00', '15:30'][i % 5]; });
Object.assign(prOf('PR-2001').b, {bk:true, on:dAt(-3), h:'10:30', who:'afa'});
Object.assign(prOf('PR-2015').b, {bk:true, on:dAt(1), h:'09:00', who:'xen', revisits:1});
Object.assign(prOf('PR-2014').b, {bk:true, on:dAt(2), h:'14:00', who:'afa'}); prOf('PR-2014').his.push([dAt(-1), 'Assessment booked for Wed, Oct 28 at 14:00 with Afaq Ahmad', 'sar']);
prOf('PR-2015').his.push([dAt(-2), 'Assessment rejected: ventilation photos missing. Revisit booked, revisits 1.', 'ram']);
Object.assign(prOf('PR-2008').b, {on:dAt(-12), h:'11:00', who:'afa'});
const BKST = [['tobook', 'To book', 'tk'], ['booked', 'Booked', 'tb'], ['revisit', 'Revisit booked', 'ta'], ['review', 'Visit done, in review', 'tb'], ['done', 'Assessed', 'tg']];
const bkSt = p => !p.b.bk ? 'tobook' : !p.b.vis ? (p.b.revisits ? 'revisit' : 'booked') : p.b.rev !== 'Approved' ? 'review' : 'done';
const bkList = () => DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph));
const bkTag = p => { const s = BKST.find(x => x[0] === bkSt(p)); return pill(s[2], s[1]); };
function bkPage(){ const v = S.f.bkv || 'list', xs = bkList();
  const head = oph('Assessment bookings', 'Every assessment, grouped by where it stands. Switch to the calendar to see each assessor’s week or the month.')
    + `<div class="cstats">${BKST.map(([k, n, t]) => stat(k === 'revisit' && xs.some(p => bkSt(p) === k) ? 'ta' : 'tk', n, xs.filter(p => bkSt(p) === k).length)).join('')}</div>`
    + `<div class="rf-bar">${seg('bkv', v, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}${v !== 'list' ? `${nx('bkNav', '-1', v === 'week' ? 'Previous week' : 'Previous month', 'sec')}${nx('bkNav', '0', 'Today', 'sec')}${nx('bkNav', '1', v === 'week' ? 'Next week' : 'Next month', 'sec')}` : ''}${seg('bka', S.f.bka || '', [['', 'Both assessors'], ...ASR.map(k => [k, PEO[k].n])])}</div>`;
  if(v === 'list') return head + `<div class="rf-tw">` + th(cell('Property', 'Scheme and reference', 2.4) + cell('Assessment', 'Assessor', 1.6) + cell('Status', '', 1.3) + cell('Revisits', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + BKST.map(([k, n]) => { const zs = xs.filter(p => bkSt(p) === k && (!S.f.bka || p.b.who === S.f.bka || !p.b.bk)).sort((a, b) => (a.b.on || '9') < (b.b.on || '9') ? -1 : 1); return zs.length ? grpH(n, zs.length) + zs.map(p => rowO('prRet', p.id, tcell('prRet', p.id, esc(p.ad), `${scOf(p.sc).n}, ${p.ref}`, 2.4) + cell(p.b.on ? `${fmtDy(p.b.on)}, ${p.b.h}` : 'Not booked', p.b.who ? PEO[p.b.who].n : '', 1.6) + `<div class="mbc" style="flex:1.3"><b>${bkTag(p)}</b><small></small></div>` + cell(p.b.revisits || '', '') + btns(k === 'tobook' ? nx('bBook', p.id, 'Book') : ['booked', 'revisit'].includes(k) ? nx('bVis', p.id, k === 'revisit' ? 'Revisit done' : 'Visit done', 'sec') + nx('bBook', p.id, 'Move', 'sec') : ''), S.hl === p.id)).join('') : ''; }).join('') + '</div>';
  return head + `<div class="rf-calw">${calView(v)}${calSide()}</div>`; }
const calEvts = () => DB.pr.filter(p => p.b.on && p.ph !== 'Cancelled' && (!S.f.bka || p.b.who === S.f.bka));
const evChip = p => { const k = bkSt(p); return `<button class="rf-ev ${k}" data-act="prRet" data-v="${p.id}" data-tt="${esc(p.ad)}, ${esc(PEO[p.b.who].n)}"><b>${p.b.h} ${esc(p.ad)}</b><small>${ini(PEO[p.b.who].n)}, ${BKST.find(x => x[0] === k)[1]}</small></button>`; };
function calView(v){ const off = S.f.bko || 0, evs = calEvts();
  if(v === 'week'){ const mon = addDays(D0, off * 7), days = Array.from({length:5}, (_, i) => addDays(mon, i));
    return `<div class="rf-cal cw"><div class="rf-calh">Week of ${fmtDy(mon)}</div><div class="rf-wg">${days.map(d => { const es = evs.filter(p => p.b.on === d).sort((a, b) => a.b.h < b.b.h ? -1 : 1); return `<div data-date="${d}" class="rf-wd${d === TODAY ? ' today' : ''}"><div class="rf-wdh"><b>${DSH[fromIso(d).getDay()]} ${fromIso(d).getDate()}</b><small>${MSH[fromIso(d).getMonth()]}${d === TODAY ? ', today' : ''}</small></div>${es.map(evChip).join('') || '<small class="rf-free">No assessments</small>'}<small class="rf-load">${ASR.map(a => `${ini(PEO[a].n)} ${es.filter(p => p.b.who === a).length}`).join(', ')}</small></div>`; }).join('')}</div></div>`; }
  const base = fromIso(D0), first = new Date(base.getFullYear(), base.getMonth() + off, 1), y = first.getFullYear(), mo = first.getMonth(), start = addDays(iso(first), -((first.getDay() + 6) % 7)), cells = Array.from({length:42}, (_, i) => addDays(start, i));
  const rows = Math.ceil(((first.getDay() + 6) % 7 + new Date(y, mo + 1, 0).getDate()) / 7);
  return `<div class="rf-cal cm"><div class="rf-calh">${MSH[mo]} ${y}</div><div class="rf-mg">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="rf-mdh">${d}</div>`).join('')}${cells.slice(0, rows * 7).map(d => { const es = evs.filter(p => p.b.on === d).sort((a, b) => a.b.h < b.b.h ? -1 : 1), dt = fromIso(d); return `<div data-date="${d}" class="rf-md${dt.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' today' : ''}"><small>${dt.getDate()}</small>${es.slice(0, 3).map(evChip).join('')}${es.length > 3 ? `<button class="rf-more2" data-act="bkDay" data-v="${d}">+${es.length - 3} more</button>` : ''}</div>`; }).join('')}</div></div>`; }
function calSide(){ const xs = bkList().filter(p => bkSt(p) === 'tobook');
  return `<aside class="rf-cals"><b>To book</b><small>${plural(xs.length, 'job waits', 'jobs wait')} for a date</small>${xs.map(p => `<div class="rf-tb"><div><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}, ${p.ref}</small></div>${nx('bBook', p.id, 'Book')}</div>`).join('') || '<small class="rf-free">Everything is booked.</small>'}<div class="rf-leg">${BKST.slice(1).map(([k, n]) => `<span><i class="rf-ev ${k}"></i>${n}</span>`).join('')}</div></aside>`; }
A.bkv = el => { S.f.bkv = el.dataset.v; S.f.bko = 0; render(); };
A.bka = el => { S.f.bka = el.dataset.v; render(); };
A.bkNav = el => { S.f.bko = el.dataset.v === '0' ? 0 : (S.f.bko || 0) + (+el.dataset.v); render(); };
A.bkDay = el => { S.f.bkv = 'week'; const d = el.dataset.v; S.f.bko = Math.floor(dDiff(d) / 7 + (fromIso(D0).getDay() === 1 ? 0 : 0)); render(); };
/* Booking: date, time and assessor in one window, with each assessor’s day */
A.bBook = el => { const p = prOf(el.dataset.v); S.modal = {k:'bk2', id:p.id, d:p.b.on && p.b.on >= TODAY ? p.b.on : '', h:p.b.h || '', who:p.b.who || ''}; renderLayer(); };
MODALS.bk2 = m => { const p = prOf(m.id), ok = m.d && (m.h || '').trim() && m.who;
  return modal(p.b.bk ? 'Move the assessment' : 'Book the assessment', `${esc(p.ad)}, ${scOf(p.sc).n}, ${p.ref}`, `<div class="rf-2">${fld('Date', 'm', 'd', m.d, {type:'date', req:true})}${fld('Time', 'm', 'h', m.h, {req:true, ph:'09:30'})}</div>` + mlab('Assessor', true) + `<div class="rf-who">${ASR.map(a => { const n = m.d ? DB.pr.filter(x => x.b.on === m.d && x.b.who === a && x.id !== p.id).length : null; return `<button type="button" class="rf-wb${m.who === a ? ' on' : ''}" data-act="mset" data-k="who" data-v="${a}">${av(a, 28)}<div><b>${PEO[a].n}</b><small>${n == null ? 'Choose a date to see the day' : `${plural(n, 'assessment', 'assessments')} that day`}</small></div></button>`; }).join('')}</div>`, mfoot(p.b.bk ? 'Move' : 'Book', 'bkOk', !!ok), 600); };
A.bkOk = () => { const m = S.modal, p = prOf(m.id), moved = p.b.bk; Object.assign(p.b, {bk:true, on:m.d, h:m.h.trim(), who:m.who}); if(tyOf(p) === 'E.ON') p.csTodo = 'Enter the assessment date in Dynamics'; his(p, `Assessment ${moved ? 'moved to' : 'booked for'} ${fmtDy(m.d)} at ${p.b.h} with ${PEO[m.who].n}`, ME()); S.modal = null; auto(p, 'ret', `notified ${PEO[m.who].n}${tyOf(p) === 'E.ON' ? ' and created a reminder to enter the date in Dynamics' : ''}`); };

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/SoAA7na5JW5CYKpYEWohwx'; } });
VERSIONS.push({v:'v3.4', date:TODAY, major:false, current:true, url:null, title:'Assessment bookings by status, with a calendar', sum:'Retrofit’s assessment bookings are grouped by status and have a week and month calendar, with booking by date, time and assessor.', steps:[
  {t:'Bookings grouped by status', min:.5, dolor:'Before, bookings were one flat list.', show:['To book, booked, revisit booked, in review and assessed, each with its count.'], say:'You see at once what still needs a date.', go:() => { S.role = 'sad'; S.f.bkv = 'list'; go('ret', 'bk'); }},
  {t:'Week and month calendar', min:.5, dolor:'Before, there was no calendar.', show:['Each assessor’s week, or the month; the jobs to book on the side.', 'Book picks the date, time and assessor, seeing how full the day is.'], say:'Bookings fit around each assessor’s day.', go:() => { S.role = 'sad'; S.f.bkv = 'week'; S.f.bko = 0; go('ret', 'bk'); }},
]});

/* =================== v3.5: meetings grouped by status, with a calendar =================== */
const MTST = [['today', 'Today'], ['up', 'Upcoming'], ['pend', 'Summary pending'], ['open', 'Actions open'], ['closed', 'Closed']];
const mtSt = m => m.d === TODAY ? 'today' : m.d > TODAY ? 'up' : !m.ready ? 'pend' : mtActs(m).some(k => !k.done) ? 'open' : 'closed';
const mtTag = m => { const s = mtSt(m); return pill({today:'tb', up:'tk', pend:'ta', open:'tb', closed:'tg'}[s], MTST.find(x => x[0] === s)[1]); };
const mtChip = m => `<button class="rf-ev mt-${mtSt(m)}" data-act="mtOpen" data-v="${m.id}" data-tt="${esc(m.ty)}, ${m.h}, ${plural(m.who.length, 'attendee', 'attendees')}"><b>${m.h} ${esc(m.ty.replace(' team meeting', '').replace(' follow up', ' follow up'))}</b><small>${MTST.find(x => x[0] === mtSt(m))[1]}${m.d < TODAY ? ', ' + (mtActs(m).length ? actsTxt(m) : 'no actions') : ''}</small></button>`;
function mtgPage5(app){ const id = S.f.mtd; if(id && mtOf(id) && mtSees(app, mtOf(id))) return mtDetail(app, mtOf(id));
  const v = S.f.mtv || 'list', xs = DB.mt.filter(m => mtSees(app, m));
  const head = oph('Meetings', app === 'dir' ? 'Monday and Thursday team meetings and the Tuesday directors’ meeting, grouped by where they stand, or on a calendar.' : 'Monday and Thursday team meetings, grouped by where they stand, or on a calendar. Money stays in the Tuesday directors’ meeting.', later('Fellow notes'))
    + `<div class="cstats">${MTST.map(([k, n]) => stat(k === 'pend' && xs.some(m => mtSt(m) === k) ? 'ta' : 'tk', n, xs.filter(m => mtSt(m) === k).length)).join('')}</div>`
    + `<div class="rf-bar">${seg('mtv', v, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}${v !== 'list' ? `${nx('mtNav', '-1', v === 'week' ? 'Previous week' : 'Previous month', 'sec')}${nx('mtNav', '0', 'Today', 'sec')}${nx('mtNav', '1', v === 'week' ? 'Next week' : 'Next month', 'sec')}` : ''}</div>`;
  if(v === 'list') return head + `<div class="rf-tw">` + th(cell('Date and time', '', 1.3) + cell('Meeting', '', 1.6) + cell('Attendees', '', 1.6) + cell('Status', '', 1.2) + cell('Action points', '', 1.3)) + MTST.map(([k, n]) => { const zs = xs.filter(m => mtSt(m) === k).sort((a, b) => ['today', 'up'].includes(k) ? (a.d + a.h < b.d + b.h ? -1 : 1) : (a.d + a.h > b.d + b.h ? -1 : 1)); return zs.length ? grpH(n, zs.length) + zs.map(m => rowO('mtOpen', m.id, cell(fmtDy(m.d), `${m.h}${m.d === TODAY ? ', today' : ''}`, 1.3) + tcell('mtOpen', m.id, m.ty, m.ty === 'Tuesday directors' ? 'Includes money' : 'No money', 1.6) + `<div class="mbc" style="flex:1.6">${avs(m.who)}<small>${plural(m.who.length, 'attendee', 'attendees')}</small></div><div class="mbc" style="flex:1.2"><b>${mtTag(m)}</b><small></small></div>` + cell(m.d >= TODAY && !mtActs(m).length ? '' : actsTxt(m), '', 1.3), S.hl === m.id)).join('') : ''; }).join('') + '</div>';
  const off = S.f.mto || 0;
  let cal;
  if(v === 'week'){ const mon = addDays(D0, off * 7), days = Array.from({length:5}, (_, i) => addDays(mon, i));
    cal = `<div class="rf-cal cw"><div class="rf-calh">Week of ${fmtDy(mon)}</div><div class="rf-wg">${days.map(d => { const es = xs.filter(m => m.d === d).sort((a, b) => a.h < b.h ? -1 : 1); return `<div data-date="${d}" class="rf-wd${d === TODAY ? ' today' : ''}"><div class="rf-wdh"><b>${DSH[fromIso(d).getDay()]} ${fromIso(d).getDate()}</b><small>${MSH[fromIso(d).getMonth()]}${d === TODAY ? ', today' : ''}</small></div>${es.map(mtChip).join('') || '<small class="rf-free">No meetings</small>'}</div>`; }).join('')}</div></div>`; }
  else { const base = fromIso(D0), first = new Date(base.getFullYear(), base.getMonth() + off, 1), y = first.getFullYear(), mo = first.getMonth(), start = addDays(iso(first), -((first.getDay() + 6) % 7)), rows = Math.ceil(((first.getDay() + 6) % 7 + new Date(y, mo + 1, 0).getDate()) / 7), cells = Array.from({length:rows * 7}, (_, i) => addDays(start, i));
    cal = `<div class="rf-cal cm"><div class="rf-calh">${MSH[mo]} ${y}</div><div class="rf-mg">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="rf-mdh">${d}</div>`).join('')}${cells.map(d => { const es = xs.filter(m => m.d === d), dt = fromIso(d); return `<div data-date="${d}" class="rf-md${dt.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' today' : ''}"><small>${dt.getDate()}</small>${es.map(mtChip).join('')}</div>`; }).join('')}</div></div>`; }
  const pend = xs.filter(m => mtSt(m) === 'pend'), nxt = xs.filter(m => m.d >= TODAY).sort((a, b) => a.d + a.h < b.d + b.h ? -1 : 1)[0];
  return head + `<div class="rf-calw">${cal}<aside class="rf-cals"><b>Next meeting</b>${nxt ? `<div class="rf-tb"><div><b>${nxt.ty}</b><small>${fmtDy(nxt.d)}, ${nxt.h}</small></div>${avs(nxt.who)}${nx('mtOpen', nxt.id, 'Open', 'sec')}</div>` : '<small class="rf-free">None scheduled.</small>'}<b style="margin-top:6px">Summary pending</b><small>${plural(pend.length, 'meeting needs', 'meetings need')} its notes processed</small>${pend.map(m => `<div class="rf-tb"><div><b>${m.ty}</b><small>${fmtDy(m.d)}, ${m.h}</small></div>${nx('mtOpen', m.id, 'Open', 'sec')}</div>`).join('') || '<small class="rf-free">All summaries are ready.</small>'}<div class="rf-leg">${MTST.map(([k, n]) => `<span><i class="rf-ev mt-${k}"></i>${n}</span>`).join('')}</div></aside></div>`; }
A.mtv = el => { S.f.mtv = el.dataset.v; S.f.mto = 0; S.f.mtd = null; render(); };
A.mtNav = el => { S.f.mto = el.dataset.v === '0' ? 0 : (S.f.mto || 0) + (+el.dataset.v); render(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/4dxRfJKKFGiffZGtY265iR'; } });
VERSIONS.push({v:'v3.5', date:TODAY, major:false, current:true, url:null, title:'Meetings by status, with a calendar', sum:'Meetings are grouped by status (today, upcoming, summary pending, actions open, closed) and have a week and month calendar.', steps:[
  {t:'Meetings by status and on a calendar', min:.5, dolor:'Before, meetings were split only into upcoming and past.', show:['Today, upcoming, summary pending, actions open and closed, each with its count.', 'Week and month calendar, with the next meeting and the summaries pending on the side.'], say:'You see which meetings still owe something.', go:() => { S.role = 'dir'; S.f.mtd = null; S.f.mtv = 'month'; go('dir', 'mtg'); }},
]});

/* =================== v3.6: completing a visit asks for its data; documents need a file and go through review =================== */
const HTYPES = ['Mid terrace', 'End terrace', 'Semi detached', 'Detached', 'Flat', 'BISF', 'No Fines', 'Airey'];
const EVREQ = ['Floor plan and measurements', 'Every elevation photographed'];
const DXT = {'Missing':'tk', 'In review':'tb', 'Changes requested':'ta', 'Approved':'tg'};
const syncDocs = p => { p.b.docs = docsOf(p).filter(n => p.b.dx[n].st === 'Approved'); };
DB.pr.forEach(p => { p.b.dx = {}; ADOCS.forEach(n => { const ok = p.b.docs.includes(n), on = p.b.on || p.phOn; p.b.dx[n] = ok ? {st:'Approved', v:[{f:`${n}, ${p.ad}.pdf`, by:p.b.who || 'afa', on}], cm:[{by:'ram', on, t:'', act:'Approved'}]} : {st:'Missing', v:[], cm:[]}; });
  p.b.evf = {}; p.b.evna = {}; p.b.ev.forEach(e => p.b.evf[e] = [`${e}, ${p.ad}.jpg`]);
  if(p.b.vis && p.b.on) p.b.visit = {on:p.b.on, h:p.b.h || '10:00', mins:95, acc:'Full access', occ:'Occupied', ht:p.ht || HTYPES[parseInt(p.id.slice(3)) % 5], epc:(p.b.mod || {}).pre || 'D', cons:true, notes:'', by:p.b.who || 'afa'}; });
(p => { const dx = p.b.dx; dx['Ventilation assessment'] = {st:'Changes requested', v:[{f:'Ventilation assessment, 7 Dane Road.pdf', by:'afa', on:dAt(-9)}], cm:[{by:'ram', on:dAt(-8), t:'The extractor fan locations are missing for the kitchen and bathroom. Add them to the plan and upload again.', act:'Changes requested'}]};
  dx['Pre EPC'] = {st:'In review', v:[{f:'Pre EPC, 7 Dane Road.pdf', by:'afa', on:dAt(-9)}, {f:'Pre EPC v2, 7 Dane Road.pdf', by:'afa', on:dAt(-1)}], cm:[{by:'ram', on:dAt(-7), t:'Wall type recorded as solid; the survey shows cavity. Correct and upload.', act:'Changes requested'}]}; syncDocs(p); })(prOf('PR-2008'));
(p => { p.b.dx['Floor plan'] = {st:'In review', v:[{f:'Floor plan, 14 Canterbury Street.pdf', by:'afa', on:dAt(-3)}], cm:[]}; p.b.dx['Condition report'] = {st:'In review', v:[{f:'Condition report, 14 Canterbury Street.pdf', by:'afa', on:dAt(-3)}], cm:[]}; syncDocs(p); })(prOf('PR-2001'));
function approvals(){ const xs = approvals0();
  DB.pr.forEach(p => docsOf(p).forEach(n => { const d = p.b.dx && p.b.dx[n]; if(d && d.st === 'In review'){ const v = d.v[d.v.length - 1]; xs.push({id:'dx' + p.id + n + d.v.length, k:'Assessment document review', role:'aap', p, t:`${n}, ${p.ad}`, d:`Version ${d.v.length}, ${v.f}, uploaded by ${PEO[v.by].n} on ${fmtDy(v.on)}.${d.cm.length ? ` Last comment: ${d.cm[d.cm.length - 1].t}` : ''}`, ok:'docOk', no:'docNo', ref:`${p.id}|${n}`}); } }));
  return xs; }

/* The review cycle: upload, in review, approved or changes requested, upload again */
IN.dxUp = t => { const [id, n] = t.dataset.k.split('|'), p = prOf(id), f = t.files && t.files[0]; if(!f) return; const d = p.b.dx[n]; d.v.push({f:f.name, by:ME(), on:TODAY}); d.st = 'In review'; syncDocs(p); his(p, `${n} uploaded, version ${d.v.length}`, ME()); auto(p, 'ret', `sent ${n} version ${d.v.length} to the Assessment approver for review`); };
A.docOk = el => { const [id, n] = el.dataset.v.split('|'), p = prOf(id), d = p.b.dx[n]; d.st = 'Approved'; d.cm.push({by:ME(), on:TODAY, t:'', act:'Approved'}); syncDocs(p); his(p, `${n} approved, version ${d.v.length}`, ME()); render(); if(p.b.docs.length === docsOf(p).length) auto(p, 'ret', 'marked the assessment documents complete: every document is approved'); else toast(`${esc(n)} approved. ${p.b.docs.length} of ${docsOf(p).length} documents approved.`); };
A.docNo = (el, why) => { const [id, n] = el.dataset.v.split('|'), p = prOf(id), d = p.b.dx[n]; d.st = 'Changes requested'; d.cm.push({by:ME(), on:TODAY, t:why || 'Changes requested', act:'Changes requested'}); syncDocs(p); his(p, `${n}: changes requested. ${why || ''}`, ME()); render(); toast('Sent back with your comment. A new version goes through review again.'); };
A.dxHist = el => { S.f.dxo = S.f.dxo === el.dataset.v ? null : el.dataset.v; render(); };
const canRev = () => ['aap', 'dir'].includes(S.role);
function docRow(app, p, n){ const d = p.b.dx[n], v = d.v[d.v.length - 1], last = d.cm[d.cm.length - 1], key = p.id + '|' + n, ed = ['ret', 'dir'].includes(app) && OPENP.includes(p.ph);
  const up = (lbl) => `<label class="btn ${d.st === 'Missing' ? 'pri' : 'sec'} sm el-up">${ico('upload', 13)}${lbl}<input type="file" data-in="dxUp" data-k="${key}"></label>`;
  const acts = !ed ? '' : d.st === 'Missing' ? up('Upload') : d.st === 'Changes requested' ? up('Upload new version') : d.st === 'In review' && canRev() ? nx('docOk', key, 'Approve') + `<button class="btn sec sm" data-act="apNo" data-v="docNo|${key}">Request changes</button>` : d.st === 'In review' ? '<small class="mini">With the Assessment approver</small>' : '';
  return `<div class="rf-dx${d.st === 'Approved' ? ' ok' : ''}"><div class="rf-dxm"><span class="rf-ck">${d.st === 'Approved' ? ico('check', 14, 2.6) : ''}</span><div><b>${n}</b><small>${v ? `v${d.v.length}, ${esc(v.f)}, ${PEO[v.by].n}, ${fmtDy(v.on)}` : 'A file is needed to complete it'}</small>${last && last.t ? `<small class="rf-cm">${PEO[last.by].n}: ${esc(last.t)}</small>` : ''}</div>${pill(DXT[d.st], d.st)}<div class="rf-dxa">${acts}${d.v.length ? `<button class="his52" data-act="dxHist" data-v="${key}" aria-pressed="${S.f.dxo === key}" title="${S.f.dxo === key ? 'Hide history' : 'History'}" aria-label="${S.f.dxo === key ? 'Hide history' : 'History'} of ${esc(n)}">${ico('history', 17, 2)}</button>` : ''}</div></div>`
    + (S.f.dxo === key ? `<div class="rf-dxh">${[...d.v.map((x, i) => [x.on, `Version ${i + 1} uploaded: ${x.f}`, x.by, 'up']), ...d.cm.map(c => [c.on, c.act + (c.t ? `: ${c.t}` : ''), c.by, c.act === 'Approved' ? 'ok' : 'ch'])].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([on, t, by, k]) => `<div class="rf-hx ${k}"><i></i><div><b>${esc(t)}</b><small>${fmtDy(on)}, ${PEO[by].n}</small></div></div>`).join('')}</div>` : '') + '</div>'; }
function retTab(app, p){ const ed = app === 'ret' && OPENP.includes(p.ph), vs = p.b.visit;
  const st = ([k, n, r, ap]) => { const done = k === 'bk' ? p.b.bk : k === 'vis' ? p.b.vis : k === 'rev' ? p.b.rev === 'Approved' : k === 'docs' ? p.b.docs.length === docsOf(p).length : k === 'mod' ? !!p.b.mod : k === 'dsg' ? p.ms.every(x => x.dsg) : k === 'drev' ? p.ms.every(x => x.dap) : p.b.ts;
    const btn = !ed || done ? '' : k === 'bk' ? nx('bBook', p.id, 'Book') : k === 'vis' ? nx('bVis', p.id, p.b.revisits ? 'Complete revisit' : 'Complete visit') : ['mod', 'dsg', 'ts'].includes(k) ? nx('bStep', `${p.id}|${k}`, 'Mark done') : k === 'docs' ? `<small class="mini">${p.b.docs.length} of ${docsOf(p).length} approved</small>` : k === 'rev' && p.b.rev === 'Pending' ? '<small class="mini">In My approvals</small>' : k === 'drev' && p.ms.every(x => x.dsg) ? '<small class="mini">In My approvals</small>' : '';
    return `<div class="rf-dl${done ? ' ok' : ''}"><span class="rf-ck">${done ? ico('check', 14, 2.6) : ''}</span><div><b>${n}${ap ? ' <em class="rf-ap">approval</em>' : ''}</b><small>${RN(r)}: ${RP(r)}${k === 'vis' && p.b.revisits ? `, revisits ${p.b.revisits}` : ''}${k === 'mod' && p.b.mod ? `, ${p.b.mod.pre} to ${p.b.mod.post}` : ''}${k === 'docs' ? `, ${p.b.docs.length} of ${docsOf(p).length} approved` : ''}</small></div>${btn}</div>`; };
  return `<div class="rf-cols"><div><small class="rf-ph">Phase B steps</small>${BSTEPS.map(st).join('')}${vs ? `<small class="rf-ph" style="margin-top:14px">The visit</small>${kv([['On site', `${fmtDy(vs.on)}, ${vs.h}`, `${vs.mins} minutes, ${PEO[vs.by].n}`], ['Access', vs.acc, vs.occ], ['House type', vs.ht, `pre EPC ${vs.epc}`]])}${vs.notes ? `<p class="hint">${esc(vs.notes)}</p>` : ''}` : ''}</div>`
    + `<div><small class="rf-ph">RdSAP evidence</small>${evOf(p).map(e => { const fs = p.b.evf[e] || [], na = p.b.evna[e]; return `<div class="rf-dl${fs.length || na ? ' ok' : ''}"><span class="rf-ck">${fs.length || na ? ico('check', 14, 2.6) : ''}</span><div><b>${e}</b><small>${na ? `Not applicable: ${esc(na)}` : fs.length ? plural(fs.length, 'file', 'files') + ', ' + esc(fs[0]) : 'Uploaded when the visit is completed'}</small></div></div>`; }).join('')}</div></div>`
    + `<section class="rsec" style="margin-top:14px"><div class="rs-h"><h3>Assessment documents</h3><p>Each one needs its file, then the Assessment approver approves it or requests changes. A new version goes through review again.</p></div>${docsOf(p).map(n => docRow(app, p, n)).join('')}</section>`; }

/* Completing the visit: what happened on site, and the evidence */
const visDo = A.bVis;
A.bVis = el => { const p = prOf(el.dataset.v), i = parseInt(p.id.slice(3)); S.modal = {k:'vis', id:p.id, on:p.b.on && p.b.on <= TODAY ? p.b.on : TODAY, h:p.b.h || '', mins:'', acc:'', occ:'', ht:p.ht || '', epc:'', cons:false, notes:'', evf:{...p.b.evf}, na:{...p.b.evna}}; renderLayer(); };
MODALS.vis = m => { const p = prOf(m.id), noacc = m.acc === 'No access', evOk = evOf(p).every(e => (m.evf[e] || []).length || (m.na[e] !== undefined && (m.na[e] || '').trim())), ok = m.on && (m.h || '').trim() && numIn(m.mins) > 0 && m.acc && (noacc || (m.occ && m.ht && m.epc && m.cons && evOk));
  const evRow = e => { const fs = m.evf[e] || [], isNa = m.na[e] !== undefined, req = EVREQ.includes(e); return `<div class="rf-evr${fs.length || (isNa && (m.na[e] || '').trim()) ? ' ok' : ''}"><div class="rf-evh"><b>${e}${req ? ' <em class="req">required</em>' : ''}</b><small>${isNa ? 'Not applicable' : fs.length ? fs.map(esc).join(', ') : 'Photos or file'}</small></div>${isNa ? '' : `<label class="btn sec sm el-up">${ico('camera', 13)}${fs.length ? 'Add more' : 'Upload'}<input type="file" multiple data-in="visEv" data-k="${e}"></label>`}${req ? '' : `<button type="button" class="btn sec sm" data-act="visNa" data-v="${e}">${isNa ? 'It applies' : 'Not applicable'}</button>`}${isNa ? `<input class="um-in rf-nar" data-in="visNar" data-k="${e}" value="${esc(m.na[e] || '')}" placeholder="Why it does not apply, e.g. flat with no loft">` : ''}</div>`; };
  return modal(p.b.revisits ? 'Complete the revisit' : 'Complete the assessment visit', `${esc(p.ad)}, ${scOf(p.sc).n}, ${p.ref}. ${PEO[p.b.who || 'afa'].n}.`,
    `<div class="rf-2">${fld('Visit date', 'm', 'on', m.on, {type:'date', req:true})}${fld('Arrival time', 'm', 'h', m.h, {req:true, ph:'09:30'})}${fld('Minutes on site', 'm', 'mins', m.mins, {type:'number', req:true, ph:'90'})}</div>`
    + mlab('Access', true) + mseg('acc', m.acc, ['Full access', 'Partial access', 'No access'])
    + (noacc ? hint('No access: the visit is recorded and the job goes back to To book for a new date.') + area('What happened', 'm', 'notes', m.notes, 'e.g. Customer not at home, card left')
      : mlab('Occupancy', true) + mseg('occ', m.occ, ['Occupied', 'Vacant']) + mlab('House type', true) + mseg('ht', m.ht, HTYPES) + mlab('Current rating (pre EPC estimate)', true) + mseg('epc', m.epc, ['A', 'B', 'C', 'D', 'E', 'F', 'G'])
        + `<button type="button" class="rf-cons${m.cons ? ' on' : ''}" data-act="mset" data-k="cons" data-v="${m.cons ? '' : '1'}"><span class="rf-ck">${m.cons ? ico('check', 14, 2.6) : ''}</span>Customer consent recorded <em class="req">required</em></button>`
        + mlab('RdSAP evidence', true) + `<div class="rf-evl">${evOf(p).map(evRow).join('')}</div>` + area('Notes for the approver', 'm', 'notes', m.notes, 'Anything the Assessment approver should know')),
    mfoot(noacc ? 'Record no access' : 'Complete and send for review', 'visOk', !!ok), 720); };
IN.visEv = t => { const e = t.dataset.k, fs = [...(t.files || [])].map(f => f.name); if(!fs.length) return; S.modal.evf[e] = [...(S.modal.evf[e] || []), ...fs]; renderLayer(); };
A.visNa = el => { const e = el.dataset.v; if(S.modal.na[e] !== undefined) delete S.modal.na[e]; else S.modal.na[e] = ''; renderLayer(); };
IN.visNar = t => { S.modal.na[t.dataset.k] = t.value; patchLayer(); };
A.visOk = () => { const m = S.modal, p = prOf(m.id), vs = {on:m.on, h:m.h.trim(), mins:Math.round(numIn(m.mins)), acc:m.acc, occ:m.occ, ht:m.ht, epc:m.epc, cons:!!m.cons, notes:(m.notes || '').trim(), by:p.b.who || ME()};
  if(m.acc === 'No access'){ p.b.bk = false; p.b.noacc = (p.b.noacc || 0) + 1; his(p, `No access on ${fmtDy(m.on)} at ${vs.h}. ${vs.notes}`, vs.by); S.modal = null; auto(p, 'ret', 'put the job back in To book and notified the Survey admin to rebook it'); return; }
  p.b.visit = vs; p.b.evf = m.evf; p.b.evna = m.na; p.b.ev = evOf(p).filter(e => (m.evf[e] || []).length || m.na[e]); if(!p.ht && ['BISF', 'No Fines', 'Airey'].includes(m.ht)) p.ht = m.ht;
  his(p, `Visit completed ${fmtDy(m.on)}, ${vs.mins} minutes, ${vs.acc.toLowerCase()}, ${vs.ht}, pre EPC ${vs.epc}`, vs.by); S.modal = null; visDo({dataset:{v:p.id}}); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/W752wpGSSS47RvxSC3Zq9Z'; } });
VERSIONS.push({v:'v3.6', date:TODAY, major:false, current:true, url:null, title:'Visit details, documents with files and a review cycle', sum:'Completing an assessment visit asks for what happened on site and the RdSAP evidence; assessment documents need their file and go through review, with changes requested and new versions.', steps:[
  {t:'Completing a visit', min:.5, dolor:'Before, a visit was marked done with one click.', show:['Date, arrival, time on site, access, occupancy, house type, pre EPC estimate and consent.', 'The RdSAP evidence uploaded item by item, or marked not applicable with a reason.', 'No access sends the job back to To book.'], say:'The approver gets everything from the visit.', go:() => { S.role = 'ass'; go('ret', 'bk'); }},
  {t:'Documents with a review cycle', min:.5, dolor:'Before, documents were ticked as done.', show:['Each document needs its file; the Assessment approver approves or requests changes.', '7 Dane Road: ventilation assessment sent back, pre EPC version 2 in review, with the history.'], say:'Nothing counts as done until it is approved.', go:() => { S.role = 'aap'; abrir('ret', 'PR-2008', 'ret'); }},
]});

/* =================== v3.7: schedule a meeting, and write its summary afterwards =================== */
const MTYPES = app => app === 'dir' ? ['Monday team meeting', 'Thursday follow up', 'Tuesday directors', 'Other meeting'] : ['Monday team meeting', 'Thursday follow up', 'Other meeting'];
const MDEF = {'Monday team meeting':['yah', 'dre', 'sar', 'afa', 'xen', 'ram', 'ahm', 'lan', 'tom', 'akr', 'hse'], 'Thursday follow up':['dre', 'sar', 'ram', 'ahm', 'lan', 'tom'], 'Tuesday directors':['yah', 'tom', 'lan'], 'Other meeting':[]};
A.mtNew = () => { S.modal = {k:'mt7', ty:'', name:'', d:'', h:'', who:[ME()], ag:''}; renderLayer(); };
MODALS.mt7 = m => { const ok = m.ty && (m.ty !== 'Other meeting' || (m.name || '').trim()) && m.d && (m.h || '').trim() && m.who.length;
  return modal('Schedule a meeting', 'It appears in Meetings for everyone invited, with its summary, decisions and action points after it happens.', mlab('Meeting', true) + mseg('ty', m.ty, MTYPES(S.view)) + (m.ty === 'Other meeting' ? fld('Name', 'm', 'name', m.name, {req:true, ph:'e.g. Waverley kick-off with the council'}) : '') + `<div class="rf-2">${fld('Date', 'm', 'd', m.d, {type:'date', req:true})}${fld('Time', 'm', 'h', m.h, {req:true, ph:'10:00'})}</div>`
    + mlab('Attendees', true) + `<div class="rf-ppl">${Object.entries(PEO).filter(([k]) => k !== 'kel' && (S.view === 'dir' || m.ty !== 'Tuesday directors')).map(([k, p]) => `<button type="button" class="rf-pp${m.who.includes(k) ? ' on' : ''}" data-act="mtWho" data-v="${k}">${av(k, 22)}<span><b>${p.n}</b><small>${p.r}</small></span></button>`).join('')}</div>` + area('Agenda', 'm', 'ag', m.ag, 'Optional: what the meeting will cover'), mfoot('Schedule', 'mtOk7', !!ok), 680); };
A.mtWho = el => { const k = el.dataset.v, w = S.modal.who; S.modal.who = w.includes(k) ? w.filter(x => x !== k) : [...w, k]; renderLayer(); };
const oMset = A.mset; A.mset = el => { oMset(el); if(S.modal && S.modal.k === 'mt7' && el.dataset.k === 'ty' && MDEF[S.modal.ty] && MDEF[S.modal.ty].length){ S.modal.who = [...MDEF[S.modal.ty]]; renderLayer(); } };
A.mtOk7 = () => { const m = S.modal, id = 'MT-' + (500 + DB.mt.length + 1); DB.mt.push({id, ty:m.ty === 'Other meeting' ? m.name.trim() : m.ty, d:m.d, h:m.h.trim(), who:m.who, ready:false, sum:'', dec:[], ag:(m.ag || '').trim()}); S.modal = null; S.f.mtd = id; render(true); toast(`<b>Automation:</b> The system sent the invitation to ${plural(m.who.length, 'attendee', 'attendees')}.`); };
A.sumNew = el => { const m = mtOf(el.dataset.v); S.modal = {k:'sm7', id:m.id, sum:m.sum || '', dec:(m.dec || []).join('\n')}; renderLayer(); };
MODALS.sm7 = m => modal('Write the summary', `${mtOf(m.id).ty}, ${fmtDy(mtOf(m.id).d)}. Action points are added below the summary, each creating its task.`, area('Summary', 'm', 'sum', m.sum, 'What was discussed', true) + area('Decisions', 'm', 'dec', m.dec, 'One decision per line'), mfoot('Save summary', 'smOk7', !!(m.sum || '').trim()), 640);
A.smOk7 = () => { const m = S.modal, mt = mtOf(m.id); mt.sum = m.sum.trim(); mt.dec = (m.dec || '').split('\n').map(x => x.trim()).filter(Boolean); mt.ready = true; S.modal = null; render(); toast('Summary saved. The meeting moves out of Summary pending.'); };
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].pages.mtg; VIEWS[a].pages.mtg = () => { const mt = S.f.mtd && mtOf(S.f.mtd), h = o();
  if(!mt) return h.replace('Fellow notes: Later</span>', `Fellow notes: Later</span><button class="btn pri" data-act="mtNew">${ico('plus', 15)}Schedule a meeting</button>`);
  return h.replace('Pending: the notes are still being processed.', `Pending: the notes are still being processed.</div><div style="margin-top:10px">${nx('sumNew', mt.id, 'Write the summary')}`).replace('Scheduled. The summary and decisions appear here after the meeting.', `Scheduled. The summary and decisions appear here after the meeting.${mt.ag ? `</div><p class="rf-sum" style="margin-top:8px"><b>Agenda:</b> ${esc(mt.ag)}</p><div>` : ''}`); }; });
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/KJTBtn2mdr2BmT5eKcozED'; } });
VERSIONS.push({v:'v3.7', date:TODAY, major:false, current:true, url:null, title:'Schedule meetings and write their summary', sum:'Every app can schedule a meeting with its attendees and agenda; Director can also schedule the Tuesday directors’ meeting. Past meetings get their summary and decisions written in the app.', steps:[
  {t:'Schedule a meeting', min:.5, dolor:'Before, meetings could not be created.', show:['Schedule a meeting: type, date, time, attendees and agenda.', 'Director can also schedule the Tuesday directors’ meeting.', 'Write the summary and decisions of a pending meeting.'], say:'Meetings live in the system from the invitation to the last action point.', go:() => { S.role = 'dir'; S.f.mtd = null; S.f.mtv = 'list'; go('dir', 'mtg'); }},
]});

/* =================== v3.8: Approvals and Alerts in Director; every alert ends in a decision =================== */
S.dis = {};
function alerts(){ const xs = alerts0().map(a => ({...a, app:a.app === 'pur' ? 'acc' : a.app})).filter(a => !(a.app === 'dir' && a.k === 'Approval above the limit') && !S.dis[a.id]);
  HSD.filter(h => dDiff(h.exp) < 30).forEach(h => xs.push({id:'hs' + h.n + h.exp, app:'del', tone:'ta', k:'Expiring', t:h.n, d:`Expires ${fmtD(h.exp)}. HSSE lead to renew.`, fix:['Open health and safety', 'gogo', 'del:hs']}));
  return xs; }
const alProp = a => { const m = (a.t || '').match(/PR-\d+/); return m ? prOf(m[0]) : null; };
/* What is happening, what blocks it, and who should act */
function alWhy(a){ const p = alProp(a); if(!p) return null; const sc = scOf(p.sc);
  if(a.k === 'Margin below target'){ const m = pMoney(p), lows = p.ms.map(x => [x, mMoney(p, x)]).sort((x, y) => x[1].mgp - y[1].mgp), w = lows[0];
    return {p, what:`Forecast margin ${pc(m.mgp)} against ${sc.n}’s ${sc.set.mg}% target: ${fm(m.q)} quoted, ${fm(m.fc)} forecast cost.`, block:[`${MEAS[w[0].m].n}: forecast ${fm(w[1].fc)} against a budget of ${fm(w[1].b)}${w[1].over ? ', over budget' : ''}`, ...vaOf(p.id).filter(v => v.st !== 'Rejected').map(v => `${v.ty} ${v.id}: ${v.why}, ${fm(v.amt)}, ${v.st.toLowerCase()}`), ...ordOf(p.id).filter(o => o.ct === 'Other' && o.st !== 'Rejected').map(o => `${o.id} ${o.sup}: ${fm(oAl(o, p.id))} not in the original budget`)],
      ask:['Ask Commercial to review', ROLES.com[1], `Review the margin on ${p.ad}`, `The forecast margin on ${p.ad} is ${pc(m.mgp)} against our ${sc.set.mg}% target. Please review the costs and the open variation and come back with options: recover it through the variation, cut cost, or accept it.`], tab:'mon'}; }
  if(a.k === 'Over time'){ const g = phGate(p), inv = DB.inv.find(v => v.pr === p.id && !v.paid), pay = inv && g.miss.includes('Payment received'), hold = p.hold || p.hold2, role = pay ? 'acc' : PHOWN[p.ph];
    const block = g.miss.map(x => x === 'Payment received' && inv ? `Payment received: ${inv.id}, ${fm(inv.amt)}, ${dDiff(inv.due) < 0 ? `${-dDiff(inv.due)} days overdue` : `due ${fmtDy(inv.due)}`} with ${sc.cl}` : x).concat(hold ? [hold] : []);
    return {p, what:`${daysIn(p)} days in ${p.ph}, against a limit of ${LIMIT[p.ph]}. Owner of the phase: ${RN(PHOWN[p.ph])}, ${RP(PHOWN[p.ph])}.`, block,
      ask:[pay ? 'Ask Accounts to chase the payment' : `Ask ${RP(role)} for an update`, ROLES[role][1], pay ? `Chase ${inv.id} with ${sc.cl}` : `Unblock ${p.ad}`, pay ? `${inv.id} for ${p.ad} is ${-dDiff(inv.due)} days overdue with ${sc.cl}. Please chase it this week and tell me the date they commit to pay.` : `${p.ad} has been ${daysIn(p)} days in ${p.ph}. What is blocking it, and what do you need to move it this week?`], tab:pay ? 'res' : 'res'}; }
  return null; }
function alertsPage(){ const xs = pend('dir'), done = Object.entries(S.dis);
  return oph('Alerts', 'Things that are going wrong and need a decision from you: margins below target and jobs over their time limit. Approvals are in Approvals.') + (xs.length ? xs.map(a => { const w = alWhy(a);
    return `<div class="ds-exc c-${a.tone} rf-al2${S.hl === a.id ? ' hl2' : ''}" data-hl="${a.id}"><div class="ds-exh">${pill(a.tone, a.k)}<b>${esc(a.t)}</b><span>${w ? scOf(w.p.sc).n : ''}</span></div><p>${esc(w ? w.what : a.d)}</p>${w && w.block.length ? `<div class="rf-blk"><small class="rf-ph">What is blocking it</small>${w.block.map(b => `<div>${ico('alert', 13)}<span>${esc(b)}</span></div>`).join('')}</div>` : ''}<div class="ds-exb">${w ? `<button class="btn pri sm" data-act="postAsk" data-v="${a.id}">${ico('send', 13)}${w.ask[0]}</button><button class="btn sec sm" data-act="postOpen" data-v="${w.p.id}">Post an update</button>` : ''}<button class="btn sec sm" data-act="alAccept" data-v="${a.id}">Accept, with a reason</button>${w ? `<button class="btn sec sm" data-act="prOpen" data-v="${w.p.id}|${w.tab}">Open the property</button>` : `<button class="btn sec sm" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button>`}</div></div>`; }).join('') : empty('Nothing needs a decision right now.'))
    + (done.length ? grpH('Accepted', done.length) + done.map(([id, x]) => rdiv(cell(esc(x.t), `${x.k}: ${esc(x.why)}`, 3) + cell(fmtDy(x.on), PEO[x.by].n))).join('') : ''); }
A.alAccept = el => { const a = alerts().find(x => x.id === el.dataset.v); S.modal = {k:'acc8', id:a.id, t:a.t, kk:a.k, why:''}; renderLayer(); };
MODALS.acc8 = m => modal('Accept the alert', `${esc(m.t)}: ${m.kk}. It leaves Alerts and your reason goes on the property’s history.`, area('Why you accept it', 'm', 'why', m.why, 'e.g. Margin recovered through the variation once Kanopi approves it', true), mfoot('Accept', 'accOk8', !!(m.why || '').trim()), 560);
A.accOk8 = () => { const m = S.modal; S.dis[m.id] = {t:m.t, k:m.kk, why:m.why.trim(), by:ME(), on:TODAY}; const p = prOf((m.t.match(/PR-\d+/) || [])[0]); if(p) his(p, `${PEO[ME()].n} accepted the alert “${m.kk}”: ${m.why.trim()}`, ME()); S.modal = null; render(); toast('Accepted. It moves to the Accepted list.'); };

/* Updates: a thread on every property; a post can create the task for the person who must act */
A.postAsk = el => { const a = alerts().find(x => x.id === el.dataset.v), w = alWhy(a); S.modal = {k:'post8', pr:w.p.id, to:[w.ask[1]], tt:w.ask[2], t:w.ask[3], task:true, d:addDays(TODAY, 4), from:a.k}; renderLayer(); };
A.postOpen = el => { const p = prOf(el.dataset.v); S.modal = {k:'post8', pr:p.id, to:[ROLES[PHOWN[p.ph]] ? ROLES[PHOWN[p.ph]][1] : 'dre'], tt:'', t:'', task:false, d:addDays(TODAY, 4), from:''}; renderLayer(); };
MODALS.post8 = m => { const p = prOf(m.pr), ok = (m.t || '').trim() && m.to.length && (!m.task || ((m.tt || '').trim() && m.d));
  return modal('Post an update', `${esc(p.ad)}, ${p.id}. Everyone mentioned is notified; the post stays in the property’s Updates.`, mlab('To', true) + `<div class="rf-ppl">${Object.entries(PEO).filter(([k]) => k !== 'kel' && k !== ME()).map(([k, x]) => `<button type="button" class="rf-pp${m.to.includes(k) ? ' on' : ''}" data-act="postTo" data-v="${k}">${av(k, 22)}<span><b>${x.n}</b><small>${x.r}</small></span></button>`).join('')}</div>` + area('Message', 'm', 't', m.t, 'What you need, and by when', true)
    + `<button type="button" class="rf-cons${m.task ? ' on' : ''}" data-act="mset" data-k="task" data-v="${m.task ? '' : '1'}"><span class="rf-ck">${m.task ? ico('check', 14, 2.6) : ''}</span>Also create a task for ${m.to.length ? PEO[m.to[0]].n : 'the first person'}</button>` + (m.task ? `<div class="rf-2">${fld('Task', 'm', 'tt', m.tt, {req:true, ph:'e.g. Chase the invoice'})}${fld('Due date', 'm', 'd', m.d, {type:'date', req:true})}</div>` : ''), mfoot('Post', 'postOk', !!ok), 680); };
A.postTo = el => { const k = el.dataset.v, w = S.modal.to; S.modal.to = w.includes(k) ? w.filter(x => x !== k) : [...w, k]; renderLayer(); };
A.postOk = () => { const m = S.modal, p = prOf(m.pr), post = {id:'UP-' + Date.now(), by:ME(), on:TODAY, t:m.t.trim(), to:[...m.to], tk:null, from:m.from};
  if(m.task){ const k = {id:'TK-' + (++DB.seq.tk), t:m.tt.trim(), desc:m.t.trim(), who:m.to[0], r:roleOfP(m.to[0]), due:m.d, src:'Job', pr:p.id, done:false, doneOn:null}; DB.tk.push(k); post.tk = k.id; }
  p.th = p.th || []; p.th.push(post); his(p, `${PEO[ME()].n} posted an update to ${m.to.map(k => PEO[k].n).join(', ')}`, ME()); S.modal = null;
  auto(p, S.view, `notified ${m.to.map(k => PEO[k].n).join(', ')}${post.tk ? ` and added the task to ${PEO[m.to[0]].n}’s My tasks` : ''}`); };
function updTab(app, p){ const th = (p.th || []).slice().reverse();
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap"><p class="hint" style="margin:0">Posts about this property between the teams. A post can create the task for the person who must act.</p>${nx('postOpen', p.id, 'Post an update')}</div>`
    + (th.length ? th.map(u => { const k = u.tk && DB.tk.find(x => x.id === u.tk); return `<div class="rf-post">${av(u.by, 30)}<div><div class="rf-ph2"><b>${PEO[u.by].n}</b><small>${PEO[u.by].r}, ${fmtDy(u.on)}${u.from ? `, about ${u.from.toLowerCase()}` : ''}</small></div><p>${esc(u.t)}</p><div class="rf-pt">${u.to.map(x => `<span>@${PEO[x].n}</span>`).join('')}${k ? `<button class="rf-chipb" data-act="tkView" data-v="${k.id}">Task: ${esc(k.t)}, ${k.done ? 'done' : 'due ' + fmtDy(k.due)}</button>` : ''}</div></div></div>`; }).join('') : empty('No updates yet.')); }
Object.keys(ATABS).forEach(a => { const t = ATABS[a]; if(!t.some(x => x[0] === 'upd')) t.splice(t.length - 1, 0, ['upd', 'Updates']); });
function prFicha(app, p){ const tabs = (ATABS[app] || ATABS.dir).map(x => x[0] === 'upd' && (p.th || []).length ? ['upd', `Updates (${p.th.length})`] : x), t = tabOf(tabs), sc = scOf(p.sc);
  let body = {res:prSum, mea:meaTab, ret:retTab, ins:insTab, clo:cloTab, mon:monTab, inv:invTab, upd:updTab, his:(a, x) => hisList(x.his)}[t](app, p);
  if(!canMoney(app) && ['res', 'mea'].includes(t)) body += lockCard();
  const g = phGate(p), canMove = (app === 'ret' && ['A. Job received', 'B. Assess and design'].includes(p.ph)) || (app === 'del' && ['D. Prepare to install', 'E. Install'].includes(p.ph));
  const acts = (canMove ? `<button class="btn ${g.ok ? 'pri' : 'sec'}" data-act="phNext" data-v="${p.id}" ${g.ok ? '' : 'disabled title="' + esc(g.miss.join('; ')) + '"'}>${ico(g.ok ? 'send' : 'lock', 15)}Move to ${PH[pIdx(p.ph) + 1].slice(3).toLowerCase()}</button>` : '') + `<button class="btn sec" data-act="postOpen" data-v="${p.id}">Post an update</button>` + (OPENP.includes(p.ph) && ['del', 'ret', 'com', 'dir'].includes(app) ? `<button class="btn sec" data-act="cnOpen" data-v="${p.id}">Cancel job</button>` : '');
  return crumb('fichaback', 'Back', esc(p.ad)) + sameNote(app, p) + oph(esc(p.ad), `${p.id}, ${p.pc}, ${sc.n}. Customer ${esc(p.res)}. Client reference ${p.ref}${p.ht ? `, ${p.ht} house` : ''}.`, acts) + `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:-6px 0 14px">${phTag(p)}${mTags(p)}${lateTag(p)}${p.ph === 'D. Prepare to install' && ready(p) ? pill('tg', 'Ready to install') : ''}</div>` + tabsBar(tabs) + body; }
/* Director: Alerts and Approvals */
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => o().replace('Needs your decision<', 'Alerts<').replace('My approvals<', 'Approvals<');
  VIEWS.dir.pages.dec = alertsPage; const ow = VIEWS.dir.pages.wait; VIEWS.dir.pages.wait = () => ow().replace('Waiting for my approval', 'Approvals'); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/4J1JiWkFjezDt6mneENwZh'; } });
VERSIONS.push({v:'v3.8', date:TODAY, major:false, current:true, url:null, title:'Director: Alerts and Approvals, and every alert ends in a decision', sum:'Director separates Approvals from Alerts. Each alert explains what is happening, what blocks it and who should act, and lets the director ask that person, post an update or accept it with a reason. Every property has an Updates thread.', steps:[
  {t:'Alerts that end in a decision', min:1, dolor:'Before, an alert led to a page with nothing to decide.', show:['2 Saxton Street: 22 days in close out because invoice INV-3302 is overdue with Medway Council.', 'Ask Accounts to chase the payment: the post creates Lana’s task.', 'Or accept the alert with a reason, kept on the property’s history.'], say:'Every alert ends in a decision or an instruction.', go:() => { S.role = 'dir'; go('dir', 'dec'); }},
]});

/* =================== v3.9: site forms, every item is completed with its information =================== */
const SITEP = [['akr', 'Akram, site manager'], ['sub:Redbridge Render Co', 'Redbridge Render Co'], ['sub:Medway Electrical Ltd', 'Medway Electrical Ltd'], ['sub:Kent Scaffold Hire', 'Kent Scaffold Hire'], ['sub:Insulation Supplies Direct', 'Insulation Supplies Direct fitters']];
const sfItems = p => tyOf(p) === 'Redbridge' ? RGROUPS.filter(([k]) => p.g[k] !== 'Not applicable').map(([k, n, , hp]) => ({key:'g:' + k, n, hp, st:p.g[k] === 'Complete' ? 'Completed' : ['In progress', 'Waiting on decision', 'Blocked'].includes(p.g[k]) ? p.g[k] : 'Not started'}))
  : p.ms.map(x => ({key:'m:' + x.m, n:MEAS[x.m].n, hp:'', st:x.ip >= 100 ? 'Completed' : x.ip > 0 ? 'In progress' : 'Not started'}));
const SFT = {'Not started':'tk', 'In progress':'tb', 'Completed':'tg', 'Waiting on decision':'ta', 'Blocked':'tred'};
function frmPage(){ const xs = DB.pr.filter(x => x.ph === 'E. Install'), p = prOf(S.f.mp && xs.some(x => x.id === S.f.mp) ? S.f.mp : xs[0].id), it = S.f.sfi && sfItems(p).find(i => i.key === S.f.sfi), rec = p.sfr || {};
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
const sfMissing = (it, m) => { const x = []; if(!m.st) x.push('status'); if(!m.on || !(m.h || '').trim()) x.push('date and time'); if(!m.who) x.push('who did it'); if(m.st === 'Completed'){ if(!m.ph.length) x.push('photos'); if(!m.qc) x.push('quality check'); if(it.hp && (!m.ins || !m.res)) x.push('inspection'); } if(m.res === 'Fail' && !(m.notes || '').trim()) x.push('what failed'); return x.length ? 'Missing: ' + x.join(', ') : ''; };
const sfValid = (it, m) => !sfMissing(it, m);
A.sfOpen = el => { const p = prOf(S.f.mp || DB.pr.find(x => x.ph === 'E. Install').id), r = (p.sfr || {})[el.dataset.v]; S.f.sfi = el.dataset.v; S.f.sff = {st:'', on:TODAY, h:'', who:r ? r.who : 'akr', ph:[], ins:'', res:'', qc:false, notes:''}; render(); };
A.sfBack = () => { S.f.sfi = null; S.f.sff = null; render(); };
A.mp = el => { S.f.mp = el.dataset.v; S.f.sfi = null; S.f.sff = null; render(); };
IN.sf = t => { const k = t.dataset.k; S.f.sff[{sfwho:'who', sfins:'ins'}[k] || k] = t.value; if(t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'hidden')) refocus(render); else render(); };
IN.sfPh = t => { const fs = [...(t.files || [])].map(f => `${f.name}, ${fmtDy(S.f.sff.on || TODAY)} ${S.f.sff.h || '10:42'}, 51.59 N 0.08 E`); S.f.sff.ph.push(...fs); render(); };
A.sfQc = () => { S.f.sff.qc = !S.f.sff.qc; render(); };
const oMset2 = A.mset; A.mset = el => { if(S.f.sff && !S.modal && ['st', 'res'].includes(el.dataset.k)){ S.f.sff[el.dataset.k] = el.dataset.v; render(); return; } oMset2(el); };
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

const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG8AAAAoCAYAAADwmKS0AAAL3ElEQVR4nO2bf4xcV3XHP+e+N29md2adEHAgSSGhkSrhCJRCEdAUKYLwo6JtqMAbBdyW8FORoISiNI297uwIHH7zB0igWkHFtGDwIkhozI/UpQEh8TOKkOxQBAqQmNjGDq69szs/3rv39I97n3dmPT/e2N6khv1Kd2f2zX3nnnPPveece857UmPbvSAvBiyoUAwKLIE5COwH8x9NuAsaGdQNNJzvtjmCBVtj+zUQ3QPZBkBCKzqOQmkJOn/T5I674V9K8LZ0hq0vVJI9kG4EXEF6vXCQCGSfaPKef6xSv1iwe4HngKZh3MiRfXKZ9767X65B2BzBgpth+wuVaAGyi0D1DPgaA1GQSHF7Y4hftiJ70TkFkCqYiwXzXHB/W4MfKdtuW6LxzRVBNwWC7jlC5UIlzUDiSQYBtUI848ieD9wNj0ZA6jAvMlSerqQWTDQBzQAFLMDfV7n9IwoicDWYGFyS9xHkbdNs/fAyjUPjFYgq+k4huUxJHRgzOV9FIAhcbyDLwLnJmio4hdQpXaukTjB/Yij95zTbX+EFrPcwLunwVagK6oY3HDgr0F4lQApZ2Jnh41RzWkAGBzYVyokQvWGZxmFF7xJKCpr5MbLMUK4KcmMYdIgy6gYW7DT1pwGvVFqKX3g5PxPOb5FGywhJDCVTvMUmMOZADBCBGKWTKRiDfupJ3HYBNBQOhZ2nw0ylQiSjx4sSoRwpbrr/Vid+swyCGUPzlCylQONmz6PZ6enmShLxu1O3eAXN2yFyGP/HvVqoXADOrvCmCtEE81u0yUysdD8P0YsgG76w+plMQJ7qJ7StK0xKDGkmTF2WIjcAO+GSCEhHkBPFPQb2N2FSBu5OR2vJwD3+v9+O8iPqFWe7oIe8QmRUf6ekRmAfwBJH7qvylJ8IybMgdd63pCrEV8/gXrCIfA/2GJi1p7EIKG6L+K+54oBYFHtccCcH86MCMsDsq4KsHidcj0Xhm3GTHTfCnoI+40B0AUynuCsN6duF5A1KV/t3gKriXgHshIuGmUoHJaPYh5TommUaR/IfBvRdJfBFAwTK7xVATwrm5Ys8+0ewz8B1BYKZWQtRDDtTYW6XEL/f+yyM97nl2LH8RuC7p9/r/WCVuWcL8oIwHxFgITGQ/lBpX7/EycfgEoWrgiwLwGZgsxu+wEbpZdbGYXKGTchq2BPQBe4Hbpph7klC+XqlYwPDRnEicDkg8NshdEUFA3QfXuI9h0fvkPz6uGBB1Zv07Ngi7/1+zi/sLCCWCsw7gIxod0x7O5hq8NOR0gHkr2vcvrXJ7NFV/BrAgd4oTMXKcgjKFMGIoB9r8uHDPhrduWo+FoB3TVXZfrOgTw9RLlCKoPvtJrN3j+LZBCZkslZPQEXh06dH/g6QC/+Ad1WCjxg+PITFMz9uTMZEeb0wUK+E+0wxeUQ9/T1Rm8bDwFeEMqDBd1lrqDwZzF/5IebzHSHQyC6nXgGZVe8hjLcsceRoHxXivV7GTavmuR4DMkP1pYbaR4TKLcLUrULlVqH8D4r5t43Ua6HvADlEcye3Olwb0x60fvfIESUDdJWz1MiyocC5Q9S3+XFjTgo3oUz93KN3qj9G5IEL4FD4ux76eP8Hx8muFUpXBj9pABVKgHzpBI3/hdncaqweUxUS6Fql3VFamdJO/e6l3aVT8n0Hzs/4CKXAJP0OYdYCskT8bejuF5Kwi4iUrgrRn06z9WqviM2RN3vgkC1C5L8CPvruqiP71/FjOgUiIA5n4PxToDxy4a7RIfJ8Rj2CRuZgF30KUSskkcHc5P+/zvjs0Y6Nir5K6bISqJQE7AMt3vcDQGChaEwxEdaVdzpC2K+7lc6iz7iggFFSFH0tfGAG3hoO8q3rDVMXgg1nQFUhQpDPeJdQP4PsTzGsK+80eJPY4o5fg9vbE7gYyJyhfGmVxT/3frBuFN0SgjTwSYfY0T5hcXsCwTVzLevKGw5RzJ30BS7+LCm4twBahU2Cucaf7fIzYaKCfG2ZOw55v1g4Sp4YkySJT4PiSkKcJxfzTAvA0iHo+iiLEfZeNZx/DNRHOOeGpXDUKWEi67FPz10y4L6rdECWpAcLIXAx36rRPQDJVdANGZeOQnxtlXdfLNi/7D/bYcCKw37a09lMHtSsBXLlTVJOADZFgFPkGf6wTchGoEKkjvRhXx7ak4x21qbifz+XDl0jaLTH9xsHH7gIc7sg+qCuyOiEUgxTc0BIK2IAK5QiR/d/lin9NyCjF8jZIy5Q5hiARhdAkJvUb7pc+Q5MJJiQhzwwzCyHnKE8t8bcxxX3U8BA1MOHBUSEuBNRWTjB7ccZucjE+CqDuazK9k+BfcAnhHt9jlMwJcE+0uTYV2BnxtAdPW+hQUa029D+Z8HU+jMu5h2g+IO5GF+JKCHY3X5+6rFfwGuH2CvuraXxXZ8H3M+TubLSYvEPDdwmxNd5M+JzXUIlcbR+nlD7LCBw6SiTKUAsVN4+XCMOYQrHySuArQUiNwEXGcpvHK5nBWJmMK9ahK8On2RRH7g0DtbYuleYvkFp2ZV6pMuVHhLqJlbaHUF3n2J+jRHPMHenw1wDtsdvDcIjwEbtsDht4HIhwStOBGKESqIsPwL2Ncf5pxN+Rz861k8praxn3N7+AqQgJYdeOIlQStv2/buKpjCVOKiNp7QZWBBF7gR7A/0BXm8y3gll42jva7LjZ2dmzSZHDMmb5JQ5LwIFLEo3hM+i4PYrrS9C8xNLfPTYCvP1IkSHlYLCNTmDFJnA4OLvqbSUFHpEYdYBLBHfV6X7oJBsCoHLILlEYFf4vspcrw1ir4SBz664IQzkidGe5Kw7qpifTdNuNydkQKhEwxeOi4UKQnt5MprJCJoaQ4LQ7hQgpblZVbbtMsQfULqrVrpPQivtg2W6X/fyN9Y0UMkR4yvhp/NMbHxydRAUnw7ydl9IXiLEL2lx8S+qbHvzynMsI6EgTml/AWQ/aKm/LCQKzkDaUuxn/LWGHeP31Bd4O98Q9H4vXy9NVSWKlPavNhDvWzxFcyRCxiX+nKM1L5ipsKtPBWlCYpR0z2N8aPHxCFRyDDjn5ZVa+5CS3UvP7hPE/wiXK/yZoVRTUvW+r2OF8jMVc1eZbX/cofHQcAVqLvADTXa8fgJ+R5g6db6eZx9tEv/FuAlcKkQTVjIujYM1tn1ZKL9OabtgeTSc/VKH+Xfy8sPjhEGHdBWMOLKbl9lx77Aba8w9y2G/bCj9UQiXS0qna5ieKdG6pQPvYKjtEgVB0SWv4Euj0cHNvB1erO2jC/g4PtTLRmCSg/+m4CrMt8C8buU+xa/l7OgyR/f7C41iJM8BBgkoiiOCpi/DH4jgqh7TsgBsipo0flJlWx2Sz/s6lqenpAp6bSjhj3h+BYAQ2KiOVs5EE5IXb/Mo9kzqgYOQH4mG4JIJEx1nj6HMKC7yGYIHrf/M24IFwsO17kC/CUHAicIzajxw0VpnGH7fMWIlmbG+QHxuyK74br/QBSqWdnKOeFzHEKxRVUEU4nNlrtYxBOslofMY68o7j7GuvPMY68o7j3FWlfSzh4YHSucLdV5jZs47PKHK80eNwqWTc3ng/p3AE6Q8FcWqEl1xAbddcYLK4Y0QG2oDlHMYeBpHuDWkIw897pmM/694gpQnBjKE6IqM+Mc17MkWRHBiQN8pB0tSZe67S0RbCA+NrOMJNZsCWBWiDSAbxvc2r5midUuLDx58HJg7LxCHpPAqU6Q6Pj3W23fcNdGe5HNvzQ6wY3xe/haTtvuzNmZYhX0N/WIuxzkf84xoxr6ksTp/HAu0CuzKSPBvykLfc5tShqz3GY+Sp9mOwz29KPI2EWCn++XRkn8LViSQMOGzPJ7emUHRknj+ZUVmQc9uTOPl6KcJVArcaO8Lx72wqiJR0ocikl95QpsGrICGApIQ/VrhO6BdcM3QusB9LTacelTPoD9UWj9XOK7YY5M0cL9R9DjoPS2eeiwv8Bqi7yudI2HsZdCm/85/QSMN/c7VLnQAEfYHSudRIAVd8mO6tiDfgPk0PE5SdEzn5Sj9WGn/sp8mHdB9J6AJ+fuDp+P/ABjYpfBeZuXLAAAAAElFTkSuQmCC";
/* =================== v3.10: the phone forms on a full-height iPhone 18 Pro mockup, with full screen =================== */
const SBI = `<svg width="18" height="11" viewBox="0 0 18 11" aria-hidden="true"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="16" height="11" viewBox="0 0 16 11" aria-hidden="true"><path d="M8 2.2c2.3 0 4.4.9 5.9 2.4l1.2-1.2A10 10 0 0 0 8 .5 10 10 0 0 0 .9 3.4l1.2 1.2A8.3 8.3 0 0 1 8 2.2zm0 3.4c1.4 0 2.6.5 3.5 1.4l1.2-1.2A6.6 6.6 0 0 0 8 3.9a6.6 6.6 0 0 0-4.7 1.9L4.5 7c.9-.9 2.1-1.4 3.5-1.4zM8 9.1l2.3-2.3a3.3 3.3 0 0 0-4.6 0z" fill="currentColor"/></svg><svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><rect x="23.5" y="4" width="1.8" height="4" rx=".9" fill="currentColor" opacity=".5"/></svg>`;
function phoneStage(app, title, bar, inner){ const fs = !!S.f.fs;
  return `<div class="rf-stage${fs ? ' rf-full' : ''}"><div class="rf-stgs"><small class="rf-ph">${fs ? 'Full screen' : 'Phone preview'}</small><b>${title}</b><p>${app === 'del' ? 'What a site team or subcontractor sees on site. No account needed.' : 'What the assessor sees on site. No account needed.'}</p><small class="rf-ph" style="margin-top:6px">Property</small><div class="rf-stgp">${bar}</div><button class="btn ${fs ? 'sec' : 'pri'}" data-act="fsTog">${ico(fs ? 'x' : 'phone', 15)}${fs ? 'Exit full screen' : 'Full screen'}</button></div>`
    + `<div class="rf-iph"><i class="rf-hb1"></i><i class="rf-hb2"></i><i class="rf-hb3"></i><i class="rf-hb4"></i><div class="rf-scr"><div class="rf-sb2"><b>9:41</b><span>${SBI}</span></div><i class="rf-isl"></i><div class="rf-ab"><img src="${LOGO}" alt="REFYT"><span>${title}</span></div><div class="rf-scroll">${inner}</div><i class="rf-home"></i></div></div></div>`; }
const restage = (app, title, h) => { const i = h.indexOf('<div class="rf-bar">'), j = h.indexOf('<div class="rf-phone">'); if(i < 0 || j < 0) return h; const bar = h.slice(i + 20, j).replace(/<\/div>\s*$/, ''), inner = h.slice(j + 22).replace(/<\/div>\s*$/, ''); return phoneStage(app, title, bar, inner); };
{ const o = VIEWS.del.pages.site; VIEWS.del.pages.site = () => restage('del', 'Site forms', o()); const a = VIEWS.ret.pages.asf; VIEWS.ret.pages.asf = () => restage('ret', 'Assessor form', a()); }
A.fsTog = () => { S.f.fs = !S.f.fs; render(); };
const oRender = () => document.body.classList.toggle('rf-fsb', !!S.f.fs && S.view === 'del' && S.page.del === 'site' || !!S.f.fs && S.view === 'ret' && S.page.ret === 'asf');
setInterval(oRender, 150);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.fs){ S.f.fs = false; render(); } });
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/9nfHsN9jxfzNXCV332UCKG'; } });
VERSIONS.push({v:'v3.10', date:TODAY, major:false, current:true, url:null, title:'Phone forms on an iPhone 18 Pro, full height and full screen', sum:'The site form and the assessor form show on a full-height iPhone 18 Pro mockup, with a full screen mode.', steps:[
  {t:'The site form on a phone', min:.5, dolor:'Before, the phone frame was small inside the page.', show:['An iPhone 18 Pro mockup at full height, with its status bar, Dynamic Island and home indicator.', 'Full screen hides everything else; Escape returns.'], say:'This is what the site team holds in its hand.', go:() => { S.role = 'sit'; S.f.fs = false; go('del', 'site'); }},
]});

/* =================== v3.11: In progress records how far the trade has got =================== */
const sfCur = (p, key) => { const [kind, k] = key.split(':'); return kind === 'm' ? (p.ms.find(x => x.m === k) || {}).ip || 0 : (p.gp || {})[k] || 0; };
const sfP = () => prOf(S.f.mp || DB.pr.find(x => x.ph === 'E. Install').id);
{ const o = A.mset; A.mset = el => { o(el); if(S.f.sff && !S.modal && el.dataset.k === 'st' && el.dataset.v === 'In progress' && S.f.sff.pct == null){ const c = sfCur(sfP(), S.f.sfi); S.f.sff.pct = c > 0 && c < 100 ? c : 25; render(); } }; }
IN.sfPct = t => { S.f.sff.pct = +t.value; const l = document.getElementById('rf-pctv'); if(l) l.textContent = t.value + '%'; const f = document.getElementById('rf-pctf'); if(f) f.style.width = t.value + '%'; };
A.sfPctSet = el => { S.f.sff.pct = +el.dataset.v; render(); };
{ const o = VIEWS.del.pages.site; VIEWS.del.pages.site = () => { let h = o(); const m = S.f.sff; if(!m || m.st !== 'In progress') return h; const pct = m.pct == null ? 25 : m.pct, cur = sfCur(sfP(), S.f.sfi);
  const ctl = `<div class="rf-pct"><div class="rf-pcth"><b>How far is the trade?</b><span id="rf-pctv">${pct}%</span></div><input type="range" min="5" max="95" step="5" value="${pct}" data-in="sfPct" aria-label="Progress"><div class="rf-pctq">${[25, 50, 75, 90].map(v => `<button type="button" class="${pct === v ? 'on' : ''}" data-act="sfPctSet" data-v="${v}">${v}%</button>`).join('')}</div><small>${cur ? `Last recorded: ${cur}%` : 'Nothing recorded yet'}</small></div>`;
  const i = h.indexOf('<div class="rf-2">', h.indexOf('rf-scroll')); return i < 0 ? h : h.slice(0, i) + ctl + h.slice(i); }; }
{ const o = A.sfOk; A.sfOk = el => { const p = sfP(), key = S.f.sfi, m = S.f.sff; const pct = m && m.st === 'In progress' ? (m.pct == null ? 25 : m.pct) : null; o(el);
  if(pct != null && !S.f.sff){ const [kind, k] = key.split(':'); if(kind === 'm') p.ms.find(x => x.m === k).ip = pct; else { p.gp = p.gp || {}; p.gp[k] = pct; } if(p.sfr && p.sfr[key]) p.sfr[key].st = `In progress, ${pct}%`; const h = p.his[p.his.length - 1]; if(h) h[1] = h[1].replace(': in progress', `: in progress, ${pct}%`); render(); toast(`Saved: ${pct}% done. Delivery and the Redbridge tracker show it straight away.`); } }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/GuHGEmsNQpchy2MeeyAK8h'; } });
VERSIONS.push({v:'v3.11', date:TODAY, major:false, current:true, url:null, title:'Progress percentage in site forms', sum:'Saving an item as In progress asks how far the trade has got, from 5% to 95%; Delivery and the Redbridge tracker show it.', steps:[
  {t:'How far is the trade', min:.5, dolor:'Before, In progress had no percentage.', show:['Choose In progress: a slider and quick 25, 50, 75 and 90%.', 'The percentage shows on the item, in Delivery and in the Redbridge tracker.'], say:'You know how far each trade is.', go:() => { S.role = 'sit'; S.f.mp = 'PR-2018'; S.f.sfi = null; go('del', 'site'); }},
]});

/* =================== v3.12: done tasks stay visible and can be restored =================== */
const tkRow6 = (app, k) => `<div class="mbr um-row nc${tkOver(k) ? ' rf-ovr' : ''}${k.done ? ' rf-done' : ''}${S.hl === k.id ? ' hl2' : ''}" data-act="tkView" data-v="${k.id}" data-hl="${k.id}" tabindex="0"><div class="mbc" style="flex:3"><b>${esc(k.t)}</b><small>${k.desc ? esc(k.desc.slice(0, 70)) + (k.desc.length > 70 ? '...' : '') : k.pr ? esc(prOf(k.pr).ad) : ''}</small></div>` + ownerCell(k) + `<div class="mbc"><b${tkOver(k) ? ' class="rf-od"' : ''}>${fmtDy(k.due)}</b><small>${k.done ? 'done ' + fmtDy(k.doneOn) : fmtD(k.due)}</small></div><div class="mbc" style="flex:1.8"><b style="font-weight:600">${tkOrigin(app, k)}</b><small>${mtOf(k.src) ? 'meeting action' : k.pr ? 'from a job' : ''}</small></div><div class="mbc"><b>${k.done ? pill('tg', 'Done') : tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', 'Open')}</b><small></small></div>` + btns(k.done ? nx('tkReopen', k.id, 'Restore', 'sec') : nx('tkDone5', k.id, 'Mark done', 'sec')) + '</div>';
function tasksPage(app){ const f = S.f.tkf || 'open', mine = S.f.tkm === 'mine', tm = app === 'dir' ? (S.f.ttm || '') : app;
  const base = DB.tk.filter(k => (!tm || teamOf(k.r) === tm) && (!mine || k.who === ME())), xs = base.filter(TKF[f][1]).sort((a, b) => (tkOver(b) - tkOver(a)) || (a.due < b.due ? -1 : 1));
  const done = f === 'done' ? [] : base.filter(k => k.done).sort((a, b) => a.doneOn > b.doneOn ? -1 : 1), show = S.f.tkdo;
  return oph('My tasks', app === 'dir' ? 'Every team’s tasks, from meetings and from jobs. Filter by team.' : `${LAPPS[app].team}: tasks from the Monday and Thursday meetings and from jobs.`, nx('tkNew5', '', 'Add a task'))
    + `<div class="cstats">${Object.entries(TKF).map(([k2, [n, fn]]) => stat(k2 === 'over' && base.some(tkOver) ? 'tred' : 'tk', n, base.filter(fn).length, f === k2 ? 'filtering the list' : '', 'tkf', k2, f === k2)).join('')}</div>`
    + `<div class="rf-bar">${seg('tkm', mine ? 'mine' : 'all', [['mine', 'My tasks'], ['all', 'All team tasks']])}${app === 'dir' ? seg('ttm', tm, [['', 'All teams'], ...APPS.map(([k2, n]) => [k2, n, DB.tk.filter(t => !t.done && teamOf(t.r) === k2).length])]) : ''}</div>`
    + `<div class="rf-tw">` + th(cell('Task', 'Description', 3) + cell('Owner', '', 1.4) + cell('Due', '') + cell('Origin', '', 1.8) + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + (xs.length ? xs.map(k => tkRow6(app, k)).join('') : empty(mine ? `Nothing here for ${PEO[ME()].n}. All team tasks shows the rest.` : 'Nothing here.'))
    + (done.length ? `<button class="rf-dtg" data-act="tkDoTog">${ico('chev', 13)}${show ? 'Hide' : 'Show'} ${plural(done.length, 'done task', 'done tasks')}</button>` + (show ? done.map(k => tkRow6(app, k)).join('') : '') : '') + '</div>'; }
A.tkDoTog = () => { S.f.tkdo = !S.f.tkdo; render(); };
A.tkReopen = el => { const k = DB.tk.find(x => x.id === el.dataset.v), was = k.doneOn; k.done = false; k.doneOn = null; if(k.pr) his(prOf(k.pr), `Task restored: ${k.t}`, ME()); S.hl = k.id; S.modal = null; render(); toast(`Restored. It is open again for ${PEO[k.who] ? PEO[k.who].n : RN(k.r)}.`, 'Undo', () => { k.done = true; k.doneOn = was; render(); }); };
{ const o = MODALS.tkv; MODALS.tkv = m => { const k = DB.tk.find(x => x.id === m.id), h = o(m); return k.done ? h.replace('<span class="note"></span>', `<span class="note"></span><button class="btn sec lg" data-act="tkReopen" data-v="${k.id}">Restore</button>`) : h; }; }
{ const o = A.tkDone5; A.tkDone5 = el => { o(el); const k = DB.tk.find(x => x.id === el.dataset.v); toast('Done. It stays in Done this week and can be restored.', 'Undo', () => { k.done = false; k.doneOn = null; render(); }); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/BsA9NAQg74s41gkXrcfCr6'; } });
VERSIONS.push({v:'v3.12', date:TODAY, major:false, current:true, url:null, title:'Done tasks stay and can be restored', sum:'Done tasks stay at the bottom of My tasks, can be shown or hidden, and can be restored from the list or the task.', steps:[
  {t:'Done tasks you can restore', min:.5, dolor:'Before, a done task disappeared from the list.', show:['Show done tasks at the bottom of the list.', 'Restore reopens it, from the list or from the task.'], say:'Nothing done by mistake is lost.', go:() => { S.role = 'dir'; S.f.tkf = 'open'; S.f.tkdo = true; go('dir', 'tasks'); }},
]});

/* =================== v3.13: the phone app opens on my jobs: the properties assigned to me and what I must do there =================== */
const TRADE = key => { const [kind, k] = key.split(':'); return kind === 'g' ? {stl:'akr', wal:'akr', ven:'sub:Medway Electrical Ltd', rof:'akr', win:'akr', ewi:'sub:Redbridge Render Co', led:'sub:Medway Electrical Ltd', hnd:'akr', pre:'akr'}[k] : {LI:'sub:Insulation Supplies Direct', CWI:'sub:Insulation Supplies Direct', EWI:'sub:Redbridge Render Co', IWI:'sub:Insulation Supplies Direct', SPV:'sub:Medway Electrical Ltd', DMEV:'sub:Medway Electrical Ltd', LED:'sub:Medway Electrical Ltd', WIN:'akr'}[k]; };
const SUSERS = [['akr', 'Akram', 'Site manager, sees every job on site'], ['sub:Redbridge Render Co', 'Redbridge Render Co', 'Wall insulation subcontractor'], ['sub:Medway Electrical Ltd', 'Medway Electrical Ltd', 'Solar, ventilation and lighting'], ['sub:Insulation Supplies Direct', 'Insulation Supplies Direct', 'Loft and cavity fitters']];
const AUSERS = [['afa', 'Afaq Ahmad', 'Assessor'], ['xen', 'Xeni Ratkoceri', 'Assessor']];
if(!SITEP.some(x => x[0] === 'sub:Insulation Supplies Direct')) SITEP.push(['sub:Insulation Supplies Direct', 'Insulation Supplies Direct fitters']);
const suName = u => (SUSERS.find(x => x[0] === u) || ['', u])[1];
const jobType = it => it.hp && it.st !== 'Completed' ? 'Inspection' : it.st === 'Not started' ? 'Start work' : 'Progress update';
const JT = {'Inspection':'ta', 'Start work':'tk', 'Progress update':'tb', 'Site assessment':'tb', 'Revisit':'ta'};
const pctOf = (p, key) => { const c = sfCur(p, key); return c && c < 100 ? ` ${c}%` : ''; };
function siteJobs(u){ return DB.pr.filter(p => p.ph === 'E. Install').map(p => ({p, items:sfItems(p).filter(i => i.st !== 'Completed' && (u === 'akr' || TRADE(i.key) === u))})).filter(x => x.items.length); }
const userSide = (users, cur, act) => `<div class="seg2 um-seg">${users.map(([k, n, r]) => `<button type="button" class="${cur === k ? 'on' : ''}" aria-pressed="${cur === k}" data-act="${act}" data-v="${k}"><span style="display:flex;flex-direction:column;align-items:flex-start"><b>${n}</b><small style="font-weight:500">${r}</small></span></button>`).join('')}</div>`;
const sideFix = h => h.replace('<small class="rf-ph" style="margin-top:6px">Property</small>', '<small class="rf-ph" style="margin-top:6px">Signed in as</small>');
const swapSide = (h, side) => { const i = h.indexOf('<div class="rf-stgp">'), j = h.indexOf('<button class="btn', i); return i < 0 || j < 0 ? h : h.slice(0, i) + '<div class="rf-stgp">' + side + '</div>' + h.slice(j); };
/* Delivery site app */
const prevSite = VIEWS.del.pages.site;
VIEWS.del.pages.site = () => { const u = S.f.su || 'akr', jobs = siteJobs(u), side = userSide(SUSERS, u, 'suSet');
  if(S.f.mp && S.f.sfi && S.f.sff) return sideFix(swapSide(prevSite(), side));
  const p = S.f.mp && jobs.find(j => j.p.id === S.f.mp) ? prOf(S.f.mp) : null;
  let inner;
  if(!p) inner = `<div class="rf-hi"><small>${DSH[fromIso(TODAY).getDay()]}, ${fmtDy(TODAY)}</small><b>Hi ${suName(u).split(' ')[0]}</b><span>${plural(jobs.length, 'property', 'properties')}, ${plural(sum(jobs, j => j.items.length), 'job', 'jobs')} assigned to you</span></div><small class="rf-ph">My properties</small>`
    + (jobs.length ? jobs.map(({p: q, items}) => `<button class="rf-jc" data-act="phProp" data-v="${q.id}"><div class="rf-jch"><b>${esc(q.ad)}</b><small>${scOf(q.sc).n}${q.ht ? ', ' + q.ht : ''}</small></div>${items.slice(0, 3).map(i => `<div class="rf-jl">${pill(JT[jobType(i)], jobType(i))}<span>${i.n}${pctOf(q, i.key)}</span></div>`).join('')}${items.length > 3 ? `<small class="rf-more3">and ${items.length - 3} more</small>` : ''}${ico('chev', 14)}</button>`).join('') : '<div class="rf-free" style="padding:20px 0">Nothing assigned to you right now.</div>');
  else { const mine = jobs.find(j => j.p.id === p.id).items, others = sfItems(p).filter(i => !mine.includes(i) && i.st !== 'Completed').length, rec = p.sfr || {};
    inner = `<button class="lnk4" data-act="phHome" style="margin-bottom:8px">${ico('chev', 12)} My properties</button><div class="rf-ph-h"><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}${p.ht ? ', ' + p.ht : ''}. ${esc(p.res)}</small></div><small class="rf-ph">What you are assigned to do here</small>`
      + mine.map(i => { const r = rec[i.key], t = jobType(i); return `<button class="rf-dl rf-tap" data-act="sfOpen" data-v="${i.key}"><span class="rf-ck"></span><div><b>${i.n}${pctOf(p, i.key)}</b><small>${t === 'Inspection' ? `Hold point: ${i.hp}` : r ? `Last: ${r.st}, ${fmtDy(r.on)}, ${r.whoN}` : t === 'Start work' ? 'Not started yet' : 'Record today’s progress'}</small></div>${pill(JT[t], t)}</button>`; }).join('')
      + (others ? `<small class="rf-free" style="display:block;margin:6px 2px">${plural(others, 'other job', 'other jobs')} on this property ${others === 1 ? 'is' : 'are'} assigned to other teams.</small>` : '') + `<button class="btn sec" style="width:100%;margin-top:8px" data-act="mFlag" data-v="${p.id}">${ico('flag', 15)}Flag a problem</button>`; }
  return sideFix(phoneStage('del', 'Site forms', side, inner)); };
A.suSet = el => { S.f.su = el.dataset.v; S.f.mp = null; S.f.sfi = null; S.f.sff = null; render(); };
A.phProp = el => { S.f.mp = el.dataset.v; S.f.sfi = null; S.f.sff = null; render(); };
A.phHome = () => { S.f.mp = null; S.f.sfi = null; S.f.sff = null; render(); };
/* Retrofit assessor app */
const asJobs = u => DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && p.b.who === u && p.b.bk).sort((a, b) => (a.b.on || '') < (b.b.on || '') ? -1 : 1);
const asSt = p => !p.b.vis ? (p.b.revisits ? 'Revisit' : 'Site assessment') : p.b.rev === 'Approved' ? 'Approved' : 'In review';
const prevAsf = VIEWS.ret.pages.asf;
VIEWS.ret.pages.asf = () => { const u = S.f.au || (S.role === 'ass' ? ROLES.ass[1] : 'afa'), jobs = asJobs(u), side = userSide(AUSERS, u, 'auSet');
  if(S.f.ap2 && jobs.some(p => p.id === S.f.ap2)){ S.f.ap = S.f.ap2; const h = sideFix(swapSide(prevAsf(), side)); return h.replace('<div class="rf-scroll">', `<div class="rf-scroll"><button class="lnk4" data-act="phHomeA" style="margin-bottom:8px">${ico('chev', 12)} My visits</button>`); }
  const up = jobs.filter(p => !p.b.vis), rv = jobs.filter(p => p.b.vis);
  const card = p => `<button class="rf-jc" data-act="phAs" data-v="${p.id}"><div class="rf-jch"><b>${esc(p.ad)}</b><small>${scOf(p.sc).n}, ${p.ref}</small></div><div class="rf-jl">${pill(asSt(p) === 'Approved' ? 'tg' : JT[asSt(p)] || 'tk', asSt(p))}<span>${p.b.on ? `${fmtDy(p.b.on)}, ${p.b.h}` : ''}</span></div>${ico('chev', 14)}</button>`;
  const inner = `<div class="rf-hi"><small>${DSH[fromIso(TODAY).getDay()]}, ${fmtDy(TODAY)}</small><b>Hi ${PEO[u].n.split(' ')[0]}</b><span>${plural(up.length, 'visit', 'visits')} to do, ${rv.length} submitted</span></div><small class="rf-ph">To visit</small>${up.map(card).join('') || '<div class="rf-free" style="padding:8px 0">No visits booked for you.</div>'}${rv.length ? `<small class="rf-ph" style="margin-top:10px">Submitted</small>${rv.map(card).join('')}` : ''}`;
  return sideFix(phoneStage('ret', 'Assessor form', side, inner)); };
A.auSet = el => { S.f.au = el.dataset.v; S.f.ap2 = null; render(); };
A.phAs = el => { S.f.ap2 = el.dataset.v; render(); };
A.phHomeA = () => { S.f.ap2 = null; render(); };
{ const o = A.setRole; A.setRole = el => { o(el); if(S.role === 'ass'){ S.f.au = ROLES.ass[1]; S.f.ap2 = null; } if(S.role === 'sit'){ S.f.su = 'akr'; S.f.mp = null; } }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/1T6dPuosxbjx8ifKSoafTY'; } });
VERSIONS.push({v:'v3.13', date:TODAY, major:false, current:true, url:null, title:'Phone app: my properties and what I must do there', sum:'The site and assessor phone apps open on the properties assigned to the signed-in person, with what they must do in each: an inspection, starting work, a progress update, a site assessment or a revisit.', steps:[
  {t:'My properties on the phone', min:.5, dolor:'Before, the property was picked outside the phone, and everyone saw everything.', show:['Signed in as a subcontractor, the phone lists only their properties and jobs.', 'Each job says what to do: inspection, start work or progress update.', 'The assessor sees their booked visits and revisits, and what they submitted.'], say:'Each person opens the app and sees their day.', go:() => { S.role = 'sit'; S.f.su = 'sub:Medway Electrical Ltd'; S.f.mp = null; go('del', 'site'); }},
]});

/* =================== v3.14: a Clients list, and the new scheme form picks client and region from lists =================== */
const REGIONS = ['London', 'Essex', 'Kent', 'Surrey', 'Oxfordshire'];
const CLTYPES = ['Council', 'Housing association', 'Grant body', 'Main contractor', 'Other'];
DB.cl = [
  {id:'CL-01', n:'Medway Council', ty:'Council', reg:'Kent', sys:'Dynamics', terms:30, ct:'Retrofit programme team'},
  {id:'CL-02', n:'Thanet District Council', ty:'Council', reg:'Kent', sys:'Dynamics', terms:30, ct:'Housing standards team'},
  {id:'CL-03', n:'Waverley Borough Council', ty:'Council', reg:'Surrey', sys:'Dynamics', terms:30, ct:'Sustainability officer'},
  {id:'CL-04', n:'Cottsway Housing Association', ty:'Housing association', reg:'Oxfordshire', sys:'Dynamics', terms:30, ct:'Asset management'},
  {id:'CL-05', n:'GLA', ty:'Grant body', reg:'London', sys:'Shareworks', terms:30, ct:'Warmer Homes team'},
  {id:'CL-06', n:'London Borough of Redbridge', ty:'Council', reg:'London', sys:'PAS Hub', terms:45, ct:'Via Kanopi Works'},
  {id:'CL-07', n:'Kanopi Works', ty:'Main contractor', reg:'London', sys:'PAS Hub', terms:45, ct:'Project manager, Redbridge'},
];
DB.seq.cl = 7;
const clOfSc = s => DB.cl.find(c => s.cl === c.n || s.cl.startsWith(c.n + ' ('));
const scOfCl = c => DB.sc.filter(s => clOfSc(s) === c);
function clPage(){ return oph('Clients', 'Councils, housing associations, grant bodies and main contractors. Each client is entered once and every scheme links to it, so payment times and margins can be compared per client.', nx('clNew', '', 'Add a client'))
  + `<div class="rf-tw">` + th(cell('Client', 'Type', 2.2) + cell('Region', '') + cell('Schemes', '', 2) + cell('Client system', '') + cell('Payment terms', '') + cell('Contact', '', 1.4)) + DB.cl.map(c => { const ss = scOfCl(c); return rdiv(cell(esc(c.n), c.ty, 2.2) + cell(c.reg, '') + `<div class="mbc" style="flex:2"><b style="font-weight:600">${ss.length ? ss.map(s => `<button class="lnk4" data-act="ficha" data-v="${s.id}">${esc(s.n)}</button>`).join(', ') : 'No schemes yet'}</b><small>${plural(sum(ss, s => prsOf(s.id).length), 'property', 'properties')}</small></div>` + cell(c.sys, '') + cell(`${c.terms} days`, '') + cell(esc(c.ct || ''), '', 1.4), S.hl === c.id, c.id); }).join('') + '</div>'; }
const clForm = (m, pre) => fld('Client name', 'm', pre + 'n', m[pre + 'n'], {req:true, ph:'e.g. Swale Borough Council'}) + mlab('Type', true) + mseg(pre + 'ty', m[pre + 'ty'], CLTYPES) + `<div class="rf-2">${cbx('Region', pre + 'regx', REGIONS.map(r => [r, r]), m[pre + 'reg'], 'm', {req:true, ph:'Choose a region...'})}${cbx('Client system', pre + 'sysx', [['Dynamics', 'Dynamics (E.ON)'], ['Shareworks', 'Shareworks (GLA)'], ['PAS Hub', 'PAS Hub'], ['None', 'None']], m[pre + 'sys'], 'm', {ph:'Choose...'})}</div>`;
Object.assign(CBK, {regx:'reg', sysx:'sys', clx:'clid', nregx:'nreg', nsysx:'nsys', screg:'reg'});
A.clNew = () => { S.modal = {k:'cl9', n:'', ty:'', reg:'', sys:''}; renderLayer(); };
MODALS.cl9 = m => modal('Add a client', 'It becomes available in every scheme form.', clForm(m, ''), mfoot('Add client', 'clOk9', !!((m.n || '').trim() && m.ty && m.reg)), 600);
const addCl = (n, ty, reg, sys) => { const c = {id:'CL-' + String(++DB.seq.cl).padStart(2, '0'), n:n.trim(), ty, reg, sys:sys || 'None', terms:30, ct:''}; DB.cl.push(c); return c; };
A.clOk9 = () => { const m = S.modal, c = addCl(m.n, m.ty, m.reg, m.sys); S.modal = null; S.hl = c.id; render(); toast(`${esc(c.n)} added to Clients.`); };
/* New scheme: client and region from lists; a new client can be added from the form */
A.nsOpen = el => { const s = el.dataset.v ? scOf(el.dataset.v) : null, c = s ? clOfSc(s) : null; S.modal = {k:'ns9', from:el.dataset.v, n:'', clid:'', reg:s ? s.reg : '', prog:s ? s.prog : 'NONE', tgt:'', nn:'', nty:'', nreg:'', nsys:''}; renderLayer(); };
MODALS.ns9 = m => { const s0 = m.from ? scOf(m.from) : null, isNew = m.clid === '__new', ok = (m.n || '').trim() && m.clid && m.reg && (!isNew || ((m.nn || '').trim() && m.nty && m.nreg));
  return modal('New scheme', s0 ? `Starting from ${esc(s0.n)}: ${s0.ty} stages, checklists and settings.` : 'Blank: phases A and B, settings to fill in.', fld('Scheme name', 'm', 'n', m.n, {req:true, ph:'e.g. E.ON Swale'})
    + cbx('Client', 'clx', [...DB.cl.map(c => [c.id, c.n, `${c.ty}, ${c.reg}`]), ['__new', '+ Add a new client', 'Not in the list yet']], m.clid, 'm', {req:true, ph:'Choose the client...'})
    + (isNew ? `<div class="rf-newcl"><small class="rf-ph">New client</small>${clForm(m, 'n').replace(/data-k="nn"/, 'data-k="nn"')}</div>` : '')
    + `<div class="rf-2">${cbx('Region', 'screg', REGIONS.map(r => [r, r]), m.reg, 'm', {req:true, ph:'Choose a region...'})}${fld('Target properties', 'm', 'tgt', m.tgt, {type:'number', ph:'e.g. 40'})}</div>` + mlab('Programme manager') + mseg('prog', m.prog, PROGS.map(p => [p.id, p.n])), mfoot('Create scheme', 'nsOk9', !!ok), 640); };
{ const o = IN.m; IN.m = t => { o(t); if(S.modal && S.modal.k === 'ns9' && t.dataset.k === 'clx'){ const c = DB.cl.find(x => x.id === S.modal.clid); if(c && !S.modal.reg) S.modal.reg = c.reg; renderLayer(); } if(S.modal && S.modal.k === 'ns9' && t.dataset.k === 'nregx' && !S.modal.reg){ S.modal.reg = S.modal.nreg; renderLayer(); } }; }
A.nsOk9 = () => { const m = S.modal, s0 = m.from ? scOf(m.from) : null, c = m.clid === '__new' ? addCl(m.nn, m.nty, m.nreg, m.nsys) : DB.cl.find(x => x.id === m.clid), id = 'SC-' + String(DB.sc.length + 1).padStart(2, '0');
  DB.sc.push({id, n:m.n.trim(), prog:m.prog, cl:c.n, ty:s0 ? s0.ty : 'GLA', reg:m.reg, st:'Starting', tgt:numIn(m.tgt) || 0, lead:'dre', set:s0 ? {...s0.set} : {mg:20, ord:2000, pay:2500, vr:1000, terms:c.terms || 30}, log:[[TODAY, ME(), 'created', s0 ? 'copied from ' + s0.n : 'blank', 'live']]}); S.modal = null; abrir(S.view, id, 'set'); toast(`Scheme created for ${esc(c.n)}${m.clid === '__new' ? ', a new client now in Clients' : ''}. It already shows in the Director overview.`); };
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => o().replace('<button class="nav" data-act="pg_dir" data-v="nsc"', sbItem(S.page.dir, 'pg_dir')(['cls', 'Clients', 'building', DB.cl.length, 1]) + '<button class="nav" data-act="pg_dir" data-v="nsc"'); VIEWS.dir.pages.cls = clPage; }
DBS.splice(1, 0, B('cl', 'Clients', 'wrk', 'Councils, housing associations, grant bodies and main contractors, entered once.', [['Type', 'Dropdown'], ['Region', 'Dropdown'], ['Client system', 'Dropdown'], ['Schemes', '→ Contracts (schemes)']], () => DB.cl.length));
Object.assign(ACC.dir, {cl:'w'}); Object.assign(ACC.com, {cl:'r'}); Object.assign(ACC.acc, {cl:'r'});
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/AxrcUSFBCYcr9vsRT4Ed9N'; } });
VERSIONS.push({v:'v3.14', date:TODAY, major:false, current:true, url:null, title:'Clients list, and client and region dropdowns', sum:'Clients are entered once in Director, Clients, and linked to their schemes. The new scheme form picks the client and the region from lists, and can add a new client.', steps:[
  {t:'Clients and the new scheme form', min:.5, dolor:'Before, client and region were typed by hand.', show:['Director, Clients: each client once, with its schemes, region, client system and terms.', 'New scheme: client and region from lists; “Add a new client” right there.'], say:'Each client is entered once and reused.', go:() => { S.role = 'dir'; go('dir', 'cls'); }},
]});

/* =================== v3.15: scheme templates you can see and build =================== */
const mkTpl = (id, n, ty, from) => { const pt = PTYPE[ty] || {sys:'None', st:['Received', 'In progress', 'Complete'], trig:'Work accepted by the client', terms:30}, s = from ? scOf(from) : null;
  return {id, n, ty, sys:pt.sys, st:[...pt.st], trig:pt.trig, ms:Object.keys(RATE[ty] || {LI:1, CWI:1}), rates:{...(RATE[ty] || {LI:1250, CWI:1900})}, bud:Math.round(BUD * 100), set:s ? {...s.set} : {mg:20, ord:2000, pay:2500, vr:1000, terms:pt.terms}, lim:{...LIMIT}, ev:[...EVID], docs:[...ADOCS], d:DITEMS.map(x => x[0]).filter(k => ty === 'Redbridge' || k !== 'gas' || true), hand:[...HAND], groups:ty === 'Redbridge'}; };
DB.tpl = [mkTpl('TP-1', 'E.ON type', 'E.ON', 'SC-01'), mkTpl('TP-2', 'GLA type', 'GLA', 'SC-05'), mkTpl('TP-3', 'Redbridge type', 'Redbridge', 'SC-06')];
DB.seq.tp = 3;
const tpOf = id => DB.tpl.find(t => t.id === id);
const TPCTRL = [['Client system and its statuses', 'Dynamics, Shareworks, PAS Hub or none, and the statuses each property moves through, with the reminders to update it.'], ['Measures and rates', 'Which measures the scheme installs, the agreed price per measure and the budget cost.'], ['Settings', 'Margin target, order, payment and variation limits, and payment terms.'], ['Time limits per phase', 'When a property turns amber and red in each phase.'], ['Checklists', 'RdSAP evidence, assessment documents, phase D items and the handover pack.'], ['Install tracking', 'By measure, or by group with hold points as on Redbridge.'], ['Payment trigger', 'The event that tells Accounts to invoice.']];
function nscPage(){ const e = S.f.tpe && tpOf(S.f.tpe); if(e) return tplEditor(e);
  return oph('New scheme setup', 'Create a scheme from a template or copy an existing one; it arrives with everything the template controls and appears in the Director overview.', `${nx('tpNew', '', 'New template', 'sec')}${nx('nsOpen', '', 'New scheme')}`)
    + `<section class="rsec"><div class="rs-h"><h3>What a template controls</h3><p>Change it once in the template; every new scheme made from it starts that way.</p></div><div class="rf-tpc">${TPCTRL.map(([n, d]) => `<div><b>${n}</b><small>${d}</small></div>`).join('')}</div></section>`
    + grpH('Templates', DB.tpl.length) + `<div class="rf-tpg">${DB.tpl.map(t => { const used = DB.sc.filter(s => s.tpl === t.id || (!s.tpl && s.ty === t.ty)).length; return `<div class="rf-tpk"><div class="rf-tpkh"><b>${esc(t.n)}</b><small>${t.sys === 'None' ? 'No client system' : t.sys}, ${plural(used, 'scheme', 'schemes')}</small></div><div class="rf-tpkl"><span>${plural(t.ms.length, 'measure', 'measures')}</span><span>margin ${t.set.mg}%</span><span>${t.st.length} statuses</span><span>${t.groups ? 'install by group' : 'install by measure'}</span><span>${t.d.length} prep items</span><span>${t.hand.length} handover items</span></div><small class="rf-tpt">Invoice when: ${esc(t.trig)}</small><div class="rf-tpkb">${nx('nsOpenT', t.id, 'Use template')}${nx('tpEdit', t.id, 'Edit', 'sec')}${nx('tpDup', t.id, 'Duplicate', 'sec')}</div></div>`; }).join('')}</div>`
    + grpH('Or copy an existing scheme', DB.sc.length) + DB.sc.map(s => rdiv(cell(s.n, `${s.ty} type, ${s.cl}`, 2) + btns(nx('nsOpen', s.id, 'Copy', 'sec') + nx('tpFromSc', s.id, 'Save as template', 'sec')))).join(''); }
function tplEditor(t){ const k = f => `${t.id}|${f}`, chips = (list, sel, f, lbl = x => x) => `<div class="rf-chips">${list.map(x => `<button type="button" class="rf-chip2${sel.includes(x) ? ' on' : ''}" data-act="tpTog" data-v="${k(f)}|${x}">${sel.includes(x) ? ico('check', 12, 2.6) : ''}${esc(lbl(x))}</button>`).join('')}</div>`;
  return crumb('tpBack', 'New scheme setup', esc(t.n)) + oph(esc(t.n), 'Everything a scheme made from this template starts with. Changes apply to new schemes; existing schemes keep their own settings.', `${nx('nsOpenT', t.id, 'Use template')}`)
    + `<section class="rsec"><div class="rs-h"><h3>General</h3></div><div class="rf-2">${fld('Template name', 'tp', k('n'), t.n, {req:true})}${cbx('Client system', 'tpsys|' + t.id, [['Dynamics', 'Dynamics'], ['Shareworks', 'Shareworks'], ['PAS Hub', 'PAS Hub'], ['None', 'None']], t.sys, 'tps')}</div>${fld('Payment trigger', 'tp', k('trig'), t.trig, {ph:'e.g. Install complete in Dynamics'})}</section>`
    + `<section class="rsec"><div class="rs-h"><h3>Client system statuses</h3><p>In order. Each move to the next status can create a reminder with a tick.</p></div>${t.st.map((x, i) => `<div class="rf-stl"><span class="rf-ck num">${i + 1}</span><input class="um-in" data-in="tpSt" data-k="${t.id}|${i}" value="${esc(x)}"><button class="ib" data-act="tpStDel" data-v="${t.id}|${i}" aria-label="Remove">${ico('x', 14)}</button></div>`).join('')}<button class="btn sec sm" data-act="tpStAdd" data-v="${t.id}">${ico('plus', 13)}Add status</button></section>`
    + `<section class="rsec"><div class="rs-h"><h3>Measures and rates</h3><p>Budget cost is ${t.bud}% of the price.</p></div><div class="el-wide rf-st"><div class="rf-mx"><table><thead><tr><th>Measure</th><th>In this template</th><th>Agreed price</th><th>Budget cost</th></tr></thead><tbody>${Object.keys(MEAS).map(m => { const on = t.ms.includes(m); return `<tr><td><b>${MEAS[m].n}</b></td><td><button type="button" class="rf-chip2${on ? ' on' : ''}" data-act="tpTog" data-v="${k('ms')}|${m}">${on ? ico('check', 12, 2.6) + 'Included' : 'Not included'}</button></td><td>${on ? `<label class="rf-uin pre"><em>£</em><input class="um-in" inputmode="decimal" data-in="tpRate" data-k="${t.id}|${m}" value="${t.rates[m] || ''}"></label>` : ''}</td><td>${on && t.rates[m] ? fm(t.rates[m] * t.bud / 100) : ''}</td></tr>`; }).join('')}</tbody></table></div></div></section>`
    + `<section class="rsec"><div class="rs-h"><h3>Settings</h3></div><div class="el-wide rf-st"><div class="rf-mx"><table><thead><tr>${SETS.map(([, n]) => `<th>${n}</th>`).join('')}</tr></thead><tbody><tr>${SETS.map(([sk, , u, pre]) => `<td><label class="rf-uin${pre ? ' pre' : ''}">${pre ? `<em>${u}</em>` : ''}<input class="um-in" inputmode="decimal" data-in="tpSet" data-k="${t.id}|${sk}" value="${t.set[sk]}">${pre ? '' : `<em>${u}</em>`}</label></td>`).join('')}</tr></tbody></table></div></div></section>`
    + `<section class="rsec"><div class="rs-h"><h3>Time limits per phase</h3><p>Amber past the limit, red at one and a half times.</p></div><div class="el-wide rf-st"><div class="rf-mx"><table><thead><tr>${OPENP.map(ph => `<th>${ph}</th>`).join('')}</tr></thead><tbody><tr>${OPENP.map(ph => `<td><label class="rf-uin"><input class="um-in" inputmode="decimal" data-in="tpLim" data-k="${t.id}|${ph}" value="${t.lim[ph]}"><em>days</em></label></td>`).join('')}</tr></tbody></table></div></div></section>`
    + `<section class="rsec"><div class="rs-h"><h3>Checklists</h3><p>Tap to include or leave out.</p></div><small class="rf-ph">RdSAP evidence</small>${chips(EVID, t.ev, 'ev')}<small class="rf-ph">Assessment documents</small>${chips(ADOCS, t.docs, 'docs')}<small class="rf-ph">Phase D, before install</small>${chips(DITEMS.map(x => x[0]), t.d, 'd', x => DITEMS.find(y => y[0] === x)[1])}<small class="rf-ph">Handover pack</small>${chips(HAND, t.hand, 'hand')}</section>`
    + `<section class="rsec"><div class="rs-h"><h3>Install tracking</h3></div><div class="seg2 um-seg">${[[false, 'By measure, with a progress percentage'], [true, 'By group, with hold points (Redbridge style)']].map(([v, n]) => `<button type="button" class="${t.groups === v ? 'on' : ''}" aria-pressed="${t.groups === v}" data-act="tpGroups" data-v="${t.id}|${v ? 1 : 0}">${n}</button>`).join('')}</div></section>`; }
const tpLog = (t, what) => { t.on = TODAY; t.by = ME(); };
IN.tp = t => { const [id, f] = t.dataset.k.split('|'), x = tpOf(id); x[f] = t.value; tpLog(x); };
IN.tps = t => { const id = t.dataset.k.split('|')[1], x = tpOf(id); x.sys = t.value; };
IN.tpSt = t => { const [id, i] = t.dataset.k.split('|'); tpOf(id).st[+i] = t.value; };
A.tpStDel = el => { const [id, i] = el.dataset.v.split('|'), x = tpOf(id); if(x.st.length <= 2) return toast('A client system needs at least two statuses.'); x.st.splice(+i, 1); render(); };
A.tpStAdd = el => { tpOf(el.dataset.v).st.push('New status'); render(); };
IN.tpRate = t => { const [id, m] = t.dataset.k.split('|'); tpOf(id).rates[m] = numIn(t.value); refocus(render); };
IN.tpSet = t => { const [id, sk] = t.dataset.k.split('|'); tpOf(id).set[sk] = numIn(t.value); };
IN.tpLim = t => { const [id, ph] = t.dataset.k.split('|'); tpOf(id).lim[ph] = numIn(t.value); };
A.tpTog = el => { const [id, f, v] = el.dataset.v.split('|'), x = tpOf(id), arr = x[f]; if(arr.includes(v)) arr.splice(arr.indexOf(v), 1); else arr.push(v); if(f === 'ms' && !x.rates[v]) x.rates[v] = RATE['E.ON'][v] || RATE.GLA[v] || RATE.Redbridge[v] || 1000; render(); };
A.tpGroups = el => { const [id, v] = el.dataset.v.split('|'); tpOf(id).groups = v === '1'; render(); };
A.tpEdit = el => { S.f.tpe = el.dataset.v; render(true); };
A.tpBack = () => { S.f.tpe = null; render(true); };
const tpClone = (src, n) => { const t = JSON.parse(JSON.stringify(src)); t.id = 'TP-' + (++DB.seq.tp); t.n = n; DB.tpl.push(t); return t; };
A.tpDup = el => { const t = tpClone(tpOf(el.dataset.v), tpOf(el.dataset.v).n + ' (copy)'); S.f.tpe = t.id; render(true); toast('Template duplicated. Rename it and adjust what you need.'); };
A.tpFromSc = el => { const s = scOf(el.dataset.v), base = DB.tpl.find(t => t.ty === s.ty) || DB.tpl[0], t = tpClone(base, `${s.n} template`); t.set = {...s.set}; S.f.tpe = t.id; render(true); toast(`${esc(s.n)} saved as a template.`); };
A.tpNew = () => { S.modal = {k:'tp9', n:'', from:''}; renderLayer(); };
MODALS.tp9 = m => modal('New template', 'Start blank or from a template you already have, then set what it controls.', fld('Template name', 'm', 'n', m.n, {req:true, ph:'e.g. Warm Homes Local Grant type'}) + mlab('Start from', true) + mseg('from', m.from, [['blank', 'Blank'], ...DB.tpl.map(t => [t.id, t.n])]), mfoot('Create template', 'tpOk9', !!((m.n || '').trim() && m.from)), 560);
A.tpOk9 = () => { const m = S.modal; let t; if(m.from === 'blank'){ t = mkTpl('TP-' + (++DB.seq.tp), m.n.trim(), 'Blank'); t.ms = []; t.rates = {}; DB.tpl.push(t); } else t = tpClone(tpOf(m.from), m.n.trim()); S.modal = null; S.f.tpe = t.id; render(true); toast('Template created. Set what it controls.'); };
/* New scheme from a template: it takes the template’s client system, statuses, rates, settings and checklists */
A.nsOpenT = el => { const t = tpOf(el.dataset.v); S.f.tpe = null; S.modal = {k:'ns9', from:'', tpl:t.id, n:'', clid:'', reg:'', prog:t.sys === 'Dynamics' ? 'EON' : 'NONE', tgt:'', nn:'', nty:'', nreg:'', nsys:''}; renderLayer(); };
{ const oM = MODALS.ns9; MODALS.ns9 = m => { const h = oM(m); return m.tpl ? h.replace(/Blank: phases A and B, settings to fill in\.|Starting from[^<]*\./, `From the template ${esc(tpOf(m.tpl).n)}: its client system, statuses, rates, settings, time limits and checklists.`) : h; };
  const oOk = A.nsOk9; A.nsOk9 = el => { const tid = S.modal.tpl; oOk(el); if(!tid) return; const t = tpOf(tid), s = DB.sc[DB.sc.length - 1], key = t.groups ? 'Redbridge' : (PTYPE[t.ty] ? t.ty : 'TPL ' + t.id);
    if(key.startsWith('TPL')){ PTYPE[key] = {sys:t.sys, st:[...t.st], trig:t.trig, terms:t.set.terms}; RATE[key] = {...t.rates}; }
    else if(t.ty !== 'Blank' && !t.groups){ PTYPE[key] = PTYPE[key] || {sys:t.sys, st:[...t.st], trig:t.trig, terms:t.set.terms}; }
    s.ty = key.startsWith('TPL') ? key : (t.groups ? 'Redbridge' : t.ty); s.tpl = t.id; s.set = {...t.set}; s.log.push([TODAY, ME(), 'template', '', t.n]); render(); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/WD1suQVVVMD7UeWQk5cEKW'; } });
VERSIONS.push({v:'v3.15', date:TODAY, major:false, current:true, url:null, title:'Scheme templates you can see and build', sum:'New scheme setup shows what a template controls and lets a director create, duplicate and edit templates: client system and statuses, measures and rates, settings, time limits, checklists, install tracking and payment trigger.', steps:[
  {t:'Templates', min:1, dolor:'Before, a template was only a name pointing to a scheme.', show:['What a template controls, in seven parts.', 'New template, blank or from another; edit statuses, rates, settings, limits and checklists.', 'Use template creates the scheme with all of it.'], say:'A new programme is a template, set up once.', go:() => { S.role = 'dir'; S.f.tpe = null; go('dir', 'nsc'); }},
]});

/* =================== v3.16: schemes compared one per row; finance totals open their breakdown =================== */
function cmp(rows){ const ss = fSc();
  return grpH('Compare schemes side by side', ss.length) + `<div class="el-wide"><div class="rf-mx rf-cmpt"><table><thead><tr><th>Scheme</th>${rows.map(([l]) => `<th>${l}</th>`).join('')}</tr></thead><tbody>${ss.map(s => `<tr><td><button class="lnk4" data-act="ficha" data-v="${s.id}"><b>${esc(s.n)}</b></button><small class="mini" style="display:block">${esc((clOfSc(s) || {n:s.cl}).n)}</small></td>${rows.map(([, f]) => `<td>${f(s)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`; }
A.fdd = el => { const [kind, v] = el.dataset.v.split('|'); S.modal = {k:'fdd', kind, v}; renderLayer(); };
MODALS.fdd = m => { const ps = fPr(), pids = new Set(fPr(true).map(p => p.id));
  if(m.kind === 'ct'){ const ls = []; DB.or.filter(o => o.st !== 'Rejected' && o.ct === m.v).forEach(o => o.al.filter(a => a.pr && pids.has(a.pr)).forEach(a => ls.push({o, a}))); const tot = sum(ls, x => x.a.a);
    return modal(`${m.v}: ${fm(tot)}`, `Every order line with cost type ${m.v.toLowerCase()} behind this total, with the filters of the dashboard. Click a line to open its property’s money.`, `<div class="rf-tw">` + th(cell('Order', 'Supplier', 1.6) + cell('Property', 'Measure', 2) + cell('Status', '') + cell('Amount', '')) + ls.sort((x, y) => y.a.a - x.a.a).map(({o, a}) => rowO('fddGo', a.pr, cell(o.id, o.sup, 1.6) + cell(esc(prOf(a.pr).ad), `${MEAS[a.m] ? MEAS[a.m].n : ''}${o.al.length > 1 ? `, part of a split order of ${fm(o.amt)}` : ''}`, 2) + `<div class="mbc"><b>${pill(o.st === 'Invoiced' ? 'tg' : o.st === 'Requested' ? 'ta' : 'tk', o.st)}</b><small>${o.st === 'Invoiced' ? 'actual cost' : o.st === 'Requested' ? 'not committed yet' : 'committed'}</small></div>` + cell(fm(a.a), ''))).join('') + rdiv(cell('<b>Total</b>', plural(ls.length, 'line', 'lines'), 1.6) + cell('', '', 2) + cell('', '') + cell(fm(tot), '')) + '</div>', `<span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button>`, 820); }
  const rows = []; ps.forEach(p => p.ms.filter(x => x.m === m.v).forEach(x => { const mm = mMoney(p, x); rows.push({p, mm}); })); const tb = sum(rows, r => r.mm.b), ta = sum(rows, r => r.mm.act), tc = sum(rows, r => r.mm.com);
  return modal(`${MEAS[m.v].n}: budget ${fm(tb)}, actual and committed ${fm(ta + tc)}`, 'Per property with this measure, with the filters of the dashboard. Click a property to open its money down to the order lines.', `<div class="rf-tw">` + th(cell('Property', 'Scheme', 2.2) + cell('Budget', '') + cell('Actual', 'invoiced to us') + cell('Committed', 'ordered, not invoiced') + cell('Difference', 'against budget')) + rows.sort((x, y) => (y.mm.act + y.mm.com - y.mm.b) - (x.mm.act + x.mm.com - x.mm.b)).map(({p, mm}) => { const d = mm.act + mm.com - mm.b; return rowO('fddGo', p.id, cell(esc(p.ad), `${scOf(p.sc).n}, ${p.ph}`, 2.2) + cell(fm(mm.b), '') + cell(fm(mm.act), '') + cell(fm(mm.com), '') + `<div class="mbc"><b>${d > 0 ? pill('tred', '+' + fm(d)) : fm(d)}</b><small>${d > 0 ? 'over budget' : 'budget left'}</small></div>`); }).join('') + rdiv(cell('<b>Total</b>', plural(rows.length, 'property', 'properties'), 2.2) + cell(fm(tb), '') + cell(fm(ta), '') + cell(fm(tc), '') + cell(fm(ta + tc - tb), '')) + '</div>', `<span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button>`, 860); };
A.fddGo = el => { S.modal = null; abrir('dir', el.dataset.v, 'mon'); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/S4hRMziX5atofCzd9VAkP3'; } });
VERSIONS.push({v:'v3.16', date:TODAY, major:false, current:true, url:null, title:'Schemes compared by row; finance breakdowns', sum:'The scheme comparison shows one scheme per row, so it grows with new schemes. In Finance, spend by cost type and budget against actual open the lines behind each number.', steps:[
  {t:'Comparison and breakdowns', min:.5, dolor:'Before, the comparison grew sideways and finance totals were dead ends.', show:['One scheme per row, one figure per column.', 'Finance: click a cost type or a measure to see every order line or property behind it.'], say:'Every number opens what makes it up.', go:() => { S.role = 'dir'; go('dir', 'dfin'); }},
]});

/* =================== v3.17: templates with set triggers, ordered statuses and priced units; a guided new scheme; inherited checklists =================== */
/* Checklists: the scheme sets them for all its properties; a property can change its own */
function defChk(){ return {ev:[...EVID], docs:[...ADOCS], d:DITEMS.map(x => x[0]), hand:[...HAND]}; }
const CHKG = [['ev', 'RdSAP evidence', () => EVID, x => x], ['docs', 'Assessment documents', () => ADOCS, x => x], ['d', 'Phase D, before install', () => DITEMS.map(x => x[0]), x => (DITEMS.find(y => y[0] === x) || ['', x])[1]], ['hand', 'Handover pack', () => HAND, x => x]];
function effChk(p){ const s = scOf(p.sc) || {}, b = s.chk || defChk(), o = p.chk || {}; return {ev:o.ev || b.ev, docs:o.docs || b.docs, d:o.d || b.d, hand:o.hand || b.hand}; }
function evOf(p){ return effChk(p).ev; }
function docsOf(p){ return effChk(p).docs; }
function applyChk(p){ const e = effChk(p); DITEMS.forEach(([k]) => { p.dna[k] = !!(p.dna0 || {})[k] || !e.d.includes(k); }); HAND.forEach(h => { if(!e.hand.includes(h)){ if(p.hand[h] !== true) p.hand[h] = 'na'; } else if(p.hand[h] === 'na') delete p.hand[h]; }); }
DB.sc.forEach(s => { s.chk = s.chk || defChk(); s.trig = s.trig || 'cs_final'; });
DB.pr.forEach(p => { p.chk = p.chk || {}; p.dna0 = {...p.dna}; applyChk(p); });
const chkChips = (sel, all, lbl, act, key, base) => `<div class="rf-chips">${all.map(x => { const on = sel.includes(x), ch = base && base.includes(x) !== on; return `<button type="button" class="rf-chip2${on ? ' on' : ''}${ch ? ' ch' : ''}" data-act="${act}" data-v="${key}|${x}" title="${ch ? 'Changed on this property' : ''}">${on ? ico('check', 12, 2.6) : ''}${esc(lbl(x))}</button>`; }).join('')}</div>`;
function chkTab(app, p){ const s = scOf(p.sc), e = effChk(p), ed = ['dir', 'ret', 'del'].includes(app) && OPENP.includes(p.ph);
  return `<p class="hint" style="margin-top:0">Inherited from <b>${esc(s.n)}</b>. Change them here for this property only; changes on the scheme apply to every property except what was changed here.</p>` + CHKG.map(([g, n, all, lbl]) => { const own = !!(p.chk || {})[g]; return `<section class="rsec"><div class="rs-h"><h3>${n}</h3><p>${own ? 'Changed on this property' : 'As the scheme'}</p></div>${ed ? chkChips(e[g], all(), lbl, 'pchk', `${p.id}|${g}`, s.chk[g]) : `<div class="rf-chips">${e[g].map(x => `<span class="rf-chip2 on">${esc(lbl(x))}</span>`).join('')}</div>`}${own && ed ? `<button class="btn sec sm" data-act="pchkReset" data-v="${p.id}|${g}">Reset to the scheme</button>` : ''}</section>`; }).join(''); }
A.pchk = el => { const [id, g, x] = el.dataset.v.split('|'), p = prOf(id), s = scOf(p.sc), cur = [...effChk(p)[g]], on = cur.includes(x), nx2 = on ? cur.filter(y => y !== x) : [...cur, x];
  p.chk = p.chk || {}; if(nx2.length === s.chk[g].length && nx2.every(y => s.chk[g].includes(y))) delete p.chk[g]; else p.chk[g] = nx2; applyChk(p); his(p, `Checklist changed on this property: ${on ? 'removed' : 'added'} ${(CHKG.find(c => c[0] === g)[3])(x)}`, ME()); render(); };
A.pchkReset = el => { const [id, g] = el.dataset.v.split('|'), p = prOf(id); delete p.chk[g]; applyChk(p); his(p, `${CHKG.find(c => c[0] === g)[1]} reset to the scheme`, ME()); render(); toast('Back to the scheme’s checklist.'); };
A.schk = el => { const [id, g, x] = el.dataset.v.split('|'), s = scOf(id), arr = s.chk[g], on = arr.includes(x); if(on) arr.splice(arr.indexOf(x), 1); else arr.push(x); const ps = prsOf(id), own = ps.filter(p => (p.chk || {})[g]).length; ps.forEach(applyChk); s.log.push([TODAY, ME(), CHKG.find(c => c[0] === g)[1], on ? x : '', on ? 'removed' : x]); render(); toast(`Applied to ${plural(ps.length - own, 'property', 'properties')}${own ? `; ${own} keep their own changes` : ''}.`); };
/* Payment triggers: set options; when one is met the system creates the invoice as pending */
const handDone = p => HAND.filter(h => !(h.includes('solar') && !p.ms.some(x => x.m === 'SPV')) && p.hand[h] !== 'na').every(h => p.hand[h]);
const TRIGS = {cs_final:['The client system reaches its final status', p => p.cs >= ptOf(p).st.length - 1], installed:['Every measure installed and signed off', p => pIdx(p.ph) >= 5], handover:['Handover pack complete', p => p.ph === 'Paid' || (p.ph === 'F. Close out' && handDone(p))], lodged:['TrustMark lodgement recorded', p => p.hand['TrustMark lodgement'] === true]};
const trigName = (k, ty) => k === 'cs_final' && PTYPE[ty] ? `${PTYPE[ty].sys} shows “${PTYPE[ty].st[PTYPE[ty].st.length - 1]}”` : TRIGS[k][0];
DB.inv.forEach(v => { v.st = v.paid ? 'Paid' : 'Sent'; });
function runTriggers(){ const out = []; DB.pr.forEach(p => { if(['Cancelled', 'Paid'].includes(p.ph) || DB.inv.some(v => v.pr === p.id)) return; const s = scOf(p.sc), t = TRIGS[s.trig || 'cs_final']; if(t && t[1](p)){ const v = {id:'INV-' + (++DB.seq.inv), pr:p.id, amt:pMoney(p).q, on:TODAY, due:addDays(TODAY, s.set.terms), paid:null, st:'Pending'}; DB.inv.push(v); his(p, `The system created ${v.id} for ${fm(v.amt)} as pending: ${trigName(s.trig || 'cs_final', s.ty)}`, 'sys'); DB.runs.push([TODAY, 'acc', `created ${v.id} as pending for ${p.ad}`, p.id]); out.push(v); } }); return out; }
let booted = false;
function render(top){ const c = runTriggers(); render6(top); if(c.length && booted) toast(`<b>Automation:</b> The system created ${c.map(v => v.id).join(', ')} as pending for Accounts to review and send.`); }
setTimeout(() => { booted = true; }, 400);
A.invSend = el => { const v = DB.inv.find(x => x.id === el.dataset.v), p = prOf(v.pr), s = scOf(p.sc); v.st = 'Sent'; v.on = TODAY; v.due = addDays(TODAY, s.set.terms); his(p, `${v.id} sent to ${s.cl}, due ${fmtDy(v.due)}`, ME()); render(); toast(`${v.id} sent. Due ${fmtDy(v.due)} (${s.set.terms} days).`); };
{ const o = A.invPaid; A.invPaid = el => { o(el); const v = DB.inv.find(x => x.id === el.dataset.v); if(v) v.st = 'Paid'; }; }
function trgPage(){ const ps = DB.pr.filter(p => DB.inv.some(v => v.pr === p.id) && p.ph !== 'Cancelled'), pend2 = DB.inv.filter(v => v.st === 'Pending');
  return oph('Payment triggers', 'Each scheme has its trigger. When it is met, the system creates the invoice as pending; Accounts reviews it and sends it.', later('Xero')) + `<div class="cstats">${stat(pend2.length ? 'ta' : 'tk', 'Pending, to review', pend2.length, fm(sum(pend2, v => v.amt)))}${stat('tk', 'Owed to us', fm(sum(DB.sc, s => scMoney(s).owed)))}${stat('tred', 'Overdue', DB.inv.filter(v => v.st === 'Sent' && dDiff(v.due) < 0).length)}${stat('tk', 'Owed by us', fm(sum(DB.sc, s => scMoney(s).sup)))}</div>`
    + `<div class="rf-tw">` + th(cell('Property', 'Scheme', 2.2) + cell('Trigger met', '', 2.2) + cell('Invoice', 'Amount') + cell('Status', '') + '<div class="mbc" style="flex:0 0 190px"><b></b><small>Next step</small></div>') + ps.sort((a, b) => (DB.inv.find(v => v.pr === b.id).st === 'Pending') - (DB.inv.find(v => v.pr === a.id).st === 'Pending')).map(p => { const v = DB.inv.find(x => x.pr === p.id), s = scOf(p.sc); return rowO('prInv', p.id, tcell('prInv', p.id, esc(p.ad), s.n, 2.2) + cell(trigName(s.trig || 'cs_final', s.ty), '', 2.2) + cell(v.id, fm(v.amt)) + `<div class="mbc"><b>${v.st === 'Pending' ? pill('ta', 'Pending') : v.st === 'Paid' ? pill('tg', 'Paid') : dDiff(v.due) < 0 ? pill('tred', 'Overdue') : pill('tk', 'Sent')}</b><small>${v.st === 'Sent' ? 'due ' + fmtDy(v.due) : ''}</small></div>` + btns(v.st === 'Pending' ? nx('invSend', v.id, 'Review and send') : v.st === 'Sent' ? nx('invPaid', v.id, 'Mark paid', 'sec') : ''), S.hl === p.id); }).join('') + '</div>'; }
function alerts(){ const xs = alerts0().map(a => ({...a, app:a.app === 'pur' ? 'acc' : a.app})).filter(a => !(a.app === 'dir' && a.k === 'Approval above the limit') && !(a.k === 'Payment trigger met') && !S.dis[a.id]);
  HSD.filter(h => dDiff(h.exp) < 30).forEach(h => xs.push({id:'hs' + h.n + h.exp, app:'del', tone:'ta', k:'Expiring', t:h.n, d:`Expires ${fmtD(h.exp)}. HSSE lead to renew.`, fix:['Open health and safety', 'gogo', 'del:hs']}));
  DB.inv.filter(v => v.st === 'Pending').forEach(v => { const p = prOf(v.pr); xs.push({id:'ip' + v.id, app:'acc', tone:'tb', k:'Invoice pending', t:`${p.id} ${p.ad}`, d:`${v.id} for ${fm(v.amt)} created by the system when the trigger was met. Review it and send it to ${scOf(p.sc).cl}.`, fix:['Review and send', 'invSend', v.id]}); });
  return xs; }
/* Templates: trigger options, ordered statuses, measures with a priced unit */
const UNITS = ['per property', 'per m²', 'per kWp', 'per item', 'per window', 'per linear m'];
DB.tpl.forEach(t => { t.trigk = t.trigk || 'cs_final'; t.units = t.units || Object.fromEntries(t.ms.map(m => [m, 'per property'])); });
const TPINFO = 'What a template controls:\n1. Client system and its statuses, with reminders\n2. Measures, prices with their unit, budget cost\n3. Settings: margin target, limits, payment terms\n4. Time limits per phase\n5. Checklists: evidence, documents, phase D, handover\n6. Install tracking: by measure or by group\n7. Payment trigger: when the invoice is created';
const info = t => `<span class="rf-info" data-tt="${esc(t)}" tabindex="0">i</span>`;
function tpSecs(t){ t.units = t.units || {}; t.trigk = t.trigk || 'cs_final'; const k = f => `${t.id}|${f}`, chips = (list, sel, f, lbl = x => x) => `<div class="rf-chips">${list.map(x => `<button type="button" class="rf-chip2${sel.includes(x) ? ' on' : ''}" data-act="tpTog" data-v="${k(f)}|${x}">${sel.includes(x) ? ico('check', 12, 2.6) : ''}${esc(lbl(x))}</button>`).join('')}</div>`;
  return [
    ['sys', 'Client system and statuses', `<div class="rf-2">${cbx('Client system', 'tpsys|' + t.id, [['Dynamics', 'Dynamics'], ['Shareworks', 'Shareworks'], ['PAS Hub', 'PAS Hub'], ['None', 'None']], t.sys, 'tps')}</div><small class="rf-ph" style="margin-top:8px">Statuses, in order. Drag to reorder.</small><div class="rf-stlist" data-tp="${t.id}">${t.st.map((x, i) => `<div class="rf-stl" draggable="true" data-dragi="${i}"><span class="rf-grip" aria-hidden="true">${ico('list', 14)}</span><span class="rf-ck num">${i + 1}</span><input class="um-in" data-in="tpSt" data-k="${t.id}|${i}" value="${esc(x)}"><button class="ib" data-act="tpMv" data-v="${t.id}|${i}|-1" aria-label="Move up" ${i ? '' : 'disabled'}>${ico('chev', 13)}</button><button class="ib rf-dn" data-act="tpMv" data-v="${t.id}|${i}|1" aria-label="Move down" ${i < t.st.length - 1 ? '' : 'disabled'}>${ico('chev', 13)}</button><button class="ib" data-act="tpStDel" data-v="${t.id}|${i}" aria-label="Remove">${ico('x', 14)}</button></div>`).join('')}</div><button class="btn sec sm" data-act="tpStAdd" data-v="${t.id}">${ico('plus', 13)}Add status</button>`],
    ['trig', 'Payment trigger', `<p class="hint" style="margin-top:0">When this happens on a property, the system creates its invoice as pending for Accounts to review and send.</p><div class="rf-trg">${Object.entries(TRIGS).map(([tk, [n]]) => `<button type="button" class="rf-trc${t.trigk === tk ? ' on' : ''}" data-act="tpTrig" data-v="${t.id}|${tk}"><span class="rf-rad"></span><span><b>${n}</b><small>${tk === 'cs_final' ? `Here: ${t.sys === 'None' ? 'no client system set' : `${t.sys} shows “${t.st[t.st.length - 1]}”`}` : tk === 'installed' ? 'When the property reaches close out' : tk === 'handover' ? 'Every handover item in the checklist is done' : 'The TrustMark reference is recorded'}</small></span></button>`).join('')}</div>`],
    ['ms', 'Measures and prices', `<div class="el-wide rf-st"><div class="rf-mx"><table><thead><tr><th>Measure</th><th>In this template</th><th>Agreed price</th><th>Unit</th><th>Budget cost</th></tr></thead><tbody>${Object.keys(MEAS).map(m => { const on = t.ms.includes(m); return `<tr><td><b>${MEAS[m].n}</b></td><td><button type="button" class="rf-chip2${on ? ' on' : ''}" data-act="tpTog" data-v="${k('ms')}|${m}">${on ? ico('check', 12, 2.6) + 'Included' : 'Not included'}</button></td><td>${on ? `<label class="rf-uin pre"><em>£</em><input class="um-in" inputmode="decimal" data-in="tpRate" data-k="${t.id}|${m}" value="${t.rates[m] || ''}"></label>` : ''}</td><td>${on ? cbx('', 'tpu|' + t.id + '|' + m, UNITS.map(u => [u, u]), t.units[m] || 'per property', 'tpu') : ''}</td><td>${on && t.rates[m] ? `${fm(t.rates[m] * t.bud / 100)} <small class="mini">${t.units[m] || 'per property'}</small>` : ''}</td></tr>`; }).join('')}</tbody></table></div></div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px">${nx('msNew', t.id, 'Add a measure', 'sec')}<label class="rf-uin" style="max-width:220px"><input class="um-in" inputmode="decimal" data-in="tpBud" data-k="${t.id}" value="${t.bud}"><em>% budget</em></label></div>`],
    ['set', 'Settings', `<div class="el-wide rf-st"><div class="rf-mx"><table><thead><tr>${SETS.map(([, n]) => `<th>${n}</th>`).join('')}</tr></thead><tbody><tr>${SETS.map(([sk, , u, pre]) => `<td><label class="rf-uin${pre ? ' pre' : ''}">${pre ? `<em>${u}</em>` : ''}<input class="um-in" inputmode="decimal" data-in="tpSet" data-k="${t.id}|${sk}" value="${t.set[sk]}">${pre ? '' : `<em>${u}</em>`}</label></td>`).join('')}</tr></tbody></table></div></div>`],
    ['lim', 'Time limits per phase', `<div class="el-wide rf-st"><div class="rf-mx"><table><thead><tr>${OPENP.map(ph => `<th>${ph}</th>`).join('')}</tr></thead><tbody><tr>${OPENP.map(ph => `<td><label class="rf-uin"><input class="um-in" inputmode="decimal" data-in="tpLim" data-k="${t.id}|${ph}" value="${t.lim[ph]}"><em>days</em></label></td>`).join('')}</tr></tbody></table></div></div>`],
    ['chk', 'Checklists', `<p class="hint" style="margin-top:0">Every property of the scheme inherits them; each property can change its own.</p><small class="rf-ph">RdSAP evidence</small>${chips(EVID, t.ev, 'ev')}<small class="rf-ph">Assessment documents</small>${chips(ADOCS, t.docs, 'docs')}<small class="rf-ph">Phase D, before install</small>${chips(DITEMS.map(x => x[0]), t.d, 'd', x => DITEMS.find(y => y[0] === x)[1])}<small class="rf-ph">Handover pack</small>${chips(HAND, t.hand, 'hand')}`],
    ['grp', 'Install tracking', `<div class="seg2 um-seg">${[[false, 'By measure, with a progress percentage'], [true, 'By group, with hold points (Redbridge style)']].map(([v, n]) => `<button type="button" class="${t.groups === v ? 'on' : ''}" aria-pressed="${t.groups === v}" data-act="tpGroups" data-v="${t.id}|${v ? 1 : 0}">${n}</button>`).join('')}</div>`],
  ]; }
function tplEditor(t){ return crumb('tpBack', 'New scheme setup', esc(t.n)) + oph(esc(t.n) + ' ' + info(TPINFO), 'Everything a scheme made from this template starts with. Changes apply to new schemes; existing schemes keep their own.', nx('nsOpenT', t.id, 'Use template'))
  + `<section class="rsec"><div class="rs-h"><h3>Name</h3></div>${fld('Template name', 'tp', `${t.id}|n`, t.n, {req:true})}</section>` + tpSecs(t).map(([, n, h]) => `<section class="rsec"><div class="rs-h"><h3>${n}</h3></div>${h}</section>`).join(''); }
CBK.tpu = 'tpu';
IN.tpu = t => { const [, id, m] = t.dataset.k.split('|'); tpOf(id).units[m] = t.value; };
IN.tpBud = t => { tpOf(t.dataset.k).bud = numIn(t.value); refocus(render); };
A.tpTrig = el => { const [id, tk] = el.dataset.v.split('|'); tpOf(id).trigk = tk; render(); };
A.tpMv = el => { const [id, i, d] = el.dataset.v.split('|'), st = tpOf(id).st, a = +i, b = a + (+d); if(b < 0 || b >= st.length) return; [st[a], st[b]] = [st[b], st[a]]; render(); };
document.addEventListener('dragstart', e => { const r = e.target.closest && e.target.closest('.rf-stl[draggable]'); if(!r) return; S.f.dragi = +r.dataset.dragi; S.f.dragt = r.closest('.rf-stlist').dataset.tp; e.dataTransfer.effectAllowed = 'move'; r.classList.add('drag'); });
document.addEventListener('dragover', e => { const r = e.target.closest && e.target.closest('.rf-stl[draggable]'); if(r && S.f.dragt){ e.preventDefault(); document.querySelectorAll('.rf-stl.over').forEach(x => x.classList.remove('over')); r.classList.add('over'); } });
document.addEventListener('drop', e => { const r = e.target.closest && e.target.closest('.rf-stl[draggable]'); if(!r || !S.f.dragt) return; e.preventDefault(); const st = tpOf(S.f.dragt).st, from = S.f.dragi, to = +r.dataset.dragi; const [x] = st.splice(from, 1); st.splice(to, 0, x); S.f.dragt = null; render(); toast(`“${esc(x)}” moved to position ${to + 1}.`); });
document.addEventListener('dragend', () => { S.f.dragt = null; document.querySelectorAll('.rf-stl.drag, .rf-stl.over').forEach(x => x.classList.remove('drag', 'over')); });
A.msNew = el => { S.modal = {k:'ms10', tid:el.dataset.v, n:'', s:'', u:'per property', r:''}; renderLayer(); };
MODALS.ms10 = m => modal('Add a measure', 'It becomes available in every template; this template includes it with its price.', `<div class="rf-2">${fld('Measure name', 'm', 'n', m.n, {req:true, ph:'e.g. Air source heat pump'})}${fld('Short name', 'm', 's', m.s, {ph:'e.g. Heat pump'})}</div><div class="rf-2">${fld('Agreed price (£)', 'm', 'r', m.r, {type:'number', req:true})}${cbx('Unit', 'msu', UNITS.map(u => [u, u]), m.u, 'm', {req:true})}</div>`, mfoot('Add measure', 'msOk10', !!((m.n || '').trim() && numIn(m.r) > 0)), 600);
CBK.msu = 'u';
A.msOk10 = () => { const m = S.modal, t = tpOf(m.tid), code = (m.s || m.n).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'NEW'; let c = code, i = 2; while(MEAS[c]) c = code + i++; MEAS[c] = {n:m.n.trim(), s:(m.s || m.n).trim(), t:'tk'}; t.ms.push(c); t.rates[c] = numIn(m.r); t.units[c] = m.u; S.modal = null; render(); toast(`${esc(m.n.trim())} added at ${fm(numIn(m.r))} ${m.u}.`); };
/* New scheme from a template, step by step */
const WZ = ['Scheme', 'Client system and statuses', 'Payment trigger', 'Measures and prices', 'Settings', 'Time limits per phase', 'Checklists', 'Install tracking', 'Review and create'];
A.nsOpenT = el => { const src = tpOf(el.dataset.v), d = tpClone(src, src.n); d.draft = true; d.base = src.id; S.f.tpe = null; S.modal = null; S.f.wz = {tid:d.id, step:0, seen:[0], n:'', clid:'', reg:'', prog:d.sys === 'Dynamics' ? 'EON' : 'NONE', tgt:'', nn:'', nty:'', nreg:'', nsys:''}; S.page.dir = 'nsc'; S.fi.dir = null; render(true); };
const wzOk0 = w => (w.n || '').trim() && w.clid && w.reg && (w.clid !== '__new' || ((w.nn || '').trim() && w.nty && w.nreg));
function wzPage(){ const w = S.f.wz, t = tpOf(w.tid), src = tpOf(t.base), st = w.step, secs = tpSecs(t);
  const rail = `<div class="rf-wzr">${WZ.map((n, i) => `<button class="rf-wzs${i === st ? ' on' : ''}${w.seen.includes(i) && i !== st ? ' ok' : ''}" data-act="wzGo" data-v="${i}" ${w.seen.includes(i) || i <= Math.max(...w.seen) + (i === st + 1 && (st ? true : !!wzOk0(w)) ? 1 : 0) ? '' : 'disabled'}><span>${w.seen.includes(i) && i !== st ? ico('check', 12, 2.6) : i + 1}</span>${n}</button>`).join('')}</div>`;
  let body;
  if(st === 0) body = `<section class="rsec"><div class="rs-h"><h3>The scheme</h3><p>Starting from the template ${esc(src.n)}. Each next step shows what the template sets, to check or change before creating the scheme.</p></div>${fld('Scheme name', 'wz', 'n', w.n, {req:true, ph:'e.g. E.ON Swale'})}${cbx('Client', 'wzcl', [...DB.cl.map(c => [c.id, c.n, `${c.ty}, ${c.reg}`]), ['__new', '+ Add a new client', 'Not in the list yet']], w.clid, 'wz', {req:true, ph:'Choose the client...'})}${w.clid === '__new' ? `<div class="rf-newcl"><small class="rf-ph">New client</small>${fld('Client name', 'wz', 'nn', w.nn, {req:true})}${mlab('Type', true)}<div class="seg2 um-seg tw-mseg">${CLTYPES.map(x => `<button type="button" class="${w.nty === x ? 'on' : ''}" data-act="wzSet" data-v="nty|${x}">${x}</button>`).join('')}</div>${cbx('Region', 'wznreg', REGIONS.map(r => [r, r]), w.nreg, 'wz', {req:true})}</div>` : ''}<div class="rf-2">${cbx('Region', 'wzreg', REGIONS.map(r => [r, r]), w.reg, 'wz', {req:true, ph:'Choose a region...'})}${fld('Target properties', 'wz', 'tgt', w.tgt, {type:'number'})}</div>${mlab('Programme manager')}<div class="seg2 um-seg">${PROGS.map(p => `<button type="button" class="${w.prog === p.id ? 'on' : ''}" data-act="wzSet" data-v="prog|${p.id}">${p.n}</button>`).join('')}</div></section>`;
  else if(st < WZ.length - 1){ const [, n, h] = secs[st - 1]; body = `<section class="rsec"><div class="rs-h"><h3>${n}</h3><p>From ${esc(src.n)}. Check it, or change it for this scheme only; the template stays as it is.</p></div>${h}</section>`; }
  else { const clN = w.clid === '__new' ? w.nn : (DB.cl.find(c => c.id === w.clid) || {}).n; body = `<section class="rsec"><div class="rs-h"><h3>Review</h3><p>Everything the new scheme starts with.</p></div>${kv([['Scheme', esc(w.n), `${esc(clN || '')}, ${w.reg}`], ['Client system', t.sys, plural(t.st.length, 'status', 'statuses')], ['Payment trigger', TRIGS[t.trigk][0], 'creates the invoice as pending'], ['Measures', t.ms.map(m => MEAS[m].s).join(', ') || 'None', t.ms.map(m => `${fm(t.rates[m])} ${t.units[m]}`).join(', ')], ['Settings', `margin ${t.set.mg}%, terms ${t.set.terms} days`, `limits £${t.set.ord}, £${t.set.pay}, £${t.set.vr}`], ['Checklists', `${t.ev.length} evidence, ${t.docs.length} documents`, `${t.d.length} prep items, ${t.hand.length} handover items`], ['Install', t.groups ? 'By group with hold points' : 'By measure, with percentage', '']])}</section>`; }
  const nextOk = st === 0 ? wzOk0(w) : true;
  return crumb('wzCancel', 'New scheme setup', 'New scheme') + oph(`New scheme from ${esc(src.n)}`, `Step ${st + 1} of ${WZ.length}: ${WZ[st]}.`) + `<div class="rf-wz">${rail}<div>${body}<div class="rf-wzn">${st ? nx('wzNav', '-1', 'Back', 'sec') : nx('wzCancel', '', 'Cancel', 'sec')}${st < WZ.length - 1 ? `<button class="btn pri" data-act="wzNav" data-v="1" ${nextOk ? '' : 'disabled'}>${st ? 'Looks right, next' : 'Next'}: ${WZ[st + 1]}</button>` : nx('wzCreate', '', 'Create scheme')}</div></div></div>`; }
IN.wz = t => { const k = t.dataset.k, f = {wzcl:'clid', wzreg:'reg', wznreg:'nreg'}[k] || k; S.f.wz[f] = t.value; if(k === 'wzcl'){ const c = DB.cl.find(x => x.id === t.value); if(c && !S.f.wz.reg) S.f.wz.reg = c.reg; render(); } else if(k === 'wznreg'){ if(!S.f.wz.reg) S.f.wz.reg = t.value; render(); } else if(['n', 'nn', 'tgt'].includes(k)){ const b = document.querySelector('[data-act="wzNav"][data-v="1"]'); if(b) b.disabled = !wzOk0(S.f.wz); } else render(); };
A.wzSet = el => { const [f, v] = el.dataset.v.split('|'); S.f.wz[f] = v; render(); };
A.wzNav = el => { const w = S.f.wz; w.step = Math.max(0, Math.min(WZ.length - 1, w.step + (+el.dataset.v))); if(!w.seen.includes(w.step)) w.seen.push(w.step); render(true); };
A.wzGo = el => { const w = S.f.wz; w.step = +el.dataset.v; if(!w.seen.includes(w.step)) w.seen.push(w.step); render(true); };
A.wzCancel = () => { const w = S.f.wz; if(w) DB.tpl = DB.tpl.filter(t => t.id !== w.tid); S.f.wz = null; render(true); };
A.wzCreate = () => { const w = S.f.wz, t = tpOf(w.tid), src = tpOf(t.base), c = w.clid === '__new' ? addCl(w.nn, w.nty, w.nreg, t.sys) : DB.cl.find(x => x.id === w.clid), id = 'SC-' + String(DB.sc.length + 1).padStart(2, '0');
  const same = PTYPE[src.ty] && PTYPE[src.ty].sys === t.sys && PTYPE[src.ty].st.join('|') === t.st.join('|'), ty = t.groups ? 'Redbridge' : same ? src.ty : 'TPL ' + id; if(ty.startsWith('TPL')){ PTYPE[ty] = {sys:t.sys, st:[...t.st], trig:TRIGS[t.trigk][0], terms:t.set.terms}; RATE[ty] = {...t.rates}; }
  DB.sc.push({id, n:w.n.trim(), prog:w.prog, cl:c.n, ty, reg:w.reg, st:'Starting', tgt:numIn(w.tgt) || 0, lead:'dre', set:{...t.set}, trig:t.trigk, units:{...t.units}, rates:{...t.rates}, lim:{...t.lim}, chk:{ev:[...t.ev], docs:[...t.docs], d:[...t.d], hand:[...t.hand]}, tpl:src.id, log:[[TODAY, ME(), 'created', 'template', src.n]]});
  DB.tpl = DB.tpl.filter(x => x.id !== t.id); S.f.wz = null; abrir('dir', id, 'set'); toast(`${esc(w.n.trim())} created from ${esc(src.n)}, checked step by step. It already shows in the Director overview.`); };
function nscPage(){ if(S.f.wz && tpOf(S.f.wz.tid)) return wzPage(); const e = S.f.tpe && tpOf(S.f.tpe); if(e) return tplEditor(e); const tps = DB.tpl.filter(t => !t.draft && !t.hidden);
  return oph('New scheme setup ' + info(TPINFO), 'Create a scheme from a template, checking each part on the way, or copy an existing scheme.', `${nx('tpNew', '', 'New template', 'sec')}${nx('nsOpen', '', 'New scheme')}`)
    + grpH('Templates', tps.length) + `<div class="rf-tpg">${tps.map(t => { const used = DB.sc.filter(s => s.tpl === t.id || (!s.tpl && s.ty === t.ty)).length; return `<div class="rf-tpk"><div class="rf-tpkh"><b>${esc(t.n)}</b><small>${t.sys === 'None' ? 'No client system' : t.sys}, ${plural(used, 'scheme', 'schemes')}</small></div><div class="rf-tpkl"><span>${plural(t.ms.length, 'measure', 'measures')}</span><span>margin ${t.set.mg}%</span><span>${t.st.length} statuses</span><span>${t.groups ? 'install by group' : 'install by measure'}</span></div><small class="rf-tpt">Invoice when: ${esc(TRIGS[t.trigk][0].toLowerCase())}</small><div class="rf-tpkb">${nx('nsOpenT', t.id, 'Use template')}${nx('tpEdit', t.id, 'Edit', 'sec')}${nx('tpDup', t.id, 'Duplicate', 'sec')}</div></div>`; }).join('')}</div>`
    + grpH('Or copy an existing scheme', DB.sc.length) + DB.sc.map(s => rdiv(cell(s.n, `${s.ty.startsWith('TPL') ? 'Custom' : s.ty} type, ${s.cl}`, 2) + btns(nx('nsOpen', s.id, 'Copy', 'sec') + nx('tpFromSc', s.id, 'Save as template', 'sec')))).join(''); }
/* Scheme settings tab: payment trigger and checklists for every property */
function scFicha(app, s){ let h = scFicha0(app, s); if(S.ft !== 'set' || !['dir', 'com'].includes(app)) return h; const ps = prsOf(s.id), own = ps.filter(p => Object.keys(p.chk || {}).length).length;
  return h + `<section class="rsec"><div class="rs-h"><h3>Payment trigger</h3><p>When it is met on a property, the system creates the invoice as pending.</p></div><div class="rf-trg">${Object.entries(TRIGS).map(([tk, [n]]) => `<button type="button" class="rf-trc${(s.trig || 'cs_final') === tk ? ' on' : ''}" data-act="scTrig" data-v="${s.id}|${tk}"><span class="rf-rad"></span><span><b>${n}</b><small>${tk === 'cs_final' ? trigName(tk, s.ty) : ''}</small></span></button>`).join('')}</div></section>`
    + `<section class="rsec"><div class="rs-h"><h3>Checklists</h3><p>Apply to all ${plural(ps.length, 'property', 'properties')} of the scheme${own ? `; ${own} have their own changes, which they keep` : ''}.</p></div>${CHKG.map(([g, n, all, lbl]) => `<small class="rf-ph">${n}</small>${chkChips(s.chk[g], all(), lbl, 'schk', `${s.id}|${g}`)}`).join('')}</section>`; }
A.scTrig = el => { const [id, tk] = el.dataset.v.split('|'), s = scOf(id), old = s.trig; s.trig = tk; s.log.push([TODAY, ME(), 'payment trigger', TRIGS[old || 'cs_final'][0], TRIGS[tk][0]]); render(); toast(`Payment trigger set: ${TRIGS[tk][0].toLowerCase()}.`); };
/* Property card: the Checklists tab */
['dir', 'ret', 'del'].forEach(a => { const t = ATABS[a]; if(!t.some(x => x[0] === 'chk')) t.splice(t.findIndex(x => x[0] === 'upd'), 0, ['chk', 'Checklists']); });
function prFicha(app, p){ const tabs = (ATABS[app] || ATABS.dir).map(x => x[0] === 'upd' && (p.th || []).length ? ['upd', `Updates (${p.th.length})`] : x[0] === 'chk' && Object.keys(p.chk || {}).length ? ['chk', 'Checklists, changed'] : x), t = tabOf(tabs), sc = scOf(p.sc);
  let body = {res:prSum, mea:meaTab, ret:retTab, ins:insTab, clo:cloTab, mon:monTab, inv:invTab, upd:updTab, chk:chkTab, rsd:rsdTab, his:(a, x) => hisList(x.his)}[t](window.__eapp ? window.__eapp(app) : app, p);
  if(!canMoney(app) && ['res', 'mea'].includes(t)) body += lockCard();
  const g = phGate(p), canMove = OPENP.includes(p.ph);
  const acts = (canMove ? `<button class="btn ${g.ok ? 'pri' : 'sec warn'} ph52-btn" data-act="phNext" data-v="${p.id}" title="${g.ok ? 'Everything for this status is done' : esc('Still missing: ' + g.miss.join('; '))}">${ico(g.ok ? 'send' : 'alert', 15)}Move to ${nextPh52(p)}</button>` : '') + `<button class="btn sec" data-act="postOpen" data-v="${p.id}">Post an update</button>` + (OPENP.includes(p.ph) && ['del', 'ret', 'com', 'dir'].includes(app) ? `<button class="btn sec" data-act="cnOpen" data-v="${p.id}">Cancel job</button>` : '');
  return crumb('fichaback', 'Back', esc(p.ad)) + sameNote(app, p) + oph(esc(p.ad), `${p.id}, ${p.pc}, ${sc.n}. Customer ${esc(p.res)}. Client reference ${p.ref}${p.ht ? `, ${p.ht} house` : ''}.`, acts) + `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:-6px 0 14px">${phTag(p)}${mTags(p)}${lateTag(p)}${p.ph === 'D. Prepare to install' && ready(p) ? pill('tg', 'Ready to install') : ''}</div>` + shareBar4(p) + tabsBar(tabs) + body; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/9962Wj8bLY9HbAnhNnBFFq'; } });
VERSIONS.push({v:'v3.17', date:TODAY, major:false, current:true, url:null, title:'Templates, guided new schemes and inherited checklists', sum:'Templates have set payment triggers that create the invoice as pending, statuses you drag into order, measures you can add, and prices with a unit. A new scheme is created step by step from its template. Checklists come from the scheme, can be changed per property, and scheme changes reach every property.', steps:[
  {t:'Templates and the guided new scheme', min:1, dolor:'Before, triggers were free text, statuses could not be reordered and prices had no unit.', show:['Payment trigger from set options; when met, the invoice is created as pending.', 'Statuses dragged into order; measures added with a priced unit.', 'Use template walks through each part before creating the scheme.'], say:'Every scheme starts checked.', go:() => { S.role = 'dir'; S.f.wz = null; S.f.tpe = 'TP-1'; go('dir', 'nsc'); S.f.tpe = 'TP-1'; render(); }},
  {t:'Checklists by scheme and by property', min:.5, dolor:'Yahaya: each property inherits its checklists from the scheme and can change them; scheme changes reach every property.', show:['Scheme settings: change a checklist and it applies to every property.', 'Property, Checklists tab: change it for this property only, or reset to the scheme.'], say:'One change, every property, except where you said otherwise.', go:() => { S.role = 'dir'; abrir('dir', 'PR-2017', 'chk'); }},
]});

/* =================== v3.18: templates are edited as a draft and saved with Save template =================== */
const TPF = ['n', 'sys', 'st', 'trigk', 'ms', 'rates', 'units', 'bud', 'set', 'lim', 'ev', 'docs', 'd', 'hand', 'groups'];
const tpSnap = t => JSON.stringify(TPF.map(f => t[f]));
const tpDirty = d => d.isNew || (d.editOf && tpOf(d.editOf) && tpSnap(tpOf(d.editOf)) !== tpSnap(d));
A.tpEdit = el => { const src = tpOf(el.dataset.v), d = tpClone(src, src.n); d.draft = true; d.editOf = src.id; S.f.tpe = d.id; render(true); };
['tpOk9', 'tpDup', 'tpFromSc'].forEach(k => { const o = A[k]; A[k] = el => { o(el); const t = tpOf(S.f.tpe); if(t){ t.draft = true; t.isNew = true; t.editOf = null; render(); } }; });
const tpCheck = d => !(d.n || '').trim() ? 'Give the template a name.' : d.st.length < 2 ? 'Add at least two statuses.' : !d.ms.length ? 'Include at least one measure.' : d.ms.some(m => !(d.rates[m] > 0)) ? 'Every included measure needs a price.' : '';
function tpSave(id){ const d = tpOf(id), err = tpCheck(d); if(err){ toast(err); return null; } let keep;
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

/* =================== v3.19: meetings calendar like a real calendar: + on a day, time grid with click and drag =================== */
const MDUR = {'Monday team meeting':60, 'Thursday follow up':45, 'Tuesday directors':90};
DB.mt.forEach(m => { m.dur = m.dur || MDUR[m.ty] || 60; });
const tm2m = h => { const [a, b] = (h || '0:0').split(':').map(Number); return a * 60 + (b || 0); };
const m2tm = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const H0 = 7, H1 = 20, HH = 56;
function mtgPage5(app){ const id = S.f.mtd; if(id && mtOf(id) && mtSees(app, mtOf(id))) return mtDetail(app, mtOf(id));
  const v = S.f.mtv || 'list', xs = DB.mt.filter(m => mtSees(app, m));
  const head = oph('Meetings', app === 'dir' ? 'Monday and Thursday team meetings and the Tuesday directors’ meeting, grouped by where they stand, or on a calendar.' : 'Monday and Thursday team meetings, grouped by where they stand, or on a calendar. Money stays in the Tuesday directors’ meeting.', later('Fellow notes'))
    + `<div class="cstats">${MTST.map(([k, n]) => stat(k === 'pend' && xs.some(m => mtSt(m) === k) ? 'ta' : 'tk', n, xs.filter(m => mtSt(m) === k).length)).join('')}</div>`
    + `<div class="rf-bar">${seg('mtv', v, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}${v !== 'list' ? `${nx('mtNav', '-1', v === 'week' ? 'Previous week' : 'Previous month', 'sec')}${nx('mtNav', '0', 'Today', 'sec')}${nx('mtNav', '1', v === 'week' ? 'Next week' : 'Next month', 'sec')}` : ''}${v === 'week' ? '<small class="mini">Click or drag on the calendar to schedule a meeting.</small>' : v === 'month' ? '<small class="mini">Hover a day and press + to schedule.</small>' : ''}</div>`;
  if(v === 'list') return head + `<div class="rf-tw">` + th(cell('Date and time', '', 1.3) + cell('Meeting', '', 1.6) + cell('Attendees', '', 1.6) + cell('Status', '', 1.2) + cell('Action points', '', 1.3)) + MTST.map(([k, n]) => { const zs = xs.filter(m => mtSt(m) === k).sort((a, b) => ['today', 'up'].includes(k) ? (a.d + a.h < b.d + b.h ? -1 : 1) : (a.d + a.h > b.d + b.h ? -1 : 1)); return zs.length ? grpH(n, zs.length) + zs.map(m => rowO('mtOpen', m.id, cell(fmtDy(m.d), `${m.h} to ${m2tm(tm2m(m.h) + m.dur)}${m.d === TODAY ? ', today' : ''}`, 1.3) + tcell('mtOpen', m.id, m.ty, m.ty === 'Tuesday directors' ? 'Includes money' : 'No money', 1.6) + `<div class="mbc" style="flex:1.6">${avs(m.who)}<small>${plural(m.who.length, 'attendee', 'attendees')}</small></div><div class="mbc" style="flex:1.2"><b>${mtTag(m)}</b><small></small></div>` + cell(m.d >= TODAY && !mtActs(m).length ? '' : actsTxt(m), '', 1.3), S.hl === m.id)).join('') : ''; }).join('') + '</div>';
  const off = S.f.mto || 0;
  if(v === 'week'){ const mon = addDays(D0, off * 7), days = Array.from({length:5}, (_, i) => addDays(mon, i)), hrs = Array.from({length:H1 - H0}, (_, i) => H0 + i), nowM = 10 * 60 + 42;
    return head + `<div class="rf-tgw"><div class="rf-tgh"><div></div>${days.map(d => `<div class="${d === TODAY ? 'today' : ''}"><small>${DSH[fromIso(d).getDay()]}</small><b>${fromIso(d).getDate()}</b></div>`).join('')}</div><div class="rf-tg"><div class="rf-tgb" style="height:${(H1 - H0) * HH}px"><div class="rf-tgt">${hrs.map(h => `<span style="top:${(h - H0) * HH}px">${String(h).padStart(2, '0')}:00</span>`).join('')}</div>${days.map(d => `<div class="rf-tgcol${d === TODAY ? ' today' : ''}" data-d="${d}">${hrs.map(h => `<i class="rf-tgl" style="top:${(h - H0) * HH}px"></i>`).join('')}${d === TODAY ? `<i class="rf-now" style="top:${(nowM / 60 - H0) * HH}px"></i>` : ''}${xs.filter(m => m.d === d).map(m => { const t0 = tm2m(m.h), top = (t0 / 60 - H0) * HH, hgt = Math.max(22, m.dur / 60 * HH - 2); return `<button class="rf-tev mt-${mtSt(m)}" style="top:${top}px;height:${hgt}px" data-act="mtOpen" data-v="${m.id}" data-tt="${esc(m.ty)}, ${m.h} to ${m2tm(t0 + m.dur)}"><b>${esc(m.ty)}</b><small>${m.h} to ${m2tm(t0 + m.dur)}${hgt > 44 ? `, ${plural(m.who.length, 'attendee', 'attendees')}` : ''}</small></button>`; }).join('')}</div>`).join('')}</div></div></div>`; }
  const base = fromIso(D0), first = new Date(base.getFullYear(), base.getMonth() + off, 1), y = first.getFullYear(), mo = first.getMonth(), start = addDays(iso(first), -((first.getDay() + 6) % 7)), rows = Math.ceil(((first.getDay() + 6) % 7 + new Date(y, mo + 1, 0).getDate()) / 7), cells = Array.from({length:rows * 7}, (_, i) => addDays(start, i));
  const pend = xs.filter(m => mtSt(m) === 'pend'), nxt = xs.filter(m => m.d >= TODAY).sort((a, b) => a.d + a.h < b.d + b.h ? -1 : 1)[0];
  const cal = `<div class="rf-cal cm"><div class="rf-calh">${MSH[mo]} ${y}</div><div class="rf-mg">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="rf-mdh">${d}</div>`).join('')}${cells.map(d => { const es = xs.filter(m => m.d === d), dt = fromIso(d); return `<div data-date="${d}" class="rf-md${dt.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' today' : ''}"><small>${dt.getDate()}</small><button class="rf-dadd" data-act="mtAddDay" data-v="${d}" aria-label="Schedule a meeting on ${fmtDy(d)}" title="Schedule a meeting">${ico('plus', 14)}</button>${es.map(mtChip).join('')}</div>`; }).join('')}</div></div>`;
  return head + `<div class="rf-calw">${cal}<aside class="rf-cals"><b>Next meeting</b>${nxt ? `<div class="rf-tb"><div><b>${nxt.ty}</b><small>${fmtDy(nxt.d)}, ${nxt.h}</small></div>${avs(nxt.who)}${nx('mtOpen', nxt.id, 'Open', 'sec')}</div>` : '<small class="rf-free">None scheduled.</small>'}<b style="margin-top:6px">Summary pending</b><small>${plural(pend.length, 'meeting needs', 'meetings need')} its notes processed</small>${pend.map(m => `<div class="rf-tb"><div><b>${m.ty}</b><small>${fmtDy(m.d)}, ${m.h}</small></div>${nx('mtOpen', m.id, 'Open', 'sec')}</div>`).join('') || '<small class="rf-free">All summaries are ready.</small>'}<div class="rf-leg">${MTST.map(([k, n]) => `<span><i class="rf-ev mt-${k}"></i>${n}</span>`).join('')}</div></aside></div>`; }
/* Schedule: date, start and end */
const openMt = (d, h, end) => { S.modal = {k:'mt7', ty:'', name:'', d:d || '', h:h || '', end:end || '', who:[ME()], ag:''}; renderLayer(); };
A.mtNew = () => openMt('', '', '');
A.mtAddDay = el => openMt(el.dataset.v, '10:00', '11:00');
MODALS.mt7 = m => { const durOk = !(m.h && m.end) || tm2m(m.end) > tm2m(m.h), ok = m.ty && (m.ty !== 'Other meeting' || (m.name || '').trim()) && m.d && (m.h || '').trim() && (m.end || '').trim() && durOk && m.who.length;
  return modal('Schedule a meeting', 'It appears in Meetings for everyone invited, with its summary, decisions and action points after it happens.', mlab('Meeting', true) + mseg('ty', m.ty, MTYPES(S.view)) + (m.ty === 'Other meeting' ? fld('Name', 'm', 'name', m.name, {req:true, ph:'e.g. Waverley kick-off with the council'}) : '') + `<div class="rf-2">${fld('Date', 'm', 'd', m.d, {type:'date', req:true})}${fld('Start', 'm', 'h', m.h, {req:true, ph:'10:00'})}${fld('End', 'm', 'end', m.end, {req:true, ph:'11:00'})}</div>${durOk ? '' : '<p class="hint" style="color:#8A2C22">The end must be after the start.</p>'}`
    + mlab('Attendees', true) + `<div class="rf-ppl">${Object.entries(PEO).filter(([k]) => k !== 'kel' && (S.view === 'dir' || m.ty !== 'Tuesday directors')).map(([k, p]) => `<button type="button" class="rf-pp${m.who.includes(k) ? ' on' : ''}" data-act="mtWho" data-v="${k}">${av(k, 22)}<span><b>${p.n}</b><small>${p.r}</small></span></button>`).join('')}</div>` + area('Agenda', 'm', 'ag', m.ag, 'Optional: what the meeting will cover'), mfoot('Schedule', 'mtOk7', !!ok), 680); };
{ const o = A.mtOk7; A.mtOk7 = el => { const m = S.modal, dur = tm2m(m.end) - tm2m(m.h), wk = S.f.mtv === 'week'; o(el); const mt = DB.mt[DB.mt.length - 1]; mt.dur = dur > 0 ? dur : 60; if(wk){ S.f.mtd = null; render(); } }; }
{ const o = A.mset; A.mset = el => { const m = S.modal; if(m && m.k === 'mt7' && el.dataset.k === 'ty' && m.h && !m.endTouched && MDUR[el.dataset.v]){ o(el); m.end = m2tm(tm2m(m.h) + MDUR[el.dataset.v]); renderLayer(); return; } o(el); }; }
/* Click and drag on the week grid */
let drag = null;
const yToMin = (col, y) => { const r = col.getBoundingClientRect(), mins = H0 * 60 + (y - r.top) / HH * 60; return Math.max(H0 * 60, Math.min(H1 * 60, Math.round(mins / 15) * 15)); };
document.addEventListener('mousedown', e => { const col = e.target.closest && e.target.closest('.rf-tgcol'); if(!col || e.target.closest('.rf-tev') || e.button !== 0) return; e.preventDefault(); const a = yToMin(col, e.clientY); drag = {col, a, b:a + 15, moved:false}; const sel = document.createElement('div'); sel.className = 'rf-tsel'; col.appendChild(sel); drag.sel = sel; drawSel(); });
document.addEventListener('mousemove', e => { if(!drag) return; const b = yToMin(drag.col, e.clientY); if(b !== drag.b) drag.moved = true; drag.b = b; drawSel(); });
const drawSel = () => { const lo = Math.min(drag.a, drag.b), hi = Math.max(drag.a, drag.b) || drag.a + 15, top = (lo / 60 - H0) * HH, h = Math.max(15, hi - lo) / 60 * HH; Object.assign(drag.sel.style, {top:top + 'px', height:h + 'px'}); drag.sel.textContent = `${m2tm(lo)} to ${m2tm(Math.max(hi, lo + 15))}`; };
document.addEventListener('mouseup', () => { if(!drag) return; const d = drag; drag = null; let lo = Math.min(d.a, d.b), hi = Math.max(d.a, d.b); if(!d.moved || hi - lo < 15){ hi = lo + 60; } d.sel.remove(); openMt(d.col.dataset.d, m2tm(lo), m2tm(Math.min(hi, H1 * 60))); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && drag){ drag.sel.remove(); drag = null; } });
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/EReACy6ViY5e9vjqiJzFwy'; } });
VERSIONS.push({v:'v3.19', date:TODAY, major:false, current:true, url:null, title:'Meetings calendar: add from a day, drag to schedule', sum:'In the month view, hovering a day shows + to schedule a meeting on it. The week view is a time grid by hours where a click or a drag creates a meeting with its start and end.', steps:[
  {t:'Schedule from the calendar', min:.5, dolor:'Before, meetings could only be scheduled from a button.', show:['Month: hover a day and press +.', 'Week: a time grid by hours; click or drag over the hours to schedule.'], say:'Scheduling works like any calendar.', go:() => { S.role = 'dir'; S.f.mtd = null; S.f.mtv = 'week'; S.f.mto = 0; go('dir', 'mtg'); }},
]});

/* =================== v3.20: blank is a starting point among the templates; the header only creates templates =================== */
const hiddenTpl = (t) => { t.hidden = true; t.draft = false; return t; };
A.nsBlank = () => { const b = hiddenTpl(mkTpl('TP-' + (++DB.seq.tp), 'blank', 'Blank')); b.ms = []; b.rates = {}; b.units = {}; b.trigk = 'installed'; b.sys = 'None'; b.st = ['Received', 'In progress', 'Complete']; DB.tpl.push(b); A.nsOpenT({dataset:{v:b.id}}); };
A.nsCopy = el => { const s = scOf(el.dataset.v), base = DB.tpl.find(t => !t.hidden && !t.draft && t.ty === s.ty) || DB.tpl.find(t => !t.hidden && !t.draft), t = hiddenTpl(tpClone(base, s.n)); t.set = {...s.set}; t.trigk = s.trig || t.trigk; if(s.chk){ t.ev = [...s.chk.ev]; t.docs = [...s.chk.docs]; t.d = [...s.chk.d]; t.hand = [...s.chk.hand]; } if(PTYPE[s.ty]){ t.sys = PTYPE[s.ty].sys; t.st = [...PTYPE[s.ty].st]; } A.nsOpenT({dataset:{v:t.id}}); };
{ const o = VIEWS.dir.pages.nsc; VIEWS.dir.pages.nsc = () => { let h = o(); if(S.f.wz || S.f.tpe) return h;
  h = h.replace(`${nx('tpNew', '', 'New template', 'sec')}${nx('nsOpen', '', 'New scheme')}`, nx('tpNew', '', 'New template'));
  h = h.replace('<div class="rf-tpg">', `<div class="rf-tpg"><div class="rf-tpk rf-blank"><div class="rf-tpkh"><b>Blank</b><small>No client system, no measures</small></div><small class="rf-tpt">Set every part step by step: client system and statuses, trigger, measures and prices, settings, limits, checklists and install tracking.</small><div class="rf-tpkb">${nx('nsBlank', '', 'Start from blank')}</div></div>`);
  return h.replace(/data-act="nsOpen" data-v="(SC-\d+)"/g, 'data-act="nsCopy" data-v="$1"'); }; }
{ const o = VIEWS.dir.pages.nsc; VIEWS.dir.pages.nsc = () => { const h = o(); const w = S.f.wz, t = w && tpOf(w.tid), src = t && tpOf(t.base); return src && src.hidden ? h.replace(`New scheme from ${esc(src.n)}`, src.n === 'blank' ? 'New scheme from blank' : `New scheme, copied from ${esc(src.n)}`).replace('Each next step shows what the template sets, to check or change before creating the scheme.', src.n === 'blank' ? 'Set each part in the next steps.' : 'Each next step shows what it brings, to check or change.').replace(`Starting from the template ${esc(src.n)}.`, src.n === 'blank' ? 'Starting from blank.' : `Copied from the scheme ${esc(src.n)}.`).replace(new RegExp(`From ${esc(src.n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\. Check it`, 'g'), src.n === 'blank' ? 'Blank so far. Set it' : `As in ${esc(src.n)}. Check it`) : h; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/QFufp3dEVvJBYVXVqqs2fJ'; } });
VERSIONS.push({v:'v3.20', date:TODAY, major:false, current:true, url:null, title:'Blank among the templates', sum:'New scheme setup only creates templates from its header; starting from blank is a card among the templates, and copying a scheme also goes through the step by step setup.', steps:[
  {t:'Blank as a template', min:.3, dolor:'Before, New scheme in the header meant starting from blank.', show:['The header only has New template.', 'Blank is the first card among the templates; copying a scheme also goes step by step.'], say:'Every scheme starts from a template, even a blank one.', go:() => { S.role = 'dir'; S.f.wz = null; S.f.tpe = null; go('dir', 'nsc'); }},
]});

/* =================== v3.21: every app opens on its Overview =================== */
/* Three or four modules per app, chosen for the start of the day: key figures, what needs me now,
   my day (tasks and meetings) and one module of the app's own work. Everything acts in place or
   opens the list behind it, already filtered. Changes with Viewing as. */
const OV_ATN = {dir:'dec', com:'atn', acc:'atn', ret:'atn', del:'atn'};
const OV_ALL = {dir:'Alerts', com:'Needs attention', acc:'Needs attention', ret:'Needs attention', del:'Needs attention'};
const ovLink = (to, t) => `<button class="ov-more" data-act="gogo" data-v="${to}">${t}${ico('chev', 13)}</button>`;
const ovCard = (t, sub, body, foot = '', cls = '') => `<section class="ov-card${cls ? ' ' + cls : ''}"><div class="ov-h"><div><h3>${t}</h3>${sub ? `<p>${sub}</p>` : ''}</div></div><div class="ov-b">${body}</div>${foot ? `<div class="ov-f">${foot}</div>` : ''}</section>`;
const ovRow = (main, sub, side = '', acts = '', attrs = '') => `<div class="ov-r"${attrs}><div class="ov-rm"><b>${main}</b>${sub ? `<small>${sub}</small>` : ''}</div>${side ? `<div class="ov-rs">${side}</div>` : ''}${acts ? `<div class="ov-ra">${acts}</div>` : ''}</div>`;
const ovEmpty = t => `<div class="ov-e">${ico('check', 15)}<span>${t}</span></div>`;
const ovHello = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

/* Who is looking: their approvals, inside this app */
const ovWaitRoles = app => { const rs = WAITR[app] || []; return S.role === 'dir' ? rs : rs.filter(r => r === S.role); };

/* Module 2: what needs me now. Approvals first, then the most urgent alerts. Five at most. */
function ovNow(app){
  const ap = approvals().filter(a => ovWaitRoles(app).includes(a.role)), al = (typeof pend === 'function' ? pend(app) : []);
  const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}; const als = al.slice().sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
  const rows = ap.slice(0, 3).map(a => ovRow(esc(a.t), `Approval: ${a.k.toLowerCase()}${a.amt && canMoney(app) ? ', ' + fm(a.amt) : ''}`, '',
      `<button class="btn pri sm" data-act="${a.ok}" data-v="${esc(a.ref || (a.o ? a.o.id : a.p.id))}">Approve</button><button class="btn sec sm" data-act="apNo" data-v="${esc(a.no + '|' + (a.ref || (a.o ? a.o.id : a.p.id)))}">Reject</button>`))
    .concat(als.slice(0, Math.max(0, 5 - Math.min(ap.length, 3))).map(a => ovRow(esc(a.t), esc(a.d.length > 90 ? a.d.slice(0, 88) + '...' : a.d), pill(a.tone, a.k),
      `<button class="btn pri sm" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button><button class="btn sec sm" data-act="alseen" data-v="${a.id}">Seen</button>`)));
  const n = ap.length + al.length, foot = [ap.length && VIEWS[app].pages.wait ? ovLink(`${app}:wait`, `All approvals (${ap.length})`) : '', al.length ? ovLink(`${app}:${OV_ATN[app]}`, `${OV_ALL[app]} (${al.length})`) : ''].filter(Boolean).join('');
  return ovCard('Needs you now', n ? `${plural(n, 'item', 'items')} waiting, most urgent first.` : 'Nothing waiting on you.', rows.length ? rows.join('') : ovEmpty('All clear. Approvals and alerts for you will show up here.'), foot);
}

/* Module 3: my day. My tasks overdue, due today or in the next two days, and my next meetings. */
function ovDay(app){
  const me = ME(), mine = DB.tk.filter(k => !k.done && k.who === me), soon = mine.filter(k => dDiff(k.due) <= 2).sort((a, b) => (tkOver(b) - tkOver(a)) || (a.due < b.due ? -1 : 1));
  const tk = soon.slice(0, 4).map(k => ovRow(`<button class="ov-lk" data-act="tkView" data-v="${k.id}">${esc(k.t)}</button>`, k.pr ? esc(prOf(k.pr).ad) : (mtOf(k.src) ? `${mtOf(k.src).ty}, ${fmtDy(mtOf(k.src).d)}` : ''),
      tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', fmtDy(k.due)), nx('tkDone5', k.id, 'Mark done', 'sec')));
  const ms = DB.mt.filter(m => mtSees(app, m) && m.d >= TODAY && (m.who.includes(me) || S.role === 'dir')).sort((a, b) => a.d + a.h < b.d + b.h ? -1 : 1).slice(0, 2);
  const mt = ms.map(m => ovRow(esc(m.ty), `${m.d === TODAY ? 'Today' : fmtDy(m.d)}, ${m.h}. ${plural(m.who.length, 'attendee', 'attendees')}`, m.d === TODAY ? pill('ta', 'Today') : pill('tk', 'Upcoming'), nx('mtOpen', m.id, 'Open', 'sec')));
  const teamOver = app === 'dir' && S.role === 'dir' ? DB.tk.filter(tkOver).length : 0;
  const sub = `${plural(mine.length, 'open task', 'open tasks')} for ${PEO[me] ? PEO[me].n : RN(S.role)}${teamOver ? `; ${teamOver} overdue across the teams` : ''}.`;
  return ovCard('My day', sub,
    `<div class="ov-sub">Tasks</div>${tk.join('') || ovEmpty(mine.length ? 'Nothing due in the next two days.' : 'No open tasks.')}<div class="ov-sub">Next meetings</div>${mt.join('') || ovEmpty('No meetings scheduled.')}`,
    ovLink(`${app}:tasks`, `My tasks (${mine.length})`) + ovLink(`${app}:mtg`, 'Meetings'));
}

/* Module 1: key figures, four per app. Each one opens the list behind it. */
function ovKpis(app){
  const open = DB.pr.filter(p => OPENP.includes(p.ph)), K = (tone, t, v, s, to) => stat(tone, t, v, s, 'gogo', to);
  if(app === 'dir'){ const ms = DB.sc.map(scMoney), won = sum(ms, x => x.won), fc = sum(ms, x => x.fc), owed = sum(ms, x => x.owed), od = DB.inv.filter(v => v.st !== 'Paid' && !v.paid && dDiff(v.due) < 0), lt = open.filter(p => late(p) === 'red');
    return [K('tk', 'Value won', fk(won), 'approved by clients', 'dir:dbiz'), K(won && (won - fc) / won * 100 < 22 ? 'ta' : 'tk', 'Forecast margin', pc(won ? (won - fc) / won * 100 : 0), 'across all schemes', 'dir:dfin'), K(od.length ? 'tred' : 'tk', 'Owed to us', fk(owed), od.length ? `${fk(sum(od, v => v.amt))} overdue` : 'nothing overdue', 'acc:inv'), K(lt.length ? 'tred' : 'tk', 'Jobs over time', lt.length, `of ${open.length} open properties`, 'dir:dops')]; }
  if(app === 'com'){ const ps = DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled'), m = ps.map(p => [p, pMoney(p)]), q = sum(m, x => x[1].q), fc = sum(m, x => x[1].fc), below = m.filter(([p, x]) => x.q && x.mgp < scOf(p.sc).set.mg).length, over = m.filter(x => x[1].over).length, va = DB.va.filter(v => !['Approved', 'Rejected'].includes(v.st));
    return [K('tk', 'Forecast margin', pc(q ? (q - fc) / q * 100 : 0), `on ${fk(q)} quoted`, 'com:mrg'), K(below ? 'tred' : 'tk', 'Below target', below, 'under the scheme target', 'com:atn'), K(over ? 'ta' : 'tk', 'Over budget', over, 'a measure over budget', 'com:atn'), K(va.length ? 'ta' : 'tk', 'Variations open', va.length, va.length ? fk(sum(va, v => v.amt)) + ' waiting' : 'nothing waiting', 'com:var')]; }
  if(app === 'acc'){ const un = DB.inv.filter(v => v.st !== 'Paid' && !v.paid), od = un.filter(v => dDiff(v.due) < 0), pe = DB.inv.filter(v => v.st === 'Pending'), mt = DB.or.filter(o => o.st === 'Delivered' && !o.inv);
    return [K('tk', 'Owed to us', fk(sum(un, v => v.amt)), plural(un.length, 'invoice', 'invoices') + ' open', 'acc:inv'), K(od.length ? 'tred' : 'tk', 'Overdue', fk(sum(od, v => v.amt)), plural(od.length, 'invoice', 'invoices'), 'acc:inv'), K(pe.length ? 'ta' : 'tk', 'To review and send', pe.length, 'created when the trigger was met', 'acc:trg'), K(mt.length ? 'ta' : 'tk', 'Supplier invoices to match', mt.length, 'delivered, not matched', 'acc:sup')]; }
  if(app === 'ret'){ const a = DB.pr.filter(p => p.ph === 'A. Job received'), tb = a.filter(p => !p.b.bk), wk = DB.pr.filter(p => p.b.on && dDiff(p.b.on) >= 0 && dDiff(p.b.on) <= 7), rv = approvals().filter(x => ['aap', 'dap'].includes(x.role)), lt = DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && late(p));
    return [K(tb.length ? 'ta' : 'tk', 'To book', tb.length, 'jobs received, no visit yet', 'ret:bk'), K('tk', 'Visits this week', wk.length, 'booked in the next 7 days', 'ret:bk'), K(rv.length ? 'ta' : 'tk', 'Waiting for review', rv.length, 'assessments and designs', 'ret:wait'), K(lt.length ? 'tred' : 'tk', 'Over time', lt.length, 'in phases A and B', 'ret:atn')]; }
  const rd = DB.pr.filter(p => p.ph === 'D. Prepare to install' && ready(p)), ho = DB.pr.filter(p => p.ph === 'E. Install' && holdOpen(p)), cs = DB.pr.filter(p => p.csTodo), oq = DB.or.filter(o => o.st === 'Requested');
  return [K(rd.length ? 'tg' : 'tk', 'Ready to install', rd.length, 'every phase D item done', 'del:rdy'), K(ho.length ? 'tred' : 'tk', 'Hold points open', ho.length, 'blocking the next group', 'del:hold'), K(cs.length ? 'ta' : 'tk', 'Client systems to update', cs.length, 'Dynamics, Shareworks, PAS Hub', 'del:cs'), K(oq.length ? 'ta' : 'tk', 'Orders requested', oq.length, 'waiting for approval', 'del:ord')];
}

/* Module 4: the app's own work, short */
function ovWork(app){
  if(app === 'dir'){ const rows = DB.sc.map(s => { const m = scMoney(s), [rt, rl] = rating(s), ps = prsOf(s.id).filter(p => OPENP.includes(p.ph)), lt = ps.filter(p => late(p)).length;
      return ovRow(`<button class="ov-lk" data-act="ficha" data-v="${s.id}">${esc(s.n)}</button>`, `${plural(ps.length, 'open property', 'open properties')}${lt ? `, ${lt} over time` : ''}`, `${m.won ? `<span class="ov-num">${pc(m.mgp)}<small>target ${pc(s.set.mg)}</small></span>` : ''}${pill(rt, rl)}`); });
    return ovCard('Schemes at a glance', 'Rating, forecast margin against target and open work. Open a scheme to drill down.', rows.join(''), ovLink('dir:sch', 'All schemes') + ovLink('dir:dbiz', 'Business overview'), 'ov-wide'); }
  if(app === 'com'){ const rows = DB.sc.map(s => { const m = scMoney(s), bl = prsOf(s.id).filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled' && pMoney(p).q && pMoney(p).mgp < s.set.mg).length;
      return m.won ? ovRow(esc(s.n), `${fk(m.won)} quoted${bl ? `, ${plural(bl, 'property', 'properties')} below target` : ''}`, `<span class="ov-num">${mgTag(m.mgp, s.set.mg)}<small>target ${pc(s.set.mg)}</small></span>`, nx('gogo', 'com:mrg', 'Margins', 'sec')) : ''; }).filter(Boolean);
    return ovCard('Margin per scheme', 'Forecast margin against each scheme’s target.', rows.join('') || ovEmpty('No approved quotes yet.'), ovLink('com:mrg', 'Margins') + ovLink('com:quo', 'Quotes and budgets'), 'ov-wide'); }
  if(app === 'acc'){ const xs = DB.inv.filter(v => v.st !== 'Paid' && !v.paid).sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 5);
    const rows = xs.map(v => { const p = prOf(v.pr), od = dDiff(v.due) < 0; return ovRow(`${v.id}, ${esc(p.ad)}`, `${scOf(p.sc).n}, due ${fmtDy(v.due)}`, `<span class="ov-num">${fm(v.amt)}</span>${v.st === 'Pending' ? pill('ta', 'Pending') : od ? pill('tred', `${-dDiff(v.due)} days overdue`) : pill('tk', 'Sent')}`, v.st === 'Pending' ? nx('invSend', v.id, 'Review and send') : nx('invPaid', v.id, 'Mark paid', 'sec')); });
    return ovCard('Invoices to chase', 'Open invoices, the earliest due first.', rows.join('') || ovEmpty('Every invoice is paid.'), ovLink('acc:inv', 'Invoices') + ovLink('acc:trg', 'Payment triggers'), 'ov-wide'); }
  if(app === 'ret'){ const mine = S.role === 'ass' ? ME() : null, xs = DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && (!mine || p.b.who === mine)).filter(p => !p.b.bk || (p.b.on && dDiff(p.b.on) >= -1 && dDiff(p.b.on) <= 7)).sort((a, b) => (a.b.on || '0') < (b.b.on || '0') ? -1 : 1).slice(0, 6);
    const rows = xs.map(p => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${p.id}">${esc(p.ad)}</button>`, `${scOf(p.sc).n}, ${p.ref}`, p.b.bk ? `<span class="ov-num">${p.b.on === TODAY ? 'Today' : fmtDy(p.b.on)}<small>${p.b.h || ''}${p.b.who ? ', ' + PEO[p.b.who].n : ''}</small></span>${p.b.revisits ? pill('ta', 'Revisit') : pill('tb', 'Booked')}` : pill('ta', 'To book'), p.b.bk ? '' : nx('gogo', 'ret:bk', 'Book', 'sec')));
    return ovCard(mine ? 'My visits' : 'Assessments this week', mine ? 'Your booked visits and revisits for the next 7 days.' : 'Jobs to book and visits booked for the next 7 days.', rows.join('') || ovEmpty('No visits this week.'), ovLink('ret:bk', 'Bookings') + ovLink('ret:rq', 'Review queue'), 'ov-wide'); }
  const xs = DB.pr.filter(p => (p.ph === 'D. Prepare to install' && ready(p)) || p.ph === 'E. Install').sort((a, b) => (holdOpen(b) - holdOpen(a)) || (pIdx(a.ph) - pIdx(b.ph))).slice(0, 6);
  const rows = xs.map(p => { const rb = tyOf(p) === 'Redbridge', pct = rb ? grpPct(p) : Math.round(sum(p.ms, x => x.ip) / Math.max(1, p.ms.length));
    return ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${p.id}">${esc(p.ad)}</button>`, `${scOf(p.sc).n}${rb && p.ht ? ', ' + p.ht : ''}`, p.ph === 'D. Prepare to install' ? pill('tg', 'Ready to install') : `<span class="ov-num">${pct}%<small>installed</small></span>${holdOpen(p) ? pill('tred', 'Hold point') : isBlocked(p) ? pill('ta', 'Blocked') : pill('tb', 'On site')}`, p.ph === 'D. Prepare to install' ? nx('phNext', p.id, 'Start install') : ''); });
  return ovCard('On site this week', 'Properties installing now and those ready to start.', rows.join('') || ovEmpty('Nothing on site.'), ovLink('del:pro', 'Properties') + ovLink('del:hold', 'Redbridge tracker'), 'ov-wide');
}

function ovPage(app){
  const nm = PEO[ME()] ? PEO[ME()].n.split(' ')[0] : RN(S.role);
  return oph(`${ovHello()}, ${nm}`, `${APPN[app]}: what needs you today. Every figure and row opens the list behind it.`)
    + `<div class="cstats ov-k">${ovKpis(app).join('')}</div>`
    + `<div class="ov-g">${ovNow(app)}${ovDay(app)}${ovWork(app)}</div>`;
}

/* Menu: Overview first, then My tasks and Meetings. The old Delivery overview becomes part of the new one. */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side, act = pageAct(a);
  VIEWS[a].side = () => { let h = o().replace(new RegExp(`<button class="nav" data-act="${act}" data-v="(ovw|hom)"[\\s\\S]*?</button>`, 'g'), '');
    return h.replace('<aside class="sb">', '<aside class="sb">' + sbItem(S.page[a], act)(['ovw', 'Overview', 'grid'])); };
  VIEWS[a].pages.ovw = () => ovPage(a); HOME[a] = 'ovw'; S.page[a] = 'ovw'; });
/* Entering an app, switching app or changing Viewing as always lands on Overview */
{ const ov = A.view, os = A.setRole, oh = A.goHome;
  A.view = el => { const a = el.dataset.v; if(VIEWS[a] && HOME[a] === 'ovw'){ S.page[a] = 'ovw'; S.fi[a] = null; } ov(el); };
  A.setRole = el => { ['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { S.page[a] = 'ovw'; S.fi[a] = null; }); os(el); };
  if(oh) A.goHome = el => { ['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { S.page[a] = 'ovw'; S.fi[a] = null; }); oh(el); }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/DBM2cr94ddA4x36wdNFtnQ'; } });
VERSIONS.push({v:'v3.21', date:TODAY, major:false, current:true, url:null, title:'Every app opens on its Overview', sum:'Each app starts on a short Overview: four key figures, what needs you now, your day and the app’s own work this week. Everything acts in place or opens the list behind it.', steps:[
  {t:'Overview first, in every app', min:.5, dolor:'Before, every app opened on My tasks and the key figures were two clicks away.', show:['Overview is the first item in the menu and where each app opens.', 'Four figures; each one opens the list behind it.'], say:'The day starts with what matters, in one screen.', go:() => { S.role = 'dir'; go('dir', 'ovw'); }},
  {t:'Needs you now', min:.5, dolor:'Before, approvals and alerts were in separate pages.', show:['Approve or reject, or fix an alert, without leaving the Overview.', 'The links below open the full lists.'], say:'Act on it where you see it.', go:() => { S.role = 'inc'; go('del', 'ovw'); }},
  {t:'My day', min:.5, dolor:'Before, tasks and meetings were two pages.', show:['Your tasks overdue, due today or in the next two days, with Mark done.', 'Your next two meetings.'], say:'Each person sees their own day; change Viewing as to see someone else’s.', go:() => { S.role = 'aap'; go('ret', 'ovw'); }},
  {t:'The app’s own work', min:.5, dolor:'Before, the work of the week was spread across several lists.', show:['Director: schemes at a glance. Commercial: margin per scheme. Accounts: invoices to chase. Retrofit: assessments this week. Delivery: on site this week.'], say:'One short list of what each team works on this week.', go:() => { S.role = 'acc'; go('acc', 'ovw'); }},
]});

/* =================== v3.22: Progress by team, and a way back =================== */
/* The director reads each team's progress in one place, with the same structure for every team.
   Nothing is copied: every figure and view opens the team's own screen, with a bar to come back. */

/* Back bar: jumps from the content keep the trail; the menu, the app switcher and Viewing as clear it */
S.trail = null;
const trLabel = (a, p) => { const m = (VIEWS[a] && VIEWS[a].side ? VIEWS[a].side() : '').match(new RegExp(`data-v="${p}"[^>]*>(?:<span class="ni">[\\s\\S]*?</span>)?([^<]+)`)); return m ? m[1].trim() : (p === 'ovw' ? 'Overview' : p); };
const trBar = () => S.trail ? `<div class="tr-back"><button data-act="trBack"><span class="tr-ic">${ico('chev', 14)}</span>Back to ${APPN[S.trail.app]}, ${esc(S.trail.lbl)}</button></div>` : '';
const PRGL = {pcom:'Commercial progress', pret:'Retrofit progress', pdel:'Delivery progress'};
const trPush = () => { const pg = S.page[S.view]; S.trail = {app:S.view, page:pg, lbl:S.view === 'dir' && PRGL[pg] ? PRGL[pg] : trLabel(S.view, pg)}; };
A.trBack = () => { const t = S.trail; S.trail = null; if(t) go(t.app, t.page); };
A.trGo = el => { const [a, p] = el.dataset.v.split(':'); if(!allowed(a)) return toast(`${APPN[a]} is not available for ${RN(S.role)}.`); trPush(); go(a, p); };
{ const og = A.gogo; A.gogo = el => { const [a, p] = el.dataset.v.split(':'); if(allowed(a) && (a !== S.view || p !== S.page[S.view])) trPush(); og(el); }; }
{ const ov = A.view, os = A.setRole; A.view = el => { S.trail = null; ov(el); }; A.setRole = el => { S.trail = null; os(el); }; }
APPS.forEach(([a]) => { const k = pageAct(a), o = A[k]; if(o) A[k] = el => { S.trail = null; o(el); }; });

/* Shared pieces of a team progress page. v3.23: monitoring from the Director app.
   Filter by programme and scheme; each figure opens, right here, the list behind it; rows open the record in the panel. */
const prgF = v => Number.isInteger(v) ? String(v) : v.toFixed(1);
const prgView = (team, to, t, d) => `<div class="pg-v"><div><b>${t}</b><small>${d}</small></div>${nx('trGo', to, `Open in ${APPN[team]}`, 'sec')}</div>`;
const pgRow = (p, side) => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${p.id}">${esc(p.ad)}</button>`, `${scOf(p.sc).n}, ${p.ph}`, side);
const prgStuck = (p, why, tone) => pgRow(p, pill(tone, why));
const prgPlan = team => { const live = fSc().filter(s => s.st === 'Live'), t = sum(live, s => s.tgt || 0); return Math.max(1, Math.round(t / ({ret:40, del:52}[team] || 40))); };
const inSc = p => p && fSc().some(s => s.id === p.sc);
A.pgK = el => { S.f.pgk = S.f.pgk === el.dataset.v ? null : el.dataset.v; render(); };
function prgPage(team, line, kpis, ch, stuck, views, dash){
  const d = DD(), sel = kpis.find(k => S.f.pgk === `${team}:${k[0]}`), rows = sel ? sel[5]() : [];
  const flt = `<div class="rf-df pg-df">${cbx('Programme', 'dfpg', [['', 'All programmes'], ...PROGS.map(x => [x.id, x.n])], d.pg, 'df')}${cbx('Scheme and client', 'dfsc', [['', 'All schemes'], ...DB.sc.filter(x => !d.pg || x.prog === d.pg).map(x => [x.id, x.n, x.cl])], d.sc, 'df')}${d.pg || d.sc ? `<div class="pg-clr">${nx('dReset', '', 'Clear filters', 'sec')}</div>` : ''}</div>`;
  return oph(`${APPN[team]} progress`, line) + flt
    + `<div class="cstats ov-k">${kpis.map(([k, tone, l, v, ss]) => stat(tone, l, v, ss, 'pgK', `${team}:${k}`, S.f.pgk === `${team}:${k}`)).join('')}</div>`
    + (sel ? `<div class="pg-det">${ovCard(sel[2], `${plural(rows.length, 'item', 'items')}${d.sc ? ' in ' + esc(scOf(d.sc).n) : ''}. Open a row to see the full record; click the figure again to close.`, rows.slice(0, 12).join('') || ovEmpty('Nothing here.'), rows.length > 12 ? `<small class="pg-n">and ${rows.length - 12} more</small>` : '')}</div>` : '')
    + ch
    + `<div class="ov-g">${ovCard('Stuck or at risk', stuck.length ? `${plural(stuck.length, 'item', 'items')}, the most urgent first.` : 'Nothing stuck.', stuck.slice(0, 6).join('') || ovEmpty('Nothing over its limit.'), stuck.length > 6 ? `<small class="pg-n">and ${stuck.length - 6} more</small>` : '')}`
    + ovCard(`In the ${APPN[team]} app`, `Only when you need the team’s full screen. It opens in their app in monitoring mode, with a bar to come back.`, views.join(''), dash.map(([to, t]) => ovLink(to, t)).join('')) + '</div>';
}

function pgCom(){ const ps = fPr().filter(p => pIdx(p.ph) >= 2), m = ps.map(p => [p, pMoney(p)]).filter(x => x[1].q), q = sum(m, x => x[1].q), fc = sum(m, x => x[1].fc), mg = q ? (q - fc) / q * 100 : 0;
  const scs = fSc().filter(s => scMoney(s).won), tg = scs.length ? sum(scs, s => s.set.mg) / scs.length : 22, below = m.filter(([p, x]) => x.mgp < scOf(p.sc).set.mg), over = m.filter(x => x[1].over), va = DB.va.filter(v => inSc(prOf(v.pr)) && !['Approved', 'Rejected'].includes(v.st)), b = buckets();
  const mgSide = ([p, x]) => `<span class="ov-num">${mgTag(x.mgp, scOf(p.sc).set.mg)}<small>target ${pc(scOf(p.sc).set.mg)}</small></span>`;
  const stuck = below.map(([p, x]) => prgStuck(p, `Margin ${pc(x.mgp)}, target ${pc(scOf(p.sc).set.mg)}`, 'tred')).concat(over.filter(([p]) => !below.some(y => y[0] === p)).map(([p]) => prgStuck(p, 'Over budget', 'ta')));
  return prgPage('com', 'Is the work making money? Margins against target, budgets and the changes that move them.',
    [['mg', mg < tg ? 'ta' : 'tk', 'Forecast margin', pc(mg), `average target ${pc(tg)}`, () => m.slice().sort((a, b2) => a[1].mgp - b2[1].mgp).map(x => pgRow(x[0], mgSide(x)))],
     ['below', below.length ? 'tred' : 'tk', 'Below target', below.length, 'properties', () => below.map(x => pgRow(x[0], mgSide(x)))],
     ['over', over.length ? 'ta' : 'tk', 'Over budget', over.length, 'properties', () => over.map(([p, x]) => pgRow(p, `<span class="ov-num">${fk(x.fc)}<small>budget ${fk(x.b)}</small></span>${pill('ta', 'Over budget')}`))],
     ['va', va.length ? 'ta' : 'tk', 'Variations and costs open', fk(sum(va, v => v.amt)), plural(va.length, 'item', 'items'), () => va.map(v => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${v.pr}">${v.id}, ${esc(prOf(v.pr).ad)}</button>`, `${v.ty}: ${esc(v.why)}`, `<span class="ov-num">${fm(v.amt)}</span>${pill('ta', esc(v.st))}`))]],
    chart(tvals(mg, 'cmg', b.n).map(v => Math.round(v)), b.lab, pc, `Forecast margin by ${DD().tr}, against the average target`, Array(b.n).fill(Math.round(tg)), ['Forecast margin', 'Target']),
    stuck,
    [prgView('com', 'com:mrg', 'Margins', 'Forecast and actual margin per scheme and property.'), prgView('com', 'com:quo', 'Quotes and budgets', 'Quote, budget, committed and forecast cost per measure.'), prgView('com', 'com:var', 'Variations and costs', 'What moves the margin, and what the client pays back.')],
    [['dir:dsup', 'Suppliers'], ['dir:dperf', 'Scheme performance']]); }

function pgRet(){ const ps = fPr(), as = ps.filter(p => p.b.vis), rvp = ps.filter(p => p.b.revisits), rv = sum(rvp, p => p.b.revisits), rft = as.length ? Math.round((as.length - Math.min(rv, as.length)) / as.length * 100) : 100;
  const rq = approvals().filter(a => ['aap', 'dap'].includes(a.role) && inSc(a.p)), pk = ps.filter(p => p.ph === 'C. Client approval'), b = buckets(), plan = prgPlan('ret');
  const ab = ps.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph));
  const stuck = ab.filter(p => late(p)).sort((x, y) => daysIn(y) / LIMIT[y.ph] - daysIn(x) / LIMIT[x.ph]).map(p => prgStuck(p, `${daysIn(p)} days, limit ${LIMIT[p.ph]}`, late(p) === 'red' ? 'tred' : 'ta'))
    .concat(ab.filter(p => !late(p) && p.b.revisits).map(p => prgStuck(p, `Revisit ${p.b.revisits}`, 'ta')));
  return prgPage('ret', 'Phases A and B: are assessments booked, done right first time and turned into survey packs on time?',
    [['done', 'tk', 'Assessments done', as.length, 'visits completed', () => as.slice().sort((x, y) => (x.b.on || '') < (y.b.on || '') ? 1 : -1).map(p => pgRow(p, `<span class="ov-num">${p.b.on ? fmtDy(p.b.on) : ''}<small>${p.b.who ? PEO[p.b.who].n : ''}</small></span>`))],
     ['rft', rft < 80 ? 'ta' : 'tk', 'Right first time', pc(rft), plural(rv, 'revisit', 'revisits'), () => rvp.map(p => pgRow(p, pill('ta', `Revisit ${p.b.revisits}`)))],
     ['rq', rq.length ? 'ta' : 'tk', 'Waiting for review', rq.length, 'assessments, documents, designs', () => rq.map(a => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${a.p.id}">${esc(a.t)}</button>`, a.k, pill('tb', RN(a.role))))],
     ['pk', pk.length ? 'ta' : 'tk', 'With the client', pk.length, 'survey packs to approve', () => pk.map(p => pgRow(p, `<span class="ov-num">${daysIn(p)} days<small>limit ${LIMIT[p.ph]}</small></span>`))]],
    chart(tvals(Math.max(1, Math.round(as.length / 3)), 'rass', b.n).map(Math.round), b.lab, prgF, `Assessments completed by ${DD().tr}, against plan`, Array(b.n).fill(plan), ['Completed', 'Plan']),
    stuck,
    [prgView('ret', 'ret:bk', 'Bookings', 'Each assessor’s calendar, by week or month.'), prgView('ret', 'ret:rq', 'Review queue', 'Everything waiting for review, with its documents.'), prgView('ret', 'ret:pk', 'Survey pack', 'What each client has received.')],
    [['dir:dqual', 'Quality and compliance']]); }

function pgDel(){ const ps = fPr(), dn = ps.filter(p => ['F. Close out', 'Paid'].includes(p.ph)), rd = ps.filter(p => p.ph === 'D. Prepare to install' && ready(p)), ho = ps.filter(p => p.ph === 'E. Install' && holdOpen(p));
  const def = ps.filter(p => ['D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph)), lt = def.filter(p => late(p)), b = buckets(), plan = prgPlan('del');
  const lim = p => `<span class="ov-num">${daysIn(p)} days<small>limit ${LIMIT[p.ph]}</small></span>`;
  const stuck = ho.map(p => prgStuck(p, 'Hold point', 'tred')).concat(def.filter(p => !ho.includes(p) && isBlocked(p)).map(p => prgStuck(p, 'Blocked', 'tred')), lt.filter(p => !ho.includes(p) && !isBlocked(p)).sort((x, y) => daysIn(y) / LIMIT[y.ph] - daysIn(x) / LIMIT[x.ph]).map(p => prgStuck(p, `${daysIn(p)} days, limit ${LIMIT[p.ph]}`, late(p) === 'red' ? 'tred' : 'ta')), ps.filter(p => p.csTodo).map(p => prgStuck(p, 'System update', 'ta')));
  return prgPage('del', 'Phases D, E and F: are jobs ready, installing and closing out on time?',
    [['dn', 'tk', 'Installs completed', dn.length, 'in close out or paid', () => dn.map(p => pgRow(p, pill(p.ph === 'Paid' ? 'tg' : 'tb', p.ph === 'Paid' ? 'Paid' : 'Close out')))],
     ['rd', rd.length ? 'tg' : 'tk', 'Ready to install', rd.length, 'every phase D item done', () => rd.map(p => pgRow(p, pill('tg', 'Ready to install')))],
     ['ho', ho.length ? 'tred' : 'tk', 'Hold points open', ho.length, 'blocking the next group', () => ho.map(p => pgRow(p, `<span class="ov-num">${grpPct(p)}%<small>installed</small></span>${pill('tred', 'Hold point')}`))],
     ['lt', lt.length ? 'tred' : 'tk', 'Over the phase limit', lt.length, `of ${def.length} in phases D to F`, () => lt.map(p => pgRow(p, lim(p)))]],
    chart(tvals(Math.max(1, Math.round(dn.length / 2)), 'dinst', b.n).map(Math.round), b.lab, prgF, `Installs completed by ${DD().tr}, against plan`, Array(b.n).fill(plan), ['Completed', 'Plan']),
    stuck,
    [prgView('del', 'del:pro', 'Properties', 'Every property by phase and scheme.'), prgView('del', 'del:hold', 'Redbridge tracker', 'Progress per group, hold points and blocks.'), prgView('del', 'del:clo', 'Close out', 'Handover packs and lodgement.'), prgView('del', 'del:ord', 'Purchasing', 'Orders by status and supplier.')],
    [['dir:dops', 'Operations'], ['dir:dcap', 'Capacity and staffing']]); }

/* Director menu: Progress by team after Business; the dashboards keep the business questions */
{ const o = VIEWS.dir.side, act = pageAct('dir');
  const stuckN = t => t === 'com' ? DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled' && pMoney(p).q && (pMoney(p).mgp < scOf(p.sc).set.mg || pMoney(p).over)).length : t === 'ret' ? DB.pr.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph) && late(p)).length : DB.pr.filter(p => ['D. Prepare to install', 'E. Install', 'F. Close out'].includes(p.ph) && (late(p) || (p.ph === 'E. Install' && holdOpen(p)))).length;
  VIEWS.dir.side = () => { const it = sbItem(S.page.dir, act), h = o().replace(new RegExp(`<button class="nav" data-act="${act}" data-v="(dops|dprod|dsup)"[\\s\\S]*?</button>`, 'g'), '');
    const sec = it(['-', 'Progress by team']) + [['pcom', 'com'], ['pret', 'ret'], ['pdel', 'del']].map(([k, t]) => it([k, APPN[t], APPI[t] || 'chart', stuckN(t), 2])).join('');
    return h.replace('<div class="sb-sec">Dashboards</div>', sec + '<div class="sb-sec">Dashboards</div>'); };
  Object.assign(VIEWS.dir.pages, {pcom:pgCom, pret:pgRet, pdel:pgDel}); }

/* Every page shows the back bar while there is a trail */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => Object.keys(VIEWS[a].pages).forEach(k => { const f = VIEWS[a].pages[k]; VIEWS[a].pages[k] = (...x) => trBar() + f(...x); }));

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/4A8UcahFoaAAXq5YQ3zKBo'; } });
VERSIONS.push({v:'v3.22', date:TODAY, major:false, current:true, url:null, title:'Progress by team, with a way back', sum:'The director reads Commercial, Retrofit and Delivery progress in one place, with the same structure for each team, and opens the team’s own screens with a bar to come back. Dashboards keep the business questions.', steps:[
  {t:'Progress by team', min:.5, dolor:'Before, team progress was spread across eight dashboards and three apps.', show:['A new section in the Director menu: Commercial, Retrofit and Delivery.', 'The count shows how many items are stuck in each team.'], say:'One place to read how each team is doing.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'pret'); }},
  {t:'The same four parts for every team', min:1, dolor:'Before, each dashboard had its own layout.', show:['Four figures, the trend against plan, what is stuck, and where to look.', 'Commercial shows margins; Retrofit, assessments; Delivery, installs.'], say:'Read one team and you can read them all.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'pdel'); }},
  {t:'Open the team’s screen, and come back', min:.5, dolor:'Before, a figure took you to another app with no way back.', show:['Open a view or click a figure: it opens in the team’s app.', 'The bar at the top says Back to Director, and returns to the same page.'], say:'Go to where the work is done, and come back in one click.', go:() => { S.role = 'dir'; S.trail = {app:'dir', page:'pret', lbl:'Retrofit progress'}; go('ret', 'rq'); }},
  {t:'Dashboards answer the business questions', min:.5, dolor:'Before, Operations, Team productivity and Suppliers sat next to the business dashboards.', show:['Dashboards: Business overview, Scheme performance, Finance, Capacity and staffing, Quality and compliance.', 'Operations, Team productivity and Suppliers open from the team pages.'], say:'Business at the top, teams below.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dbiz'); }},
]});

/* =================== v3.23: the Director monitors the teams =================== */
/* A Director who opens a team app sees it as the team sees it, to monitor: no personal tasks,
   no approvals that belong to the team, no action buttons on the Overview. */
const MONI = app => false && app !== 'dir' && ['com', 'acc', 'ret', 'del'].includes(app);
const monBar = app => MONI(app) ? `<div class="mon-bar">${ico('eye', 15)}<span><b>Monitoring ${APPN[app]} as Director.</b> You see what the team sees; the actions are theirs. Your decisions are in the Director app.</span>${S.trail ? '' : nx('monBack', '', 'Back to Director', 'sec')}</div>` : '';
A.monBack = () => { S.trail = null; S.page.dir = 'ovw'; S.fi.dir = null; go('dir', 'ovw'); };
const ovRO = h => h.replace(/<div class="ov-ra">[\s\S]*?<\/div>/g, '');

function ovMonQueue(app){ const rs = WAITR[app] || [], ap = approvals().filter(a => rs.includes(a.role)), al = typeof pend === 'function' ? pend(app) : [];
  const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}, als = al.slice().sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
  const rows = ap.slice(0, 3).map(a => ovRow(a.p ? `<button class="ov-lk" data-act="prOpen" data-v="${a.p.id}">${esc(a.t)}</button>` : esc(a.t), `${a.k}, waiting for ${RN(a.role)}`, pill('tb', 'Approval')))
    .concat(als.slice(0, Math.max(0, 5 - Math.min(ap.length, 3))).map(a => ovRow(esc(a.t), esc(a.d.length > 90 ? a.d.slice(0, 88) + '...' : a.d), pill(a.tone, a.k))));
  return ovCard('The team’s queue', ap.length + al.length ? `${plural(ap.length, 'approval', 'approvals')} and ${plural(al.length, 'alert', 'alerts')} waiting on the team.` : 'Nothing waiting on the team.', rows.join('') || ovEmpty('All clear.'), [ap.length && VIEWS[app].pages.wait ? ovLink(`${app}:wait`, `Approvals (${ap.length})`) : '', al.length ? ovLink(`${app}:atn`, `Needs attention (${al.length})`) : ''].join('')); }

function ovMonDay(app){ const tk = DB.tk.filter(k => !k.done && teamOf(k.r) === app), soon = tk.filter(k => dDiff(k.due) <= 2).sort((a, b) => (tkOver(b) - tkOver(a)) || (a.due < b.due ? -1 : 1)), od = tk.filter(tkOver);
  const rows = soon.slice(0, 4).map(k => ovRow(`<button class="ov-lk" data-act="tkView" data-v="${k.id}">${esc(k.t)}</button>`, `${PEO[k.who] ? PEO[k.who].n : RN(k.r)}${k.pr ? ', ' + esc(prOf(k.pr).ad) : ''}`, tkOver(k) ? pill('tred', 'Overdue') : dDiff(k.due) === 0 ? pill('ta', 'Due today') : pill('tk', fmtDy(k.due))));
  const ms = DB.mt.filter(m => mtSees(app, m) && m.d >= TODAY).sort((a, b) => a.d + a.h < b.d + b.h ? -1 : 1).slice(0, 2).map(m => ovRow(esc(m.ty), `${m.d === TODAY ? 'Today' : fmtDy(m.d)}, ${m.h}. ${plural(m.who.length, 'attendee', 'attendees')}`, m.d === TODAY ? pill('ta', 'Today') : pill('tk', 'Upcoming')));
  return ovCard('The team’s day', `${plural(tk.length, 'open task', 'open tasks')}${od.length ? `, ${od.length} overdue` : ''}, by owner.`, `<div class="ov-sub">Tasks due soon</div>${rows.join('') || ovEmpty('Nothing due in the next two days.')}<div class="ov-sub">Next meetings</div>${ms.join('') || ovEmpty('No meetings scheduled.')}`, ovLink(`${app}:tasks`, `Team tasks (${tk.length})`)); }

function ovMon(app){ S.f.tkm = 'all';
  return oph(`${APPN[app]}, as the team sees it`, `Monitoring view for the Director. Every figure and row opens the list or record behind it.`)
    + `<div class="cstats ov-k">${ovKpis(app).join('')}</div>`
    + `<div class="ov-g">${ovMonQueue(app)}${ovMonDay(app)}${ovRO(ovWork(app))}</div>`; }

['com', 'acc', 'ret', 'del'].forEach(a => { Object.keys(VIEWS[a].pages).forEach(k => { const f = VIEWS[a].pages[k]; VIEWS[a].pages[k] = (...x) => { const h = f(...x); if(!MONI(a)) return h; const i = h.indexOf('<div class="tr-back">'); return i === 0 ? h.replace(/^(<div class="tr-back">[\s\S]*?<\/div>)/, '$1' + monBar(a)) : monBar(a) + h; }; });
  const ow = VIEWS[a].pages.ovw; VIEWS[a].pages.ovw = (...x) => MONI(a) ? trBar() + monBar(a) + ovMon(a) : ow(...x); });

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/8AoGHjhvNA1foMuLzS3fzp'; } });
VERSIONS.push({v:'v3.23', date:TODAY, major:false, current:true, url:null, title:'The Director monitors the teams', sum:'Team progress is read inside the Director app: filter by programme and scheme, open the list behind each figure and the record in the panel. When the Director opens a team app, it is a read only monitoring view.', steps:[
  {t:'Filter by programme and scheme', min:.5, dolor:'Before, team progress always showed every scheme together.', show:['Programme and Scheme and client at the top of each team page.', 'Every figure, the chart, what is stuck and the plan follow the filter.'], say:'How is Delivery doing on Redbridge alone?', go:() => { S.role = 'dir'; S.trail = null; S.f.d.sc = 'SC-06'; S.f.pgk = null; go('dir', 'pdel'); }},
  {t:'The list behind each figure, here', min:.5, dolor:'Before, a figure took you to the team’s app.', show:['Click a figure: its list opens below, inside the Director app.', 'Each row opens the property in the panel; click the figure again to close.'], say:'Monitor without leaving your app.', go:() => { S.role = 'dir'; S.trail = null; S.f.d.sc = ''; S.f.pgk = 'ret:rft'; go('dir', 'pret'); }},
  {t:'Team apps in monitoring mode', min:.5, dolor:'Before, a Director in a team app saw his own tasks and the team’s approvals as if they were his.', show:['A bar says you are monitoring; the Overview shows the team’s queue and the team’s day.', 'No action buttons for the Director; Back to Director returns to your app.'], say:'You see what the team sees; the actions stay with the team.', go:() => { S.role = 'dir'; S.trail = null; go('ret', 'ovw'); }},
]});

/* =================== v3.24: the menu keeps its place, folds away for monitoring, works on every screen =================== */
/* 1. Clicking a menu item no longer jumps the menu back to the top: its scroll is kept, and the current item stays in view.
   2. Desktop: the menu folds into an icon rail. It folds by itself when the Director goes to another app to monitor,
      or follows a link into another app; the button at the top opens or folds it by hand.
   3. Tablet and phone: the menu is a drawer that closes when you pick an item, tap outside or press Escape. */
S.sbMin = {};
const sbAuto = app => MONI(app) || (!!S.trail && S.trail.app !== app);
const sbMini = app => window.innerWidth > 900 && (S.sbMin[app] ?? sbAuto(app));
A.sbMin = () => { S.sbMin[S.view] = !sbMini(S.view); render(); };
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const o = VIEWS[a].side; VIEWS[a].side = () => {
  const h = o().replace(/<button class="nav"([^>]*)>(<span class="ni">[\s\S]*?<\/span>)([^<]+)/g, (m, at, ic, l) => `<button class="nav"${at} title="${esc(l.trim())}">${ic}<span class="nl">${l}</span>`);
  const mini = sbMini(a);
  return h.replace('<aside class="sb">', `<aside class="sb"><button class="sb-tg" data-act="sbMin" title="${mini ? 'Open the menu' : 'Fold the menu'}" aria-label="${mini ? 'Open the menu' : 'Fold the menu'}" aria-expanded="${!mini}">${ico('chev', 16)}<span class="nl">Collapse</span></button>`); }; });
{ const r0 = render;
  render = (...x) => { const app = S.view, sb = document.querySelector(`#a-${app} .sb`), y = sb ? sb.scrollTop : 0;
    r0(...x);
    const el = document.querySelector(`#a-${S.view}`); if(el) el.classList.toggle('sbmini', sbMini(S.view));
    const nb = document.querySelector(`#a-${S.view} .sb`); if(!nb) return;
    if(S.view === app) nb.scrollTop = y;
    const cur = nb.querySelector('.nav[aria-current="true"]');
    if(cur && nb.clientHeight){ const r = cur.getBoundingClientRect(), s = nb.getBoundingClientRect(); if(r.top < s.top) nb.scrollTop -= s.top - r.top + 8; else if(r.bottom > s.bottom) nb.scrollTop += r.bottom - s.bottom + 8; } }; }
{ const ov = A.view, os = A.setRole; A.view = el => { delete S.sbMin[el.dataset.v]; ov(el); }; A.setRole = el => { S.sbMin = {}; os(el); }; }
/* Drawer: close on a tap outside or Escape; re-check the rail when the window changes size */
const sbClose = () => document.querySelectorAll('.oapp.sbopen').forEach(o => o.classList.remove('sbopen'));
document.addEventListener('click', e => { if(!document.querySelector('.oapp.sbopen') || e.target.closest('[data-act="sbTog"]')) return; if(e.target.closest('.sb')){ if(e.target.closest('.sb .nav')) setTimeout(sbClose, 0); return; } sbClose(); }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape') sbClose(); });
{ let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if(window.innerWidth > 900) sbClose(); const el = document.querySelector(`#a-${S.view}`); if(el) el.classList.toggle('sbmini', sbMini(S.view)); }, 120); }); }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/NzDhAQAhiokFiCiHKRyi27'; } });
VERSIONS.push({v:'v3.24', date:TODAY, major:false, current:true, url:null, title:'The menu keeps its place and folds away', sum:'The menu no longer jumps back to the top when you pick an item. It folds into icons when the Director goes to another app to monitor, and it is a drawer on tablet and phone.', steps:[
  {t:'The menu keeps its place', min:.5, dolor:'Before, picking an item low in the menu sent the menu back to the top.', show:['Scroll the Director menu down and pick Quality and compliance: the menu stays where it was.'], say:'You never lose your place.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dqual'); }},
  {t:'It folds away when the Director monitors', min:.5, dolor:'Before, the team’s full menu took space the Director does not use.', show:['Open a team app as Director: the menu folds into icons, with the name on hover.', 'The arrow at the top opens or folds it by hand.'], say:'More room for what you came to see.', go:() => { S.role = 'dir'; S.trail = null; delete S.sbMin.del; go('del', 'ovw'); }},
  {t:'Tablet and phone', min:.5, dolor:'Before, the drawer only closed when you picked an item.', show:['The menu button opens the drawer; it closes when you pick an item, tap outside or press Escape.'], say:'The same menu on every screen.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
]});

/* =================== v3.25: Director app, feedback from the review with Yahaya (Nov 4) =================== */
/* Only the Director app. Integrations (Xero, Microsoft 365, Read AI, Fellow, email) and the parts that need
   information from REFYT (stages per contract, payment terms per contract, compliance measures) are left out. */
const PDAYS = {'4w':28, q:91, y:365}, PLBL = {'4w':'last 4 weeks', q:'last 3 months', y:'last 12 months'};
const inPer = d => d && dDiff(d) >= -PDAYS[DD().dr] && dDiff(d) <= 0;
const pName = k => PEO[k] ? PEO[k].n : '';
const roleP = r => ROLES[r] && PEO[ROLES[r][1]] ? PEO[ROLES[r][1]].n : RN(r);
const PAL = ['#1E3A8A', '#87AECE', '#AFD06E', '#43711B', '#1D2A62', '#C6D8E8', '#D7E8B4', '#64748B'];
function donut(segs, center, sub){ const tot = sum(segs, s => s.v) || 1, R = 46, C = 2 * Math.PI * R; let off = 0;
  const arcs = segs.filter(s => s.v > 0).map((s, i) => { const l = s.v / tot * C, a = `<circle r="${R}" cx="60" cy="60" fill="none" stroke="${s.c || PAL[i % PAL.length]}" stroke-width="18" stroke-dasharray="${l} ${C - l}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"></circle>`; off += l; return a; }).join('');
  return `<div class="dz"><svg viewBox="0 0 120 120" width="132" height="132" role="img" aria-label="${esc(center)}"><circle r="${R}" cx="60" cy="60" fill="none" stroke="var(--line)" stroke-width="18"></circle>${arcs}<text x="60" y="58" text-anchor="middle" class="dz-c">${center}</text><text x="60" y="74" text-anchor="middle" class="dz-s">${sub || ''}</text></svg><div class="dz-l">${segs.filter(s => s.v > 0).map((s, i) => `<${s.act ? `button data-act="${s.act}" data-v="${esc(s.v2 || '')}"` : 'div'} class="dz-i"><i style="background:${s.c || PAL[i % PAL.length]}"></i><span>${esc(s.l)}</span><b>${s.f ? s.f(s.v) : s.v}</b></${s.act ? 'button' : 'div'}>`).join('')}</div></div>`; }
const hbar = (l, v, mx, f, sub, act, av, tone) => `<${act ? `button data-act="${act}" data-v="${esc(av || '')}"` : 'div'} class="hb"><span class="hb-l"><b>${esc(l)}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="hb-t"><i class="${tone || ''}" style="width:${mx ? Math.max(2, v / mx * 100) : 0}%"></i></span><span class="hb-v">${f ? f(v) : v}</span></${act ? 'button' : 'div'}>`;

/* ---------- 1. My tasks: meeting action points, follow ups, done tasks cleared after 14 days ---------- */
const TK_KEEP = 14, tkArch = k => k.done && k.doneOn && dDiff(k.doneOn) < -TK_KEEP;
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
{ const a0 = alerts; alerts = () => { const xs = a0(); DB.tk.filter(k => !k.done && k.by && k.by !== k.who && dDiff(k.due) <= 0).forEach(k => { const od = -dDiff(k.due);
    xs.push({id:'fu' + k.id, app:'dir', tone:od ? 'tred' : 'ta', k:'Follow up', t:k.t, d:`You gave this to ${pName(k.who) || RN(k.r)}. ${od ? `${plural(od, 'day', 'days')} overdue` : 'Due today'}${k.pr ? `, ${prOf(k.pr).ad}` : ''}.`, fix:[`Remind ${(pName(k.who) || RN(k.r)).split(' ')[0]}`, 'tkNudge', k.id]}); }); return xs.filter(a => !S.dis[a.id]); }; }
A.tkNudge = el => { const k = DB.tk.find(x => x.id === el.dataset.v); k.nudged = TODAY; if(k.pr) his(prOf(k.pr), `Reminder sent to ${pName(k.who)}: ${k.t}`, ME()); S.dis['fu' + k.id] = {t:k.t, k:'Follow up', why:`reminder sent to ${pName(k.who) || RN(k.r)}`, on:TODAY, by:ME()}; render(); toast(`Reminder sent to ${esc(pName(k.who) || RN(k.r))}. It shows in their notifications.`); };

/* ---------- 2. Meetings: pick the time from a list, and edit a scheduled meeting ---------- */
const SLOTS = Array.from({length:(20 - 7) * 4 + 1}, (_, i) => m2tm(7 * 60 + i * 15));
const tsel = (lbl, k, v) => `<label class="tsel"><small>${lbl} <em class="req">required</em></small><select class="um-in" data-in="m" data-k="${k}"><option value="">Choose</option>${SLOTS.map(t => `<option value="${t}"${t === v ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
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
const apObj = a => a.o || (a.ref && (DB.sp.find(s => s.id === a.ref) || DB.va.find(v => v.id === a.ref))) || null;
const apDoc = a => { if(a.ok !== 'docOk') return null; const [, n] = a.ref.split('|'), d = a.p.b.dx[n]; return d && d.v[d.v.length - 1]; };
const apBy = a => { const o = apObj(a), d = apDoc(a); return (o && o.by) || (d && d.by) || (a.ok === 'arOk' ? (a.p.b.visit && a.p.b.visit.by) || a.p.b.who : a.ok === 'drOk' ? 'ahm' : null) || (a.p ? scOf(a.p.sc).lead : null); };
const apSince = a => { const o = apObj(a), d = apDoc(a), t0 = (DB.apth[a.id] || []).find(x => x.act === 'Requested'); return (t0 && t0.on) || (o && o.on) || (d && d.on) || (a.p && a.p.b.visit && a.ok === 'arOk' && a.p.b.visit.on) || (a.p && a.p.phOn) || TODAY; };
const apKey = a => a.ref || (a.o ? a.o.id : a.p.id);
const apTh = id => DB.apth[id] || (DB.apth[id] = []);
const apLog = (a, act, t) => { apTh(a.id).push({by:ME(), on:TODAY, act, t:t || ''}); if(a.p){ a.p.th = a.p.th || []; const to = apBy(a); a.p.th.push({by:ME(), on:TODAY, t:`${act}: ${a.k}, ${a.t}.${t ? ' ' + t : ''}`, to:to && to !== ME() ? [to] : [], from:'Approval: ' + a.k}); } };
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
const apMsg = x => `<div class="apv-m ${x.act === 'Approved' ? 'ok' : x.act === 'Rejected' ? 'no' : ''}">${av(x.by, 26)}<div><div><b>${pName(x.by)}</b><small>${fmtDy(x.on)}${x.act !== 'Comment' ? ', ' + x.act.toLowerCase() : ''}</small></div>${x.t ? `<p>${esc(x.t)}</p>` : ''}</div></div>`;
{ const f = VIEWS.dir.pages.wait; VIEWS.dir.pages.wait = (...x) => f(...x).replace(/data-hl="([^"]+)"([\s\S]*?)<div class="ds-exb">/g, (s, id, mid) => `data-hl="${id}"${mid}<div class="ds-exb"><button class="btn sec sm" data-act="apView" data-v="${id}">${ico('eye', 14)}Details and conversation${(DB.apth[id] || []).length ? ` (${DB.apth[id].length})` : ''}</button>`); }

/* ---------- 4. Schemes: the target of properties, easy to change, with the change logged ---------- */
A.tgtOpen = el => { const s = scOf(el.dataset.v); S.modal = {k:'tgt', id:s.id, v:String(s.tgt)}; renderLayer(); };
MODALS.tgt = m => { const s = scOf(m.id), n = numIn(m.v); return modal(`Target properties, ${s.n}`, 'The number of properties in the contract. It changes during the contract; every change is logged in the scheme settings.', fld('Target', 'm', 'v', m.v, {type:'number', req:true}) + `<p class="hint">Now ${s.tgt}. Completed so far: ${prsOf(s.id).filter(p => pIdx(p.ph) >= 5 && p.ph !== 'Cancelled').length}.</p>`, mfoot('Save', 'tgtOk', n > 0 && n !== s.tgt), 520); };
A.tgtOk = () => { const m = S.modal, s = scOf(m.id), n = numIn(m.v), old = s.tgt; s.tgt = n; s.log.push([TODAY, ME(), 'Target properties', old, n]); S.modal = null; render(); toast(`${esc(s.n)}: target changed from ${old} to ${n} properties. Logged in Scheme settings.`); };
{ const f = VIEWS.dir.pages.sset; if(f) VIEWS.dir.pages.sset = (...x) => { let i = 0; return f(...x).replace('<th>Scheme</th>', '<th>Scheme</th><th>Target properties</th>').replace(/(<tr><td><b>[\s\S]*?<\/td>)/g, (s0, c) => { const s = DB.sc[i++]; return s ? `${c}<td><button class="tgt-b" data-act="tgtOpen" data-v="${s.id}">${s.tgt}${ico('edit', 13)}</button></td>` : c; }); }; }

{ const o = scFicha; scFicha = (app, s) => { const h = o(app, s); return ['dir', 'com'].includes(app) ? h.replace(/<div class="stat ([^"]*)"><small>Properties<\/small><b>(\d+) of (\d+)<\/b>([\s\S]*?)<\/div>/, `<button class="stat sbtn $1" data-act="tgtOpen" data-v="${s.id}" title="Change the target"><small>Properties</small><b>$2 of $3</b><span class="ss">target, click to change</span></button>`) : h; }; }

/* ---------- 5. Settings move from the menu to the header ---------- */
let SETIT = [];
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => { const h = o(), i = h.indexOf('<div class="sb-sec">Settings</div>'); if(i < 0) return h; const j = h.indexOf('<div class="sb-sec">', i + 10), sec = h.slice(i, j < 0 ? h.indexOf('</aside>') : j);
    SETIT = [...sec.matchAll(/data-v="([^"]+)"[^>]*>(?:<span class="ni">[\s\S]*?<\/span>)?(?:<span class="nl">)?([^<]+)/g)].map(x => [x[1], x[2].trim()]);
    return window.innerWidth > 620 ? h.replace(sec, '') : h; }; }
A.setPop = () => { S.setPop = !S.setPop; drawSetPop(); };
function drawSetPop(){ let el = document.getElementById('setpop'); if(!el){ el = document.createElement('div'); el.id = 'setpop'; document.body.appendChild(el); }
  const b = document.querySelector('[data-act="setPop"]'); if(!S.setPop || !b){ el.innerHTML = ''; return; } const r = b.getBoundingClientRect();
  el.innerHTML = `<div class="rf-pop set-pop" style="top:${r.bottom + 6}px;right:${Math.max(8, window.innerWidth - r.right)}px"><small class="rf-ph">Settings</small>${SETIT.map(([k, n]) => `<button class="rf-pi${S.view === 'dir' && S.page.dir === k ? ' on' : ''}" data-act="setGo" data-v="${k}"><b>${esc(n)}</b></button>`).join('')}</div>`; }
A.setGo = el => { S.setPop = false; drawSetPop(); S.trail = null; go('dir', el.dataset.v); };
document.addEventListener('click', e => { if(S.setPop && !e.target.closest('.set-pop') && !e.target.closest('[data-act="setPop"]')){ S.setPop = false; drawSetPop(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.setPop){ S.setPop = false; drawSetPop(); } });
{ const r1 = render; render = (...x) => { r1(...x); const t = $('#tools'); if(t && S.view === 'dir' && window.innerWidth > 620 && SETIT.length){ const on = SETIT.some(([k]) => k === S.page.dir); t.insertAdjacentHTML('afterbegin', `<button class="rf-hb${on ? ' on' : ''}" data-act="setPop" title="Settings" aria-label="Settings">${ico('cog', 16)}</button>`); } drawSetPop(); }; }
{ let w0 = window.innerWidth; window.addEventListener('resize', () => { const w = window.innerWidth; if((w0 > 620) !== (w > 620)) render(); w0 = w; }); }

/* ---------- 6. Commercial progress: a snapshot per scheme, and where the money goes ---------- */
A.pgDr = el => { S.f.d.dr = el.dataset.v; render(); };
{ const f = VIEWS.dir.pages.pcom; VIEWS.dir.pages.pcom = (...x) => { const h = f(...x), ss = fSc(), rows = ss.map(s => { const ps = prsOf(s.id).filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled'), q = sum(ps, p => pMoney(p).q), fc = sum(ps, p => pMoney(p).fc), mg = q ? (q - fc) / q * 100 : null; return {s, q, fc, mg}; }).filter(r => r.q);
    const st = r => r.mg < r.s.set.mg ? ['tred', 'Below target'] : r.mg >= r.s.set.mg + 5 ? ['tg', 'Above target'] : ['tb', 'On track'];
    const snap = `<section class="ov-card ov-wide pg-snap"><div class="ov-h"><div><h3>Snapshot per scheme</h3><p>Revenue, cost and margin of the approved work in each scheme. Open a scheme to drill down.</p></div></div><div class="el-wide"><div class="rf-mx"><table><thead><tr><th>Scheme</th><th>Revenue</th><th>Forecast cost</th><th>Margin</th><th>Target</th><th>Status</th></tr></thead><tbody>${rows.map(r => `<tr><td><button class="lnk4" data-act="ficha" data-v="${r.s.id}"><b>${esc(r.s.n)}</b></button><small class="mini" style="display:block">${esc(r.s.cl)}</small></td><td><b>${fm(r.q)}</b></td><td>${fm(r.fc)}</td><td><b>${pc(r.mg)}</b></td><td>${pc(r.s.set.mg)}</td><td>${pill(...st(r))}</td></tr>`).join('')}<tr class="tot"><td><b>All schemes</b></td><td><b>${fm(sum(rows, r => r.q))}</b></td><td><b>${fm(sum(rows, r => r.fc))}</b></td><td><b>${pc(sum(rows, r => r.q) ? (sum(rows, r => r.q) - sum(rows, r => r.fc)) / sum(rows, r => r.q) * 100 : 0)}</b></td><td></td><td></td></tr></tbody></table></div></div></section>`;
    const sp = CTYPES.map(c => [c, sum(DB.or.filter(o => o.st !== 'Rejected' && o.ct === c && inPer(o.on)), o => sum(o.al.filter(a => !a.pr || fPr(true).some(p => p.id === a.pr)), a => a.a)) + (c === 'Subcontract labour' ? sum(DB.sp.filter(s => s.st !== 'Rejected' && inPer(s.on) && fPr(true).some(p => p.id === s.pr)), s => s.amt) : 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    const mx = Math.max(1, ...sp.map(x => x[1]));
    const spend = `<section class="ov-card ov-wide"><div class="ov-h"><div><h3>Where the money goes, ${PLBL[DD().dr]}</h3><p>Orders and subcontractor payments by cost type, in the schemes selected above. Click a type to see the orders behind it.</p></div>${seg('pgDr', DD().dr, [['4w', '4 weeks'], ['y', '12 months']])}</div><div class="ov-b">${sp.length ? sp.map(([c, v]) => hbar(c, v, mx, fk, '', 'pgCt', c)).join('') : ovEmpty('No spend in this period.')}</div></section>`;
    const i = h.lastIndexOf('<div class="ov-g">'); return h.slice(0, i) + `<div class="ov-g pg-top">${snap}${spend}</div>` + h.slice(i); }; }
A.pgCt = el => { S.modal = {k:'ctl', c:el.dataset.v}; renderLayer(); };
MODALS.ctl = m => { const xs = DB.or.filter(o => o.st !== 'Rejected' && o.ct === m.c && inPer(o.on)).sort((a, b) => a.on < b.on ? 1 : -1), ys = m.c === 'Subcontract labour' ? DB.sp.filter(s => s.st !== 'Rejected' && inPer(s.on)) : [];
  return modal(`${m.c}, ${PLBL[DD().dr]}`, `${plural(xs.length + ys.length, 'line', 'lines')}, ${fm(sum(xs, o => o.amt) + sum(ys, s => s.amt))}.`, xs.map(o => rdiv(cell(`${o.id} ${esc(o.sup)}`, o.al.length > 1 ? `split across ${o.al.length} properties` : esc(prOf(o.al[0].pr).ad) + ', ' + scOf(prOf(o.al[0].pr).sc).n, 2.4) + cell(fm(o.amt), fmtDy(o.on)) + cell(pill('tk', o.st), ''))).join('') + ys.map(s => rdiv(cell(esc(s.sub), `${esc(prOf(s.pr).ad)}, ${esc(s.stage)}`, 2.4) + cell(fm(s.amt), fmtDy(s.on)) + cell(pill('tk', s.st), ''))).join('') || empty('Nothing in this period.'), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 760); };

/* ---------- 7. Business overview: each contract with its own stages, what is waiting and who it is waiting on ---------- */
const stageOf = p => { const T = PTYPE[scOf(p.sc).ty]; return T ? T.st[Math.min(p.cs || 0, T.st.length - 1)] : p.ph; };
function waitItems(){ const xs = [];
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
    /* v3.29: Spend by scheme and cost type removed at REFYT's request */ void mt; void c1;
    return h; }; }

/* ---------- 10. Capacity and staffing: a workload view per person, like Monday’s ---------- */
const CAPH = {afa:37.5, xen:22.5, ahm:37.5, ram:37.5, dre:37.5, sar:30, akr:37.5, tom:37.5};
const WLP = [['afa', 'Retrofit'], ['xen', 'Retrofit'], ['ram', 'Retrofit'], ['ahm', 'Retrofit'], ['sar', 'Retrofit'], ['dre', 'Delivery'], ['akr', 'Delivery'], ['tom', 'Commercial']];
function wlHours(k, ps){ const A1 = ps.filter(p => ['A. Job received', 'B. Assess and design'].includes(p.ph)), half = (xs, i) => xs.filter((p, j) => j % 2 === i);
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

/* =================== v3.26: Needs you now by kind, and tasks with three filters and a calendar =================== */
/* Director app. Approvals in green from the palette, alerts in red, each row: kind, what, the actions, and the eye at the end.
   My tasks: only My tasks, All team tasks and Meeting action points; a list, a week or a month. */

/* ---------- 1. Needs you now ---------- */
const nyRow = (tag, main, sub, acts, eye) => `<div class="ny-r ny-${tag === 'Approval' ? 'ap' : 'al'}"><span class="ny-t">${tag}</span><div class="ny-m"><b>${main}</b>${sub ? `<small>${sub}</small>` : ''}</div><div class="ny-a">${acts}</div>${eye}</div>`;
const nyEye = (act, v, what) => `<button class="ny-eye" data-act="${act}" data-v="${esc(v)}" title="See the detail of this ${what}" aria-label="See the detail of this ${what}">${ico('eye', 16)}</button>`;
{ const o = ovNow; ovNow = app => { if(app !== 'dir') return o(app);
    const ap = approvals().filter(a => ovWaitRoles(app).includes(a.role)), al = typeof pend === 'function' ? pend(app) : [];
    const ord = {tred:0, to:1, ta:2, tv:3, tb:4, tg:5}, als = al.slice().sort((a, b) => (ord[a.tone] ?? 6) - (ord[b.tone] ?? 6));
    const rows = ap.slice(0, 3).map(a => nyRow('Approval', esc(a.t), `${a.k}${a.amt ? ', ' + fm(a.amt) : ''}`, `<button class="btn pri sm ny-ok" data-act="${a.ok}" data-v="${esc(apKey(a))}">Approve</button><button class="btn sec sm" data-act="apNo" data-v="${esc(a.no + '|' + apKey(a))}">Reject</button>`, nyEye('apView', a.id, 'approval')))
      .concat(als.slice(0, Math.max(0, 5 - Math.min(ap.length, 3))).map(a => nyRow('Alert', esc(a.t), `${esc(a.k)}. ${esc(a.d.length > 80 ? a.d.slice(0, 78) + '...' : a.d)}`, `<button class="btn sec sm ny-fix" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button><button class="btn sec sm" data-act="alseen" data-v="${a.id}">Seen</button>`, nyEye('alView', a.id, 'alert'))));
    const n = ap.length + al.length, foot = [ap.length ? ovLink('dir:wait', `All approvals (${ap.length})`) : '', al.length ? ovLink('dir:dec', `Alerts (${al.length})`) : ''].filter(Boolean).join('');
    const sub = n ? `<span class="ny-k ny-ap">${plural(ap.length, 'approval', 'approvals')}</span> <span class="ny-k ny-al">${plural(al.length, 'alert', 'alerts')}</span> waiting, the most urgent first.` : 'Nothing waiting on you.';
    return ovCard('Needs you now', sub, rows.length ? rows.join('') : ovEmpty('All clear. Approvals and alerts for you will show up here.'), foot); }; }
{ const f = VIEWS.dir.pages.ovw; VIEWS.dir.pages.ovw = (...x) => f(...x).replace('<div class="ov-g">', '<div class="ov-g ov-dir">'); }
/* The eye on an alert: what it is about and what to do */
A.alView = el => { S.modal = {k:'alv', id:el.dataset.v}; renderLayer(); };
MODALS.alv = m => { const a = (typeof pend === 'function' ? pend('dir') : []).find(x => x.id === m.id) || alerts().find(x => x.id === m.id);
  if(!a) return modal('Alert', 'This alert has been dealt with.', '', `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 520);
  const pid = (a.fix[2] || '').split('|')[0], p = /^PR-/.test(pid) ? prOf(pid) : null, k = a.fix[1] === 'tkNudge' ? DB.tk.find(x => x.id === a.fix[2]) : null;
  const rows = [['Kind', a.k], ['Property', p ? `<button class="lnk4" data-act="prOpen" data-v="${p.id}|upd">${esc(p.ad)}</button>` : ''], ['Scheme and client', p ? `${esc(scOf(p.sc).n)}, ${esc(scOf(p.sc).cl)}` : ''], ['Owner', k ? `${pName(k.who)}<small>${RN(k.r)}</small>` : ''], ['Due', k ? `${fmtDy(k.due)}<small>${dDiff(k.due) < 0 ? plural(-dDiff(k.due), 'day', 'days') + ' overdue' : 'today'}</small>` : '']].filter(x => x[1]);
  return modal(a.t, `${a.k}. Alerts come from the work itself; deal with it or mark it as seen.`, `<div class="apv-g al-g">${rows.map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join('')}</div><p class="apv-d">${esc(a.d)}</p>${k && k.desc ? `<p class="hint">${esc(k.desc)}</p>` : ''}`,
    `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="alseen" data-v="${a.id}">Seen</button><button class="btn pri lg" data-act="${a.fix[1]}" data-v="${esc(a.fix[2])}">${a.fix[0]}</button></div>`, 620); };
{ const fx = new Set(); const wrapClose = n => { if(fx.has(n) || !A[n]) return; fx.add(n); const o = A[n]; A[n] = (el, ...r) => { if(S.modal && S.modal.k === 'alv') S.modal = null; return o(el, ...r); }; };
  ['alseen', 'tkNudge', 'prOpen', 'gogo'].forEach(wrapClose); const oa = A.alView; A.alView = el => { const a = (pend('dir') || []).find(x => x.id === el.dataset.v); if(a) wrapClose(a.fix[1]); oa(el); }; }

/* ---------- 2. My tasks: three filters, and a calendar ---------- */
const TKV = [['mine', 'My tasks'], ['mt', 'Meeting action points']];
const tkIsMt = k => !!(k.src && mtOf(k.src));
const tkList = () => { const v = S.f.tkv3 || 'mine'; return DB.tk.filter(k => !tkArch(k) && (v === 'mine' ? k.who === ME() : v === 'mt' ? tkIsMt(k) : true)); };
A.tkv3 = el => { S.f.tkv3 = el.dataset.v; render(); };
A.tkvw = el => { S.f.tkvw = el.dataset.v; render(); };
A.tkcn = el => { const d = +el.dataset.v, w = S.f.tkvw === 'week'; S.f.tkc = d === 0 ? null : addDays(S.f.tkc || TODAY, w ? d * 7 : 0); if(!w && d){ const x = fromIso(S.f.tkc || TODAY); x.setDate(1); x.setMonth(x.getMonth() + d); S.f.tkc = iso(x); } render(); };
const tkTone = k => 'x' + (k.done ? 'dn' : tkOver(k) ? 'od' : dDiff(k.due) === 0 ? 'td' : tkIsMt(k) ? 'mt' : 'op');
const tkChip = k => `<button class="tkc ${tkTone(k)}" data-act="tkView" data-v="${k.id}" title="${esc(k.t)}, ${esc(pName(k.who) || RN(k.r))}"><span>${esc(k.t)}</span><i>${ini(pName(k.who) || RN(k.r))}</i></button>`;
const monday = s => { const d = fromIso(s), w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return iso(d); };
function tkCal(xs){ const wk = S.f.tkvw === 'week', base = S.f.tkc || TODAY, by = {}; xs.forEach(k => { (by[k.due] = by[k.due] || []).push(k); });
  const legend = `<div class="tk-lg"><span><i class="xod"></i>Overdue</span><span><i class="xtd"></i>Due today</span><span><i class="xop"></i>Open</span><span><i class="xmt"></i>Meeting action point</span><span><i class="xdn"></i>Done</span></div>`;
  if(wk){ const m0 = monday(base), days = Array.from({length:7}, (_, i) => addDays(m0, i)), lbl = `${fmtDy(days[0]).replace(/, \d{4}$/, '')} to ${fmtDy(days[6])}`;
    return `<div class="tk-cb"><div class="tk-nav"><b>${lbl}</b>${nx('tkcn', '-1', 'Previous week', 'sec')}${nx('tkcn', '0', 'Today', 'sec')}${nx('tkcn', '1', 'Next week', 'sec')}</div>${legend}</div><div class="tk-wk">${days.map(d => { const ks = (by[d] || []).sort((a, b) => a.done - b.done), dd = fromIso(d);
      return `<div class="tk-wd${d === TODAY ? ' now' : ''}"><div class="tk-wh"><small>${DSH[dd.getDay()]}</small><b>${dd.getDate()}</b></div><div class="tk-wl">${ks.map(k => `<button class="tkw ${tkTone(k)}" data-act="tkView" data-v="${k.id}"><b>${esc(k.t)}</b><small>${esc(pName(k.who) || RN(k.r))}${k.pr ? ', ' + esc(prOf(k.pr).ad) : ''}</small></button>`).join('') || '<span class="tk-e">No tasks</span>'}</div></div>`; }).join('')}</div>`; }
  const f = fromIso(base); f.setDate(1); const first = monday(iso(f)), mo = f.getMonth(), cells = Array.from({length:42}, (_, i) => addDays(first, i)), rows = cells.slice(35).some(d => fromIso(d).getMonth() === mo) ? 6 : 5;
  return `<div class="tk-cb"><div class="tk-nav"><b>${MON[mo]} ${f.getFullYear()}</b>${nx('tkcn', '-1', 'Previous month', 'sec')}${nx('tkcn', '0', 'Today', 'sec')}${nx('tkcn', '1', 'Next month', 'sec')}</div>${legend}</div><div class="tk-mo"><div class="tk-mh">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => `<span>${x}</span>`).join('')}</div><div class="tk-mg">${cells.slice(0, rows * 7).map(d => { const ks = (by[d] || []).sort((a, b) => a.done - b.done), dd = fromIso(d);
    return `<div class="tk-md${dd.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' now' : ''}"><b>${dd.getDate()}</b>${ks.slice(0, 3).map(tkChip).join('')}${ks.length > 3 ? `<button class="tk-more" data-act="tkDay" data-v="${d}">+${ks.length - 3} more</button>` : ''}</div>`; }).join('')}</div></div>`; }
A.tkDay = el => { S.f.tkvw = 'week'; S.f.tkc = el.dataset.v; render(); };
{ const f = VIEWS.dir.pages.tasks; VIEWS.dir.pages.tasks = (...x) => { const v = S.f.tkv3 || 'mine', vw = S.f.tkvw || 'list';
    S.f.tkm = v === 'mine' ? 'mine' : 'all'; S.f.ttm = ''; S.f.tsrc = v === 'mt' ? 'mt' : ''; S.f.tkf = 'open';
    let h = f(...x).replace(/Every team’s tasks, from meetings and from jobs\. Filter by team\./, 'Your tasks, the whole team’s and the meeting action points, as a list or on a calendar.');
    h = h.replace(/<div class="rf-bar">[\s\S]*?<\/div>(?=<div class="rf-tw">)/, `<div class="rf-bar tk-bar">${seg('tkv3', v, TKV.map(([k, n]) => [k, n, (TKALL || DB.tk).filter(t => !t.done && !tkArch(t) && (k === 'mine' ? t.who === ME() : k === 'mt' ? tkIsMt(t) : true)).length]))}${seg('tkvw', vw, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}</div>`);
    h = h.replace(/<button class="stat sbtn ([^"]*)" aria-pressed="[^"]*" data-act="tkf" data-v="[^"]*">([\s\S]*?)<\/button>/g, '<div class="stat $1">$2</div>').replace(/<span class="ss">filtering the list<\/span>/g, '');
    if(vw === 'list') return h;
    const i = h.indexOf('<div class="rf-tw">'); return i > 0 ? h.slice(0, i) + tkCal(tkList()) : h; }; }
/* the v3.25 source filter is replaced by these three, so tkList decides what the page shows */
let TKALL = null;
{ const f = VIEWS.dir.pages.tasks; VIEWS.dir.pages.tasks = (...x) => { const all = DB.tk; TKALL = all; if((S.f.tkv3 || 'mine') === 'mt'){ DB.tk = all.filter(tkIsMt); } try { return f(...x); } finally { DB.tk = all; TKALL = null; } }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/VMgTXjcJJzbaGF36XbYtUi'; } });
VERSIONS.push({v:'v3.26', date:TODAY, major:false, current:true, url:null, title:'Needs you now by kind, and tasks on a calendar', sum:'In Needs you now, approvals are green and alerts red, each with its actions and the eye at the end. My tasks has three filters, My tasks, All team tasks and Meeting action points, and a week and month calendar.', steps:[
  {t:'Approvals and alerts, told apart', min:.5, dolor:'Before, approvals and alerts looked alike in Needs you now.', show:['Approval in green, Alert in red, always at the start of the row.', 'The actions next to it, and the eye at the end opens the full detail.'], say:'You see at a glance what to approve and what to fix.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
  {t:'Three filters for tasks', min:.5, dolor:'Before, My tasks had team, source and status filters.', show:['My tasks, All team tasks and Meeting action points. Nothing else to set.'], say:'Simple to find what you need.', go:() => { S.role = 'dir'; S.trail = null; S.f.tkv3 = 'mt'; S.f.tkvw = 'list'; go('dir', 'tasks'); }},
  {t:'Tasks on a calendar', min:.5, dolor:'Before, tasks were only a list.', show:['Week or Month: each task on its due date, coloured by status.', 'Click a task to open it; +more opens that week.'], say:'See the load of the week before it arrives.', go:() => { S.role = 'dir'; S.trail = null; S.f.tkv3 = 'all'; S.f.tkvw = 'month'; go('dir', 'tasks'); }},
]});

/* =================== v3.27: the new palette, and one way to show a calendar =================== */
/* Palette: Dark green #0A3323, Midnight green #105666, Moss green #839958, Rosy brown #D3968C, Beige #F7F4D5, on a white background.
   Calendars: every calendar uses the same bar (List, Week, Month, then Previous, Today, Next) and the same month grid.
   Things with a time (meetings) use the hour grid in Week; things with only a date (tasks, assessment bookings) use the day list. */
const tkCalBar = vw => { const wk = vw === 'week', mo = vw === 'month';
  return `<div class="rf-bar cal-bar">${seg('tkvw', vw, [['list', 'List'], ['week', 'Week'], ['month', 'Month']])}${wk || mo ? `${nx('tkcn', '-1', wk ? 'Previous week' : 'Previous month', 'sec')}${nx('tkcn', '0', 'Today', 'sec')}${nx('tkcn', '1', wk ? 'Next week' : 'Next month', 'sec')}<span class="cal-lg"><i class="rf-chip xod"></i>Overdue<i class="rf-chip xtd"></i>Due today<i class="rf-chip xop"></i>Open<i class="rf-chip xmt"></i>Meeting action point<i class="rf-chip xdn"></i>Done</span>` : ''}</div>`; };
const tkChip2 = k => `<button class="rf-chip ${tkTone(k)}" data-act="tkView" data-v="${k.id}" data-tt="${esc(k.t)}, ${esc(pName(k.who) || RN(k.r))}"><b>${esc(k.t)}</b><small>${esc(pName(k.who) || RN(k.r))}${k.pr ? ', ' + esc(prOf(k.pr).ad) : ''}</small></button>`;
tkCal = xs => { const wk = S.f.tkvw === 'week', base = S.f.tkc || TODAY, by = {}; xs.forEach(k => { (by[k.due] = by[k.due] || []).push(k); }); const srt = ks => ks.slice().sort((a, b) => a.done - b.done || tkOver(b) - tkOver(a));
  if(wk){ const m0 = monday(base), days = Array.from({length:7}, (_, i) => addDays(m0, i)).filter((d, i) => i < 5 || (by[d] || []).length);
    return `<div class="rf-cal cw"><div class="rf-calh">Week of ${fmtDy(m0)}</div><div class="rf-wg" style="grid-template-columns:repeat(${days.length}, minmax(140px, 1fr))">${days.map(d => { const ks = srt(by[d] || []), dd = fromIso(d);
      return `<div data-date="${d}" class="rf-wd${d === TODAY ? ' today' : ''}"><div class="rf-wdh"><b>${DSH[dd.getDay()]} ${dd.getDate()}</b><small>${MSH[dd.getMonth()]}${d === TODAY ? ', today' : ''}</small></div>${ks.map(tkChip2).join('') || '<small class="rf-free">No tasks</small>'}<small class="rf-load">${plural(ks.filter(k => !k.done).length, 'open task', 'open tasks')}</small></div>`; }).join('')}</div></div>`; }
  const f = fromIso(base); f.setDate(1); const y = f.getFullYear(), mo = f.getMonth(), start = monday(iso(f)), cells = Array.from({length:42}, (_, i) => addDays(start, i)), rows = Math.ceil(((f.getDay() + 6) % 7 + new Date(y, mo + 1, 0).getDate()) / 7);
  return `<div class="rf-cal cm"><div class="rf-calh">${MSH[mo]} ${y}</div><div class="rf-mg">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="rf-mdh">${d}</div>`).join('')}${cells.slice(0, rows * 7).map(d => { const ks = srt(by[d] || []), dd = fromIso(d);
    return `<div data-date="${d}" class="rf-md${dd.getMonth() !== mo ? ' out' : ''}${d === TODAY ? ' today' : ''}"><small>${dd.getDate()}</small>${ks.slice(0, 3).map(tkChip2).join('')}${ks.length > 3 ? `<button class="rf-more" data-act="tkDay" data-v="${d}">+${ks.length - 3} more</button>` : ''}</div>`; }).join('')}</div></div>`; };
{ const f = VIEWS.dir.pages.tasks; VIEWS.dir.pages.tasks = (...x) => { const vw = S.f.tkvw || 'list'; S.f.tkvw = 'list'; let h; try { h = f(...x); } finally { S.f.tkvw = vw; }
    h = h.replace(/<div class="seg2 um-seg">(?:(?!<\/div>)[\s\S])*?data-act="tkvw"[\s\S]*?<\/div>/, '');
    const i = h.indexOf('<div class="rf-tw">'); if(i < 0) return h;
    return h.slice(0, i) + tkCalBar(vw) + (vw === 'list' ? h.slice(i) : tkCal(tkList())); }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/T54n1L3hYAxV499m7UBRCj'; } });
VERSIONS.push({v:'v3.27', date:TODAY, major:false, current:true, url:null, title:'New palette, and one calendar style', sum:'The app takes the new palette on a white background: dark green menu and header, midnight green for links and charts, moss and rosy brown as accents. Every calendar uses the same bar and the same month grid.', steps:[
  {t:'The new palette', min:.5, dolor:'Before, the app was navy on a grey background.', show:['White background everywhere; the menu and the header in dark green, the current item in white.', 'Key figures with a soft accent; charts in midnight and moss green.'], say:'Calmer, and the important things stand out.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
  {t:'One way to show a calendar', min:.5, dolor:'Before, tasks, meetings and bookings each had their own calendar.', show:['List, Week and Month, then Previous, Today and Next, in the same place everywhere.', 'Meetings, which have a time, use the hour grid; tasks and bookings, which only have a date, use the day list.'], say:'Learn one calendar, use it everywhere.', go:() => { S.role = 'dir'; S.trail = null; S.f.tkv3 = 'all'; S.f.tkvw = 'month'; go('dir', 'tasks'); }},
]});

/* =================== v3.28: back to REFYT blue, a new accent palette, and My tasks as a calendar in every app =================== */
/* Blue stays the brand: header, menu, main buttons. Accents: Delft blue #1D2A62, Carolina blue #87AECE, Beige #F5F3D8,
   Pistachio #AFD06E, Fern green #43711B, on a white background. My tasks works the same in every app. */
const tkListA = app => { const v = S.f.tkv3 || 'mine', team = k => app === 'dir' || teamOf(k.r) === app;
  return DB.tk.filter(k => !tkArch(k) && (v === 'mine' ? k.who === ME() : v === 'mt' ? tkIsMt(k) && team(k) : team(k))); };
['com', 'acc', 'ret', 'del'].forEach(a => { const f = VIEWS[a].pages.tasks; if(!f) return;
  VIEWS[a].pages.tasks = (...x) => { const all = DB.tk, v = S.f.tkv3 || 'mine', vw = S.f.tkvw || 'list', team = k => teamOf(k.r) === a;
    S.f.tkm = v === 'mine' ? 'mine' : 'all'; S.f.tkf = 'open';
    DB.tk = all.filter(k => !tkArch(k) && (v !== 'mt' || tkIsMt(k)));
    let h; try { h = f(...x); } finally { DB.tk = all; }
    const n = k => all.filter(t => !t.done && !tkArch(t) && (k === 'mine' ? t.who === ME() : k === 'mt' ? tkIsMt(t) && team(t) : team(t))).length;
    h = h.replace(/<div class="rf-bar">[\s\S]*?<\/div>(?=<div class="rf-tw">)/, `<div class="rf-bar tk-bar">${seg('tkv3', v, TKV.map(([k, l]) => [k, l, n(k)]))}</div>`);
    h = h.replace(/<button class="stat sbtn ([^"]*)" aria-pressed="[^"]*" data-act="tkf" data-v="[^"]*">([\s\S]*?)<\/button>/g, '<div class="stat $1">$2</div>').replace(/<span class="ss">filtering the list<\/span>/g, '');
    if(!/class="rf-bar tk-bar"/.test(h)){ const j = h.indexOf('<div class="rf-tw">'); if(j > 0) h = h.slice(0, j) + `<div class="rf-bar tk-bar">${seg('tkv3', v, TKV.map(([k, l]) => [k, l, n(k)]))}</div>` + h.slice(j); }
    const i = h.indexOf('<div class="rf-tw">'); if(i < 0) return h;
    return h.slice(0, i) + tkCalBar(vw) + (vw === 'list' ? h.slice(i) : tkCal(tkListA(a))); }; });

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/9sjZc1mgc2zEvGL4PrNsPb'; } });
VERSIONS.push({v:'v3.28', date:TODAY, major:false, current:true, url:null, title:'REFYT blue, new accents, and My tasks as a calendar everywhere', sum:'The REFYT blue is back for the header, menu and main buttons; Delft blue, Carolina blue, Pistachio, Fern green and Beige are the accents on a white background. My tasks in every app has the three filters and the week and month calendar.', steps:[
  {t:'REFYT blue with new accents', min:.5, dolor:'Before, the green palette replaced the REFYT blue.', show:['Header, menu and main buttons in REFYT blue, on white.', 'Key figures, charts, tags and calendars in Delft blue, Carolina blue, Pistachio and Fern green.'], say:'The brand stays; the accents make it easier to read.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'ovw'); }},
  {t:'My tasks, the same in every app', min:.5, dolor:'Before, only the Director had the calendar and the three filters.', show:['My tasks, All team tasks and Meeting action points in every app; All team tasks shows that app’s team.', 'List, Week and Month, like Meetings.'], say:'One way to see tasks, wherever you are.', go:() => { S.role = 'inc'; S.trail = null; S.f.tkv3 = 'all'; S.f.tkvw = 'week'; go('del', 'tasks'); }},
]});

/* =================== v3.29: scheme comparison and phase times redesigned; Business overview and Finance trimmed =================== */
/* Every "Compare schemes side by side" and "Average days in each phase" becomes a portfolio list on the left
   (select a scheme, tick several to compare) and a detailed view of the selected scheme on the right. */
const cpClient = s => esc((clOfSc(s) || {n:s.cl}).n);
const cpChk = () => S.f.cmpChk || (S.f.cmpChk = {});
A.cmpSel = el => { S.f.cmpSel = el.dataset.v; render(); };
A.cmpChkT = el => { const c = cpChk(), k = el.dataset.v; c[k] = !c[k]; if(!c[k]) delete c[k]; if(Object.keys(c).length < 2) S.f.cmpOn = false; render(); };
A.cmpGo = () => { S.f.cmpOn = !S.f.cmpOn; render(); };
A.adSel = el => { S.f.adSel = el.dataset.v; render(); };
const cpBox = (s) => { const on = !!cpChk()[s.id]; return `<button class="cp-c${on ? ' on' : ''}" data-act="cmpChkT" data-v="${s.id}" aria-pressed="${on}" title="${on ? 'Remove from' : 'Add to'} the comparison" aria-label="${on ? 'Remove from' : 'Add to'} the comparison">${on ? ico('check', 13) : ''}</button>`; };
const cpMg = (fcv, acv, tg) => fcv == null ? '' : `<div class="cp-mg"><small>Margin</small><div class="cp-mb"><i style="width:${Math.max(4, Math.min(100, fcv * 2))}%"></i>${tg != null ? `<em style="left:${Math.min(100, tg * 2)}%" title="target ${pc(tg)}"></em>` : ''}</div><div class="cp-ml"><span>Forecast ${pc(fcv)}</span>${acv != null ? `<span>Actual ${pc(acv)}</span>` : tg != null ? `<span>Target ${pc(tg)}</span>` : ''}</div></div>`;
function vbars(items, lbl){ const mx = Math.max(1, ...items.map(x => Math.max(x.v || 0, x.lim || 0)));
  return `<div class="vb" role="img" aria-label="${esc(lbl)}">${items.map(x => { const tone = x.lim && x.v > x.lim * 1.5 ? 'red' : x.lim && x.v > x.lim ? 'amb' : '';
    return `<${x.act ? `button data-act="${x.act}" data-v="${esc(x.av || '')}"` : 'div'} class="vb-c" title="${esc(x.l)}: ${x.v == null ? 'none' : x.v + ' days'}${x.lim ? ', limit ' + x.lim : ''}"><span class="vb-t"><b class="vb-n" style="bottom:calc(${x.v == null ? 0 : x.v / mx * 100}% + 4px)">${x.v == null ? '-' : x.v + 'd'}</b>${x.v != null ? `<i class="${tone}" style="height:${x.v / mx * 100}%"></i>` : ''}${x.lim ? `<em style="bottom:${x.lim / mx * 100}%"></em>` : ''}</span><small class="vb-l">${esc(x.l)}</small>${x.n != null ? `<small class="vb-s">${plural(x.n, 'property', 'properties')}</small>` : ''}</${x.act ? 'button' : 'div'}>`; }).join('')}</div>`; }

cmp = rows => { if(!(S.view === 'dir' && S.page.dir === 'dperf')) return ''; /* only in Scheme performance */ const ss = fSc(), biz = S.view === 'dir' && S.page.dir === 'dbiz'; rows = rows.filter(([l]) => !(biz && /^(Invoiced|Paid)$/.test(l)));
  if(!ss.length) return '';
  const sel = (ss.find(s => s.id === S.f.cmpSel) || ss.find(s => scMoney(s).won) || ss[0]), chk = cpChk(), nChk = ss.filter(s => chk[s.id]).length;
  const list = ss.map(s => { const m = scMoney(s), am = actMg(s), [rt, rl] = rating(s);
    return `<div class="cp-r${s.id === sel.id ? ' on' : ''}"><button class="cp-p" data-act="cmpSel" data-v="${s.id}" aria-pressed="${s.id === sel.id}"><span class="cp-n"><b>${esc(s.n)}</b><small>${cpClient(s)}</small></span><span class="cp-v"><small>Value won</small><b>${fm(m.won)}</b></span>${m.won ? cpMg(m.mgp, am, s.set.mg) : '<span class="cp-mg"></span>'}<span class="cp-s">${pill(rt, rl)}</span></button>${cpBox(s)}</div>`; }).join('');
  const m = sel ? scMoney(sel) : {}, am = actMg(sel), [rt, rl] = rating(sel), op = prsOf(sel.id).filter(p => OPENP.includes(p.ph)), lt = op.filter(p => late(p)).length, bl = op.filter(isBlocked).length;
  const segs = biz ? [{l:'Forecast cost', v:m.fc, f:fm, c:'#1E3A8A'}, {l:'Forecast margin', v:Math.max(0, m.won - m.fc), f:fm, c:'#AFD06E'}, {l:'Owed to us', v:m.owed, f:fm, c:'#87AECE'}, {l:'Owed by us', v:m.sup, f:fm, c:'#D3968C'}]
    : [{l:'Invoiced', v:m.inv, f:fm, c:'#1E3A8A'}, {l:'Paid', v:m.paid, f:fm, c:'#AFD06E'}, {l:'Owed to us', v:m.owed, f:fm, c:'#87AECE'}, {l:'Owed by us', v:m.sup, f:fm, c:'#D3968C'}];
  const fin = `<div class="cp-k"><h4>Financial breakdown</h4>${sum(segs, x => x.v) ? donut(segs, fk(m.won), 'value won') : empty('No money yet.')}</div>`;
  const tgt = sel.set.mg, a2 = am != null ? am : tgt, d = m.won ? Math.round(a2 - m.mgp) : 0;
  const perf = `<div class="cp-k"><h4>Margin performance</h4>${m.won ? `<div class="cp-pf"><div><b>${pc(m.mgp)}</b><span style="height:${Math.min(100, m.mgp * 2)}%" class="f"></span><small>Forecast margin</small></div><div><em class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '+' : ''}${d} pts</em></div><div><b>${pc(a2)}</b><span style="height:${Math.min(100, a2 * 2)}%" class="${am != null ? 'a' : 't'}"></span><small>${am != null ? 'Actual margin' : 'Target'}</small></div></div>` : empty('No approved quotes yet.')}</div>`;
  const why = !m.won ? 'Nothing approved by the client yet, so there is no margin to judge.' : `Forecast margin is ${pc(m.mgp)} against a ${pc(tgt)} target${am != null ? `, and ${pc(am)} on the jobs already closed` : ''}. ${op.length ? `${plural(op.length, 'open property', 'open properties')}${lt ? `, ${lt} over the phase limit` : ', all within their limits'}${bl ? `, ${bl} blocked` : ''}.` : 'No open properties.'}${m.owed ? ` ${fm(m.owed)} is owed to us.` : ''}`;
  const ins = `<div class="cp-k cp-ins"><h4>Rating insights</h4><b class="cp-rt ${rt}">${rl}</b><p>${why}</p></div>`;
  const figs = rows.length ? `<div class="cp-k cp-fg"><h4>In this view</h4><div class="cp-fgg">${rows.map(([l, f]) => `<div><small>${l}</small><b>${f(sel) || '-'}</b></div>`).join('')}</div></div>` : '';
  const sel2 = ss.filter(s => chk[s.id]), cmpT = S.f.cmpOn && sel2.length >= 2 ? `<div class="cp-tb"><div class="cp-tbh"><b>Side by side: ${sel2.map(s => esc(s.n)).join(', ')}</b>${nx('cmpGo', '', 'Close the comparison', 'sec')}</div><div class="el-wide"><div class="rf-mx rf-cmpt"><table><thead><tr><th></th>${sel2.map(s => `<th>${esc(s.n)}</th>`).join('')}</tr></thead><tbody>${[['Value won', s => fm(scMoney(s).won)], ['Forecast margin', s => scMoney(s).won ? mgTag(scMoney(s).mgp, s.set.mg) : '-'], ['Rating', s => pill(...rating(s))], ...rows.filter(([l]) => !['Value won', 'Forecast margin', 'Rating'].includes(l))].map(([l, f]) => `<tr><td><b>${l}</b></td>${sel2.map(s => `<td>${f(s) || '-'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>` : '';
  return grpH('Compare schemes side by side', ss.length) + `<div class="cp">
    <section class="cp-l"><div class="cp-h"><small>Scheme portfolio: detail comparison</small><button class="btn sec sm" data-act="cmpGo" ${nChk >= 2 ? '' : 'disabled title="Tick two or more schemes"'}>${S.f.cmpOn && nChk >= 2 ? 'Hide comparison' : `Compare selected${nChk ? ` (${nChk})` : ''}`}</button></div>${list}</section>
    <section class="cp-d"><div class="cp-h"><small>Detailed view: <b>${esc(sel.n)}</b> (selected)</small></div><div class="cp-dg">${fin}${perf}${ins}${figs}</div><div class="cp-ac">${nx('ficha', sel.id, 'Open the scheme', 'sec')}${nx('cmpGo', '', nChk >= 2 ? 'Compare selected' : 'Tick schemes to compare', 'sec')}</div></section></div>${cmpT}`; };
/* the Compare selected buttons only work with two or more ticked */
{ const o = A.cmpGo; A.cmpGo = el => { if(Object.keys(cpChk()).filter(k => fSc().some(s => s.id === k)).length < 2) return toast('Tick two or more schemes to compare them side by side.'); o(el); }; }

/* ---------- Average days in each phase, same structure ---------- */
function avgDays(ss){ const sel = ss.find(s => s.id === S.f.adSel) || ss.find(s => prsOf(s.id).some(p => OPENP.includes(p.ph))) || ss[0]; if(!sel) return '';
  const st = s => { const ps = prsOf(s.id).filter(p => OPENP.includes(p.ph)), over = OPENP.filter(ph => { const a = avgIn(prsOf(s.id), ph); return a != null && a > LIMIT[ph]; }); return {ps, over, avg:ps.length ? Math.round(sum(ps, daysIn) / ps.length) : null}; };
  const list = ss.map(s => { const x = st(s), worst = OPENP.map(ph => [ph, avgIn(prsOf(s.id), ph)]).filter(y => y[1] != null).sort((a, b) => b[1] / LIMIT[b[0]] - a[1] / LIMIT[a[0]])[0];
    return `<div class="cp-r${s.id === sel.id ? ' on' : ''}"><button class="cp-p ad" data-act="adSel" data-v="${s.id}" aria-pressed="${s.id === sel.id}"><span class="cp-n"><b>${esc(s.n)}</b><small>${cpClient(s)}</small></span><span class="cp-v"><small>Open</small><b>${x.ps.length}</b></span><span class="cp-v"><small>Avg days</small><b>${x.avg == null ? '-' : x.avg}</b></span><span class="cp-v cp-w"><small>Longest phase</small><b>${worst ? `${worst[0].slice(3)}, ${worst[1]}d` : '-'}</b></span><span class="cp-s">${!x.ps.length ? pill('tk', 'No open work') : x.over.length ? pill(x.over.length > 1 ? 'tred' : 'ta', `${x.over.length} over limit`) : pill('tg', 'Within limits')}</span></button></div>`; }).join('');
  const x = st(sel), items = OPENP.map(ph => ({l:ph.slice(3), v:avgIn(prsOf(sel.id), ph), lim:LIMIT[ph], n:prsOf(sel.id).filter(p => p.ph === ph).length, act:'bzSt0', av:`${sel.id}|${ph}`}));
  const why = !x.ps.length ? 'No open properties in this scheme.' : x.over.length ? `${x.over.map(ph => ph.slice(3)).join(' and ')} ${x.over.length > 1 ? 'are' : 'is'} over the limit on average. Click a bar to see the properties.` : 'Every phase is within its limit on average.';
  return grpH('Average days in each phase', ss.length) + `<div class="cp"><section class="cp-l"><div class="cp-h"><small>Scheme portfolio: time in each phase</small></div>${list}</section><section class="cp-d"><div class="cp-h"><small>Detailed view: <b>${esc(sel.n)}</b> (selected)</small></div><div class="cp-k"><h4>Average days in each phase</h4><p class="cp-sub">The line on each bar is the phase limit. ${why}</p>${vbars(items, 'Average days in each phase')}</div><div class="cp-ac">${nx('ficha', sel.id, 'Open the scheme', 'sec')}</div></section></div>`; }
A.bzSt0 = el => { const [sid, ph] = el.dataset.v.split('|'); S.modal = {k:'adl', sid, ph}; renderLayer(); };
MODALS.adl = m => { const s = scOf(m.sid), xs = prsOf(s.id).filter(p => p.ph === m.ph).sort((a, b) => daysIn(b) - daysIn(a));
  return modal(`${s.n}: ${m.ph}`, `${plural(xs.length, 'property', 'properties')}, limit ${LIMIT[m.ph]} days.`, xs.map(p => `<div class="mbr um-row" data-act="prOpen" data-v="${p.id}" tabindex="0">${cell(esc(p.ad), p.ref, 2)}${cell(`${daysIn(p)} days`, `limit ${LIMIT[p.ph]}`)}${cell(late(p) ? pill(late(p) === 'red' ? 'tred' : 'ta', 'Over time') : pill('tg', 'On time'), '')}</div>`).join('') || empty('No properties in this phase.'), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button></div>`, 640); };
{ const o = A.prOpen; A.prOpen = el => { if(S.modal && S.modal.k === 'adl') S.modal = null; o(el); }; }
{ const f = VIEWS.dir.pages.dperf; VIEWS.dir.pages.dperf = (...x) => { const h = f(...x), a = h.indexOf('<div class="gh">Average days in each phase'), b = h.indexOf('<div class="gh">Compare schemes side by side');
    return a > 0 && b > a ? h.slice(0, a) + avgDays(fSc()) + h.slice(b) : h; }; }

/* ---------- Business overview: value won by month, no invoiced or paid, stages as a bar chart ---------- */
const MLAB = n => { const d = fromIso(TODAY), o = []; for(let i = n - 1; i >= 0; i--){ const x = new Date(d.getFullYear(), d.getMonth() - i, 1); o.push(MSH[x.getMonth()]); } return o; };
A.bzSc = el => { S.f.bzSc = el.dataset.v; render(); };
function stageChart(){ const ss = fSc(), ps = fPr().filter(p => OPENP.includes(p.ph)), wit = ss.filter(s => ps.some(p => p.sc === s.id)); if(!wit.length) return ovCard('Open properties: days in each stage', '', ovEmpty('No open properties.'), '', 'ov-wide');
  const s = wit.find(x => x.id === S.f.bzSc) || wit[0], T = PTYPE[s.ty], xs = ps.filter(p => p.sc === s.id), by = {}; xs.forEach(p => { const k = stageOf(p); (by[k] = by[k] || []).push(p); });
  const order = T ? T.st.filter(k => by[k]) : Object.keys(by), items = order.map(k => ({l:k, v:Math.round(sum(by[k], daysIn) / by[k].length), lim:Math.round(sum(by[k], p => LIMIT[p.ph] || 14) / by[k].length), n:by[k].length, act:'bzSt', av:`${s.id}|${k}`}));
  return `<section class="ov-card ov-wide"><div class="ov-h"><div><h3>Open properties: days in each stage</h3><p>Each contract with its own stages. Bars show the average days the open properties have spent in each stage; the line is the limit. Click a bar for the properties.</p></div></div><div class="bz-tabs">${wit.map(x => `<button class="bz-tab${x.id === s.id ? ' on' : ''}" data-act="bzSc" data-v="${x.id}" aria-pressed="${x.id === s.id}">${esc(x.n)}<small>${ps.filter(p => p.sc === x.id).length}</small></button>`).join('')}</div><div class="ov-b">${vbars(items, `Days in each stage, ${s.n}`)}<p class="cp-sub">${esc(s.n)}: ${plural(xs.length, 'open property', 'open properties')} in ${T ? T.sys : 'its client system'}.</p></div></section>`; }
VIEWS.dir.pages.dbiz = () => { const ss = fSc(), ms = ss.map(s => [s, scMoney(s)]), won = sum(ms, x => x[1].won), fc = sum(ms, x => x[1].fc), am = ss.map(actMg).filter(x => x != null), ml = MLAB(6), wi = waitItems();
  const won2 = ss.map((s, i) => ({l:s.n, v:scMoney(s).won, f:fk, act:'ficha', v2:s.id, c:PAL[i % PAL.length]}));
  const vw = `<section class="ov-card"><div class="ov-h"><div><h3>Value won per scheme</h3><p>Approved by clients, in the schemes selected above.</p></div></div><div class="ov-b">${donut(won2, fk(sum(won2, w => w.v)), 'value won')}</div></section>`;
  const wt = `<section class="ov-card"><div class="ov-h"><div><h3>What is waiting, and who it is waiting on</h3><p>Approvals, hold points, blocks, client approvals and jobs over their limit, the longest wait first.</p></div></div><div class="ov-b">${wi.slice(0, 10).map(w => ovRow(`<button class="ov-lk" data-act="prOpen" data-v="${w.p.id}">${esc(w.p.ad)}</button>`, `${esc(scOf(w.p.sc).n)}. ${w.what}`, `<span class="ov-num">${esc(w.who)}<small>${esc(w.r)}</small></span>${pill(w.d > 14 ? 'tred' : w.d > 7 ? 'ta' : 'tk', w.d ? plural(w.d, 'day', 'days') : 'today')}`, w.ap ? `<button class="btn sec sm" data-act="apView" data-v="${w.id}">${ico('eye', 14)}Details</button>` : '')).join('') || ovEmpty('Nothing waiting.')}</div>${wi.length > 10 ? `<div class="ov-f"><small class="pg-n">and ${wi.length - 10} more</small></div>` : ''}</section>`;
  return trBar() + dHead('Business overview', 'All programmes and schemes: value won by month, where the work is waiting, margins, owed to us and by us.')
    + `<div class="cstats">${stat('tk', 'Value won', fm(won), 'approved by clients', 'gogo', 'dir:sch')}${stat('tk', 'Forecast margin', pc(won ? (won - fc) / won * 100 : 0), am.length ? `actual ${pc(sum(am) / am.length)} on closed jobs` : 'no closed jobs yet')}${stat('tk', 'Open properties', fPr().filter(p => OPENP.includes(p.ph)).length, `${fPr().filter(p => OPENP.includes(p.ph) && late(p)).length} over the phase limit`, 'gogo', 'dir:prs')}${stat('tk', 'Owed to us', fm(sum(ms, x => x[1].owed)), `${fm(sum(ms, x => x[1].sup))} owed by us`, 'gogo', 'acc:trg')}</div>`
    + chart(tvals(won / 6 * 1.4, 'wonm', 6), ml, fk, 'Value won by month')
    + `<div class="ov-g bz-g">${stageChart()}${vw}${wt}</div>`
    + cmp([['Value won', s => fm(scMoney(s).won)], ['Forecast margin', s => scMoney(s).won ? mgTag(scMoney(s).mgp, s.set.mg) : ''], ['Actual margin, closed', s => actMg(s) == null ? '' : pc(actMg(s))], ['Owed to us', s => fm(scMoney(s).owed)], ['Owed by us', s => fm(scMoney(s).sup)], ['Rating', s => pill(...rating(s))]]); };

/* ---------- Finance: only the forecast margin trend, by month; no income by week ---------- */
{ const f = VIEWS.dir.pages.dfin; VIEWS.dir.pages.dfin = (...x) => { let h = f(...x); const i = h.indexOf('Income by ', h.indexOf('<div class="cstats">')), a = i > 0 ? h.lastIndexOf('<div class="rf-g2">', i) : -1, b = h.indexOf('<div class="gh">Cash forecast');
    const ps = fPr().filter(p => pIdx(p.ph) >= 2), avg = ps.length ? sum(ps, p => pMoney(p).mgp) / ps.length : 0;
    if(a > 0 && b > a) h = h.slice(0, a) + chart(tvals(Math.max(1, avg), 'mgm', 6).map(Math.round), MLAB(6), v => v + '%', 'Forecast margin trend, by month') + h.slice(b);
    return h.replace('Income by month, invoiced against paid, days to pay per client', 'Invoiced against paid, the forecast margin by month, days to pay per client').replace(', margin trend and the cash forecast', ' and the cash forecast'); }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/QtuzVHByCvv6eq7LHt2KX9'; } });
VERSIONS.push({v:'v3.29', date:TODAY, major:false, current:true, url:null, title:'Scheme comparison and phase times, redesigned', sum:'Compare schemes side by side and Average days in each phase are a portfolio list with a detailed view of the selected scheme. Business overview shows value won by month and stages as a bar chart, without invoiced and paid. Finance shows only the forecast margin trend, by month.', steps:[
  {t:'Compare schemes side by side', min:1, dolor:'Before, it was a wide table of numbers.', show:['On the left, every scheme with value won, its margin bar and rating; click one to see it on the right.', 'On the right, the financial breakdown, margin performance, rating insights and this view’s figures.', 'Tick two or more and Compare selected puts them side by side.'], say:'Read one scheme in depth, or several against each other.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dperf'); }},
  {t:'Average days in each phase', min:.5, dolor:'Before, a grid of numbers per phase.', show:['Pick a scheme: its bar chart shows the average days in each phase, with the limit as a line.', 'Click a bar for the properties behind it.'], say:'Where each scheme loses time, at a glance.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dperf'); }},
  {t:'Business overview and Finance, trimmed', min:.5, dolor:'Before, both views repeated invoiced and paid, and trends were by week.', show:['Business overview: value won by month, stages as a bar chart per contract, no invoiced or paid.', 'Finance: only the forecast margin trend, by month.'], say:'Fewer charts, each one answering a question.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'dbiz'); }},
]});

/* =================== v3.30: Delivery feedback =================== */
/* 1. Ready to install shows the date of every change.  2. Health and safety leaves Delivery (it moves to a Director view later).
   3. Each person sees only their properties; Director and general admins see all (a sample, the rules come later).
   4. Suppliers and orders can be added by hand or from a PDF (the PDF reading is simulated in the demo).
   5. Meeting detail aligned.  6. Raise an order: picking a property works. */

/* ---------- 6. Raise an order: the property and measure pickers ---------- */
IN.oal = t => { const k = t.dataset.k, i = +((k.match(/\d+$/) || ['0'])[0]), f = /^oap/.test(k) ? 'pr' : 'm', a = S.modal && S.modal.al && S.modal.al[i]; if(!a) return;
  a[f] = t.value; if(f === 'pr'){ const p = prOf(t.value); a.m = p && p.ms[0] ? p.ms[0].m : ''; } };

/* ---------- 2. Health and safety leaves Delivery ---------- */
{ const o = VIEWS.del.side; VIEWS.del.side = () => o().replace(/<button class="nav" data-act="pg_del" data-v="hs"[\s\S]*?<\/button>/, ''); }
{ const a0 = alerts; alerts = () => a0().filter(a => !(a.fix && a.fix[2] === 'del:hs')); }
if(S.page.del === 'hs') S.page.del = 'ovw';

/* ---------- 3. Each person sees only their properties ---------- */
const scBy = n => (DB.sc.find(s => s.n.includes(n)) || {}).id;
DB.vis = DB.vis || {yah:{all:true}, lan:{all:true, admin:true}, tom:{sc:DB.sc.map(s => s.id)}, dre:{sc:[scBy('Medway'), scBy('Redbridge')]}, akr:{sc:[scBy('Redbridge')]},
  sar:{sc:DB.sc.filter(s => s.ty === 'E.ON').map(s => s.id)}, ram:{sc:[scBy('Medway'), scBy('Thanet'), scBy('GLA')]}, ahm:{sc:[scBy('Medway'), scBy('Thanet'), scBy('GLA'), scBy('Redbridge')]}, afa:{own:true, sc:[]}, xen:{own:true, sc:[]}, hse:{sc:[]}};
const visOf = k => DB.vis[k] || (DB.vis[k] = {sc:[]});
const seesAll = k => S.role === 'dir' || !!visOf(k).all;
const canSee = (p, k) => { const v = visOf(k); return v.all || (window.__cs2 && window.__cs2(p, k)) || (v.sc || []).includes(p.sc) || p.b.who === k || (p.b.visit && p.b.visit.by === k); };
let VISN = null;
const visWrap = fn => (...x) => { const me = ME(); if(seesAll(me) || VISN) return fn(...x); const all = DB.pr, vis = all.filter(p => canSee(p, me)); vis.find = (...a) => all.find(...a); vis.findIndex = (...a) => all.findIndex(...a);
  DB.pr = vis; window.__prAll = all; VISN = {n:vis.length, t:all.length}; try { return fn(...x); } finally { DB.pr = all; VISN = null; } };
/* the note on the property lists */
const visNote = () => { if(!VISN) return ''; const v = visOf(ME());
  return `<div class="vis-n">${ico('eye', 15)}<span>You see <b>${VISN.n} of ${VISN.t}</b> properties: ${v.own ? 'the ones you assess' : `the schemes you work on${(v.sc || []).length ? ` (${v.sc.map(id => esc(scOf(id).n)).join(', ')})` : ''}`}. The Director and general admins see all of them.</span></div>`; };
[['del', ['pro', 'rdy', 'hold', 'clo', 'cs', 'ord']], ['ret', ['bk', 'rq', 'pk']], ['com', ['quo', 'mrg']], ['acc', ['trg', 'inv']]].forEach(([a, ks]) => ks.forEach(k => { const f = VIEWS[a].pages[k]; if(!f) return; VIEWS[a].pages[k] = (...x) => { const h = f(...x), n = visNote(); if(!n) return h; const i = h.indexOf('</div></div>', h.indexOf('<div class="op-h">')); return i > 0 ? h.slice(0, i + 12) + n + h.slice(i + 12) : n + h; }; }));
/* Director: Who sees what */
A.visAll = el => { const v = visOf(el.dataset.v); v.all = !v.all; render(); };
A.visSc = el => { const [k, sc] = el.dataset.v.split('|'), v = visOf(k); v.sc = v.sc || []; v.sc = v.sc.includes(sc) ? v.sc.filter(x => x !== sc) : [...v.sc, sc]; render(); };
A.visAs = el => { const r = Object.keys(ROLES).find(x => ROLES[x][1] === el.dataset.v); if(!r) return toast('No role uses this person yet.'); A.setRole({dataset:{v:r}}); };
VIEWS.dir.pages.vis = () => trBar() + oph('Who sees what', 'A sample of property visibility. Each person sees the properties of the schemes ticked here, plus the ones they are assigned to directly (an assessor sees the jobs they assess). The Director and anyone marked as general admin see everything. The final rules will be agreed with REFYT.')
  + `<div class="el-wide"><div class="rf-mx vis-t"><table><thead><tr><th>Person</th><th>Sees every property</th>${DB.sc.map(s => `<th>${esc(s.n)}</th>`).join('')}<th>Sees</th><th></th></tr></thead><tbody>${Object.keys(PEO).map(k => { const v = visOf(k), dir = k === ROLES.dir[1], n = dir || v.all ? DB.pr.length : DB.pr.filter(p => canSee(p, k)).length;
    return `<tr><td><b>${esc(PEO[k].n)}</b><small class="mini" style="display:block">${esc(PEO[k].r)}${v.own ? ', plus the jobs they assess' : ''}</small></td><td>${dir ? pill('tb', 'Director') : `<button class="vis-b${v.all ? ' on' : ''}" data-act="visAll" data-v="${k}" aria-pressed="${!!v.all}">${v.all ? ico('check', 13) + ' General admin' : 'No'}</button>`}</td>${DB.sc.map(s => `<td>${dir || v.all ? '<b class="z">all</b>' : `<button class="vis-c${(v.sc || []).includes(s.id) ? ' on' : ''}" data-act="visSc" data-v="${k}|${s.id}" aria-pressed="${(v.sc || []).includes(s.id)}" aria-label="${esc(PEO[k].n)} sees ${esc(s.n)}">${(v.sc || []).includes(s.id) ? ico('check', 13) : ''}</button>`}</td>`).join('')}<td><b>${n}</b> of ${DB.pr.length}</td><td>${dir ? '' : nx('visAs', k, 'View as', 'sec')}</td></tr>`; }).join('')}</tbody></table></div></div>`;
{ const o = VIEWS.dir.side; VIEWS.dir.side = () => { const h = o(); if(typeof SETIT !== 'undefined' && !SETIT.some(x => x[0] === 'vis')) SETIT.push(['vis', 'Who sees what']); return h.replace('<div class="sb-sec">Settings</div>', `<div class="sb-sec">Settings</div>${sbItem(S.page.dir, pageAct('dir'))(['vis', 'Who sees what', 'user'])}`); }; }

/* ---------- 1. Ready to install: the date of every change ---------- */
const DSEQ = k => k === 'mat' ? ['Requested', 'Approved', 'Delivered', 'Done'] : ['Booked', 'Done'];
const DBY = {Approved:'dre', Requested:'dre', Booked:'dre', Delivered:'akr', Done:'dre'};
DB.dh = DB.dh || {}; DB.dcl = DB.dcl || {}; DB.drd = DB.drd || {};
DB.pr.forEach((p, pi) => { const inD = p.ph === 'D. Prepare to install', past = ['E. Install', 'F. Close out', 'Paid'].includes(p.ph); if(!inD && !past) return;
  const base = inD ? p.phOn : addDays(p.phOn, -16); let last = base;
  DITEMS.forEach(([k], ki) => { if(p.dna[k]) return; const seq = DSEQ(k), cur = past ? 'Done' : p.d[k], n = seq.indexOf(cur) + 1; if(n <= 0) return;
    DB.dh[`${p.id}|${k}`] = seq.slice(0, n).map((st, i) => { let on = addDays(base, 1 + i * 2 + (ki + pi) % 3); if(dDiff(on) > 0) on = TODAY; if(on > last) last = on; return {st, on, by:k === 'rams' && st === 'Done' ? 'hse' : DBY[st]}; }); });
  if(past || (inD && ready(p))) DB.drd[p.id] = last; if(past) DB.dcl[p.id] = dDiff(p.phOn) <= 0 && p.ph === 'E. Install' ? p.phOn : addDays(last, 2); });
/* every change made in the app is stamped with the date and the person */
const dTrack = () => { DB.pr.forEach(p => { if(p.ph === 'D. Prepare to install'){ DITEMS.forEach(([k]) => { if(p.dna[k]) return; const h = DB.dh[`${p.id}|${k}`] || (DB.dh[`${p.id}|${k}`] = []), cur = p.d[k];
      if(cur !== 'Not booked' && (!h.length || h[h.length - 1].st !== cur)) h.push({st:cur, on:TODAY, by:ME()}); }); if(ready(p) && !DB.drd[p.id]) DB.drd[p.id] = TODAY; if(!ready(p)) delete DB.drd[p.id]; }
    else if(['E. Install', 'F. Close out', 'Paid'].includes(p.ph) && DB.drd[p.id] && !DB.dcl[p.id]) DB.dcl[p.id] = TODAY; }); };
A.rdyTl = el => { S.f.rdyTl = S.f.rdyTl === el.dataset.v ? null : el.dataset.v; render(); };
A.rdySeg = el => { S.f.rdyS = el.dataset.v; S.f.rdyTl = null; render(); };
const dLast = (p, k) => { const h = DB.dh[`${p.id}|${k}`] || []; return h[h.length - 1]; };
function rdyTimeline(p){ const steps = DITEMS.filter(([k]) => !p.dna[k]).map(([k, n]) => { const h = DB.dh[`${p.id}|${k}`] || [];
    return `<div class="tl-i"><b>${esc(n)}</b><div class="tl-s">${h.length ? h.map(x => `<span class="tl-c ${x.st === 'Done' ? 'ok' : ''}"><em>${x.st}</em>${fmtDy(x.on)}<small>${esc(PEO[x.by] ? PEO[x.by].n : RN('inc'))}</small></span>`).join(`<i class="tl-ar">${ico('chev', 12)}</i>`) : '<span class="tl-c no"><em>Not booked yet</em></span>'}</div></div>`; }).join('');
  const ms = [['Entered phase D', p.ph === 'D. Prepare to install' ? p.phOn : addDays(p.phOn, -16)], ['Ready to install', DB.drd[p.id]], ['Closed, moved to install', DB.dcl[p.id]]];
  return `<div class="tl"><div class="tl-m">${ms.map(([l, d]) => `<div class="${d ? 'on' : ''}"><small>${l}</small><b>${d ? fmtDy(d) : 'Not yet'}</b></div>`).join('')}</div>${steps}</div>`; }
VIEWS.del.pages.rdy = (...x) => { const seg0 = S.f.rdyS || 'open', open = DB.pr.filter(p => p.ph === 'D. Prepare to install'), closed = DB.pr.filter(p => DB.dcl[p.id] && p.ph !== 'D. Prepare to install' && p.ph !== 'Cancelled'), xs = seg0 === 'open' ? open : closed;
  const cellD = (p, k) => { if(p.dna[k]) return '<b class="z">n/a</b>'; const v = seg0 === 'open' ? p.d[k] : 'Done', l = dLast(p, k); return `${v === 'Done' ? pill('tg', 'Done') : v === 'Not booked' ? pill('tk', 'Not booked') : pill('ta', v)}${l ? `<small class="rd-d">${fmtDy(l.on).replace(/, \d{4}$/, '')}</small>` : ''}`; };
  return trBar() + oph('Ready to install', 'Every phase D item per property, with the date of its last change. Open Timeline for each step: requested, approved, booked, delivered, done, and when the property was ready and closed.')
    + `<div class="rf-bar">${seg('rdySeg', seg0, [['open', 'In phase D', open.length], ['closed', 'Closed, moved to install', closed.length]])}</div>`
    + `<div class="el-wide"><div class="rf-mx rd-t"><table><thead><tr><th>Property</th>${DITEMS.map(([, n]) => `<th>${n.split(' ').slice(0, 2).join(' ')}</th>`).join('')}<th>${seg0 === 'open' ? 'Ready' : 'Closed'}</th><th></th></tr></thead><tbody>${xs.map(p => `<tr><td><button class="lnk4" data-act="prIns" data-v="${p.id}"><b>${esc(p.ad)}</b></button><small class="mini" style="display:block">${scOf(p.sc).n}</small></td>${DITEMS.map(([k]) => `<td>${cellD(p, k)}</td>`).join('')}<td>${seg0 === 'open' ? (ready(p) ? `${pill('tg', 'Ready')}<small class="rd-d">since ${fmtDy(DB.drd[p.id] || TODAY).replace(/, \d{4}$/, '')}</small>` : '') : `${pill('tb', 'Closed')}<small class="rd-d">${fmtDy(DB.dcl[p.id]).replace(/, \d{4}$/, '')}</small>`}</td><td>${nx('rdyTl', p.id, S.f.rdyTl === p.id ? 'Hide timeline' : 'Timeline', 'sec')}</td></tr>${S.f.rdyTl === p.id ? `<tr class="tl-row"><td colspan="${DITEMS.length + 3}">${rdyTimeline(p)}</td></tr>` : ''}`).join('') || `<tr><td colspan="${DITEMS.length + 3}">${empty(seg0 === 'open' ? 'No properties in phase D.' : 'No properties closed yet.')}</td></tr>`}</tbody></table></div></div>`; };
VIEWS.del.pages.rdy = (f => (...x) => { const h = f(...x), n = visNote(); return n ? h.replace('<div class="rf-bar">', n + '<div class="rf-bar">') : h; })(VIEWS.del.pages.rdy);

/* ---------- 4. Suppliers and orders, by hand or from a PDF (simulated) ---------- */
DB.supx = DB.supx || {};
const SUPPDF = [{n:'Northgate Insulation Ltd', ct:'Materials', email:'orders@northgate-insulation.co.uk', phone:'01634 552 018', terms:'30'}, {n:'Brightline Electrical Services', ct:'Subcontract labour', email:'accounts@brightline-electrical.co.uk', phone:'020 8123 4471', terms:'14'}, {n:'Weald Scaffolding', ct:'Scaffold', email:'hire@wealdscaffolding.co.uk', phone:'01892 330 761', terms:'30'}];
A.supNew = () => { S.modal = {k:'sup', tab:'form', n:'', ct:'Materials', email:'', phone:'', terms:'30'}; renderLayer(); };
A.supTab = el => { S.modal.tab = el.dataset.v; renderLayer(); };
A.supList = () => { S.modal = {k:'supl'}; renderLayer(); };
MODALS.sup = m => { const ok = m.n.trim() && !SUPS.includes(m.n.trim());
  const pdfBox = `<label class="pdf-drop"><input type="file" accept="application/pdf,.pdf" data-pdf="sup">${ico('upload', 20)}<b>${m.reading ? 'Reading the PDF...' : 'Choose the supplier’s PDF'}</b><small>A quote, an invoice or a company profile. The details are filled in for you to check.</small></label><p class="hint">Demo: the reading is simulated. Reading real PDFs comes with the integration.</p>`;
  const form = (m.from ? `<div class="pdf-ok">${ico('check', 14)}<span>Read from <b>${esc(m.from)}</b>. Check the details before saving.</span></div>` : '') + fld('Supplier name', 'm', 'n', m.n, {req:true}) + `<small class="tw-lab">Main cost type</small>${seg('mset', m.ct, CTYPES.map(c => [c, c])).replace(/data-act="mset"/g, 'data-act="mset" data-k="ct"')}` + `<div class="rf-g2f">${fld('Email', 'm', 'email', m.email)}${fld('Phone', 'm', 'phone', m.phone)}</div>` + fld('Payment terms (days)', 'm', 'terms', m.terms, {type:'number'}) + (m.n.trim() && SUPS.includes(m.n.trim()) ? '<p class="hint">This supplier already exists.</p>' : '');
  return modal('Add a supplier', 'Type the details in, or upload a PDF and check what was read.', `${seg('supTab', m.tab, [['form', 'Type it in'], ['pdf', 'From a PDF']])}<div style="margin-top:12px">${m.tab === 'pdf' ? pdfBox : form}</div>`, mfoot('Save supplier', 'supOk', ok), 620); };
A.supOk = () => { const m = S.modal, n = m.n.trim(); SUPS.push(n); DB.supx[n] = {ct:m.ct, email:m.email, phone:m.phone, terms:numIn(m.terms) || 30, on:TODAY, by:ME(), from:m.from || ''}; S.modal = null; render(); toast(`${esc(n)} added. It is in the supplier list for new orders.`); };
MODALS.supl = () => modal('Suppliers', `${SUPS.length} suppliers. New ones show who added them and how.`, SUPS.map(n => { const x = DB.supx[n], sp = sum(DB.or.filter(o => o.sup === n && o.st !== 'Rejected'), o => o.amt);
  return rdiv(cell(esc(n), x ? `${x.ct}${x.email ? ', ' + esc(x.email) : ''}` : 'Existing supplier', 2.4) + cell(fm(sp), `${DB.or.filter(o => o.sup === n).length} orders`) + cell(x ? `Added ${fmtDy(x.on)}` : '', x ? (x.from ? 'from a PDF' : 'by hand') : '')); }).join(''), `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button><button class="btn pri lg" data-act="supNew">Add a supplier</button></div>`, 760);
A.orPdf = () => { S.modal = {k:'opdf'}; renderLayer(); };
MODALS.opdf = m => modal('Order from a PDF', 'Upload the supplier’s quote or order. The order is filled in for you to check, then it goes for approval like any other.', `<label class="pdf-drop"><input type="file" accept="application/pdf,.pdf" data-pdf="or">${ico('upload', 20)}<b>${m.reading ? 'Reading the PDF...' : 'Choose the PDF'}</b><small>Supplier, cost type, properties and amounts are read from it.</small></label><p class="hint">Demo: the reading is simulated. Reading real PDFs comes with the integration.</p>`, `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Cancel</button></div>`, 560);
document.addEventListener('change', e => { const t = e.target; if(!t.matches || !t.matches('input[type=file][data-pdf]') || !t.files || !t.files[0]) return; const f = t.files[0].name, kind = t.dataset.pdf; S.modal.reading = true; renderLayer();
  setTimeout(() => { if(!S.modal) return; const h = [...f].reduce((a, c) => a + c.charCodeAt(0), 0);
    if(kind === 'sup'){ const s = SUPPDF.find(x => f.toLowerCase().includes(x.n.split(' ')[0].toLowerCase())) || SUPPDF[h % SUPPDF.length]; Object.assign(S.modal, {tab:'form', reading:false, from:f, n:s.n, ct:s.ct, email:s.email, phone:s.phone, terms:s.terms}); renderLayer(); return; }
    const vis = DB.pr.filter(p => p.ph === 'D. Prepare to install' && canSee(p, ME())), p1 = vis[h % Math.max(1, vis.length)] || DB.pr.find(p => p.ph === 'D. Prepare to install'), p2 = vis.length > 1 ? vis[(h + 1) % vis.length] : null, sup = SUPS[h % SUPS.length];
    S.modal = {k:'or', fromPdf:f, sup, ct:'Materials', al:[{pr:p1.id, m:p1.ms[0].m, a:String(800 + h % 900)}, ...(p2 && p2.id !== p1.id ? [{pr:p2.id, m:p2.ms[0].m, a:String(500 + h % 600)}] : [])]}; renderLayer(); }, 900); });
{ const o = MODALS.or; MODALS.or = m => { const h = o(m); return m.fromPdf ? h.replace('<small class="tw-lab">', `<div class="pdf-ok">${ico('check', 14)}<span>Read from <b>${esc(m.fromPdf)}</b>. Check the supplier, properties and amounts before sending.</span></div><small class="tw-lab">`) : h; }; }
{ const f = VIEWS.del.pages.ord; VIEWS.del.pages.ord = (...x) => f(...x).replace(/(<button[^>]*data-act="orNew"[^>]*>[\s\S]*?<\/button>)/, `${nx('supList', '', 'Suppliers', 'sec')}${nx('supNew', '', 'Add a supplier', 'sec')}${nx('orPdf', '', 'Order from a PDF', 'sec')}$1`); }

/* ---------- 5. Meeting detail: aligned ---------- */
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const f = VIEWS[a].pages.mtg; if(!f) return; VIEWS[a].pages.mtg = (...x) => { const h = f(...x); return S.f.mtd ? `<div class="mtd">${h}</div>` : h; }; });

/* ---------- render: stamp changes first, then draw what this person may see ---------- */
render = visWrap(render); renderLayer = visWrap(renderLayer);
{ const r = render; render = (...x) => { dTrack(); return r(...x); }; }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/29wyadFF8i8dPozufMJ3B2'; } });
VERSIONS.push({v:'v3.30', date:TODAY, major:false, current:true, url:null, title:'Delivery: dates on every change, visibility, suppliers and fixes', sum:'Ready to install shows the date of every change and a timeline per property; Health and safety leaves Delivery; each person sees only their properties (a sample); suppliers and orders can be added by hand or from a PDF (simulated); meeting detail aligned; picking a property in Raise an order works.', steps:[
  {t:'Ready to install, with dates', min:1, dolor:'Before, you saw the status of each item but not when it changed.', show:['Each item shows the date of its last change; Ready shows since when.', 'Timeline opens each step with its date and who did it, and when the property was ready and closed.', 'Closed, moved to install lists the properties that already left phase D.'], say:'When things happened, not only where they are.', go:() => { S.role = 'inc'; S.trail = null; go('del', 'rdy'); }},
  {t:'Each person sees their properties', min:1, dolor:'Before, everyone saw every property.', show:['Viewing as Install coordinator: only Medway and Redbridge; a note says what you see.', 'Director: Settings, Who sees what, to tick the schemes per person and mark general admins.'], say:'Less noise for each person; the full picture for the Director.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'vis'); }},
  {t:'Suppliers and orders from a PDF', min:.5, dolor:'Before, suppliers were a fixed list and orders were typed in.', show:['Purchasing: Add a supplier, by hand or from a PDF.', 'Order from a PDF fills Raise an order for you to check.', 'In the demo the PDF reading is simulated.'], say:'Less typing, the same approval.', go:() => { S.role = 'inc'; S.trail = null; go('del', 'ord'); }},
]});

/* =================== v3.32: back to v3.30, with Suppliers as its own dashboard =================== */
/* v3.31 was set aside at REFYT's request (it stays archived). Purchasing keeps the orders; Suppliers is a separate view. */
{ const f = VIEWS.del.pages.ord; VIEWS.del.pages.ord = (...x) => f(...x).replace(/<button[^>]*data-act="(supList|supNew)"[^>]*>[\s\S]*?<\/button>/g, ''); }
const supRows = () => { const vis = o => o.al.some(a => DB.pr.some(p => p.id === a.pr)), names = [...new Set([...SUPS, ...DB.or.map(o => o.sup)])];
  return names.map(n => { const os = DB.or.filter(o => o.sup === n && o.st !== 'Rejected' && vis(o)), x = DB.supx[n] || {}, last = os.slice().sort((a, b) => a.on < b.on ? 1 : -1)[0];
    return {n, x, os, spend:sum(os, o => o.amt), q:sum(os.filter(o => dDiff(o.on) >= -91), o => o.amt), open:os.filter(o => !['Invoiced', 'Rejected'].includes(o.st)).length, match:os.filter(o => o.st === 'Delivered' && !o.inv).length, last, ct:x.ct || (os[0] ? os[0].ct : '')}; }).sort((a, b) => b.spend - a.spend); };
A.supOpen = el => { S.modal = {k:'supd', n:el.dataset.v}; renderLayer(); };
A.supOrder = el => { const n = el.dataset.v; A.orNew({dataset:{v:''}}); S.modal.sup = n; renderLayer(); };
MODALS.supd = m => { const r = supRows().find(x => x.n === m.n) || {n:m.n, x:{}, os:[], spend:0, open:0}, x = r.x;
  return modal(m.n, `${x.ct || r.ct || 'Supplier'}${x.terms ? `, ${x.terms} days to pay` : ''}${x.on ? `. Added ${fmtDy(x.on)} ${x.from ? 'from a PDF' : 'by hand'}` : ''}.`,
    `<div class="apv-g">${[['Email', x.email || '-'], ['Phone', x.phone || '-'], ['Spend', fm(r.spend)], ['Open orders', r.open]].map(([l, v]) => `<div><small>${l}</small><b>${esc(String(v))}</b></div>`).join('')}</div><div class="apv-h"><b>Orders</b></div>`
    + (r.os.slice().sort((a, b) => a.on < b.on ? 1 : -1).map(o => rdiv(cell(o.id, fmtDy(o.on)) + cell(o.al.length > 1 ? `Split across ${o.al.length} properties` : esc(prOf(o.al[0].pr).ad), `${o.ct}`, 2.2) + cell(fm(o.amt), '') + cell(pill(o.st === 'Invoiced' ? 'tg' : o.st === 'Requested' ? 'ta' : 'tb', o.st), ''))).join('') || empty('No orders with this supplier yet.')),
    `<div class="mfoot"><span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button><button class="btn pri lg" data-act="supOrder" data-v="${esc(m.n)}">Raise an order</button></div>`, 760); };
VIEWS.del.pages.sup = () => { const rs = supRows(), q = norm(S.f.supq), xs = rs.filter(r => (!S.f.supct || r.ct === S.f.supct) && (!q || norm(r.n + ' ' + r.ct + ' ' + (r.x.email || '')).includes(q))), mx = Math.max(1, ...rs.map(r => r.q));
  return trBar() + oph('Suppliers', 'Every supplier in one place: what we spend, open orders and invoices to match. Add new ones by hand or from a PDF. Orders themselves are in Purchasing.', nx('supNew', '', 'Add a supplier'))
    + visNote()
    + `<div class="cstats ov-k m59-k">${stat('tk', 'Suppliers', rs.length, `${rs.filter(r => r.x.on).length} added in the app`)}${stat('tk', 'Spend, last 3 months', fk(sum(rs, r => r.q)), 'orders not rejected')}${stat(sum(rs, r => r.open) ? 'ta' : 'tk', 'Open orders', sum(rs, r => r.open), 'requested, ordered or delivered', 'gogo', 'del:ord')}${stat(sum(rs, r => r.match) ? 'ta' : 'tk', 'Invoices to match', sum(rs, r => r.match), 'delivered, no supplier invoice yet')}</div>`
    + `<div class="m59-g s67-g"><section class="rsec q54-c m59-c1"><div class="q54-ch"><h3>${ico('chart', 17)}Spend by supplier, last 3 months</h3></div><div class="q54-leg"><span><i style="background:#6366F1"></i>Materials</span><span><i style="background:#F97316"></i>Subcontract labour</span><span><i style="background:#06B6D4"></i>Scaffold and plant</span></div>${supChart67(rs)}</section><section class="rsec q54-c m59-c3"><div class="q54-ch"><h3>${ico('spark', 17)}Needs a look</h3></div><div class="m59-ins">${supLook67(rs)}</div></section></div>`
    + `${supBar57(rs, xs)}`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t s66-t"><thead><tr><th>Supplier</th><th>Main cost type</th><th>Contact</th><th>Orders</th><th>Open</th><th>Spend</th><th>Last order</th><th><span class="sr">Raise an order</span></th></tr></thead><tbody>${xs.map(r => `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="supOpen" data-v="${esc(r.n)}">${esc(r.n)}</button><small>${r.match ? `${r.match} to match` : r.open ? 'Orders open' : 'Nothing open'}</small></td><td>${r.ct ? `<span class="rd55-sc" style="${/labour/i.test(r.ct) ? 'background:#FFEDD5;color:#9A3412' : /plant|hire|scaffold/i.test(r.ct) ? 'background:#CFFAFE;color:#155E75' : 'background:#E0E7FF;color:#3730A3'}">${esc(r.ct)}</span>` : '<span class="rd55-dash">–</span>'}</td><td class="s66-c">${r.x.email ? `${esc(r.x.email)}<small>${esc(r.x.phone || '')}</small>` : '<span class="rd55-dash">–</span>'}</td><td class="m59-n">${r.os.length}</td><td>${r.open ? `<span class="rd55-p bk">${ico('clock', 13, 2.2)}${r.open} open</span>` : '<span class="rd55-p ok">' + CHK55 + 'None</span>'}</td><td class="m59-n">${fm(r.spend)}<small>${r.q ? `${fk(r.q)} last 3 months` : 'none last 3 months'}</small></td><td class="m59-n">${r.last ? fmtDy(r.last.on) : '–'}</td><td><button type="button" class="rd56-tlb" data-act="supOrder" data-v="${esc(r.n)}">${ico('plus', 14, 2.2)}Raise an order</button></td></tr>`).join('') || `<tr><td colspan="8">${empty('No supplier matches the search.')}</td></tr>`}</tbody></table></div></section>`; };
{ const o = VIEWS.del.side; VIEWS.del.side = () => o().replace(/(<button class="nav" data-act="pg_del" data-v="ord"[\s\S]*?<\/button>)/, `$1${sbItem(S.page.del, pageAct('del'))(['sup', 'Suppliers', 'user', 0])}`); }

VERSIONS.forEach(v => { if(v.current){ v.current = false; v.url = 'https://claude.ai/artifact/CSpJeZaq8E9pU8wnHv4REU'; } });
VERSIONS.push({v:'v3.31', date:TODAY, major:false, current:false, url:'https://claude.ai/artifact/M4vbigL7E3RNzy9Ei7Lg7g', title:'Bookings, resources, catalogue and the resident liaison officer (set aside)', sum:'Set aside at REFYT’s request; v3.32 goes back to v3.30. Kept archived for reference.', steps:[]});
VERSIONS.push({v:'v3.32', date:TODAY, major:false, current:true, url:null, title:'Back to v3.30, with Suppliers as its own dashboard', sum:'The app goes back to v3.30. Purchasing keeps the orders; Suppliers is a separate dashboard with spend, open orders, invoices to match and every supplier, added by hand or from a PDF.', steps:[
  {t:'Suppliers, its own dashboard', min:.5, dolor:'Before, suppliers were a button inside Purchasing.', show:['Delivery, Suppliers: spend last 3 months, open orders and invoices to match.', 'Spend by supplier and what needs a look; click a supplier for its orders.', 'Add a supplier by hand or from a PDF; Raise an order from any supplier.'], say:'One place for the people we buy from.', go:() => { S.role = 'inc'; S.trail = null; go('del', 'sup'); }},
  {t:'Purchasing, only orders', min:.5, dolor:'Before, Purchasing mixed orders and suppliers.', show:['Purchasing lists the orders; Raise an order and Order from a PDF stay there.'], say:'Each view does one job.', go:() => { S.role = 'inc'; S.trail = null; go('del', 'ord'); }},
]});

/* =================== v4.0: one workspace, properties at the centre, permissions by role, team and person =================== */
/* The five team apps stop being separate menus: there is one menu for everyone, and each role sees only the items it may open.
   Every screen exists once. The property card is the same from everywhere; the role decides its tabs and whether money shows. */
const RET4 = ['sad', 'ass', 'aap', 'dsg', 'dap'], DEL4 = ['inc', 'oap', 'pap', 'sit', 'hse'], MON4 = ['dir', 'com', 'acc'];
const homeApp = (r = S.role) => r === 'dir' ? 'dir' : r === 'com' ? 'com' : r === 'acc' ? 'acc' : RET4.includes(r) ? 'ret' : 'del';
const isAdmin = () => S.role === 'dir';
const WAIT4 = {dir:'dir', com:'com', aap:'ret', dap:'ret', oap:'del', pap:'del'};
DB.perm = DB.perm || {};
DB.uac = DB.uac || {};
DB.req = DB.req || [{id:'RQ-1', by:'akr', role:'sit', pr:'PR-2002', sc:null, why:'I am covering the Pier Road install next week.', on:addDays(TODAY, -1), st:'Pending'}];
DB.teams = DB.teams || [
  {id:'TM-1', n:'Retrofit services', lead:'ram', mem:['sar', 'afa', 'xen', 'ahm'], sc:[], pr:[]},
  {id:'TM-2', n:'Delivery', lead:'dre', mem:['akr', 'hse'], sc:[], pr:[]},
  {id:'TM-3', n:'Commercial and accounts', lead:'lan', mem:['tom'], sc:[], pr:[]},
];
window.__cs2 = (p, k) => (visOf(k).pr || []).includes(p.id) || DB.teams.some(t => (t.lead === k || t.mem.includes(k)) && (t.sc.includes(p.sc) || t.pr.includes(p.id)));
window.__canMoney = () => { const u = DB.uac[ME()]; return u && u.money != null ? u.money : MON4.includes(S.role); };
const ALL4 = 'all';
const NAV4 = [
  ['', [
    {k:'home', n:'Home', ic:'inbox', to:() => homeApp() + ':ovw', r:ALL4},
    {k:'tasks', n:'My tasks', ic:'check', to:() => homeApp() + ':tasks', r:ALL4, c:() => DB.tk.filter(t => !t.done && t.r === S.role).length},
    {k:'wait', n:'Approvals', ic:'stamp', to:() => (WAIT4[S.role] || 'dir') + ':wait', r:['dir', 'com', 'aap', 'dap', 'oap', 'pap'], c:() => nWait(WAIT4[S.role] || 'dir'), soft:2},
    {k:'atn', n:'Needs attention', ic:'alert', to:() => S.role === 'dir' ? 'dir:dec' : homeApp() + ':atn', r:ALL4, c:() => pend(homeApp()).length, soft:2},
  ]],
  ['Properties', [
    {k:'prs', n:'All properties', ic:'home', to:() => 'dir:prs', r:ALL4, c:() => DB.pr.filter(p => OPENP.includes(p.ph) && (seesAll(ME()) || canSee(p, ME()))).length},
    {k:'sch', n:'Schemes', ic:'layers', to:() => 'dir:sch', r:['dir', 'com', 'acc']},
    {k:'rq', n:'In assessment', ic:'clip', to:() => 'ret:rq', r:[...RET4, 'dir']},
    {k:'pk', n:'With the client', ic:'send', to:() => 'ret:pk', r:[...RET4, 'dir', 'com']},
    {k:'rdy', n:'Ready to install', ic:'flag', to:() => 'del:rdy', r:[...DEL4, 'dir']},
    {k:'hold', n:'Redbridge tracker', ic:'gauge', to:() => 'del:hold', r:[...DEL4, 'dir']},
    {k:'clo', n:'Close out', ic:'award', to:() => 'del:clo', r:[...DEL4, 'dir', 'acc']},
    {k:'cs', n:'Client systems', ic:'globe', to:() => 'del:cs', r:[...DEL4, 'dir', 'sad']},
  ]],
  ['Calendar', [
    {k:'bk', n:'Assessment bookings', ic:'cal', to:() => 'ret:bk', r:[...RET4, 'dir']},
    {k:'mtg', n:'Meetings', ic:'users', to:() => homeApp() + ':mtg', r:ALL4},
  ]],
  ['Purchasing', [
    {k:'ord', n:'Orders', ic:'cart', to:() => 'del:ord', r:[...DEL4, ...MON4]},
    {k:'sup', n:'Suppliers', ic:'factory', to:() => 'del:sup', r:[...DEL4, ...MON4]},
    {k:'mat', n:'Invoice matching', ic:'receipt', to:() => 'acc:sup', r:['dir', 'acc']},
    {k:'sub', n:'Subcontractor payments', ic:'wallet', to:() => 'acc:sub', r:['dir', 'acc', 'pap']},
  ]],
  ['Money', [
    {k:'mrg', n:'Margins', ic:'chart', to:() => 'com:mrg', r:MON4},
    {k:'quo', n:'Quotes and budgets', ic:'calc', to:() => 'com:quo', r:['dir', 'com']},
    {k:'var', n:'Variations and costs', ic:'swap', to:() => 'com:var', r:['dir', 'com']},
    {k:'trg', n:'Payment triggers', ic:'target', to:() => 'acc:trg', r:['dir', 'acc']},
    {k:'inv', n:'Invoices', ic:'money', to:() => 'acc:inv', r:['dir', 'acc']},
    {k:'rate', n:'Rates', ic:'tag', to:() => 'com:rate', r:['dir', 'com']},
  ]],
  ['Reports', [
    {k:'myt', n:'My team', ic:'users', to:() => 'dir:myt', r:ALL4, only:() => DB.teams.some(t => t.lead === ME())},
    {k:'dbiz', n:'Business overview', ic:'chart', to:() => 'dir:dbiz', r:['dir']},
    {k:'dperf', n:'Scheme performance', ic:'up', to:() => 'dir:dperf', r:['dir', 'com']},
    {k:'dfin', n:'Finance', ic:'money', to:() => 'dir:dfin', r:['dir', 'com', 'acc']},
    {k:'dops', n:'Operations', ic:'route', to:() => 'dir:dops', r:['dir', 'inc']},
    {k:'dcap', n:'Capacity and staffing', ic:'cal', to:() => 'dir:dcap', r:['dir']},
    {k:'dqual', n:'Quality and compliance', ic:'shield', to:() => 'dir:dqual', r:['dir', 'hse']},
    {k:'dsup', n:'Suppliers and subcontractors', ic:'factory', to:() => 'dir:dsup', r:['dir', 'com']},
  ]],
  ['On site', [
    {k:'site', n:'Site forms', ic:'tool', to:() => 'del:site', r:[...DEL4, 'dir']},
    {k:'asf', n:'Assessor form', ic:'camera', to:() => 'ret:asf', r:[...RET4, 'dir']},
  ]],
  ['Administration', [
    {k:'usr', n:'Users and access', ic:'user', to:() => 'dir:usr', r:['dir'], fixed:true},
    {k:'tms', n:'Teams', ic:'users', to:() => 'dir:tms', r:['dir'], fixed:true},
    {k:'req', n:'Access requests', ic:'lock', to:() => 'dir:req', r:['dir'], fixed:true, c:() => DB.req.filter(q => q.st === 'Pending').length, soft:2},
    {k:'prm', n:'Roles and permissions', ic:'shield', to:() => 'dir:prm', r:['dir'], fixed:true},
    {k:'vis', n:'Access by scheme', ic:'layers', to:() => 'dir:vis', r:['dir'], fixed:true},
    {k:'nsc', n:'Schemes and templates', ic:'folder', to:() => 'dir:nsc', r:['dir'], fixed:true},
    {k:'sset', n:'Scheme settings', ic:'edit', to:() => 'com:sset', r:['dir'], fixed:true},
    {k:'cls', n:'Clients', ic:'globe', to:() => 'dir:cls', r:['dir'], fixed:true},
    {k:'int', n:'Integrations', ic:'split', to:() => 'dir:int', r:['dir'], fixed:true},
    {k:'dmap', n:'Data map', ic:'db', to:() => 'db:', r:['dir'], fixed:true},
  ]],
];
const FOOT4 = [{k:'aut', n:'Automations', ic:'play', to:() => 'dir:aut', r:ALL4}, {k:'help', n:'How it works', ic:'search', to:() => homeApp() + ':help', r:ALL4}];
const ITEMS4 = [...NAV4.flatMap(([s, xs]) => xs.map(x => ({...x, sec:s || 'Home'}))), ...FOOT4.map(x => ({...x, sec:'Help'}))];
const defOn = (it, r) => it.r === ALL4 || it.r.includes(r);
const canNav = (it, r = S.role) => { if(it.only && !it.only()) return false; if(it.fixed) return r === 'dir'; const o = (DB.perm[it.k] || {})[r]; return o != null ? o : defOn(it, r); };
const curKey = () => S.view === 'db' ? 'db:' : S.view + ':' + (S.page[S.view] || '');
const curItem = () => ITEMS4.find(it => canNav(it) && it.to() === curKey());
S.uniMin = false;
function uniSide(){ const cur = curKey(), it = (x, soft) => { const to = x.to(), c = x.c ? x.c() : 0;
    return `<button class="nav" data-act="uni" data-v="${to}" aria-current="${cur === to}" title="${esc(x.n)}"><span class="ni">${ico(x.ic, 17)}</span><span class="nl">${x.n}</span>${c ? `<span class="cnt${(x.soft || soft) === 2 ? ' amb' : ' soft'}">${c}</span>` : ''}</button>`; };
  let h = `<aside class="sb"><button class="sb-tg" data-act="sbMin" title="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-label="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-expanded="${!S.uniMin}">${ico('chev', 16)}<span class="nl">Collapse</span></button>`;
  NAV4.forEach(([sec, xs]) => { const vis = xs.filter(x => canNav(x)); if(!vis.length) return; if(sec) h += `<div class="sb-sec">${sec}</div>`; h += vis.map(x => it(x)).join(''); });
  return h + `<div class="sb-line"></div>` + FOOT4.filter(x => canNav(x)).map(x => it(x)).join('') + `</aside>`; }
['dir', 'com', 'acc', 'ret', 'del', 'tsk'].forEach(a => { if(VIEWS[a]) VIEWS[a].side = uniSide; });
A.uni = el => { const [a, pg] = el.dataset.v.split(':'); S.trail = null; S.back4 = null; S.pop = null; S.modal = null;
  if(a === 'db'){ S.view = 'db'; render(true); return; } S.fi[a] = null; go(a, pg); };
A.sbMin = () => { S.uniMin = !S.uniMin; render(); };

/* Everyone lands on Home; switching "Viewing as" lands on that role's Home */
{ const os = A.setRole; A.setRole = el => { os(el); S.trail = null; S.back4 = null; const a = homeApp(); S.view = a; S.page[a] = 'ovw'; S.fi[a] = null; render(true); toast(`Viewing as ${RN(S.role)}, ${RP(S.role)}: the menu shows what this role can open.`); }; }

/* A property opens in the context of the person's own work, so their tabs can be edited; Back returns to the list they came from */
window.__ab4 = null;
window.__eapp = app => isAdmin() ? app : homeApp();
{ const ob = A.fichaback; A.fichaback = el => { const b = S.back4; if(ob) ob(el); else { S.fi[S.view] = null; render(); } if(b && b.app !== S.view){ S.back4 = null; S.fi[S.view] = null; S.view = b.app; S.page[b.app] = b.page; S.fi[b.app] = null; render(); } }; }

/* The same tabs everywhere; the role decides which ones */
const TABS4 = [['res', 'Summary'], ['rsd', 'Resident'], ['mea', 'Measures'], ['ret', 'Assess and design'], ['ins', 'Prepare and install'], ['mon', 'Orders'], ['inv', 'Invoices'], ['clo', 'Close out'], ['chk', 'Checklists'], ['upd', 'Updates'], ['his', 'History']];
const TABR4 = {ret:[...RET4, 'dir', 'com'], ins:[...DEL4, 'dir'], mon:[...DEL4, ...MON4], inv:['dir', 'acc'], clo:[...DEL4, 'dir', 'acc'], chk:[...RET4, ...DEL4, 'dir']};
const roleTabs = () => TABS4.filter(([k]) => !TABR4[k] || TABR4[k].includes(S.role)).map(([k, n]) => k === 'mon' ? ['mon', window.__canMoney() ? 'Money and orders' : 'Orders'] : [k, n]);
Object.keys(ATABS).forEach(a => Object.defineProperty(ATABS, a, {get:roleTabs, configurable:true, enumerable:true}));

/* The resident: contact, consent and every call and note, in one place */
const rsdOf = p => { if(!p.rs){ const n = PH.indexOf(p.ph), dig = String(7700900000 + parseInt(p.id.slice(3), 10) * 137).slice(0, 10), first = String(p.res || 'Resident').split(' ')[0].toLowerCase();
    p.rs = {ph:'0' + dig.slice(0, 4) + ' ' + dig.slice(4), em:`${first}.${String(p.res || '').split(' ').slice(-1)[0].toLowerCase()}@example.co.uk`, pref:n % 2 ? 'Phone' : 'Text message', cons:n >= 1 ? p.phOn : null,
      log:[{on:addDays(p.phOn, -3), k:'Call', t:'Introduced REFYT and the scheme; resident happy to proceed.', by:'sar'}].concat(n >= 2 ? [{on:addDays(p.phOn, -1), k:'Note', t:'Prefers mornings. Dog in the garden, call before arriving.', by:'sar'}] : [])}; }
  return p.rs; };
function rsdTab(app, p){ const r = rsdOf(p);
  return kv([['Resident', esc(p.res)], ['Phone', r.ph], ['Email', r.em], ['Preferred contact', r.pref], ['Consent', r.cons ? 'Recorded ' + fmtDy(r.cons) : 'Not recorded yet']])
    + `<div class="rf-bar v4-acts">${nx('rsdLog', p.id + '|Call', 'Log a call')}${nx('rsdLog', p.id + '|Note', 'Add a note', 'sec')}${nx('rsdLog', p.id + '|Email', 'Log an email', 'sec')}${later('Aircall')}${later('Customer messages')}</div>`
    + grpH('Contact history', r.log.length) + (r.log.length ? r.log.slice().reverse().map(x => rdiv(cell(esc(x.t), `${x.k} by ${esc((PEO[x.by] || {n:'Someone'}).n)}`, 3) + cell(fmtDy(x.on), ''))).join('') : empty('No contact recorded yet.')); }
A.rsdLog = el => { const [id, kind] = el.dataset.v.split('|'); S.modal = {k:'rsd4', id, kind, t:''}; renderLayer(); };
MODALS.rsd4 = m => modal(m.kind === 'Call' ? 'Log a call' : m.kind === 'Email' ? 'Log an email' : 'Add a note', `${esc(prOf(m.id).res)}, ${esc(prOf(m.id).ad)}. It is kept on the resident's contact history.`, area('What was said', 'rsd4t', 't', m.t, 'For example: confirmed the survey date, asked about parking.', true), mfoot('Save', 'rsdOk', !!m.t.trim()));
IN.rsd4t = t => { S.modal.t = t.value; const b = $('#mok'); if(b) b.disabled = !t.value.trim(); };
A.rsdOk = () => { const m = S.modal, p = prOf(m.id), r = rsdOf(p); r.log.push({on:TODAY, k:m.kind, t:m.t.trim(), by:ME()}); his(p, `${m.kind} with the resident logged`); S.modal = null; render(); toast(`${m.kind} saved on the resident's history.`); };

/* Who a property is shared with, and asking for access */
const viewers4 = p => Object.keys(PEO).filter(k => k === ROLES.dir[1] || visOf(k).all || canSee(p, k));
const shareBar4 = p => !isAdmin() ? '' : `<div class="v4-share">${ico('users', 16)}<span><b>Shared with ${viewers4(p).length} people</b><small>${viewers4(p).slice(0, 6).map(k => esc(PEO[k].n.split(' ')[0])).join(', ')}${viewers4(p).length > 6 ? ' and more' : ''}</small></span><button class="btn sec sm" data-act="shrOpen" data-v="${p.id}">Share</button></div>`;
const shareWhy = (p, k) => k === ROLES.dir[1] ? 'Director, sees everything' : visOf(k).all ? 'Sees every property' : (visOf(k).pr || []).includes(p.id) ? 'Shared directly' : (visOf(k).sc || []).includes(p.sc) ? `Through ${scOf(p.sc).n}` : DB.teams.some(t => (t.lead === k || t.mem.includes(k)) && (t.sc.includes(p.sc) || t.pr.includes(p.id))) ? 'Through their team' : p.b.who === k ? 'Assigned to assess it' : '';
A.shrOpen = el => { S.modal = {k:'shr4', id:el.dataset.v}; renderLayer(); };
MODALS.shr4 = m => { const p = prOf(m.id);
  return modal('Share this property', `${esc(p.ad)}, ${esc(scOf(p.sc).n)}. What each person sees inside it still depends on their role.`, grpH('Teams', DB.teams.length) + DB.teams.map(t => { const on = t.pr.includes(p.id) || t.sc.includes(p.sc);
      return `<div class="v4-sr"><span>${ico('users', 15)}<b>${esc(t.n)}</b><small>${t.mem.length + 1} people, led by ${esc(PEO[t.lead].n)}</small></span>${t.sc.includes(p.sc) ? pill('tk', 'Through the scheme') : `<button class="btn ${on ? 'pri' : 'sec'} sm" data-act="shrTeam" data-v="${t.id}|${p.id}">${on ? 'Shared' : 'Share'}</button>`}</div>`; }).join('')
    + grpH('People', Object.keys(PEO).length) + Object.keys(PEO).map(k => { const why = shareWhy(p, k), direct = (visOf(k).pr || []).includes(p.id), locked = why && !direct;
      return `<div class="v4-sr"><span>${av(k, 26)}<b>${esc(PEO[k].n)}</b><small>${esc(PEO[k].r)}${why ? ', ' + why.toLowerCase() : ''}</small></span>${locked ? pill('tg', 'Can see it') : `<button class="btn ${direct ? 'pri' : 'sec'} sm" data-act="shrPer" data-v="${k}|${p.id}">${direct ? 'Shared' : 'Share'}</button>`}</div>`; }).join(''),
    `<span class="note"></span><button class="btn pri lg" data-act="mclose">Done</button>`, 620); };
A.shrPer = el => { const [k, id] = el.dataset.v.split('|'), v = visOf(k), p = prOf(id); v.pr = v.pr || []; const on = v.pr.includes(id); v.pr = on ? v.pr.filter(x => x !== id) : [...v.pr, id]; his(p, `${on ? 'Stopped sharing with' : 'Shared with'} ${PEO[k].n}`); renderLayer(); render(); };
A.shrTeam = el => { const [t, id] = el.dataset.v.split('|'), tm = DB.teams.find(x => x.id === t), p = prOf(id), on = tm.pr.includes(id); tm.pr = on ? tm.pr.filter(x => x !== id) : [...tm.pr, id]; his(p, `${on ? 'Stopped sharing with' : 'Shared with'} the ${tm.n} team`); renderLayer(); render(); };
const reqOf = id => DB.req.find(q => q.pr === id && q.by === ME() && q.st === 'Pending');
function lockPage4(p){ const q = reqOf(p.id);
  return crumb('fichaback', 'Back', esc(p.ad)) + `<div class="v4-lock">${ico('lock', 28)}<h2>${esc(p.ad)} is not shared with you</h2><p>${esc(scOf(p.sc).n)}. Ask the administrator for access: they choose whether you get this property or the whole scheme.</p>${q ? pill('ta', 'Request sent ' + fmtDy(q.on)) : `<button class="btn pri" data-act="reqOpen" data-v="${p.id}">Request access</button>`}</div>`; }
A.reqOpen = el => { S.modal = {k:'req4', id:el.dataset.v, scope:'pr', t:''}; renderLayer(); };
MODALS.req4 = m => { const p = prOf(m.id);
  return modal('Request access', `${esc(p.ad)}, ${esc(scOf(p.sc).n)}. The request goes to the administrator.`, mlab('What you need', true) + mseg('scope', m.scope, [['pr', 'This property'], ['sc', 'The whole scheme']]) + area('Why', 'req4t', 't', m.t, 'For example: I am covering this install next week.'), mfoot('Send request', 'reqOk', true)); };
IN.req4t = t => { S.modal.t = t.value; };
A.reqOk = () => { const m = S.modal, p = prOf(m.id); DB.req.push({id:'RQ-' + (DB.req.length + 1), by:ME(), role:S.role, pr:p.id, sc:m.scope === 'sc' ? p.sc : null, why:m.t.trim(), on:TODAY, st:'Pending'}); S.modal = null; render(); toast('Request sent to the administrator. You will see the property once it is approved.'); };
{ const pf = prFicha; prFicha = (app, p) => !isAdmin() && !seesAll(ME()) && !canSee(p, ME()) ? lockPage4(p) : pf(app, p); }

/* All properties: only the ones shared with you, plus the rest of your schemes to ask for */
{ const f = VIEWS.dir.pages.prs; VIEWS.dir.pages.prs = (...x) => { if(isAdmin() || seesAll(ME())) return f(...x);
    const all = window.__prAll || DB.pr, mine = DB.pr.filter(p => canSee(p, ME())), rest = all.filter(p => OPENP.includes(p.ph) && !canSee(p, ME()));
    const h0 = DB.pr; DB.pr = mine; let h; try { h = f(...x); } finally { DB.pr = h0; }
    const note = `<div class="vis-n">${ico('eye', 15)}<span>You see <b>${mine.length} of ${all.length}</b> properties: the ones shared with you, your team or your schemes. The administrator decides who sees what.</span></div>`;
    const i = h.indexOf('</div></div>', h.indexOf('<div class="op-h">')); h = i > 0 ? h.slice(0, i + 12) + note + h.slice(i + 12) : note + h;
    return h + grpH('Not shared with you', rest.length) + (rest.length ? rest.slice(0, 8).map(p => { const q = reqOf(p.id);
      return rdiv(cell(`${ico('lock', 13)} ${esc(p.ad)}`, `${esc(scOf(p.sc).n)}, ${p.ph}`, 3) + btns(q ? pill('ta', 'Requested') : nx('reqOpen', p.id, 'Request access', 'sec'))); }).join('') + (rest.length > 8 ? hint(`And ${rest.length - 8} more. Use Request access on any of them.`) : '') : empty('Nothing else open.')); }; }

/* Administration: users and access */
const rolesOf = k => Object.keys(ROLES).filter(r => ROLES[r][1] === k);
const teamsOf = k => DB.teams.filter(t => t.lead === k || t.mem.includes(k));
const scopeOf = k => k === ROLES.dir[1] || visOf(k).all ? 'all' : visOf(k).own ? 'own' : 'sc';
VIEWS.dir.pages.usr = () => oph('Users and access', 'Each person has a role, which decides what they can open and do; a property scope, which decides which properties they see; and whether they see money. Use View as to check it.')
  + `<div class="cstats">${stat('tk', 'People', Object.keys(PEO).length)}${stat('tk', 'See every property', Object.keys(PEO).filter(k => scopeOf(k) === 'all').length)}${stat('tk', 'Teams', DB.teams.length)}${stat(DB.req.some(q => q.st === 'Pending') ? 'ta' : 'tg', 'Access requests', DB.req.filter(q => q.st === 'Pending').length, 'waiting', 'uni', 'dir:req')}</div>`
  + `<div class="el-wide"><div class="rf-mx v4-ut"><table><thead><tr><th>Person</th><th>Role</th><th>Team</th><th>Properties they see</th><th>Money</th><th class="r">Sees</th><th></th></tr></thead><tbody>${Object.keys(PEO).map(k => { const dir = k === ROLES.dir[1], sc = scopeOf(k), rs = rolesOf(k), u = DB.uac[k] || {}, money = u.money != null ? u.money : rs.some(r => MON4.includes(r)), n = dir || sc === 'all' ? DB.pr.length : DB.pr.filter(p => canSee(p, k)).length;
    return `<tr><td>${person(k)}</td><td>${rs.length ? rs.map(r => esc(RN(r))).join(', ') : '<span class="mini">No role yet</span>'}</td><td>${teamsOf(k).map(t => esc(t.n) + (t.lead === k ? ' <small class="mini">(leader)</small>' : '')).join(', ') || '-'}</td>`
      + `<td>${dir ? pill('tb', 'Administrator, every property') : `<div class="seg2 um-seg">${[['all', 'Every property'], ['sc', 'Their schemes'], ['own', 'Only assigned']].map(([v, l]) => `<button data-act="usrSc" data-v="${k}|${v}" aria-pressed="${sc === v}">${l}</button>`).join('')}</div>`}</td>`
      + `<td>${dir ? pill('tg', 'Yes') : `<button class="vis-b${money ? ' on' : ''}" data-act="usrMon" data-v="${k}" aria-pressed="${money}">${money ? ico('check', 13) + ' Sees money' : 'No'}</button>`}</td><td class="r"><b>${n}</b> <small class="mini">of ${DB.pr.length}</small></td><td>${rs.length && !dir ? `<button class="btn sec sm" data-act="visAs" data-v="${k}">View as</button>` : ''}</td></tr>`; }).join('')}</tbody></table></div></div>`
  + hint('Their schemes: the schemes ticked for them in Access by scheme, plus their team’s schemes and anything shared with them directly. Only assigned: the jobs they are assigned to and anything shared with them.');
A.usrSc = el => { const [k, v] = el.dataset.v.split('|'), x = visOf(k); x.all = v === 'all'; x.own = v === 'own'; render(); toast(`${PEO[k].n} now sees ${v === 'all' ? 'every property' : v === 'own' ? 'only the jobs assigned or shared' : 'the properties of their schemes'}.`); };
A.usrMon = el => { const k = el.dataset.v, rs = rolesOf(k), u = DB.uac[k] || (DB.uac[k] = {}), cur = u.money != null ? u.money : rs.some(r => MON4.includes(r)); u.money = !cur; render(); toast(`${PEO[k].n} ${u.money ? 'now sees' : 'no longer sees'} quotes, costs and margins.`); };

/* Administration: teams and their leaders */
const tkOfP = k => DB.tk.filter(t => !t.done && ROLES[t.r] && ROLES[t.r][1] === k);
const ownOfP = k => DB.pr.filter(p => OPENP.includes(p.ph) && ((ROLES[PHOWN[p.ph]] || [])[1] === k || p.b.who === k));
const teamReport = t => th(cell('Person', 'Role', 2.2) + cell('Open tasks', '') + cell('Overdue', '') + cell('Next steps on', 'properties') + cell('Sees', 'properties')) + [t.lead, ...t.mem].map(k => { const tk = tkOfP(k), od = tk.filter(x => dDiff(x.due) < 0).length;
  return rdiv(cell(esc(PEO[k].n), esc((PEO[k] || {}).r) + (k === t.lead ? ', leader' : ''), 2.2) + cell(tk.length, '') + cell(od ? pill('tred', od) : '0', '') + cell(ownOfP(k).length, '') + cell(scopeOf(k) === 'all' ? 'All' : DB.pr.filter(p => canSee(p, k)).length, '')); }).join('');
VIEWS.dir.pages.tms = () => oph('Teams', 'A team has a leader and members. The leader sees the team’s report; schemes shared with a team reach every member.', nx('tmNew', '', 'New team'))
  + DB.teams.map(t => `<section class="rsec v4-team"><div class="rs-h"><h3>${esc(t.n)}</h3><p>Led by ${esc(PEO[t.lead].n)}, ${t.mem.length} ${t.mem.length === 1 ? 'member' : 'members'}</p></div>`
    + `<div class="v4-row"><small class="tw-lab">Leader</small><div class="seg2 um-seg">${[t.lead, ...t.mem].map(k => `<button data-act="tmLead" data-v="${t.id}|${k}" aria-pressed="${t.lead === k}">${esc(PEO[k].n.split(' ')[0])}</button>`).join('')}</div></div>`
    + `<div class="v4-row"><small class="tw-lab">Members</small><div class="v4-chips">${t.mem.map(k => `<span class="v4-chip">${esc(PEO[k].n)}<button data-act="tmRm" data-v="${t.id}|${k}" aria-label="Remove ${esc(PEO[k].n)}">${ico('x', 12)}</button></span>`).join('')}${cbx('', 'tmadd' + t.id, Object.keys(PEO).filter(k => k !== t.lead && !t.mem.includes(k)).map(k => [k, PEO[k].n, PEO[k].r]), null, 'tmAdd', {ph:'Add a person'})}</div></div>`
    + `<div class="v4-row"><small class="tw-lab">Schemes shared with the team</small><div class="v4-chips">${DB.sc.map(s => `<button class="vis-b${t.sc.includes(s.id) ? ' on' : ''}" data-act="tmSc" data-v="${t.id}|${s.id}" aria-pressed="${t.sc.includes(s.id)}">${t.sc.includes(s.id) ? ico('check', 12) + ' ' : ''}${esc(s.n)}</button>`).join('')}</div></div>`
    + `<div class="v4-sub">Team report</div>` + teamReport(t) + `</section>`).join('');
A.tmLead = el => { const [id, k] = el.dataset.v.split('|'), t = DB.teams.find(x => x.id === id); if(t.lead === k) return; t.mem = [t.lead, ...t.mem.filter(x => x !== k)]; t.lead = k; render(); toast(`${PEO[k].n} now leads ${t.n} and sees its report.`); };
A.tmRm = el => { const [id, k] = el.dataset.v.split('|'), t = DB.teams.find(x => x.id === id); t.mem = t.mem.filter(x => x !== k); render(); };
A.tmSc = el => { const [id, sc] = el.dataset.v.split('|'), t = DB.teams.find(x => x.id === id); t.sc = t.sc.includes(sc) ? t.sc.filter(x => x !== sc) : [...t.sc, sc]; render(); };
IN.tmAdd = t => { const id = String(t.dataset.k).slice(5), tm = DB.teams.find(x => x.id === id), k = t.value; if(tm && PEO[k] && !tm.mem.includes(k) && tm.lead !== k){ tm.mem.push(k); toast(`${PEO[k].n} added to ${tm.n}.`); } };
A.tmNew = () => { S.modal = {k:'tm4', n:'', lead:''}; renderLayer(); };
MODALS.tm4 = m => modal('New team', 'Name the team and pick its leader. Add members and schemes after.', fld('Team name', 'tm4n', 'n', m.n, {req:true, ph:'For example: Redbridge site team'}) + mlab('Leader', true) + mseg('lead', m.lead, Object.keys(PEO).map(k => [k, PEO[k].n])), mfoot('Create team', 'tmOk', !!(m.n.trim() && m.lead)));
IN.tm4n = t => { S.modal.n = t.value; const b = $('#mok'); if(b) b.disabled = !(S.modal.n.trim() && S.modal.lead); };
A.tmOk = () => { const m = S.modal; DB.teams.push({id:'TM-' + (DB.teams.length + 1), n:m.n.trim(), lead:m.lead, mem:[], sc:[], pr:[]}); S.modal = null; render(); toast(`${m.n.trim()} created, led by ${PEO[m.lead].n}.`); };
VIEWS.dir.pages.myt = () => { const ts = DB.teams.filter(t => t.lead === ME());
  return oph('My team', 'What each person in your team has open, overdue and waiting on them. You see it because you lead the team.') + (ts.length ? ts.map(t => grpH(esc(t.n), t.mem.length + 1) + teamReport(t)).join('') : empty('You do not lead a team.')); };

/* Administration: access requests */
VIEWS.dir.pages.req = () => { const pe = DB.req.filter(q => q.st === 'Pending'), dn = DB.req.filter(q => q.st !== 'Pending');
  return oph('Access requests', 'When someone opens a property that is not shared with them, they can ask for it. Approve with the scope you want, or reject with a reason.')
    + (pe.length ? pe.map(q => { const p = prOf(q.pr);
      return `<div class="ds-exc c-ta"><div class="ds-exh">${pill('ta', 'Request')}<b>${esc(PEO[q.by].n)} asks for ${q.sc ? 'the whole ' + esc(scOf(q.sc).n) + ' scheme' : esc(p.ad)}</b><span>${esc(RN(q.role))}, ${fmtDy(q.on)}</span></div><p>${q.why ? '“' + esc(q.why) + '”' : 'No reason given.'} ${esc(p.ad)} is in ${esc(scOf(p.sc).n)}, ${p.ph}.</p><div class="ds-exb"><button class="btn pri sm" data-act="reqYes" data-v="${q.id}|pr">Give this property</button><button class="btn sec sm" data-act="reqYes" data-v="${q.id}|sc">Give the whole scheme</button><button class="btn sec sm" data-act="reqNo" data-v="${q.id}">Reject</button></div></div>`; }).join('') : empty('No requests waiting.'))
    + (dn.length ? grpH('Answered', dn.length) + dn.slice().reverse().map(q => rdiv(cell(`${esc(PEO[q.by].n)}, ${esc(prOf(q.pr).ad)}`, q.why ? esc(q.why) : '', 3) + cell(q.st === 'Rejected' ? pill('tred', 'Rejected') : pill('tg', q.st), fmtDy(q.on)))).join('') : ''); };
A.reqYes = el => { const [id, sc] = el.dataset.v.split('|'), q = DB.req.find(x => x.id === id), v = visOf(q.by), p = prOf(q.pr);
  if(sc === 'sc'){ v.sc = v.sc || []; if(!v.sc.includes(p.sc)) v.sc.push(p.sc); q.st = 'Approved, whole scheme'; } else { v.pr = v.pr || []; if(!v.pr.includes(p.id)) v.pr.push(p.id); q.st = 'Approved, this property'; }
  his(p, `Access given to ${PEO[q.by].n} (${sc === 'sc' ? 'whole scheme' : 'this property'})`); render(); toast(`${PEO[q.by].n} can now see ${sc === 'sc' ? 'every property in ' + scOf(p.sc).n : p.ad}.`); };
A.reqNo = el => { const q = DB.req.find(x => x.id === el.dataset.v); q.st = 'Rejected'; render(); toast(`Request rejected. ${PEO[q.by].n} is told.`); };

/* Administration: roles and permissions */
S.f.prmR = S.f.prmR || 'inc';
VIEWS.dir.pages.prm = () => { const r = S.f.prmR;
  return oph('Roles and permissions', 'What each role can open in the menu. Which properties a person sees is set in Users and access; inside a property, the role decides the tabs and whether money shows.')
    + `<div class="rf-bar"><div class="seg2 um-seg v4-wrap">${Object.keys(ROLES).filter(x => x !== 'dir').map(x => `<button data-act="prmR" data-v="${x}" aria-pressed="${r === x}">${esc(RN(x))}</button>`).join('')}</div></div>`
    + `<div class="v4-pm">${NAV4.map(([sec, xs]) => { const its = xs.filter(x => !x.only); if(!its.length) return '';
      return `<section class="rsec"><div class="rs-h"><h3>${sec || 'Home'}</h3></div>${its.map(x => { const on = canNav(x, r);
        return `<div class="v4-pr"><span>${ico(x.ic, 15)}<b>${x.n}</b></span>${x.fixed ? pill('tk', 'Administrator only') : `<button class="vis-b${on ? ' on' : ''}" data-act="prmSet" data-v="${x.k}|${r}|${on ? 0 : 1}" aria-pressed="${on}">${on ? ico('check', 12) + ' Can open' : 'Hidden'}</button>`}</div>`; }).join('')}</section>`; }).join('')}</div>`
    + `<section class="rsec"><div class="rs-h"><h3>Inside a property</h3><p>Tabs ${esc(RN(r))} sees</p></div><div class="v4-chips">${TABS4.map(([k, n]) => { const on = !TABR4[k] || TABR4[k].includes(r); return pill(on ? 'tg' : 'tk', (on ? '' : 'No ') + (k === 'mon' ? 'Orders' : n)); }).join('')}${pill(MON4.includes(r) ? 'tg' : 'tk', MON4.includes(r) ? 'Sees money' : 'No money')}</div></section>`; };
A.prmR = el => { S.f.prmR = el.dataset.v; render(); };
A.prmSet = el => { const [k, r, v] = el.dataset.v.split('|'); (DB.perm[k] = DB.perm[k] || {})[r] = v === '1'; render(); toast(`${RN(r)}: ${ITEMS4.find(x => x.k === k).n} ${v === '1' ? 'shows in the menu' : 'is hidden'}.`); };

/* Administration: integrations, and every automation in one list */
VIEWS.dir.pages.int = () => oph('Integrations', 'The services the system will connect to. Until each one is built, the work is recorded here by hand.')
  + [['Xero', 'Invoices to clients, supplier invoices and payments, matched to orders.'], ['Microsoft 365', 'Email and calendar for assessment visits and meetings.'], ['Fellow', 'Meeting notes and action points into My tasks.'], ['DocuSign', 'Customer and client sign off at handover.'], ['Aircall', 'Calls with residents logged on the property.'], ['Customer messages', 'Booking confirmations and reminders to residents.']].map(([n, d]) => rdiv(cell(n, d, 3) + `<div class="mbc" style="flex:0 0 auto"><b>${later(n)}</b><small></small></div>`)).join('');
VIEWS.dir.pages.aut = () => oph('Automations', 'What the system does by itself, so nobody has to. Every run is shown here and written on the property’s history.')
  + [['ret', 'Assessment and design'], ['del', 'Install and close out'], ['com', 'Quotes and margins'], ['acc', 'Invoices and payments'], ['dir', 'Schemes and approvals'], ['tsk', 'Tasks and meetings']].map(([a, n]) => grpH(n, AUTO[a].length) + AUTO[a].map(t => `<div class="rf-dl ok"><span class="rf-ck">${ico('play', 13, 2.4)}</span><div><b style="font-weight:600">${t}</b></div>${pill('tg', 'On')}</div>`).join('')).join('')
  + grpH('Ran in this session', DB.runs.length) + (DB.runs.length ? DB.runs.slice().reverse().map(r => rdiv(cell('The system ' + esc(r[2]), r[3] ? `${r[3]} ${prOf(r[3]).ad}` : '', 3) + cell(fmtDy(r[0]), ''))).join('') : empty('Nothing yet. Approve, book or complete something and it shows here.'));

/* Export any list: a spreadsheet (CSV) or a PDF of what is on screen */
const exportRows = () => { const op = document.querySelector(`#a-${S.view} .op`) || document.querySelector('#dbview .op'); if(!op) return {t:'Export', rows:[]};
  const t = (op.querySelector('.op-h h1') || {}).textContent || 'Export', clean = s => (s || '').replace(/\s+/g, ' ').trim(), rows = [];
  op.querySelectorAll('table').forEach(tb => tb.querySelectorAll('tr').forEach(tr => rows.push([...tr.children].map(c => clean(c.innerText)))));
  op.querySelectorAll('.mbr').forEach(r => { const cs = [...r.querySelectorAll(':scope > .mbc')].map(c => clean([c.querySelector('b'), c.querySelector('small')].filter(Boolean).map(x => clean(x.innerText)).filter(Boolean).join(', '))); if(cs.some(Boolean)) rows.push(cs.filter((x, i) => x || i < cs.length - 1)); });
  return {t:clean(t), rows}; };
A.expOpen = () => { const x = exportRows(); S.modal = {k:'exp4', t:x.t, n:x.rows.length}; renderLayer(); };
MODALS.exp4 = m => modal('Export', `${esc(m.t)}: ${m.n} rows, with the filters you have on screen.`, `<div class="v4-exp"><button class="btn sec lg" data-act="expGo" data-v="csv">${ico('receipt', 16)}Spreadsheet (CSV, opens in Excel)</button><button class="btn sec lg" data-act="expGo" data-v="pdf">${ico('folder', 16)}PDF</button></div>`, `<span class="note"></span><button class="btn sec lg" data-act="mclose">Close</button>`, 520);
const saveFile4 = async (filename, data) => { try { const cl = window.claude && await window.claude.use('downloads'); if(cl){ await cl.save({filename, data}); return true; } } catch(e){ if(e && e.code === 'declined') return false; }
  const b = data instanceof Blob ? data : new Blob([data]), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); return true; };
A.expGo = async el => { const k = el.dataset.v, x = exportRows(), base = x.t.replace(/[^A-Za-z0-9 ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'export', stamp = TODAY;
  if(!x.rows.length){ S.modal = null; renderLayer(); return toast('Nothing to export on this page.'); }
  if(k === 'csv'){ const csv = x.rows.map(r => r.map(c => /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c).join(',')).join('\n'); S.modal = null; renderLayer(); if(await saveFile4(`refyt-${base}-${stamp}.csv`, '\ufeff' + csv)) toast('Spreadsheet ready.'); return; }
  const J = await import('jspdf').then(m => m.jsPDF).catch(() => null); if(!J){ S.modal = null; renderLayer(); return toast('PDF is not available in this view. Use the spreadsheet.'); }
  const doc = new J({orientation:'landscape', unit:'pt', format:'a4'}), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(); let y = 48;
  doc.setFontSize(16); doc.text(`REFYT, ${x.t}`, 40, y); y += 18; doc.setFontSize(9); doc.setTextColor(110); doc.text(`Exported ${fmtDy(TODAY)} by ${(PEO[ME()] || {n:''}).n}`, 40, y); doc.setTextColor(20); y += 22;
  const cols = Math.max(...x.rows.map(r => r.length)), cw = (W - 80) / cols;
  x.rows.forEach((r, i) => { const cells = r.map(c => doc.splitTextToSize(String(c), cw - 8)), h = Math.max(...cells.map(c => c.length)) * 11 + 6; if(y + h > H - 36){ doc.addPage(); y = 40; }
    if(i === 0){ doc.setFillColor(235, 239, 247); doc.rect(40, y - 9, W - 80, h, 'F'); } cells.forEach((c, j) => doc.text(c, 44 + j * cw, y)); y += h; doc.setDrawColor(225); doc.line(40, y - 8, W - 40, y - 8); });
  S.modal = null; renderLayer(); if(await saveFile4(`refyt-${base}-${stamp}.pdf`, doc.output('blob'))) toast('PDF ready.'); };

/* Header: one workspace instead of an app switcher; notifications are the role's own */
const sec4 = () => { if(S.view !== 'db' && S.fi[S.view]) return 'Property'; const it = curItem(); return it ? (it.sec === 'Home' ? it.n : it.sec + ', ' + it.n) : S.fi[S.view] ? 'Property' : 'Workspace'; };
{ const dp = drawPop; drawPop = () => { dp(); const el = document.getElementById('rfpop'); if(!el || !S.pop) return; const top = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom + 6;
    if(S.pop === 'role') el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:16px"><small class="rf-ph">Viewing as. Administrator: Director</small>${Object.entries(ROLES).filter(([k]) => roleOk(k)).map(([k, [n]]) => `<button class="rf-pi${S.role === k ? ' on' : ''}" data-act="setRole" data-v="${k}"><b>${n}${k === 'dir' ? ', administrator' : ''}</b><small>${RP(k)}, ${ITEMS4.filter(x => canNav(x, k) && !['home', 'help', 'aut'].includes(x.k)).length} menu items</small></button>`).join('')}</div>`;
    if(S.pop === 'nt' && !isAdmin()){ const xs = pend(homeApp()).slice(0, 8); el.innerHTML = `<div class="rf-pop wide" style="top:${top}px;right:16px"><small class="rf-ph">Your items as ${RN(S.role)}</small>${xs.map(a => `<div class="rf-ni"><b>${esc(a.t)}</b><small>${esc(a.k)}</small></div>`).join('') || '<div class="rf-ni"><small>Nothing right now.</small></div>'}</div>`; } }; }
{ const r4 = render; render = (...x) => { r4(...x);
    const sw = $('#appsw'); if(sw){ const ex = sw.querySelector('.rf-appdd'), html = `<button class="rf-appdd v4-ws" data-act="uni" data-v="${homeApp()}:ovw" title="Home"><span class="rf-ai">${ico('home', 16)}</span><span class="rf-adn"><b>REFYT</b><small>${esc(sec4())}</small></span></button>`; if(ex) ex.outerHTML = html; else if(!sw.querySelector('.v4-ws')) sw.insertAdjacentHTML('beforeend', html); }
    const dot = document.querySelector('#tools [data-act="popNt"] .rf-dot'); if(dot && !isAdmin()){ const n = pend(homeApp()).length; if(n) dot.textContent = n > 9 ? '9+' : n; else dot.remove(); }
    const el = document.querySelector(`#a-${S.view}`); if(el) el.classList.toggle('sbmini', S.uniMin && window.innerWidth > 900);
    const oh = document.querySelector(`#a-${S.view} .op > .op-h, #a-${S.view} .op .op-h`), rows = document.querySelectorAll(`#a-${S.view} .op .mbr, #a-${S.view} .op table tr`).length;
    if(oh && rows > 2 && !oh.querySelector('[data-act="expOpen"]')){ let a = oh.querySelector('.eh-a'); if(!a){ oh.insertAdjacentHTML('beforeend', '<div class="eh-a"></div>'); a = oh.querySelector('.eh-a'); } a.insertAdjacentHTML('afterbegin', `<button class="btn sec" data-act="expOpen">${ico('down', 15)}Export</button>`); } }; }

/* Styles for the v4 pieces, on the theme variables */

/* Versions: v3.32 is archived; v4.0 is the reorganised workspace */
VERSIONS.forEach(v => { if(v.current){ v.current = false; v.major = true; v.url = 'https://claude.ai/artifact/7KYarFa4mes41LVAwrjzan'; } });
VERSIONS.push({v:'v4.0', date:TODAY, major:true, current:true, url:null, title:'One workspace, with the property at the centre', sum:'One menu for everyone instead of five apps, where every screen exists once. The property card is the same from everywhere, with the resident’s contact history. Users, teams, roles and access requests in Administration, and export to a spreadsheet or PDF from any list.', steps:[
  {t:'One menu, every screen once', min:1, dolor:'Before, five apps repeated My tasks, Meetings, Needs attention and Approvals, and the same properties showed in seven lists.', show:['Home, Properties, Calendar, Purchasing, Money, Reports, On site and Administration.', 'The lists that were in each app are now views of Properties.', 'Viewing as changes what the menu shows, not where things are.'], say:'You always know where to look.', go:() => { S.role = 'dir'; S.trail = null; S.page.dir = 'ovw'; S.fi.dir = null; go('dir', 'ovw'); }},
  {t:'The property at the centre', min:1, dolor:'Before, the same property looked different from each app, and there was nowhere to keep the conversations with the resident.', show:['Open any property: the same tabs from everywhere, chosen by the role.', 'Resident: contact, consent, and every call, email and note.', 'The administrator sees who the property is shared with and shares it.'], say:'One card per property, for everyone.', go:() => { S.role = 'dir'; abrir('dir', 'PR-2002', 'rsd'); }},
  {t:'Who sees what', min:1, dolor:'Before, access was a sample per app.', show:['Users and access: role, properties they see, and money, per person.', 'Teams: a leader and members; the leader gets the team report.', 'Roles and permissions: what each role can open in the menu.'], say:'The administrator decides, in one place.', go:() => { S.role = 'dir'; S.trail = null; go('dir', 'usr'); }},
  {t:'Asking for access', min:.5, dolor:'Before, a property you could not see simply was not there.', show:['As the Site manager, All properties lists what is not shared with you.', 'Request access sends it to the administrator, who gives the property or the whole scheme.'], say:'Nothing is hidden by accident.', go:() => { S.role = 'sit'; S.trail = null; S.view = 'del'; go('dir', 'prs'); }},
  {t:'Export any list', min:.5, dolor:'Dren asked to send filtered lists to clients.', show:['Every list has Export: a spreadsheet that opens in Excel, or a PDF, with the filters on screen.'], say:'Filter, export, send.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'rdy'); }},
]});
if(/debug/.test(location.hash)) window.__X = {S, A, DB, VIEWS, ROLES, PEO, ATABS, ITEMS4, canNav, go, abrir, render:() => render(), exportRows};


/* =================== v5: sections across the header, each with its own menu; Overview by role =================== */
/* The header holds what everyone shares (Overview, Properties, Meetings) and the team sections (Director, Commercial,
   Accounts, Retrofit, Delivery). The left menu shows only the selected section. A role sees the team sections it may open. */
const I4 = k => ITEMS4.find(x => x.k === k);
const mk = (k, n, ic, to, r, extra = {}) => ({k, n, ic, to, r, ...extra});
const SEC5 = [
  {k:'ovw', n:'Overview', ic:'inbox', tone:'#2F5BD3', sub:'What needs you today', groups:[['', [I4('home'), I4('tasks'), I4('atn'), I4('wait'), I4('mtg'), mk('tka', 'All tasks by team', 'check', () => 'tsk:all', ALL4), I4('myt')]]]},
  {k:'prp', n:'Properties', ic:'home', tone:'#0E7C74', sub:'The ones shared with you', groups:[['', [I4('prs'), I4('sch')]]]},
  {k:'dir', n:'Director', ic:'crown', tone:'#16306E', sub:'Reports and administration', team:true, groups:[['Reports', ['dbiz', 'dperf', 'dfin', 'dops', 'dcap', 'dqual', 'dsup'].map(I4)]]},
  {k:'com', n:'Commercial', ic:'calc', tone:'#B45309', sub:'Quotes, budgets and margins', team:true, groups:[['', ['mrg', 'quo', 'var', 'rate'].map(I4).concat([mk('sset', 'Scheme settings', 'edit', () => 'com:sset', ['dir', 'com'])])]]},
  {k:'acc', n:'Accounts', ic:'receipt', tone:'#15803D', sub:'Invoices and payments', team:true, groups:[['', ['trg', 'inv', 'mat', 'sub'].map(I4)]]},
  {k:'ret', n:'Retrofit', ic:'clip', tone:'#0369A1', sub:'Phases A and B', team:true, groups:[['Work', ['bk', 'rq', 'pk'].map(I4)], ['On site', [I4('asf')]]]},
  {k:'adm', n:'Settings', ic:'shield', tone:'#2F5BD3', sub:'Administration', hidden:true, groups:[['', ['usr', 'tms', 'req', 'prm', 'vis', 'nsc', 'cls', 'int'].map(I4)]]},
  {k:'del', n:'Delivery', ic:'home', tone:'#C2410C', sub:'Phases C to F', team:true, groups:[['Work', ['rdy', 'hold', 'clo', 'cs'].map(I4)], ['Purchasing', ['ord', 'sup'].map(I4)], ['On site', [I4('site')]]]},
];
/* the permissions page and the menu read the same list */
NAV4.length = 0; SEC5.forEach(s => s.groups.forEach(([g, xs]) => NAV4.push([s.n + (g ? ', ' + g : ''), xs])));
ITEMS4.length = 0; SEC5.forEach(s => { s.groups.forEach(([, xs]) => xs.forEach(x => ITEMS4.push({...x, sec:s.n}))); (s.foot || []).forEach(x => ITEMS4.push({...x, sec:s.n})); });
const secItems = s => s.groups.flatMap(([, xs]) => xs).filter(x => canNav(x));
const secOn = s => s.hidden ? isAdmin() : !s.team || (allowed(s.k) && secItems(s).length > 0);
S.sec5 = 'ovw';
const curK5 = () => S.view === 'db' ? 'db:' : S.view + ':' + (S.page[S.view] || '');
const syncSec = () => { const cur = curK5(), mine = SEC5.find(s => s.k === S.sec5);
  const has = s => [...s.groups.flatMap(([, xs]) => xs), ...(s.foot || [])].some(x => canNav(x) && x.to() === cur);
  if(mine && has(mine)) return; const f = SEC5.find(s => secOn(s) && has(s)); if(f) S.sec5 = f.k; };
function uniSide5(){ syncSec(); const s = SEC5.find(x => x.k === S.sec5) || SEC5[0], cur = curK5();
  const it = x => { const to = x.to(), c = x.c ? x.c() : 0;
    return `<button class="nav" data-act="uni5" data-v="${s.k}|${to}" aria-current="${cur === to && !S.fi[S.view]}" title="${esc(x.n)}"><span class="ni">${ico(x.ic, 17)}</span><span class="nl">${x.n}</span>${c ? `<span class="cnt${x.soft === 2 ? ' amb' : ' soft'}">${c}</span>` : ''}</button>`; };
  let h = `<aside class="sb v5-sb" style="--sec:${s.tone}"><button class="sb-tg" data-act="sbMin" title="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-label="${S.uniMin ? 'Open the menu' : 'Fold the menu'}" aria-expanded="${!S.uniMin}">${ico('chev', 16)}<span class="nl">Collapse</span></button>`
    + `<div class="sb-sec v5-top">${s.n}</div>`;
  s.groups.forEach(([g, xs]) => { const vis = xs.filter(x => canNav(x)); if(!vis.length) return; if(g) h += `<div class="sb-sec">${g}</div>`; h += vis.map(it).join(''); });
  const ft = (s.foot || []).filter(x => canNav(x)); if(ft.length) h += `<div class="sb-line"></div>` + ft.map(it).join('');
  return h + `</aside>`; }
['dir', 'com', 'acc', 'ret', 'del', 'tsk'].forEach(a => { if(VIEWS[a]) VIEWS[a].side = uniSide5; });
const nav5 = (sec, to) => { const [a, pg] = to.split(':'); S.sec5 = sec; S.trail = null; S.pop = null; S.modal = null; if(a === 'db'){ S.view = 'db'; render(true); return; } S.fi[a] = null; go(a, pg); };
A.v5home = () => nav5('ovw', homeApp() + ':ovw');
A.uni5 = el => { const [sec, to] = el.dataset.v.split('|'); nav5(sec, to); };
A.sec5 = el => { const s = SEC5.find(x => x.k === el.dataset.v), first = s && secItems(s)[0]; if(first) nav5(s.k, first.to()); };
{ const os = A.setRole; A.setRole = el => { os(el); S.sec5 = 'ovw'; render(true); }; }

/* Header: the sections, the role, notifications and the tour; no version selector */
const navBar5 = () => `<nav class="v5-nav" aria-label="Sections">${SEC5.filter(s => secOn(s) && !s.hidden).map((s, i, xs) => `${s.k === 'dir' ? '<span class="v5-div" aria-hidden="true"></span>' : ''}<button class="v5-tab" data-act="sec5" data-v="${s.k}" aria-current="${S.sec5 === s.k}" style="--sec:${s.tone}"><i aria-hidden="true"></i>${s.n}</button>`).join('')}</nav>`;
{ const r5 = render; render = (...x) => { syncSec(); r5(...x);
    const sw = $('#appsw'); if(sw) sw.innerHTML = `${S.view !== 'db' ? `<button class="rf-hb rf-menu" data-act="sbTog" aria-label="Menu">${ico('list', 17)}</button>` : ''}` + navBar5();
    document.querySelectorAll('#tools .vsb, #tools [data-act="setPop"], #tools .tourb').forEach(b => b.remove());
    const tl = $('#tools'); if(tl && isAdmin() && !tl.querySelector('.v5-gear')){ const n = DB.req.filter(q => q.st === 'Pending').length, rb = tl.querySelector('[data-act="popRole"]');
      const g = `<button class="rf-hb v5-gear${S.sec5 === 'adm' || S.pop === 'set5' ? ' on' : ''}" data-act="popSet5" title="Settings" aria-label="Settings" aria-expanded="${S.pop === 'set5'}">${ico('cog', 18)}${n ? `<em class="rf-dot">${n}</em>` : ''}</button>`, nb = tl.querySelector('[data-act="popNt"]'); if(nb) nb.insertAdjacentHTML('afterend', g); else tl.insertAdjacentHTML('beforeend', g); }
    let fab = document.getElementById('v5-fab'); if(!fab){ document.body.insertAdjacentHTML('beforeend', '<button id="v5-fab" data-act="tour" aria-label="Demo tour"></button>'); fab = document.getElementById('v5-fab'); }
    fab.innerHTML = S.tour && S.tour.open ? `${ico('x', 18)}<span>Close tour</span>` : `${ico('flag', 18)}<span>Tour</span>`; fab.classList.toggle('on', !!(S.tour && S.tour.open));
    document.title = 'Refyt'; const at = document.querySelector('.v5-tab[aria-current="true"]'); if(at && at.scrollIntoViewIfNeeded) at.scrollIntoViewIfNeeded(false); }; }
{ const dp5 = drawPop; drawPop = () => { dp5(); const el = document.getElementById('rfpop'); if(!el || S.pop !== 'more') return; const top = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom + 6;
    el.innerHTML = `<div class="rf-pop" style="top:${top}px;right:12px;width:240px">${isAdmin() ? `<button class="rf-pi" data-act="popSet5"><span class="rf-ai">${ico('cog', 15)}</span><b>Settings</b><small>Users, teams and access</small></button>` : '<div class="rf-ni"><small>Nothing else here.</small></div>'}</div>`; };
  const dp6 = drawPop; drawPop = () => { dp6(); const el = document.getElementById('rfpop'); if(!el || S.pop !== 'set5') return; const hb = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom;
    const its = SEC5.find(s => s.k === 'adm').groups[0][1], grp = [['People and access', ['usr', 'tms', 'req', 'prm', 'vis']], ['Business setup', ['nsc', 'cls', 'int']]];
    const tile = x => { const c = x.c ? x.c() : 0, on = S.sec5 === 'adm' && curK5() === x.to(); return `<button class="v5-tile${on ? ' on' : ''}" data-act="setGo5" data-v="${x.to()}"><span class="v5-ti">${ico(x.ic, 26, 1.7)}${c ? `<em>${c}</em>` : ''}</span><span class="v5-tl">${x.n}</span></button>`; };
    el.innerHTML = `<div class="rf-pop v5-setp" role="dialog" aria-label="Settings" style="top:${hb + 8}px"><div class="v5-sph"><b>Settings</b><button class="v5-spx" data-act="setGo5" data-v="dir:usr" title="Open full screen" aria-label="Open full screen">${ico('expand', 16)}</button><button class="v5-spx" data-act="popSet5" title="Close" aria-label="Close">${ico('x', 16)}</button></div>`
      + grp.map(([g, ks]) => `<div class="v5-spg"><small>${g}</small><span></span></div><div class="v5-tiles">${ks.map(k => its.find(x => x.k === k)).filter(Boolean).map(tile).join('')}</div>`).join('')
      + `<div class="v5-spf">Only the administrator sees Settings. Pick any item to open it full screen.</div></div>`; }; }
A.setGo5 = el => { S.pop = null; drawPop(); nav5('adm', el.dataset.v); };
IC.cog = '<path d="M9.84 4.92 L10.16 1.56 L13.84 1.56 L14.16 4.92 L15.47 5.47 L18.08 3.32 L20.68 5.92 L18.53 8.53 L19.08 9.84 L22.44 10.16 L22.44 13.84 L19.08 14.16 L18.53 15.47 L20.68 18.08 L18.08 20.68 L15.47 18.53 L14.16 19.08 L13.84 22.44 L10.16 22.44 L9.84 19.08 L8.53 18.53 L5.92 20.68 L3.32 18.08 L5.47 15.47 L4.92 14.16 L1.56 13.84 L1.56 10.16 L4.92 9.84 L5.47 8.53 L3.32 5.92 L5.92 3.32 L8.53 5.47 Z"/><circle cx="12" cy="12" r="3.2"/>'; IC.expand = '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>';
A.popSet5 = () => { S.pop = S.pop === 'set5' ? null : 'set5'; drawPop(); };
{ const dp7 = drawPop; drawPop = () => { dp7(); const g = document.querySelector('.v5-gear'); if(g){ g.classList.toggle('on', S.pop === 'set5' || S.sec5 === 'adm'); g.setAttribute('aria-expanded', S.pop === 'set5'); } }; }
{ const tg = drawTour; drawTour = () => { tg(); const f = document.getElementById('v5-fab'); if(f){ f.innerHTML = S.tour.open ? `${ico('x', 18)}<span>Close tour</span>` : `${ico('flag', 18)}<span>Tour</span>`; f.classList.toggle('on', S.tour.open); } }; }
drawVs = () => { const el = document.getElementById('vsel'); if(el) el.innerHTML = ''; };

/* Style: REFYT blue stays the main colour; each section carries its own accent, in the header and at the top of its menu */


/* The tour: every section, every role, from the first job to payment */
const T5 = (role, sec, to, then) => () => { S.role = role; S.trail = null; S.pop = null; S.modal = null; if(S.tour) S.tour.min = false; nav5(sec, to); if(then) setTimeout(then, 60); };
const TF = (role, sec, id, tab, then) => () => { S.role = role; S.trail = null; S.sec5 = sec; abrir(sec === 'prp' ? 'dir' : homeApp(role), id, tab); if(then) setTimeout(then, 60); };
TOUR.length = 0;
TOUR.push(
  {t:'One workspace, sections across the top', min:1, dolor:'Before, five apps repeated the same screens and nobody knew where to look.', show:['Across the top: Overview and Properties, which everyone shares; then Director, Commercial, Accounts, Retrofit and Delivery.', 'The left menu shows only the section you picked.', 'Settings, at the top right, is where the administrator manages people and access.'], say:'The same place for the same thing, every time.', go:T5('dir', 'ovw', 'dir:ovw')},
  {t:'Overview changes with the role', min:1, dolor:'Section 14: each team should feel it has its own tool, showing only what it needs.', show:['Viewing as Install coordinator: Dren’s Home, his tasks and what needs him.', 'Only the team sections his role can open appear in the header.'], say:'Change the person behind a role; nothing is rebuilt.', go:T5('inc', 'ovw', 'del:ovw')},
  {t:'Approve in one click, with the full story', min:1, dolor:'Section 12: approvals above the scheme limits go to the Director.', show:['Overview, Approvals: the order, the payment and the variation waiting on Yahaya.', 'The eye opens the detail: who raised it, since when, the limit, and the conversation kept on the property.'], say:'Decide with the context in front of you.', go:T5('dir', 'ovw', 'dir:wait', () => A.apView && A.apView({dataset:{v:'orPO-740'}}))},
  {t:'My tasks and what needs attention', min:1, dolor:'Section 15: meeting actions become tasks with an owner and a due date.', show:['My tasks: due today, open and overdue, as a list or a calendar.', 'Needs attention: hold points, Ready to install and client systems to update, each with its fix.'], say:'Nothing agreed is lost.', go:T5('inc', 'ovw', 'del:tasks')},
  {t:'Properties: only what is shared with you', min:1, dolor:'People should only see the schemes they work on.', show:['As the Site manager: the properties shared with him, his team or his schemes.', 'Below, the rest of the open work, each with Request access.'], say:'Nothing is hidden by accident.', go:T5('sit', 'prp', 'dir:prs')},
  {t:'One card per property', min:1.5, dolor:'Section 3: the property is the main record.', show:['22 Clayhall Avenue: next step and owner, the phases A to F, and the money for roles that may see it.', 'The tabs follow the job: assess and design, prepare and install, orders, close out, checklists, updates and history.'], say:'Everyone looks at the same card.', go:TF('dir', 'prp', 'PR-2017', 'res')},
  {t:'The resident, in one place', min:1, dolor:'Yahaya: a central place for every customer interaction.', show:['Resident: contact, preferred channel and consent.', 'Log a call, an email or a note; the history stays on the property.', 'Calls and customer messages connect later.'], say:'Whoever picks up the phone knows the story.', go:TF('dir', 'prp', 'PR-2002', 'rsd')},
  {t:'Sharing a property', min:.5, dolor:'Access is decided by the administrator, per person or per team.', show:['Shared with: who sees this property and why.', 'Share with a person or a whole team in one click.'], say:'Open the door only to who needs it.', go:TF('dir', 'prp', 'PR-2002', 'res', () => A.shrOpen({dataset:{v:'PR-2002'}}))},
  {t:'The meetings register', min:1, dolor:'Monday and Thursday for everyone; Tuesday for the directors, with the money.', show:['Meetings sit in Overview, in the left menu.', 'Each meeting with its summary, decisions and action points.', 'Every action opens the task it created.'], say:'Every task traces back to its meeting.', go:() => { S.f.mtt = 'past'; S.f.mtd = 'MT-503'; T5('dir', 'ovw', 'dir:mtg')(); }},
  {t:'Retrofit: from the client list to a booked visit', min:1, dolor:'Section 5: book the assessment, then the visit, the review and the documents.', show:['Assessment bookings by status, or on each assessor’s calendar.', 'Import jobs from the client list: nobody types them one by one.'], say:'The job starts here.', go:T5('sad', 'ret', 'ret:bk')},
  {t:'Review, revisits and the survey pack', min:1, dolor:'A rejected assessment books a revisit and counts it.', show:['In assessment: each property in phase B with its evidence.', 'With the client: where each pack stands in Dynamics, Shareworks or PAS Hub.'], say:'Right first time, or back with a reason.', go:T5('aap', 'ret', 'ret:rq')},
  {t:'The assessor on site', min:.5, dolor:'Photos with location and time, from a phone.', show:['The assessor form: the visits of the day and the evidence RdSAP needs.'], say:'No account needed on site.', go:T5('ass', 'ret', 'ret:asf')},
  {t:'Delivery: Ready to install', min:1, dolor:'Section 6: a property is ready only when every phase D item is done.', show:['Each item with the date of its last change, and the timeline per property.', 'It sets itself to Ready and notifies the Install coordinator.'], say:'Nobody starts on site too early.', go:T5('inc', 'del', 'del:rdy')},
  {t:'Redbridge by group, with hold points', min:1, dolor:'Section 9: track Redbridge at group level; only the hold points block.', show:['Percentage per group and overall, by house type.', 'MDA and fixing tests hold the next group until passed.'], say:'The same view as your tracker, live.', go:T5('inc', 'del', 'del:hold')},
  {t:'Purchasing and suppliers', min:1, dolor:'Section 10: every cost tagged to a property and a measure.', show:['Orders by status, raised by hand or from a PDF.', 'Suppliers: spend, open orders and invoices to match.'], say:'Committed, then actual, never lost.', go:T5('inc', 'del', 'del:ord')},
  {t:'Commercial: is the work making money?', min:1, dolor:'Section 10: quote, budget and margin at every point of the job.', show:['Margins per scheme and property against each target.', 'Variations and additional costs with their reason and evidence.'], say:'See it before it hurts.', go:T5('com', 'com', 'com:mrg')},
  {t:'Accounts: from trigger to paid', min:1, dolor:'E.ON pays on Install complete, GLA on the final upload, Redbridge once Cotality registers.', show:['Payment triggers create the invoice as pending, to review and send.', 'Invoices due and overdue, supplier invoices to match.'], say:'Earned work is always invoiced.', go:T5('acc', 'acc', 'acc:trg')},
  {t:'Director: the business at a glance', min:1, dolor:'Section 16: meetings and decisions run from dashboards.', show:['Business overview, scheme performance, finance, operations, capacity and quality.', 'Every total opens the list behind it.'], say:'Zoom from the business to a cost line.', go:T5('dir', 'dir', 'dir:dbiz')},
  {t:'Settings: who sees what', min:1.5, dolor:'Roles are placeholders until the restructure; people, teams and access change without a rebuild.', show:['The gear at the top right opens Settings, only for the administrator.', 'Users and access: role, the properties each person sees, and money.', 'Teams: a leader and members; the leader gets the team report.', 'Roles and permissions: what each role can open.'], say:'One place to decide access.', go:T5('dir', 'adm', 'dir:usr')},
  {t:'Access requests', min:.5, dolor:'Someone who needs a property asks; the administrator decides.', show:['Akram asks for 61 Pier Road.', 'Give the property, the whole scheme, or reject.'], say:'Access with a record.', go:T5('dir', 'adm', 'dir:req')},
  {t:'Export any list', min:.5, dolor:'Dren: send filtered lists to clients.', show:['Every list has Export: a spreadsheet that opens in Excel, or a PDF, with the filters on screen.'], say:'Filter, export, send.', go:T5('dir', 'del', 'del:rdy', () => A.expOpen())},
);
TOUR_MAS.length = 0; TOUR_MAS.push('Retrofit: import jobs from a client list.', 'Commercial: scheme settings with their change log.', 'Director: new scheme from a template.', 'Delivery: site forms on a phone, with progress percentages.', 'Overview: My team, for a team leader such as Ramesh.');
if(/debug/.test(location.hash)) Object.assign(window.__X || (window.__X = {}), {SEC5, nav5, TOUR});


/* =================== Notifications: a side panel like monday, with mentions and what is assigned to me =================== */
/* Mentions are the posts on a property that name you; Assigned to me are your tasks and the approvals waiting on your role.
   Each notification opens what it is about. Read and unread are kept per person. */
[['PR-2017', 'dre', ['yah', 'tom'], 0, 'MDA confirmed corrosion on two stanchions. Can you approve VA-41 today so the scaffold stays up?'],
 ['PR-2019', 'tom', ['yah'], -1, 'Tomswood Hill is now over budget after the second fixing test. Worth a look before Tuesday.'],
 ['PR-2005', 'lan', ['yah'], -2, 'Medway Council is 10 days late on INV-3302. Shall I escalate to their finance lead?'],
 ['PR-2021', 'akr', ['yah', 'dre'], -6, 'Scaffold quote for the full rear elevation attached; two weeks of hire included.'],
 ['PR-2001', 'ram', ['afa', 'sar'], 0, 'Two evidence photos are missing at Canterbury Street: loft hatch and the rear wall. Can you go back this week?'],
 ['PR-2015', 'ram', ['sar'], -1, 'Revisit needed at Leytonstone Road. Please book it with the resident.'],
 ['PR-2019', 'akr', ['dre'], -1, 'EWI Pro retest booked for Thursday morning. I will send the result straight after.'],
 ['PR-2003', 'ram', ['dre'], -4, 'PIBI for Balmoral Road is booked; the design pack is approved.'],
 ['PR-2017', 'yah', ['tom', 'lan'], -1, 'Please review the Clayhall margin before the Tuesday meeting.'],
 ['PR-2005', 'yah', ['lan'], -9, 'Chase Medway Council for Saxton Street, it is our largest overdue invoice.'],
 ['PR-2019', 'dre', ['akr'], -2, 'What did the fixing test show on the rear elevation?'],
].forEach(([id, by, to, d, t], i) => { const p = DB.pr.find(x => x.id === id); if(!p || !PEO[by] || to.some(k => !PEO[k])) return; p.th = p.th || []; p.th.push({id:'UP-N' + i, by, on:addDays(TODAY, d), t, to, tk:null, from:null}); });
S.ntTab = 'all'; S.ntRd = 'all'; S.ntq = '';
const ntRead = () => { DB.ntr = DB.ntr || {}; return DB.ntr[ME()] || (DB.ntr[ME()] = new Set()); };
function ntItems(){ const me = ME(), all = window.__prAll || DB.pr, xs = [];
  all.forEach(p => (p.th || []).forEach(u => { if((u.to || []).includes(me) && u.by !== me) xs.push({id:'m' + u.id, kind:'men', by:u.by, on:u.on, verb:'Mentioned you', what:'in an update', body:u.t, ctx:`${p.ad}, ${scOf(p.sc).n}`, go:() => { S.sec5 = 'prp'; abrir(homeApp(), p.id, 'upd'); }}); }));
  DB.tk.filter(k => !k.done && (k.who ? k.who === me : k.r === S.role)).forEach(k => xs.push({id:'t' + k.id, kind:'asg', by:null, ic:'check', on:k.due < TODAY ? k.due : TODAY, verb:'Assigned you', what:'a task', body:k.t, ctx:`${dDiff(k.due) < 0 ? 'Overdue, was due' : 'Due'} ${fmtDy(k.due)}${k.src ? ', from ' + k.src : ''}`, go:() => { nav5('ovw', homeApp() + ':tasks'); if(A.tkView) setTimeout(() => A.tkView({dataset:{v:k.id}}), 30); }}));
  approvals().filter(a => a.role === S.role).forEach(a => xs.push({id:'a' + a.id, kind:'asg', by:null, ic:'stamp', on:TODAY, verb:'Waiting for your approval', what:'', body:`${a.k}: ${a.t}`, ctx:a.d || '', go:() => nav5('ovw', (WAIT4[S.role] || 'dir') + ':wait')}));
  pend(homeApp()).forEach(a => xs.push({id:'l' + a.id, kind:'sys', by:null, ic:'alert', on:TODAY, verb:a.k, what:'', body:a.t, ctx:a.d || '', go:() => nav5('ovw', S.role === 'dir' ? 'dir:dec' : homeApp() + ':atn')}));
  return xs.sort((a, b) => a.on < b.on ? 1 : a.on > b.on ? -1 : 0); }
const ntUnread = () => { const r = ntRead(); return ntItems().filter(x => !r.has(x.id)).length; };
const ntAgo = on => { const d = -dDiff(on); return d <= 0 ? 'Today' : d === 1 ? '1 day' : d + ' days'; };
const ntGroup = on => { const d = -dDiff(on); return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d <= 7 ? 'Last 7 days' : 'Older'; };
function ntList(){ const r = ntRead(), q = norm(S.ntq || ''), xs = ntItems().filter(x => (S.ntTab === 'all' || x.kind === S.ntTab) && (S.ntRd === 'all' || (S.ntRd === 'unread') === !r.has(x.id)) && (!q || norm([x.body, x.ctx, x.verb, x.by ? PEO[x.by].n : ''].join(' ')).includes(q)));
  if(!xs.length) return `<div class="v5-nte">${ico(S.ntTab === 'men' ? 'msg' : 'check', 28, 1.6)}<b>${q ? 'Nothing matches the search' : S.ntRd === 'unread' ? 'You are all caught up' : 'Nothing here yet'}</b><small>${S.ntTab === 'men' ? 'When someone names you in an update on a property, it shows here.' : S.ntTab === 'asg' ? 'Tasks and approvals that are yours show here.' : 'New activity will show here.'}</small></div>`;
  let g0 = '', h = ''; xs.forEach(x => { const g = ntGroup(x.on), un = !r.has(x.id); if(g !== g0){ h += `<div class="v5-ntg">${g}</div>`; g0 = g; }
    h += `<div class="v5-ntc${un ? ' un' : ''}" data-act="ntGo" data-v="${x.id}" role="button" tabindex="0">${x.by ? av(x.by, 34) : `<span class="v5-nta">${ico(x.ic, 17)}</span>`}<div class="v5-ntm"><div class="v5-ntl1">${x.by ? `<b>${esc(PEO[x.by].n)}</b> ` : ''}<span class="v5-ntv k-${x.kind}">${x.kind === 'men' ? '@ ' : ''}${esc(x.verb)}</span>${x.what ? ` ${x.what}` : ''}</div><p>${esc(x.body)}</p>${x.ctx ? `<small>${esc(x.ctx)}</small>` : ''}</div><div class="v5-ntr"><span>${ntAgo(x.on)}</span><button class="v5-ntd" data-act="ntTog" data-v="${x.id}" title="${un ? 'Mark as read' : 'Mark as unread'}" aria-label="${un ? 'Mark as read' : 'Mark as unread'}"><i></i></button></div></div>`; });
  return h; }
A.popNt = () => { S.pop = S.pop === 'nt5' ? null : 'nt5'; drawPop(); };
{ const dp8 = drawPop; drawPop = () => { dp8(); const el = document.getElementById('rfpop'); if(!el || S.pop !== 'nt5') return; const hb = (document.querySelector('.top') || {getBoundingClientRect:() => ({bottom:60})}).getBoundingClientRect().bottom, its = ntItems(), r = ntRead(), cnt = k => its.filter(x => (k === 'all' || x.kind === k) && !r.has(x.id)).length;
    const h = `<div class="rf-pop v5-ntp" role="dialog" aria-label="Notifications" style="top:${hb + 8}px"><div class="v5-nth"><h2>Notifications</h2><button class="v5-ntx" data-act="ntAll" title="Mark all as read">${ico('check', 15)}<span>Mark all as read</span></button><button class="v5-ntx sq" data-act="popNt" aria-label="Close">${ico('x', 16)}</button></div>`
      + `<div class="v5-ntt" role="tablist">${[['all', 'All'], ['men', 'Mentioned'], ['asg', 'Assigned to me']].map(([k, n]) => `<button role="tab" data-act="ntTab" data-v="${k}" aria-selected="${S.ntTab === k}">${n}${cnt(k) ? `<em>${cnt(k)}</em>` : ''}</button>`).join('')}</div>`
      + `<div class="v5-ntf"><label class="v5-ntq">${ico('search', 15)}<input data-in="ntq" value="${esc(S.ntq || '')}" placeholder="Search by person, property or text" autocomplete="off"></label><div class="seg2 um-seg">${[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([k, n]) => `<button data-act="ntRd" data-v="${k}" aria-pressed="${S.ntRd === k}">${n}</button>`).join('')}</div></div>`
      + `<div class="v5-ntlist">${ntList()}</div></div>`;
    const ex = el.querySelector('.v5-ntp'); if(!ex){ el.innerHTML = h; return; }
    const ol = ex.querySelector('.v5-ntlist'), y = ol ? ol.scrollTop : 0, fq = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.in === 'ntq', t = document.createElement('div'); t.innerHTML = h;
    ex.innerHTML = t.firstElementChild.innerHTML; ex.style.top = t.firstElementChild.style.top;
    const nl = ex.querySelector('.v5-ntlist'); if(nl) nl.scrollTop = y; if(fq){ const q = ex.querySelector('[data-in="ntq"]'); if(q){ q.focus(); q.setSelectionRange(q.value.length, q.value.length); } } }; }
IN.ntq = t => { S.ntq = t.value; const l = document.querySelector('.v5-ntlist'); if(l) l.innerHTML = ntList(); };
A.ntTab = el => { S.ntTab = el.dataset.v; setTimeout(drawPop, 0); };
A.ntRd = el => { S.ntRd = el.dataset.v; setTimeout(drawPop, 0); };
A.ntAll = () => { const r = ntRead(); ntItems().forEach(x => r.add(x.id)); setTimeout(() => { render(); drawPop(); }, 0); toast('All notifications marked as read.'); };
A.ntTog = el => { const r = ntRead(), id = el.dataset.v; r.has(id) ? r.delete(id) : r.add(id); setTimeout(() => { render(); drawPop(); }, 0); };
A.ntGo = el => { const x = ntItems().find(n => n.id === el.dataset.v); if(!x) return; ntRead().add(x.id); S.pop = null; drawPop(); x.go(); };
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.pop === 'nt5'){ S.pop = null; drawPop(); } if(e.key === 'Enter' && e.target.closest && e.target.closest('.v5-ntc') && !e.target.closest('button')) A.ntGo(e.target.closest('.v5-ntc')); });
{ const r6 = render; render = (...x) => { r6(...x); const b = document.querySelector('#tools [data-act="popNt"]'); if(!b) return; const n = ntUnread(); let d = b.querySelector('.rf-dot'); if(!n){ if(d) d.remove(); } else { if(!d){ b.insertAdjacentHTML('beforeend', '<em class="rf-dot"></em>'); d = b.querySelector('.rf-dot'); } d.textContent = n > 9 ? '9+' : n; } b.classList.toggle('on', S.pop === 'nt5'); b.setAttribute('aria-expanded', S.pop === 'nt5'); }; }
{ const dp9 = drawPop; drawPop = () => { dp9(); const b = document.querySelector('#tools [data-act="popNt"]'); if(b) b.classList.toggle('on', S.pop === 'nt5'); }; }
{ const t = TOUR.find(x => x.t === 'My tasks and what needs attention'); if(t) TOUR.splice(TOUR.indexOf(t) + 1, 0, {t:'Notifications: mentions and what is assigned to you', min:1, dolor:'Like monday: see who named you and what is waiting on you, without hunting for it.', show:['The bell opens the panel from the right: All, Mentioned and Assigned to me.', 'Filter by unread or read, or search by person, property or text.', 'Click one to open the property update, the task or the approval it is about.'], say:'Nothing that needs you is missed.', go:() => { S.role = 'dir'; nav5('ovw', 'dir:ovw'); setTimeout(() => { S.pop = 'nt5'; S.ntTab = 'men'; drawPop(); }, 60); }}); }


/* =================== Property lists: filters live inside the search bar, like monday =================== */
IC.filter = '<path d="M3.5 5h17l-6.5 7.6V19l-4 1.8v-8.2z"/>';
const PRF_ST = [['open', 'Open'], ['closed', 'Paid and cancelled'], ['all', 'All']];
const prMatch = (p, o) => (!o.sf || p.sc === o.sf) && (o.v === 'all' || (o.v === 'open' ? OPENP.includes(p.ph) : !OPENP.includes(p.ph))) && (!o.phs.length || o.phs.includes(p.ph)) && (!o.ms.length || p.ms.some(x => o.ms.includes(x.m))) && (!o.q || norm(p.ad + p.id + p.res + p.pc + p.ref).includes(o.q));
prList = (xs, key) => { const app = S.view, o = {sf:key === 'all' ? '' : S.f.sc || '', q:norm(S.f.prq), v:(S.f.prph || []).length ? 'all' : 'open', phs:S.f.prph || [], ms:[]}, ys = xs.filter(p => prMatch(p, o));
  const cnt = patch => xs.filter(p => prMatch(p, {...o, v:'all', ...patch})).length, nf = (o.sf ? 1 : 0) + o.phs.length, anim = S.f.prKeep ? ' v5-noanim' : '';
  const opt = (act, k, n, on, c) => `<button class="v5-fo${on ? ' on' : ''}" data-act="${act}" data-v="${esc(k)}" aria-pressed="${on}"><span>${esc(n)}</span><small>${c}</small></button>`;
  const col = (t, body) => `<div class="v5-fc"><small>${t}</small>${body}</div>`, mk = [...new Set(xs.flatMap(p => p.ms.map(x => x.m)))].filter(m => MEAS[m]);
  const panel = `<div class="v5-fp${anim}" role="dialog" aria-label="Filters"><div class="v5-fph"><b>Filter by</b><button class="v5-fclr" data-act="prClr" ${nf ? '' : 'disabled'}>Clear all</button></div><div class="v5-fcols">`
    + (key === 'all' ? '' : col('Scheme', [['', 'All schemes'], ...DB.sc.map(s => [s.id, s.n])].map(([k, n]) => opt('scf', k, n, o.sf === k, xs.filter(p => prMatch(p, {...o, sf:k})).length)).join('')))
    + col('Phase', PH.map(ph => opt('prPh', ph, ph, o.phs.includes(ph), cnt({phs:[ph]}))).join(''))
    + `</div></div>`;
  const chips = [...(o.sf ? [['scf', '', scOf(o.sf).n]] : []), ...o.phs.map(ph => ['prPh', ph, ph])];
  return `<div class="v5-fs"><div class="v5-fsb${S.f.prFo ? ' open' : ''}">${ico('search', 18)}<input type="search" data-in="f" data-k="prq" placeholder="Search an address, postcode, customer or client reference" value="${esc(S.f.prq || '')}" aria-label="Search properties"><button class="v5-fbtn${nf ? ' on' : ''}" data-act="prFo" title="Filters" aria-label="Filters" aria-expanded="${!!S.f.prFo}">${ico('filter', 17)}${nf ? `<em>${nf}</em>` : ''}</button></div>${S.f.prFo ? panel : ''}</div>`
    + `<div class="v5-fchips">${chips.length ? chips.map(([a, v, l]) => `<button class="v5-fchip" data-act="${a}" data-v="${esc(v)}" title="Remove this filter">${esc(l)}${ico('x', 12)}</button>`).join('') + `<button class="v5-fclr" data-act="prClr">Clear all</button>` : ''}<span class="v5-fn">${ys.length} ${ys.length === 1 ? 'property' : 'properties'}</span></div>`
    + prHead(canMoney(app)) + (PH.map(ph => { const zs = ys.filter(p => p.ph === ph); return zs.length ? grpH(ph, zs.length) + zs.map(p => prRow(p, canMoney(app))).join('') : ''; }).join('') || empty('No properties match these filters.')); };
A.prFo = () => { S.f.prFo = !S.f.prFo; render(); };
const prRe = () => { const m = $('#main'), y = m ? m.scrollTop : 0; S.f.prKeep = true; render(); if(m) m.scrollTop = y; S.f.prKeep = false; };
A.prPh = el => { const a = S.f.prph || [], v = el.dataset.v; S.f.prph = a.includes(v) ? a.filter(x => x !== v) : [...a, v]; prRe(); };
A.prMs = el => { const a = S.f.prm || [], v = el.dataset.v; S.f.prm = a.includes(v) ? a.filter(x => x !== v) : [...a, v]; render(); };
A.prClr = () => { S.f.prf = 'open'; S.f.sc = ''; S.f.prph = []; S.f.prm = []; prRe(); };
{ const os = A.scf; A.scf = el => { if(document.querySelector('.v5-fs')){ S.f.sc = el.dataset.v; prRe(); } else os(el); }; }
document.addEventListener('click', e => { if(S.f.prFo && e.target.closest && !e.target.closest('.v5-fs')){ S.f.prFo = false; render(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.prFo){ S.f.prFo = false; render(); } });



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
updTab = function(app, p){ const th = (p.th || []).slice().reverse();
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap"><p class="hint" style="margin:0;flex:1 1 260px">Public updates on this property. Everyone who can open it sees them; the people mentioned are also notified, and a post can create the task for whoever must act.</p>${nx('postOpen', p.id, 'Post an update')}</div>`
    + (th.length ? th.map(u => { const k = u.tk && DB.tk.find(x => x.id === u.tk); return `<div class="rf-post">${av(u.by, 30)}<div style="min-width:0;flex:1"><div class="rf-ph2"><b>${PEO[u.by].n}</b><small>${PEO[u.by].r}, ${fmtDy(u.on)}${u.from ? `, about ${u.from.toLowerCase()}` : ''}</small><span class="up51-pub">${ico('globe', 12)}Public</span></div><p>${esc(u.t)}</p>${u.to.length || k ? `<div class="rf-pt">${u.to.map(x => `<span>@${PEO[x].n}</span>`).join('')}${k ? `<button class="rf-chipb" data-act="tkView" data-v="${k.id}">Task: ${esc(k.t)}, ${k.done ? 'done' : 'due ' + fmtDy(k.due)}</button>` : ''}</div>` : ''}</div></div>`; }).join('') : empty('No updates yet. Post the first one; everyone on the property will see it.')); };

/* Checklists: add, edit and delete items on each property */
S.ck51 = null; S.ck51a = {}; let CX51 = 0;
const CKTAB51 = {ev:'ret', docs:'ret', d:'ins', hand:'clo'};
const ckG51 = g => CHKG.find(c => c[0] === g);
const ckLbl51 = (p, g, x) => { const c = (p.cx || {})[g] || [], own = c.find(i => i.k === x); if(own) return own.t; return ((p.rn || {})[g] || {})[x] || ckG51(g)[3](x); };
const ckEditing51 = key => S.ck51 && S.ck51.k === key;
function ckRow51(p, g, x, ed, own){ const key = `${p.id}|${g}|${x}`, it = own ? ((p.cx || {})[g] || []).find(i => i.k === x) : null, rn = !own && ((p.rn || {})[g] || {})[x];
  if(ed && ckEditing51(key)) return `<div class="ck51-row ck51-ed"><input class="ck51-in" data-in="ck51e" data-k="${esc(key)}" value="${esc(S.ck51.v)}" aria-label="Item name" maxlength="120"><div class="ck51-act">${nx('ck51Save', key, 'Save')}${nx('ck51Cancel', key, 'Cancel', 'sec')}</div></div>`;
  const ck = own ? `<button type="button" class="rf-ck ck51-ck${it.done ? ' on' : ''}" data-act="${ed ? 'ck51Done' : ''}" data-v="${esc(key)}" aria-label="${it.done ? 'Mark as not done' : 'Mark as done'}" ${ed ? '' : 'disabled'}>${it.done ? ico('check', 14, 2.6) : ''}</button>` : `<span class="ck51-dot" aria-hidden="true"></span>`;
  const tag = own ? '<em class="ck51-tag">Added here</em>' : rn ? `<em class="ck51-tag">Renamed here, was ${esc(ckG51(g)[3](x))}</em>` : '';
  return `<div class="ck51-row${own && it.done ? ' done' : ''}">${ck}<div class="ck51-t"><b>${esc(ckLbl51(p, g, x))}</b>${tag}</div>${ed ? `<div class="ck51-act"><button type="button" class="ib ck51-ib" data-act="ck51Edit" data-v="${esc(key)}" title="Edit" aria-label="Edit ${esc(ckLbl51(p, g, x))}">${ico('edit', 15)}</button><button type="button" class="ib ck51-ib" data-act="ck51Del" data-v="${esc(key)}" title="${own ? 'Delete' : 'Remove from this property'}" aria-label="Delete ${esc(ckLbl51(p, g, x))}">${ico('x', 15)}</button></div>` : ''}</div>`; }
S.ck51g = null;
const ckEdRow51 = (p, g, x, own) => ckRow51(p, g, x, true, own).replace(/<button type="button" class="rf-ck ck51-ck[^>]*>[\s\S]*?<\/button>/, '<span class="ck51-dot" aria-hidden="true"></span>');
chkTab = function(app, p){ const s = scOf(p.sc), e = effChk(p), ed = ['dir', 'ret', 'del'].includes(app) && OPENP.includes(p.ph);
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
    return `<section class="rsec ck51">${head}${chips}${(p.chk || {})[g] && ed ? `<button class="btn sec sm" data-act="pchkReset" data-v="${p.id}|${g}">Reset to the scheme</button>` : ''}</section>`; }).join(''); };
A.ck51Open = el => { S.ck51g = el.dataset.v; S.ck51 = null; render(); };
A.ck51Close = () => { S.ck51g = null; S.ck51 = null; render(); toast('Checklist updated.'); };
A.ck51Tog = el => { const [id, g, x] = el.dataset.v.split('|'), p = prOf(id), it = ((p.cx || {})[g] || []).find(y => y.k === x); if(!it) return; it.off = !it.off; his(p, `Checklist changed on this property: ${it.off ? 'removed' : 'added'} ${it.t}`, ME()); render(); };
IN.ck51e = t => { if(S.ck51) S.ck51.v = t.value; };
IN.ck51a = t => { S.ck51a[t.dataset.k] = t.value; };
const ckFocus51 = sel => setTimeout(() => { const i = document.querySelector(sel); if(i){ i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch(e) {} } }, 30);
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
const ckWrap51 = (fn, tab) => function(app, p){ let h = fn(app, p); const rn = p.rn || {};
  Object.keys(rn).forEach(g => Object.entries(rn[g]).forEach(([x, v]) => { const old = ckG51(g)[3](x); h = h.split(`<b>${old}</b>`).join(`<b>${esc(v)}</b>`).split(`<b>${esc(old)}</b>`).join(`<b>${esc(v)}</b>`); }));
  const on51 = g => ((p.cx || {})[g] || []).filter(i => !i.off), gs = Object.keys(CKTAB51).filter(g => CKTAB51[g] === tab && on51(g).length), ed = ['dir', 'ret', 'del'].includes(app) && OPENP.includes(p.ph);
  if(gs.length) h += `<section class="rsec ck51" style="margin-top:16px"><div class="rs-h"><h3>Added on this property</h3><p>Items added in Checklists for this property only.</p></div>${gs.map(g => `<small class="rf-ph">${ckG51(g)[1]}</small>` + on51(g).map(i => ckRow51(p, g, i.k, false, true).replace('disabled', ed ? '' : 'disabled').replace('data-act=""', ed ? 'data-act="ck51Done"' : 'data-act=""')).join('')).join('')}</section>`;
  return h; };
retTab = ckWrap51(retTab, 'ret'); insTab = ckWrap51(insTab, 'ins'); cloTab = ckWrap51(cloTab, 'clo');

/* The menu on phones and tablets also lists every section, so nothing hides off screen */
['dir', 'com', 'acc', 'ret', 'del', 'tsk'].forEach(a => { if(VIEWS[a] && VIEWS[a].side){ const o = VIEWS[a].side; VIEWS[a].side = (...x) => { const h = o(...x), secs = SEC5.filter(s => secOn(s) && !s.hidden);
  const m = `<div class="v51-secm" role="group" aria-label="Sections">${secs.map(s => `<button type="button" class="v51-sec" data-act="sec5" data-v="${s.k}" aria-current="${S.sec5 === s.k}">${s.n}</button>`).join('')}</div>`;
  return h.replace(/(<aside class="sb v5-sb"[^>]*>)/, `$1${m}`); }; } });

/* The drawer opens right under the header, whatever its height on this screen */
{ const oT = A.sbTog; A.sbTog = (...x) => { oT(...x); requestAnimationFrame(() => { const hd = document.querySelector('header.top'), sb = document.querySelector('.oapp.sbopen>.sb'); if(hd && sb) sb.style.setProperty('top', Math.max(0, Math.round(hd.getBoundingClientRect().bottom)) + 'px', 'important'); }); }; }
VERSIONS.forEach(v => { if(v.current) v.current = false; });
VERSIONS.push({v:'v5', date:TODAY, major:false, current:false, url:'https://claude.ai/artifact/R1thJhkP3VVmnUviCzR8ch', title:'Sections across the header, each with its own menu', sum:'Overview, Properties and the team sections across the top; the left menu shows only the selected section, and Overview changes with the role.', steps:[]});
VERSIONS.push({v:'v5.1', date:TODAY, major:false, current:true, url:null, title:'Public updates, checklists you can edit, Orders on All, text that fits every screen', sum:'Post an update now posts publicly on the property, with optional mentions. Checklists keep their selectable items, and an edit button on each group adds, renames and deletes items, then Confirm. Orders opens on All, then Open, then each status. Long names wrap instead of being cut, and the phone menu lists every section.', steps:[]});


/* =================== v5.2: move to the next status from the property, boxes you click, not needed in grey, history as an icon =================== */
IC.history = '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/><path d="M12 7.5v4.5l3 2"/>';
const nextPh52 = p => p.ph === 'F. Close out' ? 'Paid' : PH[pIdx(p.ph) + 1];
/* 1. Any status can move on. If something is missing, a warning lists it; the person confirms and it moves anyway */
{ const oNext = A.phNext; A.phNext = el => { const p = prOf(el.dataset.v); if(!OPENP.includes(p.ph)) return; const g = phGate(p);
  if(!g.ok && !el.dataset.force){ S.modal = {k:'ph52', pr:p.id}; renderLayer(); return; }
  if(g.ok){ oNext(el); return; }
  const real = phGate, miss = g.miss.slice(), from = p.ph; phGate = () => ({ok:true, miss:[]});
  try { oNext(el); } finally { phGate = real; }
  if(p.ph !== from){ his(p, `Moved on from ${from} without: ${miss.join('; ')}. Confirmed by ${PEO[ME()].n}.`, ME()); render(); } }; }
MODALS.ph52 = m => { const p = prOf(m.pr), g = phGate(p);
  return modal(`Move to ${nextPh52(p)}?`, `${esc(p.ad)}, ${p.id}. ${p.ph} is not complete yet. You can still move it on; the history records what was missing and who confirmed.`,
    `<div class="ph52-miss"><small>Still missing to finish ${esc(p.ph)}</small><ul>${g.miss.map(x => `<li>${ico('alert', 15)}<span>${esc(x)}</span></li>`).join('')}</ul></div>`,
    mfoot('Move anyway', 'ph52Ok', true), 560); };
A.ph52Ok = () => { const id = S.modal.pr; S.modal = null; renderLayer(); A.phNext({dataset:{v:id, force:'1'}}); };

/* 2 and 3. Not needed items show grey with a lock; done is marked by clicking the box itself */
const NA52 = /Not needed on this job|Not applicable/;
const boxAct52 = b => { const a = b.dataset.act, t = (b.textContent || '').trim();
  if(a === 'bStep' && /Mark done/.test(t)) return 'move';
  if(a === 'bBook' || a === 'bVis' || a === 'hSet') return 'move';
  if(a === 'ipSet' && /Signed off/.test(t)) return 'move';
  if(a === 'gSet' && /Passed|Complete/.test(t)) return 'move';
  if(a === 'dSet') return /Mark done/.test(t) ? 'move' : 'copyDone';
  return ''; };
const naRow52 = r => { const sm = r.querySelector(':scope > div > small, :scope > .rf-evh > small'); return (sm && NA52.test(sm.textContent)) || [...r.querySelectorAll('.pill')].some(x => /^\s*Not applicable\s*$/.test(x.textContent)); };
function boxes52(){
  /* Any item that does not apply to the property, in any status: grey, locked, "Not needed on this job" */
  document.querySelectorAll('.rf-dl, .rf-evr').forEach(r => { if(!naRow52(r)) return; r.classList.remove('ok'); r.classList.add('na52');
    const sm = r.querySelector(':scope > div > small, :scope > .rf-evh > small'); if(sm) sm.textContent = 'Not needed on this job';
    r.querySelectorAll('.pill').forEach(x => { if(/Not applicable/.test(x.textContent)) x.remove(); });
    const ck = r.querySelector(':scope > .rf-ck'); if(ck){ ck.innerHTML = ico('lock', 12, 2.2); ck.title = 'Not needed on this job'; ['act', 'v'].forEach(k => delete ck.dataset[k]); ck.classList.remove('ck52'); ck.removeAttribute('role'); ck.removeAttribute('tabindex'); }
    if(r.classList.contains('rf-dl')) r.querySelectorAll('[data-act]').forEach(x => x.remove()); });
  document.querySelectorAll('b.z').forEach(z => { if(/^\s*n\/a\s*$/i.test(z.textContent)){ z.className = 'na52c'; z.title = 'Not needed on this job'; z.innerHTML = `${ico('lock', 11, 2.2)}Not needed`; } });
  /* Done is marked by clicking the box itself */
  document.querySelectorAll('.rf-dl:not(.na52)').forEach(r => { const ck = r.querySelector(':scope > .rf-ck'); if(!ck || ck.dataset.act) return;
    const b = [...r.querySelectorAll('[data-act]')].find(x => x !== ck && boxAct52(x)); if(!b) return;
    const how = boxAct52(b), done = r.classList.contains('ok');
    ck.dataset.act = b.dataset.act; ck.dataset.v = how === 'copyDone' ? b.dataset.v.replace(/\|[^|]*$/, '|Done') : b.dataset.v;
    ck.setAttribute('role', 'button'); ck.tabIndex = 0; ck.classList.add('ck52');
    const name = (r.querySelector(':scope > div > b') || {}).textContent || 'this item';
    ck.setAttribute('aria-label', `${done ? 'Mark as not done' : 'Mark as done'}: ${name}`); ck.title = done ? 'Click to mark as not done' : 'Click to mark as done';
    b.remove(); }); }
/* The Director (administrator) works on every tab of the property, not only looks */
{ const asEd52 = (f, ea) => function(app, p){ return f(isAdmin() && app === 'dir' ? ea : app, p); };
  retTab = asEd52(retTab, 'ret'); insTab = asEd52(insTab, 'del'); cloTab = asEd52(cloTab, 'del'); }
{ const r52 = render; render = (...x) => { const o = r52(...x); try { boxes52(); } catch(e) {} return o; }; }
document.addEventListener('keydown', e => { const t = e.target; if((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('ck52')){ e.preventDefault(); t.click(); } });

/* Not needed items: click the lock to make the item needed on this property; double-click the box to mark it not needed again */
const can52 = () => isAdmin() || DEL4.includes(S.role) || RET4.includes(S.role);
const cur52 = () => { const id = S.fi && S.fi[S.view]; return id && String(id).startsWith('PR-') ? prOf(id) : null; };
const name52 = r => { const b = r.querySelector(':scope > div > b'); if(!b) return ''; let t = ''; b.childNodes.forEach(n => { if(n.nodeType === 3) t += n.textContent; }); return t.trim(); };
function key52(p, r){ const sec = r.closest('.rsec'), h = sec && sec.querySelector('.rs-h h3'), ht = h ? h.textContent : '', n = name52(r); if(!n) return null;
  const rv = g => { const m = (p.rn || {})[g] || {}; return Object.keys(m).find(k => m[k] === n); };
  if(/^Phase D/.test(ht)){ const k = (DITEMS.find(([, x]) => x === n) || [])[0] || rv('d'); return k ? 'd|' + k : null; }
  if(/^Handover/.test(ht)){ const k = HAND.includes(n) ? n : rv('hand'); return k ? 'h|' + k : null; }
  if(/^Install by group/.test(ht)){ const k = (RGROUPS.find(g => g[1] === n) || [])[0]; return k ? 'g|' + k : null; }
  return null; }
function lock52(){ const p = cur52(); if(!p || !can52() || !OPENP.includes(p.ph)) return;
  document.querySelectorAll('.rf-dl').forEach(r => { const ck = r.querySelector(':scope > .rf-ck'); if(!ck) return; const k = key52(p, r); if(!k) return;
    ck.dataset.l52 = k;
    if(r.classList.contains('na52')){ ck.title = 'Not needed on this job'; const ed = S.f.ed52 === p.id + '|' + k, nm = esc(name52(r));
      r.insertAdjacentHTML('beforeend', ed ? `<div class="na52-act"><button type="button" class="btn pri sm" data-act="u52b" data-v="${k}">${ico('lock', 13, 2.2)}Unlock: needed on this job</button><button type="button" class="btn sec sm" data-act="e52x">Cancel</button></div>` : `<button type="button" class="na52-ed" data-act="e52" data-v="${k}" title="Edit" aria-label="Edit ${nm}">${ico('edit', 15)}</button>`); }
    else { ck.classList.add('lb52'); ck.title = (ck.title ? ck.title + '. ' : '') + 'Double-click to mark as not needed on this job'; } }); }
const chkOn52 = (p, g, x, on) => { const inn = effChk(p)[g].includes(x); if(inn !== on) A.pchk({dataset:{v:`${p.id}|${g}|${x}`}}); };
function setNeed52(p, k, need){ const [t, x] = k.split('|'), solar = t === 'h' && x.includes('solar') && !p.ms.some(m => m.m === 'SPV');
  const lbl = t === 'd' ? (DITEMS.find(y => y[0] === x) || ['', x])[1] : t === 'g' ? RGROUPS.find(g => g[0] === x)[1] : x;
  if(t === 'd'){ p.dna0 = p.dna0 || {}; p.dna0[x] = !need; if(need){ chkOn52(p, 'd', x, true); if(!p.d[x]) p.d[x] = 'Not booked'; } else if(effChk(p).d.includes(x)) chkOn52(p, 'd', x, false); applyChk(p); }
  if(t === 'h'){ p.u52 = p.u52 || {}; if(need){ if(solar) p.u52['h:' + x] = true; chkOn52(p, 'hand', x, true); applyChk(p); if(p.hand[x] === 'na') delete p.hand[x]; } else { delete p.u52['h:' + x]; if(effChk(p).hand.includes(x)) chkOn52(p, 'hand', x, false); else p.hand[x] = 'na'; applyChk(p); } }
  if(t === 'g'){ p.g[x] = need ? 'Not started' : 'Not applicable'; }
  his(p, `${lbl}: ${need ? 'needed on this job again' : 'marked as not needed on this job'}`, ME()); render(); toast(need ? `${lbl} is needed on this job now.` : `${lbl} is not needed on this job. Click the lock to undo.`); }
A.u52 = el => { const p = cur52(); if(p) setNeed52(p, el.dataset.l52, true); };
A.e52 = el => { const p = cur52(); if(!p) return; S.f.ed52 = p.id + '|' + el.dataset.v; render(); };
A.e52x = () => { S.f.ed52 = null; render(); };
A.u52b = el => { const p = cur52(); S.f.ed52 = null; if(p) setNeed52(p, el.dataset.v, true); };
{ let t52 = null;
  document.addEventListener('click', e => { const ck = e.target.closest && e.target.closest('.rf-ck[data-l52]'); if(!ck) return;
    if(ck.classList.contains('lk52')){ e.preventDefault(); e.stopPropagation(); A.u52(ck); return; }
    if(!ck.dataset.act) return; e.preventDefault(); e.stopPropagation(); if(e.detail > 1) return;
    clearTimeout(t52); t52 = setTimeout(() => { t52 = null; const f = A[ck.dataset.act]; if(f && document.body.contains(ck)) f(ck, e); }, 260); }, true);
  document.addEventListener('dblclick', e => { const ck = e.target.closest && e.target.closest('.rf-ck[data-l52]'); if(!ck || ck.classList.contains('lk52')) return; e.preventDefault(); clearTimeout(t52); t52 = null; const p = cur52(); if(p) setNeed52(p, ck.dataset.l52, false); }, true);
  document.addEventListener('keydown', e => { const t = e.target; if((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('lk52')){ e.preventDefault(); A.u52(t); } }); }
{ const r52b = render; render = (...x) => { const o = r52b(...x); try { lock52(); } catch(e) {} return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.1') v.url = 'https://claude.ai/artifact/4KX5KKxyYN1PHmWPa4KRqh'; } });
VERSIONS.push({v:'v5.2', date:TODAY, major:false, current:true, url:null, title:'Move to the next status from the property, boxes you click, not needed in grey', sum:'Every property shows Move to the next status beside Post an update; if something is missing a warning lists it and Move anyway records it in the history. Done is marked by clicking the box. Items not needed on the job show grey with a lock. Document history is one blue icon button.', steps:[]});

/* =================== v5.3: Margins with search, a filter button and a margin chart that follows the filters =================== */
IC.filter = '<path d="M3 5h18l-7 8.5V19l-4 2v-7.5L3 5z"/>';
S.f.mq = ''; S.f.msc = []; S.f.mph = []; S.f.mpop = false;
const MCOL53 = ['#6366F1', '#F97316', '#10B981', '#EC4899', '#06B6D4', '#EAB308', '#8B5CF6', '#EF4444'];
const MPH53 = ['C. Client approval', 'D. Prepare to install', 'E. Install', 'F. Close out', 'Paid'];
const mAll53 = () => DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled');
let mProps53 = () => { const q = norm(S.f.mq); return mAll53().filter(p => (!S.f.msc.length || S.f.msc.includes(p.sc)) && (!S.f.mph.length || S.f.mph.includes(p.ph)) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))); };
const mSum53 = ps => { const q = sum(ps, p => pMoney(p).q), fc = sum(ps, p => pMoney(p).fc), t = q ? sum(ps, p => pMoney(p).q * scOf(p.sc).set.mg) / q : 0; return {q, fc, mg:q - fc, mgp:q ? (q - fc) / q * 100 : 0, t}; };
function donut53(sl, mid, sub){ const r = 66, C = 2 * Math.PI * r, tot = sum(sl, x => x.v); let off = 0;
  const arcs = tot > 0 ? sl.map(x => { const len = x.v / tot * C, gap = sl.length > 1 ? Math.min(2.5, len / 3) : 0, a = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${x.c}" stroke-width="26" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)"><title>${esc(x.n)}: ${fm(x.v)}, ${pc(x.v / tot * 100)}</title></circle>`; off += len; return a; }).join('') : `<circle cx="90" cy="90" r="${r}" fill="none" stroke="#E2E8F0" stroke-width="26"/>`;
  return `<svg class="mc53-svg" viewBox="0 0 180 180" role="img" aria-label="Forecast margin by ${esc(sub)}">${arcs}<text x="90" y="86" text-anchor="middle" class="mc53-big">${mid}</text><text x="90" y="108" text-anchor="middle" class="mc53-sm">${esc(sub)}</text></svg>`; }
function mChart53(ps){ if(!ps.length) return '';
  const m = mSum53(ps), scs = [...new Set(ps.map(p => p.sc))], byS = scs.length > 1;
  const groups = byS ? scs.map(id => { const xs = ps.filter(p => p.sc === id), s = scOf(id), k = mSum53(xs); return {n:s.n, v:k.mg, q:k.q, mgp:k.mgp, t:s.set.mg, cnt:xs.length}; }) : ps.map(p => { const k = pMoney(p); return {n:p.ad, v:k.mg, q:k.q, mgp:k.mgp, t:scOf(p.sc).set.mg, cnt:1, ph:p.ph}; });
  groups.sort((a, b) => b.v - a.v); groups.forEach((g, i) => { g.c = MCOL53[i % MCOL53.length]; });
  const pos = groups.filter(g => g.v > 0), neg = groups.filter(g => g.v <= 0), totPos = sum(pos, g => g.v), ok = m.mgp >= m.t, d = Math.round(Math.abs(m.mgp - m.t));
  const lead = `<p class="mc53-lead"><b>${fm(m.mg)}</b> margin on ${fm(m.q)} quoted, ${plural(ps.length, 'property', 'properties')}. ${ok ? `<span class="mc53-up">${plural(d, 'point', 'points')} above target</span>` : `<span class="mc53-dn">${plural(d, 'point', 'points')} below target</span>`}</p>`;
  const legend = groups.map(g => `<li><span class="mc53-dot" style="background:${g.v > 0 ? g.c : '#CBD5E1'}"></span><div class="mc53-li"><div class="mc53-r1"><b>${esc(g.n)}</b><span>${fm(g.v)}${g.v > 0 && totPos ? `, ${pc(g.v / totPos * 100)}` : ''}</span></div><small>Target ${g.t}%</small></div>${mgTag(g.mgp, g.t)}</li>`).join('');
  return `<section class="rsec mc53"><div class="mc53-g"><div class="mc53-c">${donut53(pos.map(g => ({n:g.n, v:g.v, c:g.c})), pc(m.mgp), `target ${pc(m.t)}`)}</div><div class="mc53-e">${lead}<ul class="mc53-l">${legend}</ul><p class="mc53-note">${ico('target', 14)}<span>Target: the minimum margin agreed for each scheme, set in Scheme settings.${neg.length ? ' Grey: no margin left.' : ''}</span></p></div></div></section>`; }
function mBar53(){ const n = S.f.msc.length + S.f.mph.length, scs = [...new Set(mAll53().map(p => p.sc))].map(scOf);
  const pop = S.f.mpop ? `<div class="mf53-pop" role="dialog" aria-label="Filters"><small>Scheme</small><div class="mf53-ops">${scs.map(s => `<button type="button" class="mf53-op${S.f.msc.includes(s.id) ? ' on' : ''}" data-act="mf53Sc" data-v="${s.id}" aria-pressed="${S.f.msc.includes(s.id)}">${S.f.msc.includes(s.id) ? ico('check', 13, 2.6) : ''}${esc(s.n)}</button>`).join('')}</div><small>Status</small><div class="mf53-ops">${MPH53.map(ph => `<button type="button" class="mf53-op${S.f.mph.includes(ph) ? ' on' : ''}" data-act="mf53Ph" data-v="${ph}" aria-pressed="${S.f.mph.includes(ph)}">${S.f.mph.includes(ph) ? ico('check', 13, 2.6) : ''}${ph}</button>`).join('')}</div><div class="mf53-pf"><button type="button" class="btn sec sm" data-act="mf53Clr">Clear filters</button><button type="button" class="btn pri sm" data-act="mf53Tog">Done</button></div></div>` : '';
  const chips = [...S.f.msc.map(id => [`mf53Sc`, id, scOf(id).n]), ...S.f.mph.map(ph => ['mf53Ph', ph, ph])].map(([a, v, t]) => `<button type="button" class="mf53-chip" data-act="${a}" data-v="${esc(v)}" title="Remove this filter">${esc(t)}${ico('x', 12, 2.4)}</button>`).join('');
  return `<div class="mf53-bar"><label class="mf53-s">${ico('search', 16)}<input data-in="mq53" value="${esc(S.f.mq)}" placeholder="Search a property, postcode or scheme" aria-label="Search margins"></label><div class="mf53-fw"><button type="button" class="mf53-fb${n ? ' on' : ''}" data-act="mf53Tog" aria-label="Filter by scheme or status" aria-expanded="${S.f.mpop}" title="Filter by scheme or status">${ico('filter', 17)}${n ? `<span class="mf53-n">${n}</span>` : ''}</button>${pop}</div></div>${chips ? `<div class="mf53-chips">${chips}<button type="button" class="lnk4" data-act="mf53Clr">Clear all</button></div>` : ''}`; }
mrgPage = function(){ const ps = mProps53(), scs = [...new Set(ps.map(p => p.sc))];
  return oph('Margins', 'Quoted value, forecast cost and margin per scheme and property, against each scheme’s target.') + mChart53(ps) + mBar53()
    + (ps.length ? scs.map(id => { const s = scOf(id), xs = ps.filter(p => p.sc === id), k = mSum53(xs); return grpH(`${s.n}, target ${s.set.mg}%`, k.q ? pc(k.mgp) : '') + xs.map(p => { const x = pMoney(p); return rowO('prMon', p.id, tcell('prMon', p.id, esc(p.ad), p.ph, 2.4) + cell(fm(x.q), 'quoted') + cell(fm(x.fc), `budget ${fm(x.b)}`) + `<div class="mbc"><b>${mgTag(x.mgp, s.set.mg)}</b><small>${x.over ? 'over budget' : fm(x.mg)}</small></div>`); }).join(''); }).join('') : empty('No properties match the search or the filters.')); };
VIEWS.com.pages.mrg = mrgPage;
IN.mq53 = t => { S.f.mq = t.value; refocus(render); };
A.mf53Tog = () => { S.f.mpop = !S.f.mpop; render(); };
A.mf53Sc = el => { const v = el.dataset.v; S.f.msc = S.f.msc.includes(v) ? S.f.msc.filter(x => x !== v) : [...S.f.msc, v]; render(); };
A.mf53Ph = el => { const v = el.dataset.v; S.f.mph = S.f.mph.includes(v) ? S.f.mph.filter(x => x !== v) : [...S.f.mph, v]; render(); };
A.mf53Clr = () => { S.f.msc = []; S.f.mph = []; render(); };
document.addEventListener('click', e => { if(S.f.mpop && e.target.closest && !e.target.closest('.mf53-fw')){ S.f.mpop = false; if(!e.target.closest('[data-act]')) render(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.mpop){ S.f.mpop = false; render(); } });
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.2') v.url = 'https://claude.ai/artifact/KGRERhaBmxGRBAiHyGM2yp'; } });
VERSIONS.push({v:'v5.3', date:TODAY, major:false, current:true, url:null, title:'Margins: search, filters and a margin chart', sum:'Margins has a search bar and a filter button by scheme and status. A chart splits the forecast margin by scheme, or by property when one scheme is left, and explains each scheme’s target.', steps:[]});


/* =================== v5.4: Quotes and budgets as a dashboard, with the quote file =================== */
S.f.qsc = ''; S.f.qm = ''; S.f.qst = ''; S.f.qby = 'sc'; S.f.qdv = 'val';
const QC54 = {q:'#6366F1', b:'#F97316', ok:'#10B981', wait:'#F59E0B'};
const qBase54 = () => DB.pr.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled');
const qSt54 = (p, st) => !st || (st === 'ok' ? p.quoteOk : st === 'wait' ? !p.quoteOk : !p.qf);
const qF54 = (skip = '') => qBase54().filter(p => (skip === 'sc' || !S.f.qsc || p.sc === S.f.qsc) && (skip === 'm' || !S.f.qm || p.ms.some(x => x.m === S.f.qm)) && (skip === 'st' || qSt54(p, S.f.qst)));
const kfm54 = v => '£' + (v >= 10000 ? Math.round(v / 1000) + 'k' : v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : Math.round(v));
function qBars54(){ const by = S.f.qby, ps = qF54(by === 'sc' ? 'sc' : 'm'), sel = by === 'sc' ? S.f.qsc : S.f.qm;
  const gs = by === 'sc' ? [...new Set(ps.map(p => p.sc))].map(id => { const xs = ps.filter(p => p.sc === id); return {k:id, n:scOf(id).n, q:sum(xs, p => pMoney(p).q), b:sum(xs, p => pMoney(p).b)}; })
    : Object.keys(MEAS).map(m => { let q = 0, b = 0; ps.forEach(p => p.ms.filter(x => x.m === m).forEach(x => { const k = mMoney(p, x); q += k.q; b += k.b; })); return {k:m, n:MEAS[m].s, q, b}; }).filter(g => g.q > 0);
  if(!gs.length) return empty('Nothing to chart with these filters.');
  const W = 620, H = 250, L = 46, B = 40, T = 12, iw = W - L - 8, ih = H - B - T, mx = Math.max(...gs.map(g => g.q)) * 1.12 || 1, gw = iw / gs.length, bw = Math.min(30, gw * .28);
  const y = v => T + ih - v / mx * ih, grid = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - 8}" y1="${y(mx * f)}" y2="${y(mx * f)}" class="q54-gl"/><text x="${L - 8}" y="${y(mx * f) + 4}" text-anchor="end" class="q54-ax">${kfm54(mx * f)}</text>`).join('');
  const bars = gs.map((g, i) => { const cx = L + gw * i + gw / 2, dim = sel && sel !== g.k, nm = esc(g.n), lines = g.n.length > 13 && g.n.includes(' ') ? [g.n.slice(0, g.n.lastIndexOf(' ', 13) > 0 ? g.n.lastIndexOf(' ', 13) : g.n.indexOf(' ')), g.n.slice((g.n.lastIndexOf(' ', 13) > 0 ? g.n.lastIndexOf(' ', 13) : g.n.indexOf(' ')) + 1)] : [g.n];
    const tip = `${g.n}: quoted ${fm(g.q)}, budget ${fm(g.b)}. Click to ${sel === g.k ? 'show all' : 'filter'}.`;
    return `<g class="q54-bar${dim ? ' dim' : ''}${sel === g.k ? ' on' : ''}" data-act="qBar54" data-v="${esc(g.k)}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="${cx - gw / 2 + 2}" y="${T}" width="${gw - 4}" height="${ih}" class="q54-hit" rx="8"/><rect x="${cx - bw - 3}" y="${y(g.q)}" width="${bw}" height="${T + ih - y(g.q)}" rx="5" fill="${QC54.q}"/><rect x="${cx + 3}" y="${y(g.b)}" width="${bw}" height="${T + ih - y(g.b)}" rx="5" fill="${QC54.b}"/>${lines.map((t, j) => `<text x="${cx}" y="${H - B + 18 + j * 14}" text-anchor="middle" class="q54-xl">${esc(t)}</text>`).join('')}</g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Quoted and budget by ${by === 'sc' ? 'scheme' : 'measure'}">${grid}${bars}</svg>`; }
function qDonut54(){ const ps = qF54('st'), val = S.f.qdv === 'val', f = p => val ? pMoney(p).q : 1, ok = sum(ps.filter(p => p.quoteOk), f), wt = sum(ps.filter(p => !p.quoteOk), f), tot = ok + wt;
  if(!tot) return empty('No quotes with these filters.');
  const r = 64, C = 2 * Math.PI * r, segs = [['ok', 'Approved', ok, QC54.ok], ['wait', 'Waiting for the client', wt, QC54.wait]].filter(s => s[2] > 0); let off = 0;
  const arcs = segs.map(([k, n, v, c]) => { const len = v / tot * C, gap = segs.length > 1 ? 2.5 : 0, tip = `${n}: ${val ? fm(v) : plural(v, 'property', 'properties')}, ${pc(v / tot * 100)}. Click to ${S.f.qst === k ? 'show all' : 'filter'}.`, a = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${c}" stroke-width="${S.f.qst === k ? 32 : 26}" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)" class="q54-seg${S.f.qst && S.f.qst !== 'nofile' && S.f.qst !== k ? ' dim' : ''}" data-act="qSt54" data-v="${k}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"/>`; off += len; return a; }).join('');
  return `<div class="q54-dn"><svg viewBox="0 0 180 180" class="q54-dsvg">${arcs}<text x="90" y="88" text-anchor="middle" class="q54-big">${pc(ok / tot * 100)}</text><text x="90" y="108" text-anchor="middle" class="q54-sm">approved</text></svg><div class="q54-lg">${[['ok', 'Approved', ok, QC54.ok], ['wait', 'Waiting', wt, QC54.wait]].map(([k, n, v, c]) => `<button type="button" class="q54-li${S.f.qst === k ? ' on' : ''}" data-act="qSt54" data-v="${k}"><span style="background:${c}"></span><b>${n}</b><em>${val ? kfm54(v) : v}</em></button>`).join('')}</div></div>`; }
function qRow54(p){ const m = pMoney(p), f = p.qf;
  const fb = f ? `<button type="button" class="q54-fb has" data-act="qfView54" data-v="${p.id}" title="View the quote file: ${esc(f.name)}" aria-label="View the quote file for ${esc(p.ad)}">${ico('file', 16)}<span>View</span></button>`
    : `<label class="q54-fb" data-act="qfLab54" title="Add the quote file (PDF or image)">${ico('upload', 15)}<span>Add file</span><input type="file" accept="application/pdf,.pdf,image/*" data-in="qf54" data-k="${p.id}" aria-label="Add the quote file for ${esc(p.ad)}"></label>`;
  return `<div class="q54-row" data-act="prQuo3" data-v="${p.id}" tabindex="0"><div class="q54-p"><b>${esc(p.ad)}</b><small>${esc(scOf(p.sc).n)}</small></div><div class="q54-ms">${p.ms.map(x => `<span>${MEAS[x.m].s}</span>`).join('')}</div><div class="q54-v"><b>${fm(m.q)}</b><small>budget ${fm(m.b)}</small></div><div class="q54-st">${p.quoteOk ? pill('tg', 'Approved') : pill('tk', 'Waiting')}</div><div class="q54-f">${fb}</div></div>`; }
quoPage3 = function(){ const tb = qF54('st'), ps = qF54().filter(qQ63), q = sum(tb, p => pMoney(p).q), b = sum(tb, p => pMoney(p).b), ok = tb.filter(p => p.quoteOk), wt = tb.filter(p => !p.quoteOk), fl = tb.filter(p => p.qf).length;
  const tile = (k, cls, ic, v, n, s) => stat({k1:'tk', k2:'tg', k3:'ta', k4:'tb'}[cls], n, v, s, 'qSt54', k, S.f.qst === k && k !== '');
  const chips = [S.f.qsc && ['qBar54sc', S.f.qsc, scOf(S.f.qsc).n], S.f.qm && ['qBar54m', S.f.qm, MEAS[S.f.qm].n], S.f.qst && ['qSt54', S.f.qst, {ok:'Approved', wait:'Waiting for the client', nofile:'No quote file'}[S.f.qst]]].filter(Boolean);
  return oph('Quotes and budgets', 'One quote per property, from the scheme’s rates.')
    + `<div class="cstats q54-ks">${tile('', 'k1', 'money', kfm54(q), 'Quoted', `budget ${kfm54(b)}`)}${tile('ok', 'k2', 'check', kfm54(sum(ok, p => pMoney(p).q)), 'Approved', plural(ok.length, 'property', 'properties'))}${tile('wait', 'k3', 'clock', kfm54(sum(wt, p => pMoney(p).q)), 'Waiting', plural(wt.length, 'property', 'properties'))}${tile('nofile', 'k4', 'file', `${fl}/${tb.length}`, 'Quote files', 'click to see the missing ones')}</div>`
    + `<div class="q54-cs"><section class="rsec q54-c"><div class="q54-ch"><h3>Quoted and budget</h3><div class="q54-tg">${[['sc', 'Scheme'], ['m', 'Measure']].map(([k, n]) => `<button type="button" data-act="qBy54" data-v="${k}" aria-pressed="${S.f.qby === k}">${n}</button>`).join('')}</div></div><div class="q54-leg"><span><i style="background:${QC54.q}"></i>Quoted</span><span><i style="background:${QC54.b}"></i>Budget</span></div>${qBars54()}</section>`
    + `<section class="rsec q54-c"><div class="q54-ch"><h3>Client approval</h3><div class="q54-tg">${[['val', '£'], ['cnt', '#']].map(([k, n]) => `<button type="button" data-act="qDv54" data-v="${k}" aria-pressed="${S.f.qdv === k}" aria-label="${k === 'val' ? 'By value' : 'By number of properties'}">${n}</button>`).join('')}</div></div>${qDonut54()}</section></div>`
    + qBar63() + `<section class="rsec q54-list"><div class="q54-ch"><h3>Quotes <span class="q54-cnt">${ps.length}</span></h3></div>${ps.length ? ps.map(qRow54).join('') : empty('No quotes match these filters.')}</section>`; };
VIEWS.com.pages.quo = quoPage3;
A.qBar54 = el => { const k = S.f.qby === 'sc' ? 'qsc' : 'qm'; S.f[k] = S.f[k] === el.dataset.v ? '' : el.dataset.v; render(); };
A.qBar54sc = () => { S.f.qsc = ''; render(); };
A.qBar54m = () => { S.f.qm = ''; render(); };
A.qSt54 = el => { S.f.qst = S.f.qst === el.dataset.v ? '' : el.dataset.v; render(); };
A.qBy54 = el => { S.f.qby = el.dataset.v; render(); };
A.qDv54 = el => { S.f.qdv = el.dataset.v; render(); };
A.qClr54 = () => { S.f.qsc = ''; S.f.qm = ''; S.f.qst = ''; render(); };
/* The quote file: upload a PDF or an image, then view it */
IN.qf54 = t => { const f = t.files && t.files[0], p = prOf(t.dataset.k); if(!f || !p) return;
  if(f.size > 8 * 1024 * 1024){ toast('That file is over 8 MB. Use a smaller PDF or image.'); return; }
  const r = new FileReader(); r.onload = () => { const old = p.qf; p.qf = {name:f.name, type:f.type || (/\.pdf$/i.test(f.name) ? 'application/pdf' : ''), size:f.size, url:r.result, by:ME(), on:TODAY};
    his(p, `Quote file ${old ? 'replaced' : 'added'}: ${f.name}`, ME()); if(S.modal && S.modal.k === 'qf54'){ S.modal = {k:'qf54', pr:p.id}; renderLayer(); setTimeout(qfDraw54, 30); } render(); toast(`Quote file ${old ? 'replaced' : 'added'}.`); }; r.readAsDataURL(f); };
A.qfView54 = el => { S.modal = {k:'qf54', pr:el.dataset.v}; renderLayer(); setTimeout(qfDraw54, 30); };
A.qfDel54 = () => { const p = prOf(S.modal.pr); his(p, `Quote file removed: ${p.qf.name}`, ME()); p.qf = null; S.modal = null; renderLayer(); render(); toast('Quote file removed.'); };
MODALS.qf54 = m => { const p = prOf(m.pr), f = p.qf; if(!f) return '';
  const img = /^image\//.test(f.type), pdf = /pdf/.test(f.type);
  return modal(`Quote, ${esc(p.ad)}`, `${esc(f.name)}, ${f.size < 1048576 ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : (f.size / 1048576).toFixed(1) + ' MB'}. Added by ${PEO[f.by].n}, ${fmtDy(f.on)}.`,
    img ? `<div class="q54-view"><img src="${f.url}" alt="Quote for ${esc(p.ad)}"></div>` : pdf ? `<div class="q54-view" id="qv54"><p class="hint">Opening the PDF...</p></div>` : `<div class="q54-view"><p class="hint">There is no preview for this type of file.</p></div>`,
    `<button class="btn sec lg" data-act="qfDel54">Remove</button><label class="btn sec lg q54-rep" data-act="qfLab54">${ico('upload', 15)}Replace<input type="file" accept="application/pdf,.pdf,image/*" data-in="qf54" data-k="${p.id}"></label><button class="btn pri lg" data-act="mclose">Close</button>`, 860); };
let PDFJS54 = null;
const loadPdf54 = () => PDFJS54 || (PDFJS54 = Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.js?url')]).then(([L, w]) => { L.GlobalWorkerOptions.workerSrc = w.default; return L; }).catch(e => { PDFJS54 = null; throw e; }));
async function qfDraw54(){ const box = document.getElementById('qv54'); if(!box || !S.modal || S.modal.k !== 'qf54') return; const f = prOf(S.modal.pr).qf; if(!f) return;
  try { const L = await loadPdf54(), bin = atob(f.url.split(',')[1]), u8 = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const doc = await L.getDocument({data:u8, isEvalSupported:false}).promise; if(!document.body.contains(box)) return; box.innerHTML = '';
    const w = Math.max(280, box.clientWidth - 2), dpr = window.devicePixelRatio || 1;
    for(let i = 1; i <= Math.min(doc.numPages, 12); i++){ const pg = await doc.getPage(i), v0 = pg.getViewport({scale:1}), vp = pg.getViewport({scale:w / v0.width * dpr}), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; c.style.width = w + 'px'; c.setAttribute('aria-label', `Page ${i}`); box.appendChild(c); await pg.render({canvasContext:c.getContext('2d'), viewport:vp}).promise; }
    if(doc.numPages > 12) box.insertAdjacentHTML('beforeend', `<p class="hint">Showing the first 12 of ${doc.numPages} pages.</p>`);
  } catch(e){ if(document.body.contains(box)) box.innerHTML = `<p class="hint">The preview could not open this PDF here. The file is saved on the property.</p>`; } }
/* Tooltips on the charts */
{ let tip = null; const tipEl = () => tip || (tip = Object.assign(document.body.appendChild(document.createElement('div')), {id:'tip54'}));
  document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('[data-tip]'); const d = tipEl(); if(!t){ d.classList.remove('on'); return; } d.textContent = t.dataset.tip; d.classList.add('on'); });
  document.addEventListener('mousemove', e => { const d = tip; if(!d || !d.classList.contains('on')) return; d.style.left = Math.max(8, Math.min(innerWidth - d.offsetWidth - 8, e.clientX + 14)) + 'px'; d.style.top = Math.min(innerHeight - d.offsetHeight - 8, e.clientY + 16) + 'px'; });
  document.addEventListener('keydown', e => { const t = e.target; if(e.key === 'Enter' && t && t.matches && t.matches('[data-tip][data-act]')){ e.preventDefault(); t.dispatchEvent(new MouseEvent('click', {bubbles:true})); } }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.3') v.url = 'https://claude.ai/artifact/Kumc6Csu5nN1U1Av9ioPBL'; } });
VERSIONS.push({v:'v5.4', date:TODAY, major:false, current:true, url:null, title:'Quotes and budgets as a dashboard, with the quote file', sum:'Quotes and budgets shows four figures, a quoted and budget chart by scheme or measure and a client approval chart; clicking any of them filters the list. Each property can carry its quote file, a PDF or an image, and it opens in the app.', steps:[]});


/* =================== v5.5: Ready to install as a filterable table, with the quote file and a menu per property =================== */
S.f.rq = ''; S.f.rsc = ''; S.f.rst = ''; S.f.ri = ''; S.f.rk = null;
const RSC55 = [['#E0E7FF', '#3730A3'], ['#EDE9FE', '#5B21B6'], ['#DCFCE7', '#166534'], ['#FCE7F3', '#9D174D'], ['#CFFAFE', '#155E75'], ['#FEF3C7', '#92400E']];
const scPill55 = id => { const i = Math.max(0, DB.sc.findIndex(s => s.id === id)), [bg, fg] = RSC55[i % RSC55.length]; return `<span class="rd55-sc" style="background:${bg};color:${fg}">${esc(scOf(id).n)}</span>`; };
const CHK55 = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#16A34A"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ST55 = {'Done':['ok', CHK55], 'Requested':['rq', ico('send', 13, 2.2)], 'Booked':['bk', ico('cal', 13, 2.2)], 'Approved':['ap', ico('check', 13, 2.6)], 'Delivered':['ap', ico('truck', 13, 2.2)], 'Not booked':['nb', ''], 'Not needed':['na', ico('lock', 12, 2.2)]};
const rdV55 = (p, k, closed) => p.dna[k] ? 'Not needed' : closed ? 'Done' : (p.d[k] || 'Not booked');
const rdPill55 = (p, k, closed) => { const v = rdV55(p, k, closed), [c, ic] = ST55[v] || ['bk', ''], l = dLast(p, k), d = l ? fmtDy(l.on).replace(/, \d{4}$/, '') : '';
  if(k === 'date' && (v === 'Done' || v === 'Booked') && d) return `<span class="rd55-dt" title="Install date ${v === 'Done' ? 'agreed' : 'booked'}, ${esc(fmtDy(l.on))}">${ico('cal', 15, 2)}${d}</span>`;
  return `<span class="rd55-p ${c}" title="${esc(v)}${d ? `, ${esc(fmtDy(l.on))}` : ''}">${ic}${v}</span>`; };
const rdItems55 = () => S.f.ri ? DITEMS.filter(([k]) => k === S.f.ri) : DITEMS;
function rdRows55(xs, closed){ const q = norm(S.f.rq), st = S.f.rst, ks = rdItems55().map(([k]) => k);
  return xs.filter(p => (!S.f.rsc || p.sc === S.f.rsc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))
    && (!st || (st === 'ready' ? (closed || ready(p)) : st === 'notready' ? (!closed && !ready(p)) : ks.some(k => rdV55(p, k, closed) === st)))); }
const isCl56 = p => !!DB.dcl[p.id] && p.ph !== 'D. Prepare to install';
const rdyOn56 = p => DB.drd[p.id] || (isCl56(p) ? null : (ready(p) ? TODAY : null));
function rdRows56(xs){ const q = norm(S.f.rq), st = S.f.rst, ks = rdItems55().map(([k]) => k);
  return xs.filter(p => { const cl = isCl56(p); return (!S.f.rsc || p.sc === S.f.rsc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))
    && (!st || (st === 'ready' ? !!rdyOn56(p) : st === 'notready' ? !rdyOn56(p) : st === 'closed' ? cl : ks.some(k => rdV55(p, k, cl) === st))); }); }
const kebab56 = (p, items) => `<td class="rd55-k"><button type="button" class="rd55-kb" data-act="rdK55" data-v="${p.id}" aria-label="More for ${esc(p.ad)}" aria-expanded="${S.f.rk === p.id}">${ico('dots', 18)}</button>${S.f.rk === p.id ? `<div class="rd55-menu" role="menu">${items.map(([a, ic, t]) => `<button type="button" role="menuitem" data-act="${a}" data-v="${p.id}">${ico(ic, 15)}${t}</button>`).join('')}</div>` : ''}</td>`;
const quoteCell56 = p => `<td>${p.qf ? `<button type="button" class="rd55-q has" data-act="qfView54" data-v="${p.id}" aria-label="View the quote for ${esc(p.ad)}">${ico('eye', 16, 2)}View</button>` : `<label class="rd55-q" data-act="qfLab54" title="Add the quote file (PDF or image)">${ico('clip', 15, 2)}Add file<input type="file" accept="application/pdf,.pdf,image/*" data-in="qf54" data-k="${p.id}" aria-label="Add the quote file for ${esc(p.ad)}"></label>`}</td>`;
const sel56 = (k, all, opts) => `<label class="rd55-sel"><span class="sr">${all}</span><select data-in="rd55" data-k="${k}" aria-label="${all}"><option value="">${all}</option>${opts}</select>${ico('chev', 14, 2.2)}</label>`;
const bar56 = (scs, stOpts, itOpts, itAll) => { const any = S.f.rq || S.f.rsc || S.f.rst || S.f.ri; return `<div class="rd55-bar"><label class="rd55-s">${ico('search', 16)}<input data-in="rq55" value="${esc(S.f.rq)}" placeholder="Search property" aria-label="Search property"></label>${sel56('rsc', 'All schemes', scs.map(id => `<option value="${id}"${S.f.rsc === id ? ' selected' : ''}>${esc(scOf(id).n)}</option>`).join(''))}${sel56('rst', 'All statuses', stOpts)}${sel56('ri', itAll, itOpts)}${any ? `<button type="button" class="rd55-clr" data-act="rdClr55">Clear filters${ico('x', 14, 2.4)}</button>` : ''}</div>`; };
const opt56 = v => `<option value="${v[0]}"${S.f.rst === v[0] ? ' selected' : ''}>${v[1]}</option>`;
VIEWS.del.pages.rdy = (...x) => { const seg0 = S.f.rdyS || 'open', open = DB.pr.filter(p => p.ph === 'D. Prepare to install'), done = DB.pr.filter(p => isCl56(p) && p.ph !== 'Cancelled'), base = seg0 === 'all' ? [...open, ...done] : seg0 === 'open' ? open : done, xs = rdRows56(base), its = rdItems55(), ncol = its.length + 4;
  const stOpts = `<optgroup label="Property">${[['ready', 'Ready to install'], ['notready', 'Not ready yet'], ...(seg0 !== 'open' ? [['closed', 'Closed, moved to install']] : [])].map(opt56).join('')}</optgroup><optgroup label="Item">${['Done', 'Delivered', 'Approved', 'Booked', 'Requested', 'Not booked', 'Not needed'].map(v => opt56([v, v])).join('')}</optgroup>`;
  const head = `<tr><th>Property</th><th>Scheme</th>${its.map(([k, n]) => `<th>${esc(k === 'date' ? 'Install date' : n.split(' ').slice(0, 2).join(' '))}</th>`).join('')}<th>Ready</th><th><span class="sr">Timeline</span></th></tr>`;
  const row = p => { const cl = isCl56(p), on = rdyOn56(p), rd = on ? `<span class="rd55-dt" title="Marked ready on ${esc(fmtDy(on))}">${ico('cal', 15, 2)}${fmtDy(on).replace(/, \d{4}$/, '')}</span>` : `<span class="rd55-dash" title="Not ready yet">–</span>`;
    return `<tr class="${S.f.rdyTl === p.id ? 'tl-open' : ''}"><td class="rd55-pr"><button class="rd55-pn" data-act="prIns" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.pc || '')}${seg0 === 'all' && cl ? ' · moved to install' : ''}</small></td><td>${scPill55(p.sc)}</td>${its.map(([k]) => `<td>${rdPill55(p, k, cl)}</td>`).join('')}<td class="rd55-rd">${rd}</td><td class="rd56-tlc"><button type="button" class="rd56-tlb${S.f.rdyTl === p.id ? ' on' : ''}" data-act="rdyTl" data-v="${p.id}" aria-expanded="${S.f.rdyTl === p.id}" aria-label="${S.f.rdyTl === p.id ? 'Hide the timeline' : 'Show the timeline'} of ${esc(p.ad)}">${ico('clock', 15, 2)}${S.f.rdyTl === p.id ? 'Hide timeline' : 'Timeline'}</button></td></tr>${S.f.rdyTl === p.id ? `<tr class="tl-row"><td colspan="${ncol}">${rdyTimeline(p).replace('<div class="tl">', '<div class="tl rd55-tl">')}</td></tr>` : ''}`; };
  return trBar() + oph('Ready to install', 'Every phase D item per property. Ready sets itself when everything that applies is done.') + visNote()
    + `<div class="rf-bar">${seg('rdySeg', seg0, [['all', 'All', open.length + done.length], ['open', 'In phase D', open.length], ['closed', 'Closed, moved to install', done.length]])}</div>`
    + `${bar57rd('rdy', base)}<section class="rd55"><div class="rd55-w"><table class="rd55-t"><thead>${head}</thead><tbody>${xs.map(row).join('') || `<tr><td colspan="${ncol}">${empty(base.length ? 'No properties match these filters.' : 'No properties here yet.')}</td></tr>`}</tbody></table></div></section>`; };

/* Redbridge tracker, in the same design */
const GS56 = {'Complete':['ok', CHK55], 'In progress':['ap', ico('trend', 13, 2.2)], 'Waiting on decision':['bk', ico('alert', 13, 2.2)], 'Blocked':['bl', ico('alert', 13, 2.2)], 'Not started':['nb', ''], 'Not applicable':['na', ico('lock', 12, 2.2)]};
const gPill56 = (p, k) => { const v = p.g[k] || 'Not started', [c, ic] = GS56[v] || ['nb', ''], l = v === 'Not applicable' ? 'Not needed' : v === 'In progress' ? `${(p.gp || {})[k] || 50}%` : v === 'Waiting on decision' ? 'Waiting' : v;
  return `<span class="rd55-p ${c}" title="${esc(RGROUPS.find(g => g[0] === k)[1])}: ${esc(v === 'Not applicable' ? 'Not needed on this job' : v)}">${ic}${l}</span>`; };
VIEWS.del.pages.hold = (...x) => { const all = DB.pr.filter(p => tyOf(p) === 'Redbridge' && OPENP.includes(p.ph)), q = norm(S.f.rq), st = S.f.rst, gs = S.f.ri ? RGROUPS.filter(g => g[0] === S.f.ri) : RGROUPS, ks = gs.map(g => g[0]), ncol = gs.length + 3;
  const xs = holdRows57(all);
  const stOpts = `<optgroup label="Property">${opt56(['hold', 'Hold point open'])}</optgroup><optgroup label="Group">${[['Complete', 'Complete'], ['In progress', 'In progress'], ['Waiting on decision', 'Waiting on decision'], ['Blocked', 'Blocked'], ['Not started', 'Not started'], ['Not applicable', 'Not needed']].map(opt56).join('')}</optgroup>`;
  const head = `<tr><th>Property</th><th>House</th>${gs.map(([k, n, , h]) => `<th>${esc(n)}${h ? '<em class="rd56-h">hold</em>' : ''}</th>`).join('')}<th>Overall</th></tr>`;
  const row = p => { const pct = grpPct(p), ho = holdOpen(p) && (p.hold || p.hold2);
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="prIns" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.pc || '')}</small>${ho ? `<span class="rd56-ho" title="${esc(p.hold || p.hold2)}">${ico('alert', 12, 2.4)}Hold point</span>` : ''}</td><td><span class="rd55-sc" style="background:#EDE9FE;color:#5B21B6">${esc(p.ht || '')}</span></td>${gs.map(([k]) => `<td>${gPill56(p, k)}</td>`).join('')}<td class="rd56-ov"><b>${pct}%</b><span class="rd56-bar"><i style="width:${pct}%"></i></span></td></tr>`; };
  return trBar() + oph('Redbridge tracker', 'Each install group per property. Overall leaves out groups not needed.') + visNote()
    + `<div class="cstats">${stat('tb', 'Properties', all.length)}${stat('tg', 'Average complete', pc(all.length ? sum(all, grpPct) / all.length : 0))}${stat('tred', 'Hold points open', all.filter(p => holdOpen(p) && (p.hold || p.hold2)).length)}</div>`
    + `${bar57rd('hold', all)}<section class="rd55"><div class="rd55-w"><table class="rd55-t rd56-t"><thead>${head}</thead><tbody>${xs.map(row).join('') || `<tr><td colspan="${ncol}">${empty(all.length ? 'No properties match these filters.' : 'No Redbridge properties open.')}</td></tr>`}</tbody></table></div></section>`; };
/* Filters are kept per page */
{ const KEEP56 = {}; const oR = render; let last = null; render = (...x) => { const pg = S.view + ':' + ((S.uni5 || '') + (S.page && S.page[S.view] || '')); if(last && pg !== last){ KEEP56[last] = {rq:S.f.rq, rsc:S.f.rsc, rst:S.f.rst, ri:S.f.ri}; Object.assign(S.f, KEEP56[pg] || {rq:'', rsc:'', rst:'', ri:''}); S.f.rk = null; } last = pg; return oR(...x); }; }
IN.rq55 = t => { S.f.rq = t.value; refocus(render); };
IN.rd55 = t => { S.f[t.dataset.k] = t.value; render(); };
A.rdClr55 = () => { S.f.rq = ''; S.f.rsc = ''; S.f.rst = ''; S.f.ri = ''; render(); };
A.rdK55 = el => { S.f.rk = S.f.rk === el.dataset.v ? null : el.dataset.v; render(); };
{ const oTl = A.rdyTl; A.rdyTl = el => { S.f.rk = null; oTl(el); }; const oSeg = A.rdySeg; A.rdySeg = el => { S.f.rk = null; S.f.rst = ''; oSeg(el); }; }
document.addEventListener('click', e => { if(S.f.rk && e.target.closest && !e.target.closest('.rd55-k')){ S.f.rk = null; if(!e.target.closest('[data-act]')) render(); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.rk){ S.f.rk = null; render(); } });
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.4') v.url = 'https://claude.ai/artifact/WA3eD8rYWv8D9hXxqGJ24g'; } });
VERSIONS.push({v:'v5.5', date:TODAY, major:false, current:false, url:'https://claude.ai/artifact/8Lh9N2CmtRVwH7PXuWJyFA', title:'Ready to install: search, filters, quote file and a menu per property', sum:'Ready to install has a search bar and filters by scheme, status and item, status labels with icons, the install date, the quote file and a menu with Timeline and Open property.', steps:[]});
VERSIONS.push({v:'v5.6', date:TODAY, major:false, current:true, url:null, title:'Ready to install and Redbridge tracker: search and filters in one design', sum:'Ready to install and the Redbridge tracker share one design: search, filters by scheme, status and item or group, status labels with icons, and the property opens from its name. Ready to install has a Timeline button per property, adds All beside In phase D, and Ready shows the date the property was marked ready.', steps:[]});


/* =================== v5.8: one search bar for the whole app, with the filters inside it, like Properties =================== */
S.f.fo57 = null; S.f.fo57a = false; S.f.oct = ''; S.f.supct = '';
const re57 = () => { const m = $('#main'), y = m ? m.scrollTop : 0; render(); if(m) m.scrollTop = y; };
function fbar57({id, qk, qv, ph, cols, nf, clr, chips = [], count = ''}){ const open = S.f.fo57 === id;
  const panel = `<div class="v5-fp${S.f.fo57a ? '' : ' v5-noanim'}" role="dialog" aria-label="Filters"><div class="v5-fph"><b>Filter by</b><button class="v5-fclr" data-act="${clr}" ${nf ? '' : 'disabled'}>Clear all</button></div><div class="v5-fcols">${cols.map(c => `<div class="v5-fc"><small>${c.t}</small>${c.opts.map(o => `<button class="v5-fo${o.on ? ' on' : ''}" data-act="${o.a}" data-v="${esc(o.v)}" aria-pressed="${!!o.on}"><span>${esc(o.n)}</span><small>${o.c == null ? '' : o.c}</small></button>`).join('')}</div>`).join('')}</div></div>`;
  return `<div class="v5-fs" data-fs="${id}"><div class="v5-fsb${open ? ' open' : ''}">${ico('search', 18)}<input type="search" data-in="${qk}"${qk === 'f' ? ` data-k="${qv[0]}"` : ''} placeholder="${esc(ph)}" value="${esc(qk === 'f' ? (S.f[qv[0]] || '') : qv)}" aria-label="${esc(ph)}"><button class="v5-fbtn${nf ? ' on' : ''}" data-act="fo57" data-v="${id}" title="Filters" aria-label="Filters" aria-expanded="${open}">${ico('filter', 17)}${nf ? `<em>${nf}</em>` : ''}</button></div>${open ? panel : ''}</div>`
    + `<div class="v5-fchips">${chips.length ? chips.map(([a, v, l]) => `<button class="v5-fchip" data-act="${a}" data-v="${esc(v)}" title="Remove this filter">${esc(l)}${ico('x', 12)}</button>`).join('') + `<button class="v5-fclr" data-act="${clr}">Clear all</button>` : ''}${count ? `<span class="v5-fn">${count}</span>` : ''}</div>`; }
A.fo57 = el => { const id = el.dataset.v; S.f.fo57 = S.f.fo57 === id ? null : id; S.f.fo57a = !!S.f.fo57; re57(); S.f.fo57a = false; };
document.addEventListener('click', e => { if(S.f.fo57 && e.target.closest && !e.target.closest('.v5-fs')){ S.f.fo57 = null; setTimeout(() => { if([...document.querySelectorAll('.v5-fp')].some(x => x.offsetParent && !x.closest('.v5-fs').querySelector('[data-act=prFo]'))) re57(); }, 0); } }, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && S.f.fo57){ S.f.fo57 = null; re57(); } });
const swap57 = (patch, fn) => { const keep = {}; Object.keys(patch).forEach(k => { keep[k] = S.f[k]; S.f[k] = patch[k]; }); try { return fn(); } finally { Object.assign(S.f, keep); } };

/* Margins */
mBar53 = function(){ const n = S.f.msc.length + S.f.mph.length, scs = [...new Set(mAll53().map(p => p.sc))], c = patch => swap57(patch, () => mProps53().length);
  return fbar57({id:'mrg', qk:'mq53', qv:S.f.mq, ph:'Search a property, postcode or scheme', nf:n, clr:'mf53Clr', count:plural(mProps53().length, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'mf53ScAll', v:'', n:'All schemes', c:c({msc:[]}), on:!S.f.msc.length}, ...scs.map(id => ({a:'mf53Sc', v:id, n:scOf(id).n, c:c({msc:[id]}), on:S.f.msc.includes(id)}))]},
      {t:'Status', opts:MPH53.map(ph => ({a:'mf53Ph', v:ph, n:ph, c:c({mph:[ph]}), on:S.f.mph.includes(ph)}))}],
    chips:[...S.f.msc.map(id => ['mf53Sc', id, scOf(id).n]), ...S.f.mph.map(ph => ['mf53Ph', ph, ph])]}); };
A.mf53ScAll = () => { S.f.msc = []; re57(); };
{ const a = A.mf53Sc, b = A.mf53Ph, cl = A.mf53Clr; A.mf53Sc = el => { const v = el.dataset.v; S.f.msc = S.f.msc.includes(v) ? S.f.msc.filter(x => x !== v) : [...S.f.msc, v]; re57(); }; A.mf53Ph = el => { const v = el.dataset.v; S.f.mph = S.f.mph.includes(v) ? S.f.mph.filter(x => x !== v) : [...S.f.mph, v]; re57(); }; A.mf53Clr = () => { S.f.msc = []; S.f.mph = []; re57(); }; }

/* Ready to install and Redbridge tracker */
function holdRows57(all){ const q = norm(S.f.rq), st = S.f.rst, ks = (S.f.ri ? RGROUPS.filter(g => g[0] === S.f.ri) : RGROUPS).map(g => g[0]);
  return all.filter(p => (!S.f.rsc || p.sc === S.f.rsc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${p.ht}`).includes(q)) && (!st || (st === 'hold' ? !!(holdOpen(p) && (p.hold || p.hold2)) : ks.some(k => (p.g[k] || 'Not started') === st)))); }
function bar57rd(kind, base){ const rows = () => kind === 'rdy' ? rdRows56(base) : holdRows57(base), c = patch => swap57(patch, () => rows().length), seg0 = S.f.rdyS || 'open';
  const sts = kind === 'rdy' ? [['ready', 'Ready to install'], ['notready', 'Not ready yet'], ...(seg0 !== 'open' ? [['closed', 'Closed, moved to install']] : []), ...['Done', 'Delivered', 'Approved', 'Booked', 'Requested', 'Not booked', 'Not needed'].map(v => [v, v])]
    : [['hold', 'Hold point open'], ['Complete', 'Complete'], ['In progress', 'In progress'], ['Waiting on decision', 'Waiting on decision'], ['Blocked', 'Blocked'], ['Not started', 'Not started'], ['Not applicable', 'Not needed']];
  const its = kind === 'rdy' ? DITEMS.map(([k, n]) => [k, n]) : RGROUPS.map(([k, n]) => [k, n]), stN = v => (sts.find(s => s[0] === v) || ['', v])[1], itN = v => (its.find(s => s[0] === v) || ['', v])[1];
  const nf = (S.f.rsc ? 1 : 0) + (S.f.rst ? 1 : 0) + (S.f.ri ? 1 : 0), cnt = rows().length;
  return fbar57({id:kind, qk:'rq55', qv:S.f.rq, ph:'Search a property, postcode or ID', nf, clr:'rdClr57', count:plural(cnt, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'rd57Sc', v:'', n:'All schemes', c:c({rsc:''}), on:!S.f.rsc}, ...[...new Set(base.map(p => p.sc))].map(id => ({a:'rd57Sc', v:id, n:scOf(id).n, c:c({rsc:id}), on:S.f.rsc === id}))]},
      {t:'Status', opts:[{a:'rd57St', v:'', n:'All statuses', c:c({rst:''}), on:!S.f.rst}, ...sts.map(([k, n]) => ({a:'rd57St', v:k, n, c:c({rst:k}), on:S.f.rst === k}))]},
      {t:kind === 'rdy' ? 'Item' : 'Group', opts:[{a:'rd57It', v:'', n:kind === 'rdy' ? 'All items' : 'All groups', c:null, on:!S.f.ri}, ...its.map(([k, n]) => ({a:'rd57It', v:k, n, c:null, on:S.f.ri === k}))]}],
    chips:[...(S.f.rsc ? [['rd57Sc', '', scOf(S.f.rsc).n]] : []), ...(S.f.rst ? [['rd57St', '', stN(S.f.rst)]] : []), ...(S.f.ri ? [['rd57It', '', itN(S.f.ri)]] : [])]}); }
A.rd57Sc = el => { S.f.rsc = el.dataset.v; re57(); };
A.rd57St = el => { S.f.rst = el.dataset.v; re57(); };
A.rd57It = el => { S.f.ri = el.dataset.v; re57(); };
A.rdClr57 = () => { S.f.rq = ''; S.f.rsc = ''; S.f.rst = ''; S.f.ri = ''; re57(); };

/* Orders */
function ordBar57(st){ const q = norm(S.f.oq), base = DB.or.filter(o => !q || norm(o.id + ' ' + o.sup + ' ' + (o.al || []).map(a => prOf(a.pr).ad).join(' ')).includes(q)), inS = (o, s) => s === 'all' || (s === 'open' ? o.st !== 'Invoiced' && o.st !== 'Rejected' : o.st === s), cts = [...new Set(DB.or.map(o => o.ct).filter(Boolean))];
  const nf = (st !== 'all' ? 1 : 0) + (S.f.oct ? 1 : 0), stL = {all:'All', open:'Open'};
  return fbar57({id:'ord', qk:'f', qv:['oq'], ph:'Search a supplier, property or order', nf, clr:'ord57Clr', count:plural(base.filter(o => inS(o, st) && (!S.f.oct || o.ct === S.f.oct)).length, 'order', 'orders'),
    cols:[{t:'Status', opts:[['all', 'All'], ['open', 'Open'], ...OST.map(s => [s, s])].map(([k, n]) => ({a:'ost', v:k, n, c:base.filter(o => inS(o, k) && (!S.f.oct || o.ct === S.f.oct)).length, on:st === k}))},
      {t:'Cost type', opts:[{a:'oct57', v:'', n:'All cost types', c:base.filter(o => inS(o, st)).length, on:!S.f.oct}, ...cts.map(t => ({a:'oct57', v:t, n:t, c:base.filter(o => inS(o, st) && o.ct === t).length, on:S.f.oct === t}))]}],
    chips:[...(st !== 'all' ? [['ost', 'all', stL[st] || st]] : []), ...(S.f.oct ? [['oct57', '', S.f.oct]] : [])]}); }
A.ost = el => { S.f.ost = el.dataset.v; re57(); };
A.oct57 = el => { S.f.oct = el.dataset.v; re57(); };
A.ord57Clr = () => { S.f.ost = 'all'; S.f.oct = ''; re57(); };

/* Suppliers */
function supBar57(rs, xs){ const cts = [...new Set(rs.map(r => r.ct).filter(Boolean))], q = norm(S.f.supq), byQ = rs.filter(r => !q || norm(r.n + ' ' + r.ct + ' ' + (r.x.email || '')).includes(q));
  return fbar57({id:'sup', qk:'f', qv:['supq'], ph:'Search a supplier, cost type or email', nf:S.f.supct ? 1 : 0, clr:'sup57Clr', count:plural(xs.length, 'supplier', 'suppliers'),
    cols:[{t:'Cost type', opts:[{a:'sup57Ct', v:'', n:'All cost types', c:byQ.length, on:!S.f.supct}, ...cts.map(t => ({a:'sup57Ct', v:t, n:t, c:byQ.filter(r => r.ct === t).length, on:S.f.supct === t}))]}],
    chips:S.f.supct ? [['sup57Ct', '', S.f.supct]] : []}); }
A.sup57Ct = el => { S.f.supct = el.dataset.v; re57(); };
A.sup57Clr = () => { S.f.supct = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.6') v.url = 'https://claude.ai/artifact/SHmgcL3qhAvC1vzqmr3nkd'; } });
VERSIONS.push({v:'v5.7', date:TODAY, major:false, current:true, url:null, title:'One design for every row of key figures', sum:'Every row of key figures in the app uses the Overview design: the first figure in Delft blue, soft accent shapes, and the same tones.', steps:[]});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.7') v.url = 'https://claude.ai/artifact/PcUvzCWoXcWKtC7hTBHY1f'; } });
VERSIONS.push({v:'v5.8', date:TODAY, major:false, current:true, url:null, title:'One search bar for the whole app', sum:'Every list searches the same way as Properties: one bar with the filter button inside it, a Filter by panel with counts, chips for what is applied and Clear all. Margins, Ready to install, the Redbridge tracker, Orders and Suppliers use it.', steps:[]});

/* =================== v5.9: Margins as a dashboard: key figures, margin by scheme, client approval, insights, one table =================== */
S.f.mms = []; S.f.mby = 'pct';
const mSt59 = p => { const x = pMoney(p), t = scOf(p.sc).set.mg; return x.over ? 'over' : x.mgp < t ? 'below' : 'above'; };
const MST59 = {above:'Above target', below:'Below target', over:'Over budget'};
mProps53 = () => { const q = norm(S.f.mq); return mAll53().filter(p => (!S.f.msc.length || S.f.msc.includes(p.sc)) && (!S.f.mph.length || S.f.mph.includes(p.ph)) && (!S.f.mms.length || S.f.mms.includes(mSt59(p))) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))); };
mBar53 = function(){ const n = S.f.msc.length + S.f.mph.length + S.f.mms.length, scs = [...new Set(mAll53().map(p => p.sc))], c = patch => swap57(patch, () => mProps53().length);
  return fbar57({id:'mrg', qk:'mq53', qv:S.f.mq, ph:'Search a property, postcode or scheme', nf:n, clr:'mf53Clr', count:plural(mProps53().length, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'mf53ScAll', v:'', n:'All schemes', c:c({msc:[]}), on:!S.f.msc.length}, ...scs.map(id => ({a:'mf53Sc', v:id, n:scOf(id).n, c:c({msc:[id]}), on:S.f.msc.includes(id)}))]},
      {t:'Status', opts:MPH53.map(ph => ({a:'mf53Ph', v:ph, n:ph, c:c({mph:[ph]}), on:S.f.mph.includes(ph)}))},
      {t:'Margin', opts:Object.entries(MST59).map(([k, l]) => ({a:'mf59Ms', v:k, n:l, c:c({mms:[k]}), on:S.f.mms.includes(k)}))}],
    chips:[...S.f.msc.map(id => ['mf53Sc', id, scOf(id).n]), ...S.f.mph.map(ph => ['mf53Ph', ph, ph]), ...S.f.mms.map(k => ['mf59Ms', k, MST59[k]])]}); };
A.mf59Ms = el => { const v = el.dataset.v; S.f.mms = S.f.mms.includes(v) ? S.f.mms.filter(x => x !== v) : [...S.f.mms, v]; re57(); };
A.mf59Only = el => { S.f.mms = S.f.mms.length === 1 && S.f.mms[0] === el.dataset.v ? [] : [el.dataset.v]; re57(); setTimeout(() => { const t = document.querySelector('.op:not([hidden]) .m59-tbl, .m59-tbl'); const vis = [...document.querySelectorAll('.m59-tbl')].find(x => x.offsetParent); if(vis) vis.scrollIntoView({behavior:'smooth', block:'start'}); }, 30); };
A.mf59Sc = el => { const v = el.dataset.v; S.f.msc = S.f.msc.length === 1 && S.f.msc[0] === v ? [] : [v]; re57(); };
A.mBy59 = el => { S.f.mby = el.dataset.v; re57(); };
{ const oc = A.mf53Clr; A.mf53Clr = () => { S.f.mms = []; oc(); }; }
function mBars59(){ const ps = swap57({msc:[]}, () => mProps53()), pct = S.f.mby === 'pct', sel = S.f.msc.length === 1 ? S.f.msc[0] : '';
  const gs = [...new Set(ps.map(p => p.sc))].map(id => { const xs = ps.filter(p => p.sc === id), k = mSum53(xs), t = scOf(id).set.mg; return {k:id, n:scOf(id).n, v:pct ? k.mgp : k.mg, t:pct ? t : k.q * t / 100, mgp:k.mgp, tp:t, mg:k.mg, q:k.q}; });
  if(!gs.length) return empty('Nothing to chart with these filters.');
  const W = 680, H = 270, L = 46, B = 44, T = 26, iw = W - L - 10, ih = H - B - T, top = Math.max(...gs.map(g => Math.max(g.v, g.t))) * 1.15 || 1, mx = pct ? Math.max(20, Math.ceil(top / 20) * 20) : top, gw = iw / gs.length, bw = Math.min(46, gw * .38);
  const y = v => T + ih - Math.max(0, v) / mx * ih, lab = v => pct ? Math.round(v) + '%' : kfm54(v);
  const grid = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - 10}" y1="${y(mx * f)}" y2="${y(mx * f)}" class="q54-gl"/><text x="${L - 8}" y="${y(mx * f) + 4}" text-anchor="end" class="q54-ax">${lab(mx * f)}</text>`).join('');
  const bars = gs.map((g, i) => { const cx = L + gw * i + gw / 2, dim = sel && sel !== g.k, ok = g.mgp >= g.tp, tip = `${g.n}: margin ${pc(g.mgp)} (${fm(g.mg)}) on ${fm(g.q)} quoted. Target ${g.tp}%. Click to ${sel === g.k ? 'show all' : 'filter'}.`, nm = g.n.length > 14 && g.n.includes(' ') ? [g.n.slice(0, g.n.lastIndexOf(' ', 14) > 0 ? g.n.lastIndexOf(' ', 14) : g.n.indexOf(' ')), g.n.slice((g.n.lastIndexOf(' ', 14) > 0 ? g.n.lastIndexOf(' ', 14) : g.n.indexOf(' ')) + 1)] : [g.n];
    return `<g class="q54-bar${dim ? ' dim' : ''}${sel === g.k ? ' on' : ''}" data-act="mf59Sc" data-v="${esc(g.k)}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="${cx - gw / 2 + 3}" y="${T - 18}" width="${gw - 6}" height="${ih + 18}" class="q54-hit" rx="10"/><rect x="${cx - bw / 2}" y="${y(g.v)}" width="${bw}" height="${T + ih - y(g.v)}" rx="7" fill="${ok ? '#6366F1' : '#F97316'}"/><text x="${cx}" y="${y(g.v) - 7}" text-anchor="middle" class="m59-bv">${lab(g.v)}</text><line x1="${cx - bw / 2 - 8}" x2="${cx + bw / 2 + 8}" y1="${y(g.t)}" y2="${y(g.t)}" class="m59-tg"/><text x="${cx + bw / 2 + 11}" y="${y(g.t) + 4}" class="m59-tl">${lab(g.t)}</text>${nm.map((t, j) => `<text x="${cx}" y="${H - B + 20 + j * 14}" text-anchor="middle" class="q54-xl">${esc(t)}</text>`).join('')}</g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Margin by scheme against target">${grid}${bars}</svg>`; }
function mAppr59(ps){ const ok = sum(ps.filter(p => p.quoteOk), p => pMoney(p).q), wt = sum(ps.filter(p => !p.quoteOk), p => pMoney(p).q), tot = ok + wt; if(!tot) return empty('No quotes with these filters.');
  const r = 64, C = 2 * Math.PI * r, segs = [['Approved', ok, '#10B981'], ['Awaiting the client', wt, '#F59E0B']].filter(s => s[1] > 0); let off = 0;
  const arcs = segs.map(([n, v, c]) => { const len = v / tot * C, gap = segs.length > 1 ? 2.5 : 0, a = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${c}" stroke-width="26" stroke-dasharray="${Math.max(0, len - gap)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)" class="q54-seg" data-tip="${esc(`${n}: ${fm(v)}, ${pc(v / tot * 100)} of what is quoted`)}"/>`; off += len; return a; }).join('');
  return `<div class="m59-ap"><svg viewBox="0 0 180 180" class="m59-dsvg">${arcs}<text x="90" y="88" text-anchor="middle" class="q54-big">${pc(ok / tot * 100)}</text><text x="90" y="108" text-anchor="middle" class="q54-sm">approved</text></svg><div class="m59-apl">${[['Approved', ok, '#10B981'], ['Awaiting client', wt, '#F59E0B']].map(([n, v, c]) => `<div><span style="background:${c}"></span><b>${n}</b><em>${pc(v / tot * 100)}</em></div>`).join('')}</div></div>`; }
function mIns59(ps){ const n = k => ps.filter(p => mSt59(p) === k).length, avgT = mSum53(ps).t;
  const card = (k, cls, ic, t, s, btn) => `<div class="m59-in ${cls}"><span class="m59-ii">${ico(ic, 18, 2.2)}</span><div><b>${t}</b><p>${s}</p><button type="button" class="m59-ib" data-act="mf59Only" data-v="${k}" aria-pressed="${S.f.mms.length === 1 && S.f.mms[0] === k}">${btn}${ico('chev', 12, 2.4)}</button></div></div>`;
  return card('below', 'am', 'alert', 'Below target', `${plural(n('below'), 'property is', 'properties are')} under ${pc(avgT)}, the weighted target.`, 'Review')
    + card('over', 'rd', 'trend', 'Over budget', `${plural(n('over'), 'property costs', 'properties cost')} more than the budget.`, 'Investigate')
    + card('above', 'gr', 'check', 'Above target', `${plural(n('above'), 'property is', 'properties are')} on or above target.`, 'Healthy'); }
mrgPage = function(){ const ps = mProps53(), m = mSum53(ps), d = Math.round(m.mgp - m.t);
  const k = [stat('tk', 'Total quoted', fm(m.q), plural(ps.length, 'property', 'properties')), stat('tg', 'Total margin', fm(m.mg), `${pc(m.mgp)} overall margin`), stat('ta', 'Forecast cost', fm(m.fc), `budget ${fm(sum(ps, p => pMoney(p).b))}`), stat(d >= 0 ? 'tg' : 'tred', 'vs target', `${d >= 0 ? '+' : ''}${d} pp`, `target ${pc(m.t)}`, 'mf59Only', d >= 0 ? 'above' : 'below')].join('');
  const rows = ps.map(p => { const x = pMoney(p), s = mSt59(p), t = scOf(p.sc).set.mg;
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="prMon" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.ph)}</small></td><td>${scPill55(p.sc)}</td><td class="m59-n">${fm(x.q)}</td><td class="m59-n">${fm(x.fc)}<small>budget ${fm(x.b)}</small></td><td>${mgTag(x.mgp, t)}</td><td><span class="m59-st ${s}"><i></i>${MST59[s]}</span></td><td>${p.qf ? `<button type="button" class="rd55-q has" data-act="qfView54" data-v="${p.id}" aria-label="View the quote for ${esc(p.ad)}">${ico('file', 15, 2)}View</button>` : '<span class="rd55-dash" title="No quote file yet">–</span>'}</td></tr>`; }).join('');
  return oph('Margins', 'Quoted value, forecast cost and margin against each scheme’s target.')
    + `<div class="cstats ov-k m59-k">${k}</div>`
    + `<div class="m59-g"><section class="rsec q54-c m59-c1"><div class="q54-ch"><h3>${ico('chart', 17)}Margin by scheme</h3><div class="q54-tg">${[['pct', '%'], ['gbp', '£']].map(([v, n]) => `<button type="button" data-act="mBy59" data-v="${v}" aria-pressed="${S.f.mby === v}" aria-label="${v === 'pct' ? 'As a percentage' : 'In pounds'}">${n}</button>`).join('')}</div></div><div class="q54-leg"><span><i style="background:#6366F1"></i>On or above target</span><span><i style="background:#F97316"></i>Below target</span><span><i class="m59-dash"></i>Target</span></div>${mBars59()}</section>`
    + `<section class="rsec q54-c m59-c3"><div class="q54-ch"><h3>${ico('spark', 17)}Margin insights</h3></div><div class="m59-ins">${mIns59(ps)}</div></section></div>`
    + mBar53()
    + `<section class="rd55 m59-tbl"><div class="rd55-w"><table class="rd55-t m59-t"><thead><tr><th>Property</th><th>Scheme</th><th>Quoted</th><th>Forecast cost</th><th>Margin</th><th>Status</th><th>Quote file</th></tr></thead><tbody>${rows || `<tr><td colspan="7">${empty('No properties match the search or the filters.')}</td></tr>`}</tbody></table></div></section>`; };
VIEWS.com.pages.mrg = mrgPage;
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.8') v.url = 'https://claude.ai/artifact/RK4qD6ned8mkiEXRsroUhJ'; } });
VERSIONS.push({v:'v5.9', date:TODAY, major:false, current:true, url:null, title:'Margins as a dashboard', sum:'Margins shows four key figures, margin by scheme against each target, client approval, three insights that filter the list, and one table with the quote file to view.', steps:[]});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.9') v.url = 'https://claude.ai/artifact/CYGUyavDFZ1ZNLqdNMoeLf'; } });
VERSIONS.push({v:'v5.10', date:TODAY, major:false, current:true, url:null, title:'Fewer Director reports, Margins without client approval', sum:'Director no longer has Daily summary or Team productivity. Margins keeps margin by scheme and the insights, without the client approval chart.', steps:[]});

/* =================== v5.11: Quality and compliance in Director: accreditations and insurances, audits and the renewals calendar in one dashboard =================== */
DB.qc = [
  {id:'QC1', n:'MCS certification', ty:'Accreditation', by:'MCS', no:'NAP-58213', d:25},
  {id:'QC2', n:'TrustMark registration', ty:'Accreditation', by:'TrustMark', no:'TM-1180473', d:60},
  {id:'QC3', n:'PAS 2030 certification', ty:'Accreditation', by:'BSI', no:'PAS-2030-4417', d:200},
  {id:'QC4', n:'Constructionline Gold', ty:'Accreditation', by:'Constructionline', no:'CL-772901', d:75},
  {id:'QC5', n:'Public liability insurance', ty:'Insurance', by:'Hiscox, £5m cover', no:'PL-90311', d:9},
  {id:'QC6', n:'Employers liability insurance', ty:'Insurance', by:'Hiscox, £10m cover', no:'EL-90312', d:140},
  {id:'QC7', n:'Professional indemnity insurance', ty:'Insurance', by:'QBE, £2m cover', no:'PI-55120', d:305},
  {id:'QC8', n:'Contractors all risk insurance', ty:'Insurance', by:'Aviva', no:'CAR-20834', d:-4}
].map(x => ({...x, exp:addDays(TODAY, x.d), file:null, his:[]}));
DB.aud = [
  {id:'AU1', n:'TrustMark annual audit', who:'TrustMark', sc:'Workmanship and customer care', on:addDays(TODAY, -20), res:'Passed', act:0},
  {id:'AU2', n:'PAS 2030 surveillance', who:'BSI', sc:'Installation process and records', on:addDays(TODAY, -45), res:'Passed with actions', act:2},
  {id:'AU3', n:'Site health and safety audit', who:'Helen Price', sc:'Two live sites, RAMS and PPE', on:addDays(TODAY, -8), res:'Passed with actions', act:1},
  {id:'AU4', n:'MCS surveillance audit', who:'MCS', sc:'Solar PV installs and paperwork', on:addDays(TODAY, 18), res:'Scheduled', act:0},
  {id:'AU5', n:'Retrofit records file audit', who:'Helen Price', sc:'PAS 2035 files, 10 properties', on:addDays(TODAY, 40), res:'Scheduled', act:0}
];
S.f.qcq = ''; S.f.qct = ''; S.f.qcs = ''; S.f.qcm = 0;
const qcEd60 = () => isAdmin() || S.role === 'hse';
const qcSt60 = x => { const d = dDiff(x.exp); return d < 0 ? 'exp' : d <= 60 ? 'soon' : 'ok'; };
const QCS60 = {ok:['Valid', 'ok'], soon:['Expiring soon', 'bk'], exp:['Expired', 'bl']};
const qcPill60 = x => { const s = qcSt60(x), [l, c] = QCS60[s]; return `<span class="rd55-p ${c}">${s === 'ok' ? CHK55 : ico('alert', 13, 2.2)}${l}</span>`; };
const AUC60 = {'Passed':'ok', 'Passed with actions':'bk', 'Failed':'bl', 'Scheduled':'ap'};
const dLeft60 = x => { const d = dDiff(x.exp); return d < 0 ? `${-d} days ago` : d === 0 ? 'today' : `in ${d} days`; };
function qcEvents60(){ return [...DB.qc.map(x => ({on:x.exp, k:'qc', id:x.id, n:x.n, c:qcSt60(x)})), ...DB.aud.map(a => ({on:a.on, k:'au', id:a.id, n:a.n, c:'aud'}))]; }
function qcCal60(){ const base = fromIso(TODAY), first = new Date(base.getFullYear(), base.getMonth() + S.f.qcm, 1), y = first.getFullYear(), mo = first.getMonth(), days = new Date(y, mo + 1, 0).getDate(), lead = (first.getDay() + 6) % 7, ev = qcEvents60();
  const cells = []; for(let i = 0; i < lead; i++) cells.push('<div class="qc-d out"></div>');
  for(let d = 1; d <= days; d++){ const ds = iso(new Date(y, mo, d)), es = ev.filter(e => e.on === ds), today = ds === TODAY;
    cells.push(`<div class="qc-d${today ? ' today' : ''}${es.length ? ' has' : ''}"><span class="qc-dn">${d}</span>${es.slice(0, 2).map(e => `<button type="button" class="qc-ev ${e.c}" data-act="${e.k === 'qc' ? 'qcOpen60' : 'auOpen60'}" data-v="${e.id}" data-tip="${esc(e.n)}, ${esc(fmtDy(e.on))}">${esc(e.n)}</button>`).join('')}${es.length > 2 ? `<small class="qc-more">+${es.length - 2} more</small>` : ''}</div>`); }
  const label = first.toLocaleDateString('en-GB', {month:'long', year:'numeric'});
  return `<div class="q54-ch"><h3>${ico('cal', 17)}Renewals calendar</h3><div class="qc-nav"><button type="button" class="qc-nb" data-act="qcM60" data-v="-1" aria-label="Previous month">${ico('chev', 16, 2.2)}</button><b>${label}</b><button type="button" class="qc-nb nx" data-act="qcM60" data-v="1" aria-label="Next month">${ico('chev', 16, 2.2)}</button>${S.f.qcm ? `<button type="button" class="btn sec sm" data-act="qcM60" data-v="0">Today</button>` : ''}</div></div>
    <div class="qc-leg"><span><i class="exp"></i>Expired</span><span><i class="soon"></i>Expiring in 60 days</span><span><i class="ok"></i>Valid</span><span><i class="aud"></i>Audit</span></div>
    <div class="qc-wk">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span>${d}</span>`).join('')}</div><div class="qc-grid">${cells.join('')}</div>`; }
function qcNext60(){ const ev = qcEvents60().filter(e => dDiff(e.on) >= -30).sort((a, b) => a.on < b.on ? -1 : 1).slice(0, 7);
  return `<div class="q54-ch"><h3>${ico('clock', 17)}Coming up</h3></div><div class="qc-up">${ev.map(e => { const d = dDiff(e.on); return `<button type="button" class="qc-ui" data-act="${e.k === 'qc' ? 'qcOpen60' : 'auOpen60'}" data-v="${e.id}"><span class="qc-ud ${e.c}"><b>${fromIso(e.on).getDate()}</b><small>${fromIso(e.on).toLocaleDateString('en-GB', {month:'short'})}</small></span><span class="qc-ut"><b>${esc(e.n)}</b><small>${e.k === 'au' ? 'Audit' : 'Expires'} ${d < 0 ? `${-d} days ago` : d === 0 ? 'today' : `in ${d} days`}</small></span>${ico('chev', 14, 2.2)}</button>`; }).join('')}</div>`; }
function qcRows60(){ const q = norm(S.f.qcq); return DB.qc.filter(x => (!S.f.qct || x.ty === S.f.qct) && (!S.f.qcs || qcSt60(x) === S.f.qcs) && (!q || norm(`${x.n} ${x.by} ${x.no}`).includes(q))).sort((a, b) => a.exp < b.exp ? -1 : 1); }
function qcBar60(){ const c = patch => swap57(patch, () => qcRows60().length), nf = (S.f.qct ? 1 : 0) + (S.f.qcs ? 1 : 0);
  return fbar57({id:'qc', qk:'f', qv:['qcq'], ph:'Search a certificate, insurer or number', nf, clr:'qcClr60', count:plural(qcRows60().length, 'item', 'items'),
    cols:[{t:'Type', opts:[['', 'All types'], ['Accreditation', 'Accreditations'], ['Insurance', 'Insurances']].map(([k, n]) => ({a:'qcTy60', v:k, n, c:c({qct:k}), on:S.f.qct === k}))},
      {t:'Status', opts:[['', 'All statuses'], ['exp', 'Expired'], ['soon', 'Expiring in 60 days'], ['ok', 'Valid']].map(([k, n]) => ({a:'qcSt60', v:k, n, c:c({qcs:k}), on:S.f.qcs === k}))}],
    chips:[...(S.f.qct ? [['qcTy60', '', S.f.qct === 'Insurance' ? 'Insurances' : 'Accreditations']] : []), ...(S.f.qcs ? [['qcSt60', '', QCS60[S.f.qcs][0]]] : [])]}); }
VIEWS.dir.pages.dqual = function dQual60(){ const ex = DB.qc.filter(x => qcSt60(x) === 'exp'), so = DB.qc.filter(x => qcSt60(x) === 'soon'), ok = DB.qc.filter(x => qcSt60(x) === 'ok'), acts = sum(DB.aud, a => a.act), nx = DB.aud.filter(a => a.res === 'Scheduled').sort((a, b) => a.on < b.on ? -1 : 1)[0], ed = qcEd60();
  const rows = qcRows60().map(x => `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="qcOpen60" data-v="${x.id}">${esc(x.n)}</button><small>${esc(x.no)}</small></td><td><span class="rd55-sc" style="background:${x.ty === 'Insurance' ? '#CFFAFE;color:#155E75' : '#EDE9FE;color:#5B21B6'}">${x.ty}</span></td><td class="qc-l">${esc(x.by)}</td><td class="m59-n">${fmtDy(x.exp)}<small>${dLeft60(x)}</small></td><td>${qcPill60(x)}</td><td>${x.file ? `<button type="button" class="rd55-q has" data-act="qcFile60" data-v="${x.id}">${ico('file', 15, 2)}View</button>` : '<span class="rd55-dash" title="No certificate file yet">–</span>'}</td><td>${ed ? `<button type="button" class="rd56-tlb" data-act="qcOpen60" data-v="${x.id}">${ico('upload', 14, 2)}Renew</button>` : ''}</td></tr>`).join('');
  const aud = DB.aud.slice().sort((a, b) => a.on < b.on ? 1 : -1).map(a => `<tr><td class="m59-n">${fmtDy(a.on)}<small>${dDiff(a.on) >= 0 ? `in ${dDiff(a.on)} days` : `${-dDiff(a.on)} days ago`}</small></td><td class="rd55-pr"><button class="rd55-pn" data-act="auOpen60" data-v="${a.id}">${esc(a.n)}</button><small>${esc(a.sc)}</small></td><td class="qc-l">${esc(a.who)}</td><td><span class="rd55-p ${AUC60[a.res]}">${a.res === 'Passed' ? CHK55 : a.res === 'Scheduled' ? ico('cal', 13, 2.2) : ico('alert', 13, 2.2)}${a.res}</span></td><td>${a.act ? `<span class="qc-act">${plural(a.act, 'action', 'actions')} open</span>` : '<span class="rd55-dash">–</span>'}</td><td>${ed ? `<button type="button" class="rd56-tlb" data-act="auOpen60" data-v="${a.id}">${ico('edit', 14, 2)}${a.res === 'Scheduled' ? 'Record result' : 'Update'}</button>` : ''}</td></tr>`).join('');
  return trBar() + oph('Quality and compliance', 'Company accreditations and insurances, audits and every renewal date, in one place.')
    + `<div class="cstats ov-k m59-k">${[stat('tk', 'Valid', ok.length, `of ${plural(DB.qc.length, 'item', 'items')}`, 'qcSt60', 'ok', S.f.qcs === 'ok'), stat('ta', 'Expiring in 60 days', so.length, so.length ? `next: ${so.slice().sort((a, b) => a.exp < b.exp ? -1 : 1)[0].n}` : 'nothing due', 'qcSt60', 'soon', S.f.qcs === 'soon'), stat(ex.length ? 'tred' : 'tg', 'Expired', ex.length, ex.length ? ex.map(x => x.n).join(', ') : 'all in date', 'qcSt60', 'exp', S.f.qcs === 'exp'), stat(acts ? 'ta' : 'tg', 'Audit actions open', acts, nx ? `next audit ${fmtDy(nx.on).replace(/, \d{4}$/, '')}` : '')].join('')}</div>`
    + `<div class="qc-top"><section class="rsec q54-c">${qcCal60()}</section><section class="rsec q54-c">${qcNext60()}</section></div>`
    + `<div class="qc-h"><h2>${ico('shield', 18)}Accreditations and insurances</h2>${ed ? `<button type="button" class="btn sec sm" data-act="qcNew60">${ico('plus', 14)}Add</button>` : ''}</div>${qcBar60()}`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t qc-t"><thead><tr><th>Name</th><th>Type</th><th>Issuer or insurer</th><th>Expires</th><th>Status</th><th>Certificate</th><th><span class="sr">Renew</span></th></tr></thead><tbody>${rows || `<tr><td colspan="7">${empty('Nothing matches the search or the filters.')}</td></tr>`}</tbody></table></div></section>`
    + `<div class="qc-h"><h2>${ico('clip', 18)}Audits</h2>${ed ? `<button type="button" class="btn sec sm" data-act="auNew60">${ico('plus', 14)}Add audit</button>` : ''}</div>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t qc-t"><thead><tr><th>Date</th><th>Audit</th><th>Auditor</th><th>Result</th><th>Actions</th><th><span class="sr">Update</span></th></tr></thead><tbody>${aud}</tbody></table></div></section>`
    + `<p class="hint" style="margin-top:12px">Sample items to show the layout; the real list comes from REFYT’s compliance manager.</p>`; };
A.qcM60 = el => { const v = +el.dataset.v; S.f.qcm = v === 0 ? 0 : S.f.qcm + v; re57(); };
A.qcTy60 = el => { S.f.qct = el.dataset.v; re57(); };
A.qcSt60 = el => { S.f.qcs = S.f.qcs === el.dataset.v && el.closest('.stat') ? '' : el.dataset.v; re57(); };
A.qcClr60 = () => { S.f.qct = ''; S.f.qcs = ''; re57(); };
/* Renew or view an item */
const qcOf60 = id => DB.qc.find(x => x.id === id);
A.qcOpen60 = el => { const x = qcOf60(el.dataset.v); S.modal = {k:'qc60', id:x.id, d:x.exp, f:null}; renderLayer(); };
A.qcNew60 = () => { S.modal = {k:'qcn60', n:'', ty:'Accreditation', by:'', no:'', d:addDays(TODAY, 365), f:null}; renderLayer(); };
const qcFileIn60 = () => `<label class="btn sec lg q54-rep">${ico('upload', 15)}${S.modal.f ? esc(S.modal.f.name) : 'Add the certificate, PDF or image'}<input type="file" accept="application/pdf,.pdf,image/*" data-in="qcf60"></label>`;
IN.qcf60 = t => { const f = t.files && t.files[0]; if(!f || !S.modal) return; const r = new FileReader(); r.onload = () => { S.modal.f = {name:f.name, type:f.type || (/\.pdf$/i.test(f.name) ? 'application/pdf' : ''), size:f.size, url:r.result, by:ME(), on:TODAY}; renderLayer(); }; r.readAsDataURL(f); };
MODALS.qc60 = m => { const x = qcOf60(m.id), ed = qcEd60();
  return modal(esc(x.n), `${x.ty}, ${esc(x.by)}. Number ${esc(x.no)}. Expires ${fmtDy(x.exp)}, ${dLeft60(x)}.`,
    `<div class="qc-mst">${qcPill60(x)}${x.file ? `<button type="button" class="rd55-q has" data-act="qcFile60" data-v="${x.id}">${ico('file', 15, 2)}View certificate</button>` : ''}</div>`
    + (ed ? `<p class="hint" style="margin:14px 0 8px">Renew: the new expiry date and the new certificate.</p><div class="rf-2">${fld('New expiry date', 'm', 'd', m.d, {type:'date', req:true})}<div>${qcFileIn60()}</div></div>` : '')
    + (x.his.length ? `<small class="rf-ph" style="display:block;margin-top:14px">History</small>${x.his.slice().reverse().map(h => `<p class="hint" style="margin:4px 0">${esc(h)}</p>`).join('')}` : ''),
    ed ? mfoot('Save renewal', 'qcSave60', !!m.d && m.d !== x.exp || !!m.f) : `<button class="btn pri lg" data-act="mclose">Close</button>`, 620); };
A.qcSave60 = () => { const m = S.modal, x = qcOf60(m.id); const old = x.exp; if(m.d) x.exp = m.d; if(m.f) x.file = m.f; x.his.push(`${fmtDy(TODAY)}: renewed by ${PEO[ME()].n}, expiry ${fmtDy(old)} to ${fmtDy(x.exp)}${m.f ? `, certificate ${m.f.name}` : ''}`); S.modal = null; renderLayer(); re57(); toast(`${x.n} renewed until ${fmtDy(x.exp)}.`); };
MODALS.qcn60 = m => modal('Add an accreditation or insurance', 'It joins the list and the renewals calendar.',
  `${fld('Name', 'm', 'n', m.n, {req:true, ph:'e.g. Gas Safe registration'})}<div class="q54-tg" style="margin:10px 0">${['Accreditation', 'Insurance'].map(t => `<button type="button" data-act="mset" data-k="ty" data-v="${t}" aria-pressed="${m.ty === t}">${t}</button>`).join('')}</div><div class="rf-2">${fld('Issuer or insurer', 'm', 'by', m.by, {ph:'e.g. Gas Safe Register'})}${fld('Number', 'm', 'no', m.no, {})}</div><div class="rf-2">${fld('Expiry date', 'm', 'd', m.d, {type:'date', req:true})}<div>${qcFileIn60()}</div></div>`,
  mfoot('Add', 'qcAdd60', !!(m.n || '').trim() && !!m.d), 620);
A.qcAdd60 = () => { const m = S.modal; DB.qc.push({id:'QC' + (DB.qc.length + 1) + '-' + Date.now() % 1000, n:m.n.trim(), ty:m.ty, by:m.by || '', no:m.no || '', exp:m.d, file:m.f, his:[`${fmtDy(TODAY)}: added by ${PEO[ME()].n}`]}); S.modal = null; renderLayer(); re57(); toast('Added to the list and the calendar.'); };
A.qcFile60 = el => { const x = qcOf60(el.dataset.v); if(!x.file) return; S.modal = {k:'qcv60', id:x.id}; renderLayer(); if(/pdf/.test(x.file.type)) setTimeout(() => qfDrawAny60(x.file), 30); };
MODALS.qcv60 = m => { const x = qcOf60(m.id), f = x.file; return modal(esc(x.n), `${esc(f.name)}. Added by ${PEO[f.by].n}, ${fmtDy(f.on)}.`, /^image\//.test(f.type) ? `<div class="q54-view"><img src="${f.url}" alt="${esc(x.n)}"></div>` : /pdf/.test(f.type) ? `<div class="q54-view" id="qv54"><p class="hint">Opening the PDF...</p></div>` : `<div class="q54-view"><p class="hint">There is no preview for this type of file.</p></div>`, `<button class="btn pri lg" data-act="mclose">Close</button>`, 860); };
async function qfDrawAny60(f){ const box = document.getElementById('qv54'); if(!box) return;
  try { const L = await loadPdf54(), bin = atob(f.url.split(',')[1]), u8 = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const doc = await L.getDocument({data:u8, isEvalSupported:false}).promise; box.innerHTML = ''; const w = Math.max(280, box.clientWidth - 2), dpr = window.devicePixelRatio || 1;
    for(let i = 1; i <= Math.min(doc.numPages, 12); i++){ const pg = await doc.getPage(i), v0 = pg.getViewport({scale:1}), vp = pg.getViewport({scale:w / v0.width * dpr}), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; c.style.width = w + 'px'; box.appendChild(c); await pg.render({canvasContext:c.getContext('2d'), viewport:vp}).promise; }
  } catch(e){ box.innerHTML = '<p class="hint">The preview could not open this PDF here.</p>'; } }
/* Audits */
const auOf60 = id => DB.aud.find(a => a.id === id);
A.auOpen60 = el => { const a = auOf60(el.dataset.v); S.modal = {k:'au60', id:a.id, n:a.n, who:a.who, sc:a.sc, d:a.on, res:a.res, act:String(a.act)}; renderLayer(); };
A.auNew60 = () => { S.modal = {k:'au60', id:null, n:'', who:'', sc:'', d:addDays(TODAY, 30), res:'Scheduled', act:'0'}; renderLayer(); };
MODALS.au60 = m => { const ed = qcEd60(); return modal(m.id ? esc(m.n) : 'Add an audit', m.id ? `${esc(m.who)}, ${fmtDy(m.d)}. ${esc(m.sc)}.` : 'It joins the audit list and the renewals calendar.',
  (m.id ? '' : `${fld('Audit', 'm', 'n', m.n, {req:true, ph:'e.g. Gas Safe inspection'})}<div class="rf-2">${fld('Auditor', 'm', 'who', m.who, {ph:'Body or person'})}${fld('Scope', 'm', 'sc', m.sc, {})}</div>`)
  + `<div class="rf-2">${fld('Date', 'm', 'd', m.d, {type:'date', req:true})}${fld('Open actions', 'm', 'act', m.act, {ph:'0'})}</div><small class="rf-ph" style="display:block;margin:12px 0 6px">Result</small><div class="mf53-ops">${Object.keys(AUC60).map(r => `<button type="button" class="mf53-op${m.res === r ? ' on' : ''}" data-act="${ed ? 'mset' : ''}" data-k="res" data-v="${r}">${r}</button>`).join('')}</div>`,
  ed ? mfoot(m.id ? 'Save' : 'Add audit', 'auSave60', !!(m.n || '').trim() && !!m.d) : `<button class="btn pri lg" data-act="mclose">Close</button>`, 620); };
A.auSave60 = () => { const m = S.modal, act = Math.max(0, parseInt(m.act, 10) || 0); if(m.id){ Object.assign(auOf60(m.id), {on:m.d, res:m.res, act}); } else DB.aud.push({id:'AU' + Date.now() % 100000, n:m.n.trim(), who:m.who || '', sc:m.sc || '', on:m.d, res:m.res, act}); S.modal = null; renderLayer(); re57(); toast(m.id ? 'Audit updated.' : 'Audit added.'); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.10') v.url = 'https://claude.ai/artifact/28LzGvm1hUL9Nw7ucY1o59'; } });
VERSIONS.push({v:'v5.11', date:TODAY, major:false, current:true, url:null, title:'Quality and compliance in one dashboard', sum:'Director › Quality and compliance brings together company accreditations and insurances, audits and a renewals calendar, with key figures, renewals with the certificate, and audit results.', steps:[]});


/* =================== v5.12: every pop up floats over the screen instead of pushing it =================== */
const FLOAT62 = [['.cm-dp', el => el.parentElement && el.parentElement.querySelector(':scope > .cbx-b, :scope > button')], ['.cbx-p', el => { const c = el.closest('.cbx'); return c && c.querySelector('.cbx-b'); }]];
function cbOf62(el){ let a = el.parentElement; while(a && a !== document.body){ const cs = getComputedStyle(a); if(cs.transform !== 'none' || cs.filter !== 'none' || cs.perspective !== 'none' || cs.contain === 'paint') return a; a = a.parentElement; } return null; }
function float62(){ FLOAT62.forEach(([sel, anc]) => document.querySelectorAll(sel).forEach(p => { const a = anc(p); if(!a || !a.offsetParent) return;
  p.classList.add('fl62'); const r = a.getBoundingClientRect(), cb = cbOf62(p), o = cb ? cb.getBoundingClientRect() : {left:0, top:0}, ph = p.offsetHeight, pw = Math.max(p.offsetWidth, Math.min(340, r.width));
  const below = innerHeight - r.bottom - 8, up = below < ph + 8 && r.top > ph + 8;
  let left = Math.min(r.left, innerWidth - pw - 8); left = Math.max(8, left);
  const top = up ? r.top - ph - 6 : r.bottom + 6;
  p.style.left = (left - o.left) + 'px'; p.style.top = (top - o.top) + 'px'; p.style.width = (sel === '.cbx-p' ? Math.max(r.width, 260) : Math.max(280, Math.min(340, r.width))) + 'px'; })); }
{ const r62 = render; render = (...x) => { const o = r62(...x); try { float62(); } catch(e) {} return o; };
  const l62 = renderLayer; renderLayer = (...x) => { const o = l62(...x); try { float62(); } catch(e) {} return o; };
  if(typeof patchLayer === 'function'){ const p62 = patchLayer; patchLayer = (...x) => { const o = p62(...x); try { float62(); } catch(e) {} return o; }; } }
addEventListener('resize', () => { try { float62(); } catch(e) {} });
document.addEventListener('scroll', () => { try { float62(); } catch(e) {} }, true);
new MutationObserver(() => { if(document.querySelector('.cm-dp:not(.fl62), .cbx-p:not(.fl62)')) try { float62(); } catch(e) {} }).observe(document.body, {childList:true, subtree:true});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.11') v.url = 'https://claude.ai/artifact/HP3kKE2ywSx8nZzmnu3dfP'; } });
VERSIONS.push({v:'v5.12', date:TODAY, major:false, current:true, url:null, title:'Pop ups float over the screen', sum:'Date pickers and option lists open over the screen, above or below their field, instead of pushing the window or the page longer.', steps:[]});


/* =================== v5.13: Variations and additional costs, and Rates, in the new design; Quotes gets the search bar =================== */
S.f.vq = ''; S.f.vty = ''; S.f.vst = ''; S.f.vsc = ''; S.f.rtq = ''; S.f.rtp = ''; S.f.qq = '';
const VST63 = {'Waiting internal approval':['bk', 'clock', 'Waiting approval'], 'Waiting client approval':['rq', 'send', 'Waiting client'], 'Approved':['ok', '', 'Approved'], 'Rejected':['bl', 'x', 'Rejected']};
const vaWho63 = v => { const sc = scOf(prOf(v.pr).sc); return v.amt > sc.set.vr ? 'dir' : v.ty === 'Variation' ? 'com' : 'oap'; };
const vaRows63 = () => { const q = norm(S.f.vq); return DB.va.filter(v => (!S.f.vty || v.ty === S.f.vty) && (!S.f.vst || v.st === S.f.vst) && (!S.f.vsc || prOf(v.pr).sc === S.f.vsc) && (!q || norm(`${v.id} ${v.why} ${prOf(v.pr).ad} ${MEAS[v.m].n} ${v.ev}`).includes(q))).slice().reverse(); };
VIEWS.com.pages.var = function varPage63(){ const all = DB.va, wi = all.filter(v => v.st === 'Waiting internal approval'), wc = all.filter(v => v.st === 'Waiting client approval'), apV = all.filter(v => v.st === 'Approved' && v.ty === 'Variation'), apC = all.filter(v => v.st === 'Approved' && v.ty !== 'Variation'), xs = vaRows63(), c = patch => swap57(patch, () => vaRows63().length), scs = [...new Set(all.map(v => prOf(v.pr).sc))];
  const k = [stat('tk', 'Waiting approval', fm(sum(wi, v => v.amt)), plural(wi.length, 'item', 'items'), 'vSt63', 'Waiting internal approval', S.f.vst === 'Waiting internal approval'), stat('ta', 'Waiting for the client', fm(sum(wc, v => v.amt)), plural(wc.length, 'variation', 'variations'), 'vSt63', 'Waiting client approval', S.f.vst === 'Waiting client approval'), stat('tg', 'Variations approved', fm(sum(apV, v => v.amt)), 'added to what is quoted'), stat(apC.length ? 'tred' : 'tg', 'Additional costs approved', fm(sum(apC, v => v.amt)), 'added to forecast cost')].join('');
  const bar = fbar57({id:'var', qk:'f', qv:['vq'], ph:'Search a reason, property, measure or ID', nf:(S.f.vty ? 1 : 0) + (S.f.vst ? 1 : 0) + (S.f.vsc ? 1 : 0), clr:'vClr63', count:plural(xs.length, 'item', 'items'),
    cols:[{t:'Type', opts:[['', 'All types'], ['Variation', 'Variations'], ['Additional cost', 'Additional costs']].map(([v, n]) => ({a:'vTy63', v, n, c:c({vty:v}), on:S.f.vty === v}))},
      {t:'Status', opts:[['', 'All statuses'], ...Object.keys(VST63).map(s => [s, s])].map(([v, n]) => ({a:'vSt63', v, n, c:c({vst:v}), on:S.f.vst === v}))},
      {t:'Scheme', opts:[{a:'vSc63', v:'', n:'All schemes', c:c({vsc:''}), on:!S.f.vsc}, ...scs.map(id => ({a:'vSc63', v:id, n:scOf(id).n, c:c({vsc:id}), on:S.f.vsc === id}))]}],
    chips:[...(S.f.vty ? [['vTy63', '', S.f.vty === 'Variation' ? 'Variations' : 'Additional costs']] : []), ...(S.f.vst ? [['vSt63', '', S.f.vst]] : []), ...(S.f.vsc ? [['vSc63', '', scOf(S.f.vsc).n]] : [])]});
  const row = v => { const p = prOf(v.pr), [cl, ic, l] = VST63[v.st] || ['nb', '', v.st], who = vaWho63(v), mine = S.role === who || isAdmin(), vt = v.ty === 'Variation';
    const act = v.st === 'Waiting internal approval' && mine ? `<button type="button" class="rd56-tlb" data-act="vaOk" data-v="${v.id}">${ico('check', 14, 2.4)}Approve</button>` : v.st === 'Waiting client approval' && (S.role === 'com' || isAdmin()) ? `<button type="button" class="rd56-tlb" data-act="vaClient" data-v="${v.id}">${ico('check', 14, 2.4)}Client approved</button>` : '';
    return `<tr><td class="rd55-pr"><b class="v63-id">${v.id}</b><small class="v63-why">${esc(v.why)}</small></td><td class="rd55-pr"><button class="rd55-pn" data-act="prMon" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(MEAS[v.m].n)}</small></td><td><span class="rd55-sc" style="${vt ? 'background:#E0E7FF;color:#3730A3' : 'background:#FFEDD5;color:#9A3412'}">${vt ? 'Variation' : 'Additional cost'}</span></td><td class="m59-n">${fm(v.amt)}<small>${vt ? 'to the quote' : 'to the cost'}</small></td><td class="v63-ev">${v.ev ? `${ico('clip', 13, 2)}<span>${esc(v.ev)}</span>` : '–'}</td><td><span class="rd55-p ${cl}">${cl === 'ok' ? CHK55 : ic ? ico(ic, 13, 2.2) : ''}${l}</span>${v.st === 'Waiting internal approval' ? `<small class="v63-who">with ${ROLES[who][0]}</small>` : ''}</td><td>${act}</td></tr>`; };
  return trBar() + oph('Variations and additional costs', 'Variations add scope the client pays for; additional costs are extra cost we carry.', nx('vaNew', '', `${ico('plus', 14)}Raise one`))
    + `<div class="cstats ov-k m59-k">${k}</div>` + bar
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t v63-t"><thead><tr><th>Item</th><th>Property</th><th>Type</th><th>Amount</th><th>Evidence</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="7">${empty(all.length ? 'Nothing matches the search or the filters.' : 'No variations or additional costs yet.')}</td></tr>`}</tbody></table></div></section>`; };
A.vTy63 = el => { S.f.vty = el.dataset.v; re57(); };
A.vSt63 = el => { S.f.vst = el.closest('.stat') && S.f.vst === el.dataset.v ? '' : el.dataset.v; re57(); };
A.vSc63 = el => { S.f.vsc = el.dataset.v; re57(); };
A.vClr63 = () => { S.f.vty = ''; S.f.vst = ''; S.f.vsc = ''; re57(); };

/* Rates */
const rtProg63 = () => S.f.rtp ? [S.f.rtp] : Object.keys(RATE);
const rtRows63 = () => { const q = norm(S.f.rtq); return Object.keys(MEAS).filter(m => (!q || norm(`${MEAS[m].n} ${MEAS[m].s}`).includes(q)) && rtProg63().some(t => RATE[t][m])); };
VIEWS.com.pages.rate = function ratePage63(){ const progs = Object.keys(RATE), ms = rtRows63(), cols = rtProg63(), vals = progs.flatMap(t => Object.values(RATE[t]).filter(Boolean)), top = Math.max(...vals);
  const topM = progs.flatMap(t => Object.entries(RATE[t]).filter(([, v]) => v === top).map(([m]) => `${MEAS[m].n}, ${t}`))[0] || '';
  const k = [stat('tk', 'Programmes', progs.length, progs.join(', ')), stat('tg', 'Measures priced', Object.keys(MEAS).filter(m => progs.some(t => RATE[t][m])).length, `of ${Object.keys(MEAS).length} measures`), stat('ta', 'Budget', pc(BUD * 100), 'of each rate, the cost budget'), stat('tb', 'Highest rate', fm(top), topM)].join('');
  const bar = fbar57({id:'rate', qk:'f', qv:['rtq'], ph:'Search a measure', nf:S.f.rtp ? 1 : 0, clr:'rtClr63', count:plural(ms.length, 'measure', 'measures'),
    cols:[{t:'Programme', opts:[{a:'rtP63', v:'', n:'All programmes', c:null, on:!S.f.rtp}, ...progs.map(t => ({a:'rtP63', v:t, n:t, c:Object.values(RATE[t]).filter(Boolean).length, on:S.f.rtp === t}))]}],
    chips:S.f.rtp ? [['rtP63', '', S.f.rtp]] : []});
  const row = m => `<tr><td class="rd55-pr"><b class="v63-id">${esc(MEAS[m].n)}</b><small>${esc(MEAS[m].s)}</small></td>${cols.map(t => `<td class="m59-n">${RATE[t][m] ? `${fm(RATE[t][m])}<small>budget ${fm(RATE[t][m] * BUD)}</small>` : '<span class="rd55-dash" title="Not priced in this programme">–</span>'}</td>`).join('')}</tr>`;
  return trBar() + oph('Rates', 'The agreed price per measure and programme. Each quote is built from these; they are loaded with the scheme template.')
    + `<div class="cstats ov-k m59-k">${k}</div>` + bar
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t r63-t"><thead><tr><th>Measure</th>${cols.map(t => `<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>${ms.map(row).join('') || `<tr><td colspan="${cols.length + 1}">${empty('No measure matches the search.')}</td></tr>`}</tbody></table></div></section>`; };
A.rtP63 = el => { S.f.rtp = el.dataset.v; re57(); };
A.rtClr63 = () => { S.f.rtp = ''; re57(); };

/* Quotes: search bar with filters */
const qQ63 = p => { const q = norm(S.f.qq); return !q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n} ${p.ms.map(x => MEAS[x.m].n).join(' ')}`).includes(q); };
function qBar63(){ const c = patch => swap57(patch, () => qF54().filter(qQ63).length), scs = [...new Set(qBase54().map(p => p.sc))], ms = Object.keys(MEAS).filter(m => qBase54().some(p => p.ms.some(x => x.m === m))), stN = {ok:'Approved', wait:'Waiting for the client', nofile:'No quote file'};
  return fbar57({id:'quo', qk:'f', qv:['qq'], ph:'Search a property, postcode, scheme or measure', nf:(S.f.qsc ? 1 : 0) + (S.f.qm ? 1 : 0) + (S.f.qst ? 1 : 0), clr:'qClr54', count:plural(qF54().filter(qQ63).length, 'quote', 'quotes'),
    cols:[{t:'Scheme', opts:[{a:'qSc63', v:'', n:'All schemes', c:c({qsc:''}), on:!S.f.qsc}, ...scs.map(id => ({a:'qSc63', v:id, n:scOf(id).n, c:c({qsc:id}), on:S.f.qsc === id}))]},
      {t:'Measure', opts:[{a:'qM63', v:'', n:'All measures', c:c({qm:''}), on:!S.f.qm}, ...ms.map(m => ({a:'qM63', v:m, n:MEAS[m].n, c:c({qm:m}), on:S.f.qm === m}))]},
      {t:'Status', opts:[['', 'All statuses'], ['ok', 'Approved'], ['wait', 'Waiting for the client'], ['nofile', 'No quote file']].map(([v, n]) => ({a:'qSt63', v, n, c:c({qst:v}), on:S.f.qst === v}))}],
    chips:[...(S.f.qsc ? [['qSc63', '', scOf(S.f.qsc).n]] : []), ...(S.f.qm ? [['qM63', '', MEAS[S.f.qm].n]] : []), ...(S.f.qst ? [['qSt63', '', stN[S.f.qst]]] : [])]}); }
A.qSc63 = el => { S.f.qsc = el.dataset.v; re57(); };
A.qM63 = el => { S.f.qm = el.dataset.v; re57(); };
A.qSt63 = el => { S.f.qst = el.dataset.v; re57(); };
{ const oc = A.qClr54; A.qClr54 = () => { S.f.qq = ''; oc(); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.12') v.url = 'https://claude.ai/artifact/Y1MmR29MerrmsB9YY633ud'; } });
VERSIONS.push({v:'v5.13', date:TODAY, major:false, current:true, url:null, title:'Variations, Rates and Quotes in the new design', sum:'Variations and additional costs and Rates use the key figures, the search bar with filters and the new table. Variations can be approved or marked client approved from the list. Quotes and budgets gets the search bar with filters.', steps:[]});


/* =================== v5.14: every list in the new design: card tables, status labels, search bar with filters, key figures =================== */
S.g64 = {};
const G64 = ['dir:tasks', 'dir:mtg', 'tsk:all', 'dir:sch', 'acc:trg', 'acc:inv', 'acc:sup', 'acc:sub', 'ret:bk', 'ret:rq', 'ret:pk', 'del:clo', 'del:cs'];
const gNorm64 = t => { let s = (t || '').trim().replace(/^\d[\d,.]*\s+(days?|weeks?|hours?)\s+/i, '').replace(/^\d[\d,.]*\s+/, ''); return s ? s[0].toUpperCase() + s.slice(1) : ''; };
const gKey64 = () => { try { return curKey(); } catch(e) { return S.view; } };
const KPI64 = {
  'acc:inv':() => { const xs = DB.inv, paid = xs.filter(v => v.paid), od = xs.filter(v => !v.paid && dDiff(v.due) < 0), wt = xs.filter(v => !v.paid && dDiff(v.due) >= 0);
    return [stat('tk', 'Invoiced', fm(sum(xs, v => v.amt)), plural(xs.length, 'invoice', 'invoices')), stat('tg', 'Paid', fm(sum(paid, v => v.amt)), plural(paid.length, 'invoice', 'invoices'), 'g64St', 'Paid'), stat('ta', 'Waiting', fm(sum(wt, v => v.amt)), plural(wt.length, 'invoice', 'invoices'), 'g64St', 'Waiting'), stat(od.length ? 'tred' : 'tg', 'Overdue', fm(sum(od, v => v.amt)), plural(od.length, 'invoice', 'invoices'), 'g64St', 'Overdue')]; },
  'acc:sub':() => { const xs = DB.sp, by = s => xs.filter(x => x.st === s);
    return [stat('tk', 'Subcontractor payments', fm(sum(xs, x => x.amt)), plural(xs.length, 'payment', 'payments')), stat('ta', 'Waiting approval', fm(sum(by('Waiting approval'), x => x.amt)), plural(by('Waiting approval').length, 'payment', 'payments'), 'g64St', 'Waiting approval'), stat('tb', 'Approved, to pay', fm(sum(by('Approved'), x => x.amt)), plural(by('Approved').length, 'payment', 'payments'), 'g64St', 'Approved'), stat('tg', 'Paid', fm(sum(by('Paid'), x => x.amt)), plural(by('Paid').length, 'payment', 'payments'), 'g64St', 'Paid')]; },
  'acc:sup':() => { const dl = DB.or.filter(o => o.st === 'Delivered'), iv = DB.or.filter(o => o.st === 'Invoiced'), od = DB.or.filter(o => o.st === 'Ordered');
    return [stat('tk', 'To match', fm(sum(dl, o => o.amt)), `${plural(dl.length, 'order', 'orders')} delivered`), stat('ta', 'On order', fm(sum(od, o => o.amt)), plural(od.length, 'order', 'orders')), stat('tg', 'Matched', fm(sum(iv, o => o.amt)), plural(iv.length, 'invoice', 'invoices')), stat('tb', 'Suppliers', new Set(DB.or.map(o => o.sup)).size, 'with orders')]; }
};
function lists64(){ document.querySelectorAll('.op').forEach(op => { if(op.closest('#layer')) return;
  /* 1. Runs of rows become one card table */
  const kids = [...op.querySelectorAll('.mbr')].filter(r => !r.closest('.lst64') && !r.closest('.rd55') && !r.closest('#layer')); const seen = new Set();
  kids.forEach(r => { if(seen.has(r)) return; const run = [r]; let n = r.nextElementSibling; while(n && n.classList.contains('mbr')){ run.push(n); n = n.nextElementSibling; } run.forEach(x => seen.add(x)); const w = document.createElement('div'); w.className = 'lst64'; r.parentNode.insertBefore(w, r); run.forEach(x => w.appendChild(x)); });
  op.querySelectorAll('.lst64 .pill').forEach(p => { if(!p.dataset.g64) p.dataset.g64 = gNorm64(p.textContent); }); }); }
function kpi64(){ const k = gKey64(), f = KPI64[k]; if(!f) return; const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || op.querySelector('.cstats')) return; const h = op.querySelector('.op-h'); if(!h) return; h.insertAdjacentHTML('afterend', `<div class="cstats ov-k m59-k g64-k">${f().join('')}</div>`); }
function bar64(){ const k = gKey64(); if(!G64.includes(k)) return; const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || op.querySelector('.v5-fs')) return;
  const lists = [...op.querySelectorAll('.lst64')]; if(!lists.length) return; const st = S.g64[k] = S.g64[k] || {q:'', st:[], gr:[], open:false};
  const rows = lists.flatMap(l => [...l.querySelectorAll('.mbr:not(.uy-th)')]), grpOf = r => { let p = r.closest('.lst64').previousElementSibling; while(p && !p.matches('.grp-h,.gh,.lst64')) p = p.previousElementSibling; return p && !p.matches('.lst64') ? (p.querySelector('b,h3,span') || p).textContent.trim().replace(/\s+\d+$/, '') : ''; };
  rows.forEach(r => { r.dataset.g64s = [...new Set([...r.querySelectorAll('.pill')].map(p => p.dataset.g64).filter(Boolean))].join('|'); r.dataset.g64g = grpOf(r); });
  const sts = [...new Set(rows.flatMap(r => r.dataset.g64s ? r.dataset.g64s.split('|') : []))], grs = [...new Set(rows.map(r => r.dataset.g64g).filter(Boolean))];
  const first = lists[0], anchor = (first.previousElementSibling && first.previousElementSibling.matches('.grp-h,.gh')) ? first.previousElementSibling : first;
  const wrap = document.createElement('div'); wrap.className = 'g64-w'; anchor.parentNode.insertBefore(wrap, anchor);
  const paint = () => { const q = norm(st.q), match = (r, o = {}) => { const s2 = o.st || st.st, g2 = o.gr || st.gr; return (!q || norm(r.textContent).includes(q)) && (!s2.length || s2.some(x => (r.dataset.g64s || '').split('|').includes(x))) && (!g2.length || g2.includes(r.dataset.g64g)); };
    rows.forEach(r => r.classList.toggle('g64-hide', !match(r))); lists.forEach(l => { const any = [...l.querySelectorAll('.mbr:not(.uy-th)')].some(r => !r.classList.contains('g64-hide')); l.classList.toggle('g64-hide', !any); const p = l.previousElementSibling; if(p && p.matches('.grp-h,.gh')) p.classList.toggle('g64-hide', !any); });
    const nf = st.st.length + st.gr.length, shown = rows.filter(r => !r.classList.contains('g64-hide')).length, cnt = o => rows.filter(r => match(r, o)).length;
    const cols = [...(sts.length ? [{t:'Status', a:'st', opts:sts}] : []), ...(grs.length > 1 ? [{t:'Group', a:'gr', opts:grs}] : [])];
    const panel = `<div class="v5-fp v5-noanim"><div class="v5-fph"><b>Filter by</b><button class="v5-fclr" data-g64="clr" ${nf ? '' : 'disabled'}>Clear all</button></div><div class="v5-fcols">${cols.map(c => `<div class="v5-fc"><small>${c.t}</small><button class="v5-fo${!st[c.a].length ? ' on' : ''}" data-g64="all" data-c="${c.a}"><span>All</span><small>${cnt({[c.a]:[]})}</small></button>${c.opts.map(o => `<button class="v5-fo${st[c.a].includes(o) ? ' on' : ''}" data-g64="opt" data-c="${c.a}" data-o="${esc(o)}"><span>${esc(o)}</span><small>${cnt({[c.a]:[o]})}</small></button>`).join('')}</div>`).join('')}</div></div>`;
    wrap.innerHTML = `<div class="v5-fs"><div class="v5-fsb${st.open ? ' open' : ''}">${ico('search', 18)}<input type="search" data-g64="q" placeholder="Search this list" value="${esc(st.q)}" aria-label="Search this list">${cols.length ? `<button class="v5-fbtn${nf ? ' on' : ''}" data-g64="tog" title="Filters" aria-label="Filters" aria-expanded="${st.open}">${ico('filter', 17)}${nf ? `<em>${nf}</em>` : ''}</button>` : ''}</div>${st.open && cols.length ? panel : ''}</div><div class="v5-fchips">${nf ? [...st.st.map(o => ['st', o]), ...st.gr.map(o => ['gr', o])].map(([c, o]) => `<button class="v5-fchip" data-g64="opt" data-c="${c}" data-o="${esc(o)}">${esc(o)}${ico('x', 12)}</button>`).join('') + '<button class="v5-fclr" data-g64="clr">Clear all</button>' : ''}<span class="v5-fn">${plural(shown, 'item', 'items')}</span></div>`;
    op.querySelectorAll('.g64-k [data-act=g64St]').forEach(b => b.closest('.stat') && b.closest('.stat').classList.toggle('ds-on', st.st.length === 1 && st.st[0] === b.dataset.v)); };
  wrap._paint = paint; wrap._st = st; paint(); }
document.addEventListener('input', e => { const t = e.target; if(t.dataset && t.dataset.g64 === 'q'){ const w = t.closest('.g64-w'); w._st.q = t.value; const pos = t.selectionStart; w._paint(); const ni = w.querySelector('input[data-g64=q]'); ni.focus(); try { ni.setSelectionRange(pos, pos); } catch(e) {} } }, true);
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-g64]'); const w = e.target.closest && e.target.closest('.g64-w');
  if(!b || !w){ document.querySelectorAll('.g64-w').forEach(x => { if(x._st && x._st.open && !x.contains(e.target)){ x._st.open = false; x._paint(); } }); return; }
  const st = w._st, a = b.dataset.g64; if(a === 'q') return; e.preventDefault(); e.stopPropagation();
  if(a === 'tog') st.open = !st.open; else if(a === 'clr'){ st.st = []; st.gr = []; } else if(a === 'all') st[b.dataset.c] = []; else if(a === 'opt'){ const c = b.dataset.c, o = b.dataset.o; st[c] = st[c].includes(o) ? st[c].filter(x => x !== o) : [...st[c], o]; }
  w._paint(); }, true);
A.g64St = el => { const st = S.g64[gKey64()] = S.g64[gKey64()] || {q:'', st:[], gr:[], open:false}, v = el.dataset.v; st.st = st.st.length === 1 && st.st[0] === v ? [] : [v]; const w = document.querySelector('.op .g64-w'); if(w && w.offsetParent){ w._paint(); } else render(); };
document.addEventListener('keydown', e => { if(e.key === 'Escape') document.querySelectorAll('.g64-w').forEach(x => { if(x._st && x._st.open){ x._st.open = false; x._paint(); } }); });
{ const r64 = render; render = (...x) => { const o = r64(...x); try { lists64(); kpi64(); bar64(); } catch(e) { console.warn(e); } return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.13') v.url = 'https://claude.ai/artifact/5EJCJeDvU8A9vQLhpFoyV7'; } });
VERSIONS.push({v:'v5.14', date:TODAY, major:false, current:true, url:null, title:'Every list in the new design', sum:'Every list in the app is a card table with status labels. Task, meeting, scheme, Accounts, Retrofit and Delivery lists get the search bar with filters by status and group, and Invoices, Invoice matching and Subcontractor payments get key figures.', steps:[]});


/* =================== v5.15: Director reports use the standard search bar with the filters inside it =================== */
S.f.dq = S.f.dq || '';
const dCnt65 = patch => { const keep = S.f.d; S.f.d = {...keep, ...patch}; try { return fPr().length; } finally { S.f.d = keep; } };
function dBar65(){ const d = DD(), nf = ['pg', 'sc', 'tm', 'per', 'm'].filter(k => d[k]).length, o = (k, v, n, c) => ({a:'df65', v:`${k}|${v}`, n, c, on:(d[k] || '') === v});
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

/* =================== v5.17: Suppliers: spend chart and Needs a look in the Margins design =================== */
function supChart67(rs){ const xs = rs.filter(r => r.q).sort((a, b) => b.q - a.q).slice(0, 8); if(!xs.length) return empty('No spend this quarter.');
  const W = 680, rowH = 58, T = 10, L = 190, R = 70, B = 30, H = T + xs.length * rowH + B, iw = W - L - R, top = Math.max(...xs.map(r => r.q)), step = Math.max(1000, Math.ceil(top / 4 / 1000) * 1000), mx = step * 4;
  const x = v => L + v / mx * iw, bh = 30;
  const grid = [0, 1, 2, 3, 4].map(i => `<line x1="${x(step * i)}" x2="${x(step * i)}" y1="${T}" y2="${T + xs.length * rowH}" class="q54-gl"/><text x="${x(step * i)}" y="${H - 8}" text-anchor="middle" class="q54-ax">${kfm54(step * i)}</text>`).join('');
  const bars = xs.map((r, i) => { const y = T + i * rowH + (rowH - bh) / 2, lab = /labour/i.test(r.ct || '') ? '#F97316' : /plant|hire|scaffold/i.test(r.ct || '') ? '#06B6D4' : '#6366F1', tip = `${r.n}: ${fm(r.q)} last 3 months, ${plural(r.open, 'open order', 'open orders')}. Click for its orders.`;
    return `<g class="q54-bar s67-bar" data-act="supOpen" data-v="${esc(r.n)}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="0" y="${T + i * rowH + 2}" width="${W}" height="${rowH - 4}" class="q54-hit" rx="8"/><text x="${L - 12}" y="${y + bh / 2 - 1}" text-anchor="end" class="s67-n">${esc(r.n)}</text><text x="${L - 12}" y="${y + bh / 2 + 12}" text-anchor="end" class="s67-ct">${esc(r.ct || '')}</text><rect x="${L}" y="${y}" width="${Math.max(4, x(r.q) - L)}" height="${bh}" rx="7" fill="${lab}"/><text x="${x(r.q) + 8}" y="${y + bh / 2 + 5}" class="m59-bv">${kfm54(r.q)}</text></g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Spend by supplier, last 3 months">${grid}${bars}</svg>`; }
function supLook67(rs){ const xs = rs.filter(r => r.open || r.match).sort((a, b) => (b.match - a.match) || (b.open - a.open)).slice(0, 4);
  if(!xs.length) return `<div class="m59-in gr"><span class="m59-ii">${ico('check', 18, 2.2)}</span><div><b>All clear</b><p>No open orders or invoices waiting.</p></div></div>`;
  return xs.map(r => { const m = r.match > 0, cls = m ? 'am' : 'bl';
    return `<div class="m59-in ${cls}"><span class="m59-ii">${ico(m ? 'alert' : 'clock', 18, 2.2)}</span><div><b>${esc(r.n)}</b><p>${plural(r.open, 'open order', 'open orders')}${m ? `, ${r.match} delivered without the supplier invoice.` : ', nothing to match yet.'}</p><button type="button" class="m59-ib" data-act="supOpen" data-v="${esc(r.n)}">${m ? 'Match invoices' : 'See orders'}${ico('chev', 12, 2.4)}</button></div></div>`; }).join(''); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.16') v.url = 'https://claude.ai/artifact/CC2XWRCCvsSquTkTgMK3qc'; } });
VERSIONS.push({v:'v5.17', date:TODAY, major:false, current:true, url:null, title:'Suppliers: chart and Needs a look like Margins', sum:'Spend by supplier keeps horizontal bars in the Margins chart design, coloured by cost type and clickable; Needs a look shows insight cards with an action each.', steps:[]});


/* =================== v5.18: Close out in the same design: key figures, progress chart, Needs a look, search and table =================== */
S.f.cq = ''; S.f.csc = ''; S.f.cst = '';
const cHand68 = p => { const n = HAND.filter(h => !(h.includes('solar') && !p.ms.some(x => x.m === 'SPV') && !(p.u52 || {})['h:' + h]) && p.hand[h] !== 'na'), d = n.filter(h => p.hand[h]).length; return {n:n.length, d, left:n.filter(h => !p.hand[h])}; };
const cTm68 = p => !!p.hand['TrustMark lodgement'];
const cCs68 = p => { const st = ptOf(p).st; return {sys:ptOf(p).sys, s:csName(p), fin:(p.cs || 0) >= st.length - 1, i:(p.cs || 0) + 1, n:st.length}; };
const cTags68 = p => { const h = cHand68(p), c = cCs68(p); return [h.d >= h.n ? 'hand' : 'handleft', cTm68(p) ? 'lodged' : 'tolodge', c.fin ? 'csdone' : 'cspend']; };
const CTAG68 = {hand:'Handover complete', handleft:'Handover items left', tolodge:'To lodge with TrustMark', lodged:'Lodged with TrustMark', cspend:'Client system to finish', csdone:'Client system finished'};
const cAll68 = () => DB.pr.filter(p => p.ph === 'F. Close out');
const cRows68 = () => { const q = norm(S.f.cq); return cAll68().filter(p => (!S.f.csc || p.sc === S.f.csc) && (!S.f.cst || cTags68(p).includes(S.f.cst)) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n}`).includes(q))); };
function cChart68(xs){ if(!xs.length) return empty('No properties in close out.');
  const W = 680, rowH = 58, T = 10, L = 190, R = 90, B = 30, H = T + xs.length * rowH + B, iw = W - L - R, x = v => L + v / 100 * iw, bh = 30;
  const grid = [0, 25, 50, 75, 100].map(v => `<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${T + xs.length * rowH}" class="q54-gl"/><text x="${x(v)}" y="${H - 8}" text-anchor="middle" class="q54-ax">${v}%</text>`).join('');
  const bars = xs.map((p, i) => { const h = cHand68(p), pct = h.n ? h.d / h.n * 100 : 100, done = pct >= 100 && cTm68(p) && cCs68(p).fin, col = done ? '#10B981' : pct >= 100 ? '#6366F1' : '#F59E0B', y = T + i * rowH + (rowH - bh) / 2, tip = `${p.ad}: handover ${h.d} of ${h.n}, ${cTm68(p) ? 'lodged with TrustMark' : 'to lodge with TrustMark'}, ${cCs68(p).sys} ${cCs68(p).s}. Click to open.`;
    return `<g class="q54-bar s67-bar" data-act="prClo" data-v="${p.id}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="0" y="${T + i * rowH + 2}" width="${W}" height="${rowH - 4}" class="q54-hit" rx="8"/><text x="${L - 12}" y="${y + bh / 2 - 1}" text-anchor="end" class="s67-n">${esc(p.ad)}</text><text x="${L - 12}" y="${y + bh / 2 + 12}" text-anchor="end" class="s67-ct">${esc(scOf(p.sc).n)}</text><rect x="${L}" y="${y}" width="${iw}" height="${bh}" rx="7" fill="#EEF2F6"/><rect x="${L}" y="${y}" width="${Math.max(6, x(pct) - L)}" height="${bh}" rx="7" fill="${col}"/><text x="${L + iw + 8}" y="${y + bh / 2 + 5}" class="m59-bv">${h.d}/${h.n}</text></g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Handover progress per property">${grid}${bars}</svg>`; }
function cLook68(xs){ const items = [];
  xs.forEach(p => { const h = cHand68(p), c = cCs68(p);
    if(!cTm68(p) && h.d >= h.n - 1) items.push([0, 'am', 'alert', p, 'Lodge with TrustMark', `Handover ${h.d} of ${h.n}; the TrustMark lodgement is still to do.`, 'Lodge']);
    else if(h.left.length) items.push([1, 'bl', 'clock', p, `${plural(h.left.length, 'handover item', 'handover items')} left`, h.left.slice(0, 2).join(', ') + (h.left.length > 2 ? ` and ${h.left.length - 2} more.` : '.'), 'Finish handover']);
    if(!c.fin) items.push([2, 'rd', 'globe', p, `${c.sys}: ${c.s}`, `Step ${c.i} of ${c.n} in the client system; it closes the job and triggers payment.`, 'Update']); });
  const xs2 = items.sort((a, b) => a[0] - b[0]).slice(0, 4);
  if(!xs2.length) return `<div class="m59-in gr"><span class="m59-ii">${ico('check', 18, 2.2)}</span><div><b>All clear</b><p>Every handover, lodgement and client system update is done.</p></div></div>`;
  return xs2.map(([, cls, ic, p, t, s, btn]) => `<div class="m59-in ${cls}"><span class="m59-ii">${ico(ic, 18, 2.2)}</span><div><b>${esc(p.ad)}</b><p><strong>${esc(t)}.</strong> ${esc(s)}</p><button type="button" class="m59-ib" data-act="prClo" data-v="${p.id}">${btn}${ico('chev', 12, 2.4)}</button></div></div>`).join(''); }
VIEWS.del.pages.clo = function cloPage68(){ const all = cAll68(), xs = cRows68(), hc = all.filter(p => { const h = cHand68(p); return h.d >= h.n; }), tl = all.filter(p => !cTm68(p)), cp = all.filter(p => !cCs68(p).fin), c = patch => swap57(patch, () => cRows68().length), scs = [...new Set(all.map(p => p.sc))];
  const k = [stat('tk', 'In close out', all.length, 'properties in phase F'), stat('tg', 'Handover complete', `${hc.length} of ${all.length}`, 'every item in the pack', 'cSt68', 'hand', S.f.cst === 'hand'), stat(tl.length ? 'ta' : 'tg', 'To lodge with TrustMark', tl.length, tl.length ? 'lodgement still to do' : 'all lodged', 'cSt68', 'tolodge', S.f.cst === 'tolodge'), stat(cp.length ? 'tred' : 'tg', 'Client system to finish', cp.length, 'final upload or acceptance', 'cSt68', 'cspend', S.f.cst === 'cspend')].join('');
  const bar = fbar57({id:'clo', qk:'f', qv:['cq'], ph:'Search a property, postcode or scheme', nf:(S.f.csc ? 1 : 0) + (S.f.cst ? 1 : 0), clr:'cClr68', count:plural(xs.length, 'property', 'properties'),
    cols:[{t:'Scheme', opts:[{a:'cSc68', v:'', n:'All schemes', c:c({csc:''}), on:!S.f.csc}, ...scs.map(id => ({a:'cSc68', v:id, n:scOf(id).n, c:c({csc:id}), on:S.f.csc === id}))]},
      {t:'Status', opts:[{a:'cSt68', v:'', n:'All statuses', c:c({cst:''}), on:!S.f.cst}, ...Object.entries(CTAG68).map(([v, n]) => ({a:'cSt68', v, n, c:c({cst:v}), on:S.f.cst === v}))]}],
    chips:[...(S.f.csc ? [['cSc68', '', scOf(S.f.csc).n]] : []), ...(S.f.cst ? [['cSt68', '', CTAG68[S.f.cst]]] : [])]});
  const row = p => { const h = cHand68(p), cs = cCs68(p), pct = h.n ? Math.round(h.d / h.n * 100) : 100;
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="prClo" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.pc || '')}</small></td><td>${scPill55(p.sc)}</td><td class="c68-h"><b>${h.d} of ${h.n}</b><span class="rd56-bar"><i style="width:${pct}%"></i></span></td><td>${cTm68(p) ? `<span class="rd55-p ok">${CHK55}TM-${720000 + parseInt(p.id.slice(3))}</span>` : `<span class="rd55-p bk">${ico('alert', 13, 2.2)}To lodge</span>`}</td><td class="c68-cs"><b>${esc(cs.sys)}</b><span class="rd55-p ${cs.fin ? 'ok' : 'rq'}">${cs.fin ? CHK55 : ico('clock', 13, 2.2)}${esc(cs.s)}</span></td></tr>`; };
  return trBar() + oph('Close out', 'Handover pack, lodgement with its TrustMark reference and the final uploads to the client system.', later('DocuSign sign off')) + visNote()
    + `<div class="cstats ov-k m59-k">${k}</div>`
    + bar + `<section class="rd55"><div class="rd55-w"><table class="rd55-t c68-t"><thead><tr><th>Property</th><th>Scheme</th><th>Handover</th><th>TrustMark</th><th>Client system</th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="5">${empty(all.length ? 'No property matches the search or the filters.' : 'No properties in close out.')}</td></tr>`}</tbody></table></div></section>`; };
A.cSc68 = el => { S.f.csc = el.dataset.v; re57(); };
A.cSt68 = el => { S.f.cst = el.closest('.stat') && S.f.cst === el.dataset.v ? '' : el.dataset.v; re57(); };
A.cClr68 = () => { S.f.csc = ''; S.f.cst = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.17') v.url = 'https://claude.ai/artifact/RMQqXH7eBG7CuePYhzK28R'; } });
VERSIONS.push({v:'v5.18', date:TODAY, major:false, current:true, url:null, title:'Close out in the new design', sum:'Close out has key figures, the search bar with filters and the new table with handover, TrustMark and client system.', steps:[]});


/* =================== v5.19: Capacity and staffing as a staff performance dashboard =================== */
const TEAM69 = r => r === 'dir' || r === 'pap' ? 'dir' : r === 'com' ? 'com' : r === 'acc' ? 'acc' : RET4.includes(r) ? 'ret' : 'del';
const TCOL69 = {dir:['#E0E7FF', '#3730A3'], com:['#EDE9FE', '#5B21B6'], acc:['#CFFAFE', '#155E75'], ret:['#DCFCE7', '#166534'], del:['#FFEDD5', '#9A3412']};
const C69 = {done:'#10B981', up:'#3B82F6', od:'#F97316'};
const rnd69 = s => { let h = 2166136261; for(const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; }; };
const RATE69 = {ass:5, aap:4, dsg:4, sad:5, inc:6, sit:4, acc:4, com:3, dir:2, hse:3};
const WK69 = {}; Object.keys(PWHO).forEach(k => { const r = rnd69(k), base = RATE69[PWHO[k]] || 3; WK69[k] = {done:Array.from({length:60}, (_, i) => Math.max(0, Math.round(base + (r() - .45) * base * .9 + Math.sin(i / 4) * .8))), up:Math.round(base * (1 + r() * 1.4)), od:Math.round(r() * base * .7), odHist:Array.from({length:60}, () => Math.round(r() * base * .7)), upHist:Array.from({length:60}, () => Math.round(base * (1 + r() * 1.4)))}; });
function stf69(){ const d = DD(), n = S.f.capP === 'y' ? 52 : 4, q = norm(S.f.dq);
  let ps = Object.keys(PWHO).filter(k => PEO[k]).map(k => { const r = PWHO[k], tm = TEAM69(r), w = WK69[k], tks = DB.tk.filter(t => t.who === k);
    const rDone = tks.filter(t => t.done && t.doneOn && dDiff(t.doneOn) >= -n * 7).length, rUp = tks.filter(t => !t.done && dDiff(t.due) >= 0).length, rOd = tks.filter(t => !t.done && dDiff(t.due) < 0).length;
    const fq = n / 2.5, done = sum(w.done.slice(-n), x => x) + rDone, prev = sum(w.done.slice(-2 * n, -n), x => x) || 1, up = Math.round(w.up * fq * .55) + rUp, od = Math.round((w.od + .8) * fq * .6) + rOd, tot = done + up + od;
    return {k, n:PEO[k].n, role:r, tm, done, up, od, tot, pct:tot ? done / tot * 100 : 0, chg:(done - prev) / prev * 100, trend:w.done.slice(-Math.max(8, Math.min(n, 13))), odT:w.odHist.slice(-Math.max(8, Math.min(n, 13))), upT:w.upHist.slice(-Math.max(8, Math.min(n, 13)))}; });
  if(d.tm) ps = ps.filter(p => p.tm === d.tm); if(d.per) ps = ps.filter(p => p.k === d.per);
  if(q){ const m = ps.filter(p => norm(p.n).includes(q)); if(m.length) ps = m; }
  return ps; }
const spark69 = (vals, col, w = 240, h = 56, fill = true) => { const mx = Math.max(1, ...vals), mn = Math.min(...vals), st = w / Math.max(1, vals.length - 1), pts = vals.map((v, i) => [i * st, h - 4 - (v - mn) / Math.max(1, mx - mn) * (h - 10)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '), id = 'g' + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="sp69" aria-hidden="true">${fill ? `<path d="${d} L${w} ${h} L0 ${h} Z" fill="${col}" fill-opacity=".12"/>` : ''}<path d="${d}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`; };
const ring69 = (segs, mid, sub, size = 150, sw = 16) => { const r = 60, C = 2 * Math.PI * r, tot = sum(segs, s => s[1]) || 1; let off = 0;
  const arcs = segs.filter(s => s[1] > 0).map(([n, v, c]) => { const len = v / tot * C, a = `<circle cx="75" cy="75" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-dasharray="${Math.max(0, len - (segs.length > 1 ? 2 : 0))} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 75 75)" data-tip="${esc(n)}: ${v}"/>`; off += len; return a; }).join('');
  return `<svg viewBox="0 0 150 150" class="rg69" style="width:${size}px" role="img" aria-label="${esc(mid)} ${esc(sub)}"><circle cx="75" cy="75" r="${r}" fill="none" stroke="#EEF2F6" stroke-width="${sw}"/>${arcs}<text x="75" y="${sub ? 74 : 82}" text-anchor="middle" class="rg69-b">${mid}</text>${sub ? `<text x="75" y="94" text-anchor="middle" class="rg69-s">${sub}</text>` : ''}</svg>`; };
const chg69 = (v, good) => { const up = v >= 0, ok = good ? up : !up; return `<span class="ch69 ${ok ? 'ok' : 'bad'}">${ico(up ? 'trend' : 'down', 12, 2.4)}${up ? '+' : ''}${Math.round(v)}%</span>`; };
const sumAt69 = (ps, key) => { const L = Math.max(0, ...ps.map(p => p[key].length)); return Array.from({length:L}, (_, i) => sum(ps, p => p[key][i] || 0)); };
VIEWS.dir.pages.dcap = function dCap69(){ const ps = stf69(), done = sum(ps, p => p.done), up = sum(ps, p => p.up), od = sum(ps, p => p.od), tot = done + up + od, pct = tot ? done / tot * 100 : 0;
  const odT = sumAt69(ps, 'odT'), upT = sumAt69(ps, 'upT'), dnT = sumAt69(ps, 'trend'), prevDone = sum(ps, p => p.done / (1 + p.chg / 100));
  const kc = (cls, ic, v, l, ch, s, col) => `<div class="k69 ${cls}"><div class="k69-t"><span class="k69-i">${ico(ic, 20, 2.2)}</span>${ch}</div><b>${num(v)}</b><small>${l}</small>${spark69(s, col)}</div>`;
  const teams = APPS.filter(a => a[0] !== 'tsk').map(([k, n]) => { const xs = ps.filter(p => p.tm === k), d2 = sum(xs, p => p.done), u2 = sum(xs, p => p.up), o2 = sum(xs, p => p.od), t2 = d2 + u2 + o2; return {k, n, d:d2, u:u2, o:o2, pct:t2 ? d2 / t2 * 100 : 0, cnt:xs.length}; }).filter(t => t.cnt);
  const row = p => { const w = x => (p.tot ? x / p.tot * 100 : 0).toFixed(1), [bg, fg] = TCOL69[p.tm];
    return `<tr><td class="rd55-pr"><div class="p69">${av(p.k, 32)}<div><button class="rd55-pn" data-act="stf69" data-v="${p.k}">${esc(p.n)}</button><small>${esc(RN(p.role))}</small></div></div></td><td><span class="rd55-sc" style="background:${bg};color:${fg}">${APPN[p.tm]}</span></td><td class="b69-c"><div class="b69" data-tip="${esc(`${p.n}: ${p.done} completed, ${p.up} upcoming, ${p.od} overdue`)}"><i style="width:${w(p.done)}%;background:${C69.done}"></i><i style="width:${w(p.up)}%;background:${C69.up}"></i><i style="width:${w(p.od)}%;background:${C69.od}"></i></div><b>${Math.round(p.pct)}%</b></td><td class="m59-n n69 g">${p.done}</td><td class="m59-n n69 b">${p.up}</td><td class="m59-n n69 o">${p.od}</td><td class="t69">${spark69(p.trend, p.od > p.up ? C69.od : C69.done, 120, 32, false)}</td><td><button type="button" class="rd56-tlb" data-act="stf69" data-v="${p.k}">${ico('eye', 14, 2)}View details</button></td></tr>`; };
  return oph('Capacity and staffing', 'Tasks due in the period per team and person: completed, still upcoming and overdue.') + dBar65() + `<div class="rf-bar">${seg('capP69', S.f.capP || 'm', [['m', 'This month'], ['y', 'This year']])}</div>`
    + `<div class="g69-top"><section class="rsec q54-c o69 o95"><div class="q54-ch"><h3>${ico('chart', 17)}Overall completion</h3></div>${dist95([['Completed', done, C69.done], ['Upcoming', up, C69.up], ['Overdue', od, C69.od]], num(tot), pc(pct) + ' completed')}</section>`
    + kc('od', 'alert', od, 'Overdue tasks', chg69((od - sum(odT.slice(0, Math.floor(odT.length / 2)), x => x) / Math.max(1, Math.floor(odT.length / 2))) / Math.max(1, od) * 100, false), odT, C69.od)
    + kc('up', 'clock', up, 'Upcoming tasks', chg69((up - sum(upT.slice(0, Math.floor(upT.length / 2)), x => x) / Math.max(1, Math.floor(upT.length / 2))) / Math.max(1, up) * 100, true), upT, C69.up)
    + kc('dn', 'check', done, 'Completed tasks', chg69(prevDone ? (done - prevDone) / prevDone * 100 : 0, true), dnT, C69.done) + `</div>`
    + `<section class="rsec q54-c t69s"><div class="q54-ch"><h3>${ico('chart', 17)}Performance by team</h3><div class="q54-leg"><span><i style="background:${C69.done}"></i>Completed</span><span><i style="background:${C69.up}"></i>Upcoming</span><span><i style="background:${C69.od}"></i>Overdue</span></div></div><div class="tm69">${teams.map(t => `<button type="button" class="tm69-c${DD().tm === t.k ? ' on' : ''}" data-act="df65" data-v="tm|${DD().tm === t.k ? '' : t.k}" title="${DD().tm === t.k ? 'Show every team' : 'Filter by ' + t.n}"><b>${t.n}</b>${ring69([['Completed', t.d, C69.done], ['Upcoming', t.u, C69.up], ['Overdue', t.o, C69.od]], pc(t.pct), '', 104, 14)}<span class="tm69-n"><i style="background:${C69.done}"></i>${t.d}<i style="background:${C69.up}"></i>${t.u}<i style="background:${C69.od}"></i>${t.o}</span></button>`).join('') || empty('No team matches the filters.')}</div></section>`
    + `<div class="qc-h"><h2>${ico('users', 18)}Staff overview</h2><div class="q54-leg" style="margin:0"><span><i style="background:${C69.done}"></i>Completed</span><span><i style="background:${C69.up}"></i>Upcoming</span><span><i style="background:${C69.od}"></i>Overdue</span></div></div><section class="rd55"><div class="rd55-w"><table class="rd55-t s69-t"><thead><tr><th>Person</th><th>Team</th><th>Completion</th><th>Completed</th><th>Upcoming</th><th>Overdue</th><th>Trend</th><th><span class="sr">Details</span></th></tr></thead><tbody>${ps.map(row).join('') || `<tr><td colspan="8">${empty('No one matches the filters.')}</td></tr>`}</tbody></table></div></section>`; };
A.stf69 = el => { S.modal = {k:'stf69', p:el.dataset.v}; renderLayer(); };
MODALS.stf69 = m => { const kd = S.f.d, kq = S.f.dq; S.f.d = {...kd, tm:'', per:''}; S.f.dq = ''; const p = stf69().find(x => x.k === m.p); S.f.d = kd; S.f.dq = kq; const tks = DB.tk.filter(t => t.who === m.p).sort((a, b) => a.due < b.due ? -1 : 1);
  const st = t => t.done ? `<span class="rd55-p ok">${CHK55}Done</span>` : dDiff(t.due) < 0 ? `<span class="rd55-p rq">${ico('alert', 13, 2.2)}Overdue</span>` : `<span class="rd55-p ap">${ico('clock', 13, 2.2)}Upcoming</span>`;
  return modal(esc(PEO[m.p].n), `${esc(RN(PWHO[m.p]))}, ${APPN[TEAM69(PWHO[m.p])]}.`, `<div class="m69">${ring69([['Completed', p.done, C69.done], ['Upcoming', p.up, C69.up], ['Overdue', p.od, C69.od]], pc(p.pct), 'completion', 120, 14)}<div class="o69-l">${[['Completed', p.done, C69.done], ['Upcoming', p.up, C69.up], ['Overdue', p.od, C69.od]].map(([n, v, c]) => `<div><span style="background:${c}"></span><b>${n}</b><em>${v}</em></div>`).join('')}</div></div><small class="rf-ph" style="display:block;margin:14px 0 6px">Tasks in the app</small>${tks.length ? tks.map(t => `<div class="m69-t"><div><b>${esc(t.t)}</b><small>Due ${fmtDy(t.due)}</small></div>${st(t)}</div>`).join('') : '<p class="hint">No tasks assigned in the app right now.</p>'}`, `<button class="btn pri lg" data-act="mclose">Close</button>`, 640); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.18') v.url = 'https://claude.ai/artifact/RnMZedeypaZRmgPHfDW5e1'; } });
VERSIONS.push({v:'v5.19', date:TODAY, major:false, current:true, url:null, title:'Capacity and staffing as staff performance', sum:'Capacity and staffing shows overall completion, overdue, upcoming and completed tasks with their trend, performance by team, and a staff table whose bar splits completed, upcoming and overdue in colour.', steps:[]});

S.f.capP = S.f.capP || 'm';
/* Home, My day: meetings open from their name, and Tasks and Next meetings are clearly separated */
function myday90(){ document.querySelectorAll('.ov-dir .ov-card').forEach(c => { const h = c.querySelector('.ov-h h3'); if(!h || !/My day/.test(h.textContent) || c.dataset.md90) return; c.dataset.md90 = '1'; c.classList.add('md90');
  c.querySelectorAll('.ov-r').forEach(r => { const ob = r.querySelector('.ov-ra [data-act=mtOpen]'); if(!ob) return; const b = r.querySelector('.ov-rm > b'); if(b && !b.querySelector('button')) b.innerHTML = `<button class="ov-lk" data-act="mtOpen" data-v="${ob.dataset.v}">${esc(b.textContent)}</button>`; const ra = ob.closest('.ov-ra'); ra && ra.remove(); });
  c.querySelectorAll('.ov-sub').forEach(s => { if(s.querySelector('svg')) return; const t = s.textContent.trim(); s.insertAdjacentHTML('afterbegin', `<span class="md90-i">${ico(/meet/i.test(t) ? 'users' : 'check', 13, 2.4)}</span>`); }); }); }
{ const r90 = render; render = (...x) => { const o = r90(...x); try { myday90(); } catch(e) {} return o; }; }
if(S.f.d){ if(S.f.d.dr === 'q') S.f.d.dr = '4w'; if(S.f.d.tr === 'quarter') S.f.d.tr = 'month'; }
if(S.f.tkv3 === 'all') S.f.tkv3 = 'mine';
{ const oT = A.tkv3; if(oT) A.tkv3 = el => { if(el.dataset.v === 'all') return; oT(el); }; }
A.capP69 = el => { S.f.capP = el.dataset.v; re57(); };

/* =================== v5.20: Assessment bookings led by a big calendar, and drag and drop in every calendar except Quality and compliance =================== */
S.f.bkc = S.f.bkc || 'month'; S.f.bkm = S.f.bkm || 0;
const BKC70 = {booked:'bkb', revisit:'bkr', review:'bkv', done:'bkd'};
const bkChip70 = p => { const k = bkSt(p), lab = BKST.find(x => x[0] === k)[1]; return `<button class="qc-ev ${BKC70[k] || 'bkb'}" data-act="prRet" data-v="${p.id}" data-tip="${esc(`${p.b.h || ''} ${p.ad}, ${PEO[p.b.who] ? PEO[p.b.who].n : ''}, ${lab}. Drag to another day to move it.`)}">${p.b.h ? `<i>${p.b.h}</i> ` : ''}${esc(p.ad)}</button>`; };
function bkMonth70(){ const evs = calEvts(), base = fromIso(D0), first = new Date(base.getFullYear(), base.getMonth() + S.f.bkm, 1), y = first.getFullYear(), mo = first.getMonth(), days = new Date(y, mo + 1, 0).getDate(), lead = (first.getDay() + 6) % 7, cells = [];
  for(let i = 0; i < lead; i++) cells.push('<div class="qc-d out"></div>');
  for(let d = 1; d <= days; d++){ const ds = iso(new Date(y, mo, d)), es = evs.filter(p => p.b.on === ds).sort((a, b) => (a.b.h || '') < (b.b.h || '') ? -1 : 1);
    cells.push(`<div class="qc-d bk70-d${ds === TODAY ? ' today' : ''}" data-date="${ds}"><span class="qc-dn">${d}</span>${es.slice(0, 3).map(bkChip70).join('')}${es.length > 3 ? `<button class="qc-more bk70-more" data-act="bkDay" data-v="${ds}">+${es.length - 3} more</button>` : ''}</div>`); }
  const label = first.toLocaleDateString('en-GB', {month:'long', year:'numeric'});
  return `<div class="q54-ch"><h3>${ico('cal', 17)}Assessment calendar</h3><div class="qc-nav"><button type="button" class="qc-nb" data-act="bkM70" data-v="-1" aria-label="Previous month">${ico('chev', 16, 2.2)}</button><b>${label}</b><button type="button" class="qc-nb nx" data-act="bkM70" data-v="1" aria-label="Next month">${ico('chev', 16, 2.2)}</button>${S.f.bkm ? `<button type="button" class="btn sec sm" data-act="bkM70" data-v="0">Today</button>` : ''}</div></div>
    <div class="qc-leg"><span><i class="bkb"></i>Booked</span><span><i class="bkr"></i>Revisit booked</span><span><i class="bkv"></i>Visit done, in review</span><span><i class="bkd"></i>Assessed</span><span class="bk70-hint">${ico('info', 13)}Drag a visit to another day to move it</span></div>
    <div class="qc-wk">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span>${d}</span>`).join('')}</div><div class="qc-grid bk70-g">${cells.join('')}</div>`; }
function bkSide70(){ const up = calEvts().filter(p => dDiff(p.b.on) >= 0 && ['booked', 'revisit'].includes(bkSt(p))).sort((a, b) => (a.b.on + (a.b.h || '')) < (b.b.on + (b.b.h || '')) ? -1 : 1).slice(0, 5), tb = bkList().filter(p => bkSt(p) === 'tobook');
  return `<div class="q54-ch"><h3>${ico('clock', 17)}Coming up</h3></div><div class="qc-up">${up.map(p => { const d = fromIso(p.b.on), k = bkSt(p); return `<button type="button" class="qc-ui" data-act="prRet" data-v="${p.id}"><span class="qc-ud ${k === 'revisit' ? 'soon' : 'aud'}"><b>${d.getDate()}</b><small>${d.toLocaleDateString('en-GB', {month:'short'})}</small></span><span class="qc-ut"><b>${esc(p.ad)}</b><small>${p.b.h || ''}, ${esc(PEO[p.b.who].n)}${k === 'revisit' ? ', revisit' : ''}</small></span>${ico('chev', 14, 2.2)}</button>`; }).join('') || '<p class="hint">No visits booked ahead.</p>'}</div>`
    + `<div class="q54-ch" style="margin-top:14px"><h3>${ico('alert', 17)}To book <span class="q54-cnt">${tb.length}</span></h3></div><div class="qc-up">${tb.map(p => `<div class="qc-ui bk70-tb"><span class="qc-ut"><b>${esc(p.ad)}</b><small>${esc(scOf(p.sc).n)}, ${esc(p.ref || p.id)}</small></span>${nx('bBook', p.id, 'Book')}</div>`).join('') || '<p class="hint">Nothing waiting to be booked.</p>'}</div>`; }
{ const oBk = bkPage; bkPage = function(){ const xs = bkList(), keep = S.f.bkv; S.f.bkv = 'list'; let lst = oBk(); S.f.bkv = keep; const i = lst.indexOf('<div class="rf-tw">'); lst = i >= 0 ? lst.slice(i) : '';
  const wk = S.f.bkc === 'week';
  return oph('Assessment bookings', 'Every assessment on the calendar first, then grouped by where it stands. Drag a visit to another day to move it.')
    + `<div class="cstats">${BKST.map(([k, n]) => stat(k === 'revisit' && xs.some(p => bkSt(p) === k) ? 'ta' : 'tk', n, xs.filter(p => bkSt(p) === k).length)).join('')}</div>`
    + `<div class="rf-bar">${seg('bkc70', S.f.bkc, [['week', 'Week'], ['month', 'Month']])}${wk ? `${nx('bkNav', '-1', 'Previous week', 'sec')}${nx('bkNav', '0', 'This week', 'sec')}${nx('bkNav', '1', 'Next week', 'sec')}` : ''}${seg('bka', S.f.bka || '', [['', 'Both assessors'], ...ASR.map(k => [k, PEO[k].n])])}</div>`
    + `<div class="qc-top bk70-top"><section class="rsec q54-c">${wk ? `<div class="q54-ch"><h3>${ico('cal', 17)}Assessment calendar</h3><span class="bk70-hint">${ico('info', 13)}Drag a visit to another day to move it</span></div>${bkWeek71()}` : bkMonth70()}</section><section class="rsec q54-c">${bkSide70()}</section></div>`
    + `<div class="qc-h"><h2>${ico('list', 18)}All assessments</h2></div>` + lst; };
  VIEWS.ret.pages.bk = bkPage; }
A.bkc70 = el => { S.f.bkc = el.dataset.v; re57(); };
A.bkM70 = el => { const v = +el.dataset.v; S.f.bkm = v === 0 ? 0 : S.f.bkm + v; re57(); };
{ const oDay = A.bkDay; A.bkDay = el => { const d = el.dataset.v; S.f.bkc = 'week'; S.f.bko = Math.round((fromIso(monday(d)) - fromIso(monday(D0))) / 6048e5); render(); }; }

/* Drag and drop: move a meeting, task or assessment to another day (not in Quality and compliance) */
const DND70 = {mtOpen:'Meeting', tkView:'Task', prRet:'Assessment'};
function dnd70(){ document.querySelectorAll('.rf-tgcol .rf-tev').forEach(b => { if(DND70[b.dataset.act]) b.classList.add('dd70'); }); document.querySelectorAll('[data-date]').forEach(c => { if(c.closest('#layer')) return; c.querySelectorAll('[data-act]').forEach(b => { if(DND70[b.dataset.act] && !b.closest('.qc-up') && (b.dataset.v || '').match(/^(MT|TK|PR)-/)){ b.classList.add('dd70'); } }); }); }
{ const r70 = render; render = (...x) => { const o = r70(...x); try { dnd70(); } catch(e) {} return o; }; }
function move70(a, v, from, d, hh, ad){ if(!d) return; let name = '';
  if(a === 'mtOpen'){ const m = mtOf(v); if(!m) return; if(d === from && (!hh || hh === m.h)) return; m.d = d; if(hh) m.h = hh; name = `${m.ty || ''}${hh ? `, ${hh}` : ''}`; }
  else if(a === 'tkView'){ const k = DB.tk.find(x => x.id === v); if(!k) return; if(d === from && (hh ? hh === k.h : !(ad && k.h))) return; k.due = d; if(hh) k.h = hh; else if(ad) delete k.h; name = `${k.t}${hh ? `, ${hh}` : ''}`; }
  else if(a === 'prRet'){ const p = prOf(v); if(!p || !p.b) return; if(d === from && (!hh || hh === p.b.h)) return; p.b.on = d; if(hh) p.b.h = hh; name = `${p.ad}${hh ? `, ${hh}` : ''}`; p.his.push([TODAY, `Assessment moved from ${fmtDy(from)} to ${fmtDy(d)}${p.b.h ? ` at ${p.b.h}` : ''} with ${PEO[p.b.who] ? PEO[p.b.who].n : 'the assessor'}`, ME()]); }
  render(); toast(`${DND70[a]} moved to ${fmtDy(d)}${name ? `: ${name}` : ''}.`); }
/* Pointer based, so it works the same with a mouse, a trackpad or a finger, in every browser */
let drag70 = null, eatClick70 = false;
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('.dd70'); if(!b || e.button > 0) return; const c = b.closest('[data-date], .rf-tgcol'); drag70 = {b, a:b.dataset.act, v:b.dataset.v, from:c && (c.dataset.date || c.dataset.d), x:e.clientX, y:e.clientY, on:false, ghost:null, over:null}; });
document.addEventListener('pointermove', e => { const g = drag70; if(!g) return;
  if(!g.on){ if(Math.hypot(e.clientX - g.x, e.clientY - g.y) < 6) return; g.on = true; g.b.classList.add('dragging'); document.body.classList.add('dnd70-on'); const r = g.b.getBoundingClientRect(); g.ghost = g.b.cloneNode(true); g.ghost.classList.add('ghost70'); g.ghost.style.width = r.width + 'px'; g.dx = e.clientX - r.left; g.dy = e.clientY - r.top; document.body.appendChild(g.ghost); const t = document.getElementById('tip54'); if(t) t.classList.remove('on'); }
  e.preventDefault(); g.ghost.style.left = (e.clientX - g.dx) + 'px'; g.ghost.style.top = (e.clientY - g.dy) + 'px';
  g.ghost.style.display = 'none'; const el = document.elementFromPoint(e.clientX, e.clientY); g.ghost.style.display = ''; const c = el && el.closest('.rf-tgcol, [data-date]'); g.ly = e.clientY;
  if(g.over && g.over !== c) g.over.classList.remove('drop70'); g.over = c && !c.closest('#layer') ? c : null; if(g.over) g.over.classList.add('drop70'); }, {passive:false});
const end70 = e => { const g = drag70; drag70 = null; if(!g) return; document.body.classList.remove('dnd70-on'); if(g.ghost) g.ghost.remove(); g.b.classList.remove('dragging'); if(g.over) g.over.classList.remove('drop70');
  if(g.on){ eatClick70 = true; setTimeout(() => { eatClick70 = false; }, 0); if(e.type === 'pointerup' && g.over){ const tg = g.over.classList.contains('rf-tgcol'); move70(g.a, g.v, g.from, g.over.dataset.date || g.over.dataset.d, tg ? m2tm(yToMin(g.over, (g.ly || e.clientY) - g.dy)) : null, g.over.classList.contains('tg71-adc')); } } };
document.addEventListener('pointerup', end70); document.addEventListener('pointercancel', end70);
document.addEventListener('click', e => { if(eatClick70){ e.preventDefault(); e.stopPropagation(); eatClick70 = false; } }, true);
document.addEventListener('dragstart', e => { if(e.target.closest && e.target.closest('.dd70')) e.preventDefault(); });
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.19') v.url = 'https://claude.ai/artifact/VySaAcZZtnRrP2LDsRjeTa'; } });
VERSIONS.push({v:'v5.20', date:TODAY, major:false, current:true, url:null, title:'Bookings calendar first, drag and drop in calendars', sum:'Assessment bookings opens on a big calendar with Coming up and To book beside it, then the full list. In every calendar except Quality and compliance, meetings, tasks and assessments can be dragged to another day.', steps:[]});


/* =================== v5.21: every calendar opens on the week, then month, with the list underneath =================== */
const calFirst71 = (k, label) => f => (...x) => { if(!['week', 'month'].includes(S.f[k])) S.f[k] = 'week';
  const cal = f(...x), keep = S.f[k]; S.f[k] = 'list'; let lst = f(...x); S.f[k] = keep; const i = lst.indexOf('<div class="rf-tw">'); lst = i >= 0 ? lst.slice(i) : '';
  return cal.replace(new RegExp(`<button[^>]*data-act="${k}" data-v="list"[^>]*>[\\s\\S]*?</button>`), '') + (lst ? `<div class="qc-h"><h2>${ico('list', 18)}${label}</h2></div>${lst}` : ''); };
['dir', 'com', 'acc', 'ret', 'del'].forEach(a => { const v = VIEWS[a]; if(!v || !v.pages) return; if(v.pages.mtg) v.pages.mtg = calFirst71('mtv', 'All meetings')(v.pages.mtg); if(v.pages.tasks) v.pages.tasks = calFirst71('tkvw', 'All tasks')(v.pages.tasks); });
S.f.mtv = 'week'; S.f.tkvw = 'week'; S.f.bkc = 'week';
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.20') v.url = 'https://claude.ai/artifact/4dMnxSbX9deSdHQc5LeUVC'; } });
VERSIONS.push({v:'v5.21', date:TODAY, major:false, current:true, url:null, title:'Calendars open on the week, list underneath', sum:'Assessment bookings, Meetings and My tasks open on the weekly calendar, can switch to the month, and always show the full list underneath.', steps:[]});


/* =================== v5.22: the hour grid of Meetings is the weekly calendar for Tasks and Assessment bookings too =================== */
function tg71(days, evs, allday){ const hrs = Array.from({length:H1 - H0}, (_, i) => H0 + i), nowM = 10 * 60 + 42, cols = `58px repeat(${days.length}, minmax(120px, 1fr))`;
  const lane = es => { const s = es.slice().sort((a, b) => a.t0 - b.t0), ends = []; s.forEach(e => { let i = ends.findIndex(x => x <= e.t0); if(i < 0){ i = ends.length; ends.push(0); } ends[i] = e.t0 + e.dur; e.l = i; }); s.forEach(e => { e.n = ends.length; }); return s; };
  return `<div class="rf-tgw tg71"><div class="rf-tgh" style="grid-template-columns:${cols}"><div></div>${days.map(d => `<div class="${d === TODAY ? 'today' : ''}"><small>${DSH[fromIso(d).getDay()]}</small><b>${fromIso(d).getDate()}</b></div>`).join('')}</div>`
    + (allday ? `<div class="tg71-ad" style="grid-template-columns:${cols}"><div class="tg71-adl">No time</div>${days.map(d => `<div class="tg71-adc${d === TODAY ? ' today' : ''}" data-date="${d}">${allday.filter(e => e.d === d).map(e => e.chip).join('')}</div>`).join('')}</div>` : '')
    + `<div class="rf-tg"><div class="rf-tgb" style="height:${(H1 - H0) * HH}px;grid-template-columns:${cols};min-width:${58 + days.length * 120}px"><div class="rf-tgt">${hrs.map(h => `<span style="top:${(h - H0) * HH}px">${String(h).padStart(2, '0')}:00</span>`).join('')}</div>`
    + days.map(d => `<div class="rf-tgcol${d === TODAY ? ' today' : ''}" data-d="${d}">${hrs.map(h => `<i class="rf-tgl" style="top:${(h - H0) * HH}px"></i>`).join('')}${d === TODAY ? `<i class="rf-now" style="top:${(nowM / 60 - H0) * HH}px"></i>` : ''}${lane(evs.filter(e => e.d === d).map(e => ({...e, t0:tm2m(e.h)}))).map(e => { const top = (e.t0 / 60 - H0) * HH, hgt = Math.max(22, e.dur / 60 * HH - 2), w = 100 / e.n; return `<button class="rf-tev ${e.cls}" style="top:${top}px;height:${hgt}px;left:calc(${e.l * w}% + 4px);right:auto;width:calc(${w}% - 8px)" data-act="${e.act}" data-v="${e.v}" data-tip="${esc(e.tip)}"><b>${esc(e.title)}</b><small>${esc(e.sub)}</small></button>`; }).join('')}</div>`).join('') + `</div></div></div>`; }
/* Tasks: a task with a time sits on the hour grid; one without sits in the No time row. Drag a task onto the grid to give it a time. */
/* Tasks keep their own day columns for the week (asked to go back); this hour grid version is kept for reference only */
{ const oCal = tkCal; const tkHour71 = xs => { if(S.f.tkvw !== 'week') return oCal(xs); const m0 = monday(S.f.tkc || TODAY), d7 = Array.from({length:7}, (_, i) => addDays(m0, i)), days = d7.filter((d, i) => i < 5 || xs.some(k => k.due === d));
    const sub = k => `${pName(k.who) || RN(k.r)}${k.pr ? ', ' + prOf(k.pr).ad : ''}`;
    const evs = xs.filter(k => k.h && days.includes(k.due)).map(k => ({act:'tkView', v:k.id, d:k.due, h:k.h, dur:k.dur || 30, cls:'tk71 ' + tkTone(k), title:k.t, sub:`${k.h}, ${sub(k)}`, tip:`${k.t}, ${k.h}, ${sub(k)}. Drag to move it.`}));
    const ad = xs.filter(k => !k.h && days.includes(k.due)).map(k => ({d:k.due, chip:tkChip2(k)}));
    return `<div class="tg71-note">${ico('info', 13)}Tasks without a time sit in the first row. Drag one onto the hours to give it a time, or to another day to move it.</div>` + tg71(days, evs, ad); }; }
/* Assessment bookings: each visit on the hour grid, 90 minutes, coloured by where it stands */
const BKT71 = {booked:'bk-b', revisit:'bk-r', review:'bk-v', done:'bk-d'};
function bkWeek71(){ const mon = addDays(D0, (S.f.bko || 0) * 7), days = Array.from({length:5}, (_, i) => addDays(mon, i));
  const evs = calEvts().filter(p => days.includes(p.b.on)).map(p => { const k = bkSt(p), lab = BKST.find(x => x[0] === k)[1], who = PEO[p.b.who] ? PEO[p.b.who].n : ''; return {act:'prRet', v:p.id, d:p.b.on, h:p.b.h || '09:00', dur:p.b.dur || 90, cls:BKT71[k] || 'bk-b', title:p.ad, sub:`${p.b.h || '09:00'} to ${m2tm(tm2m(p.b.h || '09:00') + (p.b.dur || 90))}, ${who}, ${lab}`, tip:`${p.ad}, ${who}, ${lab}. Drag to another day or hour to move it.`}; });
  return tg71(days, evs, null); }
document.addEventListener('mousedown', e => { if(e.target.closest && e.target.closest('.tg71 .rf-tgcol')) e.stopPropagation(); }, true);
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.21') v.url = 'https://claude.ai/artifact/VgpWP9tFejg9fkZYu6Mtdr'; } });
VERSIONS.push({v:'v5.22', date:TODAY, major:false, current:true, url:null, title:'Assessment bookings on the weekly hour grid', sum:'Assessment bookings uses the Meetings hour grid for its week; visits sit at their time and can be dragged to another day or hour. Tasks keep their day columns.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.22') v.url = 'https://claude.ai/artifact/PC7bVkR9iZQgGxxkGcwjT5'; } });
VERSIONS.push({v:'v5.23', date:TODAY, major:false, current:true, url:null, title:'Forms in the Apple style', sum:'Forms use neutral segmented controls with a white selected thumb, system blue for the selected date and confirmations, and a red asterisk instead of the Required label.', steps:[]});

/* =================== v5.24: Client system updates in the new design, with every pending item one click away =================== */
S.f.csq = ''; S.f.cssy = ''; S.f.cssc = ''; S.f.csx = null;
const csSteps74 = t => { const parts = String(t || '').split(/,\s*then\s+|,\s*/).map(s => s.trim()).filter(Boolean); const verb = (parts[0] || '').split(' ')[0];
  return parts.map((s, i) => { s = s.replace(/^then\s+/i, ''); if(i && !/^[A-Z]/.test(s)) s = (/^(press|send|tick|attach|add|mark|confirm|submit|wait)/i.test(s) ? '' : verb + ' ') + s; return s[0].toUpperCase() + s.slice(1); }); };
const csPend74 = p => { const sys = ptOf(p).sys, g = [];
  g.push({t:`In ${sys}`, ic:'globe', xs:csSteps74(p.csTodo).map(s => ({n:s}))});
  const gate = phGate(p); if(gate.miss && gate.miss.length) g.push({t:`To finish ${p.ph}`, ic:'flag', xs:gate.miss.map(s => ({n:s}))});
  if(p.ph === 'F. Close out'){ const gm = (gate.miss || []).join(' | '), left = cHand68(p).left.filter(s => !gm.includes(s)); if(left.length) g.push({t:'Handover pack', ic:'clip', xs:left.map(s => ({n:s}))}); }
  const tk = DB.tk.filter(k => k.pr === p.id && !k.done); if(tk.length) g.push({t:'Open tasks', ic:'check', xs:tk.map(k => ({n:k.t, d:`${PEO[k.who] ? PEO[k.who].n : RN(k.r)}, due ${fmtDy(k.due)}`, od:dDiff(k.due) < 0}))});
  return g; };
const csRows74 = () => { const q = norm(S.f.csq); return DB.pr.filter(p => p.csTodo && (!S.f.cssy || ptOf(p).sys === S.f.cssy) && (!S.f.cssc || p.sc === S.f.cssc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${scOf(p.sc).n} ${ptOf(p).sys} ${p.csTodo}`).includes(q))); };
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

/* =================== v5.26: In assessment as a review and design queue dashboard =================== */
S.f.rqq = ''; S.f.rqs = ''; S.f.rqc = ''; S.f.rqt = '';
const rqIx76 = p => { const i = BSTEPS.findIndex(([k]) => !(k === 'bk' ? p.b.bk : k === 'vis' ? p.b.vis : k === 'rev' ? p.b.rev === 'Approved' : k === 'docs' ? docsOf(p).every(n => p.b.docs.includes(n)) : k === 'mod' ? !!p.b.mod : k === 'dsg' ? p.ms.every(x => x.dsg) : k === 'drev' ? p.ms.every(x => x.dap) : p.b.ts)); return i < 0 ? BSTEPS.length : i; };
const rqSt76 = p => { const i = rqIx76(p); if(i >= BSTEPS.length) return 'ready'; if(BSTEPS[i][3]) return 'appr'; if(i === 0) return 'tobook'; return 'prog'; };
const RQS76 = {prog:['In progress', '#10B981'], appr:['Waiting approval', '#6366F1'], tobook:['To book', '#F59E0B'], ready:['Survey pack ready', '#06B6D4']};
const rqAll76 = () => DB.pr.filter(p => p.ph === 'B. Assess and design');
const rqRows76 = () => { const q = norm(S.f.rqq); return rqAll76().filter(p => (S.f.rqs === '' || String(rqIx76(p)) === S.f.rqs) && (!S.f.rqc || p.sc === S.f.rqc) && (!S.f.rqt || rqSt76(p) === S.f.rqt) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${p.ref} ${scOf(p.sc).n}`).includes(q))); };
const rqName76 = i => i >= BSTEPS.length ? 'Survey pack ready' : `${i + 1}. ${BSTEPS[i][1].replace(', per measure', '')}`;
function rqChart76(){ const ps = swap57({rqs:''}, () => rqRows76()), cnt = BSTEPS.map((_, i) => ps.filter(p => rqIx76(p) === i).length), W = 720, H = 260, L = 30, B = 52, T = 26, iw = W - L - 6, ih = H - B - T, mx = Math.max(4, Math.ceil(Math.max(...cnt) / 4) * 4), gw = iw / BSTEPS.length, bw = Math.min(54, gw * .5), y = v => T + ih - v / mx * ih, sel = S.f.rqs;
  const grid = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - 6}" y1="${y(mx * f)}" y2="${y(mx * f)}" class="q54-gl"/><text x="${L - 8}" y="${y(mx * f) + 4}" text-anchor="end" class="q54-ax">${Math.round(mx * f)}</text>`).join('');
  const bars = BSTEPS.map(([k, n, r], i) => { const SH = [['Book', 'Survey admin'], ['Visit', 'Assessor'], ['Review', 'Approver'], ['Documents', 'Approver'], ['Modelling', 'Approver'], ['Design', 'Designer'], ['Sign off', 'Design approver'], ['Survey', 'Approver']], cx = L + gw * i + gw / 2, on = sel === String(i), dim = sel !== '' && !on, l1 = `${i + 1}. ${SH[i][0]}`, l2 = '', tip = `${i + 1}. ${n}: ${plural(cnt[i], 'property', 'properties')}, owned by the ${RN(r)}. Click to ${on ? 'show all' : 'filter'}.`;
    return `<g class="q54-bar${dim ? ' dim' : ''}${on ? ' on' : ''}" data-act="rqS76" data-v="${i}" data-tip="${esc(tip)}" tabindex="0" role="button" aria-label="${esc(tip)}"><rect x="${cx - gw / 2 + 3}" y="${T - 18}" width="${gw - 6}" height="${ih + 18}" class="q54-hit" rx="10"/><rect x="${cx - bw / 2}" y="${y(cnt[i])}" width="${bw}" height="${Math.max(2, T + ih - y(cnt[i]))}" rx="7" fill="${BSTEPS[i][3] ? '#8B5CF6' : '#6366F1'}"/><text x="${cx}" y="${y(cnt[i]) - 7}" text-anchor="middle" class="m59-bv">${cnt[i]}</text><text x="${cx}" y="${H - B + 18}" text-anchor="middle" class="q54-xl">${esc(l1)}</text>${l2 ? `<text x="${cx}" y="${H - B + 32}" text-anchor="middle" class="q54-xl">${esc(l2)}</text>` : ''}<text x="${cx}" y="${H - B + 34}" text-anchor="middle" class="rq76-r">${esc(SH[i][1])}</text></g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Properties by step">${grid}${bars}</svg>`; }
VIEWS.ret.pages.rq = function rqPage76(){ const all = rqAll76(), xs = rqRows76(), c = patch => swap57(patch, () => rqRows76().length), scs = [...new Set(all.map(p => p.sc))];
  const full = all.filter(p => p.b.ev.length >= EVID.length).length, pct = all.length ? full / all.length * 100 : 0, mods = all.filter(p => p.b.mod), mode = a => { const m = {}; a.forEach(x => m[x] = (m[x] || 0) + 1); return Object.keys(m).sort((x, y) => m[y] - m[x])[0] || '–'; }, pre = mode(mods.map(p => p.b.mod.pre)), post = mode(mods.map(p => p.b.mod.post));
  const side = `<div class="rq76-ov"><div class="rq76-c"><span class="rq76-i">${ico('home', 22)}</span><div><b>${all.length}</b><small>Properties in the queue</small></div></div>
    <div class="rq76-c"><span class="rq76-ring">${ring69([['Full evidence', full, '#10B981'], ['Missing evidence', all.length - full, '#E2E8F0']], pc(pct), '', 66, 14)}</span><div><b class="sm">Have all RdSAP evidence</b><small>${full} of ${all.length}, ${EVID.length} items each</small></div></div>
    <div class="rq76-c"><span class="rq76-epc">${pre} → ${post}</span><div><b class="sm">Most common EPC progress</b><small>${mods.length ? `current to projected, ${plural(mods.length, 'property', 'properties')} modelled` : 'none modelled yet'}</small></div></div></div>`;
  const bar = fbar57({id:'rq', qk:'f', qv:['rqq'], ph:'Search a property, postcode or reference', nf:(S.f.rqs !== '' ? 1 : 0) + (S.f.rqc ? 1 : 0) + (S.f.rqt ? 1 : 0), clr:'rqClr76', count:plural(xs.length, 'property', 'properties'),
    cols:[{t:'Step', opts:[{a:'rqS76', v:'', n:'All steps', c:c({rqs:''}), on:S.f.rqs === ''}, ...BSTEPS.map((s, i) => ({a:'rqS76', v:String(i), n:rqName76(i), c:c({rqs:String(i)}), on:S.f.rqs === String(i)}))]},
      {t:'Status', opts:[{a:'rqT76', v:'', n:'All statuses', c:c({rqt:''}), on:!S.f.rqt}, ...Object.entries(RQS76).map(([k, [n]]) => ({a:'rqT76', v:k, n, c:c({rqt:k}), on:S.f.rqt === k}))]},
      {t:'Scheme', opts:[{a:'rqC76', v:'', n:'All schemes', c:c({rqc:''}), on:!S.f.rqc}, ...scs.map(id => ({a:'rqC76', v:id, n:scOf(id).n, c:c({rqc:id}), on:S.f.rqc === id}))]}],
    chips:[...(S.f.rqs !== '' ? [['rqS76', '', rqName76(+S.f.rqs)]] : []), ...(S.f.rqt ? [['rqT76', '', RQS76[S.f.rqt][0]]] : []), ...(S.f.rqc ? [['rqC76', '', scOf(S.f.rqc).n]] : [])]});
  const row = p => { const i = rqIx76(p), role = i < BSTEPS.length ? BSTEPS[i][2] : 'sad', pk = ROLES[role][1], ev = p.b.ev.length, evc = ev >= EVID.length ? 'ok' : ev >= EVID.length / 2 ? 'bk' : 'bl', st = rqSt76(p), [sl, sc] = RQS76[st];
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="prRet" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(p.pc || '')}, ${esc(scOf(p.sc).n)}</small></td><td><span class="rq76-step">${esc(rqName76(i))}</span></td><td class="rq76-who"><div class="p69">${PEO[pk] ? av(pk, 30) : ''}<div><b>${esc(RP(role))}</b><small>${esc(RN(role))}</small></div></div></td><td><span class="rd55-p ${evc}">${ev} of ${EVID.length}</span></td><td>${p.b.mod ? `<span class="rq76-epcp">${p.b.mod.pre} → ${p.b.mod.post}</span>` : '<span class="rd55-dash" title="Not modelled yet">–</span>'}</td><td><span class="m59-st" style="color:#334155"><i style="background:${sc}"></i>${sl}</span></td><td><button type="button" class="rd56-tlb" data-act="prRet" data-v="${p.id}">View${ico('chev', 13, 2.4)}</button></td></tr>`; };
  return trBar() + oph('Review and design queue', 'Every property in the Assess and design phase, the step it is on and who has it. Reviews go to the Approvals inbox.') + visNote()
    + `<div class="m59-g rq76-g"><section class="rsec q54-c m59-c1"><div class="q54-ch"><h3>${ico('chart', 17)}By step</h3><div class="q54-leg" style="margin:0"><span><i style="background:#6366F1"></i>Work step</span><span><i style="background:#8B5CF6"></i>Approval step</span></div></div>${rqChart76()}</section><section class="rsec q54-c m59-c3"><div class="q54-ch"><h3>${ico('grid', 17)}Queue overview</h3></div>${side}</section></div>`
    + bar + `<section class="rd55"><div class="rd55-w"><table class="rd55-t rq76-t"><thead><tr><th>Property</th><th>Current step</th><th>Assigned to</th><th>RdSAP evidence</th><th>EPC progress</th><th>Status</th><th><span class="sr">Next action</span></th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="7">${empty(all.length ? 'No property matches the search or the filters.' : 'No properties in Assess and design.')}</td></tr>`}</tbody></table></div></section>`; };
A.rqS76 = el => { const v = el.dataset.v; S.f.rqs = el.closest('svg') && S.f.rqs === v ? '' : v; re57(); };
A.rqT76 = el => { S.f.rqt = el.dataset.v; re57(); };
A.rqC76 = el => { S.f.rqc = el.dataset.v; re57(); };
A.rqClr76 = () => { S.f.rqs = ''; S.f.rqt = ''; S.f.rqc = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.25') v.url = 'https://claude.ai/artifact/FyrAHkSiBooNiT8g2yEEtV'; } });
VERSIONS.push({v:'v5.26', date:TODAY, major:false, current:true, url:null, title:'In assessment as a queue dashboard', sum:'In assessment shows properties by step with the owner of each step, a queue overview (properties, RdSAP evidence, EPC progress), the search bar with filters by step, status and scheme, and a table with step, owner, evidence, EPC progress and status.', steps:[]});


/* =================== v5.27: With the client (survey pack and client systems) in the new design, without charts =================== */
S.f.pkq = ''; S.f.pksy = ''; S.f.pkw = ''; S.f.pkc = '';
const pkWho77 = p => p.csTodo ? 'us' : p.ph === 'C. Client approval' ? 'client' : 'checks';
const PKW77 = {us:['Us', 'Us: update the client system', '#2563EB', 'ap'], client:['The client', 'Waiting on the client', '#7C3AED', 'pv'], checks:['Our checks', 'Our own checks first', '#059669', 'ok']};
const pkAll77 = () => DB.pr.filter(p => ['B. Assess and design', 'C. Client approval'].includes(p.ph));
const pkRows77 = () => { const q = norm(S.f.pkq); return pkAll77().filter(p => (!S.f.pksy || ptOf(p).sys === S.f.pksy) && (!S.f.pkw || pkWho77(p) === S.f.pkw) && (!S.f.pkc || p.sc === S.f.pkc) && (!q || norm(`${p.ad} ${p.id} ${p.pc} ${p.ref} ${scOf(p.sc).n} ${ptOf(p).sys}`).includes(q))); };
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


/* =================== v5.28: status labels shrink to their icon when there is no room; column headers line up =================== */
function heads78(){ document.querySelectorAll('.mbr.uy-th').forEach(r => { const cs = [...r.querySelectorAll(':scope > .mbc')]; if(r.dataset.h78) return; r.dataset.h78 = '1';
  const two = cs.some(c => { const b = c.querySelector(':scope > b'), s = c.querySelector(':scope > small'); return b && s && b.textContent.trim() && s.textContent.trim(); });
  cs.forEach(c => { let b = c.querySelector(':scope > b'), s = c.querySelector(':scope > small'); if(!b){ b = document.createElement('b'); c.prepend(b); } if(!s){ s = document.createElement('small'); c.appendChild(s); }
    if(!b.textContent.trim() && s.textContent.trim()){ b.textContent = s.textContent; s.textContent = ''; }
    if(two && !s.textContent.trim()) s.innerHTML = '&nbsp;'; }); }); }
const PILL78 = '.lst64 .pill, .rd55 .rd55-p, .rd55 .pill';
function pills78(){ document.querySelectorAll(PILL78).forEach(p => { const t = p.textContent.trim(); if(t && !p.title) p.title = t; if(t && !p.getAttribute('aria-label')) p.setAttribute('aria-label', t); p.classList.remove('ico78'); });
  document.querySelectorAll('.lst64').forEach(l => { if(!l.offsetParent) return; const ps = [...l.querySelectorAll('.mbr:not(.uy-th) .pill')]; if(ps.some(p => { const c = p.closest('.mbc') || p.parentElement, cr = c.getBoundingClientRect(), pr = p.getBoundingClientRect(); return pr.right > cr.right + 1 || p.scrollWidth > p.clientWidth + 1; })) ps.forEach(p => p.classList.add('ico78')); });
  document.querySelectorAll('.rd55-w').forEach(w => { if(!w.offsetParent) return; if(w.scrollWidth > w.clientWidth + 2) w.querySelectorAll('.rd55-p, .pill').forEach(p => { if(p.closest('td') && !p.closest('td').classList.contains('rd55-pr')) p.classList.add('ico78'); }); }); }
const fit78 = () => { try { heads78(); pills78(); } catch(e) {} };
{ const r78 = render; render = (...x) => { const o = r78(...x); fit78(); requestAnimationFrame(fit78); return o; }; }
{ let t78; addEventListener('resize', () => { clearTimeout(t78); t78 = setTimeout(fit78, 120); }); }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.27') v.url = 'https://claude.ai/artifact/3sVFC2V5UqWpym9ndw4TPf'; } });
VERSIONS.push({v:'v5.28', date:TODAY, major:false, current:true, url:null, title:'Status labels that fit, aligned headers', sum:'When a list or table runs out of room, status labels show only their icon, with the text on hover. Column headers always put the name on the first line, and when any column has a second line every column keeps it, so the rows line up.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.28') v.url = 'https://claude.ai/artifact/85fxt2CXnKAQAaePD32qkm'; } });
VERSIONS.push({v:'v5.29', date:TODAY, major:false, current:true, url:null, title:'Calendars in the Assessment bookings design', sum:'Meetings and My tasks keep their calendars and side panels but use the Assessment bookings look: white cards, soft day cells, the day outlined in indigo, and tinted event chips by status.', steps:[]});

/* =================== v5.30: Alerts (Needs attention) in the new design: key figures, search with filters, clean cards =================== */
const ALT80 = {'Over time':['ta', 'clock'], 'Margin below target':['tred', 'trend'], 'Follow up':['tb', 'send'], 'Material order':['ta', 'cart'], 'Subcontractor payment':['tb', 'money'], 'Variation':['tred', 'edit'], 'Additional cost':['tred', 'money'], 'Design review':['tb', 'check'], 'Assessment review':['tb', 'check']};
const ALSUB80 = {'Over time':'jobs over the phase limit', 'Margin below target':'forecast under the scheme target', 'Follow up':'tasks you handed out', 'Material order':'orders to approve', 'Subcontractor payment':'payments to approve', 'Variation':'variations to approve', 'Additional cost':'costs to approve'};
function alerts80(){ const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || !/:(dec|wait)$/.test(gKey64()) || op.querySelector('.al80-w')) return; const isW = /:wait$/.test(gKey64());
  const cards = [...op.querySelectorAll(':scope > .ds-exc')]; if(!cards.length) return; const k = gKey64(), st = S.g64[k] = S.g64[k] || {q:'', st:[], gr:[], open:false};
  cards.forEach(c => { const p = c.querySelector('.ds-exh .pill'), t = p ? p.textContent.trim() : 'Other'; c.dataset.al80 = t; const ic = (ALT80[t] || ['tb', 'alert'])[1]; if(!c.querySelector('.al80-i')){ const h = c.querySelector('.ds-exh'); h && h.insertAdjacentHTML('afterbegin', `<span class="al80-i ${(ALT80[t] || ['tb'])[0]}">${ico(ic, 17, 2.2)}</span>`); } });
  const types = [...new Set(cards.map(c => c.dataset.al80))], cnt = t => cards.filter(c => c.dataset.al80 === t).length, h = op.querySelector('.op-h');
  const kp = `<div class="cstats ov-k m59-k al80-k">${stat('tk', isW ? 'Approvals' : 'Alerts', cards.length, isW ? 'waiting on you' : 'need a decision from you')}${types.slice(0, 3).map(t => stat((ALT80[t] || ['tb'])[0], t, cnt(t), ALSUB80[t] || 'to review', 'al80', t)).join('')}</div>`;
  h.insertAdjacentHTML('afterend', kp + '<div class="g64-w al80-w"></div>');
  const wrap = op.querySelector('.al80-w');
  const paint = () => { const q = norm(st.q), match = (c, o) => { const s2 = o || st.st; return (!q || norm(c.textContent).includes(q)) && (!s2.length || s2.includes(c.dataset.al80)); };
    cards.forEach(c => c.classList.toggle('g64-hide', !match(c))); const nf = st.st.length, shown = cards.filter(c => !c.classList.contains('g64-hide')).length;
    const panel = `<div class="v5-fp v5-noanim"><div class="v5-fph"><b>Filter by</b><button class="v5-fclr" data-g64="clr" ${nf ? '' : 'disabled'}>Clear all</button></div><div class="v5-fcols"><div class="v5-fc"><small>Type</small><button class="v5-fo${!nf ? ' on' : ''}" data-g64="all" data-c="st"><span>${isW ? 'All approvals' : 'All alerts'}</span><small>${cards.filter(c => match(c, [])).length}</small></button>${types.map(t => `<button class="v5-fo${st.st.includes(t) ? ' on' : ''}" data-g64="opt" data-c="st" data-o="${esc(t)}"><span>${esc(t)}</span><small>${cards.filter(c => match(c, [t])).length}</small></button>`).join('')}</div></div></div>`;
    wrap.innerHTML = `<div class="v5-fs"><div class="v5-fsb${st.open ? ' open' : ''}">${ico('search', 18)}<input type="search" data-g64="q" placeholder="${isW ? 'Search an order, property, supplier or amount' : 'Search a property, task, person or reason'}" value="${esc(st.q)}" aria-label="Search alerts"><button class="v5-fbtn${nf ? ' on' : ''}" data-g64="tog" title="Filters" aria-label="Filters" aria-expanded="${st.open}">${ico('filter', 17)}${nf ? `<em>${nf}</em>` : ''}</button></div>${st.open ? panel : ''}</div><div class="v5-fchips">${nf ? st.st.map(o => `<button class="v5-fchip" data-g64="opt" data-c="st" data-o="${esc(o)}">${esc(o)}${ico('x', 12)}</button>`).join('') + '<button class="v5-fclr" data-g64="clr">Clear all</button>' : ''}<span class="v5-fn">${plural(shown, isW ? 'approval' : 'alert', isW ? 'approvals' : 'alerts')}</span></div>`;
    op.querySelectorAll('.al80-k [data-act=al80]').forEach(b => b.closest('.stat') && b.closest('.stat').classList.toggle('ds-on', st.st.length === 1 && st.st[0] === b.dataset.v)); };
  wrap._paint = paint; wrap._st = st; paint(); }
A.al80 = el => { const st = S.g64[gKey64()]; if(!st) return; const v = el.dataset.v; st.st = st.st.length === 1 && st.st[0] === v ? [] : [v]; const w = [...document.querySelectorAll('.al80-w')].find(x => x.offsetParent); w && w._paint(); };
{ const r80 = render; render = (...x) => { const o = r80(...x); try { alerts80(); } catch(e) { console.warn(e); } return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.29') v.url = 'https://claude.ai/artifact/Joq3o4tdhZF93TvcEZRx7q'; } });
VERSIONS.push({v:'v5.30', date:TODAY, major:false, current:true, url:null, title:'Alerts and Approvals in the new design', sum:'Needs attention and Approvals keep every alert, reason and action, and adds key figures by type, the search bar with a type filter, and clean cards with an icon instead of the coloured side bar.', steps:[]});


/* =================== v5.31: Home in the new design: card headers with icons, status labels with icons, scheme margin bars =================== */
function home81(){ const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || !/:ovw$/.test(gKey64())) return; const g = op.querySelector('.ov-g'); if(!g || g.dataset.h81) return; g.dataset.h81 = '1';
  const IC = {'Needs you now':'alert', 'My day':'clock', 'Schemes at a glance':'chart', 'Work in progress':'grid', 'Money':'money'};
  g.querySelectorAll('.ov-card .ov-h h3').forEach(h => { const t = h.textContent.trim(); h.insertAdjacentHTML('afterbegin', `<span class="hm81-i">${ico(IC[t] || 'grid', 16, 2.2)}</span>`); });
  g.querySelectorAll('.ov-card').forEach(c => { const h = c.querySelector('.ov-h h3'); if(!h || !/Schemes at a glance/.test(h.textContent)) return;
    c.querySelectorAll('.ov-r').forEach(r => { const n = r.querySelector('.ov-num'); if(!n) return; const v = parseFloat(n.textContent), t = parseFloat((n.querySelector('small') || {}).textContent.replace(/[^0-9.]/g, '')); if(isNaN(v)) return; const mx = 50, ok = isNaN(t) || v >= t;
      n.insertAdjacentHTML('beforebegin', `<span class="hm81-b" title="Forecast margin ${v}%${isNaN(t) ? '' : `, target ${t}%`}"><i style="width:${Math.min(100, v / mx * 100)}%;background:${ok ? '#6366F1' : '#F97316'}"></i>${isNaN(t) ? '' : `<em style="left:${Math.min(100, t / mx * 100)}%"></em>`}</span>`); }); }); }
{ const r81 = render; render = (...x) => { const o = r81(...x); try { home81(); } catch(e) { console.warn(e); } return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.30') v.url = 'https://claude.ai/artifact/84navqBkeKiXdj1EKMX7tr'; } });
VERSIONS.push({v:'v5.31', date:TODAY, major:false, current:true, url:null, title:'Home in the new design', sum:'Home keeps every card, row and action, with the new card style, icons in the card headers, status labels with icons, and a margin bar with its target for each scheme.', steps:[]});


/* =================== v5.32: Properties in the new design: key figures, phase colours, group headers =================== */
const PHC82 = {'A':['#E2E8F0', '#334155', '#64748B'], 'B':['#E0E7FF', '#3730A3', '#6366F1'], 'C':['#EDE9FE', '#5B21B6', '#8B5CF6'], 'D':['#FEF3C7', '#92400E', '#F59E0B'], 'E':['#CFFAFE', '#155E75', '#06B6D4'], 'F':['#DCFCE7', '#166534', '#10B981'], 'P':['#D1FAE5', '#065F46', '#059669'], 'X':['#F1F5F9', '#64748B', '#94A3B8']};
const phK82 = t => { t = (t || '').trim(); return /^[A-F]\./.test(t) ? t[0] : /^Paid/.test(t) ? 'P' : /^Cancel/.test(t) ? 'X' : ''; };
function props82(){ const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op) return; const h1 = op.querySelector('.op-h h1'); if(!h1 || h1.textContent.trim() !== 'Properties' || !op.querySelector(':scope > .gh')) return;
  op.querySelectorAll(':scope > .gh').forEach(g => { if(g.dataset.p82) return; g.dataset.p82 = '1'; const k = phK82(g.firstChild ? g.firstChild.textContent : g.textContent); if(k){ g.classList.add('gh82'); g.style.setProperty('--ph', PHC82[k][2]); g.insertAdjacentHTML('afterbegin', `<i class="gh82-d"></i>`); } });
  op.querySelectorAll('.lst64 .pill').forEach(p => { const k = phK82(p.textContent); if(k && !p.dataset.p82){ p.dataset.p82 = '1'; p.style.setProperty('background', PHC82[k][0], 'important'); p.style.setProperty('color', PHC82[k][1], 'important'); p.classList.add('ph82'); } });
  if(!op.querySelector('.p82-k')){ const ps = DB.pr.filter(p => p.ph !== 'Cancelled'), open = ps.filter(p => OPENP.includes(p.ph)), lt = open.filter(p => late(p)), below = ps.filter(p => pIdx(p.ph) >= 2 && OPENP.includes(p.ph) && pMoney(p).mgp < scOf(p.sc).set.mg), inst = ps.filter(p => p.ph === 'E. Install');
    op.querySelector('.op-h').insertAdjacentHTML('afterend', `<div class="cstats ov-k m59-k p82-k">${stat('tk', 'Open properties', open.length, `of ${plural(ps.length, 'property', 'properties')}`)}${stat(lt.length ? 'ta' : 'tg', 'Over the phase limit', lt.length, lt.length ? 'need a push' : 'all on time')}${stat(below.length ? 'tred' : 'tg', 'Margin below target', below.length, below.length ? 'forecast under target' : 'all on or above')}${stat('tb', 'In install', inst.length, 'phase E right now')}</div>`); } }
{ const r82 = render; render = (...x) => { const o = r82(...x); try { props82(); } catch(e) { console.warn(e); } return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.31') v.url = 'https://claude.ai/artifact/PZFm6zJyRUkWdGfWHH8qD8'; } });
VERSIONS.push({v:'v5.32', date:TODAY, major:false, current:true, url:null, title:'Properties in the new design', sum:'Properties keeps its list, groups and search, and adds key figures (open, over the phase limit, margin below target, in install), a colour per phase on the labels and group headers.', steps:[]});

/* v5.33: card headers of the Director reports get the icon tile */
function dir83(){ const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || !/^dir:d/.test(gKey64())) return; op.querySelectorAll('.ov-card .ov-h h3').forEach(h => { if(h.querySelector('.hm81-i')) return; const t = h.textContent; h.insertAdjacentHTML('afterbegin', `<span class="hm81-i">${ico(/wait/i.test(t) ? 'clock' : /won|money|owed|spend|margin/i.test(t) ? 'money' : /stage|days/i.test(t) ? 'chart' : 'grid', 16, 2.2)}</span>`); h.style.display = 'flex'; h.style.alignItems = 'center'; h.style.gap = '8px'; }); }
{ const r83 = render; render = (...x) => { const o = r83(...x); try { dir83(); } catch(e) {} return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.32') v.url = 'https://claude.ai/artifact/7vvQZufW2V5VBHzHRtCyhJ'; } });
VERSIONS.push({v:'v5.33', date:TODAY, major:false, current:true, url:null, title:'Director reports in the new design', sum:'Business overview and the other Director reports keep every chart and list, with the card style, icons in the headers, and the app colours: indigo bars with the current period in solid indigo, orange where a stage is over its limit, and a brighter palette in the donuts.', steps:[]});

/* =================== v5.34: Operations as the delivery exceptions dashboard =================== */
S.f.oxq = ''; S.f.oxi = ''; S.f.oxs = ''; S.f.oxt = 'w';
const OXT = {od:['Overdue', '#EF4444', 'tred', 'alert'], watch:['Phase limit watch', '#F59E0B', 'ta', 'clock'], hold:['Hold point', '#6366F1', 'tb', 'pause'], upd:['System update', '#10B981', 'tg', 'globe']};
const oxIss = p => { const l = LIMIT[p.ph], d = daysIn(p), out = []; if(late(p)) out.push('od'); else if(l && d >= l * .7) out.push('watch'); if(holdOpen(p) && (p.hold || p.hold2)) out.push('hold'); if(p.csTodo) out.push('upd'); return out; };
const oxNext = (p, k) => k === 'hold' ? (p.hold || p.hold2 || 'Hold point decision') : k === 'upd' ? p.csTodo : ((phGate(p).miss || [])[0] || `Finish ${p.ph}`);
const oxAll = () => DB.pr.filter(p => OPENP.includes(p.ph)).map(p => ({p, is:oxIss(p)})).filter(x => x.is.length);
const oxRows = () => { const q = norm(S.f.oxq); return oxAll().filter(x => (!S.f.oxi || x.is.includes(S.f.oxi)) && (!S.f.oxs || x.p.sc === S.f.oxs) && (!q || norm(`${x.p.ad} ${x.p.id} ${x.p.pc} ${scOf(x.p.sc).n}`).includes(q))).sort((a, b) => Object.keys(OXT).indexOf(a.is[0]) - Object.keys(OXT).indexOf(b.is[0]) || daysIn(b.p) - daysIn(a.p)); };
function oxTrend(cur){ const wk = S.f.oxt !== 'm', n = 6, r = rnd69('ops' + (wk ? 'w' : 'm')), lab = Array.from({length:n}, (_, i) => { const d = fromIso(TODAY); if(wk){ d.setDate(d.getDate() - (n - 1 - i) * 7); return d.toLocaleDateString('en-GB', {day:'numeric', month:'short'}); } d.setMonth(d.getMonth() - (n - 1 - i)); return d.toLocaleDateString('en-GB', {month:'short'}); });
  const ks = ['od', 'watch', 'hold', 'upd'], data = lab.map((_, i) => ks.map(k => i === n - 1 ? cur[k] : Math.max(0, Math.round(cur[k] * (wk ? .6 + r() * .9 : 1.2 + r() * 1.6))))), mx = Math.max(4, Math.ceil(Math.max(...data.map(d => sum(d, x => x))) / 4) * 4), W = 560, H = 230, L = 30, B = 30, T = 14, ih = H - B - T, gw = (W - L - 6) / n, bw = Math.min(46, gw * .55), y = v => v / mx * ih;
  const grid = [0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - 6}" y1="${T + ih - ih * f}" y2="${T + ih - ih * f}" class="q54-gl"/><text x="${L - 6}" y="${T + ih - ih * f + 4}" text-anchor="end" class="q54-ax">${Math.round(mx * f)}</text>`).join('');
  const bars = data.map((d, i) => { const cx = L + gw * i + gw / 2; let acc = 0; return `<g data-tip="${esc(`${lab[i]}: ${ks.map((k, j) => `${OXT[k][0]} ${d[j]}`).join(', ')}`)}">${d.map((v, j) => { const h0 = y(v), yy = T + ih - acc - h0; acc += h0; return v ? `<rect x="${cx - bw / 2}" y="${yy}" width="${bw}" height="${Math.max(0, h0 - 1)}" fill="${OXT[ks[j]][1]}" rx="3"/>` : ''; }).join('')}<text x="${cx}" y="${H - 10}" text-anchor="middle" class="q54-xl">${lab[i]}</text></g>`; }).join('');
  return `<svg class="q54-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Exceptions over time">${grid}${bars}</svg>`; }
VIEWS.dir.pages.dops = function dOps84(){ const all = oxAll(), xs = oxRows(), cur = {}; Object.keys(OXT).forEach(k => { cur[k] = all.filter(x => x.is.includes(k)).length; }); const tot = sum(Object.values(cur), v => v), c = patch => swap57(patch, () => oxRows().length), scs = [...new Set(all.map(x => x.p.sc))];
  const k = Object.entries(OXT).map(([key, [n, , tone]]) => stat(tone, n, cur[key], key === 'od' ? 'over the phase limit' : key === 'watch' ? 'close to the limit' : key === 'hold' ? 'waiting on a decision' : 'client system to update', 'ox84', key, S.f.oxi === key)).join('');
  const donut = ring69(Object.entries(OXT).map(([key, [n, col]]) => [n, cur[key], col]), String(tot), 'total', 170, 22);
  const leg = Object.entries(OXT).map(([key, [n, col]]) => `<div><span style="background:${col}"></span><b>${n}</b><em>${tot ? Math.round(cur[key] / tot * 100) : 0}%</em><i>${cur[key]}</i></div>`).join('');
  const bar = fbar57({id:'ops', qk:'f', qv:['oxq'], ph:'Search a property, postcode or scheme', nf:(S.f.oxi ? 1 : 0) + (S.f.oxs ? 1 : 0), clr:'oxClr', count:plural(xs.length, 'property', 'properties'),
    cols:[{t:'Issue', opts:[{a:'ox84', v:'', n:'All issues', c:c({oxi:''}), on:!S.f.oxi}, ...Object.entries(OXT).map(([v, [n]]) => ({a:'ox84', v, n, c:c({oxi:v}), on:S.f.oxi === v}))]},
      {t:'Scheme', opts:[{a:'oxS', v:'', n:'All schemes', c:c({oxs:''}), on:!S.f.oxs}, ...scs.map(id => ({a:'oxS', v:id, n:scOf(id).n, c:c({oxs:id}), on:S.f.oxs === id}))]}],
    chips:[...(S.f.oxi ? [['ox84', '', OXT[S.f.oxi][0]]] : []), ...(S.f.oxs ? [['oxS', '', scOf(S.f.oxs).n]] : [])]});
  const row = ({p, is}) => { const k1 = is[0], [n, , tone, ic] = OXT[k1], d = daysIn(p);
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="ficha" data-v="${p.id}">${esc(p.ad)}</button><small>${p.id}, ${esc(p.ph)}</small></td><td>${scPill55(p.sc)}</td><td class="ox84-is"><span class="rd55-p ${tone === 'tred' ? 'bl' : tone === 'ta' ? 'bk' : tone === 'tb' ? 'ap' : 'ok'}">${ico(ic, 13, 2.2)}${n}</span>${is.length > 1 ? `<small>+ ${is.slice(1).map(x => OXT[x][0].toLowerCase()).join(', ')}</small>` : ''}</td><td class="m59-n ${late(p) === 'red' ? 'rf-od' : late(p) ? 'lt79' : ''}">${d} days<small>limit ${LIMIT[p.ph] || '–'}</small></td><td class="ox84-n">${esc(oxNext(p, k1))}</td><td><button type="button" class="rd56-tlb" data-act="ficha" data-v="${p.id}">View details${ico('chev', 12, 2.4)}</button></td></tr>`; };
  return oph('Operations', 'Delivery exceptions: properties over or close to their phase limit, hold points and client systems waiting on an update.')
    + `<div class="cstats ov-k m59-k">${k}</div>`
    + `<div class="m59-g ox84-g"><section class="rsec q54-c"><div class="q54-ch"><h3>${ico('chart', 17)}By issue type</h3></div><div class="ox84-d">${donut}<div class="ox84-l">${leg}</div></div></section><section class="rsec q54-c"><div class="q54-ch"><h3>${ico('trend', 17)}Trend over time</h3><div class="q54-tg">${[['w', 'Weekly'], ['m', 'Monthly']].map(([v, n]) => `<button type="button" data-act="oxT" data-v="${v}" aria-pressed="${S.f.oxt === v}">${n}</button>`).join('')}</div></div><div class="q54-leg">${Object.values(OXT).map(([n, col]) => `<span><i style="background:${col}"></i>${n}</span>`).join('')}</div>${oxTrend(cur)}</section></div>`
    + `<div class="qc-h"><h2>${ico('alert', 18)}Properties requiring attention <span class="q54-cnt">${all.length}</span></h2></div>` + bar
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t ox84-t"><thead><tr><th>Property</th><th>Scheme</th><th>Issue</th><th>Time in phase</th><th>Next step</th><th><span class="sr">Details</span></th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="6">${empty(all.length ? 'Nothing matches the search or the filters.' : 'No exceptions right now.')}</td></tr>`}</tbody></table></div></section>`; };
A.ox84 = el => { S.f.oxi = el.closest('.stat') && S.f.oxi === el.dataset.v ? '' : el.dataset.v; re57(); };
A.oxS = el => { S.f.oxs = el.dataset.v; re57(); };
A.oxT = el => { S.f.oxt = el.dataset.v; re57(); };
A.oxClr = () => { S.f.oxi = ''; S.f.oxs = ''; re57(); };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.33') v.url = 'https://claude.ai/artifact/YHAhjsJvMFBCZQ3wPtwdmA'; } });
VERSIONS.push({v:'v5.34', date:TODAY, major:false, current:true, url:null, title:'Operations as delivery exceptions', sum:'Operations shows key figures for overdue, phase limit watch, hold points and system updates, a donut by issue type, a weekly or monthly trend, and the properties requiring attention with search, filters, issue, time in phase and next step.', steps:[]});


/* =================== v5.35: the Queue overview panel next to Meetings, Assessment bookings and Quality and compliance calendars =================== */
const ovTile85 = (ic, big, sub) => `<div class="rq76-c"><span class="rq76-i">${ico(ic, 22)}</span><div><b>${big}</b><small>${sub}</small></div></div>`;
const ovRing85 = (ok, tot, t, sub, col = '#10B981') => `<div class="rq76-c"><span class="rq76-ring">${ring69([['Done', ok, col], ['Rest', Math.max(0, tot - ok), '#E2E8F0']], tot ? pc(ok / tot * 100) : '–', '', 66, 14)}</span><div><b class="sm">${t}</b><small>${sub}</small></div></div>`;
const ovPill85 = (pill, t, sub) => `<div class="rq76-c"><span class="rq76-epc">${pill}</span><div><b class="sm">${t}</b><small>${sub}</small></div></div>`;
const ovBox85 = inner => `<div class="ov85"><div class="q54-ch"><h3>${ico('grid', 17)}Overview</h3></div><div class="rq76-ov">${inner}</div></div>`;
function mtOv85(){ const m0 = monday(TODAY), m1 = addDays(m0, 6), wk = DB.mt.filter(m => m.d >= m0 && m.d <= m1), acts = DB.tk.filter(tkIsMt), done = acts.filter(k => k.done).length, nx = DB.mt.filter(m => m.d > TODAY || (m.d === TODAY && m.h >= '10:42')).sort((a, b) => (a.d + a.h) < (b.d + b.h) ? -1 : 1)[0];
  return ovBox85(ovTile85('users', wk.length, `${wk.length === 1 ? 'Meeting' : 'Meetings'} this week`) + ovRing85(done, acts.length, 'Action points closed', `${done} of ${acts.length} from the meetings`) + (nx ? ovPill85(`${fromIso(nx.d).toLocaleDateString('en-GB', {weekday:'short'})} ${nx.h}`, 'Next meeting', `${esc(nx.ty)}, ${fmtDy(nx.d)}`) : '')); }
function mtOvInject85(){ const op = [...document.querySelectorAll('.op')].find(x => x.offsetParent); if(!op || !/:mtg$/.test(gKey64())) return; op.querySelectorAll('.rf-cals').forEach(s => { if(!s.querySelector('.ov85')) s.insertAdjacentHTML('afterbegin', mtOv85()); });
  op.querySelectorAll(':scope > .rf-tgw').forEach(w => { const g = document.createElement('div'); g.className = 'mt85-g'; w.parentNode.insertBefore(g, w); g.appendChild(w); g.insertAdjacentHTML('beforeend', `<aside class="rsec q54-c mt85-s">${mtOv85()}</aside>`); }); }
{ const r85 = render; render = (...x) => { const o = r85(...x); try { mtOvInject85(); } catch(e) { console.warn(e); } return o; }; }
{ const oS = bkSide70; bkSide70 = () => { const m0 = addDays(D0, (S.f.bko || 0) * 7), m1 = addDays(m0, 6), xs = bkList(), wk = calEvts().filter(p => p.b.on >= m0 && p.b.on <= m1), booked = xs.filter(p => bkSt(p) !== 'tobook').length, nx = calEvts().filter(p => p.b.on >= TODAY && ['booked', 'revisit'].includes(bkSt(p))).sort((a, b) => (a.b.on + (a.b.h || '')) < (b.b.on + (b.b.h || '')) ? -1 : 1)[0];
  return ovBox85(ovTile85('cal', wk.length, `${wk.length === 1 ? 'Visit' : 'Visits'} this week`) + ovRing85(booked, xs.length, 'Booked', `${booked} of ${xs.length} assessments have a date`, '#6366F1') + (nx ? ovPill85(`${fromIso(nx.b.on).toLocaleDateString('en-GB', {weekday:'short'})} ${nx.b.h || ''}`, 'Next visit', `${esc(nx.ad)}, ${esc(PEO[nx.b.who] ? PEO[nx.b.who].n : '')}`) : '')) + `<div style="height:14px"></div>` + oS(); }; }
{ const oN = qcNext60; qcNext60 = () => { const ok = DB.qc.filter(x => qcSt60(x) === 'ok').length, due = DB.qc.filter(x => qcSt60(x) !== 'ok').length, nx = DB.qc.filter(x => dDiff(x.exp) >= 0).sort((a, b) => a.exp < b.exp ? -1 : 1)[0];
  return ovBox85(ovTile85('shield', due, `${due === 1 ? 'Item' : 'Items'} expired or due in 60 days`) + ovRing85(ok, DB.qc.length, 'In date', `${ok} of ${DB.qc.length} accreditations and insurances`) + (nx ? ovPill85(`${dDiff(nx.exp)} days`, 'Next renewal', `${esc(nx.n)}, ${fmtDy(nx.exp)}`) : '')) + `<div style="height:14px"></div>` + oN(); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.34') v.url = 'https://claude.ai/artifact/XTch5Mgkaymn2oorLAcC9x'; } });
VERSIONS.push({v:'v5.35', date:TODAY, major:false, current:true, url:null, title:'Overview panel beside the calendars', sum:'Meetings, Assessment bookings and Quality and compliance show the Overview panel of In assessment beside their calendar: a count with an icon, a completion ring and the next item as a pill.', steps:[]});


/* =================== v5.36: every row of key figures in the Capacity and staffing card style =================== */
function kpi86(){ document.querySelectorAll('.cstats .stat').forEach(s => { if(s.classList.contains('k70')) return; s.classList.add('k70'); const lab = ((s.querySelector('small') || {}).textContent || '').toLowerCase(), t = ['tred', 'ta', 'tg', 'tb', 'tk'].find(c => s.classList.contains(c)) || 'tk';
  const ic = /overdue|expired|below|alert|risk|blocked|over the|hold/.test(lab) ? 'alert' : /propert|house|in close|in install|queue/.test(lab) ? 'home' : /meeting|staff|people|supplier/.test(lab) ? 'users' : /£|value|margin|quot|cost|invoic|spend|budget|owed|won|rate|payment/.test(lab) ? 'money' : /waiting|upcoming|due|soon|pending|book|today|next|to /.test(lab) ? 'clock' : /paid|done|complete|valid|approved|on target|matched|closed|assessed|in date/.test(lab) ? 'check' : t === 'tred' ? 'alert' : t === 'tg' ? 'check' : t === 'ta' ? 'clock' : 'grid';
  s.insertAdjacentHTML('afterbegin', `<span class="k70-i">${ico(ic, 19, 2.2)}</span>`); }); }
{ const r86 = render; render = (...x) => { const o = r86(...x); try { kpi86(); } catch(e) {} return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.35') v.url = 'https://claude.ai/artifact/FbM6p6e79kJfh9p9WJjfya'; } });
VERSIONS.push({v:'v5.36', date:TODAY, major:false, current:true, url:null, title:'Key figures in the Capacity and staffing style', sum:'Every row of key figures uses the Capacity and staffing card: a soft tint by status, an icon in a white tile, the number large and the label underneath.', steps:[]});


/* =================== v5.37: All tasks by team: a progress battery per team =================== */
function bat87(){ const op = document.querySelector('#a-tsk .op'); if(!op || !op.offsetParent || op.querySelector('.bt87')) return; const h = op.querySelector('.op-h'); if(!h) return;
  const tks = DB.tk.filter(k => !tkArch || !tkArch(k)), cur = S.f.ttm || '';
  const teams = [['', 'All teams'], ...APPS.filter(a => a[0] !== 'tsk').map(a => [a[0], a[1]])].map(([k, n]) => { const xs = k ? tks.filter(t => TEAM69(t.r) === k) : tks, d = xs.filter(t => t.done).length, od = xs.filter(t => !t.done && dDiff(t.due) < 0).length, op2 = xs.length - d - od; return {k, n, tot:xs.length, d, od, op:op2, pct:xs.length ? Math.round(d / xs.length * 100) : 0}; }).filter(t => t.tot || !t.k);
  const cell = t => { const w = x => (t.tot ? x / t.tot * 100 : 0).toFixed(1), col = t.pct >= 70 ? '#10B981' : t.pct >= 40 ? '#F59E0B' : '#EF4444';
    return `<button type="button" class="bt87-c${cur === t.k ? ' on' : ''}" data-act="ttm" data-v="${t.k}" title="${esc(`${t.n}: ${t.d} done, ${t.op} open, ${t.od} overdue`)}"><div class="bt87-h"><b>${esc(t.n)}</b><em style="color:${col}">${t.pct}%</em></div><div class="bt87-b" aria-label="${t.pct}% done"><span class="bt87-f"><i style="width:${w(t.d)}%;background:#10B981"></i><i style="width:${w(t.op)}%;background:#93C5FD"></i><i style="width:${w(t.od)}%;background:#F97316"></i></span><span class="bt87-cap"></span></div><small>${t.d} done · ${t.op} open · ${t.od} overdue</small></button>`; };
  h.insertAdjacentHTML('afterend', `<section class="rsec q54-c bt87"><div class="q54-ch"><h3>${ico('chart', 17)}Team progress</h3><div class="q54-leg" style="margin:0"><span><i style="background:#10B981"></i>Done</span><span><i style="background:#93C5FD"></i>Open</span><span><i style="background:#F97316"></i>Overdue</span></div></div><div class="bt87-g">${teams.map(cell).join('')}</div></section>`); }
{ const r87 = render; render = (...x) => { const o = r87(...x); try { bat87(); } catch(e) { console.warn(e); } return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.36') v.url = 'https://claude.ai/artifact/QwNuQFLTW3UAcQstvr1WdJ'; } });
VERSIONS.push({v:'v5.37', date:TODAY, major:false, current:true, url:null, title:'Team progress batteries', sum:'All tasks by team opens with a progress battery per team: done in green, open in blue and overdue in orange, with the percentage done; clicking a battery shows that team.', steps:[]});


/* =================== v5.38: Finance as the financial overview =================== */
const FCOL88 = ['#6366F1', '#F97316', '#10B981', '#06B6D4', '#EC4899', '#EAB308'];
VIEWS.dir.pages.dfin = function dFin88(){ const d = DD(), days = d.dr === 'y' ? 365 : 28, from = addDays(TODAY, -days), ps = fPr(), pids = new Set(ps.map(p => p.id)), inP = on => on >= from && on <= TODAY;
  const ors = DB.or.filter(o => !['Requested', 'Rejected'].includes(o.st) && inP(o.on) && o.al.some(a => pids.has(a.pr))), sps = DB.sp.filter(s => ['Approved', 'Paid'].includes(s.st) && inP(s.on) && pids.has(s.pr));
  const spend = sum(ors, o => o.amt) + sum(sps, s => s.amt), byT = {}; ors.forEach(o => { byT[o.ct] = (byT[o.ct] || 0) + o.amt; }); sps.forEach(s => { byT['Subcontract labour'] = (byT['Subcontract labour'] || 0) + s.amt; });
  const types = Object.entries(byT).sort((a, b) => b[1] - a[1]), bySup = {}; ors.forEach(o => { bySup[o.sup] = (bySup[o.sup] || 0) + o.amt; }); sps.forEach(s => { bySup[s.sub] = (bySup[s.sub] || 0) + s.amt; }); const sups = Object.entries(bySup).sort((a, b) => b[1] - a[1]);
  const mm = ps.filter(p => OPENP.includes(p.ph)).map(pMoney), bud = sum(mm, x => x.b), rem = Math.max(0, sum(mm, x => x.b - x.act - x.com));
  const clients = [...new Map(DB.sc.filter(s => ps.some(p => p.sc === s.id)).map(s => [s.cl, s])).values()].map(s => { const scIds = DB.sc.filter(x => x.cl === s.cl).map(x => x.id), inv = DB.inv.filter(v => scIds.includes(prOf(v.pr).sc)), paid = inv.filter(v => v.paid), late = inv.filter(v => !v.paid && dDiff(v.due) < 0), avg = paid.length ? Math.round(sum(paid, v => dDiff(v.paid) - dDiff(v.on)) / paid.length) : null, worst = late.length ? Math.max(...late.map(v => -dDiff(v.due))) : 0, terms = s.set.terms;
    return {n:s.cl, sc:DB.sc.filter(x => x.cl === s.cl).map(x => x.n).join(', '), avg, terms, worst, none:!inv.length, slow:avg != null && avg > terms}; });
  const delays = clients.filter(c => c.worst || c.slow).length;
  const meas = Object.keys(MEAS).map(m => { let b = 0, a = 0; ps.forEach(p => p.ms.filter(x => x.m === m).forEach(x => { const k = mMoney(p, x); b += k.b; a += k.act; })); return {m, n:MEAS[m].n, b, a}; }).filter(x => x.b > 0);
  const kc = (cls, ic, lab, val, sub, act, v) => `<${act ? `button type="button" data-act="${act}" data-v="${v}"` : 'div'} class="f88-k ${cls}"><span class="f88-i">${ico(ic, 22, 2.2)}</span><div><small>${lab}</small><b>${val}</b><em>${sub}</em></div>${act ? ico('chev', 16, 2.4) : ''}</${act ? 'button' : 'div'}>`;
  const per = d.dr === 'y' ? 'last 12 months' : 'last 4 weeks';
  const donut = ring69(types.map(([n, v], i) => [n, v, FCOL88[i % FCOL88.length]]), fk(spend), per, 170, 22);
  const tleg = types.map(([n, v], i) => `<div><span style="background:${FCOL88[i % FCOL88.length]}"></span><b>${esc(n)}</b><em>${fk(v)}</em><i>${spend ? Math.round(v / spend * 100) : 0}%</i></div>`).join('') || '<p class="hint">No spend in this period.</p>';
  const smx = Math.max(1, ...sups.map(x => x[1]));
  const supRows = sups.slice(0, 7).map(([n, v]) => `<button type="button" class="f88-sr" data-act="supOpen" data-v="${esc(n)}" data-tip="${esc(n)}: ${fm(v)}, ${per}"><b>${esc(n)}</b><span class="f88-bar"><i style="width:${v / smx * 100}%"></i></span><em>${fm(v)}</em></button>`).join('') || '<p class="hint">No spend in this period.</p>';
  const cRow = c => { const pill = c.worst ? `<span class="rd55-p bl">${ico('alert', 13, 2.2)}${c.worst} days late</span>` : c.slow ? `<span class="rd55-p bk">${ico('clock', 13, 2.2)}Above terms</span>` : c.none ? '<span class="rd55-dash">–</span>' : `<span class="rd55-p ok">${CHK55}On track</span>`;
    return `<div class="f88-cr"><div><b>${esc(c.n)}</b><small>${esc(c.sc)}</small></div><div class="f88-cd"><b>${c.none ? 'No invoices yet' : c.avg == null ? 'Not paid yet' : `${c.avg} days`}</b><small>terms ${c.terms}</small></div>${pill}</div>`; };
  const mRow = x => { const pct = x.b ? Math.round(x.a / x.b * 100) : 0; return `<tr><td class="rd55-pr"><b class="v63-id">${esc(x.n)}</b></td><td class="m59-n">${fm(x.b)}</td><td class="m59-n">${fm(x.a)}</td><td class="f88-pg"><span class="f88-bar"><i style="width:${Math.min(100, pct)}%;background:${pct > 100 ? '#EF4444' : '#6366F1'}"></i></span><em>${pct}%</em></td></tr>`; };
  return dHead('Finance', 'Spend, budgets and supplier costs across the jobs, and how fast each client pays.')
    + `<div class="cstats ov-k m59-k">${stat('tk', 'Total spend', fm(spend), per)}${stat('tg', 'Budget remaining', fm(rem), `≈ ${bud ? Math.round(rem / bud * 100) : 0}% of the budget of open jobs`)}${stat(delays ? 'ta' : 'tg', 'Client payment delays', plural(delays, 'client', 'clients'), 'late or above terms', 'gogo', 'acc:inv')}${stat('tred', 'Active suppliers', new Set([...ors.map(o => o.sup), ...sps.map(s => s.sub)]).size, per, 'gogo', 'del:sup')}</div>`
    + `<div class="f88-g2">${health93()}<section class="rsec q54-c"><div class="q54-ch"><h3>${ico('users', 17)}Spend by supplier</h3></div><div class="f88-sl">${supRows}</div></section></div>`
    + `<div class="f88-g3"><section class="rsec q54-c"><div class="q54-ch"><h3>${ico('clock', 17)}Days to pay, per client <span class="q54-cnt">${clients.length}</span></h3></div><div class="f88-cl">${clients.map(cRow).join('')}</div></section><section class="rsec q54-c"><div class="q54-ch"><h3>${ico('grid', 17)}Budget vs actual, per measure <span class="q54-cnt">${meas.length}</span></h3></div><div class="rd55-w"><table class="rd55-t f88-t"><thead><tr><th>Measure</th><th>Budget</th><th>Actual</th><th>Progress</th></tr></thead><tbody>${meas.map(mRow).join('')}</tbody></table></div></section></div>`; };
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.37') v.url = 'https://claude.ai/artifact/Wa9K1F6S25Rgnucgy2cDqJ'; } });
VERSIONS.push({v:'v5.38', date:TODAY, major:false, current:true, url:null, title:'Finance as the financial overview', sum:'Finance shows total spend, budget remaining, client payment delays and active suppliers; spend by cost type and by supplier; days to pay per client against their terms; and budget against actual per measure.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.38') v.url = 'https://claude.ai/artifact/LVmmZSAG4musKS2v8qt9Wy'; } });
VERSIONS.push({v:'v5.39', date:TODAY, major:false, current:true, url:null, title:'Soft lavender background', sum:'Every page background uses #FCFDFF, an almost white with a touch of blue, behind the white cards with their fine border.', steps:[]});

/* =================== v5.40: Site forms (and the assessor form) in the app design =================== */
function site91(){ document.querySelectorAll('.rf-stage').forEach(st => { if(!st.offsetParent || st.dataset.s91) return; st.dataset.s91 = '1';
  const pnl = st.querySelector('.rf-stgs'); if(pnl) pnl.classList.add('s91-p');
  st.querySelectorAll('.rf-stgp .seg2 button').forEach(b => { if(b.querySelector('.s91-av')) return; const n = (b.querySelector('b') || {}).textContent || ''; b.insertAdjacentHTML('afterbegin', `<span class="s91-av">${esc(ini(n) || n.slice(0, 2).toUpperCase())}</span>`); b.insertAdjacentHTML('beforeend', `<span class="s91-ck">${ico('check', 12, 3)}</span>`); });
  const hi = st.querySelector('.rf-hi'); if(hi && !st.querySelector('.s91-k')){ const pills = [...st.querySelectorAll('.rf-scroll .rf-jl .pill')].map(p => p.textContent.trim()), cnt = t => pills.filter(x => x === t).length, types = [...new Set(pills)].slice(0, 3), TONE = {Inspection:'ta', 'Start work':'tk', 'Progress update':'tb', 'Sign off':'tg', 'Visit':'tk'};
    hi.insertAdjacentHTML('afterend', `<div class="s91-k">${types.map(t => `<div class="s91-kc ${TONE[t] || 'tk'}"><b>${cnt(t)}</b><small>${esc(t)}</small></div>`).join('')}</div>`); }
  st.querySelectorAll('.rf-scroll .pill').forEach(p => { const t = p.textContent.trim(); p.classList.add('s91-pl', /inspect/i.test(t) ? 's91-in' : /start/i.test(t) ? 's91-st' : /progress|update/i.test(t) ? 's91-up' : /sign|done|complete/i.test(t) ? 's91-ok' : 's91-ot'); }); }); }
{ const r91 = render; render = (...x) => { const o = r91(...x); try { site91(); } catch(e) { console.warn(e); } return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.39') v.url = 'https://claude.ai/artifact/KyWe9qpw8RqRfGFqYiewzP'; } });
VERSIONS.push({v:'v5.40', date:TODAY, major:false, current:true, url:null, title:'Site forms in the app design', sum:'Site forms and the assessor form use the app design: a card for who is signed in with avatars and a check, key figures by job type inside the phone, white property cards and colour-coded job labels with icons.', steps:[]});


/* =================== v5.41: visuals from the sales reference: change pills on key figures, semicircle gauges, bars with change labels, recent activity =================== */
/* 1. Change against the previous period on every key figure (sample history in the demo) */
const BAD92 = /overdue|expired|over|below|late|delay|alert|risk|blocked|waiting|to lodge|to finish|to book|hold|owed|spend|cost|exception/i;
function chg92(){ document.querySelectorAll('.cstats .stat.k70').forEach(s => { if(s.querySelector('.ch92')) return; const lab = ((s.querySelector('small') || {}).textContent || '').trim(), val = ((s.querySelector('b') || {}).textContent || '').trim(); if(!lab || !/\d/.test(val)) return;
  const r = rnd69(lab + val), up = r() > .32, pct = Math.max(1, Math.round(2 + r() * 24)), good = BAD92.test(lab) ? !up : up;
  s.insertAdjacentHTML('beforeend', `<span class="ch92 ${good ? 'ok' : 'bad'}" title="Against the previous period (sample history in the demo)">${up ? '↑' : '↓'} ${pct}%<i>vs last month</i></span>`); }); }
/* 2. Semicircle gauge made of blocks */
function gauge92(pct, big, sub, w = 150){ const n = 22, on = Math.round(Math.max(0, Math.min(100, pct)) / 100 * n), cx = 75, cy = 72, r1 = 50, r2 = 68;
  const seg = Array.from({length:n}, (_, i) => { const a0 = Math.PI + i / n * Math.PI + .02, a1 = Math.PI + (i + 1) / n * Math.PI - .02, p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`, t = i / (n - 1), col = i < on ? '#6366F1' : '#E2E8F0';
    return `<path d="M${p(r1, a0)} L${p(r2, a0)} A${r2} ${r2} 0 0 1 ${p(r2, a1)} L${p(r1, a1)} A${r1} ${r1} 0 0 0 ${p(r1, a0)} Z" fill="${col}"/>`; }).join('');
  return `<svg viewBox="0 0 150 82" class="g92" style="width:${w}px" role="img" aria-label="${esc(big)} ${esc(sub || '')}">${seg}<text x="75" y="${sub ? 64 : 72}" text-anchor="middle" class="g92-b">${big}</text>${sub ? `<text x="75" y="78" text-anchor="middle" class="g92-s">${esc(sub)}</text>` : ''}</svg>`; }
function gaugeSwap92(){ document.querySelectorAll('.rq76-ring').forEach(r => { if(r.dataset.g92) return; r.dataset.g92 = '1'; const t = (r.querySelector('.rg69-b') || {}).textContent || ''; const v = parseFloat(t); if(isNaN(v)) return; r.innerHTML = gauge92(v, t, '', 96); r.classList.add('g92-w'); }); }
/* 3. Business overview: bars with change labels, the current month in a gradient, the rest with soft stripes */
function bars92(){ document.querySelectorAll('.rf-ch').forEach(ch => { if(ch.dataset.b92 || !ch.offsetParent) return; const bars = [...ch.querySelectorAll('.rf-bar1')]; if(bars.length < 2) return; ch.dataset.b92 = '1';
  const val = b => { const m = (b.dataset.tt || '').match(/£\s?([\d.,]+)\s*([KM]?)/i); if(!m) return null; return parseFloat(m[1].replace(/,/g, '')) * (m[2] === 'K' ? 1e3 : m[2] === 'M' ? 1e6 : 1); };
  bars.forEach((b, i) => { if(!i) return; const a = val(bars[i - 1]), c = val(b); if(a == null || c == null || !a) return; const d = Math.round((c - a) / a * 100); b.insertAdjacentHTML('beforeend', `<span class="bp92 ${d >= 0 ? 'ok' : 'bad'}">${d >= 0 ? '↑' : '↓'} ${Math.abs(d)}%</span>`); }); }); }
/* 4. Home: recent activity from the property history */
function act92(){ const g = document.querySelector('.op .ov-g.ov-dir'); if(!g || !g.offsetParent || g.querySelector('.act92')) return;
  const xs = DB.pr.flatMap(p => (p.his || []).map(h => ({p, d:h[0], t:h[1], who:h[2]}))).filter(x => x.d <= TODAY).sort((a, b) => a.d < b.d ? 1 : -1).slice(0, 6);
  if(!xs.length) return; const who = k => PEO[k] ? PEO[k].n : k === 'sys' ? 'The system' : k;
  g.insertAdjacentHTML('beforeend', `<section class="ov-card ov-wide act92"><div class="ov-h"><div><h3><span class="hm81-i">${ico('clock', 16, 2.2)}</span>Recent activity</h3><p>The latest changes across the properties.</p></div></div><div class="act92-l">${xs.map(x => `<button type="button" class="act92-r" data-act="ficha" data-v="${x.p.id}">${PEO[x.who] ? av(x.who, 34) : `<span class="act92-sys">${ico('grid', 15)}</span>`}<div><b>${esc(who(x.who))}</b><span>${esc(x.t)}</span></div><span class="act92-p">${esc(x.p.ad)}</span><small>${fmtDy(x.d)}</small></button>`).join('')}</div></section>`); }
{ const r92 = render; render = (...x) => { const o = r92(...x); try { chg92(); gaugeSwap92(); bars92(); act92(); } catch(e) { console.warn(e); } return o; }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.40') v.url = 'https://claude.ai/artifact/XTcvHoLboy81xFSL1AEbNh'; } });
VERSIONS.push({v:'v5.41', date:TODAY, major:false, current:true, url:null, title:'Change pills, gauges, bar changes and recent activity', sum:'Key figures show the change against last month (sample history in the demo), the overview panels use semicircle gauges, Value won by month shows the change on each bar, and Home gets a Recent activity feed.', steps:[]});


/* =================== v5.42: Finance: financial health score (credit score style) with its factors =================== */
function hGauge93(score, lab){ const cx = 160, cy = 150, r = 120, segs = [[0, 30, '#F87171'], [30, 50, '#FB923C'], [50, 70, '#FACC15'], [70, 85, '#3B82F6'], [85, 100, '#34D399']], ang = v => Math.PI + v / 100 * Math.PI, pt = (v, rr = r) => [cx + rr * Math.cos(ang(v)), cy + rr * Math.sin(ang(v))];
  const arcs = segs.map(([a, b, c]) => { const [x0, y0] = pt(a + 1.2), [x1, y1] = pt(b - 1.2); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/>`; }).join('');
  const [px, py] = pt(score), col = (segs.find(([a, b]) => score >= a && score <= b) || segs[4])[2];
  return `<svg viewBox="0 0 320 190" class="h93" role="img" aria-label="Financial health ${score}, ${lab}">${arcs}<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="12" fill="#fff" stroke="${col}" stroke-width="6"/><text x="${cx}" y="${cy - 8}" text-anchor="middle" class="h93-n">${score}</text><text x="${cx}" y="${cy + 22}" text-anchor="middle" class="h93-l">${lab}</text><text x="${cx - r}" y="${cy + 30}" text-anchor="middle" class="h93-m">0</text><text x="${cx + r}" y="${cy + 30}" text-anchor="middle" class="h93-m">100</text></svg>`; }
function health93(){ const ps = fPr(), open = ps.filter(p => OPENP.includes(p.ph)), priced = ps.filter(p => pIdx(p.ph) >= 2 && p.ph !== 'Cancelled'), mm = priced.map(p => ({m:pMoney(p), t:scOf(p.sc).set.mg}));
  const mg = mm.length ? sum(mm, x => x.m.mgp) / mm.length : 0, tgt = mm.length ? sum(mm, x => x.t) / mm.length : 22;
  const inv = DB.inv.filter(v => ps.some(p => p.id === v.pr)), owed = inv.filter(v => !v.paid), od = owed.filter(v => dDiff(v.due) < 0), owedAmt = sum(owed, v => v.amt), odAmt = sum(od, v => v.amt);
  const paid = inv.filter(v => v.paid), dtp = paid.length ? Math.round(sum(paid, v => dDiff(v.paid) - dDiff(v.on)) / paid.length) : null;
  const ms = []; ps.forEach(p => p.ms.forEach(x => { const k = mMoney(p, x); if(k.b) ms.push({over:k.act + k.com > k.b}); })); const overN = ms.filter(x => x.over).length;
  const om = open.map(pMoney), bud = sum(om, x => x.b), used = bud ? sum(om, x => x.act + x.com) / bud * 100 : 0;
  const s1 = 30 * Math.min(1, Math.max(0, mg / (tgt || 1))), s2 = 25 * Math.pow(owedAmt ? 1 - odAmt / owedAmt : 1, 2), s3 = 25 * (ms.length ? 1 - overN / ms.length : 1), s4 = 20 * (dtp == null ? 1 : Math.max(0, Math.min(1, 1 - (dtp - 30) / 10)));
  const score = Math.round(s1 + s2 + s3 + s4), lab = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : score >= 30 ? 'Weak' : 'Poor';
  const f = (ok, v, l, sub) => `<div class="h93-f ${ok === true ? 'ok' : ok === false ? 'bad' : 'mid'}"><b>${v}</b><small>${l}</small>${sub ? `<em>${sub}</em>` : ''}</div>`;
  return `<section class="rsec q54-c h93-c"><div class="q54-ch"><h3>${ico('shield', 17)}Financial health</h3><span class="h93-h">Margin, cash coming in, budgets and how fast clients pay</span></div><div class="h93-g"><div class="h93-gw">${hGauge93(score, lab)}</div><div><small class="rf-ph h93-ft">Health factors</small><div class="h93-fs">`
    + f(mg >= tgt, pc(mg), 'Forecast margin', `target ${pc(tgt)}`)
    + f(odAmt ? false : true, fm(odAmt), 'Overdue from clients', `${plural(od.length, 'invoice', 'invoices')} past due`)
    + f(overN ? (overN > 1 ? false : null) : true, `${overN} of ${ms.length}`, 'Measures over budget', 'actual and committed')
    + f(dtp == null ? null : dtp <= 30, dtp == null ? '–' : `${dtp} days`, 'Average days to pay', 'terms 30 to 45 days')
    + f(used <= 85 ? true : used <= 100 ? null : false, pc(used), 'Budget used', 'open jobs, actual and committed')
    + f(owedAmt <= 40000 ? true : null, fm(owedAmt), 'Owed to us', `${plural(owed.length, 'invoice', 'invoices')} open`)
    + `</div></div></div></section>`; }
{ const oF = VIEWS.dir.pages.dfin; VIEWS.dir.pages.dfin = (...x) => { const h = oF(...x), i = -1; return i < 0 ? h : h.slice(0, i) + health93() + h.slice(i); }; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.41') v.url = 'https://claude.ai/artifact/GvKzSCfMvxa9YWWDRNzj2o'; } });
VERSIONS.push({v:'v5.42', date:TODAY, major:false, current:true, url:null, title:'Financial health score', sum:'Finance shows a financial health score from 0 to 100 on a coloured gauge, built from forecast margin against target, overdue money, measures over budget and days to pay, with six health factors beside it.', steps:[]});

VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.42') v.url = 'https://claude.ai/artifact/2ocbD8339A1ixxxm51yTM8'; } });
VERSIONS.push({v:'v5.43', date:TODAY, major:false, current:true, url:null, title:'No gradients', sum:'Bars, gauges, progress bars, the activity labels, the trend areas and the active menu icon use solid colours instead of gradients.', steps:[]});

/* v5.44: segmented half-circle distribution (task distribution style) */
function dist95(segs, big, sub){ const n = 18, tot = sum(segs, s => s[1]) || 1, cx = 160, cy = 154, r1 = 98, r2 = 146; let counts = segs.map(s => Math.round(s[1] / tot * n)), diff = n - sum(counts, x => x); counts[counts.indexOf(Math.max(...counts))] += diff; counts = counts.map((c, i) => segs[i][1] > 0 ? Math.max(1, c) : 0); while(sum(counts, x => x) > n){ const i = counts.indexOf(Math.max(...counts)); counts[i]--; }
  const cols = []; segs.forEach((s, i) => { for(let k = 0; k < counts[i]; k++) cols.push(s[2]); }); while(cols.length < n) cols.push('#E2E8F0');
  const bars = cols.map((c, i) => { const deg = 180 + i / (n - 1) * 180; return `<rect x="${r1}" y="-7" width="${r2 - r1}" height="14" rx="7" fill="${c}" transform="translate(${cx} ${cy}) rotate(${deg.toFixed(2)})"/>`; }).join('');
  return `<div class="d95"><svg viewBox="0 0 320 166" class="d95-s" role="img" aria-label="${esc(segs.map(s => `${s[0]} ${s[1]}`).join(', '))}">${bars}<text x="${cx}" y="${cy - 34}" text-anchor="middle" class="d95-t">Total tasks</text><text x="${cx}" y="${cy - 2}" text-anchor="middle" class="d95-b">${big}</text><text x="${cx}" y="${cy + 10}" text-anchor="middle" class="d95-u">${esc(sub || '')}</text></svg><div class="d95-l">${segs.map(([nm, v, c]) => `<div style="--c:${c}"><small>${esc(nm)}</small><b>${num(v)}<i>tasks</i></b></div>`).join('')}</div></div>`; }
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.43') v.url = 'https://claude.ai/artifact/6JZX4eL1eB3GUUjoRdWpGW'; } });
VERSIONS.push({v:'v5.44', date:TODAY, major:false, current:true, url:null, title:'Overall completion as a segmented half circle', sum:'Capacity and staffing shows overall completion as a half circle of blocks split into completed, upcoming and overdue, with the total in the middle and the three counts underneath.', steps:[]});
/* =================== v5.45: Install tracker, Programme of works and Complaints, filled in the app and downloaded as the Excel files REFYT already uses =================== */
const V45 = {sel:new Set(), ed:null, dr:null, drag:null, refocus:null};
const EON45 = p => ['SC-01', 'SC-02', 'SC-03', 'SC-04'].includes(p.sc);
const wd45 = (s, n) => { let d = s, k = 0; const st = n < 0 ? -1 : 1; while(k < Math.abs(n)){ d = addDays(d, st); const w = fromIso(d).getDay(); if(w !== 0 && w !== 6) k++; } return d; };
const nwd45 = (s, e) => { if(!s || !e) return null; let n = 0, d = s; for(let i = 0; i < 400 && d <= e; i++){ const w = fromIso(d).getDay(); if(w !== 0 && w !== 6) n++; d = addDays(d, 1); } return n; };
const sh45 = s => s ? `${MSH[fromIso(s).getMonth()]} ${fromIso(s).getDate()}` : '';

/* ---------- More E.ON jobs, so the tracker and the programme look like a real month (fictitious addresses and residents) ---------- */
(() => { if(DB.pr.some(p => p.id === 'PR-2101')) return;
  const src = {C:'PR-2006', D:'PR-2002', E:'PR-2004', F:'PR-2005', X:'PR-2012'}, PHN = {C:'C. Client approval', D:'D. Prepare to install', E:'E. Install', F:'F. Close out', X:'Cancelled'};
  [['14 Hollywood Lane', 'ME2 3AQ', 'SC-01', 'E', ['SPV', 'LI', 'DMEV'], 'Mark Ellison'], ['77 Barnsole Road', 'ME7 2JG', 'SC-01', 'E', ['SPV'], 'Priya Shah'], ['5 Cliffe Road', 'ME2 3DL', 'SC-01', 'D', ['SPV', 'DMEV'], 'Owen Talbot'],
   ['39 Kingswood Road', 'ME7 1DZ', 'SC-01', 'D', ['SPV', 'LI', 'DMEV'], 'Grace Mensah'], ['18 Lumsden Close', 'ME4 6UP', 'SC-01', 'C', ['SPV'], 'Tom Harding'], ['62 Rock Avenue', 'ME7 5PX', 'SC-01', 'F', ['SPV', 'LI'], 'Helen Ward'],
   ['11 Northdown Hill', 'CT10 3HT', 'SC-02', 'E', ['SPV', 'CWI', 'DMEV'], 'Ali Rahman'], ['8 Ethelbert Road', 'CT9 1RX', 'SC-02', 'E', ['SPV'], 'Joan Pritchard'], ['25 Grange Road', 'CT11 9NA', 'SC-02', 'D', ['SPV'], 'Leo Martins'],
   ['3 Dumpton Park Drive', 'CT10 1RJ', 'SC-02', 'C', ['LI', 'DMEV'], 'Nadia Kowalska'], ['46 Pegwell Road', 'CT11 0JL', 'SC-02', 'F', ['SPV'], 'Ruth Okafor'], ['90 Station Road', 'CT7 9RA', 'SC-02', 'X', ['SPV'], 'Ian Doyle']
  ].forEach(([ad, pc, sc, ph, ms, res], i) => { const b = DB.pr.find(p => p.id === src[ph]); if(!b) return; const p = JSON.parse(JSON.stringify(b)), r = RATE['E.ON'] || {};
    Object.assign(p, {id:'PR-' + (2101 + i), ad, pc, sc, res, ref:'EON-' + (49120 + i * 7), ph:PHN[ph], phOn:addDays(TODAY, -(3 + i % 6)), his:[[addDays(TODAY, -70 + i), `Job received from ${scOf(sc).cl}, reference EON-${49120 + i * 7}`, 'sar']],
      ms:ms.map(m => ({m, q:r[m] || 1500, b:Math.round((r[m] || 1500) * .74), dsg:ph !== 'C', dap:ph !== 'C', ip:ph === 'F' ? 100 : ph === 'E' ? 55 : 0})), cancel:ph === 'X' ? {why:'Roof not suitable for panels', at:'D. Prepare to install', abort:true} : null});
    DB.pr.push(p); }); })();

/* ---------- Installation tasks: the rows of the Programme of works, and the installation columns of the tracker ---------- */
const PST45 = ['Not started', 'Scheduled', 'In progress', 'On hold', 'Complete', 'Cancelled'];
const PSTC45 = {'Not started':'nb', 'Scheduled':'bc', 'In progress':'ap', 'On hold':'bk', 'Complete':'ok', 'Cancelled':'na'};
const XST45 = {'Not started':'Not Started', 'Scheduled':'Scheduled', 'In progress':'In Progress', 'On hold':'On Hold', 'Complete':'Complete', 'Cancelled':'Cancelled'};
const ENAB45 = ['DPI', 'Scaffold erect', 'Scaffold dismantle', 'Roof repair'];
const PMEAS45 = ['DPI', 'Scaffold erect', 'Ventilation', 'Loft insulation', 'Cavity wall insulation', 'External wall insulation', 'Solar PV', 'Storage heaters', 'Roof repair', 'Scaffold dismantle', 'Other'];
const INST45 = ['Medway Electrical Ltd', 'Brightline Electrical', 'Kent Solar Fitters'];
const trk45 = () => DB.pr.filter(p => EON45(p) && (pIdx(p.ph) >= 2 || p.ph === 'Cancelled') && !(p.ph === 'Cancelled' && p.cancel && p.cancel.at && pIdx(p.cancel.at) < 2));
const prOf45 = id => DB.pr.find(p => p.id === id);
DB.pow = DB.pow || [];
DB.itr = DB.itr || {};
DB.cmp45 = DB.cmp45 || [];
(() => { if(DB.pow.length) return; let n = 1;
  const plan = p => { const has = m => p.ms.some(x => x.m === m), t = [];
    if(has('SPV')) t.push(['DPI', 0, 0]); if(has('SPV') || has('EWI')) t.push(['Scaffold erect', 2, 2]); if(has('DMEV')) t.push(['Ventilation', 3, 3]); if(has('LI')) t.push(['Loft insulation', 3, 3]);
    if(has('CWI')) t.push(['Cavity wall insulation', 4, 4]); if(has('EWI')) t.push(['External wall insulation', 4, 12]); if(has('SPV')) t.push(['Solar PV', 4, 6]); if(has('SPV') || has('EWI')) t.push(['Scaffold dismantle', has('EWI') ? 15 : 9, has('EWI') ? 15 : 9]); return t; };
  trk45().forEach((p, k) => { const ph = p.ph, base = ph === 'D. Prepare to install' ? wd45(TODAY, 3 + k % 5 * 2) : ph === 'E. Install' ? wd45(TODAY, -6 + k % 3) : ['F. Close out', 'Paid'].includes(ph) ? wd45(TODAY, -38 - k * 2) : ph === 'Cancelled' ? wd45(TODAY, -12) : null;
    const preOnly = ph === 'D. Prepare to install' && k % 3 === 2;
    plan(p).forEach(([m, a, b]) => { const dated = base && !(preOnly && !ENAB45.includes(m));
      const s = dated ? wd45(base, a) : null, e = dated ? wd45(base, b) : null;
      let st = 'Not started'; if(ph === 'Cancelled') st = 'Cancelled'; else if(['F. Close out', 'Paid'].includes(ph)) st = 'Complete'; else if(s){ st = e < TODAY ? 'Complete' : s <= TODAY ? 'In progress' : 'Scheduled'; }
      DB.pow.push({id:'PW-' + (n++), pr:p.id, m, s, e, st, by:m === 'Solar PV' ? INST45[k % 3] : '', nt:''}); }); }); })();
const tasks45 = p => DB.pow.filter(t => t.pr === p.id);
const instT45 = p => tasks45(p).filter(t => !ENAB45.includes(t.m));
const taskOf45 = (p, m) => tasks45(p).find(t => m === 'Other' ? ['External wall insulation', 'Storage heaters', 'Other'].includes(t.m) : t.m === m);

/* ---------- The tracker's columns, in the spreadsheet's groups ---------- */
const hasM45 = m => p => p.ms.some(x => x.m === m);
const spv45 = hasM45('SPV'), li45 = hasM45('LI');
const FLD45 = [
  ['roof', 'Roof condition', 'txt', null, 'pre', 'SPV Preinstall Checks'], ['scf', 'Scaffold access', 'txt', null, 'pre', 'SPV Preinstall Checks'], ['inv', 'Space for inverter', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45],
  ['base', 'Basement', 'ch', ['Yes', 'No'], 'pre', 'SPV Preinstall Checks'], ['elec', 'Electrical comments', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45], ['pan', 'Number of panels', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45],
  ['invm', 'Inverter', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45], ['dc', 'Notes and DC run', 'txt', null, 'pre', 'SPV Preinstall Checks', spv45], ['asb', 'Asbestos', 'txt', null, 'pre', 'SPV Preinstall Checks'],
  ['scl', 'Scaffold location', 'ch', ['Front', 'Rear', 'Side'], 'pre', 'Install Checks'], ['pav', 'Pavement licence', 'ch', ['Yes', 'No', 'Not required'], 'pre', 'Install Checks'], ['lift', 'Extra lift', 'ch', ['Yes', 'No', 'Not required'], 'pre', 'Install Checks'],
  ['sto', 'Storeys', 'ch', ['1', '2', '3', '4+'], 'pre', 'Install Checks'], ['rear', 'Extra rear required', 'ch', ['Yes', 'No'], 'pre', 'Install Checks'], ['sat', 'Satellite dish', 'ch', ['None', 'Present, not interacting', 'May interact'], 'pre', 'Install Checks'],
  ['qch', 'Quote changes', 'txt', null, 'pre', 'Install Checks'],
  ['con', 'Construction approval', 'yn', null, 'en', 'Enabling'], ['quo', 'Quote approved', 'yn', null, 'en', 'Enabling'], ['bat', 'Fully approved and batched', 'yn', null, 'en', 'Enabling'],
  ['dpi', 'DPI', 'pow', 'DPI', 'en', 'Enabling'], ['scon', 'Scaffold on', 'pow', 'Scaffold erect', 'en', 'Enabling'], ['dyn', 'Dynamics notified', 'st', null, 'en', 'Enabling'], ['cal', 'Booking calendar', 'st', null, 'en', 'Enabling'],
  ['mat', 'Materials booked', 'date', null, 'en', 'Enabling'], ['iaa', 'IAA notified', 'st', null, 'en', 'Enabling'], ['mould', 'Mould removal', 'st', null, 'en', 'Enabling'],
  ['vent', 'Ventilation install', 'pow', 'Ventilation', 'ins', 'Installation'], ['loft', 'Loft install', 'pow', 'Loft insulation', 'ins', 'Installation'], ['spv', 'SPV install', 'pow', 'Solar PV', 'ins', 'Installation'],
  ['cav', 'Cavity install', 'pow', 'Cavity wall insulation', 'ins', 'Installation'], ['oth', 'Other install', 'pow', 'Other', 'ins', 'Installation'], ['dynu', 'Dynamics updated', 'st', null, 'ins', 'Installation'], ['waste', 'Waste collection', 'st', null, 'ins', 'Installation'],
  ['fin', 'Final inspection and sign off', 'date', null, 'cmp', 'Completion'], ['scoff', 'Scaffold off', 'pow', 'Scaffold dismantle', 'cmp', 'Completion'],
  ['lph', 'Loft photo docs', 'st', null, 'cmp', 'Loft Handover', li45], ['libg', 'Loft IBG', 'st', null, 'cmp', 'Loft Handover', li45],
  ['sph', 'SPV photo docs', 'st', null, 'cmp', 'SPV Handover', spv45], ['sibg', 'SPV IBG', 'st', null, 'cmp', 'SPV Handover', spv45], ['mcs', 'MCS application', 'st', null, 'cmp', 'SPV Handover', spv45], ['eic', 'EIC and BN', 'st', null, 'cmp', 'SPV Handover', spv45],
  ['arr', 'Solar array certificate', 'st', null, 'cmp', 'SPV Handover', spv45], ['comm', 'Commissioning reports', 'st', null, 'cmp', 'SPV Handover', spv45], ['nic', 'NICEIC regs', 'st', null, 'cmp', 'SPV Handover', spv45],
].map(([k, n, kind, o, b, xg, app]) => ({k, n, kind, o, b, xg, app}));
const FK45 = Object.fromEntries(FLD45.map(f => [f.k, f]));
const BLK45 = [['pre', 'Pre-install checks', 'search'], ['en', 'Enabling', 'flag'], ['ins', 'Installation', 'tool'], ['cmp', 'Completion and handover', 'award']];
const STV45 = ['Done', 'Pending', 'Missing', 'N/A'];
const IT45 = p => DB.itr[p.id] || (DB.itr[p.id] = {notes:[], his:[], hold:''});
const app45 = (p, f) => f.kind === 'pow' ? !!taskOf45(p, f.o) : (!f.app || f.app(p));
const val45 = (p, f) => f.kind === 'pow' ? taskOf45(p, f.o) : IT45(p)[f.k];
const done45 = (p, f) => { const v = val45(p, f); if(f.kind === 'pow') return !!v && v.st === 'Complete'; if(f.kind === 'st') return v === 'Done' || v === 'N/A'; if(f.kind === 'yn') return v === 'Yes'; return v != null && v !== ''; };
const pct45 = (p, b) => { const fs = FLD45.filter(f => f.b === b && app45(p, f)); return fs.length ? Math.round(fs.filter(f => done45(p, f)).length / fs.length * 100) : null; };

/* seed the tracker with values that match each job's phase */
(() => { const R = ['Concrete tiles, good condition, felt present', 'Pan tiles, rafters look good, felt present', 'Flat tiles, no felt, check flashing', 'Slate roof, sound, one cracked tile at the rear'], E = ['TN-C-S earthing, space for the DPI', 'Old board, space for the PV board and DPI', 'TT system, meter under the stairs'];
  trk45().forEach((p, k) => { const it = IT45(p), i = pIdx(p.ph), late = ['F. Close out', 'Paid'].includes(p.ph), ins = p.ph === 'E. Install', can = p.ph === 'Cancelled', d = i >= 3 || late || can, sp = spv45(p), ts = instT45(p), allDone = ts.length && ts.every(t => t.st === 'Complete');
    Object.assign(it, {roof:R[k % 4], scf:k % 3 ? 'Access via the alley' : 'Front access, no issues', base:k % 4 === 1 ? 'Yes' : 'No', asb:k % 5 === 2 ? 'Cement pipes may contain asbestos, do not touch' : 'None found on survey'});
    if(sp) Object.assign(it, {inv:k % 3 === 1 ? 'Tight, may need an external enclosure' : 'Plenty of space', elec:E[k % 3], pan:`${k % 2 ? 'Front' : 'Rear'} ${5 + k % 4}`, invm:k % 2 ? 'Fox ESS 3.68kW hybrid' : 'F Series 3kW string', dc:'DC run through the loft, out at the soffit, in conduit to the inverter'});
    if(d) Object.assign(it, {scl:['Front', 'Rear', 'Side'][k % 3], pav:k % 3 === 0 ? 'Yes' : 'Not required', lift:k % 4 === 3 ? 'Yes' : 'Not required', sto:k % 6 === 4 ? '3' : '2', rear:'No', sat:k % 5 === 1 ? 'May interact' : 'None', qch:k % 4 === 3 ? 'One lift added' : 'No change'});
    Object.assign(it, {con:'Yes', quo:d ? 'Yes' : k % 2 ? 'Yes' : '', bat:d ? 'Yes' : ''});
    if(d && !can) Object.assign(it, {dyn:ins || late ? 'Done' : 'Pending', cal:'Done', mat:ins || late ? addDays(TODAY, -9 - k % 4) : k % 2 ? addDays(TODAY, 2) : '', iaa:ins || late ? 'Done' : 'Pending', mould:k % 6 === 1 ? 'Pending' : 'N/A'});
    if(ins || late) Object.assign(it, {dynu:allDone || late ? 'Done' : 'Pending', waste:late ? 'Done' : 'Pending'});
    if(late) Object.assign(it, {fin:addDays(TODAY, -24 - k % 5), lph:'Done', libg:'Done', sph:'Done', sibg:'Done', mcs:'Done', eic:k % 2 ? 'Missing' : 'Done', arr:'Done', comm:'Done', nic:k % 3 ? 'Done' : 'Pending'});
    else if(allDone) Object.assign(it, {lph:'Pending', libg:'Pending', sph:'Pending', sibg:'Pending', mcs:'Pending', eic:'Pending', arr:'Pending', comm:'Pending', nic:'Pending'});
    if(p.id === 'PR-2105') it.hold = 'Customer wants a site visit before accepting the scope.';
    if(p.id === 'PR-2101') it.notes.push({on:addDays(TODAY, -2), by:'dre', t:'Customer asked to keep the side gate closed for the dog.'});
    if(p.id === 'PR-2004') it.notes.push({on:addDays(TODAY, -1), by:'dre', t:'Inverter commissioning failed on the first attempt; installer back on Thursday.'});
    if(p.id === 'PR-2108') it.notes.push({on:addDays(TODAY, -4), by:'akr', t:'Make sure we have the right flashing, there is no felt.'}); }); })();
(() => { if(DB.cmp45.length) return; const c = (id, on, stage, ty, pr, own, iss, act, aon, ron, st) => ({id, on:addDays(TODAY, on), stage, ty, pr, own, iss, act, aon:aon == null ? '' : addDays(TODAY, aon), ron:ron == null ? '' : addDays(TODAY, ron), st});
  DB.cmp45.push(c('CP-1', -26, 'Mid install', 'Roof issue', 'PR-2004', 'dre', 'Supporting beam in the loft is bowing', 'Go back to reinforce it before the panels go on', -20, null, 'Open'),
    c('CP-2', -17, 'Post install', 'Scaffold issue', 'PR-2111', 'akr', 'Scaffold left a mark on the front paving', 'Clean and photograph', -15, -12, 'Closed'),
    c('CP-3', -9, 'Post install', 'Install issue', 'PR-2005', 'dre', 'dMEV in the bathroom is noisy', 'Installer to return and check the fan', -6, null, 'Open'),
    c('CP-4', -3, 'Pre install', 'Customer service', 'PR-2103', 'tom', 'Customer says nobody confirmed the install date', 'Call the customer and confirm by email', -2, null, 'Open')); })();

/* ---------- Bands: where each job sits, worked out from its data instead of moving rows by hand ---------- */
const BANDS45 = ['Pending approval', 'Pre installation', 'Jobs on hold', 'Booked installation', 'Install in progress', 'Completed installation', 'Submitted jobs', 'Cancelled'];
const BNDC45 = {'Pending approval':'nb', 'Pre installation':'bc', 'Jobs on hold':'bk', 'Booked installation':'ap', 'Install in progress':'rq', 'Completed installation':'ok', 'Submitted jobs':'ok', 'Cancelled':'na'};
const band45 = p => { if(p.ph === 'Cancelled') return 'Cancelled'; if(IT45(p).hold) return 'Jobs on hold'; if(pIdx(p.ph) <= 2) return 'Pending approval'; if(['F. Close out', 'Paid'].includes(p.ph)) return 'Submitted jobs';
  const ts = instT45(p); if(!ts.length || ts.every(t => !t.s)) return 'Pre installation'; if(ts.every(t => t.st === 'Complete')) return 'Completed installation'; if(ts.some(t => ['In progress', 'Complete'].includes(t.st))) return 'Install in progress'; return 'Booked installation'; };
const council45 = p => scOf(p.sc).n.replace(/^E\.ON\s*/, '');
const delMon45 = p => { const t = instT45(p).filter(x => x.s).sort((a, b) => a.s < b.s ? -1 : 1)[0]; return t ? MSH[fromIso(t.s).getMonth()] : ''; };
const mPills45 = p => p.ms.map(x => `<span class="v45-m">${esc(MEAS[x.m].s)}</span>`).join('');
const bPill45 = b => `<span class="v45-st ${BNDC45[b]}">${esc(b)}</span>`;

/* ---------- One cell: shows the value and opens its editor ---------- */
const STC45 = {Done:['ok', CHK55], Pending:['bk', ''], Missing:['bl', ''], 'N/A':['na', '']};
function cellIn45(p, f){ if(!app45(p, f)) return '<span class="v45-na">n/a</span>'; const v = val45(p, f);
  if(f.kind === 'pow'){ const t = v; return t.s ? `<span class="v45-pw"><b>${sh45(t.s)}${t.e && t.e !== t.s ? `<i>to ${sh45(t.e)}</i>` : ''}</b><span class="v45-st ${PSTC45[t.st]}">${esc(t.st)}</span></span>` : `<span class="v45-st ${PSTC45[t.st]}">${t.st === 'Not started' ? 'Not booked' : esc(t.st)}</span>`; }
  if(v == null || v === '') return '<span class="v45-e">Add</span>';
  if(f.kind === 'st'){ const [c, ic] = STC45[v] || ['nb', '']; return `<span class="v45-st ${c}">${ic}${esc(v)}</span>`; }
  if(f.kind === 'yn') return `<span class="v45-st ${v === 'Yes' ? 'ok' : 'bl'}">${v === 'Yes' ? CHK55 : ''}${esc(v)}</span>`;
  if(f.kind === 'date') return `<span class="v45-dt">${ico('cal', 13, 2)}${sh45(v)}</span>`;
  if(f.kind === 'ch') return `<span class="v45-ch">${esc(v)}</span>`;
  return `<span class="v45-tx" title="${esc(v)}">${esc(v)}</span>`; }
const cell45 = (p, f, r, c) => app45(p, f) ? `<button type="button" class="v45-c" data-act="v45ed" data-p="${p.id}" data-f="${f.k}" data-r="${r}" data-c="${c}" aria-label="${esc(f.n)}, ${esc(p.ad)}">${cellIn45(p, f)}</button>` : cellIn45(p, f);
const bar45 = (v, act, id, b) => v == null ? '<span class="v45-na">n/a</span>' : `<button type="button" class="v45-pb" data-act="${act}" data-v="${id}" data-b="${b}" title="${v}% done"><span><i style="width:${v}%;background:${v === 100 ? '#16A34A' : v >= 50 ? '#2F5BD3' : '#F59E0B'}"></i></span><b>${v}%</b></button>`;

/* ---------- Install tracker ---------- */
VIEWS.del.pages.itr = () => { const all = trk45(), q = norm(S.f.v45q), sc = S.f.v45s || 'all', bd = S.f.v45b || 'all', bk = S.f.v45k || 'sum';
  const base = all.filter(p => (sc === 'all' || p.sc === sc) && (!q || norm(`${p.ad} ${p.pc} ${p.id} ${p.ref} ${p.res}`).includes(q))), xs = base.filter(p => bd === 'all' || band45(p) === bd);
  const cnt = b => base.filter(p => band45(p) === b).length, fs = bk === 'sum' ? [] : FLD45.filter(f => f.b === bk && xs.some(p => app45(p, f)));
  const hand = all.filter(p => ['Completed installation', 'Submitted jobs'].includes(band45(p))).reduce((t, p) => t + FLD45.filter(f => f.b === 'cmp' && f.kind === 'st' && app45(p, f) && ['Pending', 'Missing', undefined, ''].includes(val45(p, f))).length, 0);
  const head = `<tr><th>Property</th><th>Scheme</th>${bk === 'sum' ? `<th>Measures</th><th>Install</th>${BLK45.map(([, n]) => `<th>${esc(n)}</th>`).join('')}<th>Latest note</th>` : fs.map(f => `<th>${esc(f.n)}</th>`).join('')}</tr>`;
  let r = 0; const row = p => { r++; const it = IT45(p), nt = it.notes[it.notes.length - 1], t1 = instT45(p).filter(t => t.s).sort((a, b) => a.s < b.s ? -1 : 1)[0];
    return `<tr${V45.sel.has(p.id) ? ' class="v45-on"' : ''}><td class="rd55-pr"><span class="v45-pr"><input type="checkbox" data-v45sel="${p.id}" aria-label="Select ${esc(p.ad)}"${V45.sel.has(p.id) ? ' checked' : ''}><span><button class="rd55-pn" data-act="v45dr" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(p.ref)}, ${esc(p.pc || '')}</small></span></span></td><td>${scPill55(p.sc)}</td>`
      + (bk === 'sum' ? `<td><span class="v45-ms">${mPills45(p)}</span></td><td>${t1 ? `<span class="v45-dt">${ico('cal', 13, 2)}${sh45(t1.s)}</span>` : '<span class="v45-na">Not booked</span>'}</td>${BLK45.map(([b]) => `<td>${bar45(pct45(p, b), 'v45dr', p.id, b)}</td>`).join('')}<td class="v45-nt">${nt ? `<span title="${esc(nt.t)}">${esc(nt.t)}</span><small>${esc((PEO[nt.by] || {}).n || '')}, ${sh45(nt.on)}</small>` : '<span class="v45-na">No notes</span>'}</td>`
        : fs.map((f, c) => `<td>${cell45(p, f, r, c)}</td>`).join('')) + '</tr>'; };
  const ncol = bk === 'sum' ? 9 : fs.length + 2;
  const body = BANDS45.map(b => { const ps = xs.filter(p => band45(p) === b); return ps.length ? `<tr class="v45-band"><td colspan="${ncol}"><span>${bPill45(b)}<small>${ps.length}</small></span></td></tr>` + ps.map(row).join('') : ''; }).join('');
  const nSel = [...V45.sel].filter(id => xs.some(p => p.id === id)).length;
  return trBar() + oph('Install tracker', 'Every E.ON job from approval to handover, with the columns of the install tracker spreadsheet. Fill it in here; download it as Excel when you need to send it.', `<button class="btn sec" data-act="v45dl" data-v="itrb">${ico('file', 15)}Blank template</button><button class="btn pri" data-act="v45dl" data-v="itr">${ico('down', 15)}Download Excel</button>`)
    + `<div class="cstats">${stat('tb', 'Jobs in the tracker', all.filter(p => p.ph !== 'Cancelled').length)}${stat('ta', 'Booked or installing', all.filter(p => ['Booked installation', 'Install in progress'].includes(band45(p))).length)}${stat('tred', 'Handover items open', hand, 'pending or missing')}${stat('tv', 'Open complaints', DB.cmp45.filter(c => c.st === 'Open').length, 'see Complaints', 'v45go', 'cmp')}</div>`
    + `<div class="v45-row">${seg('v45b', bd, [['all', 'All', base.length], ...BANDS45.filter(cnt).map(b => [b, b, cnt(b)])])}</div>`
    + `<div class="v45-row">${seg('v45k', bk, [['sum', 'Summary'], ...BLK45.map(([k, n]) => [k, n])])}</div>`
    + `<div class="v45-fb"><label class="v45-q">${ico('search', 16)}<input id="v45q" data-v45in="v45q" value="${esc(S.f.v45q || '')}" placeholder="Search a property, postcode, reference or resident"></label><select data-v45in="v45s" aria-label="Scheme"><option value="all">All E.ON schemes</option>${DB.sc.filter(s => EON45({sc:s.id})).map(s => `<option value="${s.id}"${sc === s.id ? ' selected' : ''}>${esc(s.n)}</option>`).join('')}</select></div>`
    + (nSel ? `<div class="v45-bulk" role="region" aria-label="Selected jobs"><b>${nSel} selected</b><button class="btn pri sm" data-act="v45bulk">${ico('edit', 14)}Set a field for all</button><button class="btn sec sm" data-act="v45unsel">Clear selection</button><small>Pick a column and a value; every selected job gets it at once.</small></div>` : '')
    + `<p class="v45-hint">${bk === 'sum' ? 'Click a bar to open the job at that group, or pick a group above to fill its columns like a spreadsheet.' : 'Click a cell to fill it. Arrow keys move between cells and Enter opens one.'}</p>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t v45-t"><thead>${head}</thead><tbody>${body || `<tr><td colspan="${ncol}">${empty('No jobs match these filters.')}</td></tr>`}</tbody></table></div></section>`; };

/* ---------- Programme of works ---------- */
const DW45 = 30;
const win45 = () => { const m = S.f.v45m || TODAY.slice(0, 7), [y, mo] = m.split('-').map(Number), a = `${m}-01`, b = iso(new Date(y, mo, 0)); return {m, a, b, n:dDiff(b) - dDiff(a) + 1, y, mo}; };
VIEWS.del.pages.pow = () => { const W = win45(), q = norm(S.f.v45pq), sc = S.f.v45ps || 'all', st = S.f.v45pst || 'all';
  const ps = trk45().filter(p => (sc === 'all' || p.sc === sc) && (!q || norm(`${p.ad} ${p.pc} ${p.ref}`).includes(q)));
  const inWin = t => t.s && t.s <= W.b && (t.e || t.s) >= W.a, ts = DB.pow.filter(t => ps.some(p => p.id === t.pr)), tm = ts.filter(inWin);
  const vis = t => (st === 'all' || t.st === st) && (inWin(t) || !t.s);
  const groups = ps.map(p => [p, tasks45(p).filter(vis)]).filter(([, x]) => x.length && x.some(t => inWin(t) || !t.s)).sort((a, b) => { const f = g => (g[0].ph === 'Cancelled' ? 'Z' : '') + ((g[1].find(t => t.s) || {}).s || '9999'); return f(a) < f(b) ? -1 : 1; });
  const days = Array.from({length:W.n}, (_, i) => addDays(W.a, i)), wk = d => [0, 6].includes(fromIso(d).getDay());
  const grid = `<span class="v45-wk">${days.map((d, i) => wk(d) ? `<i style="left:${i * DW45}px"></i>` : '').join('')}${TODAY >= W.a && TODAY <= W.b ? `<em class="v45-now" style="left:${(dDiff(TODAY) - dDiff(W.a)) * DW45 + DW45 / 2}px"></em>` : ''}</span>`;
  const barH = t => { if(!t.s) return '<span class="v45-ns">Not scheduled, click to add dates</span>'; const s = t.s < W.a ? W.a : t.s, e = (t.e || t.s) > W.b ? W.b : (t.e || t.s), l = (dDiff(s) - dDiff(W.a)) * DW45, w = (dDiff(e) - dDiff(s) + 1) * DW45;
    return `<span class="v45-bar s-${PSTC45[t.st]}" data-v45bar="${t.id}" style="left:${l + 2}px;width:${w - 4}px" title="${esc(t.m)}: ${sh45(t.s)} to ${sh45(t.e || t.s)}, ${t.st}. Drag to move, drag the right edge to change the end.">${t.s < W.a ? '‹' : ''}${w > 60 ? esc(t.m) : ''}<i data-v45end="${t.id}"></i></span>`; };
  const trow = t => `<tr><td class="v45-gm"><button class="v45-gl" data-act="v45tk" data-v="${t.id}">${esc(t.m)}</button>${t.by ? `<small>${esc(t.by)}</small>` : ''}</td><td>${t.s ? sh45(t.s) : '–'}</td><td>${t.e ? sh45(t.e) : '–'}</td><td>${nwd45(t.s, t.e) ?? '–'}</td><td><button class="v45-c" data-act="v45tk" data-v="${t.id}"><span class="v45-st ${PSTC45[t.st]}">${esc(t.st)}</span></button></td><td class="v45-tl"><div class="v45-tr" style="width:${W.n * DW45}px">${grid}${barH(t)}</div></td></tr>`;
  const hdr = `<tr><th class="v45-gm">Measure</th><th>Start</th><th>End</th><th title="Working days">Days</th><th>Status</th><th class="v45-tl"><div class="v45-days" style="width:${W.n * DW45}px">${days.map(d => `<span class="${wk(d) ? 'we' : ''}${d === TODAY ? ' td' : ''}"><small>${DSH[fromIso(d).getDay()][0]}</small>${fromIso(d).getDate()}</span>`).join('')}</div></th></tr>`;
  const body = groups.map(([p, x]) => `<tr class="v45-band"><td colspan="6"><span><button class="rd55-pn" data-act="v45dr" data-v="${p.id}">${esc(p.ad)}</button>${scPill55(p.sc)}${bPill45(band45(p))}<button class="v45-add" data-act="v45add" data-v="${p.id}">${ico('plus', 13)}Add a task</button></span></td></tr>` + x.map(trow).join('')).join('');
  const prev = iso(new Date(W.y, W.mo - 2, 1)).slice(0, 7), next = iso(new Date(W.y, W.mo, 1)).slice(0, 7);
  return trBar() + oph('Programme of works', 'Every measure per property on a calendar: drag a bar to move it, drag its right edge to change the end, or click it to change dates and status. The installation columns of the Install tracker read the same dates.', `<button class="btn sec" data-act="v45dl" data-v="powb">${ico('file', 15)}Blank template</button><button class="btn pri" data-act="v45dl" data-v="pow">${ico('down', 15)}Download Excel</button>`)
    + `<div class="v45-meta"><span class="v45-mn"><button class="ib" data-act="v45mon" data-v="${prev}" aria-label="Previous month">${ico('back', 15)}</button><b>${MONTHS45[W.mo - 1]} ${W.y}</b><button class="ib" data-act="v45mon" data-v="${next}" aria-label="Next month"><span style="display:inline-flex;transform:rotate(180deg)">${ico('back', 15)}</span></button></span><span><small>Prepared by</small><b>${esc((PEO[ME()] || {}).n || 'You')}</b></span><span><small>Date</small><b>${fmtDy(TODAY)}</b></span></div>`
    + `<div class="cstats">${stat('tb', 'Tasks this month', tm.length)}${stat('ta', 'Scheduled', tm.filter(t => t.st === 'Scheduled').length)}${stat('tv', 'In progress', tm.filter(t => t.st === 'In progress').length)}${stat('tg', 'Complete', tm.filter(t => t.st === 'Complete').length)}${stat('tred', 'On hold', ts.filter(t => t.st === 'On hold').length)}</div>`
    + `<div class="v45-row">${seg('v45pst', st, [['all', 'All'], ...PST45.map(s => [s, s, ts.filter(t => t.st === s && (inWin(t) || !t.s)).length])])}</div>`
    + `<div class="v45-fb"><label class="v45-q">${ico('search', 16)}<input id="v45pq" data-v45in="v45pq" value="${esc(S.f.v45pq || '')}" placeholder="Search a property, postcode or reference"></label><select data-v45in="v45ps" aria-label="Scheme"><option value="all">All E.ON schemes</option>${DB.sc.filter(s => EON45({sc:s.id})).map(s => `<option value="${s.id}"${sc === s.id ? ' selected' : ''}>${esc(s.n)}</option>`).join('')}</select></div>`
    + `<div class="v45-leg">${PST45.map(s => `<span><i class="s-${PSTC45[s]}"></i>${s}</span>`).join('')}<span><i class="we"></i>Weekend</span></div>`
    + `<section class="rd55"><div class="rd55-w v45-gw"><table class="rd55-t v45-g"><thead>${hdr}</thead><tbody>${body || `<tr><td colspan="6">${empty('No tasks this month with these filters.')}</td></tr>`}</tbody></table></div></section>`; };
const MONTHS45 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ---------- Complaints ---------- */
const CSTG45 = ['Pre install', 'Mid install', 'Post install'], CTY45 = ['Roof issue', 'Install issue', 'Scaffold issue', 'Customer service', 'Other'];
const dOpen45 = c => dDiff(c.ron || TODAY) - dDiff(c.on);
VIEWS.del.pages.cmp = () => { const sg = S.f.v45cs || 'Open', xs = DB.cmp45.filter(c => sg === 'all' || c.st === sg).sort((a, b) => a.on < b.on ? 1 : -1), op = DB.cmp45.filter(c => c.st === 'Open');
  const row = c => { const p = prOf45(c.pr) || {ad:'', id:''}, d = dOpen45(c); return `<tr><td>${sh45(c.on)}</td><td class="rd55-pr"><button class="rd55-pn" data-act="v45cm" data-v="${c.id}">${esc(p.ad)}</button><small>${esc(p.ref || '')}</small></td><td><span class="v45-ch">${esc(c.stage)}</span></td><td>${esc(c.ty)}</td><td>${esc((PEO[c.own] || {}).n || '')}</td><td class="v45-nt"><span title="${esc(c.iss)}">${esc(c.iss)}</span></td><td class="v45-nt"><span title="${esc(c.act)}">${esc(c.act || '')}</span></td><td>${c.aon ? sh45(c.aon) : '–'}</td><td>${c.ron ? sh45(c.ron) : '–'}</td><td><span class="v45-st ${c.st === 'Open' ? 'bk' : 'ok'}">${c.st === 'Closed' ? CHK55 : ''}${c.st}</span></td><td><b class="${c.st === 'Open' && d > 14 ? 'v45-red' : ''}">${d}</b></td></tr>`; };
  return trBar() + oph('Complaints', 'Issues raised before, during or after an install, with who owns them and how long they have been open. Days open counts by itself.', `<button class="btn pri" data-act="v45cm" data-v="">${ico('plus', 15)}Log a complaint</button>`)
    + `<div class="cstats">${stat('tred', 'Open', op.length)}${stat('ta', 'Open over 14 days', op.filter(c => dOpen45(c) > 14).length)}${stat('tg', 'Closed', DB.cmp45.filter(c => c.st === 'Closed').length)}${stat('tb', 'Average days open', op.length ? Math.round(sum(op, dOpen45) / op.length) : 0)}</div>`
    + `<div class="v45-row">${seg('v45cs', sg, [['Open', 'Open', op.length], ['Closed', 'Closed', DB.cmp45.length - op.length], ['all', 'All', DB.cmp45.length]])}</div>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t v45-cmt"><thead><tr><th>Date</th><th>Property</th><th>Stage</th><th>Type</th><th>Owner</th><th>Issue</th><th>Action</th><th>Action date</th><th>Resolved</th><th>Status</th><th>Days open</th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="11">${empty('No complaints here.')}</td></tr>`}</tbody></table></div></section>`; };

/* ---------- Menu, help and actions ---------- */
{ const g = SEC5.find(s => s.k === 'del').groups[0][1], r = [...DEL4, 'dir'], add = [mk('itr', 'Install tracker', 'checks', () => 'del:itr', r, {c:() => trk45().filter(p => ['Booked installation', 'Install in progress'].includes(band45(p))).length}), mk('pow', 'Programme of works', 'cal', () => 'del:pow', r), mk('cmp', 'Complaints', 'alert', () => 'del:cmp', r, {c:() => DB.cmp45.filter(c => c.st === 'Open').length, soft:2})];
  g.splice(0, 0, add[0], add[1]); g.splice(g.findIndex(x => x.k === 'clo') + 1, 0, add[2]); add.forEach(x => ITEMS4.push({...x, sec:'Delivery'})); }
if(HELP.del && HELP.del.views) HELP.del.views.unshift(
  HV('itr', 'Install tracker', 'checks', 'The install tracker spreadsheet, filled in the app.', ['As install coordinator I fill pre-install checks, enabling, installation and handover per job, and download the same Excel when I need to send it.', 'As install coordinator I select several jobs and set a column for all of them at once, for example Fully approved and batched.', 'As director I see where every job sits, from Pending approval to Submitted, without anyone moving rows by hand.']),
  HV('pow', 'Programme of works', 'cal', 'Each measure per property on a monthly calendar.', ['As install coordinator I drag a bar to reschedule a measure, and the Install tracker shows the new date.', 'As install coordinator I download the programme of works as the Excel E.ON receives, prepared by me and dated today.']),
  HV('cmp', 'Complaints', 'alert', 'Complaints with their owner and days open.', ['As install coordinator I log a complaint on the property, give it an owner and an action, and see how many days it has been open.']));

const MON45 = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
A.v45b = el => { S.f.v45b = el.dataset.v; render(); };
A.v45k = el => { S.f.v45k = el.dataset.v; render(); };
A.v45pst = el => { S.f.v45pst = el.dataset.v; render(); };
A.v45cs = el => { S.f.v45cs = el.dataset.v; render(); };
A.v45mon = el => { S.f.v45m = el.dataset.v; render(); };
A.v45go = el => go('del', el.dataset.v);
A.v45unsel = () => { V45.sel.clear(); render(); };
A.v45dr = el => { V45.ed = null; V45.dr = {k:'itr', id:el.dataset.v, b:el.dataset.b || ''}; draw45(); };
A.v45drx = () => { V45.dr = null; V45.ed = null; draw45(); };
A.v45op = el => { V45.dr = null; V45.ed = null; draw45(); abrir(S.view, el.dataset.v, 'ins'); };
A.v45cm = el => { V45.ed = null; V45.dr = {k:'cmp', id:el.dataset.v || null}; draw45(); };
const rect45 = el => el.getBoundingClientRect();
A.v45ed = el => { V45.ed = {ids:[el.dataset.p], f:el.dataset.f, at:rect45(el)}; draw45(); };
A.v45tk = el => { V45.ed = {task:el.dataset.v, at:rect45(el)}; draw45(); };
A.v45add = el => { V45.ed = {add:el.dataset.v, at:rect45(el)}; draw45(); };
A.v45bulk = el => { V45.ed = {pick:true, at:rect45(el)}; draw45(); };
A.v45bf = el => { const ids = [...V45.sel]; V45.ed = {ids, f:el.dataset.v, at:V45.ed.at}; draw45(); };
A.v45edx = () => { V45.ed = null; draw45(); };
A.v45hold = el => { const p = prOf45(el.dataset.v), it = IT45(p); if(it.hold){ it.hold = ''; log45(p, 'Hold', 'Released'); toast(`${p.ad} is off hold.`); } else { const r = (document.getElementById('v45hr') || {}).value || ''; if(r.trim().length < 3) return toast('Write why the job is on hold.'); it.hold = r.trim(); log45(p, 'Hold', it.hold); toast(`${p.ad} is on hold.`); } render(); };
A.v45note = el => { const p = prOf45(el.dataset.v), t = ((document.getElementById('v45nt') || {}).value || '').trim(); if(t.length < 2) return; IT45(p).notes.push({on:TODAY, by:ME(), t}); toast('Note added.'); render(); };
const log45 = (p, f, v) => IT45(p).his.push({on:TODAY, by:ME(), f, v:String(v)});
const fmtV45 = (f, v) => f.kind === 'date' ? (v ? fmtDy(v) : 'cleared') : (v === '' || v == null ? 'cleared' : v);
function set45(ids, fk, v){ const f = FK45[fk]; let n = 0; ids.forEach(id => { const p = prOf45(id); if(!p || !app45(p, f)) return; n++;
    if(f.kind === 'pow'){ const t = taskOf45(p, f.o); Object.assign(t, v); log45(p, f.n, `${t.st}${t.s ? ', ' + sh45(t.s) + (t.e && t.e !== t.s ? ' to ' + sh45(t.e) : '') : ''}`); } else { IT45(p)[fk] = v; log45(p, f.n, fmtV45(f, v)); } });
  V45.ed = null; if(ids.length > 1) V45.sel.clear(); render(); toast(ids.length > 1 ? `${f.n} set on ${n} ${n === 1 ? 'job' : 'jobs'}.` : `${f.n} saved.`); }
A.v45set = el => { const e = V45.ed, v = el.dataset.v; if(e.task) return saveTask45({st:v}); const f = FK45[e.f]; set45(e.ids, e.f, f.kind === 'pow' ? {st:v} : v); };
A.v45today = () => { const i = document.getElementById('v45d1'); if(i) i.value = TODAY; };
A.v45save = () => { const e = V45.ed, g = id => (document.getElementById(id) || {}).value;
  if(e.add){ const m = V45.ed.m || g('v45am'); if(!m) return toast('Pick a measure.'); const s = g('v45d1') || null, en = g('v45d2') || s; DB.pow.push({id:'PW-' + (DB.pow.length + 100), pr:e.add, m, s, e:en, st:s ? 'Scheduled' : 'Not started', by:'', nt:''}); log45(prOf45(e.add), m, 'Task added'); V45.ed = null; render(); return toast(`${m} added to the programme.`); }
  if(e.task) return saveTask45({s:g('v45d1') || null, e:g('v45d2') || g('v45d1') || null, by:g('v45by') || '', nt:g('v45tn') || ''});
  const f = FK45[e.f]; if(f.kind === 'pow') return set45(e.ids, e.f, {s:g('v45d1') || null, e:g('v45d2') || g('v45d1') || null, by:g('v45by') ?? undefined}); set45(e.ids, e.f, f.kind === 'date' ? g('v45d1') || '' : (g('v45tx') || '').trim()); };
function saveTask45(v){ const t = DB.pow.find(x => x.id === V45.ed.task); if(v.by === undefined) delete v.by; if(v.e && v.s && v.e < v.s) return toast('The end date is before the start.'); Object.assign(t, v); if(v.s && t.st === 'Not started') t.st = 'Scheduled'; log45(prOf45(t.pr), t.m, `${t.st}${t.s ? ', ' + sh45(t.s) : ''}`); V45.ed = null; render(); toast(`${t.m} saved.`); }
A.v45del = () => { const t = DB.pow.find(x => x.id === V45.ed.task); DB.pow.splice(DB.pow.indexOf(t), 1); log45(prOf45(t.pr), t.m, 'Task removed'); V45.ed = null; render(); toast(`${t.m} removed from the programme.`); };
A.v45am = el => { V45.ed.m = el.dataset.v; draw45(); };
A.v45cmsave = () => { const g = id => (document.getElementById(id) || {}).value || '', d = V45.dr, x = d.f || {};
  if(!g('v45cpr') || g('v45ciss').trim().length < 3 || !x.stage || !x.ty) return toast('Pick the property, the stage and the type, and describe the issue.');
  const c = d.id ? DB.cmp45.find(c => c.id === d.id) : {id:'CP-' + (DB.cmp45.length + 1), on:TODAY}; Object.assign(c, {pr:g('v45cpr'), stage:x.stage, ty:x.ty, own:g('v45cow'), iss:g('v45ciss').trim(), act:g('v45cact').trim(), aon:g('v45caon'), ron:g('v45cron'), st:x.st || 'Open'});
  if(c.st === 'Closed' && !c.ron) c.ron = TODAY; if(!d.id) DB.cmp45.push(c); log45(prOf45(c.pr), 'Complaint', `${c.ty}, ${c.st}`); V45.dr = null; render(); toast(d.id ? 'Complaint saved.' : 'Complaint logged.'); };
A.v45cf = el => { const d = V45.dr; d.f = d.f || {}; d.f[el.dataset.k] = el.dataset.v; keep45(); draw45(); };
const keep45 = () => { const d = V45.dr; if(!d) return; d.keep = {}; document.querySelectorAll('#v45dr [id^="v45c"]').forEach(i => d.keep[i.id] = i.value); };

/* inputs: search, scheme filters and the row checkboxes */
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.v45in; if(!k || e.target.tagName === 'SELECT') return; S.f[k] = e.target.value; V45.refocus = {id:e.target.id, pos:e.target.selectionStart}; render(); });
document.addEventListener('change', e => { const d = e.target.dataset || {}; if(d.v45in && e.target.tagName === 'SELECT'){ S.f[d.v45in] = e.target.value; render(); } if(d.v45sel){ V45.sel[e.target.checked ? 'add' : 'delete'](d.v45sel); render(); } });
/* arrow keys between cells, Escape closes */
document.addEventListener('keydown', e => { if(e.key === 'Escape' && (V45.ed || V45.dr)){ e.stopImmediatePropagation(); if(V45.ed) V45.ed = null; else V45.dr = null; draw45(); return; }
  const c = e.target.closest && e.target.closest('.v45-t .v45-c'); if(!c || !/^Arrow/.test(e.key)) return; e.preventDefault(); let r = +c.dataset.r, k = +c.dataset.c;
  if(e.key === 'ArrowDown') r++; if(e.key === 'ArrowUp') r--; if(e.key === 'ArrowRight') k++; if(e.key === 'ArrowLeft') k--; const n = document.querySelector(`.v45-t .v45-c[data-r="${r}"][data-c="${k}"]`); if(n) n.focus(); }, true);
addEventListener('mousedown', e => { if(V45.ed && !e.target.closest('#v45pop') && !e.target.closest('[data-act^="v45"]') && !e.target.closest('[data-v45bar]')){ V45.ed = null; draw45(); } }, true);

/* drag a bar to move it, or its right edge to change the end */
addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-v45bar]'); if(!b) return; const t = DB.pow.find(x => x.id === b.dataset.v45bar); if(!t) return; e.preventDefault();
  V45.drag = {t, b, x0:e.clientX, l0:parseFloat(b.style.left), w0:parseFloat(b.style.width), end:!!e.target.dataset.v45end, dd:0}; b.setPointerCapture && b.setPointerCapture(e.pointerId); b.classList.add('drag'); });
addEventListener('pointermove', e => { const d = V45.drag; if(!d) return; d.dd = Math.round((e.clientX - d.x0) / DW45); if(d.end) d.b.style.width = Math.max(DW45 - 4, d.w0 + d.dd * DW45) + 'px'; else d.b.style.left = d.l0 + d.dd * DW45 + 'px'; });
addEventListener('pointerup', e => { const d = V45.drag; if(!d) return; V45.drag = null; d.b.classList.remove('drag'); const t = d.t;
  if(!d.dd){ V45.ed = {task:t.id, at:rect45(d.b)}; return draw45(); }
  if(d.end){ const ne = addDays(t.e || t.s, d.dd); t.e = ne < t.s ? t.s : ne; } else { t.s = addDays(t.s, d.dd); t.e = addDays(t.e || t.s, d.dd); }
  if(t.st === 'Not started') t.st = 'Scheduled'; log45(prOf45(t.pr), t.m, `Moved to ${sh45(t.s)}${t.e !== t.s ? ' to ' + sh45(t.e) : ''}`); render(); toast(`${t.m}: ${sh45(t.s)}${t.e !== t.s ? ' to ' + sh45(t.e) : ''}.`); });

/* ---------- The popover editor and the side panel ---------- */
const chips45 = (vals, cur, act = 'v45set', attr = '') => `<div class="v45-chips">${vals.map(v => `<button type="button" data-act="${act}" data-v="${esc(v)}"${attr} aria-pressed="${cur === v}">${esc(v)}</button>`).join('')}</div>`;
function edHTML45(){ const e = V45.ed;
  if(e.pick){ const bk = S.f.v45k && S.f.v45k !== 'sum' ? S.f.v45k : null; const fs = FLD45.filter(f => !bk || f.b === bk);
    return `<header><b>Set a field for ${V45.sel.size} jobs</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header>${BLK45.filter(([k]) => fs.some(f => f.b === k)).map(([k, n]) => `<small class="v45-pg">${esc(n)}</small><div class="v45-chips">${fs.filter(f => f.b === k).map(f => `<button type="button" data-act="v45bf" data-v="${f.k}">${esc(f.n)}</button>`).join('')}</div>`).join('')}`; }
  if(e.add){ return `<header><b>Add a task</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header><p class="v45-sub">${esc(prOf45(e.add).ad)}</p><small class="v45-pg">Measure</small>${chips45(PMEAS45, e.m, 'v45am')}<div class="v45-2"><label><small>Start</small><input type="date" id="v45d1"></label><label><small>End</small><input type="date" id="v45d2"></label></div><footer><button class="btn sec sm" data-act="v45edx">Cancel</button><button class="btn pri sm" data-act="v45save">Add to the programme</button></footer>`; }
  if(e.task){ const t = DB.pow.find(x => x.id === e.task), p = prOf45(t.pr);
    return `<header><b>${esc(t.m)}</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header><p class="v45-sub">${esc(p.ad)}</p><small class="v45-pg">Status</small>${chips45(PST45, t.st)}<div class="v45-2"><label><small>Start</small><input type="date" id="v45d1" value="${t.s || ''}"></label><label><small>End</small><input type="date" id="v45d2" value="${t.e || ''}"></label></div>`
      + `<label class="v45-f"><small>Installer</small><input id="v45by" list="v45ins" value="${esc(t.by || '')}" placeholder="Who does it"><datalist id="v45ins">${INST45.map(x => `<option value="${esc(x)}">`).join('')}</datalist></label><label class="v45-f"><small>Notes</small><input id="v45tn" value="${esc(t.nt || '')}" placeholder="Shown in the Notes column of the Excel"></label>`
      + `<footer><button class="btn sec sm v45-del" data-act="v45del">Remove</button><button class="btn pri sm" data-act="v45save">Save dates</button></footer>`; }
  const f = FK45[e.f], one = e.ids.length === 1 ? prOf45(e.ids[0]) : null, v = one ? val45(one, f) : null;
  const h = `<header><b>${esc(f.n)}</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header><p class="v45-sub">${one ? esc(one.ad) : `${e.ids.length} selected jobs; jobs where it does not apply are skipped`}</p>`;
  if(f.kind === 'st') return h + chips45(STV45, v) + `<button class="v45-clr" data-act="v45set" data-v="">Clear</button>`;
  if(f.kind === 'yn') return h + chips45(['Yes', 'No'], v) + `<button class="v45-clr" data-act="v45set" data-v="">Clear</button>`;
  if(f.kind === 'ch') return h + chips45(f.o, v) + `<button class="v45-clr" data-act="v45set" data-v="">Clear</button>`;
  if(f.kind === 'date') return h + `<div class="v45-2"><label><small>Date</small><input type="date" id="v45d1" value="${v || ''}"></label><button class="btn sec sm" data-act="v45today">Today</button></div><footer><button class="btn sec sm" data-act="v45set" data-v="">Clear</button><button class="btn pri sm" data-act="v45save">Save</button></footer>`;
  if(f.kind === 'txt') return h + `<textarea id="v45tx" rows="3" placeholder="Type here">${esc(v || '')}</textarea><footer><span class="v45-k">Ctrl + Enter saves</span><button class="btn pri sm" data-act="v45save">Save</button></footer>`;
  const t = v || {}; return h + `<small class="v45-pg">Status</small>${chips45(PST45, one ? t.st : null)}<div class="v45-2"><label><small>Start</small><input type="date" id="v45d1" value="${t.s || ''}"></label><label><small>End</small><input type="date" id="v45d2" value="${t.e || ''}"></label></div>${f.k === 'spv' ? `<label class="v45-f"><small>Installer</small><input id="v45by" list="v45ins" value="${esc(t.by || '')}"><datalist id="v45ins">${INST45.map(x => `<option value="${esc(x)}">`).join('')}</datalist></label>` : ''}<p class="v45-sub">Same dates as the Programme of works.</p><footer><button class="btn sec sm" data-act="v45go" data-v="pow">Open the programme</button><button class="btn pri sm" data-act="v45save">Save dates</button></footer>`; }
function drHTML45(){ const d = V45.dr;
  if(d.k === 'cmp'){ const c = d.id ? DB.cmp45.find(x => x.id === d.id) : null, f = d.f || (d.f = c ? {stage:c.stage, ty:c.ty, st:c.st} : {st:'Open'}), k = d.keep || {}, val = (id, v) => esc(k[id] ?? v ?? '');
    const ps = trk45().filter(p => p.ph !== 'Cancelled'), own = Object.entries(PEO).filter(([, p]) => ['del', 'dir', 'com', 'mob'].includes(p.ar));
    return `<header><div><small>${c ? c.id : 'New'}</small><h2>${c ? 'Complaint' : 'Log a complaint'}</h2></div><button class="ib" data-act="v45drx" aria-label="Close">${ico('x', 17)}</button></header><div class="v45-db">`
      + `<label class="v45-f"><small>Property <em class="req">*</em></small><select id="v45cpr"><option value="">Choose a property...</option>${ps.map(p => `<option value="${p.id}"${(k.v45cpr ?? (c && c.pr)) === p.id ? ' selected' : ''}>${esc(p.ad)}, ${esc(p.pc)}</option>`).join('')}</select></label>`
      + `<small class="v45-pg">Stage <em class="req">*</em></small>${chips45(CSTG45, f.stage, 'v45cf', ' data-k="stage"')}<small class="v45-pg">Type <em class="req">*</em></small>${chips45(CTY45, f.ty, 'v45cf', ' data-k="ty"')}`
      + `<label class="v45-f"><small>Owner</small><select id="v45cow">${own.map(([id, p]) => `<option value="${id}"${(k.v45cow ?? (c ? c.own : 'dre')) === id ? ' selected' : ''}>${esc(p.n)}, ${esc(p.r)}</option>`).join('')}</select></label>`
      + `<label class="v45-f"><small>Issue <em class="req">*</em></small><textarea id="v45ciss" rows="3">${val('v45ciss', c && c.iss)}</textarea></label><label class="v45-f"><small>Action</small><textarea id="v45cact" rows="2">${val('v45cact', c && c.act)}</textarea></label>`
      + `<div class="v45-2"><label><small>Action date</small><input type="date" id="v45caon" value="${val('v45caon', c && c.aon)}"></label><label><small>Resolved on</small><input type="date" id="v45cron" value="${val('v45cron', c && c.ron)}"></label></div><small class="v45-pg">Status</small>${chips45(['Open', 'Closed'], f.st, 'v45cf', ' data-k="st"')}`
      + `</div><footer><button class="btn sec" data-act="v45drx">Cancel</button><button class="btn pri" data-act="v45cmsave">${c ? 'Save' : 'Log the complaint'}</button></footer>`; }
  const p = prOf45(d.id), it = IT45(p), b = band45(p);
  return `<header><div><small>${esc(p.ref)}, ${esc(p.pc)}</small><h2>${esc(p.ad)}</h2><span class="v45-hb">${scPill55(p.sc)}${bPill45(b)}<span class="v45-ms">${mPills45(p)}</span></span></div><button class="ib" data-act="v45drx" aria-label="Close">${ico('x', 17)}</button></header><div class="v45-db">`
    + `<div class="v45-acts"><button class="btn sec sm" data-act="v45op" data-v="${p.id}">${ico('home', 14)}Open the property</button><button class="btn sec sm" data-act="v45go" data-v="pow">${ico('cal', 14)}Programme of works</button></div>`
    + (it.hold ? `<div class="v45-hold">${ico('alert', 15)}<span><b>On hold</b>${esc(it.hold)}</span><button class="btn sec sm" data-act="v45hold" data-v="${p.id}">Release</button></div>` : '')
    + BLK45.map(([k, n, ic]) => { const fs = FLD45.filter(f => f.b === k && app45(p, f)), pc0 = pct45(p, k); if(!fs.length) return '';
      return `<section class="v45-sec${d.b === k ? ' hl' : ''}" id="v45s-${k}"><h3><span class="oi2">${ico(ic, 16)}</span>${esc(n)}<em>${pc0}%</em><span class="v45-sb"><i style="width:${pc0}%"></i></span></h3>${fs.map(f => `<div class="v45-fr"><span>${esc(f.n)}</span>${cell45(p, f, 0, 0)}</div>`).join('')}</section>`; }).join('')
    + `<section class="v45-sec"><h3><span class="oi2">${ico('msg', 16)}</span>Notes<em>${it.notes.length}</em></h3>${it.notes.slice().reverse().map(x => `<div class="v45-n"><b>${esc((PEO[x.by] || {}).n || '')}</b><small>${fmtDy(x.on)}</small><p>${esc(x.t)}</p></div>`).join('') || '<p class="v45-sub">No notes yet.</p>'}<textarea id="v45nt" rows="2" placeholder="Add a note for the team, it is kept with its date and author"></textarea><div class="v45-acts"><button class="btn pri sm" data-act="v45note" data-v="${p.id}">Add the note</button></div></section>`
    + (!it.hold && !['Cancelled', 'Submitted jobs'].includes(b) ? `<section class="v45-sec"><h3><span class="oi2">${ico('alert', 16)}</span>Put on hold</h3><input id="v45hr" placeholder="Why, for example: customer wants a site visit first"><div class="v45-acts"><button class="btn sec sm" data-act="v45hold" data-v="${p.id}">Put on hold</button></div></section>` : '')
    + `<section class="v45-sec"><h3><span class="oi2">${ico('history', 16)}</span>Changes</h3>${it.his.slice(-6).reverse().map(h => `<div class="v45-hi"><b>${esc(h.f)}</b> ${esc(h.v)}<small>${esc((PEO[h.by] || {}).n || '')}, ${fmtDy(h.on)}</small></div>`).join('') || '<p class="v45-sub">Nothing changed in this demo session yet.</p>'}</section></div>`; }
function draw45(){ let dr = document.getElementById('v45dr');
  if(V45.dr && (V45.dr.k === 'cmp' || prOf45(V45.dr.id))){ if(!dr){ dr = document.createElement('div'); dr.id = 'v45dr'; document.body.appendChild(dr); } const sc = dr.querySelector('.v45-db'), top = sc ? sc.scrollTop : 0, isNew = dr.dataset.k !== `${V45.dr.k}${V45.dr.id}`;
    const ih = drHTML45(), as = dr.querySelector('.v45-pan'); if(isNew || !as) dr.innerHTML = `<div class="v45-scrim" data-act="v45drx"></div><aside class="v45-pan" role="dialog" aria-modal="true" aria-label="Details">${ih}</aside>`; else if(dr._h !== ih) as.innerHTML = ih; dr._h = ih; dr.dataset.k = `${V45.dr.k}${V45.dr.id}`;
    const nb = dr.querySelector('.v45-db'); if(nb){ if(!isNew) nb.scrollTop = top; else if(V45.dr.b){ const s = dr.querySelector('#v45s-' + V45.dr.b); if(s) nb.scrollTop = s.offsetTop - 12; } } }
  else if(dr) dr.remove();
  let w = document.getElementById('v45pop'); if(!V45.ed){ if(w) w.remove(); return; } if(!w){ w = document.createElement('div'); w.id = 'v45pop'; document.body.appendChild(w); }
  w.innerHTML = `<div class="v45-pop" role="dialog" aria-label="Edit">${edHTML45()}</div>`; const p = w.firstChild, a = V45.ed.at || {left:innerWidth / 2 - 160, bottom:120, top:120}, h = p.offsetHeight, wd = p.offsetWidth;
  p.style.left = Math.max(8, Math.min(a.left, innerWidth - wd - 8)) + 'px'; p.style.top = (a.bottom + 6 + h > innerHeight - 8 ? Math.max(8, a.top - h - 6) : a.bottom + 6) + 'px';
  const fi = p.querySelector('textarea, input[type="date"], [aria-pressed="true"], .v45-chips button'); if(fi) fi.focus(); }
document.addEventListener('keydown', e => { if(e.target.id === 'v45tx' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); A.v45save(); } if(e.target.closest && e.target.closest('#v45pop') && e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); A.v45save(); } });

/* ---------- Excel: the same files REFYT already sends, built from the app ---------- */
let XL45 = null;
const xl45 = () => XL45 || (XL45 = import('exceljs').then(m => m.default || m).catch(e => { XL45 = null; throw e; }));
const xd45 = s => { if(!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const col45 = n => { let s = ''; while(n > 0){ const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const fill45 = argb => ({type:'pattern', pattern:'solid', fgColor:{argb}});
const HDR45 = c => { c.font = {name:'Arial', bold:true, color:{argb:'FFFFFFFF'}, size:10}; c.fill = fill45('FF1F3864'); c.alignment = {vertical:'middle', horizontal:'center', wrapText:true}; c.border = {bottom:{style:'thin', color:{argb:'FF0F1F3D'}}}; };
const XV45 = {Done:'DONE', Pending:'PENDING', Missing:'MISSING', 'N/A':'N/A', Yes:'Y', No:'N'};
function powBook45(X, blank){ const W = win45(), wb = new X.Workbook(), ws = wb.addWorksheet(`Programme ${MON45[W.mo]} ${W.y}`), days = Array.from({length:W.n}, (_, i) => addDays(W.a, i)), C0 = 9, CL = col45(C0 + days.length - 1);
  ws.properties.defaultRowHeight = 16; ws.getCell('A1').value = 'Refyt/EON GFS - Programme of works'; ws.getCell('A1').font = {name:'Arial', bold:true, size:14, color:{argb:'FF1F3864'}};
  [['A2', 'Month:'], ['D2', 'Prepared by:'], ['F2', 'Date']].forEach(([a, v]) => { ws.getCell(a).value = v; ws.getCell(a).font = {name:'Arial', bold:true, size:10}; });
  ws.getCell('B2').value = xd45(W.a); ws.getCell('B2').numFmt = 'mmm-yy'; ws.getCell('E2').value = (PEO[ME()] || {}).n || ''; ws.getCell('G2').value = xd45(TODAY); ws.getCell('G2').numFmt = 'dd/mm/yyyy'; ['E2', 'G2'].forEach(a => { ws.getCell(a).fill = fill45('FFFFF9E5'); ws.getCell(a).font = {name:'Arial', size:10}; });
  ws.getCell(3, C0).value = `${MONTHS45[W.mo - 1]} ${W.y}`; ws.getCell(3, C0).font = {name:'Arial', bold:true, size:10};
  days.forEach((d, i) => { const c4 = ws.getCell(4, C0 + i); c4.value = DSH[fromIso(d).getDay()][0]; c4.font = {name:'Arial', size:8, color:{argb:'FF64748B'}}; c4.alignment = {horizontal:'center'}; const c5 = ws.getCell(5, C0 + i); c5.value = xd45(d); c5.numFmt = 'd'; HDR45(c5); ws.getColumn(C0 + i).width = 3.6; });
  ['Property', 'Measure', 'Start Date', 'End Date', 'Duration (days)', 'Status', 'Notes'].forEach((h, i) => HDR45(ws.getCell(5, i + 1))); ws.getRow(5).height = 30;
  [38, 26, 12, 12, 10, 13, 40, 2].forEach((w, i) => ws.getColumn(i + 1).width = w);
  const rows = blank ? [] : trk45().flatMap(p => tasks45(p).filter(t => !t.s || (t.s <= W.b && (t.e || t.s) >= W.a)).map(t => [p, t])).sort((a, b) => ((a[1].s || '9') < (b[1].s || '9') ? -1 : 1)).sort((a, b) => a[0].ad === b[0].ad ? 0 : trk45().indexOf(a[0]) - trk45().indexOf(b[0]));
  const order = []; rows.forEach(([p]) => { if(!order.includes(p)) order.push(p); }); const sorted = order.flatMap(p => rows.filter(r => r[0] === p));
  const last = Math.max(160, 6 + sorted.length + 40);
  for(let r = 6; r <= last; r++){ const x = sorted[r - 6]; const row = ws.getRow(r);
    if(x){ const [p, t] = x; row.getCell(1).value = `${p.ad} - ${p.pc}`; row.getCell(2).value = t.m; row.getCell(3).value = xd45(t.s); row.getCell(4).value = xd45(t.e); row.getCell(6).value = XST45[t.st]; row.getCell(7).value = [t.by, t.nt].filter(Boolean).join('. ') || null; }
    row.getCell(5).value = {formula:`IF(AND(C${r}<>"",D${r}<>""),NETWORKDAYS(C${r},D${r}),"")`}; [1, 2, 3, 4, 6, 7].forEach(c => { const cl = row.getCell(c); cl.fill = fill45('FFFFF9E5'); cl.font = {name:'Arial', size:10}; if(c === 3 || c === 4) cl.numFmt = 'dd/mm/yy'; }); row.getCell(5).font = {name:'Arial', size:10}; row.getCell(5).alignment = {horizontal:'center'}; }
  ws.dataValidations.add(`F6:F${last}`, {type:'list', allowBlank:true, formulae:['"Not Started,Scheduled,In Progress,On Hold,Complete,Cancelled"']});
  ws.dataValidations.add(`B6:B${last}`, {type:'list', allowBlank:true, showErrorMessage:false, formulae:[`"${PMEAS45.join(',')}"`]});
  ws.dataValidations.add(`C6:D${last}`, {type:'date', operator:'greaterThan', allowBlank:true, showErrorMessage:true, errorTitle:'Date', error:'Type a date, for example 20/11/2026.', formulae:[new Date(Date.UTC(2020, 0, 1))]});
  const cf = (f, argb) => ({type:'expression', formulae:[f], style:{fill:{type:'pattern', pattern:'solid', bgColor:{argb}}}}), on = `AND($C6<>"",I$5>=$C6,I$5<=IF($D6="",$C6,$D6)`;
  ws.addConditionalFormatting({ref:`F6:F${last}`, rules:[cf('$F6="Complete"', 'FFE2EFDA'), cf('$F6="In Progress"', 'FFDDEBF7'), cf('$F6="On Hold"', 'FFFFF2CC'), cf('$F6="Cancelled"', 'FFEDEDED')].map((r, i) => ({...r, priority:i + 1}))});
  ws.addConditionalFormatting({ref:`I6:${CL}${last}`, rules:[cf(`${on},$F6="Complete")`, 'FF70AD47'), cf(`${on},$F6="On Hold")`, 'FFFFC000'), cf(`${on},$F6="Cancelled")`, 'FFBFBFBF'), cf(`${on},$F6="In Progress")`, 'FF2E75B6'), cf(`${on})`, 'FF9DC3E6'), cf('WEEKDAY(I$5,2)>5', 'FFF2F2F2')].map((r, i) => ({...r, priority:10 + i}))});
  ws.views = [{state:'frozen', xSplit:2, ySplit:5}]; return wb; }
function itrBook45(X, blank){ const wb = new X.Workbook(), ws = wb.addWorksheet('Progress Tracker'), fx = ['Delivery', 'Council', 'No.', 'Address', 'Measures', 'Reference', 'Comments'], pf = FLD45.filter(f => f.xg !== 'Install Checks'), ps = blank ? [] : trk45();
  const cols = [...fx.map(n => ({n})), ...pf.map(f => ({n:f.n, f}))]; let gi = fx.length + 1;
  [...new Set(pf.map(f => f.xg))].forEach(g => { const n = pf.filter(f => f.xg === g).length; ws.mergeCells(1, gi, 1, gi + n - 1); const c = ws.getCell(1, gi); c.value = g; c.font = {name:'Arial', bold:true, size:10, color:{argb:'FF1F3864'}}; c.fill = fill45('FFDDE5F3'); c.alignment = {horizontal:'center'}; gi += n; });
  cols.forEach((c, i) => { const h = ws.getCell(2, i + 1); h.value = c.n; HDR45(h); ws.getColumn(i + 1).width = i === 3 ? 34 : i === 6 ? 36 : c.f && c.f.kind === 'txt' ? 30 : 14; }); ws.getRow(2).height = 34;
  let r = 3, no = 0; const stCols = [];
  cols.forEach((c, i) => { if(c.f && ['st', 'yn', 'ch'].includes(c.f.kind)) stCols.push([col45(i + 1), c.f]); });
  (blank ? BANDS45 : BANDS45.filter(b => ps.some(p => band45(p) === b))).forEach(b => { const br = ws.getRow(r++); br.getCell(1).value = b.toUpperCase(); br.getCell(1).font = {name:'Arial', bold:true, size:10}; for(let c = 1; c <= cols.length; c++) br.getCell(c).fill = fill45('FFF2F2F2');
    ps.filter(p => band45(p) === b).forEach(p => { const row = ws.getRow(r++), it = IT45(p), nt = it.notes[it.notes.length - 1]; no++;
      [delMon45(p), council45(p), no, `${p.ad} ${p.pc}`, p.ms.map(x => MEAS[x.m].s).join(', '), p.ref, [it.hold, nt && nt.t].filter(Boolean).join('. ') || null].forEach((v, i) => row.getCell(i + 1).value = v);
      pf.forEach((f, j) => { const cell = row.getCell(fx.length + 1 + j); if(!app45(p, f)){ cell.value = 'N/A'; cell.font = {name:'Arial', size:10, color:{argb:'FF94A3B8'}}; return; } const v = val45(p, f);
        if(f.kind === 'pow'){ cell.value = v.s ? xd45(v.s) : v.st === 'Not started' ? null : XST45[v.st]; if(v.s) cell.numFmt = 'dd/mm/yy'; if(f.k === 'spv' && v.by){ cell.note = `Installer: ${v.by}`; } }
        else if(f.kind === 'date'){ cell.value = xd45(v); if(v) cell.numFmt = 'dd/mm/yy'; } else cell.value = v ? (XV45[v] || v) : null; cell.font = {name:'Arial', size:10}; });
      row.eachCell(c => { if(!c.font || !c.font.name) c.font = {name:'Arial', size:10}; }); }); });
  const last = Math.max(r + 40, 120); stCols.forEach(([L, f]) => ws.dataValidations.add(`${L}3:${L}${last}`, {type:'list', allowBlank:true, showErrorMessage:false, formulae:[`"${(f.kind === 'st' ? ['DONE', 'PENDING', 'MISSING', 'N/A'] : f.kind === 'yn' ? ['Y', 'N'] : f.o).join(',')}"`]}));
  for(let i = 3; i <= last; i++) [1, 2, 3, 4, 5, 6, 7].forEach(c => { const cl = ws.getCell(i, c); if(cl.value == null && !cl.fill) cl.fill = fill45('FFFFF9E5'); });
  ws.views = [{state:'frozen', xSplit:4, ySplit:2}];
  const cw = wb.addWorksheet('Complaints Tracker'), ch = ['Date of complaint / issue', 'Stage', 'Type', 'Site / address', 'Owner', 'Issue', 'Action', 'Action Date', 'Resolve date', 'Status', 'Days open'];
  ch.forEach((h, i) => { HDR45(cw.getCell(1, i + 1)); cw.getCell(1, i + 1).value = h; cw.getColumn(i + 1).width = [14, 13, 16, 30, 18, 40, 40, 12, 12, 10, 10][i]; }); cw.getRow(1).height = 30;
  const cs = blank ? [] : DB.cmp45.slice().sort((a, b) => a.on < b.on ? -1 : 1), cl2 = Math.max(cs.length + 20, 40);
  for(let i = 0; i < cl2; i++){ const rr = i + 2, row = cw.getRow(rr), c = cs[i]; if(c){ const p = prOf45(c.pr) || {}; [xd45(c.on), c.stage, c.ty, p.ad, (PEO[c.own] || {}).n || '', c.iss, c.act || null, xd45(c.aon), xd45(c.ron), c.st].forEach((v, j) => row.getCell(j + 1).value = v); }
    row.getCell(11).value = {formula:`IF(A${rr}="","",IF(I${rr}<>"",I${rr}-A${rr},TODAY()-A${rr}))`}; [1, 8, 9].forEach(j => row.getCell(j).numFmt = 'dd/mm/yy'); row.eachCell({includeEmpty:true}, x => x.font = {name:'Arial', size:10}); }
  cw.dataValidations.add(`B2:B${cl2 + 1}`, {type:'list', allowBlank:true, formulae:[`"${CSTG45.join(',')}"`]}); cw.dataValidations.add(`C2:C${cl2 + 1}`, {type:'list', allowBlank:true, formulae:[`"${CTY45.join(',')}"`]}); cw.dataValidations.add(`J2:J${cl2 + 1}`, {type:'list', allowBlank:true, formulae:['"Open,Closed"']});
  cw.views = [{state:'frozen', ySplit:1}];
  const iw = wb.addWorksheet('Install Checks'), icf = FLD45.filter(f => ['scl', 'pav', 'lift', 'sto', 'rear', 'base', 'roof', 'sat', 'qch'].includes(f.k)), ih = ['Address', 'Scaff Location', 'Pavement Licence', 'Extra lift', 'Storeys', 'Extra Rear Required', 'Basement', 'Roof Condition', 'Satellite', 'Quote changes'];
  const ik = ['scl', 'pav', 'lift', 'sto', 'rear', 'base', 'roof', 'sat', 'qch']; ih.forEach((h, i) => { const c = iw.getCell(1, i + 1); c.value = h; HDR45(c); iw.getColumn(i + 1).width = i === 0 || i >= 7 ? 32 : 14; }); iw.getRow(1).height = 30;
  (blank ? [] : trk45().filter(p => !['Cancelled', 'Submitted jobs'].includes(band45(p)))).forEach((p, i) => { const row = iw.getRow(i + 2); row.getCell(1).value = `${p.ad} ${p.pc}`; ik.forEach((k, j) => row.getCell(j + 2).value = IT45(p)[k] || null); row.eachCell(x => x.font = {name:'Arial', size:10}); });
  ik.forEach((k, j) => { const f = FK45[k]; if(f.kind === 'ch') iw.dataValidations.add(`${col45(j + 2)}2:${col45(j + 2)}200`, {type:'list', allowBlank:true, showErrorMessage:false, formulae:[`"${f.o.join(',')}"`]}); });
  const xw = wb.addWorksheet('Cancelled Tracker'), xh = ['Status Reason', 'Reference', 'Address', 'Post Code', 'Measures', 'Quoted', 'Cancellation reason', 'Customer Contacted', 'Comments'];
  xh.forEach((h, i) => { const c = xw.getCell(1, i + 1); c.value = h; HDR45(c); xw.getColumn(i + 1).width = [18, 14, 30, 10, 18, 10, 40, 12, 34][i]; }); xw.getRow(1).height = 30;
  (blank ? [] : DB.pr.filter(p => EON45(p) && p.ph === 'Cancelled')).forEach((p, i) => { const row = xw.getRow(i + 2); ['Property Unsuitable', p.ref, p.ad, p.pc, p.ms.map(x => MEAS[x.m].s).join(', '), p.cancel && pIdx(p.cancel.at) >= 2 ? 'yes' : 'no', (p.cancel || {}).why || '', 'yes', null].forEach((v, j) => row.getCell(j + 1).value = v); row.eachCell(x => x.font = {name:'Arial', size:10}); });
  if(blank){ const hw = wb.addWorksheet('How to fill'); [['How to fill this template'], [''], ['One row per property, under its band (Pending approval, Pre installation, and so on).'], ['Yellow cells are the ones you type in. Status columns take DONE, PENDING, MISSING or N/A; approvals take Y or N.'], ['Dates as dd/mm/yy. Write N/A where a column does not apply to the job.'], ['Example row: Nov | Medway | 1 | 12 Example Street ME7 1AA | Solar PV | EON-00000 | Customer prefers mornings'], [''], ['Filling it in the REFYT app is faster: the bands, N/A and the dates of the Programme of works are filled for you.']].forEach((l, i) => { const c = hw.getCell(i + 1, 1); c.value = l[0]; c.font = {name:'Arial', size:i ? 10 : 13, bold:!i}; }); hw.getColumn(1).width = 110; }
  return wb; }
A.v45dl = async el => { const k = el.dataset.v, blank = /b$/.test(k), pw = /^pow/.test(k); if(el.disabled) return; el.disabled = true; const t0 = el.innerHTML; el.innerHTML = `${ico('clock', 15)}Preparing...`;
  try { const X = await xl45(), wb = pw ? powBook45(X, blank) : itrBook45(X, blank), buf = await wb.xlsx.writeBuffer(), W = win45(), d = fromIso(TODAY);
    const name = pw ? (blank ? 'PoW_template.xlsx' : `PoW_${d.getDate()}_${MON45[d.getMonth() + 1]}_${d.getFullYear()}_${MON45[W.mo]}.xlsx`) : (blank ? 'Install_Tracker_template.xlsx' : `Install_Tracker_${d.getDate()}_${MON45[d.getMonth() + 1]}_${d.getFullYear()}.xlsx`);
    const ok = await saveFile4(name, new Blob([buf], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})); if(ok) toast(`${name} is ready.`); }
  catch(e){ toast('The Excel file could not be prepared. Check the connection and try again.'); }
  finally { el.disabled = false; el.innerHTML = t0; } };

/* ---------- After every render: popover, panel, refocus the search, the Tour button in the header ---------- */
{ const r45 = render; render = (...x) => { r45(...x); draw45(); if(V45.refocus){ const i = document.getElementById(V45.refocus.id); if(i){ i.focus(); try { i.setSelectionRange(V45.refocus.pos, V45.refocus.pos); } catch(e) {} } V45.refocus = null; }
  const tl = document.getElementById('tools'); if(tl && !tl.querySelector('.v45-tour')){ const nb = tl.querySelector('[data-act="popNt"]'), b = `<button class="rf-hb v45-tour" data-act="tour" title="Demo tour" aria-label="Demo tour">${ico('flag', 17)}</button>`; if(nb) nb.insertAdjacentHTML('beforebegin', b); else tl.insertAdjacentHTML('afterbegin', b); }
  const tb = document.querySelector('.v45-tour'); if(tb) tb.classList.toggle('on', !!(S.tour && S.tour.open)); }; }

/* ---------- Comment: the kit's Comment button, in place of the Tour button at the bottom ---------- */
const commentContext = () => { const s = SEC5.find(x => x.k === S.sec5) || {}, pg = S.page[S.view] || '', h1 = document.querySelector('.view:not([hidden]) .op-h h1') || document.querySelector('.view:not([hidden]) h1'), nv = document.querySelector('.view:not([hidden]) aside.sb [aria-current="true"]') /* app: only the visible screen, never a hidden one */, dr = V45.dr && V45.dr.id ? prOf45(V45.dr.id) : null, fi = (S.fi || {})[S.view], pr = dr || (typeof fi === 'string' ? prOf45(fi) : null);
    return {app:s.n || 'REFYT', pantalla:h1 ? h1.textContent.trim() : nv ? nv.title || nv.textContent.trim() : pg, pantalla_id:`${S.view}/${pg}`, registro:pr ? pr.id : '', registro_nombre:pr ? pr.ad : '', pestana:V45.dr && V45.dr.k === 'itr' ? ((BLK45.find(b => b[0] === V45.dr.b) || [])[1] || '') : ''}; };

/* ---------- Tour and version ---------- */
TOUR.push({t:'Install tracker in the app', min:1, dolor:'Before, the install tracker was a spreadsheet outside the system, with rows moved by hand between bands.', show:['Bands set themselves from the job data.', 'Pick a group to fill its columns like a spreadsheet; select several jobs to set a column for all.', 'Download Excel gives the same file as before.'], say:'Fill it here, send the same Excel.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'itr'); }},
  {t:'Programme of works on a calendar', min:1, dolor:'Before, the programme was a second spreadsheet with the same install dates typed again.', show:['Drag a bar to move a measure; the tracker shows the new date.', 'Download Excel keeps the Gantt colours and the status lists.'], say:'One date, in both documents.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'pow'); }});
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.44') v.url = 'https://claude.ai/artifact/QncFMz3LHDHynMD5QVegwT'; } });
VERSIONS.push({v:'v5.45', date:TODAY, major:false, current:true, url:null, title:'Install tracker, Programme of works and Complaints, with their Excel files', sum:'The install tracker and the programme of works that lived in spreadsheets are filled in Delivery and download as the same Excel files; complaints have their own list; a Comment button replaces the Tour button at the bottom.', steps:[
  {t:'Install tracker', min:1, dolor:'Before, the install tracker was a spreadsheet outside the app, with bands kept by moving rows.', show:['Delivery › Install tracker: every E.ON job by band, with a progress bar per group.', 'Pick Enabling or Installation to fill the columns cell by cell.'], say:'The same columns, without moving rows.', go:() => { S.role = 'dir'; S.trail = null; S.f.v45k = 'sum'; go('del', 'itr'); }},
  {t:'Fill several jobs at once', min:.5, dolor:'Before, the same value was typed row by row.', show:['Tick several jobs and use Set a field for all.', 'Arrow keys move between cells; Enter opens one.'], say:'One click for a whole batch.', go:() => { S.role = 'dir'; S.trail = null; S.f.v45k = 'en'; go('del', 'itr'); }},
  {t:'Programme of works', min:1, dolor:'Before, the programme repeated the install dates in a second file.', show:['Drag a bar to move it, or its right edge to change the end.', 'The Install tracker reads the same dates.'], say:'One date, in both places.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'pow'); }},
  {t:'Download the Excel files', min:.5, dolor:'Before, the files were the source; now they come out of the app.', show:['Download Excel gives the PoW with its Gantt colours, or the tracker with its tabs.', 'Blank template, for anyone who still fills it outside.'], say:'Same file, no retyping.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'pow'); }},
  {t:'Complaints', min:.5, dolor:'Before, complaints were a tab of the tracker with days open typed by hand.', show:['Log a complaint on a property with owner and action.', 'Days open counts by itself.'], say:'Nothing open gets forgotten.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'cmp'); }},
  {t:'Comment on any screen', min:.5, dolor:'Before, feedback on the demo came by email or in the meeting.', show:['Comment, at the bottom right: say if it is an improvement, something that does not work or a question.', 'Point at something on the screen or send a file.'], say:'Tell us right where you see it.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'itr'); }}]});

/* =================== v5.46: bill of quantities in Quotes, subcontractor rates, cancelled jobs for Dynamics =================== */
const fmP46 = v => v == null || v === '' ? '' : '£' + Number(v).toLocaleString('en-GB', {minimumFractionDigits:Number(v) % 1 ? 2 : 0, maximumFractionDigits:2});
/* a generic editor in the same popover as the tracker: choices, a number, a text or a date */
const gen46 = (el, spec) => { V45.ed = {gen:spec, at:rect45(el)}; draw45(); };
{ const e0 = edHTML45; edHTML45 = () => { const e = V45.ed;
    if(e.gen){ const g = e.gen, h = `<header><b>${esc(g.t)}</b><button class="ib" data-act="v45edx" aria-label="Close">${ico('x', 15)}</button></header>${g.sub ? `<p class="v45-sub">${esc(g.sub)}</p>` : ''}`;
      if(g.kind === 'ch') return h + chips45(g.o, g.v) + (g.noClear ? '' : `<button class="v45-clr" data-act="v45set" data-v="">Clear</button>`);
      if(g.kind === 'num') return h + `<div class="v45-2"><label><small>${esc(g.lbl || 'Quantity')}</small><input id="v46n" inputmode="decimal" value="${g.v ?? ''}" placeholder="0"></label>${g.unit ? `<span class="v46-u">${esc(g.unit)}</span>` : ''}</div><footer><button class="btn sec sm" data-act="v45set" data-v="">Clear</button><button class="btn pri sm" data-act="v45save">Save</button></footer>`;
      if(g.kind === 'date') return h + `<div class="v45-2"><label><small>Date</small><input type="date" id="v45d1" value="${g.v || ''}"></label><button class="btn sec sm" data-act="v45today">Today</button></div><footer><button class="btn sec sm" data-act="v45set" data-v="">Clear</button><button class="btn pri sm" data-act="v45save">Save</button></footer>`;
      return h + `<textarea id="v45tx" rows="3" placeholder="${esc(g.ph || 'Type here')}">${esc(g.v || '')}</textarea><footer><span class="v45-k">Ctrl + Enter saves</span><button class="btn pri sm" data-act="v45save">Save</button></footer>`; }
    const h = e0(); if(e.task){ const t = DB.pow.find(x => x.id === e.task), c = t && est46(t); if(c) return h.replace('<footer>', `<p class="v46-est">${ico('wallet', 14)}Estimated cost <b>${fmP46(c.v)}</b><small>${esc(c.why)}</small></p><footer>`); } return h; }; }
{ const s0 = A.v45set; A.v45set = el => { const e = V45.ed; if(e && e.gen){ const cb = e.gen.cb; V45.ed = null; cb(el.dataset.v); return; } s0(el); }; }
{ const s0 = A.v45save; A.v45save = () => { const e = V45.ed; if(e && e.gen){ const g = e.gen, cb = g.cb, gv = id => (document.getElementById(id) || {}).value;
      let v = g.kind === 'num' ? String(gv('v46n') || '').replace(/[£,\s]/g, '') : g.kind === 'date' ? gv('v45d1') || '' : (gv('v45tx') || '').trim();
      if(g.kind === 'num' && v !== '' && !(+v >= 0)) return toast('Type a number, for example 12 or 12.5.'); if(g.kind === 'num' && v !== '') v = +v; V45.ed = null; cb(v); return; } s0(); }; }

/* ---------- Bill of quantities: the items of the Quotes sheet, under each measure ---------- */
const BOQG46 = [['lft', 'Loft and survey', 'LI'], ['cwi', 'Cavity', 'CWI'], ['ven', 'Ventilation', 'DMEV']];
const BOQ46 = [
  ['SUR', 'lft', '*', 'Technical survey, quote and design', 'Technical survey, quote and design', 'Property'],
  ['LA1', 'lft', 'LI', 'Enlarge loft access', 'Increase the loft access from 300 x 300 mm to 600 x 600 mm, with timber work, casing, insulated cover, draught seals and catches', 'Item'],
  ['LA2', 'lft', 'LI', 'Loft access ladder', 'Supply and install a loft ladder to British Standards, with fixings', 'Item'],
  ['LC1', 'lft', 'LI', 'Loft clearance, 1 hour', 'Remove items from the attic, labour only, 1 hour', 'Hour'], ['LC2', 'lft', 'LI', 'Loft clearance, 2 hours', 'Remove items from the attic, labour only, 2 hours', 'Hour'], ['LC4', 'lft', 'LI', 'Loft clearance, 4 hours', 'Remove items from the attic, labour only, 4 hours', 'Hour'],
  ['LSP', 'lft', 'LI', 'Loft storage platform', 'Supply and fit a 2 x 2 m storage platform', 'Item'], ['LLT', 'lft', 'LI', 'Loft light', 'Light in the attic on a pull cord switch, with minor works certificate', 'Item'],
  ['VSO', 'lft', 'LI', 'Soffit vents, per vent', 'Loft ventilation through 50 mm soffit vents, with safe access', 'Item'], ['VRT', 'lft', 'LI', 'Roof vent tiles, per vent', 'Loft ventilation through roof vent tiles, with safe access', 'Item'],
  ['LI3', 'lft', 'LI', 'Loft insulation 300 mm, virgin loft', '300 mm mineral wool to a virgin loft', 'm²'], ['LI1', 'lft', 'LI', 'Loft top up 100 mm', '100 mm mineral wool, top up existing', 'm²'], ['LI2', 'lft', 'LI', 'Loft top up 200 mm', '200 mm mineral wool, top up existing', 'm²'],
  ['LHT', 'lft', 'LI', 'Insulate the loft hatch', 'Insulation and draught proofing to the existing loft hatch', 'Item'], ['TNK', 'lft', 'LI', 'Cold water tank jacket', '80 mm jacket to the cold water tank, with exposed pipework', 'Unit'], ['FEX', 'lft', 'LI', 'Feed and expansion tank jacket', '80 mm jacket to the feed and expansion tank, with pipework', 'Unit'],
  ['BRF', 'lft', 'LI', 'Lift and refit boarding', 'Remove loft boarding and refit it with existing materials', 'm²'], ['BRN', 'lft', 'LI', 'Replace boarding', 'Remove loft boarding and install a new floor to match', 'm²'], ['BAT', 'lft', 'LI', 'Battens over joists', 'Timber battens over joists before the floor, for insulation depth', 'm²'], ['XV', 'lft', 'LI', 'Loft cross ventilation', 'Install loft cross ventilation', 'Item'],
  ['EXT', 'cwi', 'CWI', 'Extract defective CWI', 'Extract defective cavity wall insulation and remove from site', 'm²'],
  ['CW1', 'cwi', 'CWI', 'CWI 50 mm mineral wool', '50 mm cavity mineral wool, supply and install', 'm²'], ['CW2', 'cwi', 'CWI', 'CWI 50 mm EPS bead', '50 mm cavity EPS bead, supply and install', 'm²'], ['CW3', 'cwi', 'CWI', 'CWI 75 mm mineral wool', '75 mm cavity mineral wool, supply and install', 'm²'], ['CW4', 'cwi', 'CWI', 'CWI 75 mm EPS bead', '75 mm cavity EPS bead, supply and install', 'm²'],
  ['FK1', 'ven', 'DMEV', 'New kitchen extract fan', 'New 230v kitchen fan with 4 inch core hole, grille and wiring, minor works certificate', 'Item'], ['FK2', 'ven', 'DMEV', 'Replace kitchen extract fan', 'Replace a kitchen fan using the existing core hole', 'Item'],
  ['FB1', 'ven', 'DMEV', 'New bathroom fan, timed overrun', 'New bathroom fan with timed overrun outside zones 1 and 2, core hole and wiring', 'Item'], ['FB2', 'ven', 'DMEV', 'In line loft bathroom fan', 'In line bathroom fan in the attic, ducted to the soffit', 'Item'],
  ['DT1', 'ven', 'DMEV', 'Trim doors up to 10 mm', 'Trim the underside of doors up to 10 mm, per door', 'Item'], ['DT2', 'ven', 'DMEV', 'Trim doors up to 20 mm', 'Trim the underside of doors up to 20 mm, per door', 'Item'],
  ['TV', 'ven', 'DMEV', 'Trickle vent, per window or door', 'Trickle vent to Approved Doc F1 and BS EN 13141-1, per window or door', 'Item'], ['CD', 'ven', 'DMEV', 'Core drill ventilator', 'Core drill ventilator where trickle vents are not possible', 'Unit'],
].map(([id, g, m, n, d, u]) => ({id, g, m, n, d, u}));
const BQ46 = Object.fromEntries(BOQ46.map(x => [x.id, x]));
DB.rate46 = DB.rate46 || {};
DB.boq = DB.boq || {};
const boqPs46 = () => DB.pr.filter(p => EON45(p) && p.ph !== 'Cancelled' && pIdx(p.ph) >= 1);
const boqOf46 = p => DB.boq[p.id] || (DB.boq[p.id] = {q:{}, x:[]});
const appI46 = (p, it) => it.m === '*' || p.ms.some(x => x.m === it.m);
(() => { if(Object.keys(DB.boq).length) return; boqPs46().forEach((p, k) => { const b = boqOf46(p), h = m => p.ms.some(x => x.m === m); b.q.SUR = 1;
    if(h('LI')){ b.q[k % 3 ? 'LI2' : 'LI3'] = 30 + k % 9; b.q.LHT = 1; if(k % 2) b.q.TNK = 1; if(k % 4 === 1) b.q.LC2 = 2; if(k % 5 === 0) b.q.VSO = 4 + k % 3; }
    if(h('CWI')){ b.q[k % 2 ? 'CW1' : 'CW3'] = 62 + k % 15; if(k % 3 === 0) b.q.EXT = 18; }
    if(h('DMEV')){ b.q.FB1 = 1; if(k % 2) b.q.FK1 = 1; b.q.DT1 = 3 + k % 4; b.q.TV = 4 + k % 4; }
    if(h('SPV')) b.x.push({t:k % 3 === 1 ? 'DPI, existing one in place' : 'DPI', a:null}); if(k % 4 === 2) b.x.push({t:'Pavement licence', a:null}); if(k % 5 === 1) b.x.push({t:'Mould clean', a:null}); }); })();
const lines46 = p => Object.entries(boqOf46(p).q).filter(([, q]) => q).map(([id, q]) => ({it:BQ46[id], q}));
const priced46 = p => { const ls = lines46(p), pr = ls.filter(l => DB.rate46[l.it.id] != null), xs = boqOf46(p).x, xp = xs.filter(x => x.a != null && x.a !== '');
  return {n:ls.length + xs.length, np:pr.length + xp.length, v:sum(pr, l => l.q * DB.rate46[l.it.id]) + sum(xp, x => +x.a)}; };
const quoteM46 = p => sum(p.ms, x => x.q);
const qOk46 = p => p.quoteOk === true ? '<span class="v45-st ok">' + CHK55 + 'Approved</span>' : p.quoteOk === false ? '<span class="v45-st bl">Rejected</span>' : '<span class="v45-st bk">Waiting</span>';
const qCell46 = (p, it, r, c) => { if(!appI46(p, it)) return '<span class="v45-na">n/a</span>'; const q = boqOf46(p).q[it.id];
  return `<button type="button" class="v45-c v46-q" data-act="v46q" data-p="${p.id}" data-i="${it.id}" data-r="${r}" data-c="${c}" aria-label="${esc(it.n)}, ${esc(p.ad)}">${q ? `<b>${q}</b><small>${esc(it.u)}</small>` : '<span class="v45-e">Add</span>'}</button>`; };
A.v46q = el => { const p = prOf45(el.dataset.p), it = BQ46[el.dataset.i]; gen46(el, {t:it.n, sub:`${p.ad}. ${it.d}`, kind:'num', unit:it.u, v:boqOf46(p).q[it.id] || '', cb:v => { const b = boqOf46(p); if(v === '' || v === 0) delete b.q[it.id]; else b.q[it.id] = v; log45(p, it.n, v === '' ? 'cleared' : `${v} ${it.u}`); render(); toast(`${it.n} saved.`); }}); };
function boqPage46(){ const g = S.f.q46g || 'sum', q = norm(S.f.v46q), ps = boqPs46().filter(p => !q || norm(`${p.ad} ${p.pc} ${p.ref}`).includes(q)), its = g === 'sum' ? [] : BOQ46.filter(i => i.g === g && ps.some(p => appI46(p, i)));
  const nPr = Object.values(DB.rate46).filter(v => v != null).length, all = boqPs46();
  const head = g === 'sum' ? '<tr><th>Property</th><th>Scheme</th><th>Measures</th><th>Lines</th><th>Extras</th><th>Priced lines</th><th>Quote by measure</th><th>Client</th></tr>' : `<tr><th>Property</th>${its.map(i => `<th title="${esc(i.d)}">${esc(i.n)}<small class="v46-hu">${esc(i.u)}</small></th>`).join('')}</tr>`;
  let r = 0; const row = p => { r++; const pp = priced46(p), b = boqOf46(p);
    return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="v46dr" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(p.ref)}, ${esc(p.pc)}</small></td>` + (g === 'sum'
      ? `<td>${scPill55(p.sc)}</td><td><span class="v45-ms">${mPills45(p)}</span></td><td><b>${lines46(p).length}</b></td><td class="v45-nt">${b.x.length ? `<span>${esc(b.x.map(x => x.t).join(', '))}</span>` : '<span class="v45-na">None</span>'}</td><td>${pp.np ? `<b>${fmP46(pp.v)}</b><small class="v46-s">${pp.np} of ${pp.n} priced</small>` : '<span class="v45-na">No prices yet</span>'}</td><td><b>${fm(quoteM46(p))}</b></td><td>${qOk46(p)}</td>`
      : its.map((i, c) => `<td>${qCell46(p, i, r, c)}</td>`).join('')) + '</tr>'; };
  return trBar() + oph('Quotes and budgets', 'The bill of quantities of each job: how much of each item goes in. Prices per item are optional; while an item has no price, the quote keeps the price per measure from Rates.', `<button class="btn pri" data-act="v45dl" data-v="itr">${ico('down', 15)}Download Excel</button>`)
    + `<div class="v45-row">${seg('q46', 'boq', [['dash', 'Dashboard'], ['boq', 'Bill of quantities']])}</div>`
    + `<div class="cstats">${stat('tb', 'Jobs with quantities', all.filter(p => lines46(p).length).length, `of ${all.length} E.ON jobs`)}${stat('tv', 'Lines entered', sum(all, p => lines46(p).length))}${stat('ta', 'Extras', sum(all, p => boqOf46(p).x.length), 'DPI, licences, cleaning')}${stat('tg', 'Items with a price', nPr, `of ${BOQ46.length}, in Rates`, 'v46rates', '')}</div>`
    + `<div class="v45-row">${seg('q46g', g, [['sum', 'Summary'], ...BOQG46.map(([k, n]) => [k, n])])}</div>`
    + `<div class="v45-fb"><label class="v45-q">${ico('search', 16)}<input id="v46q" data-v45in="v46q" value="${esc(S.f.v46q || '')}" placeholder="Search a property, postcode or reference"></label></div>`
    + `<p class="v45-hint">${g === 'sum' ? 'Open a job to see its lines by measure, add items and extras. Pick a group to type quantities like in the spreadsheet.' : 'Click a cell to type the quantity. Arrow keys move between cells; n/a means the job does not have that measure.'}</p>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t v45-t"><thead>${head}</thead><tbody>${ps.map(row).join('') || `<tr><td colspan="8">${empty('No jobs match.')}</td></tr>`}</tbody></table></div></section>`; }
const closeDiv46 = (h, i) => { const re = /<\/?div\b[^>]*>/g; re.lastIndex = i; let d = 0, m; while((m = re.exec(h))){ d += m[0][1] === '/' ? -1 : 1; if(!d) return m.index + m[0].length; } return -1; };
{ const q0 = VIEWS.com.pages.quo; VIEWS.com.pages.quo = (...x) => { if(S.f.q46 === 'boq') return boqPage46(); const h = q0(...x), i = h.indexOf('<div class="op-h">'), j = i < 0 ? -1 : closeDiv46(h, i);
    const tg = `<div class="v45-row">${seg('q46', 'dash', [['dash', 'Dashboard'], ['boq', 'Bill of quantities']])}</div>`; return j < 0 ? tg + h : h.slice(0, j) + tg + h.slice(j); }; }
A.q46 = el => { S.f.q46 = el.dataset.v; render(); };
A.q46g = el => { S.f.q46g = el.dataset.v; render(); };
A.v46rates = () => go('com', 'rate');
A.v46dr = el => { V45.ed = null; V45.dr = {k:'boq', id:el.dataset.v}; draw45(); };
const addOpts46 = (p, g) => BOQ46.filter(i => appI46(p, i) && !boqOf46(p).q[i.id] && (!g || i.m === g || (i.m === '*' && g === 'LI')));
A.v46add = el => { const p = prOf45(el.dataset.v), opts = addOpts46(p, el.dataset.g);
  gen46(el, {t:'Add an item', sub:p.ad, kind:'ch', o:opts.map(i => i.n), noClear:true, cb:n => { const it = opts.find(i => i.n === n); if(!it) return; boqOf46(p).q[it.id] = 1; log45(p, it.n, '1 ' + it.u); render(); toast(`${it.n} added with quantity 1. Click it to change the quantity.`); }}); };
A.v46q2 = el => A.v46q(el);
A.v46x = el => { const p = prOf45(el.dataset.v), b = boqOf46(p), i = el.dataset.i, x = i === '' || i == null ? null : b.x[+i];
  gen46(el, {t:x ? 'Extra' : 'Add an extra', sub:'Things outside the price list: DPI, pavement licence, mould clean...', kind:'txt', v:x ? x.t : '', ph:'For example: DPI', cb:v => { if(!v){ if(x) b.x.splice(+i, 1); } else if(x) x.t = v; else b.x.push({t:v, a:null}); log45(p, 'Extra', v || 'removed'); render(); }}); };
A.v46xa = el => { const p = prOf45(el.dataset.v), x = boqOf46(p).x[+el.dataset.i]; gen46(el, {t:'Amount', sub:x.t, kind:'num', lbl:'Amount', unit:'£', v:x.a ?? '', cb:v => { x.a = v === '' ? null : v; render(); }}); };
const drBoq46 = p => { const b = boqOf46(p), pp = priced46(p);
  const sec = (m, n) => { const its = BOQ46.filter(i => (i.m === m || (m === 'LI' && i.m === '*')) && b.q[i.id]); return `<section class="v45-sec"><h3><span class="oi2">${ico('layers', 16)}</span>${esc(n)}<em>${its.length} ${its.length === 1 ? 'line' : 'lines'}</em></h3>${its.map(i => { const pr = DB.rate46[i.id]; return `<div class="v45-fr"><span>${esc(i.n)}${pr != null ? `<small class="v46-s">${fmP46(pr)} per ${esc(i.u.toLowerCase())}</small>` : ''}</span><span class="v46-l"><button class="v45-c v46-q" data-act="v46q2" data-p="${p.id}" data-i="${i.id}"><b>${b.q[i.id]}</b><small>${esc(i.u)}</small></button>${pr != null ? `<b class="v46-t">${fmP46(pr * b.q[i.id])}</b>` : '<span class="v45-na">no price</span>'}</span></div>`; }).join('') || '<p class="v45-sub">No lines yet.</p>'}${addOpts46(p, m).length ? `<div class="v45-acts"><button class="v45-add" data-act="v46add" data-v="${p.id}" data-g="${m}">${ico('plus', 13)}Add an item</button></div>` : ''}</section>`; };
  const ms = BOQG46.filter(([, , m]) => p.ms.some(x => x.m === m) || (m === 'LI' && b.q.SUR));
  return `<header><div><small>${esc(p.ref)}, ${esc(p.pc)}</small><h2>${esc(p.ad)}</h2><span class="v45-hb">${scPill55(p.sc)}<span class="v45-ms">${mPills45(p)}</span>${qOk46(p)}</span></div><button class="ib" data-act="v45drx" aria-label="Close">${ico('x', 17)}</button></header><div class="v45-db">`
    + `<div class="v46-tot"><span><small>Quote by measure</small><b>${fm(quoteM46(p))}</b><i>${esc(p.ms.map(x => `${MEAS[x.m].s} ${fm(x.q)}`).join(', '))}</i></span><span><small>Priced lines</small><b>${pp.np ? fmP46(pp.v) : '–'}</b><i>${pp.np} of ${pp.n} lines have a price</i></span></div>`
    + `<p class="v45-sub">The quote stays by measure until every line has a price in Rates. Then both totals can be compared here.</p>`
    + ms.map(([, n, m]) => sec(m, n)).join('')
    + `<section class="v45-sec"><h3><span class="oi2">${ico('plus', 16)}</span>Extras<em>${b.x.length}</em></h3>${b.x.map((x, i) => `<div class="v45-fr"><button class="v45-c" data-act="v46x" data-v="${p.id}" data-i="${i}">${esc(x.t)}</button><button class="v45-c" data-act="v46xa" data-v="${p.id}" data-i="${i}">${x.a != null ? `<b>${fmP46(x.a)}</b>` : '<span class="v45-e">Amount</span>'}</button></div>`).join('') || '<p class="v45-sub">No extras.</p>'}<div class="v45-acts"><button class="v45-add" data-act="v46x" data-v="${p.id}" data-i="">${ico('plus', 13)}Add an extra</button></div></section></div>`; };

/* Rates: the items with an optional price */
{ const r0 = VIEWS.com.pages.rate; VIEWS.com.pages.rate = (...x) => { const h = r0(...x), n = Object.values(DB.rate46).filter(v => v != null).length;
    const tb = `<section class="rsec v46-rs"><div class="rs-h"><h3>Bill of quantities items</h3><p>The items of the Quotes sheet, under each measure. A price is optional: ${n} of ${BOQ46.length} have one. While an item has no price, quotes keep the price per measure above.</p></div><section class="rd55"><div class="rd55-w"><table class="rd55-t v46-it"><thead><tr><th>Item</th><th>Group</th><th>Measure</th><th>Unit</th><th>Price</th></tr></thead><tbody>`
      + BOQ46.map(i => `<tr><td class="rd55-pr"><b>${esc(i.n)}</b><small title="${esc(i.d)}">${esc(i.d)}</small></td><td>${esc(BOQG46.find(g => g[0] === i.g)[1])}</td><td>${i.m === '*' ? 'Every job' : esc(MEAS[i.m].s)}</td><td>${esc(i.u)}</td><td><button class="v45-c" data-act="v46rp" data-v="${i.id}">${DB.rate46[i.id] != null ? `<b>${fmP46(DB.rate46[i.id])}</b>` : '<span class="v45-e">Price</span>'}</button></td></tr>`).join('') + '</tbody></table></div></section></section>';
    return h + tb; }; }
A.v46rp = el => { const i = BQ46[el.dataset.v]; gen46(el, {t:i.n, sub:`Price per ${i.u.toLowerCase()}. Leave it empty if there is no agreed price.`, kind:'num', lbl:'Price', unit:'£ per ' + i.u.toLowerCase(), v:DB.rate46[i.id] ?? '', cb:v => { if(v === '') delete DB.rate46[i.id]; else DB.rate46[i.id] = v; render(); toast(v === '' ? `${i.n} has no price.` : `${i.n}: ${fmP46(v)} per ${i.u.toLowerCase()}.`); }}); };

/* ---------- Quote approved in the tracker reads the client approval of Quotes and budgets ---------- */
const qaOf46 = p => p.quoteOk === true ? 'Yes' : p.quoteOk === false ? 'No' : '';
FK45.quo.n = 'Quote approved'; FK45.quo.app = null;
/* keep the tracker in step: whenever a render happens, the stored value follows the approval */
{ const r46 = render; render = (...x) => { trk45().forEach(p => { const it = DB.itr[p.id]; if(it) it.quo = qaOf46(p); }); r46(...x); }; }
{ const s0 = set45; set45 = (ids, fk, v) => { if(fk === 'quo') ids.forEach(id => { const p = prOf45(id); if(p) p.quoteOk = v === 'Yes' ? true : v === 'No' ? false : null; }); s0(ids, fk, v); }; }

/* ---------- Subcontractor rates (the Subbie Cost sheet) ---------- */
DB.subs46 = DB.subs46 || [
  {id:'SB-1', n:'Kent Solar Fitters', ct:'Ben Carter', ty:'Roof and electrics', r:[['Solar PV install', 'Solar PV', 'per job', 1450], ['Battery', '', 'per job', 380], ['Extra electrical materials', '', 'per job', null], ['Waste disposal', '', 'per job', 90]]},
  {id:'SB-2', n:'Medway Electrical Ltd', ct:'Petra Novak', ty:'Roof and electrics', r:[['Solar PV install', 'Solar PV', 'per job', 1520], ['Battery', '', 'per job', null], ['Extra electrical materials', '', 'per job', null]]},
  {id:'SB-3', n:'Brightline Electrical', ct:'Hal Imeri', ty:'Inverter and dMEV', r:[['Inverter and battery, day rate', 'Solar PV', 'per day', 320], ['dMEV install', 'Ventilation', 'per item', 210], ['Electric panel heater', '', 'per item', null]]},
  {id:'SB-4', n:'Thames Ventilation', ct:'Mo Haddad', ty:'dMEV and certificates', r:[['dMEV core hole', 'Ventilation', 'per item', 180], ['dMEV new wiring', '', 'per item', 95], ['dMEV replacement', '', 'per item', 140], ['EIC and BR', '', 'per job', 85], ['Minor works certificate', '', 'per job', 45]]},
  {id:'SB-5', n:'Weald Scaffolding', ct:'Sam Reid', ty:'Scaffold', r:[['Scaffold erect, two weeks hire', 'Scaffold erect', 'per job', 650], ['Extra lift', '', 'per item', 120]]},
  {id:'SB-6', n:'Kent Loft Services', ct:'Leo Brandt', ty:'Loft and roof', r:[['Loft insulation', 'Loft insulation', 'per job', 420], ['Roof repair', 'Roof repair', 'per job', null]]},
].map(s => ({...s, r:s.r.map(([job, m, u, p], i) => ({id:`${s.id}-${i}`, job, m, u, p, cm:''}))}));
INST45.length = 0; DB.subs46.forEach(s => INST45.push(s.n));
const est46 = t => { const s = DB.subs46.find(x => x.n === t.by); if(!s) return null; const r = s.r.find(x => x.m === t.m && x.p != null); if(!r) return null;
  const d = r.u === 'per day' ? (nwd45(t.s, t.e) || 1) : 1; return {v:r.p * d, why:`${s.n}, ${r.job}, ${fmP46(r.p)} ${r.u}${r.u === 'per day' ? ` x ${d} days` : ''}`}; };
VIEWS.del.pages.sbr = () => { const W = win45(), tm = DB.pow.filter(t => t.s && t.s <= W.b && (t.e || t.s) >= W.a && DB.subs46.some(s => s.n === t.by)), all = DB.subs46.flatMap(s => s.r), cost = sum(tm, t => (est46(t) || {}).v || 0);
  const body = DB.subs46.map(s => { const jobs = tm.filter(t => t.by === s.n);
    return `<tr class="v45-band"><td colspan="6"><span><b class="v46-sn">${esc(s.n)}</b><button class="v45-c" data-act="v46sct" data-v="${s.id}">${s.ct ? esc(s.ct) : '<span class="v45-e">Contact</span>'}</button><span class="v45-ch">${esc(s.ty)}</span><small>${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} in ${MONTHS45[W.mo - 1]}</small><button class="v45-add" data-act="v46sr" data-v="${s.id}">${ico('plus', 13)}Add a rate</button></span></td></tr>`
      + s.r.map(r => `<tr><td class="rd55-pr"><button class="v45-c" data-act="v46sj" data-v="${r.id}"><b>${esc(r.job)}</b></button></td><td><button class="v45-c" data-act="v46sm" data-v="${r.id}">${r.m ? esc(r.m) : '<span class="v45-na">Any</span>'}</button></td><td><button class="v45-c" data-act="v46su" data-v="${r.id}"><span class="v45-ch">${esc(r.u)}</span></button></td><td><button class="v45-c" data-act="v46sp" data-v="${r.id}">${r.p != null ? `<b>${fmP46(r.p)}</b>` : '<span class="v45-st bk">Not set</span>'}</button></td><td class="v45-nt"><button class="v45-c" data-act="v46sc" data-v="${r.id}">${r.cm ? `<span>${esc(r.cm)}</span>` : '<span class="v45-e">Comment</span>'}</button></td><td>${r.m ? tm.filter(t => t.by === s.n && t.m === r.m).length || '–' : '–'}</td></tr>`).join(''); }).join('');
  return trBar() + oph('Subcontractor rates', 'What each subcontractor charges per job type. The Programme of works uses these names as installers and estimates the cost of each task from its rate.', `<button class="btn sec" data-act="v46sadd">${ico('plus', 15)}Add a subcontractor</button><button class="btn pri" data-act="v45dl" data-v="itr">${ico('down', 15)}Download Excel</button>`)
    + `<div class="cstats">${stat('tb', 'Subcontractors', DB.subs46.length)}${stat('tg', 'Rates set', all.filter(r => r.p != null).length, `of ${all.length} job types`)}${stat('tv', `Tasks in ${MONTHS45[W.mo - 1]}`, tm.length, 'with a subcontractor')}${stat('ta', 'Estimated cost', fm(cost), 'from the rates')}</div>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t"><thead><tr><th>Job type</th><th>Programme task</th><th>Unit</th><th>Price</th><th>Comments</th><th>Tasks this month</th></tr></thead><tbody>${body}</tbody></table></div></section>`; };
const sr46 = id => { for(const s of DB.subs46){ const r = s.r.find(x => x.id === id); if(r) return [s, r]; } return []; };
A.v46sp = el => { const [s, r] = sr46(el.dataset.v); gen46(el, {t:r.job, sub:s.n, kind:'num', lbl:'Price', unit:'£ ' + r.u, v:r.p ?? '', cb:v => { r.p = v === '' ? null : v; render(); toast(`${r.job}: ${v === '' ? 'no price' : fmP46(v) + ' ' + r.u}.`); }}); };
A.v46su = el => { const [s, r] = sr46(el.dataset.v); gen46(el, {t:'Unit', sub:`${s.n}, ${r.job}`, kind:'ch', o:['per job', 'per day', 'per item', 'per m²'], v:r.u, noClear:true, cb:v => { r.u = v; render(); }}); };
A.v46sm = el => { const [s, r] = sr46(el.dataset.v); gen46(el, {t:'Programme task', sub:'The cost of this task in the Programme of works is estimated from this rate.', kind:'ch', o:PMEAS45, v:r.m, cb:v => { r.m = v; render(); }}); };
A.v46sj = el => { const [s, r] = sr46(el.dataset.v); gen46(el, {t:'Job type', sub:s.n, kind:'txt', v:r.job, cb:v => { if(!v){ s.r.splice(s.r.indexOf(r), 1); toast(`Rate removed from ${s.n}.`); } else r.job = v; render(); }}); };
A.v46sc = el => { const [s, r] = sr46(el.dataset.v); gen46(el, {t:'Comments', sub:`${s.n}, ${r.job}`, kind:'txt', v:r.cm, cb:v => { r.cm = v; render(); }}); };
A.v46sct = el => { const s = DB.subs46.find(x => x.id === el.dataset.v); gen46(el, {t:'Contact', sub:s.n, kind:'txt', v:s.ct, cb:v => { s.ct = v; render(); }}); };
A.v46sr = el => { const s = DB.subs46.find(x => x.id === el.dataset.v); gen46(el, {t:'Add a rate', sub:s.n, kind:'txt', ph:'Job type, for example: Battery install', cb:v => { if(!v) return; s.r.push({id:`${s.id}-${s.r.length + Date.now() % 1000}`, job:v, m:'', u:'per job', p:null, cm:''}); render(); toast('Rate added. Set its price and unit in the row.'); }}); };
A.v46sadd = el => gen46(el, {t:'Add a subcontractor', kind:'txt', ph:'Company name', cb:v => { if(!v) return; DB.subs46.push({id:'SB-' + (DB.subs46.length + 1), n:v, ct:'', ty:'Subcontract labour', r:[]}); INST45.push(v); render(); toast(`${v} added. Add its rates.`); }});

/* ---------- Cancelled jobs, in the format Dynamics exports and imports ---------- */
const SR46 = ['Property Unsuitable', 'Customer Withdrew', 'No Response', 'Not Eligible', 'Duplicate'];
(() => { if(DB.pr.some(p => p.id === 'PR-2113')) return; const b = DB.pr.find(p => p.id === 'PR-2012'); if(!b) return;
  [['27 Saxon Way', 'ME7 2RT', 'SC-01', ['SPV'], 'Colin Marsh', 'Roof faces north, only 4 panels fit', 'B. Assess and design', 'Property Unsuitable'], ['6 Albion Place', 'CT11 8HQ', 'SC-02', ['LI', 'DMEV'], 'Amy Fowler', 'Customer withdrew after the survey', 'C. Client approval', 'Customer Withdrew'], ['130 Canterbury Road', 'CT9 5JL', 'SC-02', ['SPV', 'LI'], 'Raj Patel', 'Slate tiles look like they contain asbestos', 'D. Prepare to install', 'Property Unsuitable']].forEach(([ad, pc, sc, ms, res, why, at, sr], i) => {
    const p = JSON.parse(JSON.stringify(b)), r = RATE['E.ON'] || {}; Object.assign(p, {id:'PR-' + (2113 + i), ad, pc, sc, res, ref:'EON-' + (49230 + i * 11), ph:'Cancelled', phOn:addDays(TODAY, -(8 + i * 5)), ms:ms.map(m => ({m, q:r[m] || 1500, b:Math.round((r[m] || 1500) * .74), dsg:false, dap:false, ip:0})), cancel:{why, at, abort:true}, his:[[addDays(TODAY, -60), `Job received from ${scOf(sc).cl}`, 'sar']]});
    DB.pr.push(p); }); })();
const cxl46 = () => DB.pr.filter(p => EON45(p) && p.ph === 'Cancelled');
const hx46 = (s, n) => { let h = 2166136261; for(const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; let o = ''; for(let i = 0; i < n; i++){ h = Math.imul(h ^ i, 16777619) >>> 0; o += (h % 16).toString(16); } return o; };
const dynOf46 = p => p.dyn46 || (p.dyn46 = {rid:`${hx46(p.id, 8)}-${hx46(p.id + 'a', 4)}-f111-88b4-${hx46(p.id + 'b', 12)}`, ck:btoa(hx46(p.ref, 48)).slice(0, 64), mod:p.phOn || TODAY, sr:p.id === 'PR-2114' ? 'Customer Withdrew' : 'Property Unsuitable', quoted:p.cancel && pIdx(p.cancel.at) >= 2 ? 'yes' : 'no', cc:p.id === 'PR-2115' ? 'no' : 'yes', cm:'', imp:false});
const CXF46 = [['sr', 'Status reason', 'ch', SR46], ['quoted', 'Quoted', 'ch', ['yes', 'no']], ['why', 'Cancellation reason', 'txt'], ['cc', 'Customer contacted', 'ch', ['yes', 'no']], ['cm', 'Comments', 'txt']];
const cxv46 = (p, k) => k === 'why' ? (p.cancel || {}).why || '' : dynOf46(p)[k] || '';
A.v46cx = el => { const p = prOf45(el.dataset.v), f = CXF46.find(x => x[0] === el.dataset.f); gen46(el, {t:f[1], sub:p.ad, kind:f[2], o:f[3], v:cxv46(p, f[0]), cb:v => { if(f[0] === 'why') (p.cancel || (p.cancel = {at:'', abort:true})).why = v; else dynOf46(p)[f[0]] = v; dynOf46(p).mod = TODAY; log45(p, f[1], v || 'cleared'); render(); toast(`${f[1]} saved.`); }}); };
VIEWS.del.pages.cxl = () => { const xs = cxl46(), c = (p, k) => { const v = cxv46(p, k), f = CXF46.find(x => x[0] === k);
    const inn = !v ? '<span class="v45-e">Add</span>' : k === 'sr' ? `<span class="v45-ch">${esc(v)}</span>` : f[2] === 'ch' ? `<span class="v45-st ${v === 'yes' ? 'ok' : 'bk'}">${v === 'yes' ? CHK55 : ''}${esc(v)}</span>` : `<span class="v45-tx" title="${esc(v)}">${esc(v)}</span>`;
    return `<button type="button" class="v45-c" data-act="v46cx" data-v="${p.id}" data-f="${k}">${inn}</button>`; };
  const row = p => { const d = dynOf46(p); return `<tr><td class="rd55-pr"><button class="rd55-pn" data-act="v45op" data-v="${p.id}">${esc(p.ad)}</button><small>${esc(p.ref)}, ${esc(p.pc)}</small></td><td>${c(p, 'sr')}</td><td><span class="v45-ms">${mPills45(p)}</span></td><td><span class="v45-ch">${esc(((p.cancel || {}).at || '').replace(/^[A-F]\. /, '') || '–')}</span></td><td>${c(p, 'quoted')}</td><td>${c(p, 'why')}</td><td>${c(p, 'cc')}</td><td>${c(p, 'cm')}</td><td>${sh45(d.mod)}${d.imp ? '<small class="v46-s">from Dynamics</small>' : ''}</td></tr>`; };
  return trBar() + oph('Cancelled jobs', 'E.ON jobs that will not go ahead, with the columns Dynamics uses. Import the Dynamics export to bring its IDs in, fill the reason and contact here, and download it back for Dynamics.', `<label class="btn sec v46-up">${ico('upload', 15)}Import from Dynamics<input type="file" accept=".xlsx,.csv" data-v46imp="1" hidden></label><button class="btn pri" data-act="v45dl" data-v="cxl">${ico('down', 15)}Download for Dynamics</button>`)
    + `<div class="cstats">${stat('tb', 'Cancelled jobs', xs.length)}${stat('tg', 'Customer contacted', xs.filter(p => dynOf46(p).cc === 'yes').length)}${stat('tred', 'Not contacted yet', xs.filter(p => dynOf46(p).cc !== 'yes').length)}${stat('tv', 'Quoted before cancelling', xs.filter(p => dynOf46(p).quoted === 'yes').length)}</div>`
    + `<p class="v45-hint">The Dynamics file keeps its three "Do Not Modify" columns, so Dynamics can import it back. Click a cell to change it.</p>`
    + `<section class="rd55"><div class="rd55-w"><table class="rd55-t"><thead><tr><th>Property</th><th>Status reason</th><th>Measures</th><th>Cancelled at</th><th>Quoted</th><th>Cancellation reason</th><th>Customer contacted</th><th>Comments</th><th>Modified on</th></tr></thead><tbody>${xs.map(row).join('') || `<tr><td colspan="9">${empty('No cancelled jobs.')}</td></tr>`}</tbody></table></div></section>`; };
const DYNH46 = ['(Do Not Modify) Retrofit', '(Do Not Modify) Row Checksum', '(Do Not Modify) Modified On', 'Status Reason', 'Business Transaction (Opportunity) (Opportunity)', 'Building Name (Address 1) (Contact) (Contact)', 'Post Code (Address 1) (Contact) (Contact)', 'Contact Name', 'Email (Contact) (Contact)', 'Mobile Phone (Contact) (Contact)', 'Home Phone (Contact) (Contact)', 'Measures', 'Quoted', 'Cancellation reason', 'Customer Contacted', 'comments'];
function dynSheet46(wb, blank){ const ws = wb.addWorksheet('Cancelled Tracker'); DYNH46.forEach((h, i) => { const c = ws.getCell(1, i + 1); c.value = h; HDR45(c); ws.getColumn(i + 1).width = [38, 30, 18, 20, 16, 30, 12, 20, 24, 16, 16, 18, 10, 44, 12, 34][i]; }); ws.getRow(1).height = 42;
  [1, 2, 3].forEach(i => ws.getColumn(i).hidden = true);
  (blank ? [] : cxl46()).forEach((p, i) => { const d = dynOf46(p), row = ws.getRow(i + 2); [d.rid, d.ck, xd45(d.mod), d.sr, p.ref, p.ad, p.pc, null, null, null, null, p.ms.map(x => MEAS[x.m].s).join(', '), d.quoted, (p.cancel || {}).why || '', d.cc, d.cm || null].forEach((v, j) => row.getCell(j + 1).value = v); row.getCell(3).numFmt = 'dd/mm/yyyy hh:mm'; row.eachCell({includeEmpty:true}, x => x.font = {name:'Arial', size:10}); });
  ws.dataValidations.add('D2:D300', {type:'list', allowBlank:true, formulae:[`"${SR46.join(',')}"`]}); ['M', 'O'].forEach(L => ws.dataValidations.add(`${L}2:${L}300`, {type:'list', allowBlank:true, formulae:['"yes,no"']})); ws.views = [{state:'frozen', ySplit:1}]; return ws; }
/* import: read the Dynamics export and match each row by its Business Transaction */
const csv46 = t => { const rows = []; let r = [], f = '', q = false; for(let i = 0; i < t.length; i++){ const ch = t[i]; if(q){ if(ch === '"' && t[i + 1] === '"'){ f += '"'; i++; } else if(ch === '"') q = false; else f += ch; } else if(ch === '"') q = true; else if(ch === ','){ r.push(f); f = ''; } else if(ch === '\n' || ch === '\r'){ if(ch === '\r' && t[i + 1] === '\n') i++; r.push(f); rows.push(r); r = []; f = ''; } else f += ch; } if(f || r.length){ r.push(f); rows.push(r); } return rows; };
document.addEventListener('change', async e => { if(!e.target.dataset || !e.target.dataset.v46imp) return; const fl = e.target.files && e.target.files[0]; e.target.value = ''; if(!fl) return;
  try { let rows; if(/\.csv$/i.test(fl.name)) rows = csv46(await fl.text()); else { const X = await xl45(), wb = new X.Workbook(); await wb.xlsx.load(await fl.arrayBuffer()); const ws = wb.worksheets.find(w => /cancel/i.test(w.name)) || wb.worksheets[0]; rows = []; ws.eachRow({includeEmpty:false}, r => rows.push(r.values.slice(1).map(v => v && v.text ? v.text : v && v.result != null ? v.result : v instanceof Date ? iso(new Date(v.getTime() + v.getTimezoneOffset() * 6e4)) : v == null ? '' : String(v)))); }
    const hi = rows.findIndex(r => r.some(c => /Business Transaction/i.test(c))); if(hi < 0) return toast('That file has no Business Transaction column. Use the Dynamics export of cancelled jobs.');
    const H = rows[hi], ix = re => H.findIndex(c => re.test(String(c))), I = {rid:ix(/Retrofit/), ck:ix(/Checksum/), mod:ix(/Modified On/), sr:ix(/Status Reason/), bt:ix(/Business Transaction/), why:ix(/Cancellation reason/i), cc:ix(/Customer Contacted/i), cm:ix(/^comments$/i), q:ix(/^Quoted$/i)};
    const res = {up:[], open:[], miss:[]}; rows.slice(hi + 1).filter(r => r[I.bt]).forEach(r => { const ref = String(r[I.bt]).trim(), p = DB.pr.find(x => x.ref === ref);
      if(!p) return res.miss.push(ref); if(p.ph !== 'Cancelled') return res.open.push(p.id); const d = dynOf46(p), g = k => I[k] >= 0 ? String(r[I[k]] || '').trim() : '';
      Object.assign(d, {rid:g('rid') || d.rid, ck:g('ck') || d.ck, mod:(g('mod') || '').slice(0, 10) || d.mod, sr:g('sr') || d.sr, quoted:g('q') || d.quoted, cc:g('cc') || d.cc, cm:g('cm') || d.cm, imp:true}); if(g('why') && !(p.cancel || {}).why) (p.cancel || (p.cancel = {at:'', abort:true})).why = g('why'); res.up.push(p.id); });
    V45.dr = {k:'cmp', id:'imp' + Date.now(), imp:{res, f:fl.name}}; render(); }
  catch(err){ toast('The file could not be read. Try the .xlsx export from Dynamics.'); } });
const drImp46 = () => { const {res, f} = V45.dr.imp, li = (ids, t) => ids.map(id => { const p = prOf45(id); return `<div class="v45-fr"><span>${esc(p.ad)}<small class="v46-s">${esc(p.ref)}</small></span>${t}</div>`; }).join('');
  return `<header><div><small>${esc(f)}</small><h2>Dynamics import</h2></div><button class="ib" data-act="v45drx" aria-label="Close">${ico('x', 17)}</button></header><div class="v45-db">`
    + `<section class="v45-sec"><h3><span class="oi2">${ico('check', 16)}</span>Updated<em>${res.up.length}</em></h3>${li(res.up, '<span class="v45-st ok">' + CHK55 + 'IDs and status brought in</span>') || '<p class="v45-sub">None.</p>'}</section>`
    + `<section class="v45-sec"><h3><span class="oi2">${ico('alert', 16)}</span>Cancelled in Dynamics, open here<em>${res.open.length}</em></h3>${res.open.map(id => { const p = prOf45(id); return `<div class="v45-fr"><span>${esc(p.ad)}<small class="v46-s">${esc(p.ref)}, ${esc(p.ph)}</small></span><button class="btn sec sm" data-act="v45op" data-v="${p.id}">Open the property</button></div>`; }).join('') || '<p class="v45-sub">None.</p>'}</section>`
    + `<section class="v45-sec"><h3><span class="oi2">${ico('search', 16)}</span>Not found in the app<em>${res.miss.length}</em></h3>${res.miss.map(r => `<div class="v45-fr"><span>${esc(r)}</span><span class="v45-na">no property with this reference</span></div>`).join('') || '<p class="v45-sub">None.</p>'}</section></div><footer><span></span><button class="btn pri" data-act="v45drx">Done</button></footer>`; };
{ const d0 = drHTML45; drHTML45 = () => V45.dr.k === 'boq' ? drBoq46(prOf45(V45.dr.id)) : V45.dr.imp ? drImp46() : d0(); }


/* ---------- Excel: Quotes and Subbie Cost tabs, Cancelled Tracker in the Dynamics format ---------- */
function quotesSheet46(wb, blank){ const ws = wb.addWorksheet('Quotes'), C0 = 4, ps = blank ? [] : boqPs46().filter(p => lines46(p).length || boqOf46(p).x.length);
  let c = C0; BOQG46.forEach(([g, n]) => { const its = BOQ46.filter(i => i.g === g); ws.mergeCells(1, c, 1, c + its.length - 1); const h = ws.getCell(1, c); h.value = n; h.font = {name:'Arial', bold:true, size:10, color:{argb:'FF1F3864'}}; h.fill = fill45('FFDDE5F3'); h.alignment = {horizontal:'center'}; c += its.length; });
  ws.getCell(1, c).value = 'POA'; ws.getCell(1, c).font = {name:'Arial', bold:true, size:10};
  BOQ46.forEach((i, j) => { const h = ws.getCell(2, C0 + j); h.value = i.d; h.font = {name:'Arial', size:8}; h.alignment = {wrapText:true, vertical:'top'}; ws.getCell(3, C0 + j).value = i.u; ws.getCell(3, C0 + j).font = {name:'Arial', size:9, italic:true}; ws.getCell(3, C0 + j).alignment = {horizontal:'center'};
    const pr = DB.rate46[i.id]; if(pr != null){ ws.getCell(4, C0 + j).value = pr; ws.getCell(4, C0 + j).numFmt = '£#,##0.00'; } ws.getColumn(C0 + j).width = 11; });
  ws.getRow(2).height = 96; ['ID', 'Address', 'Postcode'].forEach((h, i) => { const x = ws.getCell(5, i + 1); x.value = h; HDR45(x); }); ws.getCell(4, 3).value = 'Price (optional)'; ws.getCell(4, 3).font = {name:'Arial', size:9, italic:true};
  [14, 30, 11].forEach((w, i) => ws.getColumn(i + 1).width = w); ws.getColumn(c).width = 34;
  ps.forEach((p, k) => { const row = ws.getRow(6 + k), b = boqOf46(p); [p.ref, p.ad, p.pc].forEach((v, i) => row.getCell(i + 1).value = v); BOQ46.forEach((i, j) => { if(b.q[i.id]) row.getCell(C0 + j).value = b.q[i.id]; }); row.getCell(c).value = b.x.map(x => x.t + (x.a != null ? ` (${fmP46(x.a)})` : '')).join(', ') || null; row.eachCell({includeEmpty:false}, x => x.font = {name:'Arial', size:10}); });
  ws.views = [{state:'frozen', xSplit:3, ySplit:5}]; }
function subbieSheet46(wb){ const ws = wb.addWorksheet('Subbie Cost'), H = ['Subcontractor', 'Contact', 'Type', 'Unit', 'Price', 'Comments', 'Programme task'];
  H.forEach((h, i) => { const c = ws.getCell(2, i + 2); c.value = h; HDR45(c); ws.getColumn(i + 2).width = [28, 16, 32, 10, 10, 30, 20][i]; }); ws.getColumn(1).width = 3; let r = 3;
  DB.subs46.forEach(s => { const a = ws.getRow(r); a.getCell(2).value = s.n; a.getCell(3).value = s.ct || null; a.getCell(4).value = s.ty; [2, 3, 4].forEach(j => a.getCell(j).font = {name:'Arial', bold:true, size:10}); r++;
    s.r.forEach(x => { const w = ws.getRow(r++); w.getCell(4).value = x.job; w.getCell(5).value = x.u; if(x.p != null){ w.getCell(6).value = x.p; w.getCell(6).numFmt = '£#,##0.00'; } w.getCell(7).value = x.cm || null; w.getCell(8).value = x.m || null; w.eachCell(z => { if(!z.font || !z.font.bold) z.font = {name:'Arial', size:10}; }); }); r++; }); }
{ const b0 = itrBook45; itrBook45 = (X, blank) => { const wb = b0(X, blank), old = wb.getWorksheet('Cancelled Tracker'); if(old) wb.removeWorksheet(old.id); quotesSheet46(wb, blank); subbieSheet46(wb); dynSheet46(wb, blank);
    const hw = wb.getWorksheet('How to fill'); if(hw){ wb.removeWorksheet(hw.id); const n = wb.addWorksheet('How to fill'); hw.eachRow((row, i) => { n.getCell(i, 1).value = row.getCell(1).value; n.getCell(i, 1).font = row.getCell(1).font; }); n.getColumn(1).width = 110; } return wb; }; }
{ const d0 = A.v45dl; A.v45dl = async el => { if(el.dataset.v !== 'cxl') return d0(el); if(el.disabled) return; el.disabled = true;
    try { const X = await xl45(), wb = new X.Workbook(); dynSheet46(wb, false); const buf = await wb.xlsx.writeBuffer(), d = fromIso(TODAY), name = `Cancelled_Tracker_for_Dynamics_${d.getDate()}_${MON45[d.getMonth() + 1]}_${d.getFullYear()}.xlsx`;
      if(await saveFile4(name, new Blob([buf], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))) toast(`${name} is ready.`); } catch(e){ toast('The Excel file could not be prepared. Check the connection and try again.'); } finally { el.disabled = false; } }; }

/* ---------- Menu, help, version ---------- */
{ const dl = SEC5.find(s => s.k === 'del'), r = [...DEL4, 'dir'], cx = mk('cxl', 'Cancelled jobs', 'x', () => 'del:cxl', r), sb = mk('sbr', 'Subcontractor rates', 'wallet', () => 'del:sbr', [...r, ...MON4]);
  const w = dl.groups[0][1]; w.splice(w.findIndex(x => x.k === 'cmp') + 1, 0, cx); const pg = dl.groups.find(g => g[0] === 'Purchasing'); if(pg) pg[1].push(sb); [cx, sb].forEach(x => ITEMS4.push({...x, sec:'Delivery'})); }
if(HELP.del && HELP.del.views) HELP.del.views.push(HV('cxl', 'Cancelled jobs', 'x', 'The cancelled tracker, with the Dynamics columns.', ['As install coordinator I import the Dynamics export, fill the reason and whether we contacted the customer, and download the file back for Dynamics.']), HV('sbr', 'Subcontractor rates', 'wallet', 'The subbie cost sheet.', ['As install coordinator I keep what each subcontractor charges, pick them as installers in the programme and see the estimated cost of each task.']));
if(HELP.com && HELP.com.views) HELP.com.views.push(HV('quo', 'Bill of quantities', 'layers', 'The Quotes sheet, inside Quotes and budgets.', ['As designer or commercial I type how much of each item goes into a job, like in the Quotes sheet; prices per item are optional.']));
VERSIONS.forEach(v => { if(v.current){ v.current = false; if(v.v === 'v5.45') v.url = 'https://claude.ai/artifact/NjrJq8aQwycbjgeTqMSCMr'; } });
VERSIONS.push({v:'v5.46', date:TODAY, major:false, current:true, url:null, title:'Bill of quantities, subcontractor rates and cancelled jobs for Dynamics', sum:'Quotes and budgets has the bill of quantities of the Quotes sheet, with optional prices per item in Rates; Delivery has Subcontractor rates and Cancelled jobs, which imports and downloads the Dynamics file; the tracker Excel adds Quotes and Subbie Cost.', steps:[
  {t:'Bill of quantities', min:1, dolor:'Before, quantities per item lived in the Quotes sheet, apart from the quote.', show:['Quotes and budgets › Bill of quantities: type quantities by group, like the sheet.', 'Open a job to see its lines by measure and its extras, such as DPI.'], say:'The scope of each quote, item by item.', go:() => { S.role = 'dir'; S.trail = null; S.f.q46 = 'boq'; S.f.q46g = 'lft'; go('com', 'quo'); }},
  {t:'Prices per item are optional', min:.5, dolor:'There is no price list per item yet.', show:['Rates › Bill of quantities items: a price can be added to any item.', 'Until then, the quote keeps the price per measure.'], say:'Ready for prices, without needing them today.', go:() => { S.role = 'dir'; S.trail = null; go('com', 'rate'); }},
  {t:'Subcontractor rates', min:.5, dolor:'Before, the Subbie Cost sheet had names and almost no prices.', show:['Each subcontractor with its job types, unit and price.', 'In the Programme of works, the installer comes from this list and each task shows its estimated cost.'], say:'Know what a job costs before it starts.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'sbr'); }},
  {t:'Cancelled jobs for Dynamics', min:.5, dolor:'Before, the Dynamics export was filled by hand and uploaded again.', show:['Import from Dynamics matches each row by its reference.', 'Download for Dynamics keeps the Do Not Modify columns so it can be imported back.'], say:'One place for the reasons, Dynamics stays in step.', go:() => { S.role = 'dir'; S.trail = null; go('del', 'cxl'); }}]});
{ const t0 = window.WTFB; if(t0) t0.version = 'v5.46'; }


/* =================== App: the real session =================== */
{ const os = A.setRole; A.setRole = el => { if(!roleOk(el.dataset.v)) return; os(el); }; }

return {A, S, VIEWS, homeApp, commentContext, render:(...x) => render(...x), drawPop:() => drawPop(), drawTour:() => drawTour(), drawVs:() => drawVs()};
})();
