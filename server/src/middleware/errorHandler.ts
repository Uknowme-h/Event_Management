import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(typeof err.details === "object" && err.details !== null ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details } });
    return;
  }

  const status = 500;
  const message = env.NODE_ENV === "production" ? "Internal server error" : (err instanceof Error ? err.message : "Internal server error");
  console.error("Unhandled error:", err);
  res.status(status).json({ error: { code: "INTERNAL_ERROR", message } });
}
