import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import { connectDatabase } from "./config/db";
import expenseRoutes from "./routes/expense.routes";
import authRoutes from "./routes/auth.routes";
import { requireAuth, AuthenticatedRequest } from "./middleware/auth.middleware";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});


app.get(
  "/api/auth/me",
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    res.json({
      data: {
        userId: req.userId,
      },
    });
  }
);




const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`FinSage API running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});