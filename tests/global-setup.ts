import { MongoBinary } from "mongodb-memory-server";

/**
 * Downloads the MongoDB binary of mongodb-memory-server once, before the test files start.
 * Without it, on a runner with no cache (the CI cache key follows pnpm-lock.yaml) every test file
 * downloads it at the same time and their lock files collide ("Cannot unlock file …8.2.6.lock").
 */
export default async function setup() {
  if (process.env.SKIP_DB_INTEGRATION === "1") return;
  await MongoBinary.getPath();
}
