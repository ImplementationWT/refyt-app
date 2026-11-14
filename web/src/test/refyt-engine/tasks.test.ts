import { beforeAll, describe, expect, it } from "vitest";

// My tasks in the team apps: what the repo adds on top of the v3.28 block of the original.
type Engine = typeof import("../../refyt/engine/index.js") & Record<string, any>;
let engine: Engine;

beforeAll(async () => {
  window.matchMedia ??= (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as never;
  document.body.innerHTML = `<header class="top"><b id="emp"></b><nav id="appsw"></nav><div id="tools"></div></header><div id="main">${["home", "dir", "com", "acc", "ret", "del", "tsk"].map((v) => `<section class="view" id="v-${v}" hidden><div class="oapp" id="a-${v}"></div></section>`).join("")}<section class="view" id="v-db" hidden><div id="dbview"></div></section></div><div id="layer"></div><div id="toast"></div>`;
  engine = (await import("../../refyt/engine/index.js")) as Engine;
  engine.mount({ userId: "u-sad", apps: ["ret"], roles: ["sad"], viewAs: false, admin: [] });
}, 60_000);

describe("My tasks in the team apps", () => {
  it("describes the filters the page has (My tasks and Meeting action points)", () => {
    const h = engine.VIEWS.ret.pages.tasks();
    expect(h).toContain("Retrofit services: your tasks and the meeting action points, as a list or on a calendar.");
    expect(h).not.toContain("tasks from the Monday and Thursday meetings and from jobs");
  });

  it("says done tasks are archived automatically, and archives them", () => {
    const me = engine.ME();
    engine.DB.tk.push(
      { id: "TK-T1", t: "Done today", r: "sad", who: me, due: engine.TODAY, done: true, doneOn: engine.TODAY },
      { id: "TK-T2", t: "Done long ago", r: "sad", who: me, due: engine.TODAY, done: true, doneOn: engine.addDays(engine.TODAY, -(engine.TK_KEEP + 5)) }
    );
    engine.S.f.tkv3 = "mine"; engine.S.f.tkvw = "list"; engine.S.f.tkdo = true;
    const h = engine.VIEWS.ret.pages.tasks();
    expect(h).toContain(`Done tasks are cleared automatically ${engine.TK_KEEP} days after they are completed.`);
    expect(engine.tkArch(engine.DB.tk.find((k: { id: string }) => k.id === "TK-T2"))).toBe(true);
    expect(engine.tkArch(engine.DB.tk.find((k: { id: string }) => k.id === "TK-T1"))).toBe(false);
  });
});
