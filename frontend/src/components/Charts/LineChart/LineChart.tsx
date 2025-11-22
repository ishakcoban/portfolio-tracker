import React from 'react'
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import {
  LinePlot,
  MarkPlot,
  lineElementClasses,
  markElementClasses,
} from '@mui/x-charts/LineChart';

const pData = [
  110000, 108500, 107200, 107800, 106300,
  105000, 104500, 103000, 101500, 100800,
  100200,  99500,  98200,  97000,  96000,
   95000,  94500,  94000,  93500,  93000,
   92500,  92000,  91500,  91000,  90500,
   90000,  89500,  89000,  125000,  88000
];

const xLabels = [
  'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5',
  'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10',
  'Day 11', 'Day 12', 'Day 13', 'Day 14', 'Day 15',
  'Day 16', 'Day 17', 'Day 18', 'Day 19', 'Day 20',
  'Day 21', 'Day 22', 'Day 23', 'Day 24', 'Day 25',
  'Day 26', 'Day 27', 'Day 28', 'Day 29', 'Day 30'
];


export default function LineChart() {
  return (
    <ChartContainer
      width={120}
      height={80}
      series={[{ type: 'line', data: pData }]}
      xAxis={[{ scaleType: 'point', data: xLabels, position: 'none'  }]}
      yAxis={[{ position: 'none' }]}
      sx={{
        [`& .${lineElementClasses.root}`]: {
          stroke: '#8884d8',
          strokeWidth: 2,
        },
   
      }}
      disableAxisListener
    >
      <LinePlot />
      
    </ChartContainer>
  );
}
