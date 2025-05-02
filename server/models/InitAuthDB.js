const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.resolve(__dirname, "../database/data");
const authDbPath = path.join(dataDir, "auth.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("Created /database/data directory");
}

const db = new Database(authDbPath);

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS credentials (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0
  );
`
).run();

db.close();
console.log(" auth.db initialized without id column.");
