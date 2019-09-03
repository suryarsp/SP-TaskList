import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IGroupSettingsPanelProps, IGroupSettingsPanelState, IDataProvider, IGroup } from '../../../../../../../interfaces/index';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import styles from './GroupSettingsPanel.module.scss';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IconButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import * as _ from 'lodash';


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
      isAddClicked: false
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
        groups: groups
      }, () => TaskDataProvider.groups = groups);

    }, 1000);
  }

  public onDeleteGroup(group: IGroup) {

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
    const  { groups } = this.state;
    return (
         <Panel
          isOpen={true}
          type={PanelType.medium}
          onDismiss={() => this.props.hidePanel(this.isDirty)}
          headerText="Group settings"
          closeButtonAriaLabel="Close"
        >
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
                  {
                    !group.IsDefault ? (<IconButton
                                          iconProps={{ iconName: 'Move' }}
                                          disabled={ group.Title.trim().length === 0 }/>) : null
                  }

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
