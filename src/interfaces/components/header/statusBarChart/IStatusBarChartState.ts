import { IBarChartSeriesBar } from "./BarChart/IBarChartSeriesBar";
import { ITaskList } from "../../../services/response/ITaskList";

export interface IStatusBarChartState {
    taskItems:ITaskList[];
    optionalBars:{};
    seriesBars:IBarChartSeriesBar[];
}
