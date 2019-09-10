import * as React from 'react';
import styles from './CategorySettingsPanel.module.scss';
import { ICategorySettingsPanelProps,  ICategorySettingsPanelState, IDataProvider} from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultButton, IconButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { ProgressStatusType } from '../../../../../../../interfaces/enums/progressStatusType';
import { MessageBarType, DialogType, Dialog, DialogFooter, Layer, MessageBar, TextField, Checkbox } from 'office-ui-fabric-react';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';

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
export default class CategorySettingsPanel extends React.Component< ICategorySettingsPanelProps, ICategorySettingsPanelState> {
  private isDirty: boolean;
  private clearTimeoutvalue: number;
  public dataProvider: IDataProvider;
  private categoryListName = TaskDataProvider.listNames.categoryListName;

  constructor(props) {
    super(props);
    this.isDirty = false;
    this.state={
      CurrentCategory:null,
      categorys:[],
      IsSubCategory:false,
      makeSubCategory:null,
      isAddClicked:false,
      preventDelete:false,
      statusMessage:"",
      statusType:null
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;     
    this.dataProvider.getCategories(this.categoryListName).then((categorys)=>{
      this.setState({
        categorys: categorys
      });
      TaskDataProvider.categories = categorys;
    }).
    catch((error) => {
      console.log("Get Categorys", error);
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
  
  public render(): React.ReactElement<ICategorySettingsPanelProps> {
    const { categorys, preventDelete, statusMessage, statusType } = this.state;
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
            <div className={styles.categoryPanel}>
              <div className={styles.header}>
                    <div className={styles.closeButton}>
                      <IconButton 
                        iconProps={{ iconName: 'Cancel' }}
                        onClick={() => { this.props.hidePanel(this.isDirty); }} />
                    </div>
                    <div className={styles.categoryTitle}>Category settings</div>
                    <div className={styles.verticalSeperator}></div>
              </div>
              {preventDeletionDialog}
              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <p>
                  Changes made to these settings take effect immediately
                </p>
              </div>

              <div>
                Make subcategory
              </div>
              {/* onDragEnd={this.onDragEnd.bind(this)} */}
              <DragDropContext >
              <Droppable droppableId="droppable">
                {(p, s) => (
                  <div
                    ref={p.innerRef}
                  >
                    {categorys.map((category, index) => (
                      <Draggable
                        key={category.GUID}
                        draggableId={category.GUID}
                        index={index}
                        isDragDisabled={category.Title.trim().length === 0 || statusType !== null}
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
                            <div className={styles.categoryContainer}>

                              {/* <IconButton
                  iconProps={{ iconName: 'Move',  }}
                  disabled={ group.Title.trim().length === 0}>
                 </IconButton> */}
                              <div {...provided.dragHandleProps}>
                                <h6>Drag Handle</h6>
                              </div>

                              <IconButton 
                                disabled={category.children.length === 0}
                                iconProps={{iconName:"RevToggleKey"}}
                              />
                              <TextField
                                value={category.Title}
                                styles={{ fieldGroup: { width: 200 } }}
                                autoFocus={true}
                              //  onChange={(e, newValue) => { this.onChangeGroupTitle(newValue, group); }}
                                errorMessage ={ category.isExisting ? "Value already exists" : ""}
                               />

                                <IconButton
                                  disabled={category.Title.trim().length === 0 || statusType !== null}
                                  iconProps={{ iconName: 'Tab' }}
                                  //DependencyAdd
                                 // onClick={() => { this.onsubtabGroup(group); }} 
                                  />
                                <IconButton
                                  disabled={category.Title.trim().length === 0 || statusType !== null}
                                  iconProps={{ iconName: 'Delete' }}
                                 // onClick={() => { this.onDeleteGroup(group); }} 
                                  />
                              
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
                text="Add Category"
                allowDisabledFocus={true}
                disabled={statusType !== null}
                //onClick={this.onClickAdd.bind(this)}
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
