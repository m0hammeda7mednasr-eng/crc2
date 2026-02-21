-- Add new fields to Customer table
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "profileImage" TEXT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "unreadCount" INTEGER NOT NULL DEFAULT 0;

-- Create index for sorting by last activity
CREATE INDEX IF NOT EXISTS "customers_userId_updatedAt_idx" ON "customers"("userId", "updatedAt" DESC);

-- Create MessageStatus enum
DO $$ BEGIN
    CREATE TYPE "MessageStatus" AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to Message table
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "status" "MessageStatus" NOT NULL DEFAULT 'sent';
