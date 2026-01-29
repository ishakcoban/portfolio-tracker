import { useEffect, useRef, useState } from "react";
import "./Dashboard.scss";
import PortfolioStats from "../../components/PortfolioStats/PortfolioStats";
import httpService from "../../services/httpService";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useStore } from "../../store";
import AssetBarChart from "../../components/Charts/BarChart/BarChart";
import TradingviewChart from "../../components/Charts/TradingviewChart/TradingviewChart";
import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import AssetListView from "../../components/Asset/AssetListView/AssetListView";
import AssetGridView from "../../components/Asset/AssetGridView/AssetGridView";
import YearlyChange from "../../components/YearlyChange/YearlyChange";

type Asset = {
  id: number;
  symbol: string;
  type: string;
  imageUrl: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentByEURO: number;
  totalRawInvestmentByTRY: number;
  totalQuantity: number;
  averageCostByUSD: number;
  averageCostByEURO: number;
  averageCostByTRY: number;
  initialWeight: number;
  currentPriceByUSD: number;
  currentPriceByEURO: number;
  currentPriceByTRY: number;
  currentROIByUSD: number;
  currentROIByEURO: number;
  currentROIByTRY: number;
  currentEarningByUSD: number;
  currentEarningByEURO: number;
  currentEarningByTRY: number;
  currentWeight: number;
  currentInvestmentByUSD: number;
  currentInvestmentByEURO: number;
  currentInvestmentByTRY: number;
};

type PortfolioStats = {
  id: number;
  name: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentByEURO: number;
  totalRawInvestmentByTRY: number;
  currentROIByUSD: number;
  currentROIByEURO: number;
  currentROIByTRY: number;
  currentEarningByUSD: number;
  currentEarningByEURO: number;
  currentEarningByTRY: number;
  currentInvestmentByUSD: number;
  currentInvestmentByEURO: number;
  currentInvestmentByTRY: number;
  annualizedAverageROIByUSD: number;
  annualizedAverageROIByEURO: number;
  annualizedAverageROIByTRY: number;
  portfolioPie: {
    label: string;
    value: number;
  }[];
};

