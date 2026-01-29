import React from "react";
import { ChartContainer } from "@mui/x-charts/ChartContainer";
import {
  LinePlot,
  MarkPlot,
  lineElementClasses,
  markElementClasses,
} from "@mui/x-charts/LineChart";
import "./LineChart.scss";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

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
    <>
      {chartData != null && chartData != undefined ? (
        <ChartContainer
          className="line-chart-wrapper p-2"
          series={[{ type: "line", data: chartData?.pData }]}
          xAxis={[
            { scaleType: "point", data: chartData?.xLabels, position: "none" },
          ]}
          yAxis={[{ position: "none" }]}
          sx={{
            [`& .${lineElementClasses.root}`]: {
              stroke: chartData?.currentEarning > 0 ? "#26A69A" : "#EF5350",
              strokeWidth: 2,
            },
          }}
          disableAxisListener
        >
          <LinePlot />
          <div>{chartData?.currentEarning}</div>
        </ChartContainer>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}
