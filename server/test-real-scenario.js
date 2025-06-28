const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Simuliraj stvarni scenario iz aplikacije
function testRealScenario() {
    console.log("🧪 Testing real scenario from application...\n");
    
    // Scenario: Test2 (ID: 3) pokušava dohvatiti poruke za Test (ID: 1) i Test1 (ID: 2)
    const currentUserId = 3;  // Test2 (stvarni ID iz JWT tokena)
    const otherUserId1 = 1;   // Test
    const otherUserId2 = 2;   // Test1
    
    console.log(`👤 Current user (logged in): ${currentUserId} (Test2)`);
    console.log(`👤 Other user 1 (chat target): ${otherUserId1} (Test)`);
    console.log(`👤 Other user 2 (chat target): ${otherUserId2} (Test1)`);
    
    // Test 1: Provjeri bazu podataka za korisnika 3 i 1
    console.log("\n" + "=".repeat(50));
    console.log("Test 1: Database for user 3 -> user 1");
    const dbPath1 = path.resolve(__dirname, `database/users/${currentUserId}/chat/${otherUserId1}/hot.db`);
    console.log(`🗄️ Database path: ${dbPath1}`);
    console.log(`🗄️ Database exists: ${fs.existsSync(dbPath1)}`);
    
    if (fs.existsSync(dbPath1)) {
        try {
            const db = new Database(dbPath1);
            const messages = db.prepare("SELECT * FROM messages ORDER BY sent_at ASC").all();
            console.log(`📝 Found ${messages.length} messages in database:`);
            
            messages.forEach((msg, index) => {
                console.log(`  ${index + 1}. ID: ${msg.id}, Sender: ${msg.sender_id}, Receiver: ${msg.receiver_id}, Message: "${msg.message}", Time: ${msg.sent_at}, Status: ${msg.status}, Direction: ${msg.direction}`);
            });
            
            db.close();
        } catch (err) {
            console.log(`❌ Error reading database: ${err.message}`);
        }
    } else {
        console.log("❌ Database does not exist!");
    }
    
    // Test 2: Provjeri bazu podataka za korisnika 3 i 2
    console.log("\n" + "=".repeat(50));
    console.log("Test 2: Database for user 3 -> user 2");
    const dbPath2 = path.resolve(__dirname, `database/users/${currentUserId}/chat/${otherUserId2}/hot.db`);
    console.log(`🗄️ Database path: ${dbPath2}`);
    console.log(`🗄️ Database exists: ${fs.existsSync(dbPath2)}`);
    
    if (fs.existsSync(dbPath2)) {
        try {
            const db = new Database(dbPath2);
            const messages = db.prepare("SELECT * FROM messages ORDER BY sent_at ASC").all();
            console.log(`📝 Found ${messages.length} messages in database:`);
            
            messages.forEach((msg, index) => {
                console.log(`  ${index + 1}. ID: ${msg.id}, Sender: ${msg.sender_id}, Receiver: ${msg.receiver_id}, Message: "${msg.message}", Time: ${msg.sent_at}, Status: ${msg.status}, Direction: ${msg.direction}`);
            });
            
            db.close();
        } catch (err) {
            console.log(`❌ Error reading database: ${err.message}`);
        }
    } else {
        console.log("❌ Database does not exist!");
    }
    
    // Test 3: Provjeri obrnute baze podataka
    console.log("\n" + "=".repeat(50));
    console.log("Test 3: Reverse databases");
    
    const reverseDbPath1 = path.resolve(__dirname, `database/users/${otherUserId1}/chat/${currentUserId}/hot.db`);
    console.log(`🗄️ Reverse database 1 path: ${reverseDbPath1}`);
    console.log(`🗄️ Reverse database 1 exists: ${fs.existsSync(reverseDbPath1)}`);
    
    const reverseDbPath2 = path.resolve(__dirname, `database/users/${otherUserId2}/chat/${currentUserId}/hot.db`);
    console.log(`🗄️ Reverse database 2 path: ${reverseDbPath2}`);
    console.log(`🗄️ Reverse database 2 exists: ${fs.existsSync(reverseDbPath2)}`);
}

// Pokreni test
testRealScenario(); 