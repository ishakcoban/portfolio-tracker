import React, { useState, useRef, useEffect } from "react";
import "./DropdownButton.scss";
import { useStore } from "../../store";
import httpService from "../../services/httpService";
interface Currency {
  code: string;
  symbol: string;
}

interface Portfolio {
  id: number;
  name: string;
}
const currencies: Currency[] = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "TRY", symbol: "₺" },
];

type Props = {
  currencyUsage: boolean;
};
export default function DropdownButton({ currencyUsage }: Props) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const { currency, setPortfolioId, setCurrency } = useStore();

  const fetchData = async () => {
    try {
      const response = await httpService.get("/portfolios");

      console.log(response.data);
      if (response.status == 200) {
        setPortfolios(response.data);
      }
    } catch (error) {}
  };
  useEffect(() => {
    !currencyUsage && fetchData();
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setCurrency(currency.code);
    setIsOpen(false);
  };

  const handlePortfolio = (id: number) => {
    //setSelectedCurrency(currency);
    setPortfolioId(id);
    setIsOpen(false);
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center">
        <div className="currency-dropdown" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="currency-btn btn btn-light d-flex align-items-center justify-content-between"
          >
            <div className="d-flex align-items-center gap-3">
              <div className="currency-code-wrapper pe-2">
                <div className="fw-semibold text-dark">
                  {portfolios.length > 0 ? "Portfolio" : selectedCurrency.code}
                </div>
              </div>
            </div>
            <svg
              className={`chevron ${isOpen ? "open" : ""}`}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6c757d"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {isOpen && (
            <div className="dropdown-menu-custom bg-white rounded shadow-lg">
              {portfolios.length > 0
                ? portfolios.map((portfolio) => (
                    <button
                      key={portfolio.id}
                      onClick={() => handlePortfolio(portfolio.id)}
                      className={`currency-item d-flex align-items-center gap-3 ${
                        portfolio.id === portfolio.id ? "active" : ""
                      }`}
                    >
                      <div className="flex-grow-1 py-1 px-1">
                        <div className="fw-semibold text-dark">
                          {portfolio.name}
                        </div>
                      </div>
                    </button>
                  ))
                : currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleSelect(currency)}
                      className={`currency-item d-flex align-items-center gap-3 ${
                        selectedCurrency.code === currency.code ? "active" : ""
                      }`}
                    >
                      <div className="flex-grow-1 py-1 px-1">
                        <div className="fw-semibold text-dark">
                          {currency.code}
                        </div>
                      </div>
                      <span className="text-muted fw-medium">
                        {currency.symbol}
                      </span>
                    </button>
                  ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
