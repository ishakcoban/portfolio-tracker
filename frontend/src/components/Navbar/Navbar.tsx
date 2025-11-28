import { useEffect, useRef, useState } from "react";
import "./Navbar.scss";
import Popup from "../Popup/Popup";
import CreatePortfolioForm from "../Popup/CreatePortfolioForm/CreatePortfolioForm";
import CreateAssetForm from "../Popup/CreateAssetForm/CreateAssetForm";
import SuccessMessageCard, {
  type SuccessMessageCardRef,
} from "../SuccessMessageCard/SuccessMessageCard";
import CreateTransactionFom from "../Popup/CreateTransactionFom/CreateTransactionFom";
import DropdownButton from "../Buttons/DropdownButton";

export default function Navbar() {
  const [popupType, setPopupType] = useState<null | string>(null);
  const cardRef = useRef<SuccessMessageCardRef | null>(null);
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState("");
  useEffect(() => {}, []);

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

  const handleCurrency = () => {};

  return (
    <>
      <SuccessMessageCard ref={cardRef} message={message}></SuccessMessageCard>
      <div className="navbar-wrapper d-flex justify-content-end">
        {/* currency dropdown section bottom */}

        {/* currency dropdown section above */}

        <button
          className="create-portfolio-asset-transaction-button py-1 px-3 my-2 me-4"
          onClick={() => openPopup("create-portfolio")}
        >
          Create Portfolio
        </button>
        <button
          className="create-portfolio-asset-transaction-button py-1 px-3 my-2 me-4"
          onClick={() => openPopup("create-asset")}
        >
          Create Asset
        </button>
        <button
          className="create-portfolio-asset-transaction-button py-1 px-3 my-2 me-4"
          onClick={() => openPopup("create-transaction")}
        >
          Create Transaction
        </button>
        <div className="me-4 d-flex justify-content-center align-items-center">
         
          <DropdownButton></DropdownButton>
        </div>

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
