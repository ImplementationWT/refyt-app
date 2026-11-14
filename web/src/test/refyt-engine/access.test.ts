import { beforeAll, describe, expect, it } from "vitest";

// The real engine, loaded with native import (the "engine" project in vite.config.ts): its modules
// rely on function declarations being hoisted across the module cycle, as in the browser.
type Engine = typeof import("../../refyt/engine/index.js") & Record<string, any>;
let engine: Engine;

const VIEWS = ["home", "dir", "com", "acc", "ret", "del", "tsk"];
const ASSESSOR = { userId: "u-ass", apps: ["ret"], roles: ["ass"], viewAs: false, admin: [] };
const COMMERCIAL = { userId: "u-com", apps: ["com"], roles: ["com"], viewAs: false, admin: [] };
const ADMIN = { userId: "u-adm", apps: ["dir", "com", "acc", "ret", "del"], roles: ["dir"], viewAs: true, admin: ["/users", "/roles"] };

/** The containers RefytWorkspace renders for the engine. */
function markup() {
  document.body.innerHTML = `<header class="top"><div class="brand"><b id="emp"></b></div><nav id="appsw"></nav><div id="tools"></div></header>
    <div class="main" id="main">${VIEWS.map((v) => `<section class="view" id="v-${v}" hidden><div class="oapp" id="a-${v}"></div></section>`).join("")}
    <section class="view" id="v-db" hidden><div id="dbview"></div></section></div><div id="layer"></div><div class="toast" id="toast"></div>`;
}

const where = () => `${engine.S.view}:${engine.S.page[engine.S.view] ?? ""}`;

beforeAll(async () => {
  window.matchMedia ??= (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as never;
  markup();
  // A direct link the assessor's role does not reach, read on the first mount.
  window.location.hash = "#view=dir&page=dfin";
  engine = (await import("../../refyt/engine/index.js")) as Engine;
}, 60_000);

describe("Refyt access by role (real session)", () => {
  it("ignores a direct link to a Director screen for an assessor", () => {
    engine.mount(ASSESSOR);
    expect(engine.S.role).toBe("ass");
    expect(where()).toBe("ret:ovw");
  });

  it("lets the assessor open what its menu shows, and nothing else", () => {
    expect(engine.canOpen("ret", "bk")).toBe(true);
    expect(engine.canOpen("dir", "prs")).toBe(true); // All properties lives in Director
    expect(engine.canOpen("tsk", "all")).toBe(true);
    for (const [view, page] of [["dir", "dfin"], ["dir", "dbiz"], ["com", "mrg"], ["acc", "inv"], ["del", "ord"], ["db", ""]]) {
      expect(engine.canOpen(view, page), `${view}:${page}`).toBe(false);
    }
  });

  it("sends go() and abrir() to the role's Overview when they point elsewhere", () => {
    engine.go("com", "mrg");
    expect(where()).toBe("ret:ovw");
    engine.go("acc", "inv");
    expect(where()).toBe("ret:ovw");
    engine.abrir("acc", "PR-2018");
    expect(engine.S.view).toBe("ret");
    expect(engine.S.fi.acc).toBeFalsy();
    engine.go("ret", "bk");
    expect(where()).toBe("ret:bk");
  });

  it("opens a property card from All properties, without money", () => {
    engine.abrir("dir", "PR-2018");
    expect(engine.S.view).toBe("dir");
    expect(engine.S.fi.dir).toBe("PR-2018");
    expect(engine.canMoney("dir")).toBe(false);
  });

  it("keeps the user's own role even when something else (the tour) changes it", () => {
    engine.S.role = "dir";
    engine.render(true);
    expect(engine.S.role).toBe("ass");
    expect(engine.isAdmin()).toBe(false);
  });

  it("limits money by role: Commercial sees it, its menu decides the screens", () => {
    engine.mount(COMMERCIAL);
    expect(engine.S.role).toBe("com");
    expect(engine.canMoney("com")).toBe(true);
    expect(engine.canOpen("com", "mrg")).toBe(true);
    expect(engine.canOpen("dir", "dfin")).toBe(true); // Finance is in Commercial's Director reports
    expect(engine.canOpen("ret", "bk")).toBe(false);
    expect(engine.canOpen("dir", "usr")).toBe(false);
  });

  it("opens everything for the Director, the administrator's role", () => {
    engine.mount(ADMIN);
    expect(engine.S.role).toBe("dir");
    expect(engine.canOpen("acc", "inv")).toBe(true);
    expect(engine.canOpen("db", "")).toBe(true);
    expect(engine.canMoney("dir")).toBe(true);
  });
});

describe("the demo's in-memory administration (real session)", () => {
  it("is out of every menu and blocked by direct link, also for the Director", () => {
    engine.mount(ADMIN);
    for (const k of ["usr", "tms", "prm"]) {
      expect(engine.ITEMS4.filter((it: { k: string }) => it.k === k).some((it: unknown) => engine.canNav(it))).toBe(false);
      expect(engine.canOpen("dir", k)).toBe(false);
    }
    engine.go("dir", "usr");
    expect(`${engine.S.view}:${engine.S.page[engine.S.view]}`).toBe("dir:ovw");
    expect(engine.canOpen("dir", "req")).toBe(true);
  });

  it("is replaced in Settings by the real administration the user may open", () => {
    engine.S.pop = "set5";
    engine.drawPop();
    const pop = document.getElementById("rfpop")!;
    expect([...pop.querySelectorAll('[data-act="realAdm"]')].map((b) => (b as HTMLElement).dataset.v)).toEqual(["/users", "/roles"]);
    expect([...pop.querySelectorAll('[data-act="setGo5"]')].map((b) => (b as HTMLElement).dataset.v)).not.toContain("dir:usr");
    engine.S.pop = null;
    engine.drawPop();
  });
});
