import Box from "@mui/material/Box";
import { PieChart } from "@mui/x-charts/PieChart";
import "./CircularChart.scss";

type PortfolioPie = {
  label: string;
  value: number;
};
[];

type Props = {
  portfolioPie: PortfolioPie[] | null;
};
export default function CircularChart({ portfolioPie }: Props) {
  return (
    <Box sx={{ width: "100%" }}>
      {portfolioPie && (
        <PieChart
          height={300}
          width={300}
          series={[
            {
              data: portfolioPie.slice(0, portfolioPie.length),
              innerRadius: 115,
              arcLabelMinAngle: 20,
              startAngle: -210,
              valueFormatter: (item: { value: number }) => `${item.value}%`,
            },
          ]}
          skipAnimation={false}
          hideLegend={false}
          slotProps={{
            legend: {
              direction: "horizontal",
              position: { vertical: "bottom" },
              className:
                "d-flex justify-content-center align-items-center text-light fw-bold text-uppercase px-2",
            },
          }}
          sx={{
            "& .MuiPieArc-root": {
              stroke: "#30302e",
              strokeWidth: 4,
            },
          }}
        />
      )}
    </Box>
  );
}
