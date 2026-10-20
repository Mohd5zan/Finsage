
import { useState } from "react";
import {
  scanReceipt,
  saveScannedExpense,
  type ScannedReceipt,
} from "../../api/receiptApi";

interface ReceiptUploadProps {
  onUploadSuccess: () => void;
}

const categories: ScannedReceipt["category"][] = [
  "software",
  "travel",
  "food",
  "office",
  "utilities",
  "other",
];

function ReceiptUpload({ onUploadSuccess }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<ScannedReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleScan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Please select a receipt image.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("Please log in first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setReceipt(null);

    try {
      const scannedReceipt = await scanReceipt(file, accessToken);
      setReceipt(scannedReceipt);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to scan receipt."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateReceipt<K extends keyof ScannedReceipt>(
    field: K,
    value: ScannedReceipt[K]
  ) {
    setReceipt((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  async function handleConfirm() {
    if (!receipt) return;

    const amount = Number(receipt.amountMinor);
    const tax = Number(receipt.taxMinor);

    if (!receipt.merchant.trim()) {
      setError("Please enter the merchant name.");
      return;
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    if (!Number.isSafeInteger(tax) || tax < 0) {
      setError("Enter a valid tax amount.");
      return;
    }

    if (
      !receipt.date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(receipt.date) ||
      Number.isNaN(Date.parse(`${receipt.date}T12:00:00`))
    ) {
      setError("Please enter a valid receipt date.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("Please log in first.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveScannedExpense(
        {
          ...receipt,
          merchant: receipt.merchant.trim(),
          amountMinor: amount,
          taxMinor: tax,
        },
        accessToken
      );

      setReceipt(null);
      setFile(null);
      setSuccess("Expense saved successfully.");
      onUploadSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save expense."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold text-slate-900">
        Scan a receipt
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Upload a receipt, review the extracted details, and confirm before saving.
      </p>

      <form onSubmit={handleScan} className="mt-5 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setReceipt(null);
            setError("");
            setSuccess("");
          }}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />

        {file && (
          <p className="text-sm text-slate-500">
            Selected: {file.name}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || saving || !file}
          className="rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Scanning receipt..." : "Scan receipt"}
        </button>
      </form>

      {receipt && (
        <div className="mt-6 space-y-4 rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Review receipt details
          </h3>
          <p className="text-sm text-slate-500">
            Check the extracted values before saving. Amounts are entered in rupees.
          </p>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Merchant
              <input
                type="text"
                value={receipt.merchant}
                onChange={(event) =>
                  updateReceipt("merchant", event.target.value)
                }
                maxLength={150}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Total amount (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={(receipt.amountMinor / 100).toFixed(2)}
                onChange={(event) =>
                  updateReceipt(
                    "amountMinor",
                    Math.round(Number(event.target.value) * 100)
                  )
                }
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Tax (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={(receipt.taxMinor / 100).toFixed(2)}
                onChange={(event) =>
                  updateReceipt(
                    "taxMinor",
                    Math.round(Number(event.target.value) * 100)
                  )
                }
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Date
              <input
                type="date"
                value={receipt.date}
                onChange={(event) =>
                  updateReceipt("date", event.target.value)
                }
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                value={receipt.category}
                onChange={(event) =>
                  updateReceipt(
                    "category",
                    event.target.value as ScannedReceipt["category"]
                  )
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || loading}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving expense..." : "Confirm and save"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-4 text-sm text-emerald-700">
          {success}
        </p>
      )}
    </section>
  );
}

export default ReceiptUpload;
