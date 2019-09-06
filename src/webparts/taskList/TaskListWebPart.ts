import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, PropertyPaneChoiceGroup, PropertyPaneDropdown } from '@microsoft/sp-webpart-base';
import { PropertyFieldNumber } from "@pnp/spfx-property-controls/lib/PropertyFieldNumber";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneLabel,
  PropertyPaneToggle,
  PropertyPaneCheckbox,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';

import * as strings from 'TaskListWebPartStrings';
import TaskList from './components/TaskList';
import { ITaskListProps, ITaskListWebPartProps } from '../../interfaces/index';
import { TaskListConstants } from '../../common/defaults/taskList-constants';
import { TaskGroupingControlComponent } from '../../propertyPanelCustomControls/taskGroupingControl/TaskGroupingControl';
import TaskDataProvider from '../../services/TaskDataProvider';
import { CreateButtonWithIndication } from '../../propertyPanelCustomControls/CreateButtonWithIndication/CreateButtonWithIndication';
require('../../styles/main.css');

export default class TaskListWebPart extends BaseClientSideWebPart<ITaskListWebPartProps> {

  public render(): void {
    TaskDataProvider.context = this.context;
    const element: React.ReactElement<ITaskListProps> = React.createElement(
      TaskList, {
      taskListName: this.properties.taskListName,
      commentsListName: this.properties.commentsListName,
      defaultTaskCategory: this.properties.defaultTaskCategory,
      alwaysDownloadAllDocuments: this.properties.alwaysDownloadAllDocuments,
      itemsPerPage: this.properties.itemsPerPage,
      isGroupingEnabled: this.properties.isGroupingEnabled,
      isCategoryUniqueEnabled: this.properties.isCategoryUniqueEnabled,
      selectedViewType: this.properties.selectedViewType,
      groupListName: this.properties.groupListName,
      categoryListName: this.properties.categoryListName,
      statusListName: this.properties.statusListName,
      responsibleListName: this.properties.responsibleListName,
      libraryName: this.properties.libraryName,
    }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private validateTextField(value: string): string {
    if (value === null ||
      value.trim().length === 0) {
      return 'Value is required';
    }

    return '';
  }

  public onEnableOrDisableGroup(checked: boolean) {
    this.properties.isGroupingEnabled = checked;
  }

  public onEanbleOrDisableUniqueCategory(checked: boolean) {
    this.properties.isCategoryUniqueEnabled = checked;
  }

  public onChangeGroupView(type: string) {
    this.properties.selectedViewType = type;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Task List Configuration"
          },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('taskListName', {
                  label: "Task list name",
                  onGetErrorMessage: this.validateTextField.bind(this),
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyPaneTextField('commentsListName', {
                  label: "Comments list name",
                  onGetErrorMessage: this.validateTextField.bind(this)
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),


                PropertyPaneTextField('groupListName', {
                  label: "Group list name",
                  onGetErrorMessage: this.validateTextField.bind(this)
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyPaneTextField('categoryListName', {
                  label: "Category list name",
                  onGetErrorMessage: this.validateTextField.bind(this)
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyPaneTextField('statusListName', {
                  label: "Status list name",
                  onGetErrorMessage: this.validateTextField.bind(this)
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyPaneTextField('responsibleListName', {
                  label: "Responsbile party list name",
                  onGetErrorMessage: this.validateTextField.bind(this)
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyPaneTextField('libraryName', {
                  label: "Library name",
                  onGetErrorMessage: this.validateTextField.bind(this)
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                new CreateButtonWithIndication("createList", {
                  label: "Create List",
                  taskListName: this.properties.taskListName,
                  commentsListName: this.properties.commentsListName,
                  groupListName: this.properties.groupListName,
                  categoryListName: this.properties.categoryListName,
                  responsibleListName: this.properties.responsibleListName,
                  statusListName: this.properties.statusListName,
                  libraryName: this.properties.libraryName
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyPaneDropdown('defaultTaskCategory', {
                  label: 'Default Task Category',
                  options: TaskListConstants.categories,
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyPaneCheckbox('alwaysDownloadAllDocuments', {
                  text: "Always download files",
                  checked: false
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                PropertyFieldNumber("itemsPerPage", {
                  key: "numberOfItems",
                  label: "No of tasks to be displayed per page",
                  value: this.properties.itemsPerPage,
                  placeholder: "Enter the value",
                  minValue: 10,
                  maxValue: 25,
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),

                new TaskGroupingControlComponent('groupControl', {
                  isGroupingEnabled: this.properties.isGroupingEnabled,
                  isCategoryUniqueEnabled: this.properties.isCategoryUniqueEnabled,
                  selectedViewType: this.properties.selectedViewType,
                  onEnableOrDisableGroup: this.onEnableOrDisableGroup.bind(this),
                  onEnableOrDisableUniqueCategory: this.onEanbleOrDisableUniqueCategory.bind(this),
                  onChangeGroupView: this.onChangeGroupView.bind(this)
                }),

                PropertyPaneLabel("Blank", {
                  text: ""
                }),


              ]
            }
          ]
        }
      ]
    };
  }
}
