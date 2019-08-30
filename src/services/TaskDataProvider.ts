
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { MockupDataProvider } from "./MockupDataProvider";
import { SharePointDataProvider } from "./SharePointDataProvider";
import { IDataProvider } from "../interfaces/index";
import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { IPermissions } from "./permissions/IPermissions";
// import { ICategoryExpandPosition } from "../interfaces/ICategoryExpandPosition";

export default class TaskDataProvider  {
  private static _instance: IDataProvider;
  public static listPermissions : IPermissions[];
  public static libraryPermissions : IPermissions[];
  public static listName: string;
  public static librarayName: string;
  public static documentLibraryUniqueID: string;

  // public static categoryExpandPosition: ICategoryExpandPosition[] = [];
  public static context : IWebPartContext;

  public static get Instance() {
    if(!this._instance){
        if (DEBUG && Environment.type === EnvironmentType.Local) {
             this._instance = new MockupDataProvider();
        } else {
             this._instance = new SharePointDataProvider(this.context);
        }
    }
    return this._instance;
  }

}
