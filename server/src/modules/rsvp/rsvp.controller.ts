import type { Request, Response } from "express";
import * as rsvpService from "./rsvp.service.js";
import type { RsvpBody } from "./rsvp.schema.js";
import type { EventIdParams } from "../events/events.schema.js";

export async function upsert(req: Request, res: Response) {
  const { id } = req.params as unknown as EventIdParams;
  const { status } = req.body as RsvpBody;
  const data = await rsvpService.setRsvp(id, req.user!.id, status);
  res.json({ status: "success", data });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params as unknown as EventIdParams;
  const data = await rsvpService.deleteRsvp(id, req.user!.id);
  res.json({ status: "success", data });
}
