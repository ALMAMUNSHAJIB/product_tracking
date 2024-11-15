import type { Knex } from "knex";


exports.up = function (knex) {
  return knex.transaction(function (trx) {
    return trx.schema.createTable('products', function (table) {
      table.increments('id').primary();
      table.string('name').notNullable();
    });
  });
};

exports.down = function (knex) {
  return knex.transaction(function (trx) {
    return trx.schema.dropTable('products');
  });
};

