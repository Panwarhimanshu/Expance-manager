export const STALL = "bike";

export const inr = (n) => "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN");

export const when = (x) => x.at || x.createdAt || 0;

export const fmt = (ts) =>
  ts
    ? new Date(ts).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

export const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export const readWhenValue = (v) => {
  const t = v ? new Date(v).getTime() : NaN;
  return Number.isNaN(t) ? Date.now() : t;
};

export const toLocalInput = (ts) => {
  const d = new Date(ts || Date.now());
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export const byWhen = (a) => [...a].sort((x, y) => when(y) - when(x));

export const sum = (a, f) => a.reduce((t, x) => t + (Number(f(x)) || 0), 0);

export function memberNames(state) {
  const set = new Set(state.members.map((m) => m.name));
  state.expenses.forEach((e) => e.member && set.add(e.member));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function memberTotals(state, name) {
  const spent = sum(state.expenses.filter((e) => e.member === name), (e) => e.amount);
  const settled = sum((state.settlements || []).filter((s) => s.member === name), (s) => s.amount);
  return { spent, settled, owed: spent - settled };
}
