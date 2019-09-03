import * as React from 'react';
import styles from './StatusSettingsPanel.module.scss';
import { IStatusSettingsPanelProps } from '../../../../../../../interfaces';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
export default class StatusSettingsPanel extends React.Component< IStatusSettingsPanelProps, IStatusSettingsPanelProps> {
  private isDirty: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
  }

  public render(): React.ReactElement<IStatusSettingsPanelProps> {
    return (
      <div>
      <Panel
       isOpen={true}
       type={PanelType.medium}
       onDismiss={() => {this.props.hidePanel(this.isDirty);}}
       headerText="Status settings"
       closeButtonAriaLabel="Close"
     >
       </Panel>
    </div>
    );
  }
}
