/*
  Warnings:

  - You are about to drop the column `totalAssetInvestmentByEURO` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `totalAssetInvestmentByTRY` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `totalAssetInvestmentByUSD` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `totalAssetQuantity` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `totalPortfolioInvestmentByEURO` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `totalPortfolioInvestmentByTRY` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `totalPortfolioInvestmentByUSD` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `totalPortfolioQuantity` on the `Portfolio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "totalAssetInvestmentByEURO",
DROP COLUMN "totalAssetInvestmentByTRY",
DROP COLUMN "totalAssetInvestmentByUSD",
DROP COLUMN "totalAssetQuantity",
ADD COLUMN     "totalQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRawInvestmentByEURO" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRawInvestmentByTRY" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRawInvestmentByUSD" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "totalPortfolioInvestmentByEURO",
DROP COLUMN "totalPortfolioInvestmentByTRY",
DROP COLUMN "totalPortfolioInvestmentByUSD",
DROP COLUMN "totalPortfolioQuantity",
ADD COLUMN     "totalQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRawInvestmentByEURO" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRawInvestmentByTRY" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRawInvestmentByUSD" DOUBLE PRECISION NOT NULL DEFAULT 0;
