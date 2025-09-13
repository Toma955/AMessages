import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataDir = path.resolve(__dirname, "../database/users");

// Kreiraj userlist tabelu za sve postojeće korisnike
function initUserlistForAllUsers() {
    if (!fs.existsSync(dataDir)) {
        console.log("No users directory found, skipping userlist initialization");
        return;
    }

    const userDirs = fs.readdirSync(dataDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`Found ${userDirs.length} user directories`);

    userDirs.forEach(userId => {
        const userFolder = path.join(dataDir, userId);
        const userlistDbPath = path.join(userFolder, "Userlist.db");
        
        // Kreiraj userlist tabelu ako ne postoji
        if (!fs.existsSync(userlistDbPath)) {
            try {
                const userlistDb = new Database(userlistDbPath);
                userlistDb.prepare(`
                    CREATE TABLE IF NOT EXISTS userlist (
                        id INTEGER PRIMARY KEY,
                        username TEXT NOT NULL,
                        unread_messages INTEGER DEFAULT 0,
                        last_message_at TEXT
                    );
                `).run();
                userlistDb.close();
                console.log(`✅ Created Userlist.db for user: ${userId}`);
            } catch (err) {
                console.error(`❌ Error creating Userlist.db for user ${userId}:`, err);
            }
        } else {
            // Proveri da li tabela ima sve potrebne kolone
            try {
                const userlistDb = new Database(userlistDbPath);
                const pragma = userlistDb.prepare("PRAGMA table_info(userlist)").all();
                const hasLastMessageAt = pragma.some(col => col.name === 'last_message_at');
                
                if (!hasLastMessageAt) {
                    userlistDb.prepare('ALTER TABLE userlist ADD COLUMN last_message_at TEXT').run();
                    console.log(`✅ Added last_message_at column to Userlist.db for user: ${userId}`);
                }
                
                userlistDb.close();
            } catch (err) {
                console.error(`❌ Error checking Userlist.db for user ${userId}:`, err);
            }
        }
    });
}

export default initUserlistForAllUsers;
