import * as React from 'react';
import styles from './TaskPanelGrid.module.scss';
import { ITaskListPanelContainerProps, ITaskListPanelContainerState } from '../../../../interfaces/index';
export default class TaskListPanelContainer extends React.Component< ITaskListPanelContainerProps, ITaskListPanelContainerState> {
  public render(): React.ReactElement<ITaskListPanelContainerProps> {
    return (
        <h4> Task List Panel Container</h4>
    );
  }
}
