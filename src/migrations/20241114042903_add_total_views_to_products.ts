import type { Knex } from "knex";


exports.up = function (knex) {
  return knex.schema.alterTable('products', function (table) {
    table.integer('total_views').defaultTo(0);
  });
};

// exports.down = function (knex) {
//   return knex.schema.alterTable('products', function (table) {
//     table.dropColumn('total_views'); 
//   });
// };
