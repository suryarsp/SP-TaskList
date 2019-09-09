import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
     IPropertyPaneField,
     PropertyPaneFieldType
} from '@microsoft/sp-webpart-base';
import { ITaskGroupingControlComponentProps, IGroupingCustomizationProps, ITaskGroupingControlInternalProps } from '../../interfaces/index';

import GroupingCustomization from '../taskGroupingControl/groupingCustomization/GroupingCustomization';

export class TaskGroupingControlComponent implements IPropertyPaneField<ITaskGroupingControlComponentProps> {
     public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
     public targetProperty: string;
     public properties: ITaskGroupingControlInternalProps;
     private elem: HTMLElement;

     constructor(targetProperty: string,  properties:  ITaskGroupingControlComponentProps) {
          this.targetProperty = targetProperty;
          this.properties = {
               key: 'statusCode',
               onRender: this.onRender.bind(this),
               isGroupingEnabled: properties.isCategoryUniqueEnabled,
               isCategoryUniqueEnabled: properties.isCategoryUniqueEnabled,
               selectedViewType: properties.selectedViewType,
               onEnableOrDisableGroup: properties.onEnableOrDisableGroup,
               onEnableOrDisableUniqueCategory: properties.onEnableOrDisableUniqueCategory,
               onChangeGroupView: properties.onChangeGroupView,
               groupListName: properties.groupListName
          };
     }

     public render(): void {
          if (!this.elem) { return; }
          this.onRender(this.elem);
     }

     private onRender(elem: HTMLElement): void {
          if (!this.elem) {
               this.elem = elem;
      }
          const element: React.ReactElement<IGroupingCustomizationProps> = React.createElement(GroupingCustomization, {
            isGroupingEnabled: this.properties.isCategoryUniqueEnabled,
            isCategoryUniqueEnabled: this.properties.isCategoryUniqueEnabled,
            selectedViewType: this.properties.selectedViewType,
            onEnableOrDisableGroup: this.properties.onEnableOrDisableGroup,
            onEnableOrDisableUniqueCategory: this.properties.onEnableOrDisableUniqueCategory,
            onChangeGroupView: this.properties.onChangeGroupView,
            groupListName: this.properties.groupListName
          });
          setTimeout(() => {
               ReactDom.render(element, elem);
          }, 500);
     }
}
