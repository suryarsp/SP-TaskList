import { ITaskList } from '../../../../interfaces/index';
import { IPermissions } from '../../../../services';

export interface ITaskCommandBarProps {
  onClickDelete: () => void;
  onCancelSelection: () => void;
  onRefreshPage: () => void;
  totalItemCount: number;
  isAllItemsSelected: boolean;
  selectedCount: number;
  uniqueToGroupEnabled: boolean;
  isGroupingEnabled: boolean;
  selectedItem: ITaskList;
  listPermissions: IPermissions[];
  libraryPermissions : IPermissions[];
}
