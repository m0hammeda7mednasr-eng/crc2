// Generate Admin Password Hash
// Usage: node generate-admin-hash.js [password]

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'Admin@123456';

console.log('\n========================================');
console.log('🔐 Admin Password Hash Generator');
console.log('========================================\n');

console.log('Password:', password);
console.log('\nGenerating hash...\n');

const hash = bcrypt.hashSync(password, 10);

console.log('Hash:', hash);
console.log('\n========================================');
console.log('📝 Use this in Supabase:');
console.log('========================================\n');
console.log('1. Open Supabase Dashboard');
console.log('2. Table Editor → users');
console.log('3. Insert row:');
console.log('   - email: admin@crm.com');
console.log('   - username: admin');
console.log('   - passwordHash:', hash);
console.log('   - role: ADMIN');
console.log('\n========================================\n');
