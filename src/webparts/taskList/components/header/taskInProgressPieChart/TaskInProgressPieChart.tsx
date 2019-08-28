import * as React from 'react';
import styles from './TaskInProgressPieChart.module.scss';
import { ITaskInProgressPieChartProps, ITaskInProgressPieChartState } from '../../../../../interfaces/index';
export default class TaskInProgressPieChart extends React.Component< ITaskInProgressPieChartProps,ITaskInProgressPieChartState> {
  public render(): React.ReactElement<ITaskInProgressPieChartProps> {
    return (
        <h4> TaskInProgressPieChart</h4>
    );
  }
}
