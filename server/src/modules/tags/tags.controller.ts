import type { Request, Response } from "express";
import * as tagsRepo from "./tags.repository.js";

export async function list(_req: Request, res: Response) {
  const tags = await tagsRepo.listAll();
  res.json({ data: tags });
}