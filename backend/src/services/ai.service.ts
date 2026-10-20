import { GoogleGenAI } from "@google/genai";
import { receiptSchema } from "../schemas/receipt.schema";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function extractReceiptData(
  imageBase64: string,
  mimeType: string
) {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            
text: `
You are a receipt and invoice data extraction assistant for an expense-tracking application.

Read the uploaded image carefully. It may be any type of receipt, bill, or invoice, including:
- Supermarket or retail bills
- Restaurant, cafe, and food delivery receipts
- Fuel, taxi, bus, train, and travel receipts
- Hotel and accommodation bills
- Software subscriptions and online invoices
- Office supplies, utilities, medical, repair, and service bills
- Handwritten or printed receipts in different layouts

Extract the best available information regardless of the receipt layout.

Return ONLY one valid JSON object with exactly these fields:
{
  "merchant": "string",
  "amountMinor": 0,
  "date": "YYYY-MM-DD",
  "taxMinor": 0,
  "category": "software | travel | food | office | utilities | other"
}

Rules:
- merchant: Use the store, business, service provider, or seller name printed on the receipt. If the name genuinely cannot be identified, use "Unknown merchant". Never return null.
- amountMinor: Extract the final total paid, not the subtotal or individual item price. Convert it to the smallest currency unit: for example, ₹125.50 becomes 12550. Do not assume the currency is INR if the receipt clearly uses another currency; this application currently stores amounts in minor units, so return the numeric amount in the receipt's currency's minor unit.
- If the final total cannot be determined reliably, do not invent an amount.
- date: Use the transaction date printed on the receipt, formatted YYYY-MM-DD. Do not use today's date. If the date is unreadable or missing, use an empty string.
- taxMinor: Extract the total tax when visible, in the same minor units as the amount. Use 0 when tax is absent or cannot be determined.
- category: Choose the closest category:
  software = software or digital subscriptions
  travel = transport, fuel, taxi, transit, hotels, or travel expenses
  food = groceries, restaurants, cafes, or food delivery
  office = stationery, office equipment, or office supplies
  utilities = electricity, water, internet, phone, or similar bills
  other = everything else
- Use only the specified categories.
- Do not confuse subtotal, discount, change, amount tendered, or balance due with the final total paid.
- Never invent a missing date or total.
- Return valid JSON only, with no Markdown fences or explanatory text.
`,

          },
        ],
      },
    ],
  });

 
  const text = response.text;

  if (!text) {
    throw new Error("AI returned an empty response");
  }

  // Handle JSON wrapped in Markdown code fences.
  const cleanedText = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    console.error("Gemini returned non-JSON receipt data:", text);
    throw new Error("AI returned invalid JSON");
  }

  
  
  const raw =
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;

  if (!raw) {
    throw new Error("AI returned invalid receipt data");
  }

  const normalized = {
    ...raw,
    merchant:
      typeof raw.merchant === "string" && raw.merchant.trim()
        ? raw.merchant.trim()
        : "Unknown merchant",
    date: typeof raw.date === "string" ? raw.date : "",
  };

  const result = receiptSchema.safeParse(normalized);



  if (!result.success) {
    // Log validation issues, but avoid logging the full receipt.
    console.error(
      "Receipt validation failed:",
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }))
    );

    throw new Error("AI returned invalid receipt data");
  }

  return result.data;

}