const mongoose = require("mongoose");
const { Schema } = mongoose;

const MemberSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
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

module.exports = {
  Member: mongoose.model("Member", MemberSchema),
  Expense: mongoose.model("Expense", ExpenseSchema),
  Sale: mongoose.model("Sale", SaleSchema),
};
