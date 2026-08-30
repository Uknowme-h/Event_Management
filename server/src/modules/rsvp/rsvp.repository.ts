import { db } from "../../db/knex.js";

export type RsvpStatus = "yes" | "no" | "maybe";

export async function upsert(eventId: number, userId: number, status: RsvpStatus) {
  await db("event_rsvps")
    .insert({ event_id: eventId, user_id: userId, status })
    .onConflict(["event_id", "user_id"])
    .merge({ status, updated_at: db.fn.now() });
}

/** Returns true if a row was deleted, false if no RSVP existed. */
export async function remove(eventId: number, userId: number): Promise<boolean> {
  const count = await db("event_rsvps")
    .where({ event_id: eventId, user_id: userId })
    .del();
  return count > 0;
}

export async function getCounts(eventId: number): Promise<Record<RsvpStatus, number>> {
  const rows = await db("event_rsvps")
    .where({ event_id: eventId })
    .groupBy("status")
    .select("status")
    .count<Array<{ status: string; count: string }>>({ count: "*" });

  const counts: Record<RsvpStatus, number> = { yes: 0, no: 0, maybe: 0 };
  for (const row of rows) {
    counts[row.status as RsvpStatus] = Number(row.count);
  }
  return counts;
}

export async function getUserRsvp(
  eventId: number,
  userId: number,
): Promise<RsvpStatus | null> {
  const row = await db("event_rsvps")
    .where({ event_id: eventId, user_id: userId })
    .select("status")
    .first<{ status: string } | undefined>();
  return (row?.status ?? null) as RsvpStatus | null;
}

/** Fetches both counts and the current user's response in parallel. */
export async function getRsvpData(eventId: number, userId: number) {
  const [rsvp_counts, my_rsvp] = await Promise.all([
    getCounts(eventId),
    getUserRsvp(eventId, userId),
  ]);
  return { rsvp_counts, my_rsvp };
}
