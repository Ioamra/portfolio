-- AlterTable
ALTER TABLE "profile" DROP COLUMN "interests",
DROP COLUMN "languages",
ADD COLUMN     "linkedin_url" VARCHAR(255);

