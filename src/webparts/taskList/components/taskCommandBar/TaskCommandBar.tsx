import * as React from 'react';
import styles from './TaskCommandBar.modules.scss';
import  { ITaskCommandBarProps, ITaskCommandBarState } from '../../../../interfaces/index';
export default class TaskCommandBar extends React.Component<ITaskCommandBarProps, ITaskCommandBarState> {
  public render(): React.ReactElement<ITaskCommandBarProps> {
    return (
        <h4> Command Bar</h4>
    );
  }
}
