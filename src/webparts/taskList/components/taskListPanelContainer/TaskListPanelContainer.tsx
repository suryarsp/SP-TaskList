import * as React from 'react';
import styles from './TaskListPanelContainer.module.scss';
import { TaskCommandBar } from '../taskListPanelContainer/taskCommandBar/TaskCommandBar';
import { ITaskListPanelContainerProps, ITaskListPanelContainerState, IDataProvider, ITaskList, ICategory } from '../../../../interfaces/index';
import TaskDataProvider from '../../../../services/TaskDataProvider';
import { IPermissions } from '../../../../services';
import TaskInProgressPieChart from '../../components/header/taskInProgressPieChart/TaskInProgressPieChart';
import StatusBarChart from '../../components/header/statusBarChart/StatusBarChart';
import TaskFilter from '../../components/header/taskFilter/TaskFilter';
import { ChartDataConstant } from '../../../../common/defaults/chartData-constants';
import { css } from '@uifabric/utilities';
import { Utilties } from '../../../../common/helper/Utilities';

export default class TaskListPanelContainer extends React.Component< ITaskListPanelContainerProps, ITaskListPanelContainerState> {
  private dataProvider: IDataProvider;
  public utilities: Utilties;
  private taskListName = TaskDataProvider.listNames.taskListName;
  constructor(props) {
    super(props);
    this.state = {
      libraryPermissions: [],
      listPermissions: [],
      isAllItemsSeleced: false,
      selectedItem: {ID:2,Title:"Task Test 0000",SortOrder:1,Group:{Title:"All tasks group",Id:1},
                      GUID:"59a7d38e-a907-4427-8158-6a51048be787",Category:{Id:2,Title:"Category 1"},SubCategory:{Id:5,Title:"Category 4"},
                      TaskStatus:{Id:3,Title:"In Progress"},Responsible:{Id:2,Title:"Borrower"},Comments:[],
                      children:[],key:"Task Test 0000",text:"Task Test 0000",Parent:{Id:15,Title:"Category 1"},Documents:[],CommentsId:null},
      selectedItemCount: 1,
      totalItemCount: 10,
      allItems: [],
      filteredItems:[],
      showFilter:false
    };
  }

  public componentDidMount() {
    this.utilities = Utilties.Instance;
    this.dataProvider = TaskDataProvider.Instance;
    const { listNames, libraryName} = TaskDataProvider;  
    const {groupListName, statusListName, responsibleListName, categoryListName} = TaskDataProvider.listNames;  
    let { groups, categories, responsibleParties, statuses, isGroupingEnabled}  = TaskDataProvider;
    let promises = new Array<Promise<IPermissions[]>>(this.dataProvider.getPermissions(listNames.taskListName), this.dataProvider.getPermissions(libraryName));
    Promise.all(promises)
    .then((values) => {  
      this.dataProvider.getTaskListItem(this.taskListName).then((tasks) => {
        console.log("Get Task items : ",tasks);        
        this.dataProvider.getCategories(categoryListName).then(categoriesItems =>{
          let newCategories: ICategory[] = this.utilities.mapCategotyItems(categoriesItems);
          TaskDataProvider.categories = newCategories;
          this.dataProvider.getStatuses(statusListName).then(statusItems =>{
            TaskDataProvider.statuses = statusItems;
            this.dataProvider.getResponsibleParties(responsibleListName).then(responsibleItems =>{
              TaskDataProvider.responsibleParties = responsibleItems;
              if(isGroupingEnabled){
                this.dataProvider.getGroups(groupListName).then(groupItems =>{
                  TaskDataProvider.groups = groupItems;
                  console.log("Task Data Category : ", TaskDataProvider.categories);
                  console.log("Task Data Status : ", TaskDataProvider.statuses);
                  console.log("Task Data Responsible : ", TaskDataProvider.responsibleParties);
                  console.log("Task Data Group : ", TaskDataProvider.groups);
                  this.setState({
                    allItems: tasks,
                    listPermissions: values[0],
                    libraryPermissions: values[1]
                  },()=>TaskDataProvider.tasks = tasks);
                });
              }
             else{
              console.log("Task Data Category : ", TaskDataProvider.categories);
              console.log("Task Data Status : ", TaskDataProvider.statuses);
              console.log("Task Data Responsible : ", TaskDataProvider.responsibleParties);
              console.log("Task Data Group : ", TaskDataProvider.groups);
              this.setState({
                allItems: tasks,
                listPermissions: values[0],
                libraryPermissions: values[1]
              },()=>TaskDataProvider.tasks = tasks);
             }
            });
          });
        });
      }).
        catch((error) => {
          console.log("Get Groups", error); 
        });
        
    }).catch((e) => console.log(e));
  }

  public onClickDoughnutChart(party:string){
    console.log("Filter Part Name",party);  
    const {allItems} = this.state;
    const inProgressValue= ChartDataConstant.inProgressValue;
    const filteredItems= allItems.filter(eachItem=> eachItem.Responsible.Title === party && eachItem.TaskStatus.Title === inProgressValue);
    this.setState({
      filteredItems:filteredItems,
      showFilter:true
    },()=> console.log("Filtered Items-",this.state.filteredItems));
  }


  public render(): React.ReactElement<ITaskListPanelContainerProps> {
    const { listPermissions, libraryPermissions, selectedItemCount, isAllItemsSeleced, selectedItem, totalItemCount,allItems,showFilter}  = this.state;
    
    if(allItems.length > 0){
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
                        chartData = {allItems}
                        onClickChartView={this.onClickDoughnutChart.bind(this)}
                  />
                </div>
              </div>
            </div>
          </div>
          <TaskCommandBar
            allTaskItems ={this.state.allItems}
            showFilter={showFilter}
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
            allTaskItems ={this.state.allItems}
            showFilter={showFilter}
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
