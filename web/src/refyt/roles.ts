import type { Session } from "../lib/types";
import type { RefytAuth } from "./engine/index.js";

/**
 * Roles of REFYT's process: backend role key (migration 005) → role code in the Refyt engine.
 * A role created in Roles with one of these keys is that Refyt role.
 */
export const REFYT_ROLES: Record<string, string> = {
  "survey-admin": "sad",
  assessor: "ass",
  "assessment-approver": "aap",
  designer: "dsg",
  "design-approver": "dap",
  "install-coordinator": "inc",
  "order-approver": "oap",
  "payment-approver": "pap",
  "site-manager": "sit",
  "hsse-lead": "hse",
  commercial: "com",
  accounts: "acc",
  director: "dir"
};

/** Permission → Refyt app it opens. */
export const REFYT_APPS: Record<string, string> = {
  "refyt.director": "dir",
  "refyt.commercial": "com",
  "refyt.accounts": "acc",
  "refyt.retrofit": "ret",
  "refyt.delivery": "del"
};

export function refytAuth(session: Session): RefytAuth {
  const has = new Set(session.permissions);
  return {
    userId: session.user.id,
    apps: Object.entries(REFYT_APPS)
      .filter(([permission]) => has.has(permission))
      .map(([, app]) => app),
    roles: session.user.roles.map((role) => REFYT_ROLES[role.key]).filter((code): code is string => Boolean(code)),
    viewAs: has.has("refyt.view_as"),
    admin: [has.has("users.read") ? "/users" : null, has.has("roles.read") ? "/roles" : null].filter(
      (path): path is string => Boolean(path)
    )
  };
}
