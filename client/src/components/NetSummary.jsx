import { inr, sum } from "../utils.js";

export default function NetSummary({ state }) {
  const spent = sum(state.expenses, (e) => e.amount);
  const earned = sum(state.sales, (s) => s.amount);
  const settled = sum(state.settlements || [], (s) => s.amount);
  const net = earned - spent;
  const cash = earned - settled;
  const itemsSold = sum(state.sales, (s) => s.qty);

  return (
    <section className="net" aria-live="polite">
      <div className="lbl">{net < 0 ? "Still to recover" : "Net profit so far"}</div>
      <div className="big num">{(net < 0 ? "−" : "") + inr(Math.abs(net))}</div>
      <div className="eq num">
        {inr(earned)} earned − {inr(spent)} spent, {itemsSold} items sold
      </div>
      <div className="eq num" style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        {inr(cash)} cash on hand{settled > 0 ? ` · ${inr(settled)} paid back to the team` : ""}
      </div>
    </section>
  );
}
