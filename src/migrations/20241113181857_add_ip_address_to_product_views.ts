import type { Knex } from "knex";


exports.up = function (knex) {
  return knex.transaction(function (trx) {
    return trx.schema.table('product_views', function (table) {
      table.string('ip_address', 255).nullable(); 
    });
  });
};



export async function down(knex: Knex): Promise<void> {
}

