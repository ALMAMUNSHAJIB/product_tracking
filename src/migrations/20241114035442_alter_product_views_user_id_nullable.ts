import type { Knex } from "knex";


exports.up = function (knex) {
  return knex.schema.alterTable('product_views', function (table) {
    table.integer('user_id').unsigned().nullable().alter();
  });
};

// exports.down = function (knex) {
//   return knex.schema.alterTable('product_views', function (table) {
//     table.integer('user_id').unsigned().notNullable().alter();
//   });
// };

