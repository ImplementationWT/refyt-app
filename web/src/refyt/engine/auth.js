// Refyt · la sesión real. RefytWorkspace la pasa a mount(): qué apps abre el usuario (según sus
// permisos refyt.*), qué roles de Refyt tiene y si puede ver Refyt como cualquier rol
// (refyt.view_as, como el selector «Viewing as» de la demo).

/** apps: null mientras no hay sesión (la demo sin restricciones). */
export const AUTH = { apps: null, roles: [], viewAs: true };

export function setAuth({ apps, roles, viewAs }) {
  AUTH.apps = apps;
  AUTH.roles = roles;
  AUTH.viewAs = viewAs;
}
