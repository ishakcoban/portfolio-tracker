import { useState } from "react";
import CustomInput from "../../CustomInput/CustomInput";
import httpService from "../../../services/httpService";
import SuccessResponse from "../../SuccessResponse/SuccessResponse";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
type Props = {
  closePopup: () => void;
  onSuccess: (msg: string) => void;
};
export default function CreatePortfolioForm({ closePopup, onSuccess }: Props) {
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [statusCode, setStatusCode] = useState<number>(0);

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value.trimStart());
  };

  const submitHandler = async () => {
    setMessage("");
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response = await httpService.post("/portfolios", { name: text });
        if (response.status === 201) {
          setText("");
          setStatusCode(response.status);
          onSuccess("Portfolio created!");
          closePopup();
        }
      } catch (error: any) {
        if (error.status === 400) {
          setMessage("Invalid input!");
          setStatusCode(error.status);
        }
      }
      setIsLoading(false);
    }, 2500);
  };
  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="w-50">
          <CustomInput header="Portfolio Name">
            <input
              type="text"
              className="input-style"
              value={text}
              name="portfolio"
              onChange={inputHandler}
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
