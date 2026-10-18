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


export async function updateExpense(
  expenseId: string,
  updates: Partial<
    Pick<
      Expense,
      "merchant" | "amountMinor" | "taxMinor" | "category" | "date"
    >
  >,
  accessToken: string
): Promise<Expense> {
  const response = await fetch(
    `http://localhost:5000/api/expenses/${encodeURIComponent(expenseId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update expense");
  }

  return result.data as Expense;
}

export async function deleteExpense(
  expenseId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `http://localhost:5000/api/expenses/${encodeURIComponent(expenseId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "Failed to delete expense");
  }
}
