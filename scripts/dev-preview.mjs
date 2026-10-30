#!/usr/bin/env node
// Vista previa en vivo del AI Developer (contrato §5.3): `pnpm dev:preview`.
//
// La lanza la plataforma dentro de un contenedor del servidor, con la rama de trabajo
// clonada y una MongoDB temporal propia (las variables llegan por el entorno). Arranca el
// backend con recarga (tsx watch) y el frontend con Vite en caliente, escuchando para el
// nginx del servidor: cada commit que llega a la rama se ve en segundos, sin reconstruir.
// No usar en producción.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// vite.config.ts lo lee para escuchar en todas las interfaces y servir HMR por wss/443.
const env = { ...process.env, LAUNCHPAD_PREVIEW: "1" };

const children = [
  ["api", ["dev"]],
  ["web", ["--filter", "web", "exec", "vite", "--strictPort"]],
].map(([name, args]) => {
  const child = spawn("pnpm", args, { cwd: root, env, stdio: ["ignore", "inherit", "inherit"] });
  child.on("exit", (code) => {
    // Si uno de los dos cae, el contenedor termina y se ve en sus logs.
    process.stderr.write(`[${name}] terminó (código ${code ?? "señal"})\n`);
    for (const other of children) if (other !== child) other.kill("SIGTERM");
    process.exit(code ?? 1);
  });
  return child;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    for (const child of children) child.kill("SIGTERM");
  });
}
