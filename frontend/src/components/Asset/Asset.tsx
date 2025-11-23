import "./Asset.scss";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import NumberFlow from "@number-flow/react";
import LineChart from "../Charts/LineChart/LineChart";
import { useState } from "react";
import {
  Chart01Icon,
  Cancel01Icon,
  TransactionHistoryIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import httpService from "../../services/httpService";
import Popup from "../Popup/Popup";
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

type LineChartValue = {
  xLabels: string[];
  pData: number[];
  currentEarning: number;
};

type Props = {
  asset: Asset;
};

type Transaction = {
  id: number;
  date: Date;
  eurusd: number;
  investment: number;
  price: number;
  type: string;
  usdtry: number;
  assetId: number;
};

export default function Asset({ asset }: Props) {
  const [lineChartStatus, setLineChartStatus] = useState(false);
  const [lineChartData, setLineChartData] = useState<LineChartValue>();
  const [popupStatus, setPopupStatus] = useState<boolean>(false);
  const [transactionData, setTransactionData] = useState<Transaction[]>();
  const changeLineChartStatus = async () => {
    if (!lineChartStatus) {
      try {
        const response = await httpService.get(
          `/assets/line-chart/${asset?.id}`
        );
        if (response.status === 200) {
          if (asset) {
            const value: LineChartValue = {
              pData: response.data.pData,
              xLabels: response.data.xLabels,
              currentEarning: +asset?.currentEarning,
            };

            setLineChartData(value);
            setLineChartStatus(!lineChartStatus);
          }
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error.response.data);
        }
      }
    }
    setLineChartStatus(!lineChartStatus);
  };

  const closePopup = () => {
    setPopupStatus(false);
  };

  const openPopup = async () => {
    setPopupStatus(true);
    try {
      const response = await httpService.get(
        `assets/${asset?.id}/transactions`
      );
      if (response.status === 200) {
        if (asset) {
          setTransactionData(response.data);
        }
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
      }
    }
  };
  const handleEdit = (id: number) => {};

  const handleDelete = (id: number) => {};

  return (
    <div className="asset-wrapper py-3 px-4">
      {popupStatus && (
        <Popup onClose={closePopup}>
          <div className="d-flex justify-content-center border-top border-bottom text-light mx-5 fs-5">{asset.symbol} - TRANSACTIONS</div>
          <div className="table-container mb-5 mt-5 d-flex justify-content-center">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Investment</th>
                  <th>Price</th>
                  <th>EURUSD</th>
                  <th>USDTRY</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactionData?.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="text-light">
                      {new Date(transaction.date).toLocaleString()}
                    </td>
                    <td className="text-success fw-bold">{transaction.type}</td>
                    <td className="text-light">
                      ${transaction.investment.toFixed(2)}
                    </td>
                    <td className="text-light">
                      ${transaction.price.toFixed(2)}
                    </td>
                    <td className="text-light">{transaction.eurusd}</td>
                    <td className="text-light">{transaction.usdtry}</td>
                    <td>
                      <button
                        className="btn btn-light transaction-buttons "
                        onClick={() => handleEdit(transaction.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn transaction-buttons border text-danger border-danger ms-2"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Popup>
      )}
      {asset !== null && asset.currentPrice !== undefined ? (
        <div className="position-relative">
          <div className="row m-0 p-0 border-bottom">
            <div className="col-12 m-0 p-0 px-3 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center">
                  <img
                    src={asset.imageUrl}
                    className="asset-logo"
                    alt="Asset logo"
                  />
                  <div className="asset-name ms-2 fw-bold">{asset.symbol}</div>
                </div>

                <div className="d-flex justify-content-center align-items-center">
                  <div className="asset-chart-button d-flex justify-content-center align-items-center">
                    <HugeiconsIcon
                      role="button"
                      color="white"
                      width={21}
                      height={21}
                      icon={TransactionHistoryIcon}
                      onClick={openPopup}
                    />
                  </div>

                  <div className="asset-chart-button d-flex justify-content-center align-items-center">
                    <HugeiconsIcon
                      role="button"
                      color="white"
                      width={21}
                      height={21}
                      icon={Chart01Icon}
                      onClick={changeLineChartStatus}
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end py-2">
                <div className="asset-current-price border-end pe-2 d-flex">
                  <span>${asset.currentPrice}</span>

                  {/* <NumberFlow
                    format={{
                      notation: "standard",

                      signDisplay: "never",
                    }}
                    spinTiming={{ duration: 1500, easing: "ease" }}
                    value={asset.currentPrice}
                  /> */}
                </div>

                <div
                  className={
                    "asset-roi border-end px-2 d-flex" +
                    (asset.currentROI < 0 && " text-danger")
                  }
                >
                  {/* <NumberFlow
                    format={{
                      style: "decimal",

                      signDisplay: "never",
                    }}
                    spinTiming={{ duration: 1500, easing: "ease" }}
                    value={asset.currentROI}
                  /> */}
                  <span>{Math.abs(asset.currentROI)}%</span>
                </div>

                <div
                  className={
                    "asset-earning ps-2 d-flex" +
                    (asset.currentEarning < 0 && " text-danger")
                  }
                >
                  <span>${Math.abs(asset.currentEarning)}</span>
                  {/* <NumberFlow
                    format={{
                      notation: "standard",

                      signDisplay: "never",
                    }}
                    spinTiming={{ duration: 1500, easing: "ease" }}
                    value={asset.currentEarning}
                  /> */}
                </div>
              </div>
            </div>
            <div className="col-4 m-0 p-0 d-flex flex-column justify-content-center"></div>
          </div>
          <div className="mt-3 px-3 d-flex justify-content-between align-items-center">
            <div className="m-0 p-0">
              <div className="asset-header">Initial Weight</div>
              <div className="asset-value d-flex">
                {/* <NumberFlow
                  format={{
                    style: "decimal",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.initialWeight}
                /> */}
                <span>{asset.initialWeight}%</span>
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Raw Investment</div>
              <div className="asset-value d-flex">
                <span>${asset.totalRawInvestmentByUSD}</span>
                {/* <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.totalRawInvestmentByUSD}
                /> */}
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Total Quantity</div>
              <div className="asset-value">
                {asset.totalQuantity}
                {/* <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.totalQuantity}
                /> */}
              </div>
            </div>
          </div>
          <div className="mt-3 px-3 d-flex justify-content-between align-items-center">
            <div className="m-0 p-0">
              <div className="asset-header">Current Weight</div>
              <div className="asset-value d-flex">
                {/* <NumberFlow
                  format={{
                    style: "decimal",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.currentWeight}
                /> */}
                <span>{asset.currentWeight}%</span>
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Current Investment</div>
              <div className="asset-value d-flex">
                <span>${asset.currentInvestment}</span>
                {/* <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.currentInvestment}
                /> */}
              </div>
            </div>
            <div className="m-0 p-0">
              <div className="asset-header">Average Cost</div>
              <div className="asset-value d-flex">
                <span>${asset.averageCostByUSD}</span>
                {/* <NumberFlow
                  format={{
                    notation: "standard",

                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={asset.averageCostByUSD}
                /> */}
              </div>
            </div>
          </div>

          {lineChartStatus && (
            <div className="position-absolute top-0 w-100 h-100">
              <div className="position-relative w-100 h-100">
                {lineChartData && <LineChart chartData={lineChartData} />}

                <div className="position-absolute top-0 w-100 text-end">
                  <div className="d-flex align-items-center justify-content-between px-3">
                    <div className="text-light">Last 365 Days</div>
                    <div className="asset-chart-button d-flex justify-content-center align-items-center">
                      <HugeiconsIcon
                        role="button"
                        color="white"
                        width={25}
                        height={25}
                        icon={Cancel01Icon}
                        onClick={changeLineChartStatus}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className=" d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
