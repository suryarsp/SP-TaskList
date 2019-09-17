import { PermissionKind } from "sp-pnp-js";
import { IGroup, IResponsibleParty, IStatus, IColumn, ICategory, IComment, ITaskList, Group } from "../index";

export interface IDataProvider {
  getPermissions?:(listTitle: string) => Promise<Array<{ permission: PermissionKind, allowed: boolean }>>;
  getGroups: (listname: string) => Promise<IGroup[]>;
  getResponsibleParties: (listname: string) =>  Promise<IResponsibleParty[]>;
  getStatuses: (listname: string) =>  Promise<IStatus[]>;
  getCategories: (listname: string) =>  Promise<ICategory[]>;
  getTaskListFields: (listname: string) =>  Promise<IColumn[]>;
  groupListCreation?: (listName: string) =>  Promise<boolean>;
  responsibleListCreation?: (listName: string) =>  Promise<boolean>;
  statusListCreation?: (listName: string) =>  Promise<boolean>;
  categoryListCreation?: (listName: string) =>  Promise<boolean>;
  commonlistViewCreation?: (listName: string, items: string[]) =>  Promise<boolean>;
  taskListCreation?:(listName: string) => Promise<boolean>;
  commentsListCreation?:(listName: string)=> Promise<boolean>;
  insertGroupItem: (listName:string,Items:IGroup) => Promise<IGroup>;
  updateGroupItem: (listname:string,itemId:number,Items:IGroup) => Promise<boolean>;
  deleteItem: (listname:string,itemId:number) => Promise<boolean>;
  insertStatusItem: (listName:string,items:IStatus) => Promise<IStatus>;
  updateStatusItem: (listname:string,itemId:number,items:IStatus) => Promise<boolean>;
  libraryExists?: (libraryName: string) =>  Promise<boolean>;
  listExists?: (listname: string) =>  Promise<boolean>;
  documentLibraryCreation?: (libraryName: string) => Promise<boolean>;
  deleteList?: (listName:string) => Promise<boolean>;

  taskMappingAfterGroup?: (listName:string,defaultGroup:string)=>Promise<boolean>;
  categoryMappingAfterGroup?: (listName:string,defaultGroup:string)=>Promise<boolean>;
  insertCategoryItem?: (listName: string, items: ICategory) => Promise<ICategory>;
  updateCategoryItem?: (listName: string, itemId: number, items: ICategory) => Promise<boolean>;
  insertCommentItem?: (listName: string, items: IComment)=> Promise<IComment>;
  updateCommentItem?: (listName: string, itemId: number, items: IComment)=> Promise<boolean>;
  insertResponsibleItem?: (listName: string, items: IResponsibleParty)=> Promise<IResponsibleParty>;
  updateResponsibleItem?: (listName: string, itemId: number, items: IResponsibleParty)=> Promise<boolean>;
  deleteListField?: (listName:string,fieldName:string)=>Promise<boolean>;

  getTaskListItem?: (listName:string)=>Promise<ITaskList[]>;
  insertTaskListItem?: (listName:string,taskItem:ITaskList)=>Promise<ITaskList>;
  updateTaskListItem?: (listName:string,taskItem:ITaskList,itemId:number)=>Promise<boolean>;
  getTaskListItemById?: (listName:string,itemId:number)=>Promise<ITaskList>;
  bulkUpdateCategoryItem?: (listName: string, items: ICategory[],groupItemId:number) => Promise<boolean>;
  bulkUpdateTaskItem?: (listName: string, items: ITaskList[],groupItemId:number) => Promise<boolean>;
}
