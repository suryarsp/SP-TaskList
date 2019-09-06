import { IDataProvider, IGroup, IStatus, ICategory, IColumn, IResponsibleParty, IComment, IDocument, ICreateFolder } from "../interfaces/index";

import { IWebPartContext } from "@microsoft/sp-webpart-base";

import { Utilties } from "../common/helper/Utilities";
import { Web, util, ConfigOptions, ODataBatch, PermissionKind, ListItemFormUpdateValue } from "sp-pnp-js";
import { IPermissions } from "./permissions/IPermissions";
import { SPHttpClient, ISPHttpClientOptions, IHttpClientOptions, IDigestCache, DigestCache } from "@microsoft/sp-http";
import IDownloadItems from "../interfaces/services/response/IDownloadItems";

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

  public isSingleWebPartAppPage(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this._context.pageContext.list) {
        let web = new Web(this._absoluteUrl);
        web.lists.getById(this._context.pageContext.list.id.toString())
          .items
          .getById(this._context.pageContext.listItem.id)
          .select("PageLayoutType")
          .get()
          .then((pageProperties) => {
            if (pageProperties && pageProperties.PageLayoutType === "SingleWebPartAppPage") {
              resolve(true);
            }
            else {
              resolve(false);
            }
          })
          .catch(ex => {
            console.log(ex.message);
            resolve(false);
          });
      }
      else {
        resolve(false);
      }
    });
  }


  public getGroups(listname: string): Promise<IGroup[]> {
    let web: Web = new Web(this._absoluteUrl);
    let GroupListColl: IGroup[] = [];
    return new Promise<IGroup[]>(resolve => {
      web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "GroupSort", "IsDefault", "GUID").get().then((groupitems: IGroup[]) => {
        console.log("Group : ", groupitems);
        console.log("Group JSON : ", JSON.stringify(groupitems));
        groupitems.forEach(element => {
          let items: IGroup = {
            ID: element.ID,
            IsDefault: element.IsDefault,
            Title: element.Title,
            GroupSort: element.GroupSort,
            GUID: element.GUID
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
      web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "FontColor", "FillColor", "GUID").get().then((responsibleitems: IResponsibleParty[]) => {
        console.log("responsibleitems : ", responsibleitems);
        console.log("responsibleitems JSON : ", JSON.stringify(responsibleitems));
        responsibleitems.forEach(element => {
          let items: IResponsibleParty = {
            ID: element.ID,
            Title: element.Title,
            FontColor: element.FontColor,
            FillColor: element.FillColor,
            GUID: element.GUID
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
      web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "StatusSort", "FontColor", "FillColor", "GUID").get().then((Statusitems: IStatus[]) => {
        console.log("Status : ", Statusitems);
        console.log("Status JSON : ", JSON.stringify(Statusitems));
        Statusitems.forEach(element => {
          let items: IStatus = {
            ID: element.ID,
            FontColor: element.FontColor,
            Title: element.Title,
            FillColor: element.FillColor,
            StatusSort: element.StatusSort,
            GUID: element.GUID
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
      web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "CategorySort", "Parent/Title", "Parent/Id", "Group/Title", "Group/Id", "GUID").expand("Parent", "Group").get().then((categoryitems: ICategory[]) => {
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
            GUID: element.GUID
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
  public insertGroupItem(listName: string, Items: IGroup): Promise<IGroup> {
    return new Promise<IGroup>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Title: "Title",
        GroupSort: 1,
        IsDefault: true
      }).then(inserttask => {
        if (inserttask) {
          console.log("Insert group item : ", inserttask);
          let item: IGroup = {
            Title: inserttask.data.Title,
            GroupSort: inserttask.data.GroupSort,
            ID: inserttask.data.ID,
            IsDefault: inserttask.data.IsDefault,
            GUID: inserttask.data.GUID
          };
          response(item);
        }
        else {
          response(null);
        }
      }).catch(error => {
        console.log("Insert Group Item Error :", error);
        response(null);
      });
    });
  }

  public updateGroupItem(listname: string, itemId: number, Items: IGroup): Promise<boolean> {
    return new Promise<boolean>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listname).items.getById(itemId).update({
        Title: "Group 2",
        GroupSort: 1,
        IsDefault: false
      }).then(updategroup => {
        if (updategroup) {
          console.log("Update group item : ", updategroup);
          response(true);
        }
        else {
          response(false);
        }
      }).catch(error => {
        console.log("Update group item error : ", error);
        response(false);
      });
    });
  }
  //Group List Methods end

  //Common delete method for Group, Responaible, Status, Category, Comment, Task and Document.
  public deleteItem(listname: string, itemId: number): Promise<boolean> {
    return new Promise<boolean>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listname).items.getById(itemId).delete().then(deletegroup => {
        console.log("Delete group item : ", deletegroup);
        response(true);
      }).catch(error => {
        console.log("Delete group item error : ", error);
        response(false);
      });
    });
  }



  //Status list methods start
  public insertStatusItem(listName: string, items: IStatus): Promise<IStatus> {
    return new Promise<IStatus>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Title: items.Title,
        StatusSort: items.StatusSort,
        FontColor: items.FontColor,
        FillColor: items.FillColor
      }).then(insertstatus => {
        if (insertstatus) {
          console.log("Insert status item : ", insertstatus);
          let item: IStatus = {
            Title: insertstatus.data.Title,
            StatusSort: insertstatus.data.StatusSort,
            FontColor: insertstatus.data.FontColor,
            FillColor: insertstatus.data.FillColor,
            ID: insertstatus.data.ID,
            GUID: insertstatus.data.GUID
          };
          response(item);
        }
        else {
          response(null);
        }
      }).catch(error => {
        console.log("Insert status Item Error :", error);
        response(null);
      });
    });
  }

  public updateStatusItem(listname: string, itemId: number, items: IStatus): Promise<boolean> {
    return new Promise<boolean>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listname).items.getById(itemId).update({
        Title: items.Title,
        StatusSort: items.StatusSort,
        FontColor: items.FontColor,
        FillColor: items.FillColor
      }).then(updatestatus => {
        if (updatestatus) {
          console.log("Update status item : ", updatestatus);
          response(true);
        }
        else {
          response(false);
        }
      }).catch(error => {
        console.log("Update status item error : ", error);
        response(false);
      });
    });
  }
  //Status list method end

  //Responsible list method start
  public insertResponsibleItem(listName: string, items: IResponsibleParty): Promise<IResponsibleParty> {
    return new Promise<IResponsibleParty>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Title: items.Title,
        FontColor: items.FontColor,
        FillColor: items.FillColor
      }).then(insertResponsible => {
        if (insertResponsible) {
          console.log("Insert status item : ", insertResponsible);
          let item: IResponsibleParty = {
            Title: insertResponsible.data.Title,
            FontColor: insertResponsible.data.FontColor,
            FillColor: insertResponsible.data.FillColor,
            ID: insertResponsible.data.ID,
            GUID: insertResponsible.data.GUID
          };
          response(item);
        }
        else {
          response(null);
        }
      }).catch(error => {
        console.log("Insert status Item Error :", error);
        response(null);
      });
    });
  }

  public updateResponsibleItem(listName: string, itemId: number, items: IResponsibleParty): Promise<boolean> {
    return new Promise<boolean>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.getById(itemId).update({
        Title: items.Title,
        FontColor: items.FontColor,
        FillColor: items.FillColor
      }).then(updateResponsible => {
        if (updateResponsible) {
          console.log("Update status item : ", updateResponsible);
          response(true);
        }
        else {
          response(false);
        }
      }).catch(error => {
        console.log("Update status item error : ", error);
        response(false);
      });
    });
  }

  //Responsible list method end

  //Category list method start

  public insertCategoryItem(listName: string, items: ICategory): Promise<ICategory> {
    return new Promise<ICategory>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Title: items.Title,
        CategorySort: items.CategorySort,
        GroupId: items.Group.Id,
        ParentId: items.Parent.Id
      }).then(insertCategory => {
        if (insertCategory) {
          console.log("Insert category item : ", insertCategory);
          let item: ICategory = {
            Title: insertCategory.data.Title,
            CategorySort: insertCategory.data.CategorySort,
            Group: insertCategory.data.Group,
            Parent: insertCategory.data.Parent,
            ID: insertCategory.data.ID,
            GUID: insertCategory.data.GUID,
            children: [],
            key: insertCategory.data.ID,
            text: insertCategory.data.Title
          };
          response(item);
        }
        else {
          response(null);
        }
      }).catch(error => {
        console.log("Insert category item error message :", error);
        response(null);
      });
    });
  }

  public updateCategoryItem(listName: string, itemId: number, items: ICategory): Promise<boolean> {
    return new Promise<boolean>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.getById(itemId).update({
        Title: items.Title,
        CategorySort: items.CategorySort,
        GroupId: items.Group.Id,
        ParentId: items.Parent.Id
      }).then(updateCategory => {
        if (updateCategory) {
          console.log("Update category item : ", updateCategory);
          response(true);
        }
        else {
          response(false);
        }
      }).catch(error => {
        console.log("Update category item error message :", error);
        response(false);
      });
    });
  }

  //Category list method end

  //Comment list method start
  public insertCommentItem(listName: string, items: IComment): Promise<IComment> {
    return new Promise<IComment>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Comment: items.Comment,
        TaskId: items.Task.ID
      }).then(insertComments => {
        if (insertComments) {
          console.log("Insert comment list item : ", insertComments);
          let item: IComment = {
            Comment: items.Comment,
            Task: items.Task,
            ID: insertComments.data.ID,
            GUID: insertComments.data.GUID
          };
          response(item);
        }
        else {
          response(null);
        }
      }).catch(error => {
        console.log("Insert comment list item error : ", error);
        response(null);
      });
    });
  }


  public updateCommentItem(listName: string, itemId: number, items: IComment): Promise<boolean> {
    return new Promise<boolean>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.getById(itemId).update({
        Comment: items.Comment,
        TaskId: items.Task.ID
      }).then(updateComments => {
        if (updateComments) {
          console.log("Update comment list item : ", updateComments);
          response(true);
        }
        else {
          response(false);
        }
      }).catch(error => {
        console.log("Update comment list item error : ", error);
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

  public async commonlistViewCreation(listName: string, items: any): Promise<boolean> {
    const batch = this.web.createBatch();
    //const fields = ['Item', 'Group', 'ResponsibleParty', 'Status', 'SortOrder', 'Comments', this.DocumentsColumnTitle, 'ID', 'Created', 'Editor', 'Modified'];
    const fields = items;
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
    if (this.groupListGUID == null) {
      this.getListGUID("Group").then((value: string) => {
        this.groupListGUID = value;
      });
    }
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

  public async documentLibraryCreation(libraryName: string): Promise<boolean> {
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
    if (this.groupListGUID == null) {
      this.getListGUID("Group").then((value: string) => {
        this.groupListGUID = value;
      });
    }
    if (this.responsibleListGUID == null) {
      this.getListGUID("Responsible").then((value: string) => {
        this.responsibleListGUID = value;
      });
    }
    if (this.statusListGUID == null) {
      this.getListGUID("Status").then((value: string) => {
        this.statusListGUID = value;
      });
    }
    if (this.categoryListGUID == null) {
      this.getListGUID("Category").then((value: string) => {
        this.categoryListGUID = value;
      });
    }
    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 107, true).then(async taskresult => {
        if (taskresult.created) {
          console.log(taskresult.data.Id);
          this.taskListGUID = taskresult.data.Id;

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
    if (this.taskListGUID == null) {
      this.getListGUID("Task").then((value: string) => {
        this.taskListGUID = value;
      });
    }
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


  public async getListGUID(listName: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).get()
        .then(l => {
          resolve(l.Id);
        }).catch((error) => {
          console.log("List GUID Error : ", error);
          resolve(null);
        });
    });
  }

  //Get all library items using closing check list.
  public async getAllDocumentsForTasklist(listItemId: number[], doclistName: string): Promise<IDocument[]> {
    let batchSize = 50;
    let requests: Array<Promise<IDocument[]>> = new Array();
    let results: IDocument[] = [];
    if (listItemId.length <= batchSize) {
      listItemId.forEach((docId) => {
        requests.push(this.getDocument_Files(doclistName, docId));
      });
      await Promise.all(requests).then(listsCollection => {
        listsCollection.forEach((lists) => {
          results.push(...lists);
        });
        return results;
      });
    }
    else {
      let startIndex = 0;
      while (listItemId.length > startIndex) {
        let copyArray = [...listItemId];
        requests = new Array();
        copyArray.slice(startIndex, startIndex + batchSize).forEach((docId) => {
          requests.push(this.getDocument_Files(doclistName, docId));
        });
        await Promise.all(requests).then(listsCollection => {
          listsCollection.forEach((result) => {
            if (result) {
              results.push(...result);
            }
          });
        });
        startIndex += batchSize;
      }
    }
    return new Promise<IDocument[]>((resolve) => {
      resolve(results);
    });
  }
  public getDocument_Files(libraryname: string, libraryitemId: number): Promise<IDocument[]> {
    return new Promise<IDocument[]>((resolve) => {
      let documentsColl: IDocument[] = [];
      this.web.lists.getByTitle(libraryname).items.getById(libraryitemId)
        .select("Id",
          "OData__UIVersionString",
          "DocIcon",
          "File/ServerRelativeUrl",
          "Title",
          "UniqueId",
          "ContentType/Name",
          "Editor/Title",
          "Editor/Id",
          "Editor/FirstName",
          "Editor/LastName",
          "File/ParentFolder",
          "File",
          "File/Name",
          "File/Length",
          "Modified")
        .expand("Editor,ContentType,File,File/ParentFolder")
        .get()
        .then((document: IDocument) => {
          let files: IDocument = {
            File: document.File,
            ID: document.ID,
            Title: document.Title,
            DocIcon: document.DocIcon,
            UniqueId: document.UniqueId,
            Modified: document.Modified,
            Editor: document.Editor
          };
          documentsColl.push(files);
          resolve(documentsColl);
        }).catch(error => {
          console.log("Documents Error : ", error);
          return resolve([]);
        });
    });
  }
  public DeleteDocumentFolder(folderServerRelativeUrl: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.web.getFolderByServerRelativePath(folderServerRelativeUrl)
        .delete()
        .then(() => {
          resolve(true);
        }).catch(error => {
          console.log("Delete Tasks List Item : ", error);
          resolve(false);
        });
    });
  }
  public async createFolderInDocument(listname: string, foldername: string): Promise<ICreateFolder[]> {
    return new Promise<ICreateFolder[]>((resolve) => {
      let createFolderColl: ICreateFolder[] = [];
      this.web.lists.getByTitle(listname).rootFolder.folders.add(foldername)
        .then((result: ICreateFolder) => {
          let items: ICreateFolder = {
            data: result.data
          };
          createFolderColl.push(items);
          resolve(createFolderColl);
        }).catch(error => {
          console.log("Create Folder in document library : ", error);
          resolve([error]);
        });
    });
  }

  public isFolderExists(folderRelativePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.web.getFolderByServerRelativePath(folderRelativePath).get().then((result: any) => {
        if (result) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      }).catch((ex) => {
        console.log("isFolderExists > spHttpClient.get()...catch:", ex);
        resolve(false);
      });
    });
  }

  public uploadFile(libraryName: string, folderRelativePath: string, file: File): Promise<string> {
    return new Promise<string>((resolve) => {
      this.isFolderExists(folderRelativePath)
        .then((isFolderExists) => {
          if (isFolderExists) {
            resolve(this.uploadFileWithValidFolderPath(folderRelativePath, file));
          }
          else {
            this.createFolderInDocument(libraryName, this.utility.GetLeafName(folderRelativePath))
              .then((folderCreationResult) => {
                resolve(this.uploadFileWithValidFolderPath(folderRelativePath, file));
              });
          }
        });
    });
  }

  private uploadFileWithValidFolderPath(folderRelativePath: string, file: File): Promise<string> {
    return new Promise<string>((resolve) => {
      if (file.name.indexOf("%") > -1) {
        this.uploadDocumentFile(this._absoluteUrl, this._relativeUrl, folderRelativePath, file)
          .then((result) => {
            result.file.getItem().then(item => {
              item.update({
                Title: file.name
              }).then((results) => {
                if (result) {
                  resolve(item.ID);
                }
                else {
                  resolve("false");
                }
              });
            });
          });
      }
      else {
        let fileName = this.utility.EscapeSpecialCharacters(file.name);
        folderRelativePath = this.utility.EscapeSpecialCharacters(folderRelativePath);
        this.web.getFolderByServerRelativePath(folderRelativePath)
          .select("ID")
          .files
          .add(fileName, file, true)
          .then((f) => {
            f.file.getItem()
              .then((docitem: any) => {
                docitem.update({
                  Title: file.name
                })
                  .then((results) => {
                    if (f) {
                      resolve(docitem.ID);
                    }
                    else {
                      resolve("false");
                    }
                  });
              });
          }).catch((ex) => {
            console.log("Upload > spHttpClient.get()...catch:", ex);
            resolve("false");
          });
      }
    });
  }

  public uploadDocumentFile(webAbsoluteUrl: string, webRelativeUrl: string, folderRelativePath: string, file: any): Promise<any> {
    return new Promise<any>((resolve) => {
      this.getFileBuffer(file).then((fileContent) => {
        let fileGuid = util.getGUID();
        let postUrl: string = webAbsoluteUrl
          + "/_api/web/GetFolderByServerRelativePath(DecodedUrl=@a1)/Files/AddStubUsingPath(DecodedUrl=@a2)/StartUpload(uploadId=@a3)?@a1='"
          + this.utility.EscapeSpecialCharacters(webRelativeUrl + "/" + folderRelativePath) + "'&@a2='"
          + this.utility.EscapeSpecialCharacters(file.name) + "'&@a3=guid'" + fileGuid + "'";
        const spOpts: ISPHttpClientOptions = {
          headers: {
            "Content-Type": "application/json;odata=verbose",
            "odata-version": "3.0",
            "accept": "application/json;odata=verbose",
            "X-Http-Method": "POST"
          }
        };
        this._context.spHttpClient.post(postUrl, SPHttpClient.configurations.v1, spOpts)
          .then((result) => {
            result.json().then((responseJSON: any) => {
              resolve(this.finishUploadFile(webAbsoluteUrl, webRelativeUrl, folderRelativePath,
                file, fileContent, responseJSON, fileGuid));
            });
          })
          .catch((ex) => {
            console.log("uploadFile > spHttpClient.get()...catch:", ex);
            throw (ex);
          });
      });
    });
  }

  public finishUploadFile(webAbsoluteUrl: string, webRelativeUrl: string, folderRelativePath: string, file: any,
    fileContent: any, responseJSON: any, guid: string): Promise<any> {
    return new Promise<any>((resolve) => {
      let postUrl: string = webAbsoluteUrl
        + "/_api/web/GetFileByServerRelativePath(DecodedUrl=@a1)/FinishUpload(uploadId=@a2,fileOffset=@a3)?@a1='"
        + this.utility.EscapeSpecialCharacters(webRelativeUrl + "/" + folderRelativePath + "/" + file.name) + "'&@a2='"
        + guid + "'&@a3='" + responseJSON.d.StartUpload + "'";
      const spOpts: ISPHttpClientOptions = {
        headers: {
          "Content-Type": "application/json;odata=verbose",
          "odata-version": "3.0",
          "accept": "application/json;odata=verbose",
          "X-Http-Method": "POST"
        },
        body: fileContent
      };
      this._context.spHttpClient.post(postUrl, SPHttpClient.configurations.v1, spOpts)
        .then((result) => {
          result.json().then((resJSON: any) => {
            resolve(resJSON);
          });
        })
        .catch((ex) => {
          console.log("FinishUploadFile > spHttpClient.get()...catch:", ex);
          throw (ex);
        });
    });
  }

  private getFileBuffer(file): Promise<any> {
    return new Promise<any>((resolve) => {
      var reader = new FileReader();
      reader.onloadend = (e) => {
        resolve(reader.result);
      };
      reader.onerror = (e) => {
        resolve(null);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  public isFileExistsByFile(folderRelativePath: string, file: any): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let url: string = "";
      if (folderRelativePath && folderRelativePath != "") {
        url = folderRelativePath;
      }
      else {
        url = folderRelativePath;
      }
      let web = new Web(this._absoluteUrl);
      let path = url + "/" + file.name;
      path = this.utility.EscapeSpecialCharacters(path);
      web.getFileByServerRelativePath(path).get().then((result: any) => {
        if (result) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      }).catch((ex) => {
        console.log("isFileExists > spHttpClient.get()...catch:", ex);
        resolve(false);
      });

    });
  }

  public getFilesFromSpecificFolder(folderRelativePath: string, item: any, libraryName: string): Promise<any[]> {
    return new Promise<any[]>((resolve) => {
      let url: string;
      url = this.utility.EscapeSpecialCharacters(folderRelativePath);
      this.web.getFolderByServerRelativePath(url)
        .files
        .top(5000)
        .select("ServerRelativeUrl, Name")
        .get().then((data: any) => {
          let folderServerRelativeURL = this._context.pageContext.web.serverRelativeUrl.concat(
            "/" + libraryName + "/" + item.GUID
          );
          data.forEach(d => {
            d.Index = item.Index;
          });
          resolve(
            [{
              RelativePath: folderRelativePath,
              Files: data,
              ID: item.ID,
              FolderServerRelativeURL: folderServerRelativeURL,
              Index: item.Index
            }]);
        }).catch((ex) => {
          console.log("getFilesFromSpecificFolder > spHttpClient.get()...catch:", ex);
          return resolve([]);
        });
    });
  }

  //Bulk Delete method
  public async deleteBulkTaskListItemAndDocuments(listname: string, items: number[], folderRelativeUrl: string[]): Promise<boolean> {
    let batch = this.web.createBatch();
    let requests: Array<Promise<boolean>> = new Array();
    await this.deleteTaskItems(listname, items, batch).then(() => {
      requests.push(this.deletedocItems(folderRelativeUrl, batch));
    });
    let results: boolean;
    await Promise.all(requests).then(listsCollection => {
      listsCollection.forEach((lists) => {
        results = lists;
      });
      return results;
    });

    return new Promise<boolean>((resolve) => {
      resolve(true);
    });
  }

  public deleteTaskItems(listname: string, items: number[], batch: ODataBatch): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      items.forEach(i => {
        this.web.lists.getByTitle(listname).items.getById(i).inBatch(batch).delete().then(r => {
          console.log("deleted");
        }).catch(error => {
          console.log("Delete Tasks List Item : ", error);
        });
      });
      batch.execute().then(() => resolve(true)).catch((error) => { return resolve(false); });
    });
  }

  public deletedocItems(folderRelativeUrl: string[], batch: ODataBatch): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      folderRelativeUrl.forEach(i => {
        this.web.getFolderByServerRelativePath(i).inBatch(batch).delete().then(r => {
          console.log("deleted");
        }).catch(error => {
          console.log("Delete Tasks List Item : ", error);
        });
      });
      batch.execute().then(() => resolve(true)).catch((error) => { return resolve(false); });
    });
  }
  public downloadFolderFromDrive(
    libraryname: string,
    foldeRelativePath: string,
    webRelativeUrl: string,
    //p_ID?: string
    pagingText?: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let web = new Web(this._absoluteUrl);
      let parentFolderPath = this.utility.GetParentFolderPath(foldeRelativePath);
      let folderName = this.utility.GetLeafName(foldeRelativePath);
      let path = webRelativeUrl + "/" + parentFolderPath;
      web.lists.getByTitle(libraryname)
        .renderListDataAsStream({
          AllowMultipleValueFilterForTaxonomyFields: true,
          FolderServerRelativeUrl: path,
          RenderOptions: 4359,
          //Paging: "Paged=TRUE" + (p_ID ? "&p_ID=" + p_ID : "")
          Paging: pagingText ? pagingText : ""
        })
        .then((results) => {
          let driveUrl = results.ListSchema[".driveUrl"];
          let accessToken = results.ListSchema[".accessToken"];
          let callerStack = results.ListSchema[".callerStack"];
          let serviceUrl = results.ListSchema[".mediaBaseUrl"];
          //let nextP_Id = new URLSearchParams(results.ListData.NextHref).get("p_ID");
          this.TokenAquire(serviceUrl)
            .then((tokenResults) => {
              this.GetSocketIODetails(driveUrl)
                .then((socketIOResults) => {
                  if (results && results.ListData && results.ListData.Row) {
                    let isRecordExists: boolean = false;
                    results.ListData.Row.forEach((row) => {
                      if (row.FileLeafRef && row.FileLeafRef.toLowerCase() === folderName.toLowerCase()) {
                        let docId = row[".spItemUrl"].toString() + "&" + accessToken;
                        let notificationUrl = socketIOResults.notificationUrl;
                        let oAuthToken = tokenResults.access_token;
                        let downloadItems: IDownloadItems = {
                          items: [
                            {
                              isFolder: true,
                              name: folderName,
                              docId: docId
                            }
                          ]
                        };
                        serviceUrl += "/transform/zip?cs=" + callerStack;
                        this.DownloadZip(serviceUrl, downloadItems, notificationUrl,
                          oAuthToken, "", socketIOResults.id);
                        isRecordExists = true;
                        resolve(true);
                      }
                    });
                    if (!isRecordExists) {
                      // this.downloadFolderFromDrive(libraryname, foldeRelativePath,
                      //                                webRelativeUrl,nextP_Id);
                      resolve(this.downloadFolderFromDrive(libraryname, foldeRelativePath,
                        webRelativeUrl,
                        results.ListData.NextHref.split('?')[1]));
                    }
                  }
                  else {
                    resolve(false);
                  }
                });
            });
        });
    });
  }

  public downloadMultiFolderFromDrive(
    libraryname: string,
    foldeRelativePath: string[],
    webRelativeUrl: string,
    pagingText?: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let web = new Web(this._absoluteUrl);
      let parentFolderPath = this.utility.GetParentFolderPath(foldeRelativePath[0]);
      let folderName = this.utility.GetLeafName(foldeRelativePath[0]);
      let path = webRelativeUrl + "/" + parentFolderPath;
      web.lists.getByTitle(libraryname)
        .renderListDataAsStream({
          AllowMultipleValueFilterForTaxonomyFields: true,
          FolderServerRelativeUrl: path,
          RenderOptions: 4359,
          Paging: pagingText ? pagingText : ""
        })
        .then((results) => {
          let driveUrl = results.ListSchema[".driveUrl"];
          let callerStack = results.ListSchema[".callerStack"];
          let serviceUrl = results.ListSchema[".mediaBaseUrl"];
          serviceUrl += "/transform/zip?cs=" + callerStack;

          this.TokenAquire(serviceUrl)
            .then((tokenResults) => {
              let oAuthToken = tokenResults.access_token;

              this.GetSocketIODetails(driveUrl)
                .then(async (socketIOResults) => {

                  let notificationUrl = socketIOResults.notificationUrl;
                  let downloadItems: IDownloadItems = { items: [] };
                  let requests: Promise<IDownloadItems>[] = [];

                  foldeRelativePath.forEach((relPath) => {
                    parentFolderPath = this.utility.GetParentFolderPath(relPath);
                    folderName = this.utility.GetLeafName(relPath);
                    path = webRelativeUrl + "/" + parentFolderPath;
                    requests.push(this.getDownloadItem(libraryname, relPath, webRelativeUrl));
                  });

                  await Promise.all(requests).then((downloadItemsresults) => {
                    downloadItemsresults.forEach((downloadItemsresult) => {
                      if (downloadItemsresult) {
                        downloadItemsresult.items.forEach((item) => {
                          downloadItems.items.push(item);
                        });
                      }
                    });
                  });

                  this.DownloadZip(serviceUrl, downloadItems, notificationUrl,
                    oAuthToken, "", socketIOResults.id);

                  resolve(true);

                });
            });
        });
    });
  }

  private getDownloadItem(libraryname: string,
    foldeRelativePath: string,
    webRelativeUrl: string,
    pagingText?: string): Promise<IDownloadItems> {
    return new Promise<IDownloadItems>((resolve) => {
      let web = new Web(this._absoluteUrl);
      let parentFolderPath = this.utility.GetParentFolderPath(foldeRelativePath);
      let folderName = this.utility.GetLeafName(foldeRelativePath);
      let path = webRelativeUrl + "/" + parentFolderPath;
      web.lists.getByTitle(libraryname)
        .renderListDataAsStream({
          AllowMultipleValueFilterForTaxonomyFields: true,
          FolderServerRelativeUrl: path,
          RenderOptions: 4359,
          Paging: pagingText ? pagingText : ""
        })
        .then((results) => {
          let driveUrl = results.ListSchema[".driveUrl"];
          let accessToken = results.ListSchema[".accessToken"];
          let callerStack = results.ListSchema[".callerStack"];
          let serviceUrl = results.ListSchema[".mediaBaseUrl"];
          //let nextP_Id = new URLSearchParams(results.ListData.NextHref).get("p_ID");
          this.TokenAquire(serviceUrl)
            .then((tokenResults) => {
              this.GetSocketIODetails(driveUrl)
                .then((socketIOResults) => {
                  if (results && results.ListData && results.ListData.Row) {
                    let isRecordExists: boolean = false;
                    results.ListData.Row.forEach((row) => {
                      if (row.FileLeafRef && row.FileLeafRef.toLowerCase() === folderName.toLowerCase()) {
                        let docId = row[".spItemUrl"].toString() + "&" + accessToken;
                        let notificationUrl = socketIOResults.notificationUrl;
                        let oAuthToken = tokenResults.access_token;
                        let downloadItems: IDownloadItems = {
                          items: [
                            {
                              isFolder: true,
                              name: folderName,
                              docId: docId
                            }
                          ]
                        };
                        serviceUrl += "/transform/zip?cs=" + callerStack;
                        this.DownloadZip(serviceUrl, downloadItems, notificationUrl,
                          oAuthToken, "", socketIOResults.id);
                        isRecordExists = true;
                        resolve(downloadItems);
                      }
                    });
                    if (!isRecordExists) {
                      resolve(this.getDownloadItem(libraryname, foldeRelativePath,
                        webRelativeUrl,
                        results.ListData.NextHref.split('?')[1]));
                    }
                  }
                  else {
                    resolve(null);
                  }
                });
            });
        });
    });
  }

  private TokenAquire(serviceUrl: string): Promise<any> {
    return new Promise<any>((resolve) => {
      const digestCache: IDigestCache = (this._context as any).serviceScope.consume(DigestCache.serviceKey);
      digestCache.fetchDigest(this._context.pageContext.web.serverRelativeUrl).then((digest: string) => {
        const requestHeaders: Headers = new Headers();
        requestHeaders.append("Content-type", "application/json");
        requestHeaders.append("x-requestdigest", digest);
        const requestOptions: IHttpClientOptions = {
          headers: requestHeaders,
          body: JSON.stringify({
            resource: serviceUrl,
          }),
          method: "POST",
        };
        let url = this._context.pageContext.web.absoluteUrl + "/_api/SP.OAuth.Token/Acquire";
        this._context.spHttpClient.post(url, SPHttpClient.configurations.v1, requestOptions)
          .then((res) => {
            res.json().then((resJSON: any) => {
              resolve(resJSON);
            });
          })
          .catch((ex) => {
            resolve(null);
          });
      });
    });
  }

  private GetSocketIODetails(driveUrl: string): Promise<any> {
    return new Promise<any>((resolve) => {
      const digestCache: IDigestCache = (this._context as any).serviceScope.consume(DigestCache.serviceKey);
      digestCache.fetchDigest(this._context.pageContext.web.serverRelativeUrl).then((digest: string) => {
        const requestHeaders: Headers = new Headers();
        requestHeaders.append("accept", "application/json");
        const requestOptions: IHttpClientOptions = {
          headers: requestHeaders,
          method: "GET",
        };
        let url = driveUrl + "/root/subscriptions/socketIo";
        this._context.spHttpClient.get(url, SPHttpClient.configurations.v1, requestOptions)
          .then((res) => {
            res.json().then((resJSON: any) => {
              resolve(resJSON);
            });
          })
          .catch((ex) => {
            resolve(null);
          });
      });
    });
  }

  private DownloadZip(serviceUrl: string, downloadItems: IDownloadItems,
    notificationUrl: string, oAuthToken: string, accessToken: string, guid: string) {
    return new Promise<any>((resolve) => {

      var form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", serviceUrl);
      form.setAttribute("target", "_self");

      var downloadItemsHdnField = document.createElement("input");
      downloadItemsHdnField.setAttribute("type", "hidden");
      downloadItemsHdnField.setAttribute("name", "files");
      downloadItemsHdnField.setAttribute("value", JSON.stringify(downloadItems));
      form.appendChild(downloadItemsHdnField);

      var notificationUrlHdnField = document.createElement("input");
      notificationUrlHdnField.setAttribute("type", "hidden");
      notificationUrlHdnField.setAttribute("name", "notificationUrl");
      notificationUrlHdnField.setAttribute("value", notificationUrl);
      form.appendChild(notificationUrlHdnField);

      var oAuthTokenHdnField = document.createElement("input");
      oAuthTokenHdnField.setAttribute("type", "hidden");
      oAuthTokenHdnField.setAttribute("name", "oAuthToken");
      oAuthTokenHdnField.setAttribute("value", oAuthToken);
      form.appendChild(oAuthTokenHdnField);

      var accessTokenHdnField = document.createElement("input");
      accessTokenHdnField.setAttribute("type", "hidden");
      accessTokenHdnField.setAttribute("name", "accessToken");
      accessTokenHdnField.setAttribute("value", accessToken);
      form.appendChild(accessTokenHdnField);

      var providerHdnField = document.createElement("input");
      providerHdnField.setAttribute("type", "hidden");
      providerHdnField.setAttribute("name", "provider");
      providerHdnField.setAttribute("value", "spo");
      form.appendChild(providerHdnField);

      var guidHdnField = document.createElement("input");
      guidHdnField.setAttribute("type", "hidden");
      guidHdnField.setAttribute("name", "guid");
      guidHdnField.setAttribute("value", guid);
      form.appendChild(guidHdnField);

      let today = new Date();
      var zipFileNameHdnField = document.createElement("input");
      zipFileNameHdnField.setAttribute("type", "hidden");
      zipFileNameHdnField.setAttribute("name", "zipFileName");
      zipFileNameHdnField.setAttribute("value", "OneDrive_" + (SharePointDataProvider.globalFileDownloadIndex++) + "_" + (today.getMonth() + 1) + "_"
        + today.getDate() + "_" + today.getFullYear() + ".zip");
      form.appendChild(zipFileNameHdnField);

      var appIdHdnField = document.createElement("input");
      appIdHdnField.setAttribute("type", "hidden");
      appIdHdnField.setAttribute("name", "appId");
      appIdHdnField.setAttribute("value", "");
      form.appendChild(appIdHdnField);

      document.body.appendChild(form);
      form.submit();
    });
  }

  public IsSortColumnExists(listname: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let web = new Web(this._absoluteUrl);
      web.lists
        .configure(this.configOptions)
        .getByTitle(listname)
        .fields
        .getByInternalNameOrTitle("SortOrder")
        .get()
        .then(() => {
          resolve(true);
        })
        .catch((ex) => {
          resolve(false);
        });
    });
  }

  public updateSortFieldForItem(listName: string, itemId: number, sortIndex: number, group: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.web.lists
        .getByTitle(listName)
        .items
        .getById(itemId)
        .validateUpdateListItem([
          {
            FieldName: "SortOrder",
            FieldValue: sortIndex.toString(),
            HasException: false,
            ErrorMessage: null
          },
          {
            FieldName: "Group",
            FieldValue: group.toString(),
            HasException: false,
            ErrorMessage: null
          }
        ], false)
        .then((results: any) => {
          resolve(true);
        }).catch(error => {
          console.log("updateSortFieldForItem Closing checklist item : ", error);
          return resolve(null);
        });
    });
  }


}
