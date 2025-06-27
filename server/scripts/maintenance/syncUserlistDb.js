const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const usersDir = path.resolve(__dirname, '../../database/users');

function migrateUserlistDb(userId) {
    const dbPath = path.join(usersDir, userId, 'Userlist.db');
    if (!fs.existsSync(dbPath)) return;
    const db = new Database(dbPath);
    // Provjeri postoji li kolona last_message_at
    const pragma = db.prepare("PRAGMA table_info(userlist)").all();
    const hasLastMessageAt = pragma.some(col => col.name === 'last_message_at');
    if (!hasLastMessageAt) {
        db.prepare('ALTER TABLE userlist ADD COLUMN last_message_at TEXT').run();
        console.log(`Migrated Userlist.db for user ${userId}`);
    } else {
        console.log(`Userlist.db for user ${userId} already migrated.`);
    }
    db.close();
}

fs.readdirSync(usersDir).forEach(userId => {
    if (fs.existsSync(path.join(usersDir, userId, 'Userlist.db'))) {
        migrateUserlistDb(userId);
    }
});

console.log('Userlist.db migration complete.'); 