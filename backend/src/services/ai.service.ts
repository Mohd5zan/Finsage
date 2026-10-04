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
Extract the information from this receipt.

Return ONLY valid JSON:

{
  "merchant": "string",
  "amountMinor": 0,
  "date": "YYYY-MM-DD",
  "taxMinor": 0,
  "category": "software | travel | food | office | utilities | other"
}

Rules:
- amountMinor is the total amount in the smallest currency unit.
- taxMinor is the tax amount in the smallest currency unit. Use 0 if not visible.
- Do not guess information that is not present.
- category must be one of the provided categories.
- Return JSON only. No markdown.
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

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const result = receiptSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error("AI returned invalid receipt data");
  }

  return result.data;
}