import React, { useState } from "react";
import "./Asset.scss";
import LineChart from "../Charts/LineChart";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import NumberFlow from "@number-flow/react";

type Asset = {
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
  initialWeight: number;
  currentPrice: number;
  currentROI: number;
  currentEarning: number;
  currentWeight: number;
  currentInvestment: number;
};

type Props = {
  asset: Asset | null;
};
export default function Asset({ asset }: Props) {
  return (
    <div className="asset-wrapper py-3 px-4">
      {asset !== null && asset.currentPrice !== undefined ? (
        <>
          <div className="row m-0 p-0 border-bottom">
            <div className="col-12 m-0 p-0 px-3 d-flex flex-column justify-content-center">
              <div className="d-flex">
                <div className="d-flex align-items-center">
                  <img
                    src={asset.imageUrl}
                    className="asset-logo"
                    alt="Asset logo"
                  />
                  <div className="asset-name ms-3 fw-bold">{asset.symbol}</div>
                </div>

                <div className="bg-warning">
                  {/* <LineChart></LineChart> */}
                </div>
              </div>
              <div className="d-flex justify-content-end py-2">
                <div className="asset-current-price border-end pe-2 d-flex">
                  <span>$</span>

                  <NumberFlow
                    format={{
                      notation: "standard",

                      signDisplay: "never",
                    }}
                    spinTiming={{ duration: 1500, easing: "ease" }}
                    value={asset.currentPrice}
                  />
                </div>

                <div
                  className={
                    "asset-roi border-end px-2 d-flex" +
                    (asset.currentROI < 0 && " text-danger")
                  }
                >
                  <NumberFlow
                    format={{
                      style: "decimal",

                      signDisplay: "never",
                    }}
                    spinTiming={{ duration: 1500, easing: "ease" }}
                    value={asset.currentROI}
                  />
                  <span>%</span>
                </div>

                <div
                  className={
                    "asset-earning ps-2 d-flex" +
                    (asset.currentEarning < 0 && " text-danger")
                  }
                >
                  <span>$</span>
                  <NumberFlow
                    format={{
                      notation: "standard",

                      signDisplay: "never",
                    }}
                    spinTiming={{ duration: 1500, easing: "ease" }}
                    value={asset.currentEarning}
                  />
                </div>
              </div>
            </div>
            <div className="col-4 m-0 p-0 d-flex flex-column justify-content-center"></div>
          </div>
          <div className="mt-3 px-3 d-flex justify-content-between align-items-center">
            <div className="m-0 p-0">
              <div className="asset-header">Initial Weight</div>
              <div className="asset-value d-flex">
                <NumberFlow
                  format={{
                    style: "decimal",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.initialWeight}
                />
                <span>%</span>
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Raw Investment</div>
              <div className="asset-value d-flex">
                <span>$</span>
                <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.totalRawInvestmentByUSD}
                />
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Total Quantity</div>
              <div className="asset-value">
                {" "}
                <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.totalQuantity}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 px-3 d-flex justify-content-between align-items-center">
            <div className="m-0 p-0">
              <div className="asset-header">Current Weight</div>
              <div className="asset-value d-flex">
                <NumberFlow
                  format={{
                    style: "decimal",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.currentWeight}
                />
                <span>%</span>
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Current Investment</div>
              <div className="asset-value d-flex">
                <span>$</span>
                <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.currentInvestment}
                />
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Average Cost</div>
              <div className="asset-value d-flex">
                <span>$</span>
                <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.averageCostByUSD}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className=" d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
