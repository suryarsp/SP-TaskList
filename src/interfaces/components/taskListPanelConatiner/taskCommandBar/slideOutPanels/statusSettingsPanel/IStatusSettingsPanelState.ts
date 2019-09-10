import { IStatus } from "../../../../../services/response/IStatus";
import { ProgressStatusType } from "../../../../../enums/progressStatusType";

export interface IStatusSettingsPanelState {
    status:IStatus[];
    currentStatus:IStatus;
    isAddClicked : boolean;
    preventDelete: boolean;
    statusMessage: string;
    statusType: ProgressStatusType;
    isColor:boolean;
}

