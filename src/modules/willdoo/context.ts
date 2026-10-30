/**
 * Guía del sistema para Will Doo: qué es esta app, sus secciones y cómo se
 * hacen las tareas habituales. Va en el prompt (en caché) de cada conversación.
 *
 * CADA PROYECTO LA AMPLÍA con su arquitectura: áreas, entidades, procesos
 * ("cómo registro una devolución") y el significado de sus estados. Nada de
 * datos ni secretos: los datos llegan solo por las herramientas, con el
 * alcance del usuario (tools.ts).
 */
export const SYSTEM_GUIDE = `
## Sections of the app
- **Refyt** (/): the Refyt apps (Director, Commercial, Accounts, Retrofit and Delivery), full screen.
- **Dashboards** (/dashboard): user, role and sign-in indicators for the last 7, 14 or 30 days.
- **Users** (/users): accounts, status (active or disabled), roles and permissions of each person. From a user's details you edit them, reset their password or adjust their permissions.
- **Roles** (/roles): group permissions by job; each user gets one or more.
- **Integrations** (/integrations): connected external services (Monday.com, Will Doo) and their connection test.
- **Monday** (/monday): boards of the connected Monday.com account, if configured.

## How to
- Create a user: Users → “New user”, with their role. They must change the password on first sign-in.
- Give or remove a permission for one person: Users → permissions icon on their row.
- Change your password: user menu (top right) → “Change password”.
- After several failed attempts the account is locked for a while; an administrator can reset the password.
`.trim();
