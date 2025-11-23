import React from "react";
import { ChartContainer } from "@mui/x-charts/ChartContainer";
import {
  LinePlot,
  MarkPlot,
  lineElementClasses,
  markElementClasses,
} from "@mui/x-charts/LineChart";
import "./LineChart.scss";

type LineChartValue = {
  xLabels: string[];
  pData: number[];
  currentEarning: number;
};
type Props = {
  chartData: LineChartValue;
};

export default function LineChart({ chartData }: Props) {
  return (
    <ChartContainer
      className="line-chart-wrapper p-2"
      series={[{ type: "line", data: chartData?.pData }]}
      xAxis={[
        { scaleType: "point", data: chartData?.xLabels, position: "none" },
      ]}
      yAxis={[{ position: "none" }]}
      sx={{
        [`& .${lineElementClasses.root}`]: {
          stroke: chartData?.currentEarning > 0 ? "#22BF75" : "#FA4F58",
          strokeWidth: 2,
        },
      }}
      disableAxisListener
    >
      <LinePlot />
    </ChartContainer>
  );
}
