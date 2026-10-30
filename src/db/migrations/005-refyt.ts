import { ADMIN_ROLE_KEY } from "../../auth/permissions.js";
import { collections } from "../collections.js";
import type { Migration } from "./types.js";

// Frozen: applied migrations never change.
const V5_PERMISSIONS = [
  { key: "refyt.director", module: "refyt", description: "Abrir la app Director de Refyt" },
  { key: "refyt.commercial", module: "refyt", description: "Abrir la app Commercial de Refyt" },
  { key: "refyt.accounts", module: "refyt", description: "Abrir la app Accounts de Refyt" },
  { key: "refyt.retrofit", module: "refyt", description: "Abrir la app Retrofit de Refyt" },
  { key: "refyt.delivery", module: "refyt", description: "Abrir la app Delivery de Refyt" },
  { key: "refyt.view_as", module: "refyt", description: "Ver Refyt como cualquier rol (selector «Viewing as»)" }
];

const APPS = ["refyt.director", "refyt.commercial", "refyt.accounts", "refyt.retrofit", "refyt.delivery"];
const BASE = ["notifications.read"];

/**
 * The roles of REFYT's process (the "Viewing as" list of the approved design). Every step belongs
 * to a role, not a person; each role opens the apps of its team. The key ties a role to Refyt
 * (web/src/refyt/roles.ts). Editable afterwards: only set on insert.
 */
const V5_ROLES = [
  { key: "survey-admin", name: "Survey admin", description: "Reserva evaluaciones y actualiza el sistema del cliente en la fase de evaluación", apps: ["refyt.retrofit"] },
  { key: "assessor", name: "Assessor", description: "Hace la visita de evaluación y sube la evidencia", apps: ["refyt.retrofit"] },
  { key: "assessment-approver", name: "Assessment approver", description: "Revisa la evidencia de la evaluación y el modelado", apps: ["refyt.retrofit"] },
  { key: "designer", name: "Designer", description: "Hace el diseño retrofit de cada medida", apps: ["refyt.retrofit"] },
  { key: "design-approver", name: "Design approver", description: "Revisa y aprueba los diseños", apps: ["refyt.retrofit"] },
  { key: "install-coordinator", name: "Install coordinator", description: "Oficios, andamios, materiales y sistema del cliente en la instalación", apps: ["refyt.delivery"] },
  { key: "order-approver", name: "Order approver", description: "Aprueba pedidos de material y reservas de oficios", apps: ["refyt.delivery"] },
  { key: "payment-approver", name: "Payment approver", description: "Aprueba los pagos a subcontratistas", apps: ["refyt.delivery"] },
  { key: "site-manager", name: "Site manager", description: "Formularios de obra y avance de la instalación", apps: ["refyt.delivery"] },
  { key: "hsse-lead", name: "HSSE lead", description: "Documentación de seguridad, seguros y acreditaciones", apps: ["refyt.delivery"] },
  { key: "commercial", name: "Commercial", description: "Tarifas, presupuestos, márgenes y variaciones", apps: ["refyt.commercial"] },
  { key: "accounts", name: "Accounts", description: "Facturas, cobros y pagos", apps: ["refyt.accounts"] },
  {
    key: "director",
    name: "Director",
    description: "Todo el negocio, aprobaciones por encima de los límites de cada esquema y alertas de margen",
    apps: [...APPS, "refyt.view_as", "dashboard.read"]
  }
];

/** Refyt: app permissions in the catalog and the admin role, and REFYT's process roles. Idempotent. */
export const refytMigration: Migration = {
  version: 5,
  name: "refyt",
  async up({ db }) {
    const c = collections(db);
    const now = new Date();
    for (const permission of V5_PERMISSIONS) {
      await c.permissions.updateOne(
        { key: permission.key },
        { $set: { module: permission.module, description: permission.description } },
        { upsert: true }
      );
    }
    await c.roles.updateOne(
      { key: ADMIN_ROLE_KEY },
      {
        $addToSet: { permissionKeys: { $each: V5_PERMISSIONS.map((permission) => permission.key) } },
        $set: { updatedAt: now }
      }
    );
    for (const role of V5_ROLES) {
      await c.roles.updateOne(
        { key: role.key },
        {
          $setOnInsert: {
            name: role.name,
            description: role.description,
            permissionKeys: [...new Set([...BASE, ...role.apps])].sort(),
            isSystem: false,
            createdAt: now,
            updatedAt: now
          }
        },
        { upsert: true }
      );
    }
  }
};
