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
        <Doughnut 
            data={this.props.chartData} 
            width={75} 
            height={15}               
            options={{
              legend: {
                display: true,
                maintainAspectRatio: false,
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
