import { ICategory } from "../../interfaces/index";


export const TaskListConstants :
 { 
   categories: ICategory[], 
   groupViewTypes: {[key: string]: string}, 
   preventGroupDeletionText: string,
   saveProgressMessage: string, 
   successMessage: string, 
   errorMessage: string,
   updateMessage: string
  } = 
   {
    categories : [
      {
        key : 'LOAN DOCUMENTS',
        text : 'LOAN DOCUMENTS',
        CategorySort: 1,
        Group:  {
          Id: 1,
          Title: ''
        },
        ID: 1,
        Title : 'LOAN DOCUMENTS',
        children: []
      },
      {
        key : 'Organizational Documents',
        text : 'Organizational Documents',
        CategorySort: 2,
        Group:  {
          Id: 2,
          Title: ''
        },
        ID: 2,
        Title : 'Organizational Documents',
        children: []
      },
      {
        key : 'Title and Survey',
        text : 'Title and Survey',
        CategorySort: 3,
        Group:  {
          Id: 3,
          Title: ''
        },
        ID: 3,
        Title : 'Title and Survey',
        children: []
      },
      {
        key : 'Others',
        text : 'Others',
        CategorySort: 4,
        Group:  {
          Id: 4,
          Title: ''
        },
        ID: 4,
        Title : 'Others',
        children: []
      }
    ],
    groupViewTypes: {
      list : "list",
      tab : 'tab'
    },
    preventGroupDeletionText: "This group has categories associated with it.You must remove the relationship between the group",
    saveProgressMessage: 'Saving...',
    errorMessage: 'Error Occurred',
    successMessage: 'Saved successfully',
    updateMessage: 'Updated successfully'
};
