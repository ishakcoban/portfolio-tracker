import "./PortfolioPie.scss";
import CircularChart from "../Charts/PieChart/CircularChart";
import NumberFlow from "@number-flow/react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { Calculator01Icon, Delete03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useStore } from "../../store";
import { useRef, useState } from "react";
import DeletePortfolioForm from "../Popup/DeletePortfolioForm/DeletePortfolioForm";
import Popup from "../Popup/Popup";
import type { SuccessMessageCardRef } from "../SuccessMessageCard/SuccessMessageCard";
import SuccessMessageCard from "../SuccessMessageCard/SuccessMessageCard";
import CalculateInvestmentAmountByWeightForm from "../Popup/CalculateInvestmentAmountByWeightForm/CalculateInvestmentAmountByWeightForm";
type PortfolioPie = {
  id: number;
  name: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentByEURO: number;
  totalRawInvestmentByTRY: number;
  currentROIByUSD: number;
  currentROIByEURO: number;
  currentROIByTRY: number;
  currentEarningByUSD: number;
  currentEarningByEURO: number;
  currentEarningByTRY: number;
  currentInvestmentByUSD: number;
  currentInvestmentByEURO: number;
  currentInvestmentByTRY: number;
  annualizedAverageROIByUSD: number;
  annualizedAverageROIByEURO: number;
  annualizedAverageROIByTRY: number;
  portfolioPie: {
    label: string;
    value: number;
  }[];
};

type Props = {
  portfolioPie: PortfolioPie | null;
};

