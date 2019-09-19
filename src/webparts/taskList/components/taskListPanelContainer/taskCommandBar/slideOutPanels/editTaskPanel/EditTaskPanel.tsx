
import * as React from 'react';
import styles from './EditTaskPanel.module.scss';
import { IEditTaskPanelProps, IEditTaskPanelState, IDataProvider, EditTaskComponentStatus, ICategory, IGroup, ITaskList, IResponsibleParty, IStatus, NewTaskComponentStatus } from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import _ from 'lodash';
import { Layer, TextField, Dropdown, Toggle, Spinner, SpinnerSize } from 'office-ui-fabric-react';
export default class EditTaskPanel extends React.Component< IEditTaskPanelProps, IEditTaskPanelState> {
  public dataProvider: IDataProvider;
  private isDirty: boolean;
  private currentTaskItem: string;
  private taskListName = TaskDataProvider.listNames.taskListName;

  constructor(props:IEditTaskPanelProps) {
    super(props);
    console.log("Props : ",props);
    this.isDirty = false;
    this.state={
      selectedItem:null,
      isSubTaskChecked: false,     
      isSaveClick: false,
      groups: [],
      categories: [],
      parties: [],
      statuses: [],
      subCategories: [],
      taskCollections: [],
      status: EditTaskComponentStatus.Loading,
    };
    
  }
  public async componentDidMount() {

    this.dataProvider = TaskDataProvider.Instance;
    let { groups, categories, responsibleParties, statuses, isCategoryUniqueEnabled, isGroupingEnabled } = TaskDataProvider;
    let categoryFilter: ICategory[] = [];
    let subCategory: ICategory[] = [];
    const selectedItem = _.cloneDeep(this.props.selectedItem);    
    if (isCategoryUniqueEnabled) {
      categoryFilter =selectedItem.Group ? categories.filter(c => c.Group.Title === selectedItem.Group.Title) : [];
    }
    else {
      categoryFilter = categories;
    }

    let makeSubTask: ITaskList[] = _.cloneDeep(this.props.allTaskItems);
    makeSubTask =  selectedItem.Parent && selectedItem.Category ? makeSubTask.filter(st => st.Category.Id === selectedItem.Category.Id) : [];

    subCategory = categoryFilter.length > 0 ?  categoryFilter.filter(cc=>cc.ID === selectedItem.Category.Id)[0].children : [];    

    this.setState({
      isSubTaskChecked:selectedItem.Parent? true:false,
      selectedItem:selectedItem,
      groups: groups,
      categories: categoryFilter,
      parties: responsibleParties,
      statuses: statuses,
      subCategories: subCategory,
      taskCollections:makeSubTask
    });

  }

  
  private changeToSubTask(checked: boolean) {
    let makeSubTask: ITaskList[] = _.cloneDeep(this.props.allTaskItems);
    const selectedItem = _.cloneDeep(this.state.selectedItem);
    selectedItem.Parent = null;
    if(selectedItem.Category){
      makeSubTask = makeSubTask.filter(st => st.Category.Id === selectedItem.Category.Id);       
      this.setState({
        isSubTaskChecked: checked,
        taskCollections: makeSubTask,
        selectedItem : selectedItem
      });
    }
    else{      
      this.setState({
        isSubTaskChecked: checked,
        selectedItem : selectedItem 
      });
    }
  }

