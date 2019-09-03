import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IGroupSettingsPanelProps, IGroupSettingsPanelState, IDataProvider, IGroup } from '../../../../../../../interfaces/index';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import styles from './GroupSettingsPanel.module.scss';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IconButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import * as _ from 'lodash';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';



export default class GroupSettingsPanel extends React.Component<IGroupSettingsPanelProps, IGroupSettingsPanelState> {
  public dataProvider: IDataProvider;
  private isDirty: boolean;
  private clearTimeoutvalue: number;

  constructor(props) {
    super(props);
    this.isDirty = false;
    this.state = {
      currentGroup: null,
      groups: TaskDataProvider.groups,
      isAddClicked: false,
      preventDelete : false,
      statusMessage: ''
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;

  }

  public _onControlledCheckboxChange(group: IGroup, checked: boolean) {
    let groups = [...this.state.groups];

    let changedGroups = groups.map((g) => {
      if (g.ID === group.ID) {
        g.IsDefault = checked;
        return g;
      }

      if (checked) {
        g.IsDefault = false;
      }
      return g;
    });

    this.setState({
      groups: changedGroups
    });
  }

  public onChangeGroupTitle(newValue: string, group: IGroup) {
    const groups = this.state.groups;
    if (newValue.trim().length > 0 || newValue !== null) {
      if (group.ID) {
        // update the existing group
        this.onUpdateGroup(group, newValue);
      } else {
        // add new group to the list
        this.setState({
          statusMessage: TaskListConstants.saveProgressMessage
        });
        this.onAddGroup(group, newValue);
      }
    }
  }

  public onUpdateGroup(group: IGroup, text: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      let groups = _.cloneDeep(this.state.groups);
      groups = groups.map((g) => {
        if (group.ID == g.ID) {
          g.Title = text;
          return g;
        }
        return g;
      });
      this.setState({
        groups: groups
      }, () => () => TaskDataProvider.groups = groups);

    }, 1000);
  }

  public onAddGroup(group: IGroup, text: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      group.Title = text;
      let groups = _.cloneDeep(this.state.groups);
      groups = groups.map(g => !g.ID ? group : g);
      this.setState({
        groups: groups,
        statusMessage: TaskListConstants.successMessage
      }, () => TaskDataProvider.groups = groups);

    }, 1000);
    this.clearTimeoutvalue = setTimeout(() => {
        this.setState({
          statusMessage: ''
        });
    }, 2000);
  }

  public onDeleteGroup(group: IGroup) {
    let categories = [...TaskDataProvider.categories];
    let groups = _.cloneDeep(this.state.groups);
    if(categories.filter(c => c.Group.Title.toLowerCase() === group.Title.toLowerCase()).length > 0) {
      this.setState({
        preventDelete: true
      });
    } else{
        let filterdGroups = groups.filter(g => g.ID !== group.ID);
        this.setState({
          groups: filterdGroups
        }, () => TaskDataProvider.groups = filterdGroups);
    }
  }

  public onClosePreventDeleteDialog() {
    this.setState({
      isAddClicked: false,
      preventDelete: false
    });
  }

  public onClickAdd() {
    let currentGroup: IGroup = {
      Title: '',
      ID: null,
      IsDefault: false,
      GroupSort: this.state.groups.length
    };
    const groups = [...this.state.groups];
    groups.push(currentGroup);
    this.setState({
      isAddClicked: true,
      currentGroup: currentGroup,
      groups: groups
    });
  }

  public render(): React.ReactElement<IGroupSettingsPanelProps> {
    const  { groups, preventDelete, statusMessage } = this.state;
    const preventDeletionDialog =  preventDelete ? (<Dialog
    hidden={false}
    onDismiss={() => this.onClosePreventDeleteDialog.bind(this)}
    dialogContentProps={{
      type: DialogType.normal,
      title: 'Delete not allowed',
      subText: TaskListConstants.preventGroupDeletionText
    }}
    modalProps={{
      isBlocking: false,
      styles: { main: { maxWidth: 450 } },
    }}
  >
    <DialogFooter>
      <PrimaryButton onClick={this.onClosePreventDeleteDialog.bind(this)} text="OK" />
    </DialogFooter>
    </Dialog>) :  null;
    return (
         <Panel
          isOpen={true}
          type={PanelType.medium}
          onDismiss={() => this.props.hidePanel(this.isDirty)}
          headerText="Group settings"
          closeButtonAriaLabel="Close"
        >
          <span>
            { statusMessage }
          </span>
          { preventDeletionDialog }
        {/* Disclaimer */}
          <div className= { styles.disclaimer}>
            <p>
              Changes made to these settings take effect immediately
            </p>
          </div>

          {/* Groups */}
          {
            groups.map((group) => {
              return (
                <div className={styles.groupContainer}>
                  <IconButton
                                          iconProps={{ iconName: 'Move' }}
                                          disabled={ group.Title.trim().length === 0 }/>);

                <TextField
                   value={ group.Title}
                   disabled={ group.IsDefault}
                   styles={{ fieldGroup: { width: 200 } }}
                   onChange= { (e, newValue) =>
                   {
                     this.onChangeGroupTitle(newValue, group);
                     }
                     } />

                <Checkbox
                  checked={group.IsDefault}
                  disabled={ group.Title.trim().length === 0 }
                  onChange={ (e, checked) => { this._onControlledCheckboxChange(group, checked);}}/>

                {
                  !group.IsDefault ? (   <IconButton
                                            disabled={ group.Title.trim().length === 0 }
                                            iconProps={{ iconName: 'Delete' }}
                                            onClick={ () => {this.onDeleteGroup(group);}}/>) : null
                }
                </div>
              );
            })
          }

          {/* Add Button */}
           <div className={styles.addBtn}>
          <PrimaryButton
            data-automation-id="test"
            text="Add Group"
            allowDisabledFocus={true}
            onClick = { this.onClickAdd.bind(this) }
          />
          </div>
          </Panel>
    );
  }

}
