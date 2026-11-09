const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log("DB Config:", {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(async (client) => {
    console.log("PostgreSQL connected successfully");

    const result = await client.query(`
      SELECT
        current_database(),
        current_schema(),
        current_user
    `);

    console.log("Database Info:", result.rows[0]);

    const tableCheck = await client.query(`
      SELECT to_regclass('public.users') AS users_table
    `);

    console.log(
      "Users table check:",
      tableCheck.rows[0]
    );

    client.release();
  })
  .catch((error) => {
    console.error("Database connection failed:");
    console.error(error.message);
  });

module.exports = pool;