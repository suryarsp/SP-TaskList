import { ICategory } from "../../../../../services/response/ICategory";
import { ProgressStatusType } from "../../../../../enums/progressStatusType";
import { IGroup } from "../../../../../services/response/IGroup";

export interface ICategorySettingsPanelState {
    categories: ICategory[];
    isAddClicked : boolean;
    preventDelete: boolean;
    statusMessage: string;
    statusType: ProgressStatusType;
    isUniqueToGroupChecked: boolean;
    currentSelectedGroup: IGroup;
    groups: IGroup[];
}
