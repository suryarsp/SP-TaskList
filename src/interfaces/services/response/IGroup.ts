export interface IGroup {

  Title: string;
  SortOrder: number;
  IsDefault: boolean;
  ID ?: number;
  isExisting ?: boolean;
  GUID?:string;
  isSaving ?: boolean;
  isNew?: boolean;
}
