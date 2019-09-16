import * as React from 'react';
import styles from './TaskList.module.scss';
import { ITaskListProps } from '../../../interfaces/components/ITaskListProps';
import { ITaskListState, IDataProvider } from '../../../interfaces/index';
import {  css } from 'office-ui-fabric-react';
import TaskDataProvider from '../../../services/TaskDataProvider';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import TaskInProgressPieChart from '../components/header/taskInProgressPieChart/TaskInProgressPieChart';
import StatusBarChart from '../components/header/statusBarChart/StatusBarChart';
import TaskFilter from '../components/header/taskFilter/TaskFilter';

import TaskListPanelContainer from '../components/taskListPanelContainer/TaskListPanelContainer';
import { ChartDataConstant } from '../../../common/defaults/chartData-constants';
export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {
  private dataProvider: IDataProvider;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isErrorOccured: false,
      isListAndLibraryPresent: false
    };
  }

  public componentDidMount() {
    TaskDataProvider.listNames = {
      taskListName: this.props.taskListName,
      commentsListName: this.props.commentsListName,
      groupListName: this.props.groupListName,
      categoryListName: this.props.categoryListName,
      statusListName: this.props.statusListName,
      responsibleListName: this.props.responsibleListName
    };
    TaskDataProvider.libraryName  = this.props.libraryName;
    this.dataProvider = TaskDataProvider.Instance;
    this.checkIfListAndLibraryPresent(this.props);
  }

  public componentWillReceiveProps(props) {
    this.checkIfListAndLibraryPresent(props);
  }

  public checkIfListAndLibraryPresent(props: ITaskListProps) {
    const { groupListName, responsibleListName, statusListName, categoryListName, commentsListName, libraryName, taskListName, isGroupingEnabled } = props;
    let promises = new Array<Promise<boolean>>();
    promises = [
      this.dataProvider.libraryExists(libraryName),
      this.dataProvider.listExists(categoryListName),
      this.dataProvider.listExists(responsibleListName),
      this.dataProvider.listExists(statusListName),
      this.dataProvider.listExists(commentsListName),
      this.dataProvider.listExists(taskListName)
    ];
    if(isGroupingEnabled && groupListName) {
      promises.push(this.dataProvider.listExists(groupListName));
      TaskDataProvider.isGroupingEnabled = isGroupingEnabled;
    }
      Promise.all(promises).then((values) => {
              if (values.filter(v => !v).length === 0) {
                    this.setState({
                      isListAndLibraryPresent: true,
                      isLoading: false
                    });
              } else {
                this.setState({
                  isListAndLibraryPresent: false,
                  isLoading: false
                });
              }
         }).catch(() => {
          this.setState({
            isErrorOccured: true,
            isLoading: false
          });
         });
}

public onClickDoughnutChart(party:string){
  console.log(party);  
}

  public render(): React.ReactElement<ITaskListProps> {
    if (this.state.isLoading) {
      return (
           <div className={styles.taskListWrapper}>
                <div className={styles.loadingWrapper}>
                     <Spinner size={SpinnerSize.large} label='Loading tasklist items...' />
                </div>
           </div>);
 }
 else if (!this.state.isListAndLibraryPresent) {
      return (
           <div className={styles.taskListWrapper}>
                <div className={styles.notificationMessageWrapper}>
                     <div className={styles.innerPropWrapper}>
                          <i className={"ms-Icon ms-Icon--ErrorBadge"} aria-hidden="true"></i>
                          <span>Please edit properties and config required settings !</span>
                     </div>
                </div>
           </div>);
 } else if (this.state.isErrorOccured) {
      return (
           <div className={styles.taskListWrapper}>
                <div className={styles.notificationMessageWrapper}>
                     <div className={styles.innerPropWrapper}>
                          <i
                               className={"ms-Icon ms-Icon--ErrorBadge"}
                               aria-hidden="true"
                          />
                          <span>
                               Sorry, something went wrong !!!
                          </span>
                     </div>
                </div>
           </div>

      );
 } else {
    return (
      <div className={css("ms-Fabric",styles.taskListWrapper)}>
        <div className={css("ms-Grid")}>
          <div className={css("ms-Grid-row")} >
            <div className={css("ms-Grid-col ms-sm6")}>
              <div className={styles.statusBarChart}>
                <StatusBarChart/>
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
          <TaskListPanelContainer
          uniqueToGroupEnabled =  { this.props.isCategoryUniqueEnabled }
          />
          
      </div>
    );
  }
}
}
