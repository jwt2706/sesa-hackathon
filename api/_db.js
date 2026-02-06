import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI in environment.");
}

let clientPromise = globalThis._mongoClientPromise;
if (!clientPromise) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  globalThis._mongoClientPromise = clientPromise;
}

export async function getDb() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "app";
  return client.db(dbName);
}
