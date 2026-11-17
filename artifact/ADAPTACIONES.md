# Refyt · Adaptaciones del repo respecto al artifact

Este archivo lo lee la skill `artifact-a-repo` antes de llevar una versión nueva del artifact al repo. Describe en qué se diferencia el código del repo del artifact a propósito, para que esas diferencias sobrevivan a cada actualización. Mantenlo al día: cada decisión nueva se agrega aquí en el mismo PR.

## Estructura

- **Artifact de referencia:** `artifact/app.html` (la versión del artifact que corresponde a `main`).
- **Barril de módulos:** `web/src/refyt/engine/index.js`. El orden de los `export * from` es el orden de evaluación del artifact. Las capas nuevas van antes de `./access.js` (el guardián debe registrar el último `wrapRender`, para correr primero) y de `./mount.js`.
- **Índice de CSS:** `web/src/refyt/styles/index.css`. Los CSS nuevos van numerados (`NN-refyt-<id>.css`, hoy hasta `22-refyt-comment.css`) y siempre antes de `11-app.css`, que va al final.
- **Arranque:** `web/src/refyt/engine/mount.js` sustituye al bloque `STARTUP` (lee `#view=…&page=…` y `#embed=1`, fuerza tema claro, limpia paneles al salir).
- **Marcado:** `web/src/refyt/RefytWorkspace.tsx` y `web/src/refyt/RefytHeader.tsx` contienen el `<body>` del artifact. La marca es el botón de texto «REFYT» de la v5 (`v5home`); en la administración es un enlace a Refyt.
- **Módulos nuevos:** por tema, en la carpeta de la sección que tocan (`apps/`, `apps/<sección>/`, `property/`, `shell/`, `ui/`, `meetings/`), con cabecera `// Refyt · …`.
- **Scripts:** `scripts/refyt-pack.mjs` reconstruye el HTML desde el repo para verificar; `scripts/refyt-migrate.mjs` es el script de la migración a v5.44 y `scripts/refyt-migrate-v5.46.mjs` el de la v5.46 (no corren en CI).
- **Tests del motor:** `web/src/test/refyt-engine/` (proyecto de vitest aparte con import nativo y `loader.mjs`).

## Adaptaciones que no se tocan

- **Sesión real:** `engine/auth.js` (`AUTH`, `setAuth`) recibe del componente React los permisos y roles del usuario.
- **Guardián de navegación:** `engine/access.js` (`canOpen`, `canOpenCard`, `firstScreen`), usado en `readHash()` de `mount.js`, en `go()`, en `abrir()` y como respaldo antes de dibujar. Decide con la definición de menú por rol (`ITEMS4`, `canNav`). Un rol no puede abrir por enlace directo nada que no esté en su menú.
- **Roles:** el rol activo siempre es uno de los del usuario, salvo con `refyt.view_as`. «Viewing as» solo lista esos roles; los envoltorios de `setRole` no navegan si la sesión no permite el rol; el tour no cambia de rol.
- **`allowed()`** ya no filtra por app (desde la v4.0 el menú lleva a pantallas de otras apps); quien filtra es el guardián.
- **Setters por imports de solo lectura:** `setEmp` (state.js), `setLastKey` (render.js).
- **Recursos:** el logo se importa como archivo (`LOGO = logoUrl`), no en base64. jsPDF se importa del paquete (`jspdf@3.0.4`), no de `window.jspdf`. La vista previa de PDF usa `pdfjs-dist@6.4.299` con el worker local (sin CDN), cargado con `import()` al abrir un PDF.
- **Título:** la pestaña dice «Refyt», no `${EMP}, demo …`.
- **ExcelJS** (Install tracker, Programme of works, Cancelled jobs…) se importa del paquete (`exceljs@4.4.0`) con `import()` al descargar, no de cdnjs como `window.ExcelJS`.
- **Comentar:** el artifact trae el botón Comment del kit (`@@comp comentar`), que manda a un webhook de n8n configurado en `window.WTFB`. En el repo:
  - El botón vive en `web/src/refyt/comment/` (`comment.js`, la pieza del kit; `CommentButton.tsx`, en `App.tsx`) y guarda en el módulo Feedback (`POST /api/feedback`), con el usuario de la sesión; sin adjuntos («Send a file»), porque Feedback guarda texto. Se ve con sesión, sin cambio de contraseña pendiente y con el módulo encendido.
  - `window.WTFB = {webhook…, contexto}` se convierte en `commentContext` (en `apps/delivery/install-tracker.js`), que `mount.js` pasa al botón con `setCommentContext`; toma el título de la pantalla visible (el artifact caía en el de una vista oculta). La línea `window.WTFB.version` de la v5.46 se omite.
  - «Send feedback» ya no está en el menú de usuario. Lo que se señala en pantalla se guarda en el campo `element` del feedback.
  - Sus estilos son `22-refyt-comment.css`; con Will Doo en la administración, `11-app.css` sube el botón por encima.
