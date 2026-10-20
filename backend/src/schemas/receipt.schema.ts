
import { z } from "zod";

export const receiptSchema = z.object({
  merchant: z.string().trim().min(1).max(150),
  amountMinor: z.number().int().positive(),
  date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.literal(""),
    z.null(),
  ]),
  taxMinor: z.number().int().nonnegative(),
  category: z.enum([
    "software",
    "travel",
    "food",
    "office",
    "utilities",
    "other",
  ]),
});

export type ReceiptData = z.infer<typeof receiptSchema>;
