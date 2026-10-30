import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * Simulates the deploy job: runs .github/scripts/deploy.sh with a fake `ssh`
 * (records argv, stdin and key-file mode, answers like the server) and a
 * `jq` wrapper (records argv, then runs the real jq). No real host or
 * credentials are involved.
 */
const SCRIPT = join(process.cwd(), ".github/scripts/deploy.sh");
const WORKFLOW = readFileSync(join(process.cwd(), ".github/workflows/deploy.yml"), "utf8");
const PREVIEW_WORKFLOW = readFileSync(join(process.cwd(), ".github/workflows/preview.yml"), "utf8");
const REAL_JQ = spawnSync("bash", ["-c", "command -v jq"], { encoding: "utf8" }).stdout.trim();
const DIGEST = "a".repeat(64);

// Fake, low-entropy values: they only need to be distinctive.
const SECRETS = {
  MONGODB_URI: "mongodb://app_demo:fakefakefake@db.example.invalid/?tls=true",
  MONGODB_DB: "client_demo",
  SESSION_SECRET: "s".repeat(40),
  INITIAL_ADMIN_PASSWORD: "initialfakefake",
  MONDAY_API_TOKEN: "mondayfakefaketoken",
  ANTHROPIC_API_KEY: "anthropicfakefakekey",
  REGISTRY_TOKEN: "ghs_fakefakefakefake",
  DEPLOY_SSH_KEY: "-----BEGIN OPENSSH PRIVATE KEY-----\nfakekeylineone\nfakekeylinetwo\n-----END OPENSSH PRIVATE KEY-----"
};

let dir: string;

function baseEnv(overrides: Record<string, string | undefined> = {}) {
  const env: Record<string, string> = {
    PATH: `${join(dir, "bin")}:/usr/bin:/bin`,
    HOME: dir,
    RUNNER_TEMP: join(dir, "runner"),
    GITHUB_STEP_SUMMARY: join(dir, "summary.md"),
    IMAGE: `ghcr.io/acme-org/demo-app@sha256:${DIGEST}`,
    DEPLOY_HOST: "vps.example.invalid",
    DEPLOY_KNOWN_HOSTS: "vps.example.invalid ssh-ed25519 AAAAfakehostkey",
    STUB_DIR: dir,
    STUB_RESPONSE: "pulling image\nstarting container\nDEPLOY_OK",
    STUB_EXIT: "0",
    ...SECRETS
  };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete env[key];
    else env[key] = value;
  }
  return env;
}

function run(overrides: Record<string, string | undefined> = {}) {
  const result = spawnSync("bash", [SCRIPT], { env: baseEnv(overrides), encoding: "utf8" });
  const read = (name: string) => (existsSync(join(dir, name)) ? readFileSync(join(dir, name), "utf8") : "");
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    payload: read("stdin.json") ? JSON.parse(read("stdin.json")) : null,
    sshArgs: read("ssh-args").split("\n").filter(Boolean),
    jqArgs: read("jq-args"),
    keyMode: read("key-mode").trim()
  };
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "deploy-sim-"));
  spawnSync("mkdir", ["-p", join(dir, "bin"), join(dir, "runner")]);
  // Fake ssh: records argv (one per line), stdin and the -i file mode.
  writeFileSync(
    join(dir, "bin", "ssh"),
    `#!/usr/bin/env bash
printf '%s\\n' "$@" > "$STUB_DIR/ssh-args"
key=""; prev=""
for arg in "$@"; do [ "$prev" = "-i" ] && key="$arg"; prev="$arg"; done
stat -c '%a' "$key" > "$STUB_DIR/key-mode" 2>/dev/null || stat -f '%Lp' "$key" > "$STUB_DIR/key-mode"
cat > "$STUB_DIR/stdin.json"
printf '%b\\n' "$STUB_RESPONSE"
exit "$STUB_EXIT"
`
  );
  writeFileSync(join(dir, "bin", "jq"), `#!/usr/bin/env bash\nprintf '%s\\n' "$@" > "$STUB_DIR/jq-args"\nexec ${REAL_JQ} "$@"\n`);
  chmodSync(join(dir, "bin", "ssh"), 0o755);
  chmodSync(join(dir, "bin", "jq"), 0o755);
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

/** Every line that mentions a secret must be an ::add-mask:: command. */
function expectOnlyMasked(output: string, values: string[]) {
  for (const line of output.split("\n")) {
    if (line.startsWith("::add-mask::")) continue;
    for (const value of values) {
      for (const part of value.split("\n").filter((p) => p.length >= 6)) {
        expect(line, `secret leaked in: ${line.slice(0, 40)}`).not.toContain(part);
      }
    }
  }
}

