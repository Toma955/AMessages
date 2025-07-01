import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));


const dataDir = path.resolve(__dirname, "../database/data");
const usernamesDbPath = path.join(dataDir, "usernames.db");


if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(" Created /database/data directory");
}

const db = new Database(usernamesDbPath);

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

export default function initUsernamesDb() { return true; }
