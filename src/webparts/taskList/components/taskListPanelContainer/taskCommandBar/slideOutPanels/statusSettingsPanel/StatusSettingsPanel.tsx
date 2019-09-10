import * as React from 'react';
import styles from './StatusSettingsPanel.module.scss';
import { IStatusSettingsPanelProps, IDataProvider, IStatusSettingsPanelState, IStatus } from '../../../../../../../interfaces';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultButton, PrimaryButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ProgressStatusType } from '../../../../../../../interfaces/enums/progressStatusType';
import { MessageBarType, Dialog, DialogType, DialogFooter, Layer, TextField, MessageBar, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';
import * as _ from 'lodash';
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



export default class StatusSettingsPanel extends React.Component< IStatusSettingsPanelProps, IStatusSettingsPanelState> {
  private isDirty: boolean;
  private clearTimeoutvalue: number;
  public dataProvider: IDataProvider;
  private statusListName = TaskDataProvider.listNames.statusListName;

  constructor(props) {
    super(props);
    this.isDirty = false;
    this.state={
      status:[],
      currentStatus:null,
      isAddClicked:false,
      isColor:false,
      preventDelete:false,
      statusMessage:"",
      statusType:null    
    };
  }

  
  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;     
    this.dataProvider.getStatuses(this.statusListName).then((status)=>{
      this.setState({
        status: status
      });
      TaskDataProvider.statuses = status;
    }).
    catch((error) => {
      console.log("Get Status", error);
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
      StatusSort: this.state.status.length + 1,
      GUID: (this.state.status.length + 1).toString(),
      FontColor:"",
      FillColor:""
    };
    const status = _.cloneDeep(this.state.status);
    status.push(currentStatus);
    this.setState({
      isAddClicked: true,
      currentStatus: currentStatus,
      status: status
    });
  }

  public onClickCancel(e) {
    let status = _.cloneDeep(this.state.status);
    let updatedstatus= status.filter(g => g.ID);
    this.setState({
      status: updatedstatus
    });
  }

  public onChangeFillColor(colorValue: string, status: IStatus) {
      console.log("Fill Color : ",colorValue,status);

  }

  public onChangeFontColor(colorValue:string, status:IStatus){
    console.log("Font Color : ",colorValue,status);
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
            <div className={styles.statusPanel}>
              <div className={styles.header}>
                    <div className={styles.closeButton}>
                      <IconButton 
                        iconProps={{ iconName: 'Cancel' }}
                        onClick={() => { this.props.hidePanel(this.isDirty); }} />
                    </div>
                    <div className={styles.statusTitle}>Category settings</div>
                    <div className={styles.verticalSeperator}></div>
              </div>
              {preventDeletionDialog}
              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <p>Changes made to these settings take effect immediately.</p>
                <p>Statuses with no assigned color use the color specified for responsible party.</p>
              </div>
              {/* onDragEnd={this.onDragEnd.bind(this)} */}
              <DragDropContext >
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
                        isDragDisabled={cStatus.Title.trim().length === 0 || statusType !== null}
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
                                styles={{ fieldGroup: { width: 200 } }}
                                autoFocus={true}
                              //  onChange={(e, newValue) => { this.onChangeGroupTitle(newValue, group); }}
                                errorMessage ={ cStatus.isExisting ? "Value already exists" : ""}
                               />
                                <ColorPicker key={cStatus.GUID+"fill"}  onChangeColor={ (value) => {this.onChangeFillColor(value, cStatus);}} />

                                <ColorPicker key={cStatus.GUID+"font"} onChangeColor={ (value) => {this.onChangeFontColor(value, cStatus);}}/>

                                <IconButton
                                  disabled={cStatus.Title.trim().length === 0 || statusType !== null}
                                  iconProps={{ iconName: 'Delete' }}
                                 // onClick={() => { this.onDeleteGroup(group); }} 
                                  />

                            { !cStatus.ID ? <IconButton iconProps={{ iconName: 'Cancel' }} onClick={ this.onClickCancel.bind(this)} /> : null }
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
}
