import { useEffect, useState } from "react";
import CustomInput from "../../CustomInput/CustomInput";
import httpService from "../../../services/httpService";
import SuccessResponse from "../../SuccessResponse/SuccessResponse";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import "./CreateTransactionFom.scss";
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
export default function CreateTransactionFom({ closePopup, onSuccess }: Props) {
  const [symbolText, setSymbolText] = useState<string>("");
  const [typeText, setTypeText] = useState<string>("");
  const [imageUrlText, setImageUrlText] = useState<string>("");
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

  useEffect(() => {
    // This runs when component mounts (page loads/reloads)
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
    fetchPortfolios();
  }, []);

  const submitHandler = async () => {
    let data = {};
    switch (transactionType) {
      case "BUY":
        data = {
          assetId: +selectedAsset,
          type: transactionType,
          investment: +investmentAmount,
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
          quantity: +(saleAmount / price),
          salePrice: +price,
          date: date,
        };
        break;
    }

    console.log(data);
    setMessage("");
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response =
          transactionType == "BUY"
            ? await httpService.post("/transactions", data)
            : await httpService.post("/transactions/sale", data);
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
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAssets(
      portfolios.find((p) => p.id === Number(event.target.value))?.assets || []
    );
  };

  const toInputValue = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toISOString().slice(0, 16); // "2025-01-24T15:30"
  };
  return (
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
                      )
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
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setUSDTRY(+event.target.value)
                      }
                    ></input>
                  </CustomInput>

                  <CustomInput header="EURUSD">
                    <input
                      type="number"
                      className="input-style"
                      value={EURUSD}
                      name="price"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setEURUSD(+event.target.value)
                      }
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
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setInvestmentAmount(+event.target.value)
                    }
                  ></input>
                </CustomInput>
              )}

              {transactionType == "SELL" && (
                <CustomInput header="Sale Amount">
                  <input
                    type="number"
                    className="input-style"
                    value={saleAmount
                    }
                    name="saleAmount"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setSaleAmount(+event.target.value)
                    }
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
      </div>
    </>
  );
}
