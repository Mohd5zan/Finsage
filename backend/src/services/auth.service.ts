import { z } from "zod";
import { createRefreshToken } from "./refresh-token.service";
import { createAccessToken } from "../config/auth";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.string().trim().email().max(254),

  password: z.string().min(8).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;


import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const existingUser = await User.findOne({
    email: input.email,
  });

  

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  );

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = createAccessToken(user._id.toString());

  const refreshToken = await createRefreshToken(
    user._id.toString()
  );

  return {
    accessToken,
    refreshToken: refreshToken.rawToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
}

export type LoginInput = z.infer<typeof loginSchema>;