import * as React from 'react';
import styles from './TaskList.module.scss';
import { ITaskListProps } from '../../../interfaces/components/ITaskListProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ITaskListState } from '../../../interfaces/index';

export default class TaskList extends React.Component<ITaskListProps, ITaskListState> {
  public render(): React.ReactElement<ITaskListProps> {
    return (
      <div className={ styles.taskList }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              Task List
            </div>
          </div>
        </div>
      </div>
    );
  }
}
