import * as React from 'react';
import styles from './NewTaskPanel.module.scss';
import { INewTaskPanelProps, INewTaskPanelState, ITaskList, IGroup, ICategory, IResponsibleParty, IStatus, IDataProvider, NewTaskComponentStatus } from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { Spinner, SpinnerSize, Layer } from 'office-ui-fabric-react';
import _ from 'lodash';
export default class NewTaskPanel extends React.Component<INewTaskPanelProps, INewTaskPanelState> {
  public dataProvider: IDataProvider;
  private isDirty: boolean;
  private currentTaskItem: string;
  private taskListName = TaskDataProvider.listNames.taskListName;
  constructor(props) {
    super(props);
    /// TODO : should come from props if a task has been selected
    this.state = {
      isSubTaskChecked: false,
      currentItem: {
        Title: '',
        Category: null,
        SubCategory: null,
        Group: null,
        Parent: null,
        SortOrder: 1,
        Responsible: null,
        TaskStatus: null,
        CommentsId: [1],
        children: [],
        key: '',
        text: ''
      },
      isSaveClick: false,
      groups: [],
      categories: [],
      parties: [],
      statuses: [],
      subCategories: [],
      taskCollections: [],
      status: NewTaskComponentStatus.Loading,
    };
    this.isDirty = false;
  }

  public async componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    let { groups, categories, responsibleParties, statuses, isCategoryUniqueEnabled } = TaskDataProvider;
    let categoryFilter: ICategory[] = [];
    let currentItem = this.state.currentItem;
    const defaultGroup: IGroup = groups.length > 0 ? groups.filter(g => g.IsDefault)[0] : null;
    if (isCategoryUniqueEnabled) {
      categoryFilter = categories.filter(c => c.Group.Title === defaultGroup.Title);
    }
    else {
      categoryFilter = categories;
    }

    currentItem.Group = { Id: defaultGroup.ID, Title: defaultGroup.Title };

