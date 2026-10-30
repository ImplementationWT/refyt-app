import type { Db } from "mongodb";

export interface MigrationLogger {
  info(object: Record<string, unknown>, message: string): void;
}

export interface MigrationContext {
  db: Db;
  seed: {
    initialAdminPassword: string | undefined;
    forceAdminPasswordChange: boolean;
  };
  log: MigrationLogger;
}

export interface Migration {
  version: number;
  name: string;
  /** Must be idempotent: it may run again after a partial failure. */
  up(context: MigrationContext): Promise<void>;
}
