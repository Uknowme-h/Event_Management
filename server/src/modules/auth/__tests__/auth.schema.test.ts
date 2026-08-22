import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "../auth.schema.js";

describe("signupSchema", () => {
  const validInput = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  };

  it("accepts valid input", () => {
    const result = signupSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = signupSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({ ...validInput, password: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 8 characters long");
    }
  });

  it("rejects missing fields", () => {
    const result = signupSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  const validInput = {
    email: "john@example.com",
    password: "password123",
  };

  it("accepts valid input", () => {
    const result = loginSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ ...validInput, email: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ ...validInput, password: "" });
    expect(result.success).toBe(false);
  });
});
