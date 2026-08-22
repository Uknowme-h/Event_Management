import type { Knex } from "knex";
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    await knex("users").del();
    await knex("events").del();
    await knex("tags").del();
    await knex("event_tags").del();

    const password_hash = await bcrypt.hash("password123", 10);
    await knex("users").insert([
        { id: 1, name: "Alice", email: "alice@example.com", password_hash},
        { id: 2, name: "Bob", email: "bob@example.com", password_hash },
      ]);

      await knex("tags").insert([
        { id: 1, name: "Birthday" },
        { id: 2, name: "Workshop" },
        { id: 3, name: "Conference" },
      ]);
    
      const now = Date.now();
  const day = 86400000;
  const events = [
    { id: 1, creator_id: 1, title: "Alice's Birthday Party", description: "Fun rooftop gathering", start_at: new Date(now + 7 * day), location: "Rooftop", type: "public" },
    { id: 2, creator_id: 1, title: "Q3 Planning Workshop", description: "Roadmap session", start_at: new Date(now + 30 * day), location: "Room 4B", type: "private" },
    { id: 3, creator_id: 2, title: "Tech Conference", description: "Keynotes and talks", start_at: new Date(now + 15 * day), location: "Convention Center", type: "public" },
    { id: 4, creator_id: 2, title: "Team Standup", description: "Weekly sync", start_at: new Date(now - 3 * day), location: "Zoom", type: "private" },
    { id: 5, creator_id: 1, title: "Hackathon Kickoff", description: "48h build sprint", start_at: new Date(now + 2 * day), location: "Lab 7", type: "public" },
    { id: 6, creator_id: 2, title: "Retro Dinner", description: "Wrap-up dinner", start_at: new Date(now - 10 * day), location: "Tandoor", type: "public" },
    { id: 7, creator_id: 1, title: "Product Launch", description: "Release event", start_at: new Date(now + 45 * day), location: "Main Hall", type: "private" },
    { id: 8, creator_id: 2, title: "Office Picnic", description: "Summer outing", start_at: new Date(now - 20 * day), location: "City Park", type: "public" },
  ];
  await knex("events").insert(events);

  await knex("event_tags").insert([
    { event_id: 1, tag_id: 1 },
    { event_id: 2, tag_id: 2 },
    { event_id: 3, tag_id: 3 },
    { event_id: 4, tag_id: 2 },
    { event_id: 5, tag_id: 2 },
    { event_id: 5, tag_id: 3 },
    { event_id: 6, tag_id: 1 },
    { event_id: 7, tag_id: 3 },
    { event_id: 8, tag_id: 1 },
  ]);
}

