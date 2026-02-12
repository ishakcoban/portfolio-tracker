import { useEffect, useState } from "react";
import CustomInput from "../../CustomInput/CustomInput";
import httpService from "../../../services/httpService";
import SuccessResponse from "../../SuccessResponse/SuccessResponse";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import "./CreateAssetForm.scss";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

type Option = {
  value: string;
  label: string;
  type: string | null;
  longName: string | null;
};
type Props = {
  closePopup: () => void;
  onSuccess: (msg: string) => void;
};

export default function CreateAssetForm({ closePopup, onSuccess }: Props) {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState<Option | null>();
  const [initialWeightText, setInitialWeightText] = useState<number>(0);
  const [portfolios, setPortfolios] = useState<Option[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [statusCode, setStatusCode] = useState<number>(0);
  const [quotes, setQuotes] = useState<Option[]>([]);
  const [dataSource, setDataSource] = useState("");

  useEffect(() => {
    // This runs when component mounts (page loads/reloads)
    const fetchAssets = async () => {
      try {
        const response = await httpService.get("/portfolios");
        if (response.status === 200) {
          setPortfolios(
            response.data.map((item: { id: number; name: string }) => ({
              value: item.id,
              label: item.name,
            })),
          );
        }
      } catch (err) {
        //setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
      }
    };

    fetchAssets();
  }, []);

  const submitHandler = async () => {
    const data = {
      symbol: symbol?.label,
      longName: dataSource == "Binance" ? symbol?.label : symbol?.longName,
      type: dataSource == "Binance" ? "CRYPTO" : symbol?.type,
      initialWeight: +initialWeightText,
      portfolioId: selectedPortfolio && +selectedPortfolio,
    };

    setMessage("");
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response = await httpService.post("/assets", data);
        if (response.status === 201) {
          console.log(response.data);
          setInitialWeightText(0);
          setStatusCode(response.status);
          onSuccess("Asset created!");
          closePopup();
          navigate(`/portfolio/${response.data.portfolioId}`, {
            state: { refresh: true, timestamp: Date.now() },
          });
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error);
          setMessage("Invalid input!");
          setStatusCode(error.status);
        }
      }
      setIsLoading(false);
    }, 2500);
  };

  const inputHandler = (inputValue: string) => {
    const data = {
      source: dataSource,
      symbol: inputValue,
    };

    if (inputValue.trim().length === 0 || dataSource == "") {
      setQuotes([]);
    } else {
      void (async () => {
        try {
          const res = await httpService.post("/assets/asset-query", data);
          if (res.status === 200 || res.status === 201) {
            console.log(res.data);
            setQuotes(
              res.data.map(
                (item: {
                  symbol: string;
                  quoteType?: string;
                  longname?: string;
                }) => ({
                  value: item.symbol,
                  label: item.symbol,
                  type: item.quoteType,
                  longName: item.longname,
                }),
              ),
            );
          }
        } catch (error) {
          console.error(error);
        }
      })();
    }
  };
  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="d-flex flex-column gap-4 w-50">
          <Select
            placeholder="Select a portfolio to add asset"
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                borderColor: "#BBBBB5",
                borderRadius: "8px",
                backgroundColor: "transparent",
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: "#BBBBB5",
              }),
              input: (baseStyles) => ({
                ...baseStyles,
                color: "#BBBBB5",
              }),
              placeholder: (baseStyles) => ({
                ...baseStyles,
              }),
            }}
            onChange={(selectedOption: Option | null) =>
              setSelectedPortfolio(+selectedOption!.value)
            }
            options={portfolios}
          />

          <div>
            <div style={{ fontSize: ".8rem" }} className="ms-1 text-light">
              Data Source
            </div>
            <div className="row m-0 p-0">
              <div className="col-6 m-0 p-0 d-flex align-items-center">
                <div
                  className={`asset-broker w-100 mx-1 py-2 ps-3 ${dataSource == "Yahoo Finance" && "border border-light border-2"}`}
                  onClick={() => setDataSource("Yahoo Finance")}
                >
                  Yahoo Finance
                </div>
              </div>
              <div className="col-6 m-0 p-0 d-flex align-items-center">
                <div
                  className={`asset-broker w-100 mx-1 py-2 ps-3 ${dataSource == "Binance" && "border border-light border-2"}`}
                  onClick={() => setDataSource("Binance")}
                >
                  Binance
                </div>
              </div>
            </div>
          </div>
          <Select
            placeholder="Select an asset"
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                borderColor: "#BBBBB5",
                borderRadius: "8px",
                backgroundColor: "transparent",
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: "#BBBBB5",
              }),
              input: (baseStyles) => ({
                ...baseStyles,
                color: "#BBBBB5",
              }),
              placeholder: (baseStyles) => ({
                ...baseStyles,
              }),
            }}
            onChange={(selectedOption: Option | null) =>
              setSymbol(selectedOption)
            }
            onInputChange={inputHandler}
            options={quotes}
          />

          <CustomInput header="Initial Weight">
            <input
              type="number"
              className="input-style"
              value={initialWeightText}
              name="asset"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setInitialWeightText(+event.target.value)
              }
            ></input>
          </CustomInput>
        </div>
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
