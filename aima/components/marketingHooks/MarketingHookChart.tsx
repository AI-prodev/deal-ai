// MarketingHookChart.tsx
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface MarketingHookChartProps {
  percentage: number;
  label: string;
  color: string;
}

const MarketingHookChart: React.FC<MarketingHookChartProps> = ({
  percentage,
  label,
  color,
}) => {
  const series = [percentage];
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, [percentage]);
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: true,
          value: {
            formatter: function (val: number) {
              return `${val}%`;
            },
            color: color,
            fontSize: "14px",
            show: true,
            offsetY: -10,
          },
        },
      },
    },
    fill: {
      colors: [color],
    },
    labels: [label],
    tooltip: {
      enabled: false,
      fixed: {
        enabled: true,
      },
      onDatasetHover: {
        highlightDataSeries: false,
      },
    },
    stroke: {
      lineCap: "round",
    },
  };

  return (
    <div className="w-[100px] md:w-[80px]">
      {isMounted && (
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={100}
          width={100}
        />
      )}
    </div>
  );
};

export default MarketingHookChart;
