import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('employees', (table) => {
    table.string('uuid', 36).primary();
    table.string('name', 255).notNullable();
    table.string('address', 255).notNullable();
    table.string('neighborhood', 255).nullable();
    table.string('zipcode', 20).nullable();
    table.string('phone', 20).nullable();
    table.decimal('salary', 10, 2).notNullable();
    table.date('contract_date').notNullable();
    table.string('role', 255).notNullable();
    table.string('status', 255).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employees');
}