/*
  Warnings:

  - You are about to drop the column `shopifyApiKey` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "shopifyDomain" TEXT,
    "shopifyClientId" TEXT,
    "shopifyClientSecret" TEXT,
    "shopifyAccessToken" TEXT,
    "shopifyWebhookId" TEXT,
    "n8nWebhookUrl" TEXT,
    "n8nWebhookSecret" TEXT,
    "subscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "email", "id", "n8nWebhookSecret", "n8nWebhookUrl", "passwordHash", "role", "shopifyAccessToken", "shopifyDomain", "shopifyWebhookId", "subscriptionId", "updatedAt", "username") SELECT "createdAt", "email", "id", "n8nWebhookSecret", "n8nWebhookUrl", "passwordHash", "role", "shopifyAccessToken", "shopifyDomain", "shopifyWebhookId", "subscriptionId", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_subscriptionId_idx" ON "users"("subscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
