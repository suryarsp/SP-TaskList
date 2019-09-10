import * as React from 'react';
import styles from './TaskInProgressPieChart.module.scss';
import { ITaskInProgressPieChartProps, ITaskInProgressPieChartState } from '../../../../../interfaces/index';
import {Doughnut} from 'react-chartjs-2';

export default class TaskInProgressPieChart extends React.Component< ITaskInProgressPieChartProps,ITaskInProgressPieChartState> {
  constructor(props : ITaskInProgressPieChartProps){
    super(props); 
  }
 

  public render(): React.ReactElement<ITaskInProgressPieChartProps> {
    return (
      <div>
        <h4> TaskInProgressPieChart</h4>
        <Doughnut 
            data={this.props.chartData}                
            options={{
              legend: {
                display: true,
                position:'right',
                onClick: (event) => {                                                                                      
                  event.stopPropagation();
                } 
              },
              cutoutPercentage: 40,
              responsive: true,               
            }}                
        />
      </div>
    );
  }
}
