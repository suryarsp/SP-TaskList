import * as React from 'react';
import styles from './CategorySettingsPanel.module.scss';
import { ICategorySettingsPanelProps,  ICategorySettingsPanelState} from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
export default class CategorySettingsPanel extends React.Component< ICategorySettingsPanelProps, ICategorySettingsPanelState> {
  private isDirty: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
  }

  public render(): React.ReactElement<ICategorySettingsPanelProps> {
    return (
      <div>
      <Panel
       isOpen={true}
       type={PanelType.medium}
       onDismiss={ () => this.props.hidePanel(this.isDirty)}
       headerText="Category settings "
       closeButtonAriaLabel="Close"
       onRenderFooterContent={this._onRenderFooterContent.bind(this)}
       isFooterAtBottom={true}
     >
       </Panel>
    </div>
    );
  }

  private _onRenderFooterContent() {
    return (
      <div>
        <DefaultButton onClick={() => this.props.hidePanel(this.isDirty)}>Close</DefaultButton>
      </div>
    );
  }
}
