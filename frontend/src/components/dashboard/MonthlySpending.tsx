
interface MonthlySpendingProps {
  months: [string, number][];
}

function MonthlySpending({ months }: MonthlySpendingProps) {
  if (months.length === 0) {
    return (
      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Monthly Spending
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          No monthly spending data available yet.
        </p>
      </section>
    );
  }

  const maxAmount = Math.max(...months.map(([, amount]) => amount));

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">
        Monthly Spending
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Track how your spending changes over time.
      </p>

      <div className="mt-6 space-y-5">
        {months.map(([month, amount]) => {
          const percentage =
            maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

          const [year, monthNumber] = month.split("-");
          const monthLabel = new Date(
            Number(year),
            Number(monthNumber) - 1
          ).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          });

          return (
            <div key={month}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-700">
                  {monthLabel}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  ₹{(amount / 100).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  );
}

export default MonthlySpending;
