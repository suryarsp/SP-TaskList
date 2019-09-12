export interface IGroup {
  Title: string;
  SortOrder: number;  
  IsDefault: boolean;
  key: string;
  text: string;
  ID ?: number;
  isExisting ?: boolean;
  GUID?:string;
  isSaving ?: boolean;
  isNew?: boolean;  
}
