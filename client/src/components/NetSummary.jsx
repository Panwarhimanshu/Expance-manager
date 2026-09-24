import { inr, sum } from "../utils.js";

export default function NetSummary({ state }) {
  const spent = sum(state.expenses, (e) => e.amount);
  const earned = sum(state.sales, (s) => s.amount);
  const net = earned - spent;
  const itemsSold = sum(state.sales, (s) => s.qty);

  return (
    <section className="net" aria-live="polite">
      <div className="lbl">{net < 0 ? "Still to recover" : "Net profit so far"}</div>
      <div className="big num">{(net < 0 ? "−" : "") + inr(Math.abs(net))}</div>
      <div className="eq num">
        {inr(earned)} earned − {inr(spent)} spent, {itemsSold} items sold
      </div>
    </section>
  );
}
