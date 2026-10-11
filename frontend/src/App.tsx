import { useEffect, useState } from "react";
import { getExpenses } from "./api/expenseApi";
import type { Expense } from "./api/expenseApi";
import Navbar from "./components/layout/Navbar";
import StatCard from "./components/dashboard/StatCard";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    getExpenses(accessToken)
      .then((data) => {
        setExpenses(data);
      })
      .catch(() => {
        setError("Failed to load expenses.");
      })
      .finally(() => {
        setLoading(false);
      });
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
        {/* Header */}
        <Navbar />
       
        {/* Summary cards */}
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

        {/* Recent expenses */}
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Expenses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest recorded business expenses
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No expenses yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between px-6 py-5"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {expense.merchant}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
  <span className="capitalize">{expense.category}</span>
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

                    <p className="font-semibold text-slate-900">
                      ₹{(expense.amountMinor / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;