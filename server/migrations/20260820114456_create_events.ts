import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable('events', (table) => {
        
    table.increments("id").primary();
    table
      .integer("creator_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("title").notNullable();
    table.text("description");
    table.datetime("start_at").notNullable();
    table.string("location");
    table.enum("type", ["public", "private"]).notNullable().defaultTo("public");
    table.timestamps(true, true);

    table.index(["start_at"]);
    table.index(["creator_id"]);
    table.index(["type"]);

    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('events');
}

