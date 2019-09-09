import * as React from "react";
import { IGroupingCustomizationProps, IGroupingCustomizationState, IDataProvider } from '../../../interfaces/index';
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
  constructor(props: IGroupingCustomizationProps) {
    super(props);
    this.state = {
      isCategoryUniqueEnabled: props.isCategoryUniqueEnabled,
      isGroupingEnabled: props.isGroupingEnabled,
      selectedViewType: props.selectedViewType,
      groupListName: props.groupListName,
      isButtonDisabled: false,
      isCreationInProgress: true,
      showWarning: true,
      creationSuccess: false,
      isErrorOccured: false
    };
  }

    public componentDidMount() {
      this.dataProvider = TaskDataProvider.Instance;
      this.dataProvider.listExists(this.props.groupListName).then((isPresent) => {
        if(isPresent) {
          this.setState({
            isButtonDisabled: true
          });
        }

      }).catch(() => {
        this.setState({
         isErrorOccured: true
        });
      });
    }

  public enableOrDisableGroup(checked: boolean) {
    this.setState({
      isGroupingEnabled: checked
    });
    // show alert before disabling
    this.props.onEnableOrDisableGroup(checked);

    if (!checked) {
      this.props.onEnableOrDisableUniqueCategory(false);
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
    this.setState({
        groupListName: newValue
    });
  }

  public onCreateGroupList(e) {
    this.setState({
      isButtonDisabled: true,
      isCreationInProgress: true
    });
    this.dataProvider.groupListCreation(this.state.groupListName)
    .then((isCreated) => {
      this.setState({
        isButtonDisabled: true,
        creationSuccess: true,
        isCreationInProgress: false
      });
    })
    .catch(() => {
      this.setState({
        isButtonDisabled: true,
        isErrorOccured: true,
        isCreationInProgress: false
      });
    });
  }

  public onClearGroupData() {

  }

  public onCloseWarningDialog() {

  }

  public render() {
    const { isGroupingEnabled, isCategoryUniqueEnabled, selectedViewType, groupListName, showWarning , isErrorOccured, creationSuccess} = this.state;
    const groupViewTypes = TaskListConstants.groupViewTypes;
    if (isGroupingEnabled) {
      if(isErrorOccured) {
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
                ): null
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
            <TextField minLength={1} errorMessage={ groupListName.trim().length === 0 ? "Value is required": ""} label="Group list name" value = { this.props.groupListName} onChange={(e, newValue) => { this.onChangeGroupName(newValue);}} />
            <PrimaryButton
            disabled={this.state.isButtonDisabled}
            text={"Create list"}
            onClick={this.onCreateGroupList.bind(this)}
          >
            {
            this.state.isCreationInProgress ? <Spinner size={SpinnerSize.medium} /> : null
            }
          </PrimaryButton>
            </div>
              {
                creationSuccess ? (<strong>Group list created successfully.Please reload the page to continue</strong>) : (isErrorOccured) ? (<div>Error occured during list creation</div>) : null
              }

            <div>
              <Toggle
                label="Make categories unique to groups"
                inlineLabel
                onText="On"
                offText="Off"
                checked={isCategoryUniqueEnabled}
                onChange={(e, checked) => {this.enableOrDisableUniqueCategory(checked);}} />
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
               );
            </div>
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
