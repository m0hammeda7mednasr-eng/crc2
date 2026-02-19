-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "price" REAL NOT NULL DEFAULT 0,
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "maxCustomers" INTEGER NOT NULL DEFAULT 10,
    "maxMessages" INTEGER NOT NULL DEFAULT 100,
    "maxOrders" INTEGER NOT NULL DEFAULT 50,
    "usedCustomers" INTEGER NOT NULL DEFAULT 0,
    "usedMessages" INTEGER NOT NULL DEFAULT 0,
    "usedOrders" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "shopifyDomain" TEXT,
    "shopifyApiKey" TEXT,
    "n8nWebhookUrl" TEXT,
    "subscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "email", "id", "n8nWebhookUrl", "passwordHash", "role", "shopifyApiKey", "shopifyDomain", "updatedAt") SELECT "createdAt", "email", "id", "n8nWebhookUrl", "passwordHash", "role", "shopifyApiKey", "shopifyDomain", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_subscriptionId_idx" ON "users"("subscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "subscriptions_planName_idx" ON "subscriptions"("planName");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
