import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as engine from "../refyt/engine/index.js";
import { EMPTY_PAGE, META, mockApi, renderApp, session } from "./utils";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const UNAUTHORIZED = { status: 401, body: { error: "unauthorized" } };
const unauthorized = () => UNAUTHORIZED;
const ALL_PERMISSIONS = [
  "users.read", "users.create", "users.update", "users.delete",
  "roles.read", "roles.create", "roles.update", "roles.delete",
  "permissions.read", "notifications.read", "notifications.manage", "audit.read", "dashboard.read"
];

const DASHBOARD = {
  range: { days: 14, tz: "UTC", from: "2026-10-02", to: "2026-10-15" },
  kpis: { activeUsers: 12, disabledUsers: 2, roles: 3, logins: 48, failedLogins: 5, uniqueUsers: 9 },
  series: Array.from({ length: 14 }, (_, index) => ({
    date: `2026-10-${String(index + 2).padStart(2, "0")}`,
    logins: index === 13 ? 9 : index % 4,
    failures: index === 13 ? 2 : 0
  }))
};

describe("login", () => {
  it("logs in and lands on Refyt", async () => {
    let loggedIn = false;
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": () => (loggedIn ? { body: session(["users.read", "refyt.retrofit"]) } : UNAUTHORIZED),
      "POST /api/auth/login": () => {
        loggedIn = true;
        return { body: session(["users.read", "refyt.retrofit"]) };
      }
    });
    const user = userEvent.setup();
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Test app" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Username"), "ana");
    await user.type(screen.getByLabelText("Password"), "una-clave-cualquiera");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByTestId("refyt-workspace")).toBeInTheDocument();
    const login = calls.find((call) => call.method === "POST");
    expect(login?.body).toEqual({ username: "ana", password: "una-clave-cualquiera" });
  });

  it("shows a generic error on invalid credentials and clears the password", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": unauthorized,
      "POST /api/auth/login": () => ({
        status: 401,
        body: { error: "invalid_credentials", message: "Incorrect username or password" }
      })
    });
    const user = userEvent.setup();
    renderApp("/login");

    await user.type(await screen.findByLabelText("Username"), "ana");
    await user.type(screen.getByLabelText("Password"), "mala");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect username or password");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("validates required fields before calling the API", async () => {
    const { calls } = mockApi({ "GET /api/meta": META, "GET /api/auth/me": unauthorized });
    const user = userEvent.setup();
    renderApp("/login");

    await user.click(await screen.findByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Enter your username")).toBeInTheDocument();
    expect(calls.some((call) => call.method === "POST")).toBe(false);
  });

  it("sends a user who must change the password to the change screen", async () => {
    let loggedIn = false;
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": () =>
        loggedIn ? { body: session(ALL_PERMISSIONS, { mustChangePassword: true }) } : UNAUTHORIZED,
      "POST /api/auth/login": () => {
        loggedIn = true;
        return { body: session(ALL_PERMISSIONS, { mustChangePassword: true }) };
      }
    });
    const user = userEvent.setup();
    renderApp("/login");

    await user.type(await screen.findByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "admin123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("heading", { name: "Change password" })).toBeInTheDocument();
  });
});

describe("forced password change", () => {
  it("rejects admin123 and passwords equal to the username on the client", async () => {
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session([], { username: "ana", mustChangePassword: true })
    });
    const user = userEvent.setup();
    renderApp("/users");

    await user.type(await screen.findByLabelText("Current password"), "admin123");
    await user.type(screen.getByLabelText("New password"), "admin123");
    await user.type(screen.getByLabelText("Repeat the new password"), "admin123");
    await user.click(screen.getByRole("button", { name: /save password/i }));
    expect(await screen.findByText("The password cannot be the initial password")).toBeInTheDocument();

    expect(calls.some((call) => call.url === "/api/auth/change-password")).toBe(false);
  });

  it("redirects every route to the change screen and has no sidebar", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(ALL_PERMISSIONS, { mustChangePassword: true })
    });
    renderApp("/audit");

    expect(await screen.findByRole("heading", { name: "Change password" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Main navigation" })).not.toBeInTheDocument();
  });
});

