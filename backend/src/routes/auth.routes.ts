import { Router } from "express";
import { hashRefreshToken } from "../config/refresh-token";
import { RefreshToken } from "../models/refresh-token.model";
import { createAccessToken } from "../config/auth";
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
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
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

    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      data: {
        accessToken: user.accessToken,
        user: user.user,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const rawToken = req.cookies.refreshToken;

    if (!rawToken) {
      return res.status(401).json({
        error: "Refresh token required",
      });
    }

    const tokenHash = hashRefreshToken(rawToken);

    const storedToken = await RefreshToken.findOne({
      tokenHash,
    });

    if (!storedToken) {
      return res.status(401).json({
        error: "Invalid refresh token",
      });
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      return res.status(401).json({
        error: "Refresh token expired",
      });
    }

    const accessToken = createAccessToken(
      storedToken.userId.toString()
    );

    return res.status(200).json({
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});


router.post("/logout", async (req, res, next) => {
  try {
    const rawToken = req.cookies.refreshToken;

    if (rawToken) {
      const tokenHash = hashRefreshToken(rawToken);

      await RefreshToken.deleteOne({ tokenHash });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});


export default router;