type YearlyChange = {
  currentROIByUSD: number;
  currentROIByEURO: number;
  currentROIByTRY: number;
};
export default function Dashboard() {
  const [assetData, setAssetData] = useState<Asset[] | null>(null);
  const [selectedViewOption, setSelectedViewOption] = useState(true);
  const [portfolioStatsData, setPortfolioStatsData] =
    useState<PortfolioStats | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const assetDataRef = useRef<Asset[] | null>(null);
  const portfolioStatsDataRef = useRef<PortfolioStats | null>(null);
  const { pID, setCurrentInvestment } = useStore();

  const changeSelectedViewOptionStatus = (status: boolean) => {
    if (status != selectedViewOption) {
      setSelectedViewOption(status);
    }
  };

  const fetchData = async () => {
    try {
      const response = await httpService.get(`/portfolios/${pID}`);
      if (response.status === 200) {
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
            averageCostByEURO,
            averageCostByTRY,
            totalRawInvestmentByUSD,
            totalRawInvestmentByEURO,
            totalRawInvestmentByTRY,
          }) => ({
            id,
            symbol,
            type,
            averageCostByUSD,
            averageCostByEURO,
            averageCostByTRY,
            totalRawInvestmentByUSD,
            totalRawInvestmentByEURO,
            totalRawInvestmentByTRY,
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

          setCurrentInvestment({
            byUSD: updatedPortfolioStatsData.currentInvestmentByUSD,
            byEURO: updatedPortfolioStatsData.currentInvestmentByEURO,
            byTRY: updatedPortfolioStatsData.currentInvestmentByTRY,
          });
          const updatedAssetData = assetDataRef.current.map((asset, index) => ({
            ...asset,
            currentPriceByUSD:
              response.data.assets[index]?.currentPriceByUSD ??
              asset.currentPriceByUSD,
            currentPriceByEURO:
              response.data.assets[index]?.currentPriceByEURO ??
              asset.currentPriceByEURO,
            currentPriceByTRY:
              response.data.assets[index]?.currentPriceByTRY ??
              asset.currentPriceByTRY,
            /**/
            currentROIByUSD:
              response.data.assets[index]?.currentROIByUSD ??
              asset.currentROIByUSD,
            currentROIByEURO:
              response.data.assets[index]?.currentROIByEURO ??
              asset.currentROIByEURO,
            currentROIByTRY:
              response.data.assets[index]?.currentROIByTRY ??
              asset.currentROIByTRY,
            /**/
            currentEarningByUSD:
              response.data.assets[index]?.currentEarningByUSD ??
              asset.currentEarningByUSD,
            currentEarningByEURO:
              response.data.assets[index]?.currentEarningByEURO ??
              asset.currentEarningByEURO,
            currentEarningByTRY:
              response.data.assets[index]?.currentEarningByTRY ??
              asset.currentEarningByTRY,
            /**/
            currentInvestmentByUSD:
              response.data.assets[index]?.currentInvestmentByUSD ??
              asset.currentInvestmentByUSD,
            currentInvestmentByEURO:
              response.data.assets[index]?.currentInvestmentByEURO ??
              asset.currentInvestmentByEURO,
            currentInvestmentByTRY:
              response.data.assets[index]?.currentInvestmentByTRY ??
              asset.currentInvestmentByTRY,
            currentWeight:
              response.data.assets[index]?.currentWeight ?? asset.currentWeight,
          }));

          setAssetData(updatedAssetData);
          assetDataRef.current = updatedAssetData;
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error.response.data);
        }
      }
    }
  };

  useEffect(() => {
    pID != -1 && fetchData();

    intervalRef.current = setInterval(() => {
      fetchAssetLiveData();
    }, 2000);

    return () => clearInterval(intervalRef.current!);
  }, [pID]);
  useEffect(() => {
    const updateHeight = () => {
      const navbar = document.querySelector(".navbar-wrapper"); // Use your actual navbar class/id
      if (navbar) {
        const navbarHeight = navbar.getBoundingClientRect().height;
        document.documentElement.style.setProperty(
          "--navbar-height",
          `${navbarHeight}px`
        );
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  return (
    <div className="row m-0 p-0 pt-3">
      <div className="col-9 m-0 p-0 dashboard-left-section">
        {assetData && (
          <div className="row m-0 p-0 d-flex">
              <div className="col-6 m-0 p-0 ps-3 pt-3">
              <TradingviewChart />
            </div>  
            <div className="col-6 m-0 p-0 px-3 pt-3 d-flex">
              <AssetBarChart assets={assetData} />
            </div>
          </div>
        )}
        {assetData && (
          <div className="d-flex justify-content-center align-items-center px-3 gap-2 mt-3">
            <div
              className={`d-flex justify-content-end align-items-center rounded p-1 ${selectedViewOption ? "asset-selected-view-option" : ""}`}
            >
              <HugeiconsIcon
                role="button"
                color="white"
                width={25}
                height={25}
                icon={GridViewIcon}
                onClick={() => changeSelectedViewOptionStatus(true)}
              />
            </div>
            <div
              className={`d-flex justify-content-end align-items-center rounded p-1 ${!selectedViewOption ? "asset-selected-view-option" : ""}`}
            >
              <HugeiconsIcon
                role="button"
                color="white"
                width={25}
                height={25}
                icon={ListViewIcon}
                onClick={() => changeSelectedViewOptionStatus(false)}
              />
            </div>
          </div>
        )}

        {assetData && (
          <div className="row m-0 ps-3">
            {selectedViewOption ? (
              assetData?.map((asset: Asset) => (
                <div key={asset.id} className="col-4 m-0 p-0 pt-3 pe-3">
                  <AssetGridView asset={asset} />
                </div>
              ))
            ) : (
              <div className="p-0 m-0 pe-3 mt-3">
                <AssetListView asset={assetData} />
              </div>
            )}
          </div>
        )}

        {portfolioStatsData && <YearlyChange />}
      </div>

      <div className="col-3 m-0 py-3 ps-0 pe-3 portfolio-stat-wrapper">
        {portfolioStatsData &&
          portfolioStatsData.currentInvestmentByTRY != 0 && (
            <PortfolioStats portfolioStats={portfolioStatsData} />
          )}
      </div>
    </div>
  );
}
