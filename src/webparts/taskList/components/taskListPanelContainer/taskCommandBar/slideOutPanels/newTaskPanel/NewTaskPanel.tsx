import * as React from 'react';
import styles from './NewTaskPanel.module.scss';
import { INewTaskPanelProps, INewTaskPanelState, ITaskList, IGroup, ICategory, IResponsibleParty, IStatus, IDataProvider, NewTaskComponentStatus } from '../../../../../../../interfaces/index';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { Spinner, SpinnerSize, Layer, MarqueeSelection, IconButton, TextField, Dropdown, Toggle, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
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
    let { groups, categories, responsibleParties, statuses, isCategoryUniqueEnabled, isGroupingEnabled } = TaskDataProvider;
    let categoryFilter: ICategory[] = [];
    const currentItem = _.cloneDeep(this.state.currentItem);
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
    let makeSubTask: ITaskList[] = _.cloneDeep(this.props.allTaskItems);
    const currentItem = _.cloneDeep(this.state.currentItem);
    currentItem.Parent = null;
    if(currentItem.Category){
      makeSubTask = makeSubTask.filter(st => st.Category.Id === currentItem.Category.Id);       
      this.setState({
        isSubTaskChecked: checked,
        taskCollections: makeSubTask,
        currentItem : currentItem
      });
    }
    else{      
      this.setState({
        isSubTaskChecked: checked,
        currentItem : currentItem 
      });
    }
  }

  private onChangeGroup(option) {
    let { categories, isCategoryUniqueEnabled } = TaskDataProvider;
    let categoryFilter: ICategory[] = [];
    const selectedGroup: IGroup = option;
    const currentItem = _.cloneDeep(this.state.currentItem);   
    currentItem.Category =  null;
    currentItem.Parent = null;
    currentItem.SubCategory = null;
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
      categories: categoryFilter,
      currentItem: currentItem,
      subCategories:[],
      taskCollections:[]
    });
  }

  private onChangeCategory(e,option) {
    const selectedCategory: ICategory = option;
    const currentItem = _.cloneDeep(this.state.currentItem);
    currentItem.Parent = null;
    currentItem.SubCategory = null;
    currentItem.Category = {
      Id: selectedCategory.ID,
      Title: selectedCategory.Title
    };

    let makeSubTask: ITaskList[] = _.cloneDeep(this.props.allTaskItems);
    makeSubTask =  currentItem.Category ? makeSubTask.filter(st => st.Category.Id === currentItem.Category.Id) : [];

    console.log(TaskDataProvider.categories);
    let subCategory: ICategory[] = [];
    let categoryFilter: ICategory[] = TaskDataProvider.categories.filter(c => c.ID === selectedCategory.ID);
    subCategory = categoryFilter.length > 0 ?  categoryFilter[0].children : [];
    this.setState({
      currentItem: currentItem,
      subCategories: subCategory,
      taskCollections: makeSubTask
    });
  }

  private onChangeResponsibleParty(option) {
    const selectedResponsible: IResponsibleParty = option;
    const currentItem = _.cloneDeep(this.state.currentItem);
    currentItem.Responsible = {
      Id: selectedResponsible.ID,
      Title: selectedResponsible.Title
    };
    this.setState({
      currentItem: currentItem
    });
  }

  private onChangeStatus(option) {
    const selectedStatus: IStatus = option;
    const currentItem = _.cloneDeep(this.state.currentItem);
    currentItem.TaskStatus = {
      Id: selectedStatus.ID,
      Title: selectedStatus.Title
    };
    this.setState({
      currentItem: currentItem
    });
  }

  private onChangeSubCategory(option) {
    const selectedSubCategory: ICategory = option;
    const currentItem = _.cloneDeep(this.state.currentItem);
    currentItem.SubCategory = {
      Id: selectedSubCategory.ID,
      Title:selectedSubCategory.Title
    };

    this.setState({
      currentItem: currentItem
    });
  }

  private onChangeParentTask(option) {
    const selectedTask: ITaskList = option;
    const currentItem = _.cloneDeep(this.state.currentItem);
    if(this.state.isSubTaskChecked){
      currentItem.Parent = {
        Id: selectedTask.ID,
        Title:selectedTask.Title
      };
    }
    

    this.setState({
      currentItem: currentItem
    });
  }

  public OnTaskNameChange(newValue) {
    const currentItem = _.cloneDeep(this.state.currentItem);
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
    if (currentItem.Title.trim() === "" || !currentItem.Group || !currentItem.Responsible || !currentItem.TaskStatus || !currentItem.Category || (!currentItem.Parent && this.state.isSubTaskChecked)) {
      this.setState({
        isSaveClick: true
      });
      return false;
    }
    return true;
  }


  public render(): React.ReactElement<INewTaskPanelProps> {
    const { isSubTaskChecked, groups, categories, statuses, parties, subCategories, taskCollections, currentItem, isSaveClick } = _.cloneDeep(this.state);
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
                key={1}
                errorMessage={!currentItem.Group && isSaveClick ? "You can't leave this blank." : ""}
                selectedKey={currentItem.Group ? currentItem.Group.Title : ''}
                onChange={(e, option) => { this.onChangeGroup(option); }}
                placeholder="Select an option"
                options={groups}
                styles={{ dropdown: { width: 300 } }}
              /> : null}


              <Dropdown
                label="Category"
                key={2}
                required={true}
                selectedKey = {currentItem.Category ? currentItem.Category.Title : ''}
                errorMessage={!currentItem.Category && isSaveClick ? "You can't leave this blank." : ""}
                onChange={(e, option) => { this.onChangeCategory(e,option); }}
                placeholder="Select an option"
                options={categories}
                styles={{ dropdown: { width: 300 } }}
              />


              <Dropdown
                label="Responsible party"
                required={true}
                key={3}
                errorMessage={!currentItem.Responsible && isSaveClick ? "You can't leave this blank." : ""}
                onChange={(e, option) => { this.onChangeResponsibleParty(option); }}
                placeholder="Select an option"
                options={parties}
                styles={{ dropdown: { width: 300 } }}
              />

              <Dropdown
                label="Status"
                key={4}
                required={true}
                errorMessage={!currentItem.TaskStatus && isSaveClick ? "You can't leave this blank." : ""}
                onChange={(e, option) => { this.onChangeStatus(option); }}
                placeholder="Select an option"
                options={statuses}
                styles={{ dropdown: { width: 300 } }}
              />


              <Dropdown
                label="Sub category"   
                key={5}        
                selectedKey = {currentItem.SubCategory ? currentItem.SubCategory.Title : ''}
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
                    key={6}
                    selectedKey = {currentItem.Parent ? currentItem.Parent.Title : ''}
                    errorMessage={!currentItem.Parent && isSaveClick ? "You can't leave this blank." : ""}                    
                    onChange={(e, option) => { this.onChangeParentTask(option); }}
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
          </div>
        </div>
      </Layer>
    );
  }
}
