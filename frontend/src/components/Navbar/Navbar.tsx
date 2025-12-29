import { useRef, useState, useEffect } from "react";
import "./Navbar.scss";
import Popup from "../Popup/Popup";
import CreatePortfolioForm from "../Popup/CreatePortfolioForm/CreatePortfolioForm";
import CreateAssetForm from "../Popup/CreateAssetForm/CreateAssetForm";
import SuccessMessageCard, {
  type SuccessMessageCardRef,
} from "../SuccessMessageCard/SuccessMessageCard";
import CreateTransactionFom from "../Popup/CreateTransactionFom/CreateTransactionFom";
import DropdownButton from "../Buttons/DropdownButton";
import httpService from "../../services/httpService";
import { useStore } from "../../store";

interface Portfolio {
  id: number;
  name: string;
}
interface Currency {
  id: number;
  name: string;
  symbol?: string;
}
interface Operation {
  id: number;
  name: string;
}
const currencyItems: Currency[] = [
  { id: 1, name: "USD", symbol: "$" },
  { id: 2, name: "EUR", symbol: "€" },
  { id: 3, name: "TRY", symbol: "₺" },
];

const operationItems: Operation[] = [
  { id: 1, name: "Portfolio" },
  { id: 2, name: "Asset" },
  { id: 3, name: "Transaction" },
];
export default function Navbar() {
  const [popupType, setPopupType] = useState<null | string>(null);
  const cardRef = useRef<SuccessMessageCardRef | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<Portfolio[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencyItems[0]
  );
  const { setPortfolioId, setCurrency } = useStore();
  const [message, setMessage] = useState("");

  const fetchPortfolioData = async () => {
    try {
      const response = await httpService.get("/portfolios");

      if (response.status == 200) {
        setPortfolioItems(response.data);
      }
    } catch (error) {}
  };

  const handlePortfolio = (id: number) => {
    setPortfolioId(id);
  };

  const handleCurrency = (id: number) => {
    currencyItems.map((item) => {
      if (id == item.id) {
        setSelectedCurrency(item);
        setCurrency(item.name);
      }
    });
  };

  const handleOperation = (id: number) => {
    operationItems.map((item) => {
      if (id == item.id) {
        openPopup(item.name);
      }
    });
  };

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

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  return (
    <>
      <SuccessMessageCard ref={cardRef} message={message}></SuccessMessageCard>
      <div className="navbar-wrapper d-flex justify-content-end py-2">
        <div className="me-4 d-flex justify-content-center align-items-center">
          <DropdownButton
          dropdownButtonInitialName ="Create"
            items={operationItems}
            func={handleOperation}
          ></DropdownButton>
        </div>
        <div className="me-4 d-flex justify-content-center align-items-center">
          <DropdownButton
          dropdownButtonInitialName ="Portfolio"
            items={portfolioItems}
            func={handlePortfolio}
          ></DropdownButton>
        </div>

        <div className="me-4 d-flex justify-content-center align-items-center">
          <DropdownButton
          dropdownButtonInitialName ="USD"
            items={currencyItems}
            func={handleCurrency}
          ></DropdownButton>
        </div>

        {popupType && (
          <Popup onClose={closePopup}>
            {popupType === "Portfolio" && (
              <CreatePortfolioForm
                closePopup={closePopup}
                onSuccess={handleFormSuccess}
              ></CreatePortfolioForm>
            )}

            {popupType === "Asset" && (
              <CreateAssetForm
                closePopup={closePopup}
                onSuccess={handleFormSuccess}
              ></CreateAssetForm>
            )}
            {popupType === "Transaction" && (
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
