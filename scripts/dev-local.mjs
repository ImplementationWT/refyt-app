#!/usr/bin/env node
// Desarrollo local en un comando: `pnpm dev:local`.
//
// 1. Instala dependencias si faltan.
// 2. Crea .env si no existe (MongoDB local y un SESSION_SECRET aleatorio).
//    Un .env existente no se toca.
// 3. Arranca la MongoDB de compose.yaml (replica set, como Atlas) y espera a que esté lista.
// 4. Lanza el backend (pnpm dev) y el frontend con recarga en caliente (pnpm dev:web).
//
// Ctrl+C detiene backend y frontend; MongoDB sigue corriendo con sus datos
// (`docker compose stop mongo` para pararla, `docker compose down -v` para borrarla).
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const mongoPort = process.env.LOCAL_MONGO_PORT || "27027";

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function run(command, args, what) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: isWindows });
  if (result.error?.code === "ENOENT") fail(`No se encontró "${command}". ${what}`);
  if (result.status !== 0) fail(`Falló: ${command} ${args.join(" ")}`);
}

// --- 1. Dependencias -----------------------------------------------------------
if (!existsSync(join(root, "node_modules")) || !existsSync(join(root, "web", "node_modules"))) {
  console.log("▸ Instalando dependencias…");
  run("pnpm", ["install", "--frozen-lockfile"], "Instala pnpm: https://pnpm.io/installation");
}

// --- 2. .env -------------------------------------------------------------------
const envPath = join(root, ".env");
if (!existsSync(envPath)) {
  const values = {
    NODE_ENV: "development",
    // Solo en este equipo (no en la red local).
    HOST: "127.0.0.1",
    MONGODB_URI: `mongodb://localhost:${mongoPort}/?replicaSet=rs0&directConnection=true`,
    MONGODB_DB: "client_local",
    SESSION_SECRET: randomBytes(32).toString("base64url"),
  };
  const example = readFileSync(join(root, ".env.example"), "utf8");
  const content = example.replace(/^([A-Z_]+)=.*$/gm, (line, key) => (key in values ? `${key}=${values[key]}` : line));
  writeFileSync(envPath, content, { mode: 0o600 });
  console.log("▸ Creado .env para desarrollo local (MongoDB de Docker y SESSION_SECRET aleatorio).");
} else {
  console.log("▸ Usando el .env existente.");
}

// --- 3. MongoDB ----------------------------------------------------------------
const docker = spawnSync("docker", ["info"], { stdio: "ignore", shell: isWindows });
if (docker.error?.code === "ENOENT") fail("No se encontró Docker. Instala Docker Desktop: https://www.docker.com/products/docker-desktop/");
if (docker.status !== 0) fail("Docker no está corriendo. Abre Docker Desktop y vuelve a intentarlo.");

console.log("▸ Arrancando MongoDB (primera vez: descarga la imagen)…");
run("docker", ["compose", "up", "-d", "--wait", "mongo"], "Instala Docker Desktop.");

// --- 4. Backend + frontend -----------------------------------------------------
console.log("\n▸ Abriendo http://localhost:5173  (usuario admin / contraseña admin123, o INITIAL_ADMIN_PASSWORD)\n");

const children = [
  ["api", ["dev"]],
  ["web", ["dev:web"]],
].map(([name, args]) => {
  const child = spawn("pnpm", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"], shell: isWindows });
  const prefix = name === "api" ? "\x1b[36m[api]\x1b[0m " : "\x1b[35m[web]\x1b[0m ";
  for (const stream of [child.stdout, child.stderr]) {
    let pending = "";
    stream.on("data", (chunk) => {
      const lines = (pending + chunk).split("\n");
      pending = lines.pop();
      for (const line of lines) process.stdout.write(prefix + line + "\n");
    });
  }
  child.on("exit", (code) => {
    if (stopping) return;
    console.error(`\n✖ ${name} terminó (código ${code}). Revisa el mensaje de arriba.`);
    stop(code ?? 1);
  });
  return child;
});

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    // En Windows el hijo es un shell: hay que cerrar todo su árbol de procesos.
    if (isWindows) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  }
  console.log("\nDetenido. MongoDB sigue corriendo: `docker compose stop mongo` para pararla.");
  process.exit(code);
}
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
