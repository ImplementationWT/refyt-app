import { ADMIN_ROLE_KEY, ADMIN_USERNAME, PERMISSIONS, USER_ROLE_KEY } from "../../auth/permissions.js";
import { collections } from "../collections.js";
import type { Migration } from "./types.js";

// Frozen: applied migrations never change. Spanish texts written by migrations 1 and 5.
const ROLE_TEXTS = [
  { key: ADMIN_ROLE_KEY, from: ["Administrador", "Acceso total al sistema"], to: ["Administrator", "Full access to the system"] },
  { key: USER_ROLE_KEY, from: ["Usuario", "Permisos mínimos"], to: ["User", "Minimum permissions"] },
  { key: "survey-admin", from: [null, "Reserva evaluaciones y actualiza el sistema del cliente en la fase de evaluación"], to: [null, "Books assessments and updates the client system at assessment stage"] },
  { key: "assessor", from: [null, "Hace la visita de evaluación y sube la evidencia"], to: [null, "Carries out the assessment visit and uploads the evidence"] },
  { key: "assessment-approver", from: [null, "Revisa la evidencia de la evaluación y el modelado"], to: [null, "Reviews the assessment evidence and the modelling"] },
  { key: "designer", from: [null, "Hace el diseño retrofit de cada medida"], to: [null, "Produces the retrofit design for each measure"] },
  { key: "design-approver", from: [null, "Revisa y aprueba los diseños"], to: [null, "Reviews and approves the designs"] },
  { key: "install-coordinator", from: [null, "Oficios, andamios, materiales y sistema del cliente en la instalación"], to: [null, "Trades, scaffold, materials and the client system at install"] },
  { key: "order-approver", from: [null, "Aprueba pedidos de material y reservas de oficios"], to: [null, "Approves material orders and trade bookings"] },
  { key: "payment-approver", from: [null, "Aprueba los pagos a subcontratistas"], to: [null, "Approves subcontractor payments"] },
  { key: "site-manager", from: [null, "Formularios de obra y avance de la instalación"], to: [null, "Site forms and install progress"] },
  { key: "hsse-lead", from: [null, "Documentación de seguridad, seguros y acreditaciones"], to: [null, "Safety paperwork, insurances and accreditations"] },
  { key: "commercial", from: [null, "Tarifas, presupuestos, márgenes y variaciones"], to: [null, "Rates, quotes, margins and variations"] },
  { key: "accounts", from: [null, "Facturas, cobros y pagos"], to: [null, "Invoices, receipts and payments"] },
  { key: "director", from: [null, "Todo el negocio, aprobaciones por encima de los límites de cada esquema y alertas de margen"], to: [null, "The whole business, approvals above each scheme's limits and margin alerts"] }
] as const;

/**
 * The app is in English: permission descriptions from the catalog, and the role names and
 * descriptions (and the initial admin's name) that earlier migrations wrote in Spanish. Texts an
 * administrator has already changed are kept. Idempotent.
 */
export const englishMigration: Migration = {
  version: 6,
  name: "english",
  async up({ db }) {
    const c = collections(db);
    const now = new Date();
    for (const permission of PERMISSIONS) {
      await c.permissions.updateOne({ key: permission.key }, { $set: { description: permission.description } });
    }
    for (const { key, from, to } of ROLE_TEXTS) {
      const [fromName, fromDescription] = from;
      const [toName, toDescription] = to;
      if (fromName && toName) await c.roles.updateOne({ key, name: fromName }, { $set: { name: toName, updatedAt: now } });
      await c.roles.updateOne({ key, description: fromDescription }, { $set: { description: toDescription, updatedAt: now } });
    }
    await c.users.updateOne({ username: ADMIN_USERNAME, displayName: "Administrador" }, { $set: { displayName: "Administrator", updatedAt: now } });
  }
};
