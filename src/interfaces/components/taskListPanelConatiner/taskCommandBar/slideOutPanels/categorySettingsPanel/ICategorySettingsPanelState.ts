import { ICategory } from "../../../../../services/response/ICategory";
import { ProgressStatusType } from "../../../../../enums/progressStatusType";

export interface ICategorySettingsPanelState {
    CurrentCategory :ICategory;
    categorys: ICategory[];    
    isAddClicked : boolean;
    preventDelete: boolean;
    statusMessage: string;
    statusType: ProgressStatusType;
    makeSubCategory:ICategory;
    IsSubCategory:boolean;
}
