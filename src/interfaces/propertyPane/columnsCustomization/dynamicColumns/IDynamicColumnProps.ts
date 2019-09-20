import { ICustomizedColumn } from "../ICustomizedColumn";
import { IColumn } from "../../../services/response/IColumn";

export interface IDynamicColumnProps {
  taskListName: string;
  displayedColumns: IColumn[];
  onChangeColumns: (columns: IColumn[]) => void;
}
