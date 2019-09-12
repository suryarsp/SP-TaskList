import * as React from 'react';
import styles from './CategorySettingsPanel.module.scss';
import { ICategorySettingsPanelProps, ICategorySettingsPanelState, IDataProvider, ICategory, DragDropResult, IGroup } from '../../../../../../../interfaces/index';
import { IconButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ProgressStatusType } from '../../../../../../../interfaces/enums/progressStatusType';
import { MessageBarType, DialogType, Dialog, DialogFooter, Layer, MessageBar, TextField, Checkbox, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';
import { MockupDataProvider } from '../../../../../../../services';
import CategoryChildDraggable from './CategoryChildDraggable';

import { Dropdown} from 'office-ui-fabric-react/lib/Dropdown';
import _ from 'lodash';


const getItemStyle = (isDragging, draggableStyle) => {
  if (isDragging) {
    return {
      margin: `0 0 8px 0`,
      padding: 4,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // change background colour if dragging
      background: isDragging ? '#F4F4F4' : '#FFFFFF',
      // styles we need to apply on draggables
      ...draggableStyle,
      transform: draggableStyle.transform ? `translate(0, ${draggableStyle.transform.substring(draggableStyle.transform.indexOf(',') + 1, draggableStyle.transform.indexOf(')'))})` : `none`,
    };
  }
  else {
    return {
      margin: `0 0 8px 0`,
      padding: 4,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // change background colour if dragging
      background: isDragging ? '#F4F4F4' : '#FFFFFF',
      // styles we need to apply on draggables
      transform: `none`,
      ...draggableStyle
    };
  }
};

export default class CategorySettingsPanel extends React.Component<ICategorySettingsPanelProps, ICategorySettingsPanelState> {
  private isDirty: boolean;
  private clearTimeoutvalue: number;
  public dataProvider: IDataProvider;
  public categoryListName: string;
  public groupListName: string;
  public isCategoryUniqueEnabled: boolean;

  constructor(props) {
    super(props);
    this.isDirty = false;
    this.state = {
      categories: [],
      isAddClicked: false,
      preventDelete: false,
      statusMessage: "",
      statusType: null,
      isUniqueToGroupChecked: false,
      currentSelectedGroup: null,
      groups: TaskDataProvider.groups
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    this.categoryListName = TaskDataProvider.listNames.categoryListName;
    this.groupListName = TaskDataProvider.listNames.groupListName;
    this.isCategoryUniqueEnabled = TaskDataProvider.isCategoryUniqueEnabled;
    this.dataProvider.getCategories(this.categoryListName).then((categories)=>{
      this.setState({
        categories: categories
      });
      TaskDataProvider.categories = categories;
    }).
    catch((error) => {
      console.log("Get Categorys", error);
    });

    this.dataProvider.getGroups(this.groupListName).then((groups) => {
      this.setState({
        groups:  groups
      }, () => TaskDataProvider.groups = groups);
    })
    .catch((error) => {
      console.log("Get Groups", error);
    });
    // const provider = new MockupDataProvider();
    // provider.getCategories('').then((categories) => {
    //   this.setState({
    //     categories: categories
    //   });
    //   TaskDataProvider.categories = categories;
    // });
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


  public reorder(list: ICategory[], startIndex: number, endIndex: number) {
    const result = _.cloneDeep(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  public onChangeCategoryTitle(newValue: string, category: ICategory) {
    let categories = _.cloneDeep(this.state.categories);
    category.Title = newValue;
    category.isSaving = true;
    const isCategoryAlreadyPresent = categories.filter(g => g.Title.toLowerCase() === newValue.toLowerCase()).length > 0;
    if (!isCategoryAlreadyPresent) {
      if (category.isNew) {
        this.onAddCategory(category, newValue);
      } else {
        this.onUpdateCategory(category, newValue);
      }
    } else {
      if (this.clearTimeoutvalue) {
        clearTimeout(this.clearTimeoutvalue);
      }
      categories = categories.map(g => {
        if (g.GUID === category.GUID) {
          g.Title = newValue;
          g.isExisting = true;
        } else {
          g.isExisting = false;
        }
        return g;
      });
      this.clearTimeoutvalue = setTimeout(() => {
        this.setState({
          categories: categories,
          statusMessage: '',
          statusType: null
        });
      }, 1000);
    }
  }


  public onUpdateCategory(category: ICategory, title: string) {
    const { saveError, updateSuccess } = TaskListConstants.errorMessages;
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let categories = _.cloneDeep(this.state.categories);
      let updatedCategory = categories.filter(c => c.ID === category.ID)[0];
      updatedCategory.Title = title;
      updatedCategory.isSaving = false;
      this.dataProvider.updateCategoryItem(this.categoryListName, updatedCategory.ID, updatedCategory)
        .then((isUpdated) => {
          if (isUpdated) {
            updatedCategory.isExisting = false;
            let updatedCategories = categories.map(c => {
              if (c.ID === category.ID) {
                return updatedCategory;
              }
              c.isSaving = false;
              return c;
            });
            this.setState({
              categories: updatedCategories,
              statusMessage: updateSuccess,
              statusType: ProgressStatusType.SUCCESS
            }, () => {
              TaskDataProvider.categories = categories;
            });
            this.resetStatus();
          } else {
            this.setState({
              categories: categories,
              statusMessage: saveError,
              statusType: ProgressStatusType.FAILURE
            });
          }
        }).catch((error) => {
          this.setState({
            categories: categories,
            statusMessage: saveError,
            statusType: ProgressStatusType.FAILURE
          });
        });
    }, 1000);
  }

  public onAddCategory(category: ICategory, title: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let  categories = _.cloneDeep(this.state.categories);
      let newlyCreatedCategory = _.cloneDeep(categories.filter(c => c.GUID === category.GUID)[0]);
      newlyCreatedCategory.Title = title;
      this.dataProvider.insertCategoryItem(this.categoryListName, newlyCreatedCategory)
        .then((newCategory) => {
          newCategory.isExisting = false;
          newCategory.isSaving = false;
          let updatedCategories = categories.map(c => {
            if (c.GUID === c.GUID) {
              return newCategory;
            }
            c.isSaving = false;
            return c;
          });
          this.setState({
            categories: updatedCategories,
            statusMessage: TaskListConstants.errorMessages.saveSuccess,
            statusType: ProgressStatusType.SUCCESS
          });
          this.resetStatus();
        }).catch(() => {
          this.setState({
            categories: categories,
            statusMessage: TaskListConstants.errorMessages.saveError,
            statusType: ProgressStatusType.FAILURE
          });
        });
    }, 1000);
  }


  public onDragEnd(result: DragDropResult) {
    if (!result.destination) {
      return;
    }
    if (result.type === "droppableItem") {
      const updatedCategories = this.reorder(
        _.cloneDeep(this.state.categories),
        result.source.index,
        result.destination.index
      );

      this.setState({
        categories: updatedCategories
      });
    } else if (_.includes(result.type,"droppableSubItem")) {
      const parentCategoryId = parseInt(result.type.split("-")[1]);
      let categories = _.cloneDeep(this.state.categories);
      const childrenForCorrespondingParent = categories.filter(c => c.ID === parentCategoryId)[0].children;
      const reorderedChildren = this.reorder(
        childrenForCorrespondingParent,
        result.source.index,
        result.destination.index
      );
      let updatedCategories = categories.map(item => {
        if (item.ID === parentCategoryId) {
          item.children = reorderedChildren;
        }
        return item;
      });
      this.setState({
        categories : updatedCategories
      });
    }
  }

  public onClickAdd() {
    const categories = _.cloneDeep(this.state.categories);
    let currentCategory: ICategory = {
      Title: '',
      ID: null,
      SortOrder: _.maxBy(categories, (t) => t.SortOrder).SortOrder + 1.00000000001,
      GUID: (categories.length + 1).toString(),
      isNew: true,
      key: '',
      text: '',
      children: []
    };
    categories.push(currentCategory);
    this.setState({
      isAddClicked: true,
      categories: categories
    });
  }

  public onClickCancel(category: ICategory) {
    let categories = _.cloneDeep(this.state.categories);
    let updatedCategories = categories.filter(c => c.GUID !== category.GUID);
    updatedCategories = updatedCategories.map((g, index) => {
      if (!g.ID) {
        g.SortOrder = index + 1;
        g.GUID = (index + 1).toString();
      }
      return g;
    });
    this.setState({
      categories: updatedCategories
    });
  }

  public onDeleteCategory(category : ICategory) {
    let categories = _.cloneDeep(this.state.categories);
    const { deleteSuccess, deleteError } = TaskListConstants.errorMessages;
    if (category.Group) {
      this.setState({
        preventDelete: true
      });
    } else {
      this.dataProvider.deleteItem(this.categoryListName, category.ID)
        .then((isDeleted) => {
          if (isDeleted) {
            let filterdCategories = categories.filter(c => c.ID !== category.ID);
            this.setState({
              categories: filterdCategories,
              statusMessage: deleteSuccess,
              statusType: ProgressStatusType.FAILURE
            }, () => TaskDataProvider.categories = filterdCategories);
            this.resetStatus();
          } else {
            this.setState({
              categories: categories,
              statusMessage: deleteError,
              statusType: ProgressStatusType.FAILURE
            });
          }
        }).catch(() => {
          this.setState({
            categories: categories,
            statusMessage: deleteError,
            statusType: ProgressStatusType.FAILURE
          });
        });
    }
  }

  public onCheckUniqueToGroup(checked: boolean) {
    const groups = _.cloneDeep(this.state.groups);
    if(checked) {
      const defaultGroup = groups.filter(g => g.IsDefault)[0];
      this.setState({
        isUniqueToGroupChecked: true,
        currentSelectedGroup : defaultGroup
      });
    }
    this.setState({
      isUniqueToGroupChecked: false,
      currentSelectedGroup: null
    });
  }


  public onChangeCurrentGroup(option) {
      this.setState({
        currentSelectedGroup: option
      });
  }

  public render(): React.ReactElement<ICategorySettingsPanelProps> {
    const { categories, currentSelectedGroup,  preventDelete, statusMessage, statusType , isUniqueToGroupChecked} = this.state;
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

            {
              this.props.uniqueToGroupEnabled ? (
              <Checkbox
                  label="Unique to Group"
                  checked = {isUniqueToGroupChecked}
                  onChange={ (e,checked) => {this.onCheckUniqueToGroup(checked);}} />)
                  : null
            }

            {
              isUniqueToGroupChecked ?
              (
              <Dropdown
                      label="Disabled example with defaultSelectedKey"
                      // defaultSelectedKey={ currentSelectedGroup.Title }
                      options={this.state.groups}
                      onChange={ (e, option, index) => {this.onChangeCurrentGroup(option);} }
              />
              ) : null
            }

            <div>
              Make subcategory
            </div>
            <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
              <Droppable droppableId="droppable" type="droppableItem">
                {(p, s) => (
                  <div
                    ref={p.innerRef}
                  >
                    { categories.map((category, index) => (
                      <Draggable
                        key={category.GUID}
                        draggableId={category.GUID}
                        index={index}
                        isDragDisabled={category.Title.trim().length === 0}
                      >
                        {(provided, snapshot) => (
                          <div>
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}>
                            <div className={styles.categoryContainer}>
                              <div {...provided.dragHandleProps} style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                <h6>Drag Handle</h6>
                              </div>

                              <TextField
                                value={category.Title}
                                styles={{ fieldGroup: { width: 200 } }}
                                autoFocus={true}
                                onChange={(e, newValue) => { this.onChangeCategoryTitle(newValue, category);}}
                                errorMessage ={ category.isExisting ? "Value already exists" : ""}
                               />

                                <IconButton
                                  disabled={ index === 0 || category.Title.length === 0}
                                  iconProps={{ iconName: 'RowsChild' }}
                                 // onClick={() => { this.onsubtabGroup(group); }}
                                  />
                                <IconButton
                                  disabled={category.Title.trim().length === 0 }
                                  iconProps={{ iconName: 'Delete' }}
                                  onClick={() => { this.onDeleteCategory(category); }}
                                  />

                                {  category.isNew ?
                                  (<IconButton
                                     iconProps={{ iconName: 'Cancel' }}
                                     onClick={(e) => { this.onClickCancel(category); }} />)
                                     : null
                                }
                                {
                                    category.isSaving ?
                                    (<Spinner
                                    size={SpinnerSize.medium}/>) : null
                                }
                            </div>
                            {
                              category.children.length > 0 ? (
                                <CategoryChildDraggable
                                key= { category.GUID }
                                droppableId = { category.ID }
                                subItems = { category.children}
                                />
                              ) : null
                            }
                          </div>
                          {provided.placeholder}
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
                onClick={ this.onClickAdd.bind(this)}
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
