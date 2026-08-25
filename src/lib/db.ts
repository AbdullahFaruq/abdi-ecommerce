import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing. Add it to .env.local");
}

/**
 * Next.js hot-reloads modules in dev and runs many lambda invocations in prod,
 * so the connection is cached on globalThis to avoid opening a new pool per
 * request (a classic source of Atlas connection-limit errors).
 */
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  _mongoose?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose._mongoose ?? {
  conn: null,
  promise: null,
};

globalForMongoose._mongoose = cached;

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
