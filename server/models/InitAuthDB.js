const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Definira putanju do direktorija s bazom podataka
const dataDir = path.resolve(__dirname, "../database/data");
const authDbPath = path.join(dataDir, "auth.db");

// Kreira direktorij baze ako ne postoji
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("Created /database/data directory");
}

// Inicijalizira SQLite bazu
const db = new Database(authDbPath);

// Kreira tablicu za korisničke podatke ako ne postoji
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
