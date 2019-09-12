import * as React from "react";
import {
     ITaskCommandBarProps,
     ITaskCommandBarState } from "../../../../../interfaces/index";
import { CommandBar, ICommandBarItemProps } from "office-ui-fabric-react/lib/CommandBar";
import styles from './TaskCommandBar.module.scss';
import { IPermissions } from "../../../../../services/index";
import TaskDataProvider from "../../../../../services/TaskDataProvider";
import { PermissionKind } from "sp-pnp-js";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import  NewTaskPanel  from './slideOutPanels/newTaskPanel/NewTaskPanel';
import  EditTaskPanel  from './slideOutPanels/editTaskPanel/EditTaskPanel';
import  GroupSettingsPanel  from './slideOutPanels/groupSettingsPanel/GroupSettingsPanel';
import  CategorySettingsPanel  from './slideOutPanels/categorySettingsPanel/CategorySettingsPanel';
import  ResponsiblePartySettingsPanel  from './slideOutPanels/responsiblePartySettingsPanel/ResponsiblePartySettingsPanel';
import  StatusSettingsPanel  from './slideOutPanels/statusSettingsPanel/StatusSettingsPanel';

const CommandTypes = {
     NewTask: "NewTask",
     EditTask: "EditTask",
     DeleteTaskConfirmation : "DeleteTaskConfirmation",
     PdfExportInProgress: "PdfExportInProgress",
     GroupSettings: "GroupSettings",
     CategorySettings: "CategorySettings",
     StatusSettings: "StatusSettings",
     ResponsiblePartySettings: "ResponsiblePartySettings",
     None: "None"
};
export  class TaskCommandBar extends React.Component<
     ITaskCommandBarProps,
     ITaskCommandBarState
     > {

    private listPermissions: IPermissions[] = [];
    private libraryPermissions: IPermissions[]= [];

     constructor(props) {
          super(props);
          this.state = {
            currentCommandType : CommandTypes.None
          };
     }

     public componentDidMount() {
       this.listPermissions = TaskDataProvider.listPermissions;
       this.libraryPermissions = TaskDataProvider.libraryPermissions;
     }

     public onCLickNewTask() {
       this.setState({
         currentCommandType: CommandTypes.NewTask
       });
     }

     public onClickEditTask() {
       this.setState({
         currentCommandType: CommandTypes.EditTask
       });
     }

     public uploadTaskList() {
     }

     public exportToPDF() {
     }

     public onClickAlertMe() {
     }

     public onClickManageMyAlerts() {
     }

     public onClickGroupSettings() {
       this.setState({
         currentCommandType: CommandTypes.GroupSettings
       });
     }

     public onClickCategorySettings() {
      this.setState({
        currentCommandType: CommandTypes.CategorySettings
      });
     }

     public onClickStatusSettings() {
      this.setState({
        currentCommandType: CommandTypes.StatusSettings
      });
     }

     public onClickPartySetings() {
      this.setState({
        currentCommandType: CommandTypes.ResponsiblePartySettings
      });
     }

     public getItems(): ICommandBarItemProps[] {
          let commands: ICommandBarItemProps[] = [];
          let newTask = {
               key: "NewTask",
               name: "New",
               onClick: () => {
                  this.onCLickNewTask();
               },
               iconProps: {
                    iconName: "Add"
               }
          };

          let editTask = {
               key: "EditTask",
               name: "Edit",
               onClick: () => {
                    this.onClickEditTask();
               },
               iconProps: {
                    iconName: "Edit"
               }
          };



          let uploadTaskList = {
               key: "uploadTaskList",
               name: "Upload Tasklist",
              //  disabled: this.props.selectedItem ? !(this.props.selectedItem.Documents.length > 0) : true,
               onClick: () => {
                    this.uploadTaskList();
               },
               iconProps: {
                    iconName: "Upload"
               }
          };

          let exportToPdf = {
               key: "ExporToPdf",
               name: "Export To PDF",
               onClick: () => {

               },
               iconProps: {
                    iconName: "PDF"
               }
          };

          let alertMe = {
               key: "AlertMe",
               name: "Alert Me",
               onClick: () => {{ this.onClickAlertMe();}},
               iconProps: {
                    iconName: "Ringer"
               }
          };

          let manageAlerts = {
               key: "ManageMyAlerts",
               name: "Manage my Alerts",
               onClick: () => {{ this.onClickManageMyAlerts();}},
               iconProps: {
                    iconName: "EditNote"
               }
          };

          let deleteCommand = {
               key: "delete",
               name: "Delete",
               onClick: () => {
                    this.props.onClickDelete();
               },
               iconProps: {
                    iconName: "Delete"
               }
          };

          let groupSettings = {
            key: 'groups',
            onClick: () => {{this.onClickGroupSettings();}},
            text: "Groups",
            iconProps: {
              iconName: 'RowsGroup'
            },
          };

          let categorySettings = {
            key: 'category',
            onClick: () => {{this.onClickCategorySettings();}},
            text: "Categories",
            iconProps: {
              iconName: 'ViewListGroup'
            },
          };

          let statusSettings = {
            key: 'status',
            onClick: () => {{this.onClickStatusSettings();}},
            text: "Statuses",
            iconProps: {
              iconName: 'CheckMark'
            },
          };

          let partySettings = {
            key: 'parties',
            onClick: () => {{ this.onClickPartySetings();}},
            text: "Responsible Party",
            iconProps: {
              iconName: 'ContactInfo'
            },
          };


          let adminSettings: IContextualMenuItem  = {
            key: "adminSettings",
            name: "Admin Settings",
            onClick: () => {{}},
            iconProps: {
                 iconName: "PlayerSettings"
            },
            subMenuProps: {
                items : [
                  groupSettings, categorySettings, statusSettings, partySettings
                ]
            }

       };

          // if (this.listPermissions.length === 0 || this.libraryPermissions.length === 0) {
          //   return [];
          // }


          // let canManageList = this.listPermissions.filter(item => item.permission == PermissionKind.ManageLists)[0].allowed;
          // let canAddItem = this.listPermissions.filter(item => item.permission == PermissionKind.AddListItems)[0].allowed;
          // let canEditItem = this.listPermissions.filter(item => item.permission == PermissionKind.EditListItems)[0].allowed;
          // let canApproveItem = this.listPermissions.filter(item => item.permission == PermissionKind.ApproveItems)[0].allowed;
          // let canDeleteItem = this.listPermissions.filter(item => item.permission == PermissionKind.DeleteListItems)[0].allowed;
          // let canViewItem = this.listPermissions.filter(item => item.permission == PermissionKind.ViewListItems)[0].allowed;
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
          commands.push( newTask, editTask, deleteCommand, exportToPdf, uploadTaskList, alertMe, manageAlerts, adminSettings);
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

     private hidePanel(isDirty: boolean) {
       console.log(isDirty);
       this.setState({
         currentCommandType: CommandTypes.None
       });
     }

     public render(): React.ReactElement<ITaskCommandBarProps> {
       let commands: JSX.Element = null;
       let { currentCommandType} = this.state;
       switch(currentCommandType) {

        case CommandTypes.NewTask : {
           commands=  <NewTaskPanel
                        hidePanel = { this.hidePanel.bind(this).bind(this)}
                       />;
          break;
        }

        case CommandTypes.EditTask: {
           commands = <EditTaskPanel
                       hidePanel = { this.hidePanel.bind(this)}
                      />;
          break;
        }

        case CommandTypes.DeleteTaskConfirmation: {
          break;
        }

        case CommandTypes.PdfExportInProgress : {
          break;
        }

        case CommandTypes.GroupSettings : {
          commands = <GroupSettingsPanel
                      hidePanel = { this.hidePanel.bind(this)}
                     />;
          break;

        }

        case CommandTypes.CategorySettings: {
          commands = <CategorySettingsPanel
                       hidePanel = { this.hidePanel.bind(this)}
                       uniqueToGroupEnabled = { this.props.uniqueToGroupEnabled}
                      />;
          break;
        }

        case CommandTypes.StatusSettings: {
          commands = <StatusSettingsPanel
                      hidePanel = { this.hidePanel.bind(this)}
                     />;
          break;
        }

        case CommandTypes.ResponsiblePartySettings : {
          commands = <ResponsiblePartySettingsPanel
                     hidePanel = { this.hidePanel.bind(this)}
                     />;
          break;
        }
       }
          return (
               <div className={styles.commandbarWrapper}>
                    <CommandBar
                         items={this.getItems()}
                         farItems={this.getFarItems()} />
                         { commands }
               </div>

          );
     }
}