describe("route guards", () => {
  it("redirects to login without a session", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": unauthorized });
    renderApp("/users");

    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows access denied for a route without the permission", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(["roles.read"]) });
    renderApp("/users");

    expect(await screen.findByRole("heading", { name: "Access denied" })).toBeInTheDocument();
  });

  it("renders the page when the permission is present", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["users.read"]),
      "GET /api/users": EMPTY_PAGE
    });
    renderApp("/users");

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(await screen.findByText("No users yet")).toBeInTheDocument();
    // No create button without users.create.
    expect(screen.queryByRole("button", { name: /new user/i })).not.toBeInTheDocument();
  });

  it("returns to login when the session expires (401 on a data request)", async () => {
    let expired = false;
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": () => (expired ? UNAUTHORIZED : { body: session(["users.read"]) }),
      "GET /api/users": () => {
        expired = true;
        return UNAUTHORIZED;
      }
    });
    renderApp("/users");

    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});

describe("Refyt", () => {
  it("shows Refyt at / after login, with the user section in the header", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(["refyt.director"]) });
    renderApp("/");

    expect(await screen.findByTestId("refyt-workspace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REFYT, go to Overview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "User menu" })).toHaveTextContent("Ana");
    expect(screen.queryByRole("complementary", { name: "Main navigation" })).not.toBeInTheDocument();
  });

  it("opens only the apps and roles of the signed-in user", async () => {
    const roles = [{ id: "r1", key: "assessor", name: "Assessor" }, { id: "r2", key: "site-manager", name: "Site manager" }];
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["refyt.retrofit", "refyt.delivery"], { roles })
    });
    renderApp("/");

    await waitFor(() => expect(engine.mount).toHaveBeenCalled());
    expect(engine.mount).toHaveBeenLastCalledWith({ userId: "u1", apps: ["ret", "del"], roles: ["ass", "sit"], viewAs: false, admin: [] });
  });

  it("says so when the user has no Refyt role", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session([]) });
    renderApp("/");

    expect(await screen.findByRole("heading", { name: "You do not have access to Refyt yet" })).toBeInTheDocument();
    expect(screen.queryByTestId("refyt-workspace")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "User menu" })).toBeInTheDocument();
  });

  it("asks to log in before showing Refyt", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": unauthorized });
    renderApp("/");

    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByTestId("refyt-workspace")).not.toBeInTheDocument();
  });
});

describe("sidebar", () => {
  async function sidebarLinks(permissions: string[]) {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(permissions) });
    renderApp("/dashboard");
    const nav = await screen.findByRole("complementary", { name: "Main navigation" });
    return within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent);
  }

  it("shows only the sections the user may access", async () => {
    expect(await sidebarLinks([])).toEqual(["Dashboards"]);
  });

  it("shows every section to an administrator, grouped", async () => {
    expect(await sidebarLinks(ALL_PERMISSIONS)).toEqual(["Users", "Roles", "Dashboards"]);
    const nav = screen.getByRole("complementary", { name: "Main navigation" });
    expect(within(nav).getByText("Administration")).toBeInTheDocument();
    expect(within(nav).getByText("Activity")).toBeInTheDocument();
    expect(within(nav).queryByText("Notificaciones")).not.toBeInTheDocument();
    expect(within(nav).queryByText("Auditoría")).not.toBeInTheDocument();
    expect(within(nav).queryByText("Permissions")).not.toBeInTheDocument();
  });

  it("hides a group when the user has none of its permissions", async () => {
    await sidebarLinks(["notifications.read"]);
    const nav = screen.getByRole("complementary", { name: "Main navigation" });

    expect(within(nav).getByText("Activity")).toBeInTheDocument();
    expect(within(nav).queryByText("Administration")).not.toBeInTheDocument();
  });

  it("needs users.read for Usuarios (the catalog alone is not enough)", async () => {
    expect(await sidebarLinks(["permissions.read"])).toEqual(["Dashboards"]);
  });
});

