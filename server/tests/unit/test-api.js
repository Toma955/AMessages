import fetch from 'node-fetch';

// Simuliraj JWT token (možda trebate stvarni token)
const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJUZXN0MiIsImlhdCI6MTczMDAwMDAwMCwiZXhwIjoxNzMwMDg2NDAwfQ.test";

async function testGetMessages(userId, otherId) {
    console.log(`\n🔍 Testing GET /api/messages/${otherId} for user ${userId}`);
    
    try {
        const response = await fetch(`http://localhost:5000/api/messages/${otherId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
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

async function testSendMessage(senderId, receiverId, message) {
    console.log(`\n📤 Testing POST /api/messages/send from ${senderId} to ${receiverId}: "${message}"`);
    
    try {
        const response = await fetch('http://localhost:5000/api/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                receiverId: receiverId,
                message: message
            })
        });
        
        console.log(`📡 Response status: ${response.status}`);
        const data = await response.json();
        console.log(`📡 Response data:`, data);
        
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
                'Authorization': `Bearer ${TEST_TOKEN}`,
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
    console.log("🧪 Starting API tests...\n");
    
    // Test 1: Dohvati userlist
    await testGetUserlist(2);
    
    // Test 2: Dohvati poruke između korisnika 2 i 1
    await testGetMessages(2, 1);
    
    // Test 3: Pošalji novu poruku
    await testSendMessage(2, 1, "Test message from API");
    
    // Test 4: Ponovno dohvati poruke
    await testGetMessages(2, 1);
    
    console.log("\n✅ API tests completed!");
}

// Pokreni testove ako se skripta pokreće direktno
if (import.meta.url === `file://${process.argv[1]}`) {
    runApiTests();
}

export {
    testGetMessages,
    testSendMessage,
    testGetUserlist,
    runApiTests
}; 