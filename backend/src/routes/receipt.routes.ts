import { Router } from "express";
import multer from "multer";
import {
  requireAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { extractReceiptData } from "../services/ai.service";
// import { createExpense } from "../services/expense.service";

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

      
    let receiptData;

try {
  receiptData = await extractReceiptData(
    imageBase64,
    req.file.mimetype);
} catch (error) {
  console.error("Receipt AI extraction failed:", error);

  return res.status(503).json({
    error: "Receipt scanning is temporarily unavailable. Please try again shortly.",
  });
}

return res.status(200).json({
  data: {
    receipt: receiptData,
  },
});
    } catch (error) {
      next(error);
    }
  }
);

export default router;