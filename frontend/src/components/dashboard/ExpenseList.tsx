import type { Expense } from "../../api/expenseApi";

interface ExpenseListProps {
  expenses: Expense[];
}

function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
        No expenses yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
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
    </div>
  );
}

export default ExpenseList;
