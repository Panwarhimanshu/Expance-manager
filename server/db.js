const mongoose = require("mongoose");

// Cached across invocations so serverless functions (Vercel) reuse the
// connection instead of opening a new one on every request.
let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = { conn: null, promise: null };

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set. Add it to server/.env (local) or your Vercel project's env vars.");
    cached.promise = mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "stall_ledger" });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
