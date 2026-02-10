import { BarChart } from "@mui/x-charts/BarChart";
import "./BarChart.scss";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
const chartSetting = {
  yAxis: [
    {
      label: "ROI (%)",
      width: 60,
      labelStyle: {
        fill: "#6b7280",
      },
      tickLabelStyle: {
        fill: "#9ca3af",
      },
    },
  ],
  height: 290,
  sx: {
    "& .MuiChartsAxis-line": {
      stroke: "#d1d5db !important",
      color: "#d1d5db",
      strokeWidth: 2,
    },
    "& .MuiChartsAxis-tick": {
      stroke: "#d1d5db !important",
    },
    "& .MuiChartsGrid-line": {
      stroke: "#e5e7eb",
      strokeWidth: 0.8,
      strokeDasharray: "5 5",
      opacity: 0.3,
    },
    "& .MuiChartsLegend-label": {
      color: "#e5e7eb",
      fontSize: "11px",
      fontWeight: 600,
    },
  },
  grid: {
    vertical: true,
    horizontal: true,
  },
};

type Asset = {
  id: number;
  symbol: string;
  longName: string;
  totalRawInvestmentByUSD: number;
  totalRawInvestmentByEURO: number;
  totalRawInvestmentByTRY: number;
  totalQuantity: number;
  averageCostByUSD: number;
  averageCostByEURO: number;
  averageCostByTRY: number;
  initialWeight: number;
  currentPriceByUSD: number;
  currentPriceByEURO: number;
  currentPriceByTRY: number;
  currentROIByUSD: number;
  currentROIByEURO: number;
  currentROIByTRY: number;
  currentEarningByUSD: number;
  currentEarningByEURO: number;
  currentEarningByTRY: number;
  currentWeight: number;
  currentInvestmentByUSD: number;
  currentInvestmentByEURO: number;
  currentInvestmentByTRY: number;
};

type Props = {
  assets: Asset[];
};

// Generate distinct colors for each asset
const generateColors = (count: number): string[] => {
  const colors = [
    "#4254FB",
    "#FFB422",
    "#FA4F58",
    "#0DBEFF",
    "#22BF75",
    "#f97316",
    "#8b5cf6",
    "#ec4899",
    "#3b82f6",
    "#84cc16",
  ];

  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export default function AssetBarChart({ assets }: Props) {
  // Create dataset with currencies as x-axis
  
  const dataset = [
    {
      currency: "USD",
      ...assets.reduce(
        (acc, asset) => {
          acc[asset.symbol] = asset.currentROIByUSD;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
    {
      currency: "EUR",
      ...assets.reduce(
        (acc, asset) => {
          acc[asset.symbol] = asset.currentROIByEURO;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
    {
      currency: "TRY",
      ...assets.reduce(
        (acc, asset) => {
          acc[asset.symbol] = asset.currentROIByTRY;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
  ];
  // Generate colors for assets
  const colors = generateColors(assets.length);

  // Create a series for each asset
  const series = assets.map((asset, index) => ({
    dataKey: asset.symbol,
    label: asset.symbol,
    valueFormatter: (value: number | null) => `${value?.toFixed(2)}%`,
    color: colors[index],
  }));

  return (
    <div className="bar-chart-wrapper pt-4 pb-2 px-4 d-flex justify-content-center align-items-center h-100 w-100">
      {!dataset.some(obj => 
  Object.values(obj).some(value => value === undefined)
) ? (
        <BarChart
          dataset={dataset}
          xAxis={[
            {
              scaleType: "band" as const,
              dataKey: "currency",
              labelStyle: {
                fill: "#6b7280",
              },
              tickLabelStyle: {
                fill: "#9ca3af",
              },
            },
          ]}
          series={series}
          {...chartSetting}
        />
      ) : (
        <div className="pb-2"><LoadingSpinner /></div>
      )}
    </div>
  );
}
