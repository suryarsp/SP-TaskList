
import * as React from 'react';
import styles from './GroupTabView.module.scss';
import { IGroupTabViewProps, IGroupTabViewState } from '../../../../../interfaces/index';
export default class GroupTabView extends React.Component< IGroupTabViewProps, IGroupTabViewState> {
  public render(): React.ReactElement<IGroupTabViewProps> {
    return (
        <h4>GroupTabView</h4>
    );
  }
}
