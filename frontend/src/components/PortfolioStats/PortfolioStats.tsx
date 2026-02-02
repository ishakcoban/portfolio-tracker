import "./PortfolioStats.scss";
import CircularChart from "../Charts/PieChart/CircularChart";
import NumberFlow from "@number-flow/react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import {
  ArrowAllDirectionFreeIcons,
  ArrowUp01FreeIcons,
  ArrowUp01Icon,
  ArrowUp02Icon,
  ArrowUp03Icon,
  ArrowUp04Icon,
  ArrowUp05Icon,
  ArrowUpDoubleIcon,
  Delete03Icon,
  Remove01Icon,
  Remove02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useStore } from "../../store";
import FearGreedIndex from "../FearAndGreedIndex/FearGreedIndex";
import { useEffect, useRef, useState } from "react";
import httpService from "../../services/httpService";
import DeletePortfolioForm from "../Popup/DeletePortfolioForm/DeletePortfolioForm";
import Popup from "../Popup/Popup";
import type { SuccessMessageCardRef } from "../SuccessMessageCard/SuccessMessageCard";
import SuccessMessageCard from "../SuccessMessageCard/SuccessMessageCard";
type PortfolioStats = {
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
  portfolioStats: PortfolioStats | null;
};

type FearAndGreedIndex = {
  vix: {
    type: string;
    value: number;
  };
  crypto: {
    type: string;
    value: number;
  };
};
export default function PortfolioStats({ portfolioStats }: Props) {
  const { currency } = useStore();
  const [popupType, setPopupType] = useState<null | string>(null);
  const [fearAndGreedIndexData, setFearAndGreedIndexData] =
    useState<FearAndGreedIndex>();
  const [message, setMessage] = useState("");
  const cardRef = useRef<SuccessMessageCardRef | null>(null);
  const fetchData = async () => {
    try {
      const response = await httpService.get(
        "/portfolios/fear-and-greed-index",
      );

      if (response.status === 200) {
        setFearAndGreedIndexData(response.data);
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
      }
    }
  };

  useEffect(() => {
    fetchData();
    //fetchVixData();
  }, []);

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
    <div className="portfolio-stats-wrapper py-3">
      <SuccessMessageCard ref={cardRef} message={message}></SuccessMessageCard>
      {popupType && (
        <Popup onClose={closePopup}>
          <DeletePortfolioForm
            closePopup={closePopup}
            onSuccess={handleFormSuccess}
          ></DeletePortfolioForm>
        </Popup>
      )}

      {portfolioStats !== null &&
      portfolioStats.currentInvestmentByUSD !== undefined ? (
        <div className="position-relative d-flex justify-content-center align-items-center">
          <div className="position-absolute top-0 w-100">
            <div className="text-end pe-3">
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
          <div className="mt-3" style={{zIndex:1}}>
            <CircularChart portfolioPie={portfolioStats.portfolioPie} />
          </div>
          <div
            className="position-absolute top-0 text-center w-100"
            style={{ marginTop: "85px",zIndex:0 }}
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
                      ? portfolioStats.currentInvestmentByUSD
                      : currency === "EUR"
                        ? portfolioStats.currentInvestmentByEURO
                        : portfolioStats.currentInvestmentByTRY
                  }
                />
              </span>
            </div>

            <div
              className="d-flex justify-content-center fw-bold mt-2 mb-4"
              style={{ fontSize: ".8rem" }}
            >
              <div
                className={
                  "border-end text-green py-1 pe-2 " +
                  (currency === "USD"
                    ? portfolioStats.currentROIByUSD < 0 && " text-red"
                    : currency === "EUR"
                      ? portfolioStats.currentROIByEURO < 0 && " text-red"
                      : portfolioStats.currentROIByTRY < 0 && " text-red")
                }
              >
                <span>
                  <NumberFlow
                    format={{
                      notation: "standard",
                      signDisplay: "always",
                      maximumFractionDigits: 2,
                    }}
                    animated={false}
                    value={
                      currency === "USD"
                        ? portfolioStats.currentROIByUSD
                        : currency === "EUR"
                          ? portfolioStats.currentROIByEURO
                          : portfolioStats.currentROIByTRY
                    }
                  />
                  %
                </span>
              </div>
              <div
                className={
                  "border-end text-green py-1 px-2 " +
                  (currency === "USD"
                    ? portfolioStats.annualizedAverageROIByUSD < 0 &&
                      " text-red"
                    : currency === "EUR"
                      ? portfolioStats.annualizedAverageROIByEURO < 0 &&
                        " text-red"
                      : portfolioStats.annualizedAverageROIByTRY < 0 &&
                        " text-red")
                }
              >
                <span>
                  <NumberFlow
                    format={{
                      notation: "standard",
                      signDisplay: "always",
                      maximumFractionDigits: 2,
                    }}
                    animated={false}
                    value={
                      currency === "USD"
                        ? portfolioStats.annualizedAverageROIByUSD
                        : currency === "EUR"
                          ? portfolioStats.annualizedAverageROIByEURO
                          : portfolioStats.annualizedAverageROIByTRY
                    }
                  />
                  %
                </span>
              </div>
              <div
                className={
                  "text-green py-1 ps-2 " +
                  (currency === "USD"
                    ? portfolioStats.currentEarningByUSD < 0 && " text-red"
                    : currency === "EUR"
                      ? portfolioStats.currentEarningByEURO < 0 && " text-red"
                      : portfolioStats.currentEarningByTRY < 0 && " text-red")
                }
              >
                <span>
                  {currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺"}
                  <NumberFlow
                    format={{
                      notation: "standard",
                      maximumFractionDigits: 2,
                      signDisplay: "always",
                    }}
                    animated={false}
                    value={
                      currency === "USD"
                        ? portfolioStats.currentEarningByUSD
                        : currency === "EUR"
                          ? portfolioStats.currentEarningByEURO
                          : portfolioStats.currentEarningByTRY
                    }
                  />
                </span>
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
                      ? portfolioStats.totalRawInvestmentByUSD
                      : currency === "EUR"
                        ? portfolioStats.totalRawInvestmentByEURO
                        : portfolioStats.totalRawInvestmentByTRY
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
      {portfolioStats ? (
        <div className="currency-pairs-wrapper mx-4 border-top border-bottom mt-2">
          <div className="row m-0 p-0 py-1">
            <div className="col-4 m-0 p-0 ps-5 d-flex flex-column align-items-center">
              USD
              <div
                className={
                  portfolioStats?.currentEarningByUSD > 0
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
                    value={portfolioStats?.currentROIByUSD}
                  />
                  %
                </span>
              </div>
            </div>
            <div className="col-4 m-0 p-0 d-flex flex-column justify-content-center align-items-center">
              EURO
              <div
                className={
                  portfolioStats?.currentEarningByEURO > 0
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
                  value={portfolioStats?.currentROIByEURO}
                />
                %
              </div>
            </div>
            <div className="col-4 m-0 p-0 pe-5 d-flex flex-column align-items-center">
              TRY
              <div
                className={
                  portfolioStats?.currentEarningByTRY > 0
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
                    value={portfolioStats?.currentROIByTRY}
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

      {fearAndGreedIndexData && fearAndGreedIndexData?.crypto != undefined && (
        <div className="row m-0 p-0 mt-3">
          <div className="col-6 m-0 p-0 d-flex justify-content-end align-items-center pe-3 ps-5">
            <FearGreedIndex data={fearAndGreedIndexData.vix} />
          </div>
          <div className="col-6 m-0 p-0 d-flex justify-content-start align-items-center ps-3 pe-5">
            <FearGreedIndex data={fearAndGreedIndexData.crypto} />
          </div>
        </div>
      )}
    </div>
  );
}
