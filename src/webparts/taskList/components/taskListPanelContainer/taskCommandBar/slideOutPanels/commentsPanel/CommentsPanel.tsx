import * as React from 'react';
import styles from './CommentsPanel.module.scss';
import { ICommentsPanelProps, ICommentsPanelState } from '../../../../../interfaces/index';
export default class CommentsPanel extends React.Component< ICommentsPanelProps, ICommentsPanelState> {
  public render(): React.ReactElement<ICommentsPanelProps> {
    return (
        <h4> CommentsPanel</h4>
    );
  }
}
