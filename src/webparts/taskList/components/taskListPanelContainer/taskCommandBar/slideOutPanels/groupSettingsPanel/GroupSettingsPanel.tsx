import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IGroupSettingsPanelProps, IGroupSettingsPanelState, IDataProvider, IGroup, DragDropResult } from '../../../../../../../interfaces/index';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import styles from './GroupSettingsPanel.module.scss';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IconButton, PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import * as _ from 'lodash';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { ProgressStatusType } from '../../../../../../../interfaces/enums/progressStatusType';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Layer } from 'office-ui-fabric-react/lib/Layer';


const getItemStyle = (isDragging, draggableStyle) => {
  if (isDragging) {
    return {
      padding: 2,
      margin: `0 0 2px 0`,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // styles we need to apply on draggables
      ...draggableStyle,
      transform: draggableStyle.transform ? `translate(0, ${draggableStyle.transform.substring(draggableStyle.transform.indexOf(',') + 1, draggableStyle.transform.indexOf(')'))})` : `none`,
    };
  }
  else {
    return {
      padding: 2,
      margin: `0 0 2px 0`,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // styles we need to apply on draggables
      transform: `none`,
      ...draggableStyle
    };
  }
};
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
      preventDelete: false,
      statusMessage: '',
      statusType: null
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;

  }

  public _onChangeDefaultCheckbox(group: IGroup, checked: boolean) {
    let groups = [...this.state.groups];
    let changedGroups = groups.map((g) => {
      if (checked) {
        if (g.ID === group.ID) {
          g.IsDefault = checked;
          return g;
        }
        g.IsDefault = false;
      }
      return g;
    });

    this.setState({
      groups: changedGroups
    }, );
  }

  public onChangeGroupTitle(newValue: string, group: IGroup) {
    let groups = [...this.state.groups];
    group.Title = newValue;
    const isGroupAlreadyPresent = groups.filter(g => g.Title.toLowerCase() === newValue.toLowerCase()).length > 1;
    if (!isGroupAlreadyPresent) {
      group.isExisting = false;
      this.setState({
        groups: groups
      });
      if (group.ID) {
        this.onUpdateGroup(group, newValue);
      } else {
        this.onAddGroup(group, newValue);
      }
    } else {
      if (this.clearTimeoutvalue) {
        clearTimeout(this.clearTimeoutvalue);
      }

      groups = groups.map(g => {
        if (g.GUID === group.GUID) {
          g.isExisting = true;
        }
        return g;
      });
      this.clearTimeoutvalue = setTimeout(() => {
        this.setState({
          groups: groups,
          statusMessage: '',
          statusType: null
        });
      }, 1000);
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
          return group;
        }
        return g;
      });

      this.setState({
        groups: groups,
        statusMessage: TaskListConstants.updateMessage,
        statusType: ProgressStatusType.SUCCESS
      }, () => () => TaskDataProvider.groups = groups);
    }, 1000);

    this.resetStatus();
  }

  public onAddGroup(group: IGroup, text: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }

    this.clearTimeoutvalue = setTimeout(() => {
      group.ID = this.state.groups.length + 1;
      let groups = _.cloneDeep(this.state.groups);
      groups = groups.map(g => !g.ID ? group : g);
      this.setState({
        groups: groups,
        statusMessage: TaskListConstants.successMessage,
        statusType: ProgressStatusType.SUCCESS
      }, () => TaskDataProvider.groups = groups);

    }, 1000);

    this.resetStatus();
    /// TODO : handle also for error
  }

  public resetStatus() {
    this.clearTimeoutvalue = setTimeout(() => {
      this.setState({
        statusMessage: '',
        statusType: null
      });
    }, 2000);
  }

  public onDeleteGroup(group: IGroup) {
    let categories = [...TaskDataProvider.categories];
    let groups = _.cloneDeep(this.state.groups);
    if (categories.filter(c => c.Group.Title.toLowerCase() === group.Title.toLowerCase()).length > 0) {
      this.setState({
        preventDelete: true
      });
    } else {
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

  public onDragEnd(result: DragDropResult) {
    const { source, destination } = result;

    if (!result.destination) {
      return;
    }

    let updatedGroups = this.reorder(
      _.cloneDeep(this.state.groups),
      source.index,
      destination.index
    );

    updatedGroups = updatedGroups.map((item, index) => {
      item.GUID = `${index + 1}`;
      item.GroupSort = index + 1;
      item.ID = index + 1;
      return item;
    });

    this.setState({
      groups: updatedGroups
    }, () => TaskDataProvider.groups = updatedGroups);
  }

  public reorder(list: IGroup[], startIndex: number, endIndex: number) {
    const result = _.cloneDeep(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  public onClickAdd() {
    let currentGroup: IGroup = {
      Title: '',
      ID: null,
      IsDefault: false,
      GroupSort: this.state.groups.length,
      GUID: (this.state.groups.length + 1).toString(),
      isExisting: false
    };
    const groups = [...this.state.groups];
    groups.push(currentGroup);
    this.setState({
      isAddClicked: true,
      currentGroup: currentGroup,
      groups: groups
    });
  }

  public getMessageBarType(statusType: ProgressStatusType) {
    let messageBarStatus: number;
    switch (statusType) {
      case ProgressStatusType.INPROGRESS: {
        messageBarStatus = MessageBarType.info;
        break;
      }

      case ProgressStatusType.SUCCESS: {
        messageBarStatus = MessageBarType.success;
        break;
      }

      case ProgressStatusType.FAILURE: {
        messageBarStatus = MessageBarType.error;
        break;
      }
    }

    return messageBarStatus;
  }

  public render(): React.ReactElement<IGroupSettingsPanelProps> {

    const  { groups, preventDelete, statusMessage , statusType } = this.state;
    const messageBarType = this.getMessageBarType(statusType);
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
        <Layer>
        <div className={styles.slidePaneloverlay}>
             <div className={styles.groupsPanel}>
                  <div className={styles.header}>
                       <div className={styles.closeButton}>
                            <IconButton
                                 iconProps={{ iconName: 'Cancel' }}
                                 onClick={() => {this.props.hidePanel(this.isDirty);}} />
                       </div>
                       <div className={styles.groupsTitle}>Group settings</div>
                       <div className={styles.verticalSeperator}></div>
                              </div>
          { preventDeletionDialog }
        {/* Disclaimer */}
          <div className= { styles.disclaimer}>
            <p>
              Changes made to these settings take effect immediately
            </p>
          </div>

          <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <Droppable droppableId="droppable">
          {(p, s) => (
            <div
              ref={p.innerRef}
            >
              { groups.map((group, index) => (
                <Draggable
                  key={group.GUID}
                  draggableId={group.GUID}
                  index={index}
                  isDragDisabled = { group.Title.trim().length === 0 || statusType !== null}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}

                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                <div className={ styles.groupContainer}>

                  {/* <IconButton
                  iconProps={{ iconName: 'Move',  }}
                  disabled={ group.Title.trim().length === 0}>
                 </IconButton> */}
                 <div {...provided.dragHandleProps}>
                  <h6>Drag Handle</h6>
                 </div>

                <TextField
                   value={ group.Title}
                   disabled={ group.IsDefault || statusType !== null}
                   styles={{ fieldGroup: { width: 200 } }}
                   onChange= { (e, newValue) => { this.onChangeGroupTitle(newValue, group); }}
                   errorMessage = {  group.isExisting ? "Group already exists" : (group.Title.trim().length === 0) ? "Value cannot be empty": null }/>

                <Checkbox
                  checked={group.IsDefault}
                  disabled={ group.Title.trim().length === 0 || statusType !== null}
                  onChange={ (e, checked) => { this._onChangeDefaultCheckbox(group, checked);}}/>

                {
                  !group.IsDefault ? (   <IconButton
                                            disabled={ group.Title.trim().length === 0 || statusType !== null}
                                            iconProps={{ iconName: 'Delete' }}
                                            onClick={ () => {this.onDeleteGroup(group);}}/>) : null
                }
                </div>
                </div>
                )}
                </Draggable>
              ))}
              {p.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>


          {/* Add Button */}
          <PrimaryButton
            data-automation-id="test"
            text="Add Group"
            allowDisabledFocus={true}
            onClick = { this.onClickAdd.bind(this) }
            style={{marginLeft: '15px'}}
          />

          {
            statusType ? ( <div className={ styles.statusMessage}>
              <MessageBar
               messageBarType={ messageBarType }>
                      { statusMessage }
             </MessageBar>
              </div>) : null
          }
         </div>
         </div>
         </Layer>
    );
  }
}
