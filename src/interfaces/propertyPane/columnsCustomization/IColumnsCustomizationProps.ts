import { ICustomizedColumn } from "./ICustomizedColumn";
import { IColumn } from "../..";

export interface IColumnsCustomizationProps {
  taskListName: string;
  displayedColumns : IColumn[];
  onChangeColumns: (columns: ICustomizedColumn) => void;
}

