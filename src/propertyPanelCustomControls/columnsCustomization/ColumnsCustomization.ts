import * as React from "react";
import * as ReactDom from "react-dom";
import {
	IPropertyPaneField,
	PropertyPaneFieldType
} from "@microsoft/sp-webpart-base";

import { IColumnsCustomizationProps, IColumnsCustomizationInternalProps, IDynamicColumnProps } from "../../interfaces";
import DynamicColumns from './dynamicColumns/DynamicColumns';

export class ColumnsCustomization
	implements IPropertyPaneField<IColumnsCustomizationProps> {
	public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
	public targetProperty: string;
	public properties: IColumnsCustomizationInternalProps;
	private elem: HTMLElement;

	constructor(
		targetProperty: string,
		properties: IColumnsCustomizationProps
	) {
		this.targetProperty = targetProperty;
		this.properties = {
      key: 'dynamicColumns',
      onRender: this.onRender.bind(this),
      taskListName: properties.taskListName,
      displayedColumns: properties.displayedColumns,
      onChangeColumns : properties.onChangeColumns.bind(this)
		};
	}
	public componentWillReceiveProps(props) {}
	public render(): void {
		if (!this.elem) {
			return;
		}
		this.onRender(this.elem);
	}

	private onRender(elem: HTMLElement): void {
		if (!this.elem) {
			this.elem = elem;
		}
		const element: React.ReactElement<
			IDynamicColumnProps
		> = React.createElement(DynamicColumns, {
      taskListName: this.properties.taskListName,
      displayedColumns: this.properties.displayedColumns,
      onChangeColumns: this.properties.onChangeColumns.bind(this)
		});
		ReactDom.render(element, elem);
	}
}
