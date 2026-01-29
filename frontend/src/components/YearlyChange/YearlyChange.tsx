import { useEffect, useState } from "react";
import { useStore } from "../../store";
import "./YearlyChange.scss";
import httpService from "../../services/httpService";
import NumberFlow from "@number-flow/react";
type YearlyChange = {
  id: number;
  investedByUSD: number;
  investedByEURO: number;
  investedByTRY: number;
  finalValueByUSD: number;
  finalValueByEURO: number;
  finalValueByTRY: number;
  roiByUSD: number;
  roiByEURO: number;
  roiByTRY: number;
  year: number;
  portfolioId: number;
};

export default function YearlyChange() {
  const [yearData, setYearData] = useState<YearlyChange[]>([]);
  const { pID, currentInvestment } = useStore();

  const fetchData = async () => {
    try {
      const response = await httpService.get(`/portfolio-yearly-change/${pID}`);
      if (response.status === 200) {
        setYearData(response.data);
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [pID]);

  return (
    <div className="row m-0 px-3 mb-3 pt-3">
      <div className="col-12 m-0 p-0 text-light">
        <div className="row m-0 py-3 year-section">
          <div className="col-1 m-0 p-0 text-end pe-5">
            <div className="invisible pt-2">currencies</div>
            <div className="year-text-roi">$</div>
            <div className="year-text-roi">€</div>
            <div className="year-text-roi">₺</div>
          </div>
          {yearData &&
            yearData.map((data, index) => (
              <div key={data.id} className="col-1 m-0 p-0 text-start">
                <div className="year-text-header fw-bold">{data.year}</div>
                <div
                  className={
                    "year-text-roi text-green pt-2 " +
                    ((yearData.length == 1
                      ? (currentInvestment.byUSD * 100) / data.investedByUSD -
                        100
                      : data.roiByUSD) < 0 && " text-red")
                  }
                >
                  <span>
                    <NumberFlow
                      format={{
                        notation: "standard",

                        signDisplay: "never",
                        maximumFractionDigits: 2,
                      }}
                      animated={false}
                      value={Math.abs(
                        index == yearData.length - 1
                          ? ((currentInvestment.byUSD -
                              (yearData[index - 1].finalValueByUSD +
                                data.investedByUSD)) /
                              (yearData[index - 1].finalValueByUSD +
                                data.investedByUSD)) *
                              100
                          : data.roiByUSD,
                      )}
                    />
                  </span>
                  %
                </div>
                <div
                  className={
                    "year-text-roi text-green " +
                    ((yearData.length == 1
                      ? (currentInvestment.byEURO * 100) / data.investedByEURO -
                        100
                      : data.roiByEURO) < 0 && " text-red")
                  }
                >
                  <span>
                    <NumberFlow
                      format={{
                        notation: "standard",

                        signDisplay: "never",
                        maximumFractionDigits: 2,
                      }}
                      animated={false}
                      value={Math.abs(
                        index == yearData.length - 1
                          ? ((currentInvestment.byEURO -
                              (yearData[index - 1].finalValueByEURO +
                                data.investedByEURO)) /
                              (yearData[index - 1].finalValueByEURO +
                                data.investedByEURO)) *
                              100
                          : data.roiByEURO,
                      )}
                    />
                  </span>
                  %
                </div>
                <div
                  className={
                    "year-text-roi text-green " +
                    ((yearData.length == 1
                      ? (currentInvestment.byTRY * 100) / data.investedByTRY -
                        100
                      : data.roiByTRY) < 0 && " text-red")
                  }
                >
                  <span>
                    <NumberFlow
                      format={{
                        notation: "standard",

                        signDisplay: "never",
                        maximumFractionDigits: 2,
                      }}
                      animated={false}
                      value={Math.abs(
                        index == yearData.length - 1
                          ? ((currentInvestment.byTRY -
                              (yearData[index - 1].finalValueByTRY +
                                data.investedByTRY)) /
                              (yearData[index - 1].finalValueByTRY +
                                data.investedByTRY)) *
                              100
                          : data.roiByTRY,
                      )}
                    />
                  </span>
                  %
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
