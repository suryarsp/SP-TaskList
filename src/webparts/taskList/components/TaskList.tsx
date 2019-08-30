import * as React from 'react';
import styles from './TaskList.module.scss';
import { ITaskListProps } from '../../../interfaces/components/ITaskListProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ITaskListState } from '../../../interfaces/index';
import { TaskCommandBar}  from './taskListPanelContainer/taskCommandBar/TaskCommandBar';

export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {


  public componentDidMount() {


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
