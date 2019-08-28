import * as React from 'react';
import styles from './TaskList.module.scss';
import { ITaskListProps } from '../../../interfaces/components/ITaskListProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ITaskListState } from '../../../interfaces/index';
import { TaskCommandBar}  from './taskCommandBar/TaskCommandBar';

export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {
  public render(): React.ReactElement<ITaskListProps> {
    return (
      <div className={ styles.taskList }>
        <TaskCommandBar
        selectedCount = { 0 }
        isAllItemsSelected = { false }
        onCancelSelection = { () => null}
        onClickDelete = { this.onClickDelete.bind(this)}
        onClickEdit = { this.onClickEdit.bind(this)}
        onClickAlertMe = { this.onClickAlertMe.bind(this)}
        onClickExportToPdf = { this.onClickExportToPdf.bind(this) }
        onClickManageMyAlerts = { this.onClickManageMyAlerts.bind(this)}
        onClickNew = { this.onClickNew.bind(this)}
        onRefreshPage = { this.onRefreshPage.bind(this)}
        onClickUploadTaskList = { this.onClickUploadTaskList.bind(this)}
        totalItemCount = { 0 }
        />
      </div>
    );
  }

  public onClickDelete() {
  }

  public onClickEdit() {
  }

  public onClickAlertMe() {
  }

  public onClickExportToPdf() {
  }

  public onClickManageMyAlerts() {
  }

  public onClickNew() {
  }

  public onRefreshPage() {
  }

  public onClickUploadTaskList() {

  }
}
