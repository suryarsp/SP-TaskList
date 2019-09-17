import * as React from 'react';
import styles from './StatusBarChart.module.scss';
import {  IStatusBarChartProps, IStatusBarChartState, IDataProvider, ITaskList } from '../../../../../interfaces/index';
import {barChartConstants} from '../../../../../interfaces/index';
import Chart from "react-apexcharts";
import _ from 'lodash';
import { Dictionary } from 'sp-pnp-js';
// import {  css } from 'office-ui-fabric-react';
// import TaskDataProvider from '../../../../../services/TaskDataProvider';
require("../../../../../styles/main.css");
export default class StatusBarChart extends React.Component< IStatusBarChartProps, IStatusBarChartState> {
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
    const options=barChartConstants.optionsBar;
    const seriesBars=barChartConstants.seriesBar;
    options['colors']=['#F44336', '#E91E63', '#9C27B0','#fcebc9'];
    this.setState({
      taskItems:items,
      optionalBars:options,
      seriesBars:seriesBars,      
    });
    this.chartDataManifest(items);
  }

  public componentDidMount(){ 
    console.log(this.props.data); 
    this.statusSplit(this.props.data);   
  }

  public componentWillReceiveProps(){    
    console.log("CWRP-",this.props.data);    
    this.statusSplit(this.props.data);
  }

  public chartDataManifest(items){
    const temp= _.groupBy(items,"TaskStatus");
    console.log("GroupBy-",temp);    
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
