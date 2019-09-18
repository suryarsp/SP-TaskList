import { ICustomizedColumn } from "./ICustomizedColumn";

export interface IColumnsCustomizationProps {
  taskListName: string;
  displayedColumns : ICustomizedColumn[];
  onChangeColumns: (columns: ICustomizedColumn) => void;
}

