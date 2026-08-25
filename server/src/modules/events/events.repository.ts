import type { Knex } from "knex";
import { db } from '../../db/knex'
import type { EventBody } from './events.schema'

export type EventListFilters = {
    userId: number;
    page: number;
    limit: number;
    status?: "upcoming" | "past";
    type?: "public" | "private";
    tags?: string[];
    q?: string;
}

function applyFilters(qb: Knex.QueryBuilder, filters: EventListFilters) {
    qb.where((nested) => {
      nested.where("events.type", "public").orWhere("events.creator_id", filters.userId);
    });
    if (filters.status === "upcoming") {
      qb.where("events.start_at", ">=", db.fn.now());
    } else if (filters.status === "past") {
      qb.where("events.start_at", "<", db.fn.now());
    }
    if (filters.type) {
      qb.where("events.type", filters.type);
    }
    if (filters.q) {
      const like = `%${filters.q}%`;
      qb.andWhere((nested) => {
        nested.where("events.title", "like", like).orWhere("events.location", "like", like);
      });
    }
    // events that have all selected tags (not just any of them)
    if (filters.tags?.length) {
      qb.whereIn("events.id", (sub) => {
        sub
          .select("event_tags.event_id")
          .from("event_tags")
          .join("tags", "tags.id", "event_tags.tag_id")
          .whereIn("tags.name", filters.tags as string[])
          .groupBy("event_tags.event_id")
          .havingRaw("COUNT(DISTINCT tags.id) = ?", [filters.tags!.length]);
      });
    }
    return qb;
  }

  async function attachTags<T extends { id: number }>(rows: T[]) {
    if (rows.length === 0) {
      return rows.map((row) => ({ ...row, tags: [] as string[] }));
    }
    const links = await db("event_tags")
      .join("tags", "tags.id", "event_tags.tag_id")
      .whereIn(
        "event_tags.event_id",
        rows.map((row) => row.id),
      )
      .select("event_tags.event_id", "tags.name");
    const tagsByEvent = new Map<number, string[]>();
    for (const link of links) {
      const current = tagsByEvent.get(link.event_id) ?? [];
      current.push(link.name);
      tagsByEvent.set(link.event_id, current);
    }
    return rows.map((row) => ({
      ...row,
      tags: tagsByEvent.get(row.id) ?? [],
    }));
  }
  
  async function replaceEventTags(trx: Knex.Transaction, eventId: number, names: string[]) {
    await trx("event_tags").where({ event_id: eventId }).del();
    await trx("tags")
      .insert(names.map((name) => ({ name })))
      .onConflict("name")
      .ignore();
    const tagRows: Array<{ id: number }> = await trx("tags").whereIn("name", names).select("id");
    if (tagRows.length > 0) {
      await trx("event_tags").insert(
        tagRows.map((tag) => ({ event_id: eventId, tag_id: tag.id })),
      );
    }
  }
  

  export async function listVisible(filters: EventListFilters) {
    const { page, limit, status } = filters;
    const offset = (page - 1) * limit;
    const countRow = await applyFilters(db("events"), filters)
      .countDistinct({ total: "events.id" })
      .first();
    const total = Number(countRow?.total ?? 0);
    const rows = await applyFilters(
      db("events")
        .join("users", "users.id", "events.creator_id")
        .select("events.*", "users.name as creator_name"),
      filters,
    )
      .orderBy("events.start_at", status === "past" ? "desc" : "asc")
      .limit(limit)
      .offset(offset);
    return {
      rows: await attachTags(rows),
      total,
    };
  }


  export async function findById(id: number) {
    return db("events").where({ id }).first();
  }
  export async function findByIdWithDetails(id: number) {
    const row = await db("events")
      .join("users", "users.id", "events.creator_id")
      .select("events.*", "users.name as creator_name")
      .where("events.id", id)
      .first();
    if (!row) return null;
    const [event] = await attachTags([row]);
    return event;
  }

  export async function insertWithTags(creatorId: number, input: EventBody) {
    return db.transaction(async (trx) => {
      const [id] = await trx("events").insert({
        creator_id: creatorId,
        title: input.title,
        description: input.description || null,
        start_at: new Date(input.start_at),
        location: input.location || null,
        type: input.type,
      });
      await replaceEventTags(trx, id, input.tags);
      return id as number;
    });
  }

  export async function updateWithTags(id: number, input: EventBody) {
    await db.transaction(async (trx) => {
      await trx("events").where({ id }).update({
        title: input.title,
        description: input.description || null,
        start_at: new Date(input.start_at),
        location: input.location || null,
        type: input.type,
        updated_at: trx.fn.now(),
      });
      await replaceEventTags(trx, id, input.tags);
    });
  }
  export async function deleteById(id: number) {
    await db("events").where({ id }).del();
  }