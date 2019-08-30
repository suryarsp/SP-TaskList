import * as React from 'react';
import styles from './TaskList.module.scss';
import { ITaskListProps } from '../../../interfaces/components/ITaskListProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ITaskListState, IDataProvider } from '../../../interfaces/index';
import { TaskCommandBar}  from './taskListPanelContainer/taskCommandBar/TaskCommandBar';
import TaskDataProvider from '../../../services/TaskDataProvider';

export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {
  private dataProvider: IDataProvider;


  constructor(props) {
    super(props);
  }

  public componentDidMount() {
      this.dataProvider = TaskDataProvider.Instance;

  }

  public getListAndLibraryPermissions() {
    this.dataProvider.getPermissions(TaskDataProvider.listName).then((permissions) => {
      TaskDataProvider.listPermissions = permissions;
    }).catch((error) => console.log('Get Permsssion Error ', error));

    this.dataProvider.getPermissions(TaskDataProvider.librarayName).then((permissions) => {
      TaskDataProvider.libraryPermissions = permissions;
    }).catch((error) => console.log('Get Permsssion Error ', error));
  }

  public onClickDelete() {
  }

  public onRefreshPage() {
  }

  public onCancelSelection(){

  }

  public render(): React.ReactElement<ITaskListProps> {
    return (
      <div className={ styles.taskList }>
        <TaskCommandBar
        selectedCount = { 0 }
        isAllItemsSelected = { false }
        onCancelSelection = { () => null}
        onClickDelete = { this.onClickDelete.bind(this)}
        onRefreshPage = { this.onRefreshPage.bind(this)}
        totalItemCount = { 0 }
        />
      </div>
    );
  }
}
