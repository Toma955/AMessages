// Test skripta s pravim JWT tokenom iz browsera
// Token za korisnika ID: 3 (Test2)

const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJUZXN0MiIsInJvbGUiOiJ1c2VyIiwiaXAiOiI6OjEiLCJpYXQiOjE3NTEwODA2MjksImV4cCI6MTc1MTE2NzAyOX0.W8VcHCgiZ3Gwn5pfD71DZvGJyR3OhYSpF6yRIvcAnXU";

async function testWithRealToken() {
    console.log("🧪 Testing with real JWT token...\n");
    console.log("👤 Token is for user ID: 3 (Test2)\n");
    
    try {
        // Test 1: Dohvati poruke između korisnika 3 i 1
        console.log("📥 Testing GET /api/messages/1 (Test2 -> Test)");
        
        const response = await fetch('http://localhost:5000/api/messages/1', {
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
            if (data.message) {
                console.log(`❌ Error message: ${data.message}`);
            }
        }
        
        // Test 2: Dohvati poruke između korisnika 3 i 2
        console.log("\n📥 Testing GET /api/messages/2 (Test2 -> Test1)");
        
        const response2 = await fetch('http://localhost:5000/api/messages/2', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Response status: ${response2.status}`);
        const data2 = await response2.json();
        console.log(`📡 Response data:`, data2);
        
        if (data2.success && Array.isArray(data2.data)) {
            console.log(`✅ Found ${data2.data.length} messages`);
            data2.data.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.sent_at}] ${msg.sender_id} -> ${msg.receiver_id}: "${msg.message}"`);
            });
        } else {
            console.log(`❌ Invalid response format`);
            if (data2.message) {
                console.log(`❌ Error message: ${data2.message}`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error:`, error.message);
    }
}

// Pokreni test
testWithRealToken(); 