export interface IStatus {
  Title: string;
  StatusSort: number;
  FontColor: string;
  FillColor: string;
  ID?: number;
  GUID?:string;
  isExisting?:false;
  isSaving ?: boolean;
}
