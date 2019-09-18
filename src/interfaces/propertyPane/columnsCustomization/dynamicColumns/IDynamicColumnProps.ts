import { ICustomizedColumn } from "../ICustomizedColumn";

export interface IDynamicColumnProps {
  taskListName: string;
  displayedColumns: ICustomizedColumn[];
  onChangeColumns: (columns: ICustomizedColumn[]) => void;
}
