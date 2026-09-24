import { useEffect, useRef, useState } from "react";
import { memberNames, nowLocal, readWhenValue, STALL, inr } from "../utils.js";

export default function ExpenseForm({ state, onAddMember, onAddExpense, toast, onDone }) {
  const names = memberNames(state);
  const [who, setWho] = useState("");
  const [newName, setNewName] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [when, setWhen] = useState(nowLocal());
  const newNameRef = useRef(null);

  useEffect(() => {
    if (who && who !== "__new" && !names.includes(who)) setWho("");
  }, [names]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNewName = who === "__new";

  async function handleAddMember() {
    const n = newName.trim();
    if (!n) {
      toast("Type a name first.");
      return;
    }
    const ok = await onAddMember(n);
    if (ok) {
      setNewName("");
      setWho(n.replace(/\s+/g, " "));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!who || who === "__new") {
      toast("Choose who paid, or add your name.");
      return;
    }
    const amt = parseFloat(amount);
    if (!(amt > 0)) {
      toast("Enter an amount above ₹0.");
      return;
    }
    const ok = await onAddExpense({ member: who, stall: STALL, item: item.trim(), amount: amt, at: readWhenValue(when) });
    if (ok) {
      setItem("");
      setAmount("");
      setWhen(nowLocal());
      toast(`Added ${inr(amt)}`);
      onDone?.();
    }
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="expWho">Who paid</label>
        <select
          id="expWho"
          required
          value={who}
          onChange={(e) => {
            setWho(e.target.value);
            if (e.target.value === "__new") setTimeout(() => newNameRef.current?.focus(), 0);
          }}
        >
          <option value="" disabled>
            Choose a name
          </option>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
          <option value="__new">+ Add my name</option>
        </select>
      </div>
      {showNewName && (
        <div className="field">
          <label htmlFor="newName">Your name</label>
          <div className="inline">
            <input
              id="newName"
              ref={newNameRef}
              placeholder="e.g. Riya"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
            />
            <button type="button" onClick={handleAddMember}>
              Add
            </button>
          </div>
        </div>
      )}
      <div className="row">
        <div className="field">
          <label htmlFor="expItem">What for</label>
          <input id="expItem" placeholder="Sugar, banner, cups…" required value={item} onChange={(e) => setItem(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="expAmt">Amount (₹)</label>
          <input
            id="expAmt"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="expWhen">Date and time</label>
        <input id="expWhen" type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} />
      </div>
      <button className="primary" type="submit">
        Add expense
      </button>
    </form>
  );
}
