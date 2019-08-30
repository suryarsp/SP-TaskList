import * as React from 'react';
import styles from './StatusSettingsPanel.module.scss';
import { IStatusSettingsPanelProps } from '../../../../../../interfaces';
export default class StatusSettingsPanel extends React.Component< IStatusSettingsPanelProps, IStatusSettingsPanelProps> {
  public render(): React.ReactElement<IStatusSettingsPanelProps> {
    return (
        <h4> StatusSettingsPanel</h4>
    );
  }
}
