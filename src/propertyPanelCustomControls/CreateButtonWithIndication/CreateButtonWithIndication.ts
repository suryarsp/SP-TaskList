import * as React from "react";
import * as ReactDom from "react-dom";
import {
	IPropertyPaneField,
	PropertyPaneFieldType
} from "@microsoft/sp-webpart-base";

import ProgressButton from "./ProgressButton/ProgressButton";
import {
	ICreateButtonWithIndicationProps,
	ICreateButtonWithIndicationInternalProps,
	IProgressButtonProps
} from "../../interfaces/index";

export class CreateButtonWithIndication
	implements IPropertyPaneField<ICreateButtonWithIndicationProps> {
	public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
	public targetProperty: string;
	public properties: ICreateButtonWithIndicationInternalProps;
	private elem: HTMLElement;

	constructor(
		targetProperty: string,
		properties: ICreateButtonWithIndicationProps
	) {
		this.targetProperty = targetProperty;
		this.properties = {
			 key: properties.label,
			label: properties.label,
      onRender: this.onRender.bind(this),
      taskListName: properties.taskListName,
      groupListName: properties.groupListName,
      categoryListName: properties.categoryListName,
      responsibleListName: properties.responsibleListName,
      statusListName: properties.statusListName,
      commentsListName: properties.commentsListName,
      libraryName: properties.libraryName
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
			IProgressButtonProps
		> = React.createElement(ProgressButton, {
      text: this.properties.label,
      taskListName: this.properties.taskListName,
      groupListName: this.properties.groupListName,
      categoryListName: this.properties.categoryListName,
      responsibleListName: this.properties.responsibleListName,
      statusListName: this.properties.statusListName,
      commentsListName: this.properties.commentsListName,
      libraryName: this.properties.libraryName
		});
		ReactDom.render(element, elem);
	}
}
