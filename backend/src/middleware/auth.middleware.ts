
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as jwt.JwtPayload;

   if (
  typeof payload.sub !== "string" ||
  payload.sub.length === 0
) {
  return res.status(401).json({
    error: "Invalid access token",
  });
}
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired access token",
    });
  }
}
