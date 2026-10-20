
import { useEffect, useState } from "react";
import {
  getMonthlySummary,
} from "../../api/summaryApi";
import type {
  MonthlySummary as MonthlySummaryData,
} from "../../api/summaryApi";

interface MonthlySummaryProps {
  year: number;
  month: number;
  refreshKey: number;
}

function formatRupees(amountMinor: number) {
  return `₹${(amountMinor / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function MonthlySummary({ year, month,refreshKey }: MonthlySummaryProps) {
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
  `${year}-${String(month).padStart(2, "0")}`
);

const [selectedYear, setSelectedYear] = useState(year);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      setError("");

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("Please log in again to view your AI summary.");
        setLoading(false);
        return;
      }

      try {
        const result = await getMonthlySummary(
  selectedYear,
  Number(selectedMonth.split("-")[1]),
  accessToken
);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your AI summary."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [selectedYear, selectedMonth,refreshKey]);



  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            FIN SAGE AI
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Monthly Spending Summary
          </h2>
          
<div className="mt-3 flex flex-wrap items-center gap-2">
  <label
    htmlFor="summary-month"
    className="text-sm font-medium text-slate-700"
  >
    View summary:
  </label>

  <input
    id="summary-month"
    type="month"
    value={selectedMonth}
    onChange={(event) => {
      const value = event.target.value;
      if (value) {
        setSelectedMonth(value);
        setSelectedYear(Number(value.split("-")[0]));
      }
    }}
    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
  />
</div>

        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          AI insights
        </span>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500" role="status">
          Analyzing your expenses...
        </p>
      ) : error ? (
        <div className="mt-5 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => {
              setData(null);
              setError("");
              setLoading(true);
              // Changing a state value triggers a reload only when
              // year or month changes, so use the refresh button below instead.
              window.location.reload();
            }}
            className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Reload page
          </button>
        </div>
      ) : data ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total spending</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formatRupees(data.totalSpendingMinor)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total tax</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {formatRupees(data.totalTaxMinor)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Expenses recorded</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {data.expenseCount}
              </p>
            </div>
          </div>

          {data.categories.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900">
                Where your money went
              </h3>
              <div className="mt-3 space-y-3">
                {data.categories.slice(0, 3).map((item) => (
                  <div key={item.category}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span className="capitalize text-slate-700">
                        {item.category}
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatRupees(item.amountMinor)} · {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="font-semibold text-slate-900">
              What FinSage noticed
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {data.summary}
            </p>

            {data.suggestions.length > 0 && (
              <>
                <h4 className="mt-5 font-semibold text-slate-900">
                  Suggestions for you
                </h4>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {data.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default MonthlySummary;
