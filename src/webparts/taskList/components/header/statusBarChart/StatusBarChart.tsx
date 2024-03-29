import * as React from 'react';
import styles from './StatusBarChart.module.scss';
import {  IStatusBarChartProps, IStatusBarChartState, IDataProvider, ITaskList } from '../../../../../interfaces/index';
import {barChartConstants} from '../../../../../interfaces/index';
import Chart from "react-apexcharts";
import _ from 'lodash';
import { Dictionary } from 'sp-pnp-js';
import { IBarChartSeriesBar } from '../../../../../interfaces/components/header/statusBarChart/BarChart/IBarChartSeriesBar';
// import {  css } from 'office-ui-fabric-react';
 import TaskDataProvider from '../../../../../services/TaskDataProvider';
import { values } from '@uifabric/utilities';
import { element } from 'prop-types';
require("../../../../../styles/main.css");
export default class StatusBarChart extends React.Component< IStatusBarChartProps, IStatusBarChartState> {
  private dataProvider: IDataProvider; 
  private statusListName = TaskDataProvider.listNames.statusListName;
  constructor(props:IStatusBarChartProps){
    super(props);
    this.state={
      taskItems:[],
      optionalBars:{},
      seriesBars:[]
    };
  
    console.log(props);
  }

  public statusSplit(items:ITaskList[]){   
    this.generateChartData(items).then((chartData:IBarChartSeriesBar[])=>{ 
      const options=barChartConstants.optionsBar;   
      options['colors']= [];  
      chartData.map(chartDataElement=>{
        let colors = TaskDataProvider.statuses.filter(s=>s.Title === chartDataElement.name);
        if(colors.length > 0){
          options['colors'].push(colors[0]["FillColor"]);
        }
        else{
          options['colors'].push("#ffffff");
        }
      });
      this.setState({
        taskItems:items,
        seriesBars:chartData, 
        optionalBars:options
      });
    });
  }

  public componentDidMount(){ 
    console.log(this.props.data); 
    this.statusSplit(this.props.data);   
  }

  public componentWillReceiveProps(){    
    console.log("CWRP-",this.props.data);    
    this.statusSplit(this.props.data);
  }

  public generateChartData(items):Promise<IBarChartSeriesBar[]>{
    return new Promise<IBarChartSeriesBar[]>((resolve)=>{
      const groupedStatusList= _.groupBy(items,"TaskStatus.Title");
      let chartData:IBarChartSeriesBar[] = [];
      Object.keys(groupedStatusList).map(statusGroup=>{
        console.log(statusGroup);
        console.log(groupedStatusList[statusGroup].length);
        let item:IBarChartSeriesBar = {
          name: statusGroup,
          data: [groupedStatusList[statusGroup].length]
        };
        chartData.push(item);
      });
      console.log(_.groupBy(items,"TaskStatus.Title"));
      console.log(_.groupBy(chartData,"Chart Data"));     
      resolve(chartData);   
    });
  }

  public render(): React.ReactElement<StatusBarChart> {
    const {taskItems} = this.state;
    if(taskItems.length > 0){
      return ( 
        <div>        
          {/* <div className={css("ms-Grid")}>
            <div className={css("ms-Grid-row") } >
            <div className={css("ms-Grid-col ms-sm12") } style={{padding:'0px'}} > */}
            <div style={{marginLeft:'10px'}}><h4>Progress</h4></div>
                <Chart
                      options={this.state.optionalBars}
                      height={150}
                      series={this.state.seriesBars}
                      type="bar"
                      width={485}
                />
              </div>
        //     </div> 
        //   </div>
        // </div>
      );
    }
    else{
      return ( 
        <div>        
          {/* <div className={css("ms-Grid")}>
            <div className={css("ms-Grid-row") } >
            <div className={css("ms-Grid-col ms-sm12") } style={{padding:'0px'}} > */}
            <div style={{marginLeft:'10px'}}><h4>Progress</h4></div>
               <div>No Data Found </div>
              </div>
        //     </div> 
        //   </div>
        // </div>
      );
    }
  }
}

