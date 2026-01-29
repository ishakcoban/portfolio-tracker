import { useState } from "react";
import "./DeletePortfolioForm.scss";
import SuccessResponse from "../../SuccessResponse/SuccessResponse";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { useStore } from "../../../store";
import httpService from "../../../services/httpService";

type Props = {
  closePopup: () => void;
  onSuccess: (msg: string) => void;
};
export default function DeletePortfolioForm({ closePopup, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [statusCode, setStatusCode] = useState<number>(0);
  const { pID } = useStore();

  const submitHandler = async () => {
    setMessage("");
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response = await httpService.delete(`/portfolios/${pID}`);
        if (response.status === 200) {
        
          setStatusCode(response.status);
          onSuccess("Portfolio deleted!");
          closePopup();
        }
      } catch (error: any) {
        if (error.status === 400) {
          console.log(error);
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
        <div className="text-light">Are you sure delete this portfolio?</div>
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
          className="delete-portfolio-asset-transaction-button border-danger py-1 px-3 my-2"
          onClick={submitHandler}
          disabled={isLoading}
        >
          Delete
        </button>
      </div>
    </>
  );
}
