import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("vista previa en vivo (contrato §5.3)", () => {
  it("package.json declara dev:preview y la versión 1.8.0", () => {
    const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string>; template: { version: string } };
    expect(pkg.scripts["dev:preview"]).toBe("node scripts/dev-preview.mjs");
    expect(pkg.template.version).toBe("1.8.0");
  });

  it("arranca backend con recarga y Vite en caliente, marcando el modo vista previa", () => {
    const script = read("scripts/dev-preview.mjs");
    expect(script).toContain('LAUNCHPAD_PREVIEW: "1"');
    expect(script).toContain('["api", ["dev"]]');
    expect(script).toContain('"vite", "--strictPort"');
  });

  it("Vite solo abre host, hosts y HMR por wss/443 en ese modo", () => {
    const config = read("web/vite.config.ts");
    expect(config).toContain('process.env.LAUNCHPAD_PREVIEW === "1"');
    expect(config).toContain('...(livePreview ? { host: "0.0.0.0", allowedHosts: true, hmr: { clientPort: 443, protocol: "wss" } } : {})');
  });
});
