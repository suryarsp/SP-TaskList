import { ICustomizedColumn } from "../propertyPane/columnsCustomization/ICustomizedColumn";
import { IColumn } from "../services/response/IColumn";

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
  minNoOfItemsForStream: number;
  defaultExpand: string;
  displayedColumns: IColumn[];
}