describe("header", () => {
  it("shows the app name from /api/meta and no notifications bell", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(ALL_PERMISSIONS), "GET /api/dashboard": DASHBOARD });
    renderApp("/dashboard");

    await waitFor(() => expect(document.title).toBe("Refyt"));
    expect(screen.queryByRole("button", { name: /notificaciones/i })).not.toBeInTheDocument();
  });

  it("logs out from the user menu", async () => {
    let loggedIn = true;
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": () => (loggedIn ? { body: session([]) } : UNAUTHORIZED),
      "POST /api/auth/logout": () => {
        loggedIn = false;
        return { body: { ok: true } };
      }
    });
    const user = userEvent.setup();
    renderApp("/dashboard");

    await user.click(await screen.findByRole("button", { name: "User menu" }));
    await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

    expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(calls.some((call) => call.url === "/api/auth/logout")).toBe(true);
  });

  it("opens Users, Roles and Integrations from the user menu, by permission", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["users.read", "roles.read", "integrations.read"]),
      "GET /api/users": EMPTY_PAGE
    });
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("button", { name: "User menu" }));
    const menu = screen.getByRole("menu", { name: "User menu" });
    expect(within(menu).getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "UsersAccounts, access and permissions",
      "RolesGroups permissions by job",
      "IntegrationsConnected external services",
      "Change password",
      "Sign out"
    ]);

    await user.click(within(menu).getByRole("menuitem", { name: /users/i }));
    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to refyt/i })).toHaveAttribute("href", "/");
  });

  it("shows only what the user may open in the user menu", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session([]) });
    const user = userEvent.setup();
    renderApp("/");

    await user.click(await screen.findByRole("button", { name: "User menu" }));
    const menu = screen.getByRole("menu", { name: "User menu" });
    expect(within(menu).queryByText("Administration")).not.toBeInTheDocument();
    expect(within(menu).getAllByRole("menuitem").map((item) => item.textContent)).toEqual(["Change password", "Sign out"]);
  });
});

describe("users", () => {
  it("creates a user and confirms with a toast", async () => {
    const created = session(["users.read"]).user;
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["users.read", "users.create"]),
      "GET /api/users": EMPTY_PAGE,
      "POST /api/users": () => ({
        status: 201,
        body: { user: { ...created, id: "u2", username: "maria", displayName: "María" } }
      })
    });
    const user = userEvent.setup();
    renderApp("/users");

    await user.click(await screen.findByRole("button", { name: /new user/i }));
    await user.type(screen.getByLabelText("Username"), "maria");
    await user.type(screen.getByLabelText("Name"), "María");
    await user.type(screen.getByLabelText("Temporary password"), "Clave-temporal-1");
    await user.click(screen.getByRole("button", { name: "Create user" }));

    expect(await screen.findByText("María was created")).toBeInTheDocument();
    expect(calls.find((call) => call.method === "POST")?.body).toMatchObject({ username: "maria", displayName: "María" });
  });

  it("opens the detail panel when a row is clicked", async () => {
    const row = { ...session([]).user, id: "u9", username: "luis", displayName: "Luis Gómez", email: "luis@example.test" };
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["users.read"]),
      "GET /api/users": { items: [row], total: 1, page: 1, pageSize: 20 }
    });
    const user = userEvent.setup();
    renderApp("/users");

    await user.click(await screen.findByRole("row", { name: "See details of Luis Gómez" }));

    const panel = await screen.findByRole("dialog", { name: "Luis Gómez" });
    expect(within(panel).getByText("luis@example.test")).toBeInTheDocument();
  });
});

