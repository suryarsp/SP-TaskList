import { IDataProvider, IGroup, IStatus, ICategory, IColumn, IResponsibleParty } from "../interfaces/index";

import { IWebPartContext } from "@microsoft/sp-webpart-base";

import { Utilties } from "../common/helper/Utilities";
import { Web, util, ConfigOptions, ODataBatch, PermissionKind, ListItemFormUpdateValue } from "sp-pnp-js";
import { IPermissions } from "./permissions/IPermissions";

export class SharePointDataProvider implements IDataProvider {

  private _absoluteUrl: string;
  public _context: IWebPartContext;
  public _relativeUrl: string;
  public web: Web;
  public utility = new Utilties();
  public DocumentsColumnTitle: string = "Documents";
  public static globalFileDownloadIndex: number = 1;

  private configOptions: ConfigOptions = {
       headers: {
            Accept: 'application/json;odata=nometadata'
       }
  };

  constructor(context: IWebPartContext) {
       this._absoluteUrl = context.pageContext.web.absoluteUrl;
       this._context = context;
       this.web = new Web(this._absoluteUrl);
       this._relativeUrl = context.pageContext.web.serverRelativeUrl;
  }


  public getPermissions(listTitle: string): Promise<{ permission: import("sp-pnp-js").PermissionKind; allowed: boolean; }[]> {
    return new Promise<IPermissions[]>((resolve) => {
      let web = new Web(this._absoluteUrl);
      let output: Array<{ permission: PermissionKind, allowed: boolean }> = [];
      web.lists
           .configure(this.configOptions)
           .getByTitle(listTitle)
           .effectiveBasePermissions
           .get()
           .then((result) => {
                if (web.hasPermissions(result, PermissionKind.ManageLists))
                     output.push({ permission: PermissionKind.ManageLists, allowed: true });
                else
                     output.push({ permission: PermissionKind.ManageLists, allowed: false });

                if (web.hasPermissions(result, PermissionKind.AddListItems))
                     output.push({ permission: PermissionKind.AddListItems, allowed: true });
                else
                     output.push({ permission: PermissionKind.AddListItems, allowed: false });

                if (web.hasPermissions(result, PermissionKind.EditListItems))
                     output.push({ permission: PermissionKind.EditListItems, allowed: true });
                else
                     output.push({ permission: PermissionKind.EditListItems, allowed: false });

                if (web.hasPermissions(result, PermissionKind.DeleteListItems))
                     output.push({ permission: PermissionKind.DeleteListItems, allowed: true });
                else
                     output.push({ permission: PermissionKind.DeleteListItems, allowed: false });


                if (web.hasPermissions(result, PermissionKind.ApproveItems))
                     output.push({ permission: PermissionKind.ApproveItems, allowed: true });
                else
                     output.push({ permission: PermissionKind.ApproveItems, allowed: false });

                if (web.hasPermissions(result, PermissionKind.OpenItems))
                     output.push({ permission: PermissionKind.OpenItems, allowed: true });
                else
                     output.push({ permission: PermissionKind.OpenItems, allowed: false });

                if (web.hasPermissions(result, PermissionKind.ViewVersions))
                     output.push({ permission: PermissionKind.ViewVersions, allowed: true });
                else
                     output.push({ permission: PermissionKind.ViewVersions, allowed: false });

                if (web.hasPermissions(result, PermissionKind.DeleteVersions))
                     output.push({ permission: PermissionKind.DeleteVersions, allowed: true });
                else
                     output.push({ permission: PermissionKind.DeleteVersions, allowed: false });


                if (web.hasPermissions(result, PermissionKind.CreateAlerts))
                     output.push({ permission: PermissionKind.CreateAlerts, allowed: true });
                else
                     output.push({ permission: PermissionKind.CreateAlerts, allowed: false });

                if (web.hasPermissions(result, PermissionKind.ViewFormPages))
                     output.push({ permission: PermissionKind.ViewFormPages, allowed: true });
                else
                     output.push({ permission: PermissionKind.ViewFormPages, allowed: false });

                if (web.hasPermissions(result, PermissionKind.ManageAlerts))
                     output.push({ permission: PermissionKind.ManageAlerts, allowed: true });
                else
                     output.push({ permission: PermissionKind.ManageAlerts, allowed: false });

                if (web.hasPermissions(result, PermissionKind.ViewListItems))
                     output.push({ permission: PermissionKind.ViewListItems, allowed: true });
                else
                     output.push({ permission: PermissionKind.ViewListItems, allowed: false });
                resolve(output);
           }).catch(() => {
                output.push({ permission: PermissionKind.ManageLists, allowed: false });
                output.push({ permission: PermissionKind.AddListItems, allowed: false });
                output.push({ permission: PermissionKind.EditListItems, allowed: false });
                output.push({ permission: PermissionKind.DeleteListItems, allowed: false });
                output.push({ permission: PermissionKind.ApproveItems, allowed: false });
                output.push({ permission: PermissionKind.OpenItems, allowed: false });
                output.push({ permission: PermissionKind.ViewVersions, allowed: false });
                output.push({ permission: PermissionKind.DeleteVersions, allowed: false });
                output.push({ permission: PermissionKind.CreateAlerts, allowed: false });
                output.push({ permission: PermissionKind.ViewFormPages, allowed: false });
                output.push({ permission: PermissionKind.ManageAlerts, allowed: false });
                output.push({ permission: PermissionKind.ViewListItems, allowed: false });
                resolve(output);
           });
 });
  }


