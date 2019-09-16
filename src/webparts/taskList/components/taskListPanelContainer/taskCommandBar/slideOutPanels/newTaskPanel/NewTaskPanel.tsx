import * as React from 'react';
import styles from './NewTaskPanel.module.scss';
import { INewTaskPanelProps, INewTaskPanelState, ITaskList, IGroup, ICategory, IResponsibleParty, IStatus } from '../../../../../../../interfaces/index';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
export default class NewTaskPanel extends React.Component<INewTaskPanelProps, INewTaskPanelState> {

  private isDirty: boolean;
  private item: ITaskList;
  constructor(props) {
    super(props);
    /// TODO : should come from props if a task has been selected
    this.state = {
      isSubTaskChecked: false,
      currentItem : {
        Title: '',
        Category: null,
        Parent: null,
        SortOrder: 1,
        Responsible: null,
        TaskStatus: null,
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

  public componentDidMount() {
    const { groups, categories, responsibleParties, statuses}  = TaskDataProvider;
    this.setState({
      groups: groups,
      categories: categories,
      parties: responsibleParties,
      statuses: statuses
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
  }

  private onChangeParentTask(option) {
    const selectedTask: ITaskList = option;
    const currentItem = this.state.currentItem;
  }

  public render(): React.ReactElement<INewTaskPanelProps> {
    const { isSubTaskChecked, groups, categories, statuses, parties, subCategories} = this.state;
    const defaultGroup = groups.length > 0 ? groups.filter(g => g.IsDefault)[0].Title: "";

    return (
      <div>
        <Panel
          isOpen={true}
          type={PanelType.smallFluid}
          onDismiss={() => { this.props.hidePanel(this.isDirty); }}
          headerText="Add new task"
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this._onRenderFooterContent}
        >
          <TextField
            label="Task list name"
            styles={{ root: { width: 300 } }}
          />
            required />

          <Dropdown
            label="Group"
            required={true}
            selectedKey={defaultGroup}
            onChange={(e, option) => {this.onChangeGroup(option);}}
            placeholder="Select an option"
            options={groups}
            styles={{ dropdown: { width: 300 } }}
          />

          <Dropdown
            label="Category"
            required={true}
            selectedKey={""}
            onChange={(e, option) => {this.onChangeCategory(option);}}
            placeholder="Select an option"
            options={categories}
            styles={{ dropdown: { width: 300 } }}
          />


          <Dropdown
            label="Responsible party"
            required={true}
            selectedKey={""}
            onChange={(e, option) => {this.onChangeResponsibleParty(option);}}
            placeholder="Select an option"
            options = {parties}
            styles={{ dropdown: { width: 300 } }}
          />

          <Dropdown
            label="Status"
            required={true}
            selectedKey={""}
            onChange={(e, option) => {this.onChangeStatus(option);}}
            placeholder="Select an option"
            options={statuses}
            styles={{ dropdown: { width: 300 } }}
          />


            <Dropdown
            label="Sub category"
            selectedKey={""}
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

        </Panel>
      </div>
    );
  }

  private _onRenderFooterContent() {
    return (
      <div>
        <PrimaryButton style={{ marginRight: '8px' }}>
          Save & Add another
        </PrimaryButton>
        <PrimaryButton style={{ marginRight: '8px' }}>
          Save & Close
        </PrimaryButton>
        <DefaultButton >Cancel</DefaultButton>
      </div>
    );
  }
}
