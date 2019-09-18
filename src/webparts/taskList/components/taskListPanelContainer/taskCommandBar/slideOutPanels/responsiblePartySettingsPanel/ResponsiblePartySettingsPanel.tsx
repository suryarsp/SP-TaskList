import * as React from 'react';
import styles from './ResponsiblePartySettingsPanel.module.scss';
import { IResponsiblePartySettingsPanelProps, IResponsiblePartySettingsPanelState, IDataProvider, IStatus, IResponsibleParty } from '../../../../../../../interfaces';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultButton, PrimaryButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { IPermissions } from '../../../../../../../services';
import { PermissionKind } from 'sp-pnp-js';
import { ProgressStatusType } from '../../../../../../../interfaces/enums/progressStatusType';
import { MessageBarType, Dialog, DialogType, DialogFooter, Layer, TextField, Spinner, SpinnerSize, MessageBar } from 'office-ui-fabric-react';
import _ from 'lodash';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ColorPicker from '../colorPicker/ColorPicker';

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


export default class ResponsiblePartySettingsPanel extends React.Component<IResponsiblePartySettingsPanelProps, IResponsiblePartySettingsPanelState> {
  private isDirty: boolean;
  private clearTimeoutvalue: number;
  public dataProvider: IDataProvider;
  private responsibleListName = TaskDataProvider.listNames.responsibleListName;
  private permissions: IPermissions[];
  private canAddItem: boolean;
  private canUpdateItem: boolean;
  private canDeleteItem: boolean;
  private canViewItem: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
    this.state = {
      responsibles: [],
      currentResponsible: null,
      isAddClicked: false,
      isColor: false,
      preventDelete: false,
      responsibleMessage: "",
      responsibleType: null,
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
    this.dataProvider.getPermissions(this.responsibleListName).then((permissions) => {
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

      this.dataProvider.getResponsibleParties(this.responsibleListName).then((responsibles) => {
        this.setState({
          responsibles: responsibles
        },()=> TaskDataProvider.responsibleParties = responsibles);
       
      }).
        catch((error) => {
          console.log("Get responsibles", error);
        });
    });
  }

  public resetResponsible() {
    this.clearTimeoutvalue = setTimeout(() => {
      this.setState({
        responsibleMessage: '',
        responsibleType: null
      });
    }, 2000);
  }

  public getMessageBarType(responsibleType: ProgressStatusType) {
    let messageBarResponsible: number;
    switch (responsibleType) {
      case ProgressStatusType.INPROGRESS: {
        messageBarResponsible = MessageBarType.info;
        break;
      }

      case ProgressStatusType.SUCCESS: {
        messageBarResponsible = MessageBarType.success;
        break;
      }

      case ProgressStatusType.FAILURE: {
        messageBarResponsible = MessageBarType.error;
        break;
      }
    }

    return messageBarResponsible;
  }
  public onClosePreventDeleteDialog() {
    this.setState({
      isAddClicked: false,
      preventDelete: false
    });
  }

  public onClickAdd() {
    let currentResponsible: IResponsibleParty = {
      Title: '',
      ID: null,
      GUID: (this.state.responsibles.length + 1).toString(),
      FontColor: "#000000",
      FillColor: "#ffffff",
      isNew: true,
      key: '',
      text: ''
    };
    const responsibles = _.cloneDeep(this.state.responsibles);
    responsibles.push(currentResponsible);
    this.setState({
      isAddClicked: true,
      currentResponsible: currentResponsible,
      responsibles: responsibles
    });
  }

  public onClickCancel(responsible: IResponsibleParty) {
    let responsibles = _.cloneDeep(this.state.responsibles);
    let updateResponsible = responsibles.filter(s => s.GUID !== responsible.GUID);
    updateResponsible = updateResponsible.map((s, index) => {
      if (!s.ID) {
        s.GUID = (index + 1).toString();
      }
      return s;
    });
    this.setState({
      responsibles: updateResponsible
    });
  }

  public onChangeFillColor(colorValue: string, responsible: IResponsibleParty) {
    console.log("Fill Color : ", colorValue, responsible);
    let responsibles = _.cloneDeep(this.state.responsibles);
    responsible.FillColor = colorValue;
    const isResponsibleAlreadyPresent = responsibles.filter(r => r.Title.toLowerCase() === responsible.Title.toLowerCase()).length > 0;
    if (responsible.ID) {
      if (isResponsibleAlreadyPresent) {
        console.log("responsible Title", responsible.Title);
        this.onUpdateResponsible(responsible, responsible.Title);
      }
      else {
        this.onChangeResponsibleTitle(responsible.Title, responsible);
      }
    } else {
      this.forceUpdate();
    }

  }

