import { IGroup } from '../../../../../src/interfaces/index';
import { IDropdownOption } from 'office-ui-fabric-react';

export interface ITaskFilterState{
    groups:IGroup[]; 
    selectedGroup:IDropdownOption;
    searchedValue:string;
}