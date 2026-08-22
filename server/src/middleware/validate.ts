import type { RequestHandler } from "express";
import { z } from "zod";

export function validate(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(result.error); // errorHandler catches ZodError
    }
    req.body = result.data; // use parsed/validated data
    next();
  };
}