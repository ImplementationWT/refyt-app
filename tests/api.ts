import type { FastifyInstance, LightMyRequestResponse } from "fastify";
import { ObjectId, type Db } from "mongodb";
import type { AppOptions, AppSettings } from "../src/app.js";
import type { Integrations } from "../src/integrations/service.js";
import { hashPassword } from "../src/auth/password.js";
import { collections, type Collections, type UserDoc } from "../src/db/collections.js";
import { runMigrations } from "../src/db/migrations/index.js";
import { buildTestApp, dbFrom } from "./helpers.js";
import type { TestMongo } from "./mongo-server.js";

export const ORIGIN = "http://localhost";
export const ADMIN_NEW_PASSWORD = "Nueva-clave-admin-1";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Api {
  app: FastifyInstance;
  db: Db;
  c: Collections;
  logs: { text(): string };
  /** Every response body seen, to assert nothing sensitive leaks. */
  bodies: string[];
  request(
    method: Method,
    url: string,
    options?: { cookie?: string; body?: unknown; headers?: Record<string, string> }
  ): Promise<LightMyRequestResponse>;
  login(username: string, password: string): Promise<string>;
  /** Logs in as the seeded admin and completes the forced password change. */
  adminCookie(): Promise<string>;
  createUser(options: {
    username: string;
    password?: string;
    permissions?: string[];
    roleKeys?: string[];
    mustChangePassword?: boolean;
  }): Promise<{ id: string; username: string; password: string; cookie: () => Promise<string> }>;
}

export function cookieHeader(response: LightMyRequestResponse, name = "sid"): string {
  const cookie = response.cookies.find((item) => item.name === name);
  if (!cookie) {
    throw new Error(`No ${name} cookie in response (status ${response.statusCode}): ${response.body}`);
  }
  return `${name}=${cookie.value}`;
}

export async function setupApi(
  mongo: TestMongo,
  options: {
    settings?: Partial<AppSettings>;
    seed?: { initialAdminPassword?: string };
    integrations?: Integrations;
    secrets?: string[];
    willdoo?: AppOptions["willdoo"];
  } = {}
): Promise<Api> {
  const db = mongo.freshDb();
  const schemaVersion = await runMigrations({
    db,
    seed: { initialAdminPassword: options.seed?.initialAdminPassword, forceAdminPasswordChange: true },
    log: { info: () => undefined }
  });
  const { app, logs } = await buildTestApp(dbFrom(db), {
    settings: options.settings,
    state: { ready: true, schemaVersion },
    ...(options.integrations ? { integrations: options.integrations } : {}),
    ...(options.secrets ? { secrets: options.secrets } : {}),
    ...(options.willdoo ? { willdoo: options.willdoo } : {})
  });
  const c = collections(db);
  const bodies: string[] = [];
  let roleCounter = 0;
  const cookieName = options.settings?.production ? "__Host-sid" : "sid";

  const api: Api = {
    app,
    db,
    c,
    logs,
    bodies,
    async request(method, url, { cookie, body, headers } = {}) {
      const unsafe = method !== "GET";
      const response = await app.inject({
        method,
        url,
        headers: {
          ...(unsafe ? { origin: ORIGIN, "content-type": "application/json" } : {}),
          ...(cookie ? { cookie } : {}),
          ...headers
        },
        ...(unsafe ? { payload: JSON.stringify(body ?? {}) } : {})
      });
      bodies.push(response.body);
      return response;
    },
    async login(username, password) {
      const response = await api.request("POST", "/api/auth/login", { body: { username, password } });
      return cookieHeader(response, cookieName);
    },
    async adminCookie() {
      const cookie = await api.login("admin", options.seed?.initialAdminPassword ?? "admin123");
      const changed = await api.request("POST", "/api/auth/change-password", {
        cookie,
        body: { currentPassword: options.seed?.initialAdminPassword ?? "admin123", newPassword: ADMIN_NEW_PASSWORD }
      });
      if (changed.statusCode !== 200) {
        throw new Error(`admin password change failed: ${changed.body}`);
      }
      return cookie;
    },
    async createUser({ username, password = "Clave-de-prueba-1", permissions, roleKeys = [], mustChangePassword = false }) {
      const roleIds: ObjectId[] = [];
      if (permissions) {
        const key = `test_role_${++roleCounter}`;
        const now = new Date();
        const result = await c.roles.insertOne({
          key,
          name: key,
          description: "",
          permissionKeys: permissions,
          isSystem: false,
          createdAt: now,
          updatedAt: now
        } as never);
        roleIds.push(result.insertedId);
      }
      for (const key of roleKeys) {
        const role = await c.roles.findOne({ key });
        roleIds.push(role!._id);
      }
      const now = new Date();
      const result = await c.users.insertOne({
        username,
        displayName: username,
        passwordHash: await hashPassword(password),
        roleIds,
        status: "active",
        mustChangePassword,
        lastLoginAt: null,
        failedLoginCount: 0,
        lockedUntil: null,
        createdAt: now,
        updatedAt: now
      } as Omit<UserDoc, "_id"> as UserDoc);
      return {
        id: String(result.insertedId),
        username,
        password,
        cookie: () => api.login(username, password)
      };
    }
  };
  return api;
}
