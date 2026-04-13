-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('atleta', 'personal');

-- CreateEnum
CREATE TYPE "UserSex" AS ENUM ('masculino', 'feminino', 'outro');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('iniciante', 'intermediario', 'avancado');

-- CreateEnum
CREATE TYPE "DietaryRestriction" AS ENUM ('nenhuma', 'vegetariano', 'vegano', 'lactose', 'alergia');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athletes" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "cep" VARCHAR(9) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" CHAR(2) NOT NULL,
    "age" SMALLINT NOT NULL,
    "sex" "UserSex" NOT NULL,
    "heightCm" SMALLINT NOT NULL,
    "weightKg" DECIMAL(5,2) NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "dietaryRestriction" "DietaryRestriction" NOT NULL,
    "dietaryAllergy" TEXT,
    "injury" TEXT,
    "healthIssues" TEXT,
    "medications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_trainers" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cref" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_userId_key" ON "athletes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_cpf_key" ON "athletes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "personal_trainers_userId_key" ON "personal_trainers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "personal_trainers_cref_key" ON "personal_trainers"("cref");

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_trainers" ADD CONSTRAINT "personal_trainers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
