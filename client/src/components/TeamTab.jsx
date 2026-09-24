import { useState } from "react";
import { byWhen, fmt, inr, memberNames, sum, when } from "../utils.js";

export default function TeamTab({ state, onAddMember, onRemoveMember, onDeleteExpense, onClearAll, toast, ask }) {
  const [name, setName] = useState("");
  const [openSet, setOpenSet] = useState(() => new Set());
  const names = memberNames(state);
  const total = sum(state.expenses, (e) => e.amount);

  async function handleAdd() {
    const n = name.trim();
    if (await onAddMember(n)) setName("");
  }

  async function handleRemove(n) {
    const theirs = state.expenses.filter((e) => e.member === n);
    const ok = await ask(
      `Remove ${n}?`,
      theirs.length
        ? `This also deletes their ${theirs.length} expense${theirs.length > 1 ? "s" : ""} (${inr(sum(theirs, (x) => x.amount))}).`
        : "They have no expenses logged.",
      "Remove"
    );
    if (!ok) return;
    await onRemoveMember(n);
    toast(`Removed ${n}`);
  }

  async function handleClearAll() {
    const n = state.expenses.length + state.sales.length;
    if (!n) {
      toast("Nothing to delete.");
      return;
    }
    const ok = await ask(
      "Delete everything?",
      `All ${n} expenses and sales will be deleted for the whole team. Names stay. Download the sheet first if you need a copy.`,
      "Delete all"
    );
    if (!ok) return;
    await onClearAll();
    toast("All entries deleted");
  }

  function toggle(n) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <div className="card">
      <h3>Team members</h3>
      <div className="field">
        <label htmlFor="teamName">Add a name</label>
        <div className="inline">
          <input
            id="teamName"
            placeholder="e.g. Aarav"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <button type="button" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
      <ul className="list">
        {names.length === 0 && (
          <li className="empty" style={{ display: "block" }}>
            Add everyone on the team so they can log what they spent.
          </li>
        )}
        {names.map((n) => {
          const mine = byWhen(state.expenses.filter((e) => e.member === n));
          const t = sum(mine, (e) => e.amount);
          const isOpen = openSet.has(n);
          return (
            <li style={{ display: "block", border: 0, padding: 0 }} key={n}>
              <details className="person" open={isOpen}>
                <summary onClick={(e) => { e.preventDefault(); toggle(n); }}>
                  <div>
                    <div className="what">{n}</div>
                    <div className="meta num">{total ? `${Math.round((t / total) * 100)}% of total` : "No spend yet"}</div>
                    <div className="bar">
                      <span style={{ width: `${total ? (t / total) * 100 : 0}%`, background: "var(--bike)" }} />
                    </div>
                  </div>
                  <span className="amt num">{inr(t)}</span>
                  <span className="chev" aria-hidden="true">
                    ›
                  </span>
                </summary>
                <div className="items">
                  {mine.length === 0 && <div className="meta">Nothing spent yet.</div>}
                  {mine.map((e) => (
                    <div className="it" key={e.id}>
                      <div>
                        <strong>{e.item}</strong>
                        <div className="meta">{fmt(when(e))}</div>
                      </div>
                      <span className="num">{inr(e.amount)}</span>
                      <button className="del" aria-label={`Delete ${e.item}`} onClick={() => onDeleteExpense(e)}>
                        Delete
                      </button>
                    </div>
                  ))}
                  <button className="del" style={{ marginTop: 10 }} onClick={() => handleRemove(n)}>
                    Remove {n} from team
                  </button>
                </div>
              </details>
            </li>
          );
        })}
        {names.length > 0 && (
          <li style={{ display: "block", border: 0, padding: 0 }}>
            <div className="sumline num">
              <span>
                {names.length} members, {inr(total)} invested
              </span>
              <span></span>
            </div>
          </li>
        )}
      </ul>
      <button className="danger" type="button" onClick={handleClearAll}>
        Delete all expenses and sales
      </button>
    </div>
  );
}
