import * as React from 'react';
import styles from './TaskListDetails.module.scss';
import { ITaskListDetailsProps, ITaskListDetailsState } from '../../../../../interfaces/index';
export default class TaskListDetails extends React.Component<ITaskListDetailsProps , ITaskListDetailsState> {
  public render(): React.ReactElement<ITaskListDetailsProps> {
    return (
        <h4> TaskListDetails </h4>
    );
  }
}
