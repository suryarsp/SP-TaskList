import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IGroupSettingsPanelProps, IGroupSettingsPanelState, IDataProvider, IGroup, DragDropResult } from '../../../../../../../interfaces/index';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import styles from './GroupSettingsPanel.module.scss';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
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
  private groupListName = TaskDataProvider.listNames.groupListName;

  constructor(props) {
    super(props);
    this.isDirty = false;
    this.state = {
      currentGroup: null,
      groups: [],
      isAddClicked: false,
      preventDelete: false,
      statusMessage: '',
      statusType: null
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    this.dataProvider.getGroups(this.groupListName).then((groups) => {
      this.setState({
        groups: groups
      });
      TaskDataProvider.groups = groups;
    }).
      catch((error) => {
        console.log("Get Groups", error);
    });
  }

  public _onChangeDefaultCheckbox(group: IGroup, checked: boolean) {
    let groups = [...this.state.groups];
    let previousGroup = groups.filter(g => g.IsDefault)[0];
    if (checked) {
      group.IsDefault = checked;
      this.setState({
        statusMessage: TaskListConstants.saveProgressMessage,
        statusType: ProgressStatusType.INPROGRESS
      });
      this.dataProvider.updateGroupItem(this.groupListName, group.ID, group)
        .then((isSuccess) => {
          previousGroup.IsDefault = false;
          this.dataProvider.updateGroupItem(this.groupListName, previousGroup.ID, previousGroup).then((isPreviousSuccess) => {
            let changedGroups = groups.map((g) => {
              g.IsDefault = g.ID === group.ID ? checked : false;
              return g;
            });
            if (isSuccess && isPreviousSuccess) {
              this.setState({
                statusType: ProgressStatusType.SUCCESS,
                statusMessage: TaskListConstants.updateMessage,
                groups: changedGroups
              }, () => TaskDataProvider.groups = changedGroups);
              this.resetStatus();
            } else {
              this.setState({
                statusType: ProgressStatusType.FAILURE,
                statusMessage: TaskListConstants.errorMessage,
                groups: groups
              }, () => TaskDataProvider.groups = groups);
            }
          }).catch((e) => {
            this.setState({
              statusType: ProgressStatusType.FAILURE,
              statusMessage: TaskListConstants.errorMessage,
              groups: groups
            }, () => TaskDataProvider.groups = groups);
          });
        }).catch((error) => {
          this.setState({
            statusType: ProgressStatusType.FAILURE,
            statusMessage: TaskListConstants.errorMessage,
            groups: groups
          }, () => TaskDataProvider.groups = groups);
        });
    }

  }

  public onChangeGroupTitle(newValue: string, group: IGroup) {
    let groups = _.cloneDeep(this.state.groups);
    group.Title = newValue;
    const isGroupAlreadyPresent = groups.filter(g => g.Title.toLowerCase() === newValue.toLowerCase()).length > 0;
      if (!isGroupAlreadyPresent) {
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
            g.Title = newValue;
            g.isExisting = true;
          } else {
            g.isExisting = false;
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

  public onUpdateGroup(group: IGroup, title : string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      let groups = _.cloneDeep(this.state.groups);
      let updatedGroup = groups.filter(g => g.ID === group.ID)[0];
      updatedGroup.Title = title;
      this.dataProvider.updateGroupItem(this.groupListName, updatedGroup.ID, updatedGroup)
        .then((isUpdated) => {
          if (isUpdated) {
            updatedGroup.isExisting = false;
            groups = groups.map(g => g.ID === group.ID ? updatedGroup : g);
            this.setState({
              groups: groups,
              statusMessage: TaskListConstants.updateMessage,
              statusType: ProgressStatusType.SUCCESS
            }, () => {
              TaskDataProvider.groups = groups;
            });
            this.resetStatus();
          } else {
            this.setState({
              groups: groups,
              statusMessage: TaskListConstants.errorMessage,
              statusType: ProgressStatusType.FAILURE
            }, () => () => TaskDataProvider.groups = groups);
            this.resetStatus();
          }
        }).catch((error) => {
          this.setState({
            groups: groups,
            statusMessage: TaskListConstants.errorMessage,
            statusType: ProgressStatusType.FAILURE
          }, () => () => TaskDataProvider.groups = groups);
          this.resetStatus();
        });

    }, 1000);

  }

  public onAddGroup(group: IGroup, title: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      let groups = _.cloneDeep(this.state.groups);
      let newlyCreatedGroup = groups.filter(g => g.ID === group.ID)[0];
      newlyCreatedGroup.Title = title;
      this.dataProvider.insertGroupItem(this.groupListName, newlyCreatedGroup)
        .then((newGroup) => {
          newGroup.isExisting = false;
          groups = groups.map(g => !g.ID ? newGroup : g);
          this.setState({
            groups: groups,
            statusMessage: TaskListConstants.successMessage,
            statusType: ProgressStatusType.SUCCESS
          }, () => TaskDataProvider.groups = groups);
          this.resetStatus();
        }).catch(() => {
          this.setState({
            groups: groups,
            statusMessage: TaskListConstants.errorMessage,
            statusType: ProgressStatusType.FAILURE
          }, () => TaskDataProvider.groups = groups);
          this.resetStatus();
        });
    }, 1000);
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
    let categories = _.cloneDeep(TaskDataProvider.categories);
    let groups = _.cloneDeep(this.state.groups);
    if (categories.filter(c => c.Group.Title.toLowerCase() === group.Title.toLowerCase()).length > 0) {
      this.setState({
        preventDelete: true
      });
    } else {
      this.dataProvider.deleteItem(this.groupListName, group.ID)
        .then((isDeleted) => {
          if (isDeleted) {
            let filterdGroups = groups.filter(g => g.ID !== group.ID);
            this.setState({
              groups: filterdGroups,
              statusMessage: 'Deleted Successfully',
              statusType: ProgressStatusType.FAILURE
            }, () => TaskDataProvider.groups = filterdGroups);
            this.resetStatus();
          } else {
            this.setState({
              groups: groups,
              statusMessage: 'Error orrucured during deletion',
              statusType: ProgressStatusType.FAILURE
            }, () => TaskDataProvider.groups = groups);
            this.resetStatus();
          }
        }).catch((error) => {
          this.setState({
            groups: groups,
            statusMessage: 'Error orrucured during deletion',
            statusType: ProgressStatusType.FAILURE
          }, () => TaskDataProvider.groups = groups);
          this.resetStatus();
        });
    }
  }

  public onClosePreventDeleteDialog() {
    this.setState({
      isAddClicked: false,
      preventDelete: false
    });
  }

  public async onDragEnd(result: DragDropResult) {
    const { source, destination } = result;
    const groups = _.cloneDeep(this.state.groups);

    if (!result.destination) {
      return;
    }
    let updatedGroups = this.reorder(
      _.cloneDeep(this.state.groups),
      source.index,
      destination.index
    );
    updatedGroups = updatedGroups.map((item, index) => {
      item.GroupSort = index + 1;
      return item;
    });
    const destionationGroup = groups[destination.index];
    destionationGroup.GroupSort = source.index + 1;
    const sourceGroup = groups[source.index];
    sourceGroup.GroupSort = destination.index + 1;
    this.setState({
      statusMessage: 'Sorting inprogress',
      statusType: ProgressStatusType.INPROGRESS
    });
    await Promise.all([this.dataProvider.updateGroupItem(this.groupListName, sourceGroup.ID, sourceGroup), this.dataProvider.updateGroupItem(this.groupListName, destionationGroup.ID, destionationGroup)])
      .then((results) => {
        if (results[0] && results[1]) {
          this.setState({
            groups: updatedGroups,
            statusMessage: 'Sorted successfully',
            statusType: ProgressStatusType.SUCCESS
          }, () => TaskDataProvider.groups = groups);
          this.resetStatus();
        } else {
          this.setState({
            groups: groups,
            statusMessage: 'Error orrucured during sorting',
            statusType: ProgressStatusType.FAILURE
          }, () => TaskDataProvider.groups = groups);
          this.resetStatus();
        }

      }).catch((e) => {
        this.setState({
          groups: groups,
          statusMessage: 'Error orrucured during sorting',
          statusType: ProgressStatusType.FAILURE
        }, () => TaskDataProvider.groups = groups);
        this.resetStatus();
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
      GroupSort: this.state.groups.length + 1,
      GUID: (this.state.groups.length + 1).toString()
    };
    const groups = _.cloneDeep(this.state.groups);
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

    const { groups, preventDelete, statusMessage, statusType } = this.state;
    const messageBarType = this.getMessageBarType(statusType);
    const preventDeletionDialog = preventDelete ? (<Dialog
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
    </Dialog>) : null;
    return (
      <Layer>
        <div className={styles.slidePaneloverlay}>
          <div className={styles.groupsPanel}>
            <div className={styles.header}>
              <div className={styles.closeButton}>
                <IconButton
                  iconProps={{ iconName: 'Cancel' }}
                  onClick={() => { this.props.hidePanel(this.isDirty); }} />
              </div>
              <div className={styles.groupsTitle}>Group settings</div>
              <div className={styles.verticalSeperator}></div>
            </div>
            {preventDeletionDialog}
            {/* Disclaimer */}
            <div className={styles.disclaimer}>
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
                    {groups.map((group, index) => (
                      <Draggable
                        key={group.GUID}
                        draggableId={group.GUID}
                        index={index}
                        isDragDisabled={group.Title.trim().length === 0 || statusType !== null}
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
                            <div className={styles.groupContainer}>

                              {/* <IconButton
                  iconProps={{ iconName: 'Move',  }}
                  disabled={ group.Title.trim().length === 0}>
                 </IconButton> */}
                              <div {...provided.dragHandleProps}>
                                <h6>Drag Handle</h6>
                              </div>

                              <TextField
                                value={group.Title}
                                disabled={group.IsDefault || statusType !== null}
                                styles={{ fieldGroup: { width: 200 } }}
                                autoFocus={true}
                                onChange={(e, newValue) => { this.onChangeGroupTitle(newValue, group); }}
                                errorMessage ={ group.isExisting ? "Value already exists" : ""}/>

                              <Checkbox
                                checked={group.IsDefault}
                                disabled={group.Title.trim().length === 0 || statusType !== null}
                                onChange={(e, checked) => { this._onChangeDefaultCheckbox(group, checked); }} />

                              {
                                !group.IsDefault ? (<IconButton
                                  disabled={group.Title.trim().length === 0 || statusType !== null}
                                  iconProps={{ iconName: 'Delete' }}
                                  onClick={() => { this.onDeleteGroup(group); }} />) : null
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
            <div className={styles.addBtn}>
              <PrimaryButton
                data-automation-id="test"
                text="Add Group"
                allowDisabledFocus={true}
                disabled={statusType !== null}
                onClick={this.onClickAdd.bind(this)}
                style={{ marginLeft: '15px' }}
              />
            </div>


            {
              statusType ? (<div className={styles.statusMessage}>
                <MessageBar
                  messageBarType={messageBarType}>
                  {statusMessage}
                </MessageBar>
              </div>) : null
            }
          </div>
        </div>
      </Layer>
    );
  }
}
