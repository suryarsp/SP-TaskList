import * as React from 'react';
import styles from './ResponsiblePartySettingsPanel.module.scss';
import { IResponsiblePartySettingsPanelProps, IResponsiblePartySettingsPanelState } from '../../../../../../../interfaces';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
export default class ResponsiblePartySettingsPanel extends React.Component< IResponsiblePartySettingsPanelProps, IResponsiblePartySettingsPanelState> {
  private isDirty: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
  }

  public render(): React.ReactElement<IResponsiblePartySettingsPanelProps> {
    return (
      <div>
      <Panel
       isOpen={true}
       type={PanelType.medium}
       onDismiss={() => {this.props.hidePanel(this.isDirty);}}
       headerText="Panel - Small, right-aligned, fixed, with footer"
       closeButtonAriaLabel="Responsible party settings"
     >
       </Panel>
    </div>
    );
  }
}
