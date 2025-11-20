import { useRef, useState } from "react";
import "./Navbar.scss";
import Popup from "../Popup/Popup";
import CreatePortfolioForm from "../Popup/CreatePortfolioForm/CreatePortfolioForm";
import CreateAssetForm from "../Popup/CreateAssetForm/CreateAssetForm";
import SuccessMessageCard, {
  type SuccessMessageCardRef,
} from "../SuccessMessageCard/SuccessMessageCard";
import CreateTransactionFom from "../Popup/CreateTransactionFom/CreateTransactionFom";

export default function Navbar() {
  const [popupType, setPopupType] = useState<null | string>(null);
  const cardRef = useRef<SuccessMessageCardRef | null>(null);
  const [message, setMessage] = useState("");
  const openPopup = (popupType: string) => {
    setPopupType(popupType);
  };

  const closePopup = () => {
    setPopupType(null);
  };

  const handleFormSuccess = (msg: string) => {
    setMessage(msg);
    cardRef.current?.openSuccessMessageBox();
    setPopupType(null);
  };

  return (
    <>
      <SuccessMessageCard ref={cardRef} message={message}></SuccessMessageCard>
      <div className="navbar-wrapper d-flex justify-content-end">
        <button
          className="create-portfolio-button py-1 px-3 my-2 me-5"
          onClick={() => openPopup("create-portfolio")}
        >
          Create Portfolio
        </button>
        <button
          className="create-portfolio-button py-1 px-3 my-2 me-5"
          onClick={() => openPopup("create-asset")}
        >
          Create Asset
        </button>
        <button
          className="create-portfolio-button py-1 px-3 my-2 me-5"
          onClick={() => openPopup("create-transaction")}
        >
          Create Transaction
        </button>

        {popupType && (
          <Popup onClose={closePopup}>
            {popupType === "create-portfolio" && (
              <CreatePortfolioForm
                closePopup={closePopup}
                onSuccess={handleFormSuccess}
              ></CreatePortfolioForm>
            )}

            {popupType === "create-asset" && (
              <CreateAssetForm
                closePopup={closePopup}
                onSuccess={handleFormSuccess}
              ></CreateAssetForm>
            )}
            {popupType === "create-transaction" && (
              <CreateTransactionFom
                closePopup={closePopup}
                onSuccess={handleFormSuccess}
              ></CreateTransactionFom>
            )}
          </Popup>
        )}
      </div>
    </>
  );
}
