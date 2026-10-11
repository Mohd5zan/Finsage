import { useEffect, useState } from "react";
import { getExpenses } from "../api/expenseApi";
import type { Expense } from "../api/expenseApi";
import Navbar from "../components/layout/Navbar";
import StatCard from "../components/dashboard/StatCard";
import ExpenseList from "../components/dashboard/ExpenseList";
import ReceiptUpload from "../components/dashboard/ReceiptUpload";

function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


async function loadExpenses() {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    setError("Please log in first.");
    setLoading(false);
    return;
  }

  try {
    const data = await getExpenses(accessToken);
    setExpenses(data);
    setError("");
  } catch {
    setError("Failed to load expenses.");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadExpenses();
}, []);


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p className="text-slate-600">Loading expenses...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  const totalSpending = expenses.reduce(
    (sum, expense) => sum + expense.amountMinor,
    0
  );

  const totalTax = expenses.reduce(
    (sum, expense) => sum + (expense.taxMinor ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Navbar />

        <section className="grid gap-5 md:grid-cols-3">
          <StatCard
            label="Total Spending"
            value={`₹${(totalSpending / 100).toFixed(2)}`}
          />

          <StatCard
            label="Total Tax"
            value={`₹${(totalTax / 100).toFixed(2)}`}
          />

          <StatCard
            label="Expenses"
            value={expenses.length.toString()}
          />
        </section>
        <ReceiptUpload onUploadSuccess={loadExpenses} />
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Expenses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest recorded business expenses
            </p>
          </div>

          <ExpenseList expenses={expenses} />
        </section>
      </div>
    </main>
  );
}

export default Dashboard;