describe.skipIf(!REAL_JQ)("deploy job simulation (.github/scripts/deploy.sh)", () => {
  it("sends the JSON on stdin with only the defined env values", () => {
    const result = run({ INITIAL_ADMIN_PASSWORD: undefined, APP_DISPLAY_NAME: "", MONDAY_API_TOKEN: "", ANTHROPIC_API_KEY: "" });

    expect(result.status).toBe(0);
    expect(result.payload).toEqual({
      image: `ghcr.io/acme-org/demo-app@sha256:${DIGEST}`,
      env: {
        MONGODB_URI: SECRETS.MONGODB_URI,
        MONGODB_DB: SECRETS.MONGODB_DB,
        SESSION_SECRET: SECRETS.SESSION_SECRET
      },
      registryToken: SECRETS.REGISTRY_TOKEN
    });
    expect(result.stdout).toContain("Deployment accepted by the server");
    expect(readFileSync(join(dir, "summary.md"), "utf8")).toContain("@sha256:");
  });

  it("includes the optional values when they are set", () => {
    const result = run({ APP_DISPLAY_NAME: 'Empresa "Demo" S.A.', WILL_DOO_MODE: "claude" });

    expect(result.payload.env).toEqual({
      MONGODB_URI: SECRETS.MONGODB_URI,
      MONGODB_DB: SECRETS.MONGODB_DB,
      SESSION_SECRET: SECRETS.SESSION_SECRET,
      INITIAL_ADMIN_PASSWORD: SECRETS.INITIAL_ADMIN_PASSWORD,
      APP_DISPLAY_NAME: 'Empresa "Demo" S.A.',
      MONDAY_API_TOKEN: SECRETS.MONDAY_API_TOKEN,
      ANTHROPIC_API_KEY: SECRETS.ANTHROPIC_API_KEY,
      WILL_DOO_MODE: "claude"
    });
  });

  it("connects as deploy with host verification and no remote command", () => {
    const { sshArgs, keyMode } = run();

    expect(sshArgs.at(-1)).toBe("deploy@vps.example.invalid");
    expect(sshArgs).toContain("-T");
    expect(sshArgs).toContain("StrictHostKeyChecking=yes");
    expect(sshArgs).toContain("BatchMode=yes");
    expect(sshArgs.some((arg) => arg.startsWith("UserKnownHostsFile="))).toBe(true);
    expect(sshArgs.join(" ")).not.toMatch(/StrictHostKeyChecking=(no|accept-new)/);
    expect(keyMode).toBe("600");
    // The temporary key directory is removed afterwards.
    expect(readdirSync(join(dir, "runner"))).toEqual([]);
  });

  it("never puts secrets in process arguments or in the log", () => {
    const result = run({ APP_DISPLAY_NAME: "Empresa Demo" });
    const values = [...Object.values(SECRETS), "Empresa Demo"];
    const argv = `${result.sshArgs.join("\n")}\n${result.jqArgs}`;

    for (const value of values) {
      for (const part of value.split("\n").filter((p) => p.length >= 6)) {
        expect(argv).not.toContain(part);
      }
    }
    expectOnlyMasked(result.stdout, values);
    expectOnlyMasked(result.stderr, values);
    // Every value (each line of the key) is masked before use.
    for (const value of values) {
      for (const part of value.split("\n").filter(Boolean)) {
        expect(result.stdout).toContain(`::add-mask::${part}`);
      }
    }
  });

  it("fails the job on DEPLOY_FAILED with the server's reason", () => {
    const result = run({ STUB_RESPONSE: "pulling image\nDEPLOY_FAILED healthcheck timeout", STUB_EXIT: "1" });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("::error::Deployment failed on the server: healthcheck timeout");
  });

  it("fails when the server does not answer with the protocol line", () => {
    const silent = run({ STUB_RESPONSE: "", STUB_EXIT: "255" });
    const okButError = run({ STUB_RESPONSE: "DEPLOY_OK", STUB_EXIT: "1" });

    expect(silent.status).toBe(1);
    expect(silent.stdout).toContain("No DEPLOY_OK/DEPLOY_FAILED line");
    expect(okButError.status).toBe(1);
  });

  it("rejects mutable tags and unsafe host values before connecting", () => {
    const tag = run({ IMAGE: "ghcr.io/acme-org/demo-app:latest" });
    const injected = run({ DEPLOY_HOST: "-oProxyCommand=evil" });
    const missing = run({ SESSION_SECRET: "" });

    for (const result of [tag, injected, missing]) {
      expect(result.status).toBe(1);
      expect(result.sshArgs).toEqual([]);
    }
    expect(missing.stdout).toContain("SESSION_SECRET is required");
  });

  it("preview target: sends only image and registryToken, never production values", () => {
    const result = run({ DEPLOY_TARGET: "preview" });

    expect(result.status).toBe(0);
    expect(result.payload).toEqual({
      target: "preview",
      image: `ghcr.io/acme-org/demo-app@sha256:${DIGEST}`,
      registryToken: SECRETS.REGISTRY_TOKEN
    });
    // Works without any app secret defined.
    const bare = run({ DEPLOY_TARGET: "preview", MONGODB_URI: undefined, MONGODB_DB: undefined, SESSION_SECRET: undefined });
    expect(bare.status).toBe(0);
    expect(JSON.stringify(bare.payload)).not.toContain("mongodb");
  });

  it("rejects an unknown target before connecting", () => {
    const result = run({ DEPLOY_TARGET: "staging" });
    expect(result.status).toBe(1);
    expect(result.sshArgs).toEqual([]);
    expect(result.stdout).toContain("DEPLOY_TARGET must be production or preview");
  });
});

