// One-time migration: backfill Member.nameLower and remove duplicate
// members (case-insensitive) that predate the unique index, keeping the
// earliest one created.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || "stall_ledger" });
  const col = mongoose.connection.collection("members");

  const all = await col.find({}).sort({ createdAt: 1 }).toArray();
  const seen = new Map();
  let removed = 0;

  for (const m of all) {
    const key = String(m.name || "").trim().toLowerCase();
    if (seen.has(key)) {
      await col.deleteOne({ _id: m._id });
      removed++;
      continue;
    }
    seen.set(key, m);
    if (m.nameLower !== key) {
      await col.updateOne({ _id: m._id }, { $set: { nameLower: key } });
    }
  }

  console.log(`Done. Kept ${seen.size} member(s), removed ${removed} duplicate(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
