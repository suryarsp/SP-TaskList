import * as React from "react";
import {
     ITaskCommandBarProps,
     ITaskCommandBarState} from "../../../../interfaces/index";
import { CommandBar, ICommandBarItemProps } from "office-ui-fabric-react/lib/CommandBar";
import { PermissionKind } from "sp-pnp-js";
import styles from './TaskCommandBar.module.scss';


export  class TaskCommandBar extends React.Component<
     ITaskCommandBarProps,
     ITaskCommandBarState
     > {
     constructor(props) {
          super(props);
     }

     public componentDidMount() {
     }

     public getItems(): ICommandBarItemProps[] {
          let commands: ICommandBarItemProps[] = [];
          let newTask = {
               key: "NewTask",
               name: "New Task",
               onClick: () => {
                    this.props.onClickNew();
               },
               iconProps: {
                    iconName: "Add"
               }
          };

          // let editTask = {
          //      key: "EditTask",
          //      name: "Edit Task",
          //      onClick: () => {
          //           this.props.onClickEdit();
          //      },
          //      iconProps: {
          //           iconName: "Edit"
          //      }
          // };



          let uploadTaskList = {
               key: "uploadTaskList",
               name: "Upload Tasklist",
              //  disabled: this.props.selectedItem ? !(this.props.selectedItem.Documents.length > 0) : true,
               onClick: () => {
                    this.props.onClickUploadTaskList();
               },
               iconProps: {
                    iconName: "Upload"
               }
          };

          let exportToPdf = {
               key: "ExporToPdf",
               name: "Export To PDF",
               onClick: () => {
                    this.props.onClickExportToPdf();
               },
               iconProps: {
                    iconName: "PDF"
               }
          };

          let alertMe = {
               key: "AlertMe",
               name: "Alert Me",
               onClick: () => this.props.onClickAlertMe(),
               iconProps: {
                    iconName: "Ringer"
               }
          };

          let manageAlerts = {
               key: "ManageMyAlerts",
               name: "Manage my Alerts",
               onClick: () => this.props.onClickManageMyAlerts(),
               iconProps: {
                    iconName: "EditNote"
               }
          };

          let deleteCommand = {
               key: "delete",
               name: "Delete Task",
               onClick: () => {
                    this.props.onClickDelete();
               },
               iconProps: {
                    iconName: "Delete"
               }
          };

          // if (this.props.listPermissions.length === 0)
          //      return [];

          // let canManageList = this.props.listPermissions.filter(item => item.permission == PermissionKind.ManageLists)[0].allowed;
          // let canAddItem = this.props.listPermissions.filter(item => item.permission == PermissionKind.AddListItems)[0].allowed;
          // let canEditItem = this.props.listPermissions.filter(item => item.permission == PermissionKind.EditListItems)[0].allowed;
          // let canApproveItem = this.props.listPermissions.filter(item => item.permission == PermissionKind.ApproveItems)[0].allowed;
          // let canDeleteItem = this.props.listPermissions.filter(item => item.permission == PermissionKind.DeleteListItems)[0].allowed;
          // let canViewItem = this.props.listPermissions.filter(item => item.permission == PermissionKind.ViewListItems)[0].allowed;
          // if ((this.props.isAllItemsSelected ||
          //      this.props.selectedCount > 1) &&
          //      this.props.totalItemCount !== 1
          // ) {
          //      if (canViewItem) {
          //           //if (!(isMobile && isChrome)) {
          //                commands.push(exportToPdf);
          //           //}
          //      }
          //      if (canDeleteItem || canManageList) {
          //           commands.push(deleteCommand);
          //      }
          // }
          // else if (this.props.selectedCount === 1) {
          //      if(this.props.selectedItem) {
          //           if (this.props.selectedItem.Documents.length > 0) {
          //                if (canEditItem || canApproveItem || canManageList) {
          //                     commands.push(editTask);
          //                }
          //                if (canDeleteItem || canManageList) {
          //                     commands.push(deleteCommand);
          //                }
          //                if (canEditItem || canApproveItem || canManageList) {
          //                     commands.push(moveToCategory);
          //                }
          //                if (canViewItem || canEditItem || canApproveItem || canManageList) {
          //                     if (!(isMobile && isChrome)) {
          //                          commands.push(downloadDocuments);
          //                     }
          //                }
          //                //if (!(isMobile && isChrome)) {
          //                     commands.push(exportToPdf);
          //                //}
          //                commands.push(
          //                     alertMe,
          //                     manageAlerts
          //                );
          //           } else {
          //                if (canEditItem || canApproveItem || canManageList) {
          //                     commands.push(editTask);
          //                }
          //                if (canViewItem || canEditItem || canApproveItem || canDeleteItem || canManageList) {
          //                     commands.push(deleteCommand);
          //                     if (!(isMobile && isChrome)) {
          //                          commands.push(downloadDocuments);
          //                     }
          //                }
          //                if (canEditItem || canApproveItem || canManageList) {
          //                     commands.push(moveToCategory);
          //                }
          //                //if (!(isMobile && isChrome)) {
          //                     commands.push(exportToPdf);
          //                //}
          //                commands.push(
          //                     alertMe,
          //                     manageAlerts
          //                );
          //           }
          //      }
          // } else {
          //      if (canAddItem || canManageList) {
          //           commands.push(newTask);
          //      }
          //      if (canViewItem) {
          //           //if (!(isMobile && isChrome)) {
          //                commands.push(exportToPdf);
          //           //}
          //      }
          //      commands.push(alertMe, manageAlerts);
          // }
          commands.push( newTask, exportToPdf, uploadTaskList, alertMe, manageAlerts);
          return commands;
     }

     public getFarItems(): ICommandBarItemProps[] {
          const farItems: ICommandBarItemProps[] = [];
          let cancelSelection = {
               key: 'Selected',
               name: this.props.selectedCount + ' selected',
               onClick: this.props.onCancelSelection.bind(this),
               iconProps: {
                    iconName: 'Cancel'
               }
          };
          let refresh = {
               key: 'Refresh',
               name: 'Refresh',
               //iconOnly: true,
               iconProps: {
                    iconName: 'sync',
               },
               onClick: this.props.onRefreshPage.bind(this)
          };

          // if (this.props.selectedCount > 0) {
          //      farItems.push(cancelSelection, refresh);
          // } else {
          //      farItems.push(refresh);
          // }

          return farItems;
     }

     public render(): React.ReactElement<ITaskCommandBarProps> {
          return (
               <div className={styles.commandbarWrapper}>
                    <CommandBar
                         items={this.getItems()}
                         farItems={this.getFarItems()} />
               </div>
          );
     }
}