describe("per-user permissions", () => {
  const ROW = { ...session([]).user, id: "u7", username: "maria", displayName: "María Pérez", roles: [{ id: "r1", key: "user", name: "User" }] };
  const PERMISSIONS = {
    user: { id: "u7", username: "maria", displayName: "María Pérez" },
    isAdmin: false,
    isSelf: false,
    editable: true,
    permissions: [
      { key: "dashboard.read", module: "dashboard", description: "Ver los indicadores del dashboard", fromRoles: [], granted: false, revoked: false, effective: false, grantable: true },
      { key: "notifications.read", module: "notifications", description: "Ver y marcar notificaciones propias", fromRoles: ["User"], granted: false, revoked: false, effective: true, grantable: true },
      { key: "users.read", module: "users", description: "Ver usuarios", fromRoles: [], granted: false, revoked: false, effective: false, grantable: false }
    ]
  };

  it("opens from the row icon, shows origins and saves the desired set", async () => {
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["users.read", "users.update"]),
      "GET /api/users": { items: [ROW], total: 1, page: 1, pageSize: 20 },
      "GET /api/users/u7/permissions": PERMISSIONS,
      "PUT /api/users/u7/permissions": () => ({ body: { permissionKeys: ["dashboard.read"] } })
    });
    const user = userEvent.setup();
    renderApp("/users");

    await user.click(await screen.findByRole("button", { name: "Permissions of maria" }));
    const panel = await screen.findByRole("dialog", { name: "Permissions of María Pérez" });
    expect(await within(panel).findByText("Role: User")).toBeInTheDocument();

    // A permission the current user lacks cannot be granted.
    expect(within(panel).getByRole("checkbox", { name: /Ver usuarios/ })).toBeDisabled();

    await user.click(within(panel).getByRole("checkbox", { name: /Ver los indicadores/ }));
    await user.click(within(panel).getByRole("checkbox", { name: /Ver y marcar notificaciones/ }));
    expect(within(panel).getByText("Added")).toBeInTheDocument();
    expect(within(panel).getByText("Removed (role: User)")).toBeInTheDocument();
    expect(within(panel).getByText("2 unsaved changes")).toBeInTheDocument();

    await user.click(within(panel).getByRole("button", { name: "Save permissions" }));

    expect(await screen.findByText("Permissions of María Pérez updated")).toBeInTheDocument();
    expect(calls.find((call) => call.method === "PUT")?.body).toEqual({ permissionKeys: ["dashboard.read"] });
  });

  it("is read-only for administrators", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["users.read", "users.update"]),
      "GET /api/users": { items: [ROW], total: 1, page: 1, pageSize: 20 },
      "GET /api/users/u7/permissions": { ...PERMISSIONS, isAdmin: true, editable: false }
    });
    const user = userEvent.setup();
    renderApp("/users");

    await user.click(await screen.findByRole("button", { name: "Permissions of maria" }));
    const panel = await screen.findByRole("dialog", { name: "Permissions of María Pérez" });

    expect(await within(panel).findByText("Administrators always have every permission.")).toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: "Save permissions" })).not.toBeInTheDocument();
    for (const box of within(panel).getAllByRole("checkbox")) expect(box).toBeDisabled();
  });

  it("redirects the old permissions addresses to Users", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(["users.read"]), "GET /api/users": EMPTY_PAGE });
    renderApp("/users/permissions");

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "User sections" })).not.toBeInTheDocument();
  });
});

describe("dashboards", () => {
  it("shows KPI cards and the daily logins chart, with a table view", async () => {
    const { calls } = mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["dashboard.read"]),
      "GET /api/dashboard": DASHBOARD
    });
    const user = userEvent.setup();
    renderApp("/dashboard");

    expect(await screen.findByText("48")).toBeInTheDocument();
    expect(screen.getByText("People who signed in")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Sign-ins per day/ })).toBeInTheDocument();
    expect(calls.find((call) => call.url.startsWith("/api/dashboard"))?.url).toContain("days=14");

    await user.click(screen.getByRole("button", { name: "Show table" }));
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(15);

    await user.click(screen.getByRole("button", { name: "7 days" }));
    await waitFor(() => expect(calls.some((call) => call.url.includes("days=7"))).toBe(true));
  });

  it("shows a column tooltip on keyboard focus", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(["dashboard.read"]), "GET /api/dashboard": DASHBOARD });
    renderApp("/dashboard");

    const column = await screen.findByRole("graphics-symbol", { name: /Thursday 15 October: 9 sign-ins/ });
    column.focus();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("9");
    expect(tooltip).toHaveTextContent("Failed attempts: 2");
  });

  it("explains when the user cannot see indicators", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session([]) });
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "You have no indicators available" })).toBeInTheDocument();
  });
});