  public getGroups(listname: string): Promise<IGroup[]> {
     let web: Web = new Web(this._absoluteUrl);
     let GroupListColl: IGroup[] = [];
     return new Promise<IGroup[]>(resolve => {
       web.lists.getByTitle(listname).items.select("Title", "ID", "GroupSort", "IsDefault","GUID").get().then((groupitems: IGroup[]) => {
         console.log("Group : ", groupitems);
         console.log("Group JSON : ", JSON.stringify(groupitems));
         groupitems.forEach(element => {
           let items: IGroup = {
             ID: element.ID,
             IsDefault: element.IsDefault,
             Title: element.Title,
             GroupSort: element.GroupSort,
             GUID:element.GUID
           };
           GroupListColl.push(items);
           resolve(GroupListColl);
         });
       });
     });
   }

   public getResponsibleParties(listname: string): Promise<IResponsibleParty[]> {
     let web: Web = new Web(this._absoluteUrl);
     let ResponsibleListColl: IResponsibleParty[] = [];
     return new Promise<IResponsibleParty[]>(resolve => {
       web.lists.getByTitle(listname).items.select("Title", "ID", "FontColor", "FillColor","GUID").get().then((responsibleitems: IResponsibleParty[]) => {
         console.log("responsibleitems : ", responsibleitems);
         console.log("responsibleitems JSON : ", JSON.stringify(responsibleitems));
         responsibleitems.forEach(element => {
           let items: IResponsibleParty = {
             ID: element.ID,
             Title: element.Title,
             FontColor: element.FontColor,
             FillColor: element.FillColor,
             GUID:element.GUID
           };
           ResponsibleListColl.push(items);
           resolve(ResponsibleListColl);
         });
       });
     });
   }

   public getStatuses(listname: string): Promise<IStatus[]> {
     let web: Web = new Web(this._absoluteUrl);
     let StatusitemsListColl: IStatus[] = [];
     return new Promise<IStatus[]>(resolve => {
       web.lists.getByTitle(listname).items.select("Title", "ID", "StatusSort", "FontColor", "FillColor","GUID").get().then((Statusitems: IStatus[]) => {
         console.log("Status : ", Statusitems);
         console.log("Status JSON : ", JSON.stringify(Statusitems));
         Statusitems.forEach(element => {
           let items: IStatus = {
             ID: element.ID,
             FontColor: element.FontColor,
             Title: element.Title,
             FillColor: element.FillColor,
             StatusSort: element.StatusSort,
             GUID:element.GUID
           };
           StatusitemsListColl.push(items);
           resolve(StatusitemsListColl);
         });
       });
     });
   }

   public getCategories(listname: string): Promise<ICategory[]> {
     let web: Web = new Web(this._absoluteUrl);
     let CategoryListColl: ICategory[] = [];
     return new Promise<ICategory[]>(resolve => {
       web.lists.getByTitle(listname).items.select("Title", "ID", "CategorySort", "Parent/Title", "Parent/Id", "Group/Title", "Group/Id","GUID").expand("Parent", "Group").get().then((categoryitems: ICategory[]) => {
         console.log("category : ", categoryitems);
         console.log("category JSON : ", JSON.stringify(categoryitems));
         categoryitems.forEach(element => {
           let items: ICategory = {
             ID: element.ID,
             Title: element.Title,
             CategorySort: element.CategorySort,
             Group: element.Group,
             Parent: element.Parent,
             children: [],
             key: element.ID.toString(),
             text: element.Title,
             GUID:element.GUID
           };
           CategoryListColl.push(items);
           resolve(CategoryListColl);
         });
       });
     });
   }

   public getTaskListFields(listname: string): Promise<IColumn[]> {
     let web: Web = new Web(this._absoluteUrl);
     let taskFieldsColl: IColumn[] = [];
     return new Promise<IColumn[]>(resolve => {
       web.lists.getByTitle(listname).fields.get().then((taskField: IColumn[]) => {
         console.log("Task List Field : ", taskField);
         console.log("Task List Field JSON : ", JSON.stringify(taskField));
         taskField.forEach(element => {
           let fields: IColumn = {
             key: element["InternalName"],
             text: element["Title"]
           };
           taskFieldsColl.push(fields);
           resolve(taskFieldsColl);
         });
       });
     });
   }


  //Group List Methods start
  public insertGroupItem(listName:string):Promise<boolean>{
    return new Promise<boolean>((response)=>{
      this.web.lists.getByTitle(listName).items.add({
        Title:"Title",
        GroupSort:1,
        IsDefault:true
      }).then(inserttask=>{
        console.log("Insert group item : ",inserttask);
        response(true);
      }).catch(error=>{
        console.log("Insert Group Item Error :",error);
        response(false);
      });
    });
  }

  public updateGroupItem(listname:string,itemId:number):Promise<boolean>{
    return new Promise<boolean>((response)=>{
      this.web.lists.getByTitle(listname).items.getById(itemId).update({
        Title:"Group 2",
        GroupSort:1,
        IsDefault:false
      }).then(updategroup=>{
        console.log("Update group item : ",updategroup);
        response(true);
      }).catch(error=>{
        console.log("Update group item error : ",error);
        response(false);
      });
    });
  }

  public deleteGroupItem(listname:string,itemId:number):Promise<boolean>{
    return new Promise<boolean>((response)=>{
      this.web.lists.getByTitle(listname).items.getById(itemId).delete().then(deletegroup=>{
        console.log("Delete group item : ",deletegroup);
        response(true);
      }).catch(error=>{
        console.log("Delete group item error : ",error);
        response(false);
      });
    });
  }

  //Group List Methods end
}