describe("preview.yml (AI Developer preview)", () => {
  const job = (name: string) => {
    const start = PREVIEW_WORKFLOW.indexOf(`\n  ${name}:\n`);
    const next = PREVIEW_WORKFLOW.slice(start + 1).search(/\n {2}[a-z-]+:\n/);
    return next === -1 ? PREVIEW_WORKFLOW.slice(start) : PREVIEW_WORKFLOW.slice(start, start + 1 + next);
  };

  it("only runs on dispatch, never on main, and builds outside the production environment", () => {
    expect(PREVIEW_WORKFLOW).toMatch(/^on:\n {2}workflow_dispatch:\n\n/m);
    expect(PREVIEW_WORKFLOW).toMatch(/^permissions: \{\}$/m);
    expect(job("build")).toContain("if: github.ref != 'refs/heads/main'");
    expect(job("build")).not.toContain("environment:");
    expect(PREVIEW_WORKFLOW.match(/packages: write/g)).toHaveLength(1);
  });

  it("runs the deploy script from the default branch, with the preview target", () => {
    const preview = job("preview");
    expect(preview).toContain("ref: ${{ github.event.repository.default_branch }}");
    expect(preview).toContain("DEPLOY_TARGET: preview");
    expect(preview).toContain("needs: build");
  });

  it("never reads app secrets and pins every action", () => {
    for (const name of ["MONGODB_URI", "MONGODB_DB", "SESSION_SECRET", "INITIAL_ADMIN_PASSWORD", "MONDAY_API_TOKEN", "ANTHROPIC_API_KEY"]) {
      expect(PREVIEW_WORKFLOW).not.toContain(`secrets.${name}`);
    }
    for (const line of PREVIEW_WORKFLOW.match(/uses: \S+/g) ?? []) expect(line).toMatch(/@[0-9a-f]{40}$/);
    expect(PREVIEW_WORKFLOW).not.toMatch(/StrictHostKeyChecking=(no|accept-new)/i);
  });
});

describe("deploy.yml follows the protocol", () => {
  const job = (name: string) => {
    const start = WORKFLOW.indexOf(`\n  ${name}:\n`);
    const next = WORKFLOW.slice(start + 1).search(/\n {2}[a-z-]+:\n/);
    return next === -1 ? WORKFLOW.slice(start) : WORKFLOW.slice(start, start + 1 + next);
  };

  it("grants packages: write only to the build job", () => {
    expect(WORKFLOW.match(/packages: write/g)).toHaveLength(1);
    expect(job("build")).toContain("packages: write");
    expect(job("deploy")).toContain("packages: read");
    expect(WORKFLOW).toMatch(/^permissions: \{\}$/m);
  });

  it("deploys from the production environment, one run per repo at a time", () => {
    const deploy = job("deploy");
    expect(deploy).toContain("environment: production");
    expect(deploy).toContain("group: deploy-${{ github.repository }}");
    expect(deploy).toContain("cancel-in-progress: false");
    expect(deploy).toContain("needs: build");
  });

  it("uses the protocol's secret and variable names", () => {
    for (const name of ["DEPLOY_SSH_KEY", "MONGODB_URI", "MONGODB_DB", "SESSION_SECRET", "INITIAL_ADMIN_PASSWORD", "MONDAY_API_TOKEN", "ANTHROPIC_API_KEY"]) {
      expect(WORKFLOW).toContain(`secrets.${name}`);
    }
    for (const name of ["DEPLOY_HOST", "DEPLOY_KNOWN_HOSTS", "APP_HOSTNAME", "APP_DISPLAY_NAME", "WILL_DOO_MODE"]) {
      expect(WORKFLOW).toContain(`vars.${name}`);
    }
    expect(WORKFLOW).toContain("https://$APP_HOSTNAME/health/ready");
  });

  it("pins every action to a commit SHA and skips the initial commit", () => {
    const uses = WORKFLOW.match(/uses: \S+/g) ?? [];
    expect(uses.length).toBeGreaterThan(0);
    for (const line of uses) expect(line).toMatch(/@[0-9a-f]{40}$/);
    expect(job("build")).toContain("github.event.before != '0000000000000000000000000000000000000000'");
  });

  it("never disables host key checking", () => {
    expect(WORKFLOW).not.toMatch(/StrictHostKeyChecking=(no|accept-new)/i);
  });
});
