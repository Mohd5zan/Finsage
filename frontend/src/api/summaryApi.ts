
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
    `http://localhost:5000/api/summary/monthly?year=${year}&month=${month}`,
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
