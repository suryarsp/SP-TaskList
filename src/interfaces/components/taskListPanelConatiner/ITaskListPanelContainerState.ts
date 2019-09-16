import { IPermissions } from "../../../services";
import { ITaskList } from "../../services/response/ITaskList";

export interface ITaskListPanelContainerState {
  listPermissions: IPermissions[];
  libraryPermissions : IPermissions[];
  selectedItemCount: number;
  isAllItemsSeleced: boolean;
  totalItemCount: number;
  selectedItem: ITaskList;
  allItems: ITaskList[];
}
