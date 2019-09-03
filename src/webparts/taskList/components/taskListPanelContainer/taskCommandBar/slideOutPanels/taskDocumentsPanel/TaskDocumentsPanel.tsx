import * as React from 'react';
import styles from './TaskDocumentsPanel.module.scss';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ITaskDocumentsPanelProps, ITaskDocumentsPanelState } from '../../../../../../../interfaces/index';
export default class TaskDocumentsPanel extends React.Component< ITaskDocumentsPanelProps, ITaskDocumentsPanelState> {
  private isDirty: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
  }

  public render(): React.ReactElement<ITaskDocumentsPanelProps> {
    return (
      <div>
      <Panel
       isOpen={true}
       type={PanelType.medium}
       onDismiss={() => {this.props.hidePanel(this.isDirty);}}
       headerText="Documents"
       closeButtonAriaLabel="Close"
     >
       </Panel>
    </div>
    );
  }
}
