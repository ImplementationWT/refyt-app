import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupApi } from "./api.js";
import { skipDb, startMongo, type TestMongo } from "./mongo-server.js";

describe.skipIf(skipDb)("feedback", () => {
  let mongo: TestMongo;

  beforeAll(async () => {
    mongo = await startMongo();
  });

  afterAll(async () => {
    await mongo?.stop();
  });

  async function scenario() {
    const api = await setupApi(mongo);
    const admin = await api.adminCookie();
    const member = await api.createUser({ username: "afaq", roleKeys: ["assessor"] });
    return { api, admin, cookie: await member.cookie() };
  }

  it("any signed-in user sends feedback; it reaches the admin's inbox as new, with where it came from", async () => {
    const { api, admin, cookie } = await scenario();

    expect((await api.request("GET", "/api/feedback/settings", { cookie })).json()).toEqual({ enabled: true });
    const sent = await api.request("POST", "/api/feedback", {
      cookie,
      body: { type: "bug", message: "The booking calendar does not save the time", page: "/", screen: "Assessment bookings" }
    });
    expect(sent.statusCode).toBe(201);
    expect(sent.json().feedback).toMatchObject({ type: "bug", status: "new", username: "afaq", page: "/", screen: "Assessment bookings" });

    // The sender cannot read the inbox.
    expect((await api.request("GET", "/api/feedback", { cookie })).statusCode).toBe(403);

    const inbox = (await api.request("GET", "/api/feedback", { cookie: admin })).json();
    expect(inbox.total).toBe(1);
    expect(inbox.items[0]).toMatchObject({ message: "The booking calendar does not save the time", status: "new" });
    expect((await api.request("GET", "/api/feedback/settings", { cookie: admin })).json()).toEqual({ enabled: true, newCount: 1 });
    expect(await api.c.auditLogs.findOne({ action: "feedback.create" })).toBeTruthy();
  });

  it("the team tracks each item with a status and an internal note, and filters by status", async () => {
    const { api, admin, cookie } = await scenario();
    const id = (await api.request("POST", "/api/feedback", { cookie, body: { type: "idea", message: "Show the postcode in the list" } })).json()
      .feedback.id;

    const updated = await api.request("PATCH", `/api/feedback/${id}`, { cookie: admin, body: { status: "fixed", note: "Done in v1.1" } });
    expect(updated.json().feedback).toMatchObject({ status: "fixed", note: "Done in v1.1" });
    expect((await api.request("GET", "/api/feedback?status=new", { cookie: admin })).json().total).toBe(0);
    expect((await api.request("GET", "/api/feedback?status=fixed", { cookie: admin })).json().total).toBe(1);
    expect((await api.request("PATCH", `/api/feedback/${id}`, { cookie, body: { status: "new" } })).statusCode).toBe(403);
  });

  it("an administrator switches the module off; then nobody can send", async () => {
    const { api, admin, cookie } = await scenario();

    expect((await api.request("PUT", "/api/feedback/settings", { cookie, body: { enabled: false } })).statusCode).toBe(403);
    expect((await api.request("PUT", "/api/feedback/settings", { cookie: admin, body: { enabled: false } })).json()).toEqual({ enabled: false });
    expect((await api.request("GET", "/api/feedback/settings", { cookie })).json()).toEqual({ enabled: false });

    const refused = await api.request("POST", "/api/feedback", { cookie, body: { type: "bug", message: "Something broke" } });
    expect(refused.statusCode).toBe(409);
    expect(refused.json().error).toBe("feedback_disabled");

    await api.request("PUT", "/api/feedback/settings", { cookie: admin, body: { enabled: true } });
    expect((await api.request("POST", "/api/feedback", { cookie, body: { type: "bug", message: "Something broke" } })).statusCode).toBe(201);
  });

  it("validates the input", async () => {
    const { api, cookie } = await scenario();
    expect((await api.request("POST", "/api/feedback", { cookie, body: { type: "complaint", message: "Hello there" } })).statusCode).toBe(400);
    expect((await api.request("POST", "/api/feedback", { cookie, body: { type: "bug", message: " " } })).statusCode).toBe(400);
  });
});
