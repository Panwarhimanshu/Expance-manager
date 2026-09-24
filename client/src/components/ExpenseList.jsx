import { byWhen, fmt, inr, sum, when } from "../utils.js";

export default function ExpenseList({ state, onDelete }) {
  const items = byWhen(state.expenses);

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
            <button className="del" aria-label={`Delete ${e.item}`} onClick={() => onDelete(e)}>
              Delete
            </button>
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
    </div>
  );
}
