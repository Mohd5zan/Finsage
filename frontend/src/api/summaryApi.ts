const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface MonthlySummary {
  year: number;
  month: number;
  expenseCount: number;
  totalSpendingMinor: number;
  totalTaxMinor: number;
  categories: {
    category: string;
    amountMinor: number;
    percentage: number;
  }[];
  summary: string;
  suggestions: string[];
}

export async function getMonthlySummary(
  year: number,
  month: number,
  accessToken: string
): Promise<MonthlySummary> {
  const response = await fetch(
    `${API_URL}/api/summary/monthly?year=${year}&month=${month}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to generate monthly summary"
    );
  }

  return result.data as MonthlySummary;
}
