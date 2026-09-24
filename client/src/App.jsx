import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import { useToast } from "./useToast.js";
import { useConfirm } from "./useConfirm.js";
import { downloadSheet } from "./downloadSheet.js";
import NetSummary from "./components/NetSummary.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseList from "./components/ExpenseList.jsx";
import SaleForm from "./components/SaleForm.jsx";
import SaleList from "./components/SaleList.jsx";
import TeamTab from "./components/TeamTab.jsx";
import Toast from "./components/Toast.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";

const EMPTY = { members: [], expenses: [], sales: [], settlements: [] };

export default function App() {
  const [state, setState] = useState(EMPTY);
  const [tab, setTab] = useState("exp");
  const [loaded, setLoaded] = useState(false);
  const { toast, show: showToast } = useToast();
  const { confirm, ask } = useConfirm();

  const refresh = useCallback(async () => {
    try {
      const data = await api.getState();
      setState(data);
    } catch {
      showToast("Couldn't reach the server. Is it running?");
    } finally {
      setLoaded(true);
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addMember(name) {
    name = name.trim().replace(/\s+/g, " ");
    if (!name) {
      showToast("Type a name first.");
      return false;
    }
    try {
      await api.addMember(name);
      await refresh();
      showToast(`Added ${name}`);
      return true;
    } catch {
      showToast("Couldn't save. Check your connection and try again.");
      return false;
    }
  }

  async function removeMember(name) {
    try {
      await api.removeMember(name);
      await refresh();
    } catch {
      showToast("Couldn't remove. Try again.");
    }
  }

  async function addExpense(data) {
    try {
      await api.addExpense(data);
      await refresh();
      return true;
    } catch {
      showToast("Couldn't save. Check your connection and try again.");
      return false;
    }
  }

  async function updateExpense(id, updates) {
    try {
      await api.updateExpense(id, updates);
      await refresh();
      showToast("Expense updated");
      return true;
    } catch {
      showToast("Couldn't save changes. Try again.");
      return false;
    }
  }

  async function deleteExpense(entry) {
    const { id, ...data } = entry;
    try {
      await api.deleteExpense(id);
      await refresh();
      showToast(`Deleted ${entry.item || "entry"}`, {
        label: "Undo",
        fn: async () => {
          await api.restoreExpense({ id, ...data });
          await refresh();
        },
      });
    } catch {
      showToast("Couldn't delete. Try again.");
    }
  }

  async function addSale(data) {
    try {
      await api.addSale(data);
      await refresh();
      return true;
    } catch {
      showToast("Couldn't save. Check your connection and try again.");
      return false;
    }
  }

  async function updateSale(id, updates) {
    try {
      await api.updateSale(id, updates);
      await refresh();
      showToast("Sale updated");
      return true;
    } catch {
      showToast("Couldn't save changes. Try again.");
      return false;
    }
  }

  async function deleteSale(entry) {
    const { id, ...data } = entry;
    try {
      await api.deleteSale(id);
      await refresh();
      showToast(`Deleted ${entry.product} sale`, {
        label: "Undo",
        fn: async () => {
          await api.restoreSale({ id, ...data });
          await refresh();
        },
      });
    } catch {
      showToast("Couldn't delete. Try again.");
    }
  }

  async function settleMember(member, amount) {
    try {
      await api.addSettlement({ member, amount });
      await refresh();
    } catch {
      showToast("Couldn't record the settlement. Try again.");
    }
  }

  async function deleteSettlement(entry) {
    const { id, ...data } = entry;
    try {
      await api.deleteSettlement(id);
      await refresh();
      showToast("Settlement undone", {
        label: "Redo",
        fn: async () => {
          await api.restoreSettlement({ id, ...data });
          await refresh();
        },
      });
    } catch {
      showToast("Couldn't undo. Try again.");
    }
  }

  async function clearAll() {
    try {
      await api.clearAll();
      await refresh();
    } catch {
      showToast("Couldn't delete. Try again.");
    }
  }

  if (!loaded) return null;

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Stall ledger</h1>
          <p className="sub">Navrachana stall day, Byte Club</p>
        </div>
      </header>

      <NetSummary state={state} />

      <nav className="tabs" role="tablist">
        {[
          ["exp", "Expenses"],
          ["sale", "Sales"],
          ["team", "Team"],
        ].map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      <button className="dl" type="button" onClick={() => downloadSheet(state)}>
        Download sheet (Excel)
      </button>

      {tab === "exp" && (
        <section>
          <ExpenseForm state={state} onAddMember={addMember} onAddExpense={addExpense} toast={showToast} />
          <ExpenseList state={state} onDelete={deleteExpense} onUpdate={updateExpense} toast={showToast} />
        </section>
      )}

      {tab === "sale" && (
        <section>
          <SaleForm onAddSale={addSale} toast={showToast} />
          <SaleList state={state} onDelete={deleteSale} onUpdate={updateSale} toast={showToast} />
        </section>
      )}

      {tab === "team" && (
        <section>
          <TeamTab
            state={state}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onDeleteExpense={deleteExpense}
            onSettle={settleMember}
            onDeleteSettlement={deleteSettlement}
            onClearAll={clearAll}
            toast={showToast}
            ask={ask}
          />
        </section>
      )}

      <Toast toast={toast} />
      <ConfirmModal confirm={confirm} />
    </div>
  );
}
