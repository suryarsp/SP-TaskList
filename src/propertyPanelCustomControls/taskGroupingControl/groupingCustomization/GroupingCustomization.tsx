import * as React from "react";
import { IGroupingCustomizationProps, IGroupingCustomizationState, IDataProvider, IGroup } from '../../../interfaces/index';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { TaskListConstants } from "../../../common/defaults/taskList-constants";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import Dialog, { DialogFooter, DialogType } from "office-ui-fabric-react/lib/Dialog";
import styles from "../../../webparts/taskList/components/header/taskProgressGraph/TaskProgressGraph.module.scss";
import TaskDataProvider from "../../../services/TaskDataProvider";

export default class GroupingCustomization extends React.Component<IGroupingCustomizationProps, IGroupingCustomizationState
  > {
  private dataProvider: IDataProvider;
  private isDirty: boolean;
  constructor(props: IGroupingCustomizationProps) {
    super(props);
    console.log(props);
    this.state = {
      isCategoryUniqueEnabled: props.isCategoryUniqueEnabled,
      isGroupingEnabled: props.isGroupingEnabled,
      selectedViewType: props.selectedViewType,
      groupListName: props.groupListName,
      isButtonDisabled: false,
      isCreationInProgress: false,
      showWarning: false,
      creationSuccess: false,
      isErrorOccured: false,
      isListPresent: false
    };
    this.isDirty = false;
  }


  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    if (this.props.groupListName) {
      this.dataProvider.listExists(this.props.groupListName).then((isPresent) => {
        if (isPresent) {
          this.setState({
            isButtonDisabled: true,
            isListPresent: true
          });
        }

      }).catch(() => {
        this.setState({
          isErrorOccured: true,
          isListPresent: false
        });
      });
    } else {
      this.setState({
        isListPresent: false,
        isButtonDisabled: false
      });
    }

  }

  public enableOrDisableGroup(checked: boolean) {
    const categories = TaskDataProvider.categories;

    if (checked) {
      this.setState({
        isGroupingEnabled: true
      });
    }

    if (!checked) {
      if (categories.filter(c => c.Group.Id).length > 0) {
        this.setState({
          showWarning: true
        });
      } else {
        this.onClearGroupData();
      }
    }
  }

  public enableOrDisableUniqueCategory(checked: boolean) {
    this.setState({
      isCategoryUniqueEnabled: checked
    });
    this.props.onEnableOrDisableUniqueCategory(checked);
  }

  public onChangeGroupView(option: IChoiceGroupOption) {
    this.setState({
      selectedViewType: option.text
    });
    this.props.onChangeGroupView(option.text);
  }

  public onChangeGroupName(newValue: string) {
    this.isDirty = true;
    this.setState({
      groupListName: newValue
    });
    if (this.state.isListPresent) {
      this.props.onChangeGroupListName(newValue);
    }
  }

  public onCreateGroupList(e) {
    this.setState({
      isButtonDisabled: true,
      isCreationInProgress: true
    });
    const { categoryListName, taskListName }  = TaskDataProvider.listNames;
    this.dataProvider.groupListCreation(this.state.groupListName)
      .then(
        (isGroupCreated) => {
          TaskDataProvider.listNames.groupListName = this.state.groupListName;
          if(isGroupCreated){
            const defaultGroup: IGroup = {
              Title:"All tasks group",
              SortOrder : 1.00000000001,
              IsDefault:true,
              key:"All tasks group",
              text:"All tasks group"
            };
            this.dataProvider.insertGroupItem(this.state.groupListName,defaultGroup)
            .then((insertGroupItem) => {
              if(insertGroupItem) {
                this.dataProvider.categoryMappingAfterGroup(categoryListName,defaultGroup.Title)
                .then(
                  (isCategorymapping) => {
                    if(isCategorymapping){
                      this.dataProvider.taskMappingAfterGroup(taskListName,defaultGroup.Title)
                      .then(
                        (isTaskMapping) => {
                          if(isTaskMapping){
                            this.setState({
                              isButtonDisabled: true,
                              creationSuccess: true,
                              isCreationInProgress: false
                            });
                            this.props.onChangeGroupListName(this.state.groupListName);
                            this.props.onEnableOrDisableGroup(true);
                          }
                        }).catch(() => {
                          this.setErrorState();
                        });
                    }
                  }).catch(() => {
                    this.setErrorState();
                  });
              }
            }).catch(() => {
              this.setErrorState();
            });
          } else {
              this.setErrorState();
          }
        }).catch(() => {
          this.setState({
            isButtonDisabled: true,
            isErrorOccured: true,
            isCreationInProgress: false
          });
        });
  }

  public setErrorState() {
    this.setState({
      isButtonDisabled: true,
      isErrorOccured: true,
      isCreationInProgress: false
    });
  }

  public onClearGroupData() {
    this.dataProvider.deleteList(this.props.groupListName)
      .then((isDeleted) => {
        if (isDeleted) {
          this.setState({
            isGroupingEnabled: false,
            isListPresent: false
          });
          this.props.onChangeGroupListName("");
          this.props.onEnableOrDisableGroup(false);
          this.props.onEnableOrDisableUniqueCategory(false);
        }
      });
  }

  public onCloseWarningDialog() {
      this.setState({
        showWarning: false
      });
  }

  public render() {
    const { isGroupingEnabled, isCategoryUniqueEnabled, selectedViewType, groupListName, showWarning, isErrorOccured, creationSuccess, isListPresent } = this.state;
    const groupViewTypes = TaskListConstants.groupViewTypes;
    if (isGroupingEnabled) {
      if (isErrorOccured) {
        return (<div>Something went wrong . Please try again alter</div>);
      } else {
        return (
          <React.Fragment>
            <div>
              {
                showWarning ? (
                  <Dialog
                    hidden={!showWarning}
                    onDismiss={this.onCloseWarningDialog.bind(this)}
                    dialogContentProps={{
                      type: DialogType.normal,
                      title: 'Warning',
                      subText: 'All the fields realated to the group will be erased. Do you still want to continue ?'
                    }}
                    modalProps={{
                      isBlocking: true,
                      containerClassName: 'ms-dialogMainOverride'
                    }}
                  >
                    <DialogFooter>
                      <PrimaryButton onClick={this.onClearGroupData.bind(this)} text="Continue" />
                      <DefaultButton onClick={this.onCloseWarningDialog.bind(this)} text="Cancel" />
                    </DialogFooter>
                  </Dialog>
                ) : null
              }
              <Toggle
                label="Enable groups"
                inlineLabel
                onText="On"
                offText="Off"
                checked={isGroupingEnabled}
                onChange={(e, checked) => this.enableOrDisableGroup(checked)} />
            </div>
            <div>
                <TextField
                minLength={1}
                 errorMessage={groupListName.trim().length === 0 && this.isDirty ? "Value is required" : ""}
                 label="Group list name"
                 value={this.state.groupListName}
                 onChange={(e, newValue) => { this.onChangeGroupName(newValue); }} />

                <PrimaryButton
                  style={{marginTop: '10px'}}
                  disabled={this.state.isButtonDisabled}
                  text={"Create list"}
                  onClick={this.onCreateGroupList.bind(this)}
                >
                  {
                    this.state.isCreationInProgress ? <Spinner size={SpinnerSize.medium} /> : null
                  }
                </PrimaryButton>
                <div style={{padding: "5px"}}>
                  {
                    creationSuccess ? (<strong style={{color: 'green'}}>Group list created successfully.Please reload the page to continue</strong>) : (isErrorOccured) ? (<strong style={{color: 'red'}}>Error occured during list creation</strong>) : null
                  }
                </div>

              </div>
            {
              isListPresent ? (
                  <div>
                    <div>
                      <Toggle
                        label="Make categories unique to groups"
                        inlineLabel
                        onText="On"
                        offText="Off"
                        checked={isCategoryUniqueEnabled}
                        onChange={(e, checked) => { this.enableOrDisableUniqueCategory(checked); }} />
                    </div>

                    <div>
                      <ChoiceGroup
                        defaultSelectedKey={selectedViewType}
                        label="Display as"
                        options={[
                          {
                            key: 'list',
                            iconProps: { iconName: 'BulletedList' },
                            text: groupViewTypes.list
                          },
                          {
                            key: 'tab',
                            iconProps: { iconName: 'TabTwoColumn' },
                            text: groupViewTypes.tab
                          },
                        ]}
                        onChange={(e, option) => this.onChangeGroupView(option)}
                      />
            </div>
            </div> ) : null }
          </React.Fragment>
        );
      }
    } else {
      return (
        <Toggle
          label="Enable Groups"
          inlineLabel
          onText="On"
          offText="Off"
          checked={isGroupingEnabled}
          onChange={(e, checked) => this.enableOrDisableGroup(checked)} />
      );
    }
  }
}
