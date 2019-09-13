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
      allCategories: [],
      isAddClicked: false,
      preventDelete: false,
      statusMessage: "",
      statusType: null,
      isUniqueToGroupChecked: false,
      currentSelectedGroup: null,
      groups: []
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    this.categoryListName = TaskDataProvider.listNames.categoryListName;
    this.groupListName = TaskDataProvider.listNames.groupListName;
    this.isCategoryUniqueEnabled = TaskDataProvider.isCategoryUniqueEnabled;
    this.dataProvider.getCategories(this.categoryListName).then((categories)=> {
      let newCategories: ICategory[] = [];
       categories.map((category) => {
        if(category.Parent) {
          const parentIndex = _.findIndex(newCategories, c => c.ID === category.Parent.Id);
          newCategories[parentIndex].children.push(category);
        } else {
          newCategories.push(category);
        }
      });

        if(this.props.uniqueToGroupEnabled) {
          this.dataProvider.getGroups(this.groupListName).then((groups) => {
            TaskDataProvider.groups = groups;
            const defaultGroup = groups.filter(c => c.IsDefault)[0];
            const displayCategories = newCategories.filter(c => !c.Group);
              this.setState({
                  groups:  groups,
                  allCategories: newCategories,
                  categories: displayCategories,
                  currentSelectedGroup: defaultGroup
              }, () => TaskDataProvider.categories = newCategories);
          }).catch((error) => {
            console.log("Get Groups", error);
          });
        } else {
          this.setState({
            categories: newCategories,
            allCategories: newCategories
          });
        }
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


  public reorder(list: ICategory[], startIndex: number, endIndex: number) {
    const result = _.cloneDeep(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  public onChangeCategoryTitle(newValue: string, category: ICategory) {
    const { isUniqueToGroupChecked } = this.state;
    let categories = isUniqueToGroupChecked ? _.cloneDeep(this.state.allCategories) :  _.cloneDeep(this.state.categories);
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
      let allCategories = _.cloneDeep(this.state.allCategories);
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
            allCategories = allCategories.map(c => {
              if (c.ID === category.ID) {
                return updatedCategory;
              }
              return c;
            });
            this.setState({
              categories: updatedCategories,
              allCategories: allCategories,
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
          console.log(error);
          this.setState({
            categories: categories,
            statusMessage: saveError,
            statusType: ProgressStatusType.FAILURE
          });
        });
    }, 1000);
  }

  public calculateCategorySort(categories: ICategory[], newIndex: number): number {
    if (newIndex === 0) { // at first position
      if (categories.length > 0) {
        let newSortIndex = 1.00000000000;
        for (let index = 0; index < categories.length; index++) {
          if (categories[index].SortOrder) {
            let firstSort = categories[index].SortOrder;
            newSortIndex = firstSort - 1.00000000001;
            let nextSort = 1.00000000000;
            if (index + 1 < categories.length - 1) {
              nextSort = categories[index + 1].SortOrder;
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
    else if (newIndex === categories.length - 1) { // at one before to last
      if (categories.length > 1) {
        let prevSortIndex = categories[newIndex - 1].SortOrder;
        let nextSortIndex = categories[newIndex].SortOrder;
        let newSortIndex = (Number(prevSortIndex) + Number(nextSortIndex)) / 2.00000000000;
        return newSortIndex;
      }
      else {
        return 1.00000000000;
      }
    }
    else if (newIndex === categories.length) // at last position
    {
      let newSortIndex = _.maxBy(categories, (t) => t.SortOrder).SortOrder + 1.00000000001;
      return newSortIndex;
    }
    else {
      let prevSortIndex = 1.00000000000;
      if (newIndex - 1 < categories.length) {
        prevSortIndex = categories[newIndex - 1].SortOrder;
      }
      let nextSortIndex = null;
      if (newIndex < categories.length) {
        nextSortIndex = categories[newIndex].SortOrder;
      }
      if (!nextSortIndex) {
        for (let index = newIndex + 1; index < categories.length; index++) {
          if (categories[index].SortOrder) {
            nextSortIndex = categories[index].SortOrder;
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

  public onAddCategory(category: ICategory, title: string) {
    if (this.clearTimeoutvalue) {
      clearTimeout(this.clearTimeoutvalue);
    }
    this.clearTimeoutvalue = setTimeout(() => {
      this.forceUpdate();
      let  categories = _.cloneDeep(this.state.categories);
      let { currentSelectedGroup , isUniqueToGroupChecked}= this.state;
      let allCategories = _.cloneDeep(this.state.allCategories);
      let newlyCreatedCategory = _.cloneDeep(categories.filter(c => c.GUID === category.GUID)[0]);
      newlyCreatedCategory.Title = title;
      newlyCreatedCategory.Group = isUniqueToGroupChecked ?  {
        Id: currentSelectedGroup.ID,
        Title: currentSelectedGroup.Title
      } : null;
      this.dataProvider.insertCategoryItem(this.categoryListName, newlyCreatedCategory)
        .then((newCategory) => {
          newCategory.isExisting = false;
          newCategory.isSaving = false;
          let updatedCategories = [];
          allCategories.push(newCategory);
          if(categories.length > 0) {
             updatedCategories = categories.map(c => {
              if (c.GUID === category.GUID) {
                return newCategory;
              }
              c.isSaving = false;
              return c;
            });
          } else {
            updatedCategories.push(newCategory);
          }

          this.setState({
            categories: updatedCategories,
            allCategories: allCategories,
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
    const { source, destination} =  result;
    if (!result.destination) {
      return;
    }

    if (result.type === "droppableItem") {
      let categories = _.cloneDeep(this.state.categories);
      const sourceGroup = categories[source.index];
      const sourceIndex = source.index;
      const destinationIndex = destination.index;
      const destinationGroup = categories[destinationIndex < sourceIndex ? destinationIndex : destinationIndex + 1];

      if (destinationGroup) {
        sourceGroup.SortOrder = this.calculateCategorySort(categories, _.findIndex(categories, g => g.GUID === destinationGroup.GUID));
      } else {
        sourceGroup.SortOrder = this.calculateCategorySort(categories, categories.length);
      }

      this.setState({
        statusMessage: 'Sorting...',
        statusType: ProgressStatusType.INPROGRESS
      });

      const updatedCategories = this.reorder(
        _.cloneDeep(this.state.categories),
        result.source.index,
        result.destination.index
      );

      this.dataProvider.updateCategoryItem(this.categoryListName, sourceGroup.ID, sourceGroup).
      then((isUpdated) => {
        if(isUpdated) {
          this.setState({
            categories: updatedCategories,
            statusMessage: TaskListConstants.errorMessages.sortSuccess,
            statusType: ProgressStatusType.SUCCESS
          }, () => TaskDataProvider.categories = updatedCategories);
          this.resetStatus();
        } else {
          this.setState({
            categories: categories,
            statusMessage: TaskListConstants.errorMessages.sortError,
            statusType: ProgressStatusType.FAILURE
          });
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({
          categories: categories,
          statusMessage: TaskListConstants.errorMessages.sortError,
            statusType: ProgressStatusType.FAILURE
        });
      });
    } else if (_.includes(result.type,"droppableSubItem")) {
      let categories = _.cloneDeep(this.state.categories);
      const parentCategoryId = parseInt(result.type.split("-")[1]);
      const childrenForCorrespondingParent = categories.filter(c => c.ID === parentCategoryId)[0].children;
      const reorderedChildren = this.reorder(
        childrenForCorrespondingParent,
        result.source.index,
        result.destination.index
      );

      const sourceGroup = childrenForCorrespondingParent[source.index];
      const sourceIndex = source.index;
      const destinationIndex = destination.index;
      const destinationGroup = childrenForCorrespondingParent[destinationIndex < sourceIndex ? destinationIndex : destinationIndex + 1];

      if (destinationGroup) {
        sourceGroup.SortOrder = this.calculateCategorySort(childrenForCorrespondingParent, _.findIndex(childrenForCorrespondingParent, g => g.ID === destinationGroup.ID));
      } else {
        sourceGroup.SortOrder = this.calculateCategorySort(childrenForCorrespondingParent, childrenForCorrespondingParent.length);
      }

      this.setState({
        statusMessage: 'Sorting...',
        statusType: ProgressStatusType.INPROGRESS
      });

      let updatedCategories = categories.map(item => {
        if (item.ID === parentCategoryId) {
          item.children = reorderedChildren;
        }
        return item;
      });
      this.dataProvider.updateCategoryItem(this.categoryListName, sourceGroup.ID, sourceGroup).
      then((isUpdated) => {
        if(isUpdated) {
          this.setState({
            categories: updatedCategories,
            statusMessage: TaskListConstants.errorMessages.sortSuccess,
            statusType: ProgressStatusType.SUCCESS
          }, () => TaskDataProvider.categories = updatedCategories);
          this.resetStatus();
        } else {
          this.setState({
            categories: categories,
            statusMessage: TaskListConstants.errorMessages.sortError,
            statusType: ProgressStatusType.FAILURE
          });
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({
          categories: categories,
          statusMessage: TaskListConstants.errorMessages.sortError,
            statusType: ProgressStatusType.FAILURE
        });
      });
    }
  }

  public onClickAdd() {
    const categories = _.cloneDeep(this.state.categories);
    let currentCategory: ICategory = {
      Title: '',
      ID: null,
      SortOrder: categories.length > 0 ? _.maxBy(categories.filter(c => c.SortOrder), (t) => t.SortOrder).SortOrder + 1.00000000001: 1.0000000000,
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
    let allCategories = _.cloneDeep(this.state.allCategories);
    const { deleteSuccess, deleteError } = TaskListConstants.errorMessages;
    if (category.children.length > 0) {
      this.setState({
        preventDelete: true
      });
    } else {
      this.dataProvider.deleteItem(this.categoryListName, category.ID)
        .then((isDeleted) => {
          if (isDeleted) {
            let filterdCategories = categories.filter(c => c.ID !== category.ID);
            allCategories = allCategories.filter(c => c.ID !== category.ID);
            this.setState({
              categories: filterdCategories,
              allCategories: allCategories,
              statusMessage: deleteSuccess,
              statusType: ProgressStatusType.SUCCESS
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
    let allCategories = _.cloneDeep(this.state.allCategories);
    let newCategories: ICategory[] = [];
    if(checked) {
      const defaultGroup = groups.filter(g => g.IsDefault)[0];
      const filtered = allCategories.filter(c => c.Group);
      let displayed = [];
      if(filtered.length > 0) {
         displayed = filtered.filter(c => c.Group.Id === defaultGroup.ID);
         displayed.map((category) => {
          if(category.Parent) {
            const parentIndex = _.findIndex(displayed, c => c.ID === category.Parent.Id);
            newCategories[parentIndex].children.push(category);
          } else {
            newCategories.push(category);
          }
        });
      }
      this.setState({
        isUniqueToGroupChecked: true,
        currentSelectedGroup : defaultGroup,
        categories: filtered.length > 0 ? displayed : filtered
      });
    } else {
      allCategories = allCategories.filter(c => !c.Group);
      this.setState({
        isUniqueToGroupChecked: false,
        currentSelectedGroup: null,
        categories: allCategories
      });
    }
  }

  public onClickMakeSubCategory(category: ICategory, index: number) {
      const categories = _.cloneDeep(this.state.categories);
      const parent = categories[index - 1];
      const subcategory = _.cloneDeep(category);
      subcategory.Parent = {
        Id : parent.ID,
        Title:parent.Title
      };
      this.dataProvider.updateCategoryItem(this.categoryListName,subcategory.ID,subcategory)
      .then((isUpdated) => {
        if(isUpdated) {
          const updatedCategories = _.cloneDeep(this.state.categories);
          const [removed] = updatedCategories.splice(index, 1);
          removed.Parent = {
            Id: parent.ID,
            Title:parent.Title
          };
          updatedCategories[index - 1].children.push(removed);
          this.setState({
            statusMessage: TaskListConstants.errorMessages.updateSuccess,
            statusType: ProgressStatusType.SUCCESS,
            categories: updatedCategories
          },() => TaskDataProvider.categories = updatedCategories);
          this.resetStatus();
        } else {
          this.setState({
            statusMessage: TaskListConstants.errorMessages.saveError,
            statusType: ProgressStatusType.FAILURE,
            categories: categories
          });
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({
          statusMessage: TaskListConstants.errorMessages.saveError,
          statusType: ProgressStatusType.FAILURE,
          categories: categories
        });
      });
  }

  public onChangeCurrentGroup(option) {
      const selectionOption: IGroup = option;
      const categories = _.cloneDeep(this.state.allCategories);
      const filtered = categories.filter(c => c.Group);
      let newCategories: ICategory[] = [];
      let displayed = [];
      if(filtered.length > 0) {
        displayed = filtered.filter(c => c.Group.Id === selectionOption.ID);

        displayed.map((category) => {
        if(category.Parent) {
          const parentIndex = _.findIndex(displayed, c => c.ID === category.Parent.Id);
          newCategories[parentIndex].children.push(category);
        } else {
          newCategories.push(category);
        }
      });
      }
      this.setState({
        categories: filtered.length > 0 ? newCategories : filtered,
        currentSelectedGroup: option
      });
  }

  public onRevokeSubCategory(category: ICategory, index: number) {
    const categories = _.cloneDeep(this.state.categories);
    const updatedCategories = _.cloneDeep(this.state.categories);
    const subCategory = _.cloneDeep(category);
    const parentIndex = _.findIndex(updatedCategories, c => c.ID === subCategory.Parent.Id);
    const [removed]  = updatedCategories[parentIndex].children.splice(index, 1);
    removed.Parent = null;
    subCategory.Parent = null;
    this.dataProvider.updateCategoryItem(this.categoryListName, subCategory.ID, subCategory)
    .then((isUpdated) => {
      if(isUpdated) {
        updatedCategories.push(removed);
        this.setState({
          statusMessage: TaskListConstants.errorMessages.updateSuccess,
          statusType: ProgressStatusType.SUCCESS,
          categories: updatedCategories
        }, () => TaskDataProvider.categories = updatedCategories);
        this.resetStatus();
      } else {
        this.setState({
            statusMessage: TaskListConstants.errorMessages.saveError,
            statusType: ProgressStatusType.FAILURE,
            categories: categories
          });
        }
    })
    .catch((e) => {
      console.log(e);
      this.setState({
        statusMessage: TaskListConstants.errorMessages.saveError,
        statusType: ProgressStatusType.FAILURE,
        categories: categories
      });
    });
  }

  public onDeleteSubCategory(category: ICategory, index: number) {
    const categories = _.cloneDeep(this.state.categories);
    const updatedCategories = _.cloneDeep(this.state.categories);
    const parentIndex = _.findIndex(updatedCategories, c => c.ID === category.Parent.Id);
    this.dataProvider.deleteItem(this.categoryListName, category.ID)
    .then((isDeleted) =>  {
        if(isDeleted) {
          updatedCategories[parentIndex].children.splice(index, 1);
          this.setState({
            statusMessage: TaskListConstants.errorMessages.deleteSuccess,
            statusType: ProgressStatusType.SUCCESS,
            categories: updatedCategories
          }, () => TaskDataProvider.categories = updatedCategories);
          this.resetStatus();
        } else {
          this.setState({
            statusMessage: TaskListConstants.errorMessages.deleteError,
            statusType: ProgressStatusType.FAILURE,
            categories: categories
          });
        }
    }).catch((e) => {
      console.log(e);
      this.setState({
        statusMessage: TaskListConstants.errorMessages.deleteError,
        statusType: ProgressStatusType.FAILURE,
        categories: categories
      });
    });
  }

  public onChangeSubCategoryName(category: ICategory, newValue: string) {
    let categories = _.cloneDeep(this.state.categories);
    let parentCategory  = categories.filter(c => c.ID === category.Parent.Id)[0];
    const index = _.findIndex(parentCategory.children, c => c.ID === category.ID);
    category.Title = newValue;
    category.isSaving = true;
    const isCategoryAlreadyPresent = categories.filter(g => g.Title.toLowerCase() === newValue.toLowerCase()).length > 0;
    if (!isCategoryAlreadyPresent) {
      if (this.clearTimeoutvalue) {
        clearTimeout(this.clearTimeoutvalue);
      }
      this.clearTimeoutvalue = setTimeout(() => {
        this.forceUpdate();
        this.dataProvider.updateCategoryItem(this.categoryListName, category.ID, category)
        .then((isUpdated) => {
          category.isSaving = false;
          if(isUpdated) {
            parentCategory.children[index] = category;
            let updatedCategories = categories.map((c) => {
              if(c.ID === parentCategory.ID) {
                return parentCategory;
              }
              return c;
            });
            this.setState({
              statusMessage: TaskListConstants.errorMessages.updateSuccess,
              statusType: ProgressStatusType.SUCCESS,
              categories: updatedCategories
            }, () => TaskDataProvider.categories = updatedCategories);
            this.resetStatus();
          } else {
            this.setState({
              statusMessage: TaskListConstants.errorMessages.saveError,
              statusType: ProgressStatusType.FAILURE,
              categories: categories
            });
          }
        }).catch((e) => {
          console.log(e);
          this.setState({
            statusMessage: TaskListConstants.errorMessages.saveError,
            statusType: ProgressStatusType.FAILURE,
            categories: categories
          });
        });
      }, 1000);
    } else {
      if (this.clearTimeoutvalue) {
        clearTimeout(this.clearTimeoutvalue);
      }
      categories = categories.map(c => {
        if(c.ID === parentCategory.ID) {
          c.children  = c.children.map((child) => {
            if (child.GUID === category.GUID) {
              child.Title = newValue;
              child.isExisting = true;
            } else {
              child.isExisting = false;
            }
            return child;
          });
        }
        return c;
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

  public render(): React.ReactElement<ICategorySettingsPanelProps> {
    const { categories, currentSelectedGroup,  preventDelete, statusMessage, statusType , isUniqueToGroupChecked} = this.state;
    const messageBarType = this.getMessageBarType(statusType);
    const preventDeletionDialog = preventDelete ? (<Dialog
      hidden={false}
      onDismiss={() => this.onClosePreventDeleteDialog.bind(this)}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Delete not allowed',
        subText: TaskListConstants.preventCategoryDeletionText
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
                  style={{margin: '10px'}}
                  label="Unique to Group"
                  checked = {isUniqueToGroupChecked}
                  onChange={ (e,checked) => {this.onCheckUniqueToGroup(checked);}} />)
                  : null
            }

            {
              isUniqueToGroupChecked ?
              (
              <Dropdown
                      style={{margin: '10px'}}
                      label="Group"
                      defaultSelectedKey={ currentSelectedGroup.Title }
                      options={this.state.groups}
                      onChange={ (e, option) => {this.onChangeCurrentGroup(option);} }
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
                        isDragDisabled={category.Title.trim().length === 0 || category.isSaving}
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
                                  disabled={ index === 0 || category.Title.length === 0 || category.isSaving}
                                  iconProps={{ iconName: 'RowsChild' }}
                                  onClick={() => { this.onClickMakeSubCategory(category, index); }}
                                  />
                                <IconButton
                                  disabled={category.Title.trim().length === 0 || category.isSaving}
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
                                onRevokeSubCategory = { this.onRevokeSubCategory.bind(this)}
                                onDeleteSubCategory = { this.onDeleteSubCategory.bind(this)}
                                onChangeSubCategoryTitle = { this.onChangeSubCategoryName.bind(this)}
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
