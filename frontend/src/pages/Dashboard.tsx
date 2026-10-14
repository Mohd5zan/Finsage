import { useEffect, useState } from "react";
import { getExpenses } from "../api/expenseApi";
import type { Expense } from "../api/expenseApi";
import Navbar from "../components/layout/Navbar";
import StatCard from "../components/dashboard/StatCard";
import ExpenseList from "../components/dashboard/ExpenseList";
import ReceiptUpload from "../components/dashboard/ReceiptUpload";
import CategoryBreakdown from "../components/dashboard/CategoryBreakdown";
import MonthlySpending from "../components/dashboard/MonthlySpending";



type DateRange = "this-month" | "last-3-months" | "all-time";

function Dashboard() {
  
const [dateRange, setDateRange] = useState<DateRange>("this-month");

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

  
const now = new Date();

const startDate = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
);

if (dateRange === "last-3-months") {
  startDate.setMonth(startDate.getMonth() - 2);
}

const filteredExpenses = expenses.filter((expense) => {
  if (dateRange === "all-time") {
    return true;
  }

  const expenseDate = new Date(expense.date);
  const expenseMonth = new Date(
    expenseDate.getFullYear(),
    expenseDate.getMonth(),
    1
  );

  return expenseMonth >= startDate && expenseMonth <= new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );
});

  
const totalSpending = filteredExpenses.reduce(
  (sum, expense) => sum + expense.amountMinor,
  0
);


  
const totalTax = filteredExpenses.reduce(
  (sum, expense) => sum + (expense.taxMinor ?? 0),
  0
);


const categoryTotals = filteredExpenses.reduce<Record<string, number>>(
  (totals, expense) => {
    totals[expense.category] =
      (totals[expense.category] ?? 0) + expense.amountMinor;

    return totals;
  },
  {}
);

const categoryBreakdown = Object.entries(categoryTotals).sort(
  ([, amountA], [, amountB]) => amountB - amountA
);

const monthlyTotals = filteredExpenses.reduce<Record<string, number>>(
  (totals, expense) => {
    const date = new Date(expense.date);

    const monthKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
    ].join("-");

    totals[monthKey] =
      (totals[monthKey] ?? 0) + expense.amountMinor;

    return totals;
  },
  {}
);

const monthlyBreakdown = Object.entries(monthlyTotals)
  .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
  .slice(-6);



  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        
<Navbar />

<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-xl font-semibold text-slate-900">
      Financial Overview
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      Review your spending for the selected period.
    </p>
  </div>

  <label className="flex items-center gap-3">
    <span className="text-sm font-medium text-slate-700">
      Date range
    </span>

    <select
      value={dateRange}
      onChange={(event) =>
        setDateRange(event.target.value as DateRange)
      }
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="this-month">This Month</option>
      <option value="last-3-months">Last 3 Months</option>
      <option value="all-time">All Time</option>
    </select>
  </label>
</div>

<section className="mt-6 grid gap-5 md:grid-cols-3">

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
            value={filteredExpenses.length.toString()}
          />
        </section>
        <ReceiptUpload onUploadSuccess={loadExpenses} />
       
<section className="mt-10">
  <CategoryBreakdown
    categories={categoryBreakdown}
    totalSpending={totalSpending}
  />
</section>

<MonthlySpending months={monthlyBreakdown} />

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Expenses
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest recorded business expenses
            </p>
          </div>

          <ExpenseList expenses={filteredExpenses} />
        </section>
      </div>
    </main>
  );
}

export default Dashboard;