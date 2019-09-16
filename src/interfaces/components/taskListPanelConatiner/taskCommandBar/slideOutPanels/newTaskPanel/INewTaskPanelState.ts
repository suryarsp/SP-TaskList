import { ITaskList, ICategory, IResponsibleParty, IStatus, IGroup } from "../../../../..";

export interface INewTaskPanelState {
  isSubTaskChecked : boolean;
  currentItem: ITaskList;
  categories: ICategory[];
  groups : IGroup[];
  parties: IResponsibleParty[];
  statuses: IStatus[];
  subCategories: ICategory[];
}
