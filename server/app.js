const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Member, Expense, Sale, Settlement } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

const newId = () => crypto.randomUUID();
const strip = (doc) => {
  const { _id, __v, ...rest } = doc;
  return rest;
};

// ---- state ----
app.get("/api/state", async (req, res) => {
  const [members, expenses, sales, settlements] = await Promise.all([
    Member.find().sort({ createdAt: 1 }).lean(),
    Expense.find().sort({ createdAt: 1 }).lean(),
    Sale.find().sort({ createdAt: 1 }).lean(),
    Settlement.find().sort({ createdAt: 1 }).lean(),
  ]);
  res.json({
    members: members.map(strip),
    expenses: expenses.map(strip),
    sales: sales.map(strip),
    settlements: settlements.map(strip),
  });
});

// ---- members ----
app.post("/api/members", async (req, res) => {
  const name = String(req.body.name || "").trim().replace(/\s+/g, " ");
  if (!name) return res.status(400).json({ error: "Name is required." });
  const nameLower = name.toLowerCase();

  try {
    const member = await Member.findOneAndUpdate(
      { nameLower },
      { $setOnInsert: { id: newId(), name, nameLower, createdAt: Date.now() } },
      { upsert: true, new: true }
    ).lean();
    res.status(201).json({ member: strip(member) });
  } catch (err) {
    if (err.code === 11000) {
      const existing = await Member.findOne({ nameLower }).lean();
      if (existing) return res.json({ member: strip(existing) });
    }
    throw err;
  }
});

app.delete("/api/members/:id", async (req, res) => {
  await Member.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

// ---- generic helpers for expenses/sales/settlements ----
function addEntry(Model) {
  return async (req, res) => {
    const entry = { ...req.body, id: newId(), createdAt: Date.now() };
    await Model.create(entry);
    res.status(201).json({ entry });
  };
}

function updateEntry(Model, allowedFields) {
  return async (req, res) => {
    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    const doc = await Model.findOneAndUpdate({ id: req.params.id }, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ entry: strip(doc) });
  };
}

function deleteEntry(Model) {
  return async (req, res) => {
    await Model.deleteOne({ id: req.params.id });
    res.json({ ok: true });
  };
}

function restoreEntry(Model) {
  return async (req, res) => {
    const { id, ...rest } = req.body;
    if (!id) return res.status(400).json({ error: "id is required" });
    await Model.create({ ...rest, id });
    res.status(201).json({ ok: true });
  };
}

app.post("/api/expenses", addEntry(Expense));
app.put("/api/expenses/:id", updateEntry(Expense, ["member", "stall", "item", "amount", "at"]));
app.delete("/api/expenses/:id", deleteEntry(Expense));
app.post("/api/expenses/restore", restoreEntry(Expense));

app.post("/api/sales", addEntry(Sale));
app.put("/api/sales/:id", updateEntry(Sale, ["stall", "product", "qty", "amount", "at"]));
app.delete("/api/sales/:id", deleteEntry(Sale));
app.post("/api/sales/restore", restoreEntry(Sale));

// ---- settlements: cash paid out of the till to reimburse a member ----
app.post("/api/settlements", async (req, res) => {
  const member = String(req.body.member || "").trim();
  const amount = Number(req.body.amount);
  if (!member) return res.status(400).json({ error: "member is required" });
  if (!(amount > 0)) return res.status(400).json({ error: "amount must be greater than 0" });
  const entry = { id: newId(), member, amount, at: Date.now(), createdAt: Date.now() };
  await Settlement.create(entry);
  res.status(201).json({ entry });
});
app.delete("/api/settlements/:id", deleteEntry(Settlement));
app.post("/api/settlements/restore", restoreEntry(Settlement));

// ---- clear all expenses, sales & settlements (members kept) ----
app.post("/api/clear", async (req, res) => {
  await Promise.all([Expense.deleteMany({}), Sale.deleteMany({}), Settlement.deleteMany({})]);
  res.json({ ok: true });
});

// ---- remove a member and their expenses/settlements ----
app.post("/api/members/:name/remove", async (req, res) => {
  const name = req.params.name;
  await Promise.all([
    Expense.deleteMany({ member: name }),
    Settlement.deleteMany({ member: name }),
    Member.deleteMany({ nameLower: name.toLowerCase() }),
  ]);
  res.json({ ok: true });
});

module.exports = app;
