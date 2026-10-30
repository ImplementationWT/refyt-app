// Refyt · Versiones.
import {
  S, TODAY, abrir, go, render
} from "../index.js";
export const asRole = (r, fn) => () => { S.role = r; S.pop = null; fn(); };
export const toHome = () => { S.view = 'home'; render(true); };
export const V3STEPS = [
  {t:'A workspace with six apps', min:1, dolor:'Before, ten sections sat in one sidebar and it felt like one app.', show:['The REFYT workspace: six cards, one per team, with the roles that use each.', 'Each app has its own header, sidebar and home.'], say:'One app per team, on the same information.', go:asRole('dir', toHome)},
  {t:'Viewing as a role', min:.5, dolor:'Before, everyone saw everything.', show:['Viewing as Install coordinator: Delivery and Tasks open, the rest locked.'], say:'Each person opens only the apps of their role.', go:asRole('inc', toHome)},
  {t:'Approvals inside each app', min:.5, dolor:'Before, approvals were a separate app.', show:['Waiting for my approval in Retrofit, Delivery, Commercial and Director.', 'The Director only sees what is above a scheme limit.'], say:'Approvers act where they already work.', go:asRole('dir', () => go('del', 'wait'))},
  {t:'Same property, different apps', min:1, dolor:'Before, a property looked the same from everywhere.', show:['22 Clayhall Avenue in Delivery: preparation, install and orders, with money locked.', 'Open it in Commercial for its margin, in Accounts for its invoice.'], say:'One record, seen through each team’s job.', go:asRole('dir', () => abrir('del', 'PR-2017', 'res'))},
  {t:'Automations you can see', min:.5, dolor:'Before, automations were described, not shown.', show:['Each app lists its automations from the proposal.', 'Actions show an Automation toast and a line in the property’s history.'], say:'You see what the system does for you.', go:asRole('dir', () => go('del', 'auto'))},
  {t:'REFYT’s brand, phone forms and integrations later', min:.5, dolor:'Before, the demo had its own colours and the forms looked like desktop pages.', show:['Your logo, blues and fonts; colour only for on target, at risk and blocked.', 'Assessor form and site forms in a phone frame.', 'Xero, Microsoft 365, Fellow and DocuSign marked Later.'], say:'It looks like REFYT.', go:asRole('dir', () => go('ret', 'asf'))},
];
export const VERSIONS = [
  {v:'v1', date:'2026-10-26', major:true, title:'First demo', sum:'Built from our calls: one card per property, deliverables per measure, a field calendar, private quotes and costs.', url:'https://claude.ai/artifact/2H5P8awmYXhLTxw4PtCKsJ', steps:[]},
  {v:'v2', date:'2026-10-26', major:true, title:'Built on REFYT’s process document', sum:'Programmes and schemes, placeholder roles, approvals, phase B evidence, Ready to install, Redbridge groups, money per measure.', url:'https://claude.ai/artifact/A79Z1hfuauHyVCaUYj8Uqk', steps:[]},
  {v:'v3', date:TODAY, major:true, current:true, url:null, title:'Six apps, one per team', sum:'A REFYT workspace with six apps, viewing as a role, approvals inside each app, the same property seen from each team, visible automations, phone forms and REFYT’s brand.', steps:V3STEPS},
];
export const VCUR = VERSIONS.find(v => v.current);
