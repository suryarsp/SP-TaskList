import * as React from 'react';
import styles from './NewTaskPanel.module.scss';
import { INewTaskPanelProps, INewTaskPanelState, ITaskList, IGroup, ICategory, IResponsibleParty, IStatus, IDataProvider } from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
export default class NewTaskPanel extends React.Component<INewTaskPanelProps, INewTaskPanelState> {
  public dataProvider: IDataProvider;
  private isDirty: boolean;
  private item: ITaskList;
  private taskListName = TaskDataProvider.listNames.taskListName;
  constructor(props) {
    super(props);
    /// TODO : should come from props if a task has been selected
    this.state = {
      isSubTaskChecked: false,
      currentItem : {
        Title: '',
        Category: null,
        SubCategory:null,
        Parent: null,
        SortOrder: 1,
        Responsible: null,
        TaskStatus: null,
        CommentsId :[1],
        children: []
      },
      groups: [],
      categories: [],
      parties: [],
      statuses: [],
      subCategories: []
    };
    this.isDirty = false;
  }

  public async componentDidMount() {
   
    const {groupListName, statusListName, responsibleListName, categoryListName,taskListName} = TaskDataProvider.listNames;
    this.dataProvider = TaskDataProvider.Instance;
    let { groups, categories, responsibleParties, statuses}  = TaskDataProvider;
    if(categories.length === 0){
      categories =  await this.dataProvider.getCategories(categoryListName);
    }

    if(groups.length === 0){
      groups = await this.dataProvider.getGroups(groupListName);
    }

    if(responsibleParties.length === 0){
     responsibleParties = await this.dataProvider.getResponsibleParties(responsibleListName);
    }

    if(statuses.length === 0){
     statuses = await this.dataProvider.getStatuses(statusListName);
    }
   
    this.setState({
      groups: groups,
      categories: categories,
      parties: responsibleParties,
      statuses: statuses,
      subCategories : []
    });  
  }

  
  private changeToSubTask(checked: boolean) {
    this.setState({
      isSubTaskChecked: checked
    });
  }

  private onChangeGroup(option) {
    const selectedGroup: IGroup = option;
    const currentItem = this.state.currentItem;
    currentItem.Group = {
      Id: selectedGroup.ID,
      Title: selectedGroup.Title
    };
    this.setState({
      currentItem : currentItem
    });
  }

  private onChangeCategory(option) {
    const selectedGroup: ICategory = option;
    const currentItem = this.state.currentItem;
    currentItem.Category = {
      Id: selectedGroup.ID,
      Title: selectedGroup.Title
    };
    this.setState({
      currentItem : currentItem
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
      currentItem : currentItem
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
      currentItem : currentItem
    });
  }

  private onChangeSubCategory(option) {
    const selectedGroup: ICategory = option;
    const currentItem = this.state.currentItem;
    currentItem.SubCategory = {
      Id:selectedGroup.ID
    };
    this.setState({
      currentItem : currentItem
    });
  }

  private onChangeParentTask(option) {
    const selectedTask: ITaskList = option;
    const currentItem = this.state.currentItem;
  }

  public OnTaskNameChange(newValue){
    const currentItem = this.state.currentItem;
    currentItem.Title = newValue;
    this.setState({
      currentItem : currentItem
    });
    console.log("New Value : ",newValue, this.state.currentItem);
  } 

  public OnSaveCloseClick(){
    const {currentItem} = this.state;
    console.log("Save Close : ",this.state.currentItem);
    this.dataProvider.insertTaskListItem(this.taskListName,currentItem).then(results=>{
      console.log("Results : ",results);
    });
  }

  public render(): React.ReactElement<INewTaskPanelProps> {
    const { isSubTaskChecked, groups, categories, statuses, parties, subCategories} = this.state;
    const {isGroupingEnabled} = TaskDataProvider;
    const defaultGroup = groups.length > 0 ? groups.filter(g => g.IsDefault)[0].Title: "";

    return (
      <div>
        <Panel
          isOpen={true}
          type={PanelType.smallFixedFar}
          onDismiss={() => { this.props.hidePanel(this.isDirty); }}
          headerText="Add new task"
          closeButtonAriaLabel="Close"         
        >
          <TextField
            label="Task list name"
            styles={{ root: { width: 300 } }}
            onChange={(e, newValue) => this.OnTaskNameChange(newValue)}
          />

          {isGroupingEnabled ?  <Dropdown
            label="Group"
            required={true}
            selectedKey={defaultGroup}
            onChange={(e, option) => {this.onChangeGroup(option);}}
            placeholder="Select an option"
            options={groups}
            styles={{ dropdown: { width: 300 } }}
          /> : null }
         

          <Dropdown
            label="Category"
            required={true}
            onChange={(e, option) => {this.onChangeCategory(option);}}
            placeholder="Select an option"
            options={categories}
            styles={{ dropdown: { width: 300 } }}
          />


          <Dropdown
            label="Responsible party"
            required={true}            
            onChange={(e, option) => {this.onChangeResponsibleParty(option);}}
            placeholder="Select an option"
            options = {parties}
            styles={{ dropdown: { width: 300 } }}
          />

          <Dropdown
            label="Status"
            required={true}
            onChange={(e, option) => {this.onChangeStatus(option);}}
            placeholder="Select an option"
            options={statuses}
            styles={{ dropdown: { width: 300 } }}
          />


            <Dropdown
            label="Sub category"
            onChange={(e,option) => {this.onChangeSubCategory(option);}}
            placeholder="Select an option"
            options={ subCategories}
            styles={{ dropdown: { width: 300 } }}
          />

          <Toggle
              label="Make this subtask"
              onText="On"
              offText="Off"
              onChange={(e, checked) => {this.changeToSubTask(checked);}} />

          {
            isSubTaskChecked ? (
              <Dropdown
                label="Parent task"
                required = {true}
                selectedKey={""}
                onChange={(e,option) => {this.onChangeSubCategory(option);}}
                placeholder="Select an option"
                options={ subCategories}
                styles={{ dropdown: { width: 300 } }}
          />
            ) : null
          }
          <div>
            <PrimaryButton style={{ marginRight: '8px' }}>
              Save & Add another
            </PrimaryButton>
            <PrimaryButton style={{ marginRight: '8px' }} onClick={this.OnSaveCloseClick.bind(this)}>
              Save & Close
            </PrimaryButton>
            <DefaultButton >Cancel</DefaultButton>
          </div>
        </Panel>
      </div>
    );
  }
}
