import "./AssetListView.scss";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import NumberFlow from "@number-flow/react";
import LineChart from "../../Charts/LineChart/LineChart";
import { useState } from "react";
import {
  Chart01Icon,
  Cancel01Icon,
  TransactionHistoryIcon,
  WeightScale01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import httpService from "../../../services/httpService";
import Popup from "../../Popup/Popup";
import { useStore } from "../../../store";

type Asset = {
  id: number;
  symbol: string;
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

type LineChartValue = {
  xLabels: string[];
  pData: number[];
  currentEarning: number;
};

type Props = {
  asset: Asset[];
};

type Transaction = {
  id: number;
  date: Date;
  eurusd: number;
  invested: number;
  quantity: number;
  price: number;
  type: string;
  usdtry: number;
  assetId: number;
};

export default function AssetListView({ asset }: Props) {
  const [lineChartStatus, setLineChartStatus] = useState(false);
  const [lineChartData, setLineChartData] = useState<LineChartValue>();
  const [popupStatus, setPopupStatus] = useState<boolean>(false);
  const [transactionData, setTransactionData] = useState<Transaction[]>();
  const [symbol, setSymbol] = useState<string>("");
  const { currency, currentInvestment } = useStore();

  const changeLineChartStatus = async (
    id?: number,
    currentEarningByUSD?: number,
  ) => {
    if (!lineChartStatus && currentEarningByUSD) {
      try {
        const response = await httpService.get(`/assets/line-chart/${id}`);
        if (response.status === 200) {
          if (asset) {
            const value: LineChartValue = {
              pData: response.data.pData,
              xLabels: response.data.xLabels,
              currentEarning: +currentEarningByUSD,
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

  const openPopup = async (id: number, symbol: string) => {
    setPopupStatus(true);
    setSymbol(symbol);
    try {
      const response = await httpService.get(`assets/${id}/transactions`);
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
          <div className="d-flex justify-content-center border-top border-bottom text-light mx-5 fs-5">
            {symbol} - TRANSACTIONS
          </div>
          <div className="table-container mb-5 mt-3 d-flex justify-content-center">
            <table className="transaction-table table-borderless">
              <thead className="border-bottom">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Investment</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>EURUSD</th>
                  <th>USDTRY</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactionData?.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="text-light">
                      {new Date(transaction.date).toLocaleString()}
                    </td>
                    <td className="text-green fw-bold">{transaction.type}</td>
                    <td className="text-light">
                      ${transaction.invested.toFixed(2)}
                    </td>
                    <td className="text-light">
                      {transaction.quantity.toFixed(3)}
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
                        className="btn transaction-buttons border text-red border-danger ms-2"
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
      {asset !== null ? (
        <div className="position-relative">
          <div className="table-container mb-4 mt-4 d-flex justify-content-center">
            <table className="transaction-table table-borderless">
              <thead className="border-bottom">
                <tr>
                  <th></th>
                  <th>IW</th>
                  <th>CW</th>
                  {asset.length > 1 ? (
                    <>
                      <th>WD</th>
                      <th>CWD</th>
                    </>
                  ) : (
                    <></>
                  )}
                  <th>TQ</th>
                  <th>AC</th>
                  <th>I</th>
                  <th>C</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {asset?.map((item) => (
                  <tr key={item.id}>
                    <td className="text-light">
                      <div>
                        <div className="d-flex justify-content-start align-items-center">
                          <img
                            src={item.imageUrl}
                            className="asset-logo"
                            alt="Asset logo"
                          />
                          <div className="asset-name ms-2 fw-bold">
                            {item.symbol}
                          </div>
                        </div>

                        <div
                          style={{ fontSize: ".9rem" }}
                          className="d-flex justify-content-start py-2"
                        >
                          <div className="asset-current-price border-end pe-2">
                            <span>
                              {currency === "USD"
                                ? "$"
                                : currency === "EUR"
                                  ? "€"
                                  : "₺"}
                              <NumberFlow
                                format={{
                                  style: "decimal",
                                  signDisplay: "never",
                                }}
                                animated={false}
                                value={
                                  currency === "USD"
                                    ? item.currentPriceByUSD
                                    : currency === "EUR"
                                      ? item.currentPriceByEURO
                                      : item.currentPriceByTRY
                                }
                              />
                            </span>
                          </div>

                          <div
                            className={
                              "border-end px-2 text-green " +
                              (currency === "USD"
                                ? item.currentROIByUSD < 0 && " text-red"
                                : currency === "EUR"
                                  ? item.currentROIByEURO < 0 && " text-red"
                                  : item.currentROIByTRY < 0 && " text-red")
                            }
                          >
                            <span>
                              <NumberFlow
                                format={{
                                  style: "decimal",
                                  signDisplay: "never",
                                }}
                                animated={false}
                                value={Math.abs(
                                  currency === "USD"
                                    ? item.currentROIByUSD
                                    : currency === "EUR"
                                      ? item.currentROIByEURO
                                      : item.currentROIByTRY,
                                )}
                              />
                              %
                            </span>
                          </div>

                          <div
                            className={
                              "ps-2 text-green " +
                              (currency === "USD"
                                ? item.currentEarningByUSD < 0 && " text-red"
                                : currency === "EUR"
                                  ? item.currentEarningByEURO < 0 &&
                                    " text-red"
                                  : item.currentEarningByTRY < 0 &&
                                    " text-red")
                            }
                          >
                            <span>
                              {currency === "USD"
                                ? "$"
                                : currency === "EUR"
                                  ? "€"
                                  : "₺"}
                              <NumberFlow
                                format={{
                                  notation: "standard",

                                  signDisplay: "never",
                                  maximumFractionDigits: 2,
                                }}
                                animated={false}
                                value={Math.abs(
                                  currency === "USD"
                                    ? item.currentEarningByUSD
                                    : currency === "EUR"
                                      ? item.currentEarningByEURO
                                      : item.currentEarningByTRY,
                                )}
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="text-light text-nowrap">
                      <span>
                        <NumberFlow
                          format={{
                            notation: "standard",
                            signDisplay: "never",
                          }}
                          animated={false}
                          value={item.initialWeight}
                        />
                        %
                      </span>
                    </td>
                    <td className="text-light text-nowrap">
                      <span>
                        <NumberFlow
                          format={{
                            notation: "standard",
                            signDisplay: "never",
                          }}
                          animated={false}
                          value={item.currentWeight}
                        />
                        %
                      </span>
                    </td>
                    {asset.length > 1 ? <><td className="text-light text-nowrap">
                      <span
                        className={
                          "fw-bold text-green " +
                          (item.currentWeight - item.initialWeight < 0 &&
                            " text-red")
                        }
                      >
                        <NumberFlow
                          format={{
                            notation: "standard",
                            signDisplay: "never",
                          }}
                          animated={false}
                          value={item.currentWeight - item.initialWeight}
                        />
                        %
                      </span>
                    </td>
                    <td className="text-light text-nowrap">
                      <span
                        className={
                          "fw-bold text-green " +
                          (item.currentWeight - item.initialWeight < 0 &&
                            " text-red")
                        }
                      >
                        {currency === "USD"
                          ? "$"
                          : currency === "EUR"
                            ? "€"
                            : "₺"}
                        <NumberFlow
                          format={{
                            notation: "standard",
                            signDisplay: "never",
                            maximumFractionDigits: 2,
                          }}
                          animated={false}
                          value={
                            currency === "USD"
                              ? (currentInvestment.byUSD *
                                  (item.currentWeight - item.initialWeight)) /
                                100
                              : currency === "EUR"
                                ? (currentInvestment.byEURO *
                                    (item.currentWeight -
                                      item.initialWeight)) /
                                  100
                                : (currentInvestment.byTRY *
                                    (item.currentWeight -
                                      item.initialWeight)) /
                                  100
                          }
                        />
                      </span>
                    </td></> : <></>}
                    
                    <td className="text-light text-nowrap">
                      {" "}
                      <NumberFlow
                        format={{
                          notation: "standard",
                          signDisplay: "never",
                          maximumFractionDigits:
                            item.symbol == "BTC" || item.symbol == "PAXG"
                              ? 8
                              : 3,
                        }}
                        animated={false}
                        value={item.totalQuantity}
                      />
                    </td>
                    <td className="text-light text-nowrap">
                      {" "}
                      <span className="">
                        {currency === "USD"
                          ? "$"
                          : currency === "EUR"
                            ? "€"
                            : "₺"}
                        <NumberFlow
                          format={{
                            notation: "standard",
                            signDisplay: "never",
                            maximumFractionDigits: 2,
                          }}
                          animated={false}
                          value={
                            currency === "USD"
                              ? item.averageCostByUSD
                              : currency === "EUR"
                                ? item.averageCostByEURO
                                : item.averageCostByTRY
                          }
                        />
                      </span>
                    </td>
                    <td className="text-light text-nowrap">
                      <span>
                        {currency === "USD"
                          ? "$"
                          : currency === "EUR"
                            ? "€"
                            : "₺"}
                        <NumberFlow
                          format={{
                            notation: "standard",
                            signDisplay: "never",
                            maximumFractionDigits: 2,
                          }}
                          animated={false}
                          value={
                            currency === "USD"
                              ? item.totalRawInvestmentByUSD
                              : currency === "EUR"
                                ? item.totalRawInvestmentByEURO
                                : item.totalRawInvestmentByTRY
                          }
                        />
                      </span>
                    </td>
                    <td className="text-light text-nowrap fw-bold">
                      <span>
                        {currency === "USD"
                          ? "$"
                          : currency === "EUR"
                            ? "€"
                            : "₺"}

                        <NumberFlow
                          format={{
                            notation: "standard",
                            signDisplay: "never",
                            maximumFractionDigits: 2,
                          }}
                          animated={false}
                          value={
                            currency === "USD"
                              ? item.currentInvestmentByUSD
                              : currency === "EUR"
                                ? item.currentInvestmentByEURO
                                : item.currentInvestmentByTRY
                          }
                        />
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center align-items-center">
                        <div className="asset-chart-button d-flex justify-content-center align-items-center">
                          <HugeiconsIcon
                            role="button"
                            color="white"
                            width={21}
                            height={21}
                            icon={TransactionHistoryIcon}
                            onClick={() => openPopup(item.id, item.symbol)}
                          />
                        </div>

                        <div className="asset-chart-button d-flex justify-content-center align-items-center">
                          <HugeiconsIcon
                            role="button"
                            color="white"
                            width={21}
                            height={21}
                            icon={Chart01Icon}
                            onClick={() =>
                              changeLineChartStatus(
                                item.id,
                                item.currentEarningByUSD,
                              )
                            }
                          />
                        </div>
                        <div className="asset-chart-button d-flex justify-content-center align-items-center">
                          <HugeiconsIcon
                            role="button"
                            color="white"
                            width={21}
                            height={21}
                            icon={WeightScale01Icon}
                            onClick={() =>
                              changeLineChartStatus(
                                item.id,
                                item.currentEarningByUSD,
                              )
                            }
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lineChartStatus && (
            <div className="position-absolute top-0 w-100 h-100">
              <div className="position-relative w-100 h-100">
                {lineChartData && <LineChart chartData={lineChartData} />}

                <div className="position-absolute top-0 w-100 text-end">
                  <div className="d-flex align-items-center justify-content-between px-3">
                    <div className="text-light">Last 90 Days</div>
                    <div className="asset-chart-button d-flex justify-content-center align-items-center">
                      <HugeiconsIcon
                        role="button"
                        color="white"
                        width={25}
                        height={25}
                        icon={Cancel01Icon}
                        onClick={() => changeLineChartStatus()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            className="text-center"
            style={{ color: "#D1D5DB", fontSize: ".6rem" }}
          >
            IW : Initial Weight --- CW : Current Weight --- WD : Weight
            Difference --- CWD : Capital by Weight Difference --- TQ : Total
            Quantity --- AC : Average Cost --- I : Invested --- C :
            Current
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
