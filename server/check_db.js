import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "./database/data/client_info.db");

try {
    const db = new Database(dbPath);
    console.log("Database opened successfully");
    
    // Check if clients table exists
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'").get();
    console.log("Clients table exists:", !!tableExists);
    
    if (tableExists) {
        const schema = db.prepare("PRAGMA table_info(clients)").all();
        console.log("Clients table schema:", schema);
    }
    
    db.close();
} catch (err) {
    console.error("Error:", err);
} 