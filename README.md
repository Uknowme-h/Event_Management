# Event Planning App

A full-stack event management application. Users can sign up, create public or private events, filter and search them, manage their own, and RSVP to events they plan to attend.

## Demo


https://github.com/user-attachments/assets/d94d79db-0dfa-44e3-9b38-d762e91abc2e


[![Watch demo](https://cdn.loom.com/sessions/thumbnails/a1d7f7736f324cadb1980fc7fe45a42b-with-play.gif)](https://www.loom.com/share/a1d7f7736f324cadb1980fc7fe45a42b)

**Stack:** Node.js + Express · React · MySQL · Knex.js · TypeScript · Zod · Tailwind CSS

---

## Setup

**Prerequisites:** Node.js 18+, MySQL running locally.

### 1. Database

Create the database and a user for it:

```sql
CREATE DATABASE event_management;
CREATE USER 'app'@'localhost' IDENTIFIED BY 'app';
GRANT ALL ON event_management.* TO 'app'@'localhost';
```

### 2. Server

```bash
cd server
cp .env.example .env   # edit if your DB credentials differ
npm install
npm run migrate        # runs all migrations
npm run seed           # optional: loads sample tags
npm run dev            # starts on http://localhost:4000
```

### 3. Client

```bash
cd client
npm install
npm run dev            # starts on http://localhost:5173
```

---

## Engineering Decisions

**Knex over an ORM** — Knex gives full control over SQL without hiding what queries are actually running. For an assignment that emphasises SQL, an ORM felt like the wrong abstraction.

**JWT in localStorage** — Simple to implement and sufficient for this scope. A production app would use `httpOnly` cookies to prevent XSS exposure.

**URL as filter state** — Search params (`?status=upcoming&q=foo`) keep filters shareable and back-button friendly without any extra global state.

**React Context for auth** — The auth state is truly global (header, route guards, forms all need it), so Context is the right fit. No need to reach for Redux here.

**Zod on both sides** — Schemas defined once on the server, mirrored on the client. Catches bad input before it hits the network.

**Creator-only mutations** — Edit and delete are checked both in the service layer (throws 403) and on the frontend (buttons hidden if you're not the creator).

**UTC everywhere** — All datetimes are stored and compared in UTC. The Knex connection is pinned to `+00:00` and queries use `UTC_TIMESTAMP()` explicitly, so the upcoming/past split is consistent regardless of the server's system timezone.

---

## Assumptions

- A user with no account cannot see private events — they must log in first.
- Private events are only visible to their creator; other logged-in users cannot see them.
- Tags are shared across all events (not per-user). New tags can be typed in freely; suggestions come from existing ones.
- Pagination defaults to 10 events per page.
- Event start time is stored in UTC; the UI displays it in the browser's local timezone.
- RSVP is only allowed on upcoming events — past events show a read-only attendance summary.
- Any logged-in user can RSVP to any event they can see, including their own.

---

## Bonus SQL

Answers to the three SQL questions (current designation, designation timeline, and designation at time of allocation) are written up in [BONUS.md](./BONUS.md).
