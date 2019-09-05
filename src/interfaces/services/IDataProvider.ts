import { PermissionKind } from "sp-pnp-js";
import { IGroup, IResponsibleParty, IStatus, IColumn, ICategory } from "../index";

export interface IDataProvider {
  getPermissions(listTitle: string): Promise<Array<{ permission: PermissionKind, allowed: boolean }>>;
  getGroups(listname: string): Promise<IGroup[]>;
  getResponsibleParties(listname: string): Promise<IResponsibleParty[]>;
  getStatuses(listname: string): Promise<IStatus[]>;
  getCategories(listname: string): Promise<ICategory[]>;
  getTaskListFields(listname: string): Promise<IColumn[]>;
  insertGroupItem(listName:string,Items:IGroup):Promise<IGroup>;
  updateGroupItem(listname:string,itemId:number,Items:IGroup):Promise<boolean>;
  deleteItem(listname:string,itemId:number):Promise<boolean>;
  insertStatusItem(listName:string,items:IStatus):Promise<IStatus>;
  updateStatusItem(listname:string,itemId:number,items:IStatus):Promise<boolean>;  
}
