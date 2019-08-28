import * as React from "react";
import { IGroupingCustomizationProps, IGroupingCustomizationState } from '../../../interfaces/index';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { TaskListConstants } from "../../../common/defaults/taskList-constants";

export default class GroupingCustomization extends React.Component<IGroupingCustomizationProps, IGroupingCustomizationState
  > {

  constructor(props: IGroupingCustomizationProps) {
    super(props);
    console.log(props);
    this.state = {
      isCategoryUniqueEnabled: props.isCategoryUniqueEnabled,
      isGroupingEnabled: props.isGroupingEnabled,
      selectedViewType: props.selectedViewType
    };
  }

  public enableOrDisableGroup(checked: boolean) {
    this.setState({
      isGroupingEnabled: checked
    });
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

  public render() {
    const { isGroupingEnabled, isCategoryUniqueEnabled, selectedViewType } = this.state;
    const groupViewTypes = TaskListConstants.groupViewTypes;
    if (isGroupingEnabled) {
      return (
        <React.Fragment>
          <div>
            <Toggle
              label="Enable groups"
              inlineLabel
              onText="On"
              offText="Off"
              checked={isGroupingEnabled}
              onChange={(e, checked) => this.enableOrDisableGroup(checked)} />
          </div>

          <div>
            <Toggle
              label="Make categories unique to groups"
              inlineLabel
              onText="On"
              offText="Off"
              checked={isCategoryUniqueEnabled}
              onChange={(e, checked) => this.enableOrDisableUniqueCategory(checked)} />
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
        </React.Fragment>

      );
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
