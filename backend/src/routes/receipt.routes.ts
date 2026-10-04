import { Router } from "express";
import multer from "multer";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { extractReceiptData } from "../services/ai.service";
import { createExpense } from "../services/expense.service";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/scan-receipt",
  requireAuth,
  upload.single("receipt"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Receipt image is required",
        });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Only image files are allowed",
        });
      }

      const imageBase64 = req.file.buffer.toString("base64");

      const receiptData = await extractReceiptData(
        imageBase64,
        req.file.mimetype
      );

const expense = await createExpense(
  req.userId!,
  {
    merchant: receiptData.merchant,
    amountMinor: receiptData.amountMinor,
    taxMinor: receiptData.taxMinor,
    category: receiptData.category,
    date: new Date(receiptData.date),
  }
);

      return res.status(201).json({
        data: {
          expense,
          receipt: receiptData,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;