require('dotenv').config();

// Test admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

console.log('Environment check:');
console.log('ADMIN_USERNAME:', ADMIN_USERNAME);
console.log('ADMIN_PASSWORD:', ADMIN_PASSWORD);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Test admin login logic
const testUsername = 'admin';
const testPassword = 'admin';

console.log('\nTesting admin login:');
console.log('Test username:', testUsername);
console.log('Test password:', testPassword);
console.log('Username match:', testUsername === ADMIN_USERNAME);
console.log('Password match:', testPassword === ADMIN_PASSWORD);
console.log('Admin login should work:', testUsername === ADMIN_USERNAME && testPassword === ADMIN_PASSWORD); 