  private onChangeGroup(option) {
    let { categories, isCategoryUniqueEnabled } = TaskDataProvider;
    let categoryFilter: ICategory[] = [];
    const selectedGroup: IGroup = option;
    const selectedItem = _.cloneDeep(this.state.selectedItem);   
    selectedItem.Category =  null;
    selectedItem.Parent = null;
    selectedItem.SubCategory = null;
    selectedItem.Group = {
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
      selectedItem: selectedItem,
      subCategories:[],
      taskCollections:[],
      isSubTaskChecked:this.state.isSubTaskChecked
    });
  }

  private onChangeCategory(e,option) {
    const selectedCategory: ICategory = option;
    const selectedItem = _.cloneDeep(this.state.selectedItem);
    selectedItem.Parent = null;
    selectedItem.SubCategory = null;
    selectedItem.Category = {
      Id: selectedCategory.ID,
      Title: selectedCategory.Title
    };

    let makeSubTask: ITaskList[] = _.cloneDeep(this.props.allTaskItems);
    makeSubTask =  selectedItem.Category ? makeSubTask.filter(st => st.Category.Id === selectedItem.Category.Id) : [];

    console.log(TaskDataProvider.categories);
    let subCategory: ICategory[] = [];
    let categoryFilter: ICategory[] = TaskDataProvider.categories.filter(c => c.ID === selectedCategory.ID);
    subCategory = categoryFilter.length > 0 ?  categoryFilter[0].children : [];
    this.setState({
      selectedItem: selectedItem,
      subCategories: subCategory,
      taskCollections: makeSubTask,
      isSubTaskChecked:this.state.isSubTaskChecked
    });
  }

  private onChangeResponsibleParty(option) {
    const selectedResponsible: IResponsibleParty = option;
    const selectedItem = _.cloneDeep(this.state.selectedItem);
    selectedItem.Responsible = {
      Id: selectedResponsible.ID,
      Title: selectedResponsible.Title
    };
    this.setState({
      selectedItem: selectedItem,
      isSubTaskChecked:this.state.isSubTaskChecked
    });
  }

  private onChangeStatus(option) {
    const selectedStatus: IStatus = option;
    const selectedItem = _.cloneDeep(this.state.selectedItem);
    selectedItem.TaskStatus = {
      Id: selectedStatus.ID,
      Title: selectedStatus.Title
    };
    this.setState({
      selectedItem: selectedItem,
      isSubTaskChecked:this.state.isSubTaskChecked
    });
  }

  private onChangeSubCategory(option) {
    const selectedSubCategory: ICategory = option;
    const selectedItem = _.cloneDeep(this.state.selectedItem);
    selectedItem.SubCategory = {
      Id: selectedSubCategory.ID,
      Title:selectedSubCategory.Title
    };

    this.setState({
      selectedItem: selectedItem,
      isSubTaskChecked:this.state.isSubTaskChecked
    });
  }

  private onChangeParentTask(option) {
    const selectedTask: ITaskList = option;
    const selectedItem = _.cloneDeep(this.state.selectedItem);
    if(this.state.isSubTaskChecked){
      selectedItem.Parent = {
        Id: selectedTask.ID,
        Title:selectedTask.Title
      };
    }
    this.setState({
      selectedItem: selectedItem,
      isSubTaskChecked:this.state.isSubTaskChecked
    });
  }

  public OnTaskNameChange(newValue) {
    const selectedItem = _.cloneDeep(this.state.selectedItem);
    selectedItem.Title = newValue;
    this.setState({
      selectedItem: selectedItem,
      isSubTaskChecked:this.state.isSubTaskChecked
    });
    console.log("New Value : ", newValue, this.state.selectedItem);
  }

  public onSaveNewTaskItem() {
    if (!this.validateForm()) {
      return;
    }
    const { selectedItem } = this.state;
    console.log("Save Close : ", this.state.selectedItem);
    this.setState({
      status: EditTaskComponentStatus.Saving
    });
    this.dataProvider.updateTaskListItem(this.taskListName, selectedItem, selectedItem.ID).then(results => {
      console.log("Results : ", results);
      this.setState({
        status: EditTaskComponentStatus.None
      });
      this.props.hidePanel(this.isDirty);
    }).catch(error => {
      this.setState({
        status: EditTaskComponentStatus.ErrorOnSave
      });
    });
  }
  
  private validateForm(): boolean {
    let selectedItem = this.state.selectedItem;
    if (selectedItem.Title.trim() === "" || !selectedItem.Group || !selectedItem.Responsible || !selectedItem.TaskStatus || !selectedItem.Category || (!selectedItem.Parent && this.state.isSubTaskChecked)) {
      this.setState({
        isSaveClick: true
      });
      return false;
    }
    return true;
  }
  
  public render(): React.ReactElement<IEditTaskPanelProps> {
    const { isSubTaskChecked, groups, categories, statuses, parties, subCategories, taskCollections, selectedItem, isSaveClick } = _.cloneDeep(this.state);
    const { isGroupingEnabled } = TaskDataProvider;
    if(selectedItem){
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
                <div className={styles.commentsTitle}>Edit Task</div>           
                <div className={styles.verticalSeperator}></div>
              </div>            
              <div className={styles.newTaskContainer}>
                <TextField
                  value={selectedItem.Title}
                  required={true}
                  errorMessage={selectedItem.Title.trim() === "" && isSaveClick ? "You can't leave this blank." : ""}
                  label="Task name"
                  styles={{ root: { width: 300 } }}
                  onChange={(e, newValue) => this.OnTaskNameChange(newValue)}
                />
  
                {isGroupingEnabled ? <Dropdown
                  label="Group"
                  required={true}
                  key={1}
                  errorMessage={!selectedItem.Group && isSaveClick ? "You can't leave this blank." : ""}
                  selectedKey={selectedItem.Group ? selectedItem.Group.Title : ''}
                  onChange={(e, option) => { this.onChangeGroup(option); }}
                  placeholder="Select an option"
                  options={groups}
                  styles={{ dropdown: { width: 300 } }}
                /> : null}
  
  
                <Dropdown
                  label="Category"
                  key={2}
                  required={true}
                  selectedKey = {selectedItem.Category ? selectedItem.Category.Title : ''}
                  errorMessage={!selectedItem.Category && isSaveClick ? "You can't leave this blank." : ""}
                  onChange={(e, option) => { this.onChangeCategory(e,option); }}
                  placeholder="Select an option"
                  options={categories}
                  styles={{ dropdown: { width: 300 } }}
                />
  
  
                <Dropdown
                  label="Responsible party"
                  required={true}
                  key={3}
                  errorMessage={!selectedItem.Responsible && isSaveClick ? "You can't leave this blank." : ""}
                  selectedKey = {selectedItem.Responsible ? selectedItem.Responsible.Title : ''}
                  onChange={(e, option) => { this.onChangeResponsibleParty(option); }}
                  placeholder="Select an option"
                  options={parties}
                  styles={{ dropdown: { width: 300 } }}
                />
  
                <Dropdown
                  label="Status"
                  key={4}
                  required={true}
                  errorMessage={!selectedItem.TaskStatus && isSaveClick ? "You can't leave this blank." : ""}
                  selectedKey = {selectedItem.TaskStatus ? selectedItem.TaskStatus.Title : ''}
                  onChange={(e, option) => { this.onChangeStatus(option); }}
                  placeholder="Select an option"
                  options={statuses}
                  styles={{ dropdown: { width: 300 } }}
                />
  
  
                <Dropdown
                  label="Sub category"   
                  key={5}        
                  selectedKey = {selectedItem.SubCategory ? selectedItem.SubCategory.Title : ''}
                  onChange={(e, option) => { this.onChangeSubCategory(option); }}
                  placeholder="Select an option"
                  options={subCategories}
                  styles={{ dropdown: { width: 300 } }}
                />
  
                <Toggle
                  label="Make this subtask"
                  onText="On"
                  offText="Off"
                  checked = {isSubTaskChecked}
                  onChange={(e, checked) => { this.changeToSubTask(checked); }} 
                 />
  
                {
                  isSubTaskChecked ? (
                    <Dropdown
                      label="Parent task"
                      required={true}
                      key={6}
                      selectedKey = {selectedItem.Parent ? selectedItem.Parent.Title : ''}
                      errorMessage={!selectedItem.Parent && isSaveClick ? "You can't leave this blank." : ""}                    
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
                    EditTaskComponentStatus.Saving ||
                    this.state.status ===
                    EditTaskComponentStatus.FilesUploadInProgress
                  }
                  onClick={this.onSaveNewTaskItem.bind(this)}
                >
                  Save & Close
                      {this.state.status ===
                    EditTaskComponentStatus.Saving ||
                    this.state.status ===
                    EditTaskComponentStatus.FilesUploadInProgress ? (
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
    else{
      return null;
    }
  }
}
