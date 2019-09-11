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

      this.dataProvider.getResponsibleParties(this.responsibleListName).then((responsbiles) => {
        this.setState({
          responsibles: responsbiles
        });
        TaskDataProvider.responsibleParties = responsbiles;
      }).
        catch((error) => {
          console.log("Get responsbiles", error);
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
      FontColor: "",
      FillColor: "",
      isNew: true
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
  }

  public onChangeFontColor(colorValue: string, responsible: IResponsibleParty) {
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
                              disabled={!this.canUpdateItem || cResponsible.isSaving}
                              style={{
                                width: 200,
                                color: cResponsible.FontColor,
                                backgroundColor: cResponsible.FillColor
                              }}
                              autoFocus={true}
                              // onChange={(e, newValue) => { this.onChangeStatusTitle(newValue, cResponsible); }}
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
                                disabled={cResponsible.Title.trim().length === 0 || responsibleType !== null}
                                iconProps={{ iconName: 'Delete' }}
                                title="Delete"
                              //onClick={() => { this.onDeleteGroup(cResponsible); }}
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
              {preventDeletionDialog}
              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <p>
                  No data found
                </p>
              </div>
            </div>
          </div>
        </Layer>
      );
    }
  }
}
 