-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" "CancelledBy";
