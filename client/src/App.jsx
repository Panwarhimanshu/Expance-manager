import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import { useToast } from "./useToast.js";
import { useConfirm } from "./useConfirm.js";
import { downloadSheet } from "./downloadSheet.js";
import { memberNames } from "./utils.js";
import { CartIcon, DownloadIcon, PlusIcon, ReceiptIcon, UsersIcon } from "./icons.jsx";
import NetSummary from "./components/NetSummary.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseList from "./components/ExpenseList.jsx";
import SaleForm from "./components/SaleForm.jsx";
import SaleList from "./components/SaleList.jsx";
import TeamTab from "./components/TeamTab.jsx";
import AddMemberForm from "./components/AddMemberForm.jsx";
import Sheet from "./components/Sheet.jsx";
import Toast from "./components/Toast.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";

const EMPTY = { members: [], expenses: [], sales: [], settlements: [] };

const TABS = [
  { key: "exp", label: "Expenses", icon: ReceiptIcon, heading: "Expenses", addLabel: "Add an expense" },
  { key: "sale", label: "Sales", icon: CartIcon, heading: "Sales", addLabel: "Record a sale" },
  { key: "team", label: "Team", icon: UsersIcon, heading: "Team", addLabel: "Add a team member" },
];

export default function App() {
  const [state, setState] = useState(EMPTY);
  const [tab, setTab] = useState("exp");
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
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

  const current = TABS.find((t) => t.key === tab);
  const counts = {
    exp: state.expenses.length,
    sale: state.sales.length,
    team: memberNames(state).length,
  };
  const countLabel = { exp: "entries", sale: "entries", team: "members" }[tab];

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Stall ledger</h1>
          <p className="sub">Navrachana stall day, Byte Club</p>
        </div>
        <button className="icon-btn" type="button" aria-label="Download sheet (Excel)" onClick={() => downloadSheet(state)}>
          <DownloadIcon width={19} height={19} />
        </button>
      </header>

      <NetSummary state={state} />

      <div className="section-head">
        <h2>{current.heading}</h2>
        <span className="count num">
          {counts[tab]} {countLabel}
        </span>
      </div>

      {tab === "exp" && <ExpenseList state={state} onDelete={deleteExpense} onUpdate={updateExpense} toast={showToast} />}
      {tab === "sale" && <SaleList state={state} onDelete={deleteSale} onUpdate={updateSale} toast={showToast} />}
      {tab === "team" && (
        <TeamTab
          state={state}
          onRemoveMember={removeMember}
          onDeleteExpense={deleteExpense}
          onSettle={settleMember}
          onDeleteSettlement={deleteSettlement}
          onClearAll={clearAll}
          toast={showToast}
          ask={ask}
        />
      )}

      <button className="fab" type="button" aria-label={current.addLabel} onClick={() => setShowAdd(true)}>
        <PlusIcon width={26} height={26} />
      </button>

      <nav className="bottom-nav" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
            <Icon className="icon" width={22} height={22} />
            {label}
          </button>
        ))}
      </nav>

      {showAdd && (
        <Sheet title={current.addLabel} onClose={() => setShowAdd(false)}>
          {tab === "exp" && (
            <ExpenseForm state={state} onAddMember={addMember} onAddExpense={addExpense} toast={showToast} onDone={() => setShowAdd(false)} />
          )}
          {tab === "sale" && <SaleForm onAddSale={addSale} toast={showToast} onDone={() => setShowAdd(false)} />}
          {tab === "team" && <AddMemberForm onAddMember={addMember} onDone={() => setShowAdd(false)} />}
        </Sheet>
      )}

      <Toast toast={toast} />
      <ConfirmModal confirm={confirm} />
    </div>
  );
}
