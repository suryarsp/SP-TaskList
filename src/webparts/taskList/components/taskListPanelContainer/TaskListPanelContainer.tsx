import * as React from 'react';
import styles from './TaskListPanelContainer.module.scss';
import { TaskCommandBar } from '../taskListPanelContainer/taskCommandBar/TaskCommandBar';
import { ITaskListPanelContainerProps, ITaskListPanelContainerState, IDataProvider, ITaskList } from '../../../../interfaces/index';
import TaskDataProvider from '../../../../services/TaskDataProvider';
import { IPermissions } from '../../../../services';
export default class TaskListPanelContainer extends React.Component< ITaskListPanelContainerProps, ITaskListPanelContainerState> {
  private dataProvider: IDataProvider;

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
        this.setState({
          listPermissions: values[0],
          libraryPermissions: values[1]
        });
    }).catch((e) => console.log(e));
  }


  public render(): React.ReactElement<ITaskListPanelContainerProps> {
    const { listPermissions, libraryPermissions, selectedItemCount, isAllItemsSeleced, selectedItem, totalItemCount}  = this.state;
    return (
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
    );
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