export default function PortfolioPie({ portfolioPie }: Props) {
  const { currency } = useStore();
  const [popupType, setPopupType] = useState<null | string>(null);
  const [message, setMessage] = useState("");
  const cardRef = useRef<SuccessMessageCardRef | null>(null);

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
    <div className="portfolio-pie-wrapper py-3 px-2">
      <SuccessMessageCard ref={cardRef} message={message}></SuccessMessageCard>
      {popupType && (
        <Popup onClose={closePopup}>
          {popupType == "CalculateInvestmentAmountByWeightForm" && (
            <CalculateInvestmentAmountByWeightForm />
          )}
          {popupType == "delete portfolio" && (
            <DeletePortfolioForm
              closePopup={closePopup}
              onSuccess={handleFormSuccess}
            />
          )}
        </Popup>
      )}

      {portfolioPie !== null &&
      portfolioPie.currentInvestmentByUSD !== undefined ? (
        <div className="position-relative d-flex justify-content-center align-items-center">
          <div className="position-absolute top-0 w-100">
            <div className="text-end pe-3">
              <HugeiconsIcon
                className="me-2"
                role="button"
                color="white"
                width={18}
                height={18}
                icon={Calculator01Icon}
                onClick={() =>
                  openPopup("CalculateInvestmentAmountByWeightForm")
                }
              />
              <HugeiconsIcon
                role="button"
                color="white"
                width={18}
                height={18}
                icon={Delete03Icon}
                onClick={() => openPopup("delete portfolio")}
              />
            </div>
          </div>
          <div className="mt-3" style={{ zIndex: 1 }}>
            <CircularChart portfolioPie={portfolioPie.portfolioPie} />
          </div>
          <div
            className="position-absolute top-0 text-center w-100"
            style={{ marginTop: "85px", zIndex: 0 }}
          >
            <div className="d-flex justify-content-center align-items-center">
              <div
                className="position-relative d-flex justify-content-center align-items-center me-1"
                style={{ width: "25px", height: "25px" }}
              >
                <span className="intro-banner-vdo-play-btn pinkBg d-flex justify-content-center align-items-center">
                  <span className="ripple pinkBg"></span>
                  <span className="ripple pinkBg"></span>
                  <span className="ripple pinkBg"></span>
                </span>
              </div>
              <div className="text-red fw-bold">LIVE</div>
            </div>

            <div className="portfolio-current-price">
              <span>
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺"}

                <NumberFlow
                  format={{
                    notation: "standard",
                    maximumFractionDigits: 2,
                    signDisplay: "never",
                  }}
                  spinTiming={{ duration: 1500, easing: "ease" }}
                  value={
                    currency === "USD"
                      ? portfolioPie.currentInvestmentByUSD
                      : currency === "EUR"
                        ? portfolioPie.currentInvestmentByEURO
                        : portfolioPie.currentInvestmentByTRY
                  }
                />
              </span>
            </div>

            <div className="d-flex justify-content-center align-items-start mt-2 gap-3">
              <div className="d-flex flex-column align-items-center">
                <div className="asset-header">ROI</div>
                <div
                  style={{ fontSize: ".7rem" }}
                  className={
                    "asset-value text-green fw-bold " +
                    (currency === "USD"
                      ? portfolioPie.currentROIByUSD < 0 && " text-red"
                      : currency === "EUR"
                        ? portfolioPie.annualizedAverageROIByEURO < 0 &&
                          " text-red"
                        : portfolioPie.annualizedAverageROIByTRY < 0 &&
                          " text-red")
                  }
                >
                  <span>
                    <NumberFlow
                      format={{
                        style: "decimal",
                        signDisplay: "always",
                        maximumFractionDigits: 2,
                      }}
                      animated={false}
                      value={
                        currency === "USD"
                          ? portfolioPie.currentROIByUSD
                          : currency === "EUR"
                            ? portfolioPie.currentROIByEURO
                            : portfolioPie.currentROIByTRY
                      }
                    />
                    %
                  </span>
                </div>
              </div>
              <div className="d-flex flex-column align-items-center">
                <div className="asset-header">CAGR</div>
                <div
                  style={{ fontSize: ".7rem" }}
                  className={
                    "asset-value text-green fw-bold " +
                    (currency === "USD"
                      ? portfolioPie.annualizedAverageROIByUSD < 0 &&
                        " text-red"
                      : currency === "EUR"
                        ? portfolioPie.annualizedAverageROIByEURO < 0 &&
                          " text-red"
                        : portfolioPie.annualizedAverageROIByTRY < 0 &&
                          " text-red")
                  }
                >
                  <span>
                    <NumberFlow
                      format={{
                        style: "decimal",
                        signDisplay: "always",
                        maximumFractionDigits: 2,
                      }}
                      animated={false}
                      value={
                        currency === "USD"
                          ? portfolioPie.annualizedAverageROIByUSD
                          : currency === "EUR"
                            ? portfolioPie.annualizedAverageROIByEURO
                            : portfolioPie.annualizedAverageROIByTRY
                      }
                    />
                    %
                  </span>
                </div>
              </div>
              <div className="d-flex flex-column align-items-center">
                <div className="asset-header">Profit</div>
                <div
                  style={{ fontSize: ".7rem" }}
                  className={
                    "asset-value text-green fw-bold " +
                    (currency === "USD"
                      ? portfolioPie.currentEarningByUSD < 0 && " text-red"
                      : currency === "EUR"
                        ? portfolioPie.currentEarningByEURO < 0 && " text-red"
                        : portfolioPie.currentEarningByTRY < 0 && " text-red")
                  }
                >
                  <span>
                    {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺"}
                    <NumberFlow
                      format={{
                        notation: "standard",

                        signDisplay: "always",
                        maximumFractionDigits: 2,
                      }}
                      animated={false}
                      value={
                        currency === "USD"
                          ? portfolioPie.currentEarningByUSD
                          : currency === "EUR"
                            ? portfolioPie.currentEarningByEURO
                            : portfolioPie.currentEarningByTRY
                      }
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="portfolio-raw-investment-header mt-3">
              TOTAL INVESTED
            </div>
            <div className="portfolio-raw-investment-value fw-bold">
              <span>
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺"}

                <NumberFlow
                  format={{
                    notation: "standard",
                    maximumFractionDigits: 2,
                    signDisplay: "never",
                  }}
                  animated={false}
                  value={
                    currency === "USD"
                      ? portfolioPie.totalRawInvestmentByUSD
                      : currency === "EUR"
                        ? portfolioPie.totalRawInvestmentByEURO
                        : portfolioPie.totalRawInvestmentByTRY
                  }
                />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}
      {portfolioPie ? (
        <div className="currency-pairs-wrapper mx-4 border-top mt-2">
          <div className="row m-0 p-0 py-2">
            <div className="col-4 m-0 p-0 ps-5 d-flex flex-column align-items-center">
              USD
              <div
                className={
                  portfolioPie?.currentEarningByUSD > 0
                    ? "text-green"
                    : "text-red"
                }
              >
                <span>
                  <NumberFlow
                    format={{
                      notation: "standard",
                      maximumFractionDigits: 2,
                      signDisplay: "always",
                    }}
                    animated={false}
                    value={portfolioPie?.currentROIByUSD}
                  />
                  %
                </span>
              </div>
            </div>
            <div className="col-4 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
              EURO
              <div
                className={
                  portfolioPie?.currentEarningByEURO > 0
                    ? "text-green"
                    : "text-red"
                }
              >
                <span></span>
                <NumberFlow
                  format={{
                    notation: "standard",
                    maximumFractionDigits: 2,
                    signDisplay: "always",
                  }}
                  animated={false}
                  value={portfolioPie?.currentROIByEURO}
                />
                %
              </div>
            </div>
            <div className="col-4 m-0 p-0 pe-5 d-flex flex-column align-items-center">
              TRY
              <div
                className={
                  portfolioPie?.currentEarningByTRY > 0
                    ? "text-green"
                    : "text-red"
                }
              >
                <span>
                  <NumberFlow
                    format={{
                      notation: "standard",
                      maximumFractionDigits: 2,
                      signDisplay: "always",
                    }}
                    animated={false}
                    value={portfolioPie?.currentROIByTRY}
                  />
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
