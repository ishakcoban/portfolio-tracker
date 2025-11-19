/*
  Warnings:

  - Added the required column `imageUrl` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "imageUrl" TEXT NOT NULL,
ALTER COLUMN "totalAssetInvestmentByUSD" SET DEFAULT 0,
ALTER COLUMN "totalAssetInvestmentByEURO" SET DEFAULT 0,
ALTER COLUMN "totalAssetInvestmentByTRY" SET DEFAULT 0,
ALTER COLUMN "totalAssetQuantity" SET DEFAULT 0,
ALTER COLUMN "averageCostByUSD" SET DEFAULT 0,
ALTER COLUMN "averageCostByEURO" SET DEFAULT 0,
ALTER COLUMN "averageCostByTRY" SET DEFAULT 0;
