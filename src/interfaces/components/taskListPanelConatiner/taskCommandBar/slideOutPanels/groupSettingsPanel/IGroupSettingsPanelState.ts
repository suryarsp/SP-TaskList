import { IGroup } from "../../../../../services/response/IGroup";

export interface IGroupSettingsPanelState {
  groups: IGroup[];
  currentGroup: IGroup;
  isAddClicked : boolean;
}
