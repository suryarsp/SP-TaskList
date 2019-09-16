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
        <h4>Task In Progress by Responsible Party</h4>
        <Doughnut 
            data={this.props.chartData} 
            width={100} 
            height={40}               
            options={{
              onClick:(event, items) =>{
                if(!items && !Array.isArray(items)) {
                  return;
                }
                const item = items[0];  
                if(item) {
                const view = item._view;
                  if(view && view['label']) {
                      this.props.onClickChartView(view.label);
                  } 
                }
              },
              legend: {
                display: true,
                maintainAspectRatio: true,
                position:'right',
                onClick: (event) => {                                                                                      
                  event.stopPropagation();

                } 
              },
              cutoutPercentage: 55,
              responsive: true,               
            }}                
        />
      </div>
    );
  }
}
