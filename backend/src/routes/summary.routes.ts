
import { Router } from "express";
import { z } from "zod";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { generateMonthlySummary } from "../services/summary.service";

const router = Router();

const monthSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

router.get(
  "/monthly",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const result = monthSchema.safeParse(req.query);

      if (!result.success) {
        return res.status(400).json({
          error: "Invalid year or month",
          details: result.error.flatten(),
        });
      }

      const { year, month } = result.data;

      const summary = await generateMonthlySummary(
        req.userId!,
        year,
        month
      );

      return res.status(200).json({
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
