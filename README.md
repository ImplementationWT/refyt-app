
# Node TypeScript Template

Base técnica común para las aplicaciones de cliente: backend Node.js +
TypeScript (Fastify, Zod, MongoDB) y frontend React servido por el mismo
backend. Incluye login, layout, dashboard con indicadores, usuarios (con su
catálogo de permisos) y roles, sin datos ni lógica de ningún cliente o negocio.

La plataforma interna crea un repositorio por cliente a partir de este
template. El contrato completo con el aprovisionador (variables, secrets,
workflows, endpoints, colecciones) está en
[docs/TEMPLATE_CONTRACT.md](docs/TEMPLATE_CONTRACT.md). Versión del template:
`template.version` en `package.json`.

> **El frontend nunca se conecta a MongoDB.** Solo el backend tiene la
> conexión. El frontend consume la API del mismo origen y no recibe ninguna
> variable del servidor (CI lo comprueba con `pnpm check:bundle`).

## Refyt

La app es Refyt, toda en inglés: primero el login y, una vez dentro, las apps de los equipos (Director,
Commercial, Accounts, Retrofit y Delivery) en `/`. El menú de usuario del encabezado lleva a
la administración: Users (`/users`), Roles (`/roles`), Integrations (`/integrations`) y Feedback (`/feedback`), según los
permisos de cada persona. La migración 6 pasa a inglés los textos que ya estaban guardados en la base.

El diseño aprobado por el cliente (`Refyt, demo v3.20.html`) manda en toda la app:

```text
web/src/refyt/
  styles/        CSS de Refyt partido por áreas, en el mismo orden que el original
                 (00 protege del reset de Tailwind; 10 son las piezas nuevas: login,
                 menú de usuario, administración)
  engine/        La lógica de Refyt en módulos (datos, cálculos, apps, reuniones, tour…).
                 index.js es el barril: fija el orden de evaluación, no lo reordenes.
  assets/        Logotipo REFYT
  fonts.ts       Sora, Manrope, Figtree y Fraunces servidas desde la app
  RefytHeader.tsx, UserMenu.tsx    Encabezado y menú de usuario
  RefytWorkspace.tsx               Monta el motor de Refyt en "/"
  AdminLayout.tsx                  Usuarios, Roles, Integraciones… con el mismo shell
  AuthLayout.tsx                   Marco del login y del cambio de contraseña
```

- Los tokens de Refyt (`--n*`, `--b*`, `--surface`, `--ink`, `--line`…) son la única fuente de
  colores; `web/src/index.css` solo añade los alias que usan las pantallas de administración
  (la marca es el azul `#1E3A8A`, radios de 10px, Manrope y Sora). No hay modo oscuro.
- **Usuarios, roles y permisos.** Los roles del proceso de REFYT (Survey admin, Assessor,
  Assessment approver, Designer, Design approver, Install coordinator, Order approver, Payment
  approver, Site manager, HSSE lead, Commercial, Accounts y Director) son roles reales que crea la
  migración 5; se asignan a cada persona en Usuarios y se editan en Roles. Cada rol abre las apps
  de su equipo con los permisos `refyt.director`, `refyt.commercial`, `refyt.accounts`,
  `refyt.retrofit` y `refyt.delivery`. `refyt.view_as` (Director y Administrador) permite usar el
  selector «Viewing as» con cualquier rol; sin él, solo aparecen los roles propios. El vínculo
  entre clave de rol y rol de Refyt está en `web/src/refyt/roles.ts`.
