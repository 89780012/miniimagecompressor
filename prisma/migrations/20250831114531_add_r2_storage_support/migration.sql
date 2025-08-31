-- AlterTable
ALTER TABLE "public"."image_compressions" ADD COLUMN     "compressedR2Key" TEXT,
ADD COLUMN     "compressedR2Url" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "originalR2Key" TEXT,
ADD COLUMN     "originalR2Url" TEXT,
ALTER COLUMN "originalPath" DROP NOT NULL;
