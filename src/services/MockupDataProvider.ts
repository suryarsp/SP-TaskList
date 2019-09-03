import { IDataProvider, IResponsibleParty, IGroup, IColumn, IStatus, ICategory } from "../interfaces/index";

export class MockupDataProvider implements IDataProvider {
  public getGroups(listname: string): Promise<IGroup[]> {
    return new Promise<IGroup[]>((resolve) => resolve([
      {
        GroupSort : 1,
        ID : 1,
        IsDefault: true,
        Title: "Group 1"
      },
      {
        GroupSort : 2,
        ID : 2,
        IsDefault: false,
        Title: "Group 2"
      },
      {
        GroupSort : 3,
        ID : 3,
        IsDefault: false,
        Title: "Group 3"
      },
      {
        GroupSort : 4,
        ID : 4,
        IsDefault: false,
        Title: "Group 4"
      },
      {
        GroupSort : 5,
        ID : 5,
        IsDefault: false,
        Title: "Group 5"
      }
    ]));
  }

  public getResponsibleParties(listname: string): Promise<IResponsibleParty[]> {
    return new Promise<IResponsibleParty[]>((resolve) => resolve([]));
  }

  public getStatuses(listname: string): Promise<IStatus[]> {
    return new Promise<IStatus[]>((resolve) => resolve([]));
  }

  public getCategories(listname: string): Promise<ICategory[]> {
    return new Promise<ICategory[]>((resolve) => resolve([]));
  }

  public getTaskListFields(listname: string): Promise<IColumn[]> {
    return new Promise<IColumn[]>((resolve) => resolve([]));
  }

  public getPermissions(listTitle: string): Promise<{ permission: import("sp-pnp-js").PermissionKind; allowed: boolean; }[]> {
    return null;
  }

  public insertGroupItem(listName:string):Promise<boolean>{
    return null;
  }

  public updateGroupItem(listname:string,itemId:number):Promise<boolean>{
    return null;
  }

  public deleteGroupItem(listname:string,itemId:number):Promise<boolean>{

    return null;
  }

  public insertStatusItem(listName:string,items:IStatus):Promise<boolean>{
    return null;
  }

  public updateStatusItem(listname:string,itemId:number,items:IStatus):Promise<boolean>{
    return null;
  }

  public deleteStatusItem(listname:string,itemId:number):Promise<boolean>{
    return null
  }
  constructor() {
  }
}
