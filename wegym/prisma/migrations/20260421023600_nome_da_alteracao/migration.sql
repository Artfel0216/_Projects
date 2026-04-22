-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('confirmed', 'pending', 'canceled');

-- AlterTable
ALTER TABLE "athletes" ADD COLUMN     "personalId" UUID;

-- CreateTable
CREATE TABLE "training_plans" (
    "id" UUID NOT NULL,
    "athleteId" UUID NOT NULL,
    "day" VARCHAR(10) NOT NULL,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sets" VARCHAR(10) NOT NULL,
    "reps" VARCHAR(10) NOT NULL,
    "load" VARCHAR(20) NOT NULL,
    "planId" UUID NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_entries" (
    "id" UUID NOT NULL,
    "athleteId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" VARCHAR(20) NOT NULL,
    "muscleMass" TEXT,
    "bodyFat" TEXT,
    "note" TEXT,

    CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_classes" (
    "id" UUID NOT NULL,
    "athleteId" UUID NOT NULL,
    "day" VARCHAR(10) NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "time" VARCHAR(10) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" "ClassStatus" NOT NULL,

    CONSTRAINT "weekly_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_plans_athleteId_idx" ON "training_plans"("athleteId");

-- CreateIndex
CREATE INDEX "progress_entries_athleteId_idx" ON "progress_entries"("athleteId");

-- CreateIndex
CREATE INDEX "weekly_classes_athleteId_idx" ON "weekly_classes"("athleteId");

-- CreateIndex
CREATE INDEX "athletes_state_city_idx" ON "athletes"("state", "city");

-- CreateIndex
CREATE INDEX "athletes_personalId_idx" ON "athletes"("personalId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "personal_trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_planId_fkey" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_classes" ADD CONSTRAINT "weekly_classes_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
