'use strict';
exports.up = function(knex) {
  return knex.schema
    .createTable('files', function(table) {
      table.increments('id').primary();
      table.string('filename');
      table.string('s3_url');
      table.string('status');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('files');
};