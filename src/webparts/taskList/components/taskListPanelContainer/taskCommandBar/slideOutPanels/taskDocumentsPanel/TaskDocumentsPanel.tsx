import * as React from 'react';
import styles from './TaskDocumentsPanel.module.scss';
import { ITaskDocumentsPanelProps, ITaskDocumentsPanelState } from '../../../../../interfaces/index';
export default class TaskDocumentsPanel extends React.Component< ITaskDocumentsPanelProps, ITaskDocumentsPanelState> {
  public render(): React.ReactElement<ITaskDocumentsPanelProps> {
    return (
        <h4> TaskDocumentsPanel</h4>
    );
  }
}
