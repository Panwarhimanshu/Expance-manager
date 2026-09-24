import { useState } from "react";
import EditModal from "./EditModal.jsx";
import { byWhen, fmt, inr, readWhenValue, sum, toLocalInput, when } from "../utils.js";

export default function ExpenseList({ state, onDelete, onUpdate, toast }) {
  const items = byWhen(state.expenses);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});

  function startEdit(e) {
    setEditing(e);
    setValues({ item: e.item, amount: e.amount, when: toLocalInput(when(e)) });
  }

  async function save() {
    const amount = parseFloat(values.amount);
    if (!(amount > 0)) {
      toast("Enter an amount above ₹0.");
      return;
    }
    const item = String(values.item || "").trim();
    if (!item) {
      toast("What was it for?");
      return;
    }
    await onUpdate(editing.id, { item, amount, at: readWhenValue(values.when) });
    setEditing(null);
  }

  return (
    <div className="card">
      <h3>All expenses</h3>
      <ul className="list">
        {items.length === 0 && <li className="empty" style={{ display: "block" }}>No expenses yet. Add the first one above.</li>}
        {items.map((e) => (
          <li className="b" key={e.id}>
            <span className="dot" />
            <div>
              <div className="what">{e.item}</div>
              <div className="meta">{e.member}</div>
              <div className="meta">{fmt(when(e))}</div>
            </div>
            <span className="amt num">{inr(e.amount)}</span>
            <div className="actions-group">
              <button className="edit-btn" aria-label={`Edit ${e.item}`} onClick={() => startEdit(e)}>
                Edit
              </button>
              <button className="del" aria-label={`Delete ${e.item}`} onClick={() => onDelete(e)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {items.length > 0 && (
          <li style={{ display: "block", border: 0, padding: 0 }}>
            <div className="sumline num">
              <span>Total</span>
              <span>{inr(sum(items, (e) => e.amount))}</span>
            </div>
          </li>
        )}
      </ul>
      {editing && (
        <EditModal
          title="Edit expense"
          fields={[
            { name: "item", label: "What for" },
            { name: "amount", label: "Amount (₹)", type: "number", min: 0, step: "any" },
            { name: "when", label: "Date and time", type: "datetime-local" },
          ]}
          values={values}
          onChange={(name, v) => setValues((prev) => ({ ...prev, [name]: v }))}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
