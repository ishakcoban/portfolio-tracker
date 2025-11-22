import React, { useEffect, useRef, useState } from "react";
import "./Dashboard.scss";
import Asset from "../../components/Asset/Asset";
import PortfolioStats from "../../components/PortfolioStats/PortfolioStats";
import httpService from "../../services/httpService";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

type Portfolio = {
  id: number;
  name: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentByEURO: number;
  totalRawInvestmentByTRY: number;
  assets: Asset[];
};

type Asset = {
  id: number;
  symbol: string;
  type: string;
  imageUrl: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentEURO: number;
  totalRawInvestmentByTRY: number;
  totalQuantity: number;
  averageCostByUSD: number;
  averageCostByEURO: number;
  averageCostByTRY: number;
  initialWeight: number;
  currentPrice: number;
  currentROI: number;
  currentEarning: number;
  currentWeight: number;
  currentInvestment: number;
};

type PortfolioStats = {
  id: number;
  name: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentByEURO: number;
  totalRawInvestmentByTRY: number;
  currentROI: number;
  currentEarning: number;
  currentInvestment: number;
  portfolioPie: {
    label: string;
    value: number;
  }[];
};
export default function Dashboard() {
  const [assetData, setAssetData] = useState<Asset[] | null>(null);
  const [portfolioStatsData, setPortfolioStatsData] =
    useState<PortfolioStats | null>(null);
  const [diff, setDiff] = useState(12);
  const [value, setValue] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const assetDataRef = useRef<Asset[] | null>(null);
  const portfolioStatsDataRef = useRef<PortfolioStats | null>(null);

  const fetchData = async () => {
    try {
      const response = await httpService.get(`/portfolios/6`);
      if (response.status === 200) {
        console.log(response.data);
        const { assets, ...portfolioStats } = response.data;

        setPortfolioStatsData(portfolioStats);
        setAssetData(assets);
        assetDataRef.current = assets;
        portfolioStatsDataRef.current = portfolioStats;
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
      }
    }
  };

  function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result as Omit<T, K>;
  }
  const fetchAssetLiveData = async () => {
    if (assetDataRef.current && portfolioStatsDataRef.current) {
      try {
        const filteredAssetData = assetDataRef.current.map(
          ({
            id,
            symbol,
            type,
            averageCostByUSD,
            totalRawInvestmentByUSD,
          }) => ({
            id,
            symbol,
            type,
            averageCostByUSD,
            totalRawInvestmentByUSD,
          })
        );

        const response = await httpService.post(
          `/assets/current-market-price`,
          filteredAssetData
        );

        if (response.status === 201) {
          const target = omit(response.data, ["assets"]);
          const updatedPortfolioStatsData = (portfolioStatsDataRef.current = {
            ...portfolioStatsDataRef.current,
            ...target,
          });

          setPortfolioStatsData(updatedPortfolioStatsData);
          const updatedAssetData = assetDataRef.current.map((asset, index) => ({
            ...asset,
            currentPrice:
              response.data.assets[index]?.currentPrice ?? asset.currentPrice,
            currentROI:
              response.data.assets[index]?.currentROI ?? asset.currentROI,
            currentEarning:
              response.data.assets[index]?.currentEarning ??
              asset.currentEarning,
            currentInvestment:
              response.data.assets[index]?.currentInvestment ??
              asset.currentInvestment,
            currentWeight:
              response.data.assets[index]?.currentWeight ?? asset.currentWeight,
          }));

          setAssetData(updatedAssetData);
          assetDataRef.current = updatedAssetData;
          //console.log(assetDataRef.current);
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error.response.data);
        }
      }
    }
  };

  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(() => {
      fetchAssetLiveData();
    }, 2000);

    return () => clearInterval(intervalRef.current!);
  }, []);

  return (
    <div className="row m-0 p-0">
      <div className="col-9 m-0 p-0">
        {assetData ? (
          <div className="row m-0 ps-3">
            {assetData?.map((asset: Asset) => (
              <div key={asset.id} className="col-4 m-0 p-0 pt-3 pe-3">
                <Asset asset={asset} />
              </div>
            ))}
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
      <div className="col-3 m-0 py-3 ps-0 pe-3 portfolio-stat-wrapper">
        {portfolioStatsData && portfolioStatsData.currentInvestment != 0 ? (
          <PortfolioStats portfolioStats={portfolioStatsData} />
        ) : (
          <div className="d-flex align-items-center justify-content-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}
