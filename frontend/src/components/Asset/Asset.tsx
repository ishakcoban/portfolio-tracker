import React from "react";
import "./Asset.scss";
import LineChart from "../Charts/LineChart";
export default function Asset() {
  const dummyData = {
    id: 1,
    symbol: "QQQ",
    type: "ETF",
    imageUrl: "https://companiesmarketcap.com/img/company-logos/64/BTC.png",
    totalRawInvestmentByUSD: 123,
    totalRawInvestmentEURO: 123,
    totalRawInvestmentByTRY: 123,
    totalQuantity: 123,
    averageCostByUSD: 123,
    averageCostByEURO: 123,
    averageCostByTRY: 123,
    initalWeight: 123,
    currentPrice: "$98,450",
    roi: "7.8%",
    earning: "$447",
    currentWeight: "22%",
    currentInvestment: "$6,197",


  };

  return (
    <div className="asset-wrapper py-3 px-4">
      <div className="row m-0 p-0 border-bottom">
        <div className="col-8 m-0 p-0 px-3 d-flex flex-column justify-content-center">
          <div className="d-flex align-items-center">
            <img
              src={dummyData.imageUrl}
              className="asset-logo"
              alt="Asset logo"
            />
            <div className="asset-name ms-2">{dummyData.symbol}</div>
          </div>
          <div className="mt-2 d-flex">
            <div className="asset-current-price border-end pe-2">
              {dummyData.currentPrice}
            </div>

            <div className="asset-roi border-end px-2">{dummyData.roi}</div>

            <div className="asset-earning ps-2">
              {dummyData.currentInvestment}
            </div>
          </div>
        </div>
        <div className="col-4 m-0 p-0 d-flex flex-column justify-content-center">
          <div>
            
            <LineChart></LineChart>
          </div>
        </div>
      </div>

      <div className="mt-3 px-3 d-flex justify-content-between align-items-center">
        <div className="m-0 p-0">
          <div className="asset-header">Initial Weight</div>
          <div className="asset-value">{dummyData.roi}</div>
        </div>
        <div className="m-0 p-0">
          <div className="asset-header">Raw Investment</div>
          <div className="asset-value">{dummyData.totalRawInvestmentByTRY}</div>
        </div>
        <div className="m-0 p-0">
          <div className="asset-header">Total Quantity</div>
          <div className="asset-value">{dummyData.totalQuantity}</div>
        </div>
      </div>
      <div className="mt-3 px-3 d-flex justify-content-between align-items-center">
        <div className="m-0 p-0">
          <div className="asset-header">Current Weight</div>
          <div className="asset-value">{dummyData.roi}</div>
        </div>
        <div className="m-0 p-0">
          <div className="asset-header">Current Investment</div>
          <div className="asset-value">{dummyData.totalRawInvestmentByUSD}</div>
        </div>
        <div className="m-0 p-0">
          <div className="asset-header">Average Cost</div>
          <div className="asset-value">{dummyData.totalQuantity}</div>
        </div>
      </div>
    </div>
  );
}
