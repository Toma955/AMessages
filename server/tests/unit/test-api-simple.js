// Jednostavna test skripta koja koristi built-in fetch (Node.js 18+)
// Pokreni s: node test-api-simple.js

async function testGetMessages(userId, otherId) {
    console.log(`\n🔍 Testing GET /api/messages/${otherId} for user ${userId}`);
    
    try {
        const response = await fetch(`http://localhost:5000/api/messages/${otherId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Response status: ${response.status}`);
        const data = await response.json();
        console.log(`📡 Response data:`, data);
        
        if (data.success && Array.isArray(data.data)) {
            console.log(`✅ Found ${data.data.length} messages`);
            data.data.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.sent_at}] ${msg.sender_id} -> ${msg.receiver_id}: "${msg.message}"`);
            });
        } else {
            console.log(`❌ Invalid response format`);
        }
        
        return data;
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        return null;
    }
}

async function testGetUserlist(userId) {
    console.log(`\n📋 Testing GET /api/users/userlist for user ${userId}`);
    
    try {
        const response = await fetch('http://localhost:5000/api/users/userlist', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Response status: ${response.status}`);
        const data = await response.json();
        console.log(`📡 Response data:`, data);
        
        if (data.success && Array.isArray(data.userlist)) {
            console.log(`✅ Found ${data.userlist.length} users in userlist`);
            data.userlist.forEach((user, index) => {
                console.log(`  ${index + 1}. ID: ${user.id}, Username: ${user.username}, Unread: ${user.unread_messages}`);
            });
        } else {
            console.log(`❌ Invalid response format`);
        }
        
        return data;
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        return null;
    }
}

async function runApiTests() {
    console.log("🧪 Starting API tests (without authentication)...\n");
    
    // Test 1: Dohvati userlist (bez auth)
    await testGetUserlist(2);
    
    // Test 2: Dohvati poruke između korisnika 2 i 1 (bez auth)
    await testGetMessages(2, 1);
    
    console.log("\n✅ API tests completed!");
    console.log("\n💡 Note: These tests are without authentication, so they might fail.");
    console.log("💡 To test with real authentication, you need to:");
    console.log("   1. Login to the app in browser");
    console.log("   2. Open DevTools -> Application -> Local Storage");
    console.log("   3. Copy the 'token' value");
    console.log("   4. Use that token in the Authorization header");
}

// Pokreni testove
runApiTests(); 