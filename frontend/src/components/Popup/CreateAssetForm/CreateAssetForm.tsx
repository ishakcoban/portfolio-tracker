import { useEffect, useState } from "react";
import CustomInput from "../../CustomInput/CustomInput";
import httpService from "../../../services/httpService";
import SuccessResponse from "../../SuccessResponse/SuccessResponse";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
type Props = {
  closePopup: () => void;
  onSuccess: (msg: string) => void;
};

export default function CreateAssetForm({ closePopup, onSuccess }: Props) {
  const [symbolText, setSymbolText] = useState<string>("");
  const [typeText, setTypeText] = useState<string>("");
  const [imageUrlText, setImageUrlText] = useState<string>("");
  const [initialWeightText, setInitialWeightText] = useState<number>(0);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [statusCode, setStatusCode] = useState<number>(0);

  useEffect(() => {
    // This runs when component mounts (page loads/reloads)
    const fetchAssets = async () => {
      try {
        const response = await httpService.get("/portfolios");
        if (response.status === 200) {
          setPortfolios(response.data);
        }

        // const data = await response.json();
        // setAssets(data);
      } catch (err) {
        //setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
      }
    };

    fetchAssets();
  }, []);

  const submitHandler = async () => {
    const data = {
      symbol: symbolText,
      type: typeText,
      imageUrl: imageUrlText,
      initialWeight: +initialWeightText,
      portfolioId: +selectedItem,
    };

    setMessage("");
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response = await httpService.post("/assets", data);
        if (response.status === 201) {
          setSymbolText("");
          setTypeText("");
          setImageUrlText("");
          setInitialWeightText(0);
          setStatusCode(response.status);
          onSuccess("Asset created!");
          closePopup();
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error)
          setMessage("Invalid input!");
          //setMessage(error);
          setStatusCode(error.status);
        }
      }
      setIsLoading(false);
    }, 2500);
  };
  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="d-flex flex-column gap-5 w-50">
          <CustomInput header="Select a portfolio to add asset">
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
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelectedItem(event.target.value)}
            >
              <option className="option" value=""></option>
              {portfolios !== undefined &&
                portfolios.map((portfolio: { id: number; name: string }) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </option>
                ))}
            </select>
          </CustomInput>
          <CustomInput header="Symbol">
            <input
              type="text"
              className="input-style"
              value={symbolText}
              name="asset"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSymbolText(event.target.value.trimStart())
              }
            ></input>
          </CustomInput>

          <CustomInput header="Type">
            <input
              type="text"
              className="input-style"
              value={typeText}
              name="asset"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setTypeText(event.target.value.trimStart().toUpperCase())
              }
            ></input>
          </CustomInput>

          <CustomInput header="Image Url">
            <input
              type="url"
              className="input-style"
              value={imageUrlText}
              name="asset"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setImageUrlText(event.target.value.trimStart())
              }
            ></input>
          </CustomInput>
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
