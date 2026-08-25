import { db } from "../../db/knex.js";

export async function listAll() {
  return db("tags").select("id", "name").orderBy("name", "asc");
}