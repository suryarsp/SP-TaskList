import * as React from 'react';
import styles from './StatusBarChart.module.scss';
import {  IStatusBarChartProps, IStatusBarChartState } from '../../../../../interfaces/index';
import {barChartConstants} from '../../../../../interfaces/index';
import Chart from "react-apexcharts";
import {  css } from 'office-ui-fabric-react';
require("../../../../../styles/main.css");

export default class StatusBarChart extends React.Component< IStatusBarChartProps, IStatusBarChartState> {
  constructor(props:IStatusBarChartProps){
    super(props);
    this.state={
      optionalBars:{},
      seriesBars:[]
    };
  }
  public componentDidMount(){
    const options=barChartConstants.optionsBar;
    const seriesBars=barChartConstants.seriesBar;
    options['colors']=['#F44336', '#E91E63', '#9C27B0','#fcebc9'];
    this.setState({
      optionalBars:options,
      seriesBars:seriesBars
    });
  }
  public render(): React.ReactElement<StatusBarChart> {
    return (
      <div>
        <div className={css("ms-Fabric")}>                
          <div className={css("ms-Grid")}>    
            <div className={css("ms-Grid-row") } style={{ marginBottom: '10px' }}>
              <div className={css("ms-Grid-col ms-sm6") } >
                <h4>Progress</h4>
                <Chart
                      options={this.state.optionalBars}
                      height={120}
                      series={this.state.seriesBars}
                      type="bar"
                      width={500}
                />
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}