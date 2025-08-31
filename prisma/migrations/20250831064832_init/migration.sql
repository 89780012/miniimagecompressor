-- CreateEnum
CREATE TYPE "public"."CompressionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."image_compressions" (
    "id" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "originalFileSize" INTEGER NOT NULL,
    "originalMimeType" TEXT NOT NULL,
    "originalWidth" INTEGER,
    "originalHeight" INTEGER,
    "originalPath" TEXT NOT NULL,
    "targetSizeKb" INTEGER,
    "quality" INTEGER,
    "format" TEXT,
    "compressedFileSize" INTEGER,
    "compressedWidth" INTEGER,
    "compressedHeight" INTEGER,
    "compressedPath" TEXT,
    "compressionRatio" DOUBLE PRECISION,
    "status" "public"."CompressionStatus" NOT NULL DEFAULT 'PENDING',
    "processingTime" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_compressions_pkey" PRIMARY KEY ("id")
);
