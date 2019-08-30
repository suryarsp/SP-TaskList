
import * as React from 'react';
import styles from './GroupListView.module.scss';
import { IGroupListViewProps, IGroupListViewState } from '../../../../../interfaces/index';
export default class GroupListView extends React.Component< IGroupListViewProps, IGroupListViewState> {
  public render(): React.ReactElement<IGroupListViewState> {
    return (
        <h4>GroupListView</h4>
    );
  }
}
