import { useState, useRef, useEffect } from "react";
import "./DropdownButton.scss";
import { useStore } from "../../store";

type Props = {
  dropdownButtonInitialName: string;
  items: {
    id: number;

    name: string;
    symbol?: string;
  }[];
  func: (id: number) => void;
};
export default function DropdownButton({
  dropdownButtonInitialName,
  items,
  func,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { pID } = useStore();
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
                  {selectedItem == ""
                    ? dropdownButtonInitialName
                    : selectedItem}
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
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    func(item.id);
                    setSelectedItem(item.name);
                    setIsOpen(false);
                  }}
                  className={`currency-item d-flex align-items-center gap-3 ${
                    pID === item.id ? "active" : ""
                  }`}
                >
                  <div className="flex-grow-1 py-1 px-1">
                    <div className="fw-semibold text-dark">{item.name}</div>
                  </div>
                  <span className="text-muted fw-medium">{item.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
