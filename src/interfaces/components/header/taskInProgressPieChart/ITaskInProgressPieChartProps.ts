
import { ITaskList } from "../../../services/response/ITaskList";

export interface ITaskInProgressPieChartProps {
    chartData: ITaskList[];
    onClickChartView: (party:string) => void;
}
