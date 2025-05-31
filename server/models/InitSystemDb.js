const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Postavlja putanju do mape s podacima i datoteke baze
const dataDir = path.resolve(__dirname, "../database/data");
const systemDbPath = path.join(dataDir, "system.db");

// Kreira direktorij ako ne postoji
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("Created /database/data directory");
}

// Otvara ili kreira system.db bazu
const db = new Database(systemDbPath);

// Kreira tablicu group_ids ako ne postoji
db.prepare(
    `
    CREATE TABLE IF NOT EXISTS group_ids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT NOT NULL UNIQUE
    );
`
).run();

db.close();
console.log(" system.db initialized with group_ids table");
