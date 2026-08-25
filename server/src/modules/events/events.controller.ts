import type { Request, Response } from "express";
import * as eventsService from "./events.service.js";
import type { EventBody, EventIdParams, ListEventsQuery } from "./events.schema.js";

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as ListEventsQuery;
  const result = await eventsService.listEvents(req.user?.id, query);
  res.json(result);
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params as unknown as EventIdParams;
  const event = await eventsService.getEvent(req.user?.id, id);
  res.json({ data: event });
}

export async function create(req: Request, res: Response) {
  const event = await eventsService.createEvent(req.user?.id, req.body as EventBody);
  res.status(201).json({
    status: "success",
    message: "Event created successfully",
    data: event,
  });
}

export async function update(req: Request, res: Response) {
  const { id } = req.params as unknown as EventIdParams;
  const event = await eventsService.updateEvent(req.user?.id, id, req.body as EventBody);
  res.json({
    status: "success",
    message: "Event updated successfully",
    data: event,
  });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params as unknown as EventIdParams;
  await eventsService.deleteEvent(req.user?.id, id);
  res.status(204).send();
}