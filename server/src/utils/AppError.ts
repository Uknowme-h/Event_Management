export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (message = "Resource not found") =>
  new AppError(404, "NOT_FOUND", message);

export const unauthorized = (message = "Unauthorized") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "Forbidden") =>
  new AppError(403, "FORBIDDEN", message);

export const badRequest = (message: string) =>
  new AppError(400, "BAD_REQUEST", message);
