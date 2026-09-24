const BASE = "/api";

async function req(path, options) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
}

export const api = {
  getState: () => req("/state"),
  addMember: (name) => req("/members", { method: "POST", body: JSON.stringify({ name }) }),
  removeMember: (name) => req(`/members/${encodeURIComponent(name)}/remove`, { method: "POST" }),
  addExpense: (data) => req("/expenses", { method: "POST", body: JSON.stringify(data) }),
  deleteExpense: (id) => req(`/expenses/${id}`, { method: "DELETE" }),
  restoreExpense: (data) => req("/expenses/restore", { method: "POST", body: JSON.stringify(data) }),
  addSale: (data) => req("/sales", { method: "POST", body: JSON.stringify(data) }),
  deleteSale: (id) => req(`/sales/${id}`, { method: "DELETE" }),
  restoreSale: (data) => req("/sales/restore", { method: "POST", body: JSON.stringify(data) }),
  clearAll: () => req("/clear", { method: "POST" }),
};
