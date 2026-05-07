-- AlterTable
ALTER TABLE "athletes" DROP COLUMN IF EXISTS "dietaryRestriction",
DROP COLUMN IF EXISTS "dietaryAllergy";

-- DropEnum
DROP TYPE IF EXISTS "DietaryRestriction";
