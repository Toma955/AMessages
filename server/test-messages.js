const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Test funkcija za provjeru strukture baze podataka
function testDatabaseStructure() {
    console.log("🔍 Testing database structure...");
    
    // Provjeri korisnike
    const usersDir = path.resolve(__dirname, "database/users");
    console.log("📁 Users directory:", usersDir);
    console.log("📁 Users directory exists:", fs.existsSync(usersDir));
    
    if (fs.existsSync(usersDir)) {
        const users = fs.readdirSync(usersDir);
        console.log("👥 Found users:", users);
        
        for (const userId of users) {
            console.log(`\n🔍 Checking user ${userId}:`);
            
            const userDir = path.join(usersDir, userId);
            const chatDir = path.join(userDir, "chat");
            const userlistPath = path.join(userDir, "Userlist.db");
            
            console.log(`  📁 Chat directory: ${chatDir}`);
            console.log(`  📁 Chat directory exists: ${fs.existsSync(chatDir)}`);
            console.log(`  📄 Userlist.db exists: ${fs.existsSync(userlistPath)}`);
            
            if (fs.existsSync(chatDir)) {
                const chatDirs = fs.readdirSync(chatDir);
                console.log(`  📁 Chat directories: ${chatDirs}`);
                
                for (const otherId of chatDirs) {
                    const hotDbPath = path.join(chatDir, otherId, "hot.db");
                    console.log(`    🗄️ Hot database: ${hotDbPath}`);
                    console.log(`    🗄️ Hot database exists: ${fs.existsSync(hotDbPath)}`);
                    
                    if (fs.existsSync(hotDbPath)) {
                        try {
                            const db = new Database(hotDbPath);
                            const messages = db.prepare("SELECT * FROM messages").all();
                            console.log(`    📝 Messages count: ${messages.length}`);
                            if (messages.length > 0) {
                                console.log(`    📝 Sample message:`, messages[0]);
                            }
                            db.close();
                        } catch (err) {
                            console.log(`    ❌ Error reading database: ${err.message}`);
                        }
                    }
                }
            }
            
            if (fs.existsSync(userlistPath)) {
                try {
                    const db = new Database(userlistPath);
                    const userlist = db.prepare("SELECT * FROM userlist").all();
                    console.log(`  📋 Userlist entries: ${userlist.length}`);
                    if (userlist.length > 0) {
                        console.log(`  📋 Userlist sample:`, userlist[0]);
                    }
                    db.close();
                } catch (err) {
                    console.log(`  ❌ Error reading userlist: ${err.message}`);
                }
            }
        }
    }
}

// Test funkcija za slanje test poruke
function sendTestMessage(senderId, receiverId, message) {
    console.log(`\n📤 Sending test message from ${senderId} to ${receiverId}: "${message}"`);
    
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
    
    for (const dbPath of paths) {
        console.log(`🗄️ Processing database: ${dbPath}`);
        
        if (!fs.existsSync(dbPath)) {
            console.log(`🗄️ Creating database: ${dbPath}`);
            const dbDir = path.dirname(dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
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
}

// Test funkcija za dohvaćanje poruka
function getTestMessages(userId, otherId) {
    console.log(`\n📥 Getting messages between user ${userId} and ${otherId}`);
    
    const dbPath = path.resolve(__dirname, `database/users/${userId}/chat/${otherId}/hot.db`);
    console.log(`🗄️ Database path: ${dbPath}`);
    console.log(`🗄️ Database exists: ${fs.existsSync(dbPath)}`);
    
    if (fs.existsSync(dbPath)) {
        try {
            const db = new Database(dbPath);
            const messages = db.prepare("SELECT * FROM messages ORDER BY sent_at ASC").all();
            console.log(`📝 Found ${messages.length} messages:`);
            messages.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.sent_at}] ${msg.sender_id} -> ${msg.receiver_id}: "${msg.message}"`);
            });
            db.close();
            return messages;
        } catch (err) {
            console.log(`❌ Error reading messages: ${err.message}`);
            return [];
        }
    } else {
        console.log(`❌ Database does not exist`);
        return [];
    }
}

// Glavna test funkcija
function runTests() {
    console.log("🧪 Starting message system tests...\n");
    
    // Test 1: Provjeri strukturu baze podataka
    testDatabaseStructure();
    
    // Test 2: Pošalji test poruke
    console.log("\n" + "=".repeat(50));
    sendTestMessage(2, 1, "Hello from Test2 to Test1!");
    sendTestMessage(1, 2, "Hello from Test1 to Test2!");
    sendTestMessage(2, 1, "How are you doing?");
    
    // Test 3: Dohvati poruke
    console.log("\n" + "=".repeat(50));
    getTestMessages(2, 1); // Poruke iz perspektive Test2
    getTestMessages(1, 2); // Poruke iz perspektive Test1
    
    console.log("\n✅ Tests completed!");
}

// Pokreni testove ako se skripta pokreće direktno
if (require.main === module) {
    runTests();
}

module.exports = {
    testDatabaseStructure,
    sendTestMessage,
    getTestMessages,
    runTests
}; 