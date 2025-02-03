import Highcharts from "highcharts/highstock";
import PieChart from "highcharts-react-official";
import { CHART_OPTIONS } from "@/components/crm/constants";

interface IReportDetailsChartProps {
  data: { name: string; y: number }[];
}

const ReportDetailsChart = ({ data }: IReportDetailsChartProps) => (
  <div className="w-36 h-36">
    <PieChart
      highcharts={Highcharts}
      options={{
        ...CHART_OPTIONS,
        series: [{ data }],
      }}
    />
  </div>
);

export default ReportDetailsChart;
