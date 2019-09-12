import * as React from 'react';
import styles from './TaskListPanelContainer.module.scss';
import { TaskCommandBar } from '../taskListPanelContainer/taskCommandBar/TaskCommandBar';
import { ITaskListPanelContainerProps, ITaskListPanelContainerState } from '../../../../interfaces/index';
export default class TaskListPanelContainer extends React.Component< ITaskListPanelContainerProps, ITaskListPanelContainerState> {
  public render(): React.ReactElement<ITaskListPanelContainerProps> {
    return (
      <TaskCommandBar
      selectedCount={0}
      isAllItemsSelected={false}
      onCancelSelection={this.onCancelSelection.bind(this)}
      onClickDelete={this.onClickDelete.bind(this)}
      onRefreshPage={this.onRefreshPage.bind(this)}
      totalItemCount={0}
    />
    );
  }


  public onClickDelete() {
  }

  public onRefreshPage() {
  }

  public onCancelSelection() {

  }
}
