import { useState } from "react";
import { nowLocal, readWhenValue, STALL } from "../utils.js";

export default function SaleForm({ onAddSale, toast }) {
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState("1");
  const [amount, setAmount] = useState("");
  const [when, setWhen] = useState(nowLocal());

  async function handleSubmit(e) {
    e.preventDefault();
    const q = parseInt(qty, 10);
    const amt = parseFloat(amount);
    if (!(q > 0)) {
      toast("Quantity must be at least 1.");
      return;
    }
    if (!(amt >= 0)) {
      toast("Enter the money received.");
      return;
    }
    const ok = await onAddSale({ stall: STALL, product: product.trim(), qty: q, amount: amt, at: readWhenValue(when) });
    if (ok) {
      setQty("1");
      setAmount("");
      setWhen(nowLocal());
      toast(`Recorded ${q} × ${product}`);
    }
  }

  return (
    <form className="card" autoComplete="off" onSubmit={handleSubmit}>
      <h3>Record a sale</h3>
      <div className="field">
        <label htmlFor="saleItem">Product</label>
        <input id="saleItem" placeholder="Donut, keychain…" required value={product} onChange={(e) => setProduct(e.target.value)} />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="saleQty">Quantity sold</label>
          <input id="saleQty" type="number" inputMode="numeric" min="1" step="1" required value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="saleAmt">Money received (₹)</label>
          <input
            id="saleAmt"
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
        <label htmlFor="saleWhen">Date and time</label>
        <input id="saleWhen" type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} />
      </div>
      <button className="primary" type="submit">
        Record sale
      </button>
    </form>
  );
}
