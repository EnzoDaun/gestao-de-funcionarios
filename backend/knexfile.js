require('ts-node/register');

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'employees_db',
  },
  migrations: { directory: './src/db/migrations', extension: 'ts' },
  seeds: { directory: './src/db/seeds', extension: 'ts' },
};