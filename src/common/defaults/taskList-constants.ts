
import { IPropertyPaneDropdownOption } from "@microsoft/sp-property-pane";
import { IDoughnutChartData } from "../../interfaces/index";


export const TaskListConstants :
 {
   columns: IPropertyPaneDropdownOption[];
   expandByValues: IPropertyPaneDropdownOption[];
   groupViewTypes: {[key: string]: string},
   preventGroupDeletionText: string,
   preventCategoryDeletionText: string;
   preventStatusDeletionText: string,
   preventResponsibleDeletionText: string,
   errorMessages : {
     saveProgress: string,
     saveSuccess: string,
     saveError: string,
     updateSuccess: string,
     deleteSuccess: string;
     deleteError: string,
     sortSuccess: string,
     sortError: string,
     noDataFound : string
    },
    chartData: IDoughnutChartData,

  } =
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
    preventCategoryDeletionText: "This category has sub categories associated with it.You must remove the relationship between the category",
    preventStatusDeletionText: "This status has categories associated with it.You must remove the relationship between the status",
    preventResponsibleDeletionText: "This responsible has categories associated with it.You must remove the relationship between the responsible",
    errorMessages: {
      saveProgress: "Saving...",
      saveSuccess: "Saved successfully",
      saveError: "Error occured while saving",
      updateSuccess: "Updated successfully",
      deleteSuccess: "Deleted successfully",
      deleteError: "Error occured while deletion",
      sortSuccess: "Sorted successfully",
      sortError: "Error occured while sorting",
      noDataFound:"No data found"
    },
    chartData: {
      datasets : [{
        data:[10,20,30,40,10],
        backgroundColor: [
          '#CCC',
          '#36A2EB',
          '#FFCE56',
          'skyblue',
          'antiquewhite'
        ],
        hoverBackgroundColor:[
          '#CCC',
          '#36A2EB',
          '#FFCE56',
          'skyblue',
          'antiquewhite'
        ]
      }],
      labels: [
        'Lender Coursel',
        'Borrower Coursel',
        'Lender',
        'Third Party',
        'Responsible Party'
      ],
    },

};

