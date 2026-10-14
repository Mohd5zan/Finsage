interface CategoryBreakdownProps {
  categories: [string, number][];
  totalSpending: number;
}

const categoryLabels: Record<string, string> = {
  software: "Software",
  travel: "Travel",
  food: "Food & Dining",
  office: "Office Supplies",
  utilities: "Utilities",
  other: "Other",
};

function CategoryBreakdown({
  categories,
  totalSpending,
}: CategoryBreakdownProps) {
  if (categories.length === 0 || totalSpending === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm ring-1 ring-slate-200">
        No spending data available yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">
        Spending by Category
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        See where your money goes.
      </p>

      <div className="mt-6 space-y-5">
        {categories.map(([category, amount]) => {
          const percentage = (amount / totalSpending) * 100;

          return (
            <div key={category}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-700">
                  {categoryLabels[category] ?? category}
                </span>

                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    ₹{(amount / 100).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>

                  <span className="ml-2 text-xs text-slate-500">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryBreakdown;