import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from "lightweight-charts";
import "./TradingviewChart.scss";
import httpService from "../../../services/httpService";
interface TradingviewChartProps {
  data?: CandlestickData<Time>[];
}
type LineChart = {
  // index: number;
  //roi: number;
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};
const TradingviewChart: React.FC<TradingviewChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const sampleData = useRef<LineChart[]>([]);
  const chartRef = useRef<IChartApi | null>(null);
  const chartRef123 = useRef<LineChart[] | null>(null);
  const seriesRef = useRef<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null
  >(null);
  const [chartType, setChartType] = useState<"candlestick" | "line">(
    "candlestick"
  );
  const [chartData, setChartData] = useState<LineChart[]>();
  const hasFetched = useRef(false);
  const fetchData = async () => {
    try {
      const response = await httpService.get(
        `/portfolio-daily-changes/portfolio/6`
      );
      if (response.status === 200) {
        console.log("worked");
        console.log(response.data);
        sampleData.current = response.data;
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
      }
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (sampleData.current.length == 0) return;

    // Create chart
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 330,
      layout: {
        background: { color: "transparent" },
        textColor: "#bbbbb5",
      },
      grid: {
        vertLines: { color: "transparent" },
        horzLines: { color: "transparent" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#D1D4DC",
      },
      timeScale: {
        borderColor: "#D1D4DC",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series using v4 API
    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Sample data if none provided
    //console.log(chartRef123.current)
    // const sampleData: CandlestickData<Time>[] = [
    //   {
    //     time: "2024-01-03" as Time,
    //     open:
    //       chartData != null && chartData != undefined
    //         ? chartData[0].open
    //         : 108,
    //     high:
    //       chartData != null && chartData != undefined
    //         ? chartData[0].high
    //         : 120,
    //     low:
    //       chartData != null && chartData != undefined
    //         ? chartData[0].low
    //         : 108,
    //     close:
    //       chartData != null && chartData != undefined
    //         ? chartData[0].close
    //         : 112,
    //   },
    // ];
    //console.log(sampleData);
    //   open: 105, //   time: "2024-01-02" as Time, // { // { time: "2024-01-01" as Time, open: 100, high: 110, low: 95, close: 105 },
    //   high: 115,
    //   low: 100,
    //   close: 108,
    // },
    // {
    //   time: "2024-01-03" as Time,
    //   open: 108,
    //   high: 120,
    //   low: 105,
    //   close: 112,
    // },
    // {
    //   time: "2024-01-04" as Time,
    //   open: 112,
    //   high: 118,
    //   low: 108,
    //   close: 115,
    // },
    // {
    //   time: "2024-01-05" as Time,
    //   open: 115,
    //   high: 125,
    //   low: 112,
    //   close: 120,
    // },
    // {
    //   time: "2024-01-08" as Time,
    //   open: 120,
    //   high: 130,
    //   low: 115,
    //   close: 125,
    // },
    // {
    //   time: "2024-01-09" as Time,
    //   open: 125,
    //   high: 128,
    //   low: 118,
    //   close: 122,
    // },
    // {
    //   time: "2024-01-10" as Time,
    //   open: 122,
    //   high: 135,
    //   low: 120,
    //   close: 130,
    // },
    // {
    //   time: "2024-01-11" as Time,
    //   open: 122,
    //   high: 160,
    //   low: 120,
    //   close: 160,
    // },
    //

    seriesRef.current.setData(sampleData.current);

    // Fit content
    chartRef.current.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [/*data, */ sampleData.current]);

  const toggleChartType = () => {
    if (!chartRef.current) return;

    // Remove old series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    const newType = chartType === "candlestick" ? "line" : "candlestick";
    setChartType(newType);

    const sampleData: CandlestickData<Time>[] = (data || [
      { time: "2024-01-01" as Time, open: 100, high: 110, low: 95, close: 105 },
      {
        time: "2024-01-02" as Time,
        open: 105,
        high: 115,
        low: 100,
        close: 108,
      },
      {
        time: "2024-01-03" as Time,
        open: 108,
        high: 120,
        low: 105,
        close: 112,
      },
      {
        time: "2024-01-04" as Time,
        open: 112,
        high: 118,
        low: 108,
        close: 115,
      },
      {
        time: "2024-01-05" as Time,
        open: 115,
        high: 125,
        low: 112,
        close: 120,
      },
      {
        time: "2024-01-08" as Time,
        open: 120,
        high: 130,
        low: 115,
        close: 125,
      },
      {
        time: "2024-01-09" as Time,
        open: 125,
        high: 128,
        low: 118,
        close: 122,
      },
      {
        time: "2024-01-10" as Time,
        open: 122,
        high: 135,
        low: 120,
        close: 130,
      },
      {
        time: "2024-01-11" as Time,
        open: 122,
        high: 160,
        low: 120,
        close: 160,
      },
    ]) as CandlestickData<Time>[];

    if (newType === "line") {
      const lineSeries = chartRef.current.addSeries(LineSeries, {
        color: "#2962FF",
        lineWidth: 2,
      });
      const lineData = sampleData.map((d) => ({
        time: d.time,
        value: d.close,
      }));
      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    } else {
      const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });
      candleSeries.setData(sampleData);
      seriesRef.current = candleSeries;
    }

    chartRef.current.timeScale().fitContent();
  };

  return (
    <div
      className="lightweight-chart-wrapper pt-4 pb-2 px-4"
      style={{ position: "relative" }}
    >
      {/* <div style={{ marginBottom: "10px" }}>
        <button
          onClick={toggleChartType}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2962FF",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Toggle to {chartType === "candlestick" ? "Line" : "Candlestick"} Chart
        </button>
      </div> */}
      <div ref={chartContainerRef} />
    </div>
  );
};

export default TradingviewChart;
