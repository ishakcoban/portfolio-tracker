import React, { useCallback, useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  MouseEventParams,
} from "lightweight-charts";
import "./TradingviewChart.scss";
import httpService from "../../../services/httpService";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { useStore } from "../../../store";
import NumberFlow from "@number-flow/react";
interface TradingviewChartProps {
  data?: CandlestickData<Time>[];
}
type LineChart = {
  // index: number;
  roi: number;
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

interface OHLCData {
  open: string;
  high: string;
  low: string;
  close: string;
  color?: string;
  roi?: string;
}
const TradingviewChart: React.FC<TradingviewChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const sampleData = useRef<LineChart[]>([]);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<
    ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null
  >(null);
  const [ohlcData, setOhlcData] = useState<OHLCData | null>(null);
  const hasFetched = useRef(false);
  const chartPID = useRef(-1);
  const isChartInitialized = useRef(false);
  const { pID } = useStore();

  useEffect(() => {
    hasFetched.current = false;
  }, [pID]);

  const fetchData = useCallback(async () => {
    try {
      const response = await httpService.get(
        `/portfolio-daily-changes/portfolio/${pID}`
      );
      //console.log(response)
      if (response.status === 200) {
        const lastCandle = response.data[response.data.length - 1];
        const isGreen = lastCandle.close >= lastCandle.open;
        // Check if we need to update or add new data
        if (sampleData.current.length > 0 && chartPID.current == pID) {
          sampleData.current[sampleData.current.length - 1] = lastCandle;
          const roi =
            ((sampleData.current[sampleData.current.length - 1].close -
              sampleData.current[sampleData.current.length - 2].close) /
              sampleData.current[sampleData.current.length - 2].close) *
            100;

          // Update the chart without reloading or resetting zoom
          if (seriesRef.current && isChartInitialized.current) {
            setOhlcData({
              open: lastCandle.open.toFixed(2),
              high: lastCandle.high.toFixed(2),
              low: lastCandle.low.toFixed(2),
              close: lastCandle.close.toFixed(2),
              color: isGreen ? "#26a69a" : "#ef5350",
              roi: roi.toFixed(2),
            });
            seriesRef.current.update(lastCandle);
          }
        } else {
          // Initial load
          chartPID.current = pID;
          sampleData.current = response.data;
        }
      }
    } catch (error: any) {
      if (error.status === 400) {
        console.log(error.response.data);
      }
    }
  }, [pID]);

  useEffect(() => {
    if (pID && !hasFetched.current) {
      fetchData().then(() => {
        // Set initial OHLC data after fetching
        if (sampleData.current.length > 0) {
          const lastCandle = sampleData.current[sampleData.current.length - 1];
          const roi =
            ((sampleData.current[sampleData.current.length - 1].close -
              sampleData.current[sampleData.current.length - 2].close) /
              sampleData.current[sampleData.current.length - 2].close) *
            100;
          const isGreen = lastCandle.close >= lastCandle.open;
          setOhlcData({
            open: lastCandle.open.toFixed(2),
            high: lastCandle.high.toFixed(2),
            low: lastCandle.low.toFixed(2),
            close: lastCandle.close.toFixed(2),
            color: isGreen ? "#26a69a" : "#ef5350",
            roi: roi.toFixed(2),
          });
        }
      });
      hasFetched.current = true;
    }

    // Set up interval to fetch data every 5 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      fetchData();
    }, 2000); // 5000ms = 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [pID]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (sampleData.current.length == 0) return;
    if (isChartInitialized.current) return; // Prevent re-initialization

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
        mode: 0,
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

    seriesRef.current.setData(sampleData.current);

    // Set initial OHLC data to the last candle
    if (sampleData.current.length > 0) {
      const lastCandle = sampleData.current[sampleData.current.length - 1];
      const isGreen = lastCandle.close >= lastCandle.open;
      const roi =
        ((sampleData.current[sampleData.current.length - 1].close -
          sampleData.current[sampleData.current.length - 2].close) /
          sampleData.current[sampleData.current.length - 2].close) *
        100;
      setOhlcData({
        open: lastCandle.open.toFixed(2),
        high: lastCandle.high.toFixed(2),
        low: lastCandle.low.toFixed(2),
        close: lastCandle.close.toFixed(2),
        color: isGreen ? "#26a69a" : "#ef5350",
        roi: roi.toFixed(2),
      });
    }

    // Subscribe to crosshair move event
    chartRef.current.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.time || !seriesRef.current) {
        // Cursor is outside the chart, show last candle
        if (sampleData.current.length > 0) {
          const lastCandle = sampleData.current[sampleData.current.length - 1];
          const isGreen = lastCandle.close >= lastCandle.open;
          const roi =
            ((sampleData.current[sampleData.current.length - 1].close -
              sampleData.current[sampleData.current.length - 2].close) /
              sampleData.current[sampleData.current.length - 2].close) *
            100;
          setOhlcData({
            open: lastCandle.open.toFixed(2),
            high: lastCandle.high.toFixed(2),
            low: lastCandle.low.toFixed(2),
            close: lastCandle.close.toFixed(2),
            color: isGreen ? "#26a69a" : "#ef5350",
            roi: roi.toFixed(2),
          });
        }
        return;
      }

      const data = param.seriesData.get(seriesRef.current) as
        | CandlestickData<Time>
        | undefined;

      if (data) {
        const isGreen = data.close >= data.open;

        setOhlcData({
          open: data.open.toFixed(2),
          high: data.high.toFixed(2),
          low: data.low.toFixed(2),
          close: data.close.toFixed(2),
          color: isGreen ? "#26a69a" : "#ef5350",
        });
      }
    });

    // Fit content
    // Set visible range to show from the beginning of last year instead of fitting all content
    const now = new Date();
    const lastYear = now.getFullYear() - 1;
    const startOfLastYear = new Date(lastYear, 0, 1); // January 1st of last year

    chartRef.current.timeScale().setVisibleRange({
      from: sampleData.current[sampleData.current.length - 20].time as Time,
      to: sampleData.current[sampleData.current.length - 1].time as Time,
    });

    isChartInitialized.current = true;

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
        isChartInitialized.current = false;
      }
    };
  }, [sampleData.current]);

  return (
    <div
      className="lightweight-chart-wrapper p-4"
      style={{ position: "relative" }}
    >

      {ohlcData && (
        <div
          style={{
            position: "absolute",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#bbbbb5",
            pointerEvents: "none",
          }}
        >
          <div className="d-flex gap-2">
            <span>
              O: <strong style={{color:ohlcData.color}}>{ohlcData.open}</strong>
            </span>
            <span>
              H: <strong style={{color:ohlcData.color}}>{ohlcData.high}</strong>
            </span>
            <span>
              L: <strong style={{color:ohlcData.color}}>{ohlcData.low}</strong>
            </span>
            <span >
              C: <strong style={{color:ohlcData.color}}>{ohlcData.close}</strong>
            </span>
              <span >
               <strong style={{color:ohlcData.color}}>({Number(ohlcData.roi) > 0 ? "+" : "-"}{ohlcData.roi}%)</strong>
            </span>
         
          </div>
        </div>
      )}
      {sampleData.current.length > 0 ? (
        <div ref={chartContainerRef} />
      ) : (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default TradingviewChart;