describe("Monday integration", () => {
  const BOARDS = {
    items: [
      { id: "2", name: "Zeta", workspaceName: "Operaciones", url: "https://demo.monday.com/boards/2" },
      { id: "1", name: "alfa", workspaceName: null, url: "https://demo.monday.com/boards/1" },
      { id: "3", name: "Peligroso", workspaceName: "Ventas", url: "javascript:alert(1)" },
      { id: "4", name: "Parecido", workspaceName: null, url: "https://monday.com.evil.com/boards/4" },
      { id: "5", name: "Inseguro", workspaceName: null, url: "http://demo.monday.com/boards/5" }
    ],
    total: 5
  };
  const withFeature = session(["monday.read"], {}, ["monday"]);

  async function sidebarText(current: ReturnType<typeof session>) {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": current });
    renderApp("/dashboard");
    const nav = await screen.findByRole("complementary", { name: "Main navigation" });
    return within(nav).getAllByRole("link").map((link) => link.textContent);
  }

  it("shows the Monday tab only with the feature", async () => {
    expect(await sidebarText(withFeature)).toEqual(["Monday", "Dashboards"]);
    cleanup();
    // Permission alone is not enough: the backend must enable the feature.
    expect(await sidebarText(session(["monday.read"]))).toEqual(["Dashboards"]);
  });

  it("protects the /monday route without the feature", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": session(["monday.read"]) });
    renderApp("/monday");

    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("lists boards alphabetically with safe links in a new tab", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": withFeature, "GET /api/monday/boards": BOARDS });
    renderApp("/monday");

    const links = await screen.findAllByRole("link", { name: /opens in a new tab/ });
    expect(links.map((link) => link.querySelector(".font-semibold")?.textContent)).toEqual(["alfa", "Zeta"]);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.getAttribute("href")).toMatch(/^https:\/\/demo\.monday\.com\/boards\/\d+$/);
    }
    expect(screen.getByText("Operaciones")).toBeInTheDocument();
    expect(screen.getAllByText("Main workspace").length).toBeGreaterThan(0);

    // Disallowed URLs are shown without a link.
    expect(screen.getAllByTestId("board-without-link")).toHaveLength(3);
    for (const name of ["Peligroso", "Parecido", "Inseguro"]) {
      expect(screen.getByText(name).closest("a")).toBeNull();
    }
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it("filters by name on the client", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": withFeature, "GET /api/monday/boards": BOARDS });
    const user = userEvent.setup();
    renderApp("/monday");

    await screen.findByText("Zeta");
    await user.type(screen.getByRole("textbox", { name: "Search boards by name" }), "ALF");
    expect(screen.getByText("alfa")).toBeInTheDocument();
    expect(screen.queryByText("Zeta")).not.toBeInTheDocument();
  });

  it("shows the loading and empty states", async () => {
    mockApi({ "GET /api/meta": META, "GET /api/auth/me": withFeature, "GET /api/monday/boards": { items: [], total: 0 } });
    renderApp("/monday");

    expect(await screen.findByRole("status", { name: "Loading boards…" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "There are no boards in this account" })).toBeInTheDocument();
  });

  it.each([
    [502, "auth_failed", "Credential rejected"],
    [503, "rate_limited", "Limit reached"],
    [503, "unavailable", "Service unavailable"]
  ])("shows a generic error for HTTP %s %s and retries", async (status, code, title) => {
    let calls = 0;
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": withFeature,
      "GET /api/monday/boards": () => {
        calls += 1;
        return calls === 1 ? { status, body: { error: code } } : { body: BOARDS };
      }
    });
    const user = userEvent.setup();
    renderApp("/monday");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(title);
    await user.click(within(alert).getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Zeta")).toBeInTheDocument();
  });
});

describe("Integrations page", () => {
  it("explains a missing credential without any input fields", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["integrations.read", "integrations.manage"]),
      "GET /api/integrations": { items: [{ id: "monday", label: "Monday.com", configured: false }] }
    });
    renderApp("/integrations");

    expect(await screen.findByText("Not configured")).toBeInTheDocument();
    expect(screen.getByText(/The credential is managed by whoever runs the platform/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Test connection/ })).not.toBeInTheDocument();
  });

  it("tests a configured connection and shows the result", async () => {
    let ok = true;
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["integrations.read", "integrations.manage"]),
      "GET /api/integrations": { items: [{ id: "monday", label: "Monday.com", configured: true }] },
      "POST /api/integrations/monday/test": () => ({ body: ok ? { ok: true } : { ok: false, error: "auth_failed" } })
    });
    const user = userEvent.setup();
    renderApp("/integrations");

    await user.click(await screen.findByRole("button", { name: /Test connection/ }));
    expect(await screen.findByText("Connection OK.")).toBeInTheDocument();

    ok = false;
    await user.click(screen.getByRole("button", { name: /Test connection/ }));
    expect(await screen.findByText("Credential rejected.")).toBeInTheDocument();
  });

  it("hides the test button without integrations.manage", async () => {
    mockApi({
      "GET /api/meta": META,
      "GET /api/auth/me": session(["integrations.read"]),
      "GET /api/integrations": { items: [{ id: "monday", label: "Monday.com", configured: true }] }
    });
    renderApp("/integrations");

    expect(await screen.findByText("Configured")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Test connection/ })).not.toBeInTheDocument();
  });
});
