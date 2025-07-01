import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));


const dataDir = path.resolve(__dirname, "../database/data");
const systemDbPath = path.join(dataDir, "system.db");


if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("Created /database/data directory");
}


const db = new Database(systemDbPath);


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

export default function initSystemDb() { return true; }
