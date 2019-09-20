import { ICustomizedColumn } from "../ICustomizedColumn";
import { IColumn } from "../../../services/response/IColumn";

export interface IDynamicColumnState {
  isAllowed : boolean;
  displayedColumns:  IColumn[];
  isAddClicked: boolean;
  columns: IColumn[];
}
