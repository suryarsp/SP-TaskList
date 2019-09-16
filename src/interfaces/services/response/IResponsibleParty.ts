export interface IResponsibleParty {
  Title: string;
  FontColor: string;
  FillColor: string;
  key : string | number;
  text : string;
  ID?: number;
  GUID?:string;
  isExisting?:boolean;
  isSaving ?: boolean;
  isNew?: boolean;

}
