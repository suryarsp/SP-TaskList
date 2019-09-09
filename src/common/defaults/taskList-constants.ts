
import { IPropertyPaneDropdownOption } from "@microsoft/sp-property-pane";


export const TaskListConstants :
 {
   columns: IPropertyPaneDropdownOption[];
   expandByValues: IPropertyPaneDropdownOption[];
   groupViewTypes: {[key: string]: string},
   preventGroupDeletionText: string,
   errorMessages : {
     saveProgress: string,
     saveSuccess: string,
     saveError: string,
     updateSuccess: string,
     deleteSuccess: string;
     deleteError: string
      }} =
   {
    columns : [
      {
        key: 'Sort',
        text: 'Sort'
      },
      {
        key: 'TaskName',
        text: 'TaskName'
      },
      {
        key: 'Paty',
        text: 'Responsible Party / Status'
      },
    ],
    expandByValues: [
      {
        key: 'Group',
        text: 'Group'
      },
      {
        key: 'Category',
        text: 'Category'
      },
      {
        key: 'SubCategory',
        text: 'Sub category'
      },
      {
        key: 'Task',
        text: 'Task'
      },
    ],
    groupViewTypes: {
      list : "list",
      tab : 'tab'
    },
    preventGroupDeletionText: "This group has categories associated with it.You must remove the relationship between the group",
    errorMessages: {
      saveProgress: "Saving...",
      saveSuccess: "Saved successfully",
      saveError: "Error occured while saving",
      updateSuccess: "Updated successfully",
      deleteSuccess: "Deleted successfully",
      deleteError: "Error occured while deletion"
    }
};


// private groupListView = ['Item', 'Title', 'GroupSort', 'IsDefault', 'ID', 'Created', 'Editor', 'Modified'];
// private responsibleListView = ['Item', 'Title', 'FontColor', 'FillColor', 'ID', 'Created', 'Editor', 'Modified'];
// private statusListView = ['Item', 'Title', 'StatusSort','FontColor', 'FillColor', 'ID', 'Created', 'Editor', 'Modified'];
// private categoryListView = ['Item', 'Title', 'CategorySort','Parent', 'Group', 'ID', 'Created', 'Editor', 'Modified'];
// private commentsListView = ['Item', 'Title', 'Comment','Task', 'Created', 'Editor', 'Modified'];
// private taskListView = ['Item', 'Title', 'TaskSort','Parent', 'Group','Category', 'Status','Document','ID', 'Created', 'Editor', 'Modified'];

