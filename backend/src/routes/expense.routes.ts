import { Router } from "express";
import {
  createExpense,
  createExpenseSchema,
  getUserExpenses,
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
});

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

export default router;