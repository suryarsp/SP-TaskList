import * as React from 'react';
import styles from './GroupSettingsPanel.module.scss';
import { IGroupSettingsPanelProps, IGroupSettingsPanelState } from '../../../../../../interfaces/index';
export default class GroupSettingsPanel extends React.Component< IGroupSettingsPanelProps, IGroupSettingsPanelState> {
  public render(): React.ReactElement<IGroupSettingsPanelProps> {
    return (
        <h4> GroupSettingsPanel</h4>
    );
  }
}
