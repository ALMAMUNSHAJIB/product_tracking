import type { Knex } from "knex";


exports.up = function (knex) {
  return knex.transaction(function (trx) {
    return trx.schema.createTable('product_views', function (table) {
      table.increments('id').primary();
      table.integer('product_id').unsigned().notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.timestamp('viewed_at').defaultTo(knex.fn.now());
      table.foreign('product_id').references('products.id');
    });
  });
}

exports.down = function (knex) {
  return knex.transaction(function (trx) {
    return trx.schema.dropTable('product_views');
  });
}


