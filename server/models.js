const mongoose = require("mongoose");
const { Schema } = mongoose;

const MemberSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameLower: { type: String, required: true, unique: true },
    createdAt: { type: Number, required: true },
  },
  { versionKey: false }
);

const ExpenseSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    member: String,
    stall: String,
    item: String,
    amount: Number,
    at: Number,
    createdAt: Number,
  },
  { versionKey: false }
);

const SaleSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    stall: String,
    product: String,
    qty: Number,
    amount: Number,
    at: Number,
    createdAt: Number,
  },
  { versionKey: false }
);

// A settlement is cash paid out of the till to reimburse a member for what
// they spent. Kept as its own ledger (rather than a running total on Member)
// so it has an audit trail and can be undone like expenses/sales.
const SettlementSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    member: String,
    amount: Number,
    at: Number,
    createdAt: Number,
  },
  { versionKey: false }
);

module.exports = {
  Member: mongoose.model("Member", MemberSchema),
  Expense: mongoose.model("Expense", ExpenseSchema),
  Sale: mongoose.model("Sale", SaleSchema),
  Settlement: mongoose.model("Settlement", SettlementSchema),
};
