export interface ITaskListWebPartProps {
  taskListName: string;
  commentsListName: string;
  defaultTaskCategory: string;
  alwaysDownloadAllDocuments: boolean;
  itemsPerPage: number;
  isGroupingEnabled: boolean;
  isCategoryUniqueEnabled: boolean;
  selectedViewType: string;
  groupListName: string;
  categoryListName: string;
  statusListName: string;
  responsibleListName: string;
  libraryName: string;
}
