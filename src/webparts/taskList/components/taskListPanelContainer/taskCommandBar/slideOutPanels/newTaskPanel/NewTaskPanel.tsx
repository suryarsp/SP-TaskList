import * as React from 'react';
import styles from './NewTaskPanel.module.scss';
import { INewTaskPanelProps, INewTaskPanelState } from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
export default class NewTaskPanel extends React.Component< INewTaskPanelProps, INewTaskPanelState> {

  private isDirty: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
  }

  public render(): React.ReactElement<INewTaskPanelProps> {
    return (
      <div>
      <Panel
       isOpen={true}
       type={PanelType.medium}
       onDismiss={() => {this.props.hidePanel(this.isDirty);}}
       headerText="Add new task"
       closeButtonAriaLabel="Close"
       onRenderFooterContent={this._onRenderFooterContent}
     >
       </Panel>
    </div>
    );
  }

  private _onRenderFooterContent () {
    return (
      <div>
        <PrimaryButton  style={{ marginRight: '8px' }}>
          Save
        </PrimaryButton>
        <DefaultButton >Cancel</DefaultButton>
      </div>
    );
  }
}
