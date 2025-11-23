import React from "react";
import "./PortfolioStats.scss";
import CircularChart from "../Charts/PieChart/CircularChart";
import NumberFlow from "@number-flow/react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

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

type Props = {
  portfolioStats: PortfolioStats | null;
};
export default function PortfolioStats({ portfolioStats }: Props) {
  
  return (
    <div className="portfolio-stats-wrapper py-3">
      {portfolioStats !== null &&
      portfolioStats.currentInvestment !== undefined ? (
        <div className="position-relative d-flex justify-content-center align-items-center">
          <CircularChart portfolioPie={portfolioStats.portfolioPie} />
          <div
            className="position-absolute top-0 text-center"
            style={{ marginTop: "70px" }}
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
            {/*  */}
            <div className="portfolio-current-price">
              <span>$</span>

              <NumberFlow
                format={{
                  notation: "standard",

                  signDisplay: "never",
                }}
                spinTiming={{ duration: 1500, easing: "ease" }}
                value={portfolioStats.currentInvestment}
              />
            </div>
            {/*  */}
            <div
              className="d-flex justify-content-center py-2"
              style={{ fontSize: ".8rem" }}
            >
              <div
                className={
                  "asset-roi border-end pe-2 d-flex"
                  // (asset.currentROI < 0 && " text-danger")
                }
              >
                {/* <NumberFlow
                  format={{
                    style: "decimal",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={portfolioStats.currentROI}
                /> */}
                <span>{portfolioStats.currentROI}%</span>
              </div>

              <div
                className={
                  "asset-earning ps-2 d-flex"
                  // (asset.currentEarning < 0 && " text-danger")
                }
              >
                <span>${portfolioStats.currentEarning}</span>
                {/* <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={portfolioStats.currentEarning}
                /> */}
              </div>
            </div>
            {/*  */}
            <div className="portfolio-raw-investment-header mt-3">
              RAW INVESTMENT
            </div>
            <div className="portfolio-raw-investment-value">
              <span>$</span>

              <NumberFlow
                format={{
                  notation: "standard",

                  signDisplay: "never",
                }}
                spinTiming={{ duration: 1500, easing: "ease" }}
                value={portfolioStats.totalRawInvestmentByUSD}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className=" d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
