import { IDoughnutChartData } from "./DoughnutChart/IDoughnutChartData";

export interface ITaskInProgressPieChartProps {
    chartData: IDoughnutChartData;
    onClickChartView: (party:string) => void;
}
