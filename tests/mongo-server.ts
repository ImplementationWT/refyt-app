import { MongoClient, type Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set SKIP_DB_INTEGRATION=1 to skip tests that need a MongoDB (no network).
export const skipDb = process.env.SKIP_DB_INTEGRATION === "1";

export interface TestMongo {
  uri: string;
  client: MongoClient;
  /** A fresh database per call so tests do not share state. */
  freshDb(): Db;
  stop(): Promise<void>;
}

let counter = 0;

export async function startMongo(): Promise<TestMongo> {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();
  const client = await new MongoClient(uri).connect();

  return {
    uri,
    client,
    freshDb: () => client.db(`client_test_${process.pid}_${++counter}`),
    async stop() {
      await client.close();
      await server.stop();
    }
  };
}
