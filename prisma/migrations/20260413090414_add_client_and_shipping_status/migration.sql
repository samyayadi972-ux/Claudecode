/*
  Warnings:

  - You are about to drop the column `jobTitle` on the `Client` table. All the data in the column will be lost.
  - Added the required column `clientStatus` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingStatus` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PROSPECT', 'EN_COURS', 'CLIENT');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('NOT_SHIPPED', 'FIRST_SHIPPING', 'SHIPPED');

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "jobTitle",
ADD COLUMN     "amazonStoreName" TEXT,
ADD COLUMN     "clientStatus" "ClientStatus" NOT NULL,
ADD COLUMN     "shippingStatus" "ShippingStatus" NOT NULL;
