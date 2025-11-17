import { useRef, useState } from "react";
import "./Navbar.scss";
import Popup from "../Popup/Popup";
import CustomInput from "../CustomInput/CustomInput";
import SuccessResponse from "../SuccessResponse/SuccessResponse";
import httpService from "../../services/httpService";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import SuccessMessageCard, {
  type SuccessMessageCardRef,
} from "../SuccessMessageCard/SuccessMessageCard";
export default function Navbar() {
  const [popupStatus, setPopupStatus] = useState(false);
  const [text, setText] = useState<string>("");

  const [message, setMessage] = useState<string>("");

  const [statusCode, setStatusCode] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cardRef = useRef<SuccessMessageCardRef | null>(null);

  const openPopup = () => {
    setPopupStatus(!popupStatus);
  };

  const closePopup = () => {
    setPopupStatus(false);

  };

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const submitHandler = async () => {
    setMessage("");
    setText("");
    setIsLoading(true);
 
    setTimeout(async () => {
      try {
        const response = await httpService.post("/portfolios", { name: text });
        if (response.status == 201) {
          
       
          setStatusCode(response.status);
          setMessage("Portfolio created!");
      
          cardRef.current?.openSuccessMessageBox();
          closePopup();
        }
      } catch (error: any) {
        if (error.status == 400) {
       
          setMessage("Invalid input!");
          setStatusCode(error.status);
        }
      }
      setIsLoading(false);
    }, 2500);
  };

  return (
    <>
      <div className="navbar-wrapper d-flex justify-content-end">
        {
          <SuccessMessageCard
            ref={cardRef}
            message={message}
          ></SuccessMessageCard>
        }
        <button
          className="create-portfolio-button py-1 px-3 my-2 me-5"
          onClick={openPopup}
        >
          Create Portfolio
        </button>
        {popupStatus && (
          <Popup onClose={closePopup}>
            <div className="d-flex flex-column justify-content-center align-items-center">
              <div className="w-50">
                <CustomInput
                  input_style={{
                    name: "name",
                    header: "Portfolio Name",
                  }}
                value={text}
                  inputHandler={inputHandler}
                ></CustomInput>
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
                className="create-portfolio-button py-1 px-3 my-2"
                onClick={submitHandler}
                disabled={isLoading}
              >
                Submit
              </button>
            </div>
          </Popup>
        )}
      </div>
    </>
  );
}
