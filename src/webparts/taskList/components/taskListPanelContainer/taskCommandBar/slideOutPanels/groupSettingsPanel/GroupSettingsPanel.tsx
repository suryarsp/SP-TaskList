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
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { IPermissions } from '../../../../../../../services';
import { PermissionKind } from 'sp-pnp-js';


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
  private permissions: IPermissions[];
  private canAddItem: boolean;
  private canUpdateItem: boolean;
  private canDeleteItem: boolean;
  private canViewItem: boolean;
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
    this.canAddItem = false;
    this.canUpdateItem = false;
    this.canDeleteItem = false;
    this.canViewItem = false;
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;



    this.dataProvider.getPermissions(this.groupListName).then((permissions) => {
      this.permissions = permissions;
      let canManageList = this.permissions.filter(item => item.permission == PermissionKind.ManageLists)[0].allowed;
      let canAddItem = this.permissions.filter(item => item.permission == PermissionKind.AddListItems)[0].allowed;
      let canEditItem = this.permissions.filter(item => item.permission == PermissionKind.EditListItems)[0].allowed;
      let canApproveItem = this.permissions.filter(item => item.permission == PermissionKind.ApproveItems)[0].allowed;
      let canDeleteItem = this.permissions.filter(item => item.permission == PermissionKind.DeleteListItems)[0].allowed;
      this.canViewItem = this.permissions.filter(item => item.permission == PermissionKind.ViewListItems)[0].allowed;

      if (canManageList || canAddItem) {
        this.canAddItem = true;
      }
      if (canManageList || canEditItem) {
        this.canUpdateItem = true;
      }
      if (canManageList || canDeleteItem) {
        this.canDeleteItem = true;
      }


      this.dataProvider.getGroups(this.groupListName).then((groups) => {
        this.setState({
          groups: groups
        });
        TaskDataProvider.groups = groups;
      }).
        catch((error) => {
          console.log("Get Groups", error);
        });
    });

  }

  public _onChangeDefaultCheckbox(group: IGroup, checked: boolean) {
    let groups = _.cloneDeep(this.state.groups);
    let previousGroup = groups.filter(g => g.IsDefault)[0];
    const { saveProgress, updateSuccess, saveError } = TaskListConstants.errorMessages;
    if (checked) {
      group.IsDefault = checked;
      group.isSaving = true;
      this.setState({
        statusMessage: saveProgress,
        statusType: ProgressStatusType.INPROGRESS
      });
      this.dataProvider.updateGroupItem(this.groupListName, group.ID, group)
        .then((isSuccess) => {
          previousGroup.IsDefault = false;
          this.dataProvider.updateGroupItem(this.groupListName, previousGroup.ID, previousGroup).then((isPreviousSuccess) => {
            let changedGroups = groups.map((g) => {
              g.IsDefault = g.ID === group.ID ? checked : false;
              g.isSaving = false;
              return g;
            });
            if (isSuccess && isPreviousSuccess) {
              this.setState({
                statusType: ProgressStatusType.SUCCESS,
                statusMessage: updateSuccess,
                groups: changedGroups
              }, () => TaskDataProvider.groups = changedGroups);
              this.resetStatus();
            } else {
              this.setState({
                statusType: ProgressStatusType.FAILURE,
                statusMessage: saveError,
                groups: groups
              });
            }
          }).catch(() => {
            this.setState({
              statusType: ProgressStatusType.FAILURE,
              statusMessage: saveError,
              groups: groups
            });
          });
        }).catch(() => {
          this.setState({
            statusType: ProgressStatusType.FAILURE,
            statusMessage: saveError,
            groups: groups
          });
        });
    }

  }

  public onChangeGroupTitle(newValue: string, group: IGroup) {
    let groups = _.cloneDeep(this.state.groups);
    group.Title = newValue;
    group.isSaving = true;
    const isGroupAlreadyPresent = groups.filter(g => g.Title.toLowerCase() === newValue.toLowerCase()).length > 0;
    if (!isGroupAlreadyPresent) {
      if (group.isNew) {
        this.onAddGroup(group, newValue);
      } else {
        this.onUpdateGroup(group, newValue);
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

  public onUpdateGroup(group: IGroup, title: string) {
    const { saveError, updateSuccess } = TaskListConstants.errorMessages;
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let groups = _.cloneDeep(this.state.groups);
      let updatedGroup = groups.filter(g => g.ID === group.ID)[0];
      updatedGroup.Title = title;
      updatedGroup.isSaving = false;
      this.dataProvider.updateGroupItem(this.groupListName, updatedGroup.ID, updatedGroup)
        .then((isUpdated) => {
          if (isUpdated) {
            updatedGroup.isExisting = false;
            groups = groups.map(g => {
              if (g.ID === group.ID) {
                return updatedGroup;
              }
              g.isSaving = false;
              return g;
            });
            this.setState({
              groups: groups,
              statusMessage: updateSuccess,
              statusType: ProgressStatusType.SUCCESS
            }, () => {
              TaskDataProvider.groups = groups;
            });
            this.resetStatus();
          } else {
            this.setState({
              groups: groups,
              statusMessage: saveError,
              statusType: ProgressStatusType.FAILURE
            });
          }
        }).catch((error) => {
          this.setState({
            groups: groups,
            statusMessage: saveError,
            statusType: ProgressStatusType.FAILURE
          });
        });

    }, 1000);
  }

  public onClickCancel(group: IGroup) {
    let groups = _.cloneDeep(this.state.groups);
    let updatedGroups = groups.filter(g => g.GUID !== group.GUID);
    updatedGroups = updatedGroups.map((g, index) => {
      if (!g.ID) {
        g.SortOrder = index + 1;
        g.GUID = (index + 1).toString();
      }
      return g;
    });
    this.setState({
      groups: updatedGroups
    });
  }

  public onAddGroup(group: IGroup, title: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let groups = _.cloneDeep(this.state.groups);
      let newlyCreatedGroup = _.cloneDeep(groups.filter(g => g.GUID === group.GUID)[0]);
      newlyCreatedGroup.Title = title;
      this.dataProvider.insertGroupItem(this.groupListName, newlyCreatedGroup)
        .then((newGroup) => {
          newGroup.isExisting = false;
          newGroup.isSaving = false;
          groups = groups.map(g => {
            if (g.GUID === group.GUID) {
              return newGroup;
            }
            g.isSaving = false;
            return g;
          });
          this.setState({
            groups: groups,
            statusMessage: TaskListConstants.errorMessages.saveSuccess,
            statusType: ProgressStatusType.SUCCESS
          });
          this.resetStatus();
        }).catch(() => {
          this.setState({
            groups: groups,
            statusMessage: TaskListConstants.errorMessages.saveError,
            statusType: ProgressStatusType.FAILURE
          });
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
    const { deleteSuccess, deleteError } = TaskListConstants.errorMessages;
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
              statusMessage: deleteSuccess,
              statusType: ProgressStatusType.FAILURE
            }, () => TaskDataProvider.groups = filterdGroups);
            this.resetStatus();
          } else {
            this.setState({
              groups: groups,
              statusMessage: deleteError,
              statusType: ProgressStatusType.FAILURE
            });
          }
        }).catch(() => {
          this.setState({
            groups: groups,
            statusMessage: deleteError,
            statusType: ProgressStatusType.FAILURE
          });
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


    const sourceGroup = groups[source.index];
    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    const destinationGroup = groups[destinationIndex < sourceIndex ? destinationIndex : destinationIndex + 1];

    if (destinationGroup) {
      sourceGroup.SortOrder = this.calculateGroupSort(groups, _.findIndex(groups, g => g.GUID === destinationGroup.GUID));
    } else {
      sourceGroup.SortOrder = this.calculateGroupSort(groups, groups.length);
    }

    this.setState({
      statusMessage: 'Sorting...',
      statusType: ProgressStatusType.INPROGRESS
    });

    this.dataProvider.updateGroupItem(this.groupListName, sourceGroup.ID, sourceGroup)
      .then((isUpdated) => {
        if (isUpdated) {
          updatedGroups = updatedGroups.map((g) => {
            if (g.ID === sourceGroup.ID) {
              return sourceGroup;
            }
            return g;
          });
          this.setState({
            groups: updatedGroups,
            statusMessage: TaskListConstants.errorMessages.sortSuccess,
            statusType: ProgressStatusType.SUCCESS
          }, () => TaskDataProvider.groups = groups);
          this.resetStatus();
        } else {
          this.setState({
            groups: groups,
            statusMessage: TaskListConstants.errorMessages.sortError,
            statusType: ProgressStatusType.FAILURE
          });
        }
      })
      .catch(() => {
        this.setState({
          groups: groups,
          statusMessage: TaskListConstants.errorMessages.sortError,
          statusType: ProgressStatusType.FAILURE
        });
      });
  }

  private calculateGroupSort(groups: IGroup[], newIndex: number): number {
    if (newIndex === 0) { // at first position
      if (groups.length > 0) {
        let newSortIndex = 1.00000000000;
        for (let index = 0; index < groups.length; index++) {
          if (groups[index].SortOrder) {
            let firstSort = groups[index].SortOrder;
            newSortIndex = firstSort - 1.00000000001;
            let nextSort = 1.00000000000;
            if (index + 1 < groups.length - 1) {
              nextSort = groups[index + 1].SortOrder;
            }
            if (newSortIndex > nextSort) {
              newSortIndex = nextSort - 1.00000000001;
            }
            break;
          }
        }
        return newSortIndex;
      }
    }
    else if (newIndex === groups.length - 1) { // at one before to last
      if (groups.length > 1) {
        let prevSortIndex = groups[newIndex - 1].SortOrder;
        let nextSortIndex = groups[newIndex].SortOrder;
        let newSortIndex = (Number(prevSortIndex) + Number(nextSortIndex)) / 2.00000000000;
        return newSortIndex;
      }
      else {
        return 1.00000000000;
      }
    }
    else if (newIndex === groups.length) // at last position
    {
      let newSortIndex = _.maxBy(groups, (t) => t.SortOrder).SortOrder + 1.00000000001;
      return newSortIndex;
    }
    else {
      let prevSortIndex = 1.00000000000;
      if (newIndex - 1 < groups.length) {
        prevSortIndex = groups[newIndex - 1].SortOrder;
      }
      let nextSortIndex = null;
      if (newIndex < groups.length) {
        nextSortIndex = groups[newIndex].SortOrder;
      }
      if (!nextSortIndex) {
        for (let index = newIndex + 1; index < groups.length; index++) {
          if (groups[index].SortOrder) {
            nextSortIndex = groups[index].SortOrder;
            break;
          }
        }
        if (!nextSortIndex) {
          nextSortIndex = prevSortIndex + 1.00000000000;
        }
      }
      return (Number(prevSortIndex) + Number(nextSortIndex)) / 2.00000000000;
    }
  }

  public reorder(list: IGroup[], startIndex: number, endIndex: number) {
    const result = _.cloneDeep(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  public onClickAdd() {
    const groups = _.cloneDeep(this.state.groups);
    let currentGroup: IGroup = {
      Title: '',
      ID: null,
      IsDefault: false,
      SortOrder: _.maxBy(groups, (t) => t.SortOrder).SortOrder + 1.00000000001,
      GUID: (this.state.groups.length + 1).toString(),
      isNew: true,
      key:'',
      text:''
    };
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
    if(this.canViewItem) {
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
                          isDragDisabled={ !this.canUpdateItem || group.Title.trim().length === 0 || group.isSaving }
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
                                  disabled={!this.canUpdateItem || group.IsDefault || group.isSaving}
                                  styles={{ fieldGroup: { width: 200 } }}
                                  autoFocus={true}
                                  onChange={(e, newValue) => { this.onChangeGroupTitle(newValue, group); }}
                                  errorMessage={group.isExisting ? "Value already exists" : ""} />

                                <Checkbox
                                  checked={group.IsDefault}
                                  disabled={!this.canUpdateItem || group.Title.trim().length === 0 || group.isSaving}
                                  onChange={(e, checked) => { this._onChangeDefaultCheckbox(group, checked); }} />

                                {
                                  !group.IsDefault && this.canDeleteItem ? (<IconButton
                                    disabled={group.Title.trim().length === 0 || group.isSaving}
                                    iconProps={{ iconName: 'Delete' }}
                                    onClick={() => { this.onDeleteGroup(group); }} />) : null
                                }

                                {  group.isNew ?
                                  (<IconButton
                                     iconProps={{ iconName: 'Cancel' }}
                                     onClick={(e) => { this.onClickCancel(group); }} />)
                                     : null}
                                {
                                    group.isSaving ?
                                    (<Spinner
                                    size={SpinnerSize.medium}/>) : null
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
              {
                this.canAddItem ? (<div className={styles.addBtn}>
                  <PrimaryButton
                    data-automation-id="test"
                    text="Add Group"
                    allowDisabledFocus={true}
                    onClick={this.onClickAdd.bind(this)}
                    style={{ marginLeft: '15px' }}
                  />
                </div>) : null
              }


              {/* Message Bar */}
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
    } else {
      return(
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
                No permissions to view this content
            </p>
            </div>
          </div>
        </div>
      </Layer>
      );
    }

  }
}
