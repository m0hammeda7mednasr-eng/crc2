const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUsage() {
  try {
    console.log('Updating usage counts...\n');

    const users = await prisma.user.findMany({
      where: {
        role: 'user',
        subscriptionId: { not: null },
      },
      include: {
        subscription: true,
        _count: {
          select: {
            customers: true,
            orders: true,
          },
        },
      },
    });

    for (const user of users) {
      if (!user.subscription) continue;

      // Count messages for this user
      const messageCount = await prisma.message.count({
        where: {
          customer: {
            userId: user.id,
          },
        },
      });

      // Update subscription usage
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          usedCustomers: user._count.customers,
          usedMessages: messageCount,
          usedOrders: user._count.orders,
        },
      });

      console.log(`✅ Updated usage for ${user.email}:`);
      console.log(`   Customers: ${user._count.customers}`);
      console.log(`   Messages: ${messageCount}`);
      console.log(`   Orders: ${user._count.orders}\n`);
    }

    console.log('✅ All done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsage();
