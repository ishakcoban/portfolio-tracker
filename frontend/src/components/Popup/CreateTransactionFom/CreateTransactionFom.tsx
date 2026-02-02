import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./CreateTransactionFom.scss";
import httpService from "../../../services/httpService";
import CustomInput from "../../CustomInput/CustomInput";
import SuccessResponse from "../../SuccessResponse/SuccessResponse";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
interface TransactionRow {
  date: string;
  type: "BUY" | "SELL";
  assetId: number;
  price: number;
  invested: number;
  quantity: number;
  eurusd: number;
  usdtry: number;
}

type Props = {
  closePopup: () => void;
  onSuccess: (msg: string) => void;
};
type Asset = {
  id: number;
  symbol: string;
};

type Portfolio = {
  id: number;
  name: string;
  assets: Asset[];
};

export const CreateTransactionForm: React.FC<Props> = ({
  closePopup,
  onSuccess,
}) => {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  /**/
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [saleAmount, setSaleAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [USDTRY, setUSDTRY] = useState<number>(0);
  const [EURUSD, setEURUSD] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [statusCode, setStatusCode] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<string>("BUY");
  const [mode, setMode] = useState<string>("");
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Map to your transaction format
        const mappedTransactions: TransactionRow[] = jsonData.map((row) => ({
          date: row.Date || row.date,
          type: (row.Type || row.type)?.toUpperCase() as "BUY" | "SELL",
          assetId: Number(selectedAsset),
          price: Number(row.Price || row.price),
          invested: Number(row.Invested || row.invested),
          quantity: +(
            Number(row.Invested || row.invested) /
            Number(row.Price || row.price)
          ),
          eurusd: Number(row.EURUSD || row.eurusd) / 1000,
          usdtry: Number(row.USDTRY || row.usdtry),
        }));

        setTransactions(mappedTransactions);
        setError(null);
        setSuccess(false);
      } catch (err) {
        setError("Error reading file: " + (err as Error).message);
        setTransactions([]);
      }
    };

    reader.readAsBinaryString(file);
  };

  const fetchPortfolios = async () => {
    try {
      const response = await httpService.get("/portfolios");
      if (response.status === 200) {
        console.log(response.data);
        setPortfolios(response.data);
      }

      // const data = await response.json();
      // setAssets(data);
    } catch (err) {
      //setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await httpService.post(
        "/transactions/bulk",
        transactions,
      );
      if (response.status != 200 && response.status != 201) {
        throw new Error("Failed to upload transactions");
      }

      setSuccess(true);
      setTimeout(() => {
        setTransactions([]);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Error uploading: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTransactions([]);
    setError(null);
    setSuccess(false);
  };

  const submitHandler = async () => {
    let data = {};
    switch (transactionType) {
      case "BUY":
        data = {
          assetId: +selectedAsset,
          type: transactionType,
          invested: +investmentAmount,
          quantity: +(investmentAmount / price),
          price: +price,
          usdtry: USDTRY,
          eurusd: EURUSD,
          date: date,
        };
        break;

      case "SELL":
        data = {
          assetId: +selectedAsset,
          type: transactionType,
          invested: saleAmount,
          usdtry: USDTRY,
          eurusd: EURUSD,
          quantity: +(saleAmount / price),
          price: +price,
          date: date,
        };
        break;
    }

    console.log(data);
    setMessage("");
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response = await httpService.post("/transactions", data);

        if (response.status === 201) {
          setSelectedPortfolio("");
          setSelectedAsset("");
          setPrice(0);
          setDate("");
          setStatusCode(response.status);
          onSuccess("transaction created!");

          if (transactionType == "BUY") {
            setInvestmentAmount(0);
          } else {
            setSaleAmount(0);
          }

          //  closePopup();
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error.response.data);
          setMessage("Invalid input!");
          setStatusCode(error.status);
        }
      }
      setIsLoading(false);
    }, 2500);
  };

  const transactionTypeHandler = (type: string) => {
    setTransactionType(type);
  };

  const portfolioHandler = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setAssets(
      portfolios.find((p) => p.id === Number(event.target.value))?.assets || [],
    );
  };

  const toInputValue = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toISOString().slice(0, 16); // "2025-01-24T15:30"
  };

  useEffect(() => {
    if (mode == "single" || mode == "multiple") {
      fetchPortfolios();
    }
  }, [mode]);

  const modeHandler = (mode: string) => {
    setMode(mode);
  };
  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-lg p-6 mb-6 d-flex flex-column align-items-center text-light">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Transaction Management
          </h1>
          <p className="text-gray-600">
            Add transactions individually or upload multiple transactions at
            once
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="rounded-lg p-6 mb-6">
          <div className="d-flex justify-content-center gap-4 pb-5">
            <button
              className={`col-3 btn border-light text-light ${mode == "single" && "btn-light text-dark"}`}
              onClick={() => modeHandler("single")}
            >
              single
            </button>
            <button
              className={`col-3 btn border-light text-light ${mode == "multiple" && "btn-light text-dark"}`}
              onClick={() => modeHandler("multiple")}
            >
              multiple
            </button>
          </div>
        </div>
      </div>

      {mode == "single" && (
        <>
          <div className="d-flex flex-column align-items-center">
            {transactionType === "BUY" || transactionType === "SELL" ? (
              <div className="w-50">
                <div className="d-flex flex-column gap-4">
                  <CustomInput header="Select a portfolio">
                    {/* <input
                   type="number"
                   className="input-style"
                   value={initialWeightText}
                   name="asset"
                   onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                     setInitialWeightText(+event.target.value)
                   }
                 ></input> */}

                    <select
                      style={{ fontSize: ".7rem" }}
                      role="button"
                      className="w-100"
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        portfolioHandler(event)
                      }
                    >
                      <option className="option" value=""></option>
                      {portfolios !== undefined &&
                        portfolios.map(
                          (portfolio: { id: number; name: string }) => (
                            <option key={portfolio.id} value={portfolio.id}>
                              {portfolio.name}
                            </option>
                          ),
                        )}
                    </select>
                  </CustomInput>
                  <CustomInput header="Select a asset">
                    {/* <input
                   type="number"
                   className="input-style"
                   value={initialWeightText}
                   name="asset"
                   onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                     setInitialWeightText(+event.target.value)
                   }
                 ></input> */}

                    <select
                      style={{ fontSize: ".7rem" }}
                      role="button"
                      className="w-100"
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedAsset(event.target.value)
                      }
                    >
                      <option className="option" value=""></option>
                      {assets !== undefined &&
                        assets.map((asset: { id: number; symbol: string }) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.symbol}
                          </option>
                        ))}
                    </select>
                  </CustomInput>
                  <CustomInput header="Price">
                    <input
                      type="number"
                      className="input-style"
                      value={price}
                      name="price"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setPrice(+event.target.value)
                      }
                    ></input>
                  </CustomInput>

                  {transactionType == "BUY" && (
                    <>
                      <CustomInput header="USDTRY">
                        <input
                          type="number"
                          className="input-style"
                          value={USDTRY}
                          name="usdtry"
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => setUSDTRY(+event.target.value)}
                        ></input>
                      </CustomInput>

                      <CustomInput header="EURUSD">
                        <input
                          type="number"
                          className="input-style"
                          value={EURUSD}
                          name="price"
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => setEURUSD(+event.target.value)}
                        ></input>
                      </CustomInput>
                    </>
                  )}
                  {transactionType == "BUY" && (
                    <CustomInput header="Investment Amount">
                      <input
                        type="number"
                        className="input-style"
                        value={investmentAmount}
                        name="investmentAmount"
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setInvestmentAmount(+event.target.value)}
                      ></input>
                    </CustomInput>
                  )}

                  {transactionType == "SELL" && (
                    <CustomInput header="Sale Amount">
                      <input
                        type="number"
                        className="input-style"
                        value={saleAmount}
                        name="saleAmount"
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setSaleAmount(+event.target.value)}
                      ></input>
                    </CustomInput>
                  )}

                  <CustomInput header="Transaction Date">
                    <input
                      type="datetime-local"
                      className="input-style"
                      value={date || toInputValue(date)}
                      name="transactionDate"
                      onChange={(event) => {
                        setDate(event.target.value);
                        // console.log(new Date(event.target.value).toISOString())
                        // const iso = new Date(event.target.value).toISOString();
                        // setDate(iso);
                      }}
                    />
                  </CustomInput>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div className="row m-0 p-0 d-flex justify-content-center align-items-center mt-4">
            <div className="col-8 m-0 p-0 transaction-selection-wrapper">
              <div className="row m-0 p-0 text-light">
                <div
                  onClick={() => transactionTypeHandler("BUY")}
                  role="button"
                  className={`col-4 m-0 p-0 text-center ${
                    transactionType === "BUY" &&
                    "text-dark transaction-selected-color"
                  }`}
                >
                  BUY
                </div>
                <div
                  onClick={() => transactionTypeHandler("SELL")}
                  role="button"
                  className={`col-4 m-0 p-0 text-center ${
                    transactionType === "SELL" &&
                    "text-dark transaction-selected-color"
                  }`}
                >
                  SELL
                </div>
                <div
                  onClick={() => transactionTypeHandler("TRANSFER")}
                  role="button"
                  className={`col-4 m-0 p-0 text-center ${
                    transactionType === "TRANSFER" &&
                    "text-dark transaction-selected-color"
                  }`}
                >
                  TRANSFER
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column justify-content-center align-items-center">
            {
              <div className="my-3">
                {isLoading && <LoadingSpinner />}

                {statusCode != 200 && statusCode != 201 ? (
                  <SuccessResponse
                    statusCode={statusCode}
                    message={message}
                  ></SuccessResponse>
                ) : null}
              </div>
            }
            <button
              className="create-portfolio-asset-transaction-button py-1 px-3 my-2"
              onClick={submitHandler}
              disabled={isLoading}
            >
              Submit
            </button>
          </div>{" "}
        </>
      )}
      {mode == "multiple" && (
        <div className="bulk-upload-container">
          <div className="d-flex flex-column align-items-center mb-3">
            <div className="w-50">
              <div className="d-flex flex-column gap-4">
                <CustomInput header="Select a portfolio">
                  <select
                    style={{ fontSize: ".7rem" }}
                    role="button"
                    className="w-100"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      portfolioHandler(event)
                    }
                  >
                    <option className="option" value=""></option>
                    {portfolios !== undefined &&
                      portfolios.map(
                        (portfolio: { id: number; name: string }) => (
                          <option key={portfolio.id} value={portfolio.id}>
                            {portfolio.name}
                          </option>
                        ),
                      )}
                  </select>
                </CustomInput>
                <CustomInput header="Select a asset">
                  {/* <input
                   type="number"
                   className="input-style"
                   value={initialWeightText}
                   name="asset"
                   onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                     setInitialWeightText(+event.target.value)
                   }
                 ></input> */}

                  <select
                    style={{ fontSize: ".7rem" }}
                    role="button"
                    className="w-100"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedAsset(event.target.value)
                    }
                  >
                    <option className="option" value=""></option>
                    {assets !== undefined &&
                      assets.map((asset: { id: number; symbol: string }) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.symbol}
                        </option>
                      ))}
                  </select>
                </CustomInput>
              </div>
            </div>
          </div>

          <div className="upload-card">
            <div className="upload-section">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <div className="file-upload-button">
                  <svg
                    className="upload-icon text-light"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-light">Choose Excel File</span>
                  <span className="file-hint">.xlsx, .xls</span>
                </div>
              </label>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg
                  className="alert-icon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg
                  className="alert-icon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Transactions uploaded successfully!</span>
              </div>
            )}

            {transactions.length > 0 && (
              <>
                <div className="preview-section">
                  <div className="preview-header">
                    <h3 className="preview-title text-light">
                      Preview
                      <span className="transaction-count">
                        {transactions.length} transactions
                      </span>
                    </h3>
                    <button onClick={handleClear} className="btn-clear">
                      Clear
                    </button>
                  </div>

                  <div className="table-container-transaction bg-light">
                    <table className="transaction-table-transaction">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Asset ID</th>
                          <th>Price</th>
                          <th>Invested</th>
                          <th>EUR/USD</th>
                          <th>USD/TRY</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx, idx) => (
                          <tr key={idx}>
                            <td>{tx.date}</td>
                            <td>
                              <span
                                className={`fw-bold ${tx.type.toLowerCase() == "buy" ? "badge-buy" : "badge-sell"}`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td>{tx.assetId}</td>
                            <td className="text-right">
                              ${tx.price.toFixed(2)}
                            </td>
                            <td className="text-right">
                              ${tx.invested.toFixed(2)}
                            </td>
                            <td className="text-right">
                              {tx.eurusd.toFixed(4)}
                            </td>
                            <td className="text-right">
                              {tx.usdtry.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-submit"
                  >
                    {loading ? (
                      <>
                        <svg className="spinner" viewBox="0 0 24 24">
                          <circle
                            className="spinner-circle"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="spinner-path"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="btn-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        <span>Upload Transactions</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
