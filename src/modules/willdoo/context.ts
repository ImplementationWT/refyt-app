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
## Secciones de la app
- **Refyt** (/): la interfaz de Refyt (Directores, Comercial, Cuentas, Retrofit y Delivery), a pantalla completa.
- **Dashboards** (/panel): indicadores de usuarios, roles e ingresos de los últimos 7, 14 o 30 días.
- **Usuarios** (/usuarios): cuentas, estado (activo o desactivado), roles y permisos de cada persona. Desde el detalle de un usuario se edita, se restablece su contraseña o se ajustan sus permisos.
- **Roles** (/roles): agrupan permisos por función; a cada usuario se le asignan uno o varios.
- **Integraciones** (/integraciones): servicios externos conectados (Monday.com, Will Doo) y su prueba de conexión.
- **Monday** (/monday): tableros de la cuenta de Monday.com conectada, si está configurada.

## Cómo se hace
- Crear un usuario: Usuarios → «Nuevo usuario», con su rol. Debe cambiar la contraseña en el primer ingreso.
- Dar o quitar un permiso a una persona: Usuarios → icono de permisos de la fila.
- Cambiar tu contraseña: menú de usuario (arriba a la derecha) → «Cambiar contraseña».
- Tras varios intentos fallidos la cuenta se bloquea un rato; un administrador puede restablecer la contraseña.
`.trim();
