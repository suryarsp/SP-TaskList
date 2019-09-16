import * as React from 'react';
import styles from './StatusSettingsPanel.module.scss';
import { IStatusSettingsPanelProps, IDataProvider, IStatusSettingsPanelState, IStatus, DragDropResult } from '../../../../../../../interfaces';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultButton, PrimaryButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ProgressStatusType } from '../../../../../../../interfaces/enums/progressStatusType';
import { MessageBarType, Dialog, DialogType, DialogFooter, Layer, TextField, MessageBar, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';
import * as _ from 'lodash';
import ColorPicker from '../colorPicker/ColorPicker';
import { IPermissions } from '../../../../../../../services';
import { PermissionKind } from 'sp-pnp-js';
import { ListDetailsConstants } from '../../../../../../../common/defaults/listView-constants';

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



export default class StatusSettingsPanel extends React.Component<IStatusSettingsPanelProps, IStatusSettingsPanelState> {
  private isDirty: boolean;
  private clearTimeoutvalue: number;
  public dataProvider: IDataProvider;
  private statusListName = TaskDataProvider.listNames.statusListName;
  private permissions: IPermissions[];
  private canAddItem: boolean;
  private canUpdateItem: boolean;
  private canDeleteItem: boolean;
  private canViewItem: boolean;
  constructor(props) {
    super(props);
    this.isDirty = false;
    this.state = {
      status: [],
      currentStatus: null,
      isAddClicked: false,
      isColor: false,
      preventDelete: false,
      statusMessage: "",
      statusType: null,
      fillColor: '',
      fontColor: ''
    };
    this.canAddItem = false;
    this.canUpdateItem = false;
    this.canDeleteItem = false;
    this.canViewItem = false;
  }


  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    this.dataProvider.getPermissions(this.statusListName).then((permissions) => {
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

      this.dataProvider.getStatuses(this.statusListName).then((status) => {
        this.setState({
          status: status
        });
        TaskDataProvider.statuses = status;
      }).
        catch((error) => {
          console.log("Get Status", error);
        });
    });
  }

  public resetStatus() {
    this.clearTimeoutvalue = setTimeout(() => {
      this.setState({
        statusMessage: '',
        statusType: null
      });
    }, 2000);
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
  public onClosePreventDeleteDialog() {
    this.setState({
      isAddClicked: false,
      preventDelete: false
    });
  }

  public onClickAdd() {
    let currentStatus: IStatus = {
      Title: '',
      ID: null,
      SortOrder: this.state.status.length + 1,
      GUID: (this.state.status.length + 1).toString(),
      FontColor: "",
      FillColor: "",
      isNew: true
    };
    const status = _.cloneDeep(this.state.status);
    status.push(currentStatus);
    this.setState({
      isAddClicked: true,
      currentStatus: currentStatus,
      status: status
    });
  }

  public onClickCancel(status: IStatus) {
    let statuses = _.cloneDeep(this.state.status);
    let updateStatus = statuses.filter(s => s.GUID !== status.GUID);
    updateStatus = updateStatus.map((s, index) => {
      if (!s.ID) {
        s.SortOrder = index + 1;
        s.GUID = (index + 1).toString();
      }
      return s;
    });
    this.setState({
      status: updateStatus
    });
  }

  public onChangeFillColor(colorValue: string, status: IStatus) {
    console.log("Fill Color : ", colorValue, status);
    let statuses = _.cloneDeep(this.state.status);
    status.FillColor = colorValue;
    const isStatusAlreadyPresent = statuses.filter(s => s.Title.toLowerCase() === status.Title.toLowerCase()).length > 0;
    if (status.ID) {
      if (isStatusAlreadyPresent) {
        console.log("Status Title", status.Title);
        this.onUpdateStatus(status, status.Title);
      }
      else {
        this.onChangeStatusTitle(status.Title, status);
      }
    } else {
      this.forceUpdate();
    }

  }

  public onChangeFontColor(colorValue: string, status: IStatus) {
    console.log("Font Color : ", colorValue, status);
    let statuses = _.cloneDeep(this.state.status);
    status.FontColor = colorValue;
    const isStatusAlreadyPresent = statuses.filter(s => s.Title.toLowerCase() === status.Title.toLowerCase()).length > 0;
    if (status.ID) {
      if (isStatusAlreadyPresent) {
        console.log("Status Title", status.Title);
        this.onUpdateStatus(status, status.Title);
      }
      else {
        this.onChangeStatusTitle(status.Title, status);
      }
    } else {
      this.forceUpdate();
    }
  }

  public onDeleteStatus(status: IStatus) {
    let statuses = _.cloneDeep(this.state.status);
    const { deleteSuccess, deleteError } = TaskListConstants.errorMessages;
    this.dataProvider.deleteItem(this.statusListName, status.ID)
      .then((isDeleted) => {
        if (isDeleted) {
          let filterdStatus = statuses.filter(s => s.ID !== status.ID);
          this.setState({
            status: filterdStatus,
            statusMessage: deleteSuccess,
            statusType: ProgressStatusType.FAILURE
          }, () => TaskDataProvider.statuses = filterdStatus);
          this.resetStatus();
        } else {
          this.setState({
            status: statuses,
            statusMessage: deleteError,
            statusType: ProgressStatusType.FAILURE
          });
        }
      }).catch(() => {
        this.setState({
          status: statuses,
          statusMessage: deleteError,
          statusType: ProgressStatusType.FAILURE
        });
      });
  }

  public onChangeStatusTitle(newValue: string, status: IStatus) {
    let statuses = _.cloneDeep(this.state.status);
    status.Title = newValue;
    status.isSaving = true;
    const isStatusAlreadyPresent = statuses.filter(s => s.Title.toLowerCase() === newValue.toLowerCase()).length > 0;
    if (!isStatusAlreadyPresent) {
      if (status.isNew) {
        this.onAddStatus(status, newValue);
      } else {
        this.onUpdateStatus(status, newValue);
      }
    } else {
      if (this.clearTimeoutvalue) {
        clearTimeout(this.clearTimeoutvalue);
      }
      statuses = statuses.map(s => {
        if (s.GUID === status.GUID) {
          s.Title = newValue;
          s.isExisting = true;
        } else {
          s.isExisting = false;
        }
        return s;
      });
      this.clearTimeoutvalue = setTimeout(() => {
        this.setState({
          status: statuses,
          statusMessage: '',
          statusType: null
        });
      }, 1000);
    }
  }

  public onAddStatus(status: IStatus, title: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let statuses = _.cloneDeep(this.state.status);
      let newlyCreatedStatus = _.cloneDeep(statuses.filter(g => g.GUID === status.GUID)[0]);
      newlyCreatedStatus.Title = title;
      this.dataProvider.insertStatusItem(this.statusListName, newlyCreatedStatus)
        .then((newStatus) => {
          newStatus.isExisting = false;
          newStatus.isSaving = false;
          statuses = statuses.map(g => {
            if (g.GUID === status.GUID) {
              return newStatus;
            }
            g.isSaving = false;
            return g;
          });
          this.setState({
            status: statuses,
            statusMessage: TaskListConstants.errorMessages.saveSuccess,
            statusType: ProgressStatusType.SUCCESS
          });
          this.resetStatus();
        }).catch(() => {
          this.setState({
            status: statuses,
            statusMessage: TaskListConstants.errorMessages.saveError,
            statusType: ProgressStatusType.FAILURE
          });
        });
    }, 1000);
  }

  public onUpdateStatus(status: IStatus, title: string) {
    const { saveError, updateSuccess } = TaskListConstants.errorMessages;
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let statuses = _.cloneDeep(this.state.status);
      let updatedStatus = statuses.filter(g => g.ID === status.ID)[0];
      updatedStatus.Title = title;
      updatedStatus.isSaving = false;
      this.dataProvider.updateStatusItem(this.statusListName, updatedStatus.ID, updatedStatus)
        .then((isUpdated) => {
          if (isUpdated) {
            updatedStatus.isExisting = false;
            statuses = statuses.map(s => {
              if (s.ID === status.ID) {
                return updatedStatus;
              }
              s.isSaving = false;
              return s;
            });
            this.setState({
              status: statuses,
              statusMessage: updateSuccess,
              statusType: ProgressStatusType.SUCCESS
            }, () => {
              TaskDataProvider.statuses = statuses;
            });
            this.resetStatus();
          } else {
            this.setState({
              status: statuses,
              statusMessage: saveError,
              statusType: ProgressStatusType.FAILURE
            });
          }
        }).catch((error) => {
          this.setState({
            status: statuses,
            statusMessage: saveError,
            statusType: ProgressStatusType.FAILURE
          });
        });

    }, 1000);
  }

  public async onDragEnd(result: DragDropResult) {
    const { source, destination } = result;
    const statuses = _.cloneDeep(this.state.status);

    if (!result.destination) {
      return;
    }
    let updatedStatus = this.reorder(
      _.cloneDeep(this.state.status),
      source.index,
      destination.index
    );


    const sourceStatus = statuses[source.index];
    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    const destinationStatus = statuses[destinationIndex < sourceIndex ? destinationIndex : destinationIndex + 1];

    if (destinationStatus) {
      sourceStatus.SortOrder = this.calculateStatusSort(statuses, _.findIndex(statuses, g => g.GUID === destinationStatus.GUID));
    } else {
      sourceStatus.SortOrder = this.calculateStatusSort(statuses, statuses.length);
    }

    this.setState({
      statusMessage: 'Sorting...',
      statusType: ProgressStatusType.INPROGRESS
    });

    this.dataProvider.updateStatusItem(this.statusListName, sourceStatus.ID, sourceStatus)
      .then((isUpdated) => {
        if (isUpdated) {
          updatedStatus = updatedStatus.map((g) => {
            if (g.ID === sourceStatus.ID) {
              return sourceStatus;
            }
            return g;
          });
          this.setState({
            status: updatedStatus,
            statusMessage: TaskListConstants.errorMessages.sortSuccess,
            statusType: ProgressStatusType.SUCCESS
          }, () => TaskDataProvider.statuses = statuses);
          this.resetStatus();
        } else {
          this.setState({
            status: statuses,
            statusMessage: TaskListConstants.errorMessages.sortError,
            statusType: ProgressStatusType.FAILURE
          });
        }
      })
      .catch(() => {
        this.setState({
          status: statuses,
          statusMessage: TaskListConstants.errorMessages.sortError,
          statusType: ProgressStatusType.FAILURE
        });
      });
  }

  private calculateStatusSort(status: IStatus[], newIndex: number): number {
    if (newIndex === 0) { // at first position
      if (status.length > 0) {
        let newSortIndex = 1.00000000000;
        for (let index = 0; index < status.length; index++) {
          if (status[index].SortOrder) {
            let firstSort = status[index].SortOrder;
            newSortIndex = firstSort - 1.00000000001;
            let nextSort = 1.00000000000;
            if (index + 1 < status.length - 1) {
              nextSort = status[index + 1].SortOrder;
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
    else if (newIndex === status.length - 1) { // at one before to last
      if (status.length > 1) {
        let prevSortIndex = status[newIndex - 1].SortOrder;
        let nextSortIndex = status[newIndex].SortOrder;
        let newSortIndex = (Number(prevSortIndex) + Number(nextSortIndex)) / 2.00000000000;
        return newSortIndex;
      }
      else {
        return 1.00000000000;
      }
    }
    else if (newIndex === status.length) // at last position
    {
      let newSortIndex = _.maxBy(status, (t) => t.SortOrder).SortOrder + 1.00000000001;
      return newSortIndex;
    }
    else {
      let prevSortIndex = 1.00000000000;
      if (newIndex - 1 < status.length) {
        prevSortIndex = status[newIndex - 1].SortOrder;
      }
      let nextSortIndex = null;
      if (newIndex < status.length) {
        nextSortIndex = status[newIndex].SortOrder;
      }
      if (!nextSortIndex) {
        for (let index = newIndex + 1; index < status.length; index++) {
          if (status[index].SortOrder) {
            nextSortIndex = status[index].SortOrder;
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

  public reorder(list: IStatus[], startIndex: number, endIndex: number) {
    const result = _.cloneDeep(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }
 
  public onClickNoColor(status: IStatus,noColor:string) {
    let statuses = _.cloneDeep(this.state.status);
    if(noColor === "Fill"){
      status.FillColor = null;
    }
    else if(noColor === "Font"){
      status.FontColor = null;
    }
    
    
    const isStatusAlreadyPresent = statuses.filter(s => s.Title.toLowerCase() === status.Title.toLowerCase()).length > 0;
    if (status.ID) {
      if (isStatusAlreadyPresent) {
        console.log("Status Title", status.Title);
        this.onUpdateStatus(status, status.Title);
      }
      else {
        this.onChangeStatusTitle(status.Title, status);
      }
    } else {
      this.forceUpdate();
    }
    console.log(status.FillColor, status.FontColor);
  }


  public render(): React.ReactElement<IStatusSettingsPanelProps> {
    const { status, preventDelete, statusMessage, statusType } = this.state;
    const messageBarType = this.getMessageBarType(statusType);
    const preventDeletionDialog = preventDelete ? (<Dialog
      hidden={false}
      onDismiss={() => this.onClosePreventDeleteDialog.bind(this)}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Delete not allowed',
        subText: TaskListConstants.preventStatusDeletionText
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
  if(this.state.status.length > 0){
    if (this.canViewItem) {
      return (
        <Layer>
          <div className={styles.slidePaneloverlay}>
            <div className={styles.statusPanel}>
              <div className={styles.header}>
                <div className={styles.closeButton}>
                  <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={() => { this.props.hidePanel(this.isDirty); }} />
                </div>
                <div className={styles.statusTitle}>Status settings</div>
                <div className={styles.verticalSeperator}></div>
              </div>
              {preventDeletionDialog}
              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <p>Changes made to these settings take effect immediately.</p>
                <p>Statuses with no assigned color use the color specified for responsible party.</p>
              </div>
              <div className={styles.colorheader}>
                <div className={styles.colortask}>Fill Color</div>
                <div>Font Color</div>
              </div>
              <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
                <Droppable droppableId="droppable">
                  {(p, s) => (
                    <div
                      ref={p.innerRef}
                    >
                      {status.map((cStatus, index) => (
                        <Draggable
                          key={cStatus.GUID}
                          draggableId={cStatus.GUID}
                          index={index}
                          isDragDisabled={!this.canUpdateItem || cStatus.Title.trim().length === 0 || cStatus.isSaving}
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
                              <div className={styles.statusContainer}>

                                {/* <IconButton
                  iconProps={{ iconName: 'Move',  }}
                  disabled={ group.Title.trim().length === 0}>
                 </IconButton> */}
                                <div {...provided.dragHandleProps}>
                                  <h6>Drag Handle</h6>
                                </div>

                                <TextField
                                  value={cStatus.Title}
                                  disabled={!this.canUpdateItem}
                                  style={{
                                    width: 200,
                                    color: cStatus.FontColor,
                                    backgroundColor: cStatus.FillColor
                                  }}
                                  autoFocus={true}                                  
                                  onChange={(e, newValue) => { this.onChangeStatusTitle(newValue, cStatus); }}
                                  errorMessage={cStatus.isExisting ? "Value already exists" : ""}
                                />
                                {
                                  this.canUpdateItem || this.canAddItem ? (
                                    <ColorPicker key={cStatus.GUID + "fill"} displayColor={cStatus.FillColor} onChangeColor={(value) => { this.onChangeFillColor(value, cStatus); }} />
                                  ) : null
                                }
                                 {
                                  this.canUpdateItem || this.canAddItem ? (
                                    <IconButton
                                      disabled={cStatus.Title.trim().length === 0 || cStatus.isSaving}
                                      iconProps={{ iconName: 'UnSetColor' }}
                                      title = "No Color"
                                      onClick={() => { this.onClickNoColor(cStatus,"Fill"); }}
                                    />) : null
                                }

                                {
                                  this.canUpdateItem || this.canAddItem ? (
                                    <ColorPicker key={cStatus.GUID + "font"} displayColor={cStatus.FontColor} onChangeColor={(value) => { this.onChangeFontColor(value, cStatus); }} />
                                  ) : null
                                }
                                 {
                                  this.canUpdateItem || this.canAddItem ? (
                                    <IconButton
                                      disabled={cStatus.Title.trim().length === 0 || cStatus.isSaving}
                                      iconProps={{ iconName: 'UnSetColor' }}
                                      title = "No Color"
                                      onClick={() => { this.onClickNoColor(cStatus,"Font"); }}
                                    />) : null
                                }

                                {
                                  this.canDeleteItem ? (<IconButton
                                    disabled={cStatus.Title.trim().length === 0 || cStatus.isSaving}
                                    iconProps={{ iconName: 'Delete' }}
                                    title = "Delete"
                                    onClick={() => { this.onDeleteStatus(cStatus); }}
                                  />) : null
                                }

                                {!cStatus.ID ? <IconButton iconProps={{ iconName: 'Cancel' }} onClick={(e) => { this.onClickCancel(cStatus); }} /> : null}
                                {
                                  cStatus.isSaving ? <Spinner size={SpinnerSize.medium} hidden={!cStatus.isSaving} /> : null
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
                  text="Add Status"
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
    else {
      return (
        <Layer>
          <div className={styles.slidePaneloverlay}>
            <div className={styles.statusPanel}>
              <div className={styles.header}>
                <div className={styles.closeButton}>
                  <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={() => { this.props.hidePanel(this.isDirty); }} />
                </div>
                <div className={styles.statusTitle}>Status settings</div>
                <div className={styles.verticalSeperator}></div>
              </div>
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
  else
  {
    return (
      <Layer>
        <div className={styles.slidePaneloverlay}>
          <div className={styles.statusPanel}>
            <div className={styles.header}>
              <div className={styles.closeButton}>
                <IconButton
                  iconProps={{ iconName: 'Cancel' }}
                  onClick={() => { this.props.hidePanel(this.isDirty); }} />
              </div>
              <div className={styles.statusTitle}>Status settings</div>
              <div className={styles.verticalSeperator}></div>
                    </div>
            {/* Disclaimer */}
            <div className={styles.disclaimer}>
              <p>Changes made to these settings take effect immediately.</p>
              <p>Statuses with no assigned color use the color specified for responsible party.</p>
            </div>

            <div className={styles.noDataFound}>{TaskListConstants.errorMessages.noDataFound}</div>


              {/* Add Button */}
              <div className={styles.addBtn}>
                <PrimaryButton
                  data-automation-id="test"
                  text="Add Status"
                  allowDisabledFocus={true}
                  disabled={statusType !== null}
                  onClick={this.onClickAdd.bind(this)}
                  style={{ marginLeft: '15px' }}
                />
              </div>

          </div>
        </div>
      </Layer>
    );
  }

  }
}
