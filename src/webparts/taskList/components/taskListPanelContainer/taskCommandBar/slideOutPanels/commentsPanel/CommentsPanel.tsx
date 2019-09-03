import * as React from 'react';
import styles from './CommentsPanel.module.scss';
import { ICommentsPanelProps, ICommentsPanelState } from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
export default class CommentsPanel extends React.Component< ICommentsPanelProps, ICommentsPanelState> {
  private isDirty: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
  }

  public render(): React.ReactElement<ICommentsPanelProps> {
    return (
      <div>
      <Panel
       isOpen={true}
       type={PanelType.medium}
       onDismiss={() => this.props.hidePanel(this.isDirty)}
       headerText="Comments"
       closeButtonAriaLabel="Close"
     >
       </Panel>
    </div>
    );
  }
}
