require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const databaseName = process.env.DB_NAME;

if (!databaseName || !/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  console.error("Set DB_NAME to a valid PostgreSQL database name in backend/.env");
  process.exit(1);
}

const connection = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
};

async function setupDatabase() {
  const admin = new Client({ ...connection, database: "postgres" });
  await admin.connect();

  try {
    const result = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (result.rows.length === 0) {
      await admin.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`Created database: ${databaseName}`);
    } else {
      console.log(`Database already exists: ${databaseName}`);
    }
  } finally {
    await admin.end();
  }

  const appDatabase = new Client({ ...connection, database: databaseName });
  await appDatabase.connect();

  try {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await appDatabase.query(schema);
    console.log("FinTrack tables are ready.");
  } finally {
    await appDatabase.end();
  }
}

setupDatabase().catch((error) => {
  console.error("Database setup failed:", error.code || error.message);
  process.exitCode = 1;
});
