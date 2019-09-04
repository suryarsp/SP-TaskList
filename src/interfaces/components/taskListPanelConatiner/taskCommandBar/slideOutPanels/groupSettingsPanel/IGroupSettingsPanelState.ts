import { IGroup } from "../../../../../services/response/IGroup";
import { ProgressStatusType } from "../../../../../enums/progressStatusType";

export interface IGroupSettingsPanelState {
  groups: IGroup[];
  currentGroup: IGroup;
  isAddClicked : boolean;
  preventDelete: boolean;
  statusMessage: string;
  statusType: ProgressStatusType;
}
