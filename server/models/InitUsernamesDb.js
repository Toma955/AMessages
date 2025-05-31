const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Definira putanju do direktorija i baze
const dataDir = path.resolve(__dirname, "../database/data");
const usernamesDbPath = path.join(dataDir, "usernames.db");

// Kreira direktorij ako ne postoji
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(" Created /database/data directory");
}

// Otvara ili kreira bazu usernames.db
const db = new Database(usernamesDbPath);

// Kreira tablicu za registrirane korisničke nazive ako ne postoji
db.prepare(
    `
    CREATE TABLE IF NOT EXISTS registered_usernames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE
    );
`
).run();

db.close();
console.log("usernames.db initialized with registered_usernames table");
