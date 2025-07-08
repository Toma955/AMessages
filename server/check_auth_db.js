import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authDbPath = path.resolve(__dirname, "./database/data/auth.db");

try {
    const db = new Database(authDbPath);
    console.log("Auth database opened successfully");
    
    // Check if credentials table exists
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='credentials'").get();
    console.log("Credentials table exists:", !!tableExists);
    
    if (tableExists) {
        const schema = db.prepare("PRAGMA table_info(credentials)").all();
        console.log("Credentials table schema:", schema);
    }
    
    db.close();
} catch (err) {
    console.error("Error:", err);
} 