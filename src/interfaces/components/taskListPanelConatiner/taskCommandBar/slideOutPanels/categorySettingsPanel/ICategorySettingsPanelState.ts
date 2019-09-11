import { ICategory } from "../../../../../services/response/ICategory";
import { ProgressStatusType } from "../../../../../enums/progressStatusType";

export interface ICategorySettingsPanelState {
    categories: ICategory[];
    isAddClicked : boolean;
    preventDelete: boolean;
    statusMessage: string;
    statusType: ProgressStatusType;
}
