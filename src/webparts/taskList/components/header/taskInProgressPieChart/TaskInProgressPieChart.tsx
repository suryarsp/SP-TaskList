import * as React from 'react';
import styles from './TaskInProgressPieChart.module.scss';
import { ITaskInProgressPieChartProps, ITaskInProgressPieChartState, IDataProvider, IDoughnutChartData, IDoughnutChartDataSet } from '../../../../../interfaces/index';
import {Doughnut} from 'react-chartjs-2';
import { Item } from 'sp-pnp-js';
import { ChartDataConstant } from '../../../../../common/defaults/chartData-constants';
import _ from 'lodash';
import TaskDataProvider from '../../../../../services/TaskDataProvider';

export default class TaskInProgressPieChart extends React.Component< ITaskInProgressPieChartProps,ITaskInProgressPieChartState> {
  private dataProvider: IDataProvider; 
  private responsibleListName = TaskDataProvider.listNames.responsibleListName;
  private chartData= this.props.chartData;
  constructor(props : ITaskInProgressPieChartProps){
    super(props); 
    this.state=({
      doughnutChartData:[]      
    });
  }
  
  public generateChartData(){
    const chartDataArray= this.chartData;
    this.dataProvider=TaskDataProvider.Instance;
    const inProgressValue= ChartDataConstant.inProgressValue;
    const inProgressDataArray= chartDataArray.filter(Items=> Items.TaskStatus.Title === inProgressValue);
    const data : number[] =[];
    const label:string[]=[];
    const backgroundColors:string[]=[];
    const groupedResponsible=_.groupBy(inProgressDataArray,"Responsible.Title");    
    console.log("Grouped Responsible Party-",groupedResponsible);
    this.dataProvider.getResponsibleParties(this.responsibleListName).then(responsibleListItems=>{
        Object.keys(groupedResponsible).map(eachGroup=>{
        console.log(eachGroup,groupedResponsible[eachGroup].length);
          data.push(groupedResponsible[eachGroup].length);
          label.push(eachGroup); 
        });
        if(label.length>0){
          label.map(eachLabel=>{
            let colors=responsibleListItems.filter(res=> res.Title===eachLabel);
            if(colors.length>0){
              backgroundColors.push(colors[0]["FillColor"]);
            }          
          }); 
        }          
        console.log("Data[]",data,"label[]",label,"backgroundColors[]",backgroundColors);
        const datasets: IDoughnutChartDataSet[]= [
          {
            data:data ? data:[],
            backgroundColor:backgroundColors ? backgroundColors : [],
            hoverBackgroundColor:backgroundColors ? backgroundColors : []
          }
        ];
        const doughnutChartData:IDoughnutChartData[] = [{
          labels:label ? label : [],
          datasets:datasets ? datasets : []
        }];
    this.setState({
      doughnutChartData: doughnutChartData
    });
    console.log("Doughnut State",this.state.doughnutChartData);    
    });
  }
  public componentDidMount(){
    this.generateChartData();
  }

  public componentWillReceiveProps(){
    this.generateChartData();
  }

  public render(): React.ReactElement<ITaskInProgressPieChartProps> { 
    return (
      <div>
        <h4>Task In Progress by Responsible Party</h4>
        <Doughnut 
            data={this.state.doughnutChartData[0]} 
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
