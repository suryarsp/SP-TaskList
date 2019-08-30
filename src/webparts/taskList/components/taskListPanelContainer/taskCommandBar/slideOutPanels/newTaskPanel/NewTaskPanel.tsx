import * as React from 'react';
import styles from './NewTaskPanel.module.scss';
import { INewTaskPanelProps, INewTaskPanelState } from '../../../../../interfaces/index';
export default class NewTaskPanel extends React.Component< INewTaskPanelProps, INewTaskPanelState> {
  public render(): React.ReactElement<INewTaskPanelProps> {
    return (
        <h4> NewTaskPanel</h4>
    );
  }
}
