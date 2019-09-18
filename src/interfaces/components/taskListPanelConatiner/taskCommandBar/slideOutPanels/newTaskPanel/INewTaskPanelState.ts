import { ITaskList, ICategory, IResponsibleParty, IStatus, IGroup } from "../../../../..";

export interface INewTaskPanelState {
  isSubTaskChecked : boolean;
  currentItem: ITaskList;
  categories: ICategory[];
  groups : IGroup[];
  parties: IResponsibleParty[];
  statuses: IStatus[];
  subCategories: ICategory[];
  taskCollections:ITaskList[];
  status: NewTaskComponentStatus;
  isSaveClick:boolean;
}

export enum NewTaskComponentStatus {
  Loading = 0,
  None = 1,
  Saving = 2,
  ErrorOnSave = 3,
  FilesUploadInProgress = 4,
  FileUploadAccessDenied = 5
}
