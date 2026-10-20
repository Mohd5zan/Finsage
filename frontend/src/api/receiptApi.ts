
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface ScannedReceipt {
  merchant: string;
  amountMinor: number;
  taxMinor: number;
  date: string;
  category:
    | "software"
    | "travel"
    | "food"
    | "office"
    | "utilities"
    | "other";
}

interface ScanReceiptResponse {
  data?: {
    receipt?: ScannedReceipt;
  };
  error?: string;
}

interface SaveExpenseResponse {
  data?: unknown;
  error?: string;
}

async function readJson<T>(
  response: Response
): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function scanReceipt(
  file: File,
  accessToken: string
): Promise<ScannedReceipt> {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await fetch(
    `${API_URL}/api/expenses/scan-receipt`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  const result = await readJson<ScanReceiptResponse>(response);

  if (!response.ok) {
    throw new Error(
      result?.error ||
        (response.status === 503
          ? "Receipt scanning is temporarily unavailable. Please try again shortly."
          : `Receipt scanning failed (HTTP ${response.status}).`)
    );
  }

  if (!result?.data?.receipt) {
    throw new Error("The server did not return valid receipt details.");
  }

  return result.data.receipt;
}

export async function saveScannedExpense(
  receipt: ScannedReceipt,
  accessToken: string
) {
  const response = await fetch(`${API_URL}/api/expenses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant: receipt.merchant,
      amountMinor: receipt.amountMinor,
      taxMinor: receipt.taxMinor,
      date: receipt.date,
      category: receipt.category,
    }),
  });

  const result = await readJson<SaveExpenseResponse>(response);

  if (!response.ok) {
    throw new Error(
      result?.error || `Failed to save expense (HTTP ${response.status}).`
    );
  }

  if (!result?.data) {
    throw new Error("The server did not return the saved expense.");
  }

  return result.data;
}
