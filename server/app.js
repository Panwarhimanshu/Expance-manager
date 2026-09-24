const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { Member, Expense, Sale } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

const newId = () => crypto.randomUUID();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const strip = (doc) => {
  const { _id, __v, ...rest } = doc;
  return rest;
};

// ---- state ----
app.get("/api/state", async (req, res) => {
  const [members, expenses, sales] = await Promise.all([
    Member.find().sort({ createdAt: 1 }).lean(),
    Expense.find().sort({ createdAt: 1 }).lean(),
    Sale.find().sort({ createdAt: 1 }).lean(),
  ]);
  res.json({
    members: members.map(strip),
    expenses: expenses.map(strip),
    sales: sales.map(strip),
  });
});

// ---- members ----
app.post("/api/members", async (req, res) => {
  const name = String(req.body.name || "").trim().replace(/\s+/g, " ");
  if (!name) return res.status(400).json({ error: "Name is required." });

  const existing = await Member.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, "i") }).lean();
  if (existing) return res.json({ member: strip(existing) });

  const member = { id: newId(), name, createdAt: Date.now() };
  await Member.create(member);
  res.status(201).json({ member });
});

app.delete("/api/members/:id", async (req, res) => {
  await Member.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

// ---- generic helpers for expenses/sales ----
function addEntry(Model) {
  return async (req, res) => {
    const entry = { ...req.body, id: newId(), createdAt: Date.now() };
    await Model.create(entry);
    res.status(201).json({ entry });
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
app.delete("/api/expenses/:id", deleteEntry(Expense));
app.post("/api/expenses/restore", restoreEntry(Expense));

app.post("/api/sales", addEntry(Sale));
app.delete("/api/sales/:id", deleteEntry(Sale));
app.post("/api/sales/restore", restoreEntry(Sale));

// ---- clear all expenses & sales (members kept) ----
app.post("/api/clear", async (req, res) => {
  await Promise.all([Expense.deleteMany({}), Sale.deleteMany({})]);
  res.json({ ok: true });
});

// ---- remove a member and their expenses ----
app.post("/api/members/:name/remove", async (req, res) => {
  const name = req.params.name;
  await Promise.all([Expense.deleteMany({ member: name }), Member.deleteMany({ name })]);
  res.json({ ok: true });
});

module.exports = app;
