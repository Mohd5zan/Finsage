import { useState } from "react";
import { scanReceipt } from "../../api/receiptApi";

interface ReceiptUploadProps {
  onUploadSuccess: () => void;
}

function ReceiptUpload({ onUploadSuccess }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    try {
      await scanReceipt(file, accessToken);
      setSuccess("Receipt scanned and expense saved successfully.");
      setFile(null);
      onUploadSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to scan receipt."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold text-slate-900">
        Scan a receipt
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Upload a receipt image to extract its details with AI.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
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

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-sm text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Scanning receipt..." : "Scan receipt"}
        </button>
      </form>
    </section>
  );
}

export default ReceiptUpload;