    this.setState({
      currentItem: currentItem,
      groups: groups,
      categories: categoryFilter,
      parties: responsibleParties,
      statuses: statuses,
      subCategories: []
    });
  }


  private changeToSubTask(checked: boolean) {
    let makeSubTask: ITaskList[] = _.cloneDeep(TaskDataProvider.tasks);
    const currentItem = this.state.currentItem;
    if(currentItem.Category){
      makeSubTask = makeSubTask.filter(st => st.Category.Id === currentItem.Category.Id);       
      this.setState({
        isSubTaskChecked: checked,
        taskCollections: makeSubTask
      });
    }
    else{      
      this.setState({
        isSubTaskChecked: checked      
      });
    }
  }

  private onChangeGroup(option) {
    let { categories, isCategoryUniqueEnabled } = TaskDataProvider;
    let categoryFilter: ICategory[] = [];
    const selectedGroup: IGroup = option;
    const currentItem = this.state.currentItem;
    currentItem.Group = {
      Id: selectedGroup.ID,
      Title: selectedGroup.Title
    };
    if (isCategoryUniqueEnabled) {
      categoryFilter = categories.filter(c => c.Group.Title === selectedGroup.Title);
    }
    else {
      categoryFilter = categories;
    }

    this.setState({
      categories: categories,
      currentItem: currentItem
    });
  }

  private onChangeCategory(option) {
    const selectedGroup: ICategory = option;
    const currentItem = this.state.currentItem;

    currentItem.Category = {
      Id: selectedGroup.ID,
      Title: selectedGroup.Title
    };

    let makeSubTask: ITaskList[] = _.cloneDeep(TaskDataProvider.tasks);
    makeSubTask = makeSubTask.filter(st => st.Category.Id === currentItem.Category.Id);

    console.log(TaskDataProvider.categories);
    let subCategory: ICategory[] = [];
    let categoryFilter: ICategory[] = TaskDataProvider.categories.filter(c => c.ID === selectedGroup.ID);
    subCategory = categoryFilter[0].children;

    this.setState({
      currentItem: currentItem,
      subCategories: subCategory,
      taskCollections: makeSubTask
    });
  }

  private onChangeResponsibleParty(option) {
    const selectedGroup: IResponsibleParty = option;
    const currentItem = this.state.currentItem;
    currentItem.Responsible = {
      Id: selectedGroup.ID,
      Title: selectedGroup.Title
    };
    this.setState({
      currentItem: currentItem
    });
  }

  private onChangeStatus(option) {
    const selectedGroup: IStatus = option;
    const currentItem = this.state.currentItem;
    currentItem.TaskStatus = {
      Id: selectedGroup.ID,
      Title: selectedGroup.Title
    };
    this.setState({
      currentItem: currentItem
    });
  }

  private onChangeSubCategory(option) {
    const selectedGroup: ICategory = option;
    const currentItem = this.state.currentItem;
    currentItem.SubCategory = {
      Id: selectedGroup.ID
    };

    this.setState({
      currentItem: currentItem
    });
  }

  private onChangeParentTask(option) {
    const selectedTask: ITaskList = option;
    const currentItem = this.state.currentItem;
  }

  public OnTaskNameChange(newValue) {
    const currentItem = this.state.currentItem;
    currentItem.Title = newValue;
    this.setState({
      currentItem: currentItem
    });
    console.log("New Value : ", newValue, this.state.currentItem);
  }

  public onSaveNewTaskItem() {
    if (!this.validateForm()) {
      return;
    }
    const { currentItem } = this.state;
    console.log("Save Close : ", this.state.currentItem);
    this.setState({
      status: NewTaskComponentStatus.Saving
    });
    this.dataProvider.insertTaskListItem(this.taskListName, currentItem).then(results => {
      console.log("Results : ", results);
      this.setState({
        status: NewTaskComponentStatus.None
      });
      this.props.hidePanel(this.isDirty);
    }).catch(error => {
      this.setState({
        status: NewTaskComponentStatus.ErrorOnSave
      });
    });
  }

  public onSaveAndAddNewTask() {
    if (!this.validateForm()) {
      return;
    }
    const { currentItem } = this.state;
    console.log("Save Close : ", this.state.currentItem);
    this.setState({
      status: NewTaskComponentStatus.Saving
    });
    this.dataProvider.insertTaskListItem(this.taskListName, currentItem).then(results => {
      console.log("Results : ", results);
      this.isDirty = true;
      this.currentTaskItem = "";
      this.setState({
        status: NewTaskComponentStatus.None
      });
    }).catch(error => {
      this.setState({
        status: NewTaskComponentStatus.ErrorOnSave
      });
    });
  }

  private validateForm(): boolean {
    let currentItem = this.state.currentItem;
    if (currentItem.Title.trim() === "" || !currentItem.Group || currentItem.Responsible || currentItem.TaskStatus || currentItem.Category || (currentItem.Parent && this.state.isSubTaskChecked)) {
      this.setState({
        isSaveClick: true
      });
      return false;
    }
    return true;
  }


  public render(): React.ReactElement<INewTaskPanelProps> {
    const { isSubTaskChecked, groups, categories, statuses, parties, subCategories, taskCollections, currentItem, isSaveClick } = this.state;
    const { isGroupingEnabled } = TaskDataProvider;

    return (
      <Layer>
        <div className={styles.slidePaneloverlay}>
          <div className={styles.commentspanel}>
            <div className={styles.header}>
              <div className={styles.closeButton}>
                <IconButton
                  iconProps={{ iconName: 'Cancel' }}
                  onClick={() => this.props.hidePanel(this.isDirty)}
                />
              </div>
              <div className={styles.commentsTitle}>New Task</div>           
              <div className={styles.verticalSeperator}></div>
            </div>
            {/* <Panel
          isOpen={true}
          type={PanelType.medium}
          onDismiss={() => { this.props.hidePanel(this.isDirty); }}
          headerText="Add new task"
          closeButtonAriaLabel="Close"
          className={"newTaskItem"}
        > */}
            <div className={styles.newTaskContainer}>
              <TextField
                value={this.currentTaskItem}
                required={true}
                errorMessage={currentItem.Title.trim() === "" && isSaveClick ? "You can't leave this blank." : ""}
                label="Task name"
                styles={{ root: { width: 300 } }}
                onChange={(e, newValue) => this.OnTaskNameChange(newValue)}
              />

              {isGroupingEnabled ? <Dropdown
                label="Group"
                required={true}
                errorMessage={!currentItem.Group && isSaveClick ? "You can't leave this blank." : ""}
                selectedKey={currentItem.Group ? currentItem.Group.Title : ""}
                onChange={(e, option) => { this.onChangeGroup(option); }}
                placeholder="Select an option"
                options={groups}
                styles={{ dropdown: { width: 300 } }}
              /> : null}


              <Dropdown
                label="Category"
                required={true}
                errorMessage={!currentItem.Category && isSaveClick ? "You can't leave this blank." : ""}
                onChange={(e, option) => { this.onChangeCategory(option); }}
                placeholder="Select an option"
                options={categories}
                styles={{ dropdown: { width: 300 } }}
              />


              <Dropdown
                label="Responsible party"
                required={true}
                errorMessage={!currentItem.Responsible && isSaveClick ? "You can't leave this blank." : ""}
                onChange={(e, option) => { this.onChangeResponsibleParty(option); }}
                placeholder="Select an option"
                options={parties}
                styles={{ dropdown: { width: 300 } }}
              />

              <Dropdown
                label="Status"
                required={true}
                errorMessage={!currentItem.TaskStatus && isSaveClick ? "You can't leave this blank." : ""}
                onChange={(e, option) => { this.onChangeStatus(option); }}
                placeholder="Select an option"
                options={statuses}
                styles={{ dropdown: { width: 300 } }}
              />


              <Dropdown
                label="Sub category"
                onChange={(e, option) => { this.onChangeSubCategory(option); }}
                placeholder="Select an option"
                options={subCategories}
                styles={{ dropdown: { width: 300 } }}
              />

              <Toggle
                label="Make this subtask"
                onText="On"
                offText="Off"
                onChange={(e, checked) => { this.changeToSubTask(checked); }} />

              {
                isSubTaskChecked ? (
                  <Dropdown
                    label="Parent task"
                    required={true}
                    errorMessage={!currentItem.Parent && isSaveClick ? "You can't leave this blank." : ""}
                    selectedKey={""}
                    onChange={(e, option) => { this.onChangeSubCategory(option); }}
                    placeholder="Select an option"
                    options={taskCollections}
                    styles={{ dropdown: { width: 300 } }}
                  />
                ) : null
              }
            </div>
            <div className={ styles["bottom-btn-container"]}>
              <PrimaryButton
                disabled={
                  this.state.status ===
                  NewTaskComponentStatus.Saving ||
                  this.state.status ===
                  NewTaskComponentStatus.FilesUploadInProgress
                }
                onClick={this.onSaveAndAddNewTask.bind(this)}
              >
                Save & Add Another
					          {this.state.status ===
                  NewTaskComponentStatus.Saving ||
                  this.state.status ===
                  NewTaskComponentStatus.FilesUploadInProgress ? (
                    <div className="ms-Grid-col">
                      <Spinner
                        size={SpinnerSize.medium}
                      />
                    </div>
                  ) : null}
              </PrimaryButton>
              <PrimaryButton
                disabled={
                  this.state.status ===
                  NewTaskComponentStatus.Saving ||
                  this.state.status ===
                  NewTaskComponentStatus.FilesUploadInProgress
                }
                onClick={this.onSaveNewTaskItem.bind(this)}
              >
                Save & Close
					          {this.state.status ===
                  NewTaskComponentStatus.Saving ||
                  this.state.status ===
                  NewTaskComponentStatus.FilesUploadInProgress ? (
                    <div className="ms-Grid-col">
                      <Spinner
                        size={SpinnerSize.medium}
                      />
                    </div>
                  ) : null}
              </PrimaryButton>
              <DefaultButton onClick={() => this.props.hidePanel(this.isDirty)}>
                Cancel
            </DefaultButton>
            </div>

            {/* </Panel> */}
          </div>
        </div>
      </Layer>
    );
  }
}
