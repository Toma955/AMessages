const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Test funkcija za slanje poruke od korisnika 3
function sendTestMessageFromUser3() {
    console.log("🧪 Testing sending message from user 3...\n");
    
    const senderId = 3;  // Test2
    const receiverId = 1; // Test
    const message = "Hello from Test2 (user 3) to Test (user 1)!";
    
    console.log(`📤 Sending message from user ${senderId} to user ${receiverId}: "${message}"`);
    
    const timestamp = new Date().toISOString();
    const payload = {
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        sent_at: timestamp,
        status: "sent",
        direction: "outgoing"
    };
    
    const paths = [
        path.resolve(__dirname, `database/users/${senderId}/chat/${receiverId}/hot.db`),
        path.resolve(__dirname, `database/users/${receiverId}/chat/${senderId}/hot.db`)
    ];
    
    console.log("🗄️ Database paths:");
    paths.forEach((path, index) => {
        console.log(`  ${index + 1}. ${path}`);
    });
    
    for (const dbPath of paths) {
        console.log(`\n🗄️ Processing database: ${dbPath}`);
        
        if (!fs.existsSync(dbPath)) {
            console.log(`🗄️ Creating database: ${dbPath}`);
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
                console.log(`✅ Created directory: ${dbDir}`);
            }
            const db = new Database(dbPath);
            db.prepare(`
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sender_id INTEGER NOT NULL,
                    receiver_id INTEGER NOT NULL,
                    message TEXT NOT NULL,
                    sent_at TEXT NOT NULL,
                    status TEXT NOT NULL,
                    direction TEXT NOT NULL
                );
            `).run();
            db.close();
            console.log(`✅ Created database and table`);
        }
        
        const db = new Database(dbPath);
        const result = db.prepare(`
            INSERT INTO messages (sender_id, receiver_id, message, sent_at, status, direction)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            payload.sender_id,
            payload.receiver_id,
            payload.message,
            payload.sent_at,
            payload.status,
            payload.direction
        );
        console.log(`✅ Inserted message into database:`, result);
        db.close();
    }
    
    console.log("\n✅ Message sent successfully!");
}

// Pokreni test
sendTestMessageFromUser3(); 