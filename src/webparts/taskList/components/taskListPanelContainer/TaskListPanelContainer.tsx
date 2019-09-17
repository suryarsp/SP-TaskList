import * as React from 'react';
import styles from './TaskListPanelContainer.module.scss';
import { TaskCommandBar } from '../taskListPanelContainer/taskCommandBar/TaskCommandBar';
import { ITaskListPanelContainerProps, ITaskListPanelContainerState, IDataProvider, ITaskList } from '../../../../interfaces/index';
import TaskDataProvider from '../../../../services/TaskDataProvider';
import { IPermissions } from '../../../../services';
import TaskInProgressPieChart from '../../components/header/taskInProgressPieChart/TaskInProgressPieChart';
import StatusBarChart from '../../components/header/statusBarChart/StatusBarChart';
import TaskFilter from '../../components/header/taskFilter/TaskFilter';
import { ChartDataConstant } from '../../../../common/defaults/chartData-constants';
import { css } from '@uifabric/utilities';

export default class TaskListPanelContainer extends React.Component< ITaskListPanelContainerProps, ITaskListPanelContainerState> {
  private dataProvider: IDataProvider;
  private taskListName = TaskDataProvider.listNames.taskListName;
  constructor(props) {
    super(props);
    this.state = {
      libraryPermissions: [],
      listPermissions: [],
      isAllItemsSeleced: false,
      selectedItem: null,
      selectedItemCount: 0,
      totalItemCount: 0,
      allItems: []
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    const { listNames, libraryName} = TaskDataProvider;
    let promises = new Array<Promise<IPermissions[]>>(this.dataProvider.getPermissions(listNames.taskListName), this.dataProvider.getPermissions(libraryName));
    Promise.all(promises)
    .then((values) => {     
      this.dataProvider.getTaskListItem(this.taskListName).then((tasks) => {
        console.log("Get Task items : ",tasks);
        this.setState({
          allItems: tasks,
          listPermissions: values[0],
          libraryPermissions: values[1]
        },()=>TaskDataProvider.tasks = tasks);
      }).
        catch((error) => {
          console.log("Get Groups", error); 
        });
        
    }).catch((e) => console.log(e));
  }

  public onClickDoughnutChart(party:string){
    console.log(party);  
  }


  public render(): React.ReactElement<ITaskListPanelContainerProps> {
    const { listPermissions, libraryPermissions, selectedItemCount, isAllItemsSeleced, selectedItem, totalItemCount,allItems}  = this.state;
    
    if(this.state.allItems.length>0){
      return (
        <div className={css("ms-Fabric",styles.taskListWrapper)}>
        
          <div className={css("ms-Grid")}>
            <div className={css("ms-Grid-row")} >
              <div className={css("ms-Grid-col ms-sm6")}>
                <div className={styles.statusBarChart}>
                  <StatusBarChart
                      data={this.state.allItems}
                  />
                </div>
                <div className={styles.TaskFilter}>
                  <TaskFilter/>
                </div>
              </div>
              <div className={css("ms-Grid-col ms-sm2")}>
  
              </div>
              <div className={css("ms-Grid-col ms-sm4")}>
                <div className="TaskInProgressPieChart">
                  <TaskInProgressPieChart
                        chartData = {ChartDataConstant.chartData}
                        onClickChartView={this.onClickDoughnutChart.bind(this)}
                  />
                </div>
              </div>
            </div>
          </div>
          <TaskCommandBar
            selectedCount={selectedItemCount}
            isAllItemsSelected={isAllItemsSeleced}
            onCancelSelection={this.onCancelSelection.bind(this)}
            onClickDelete={this.onClickDelete.bind(this)}
            onRefreshPage={this.onRefreshPage.bind(this)}
            totalItemCount={totalItemCount}
            uniqueToGroupEnabled = {this.props.uniqueToGroupEnabled }
            isGroupingEnabled = {this.props.isGroupingEnabled }
            selectedItem = {selectedItem}
            listPermissions = {listPermissions}
            libraryPermissions = {libraryPermissions}
          />
        </div>
      );
    }
    else
    {
      return (
        <div className={css("ms-Fabric",styles.taskListWrapper)}>        
          <TaskCommandBar
            selectedCount={selectedItemCount}
            isAllItemsSelected={isAllItemsSeleced}
            onCancelSelection={this.onCancelSelection.bind(this)}
            onClickDelete={this.onClickDelete.bind(this)}
            onRefreshPage={this.onRefreshPage.bind(this)}
            totalItemCount={totalItemCount}
            uniqueToGroupEnabled = {this.props.uniqueToGroupEnabled }
            isGroupingEnabled = {this.props.isGroupingEnabled }
            selectedItem = {selectedItem}
            listPermissions = {listPermissions}
            libraryPermissions = {libraryPermissions}
          />
        </div>
      );
    }
  }


  public onClickDelete() {
  }

  public onRefreshPage() {
  }

  public onCancelSelection() {
      this.setState({
        isAllItemsSeleced: false,
        selectedItem: null,
        selectedItemCount: 0
      });
  }
}
