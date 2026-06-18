-- Add reset token fields for forgot password flow
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS "users_resetToken_key" ON "users"("resetToken");
