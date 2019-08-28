import * as React from 'react';
import styles from './TaskPanelGrid.module.scss';
import { ITaskPanelGridProps, ITaskPanelGridState } from '../../../../interfaces/index';
export default class TaskPanelGrid extends React.Component< ITaskPanelGridProps, ITaskPanelGridState> {
  public render(): React.ReactElement<ITaskPanelGridProps> {
    return (
        <h4> TaskPanelGrid</h4>
    );
  }
}
