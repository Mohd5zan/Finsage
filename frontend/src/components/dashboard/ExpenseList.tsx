
import { useState } from "react";
import type { FormEvent } from "react";
import {
  updateExpense,
  deleteExpense,
} from "../../api/expenseApi";
import type { Expense } from "../../api/expenseApi";

interface ExpenseListProps {
  expenses: Expense[];
  onExpensesChanged: () => Promise<void> | void;
}

const categories = [
  { value: "software", label: "Software" },
  { value: "travel", label: "Travel" },
  { value: "food", label: "Food & Dining" },
  { value: "office", label: "Office Supplies" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

const categoryLabels: Record<string, string> = Object.fromEntries(
  categories.map((item) => [item.value, item.label])
);

function ExpenseList({
  expenses,
  onExpensesChanged,
}: ExpenseListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [tax, setTax] = useState("");
  const [editCategory, setEditCategory] = useState("other");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.merchant
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesCategory =
      category === "all" || expense.category === category;

    return matchesSearch && matchesCategory;
  });

  function startEditing(expense: Expense) {
    setEditingId(expense._id);
    setMerchant(expense.merchant);
    setAmount(String(expense.amountMinor / 100));
    setTax(String(expense.taxMinor / 100));
    setEditCategory(expense.category);
    setDate(new Date(expense.date).toISOString().slice(0, 10));
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    const amountNumber = Number(amount);
    const taxNumber = Number(tax);

    if (
      !merchant.trim() ||
      !Number.isFinite(amountNumber) ||
      amountNumber <= 0 ||
      !Number.isFinite(taxNumber) ||
      taxNumber < 0 ||
      !date
    ) {
      setError("Enter a merchant, valid amount, tax, and date.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateExpense(
        editingId,
        {
          merchant: merchant.trim(),
          amountMinor: Math.round(amountNumber * 100),
          taxMinor: Math.round(taxNumber * 100),
          category: editCategory,
          date,
        },
        accessToken
      );

      setEditingId(null);
      await onExpensesChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update expense."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expense: Expense) {
    const confirmed = window.confirm(
      `Delete the expense from "${expense.merchant}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setDeletingId(expense._id);
    setError("");

    try {
      await deleteExpense(expense._id, accessToken);

      if (editingId === expense._id) {
        setEditingId(null);
      }

      await onExpensesChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete expense."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by merchant..."
          aria-label="Search expenses by merchant"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter expenses by category"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All Categories</option>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500" aria-live="polite">
        Showing {filteredExpenses.length} of {expenses.length} expenses
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {filteredExpenses.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-medium text-slate-700">
            No matching expenses found.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try another merchant name or category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((expense) => (
              <div key={expense._id} className="px-6 py-5">
                {editingId === expense._id ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Merchant
                      </label>
                      <input
                        required
                        maxLength={150}
                        value={merchant}
                        onChange={(event) => setMerchant(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Amount (₹)
                        </label>
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Tax (₹)
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={tax}
                          onChange={(event) => setTax(event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Category
                        </label>
                        <select
                          value={editCategory}
                          onChange={(event) =>
                            setEditCategory(event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          {categories.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Date
                        </label>
                        <input
                          required
                          type="date"
                          value={date}
                          onChange={(event) => setDate(event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {expense.merchant}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>
                          {categoryLabels[expense.category] ??
                            expense.category}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-900">
                        ₹
                        {(expense.amountMinor / 100).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <button
                        type="button"
                        onClick={() => startEditing(expense)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense)}
                        disabled={deletingId === expense._id}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === expense._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseList;