  public onChangeFontColor(colorValue: string, responsible: IResponsibleParty) {
    console.log("Font Color : ", colorValue, responsible);
    let responsibles = _.cloneDeep(this.state.responsibles);
    responsible.FontColor = colorValue;
    const isResponsibleAlreadyPresent = responsibles.filter(r => r.Title.toLowerCase() === responsible.Title.toLowerCase()).length > 0;
    if (responsible.ID) {
      if (isResponsibleAlreadyPresent) {
        console.log("Responsible Title", responsible.Title);
        this.onUpdateResponsible(responsible, responsible.Title);
      }
      else {
        this.onChangeResponsibleTitle(responsible.Title, responsible);
      }
    } else {
      this.forceUpdate();
    }
  }

  public onDeleteResponsible(responsible: IResponsibleParty) {
    let responsibles = _.cloneDeep(this.state.responsibles);
    const { deleteSuccess, deleteError } = TaskListConstants.errorMessages;
    this.dataProvider.deleteItem(this.responsibleListName, responsible.ID)
      .then((isDeleted) => {
        if (isDeleted) {
          let filterdResponsible = responsibles.filter(s => s.ID !== responsible.ID);
          this.setState({
            responsibles: filterdResponsible,
            responsibleMessage: deleteSuccess,
            responsibleType: ProgressStatusType.FAILURE
          }, () => TaskDataProvider.responsibleParties = filterdResponsible);
          this.resetResponsible();
        } else {
          this.setState({
            responsibles: responsibles,
            responsibleMessage: deleteError,
            responsibleType: ProgressStatusType.FAILURE
          });
        }
      }).catch(() => {
        this.setState({
          responsibles: responsibles,
          responsibleMessage: deleteError,
          responsibleType: ProgressStatusType.FAILURE
        });
      });
  }

  public onChangeResponsibleTitle(newValue: string, responsible: IResponsibleParty) {
    let responsibles = _.cloneDeep(this.state.responsibles);
    responsible.Title = newValue;
    responsible.isSaving = true;
    const isResponsibleAlreadyPresent = responsibles.filter(s => s.Title.toLowerCase() === newValue.toLowerCase()).length > 0;
    if (!isResponsibleAlreadyPresent) {
      if (responsible.isNew) {
        this.onAddResponsible(responsible, newValue);
      } else {
        this.onUpdateResponsible(responsible, newValue);
      }
    } else {
      if (this.clearTimeoutvalue) {
        clearTimeout(this.clearTimeoutvalue);
      }
      responsibles = responsibles.map(s => {
        if (s.GUID === responsible.GUID) {
          s.Title = newValue;
          s.isExisting = true;
        } else {
          s.isExisting = false;
        }
        return s;
      });
      this.clearTimeoutvalue = setTimeout(() => {
        this.setState({
          responsibles: responsibles,
          responsibleMessage: '',
          responsibleType: null
        });
      }, 1000);
    }
  }

