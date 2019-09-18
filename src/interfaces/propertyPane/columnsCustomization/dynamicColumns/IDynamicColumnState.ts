import { ICustomizedColumn } from "../ICustomizedColumn";

export interface IDynamicColumnState {
  isAllowed : boolean;
  columns: ICustomizedColumn[];
}
