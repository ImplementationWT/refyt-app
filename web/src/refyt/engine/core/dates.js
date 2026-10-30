// Refyt · Fechas: la demo vive el lunes 26 de octubre de 2026.
import {
  DSH, MSH
} from "../index.js";
export const T0 = new Date(2026, 9, 26);
export const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const TODAY = iso(T0);
export const dDiff = s => Math.round((fromIso(s) - T0) / 864e5);
export const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); };
export const fmtDy = s => { if(!s) return 'No date'; const d = fromIso(s); return `${MSH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
export const fmtD = s => { const n = dDiff(s), d = fromIso(s); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : n === -1 ? 'yesterday' : `${DSH[d.getDay()]}, ${MSH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
export const ini = s => s.split(/\s+/).filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join('');
export const store = { get(k){ try { return localStorage.getItem(k); } catch(e) { return null; } }, set(k, v){ try { localStorage.setItem(k, v); } catch(e) {} } };
export const norm = x => String(x || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export let seed = 42; export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const ri = (a, b) => Math.floor(a + rnd() * (b - a + 1));
