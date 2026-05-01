/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,product_id]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_id` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "productId",
ADD COLUMN     "product_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productId",
ADD COLUMN     "product_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "productId",
ADD COLUMN     "product_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_product_id_key" ON "Review"("userId", "product_id");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;
