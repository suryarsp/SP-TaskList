import { IResponsibleParty } from "../../../../../services/response/IResponsibleParty";
import { ProgressStatusType } from "../../../../../enums/progressStatusType";

export interface IResponsiblePartySettingsPanelState {
    responsibles:IResponsibleParty[];
    currentResponsible:IResponsibleParty;
    isAddClicked : boolean;
    preventDelete: boolean;
    responsibleMessage: string;
    responsibleType: ProgressStatusType;
    isColor:boolean;
    fillColor:string;
    fontColor:string;
}
