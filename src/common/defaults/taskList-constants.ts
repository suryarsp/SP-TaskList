import { ICategory } from '../../interfaces/propertyPane/ICategory';

export const TaskListConstants : { categories: ICategory[], groupViewTypes: {[key: string]: string} } = {
    categories : [
      {
        key : 'LOAN DOCUMENTS',
        text : 'LOAN DOCUMENTS',
      },
      {
        key : 'Organizational Documents',
        text : 'Organizational Documents',
      },
      {
        key : 'Title and Survey',
        text : 'Title and Survey',
      },
      {
        key : 'Others',
        text : 'Others',
      }
    ],
    groupViewTypes: {
      list : "list",
      tab : 'tab'
    }
};
