import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Feedback } from "../lib/types";
import { META, mockApi, renderApp, session } from "./utils";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const ITEM: Feedback = {
  id: "f1",
  userId: "u2",
  userName: "Afaq",
  username: "afaq",
  type: "bug",
  message: "The booking calendar does not save the time",
  page: "/",
  screen: "Survey Admin · Assessment bookings",
  status: "new",
  note: "",
  createdAt: "2026-10-20T10:00:00.000Z",
  updatedAt: "2026-10-20T10:00:00.000Z"
};

async function openUserMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: "User menu" }));
  return screen.getByRole("menu", { name: "User menu" });
}

describe("sending feedback", () => {
  it("any user sends it from the user menu, with the page they are on", async () => {
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session([]),
      "GET /api/feedback/settings": { enabled: true },
      "POST /api/feedback": (body: unknown) => ({ status: 201, body: { feedback: { ...ITEM, ...(body as object) } } })
    });
    const user = userEvent.setup();
    renderApp("/");

    const menu = await openUserMenu(user);
    await waitFor(() => expect(within(menu).getByRole("menuitem", { name: /send feedback/i })).toBeInTheDocument());
    await user.click(within(menu).getByRole("menuitem", { name: /send feedback/i }));

    const dialog = await screen.findByRole("dialog", { name: "Send feedback" });
    await user.click(within(dialog).getByRole("radio", { name: /idea/i }));
    await user.click(within(dialog).getByRole("button", { name: /^send$/i }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Write at least a few words");

    await user.type(within(dialog).getByLabelText("Message"), "Show the postcode in the list");
    await user.click(within(dialog).getByRole("button", { name: /^send$/i }));

    expect(await screen.findByText(/your feedback reached the implementation team/i)).toBeInTheDocument();
    expect(calls.find((call) => call.method === "POST" && call.url === "/api/feedback")?.body).toMatchObject({
      type: "idea",
      message: "Show the postcode in the list",
      page: "/"
    });
  });

  it("is not offered when an administrator switched it off", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session([]), "GET /api/feedback/settings": { enabled: false } });
    const user = userEvent.setup();
    renderApp("/");

    const menu = await openUserMenu(user);
    await waitFor(() => expect(within(menu).getAllByRole("menuitem").map((item) => item.textContent)).toEqual(["Change password", "Sign out"]));
  });
});

describe("feedback inbox", () => {
  it("is in the admin menu only with feedback.manage", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["feedback.manage"]),
      "GET /api/feedback/settings": { enabled: true, newCount: 1 }
    });
    const user = userEvent.setup();
    renderApp("/");

    const menu = await openUserMenu(user);
    expect(within(menu).getByRole("menuitem", { name: /^feedback/i })).toHaveAttribute("href", "/feedback");
  });

  it("protects the route without the permission", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session([]), "GET /api/feedback/settings": { enabled: true } });
    renderApp("/feedback");

    expect(await screen.findByRole("heading", { name: "Access denied" })).toBeInTheDocument();
  });

  it("lists new items, updates their status with a note and switches the module off", async () => {
    let enabled = true;
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["feedback.manage"]),
      "GET /api/feedback/settings": () => ({ body: { enabled, newCount: 1 } }),
      "PUT /api/feedback/settings": (body: unknown) => {
        enabled = (body as { enabled: boolean }).enabled;
        return { body: { enabled } };
      },
      "GET /api/feedback": { items: [ITEM], total: 1, page: 1, pageSize: 20 },
      "PATCH /api/feedback/f1": (body: unknown) => ({ body: { feedback: { ...ITEM, ...(body as object) } } })
    });
    const user = userEvent.setup();
    renderApp("/feedback");

    expect(await screen.findByRole("heading", { name: "Feedback" })).toBeInTheDocument();
    expect(calls.find((call) => call.url.startsWith("/api/feedback?"))?.url).toContain("status=new");
    await user.click(await screen.findByRole("row", { name: /open feedback from afaq/i }));

    const sheet = await screen.findByRole("dialog", { name: "Something is wrong" });
    expect(within(sheet).getByText("Survey Admin · Assessment bookings")).toBeInTheDocument();
    await user.selectOptions(within(sheet).getByLabelText("Status"), "fixed");
    await user.type(within(sheet).getByLabelText("Team note"), "Done in v1.1");
    await user.click(within(sheet).getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Marked as fixed")).toBeInTheDocument();
    expect(calls.find((call) => call.method === "PATCH")?.body).toEqual({ status: "fixed", note: "Done in v1.1" });

    await user.click(screen.getByRole("switch", { name: "Users can send feedback" }));
    expect(await screen.findByText(/users do not see “send feedback”/i)).toBeInTheDocument();
    expect(calls.find((call) => call.method === "PUT")?.body).toEqual({ enabled: false });
  });
});
