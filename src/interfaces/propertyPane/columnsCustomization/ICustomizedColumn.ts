export interface ICustomizedColumn {
  id: string;
  columnType: string;
  label: string;
  sortOrder: number;
  isFixed: boolean;
  isPresentDefault: boolean;
  disabled: boolean;
}
