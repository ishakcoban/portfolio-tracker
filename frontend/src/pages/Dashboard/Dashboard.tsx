import React, { useEffect, useRef, useState } from "react";
import "./Dashboard.scss";
import Asset from "../../components/Asset/Asset";
import PortfolioStats from "../../components/PortfolioStats/PortfolioStats";
import httpService from "../../services/httpService";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
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
  symbol: string;
  imageUrl: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentEURO: number;
  totalRawInvestmentByTRY: number;
  totalQuantity: number;
  averageCostByUSD: number;
  averageCostByEURO: number;
  averageCostByTRY: number;
  initalWeight: number;
  currentPrice: number;
  currentROI: number;
  currentEarning: number;
  currentWeight: number;
  currentInvestment: number;
};
export default function Dashboard() {
  const [assetData, setAssetData] = useState<Asset[] | null>(null);
  const [portfolioStatsData, setPortfolioStatsData] = useState<string | null>(
    null
  );
  const [diff, setDiff] = useState(12);
  const [value, setValue] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const assetDataRef = useRef<Asset[] | null>(null);

  const fetchData = async () => {
    try {
      const response = await httpService.get(`/portfolios/2`);
      if (response.status === 200) {
        const { assets, ...portfolioStats } = response.data;

        setPortfolioStatsData(portfolioStats);
        setAssetData(assets);
        assetDataRef.current = assets;
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
        // setMessage("Invalid input!");
        // setStatusCode(error.status);
      }
    }
  };

  const fetchAssetLiveData = async () => {
    if (assetDataRef.current) {
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
          const updatedAssetData = assetDataRef.current.map((asset, index) => ({
            ...asset,
            currentPrice:
              response.data[index]?.currentPrice ?? asset.currentPrice,
            currentROI: response.data[index]?.currentROI ?? asset.currentROI,
            currentEarning:
              response.data[index]?.currentEarning ?? asset.currentEarning,
            currentInvestment:
              response.data[index]?.currentInvestment ??
              asset.currentInvestment,
            currentWeight:
              response.data[index]?.currentWeight ?? asset.currentWeight,
          }));

          setAssetData(updatedAssetData);
          assetDataRef.current = updatedAssetData;
          console.log(assetDataRef.current);
          //  setSelectedPortfolio("");
          //  setSelectedAsset("");
          //  setPrice(0);
          //  setInvestmentAmount(0);
          //  setDate("");
          //  setStatusCode(response.status);
          //  onSuccess("transaction created!");
          //  closePopup();
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error.response.data);
          // setMessage("Invalid input!");
          // setStatusCode(error.status);
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
      <div className="col-3 m-0 p-0 portfolio-stat-wrapper">
        <div className="row m-0  py-3">
          <div className="col-12 m-0 p-0 pe-3">
            <PortfolioStats portfolioStats={portfolioStatsData} />
          </div>
        </div>
      </div>
    </div>
  );
}
