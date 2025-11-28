import React, { useState, useRef, useEffect } from "react";
import "./DropdownButton.scss";
import { useStore } from "../../store";
interface Currency {
  code: string;
  symbol: string;
}

const currencies: Currency[] = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "TRY", symbol: "₺" },
];

export default function DropdownButton() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency } = useStore();
  useEffect(() => {
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
                  {selectedCurrency.code}
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
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency)}
                  className={`currency-item d-flex align-items-center gap-3 ${
                    selectedCurrency.code === currency.code ? "active" : ""
                  }`}
                >
                  <div className="flex-grow-1 py-1 px-1">
                    <div className="fw-semibold text-dark">{currency.code}</div>
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
