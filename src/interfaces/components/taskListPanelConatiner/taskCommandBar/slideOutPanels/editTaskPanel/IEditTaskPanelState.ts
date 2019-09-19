import { ITaskList } from "../../../../../services/response/ITaskList";
import { ICategory, IGroup, IResponsibleParty, IStatus } from "../../../../..";

export interface IEditTaskPanelState {
    selectedItem:ITaskList;  
    isSubTaskChecked : boolean;    
    categories: ICategory[];
    groups : IGroup[];
    parties: IResponsibleParty[];
    statuses: IStatus[];
    subCategories: ICategory[];
    taskCollections:ITaskList[];
    status: EditTaskComponentStatus;
    isSaveClick:boolean;
  }
  
  export enum EditTaskComponentStatus {
    Loading = 0,
    None = 1,
    Saving = 2,
    ErrorOnSave = 3,
    FilesUploadInProgress = 4,
    FileUploadAccessDenied = 5
  }
