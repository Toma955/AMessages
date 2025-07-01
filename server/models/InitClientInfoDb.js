import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));


const dataDir = path.resolve(__dirname, "../database/data");
const dbPath = path.join(dataDir, "client_info.db");


if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(" Created /database/data directory");
}


const db = new Database(dbPath);


db.prepare(
    `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT,
    surname TEXT,
    gender TEXT CHECK (gender IN ('male', 'female')),
    date_of_birth TEXT,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`
).run();

db.close();
console.log(" client_info.db initialized with clients table");

export default function initClientDb() { return true; }
