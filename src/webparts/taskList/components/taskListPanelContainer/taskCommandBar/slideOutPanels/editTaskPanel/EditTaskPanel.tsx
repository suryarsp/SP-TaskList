
import * as React from 'react';
import styles from './EditTaskPanel.module.scss';
import { IEditTaskPanelProps, IEditTaskPanelState } from '../../../../../interfaces/index';
export default class EditTaskPanel extends React.Component< IEditTaskPanelProps, IEditTaskPanelState> {
  public render(): React.ReactElement<IEditTaskPanelProps> {
    return (
        <h4>Edit task Panel</h4>
    );
  }
}
