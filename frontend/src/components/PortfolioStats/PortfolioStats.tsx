import "./PortfolioStats.scss";
import CircularChart from "../Charts/PieChart/CircularChart";
import NumberFlow from "@number-flow/react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import {
  ArrowAllDirectionFreeIcons,
  ArrowUp01FreeIcons,
  ArrowUp01Icon,
  ArrowUp02Icon,
  ArrowUp03Icon,
  ArrowUp04Icon,
  ArrowUp05Icon,
  ArrowUpDoubleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useStore } from "../../store";
import FearGreedIndex from "../FearAndGreedIndex/FearGreedIndex";
import { useEffect, useState } from "react";
import httpService from "../../services/httpService";
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
  portfolioPie: {
    label: string;
    value: number;
  }[];
};

type Props = {
  portfolioStats: PortfolioStats | null;
};

type FearAndGreedIndex = {
  vix: {
    type: string;
    value: number;
  };
  crypto: {
    type: string;
    value: number;
  };
};
export default function PortfolioStats({ portfolioStats }: Props) {
  const { currency } = useStore();
  const [fearAndGreedIndexData, setFearAndGreedIndexData] =
    useState<FearAndGreedIndex>();

  const fetchData = async () => {
    try {
      const response = await httpService.get(
        "/portfolios/fear-and-greed-index"
      );

      if (response.status === 200) {
        setFearAndGreedIndexData(response.data);
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
      }
    }
  };

  useEffect(() => {
    fetchData();
    //fetchVixData();
  }, []);
  return (
    <div className="portfolio-stats-wrapper py-3">
      {portfolioStats !== null &&
      portfolioStats.currentInvestmentByUSD !== undefined ? (
        <div className="position-relative d-flex justify-content-center align-items-center">
          <div className="mt-3">
            <CircularChart portfolioPie={portfolioStats.portfolioPie} />
          </div>
          <div
            className="position-absolute top-0 text-center"
            style={{ marginTop: "85px" }}
          >
            <div className="d-flex justify-content-center align-items-center">
              <div
                className="position-relative d-flex justify-content-center align-items-center me-1"
                style={{ width: "25px", height: "25px" }}
              >
                <span className="intro-banner-vdo-play-btn pinkBg d-flex justify-content-center align-items-center">
                  <span className="ripple pinkBg"></span>
                  <span className="ripple pinkBg"></span>
                  <span className="ripple pinkBg"></span>
                </span>
              </div>
              <div className="text-danger fw-bold">LIVE</div>
            </div>

            <div className="portfolio-current-price">
              <span>
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺"}

                <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={
                    currency === "USD"
                      ? portfolioStats.currentInvestmentByUSD
                      : currency === "EUR"
                        ? portfolioStats.currentInvestmentByEURO
                        : portfolioStats.currentInvestmentByTRY
                  }
                />
              </span>
            </div>

            <div
              className="d-flex justify-content-center py-2 fw-bold"
              style={{ fontSize: ".8rem" }}
            >
              <div
                className={
                  "border-end pe-2 d-flex text-success " +
                  (currency === "USD"
                    ? portfolioStats.currentROIByUSD < 0 && " text-danger"
                    : currency === "EUR"
                      ? portfolioStats.currentROIByEURO < 0 && " text-danger"
                      : portfolioStats.currentROIByTRY < 0 && " text-danger")
                }
              >
                <span>
                  <NumberFlow
                    format={{
                      notation: "standard",
                      signDisplay: "never",
                    }}
                    animated={false}
                    value={
                      currency === "USD"
                        ? portfolioStats.currentROIByUSD
                        : currency === "EUR"
                          ? portfolioStats.currentROIByEURO
                          : portfolioStats.currentROIByTRY
                    }
                  />
                  %
                </span>
              </div>

              <div
                className={
                  "ps-2 d-flex text-success " +
                  (currency === "USD"
                    ? portfolioStats.currentEarningByUSD < 0 && " text-danger"
                    : currency === "EUR"
                      ? portfolioStats.currentEarningByEURO < 0 &&
                        " text-danger"
                      : portfolioStats.currentEarningByTRY < 0 &&
                        " text-danger")
                }
              >
                <span>
                  {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺"}
                  <NumberFlow
                    format={{
                      notation: "standard",

                      signDisplay: "never",
                    }}
                    animated={false}
                    value={
                      currency === "USD"
                        ? portfolioStats.currentEarningByUSD
                        : currency === "EUR"
                          ? portfolioStats.currentEarningByEURO
                          : portfolioStats.currentEarningByTRY
                    }
                  />
                </span>
              </div>
            </div>

            <div className="portfolio-raw-investment-header mt-3">
              TOTAL ORIGINAL CAPITAL
            </div>
            <div className="portfolio-raw-investment-value fw-bold">
              <span>
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺"}

                <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  animated={false}
                  value={
                    currency === "USD"
                      ? portfolioStats.totalRawInvestmentByUSD
                      : currency === "EUR"
                        ? portfolioStats.totalRawInvestmentByEURO
                        : portfolioStats.totalRawInvestmentByTRY
                  }
                />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}
      {portfolioStats ? (
        <div className="currency-pairs-wrapper mx-4 border-top border-bottom mt-2">
          <div className="row m-0 p-0 py-1">
            <div className="col-4 m-0 p-0 ps-5 d-flex flex-column align-items-center">
              USD
              <div
                className={
                  portfolioStats?.currentEarningByUSD > 0
                    ? "text-success"
                    : "text-danger"
                }
              >
                <span>
                  <NumberFlow
                    format={{
                      notation: "standard",

                      signDisplay: "never",
                    }}
                    animated={false}
                    value={portfolioStats?.currentROIByUSD}
                  />
                  %
                </span>
              </div>
            </div>
            <div className="col-4 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
              EURO
              <div
                className={
                  portfolioStats?.currentEarningByEURO > 0
                    ? "text-success"
                    : "text-danger"
                }
              >
                <span></span>
                <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  animated={false}
                  value={portfolioStats?.currentROIByEURO}
                />
                %
              </div>
            </div>
            <div className="col-4 m-0 p-0 pe-5 d-flex flex-column align-items-center">
              TRY
              <div
                className={
                  portfolioStats?.currentEarningByTRY > 0
                    ? "text-success"
                    : "text-danger"
                }
              >
                <span>
                  <NumberFlow
                    format={{
                      notation: "standard",

                      signDisplay: "never",
                    }}
                    animated={false}
                    value={portfolioStats?.currentROIByTRY}
                  />
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}

      {fearAndGreedIndexData && fearAndGreedIndexData?.crypto != undefined ? (
        <div className="row m-0 p-0 mt-3">
          <div className="col-6 m-0 p-0 d-flex justify-content-end align-items-center pe-3 ps-5">
            <FearGreedIndex data={fearAndGreedIndexData.vix} />
          </div>
          <div className="col-6 m-0 p-0 d-flex justify-content-start align-items-center ps-3 pe-5">
            <FearGreedIndex data={fearAndGreedIndexData.crypto} />
          </div>
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
}
