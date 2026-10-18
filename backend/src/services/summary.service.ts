
import { GoogleGenAI } from "@google/genai";
import { Expense } from "../models/expense.model";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey });

export async function generateMonthlySummary(
  userId: string,
  year: number,
  month: number
) {
  // Month is 1–12.
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const expenses = await Expense.find({
    userId,
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  })
    .select("merchant amountMinor taxMinor category date")
    .sort({ date: 1 })
    .lean();

  const totalSpendingMinor = expenses.reduce(
    (sum, expense) => sum + expense.amountMinor,
    0
  );

  const totalTaxMinor = expenses.reduce(
    (sum, expense) => sum + expense.taxMinor,
    0
  );

  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] ?? 0) + expense.amountMinor;

      return totals;
    },
    {}
  );

  const categories = Object.entries(categoryTotals)
    .map(([category, amountMinor]) => ({
      category,
      amountMinor,
      percentage:
        totalSpendingMinor > 0
          ? Math.round((amountMinor / totalSpendingMinor) * 100)
          : 0,
    }))
    .sort((a, b) => b.amountMinor - a.amountMinor);

  // Don't call AI when there are no expenses.
  if (expenses.length === 0) {
    return {
      year,
      month,
      expenseCount: 0,
      totalSpendingMinor: 0,
      totalTaxMinor: 0,
      categories: [],
      summary: "No expenses were recorded for this month.",
      suggestions: [],
    };
  }

  const expenseData = expenses.map((expense) => ({
    merchant: expense.merchant,
    amountRupees: expense.amountMinor / 100,
    taxRupees: expense.taxMinor / 100,
    category: expense.category,
    date: expense.date,
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `
You are FinSage, a practical financial assistant for freelancers
and small businesses.

Analyze the following expense records for ${year}-${String(month).padStart(2, "0")}.

Return ONLY valid JSON in this format:
{
  "summary": "A concise summary in 2-4 sentences",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}

Rules:
- Use only the supplied expense records.
- Mention notable category spending and patterns when supported by the data.
- Give 1-3 practical, specific suggestions.
- Do not invent income, budgets, savings, or previous-month comparisons.
- Do not claim spending increased or decreased without comparison data.
- Be helpful and non-judgmental.
- Return JSON only, without markdown.

Expense records:
${JSON.stringify(expenseData)}
    `,
  });

  const text = response.text;

  if (!text) {
    throw new Error("AI returned an empty monthly summary");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI returned invalid monthly summary JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("summary" in parsed) ||
    typeof parsed.summary !== "string" ||
    !("suggestions" in parsed) ||
    !Array.isArray(parsed.suggestions) ||
    !parsed.suggestions.every(
      (item) => typeof item === "string"
    )
  ) {
    throw new Error("AI returned an invalid monthly summary");
  }

  return {
    year,
    month,
    expenseCount: expenses.length,
    totalSpendingMinor,
    totalTaxMinor,
    categories,
    summary: parsed.summary,
    suggestions: parsed.suggestions.slice(0, 3),
  };
}
