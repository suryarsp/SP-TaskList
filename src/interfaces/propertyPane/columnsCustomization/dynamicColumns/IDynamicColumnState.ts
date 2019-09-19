import { ICustomizedColumn } from "../ICustomizedColumn";

export interface IDynamicColumnState {
  isAllowed : boolean;
  displayedColumns: ICustomizedColumn[];
  isAddClicked: boolean;
  columns: any[];
}
