const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSubscriptions() {
  try {
    console.log('Adding subscriptions to users...\n');

    // Get all users
    const users = await prisma.user.findMany({
      where: {
        role: 'user', // Only regular users, not admins
      },
    });

    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
      // Check if user already has subscription
      const existingSub = await prisma.subscription.findFirst({
        where: {
          users: {
            some: {
              id: user.id,
            },
          },
        },
      });

      if (existingSub) {
        console.log(`✅ ${user.email} already has subscription`);
        continue;
      }

      // Create subscription
      const subscription = await prisma.subscription.create({
        data: {
          planName: 'free',
          status: 'active',
          price: 0,
          billingCycle: 'monthly',
          maxCustomers: 10,
          maxMessages: 100,
          maxOrders: 50,
          usedCustomers: 0,
          usedMessages: 0,
          usedOrders: 0,
        },
      });

      // Link user to subscription
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionId: subscription.id,
        },
      });

      console.log(`✅ Created FREE subscription for ${user.email}`);
    }

    console.log('\n✅ All done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSubscriptions();
