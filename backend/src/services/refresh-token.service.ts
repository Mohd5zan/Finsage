import { RefreshToken } from "../models/refresh-token.model";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../config/refresh-token";
import mongoose from "mongoose";

const REFRESH_TOKEN_DAYS = 7;

export async function createRefreshToken(userId: string) {
  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + REFRESH_TOKEN_DAYS
  );

  await RefreshToken.create({
    userId: new mongoose.Types.ObjectId(userId),
    tokenHash,
    expiresAt,
  });

  return {
    rawToken,
    expiresAt,
  };
}