const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crm.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    console.log('Testing admin login...');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('');

    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('');

    // Test password
    const isValid = await bcrypt.compare(adminPassword, admin.passwordHash);
    
    if (isValid) {
      console.log('✅ Password is correct!');
      console.log('');
      console.log('You can login with:');
      console.log('   Email:', adminEmail);
      console.log('   Password:', adminPassword);
    } else {
      console.log('❌ Password is incorrect!');
      console.log('');
      console.log('Resetting password...');
      
      const newPasswordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          passwordHash: newPasswordHash,
          role: 'admin', // Ensure role is admin
        },
      });
      
      console.log('✅ Password reset successfully!');
      console.log('   New password:', adminPassword);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
