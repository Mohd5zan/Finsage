
import { Router } from "express";
import {
  registerSchema,
  registerUser,
  loginSchema,
  loginUser,
} from "../services/auth.service";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid registration data",
        details: result.error.flatten(),
      });
    }

    const user = await registerUser(result.data);

    return res.status(201).json({
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        error: "Email is already registered",
      });
    }

    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid login data",
        details: result.error.flatten(),
      });
    }

    const user = await loginUser(result.data);

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    next(error);
  }
});

router.post("/logout", (_req, res) => {
  return res.status(200).json({
    message: "Logged out successfully",
  });
});

export default router;