  public onAddResponsible(responsible: IResponsibleParty, title: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let responsibles = _.cloneDeep(this.state.responsibles);
      let newlyCreatedResponsible = _.cloneDeep(responsibles.filter(g => g.GUID === responsible.GUID)[0]);
      newlyCreatedResponsible.Title = title;
      this.dataProvider.insertResponsibleItem(this.responsibleListName, newlyCreatedResponsible)
        .then((newResponsible) => {
          newResponsible.isExisting = false;
          newResponsible.isSaving = false;
          responsibles = responsibles.map(g => {
            if (g.GUID === responsible.GUID) {
              return newResponsible;
            }
            g.isSaving = false;
            return g;
          });
          this.setState({
            responsibles: responsibles,
            responsibleMessage: TaskListConstants.errorMessages.saveSuccess,
            responsibleType: ProgressStatusType.SUCCESS
          },()=> TaskDataProvider.responsibleParties = responsibles);
          this.resetResponsible();
        }).catch(() => {
          this.setState({
            responsibles: responsibles,
            responsibleMessage: TaskListConstants.errorMessages.saveError,
            responsibleType: ProgressStatusType.FAILURE
          });
        });
    }, 1000);
  }

  public onUpdateResponsible(responsible: IResponsibleParty, title: string) {
    const { saveError, updateSuccess } = TaskListConstants.errorMessages;
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let responsibles = _.cloneDeep(this.state.responsibles);
      let updatedResponsible = responsibles.filter(g => g.ID === responsible.ID)[0];
      updatedResponsible.Title = title;
      updatedResponsible.isSaving = false;
      this.dataProvider.updateResponsibleItem(this.responsibleListName, updatedResponsible.ID, updatedResponsible)
        .then((isUpdated) => {
          if (isUpdated) {
            updatedResponsible.isExisting = false;
            responsibles = responsibles.map(s => {
              if (s.ID === responsible.ID) {
                return updatedResponsible;
              }
              s.isSaving = false;
              return s;
            });
            this.setState({
              responsibles: responsibles,
              responsibleMessage: updateSuccess,
              responsibleType: ProgressStatusType.SUCCESS
            }, () => {
              TaskDataProvider.responsibleParties = responsibles;
            });
            this.resetResponsible();
          } else {
            this.setState({
              responsibles: responsibles,
              responsibleMessage: saveError,
              responsibleType: ProgressStatusType.FAILURE
            });
          }
        }).catch((error) => {
          this.setState({
            responsibles: responsibles,
            responsibleMessage: saveError,
            responsibleType: ProgressStatusType.FAILURE
          });
        });

    }, 1000);
  }


  public render(): React.ReactElement<IResponsiblePartySettingsPanelProps> {
    const { responsibles, preventDelete, responsibleMessage, responsibleType } = this.state;
    const messageBarType = this.getMessageBarType(responsibleType);
    const preventDeletionDialog = preventDelete ? (<Dialog
      hidden={false}
      onDismiss={() => this.onClosePreventDeleteDialog.bind(this)}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Delete not allowed',
        subText: TaskListConstants.preventResponsibleDeletionText
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

    if (this.state.responsibles.length > 0) {
      if (this.canViewItem) {
        return (
          <Layer>
            <div className={styles.slidePaneloverlay}>
              <div className={styles.responsiblePanel}>
                <div className={styles.header}>
                  <div className={styles.closeButton}>
                    <IconButton
                      iconProps={{ iconName: 'Cancel' }}
                      onClick={() => { this.props.hidePanel(this.isDirty); }} />
                  </div>
                  <div className={styles.responsibleTitle}>Responsible settings</div>
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

                  {responsibles.map((cResponsible, index) => (
                          <div className={styles.responsibleContainer}> <TextField
                              value={cResponsible.Title}
                              disabled={!this.canUpdateItem}
                              style={{
                                width: 200,
                                color: cResponsible.FontColor,
                                backgroundColor: cResponsible.FillColor
                              }}
                              autoFocus={true}
                               onChange={(e, newValue) => { this.onChangeResponsibleTitle(newValue, cResponsible); }}
                              errorMessage={cResponsible.isExisting ? "Value already exists" : ""}
                            />
                            {
                              this.canUpdateItem || this.canAddItem ? (
                                <ColorPicker key={cResponsible.GUID + "fill"} displayColor={cResponsible.FillColor}
                                  onChangeColor={(value) => { this.onChangeFillColor(value, cResponsible); }}
                                />
                              ) : null
                            }

                            {
                              this.canUpdateItem || this.canAddItem ? (
                                <ColorPicker key={cResponsible.GUID + "font"} displayColor={cResponsible.FontColor}
                                  onChangeColor={(value) => { this.onChangeFontColor(value, cResponsible); }}
                                />
                              ) : null
                            }

                            {
                              this.canDeleteItem ? (<IconButton
                                disabled={cResponsible.Title.trim().length === 0 || cResponsible.isSaving}
                                iconProps={{ iconName: 'Delete' }}
                                title="Delete"
                                onClick={() => { this.onDeleteResponsible(cResponsible); }}
                              />) : null
                            }
                            {!cResponsible.ID ? <IconButton iconProps={{ iconName: 'Cancel' }} onClick={(e) => { this.onClickCancel(cResponsible); }} /> : null}
                            {
                              cResponsible.isSaving ? <Spinner size={SpinnerSize.medium} hidden={!cResponsible.isSaving} /> : null
                            }

                          </div>
                      ))}




                {/* Add Button */}
                <div className={styles.addBtn}>
                  <PrimaryButton
                    data-automation-id="test"
                    text="Add Responsible Party"
                    allowDisabledFocus={true}
                    disabled={responsibleType !== null}
                    onClick={this.onClickAdd.bind(this)}
                    style={{ marginLeft: '15px' }}
                  />
                </div>

                {
                  responsibleType ? (<div className={styles.responsibleMessage}>
                    <MessageBar
                      messageBarType={messageBarType}>
                      {responsibleMessage}
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
              <div className={styles.responsiblePanel}>
                <div className={styles.header}>
                  <div className={styles.closeButton}>
                    <IconButton
                      iconProps={{ iconName: 'Cancel' }}
                      onClick={() => { this.props.hidePanel(this.isDirty); }} />
                  </div>
                  <div className={styles.responsibleTitle}>Responsible settings</div>
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
    else {
      return (
        <Layer>
          <div className={styles.slidePaneloverlay}>
            <div className={styles.responsiblePanel}>
              <div className={styles.header}>
                <div className={styles.closeButton}>
                  <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={() => { this.props.hidePanel(this.isDirty); }} />
                </div>
                <div className={styles.responsibleTitle}>Responsible settings</div>
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
                    text="Add Responsible Party"
                    allowDisabledFocus={true}
                    disabled={responsibleType !== null}
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
