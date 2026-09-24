import { byWhen, fmt, inr, sum, when } from "../utils.js";

export default function SaleList({ state, onDelete }) {
  const items = byWhen(state.sales);

  return (
    <div className="card">
      <h3>All sales</h3>
      <ul className="list">
        {items.length === 0 && <li className="empty" style={{ display: "block" }}>No sales yet. Record one when the first customer pays.</li>}
        {items.map((s) => (
          <li className="b" key={s.id}>
            <span className="dot" />
            <div>
              <div className="what">
                {s.product} × {Number(s.qty) || 0}
              </div>
              <div className="meta">{fmt(when(s))}</div>
            </div>
            <span className="amt num">{inr(s.amount)}</span>
            <button className="del" aria-label={`Delete ${s.product}`} onClick={() => onDelete(s)}>
              Delete
            </button>
          </li>
        ))}
        {items.length > 0 && (
          <li style={{ display: "block", border: 0, padding: 0 }}>
            <div className="sumline num">
              <span>{sum(items, (s) => s.qty)} items</span>
              <span>{inr(sum(items, (s) => s.amount))}</span>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
