import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock dependencies before importing service
vi.mock("../../../db/knex.js", () => ({
  db: vi.fn(),
}));

vi.mock("../../../config/env.js", () => ({
  env: {
    JWT_SECRET: "test-secret-key",
    JWT_EXPIRES_IN: "1d",
  },
}));

import { db } from "../../../db/knex.js";
import { createUser, login, findUserByEmail } from "../auth.service.js";

const mockDb = vi.mocked(db);

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findUserByEmail", () => {
    it("returns user if found", async () => {
      const mockUser = { id: 1, name: "John", email: "john@example.com", password_hash: "hash" };
      mockDb.mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockUser),
        }),
      } as any);

      const result = await findUserByEmail("john@example.com");
      expect(result).toEqual(mockUser);
    });

    it("returns undefined if not found", async () => {
      mockDb.mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      const result = await findUserByEmail("unknown@example.com");
      expect(result).toBeUndefined();
    });
  });

  describe("createUser", () => {
    it("creates user and returns token", async () => {
      const input = { name: "John", email: "john@example.com", password: "password123" };
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Mock findUserByEmail returning undefined (no existing user)
      mockDb.mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      // Mock insert
      mockDb.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue([1]),
      } as any);

      const result = await createUser(input);

      expect(result.user).toEqual({ id: 1, name: "John", email: "john@example.com" });
      expect(result.token).toBeDefined();

      // Verify token is valid
      const decoded = jwt.verify(result.token, "test-secret-key") as any;
      expect(decoded.sub).toBe(1);
      expect(decoded.name).toBe("John");
      expect(decoded.email).toBe("john@example.com");
    });

    it("throws 409 if email already exists", async () => {
      const input = { name: "John", email: "existing@example.com", password: "password123" };
      const existingUser = { id: 1, email: "existing@example.com" };

      mockDb.mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(existingUser),
        }),
      } as any);

      await expect(createUser(input)).rejects.toThrow("Email already in use");
    });
  });

  describe("login", () => {
    it("returns token for valid credentials", async () => {
      const input = { email: "john@example.com", password: "password123" };
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockUser = { id: 1, name: "John", email: "john@example.com", password_hash: hashedPassword };

      mockDb.mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockUser),
        }),
      } as any);

      const result = await login(input);

      expect(result.user).toEqual({ id: 1, name: "John", email: "john@example.com" });
      expect(result.token).toBeDefined();
    });

    it("throws 401 for non-existent email", async () => {
      const input = { email: "unknown@example.com", password: "password123" };

      mockDb.mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      await expect(login(input)).rejects.toThrow("Invalid email or password");
    });

    it("throws 401 for wrong password", async () => {
      const input = { email: "john@example.com", password: "wrongpassword" };
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockUser = { id: 1, name: "John", email: "john@example.com", password_hash: hashedPassword };

      mockDb.mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockUser),
        }),
      } as any);

      await expect(login(input)).rejects.toThrow("Invalid email or password");
    });
  });
});
