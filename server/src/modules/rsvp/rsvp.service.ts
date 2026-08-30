import { notFound } from "../../utils/AppError.js";
import * as eventsRepo from "../events/events.repository.js";
import * as rsvpRepo from "./rsvp.repository.js";
import type { RsvpStatus } from "./rsvp.repository.js";

/**
 * Verifies the event exists and the requesting user is allowed to see it.
 * Private events are treated as non-existent for users who don't own them.
 */
async function requireVisibleEvent(eventId: number, userId: number) {
  const event = await eventsRepo.findById(eventId);
  if (!event) throw notFound("Event not found");
  if (event.type === "private" && event.creator_id !== userId) {
    throw notFound("Event not found");
  }
  return event;
}

export async function setRsvp(eventId: number, userId: number, status: RsvpStatus) {
  await requireVisibleEvent(eventId, userId);
  await rsvpRepo.upsert(eventId, userId, status);
  return rsvpRepo.getRsvpData(eventId, userId);
}

export async function deleteRsvp(eventId: number, userId: number) {
  await requireVisibleEvent(eventId, userId);
  const deleted = await rsvpRepo.remove(eventId, userId);
  if (!deleted) throw notFound("No RSVP found to remove");
  return rsvpRepo.getRsvpData(eventId, userId);
}
