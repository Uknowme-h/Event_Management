import type { RequestHandler } from "express";
import type { ZodType } from "zod";

// 
type ValidateConfig = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};


function isZodSchema(value: ZodType | ValidateConfig): value is ZodType {
  return typeof (value as ZodType).safeParse === "function";
}

export function validate(schemaOrConfig: ZodType | ValidateConfig): RequestHandler {
  return (req, _res, next) => {
    const config: ValidateConfig = isZodSchema(schemaOrConfig)
      ? { body: schemaOrConfig }
      : schemaOrConfig;

    if (config.body) {
      const result = config.body.safeParse(req.body);
      if (!result.success) return next(result.error);
      req.body = result.data;
    }

    if (config.query) {
      const result = config.query.safeParse(req.query);
      if (!result.success) return next(result.error);
      req.query = result.data as typeof req.query;
    }

    if (config.params) {
      const result = config.params.safeParse(req.params);
      if (!result.success) return next(result.error);
      req.params = result.data as typeof req.params;
    }

    next();
  };
}