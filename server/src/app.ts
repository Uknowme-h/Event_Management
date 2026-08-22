import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(pinoHttp());
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use(errorHandler);

  return app;
}
