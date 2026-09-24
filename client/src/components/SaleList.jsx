import { useState } from "react";
import EditModal from "./EditModal.jsx";
import { CartIcon, PencilIcon, TrashIcon } from "../icons.jsx";
import { byWhen, fmt, inr, readWhenValue, sum, toLocalInput, when } from "../utils.js";

export default function SaleList({ state, onDelete, onUpdate, toast }) {
  const items = byWhen(state.sales);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});

  function startEdit(s) {
    setEditing(s);
    setValues({ product: s.product, qty: s.qty, amount: s.amount, when: toLocalInput(when(s)) });
  }

  async function save() {
    const qty = parseInt(values.qty, 10);
    const amount = parseFloat(values.amount);
    if (!(qty > 0)) {
      toast("Quantity must be at least 1.");
      return;
    }
    if (!(amount >= 0)) {
      toast("Enter the money received.");
      return;
    }
    const product = String(values.product || "").trim();
    if (!product) {
      toast("What was sold?");
      return;
    }
    await onUpdate(editing.id, { product, qty, amount, at: readWhenValue(values.when) });
    setEditing(null);
  }

  if (items.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="icon">
            <CartIcon />
          </div>
          <div className="title">No sales yet</div>
          <div className="sub">Tap the + button when the first customer pays.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <ul className="list">
        {items.map((s) => (
          <li key={s.id}>
            <span className="tile b">
              <CartIcon width={18} height={18} />
            </span>
            <div>
              <div className="what">
                {s.product} × {Number(s.qty) || 0}
              </div>
              <div className="meta">{fmt(when(s))}</div>
            </div>
            <span className="amt num">{inr(s.amount)}</span>
            <div className="actions-group">
              <button className="icon-action" aria-label={`Edit ${s.product}`} onClick={() => startEdit(s)}>
                <PencilIcon width={16} height={16} />
              </button>
              <button className="icon-action danger" aria-label={`Delete ${s.product}`} onClick={() => onDelete(s)}>
                <TrashIcon width={16} height={16} />
              </button>
            </div>
          </li>
        ))}
        <li style={{ display: "block", border: 0, padding: 0 }}>
          <div className="sumline num">
            <span>{sum(items, (s) => s.qty)} items</span>
            <span>{inr(sum(items, (s) => s.amount))}</span>
          </div>
        </li>
      </ul>
      {editing && (
        <EditModal
          title="Edit sale"
          fields={[
            { name: "product", label: "Product" },
            { name: "qty", label: "Quantity sold", type: "number", min: 1, step: 1 },
            { name: "amount", label: "Money received (₹)", type: "number", min: 0, step: "any" },
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