- **Feedback.** Cualquier persona con sesión envía feedback (Something is wrong, Idea o Question)
  desde «Send feedback» en su menú de usuario; se guarda con la página y la pantalla de Refyt en
  que estaba. Quien tiene `feedback.manage` (el rol Administrador, migración 7) lo revisa en
  `/feedback`, le pone estado (New, In progress, Fixed, Won't fix) y una nota interna, y puede
  apagar o encender el módulo con el interruptor de esa pantalla: apagado, la opción desaparece
  del menú y la API rechaza los envíos (`409 feedback_disabled`); lo ya recibido se conserva.
- El CSS de Refyt va en la capa `refyt`, entre la base y las utilidades de Tailwind.
- La CSP permite atributos `style` en línea (Refyt los usa al dibujar); los scripts siguen
  limitados a la propia app.

## Estructura

```text
src/            Backend Fastify
  auth/         Contraseñas (scrypt), sesiones, CSRF, permisos
  db/           Conexión MongoDB, colecciones y migraciones
  modules/      auth, dashboard, users, roles, permissions, notifications, audit
web/            Frontend React + Vite + Tailwind (paquete del workspace)
tests/          Tests del backend (Vitest + mongodb-memory-server)
```

## Ejecutarlo en local (un comando)

Solo hace falta [Docker Desktop](https://www.docker.com/products/docker-desktop/)
abierto. Desde la carpeta del repositorio:

```bash
docker compose up --build
```

Abre <http://localhost:3000> y entra con `admin` / `admin123` (te pedirá
cambiarla). No hay que crear `.env` ni instalar Node: levanta su propia MongoDB
(vacía, solo en tu equipo) y la app ya compilada. La primera vez tarda unos
minutos en descargar y compilar.

- Parar: `Ctrl+C` (o `docker compose down`). Los datos se conservan.
- Borrar los datos locales y empezar de cero: `docker compose down -v`.
- Ver la versión más reciente después de un `git pull`: vuelve a ejecutar el mismo comando.
- Si el puerto 3000 está ocupado: `PORT=3001 docker compose up --build`.

## Requisitos para desarrollar

- Node.js 24 (LTS) y pnpm
- Docker (MongoDB local)

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `MONGODB_URI` | Sí | Cadena `mongodb://` o `mongodb+srv://`. Nunca se imprime. |
| `MONGODB_DB` | Sí | Debe cumplir `^client_[a-z0-9_]+$`. |
| `SESSION_SECRET` | Sí | Mínimo 32 caracteres aleatorios. |
| `INITIAL_ADMIN_PASSWORD` | No | Contraseña inicial del usuario `admin` (por defecto `admin123`). |
| `FORCE_ADMIN_PASSWORD_CHANGE` | No | `true` por defecto; solo puede ser `false` fuera de producción. |
| `APP_DISPLAY_NAME` | No | Nombre de la app en la interfaz. |

Lista completa y valores por defecto en [.env.example](.env.example) y en el
[contrato](docs/TEMPLATE_CONTRACT.md#2-variables-de-entorno-de-la-app). Si
falta una variable obligatoria la app no arranca y el error nombra la variable
sin mostrar su valor.

**En producción las variables las inyecta la plataforma** desde los secrets
del entorno `production` de GitHub. Nunca se guardan en el repositorio.

## Desarrollo local

```bash
pnpm dev:local           # http://localhost:5173
```

Hace todo lo necesario la primera vez: instala dependencias, crea `.env` (con
la MongoDB local y un `SESSION_SECRET` aleatorio; un `.env` existente no se
toca), arranca MongoDB en Docker y lanza el backend y el frontend con recarga en
caliente. `Ctrl+C` detiene ambos; MongoDB sigue corriendo
(`docker compose stop mongo` para pararla).

La MongoDB local es un *replica set* de un nodo, como Atlas, para que funcionen
las transacciones. Escucha solo en `127.0.0.1:27027` (`LOCAL_MONGO_PORT` para
cambiarlo) y es la misma que usa `docker compose up`.

Por separado, si lo prefieres: `docker compose up -d --wait mongo`, después
`pnpm dev` (backend en `http://localhost:3000`, solo la API) y `pnpm dev:web`
(frontend en `http://localhost:5173`, con proxy de `/api` y `/health` al
backend). Para probar el frontend compilado servido por el backend: `pnpm build`
y después `pnpm start` (todo en `http://localhost:3000`).

### Credenciales iniciales (solo desarrollo)

- Usuario: `admin`
- Contraseña: `admin123` (o el valor de `INITIAL_ADMIN_PASSWORD`)

El primer ingreso obliga a cambiar la contraseña: mínimo 10 caracteres,
distinta de `admin123` y del nombre de usuario.

> ⚠️ **Producción:** la contraseña del `admin` debe cambiarse en el primer
> ingreso, y el aprovisionador debe definir siempre `INITIAL_ADMIN_PASSWORD`
> para no exponer `admin123` mientras nadie ha entrado. Las credenciales por
> defecto son solo para desarrollo.

## Comprobaciones

```bash
pnpm lint          # tsc estricto: backend, tests y web
pnpm typecheck
pnpm test          # backend (mongodb-memory-server) + frontend (Testing Library)
pnpm build         # backend (dist/) + frontend (web/dist/)
pnpm check:bundle  # el bundle no contiene configuración del servidor
```

Los tests no necesitan credenciales reales. Sin acceso a red (el binario de
MongoDB se descarga la primera vez) se pueden omitir los tests con base de
datos usando `SKIP_DB_INTEGRATION=1 pnpm test`.

## Docker

`compose.yaml` es **solo para desarrollo local**: toma `MONGODB_URI`,
`MONGODB_DB` y `SESSION_SECRET` del entorno (falla si faltan), publica en
`127.0.0.1:3000` y limita CPU/memoria. En producción no se usa: la plataforma
genera su propio compose en el servidor ([contrato §6](docs/TEMPLATE_CONTRACT.md#6-contenedor-nginx-y-compose)).

```bash
export MONGODB_URI=mongodb://host.docker.internal:27017
export MONGODB_DB=client_local
export SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
docker compose up --build
```

La imagen corre con `NODE_ENV=production`: la cookie de sesión es `Secure`,
así que abre la app en `http://localhost:3000` (los navegadores tratan
`localhost` como contexto seguro) o detrás de HTTPS.

## Funcionalidad incluida

- **Autenticación**: login con usuario y contraseña (scrypt con sal por
  usuario), sesiones en servidor con cookie `httpOnly` + `SameSite=Strict`,
  expiración absoluta y por inactividad, bloqueo temporal tras intentos
  fallidos, rate limit por IP, protección CSRF y cabeceras de seguridad (CSP).
- **Autorización por permisos** en cada ruta del backend; el frontend oculta
  menús y rutas según los permisos, pero la autorización real es del backend.
- **Pantallas**: **Dashboards** (KPIs y gráfico de inicios de sesión por día,
  con rango de 7/14/30 días y vista de tabla; permiso `dashboard.read`),
  **Usuarios** y **Roles**.
- **Permisos por usuario**: desde el icono de cada fila de Usuarios se ven los
  permisos de esa persona (con su origen: rol, añadido o quitado) y se pueden
  añadir o quitar sin tocar sus roles. Los administradores tienen siempre
  todos y nadie edita los suyos.
- **Integraciones** (opcionales; hoy Monday.com): pantalla *Integraciones*
  con el estado de cada proveedor y "Probar conexión", y tab *Monday* con los
  tableros de la cuenta y un enlace a cada uno. Se activan con la variable
  `MONDAY_API_TOKEN`; sin ella la app funciona igual y el tab no aparece.
  Nuevos proveedores: una entrada en `src/integrations/registry.ts` y su
  cliente en `src/integrations/<id>/`.

  > **El token de Monday hereda los permisos de su dueño.** La app muestra los
  > tableros que la persona dueña del token puede ver (no los de cada usuario de
  > la app). Usa un usuario de servicio con acceso solo a los tableros que deban
  > mostrarse.
- **Will Doo, el co-pilot**: botón y panel en todas las pantallas, también en
  el celular. Tiene tres modos (`WILL_DOO_MODE`, que se elige desde Launchpad):
  - **Will Doo solo** (`basic`, por defecto): informativo, sin IA y sin costo.
    - Empieza con una ruta de preguntas por tema y sugiere 3 continuaciones
      después de cada respuesta.
    - Se puede chatear: reconoce la pregunta por palabras clave y responde con
      los datos de la base o con la guía de uso.
    - No hace pronósticos ni análisis: muestra lo que hay y remite a
      «Will Doo + Claude».
  - **Will Doo + Claude** (`claude`): chat libre que responde con datos vivos,
    entiende la pantalla abierta y analiza. Usa la clave de Anthropic de la
    cuenta del cliente (`ANTHROPIC_API_KEY`).
  - **Sin Will Doo** (`off`): no aparece.

  En los modos activos:
  - **Permisos en los datos, no en el prompt.** Claude solo recibe las
    herramientas de lectura que el usuario tiene permiso de usar, y cada una
    consulta con su identidad. Lo que el usuario no puede ver nunca llega al
    modelo.
  - **Solo lectura.** Si le piden una acción, explica cómo hacerla en la app.
  - **Costo y límites.** Hay tope de gasto mensual
    (`WILL_DOO_MONTHLY_BUDGET_USD`) y límite de preguntas por persona y día.
    Las conversaciones se guardan 90 días (`WILL_DOO_RETENTION_DAYS`).
  - **Auditoría.** Cada pregunta queda registrada (`willdoo.ask`): quién,
    qué, qué herramientas usó y cuánto costó.
  - **Permisos de usuario.** `willdoo.use` para conversar y `willdoo.audit`
    para revisar conversaciones y gasto. Los dos están en el rol `admin`;
    para los demás roles hay que darlos.

  **Adaptarlo a un proyecto** (por ejemplo, con el AI Developer):
  - Describe la app, sus áreas, procesos y estados en
    `src/modules/willdoo/context.ts`.
  - Añade herramientas de lectura en `src/modules/willdoo/tools.ts`, cada una
    con su permiso y con consultas limitadas a lo que ese usuario puede ver.
  - Añade sus consultas rápidas (las de «Will Doo solo») en
    `src/modules/willdoo/quick.ts`, cada una con su pregunta, tema, palabras
    clave y sus 3 continuaciones (`next`).
  - Una pantalla de detalle puede indicar el registro abierto con
    `useWillDooRecord(id)` (`web/src/lib/willdoo.ts`).
- **APIs sin pantalla**: notificaciones y auditoría siguen disponibles en el
  backend; la auditoría registra login, cambios de contraseña y
  altas/ediciones/bajas, y alimenta el dashboard.
- **Migraciones** versionadas e idempotentes al arrancar; `/health/ready`
  responde 503 hasta que terminan.

Endpoints, reglas y formato de errores: [contrato §7](docs/TEMPLATE_CONTRACT.md#7-api).

## Sistema de diseño (frontend)

Todos los proyectos comparten el mismo aspecto: fuente Figtree (incluida en el
bundle), paleta fija con índigo como color de marca y un **tono** de color por
sección, bordes redondeados, sombras suaves y modo oscuro (interruptor en el
menú del usuario; por defecto sigue al sistema).

- **Tokens**: `web/src/index.css` (`--n*` neutros, `--p*` marca, tonos
  `green/amber/red/violet/blue/teal/pink/orange`, sombras `sh-1..3`). En
  Tailwind: `bg-surface`, `text-muted`, `bg-brand-600`, `rounded-card`,
  `shadow-sh2`… Un tono se aplica con la clase `tone-<nombre>` y sus colores
  se usan como `bg-tone-50` / `text-tone-700`.
- **Componentes** (`web/src/components/ui`): `Button`, `IconButton` (con globo
  de contador), `Input`/`Select`/`Checkbox`/`Field`, `Pill`, `IconTile`,
  `Avatar`, `FilterChips`, `KpiCard`, `DataTable` (carga, vacío, error,
  orden y paginación), `Dialog`, `Sheet` (panel lateral), `ConfirmDialog`,
  `EmptyState` y `useToast()`.
- **Navegación**: `web/src/navigation.ts` define los grupos del sidebar
  (General: Dashboards; …; Configuración: Usuarios y Roles) con su icono, tono y permiso (uno o una lista de alternativas). Para añadir un
  módulo de un proyecto, agrega un grupo entre General y Configuración y su
  ruta en `web/src/App.tsx`; el sidebar, los accesos del inicio y los guards
  lo recogen solos. Un grupo sin elementos permitidos no se muestra.
- **Marca**: el icono del logo es `BRAND_ICON` en `navigation.ts`; el nombre
  sale de `APP_DISPLAY_NAME`.

## CI/CD

- **CI** (`ci.yml`): lint, typecheck, tests, build y comprobación del bundle
  en cada PR y push a `main`. No usa secretos.
- **Deploy** (`deploy.yml`): job `build` (imagen en GHCR, digest como output)
  y job `deploy` (entorno `production`): envía por SSH a `deploy@$DEPLOY_HOST`
  un JSON con la imagen por digest, las variables de la app y un token de
  lectura del registro; exige `DEPLOY_OK` y comprueba
  `https://$APP_HOSTNAME/health/ready`. La app se publica en un VPS
  compartido detrás de nginx (`<slug>.apps.<dominio>`). El primer despliegue
  se lanza a mano cuando el aprovisionador ya escribió el entorno
  `production`. Ver [contrato §3–§6](docs/TEMPLATE_CONTRACT.md#3-configuración-de-github-que-debe-escribir-el-aprovisionador).
