import * as React from 'react';
import styles from './TaskList.module.scss';
import { ITaskListProps } from '../../../interfaces/components/ITaskListProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ITaskListState, IDataProvider } from '../../../interfaces/index';
import { TaskCommandBar } from './taskListPanelContainer/taskCommandBar/TaskCommandBar';
import TaskDataProvider from '../../../services/TaskDataProvider';
import { ListDetailsConstants } from '../../../common/defaults/listView-constants';

export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {
  private dataProvider: IDataProvider;
  private listName: string;

  constructor(props) {
    super(props);
  }

  public componentDidMount() {
    TaskDataProvider.listNames = {
      taskListName: this.props.taskListName,
      commentsListName: this.props.taskListName,
      groupListName: this.props.taskListName,
      categoryListName: this.props.taskListName,
      statusListName: this.props.taskListName,
      responsibleListName: this.props.taskListName
    };
    TaskDataProvider.libraryName  = this.props.libraryName;
    this.dataProvider = TaskDataProvider.Instance;
    this.getAdminSettings();
  }


  public getAdminSettings() {
    const { groupListName, statusListName, categoryListName, responsibleListName } = TaskDataProvider.listNames;
    this.dataProvider.getGroups(groupListName).then((groups) => {
      TaskDataProvider.groups = groups;
      console.log(groups);
    }).
      catch((error) => {
        console.log("Get Groups", error);
    });

    this.dataProvider.getCategories(categoryListName).then((categories) => {
      TaskDataProvider.categories = categories;
    }).
      catch((error) => {
        console.log("Get categories", error);
    });

    this.dataProvider.getStatuses(statusListName).then((statuses) => {
      TaskDataProvider.statuses = statuses;
    }).
      catch((error) => {
        console.log("Get statuses", error);
    });

    this.dataProvider.getResponsibleParties(responsibleListName).then((parties) => {
      TaskDataProvider.responsibleParties = parties;
    }).
      catch((error) => {
        console.log("Get responsibleParties", error);
    });

  }

  // public getListAndLibraryPermissions() {
  //   this.dataProvider.getPermissions(TaskDataProvider.listName).then((permissions) => {
  //     TaskDataProvider.listPermissions = permissions;
  //   }).catch((error) => console.log('Get Permsssion Error ', error));

  //   this.dataProvider.getPermissions(TaskDataProvider.librarayName).then((permissions) => {
  //     TaskDataProvider.libraryPermissions = permissions;
  //   }).catch((error) => console.log('Get Permsssion Error ', error));
  // }

  public onClickDelete() {
  }

  public onRefreshPage() {
  }

  public onCancelSelection() {

  }

  public render(): React.ReactElement<ITaskListProps> {
    return (
      <div className={styles.taskList}>
        <TaskCommandBar
          selectedCount={0}
          isAllItemsSelected={false}
          onCancelSelection={() => null}
          onClickDelete={this.onClickDelete.bind(this)}
          onRefreshPage={this.onRefreshPage.bind(this)}
          totalItemCount={0}
        />
      </div>
    );
  }
}
