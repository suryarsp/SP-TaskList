export interface IStatus {
  Title: string;
  SortOrder: number;
  FontColor: string;
  FillColor: string;
  ID?: number;
  GUID?:string;
  isExisting?:boolean;
  isSaving ?: boolean;
  isNew?: boolean;
  
}
