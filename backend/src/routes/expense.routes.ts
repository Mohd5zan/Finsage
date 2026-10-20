
import { Router } from "express";

import {
  createExpense,
  createExpenseSchema,
  getUserExpenses,
  updateExpense,
  updateExpenseSchema,
  deleteExpense,
} from "../services/expense.service";

import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const result = createExpenseSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid expense data",
          details: result.error.flatten(),
        });
      }

      const expense = await createExpense(
        req.userId!,
        result.data
      );

      return res.status(201).json({
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const expenses = await getUserExpenses(req.userId!);

      return res.status(200).json({
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const expenseId = req.params.id;

      if (typeof expenseId !== "string") {
        return res.status(400).json({
          error: "Invalid expense ID",
        });
      }

      const result = updateExpenseSchema.safeParse(req.body);

      if (!result.success || Object.keys(result.data ?? {}).length === 0) {
        return res.status(400).json({
          error: "Invalid expense data",
          details: result.success
            ? "Provide at least one field to update"
            : result.error.flatten(),
        });
      }

      const expense = await updateExpense(
        req.userId!,
        expenseId,
        result.data
      );

      if (!expense) {
        return res.status(404).json({
          error: "Expense not found",
        });
      }

      return res.status(200).json({
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const expenseId = req.params.id;

      if (typeof expenseId !== "string") {
        return res.status(400).json({
          error: "Invalid expense ID",
        });
      }

      const expense = await deleteExpense(
        req.userId!,
        expenseId
      );

      if (!expense) {
        return res.status(404).json({
          error: "Expense not found",
        });
      }

      return res.status(200).json({
        message: "Expense deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
