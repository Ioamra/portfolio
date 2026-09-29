-- AlterEnum
-- Placée en tête : l'ordre des valeurs d'un enum PostgreSQL détermine le tri (ORDER BY category).
ALTER TYPE "SkillCategory" ADD VALUE 'LANGUAGE' BEFORE 'BACKEND';

-- AlterTable
ALTER TABLE "experiences" ALTER COLUMN "organization" DROP NOT NULL;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[];
