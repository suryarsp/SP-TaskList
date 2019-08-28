export interface ITaskListProps {
  taskListName: string;
  commentsListName: string;
  defaultTaskCategory: string;
  alwaysDownloadAllDocuments: boolean;
  itemsPerPage: number;
  isGroupingEnabled: boolean;
  isCategoryUniqueEnabled: boolean;
  selectedViewType: string;
}
