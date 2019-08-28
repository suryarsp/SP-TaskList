import * as React from 'react';
import styles from './TaskProgressGraph.module.scss';
import {  ITaskProgressGraphProps, ITaskProgressGraphState } from '../../../../../interfaces/index';
export default class TaskProgressGraph extends React.Component< ITaskProgressGraphProps, ITaskProgressGraphState> {
  public render(): React.ReactElement<TaskProgressGraph> {
    return (
        <h4> TaskProgressGraph</h4>
    );
  }
}
