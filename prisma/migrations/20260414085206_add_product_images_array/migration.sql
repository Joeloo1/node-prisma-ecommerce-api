-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
