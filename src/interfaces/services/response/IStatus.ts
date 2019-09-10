export interface IStatus {
  Title: string;
  SortOrder: number;
  FontColor: string;
  FillColor: string;
  ID?: number;
  GUID?:string;
  isExisting?:false;
  isSaving ?: boolean;
}
