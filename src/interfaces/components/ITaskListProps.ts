
export interface ITaskListProps {
  defaultTaskCategory: string;
  alwaysDownloadAllDocuments: boolean;
  itemsPerPage: number;
  isGroupingEnabled: boolean;
  isCategoryUniqueEnabled: boolean;
  selectedViewType: string;
  // List Names
  taskListName: string;
  commentsListName: string;
  groupListName: string;
  categoryListName: string;
  statusListName: string;
  responsibleListName: string;
  libraryName: string;
  minNoOfItemsForStream: number;
  defaultExpand: string;
}
