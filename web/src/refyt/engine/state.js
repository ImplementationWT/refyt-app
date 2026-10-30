// Refyt · Estado de la interfaz.
import {
  EMP0, ROLES, store
} from "./index.js";
export const S = {view:'home', role:'dir', pop:null, page:{dir:'ovw', com:'mrg', acc:'trg', ret:'atn', del:'hom', tsk:'my'}, fi:{}, ft:'res', modal:null, f:{prf:'open', prq:'', sc:'', apr:'all', ost:'open', oq:'', mt:'mon'}, seen:{}, hl:null, dbm:'az', dbSel:null, dbApp:null, cbo:null, cbq:''};
export let EMP = store.get('rft-demo-emp') || EMP0;
/** El nombre del espacio se cambia desde el encabezado (doble clic). */
export function setEmp(value) { EMP = value; }
export const APPS = [['dir', 'Director', 'crown', 'tb'], ['com', 'Commercial', 'calc', 'tb'], ['acc', 'Accounts', 'receipt', 'tb'], ['ret', 'Retrofit', 'clip', 'tb'], ['del', 'Delivery', 'home', 'tb'], ['tsk', 'Tasks and meetings', 'todo', 'tb']];
export const APP_FASE = {};
export const APPN = Object.fromEntries(APPS.map(a => [a[0], a[1]])), APPT = Object.fromEntries(APPS.map(a => [a[0], a[3]])), APPI = Object.fromEntries(APPS.map(a => [a[0], a[2]]));
export const GRAD = {tk:'linear-gradient(145deg, #4A4F55, #2A2E33)', tb:'linear-gradient(145deg, var(--b500), var(--b700))', tg:'linear-gradient(145deg, #3FA66E, #1E7A4A)', ta:'linear-gradient(145deg, #D9B45A, #A07A1E)', tt:'linear-gradient(145deg, #2EA5A0, #13706B)', tv:'linear-gradient(145deg, #7E68E6, #5440B8)', tp:'linear-gradient(145deg, #E2649A, #B33A70)', to:'linear-gradient(145deg, #F08A4B, #C25A1E)'};
export const WHO = {dir:'yah', ret:'sar', del:'dre', com:'tom', acc:'lan', tsk:'hse'};
export const ME = () => (ROLES[S.role] || ROLES.dir)[1];
export const HOME = {dir:'ovw', com:'mrg', acc:'trg', ret:'atn', del:'hom', tsk:'my'};
export const seenSet = () => S.seen[ME()] || (S.seen[ME()] = new Set());
