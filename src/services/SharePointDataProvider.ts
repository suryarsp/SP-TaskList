import { IDataProvider, IGroup, IStatus, ICategory, IColumn, IResponsibleParty, IComment } from "../interfaces/index";

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
  private groupListGUID: string;
  private responsibleListGUID: string;
  private statusListGUID: string;
  private categoryListGUID: string;
  private documentLibraryGUID: string;
  private taskListGUID: string;
  private commentListGUID: string;

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
       web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "GroupSort", "IsDefault","GUID").get().then((groupitems: IGroup[]) => {
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
       web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "FontColor", "FillColor","GUID").get().then((responsibleitems: IResponsibleParty[]) => {
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
       web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "StatusSort", "FontColor", "FillColor","GUID").get().then((Statusitems: IStatus[]) => {
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
       web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "CategorySort", "Parent/Title", "Parent/Id", "Group/Title", "Group/Id","GUID").expand("Parent", "Group").get().then((categoryitems: ICategory[]) => {
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
       web.lists.configure(this.configOptions).getByTitle(listname).fields.get().then((taskField: IColumn[]) => {
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
  public insertGroupItem(listName:string,Items:IGroup):Promise<IGroup>{
    return new Promise<IGroup>((response)=>{
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Title:"Title",
        GroupSort:1,
        IsDefault:true
      }).then(inserttask=>{
        console.log("Insert group item : ",inserttask);
        let item :IGroup = {
          Title:inserttask.data.Title,
          GroupSort:inserttask.data.GroupSort,
          ID:inserttask.data.ID,
          IsDefault:inserttask.data.IsDefault,
          GUID:inserttask.data.GUID
        };
        response(item);        
      }).catch(error=>{
        console.log("Insert Group Item Error :",error);
        response(null);
      });
    });
  }

  public updateGroupItem(listname:string,itemId:number,Items:IGroup):Promise<boolean>{
    return new Promise<boolean>((response)=>{
      this.web.lists.configure(this.configOptions).getByTitle(listname).items.getById(itemId).update({
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
//Group List Methods end

//Common delete method for Group, Responaible, Status, Category, Comment, Task and Document.
public deleteItem(listname:string,itemId:number):Promise<boolean>{
  return new Promise<boolean>((response)=>{
    this.web.lists.configure(this.configOptions).getByTitle(listname).items.getById(itemId).delete().then(deletegroup=>{
      console.log("Delete group item : ",deletegroup);
      response(true);
    }).catch(error=>{
      console.log("Delete group item error : ",error);
      response(false);
    });
  });
}

  

  //Status list methods start
  public insertStatusItem(listName:string,items:IStatus):Promise<IStatus>{
    return new Promise<IStatus>((response)=>{
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Title:items.Title,
        StatusSort:items.StatusSort,
        FontColor:items.FontColor,        
        FillColor:items.FillColor
      }).then(insertstatus=>{
        console.log("Insert status item : ",insertstatus);
        let item:IStatus={
          Title:insertstatus.data.Title,
          StatusSort:insertstatus.data.StatusSort,
          FontColor:insertstatus.data.FontColor,        
          FillColor:insertstatus.data.FillColor,
          ID:insertstatus.data.ID,
          GUID:insertstatus.data.GUID
        };
        response(item);
      }).catch(error=>{
        console.log("Insert status Item Error :",error);
        response(null);
      });
    });
  }

  public updateStatusItem(listname:string,itemId:number,items:IStatus):Promise<boolean>{
    return new Promise<boolean>((response)=>{
      this.web.lists.configure(this.configOptions).getByTitle(listname).items.getById(itemId).update({
        Title:items.Title,
        StatusSort:items.StatusSort,
        FontColor:items.FontColor,        
        FillColor:items.FillColor
      }).then(updategroup=>{
        console.log("Update status item : ",updategroup);
        response(true);
      }).catch(error=>{
        console.log("Update status item error : ",error);
        response(false);
      });
    });
  }
  //Status list method end

//Responsible list method start
public insertResponsibleItem(listName:string,items:IResponsibleParty):Promise<IResponsibleParty>{
  return new Promise<IResponsibleParty>((response)=>{
    this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({        
      Title: items.Title,
      FontColor: items.FontColor,
      FillColor: items.FillColor
    }).then(insertResponsible=>{
      console.log("Insert status item : ",insertResponsible);
      let item:IResponsibleParty={
        Title: insertResponsible.data.Title,
        FontColor: insertResponsible.data.FontColor,
        FillColor: insertResponsible.data.FillColor,
        ID:insertResponsible.data.ID,
        GUID:insertResponsible.data.GUID
      };
      response(item);
    }).catch(error=>{
      console.log("Insert status Item Error :",error);
      response(null);
    });
  });
}

public updateResponsibleItem(listName:string,itemId:number,items:IResponsibleParty):Promise<boolean>{
  return new Promise<boolean>((response)=>{
    this.web.lists.configure(this.configOptions).getByTitle(listName).items.getById(itemId).update({
      Title:items.Title,        
      FontColor:items.FontColor,        
      FillColor:items.FillColor
    }).then(updateResponsible=>{
      console.log("Update status item : ",updateResponsible);
      response(true);
    }).catch(error=>{
      console.log("Update status item error : ",error);
      response(false);
    });
  });
}

//Responsible list method end

//Category list method start

public insertCategoryItem(listName:string,items:ICategory):Promise<ICategory>{
  return new Promise<ICategory>((response)=>{
    this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
      Title:items.Title,
      CategorySort: items.CategorySort,
      GroupId: items.Group.Id,
      ParentId: items.Parent.Id
    }).then(insertCategory=>{
      console.log("Insert category item : ",insertCategory);
      let item:ICategory={
        Title:insertCategory.data.Title,
        CategorySort: insertCategory.data.CategorySort,
        Group: insertCategory.data.Group,
        Parent: insertCategory.data.Parent,
        ID:insertCategory.data.ID,
        GUID:insertCategory.data.GUID,
        children:[],
        key:insertCategory.data.ID,
        text:insertCategory.data.Title
      };
      response(item);
    }).catch(error=>{
      console.log("Insert category item error message :",error);
      response(null);
    });
  });
}

public updateCategoryItem(listName:string,itemId:number,items:ICategory):Promise<boolean>{
  return new Promise<boolean>((response)=>{
    this.web.lists.configure(this.configOptions).getByTitle(listName).items.getById(itemId).update({
      Title:items.Title,
      CategorySort: items.CategorySort,
      GroupId: items.Group.Id,
      ParentId: items.Parent.Id
    }).then(updateCategory=>{
      console.log("Update category item : ",updateCategory);
      response(true);
    }).catch(error=>{
      console.log("Update category item error message :",error);
      response(false);
    });
  });
}

//Category list method end

//Comment list method start
public insertCommentItem(listName:string,items:IComment):Promise<IComment>{
  return new Promise<IComment>((response)=>{
    this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
      Comment: items.Comment,
      TaskId: items.Task.ID
    }).then(insertComments=>{
      console.log("Insert comment list item : ",insertComments);
      let item:IComment={
        Comment: items.Comment,
        Task: items.Task,
        ID:insertComments.data.ID,
        GUID:insertComments.data.GUID
      };
      response(item);
    }).catch(error=>{
      console.log("Insert comment list item error : ",error);
      response(null);
    });
  });
}


public updateCommentItem(listName:string,itemId:number,items:IComment):Promise<boolean>{
  return new Promise<boolean>((response)=>{
    this.web.lists.configure(this.configOptions).getByTitle(listName).items.getById(itemId).update({
      Comment: items.Comment,
      TaskId: items.Task.ID
    }).then(updateComments=>{
      console.log("Update comment list item : ",updateComments);
      response(true);
    }).catch(error=>{
      console.log("Update comment list item error : ",error);
      response(false);
    });
  });
}
//comment list method end



  //List Creation start
  public async groupListCreation(listName: string): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async groupresult => {
        if (groupresult.created) {
          console.log(groupresult.data.Id);
          this.groupListGUID = groupresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="GroupSort" Name="GroupSort" Required="TRUE"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Boolean" DisplayName="IsDefault" Name="IsDefault" Required="FALSE"/>'
                );
            });

            batch.execute().then(() => {
              resolve(true);
           });
        }
        else {
          console.log(groupresult);
          resolve(false);
        }
      }).catch(error => {
        console.log("Group List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async commonlistViewCreation(listName: string,items:any): Promise<boolean> {
    const batch = this.web.createBatch();
    //const fields = ['Item', 'Group', 'ResponsibleParty', 'Status', 'SortOrder', 'Comments', this.DocumentsColumnTitle, 'ID', 'Created', 'Editor', 'Modified'];
    const fields =items;
    const view = this.web.lists.configure(this.configOptions).getByTitle(listName).defaultView;
    view.fields.inBatch(batch).removeAll();
    return new Promise<boolean>(async (resolve) => {
         fields.forEach(fieldName => {
              view.fields.inBatch(batch).add(fieldName);
         });
         batch.execute().then(() => {
              resolve(true);
         });
    });
  }

  public async responsibleListCreation(listName: string): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async responsibleresult => {
        if (responsibleresult.created) {
          console.log(responsibleresult.data.Id);
          this.responsibleListGUID = responsibleresult.data.Id;
          
          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Text" DisplayName="FontColor" Name="FontColor" Required="TRUE"> <Default>#000000</Default></Field>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Text" DisplayName="FillColor" Name="FillColor" Required="TRUE"> <Default>#ffffff</Default></Field>'
                );
            });

            batch.execute().then(() => {
              resolve(true);
           });
        }
        else {
          console.log(responsibleresult);
          resolve(false);
        }
      }).catch(error => {
        console.log("Responsible List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async statusListCreation(listName: string): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async statusresult => {
        if (statusresult.created) {
          console.log(statusresult.data.Id);
          this.statusListGUID = statusresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="StatusSort" Name="StatusSort" Required="TRUE"/>'
                );
            });
          
          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Text" DisplayName="FontColor" Name="FontColor" Required="FALSE"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Text" DisplayName="FillColor" Name="FillColor" Required="FALSE"/>'
                );
            });

            batch.execute().then(() => {
              resolve(true);
           });
        }
        else {
          console.log(statusresult);
          resolve(false);
        }
      }).catch(error => {
        console.log("Status List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async categoryListCreation(listName: string): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async categoryresult => {
        if (categoryresult.created) {
          console.log(categoryresult.data.Id);
          this.categoryListGUID = categoryresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="CategorySort" Name="CategorySort" Required="TRUE"/>'
                );
            });
          
          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Parent" Name="Parent" Required="FALSE" List="' +
                  this.categoryListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Group" Name="Group" Required="FALSE" List="' +
                  this.groupListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            batch.execute().then(() => {
              resolve(true);
           });
        }
        else {
          console.log(categoryresult);
          resolve(false);
        }
      }).catch(error => {
        console.log("Category List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async documentLibraryCreation(libraryName:string):Promise<boolean>{
    return new Promise<boolean>((resolve) => {
      this.web.lists.configure(this.configOptions).ensure(libraryName, "", 101, true)
      .then((documentresult) => {
           if (documentresult.created) {
             this.documentLibraryGUID = documentresult.data.Id;
              resolve(true);
           }
           else {
              resolve(false);
           }
      }).catch(error => {
           console.log("Document Library Exists Or Not : ", error);
           resolve(false);
      });
    });
  }

  public async taskListCreation(listName: string): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 107, true).then(async taskresult => {
        if (taskresult.created) {
          console.log(taskresult.data.Id);
          this.taskListGUID =taskresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="TaskSort" Name="TaskSort" Required="TRUE"/>'
                );
            });
          
          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Parent" Name="Parent" Required="FALSE" List="' +
                  this.taskListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Group" Name="Group" Required="TRUE" List="' +
                  this.groupListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Category" Name="Category" Required="TRUE" List="' +
                  this.categoryListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Status" Name="Status" Required="TRUE" List="' +
                  this.statusListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Responsible" Name="Responsible" Required="TRUE" List="' +
                  this.responsibleListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="' +
                  this.DocumentsColumnTitle +
                  '" Name="' +
                  this.DocumentsColumnTitle +
                  '" Required="FALSE" List="' +
                  this.documentLibraryGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None" Mult="TRUE" />'
                );
            });

            batch.execute().then(() => {
              resolve(true);
           });
        }
        else {
          console.log(taskresult);
          resolve(false);
        }
      }).catch(error => {
        console.log("Task List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async commentsListCreation(listName: string): Promise<boolean> {

    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async commentresult => {
        if (commentresult.created) {
          console.log(commentresult.data.Id);
          this.commentListGUID = commentresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Note" DisplayName="Comment" Name="Comment" Required="TRUE"/>'
                );
            });
          
          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Item")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Task" Name="Task" Required="TRUE" List="9b526e51-2a92-42e4-81c8-23ad1b32fdbc" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

            batch.execute().then(() => {
              resolve(true);
           });
        }
        else {
          console.log(commentresult);
          resolve(false);
        }
      }).catch(error => {
        console.log("Comments List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }
  //List Creation End
}
