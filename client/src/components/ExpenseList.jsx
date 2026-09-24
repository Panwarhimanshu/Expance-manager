import { useState } from "react";
import EditModal from "./EditModal.jsx";
import { ReceiptIcon, PencilIcon, TrashIcon } from "../icons.jsx";
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

  if (items.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="icon">
            <ReceiptIcon />
          </div>
          <div className="title">No expenses yet</div>
          <div className="sub">Tap the + button to log the first one.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <ul className="list">
        {items.map((e) => (
          <li key={e.id}>
            <span className="tile b">
              <ReceiptIcon width={18} height={18} />
            </span>
            <div>
              <div className="what">{e.item}</div>
              <div className="meta">{e.member}</div>
              <div className="meta">{fmt(when(e))}</div>
            </div>
            <span className="amt num">{inr(e.amount)}</span>
            <div className="actions-group">
              <button className="icon-action" aria-label={`Edit ${e.item}`} onClick={() => startEdit(e)}>
                <PencilIcon width={16} height={16} />
              </button>
              <button className="icon-action danger" aria-label={`Delete ${e.item}`} onClick={() => onDelete(e)}>
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          </li>
        ))}
        <li style={{ display: "block", border: 0, padding: 0 }}>
          <div className="sumline num">
            <span>Total</span>
            <span>{inr(sum(items, (e) => e.amount))}</span>
          </div>
        </li>
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
