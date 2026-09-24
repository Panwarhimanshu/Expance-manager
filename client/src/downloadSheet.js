import * as XLSX from "xlsx";
import { byWhen, memberNames, memberTotals, sum, when } from "./utils.js";

export function downloadSheet(state) {
  const D = (ts) => (ts ? new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");
  const T = (ts) => (ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "");

  const exp = byWhen(state.expenses)
    .reverse()
    .map((e) => ({
      Date: D(when(e)),
      Time: T(when(e)),
      Name: e.member,
      Item: e.item,
      "Amount (₹)": Number(e.amount) || 0,
    }));

  const sales = byWhen(state.sales)
    .reverse()
    .map((x) => ({
      Date: D(when(x)),
      Time: T(when(x)),
      Product: x.product,
      Quantity: Number(x.qty) || 0,
      "Amount (₹)": Number(x.amount) || 0,
    }));

  const settlements = byWhen(state.settlements || [])
    .reverse()
    .map((s) => ({
      Date: D(when(s)),
      Time: T(when(s)),
      Name: s.member,
      "Amount paid back (₹)": Number(s.amount) || 0,
    }));

  const team = memberNames(state).map((n) => {
    const { spent, settled, owed } = memberTotals(state, n);
    return { Name: n, "Spent (₹)": spent, "Paid back (₹)": settled, "Still owed (₹)": owed };
  });

  const spent = sum(state.expenses, (e) => e.amount);
  const earned = sum(state.sales, (s) => s.amount);
  const settled = sum(state.settlements || [], (s) => s.amount);
  const qty = sum(state.sales, (s) => s.qty);
  const summary = [
    { "": "Spent (₹)", Value: spent },
    { "": "Earned (₹)", Value: earned },
    { "": "Items sold", Value: qty },
    { "": "Profit / loss (₹)", Value: earned - spent },
    { "": "Paid back to team (₹)", Value: settled },
    { "": "Cash on hand (₹)", Value: earned - settled },
  ];

  const wb = XLSX.utils.book_new();
  const add = (rows, name, w) => {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: "No entries yet" }]);
    ws["!cols"] = w.map((x) => ({ wch: x }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };
  add(summary, "Summary", [20, 12]);
  add(exp, "Expenses", [14, 10, 22, 28, 12]);
  add(sales, "Sales", [14, 10, 22, 10, 12]);
  add(settlements, "Settlements", [14, 10, 22, 20]);
  add(team, "Team", [16, 12, 14, 14]);

  XLSX.writeFile(wb, `stall-ledger-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
