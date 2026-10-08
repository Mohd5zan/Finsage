import { z } from "zod";
import mongoose from "mongoose";
import { Expense } from "../models/expense.model";

export const createExpenseSchema = z.object({
  merchant: z.string().trim().min(1).max(150),
  amountMinor: z.number().int().positive(),
  taxMinor: z.number().int().nonnegative(),

  category: z.enum([
    "software",
    "travel",
    "food",
    "office",
    "utilities",
    "other",
  ]),

  date: z.coerce.date(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export async function createExpense(
  userId: string,
  input: CreateExpenseInput
) {
  const expense = await Expense.create({
    userId: new mongoose.Types.ObjectId(userId),
    ...input,
  });

  return expense;
}

export async function getUserExpenses(userId: string) {
  const expenses = await Expense.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).sort({
    date: -1,
    createdAt: -1,
  });

  return expenses;
}