- **Estilos inyectados:** los `<style>` que las capas inyectan con `insertAdjacentHTML` se pasan a CSS numerados, para que queden en la capa `refyt` y no pisen Tailwind en la administración.
- **`11-app.css`:** estilos propios del repo (menú de usuario, acceso, separación de controles del encabezado). No existe en el artifact.
- **`00-preflight-guard.css`:** protección frente al reset de Tailwind. No existe en el artifact.
- **pnpm:** `core-js` tiene la instalación de scripts desactivada en `pnpm-workspace.yaml` (llega por `canvg`, de jsPDF); sin eso falla `pnpm install --frozen-lockfile`.
- **Ruido que no se replica:** los comentarios de sección del artifact y las funciones que el HTML declara dos veces (el repo solo guarda la que gana).

## Mecanismo de reasignación

Donde el artifact reasigna una función (`X = …` o `{ const o = X; X = … }`), el repo usa un despachador en el módulo que declara `X`: `wrapX(o => …)` si la capa envuelve a la anterior, `setX(…)` si la reemplaza. Ver el patrón original en `apps/director/templates-guided.js` («Later versions wrap…»).

| Nombre | Mecanismo |
|---|---|
| `render` | `wrapRender` |
| `alerts` | `wrapAlerts` |
| `scFicha` | `wrapScFicha` |
| `ovNow` | `wrapOvNow` |
| `tkCal` | `setTkCal` |
| `cmp` | `setCmp` |
| `close` | `wrapClose` |
| `phGate` | `wrapPhGate`, `setPhGate` (cambio temporal durante «Move to…») |
| `retTab`, `insTab`, `cloTab` | `wrapRetTab`, `wrapInsTab`, `wrapCloTab` |
| `prList` | `setPrList` |
| `bkPage` | `wrapBkPage` |
| `mrgPage` | `setMrgPage` |
| `renderLayer`, `patchLayer`, `drawTour` | `wrapRenderLayer`, `wrapPatchLayer`, `wrapDrawTour` |
| `drawVs` | `setDrawVs` |
| `prFicha` | `wrapPrFicha` |
| `chkTab`, `quoPage3`, `updTab` | `setChkTab`, `setQuoPage3`, `setUpdTab` |
| `drawPop` | `wrapDrawPop` |
| `mBar53`, `mProps53` | `setMBar53`, `setMProps53` |
| `set45`, `edHTML45`, `drHTML45`, `itrBook45` | `wrapSet45`, `wrapEdHTML45`, `wrapDrHTML45`, `wrapItrBook45` (en `apps/delivery/install-tracker.js`) |
| `qcNext60`, `bkSide70` | `wrapQcNext60`, `wrapBkSide70` |

Para ubicar dónde se declara cada uno, usa la acción `search` del workflow con `function <nombre>` o `wrap<Nombre>`.

## Funciones de la demo que el repo omite

- **Selector y menú de Versions:** se quitaron (la propia v5 también los quita).
- **Administración de la demo** (Users and access, Teams, Roles and permissions, en memoria): fuera de los menús y bloqueadas por enlace directo, también para el Director. En Settings aparece «Administration» con Users y Roles, que llevan a la administración real, solo con `users.read` o `roles.read` (llega por `RefytAuth.admin`).
- **Menú lateral:** conserva su scroll al navegar (el artifact lo reinicia).
- **My tasks de los equipos:** se mantiene el aviso del archivado automático a los `TK_KEEP` (14) días.

## Pendientes conocidos

- En Settings siguen visibles opciones de la demo: Access requests, Access by scheme, Clients e Integrations (esta convive con la Integrations real). Falta decidir con el cliente si se ocultan.
- Un usuario que entra por enlace a una pantalla que no le toca cae en su Overview sin aviso.
- El aviso «No se pudieron cargar los datos / Reintentar» de las tablas de administración está en español.
- Los datos de la demo viajan en el JavaScript: el guardián protege la interfaz, no los datos. Cuando Refyt muestre datos reales desde la API, el backend debe filtrar por rol.

## Verificación

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm check:bundle`, en la raíz y en `web/`.
- Reempacar con `scripts/refyt-pack.mjs` y comparar contra `artifact/app.html`: solo deben quedar ruido y las adaptaciones de este archivo.
- Prueba manual mínima: un Assessor sin permisos de Director abriendo `#view=dir`, `#view=com` y `#view=acc` (debe caer en su Overview); exportar un PDF; abrir un PDF de cotización; recorrer las secciones del encabezado.

## Historial

| Versión del artifact | Fecha | PR | Notas |
|---|---|---|---|
| v3.29 | — | — | Modularización inicial (antes de esta skill). |
| v5.44 | 2026-11-14 | #4 | Ruta grande con Claude Code desde la v3.29: 38 capas nuevas, guardián de navegación, jsPDF 3.0.4, pdfjs-dist local, administración de la demo oculta. Primera versión con `artifact/app.html`. |
| v5.46 | 2026-11-17 | — | v5.45 y v5.46 en `apps/delivery/install-tracker.js` y `apps/delivery/quantities-rates-cancelled.js` (con `scripts/refyt-migrate-v5.46.mjs`), ExcelJS del paquete, botón Comment conectado a Feedback en lugar del webhook. |
