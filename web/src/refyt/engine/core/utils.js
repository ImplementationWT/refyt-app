// Refyt · Utilidades: DOM, escape, formatos de número y dinero.
import {
  IC
} from "../index.js";
export const IMGS = {};
export const ico = (n, s = 18, w = 1.9) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.info}</svg>`;
export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const sum = (a, f = x => x) => a.reduce((t, x) => t + (f(x) || 0), 0);
export const num = n => Math.round(n).toLocaleString('en-GB');
export const fm = n => (n < -0.5 ? '-' : '') + '£' + Math.abs(Math.round(n)).toLocaleString('en-GB');
export const fk = n => Math.abs(n) >= 1e6 ? '£' + (n / 1e6).toFixed(2) + 'M' : Math.abs(n) >= 1e4 ? '£' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : fm(n);
export const pc = n => Math.round(n) + '%';
export const plural = (n, a, b) => `${num(n)} ${n === 1 ? a : b}`;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const numIn = v => { const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : n; };
export const MSH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DSH = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
