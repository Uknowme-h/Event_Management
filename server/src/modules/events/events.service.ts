import { forbidden, notFound, unauthorized } from "../../utils/AppError.js";
import type { EventBody, ListEventsQuery } from "./events.schema.js";
import * as eventsRepo from "./events.repository.js";

function requireUserId(userId: number | undefined) {
  if (!userId) throw unauthorized("Authentication required");
  return userId;
}

function hidePrivate(event: { type: string; creator_id: number } | undefined, userId: number) {
  if (!event) throw notFound("Event not found");
  if (event.type === "private" && event.creator_id !== userId) {
    throw notFound("Event not found");
  }
  return event;
}

export async function listEvents(userId: number | undefined, query: ListEventsQuery) {
  const id = requireUserId(userId);
  const { rows, total } = await eventsRepo.listVisible({
    userId: id,
    page: query.page,
    limit: query.limit,
    status: query.status,
    type: query.type,
    tags: query.tags,
    q: query.q,
  });

  return {
    data: rows,
    meta: { page: query.page, limit: query.limit, total },
  };
}

export async function getEvent(userId: number | undefined, eventId: number) {
  const id = requireUserId(userId);
  const event = await eventsRepo.findByIdWithDetails(eventId);
  return hidePrivate(event, id);
}

export async function createEvent(userId: number | undefined, input: EventBody) {
  const id = requireUserId(userId);
  const eventId = await eventsRepo.insertWithTags(id, input);
  return eventsRepo.findByIdWithDetails(eventId);
}

export async function updateEvent(userId: number | undefined, eventId: number, input: EventBody) {
  const id = requireUserId(userId);
  const existing = await eventsRepo.findById(eventId);
  hidePrivate(existing, id);

  if (existing.creator_id !== id) {
    throw forbidden("You can only edit your own events");
  }

  await eventsRepo.updateWithTags(eventId, input);
  return eventsRepo.findByIdWithDetails(eventId);
}

export async function deleteEvent(userId: number | undefined, eventId: number) {
  const id = requireUserId(userId);
  const existing = await eventsRepo.findById(eventId);
  hidePrivate(existing, id);

  if (existing.creator_id !== id) {
    throw forbidden("You can only delete your own events");
  }

  await eventsRepo.deleteById(eventId);
}