import { IGroup } from '../../../../../src/interfaces/index';

export interface ITaskFilterState{
    groups:IGroup[]; 
    searchedValue:string;
}