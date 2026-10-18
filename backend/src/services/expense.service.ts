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

export const updateExpenseSchema = createExpenseSchema.partial();

export async function updateExpense(
  userId: string,
  expenseId: string,
  input: z.infer<typeof updateExpenseSchema>
) {
  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    return null;
  }

  const expense = await Expense.findOneAndUpdate(
    {
      _id: expenseId,
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: input },
    {
      new: true,
      runValidators: true,
    }
  );

  return expense;
}

export async function deleteExpense(
  userId: string,
  expenseId: string
) {
  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    return null;
  }

  const expense = await Expense.findOneAndDelete({
    _id: expenseId,
    userId: new mongoose.Types.ObjectId(userId),
  });

  return expense;
}
