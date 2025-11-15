/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'PASSIVE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('ETF', 'STOCK', 'COMMODITY', 'BOND', 'CRYPTO');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('USD', 'EURO', 'TRY');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" SERIAL NOT NULL,
    "totalPortfolioInvestmentByUSD" DOUBLE PRECISION NOT NULL,
    "totalPortfolioInvestmentByEURO" DOUBLE PRECISION NOT NULL,
    "totalPortfolioInvestmentByTRY" DOUBLE PRECISION NOT NULL,
    "totalPortfolioQuantity" DOUBLE PRECISION NOT NULL,
    "averageCostByUSD" DOUBLE PRECISION NOT NULL,
    "averageCostByEURO" DOUBLE PRECISION NOT NULL,
    "averageCostByTRY" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "isActive" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalAssetInvestmentByUSD" DOUBLE PRECISION NOT NULL,
    "totalAssetInvestmentByEURO" DOUBLE PRECISION NOT NULL,
    "totalAssetInvestmentByTRY" DOUBLE PRECISION NOT NULL,
    "totalAssetQuantity" DOUBLE PRECISION NOT NULL,
    "averageCostByUSD" DOUBLE PRECISION NOT NULL,
    "averageCostByEURO" DOUBLE PRECISION NOT NULL,
    "averageCostByTRY" DOUBLE PRECISION NOT NULL,
    "initalWeight" DOUBLE PRECISION NOT NULL,
    "portfolioId" INTEGER,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceCurrency" "CurrencyType" NOT NULL,
    "usdtry" DOUBLE PRECISION NOT NULL,
    "eurusd" DOUBLE PRECISION NOT NULL,
    "investment" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "assetId" INTEGER,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
