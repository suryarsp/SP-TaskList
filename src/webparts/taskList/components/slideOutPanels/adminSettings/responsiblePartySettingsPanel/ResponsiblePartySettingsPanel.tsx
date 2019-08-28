import * as React from 'react';
import styles from './ResponsiblePartySettingsPanel.module.scss';
import { IResponsiblePartySettingsPanelProps, IResponsiblePartySettingsPanelState } from '../../../../../../interfaces';
export default class ResponsiblePartySettingsPanel extends React.Component< IResponsiblePartySettingsPanelProps, IResponsiblePartySettingsPanelState> {
  public render(): React.ReactElement<IResponsiblePartySettingsPanelProps> {
    return (
        <h4> ResponsiblePartySettingsPanel</h4>
    );
  }
}
