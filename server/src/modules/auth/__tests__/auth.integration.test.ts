import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import request from "supertest";
import { db } from "../../../db/knex.js";
import authRouter from "../auth.routes.js";
import { errorHandler } from "../../../middleware/errorHandler.js";

// Add supertest type
declare module "vitest" {
  interface TestContext {
    app: express.Express;
  }
}

describe("Auth API Integration", () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    app.use(errorHandler);

    // Clean test data
    await db("users").where("email", "integration-test@example.com").del();
  });

  afterAll(async () => {
    await db("users").where("email", "integration-test@example.com").del();
    await db.destroy();
  });

  describe("POST /api/auth/signup", () => {
    it("creates a new user and returns token", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Integration Test User",
          email: "integration-test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.user).toMatchObject({
        name: "Integration Test User",
        email: "integration-test@example.com",
      });
      expect(res.body.data.token).toBeDefined();
    });

    it("rejects duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Another User",
          email: "integration-test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("rejects invalid input", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "",
          email: "not-an-email",
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns token for valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "integration-test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.token).toBeDefined();
    });

    it("rejects wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "integration-test@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "integration-test@example.com",
          password: "password123",
        });
      token = res.body.data.token;
    });

    it("returns current user with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        name: "Integration Test User",
        email: "integration-test@example.com",
      });
    });

    it("rejects request without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects request with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
    });
  });
});
