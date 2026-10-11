export interface Expense {
  _id: string;
  userId: string;
  merchant: string;
  amountMinor: number;
  taxMinor: number;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export async function getExpenses(accessToken: string) {
  const response = await fetch(
    "http://localhost:5000/api/expenses",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  const result: { data: Expense[] } = await response.json();

  return result.data;
}