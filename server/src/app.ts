import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./modules/auth/auth.routes.js";
import eventsRouter from "./modules/events/events.routes.js";
import tagsRouter from "./modules/tags/tags.routes.js";

export function createApp() {
  const app = express();

  app.use(pinoHttp());
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/events", eventsRouter);
app.use("/api/tags", tagsRouter);

  app.use(errorHandler);

  return app;
}
