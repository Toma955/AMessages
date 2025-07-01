import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));


const dataDir = path.resolve(__dirname, "../database/data");
const loginDbPath = path.join(dataDir, "login.db");


if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(" Created /database/data directory");
}


const db = new Database(loginDbPath);


db.prepare(
    `
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        login_time TEXT NOT NULL,
        logout_time TEXT,
        status TEXT NOT NULL CHECK (status IN ('active', 'closed'))
    );
    `
).run();

db.close();
console.log("login.db initialized with sessions table");

export default function initLoginDb() { return true; }
