import React, { useState, useEffect } from "react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

interface IndexData {
  type: string;
  value: number;
  classification?: string;
  color?: string;
  rotation?: number;
}

interface FearGreedIndexProps {
  data: IndexData;
}

const FearGreedIndex: React.FC<FearGreedIndexProps> = ({ data }) => {
  const [indexData, setIndexData] = useState<IndexData | null>(null);

  const getVixColor = (value: number): string => {
    if (value < 12) return "#28a745";
    if (value < 20) return "#a3e635";
    if (value < 30) return "#ffc107";
    if (value < 40) return "#fd7e14";
    return "#dc3545";
  };

  const getCryptoColor = (value: number): string => {
    if (value <= 20) return "#dc3545";
    if (value <= 40) return "#fd7e14";
    if (value <= 60) return "#ffc107";
    if (value <= 80) return "#a3e635";
    return "#28a745";
  };

  const getVixClassification = (value: number): string => {
    if (value < 12) return "Low Volatility";
    if (value < 20) return "Normal";
    if (value < 30) return "Elevated";
    if (value < 40) return "High Volatility";
    return "Extreme Volatility";
  };

  const getCryptoClassification = (value: number): string => {
    if (value <= 20) return "Extreme Fear";
    if (value <= 40) return "Fear";
    if (value <= 60) return "Neutral";
    if (value <= 80) return "Greed";
    return "Extreme Greed";
  };

  useEffect(() => {
    if (data.type === "VIX") {
      setIndexData({
        type: data.type,
        value: data.value,
        classification: getVixClassification(data.value),
        color: getVixColor(data.value),
        rotation: Math.min(((data.value - 10) / 40) * 180 - 90, 90),
      });
    } else {
      setIndexData({
        type: data.type,
        value: data.value,
        classification: getCryptoClassification(data.value),
        color: getCryptoColor(data.value),
        rotation: (data.value / 100) * 180 - 90,
      });
    }
  }, [data, data.type, data.value]);

  if (!indexData) return null;

  const isCrypto = indexData.type === "CRYPTO";

  return (
    <div className="d-flex align-items-center justify-content-center">
      {indexData ? (
        <div className="text-white">
          <div>
            <div style={{ fontSize: "11px" }} className="text-center">
              {isCrypto ? "CRYPTO" : "VIX"}
            </div>

            {/* Gauge Container */}
            <div
              className="position-relative mx-auto mb-4"
              style={{ maxWidth: "350px", aspectRatio: "2/1.2" }}
            >
              <svg
                className="w-100 h-100"
                viewBox="0 0 200 120"
                key={indexData.type}
              >
                <defs>
                  {/* Crypto gradient */}
                  <linearGradient
                    id="cryptoGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#dc3545" />
                    <stop offset="25%" stopColor="#fd7e14" />
                    <stop offset="50%" stopColor="#ffc107" />
                    <stop offset="75%" stopColor="#a3e635" />
                    <stop offset="100%" stopColor="#28a745" />
                  </linearGradient>

                  {/* VIX gradient */}
                  <linearGradient
                    id="vixGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#28a745" />
                    <stop offset="25%" stopColor="#a3e635" />
                    <stop offset="50%" stopColor="#ffc107" />
                    <stop offset="75%" stopColor="#fd7e14" />
                    <stop offset="100%" stopColor="#dc3545" />
                  </linearGradient>
                </defs>

                {/* Gauge background */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#343a40"
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* Colored gauge */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={
                    isCrypto ? "url(#cryptoGradient)" : "url(#vixGradient)"
                  }
                  strokeWidth="20"
                  strokeLinecap="round"
                />

                {/* Needle */}
                <g transform={`rotate(${indexData.rotation} 100 100)`}>
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="35"
                    stroke={indexData.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="100" r="8" fill={indexData.color} />
                </g>

                {/* Center circle */}
                <circle cx="100" cy="100" r="5" fill="#212529" />
              </svg>

              {/* Value Display */}
              <div
                className="position-absolute top-0 start-0 w-100 d-flex flex-column align-items-center justify-content-center"
                style={{ marginTop: "2rem" }}
              >
                <div className=" fw-bold" style={{ color: indexData.color }}>
                  {indexData.value}
                </div>
                <div
                  className="mt-2"
                  style={{ color: indexData.color, fontSize: ".9rem" }}
                >
                  {indexData.classification}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pb-2">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default FearGreedIndex;
