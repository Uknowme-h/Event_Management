import type { Request, Response, NextFunction, RequestHandler } from "express";
import { unauthorized } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(unauthorized("Authentication required"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string } & AuthUser;
    req.user = { id: Number(payload.sub), name: payload.name, email: payload.email };
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
};
