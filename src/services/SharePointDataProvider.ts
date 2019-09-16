import { IDataProvider, IGroup, IStatus, ICategory, IColumn, IResponsibleParty, IComment, IDocument, ICreateFolder, ITaskList } from "../interfaces/index";

import { IWebPartContext } from "@microsoft/sp-webpart-base";

import { Utilties } from "../common/helper/Utilities";
import { Web, util, ConfigOptions, ODataBatch, PermissionKind, ListItemFormUpdateValue } from "sp-pnp-js";
import { IPermissions } from "./permissions/IPermissions";
import { SPHttpClient, ISPHttpClientOptions, IHttpClientOptions, IDigestCache, DigestCache } from "@microsoft/sp-http";
import IDownloadItems from "../interfaces/services/response/IDownloadItems";
import { ListDetailsConstants } from "../common/defaults/listView-constants";
import TaskDataProvider from "./TaskDataProvider";

export class SharePointDataProvider implements IDataProvider {

  private _absoluteUrl: string;
  public _context: IWebPartContext;
  public _relativeUrl: string;
  public web: Web;
  public utilities : Utilties;
  public DocumentsColumnTitle: string = "Documents";
  public static globalFileDownloadIndex: number = 1;
  private groupListGUID: string;
  private responsibleListGUID: string;
  private statusListGUID: string;
  private categoryListGUID: string;
  private documentLibraryGUID: string;
  private taskListGUID: string;
  private commentListGUID: string;
  private listNames =  TaskDataProvider.listNames;
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
    this.utilities = Utilties.Instance;
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
      web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "SortOrder", "IsDefault", "GUID").top(5000).get().then((groupitems: IGroup[]) => {
        console.log("Group : ", groupitems);
        console.log("Group JSON : ", JSON.stringify(groupitems));
        groupitems.map(element => {
          let items: IGroup = {
            ID: element.ID,
            IsDefault: element.IsDefault,
            Title: element.Title ? element.Title:"",
            SortOrder: element.SortOrder,
            GUID: element.GUID,
            key: element.Title ? element.Title: "",
            text: element.Title ? element.Title: ""
          };
          GroupListColl.push(items);
        });
        resolve(GroupListColl);
      });
    });
  }

  public getResponsibleParties(listname: string): Promise<IResponsibleParty[]> {
    let web: Web = new Web(this._absoluteUrl);
    let ResponsibleListColl: IResponsibleParty[] = [];
    return new Promise<IResponsibleParty[]>(resolve => {
      web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "FontColor", "FillColor", "GUID").top(5000).get().then((responsibleitems: IResponsibleParty[]) => {
        console.log("responsibleitems : ", responsibleitems);
        console.log("responsibleitems JSON : ", JSON.stringify(responsibleitems));
        responsibleitems.map(element => {
          let items: IResponsibleParty = {
            ID: element.ID,
            Title: element.Title ? element.Title : "",
            FontColor: element.FontColor,
            FillColor: element.FillColor,
            GUID: element.GUID
          };
          ResponsibleListColl.push(items);
        });
        resolve(ResponsibleListColl);
      });
    });
  }

  public getStatuses(listname: string): Promise<IStatus[]> {
    let web: Web = new Web(this._absoluteUrl);
    let StatusitemsListColl: IStatus[] = [];
    return new Promise<IStatus[]>(resolve => {
      web.lists.configure(this.configOptions).getByTitle(listname).items.select("Title", "ID", "SortOrder", "FontColor", "FillColor", "GUID").top(5000).get().then((Statusitems: IStatus[]) => {
        console.log("Status : ", Statusitems);
        console.log("Status JSON : ", JSON.stringify(Statusitems));
        Statusitems.map(element => {
          let items: IStatus = {
            ID: element.ID,
            FontColor: element.FontColor,
            Title: element.Title ? element.Title : "",
            FillColor: element.FillColor,
            SortOrder: element.SortOrder,
            GUID: element.GUID
          };
          StatusitemsListColl.push(items);
        });
        resolve(StatusitemsListColl);
      });
    });
  }

  public getCategories(listname: string): Promise<ICategory[]> {

    let selectItem = ["Title", "ID", "SortOrder", "Parent/Title", "Parent/Id", "GUID"];
    let expandItem = ["Parent"];
    if(TaskDataProvider.listNames.groupListName) {
      selectItem.push("Group/Title", "Group/Id");
      expandItem.push("Group");
    }
    let web: Web = new Web(this._absoluteUrl);
    let CategoryListColl: ICategory[] = [];
    return new Promise<ICategory[]>(resolve => {
      web.lists.configure(this.configOptions).getByTitle(listname).items.select(selectItem.toString()).expand(expandItem.toString()).top(5000).get().then((categoryitems: ICategory[]) => {
        console.log("category : ", categoryitems);
        console.log("category JSON : ", JSON.stringify(categoryitems));
        categoryitems.map(element => {
          let items: ICategory = {
            ID: element.ID,
            Title: element.Title ? element.Title :"",
            SortOrder: element.SortOrder,
            Group: element.Group,
            Parent: element.Parent,
            children: [],
            key: element.ID.toString(),
            text: element.Title ? element.Title :"",
            GUID: element.GUID
          };
          CategoryListColl.push(items);
        });
        resolve(CategoryListColl);
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
        taskField.map(element => {
          let fields: IColumn = {
            key: element["InternalName"],
            text: element["Title"]
          };
          taskFieldsColl.push(fields);
        });
        resolve(taskFieldsColl);
      });
    });
  }

  public getTaskListItem(listName:string):Promise<ITaskList[]>{
    let taskStatusName = "Task_x0020_Status";//this.utility.GetFieldInteralName("Task Status");
    let selectItem = ["Title", "ID", "SortOrder", "Parent/Title", "Parent/Id", "GUID","Category/Id","Category/Title","Responsible/Id","Responsible/Title",taskStatusName+"/Id",taskStatusName+"/Title"];
    let expandItem = ["Parent",taskStatusName,"Responsible","Category"];
    if(TaskDataProvider.listNames.groupListName) {
      selectItem.push("Group/Title", "Group/Id");
      expandItem.push("Group");
    }
    let TaskListColl: ITaskList[] = [];
    return new Promise<ITaskList[]>((resolve)=>{
      this.web.lists.getByTitle(listName).items.top(5000).select(selectItem.toString()).expand(expandItem.toString()).get().then(taskresult=>{
        console.log("Task List : ", taskresult);
        console.log("Task List JSON : ", JSON.stringify(taskresult));
        taskresult.map(element => {
          let items: ITaskList = {
            ID: element.ID,
            Title: element.Title ? element.Title :"",
            SortOrder: element.SortOrder,
            Group: element.Group,
            Parent: element.Parent,
            GUID: element.GUID,
            Category:element.Category,
            TaskStatus:element.taskStatusName,
            Responsible:element.Responsible
          };
          TaskListColl.push(items);
        });
        resolve(TaskListColl);
      }).catch(error=>{
        console.log("Get task list item error message :",error);
        resolve(null);
      });
    });
  }


  public insertTaskListItem(listName:string,taskItem:ITaskList):Promise<ITaskList>{
    return new Promise<ITaskList>((response)=>{
      let taskStatusName = "Task_x0020_Status";//this.utility.GetFieldInteralName("Task Status");
      let obj = {};
      if(taskItem.Group && taskItem.Parent){
        obj["ParentId"] = taskItem.Parent.Id;
        obj["GroupId"] = taskItem.Group.Id;
      }
      if(taskItem.Group)
      {
        obj["GroupId"] = taskItem.Group.Id;    
      }
      else if(taskItem.Parent){      
        obj["ParentId"] = taskItem.Parent.Id;       
      }
     
      obj["Title"] = taskItem.Title;
      obj["SortOrder"] = taskItem.SortOrder;     
      obj["CategoryId"] = taskItem.Category.Id;
      obj["ResponsibleId"] = taskItem.Responsible.Id;
      obj[taskStatusName+"Id"] = taskItem.TaskStatus.Id;

      this.web.lists.getByTitle(listName).items.add(obj).then((insertTask)=>{
        if (insertTask) {
          console.log("Insert category item : ", insertTask);
          let taskList : ITaskList = {
            Title: insertTask.data.Title,
            SortOrder: insertTask.data.SortOrder,
            Group: {
              Id:insertTask.data.GroupId
            },
            Parent: {
              Id:insertTask.data.ParentId
            },
            ID: insertTask.data.ID,
            GUID: insertTask.data.GUID,
            Category:{
              Id:insertTask.data.CategoryId
            },
            Responsible:{
              Id:insertTask.data.ResponsibleId
            },
            TaskStatus:{
              Id:insertTask.data.Task_x0020_Status
            }
          };
          response(taskList);
        }
        else {
          response(null);
        }
      }).catch(error=>{
        console.log("Insert Task list item error message : ", error);
        response(null);
      });
    });
  }

  //Group List Methods start
  public insertGroupItem(listName: string, group: IGroup): Promise<IGroup> {
    return new Promise<IGroup>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add({
        Title: group.Title,
        SortOrder: group.SortOrder,
        IsDefault: group.IsDefault
      }).then(inserttask => {
        if (inserttask) {
          console.log("Insert group item : ", inserttask);
          let item: IGroup = {
            Title: inserttask.data.Title,
            SortOrder: inserttask.data.SortOrder,
            ID: inserttask.data.ID,
            IsDefault: inserttask.data.IsDefault,
            GUID: inserttask.data.GUID,
            key: inserttask.data.Title,
            text: inserttask.data.Title
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

  public updateGroupItem(listname: string, itemId: number, group: IGroup): Promise<boolean> {
    return new Promise<boolean>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listname).items.getById(itemId).update({
        Title: group.Title,
        SortOrder: group.SortOrder,
        IsDefault: group.IsDefault
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
        SortOrder: items.SortOrder,
        FontColor: items.FontColor,
        FillColor: items.FillColor
      }).then(insertstatus => {
        if (insertstatus) {
          console.log("Insert status item : ", insertstatus);
          let item: IStatus = {
            Title: insertstatus.data.Title,
            SortOrder: insertstatus.data.SortOrder,
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
        SortOrder: items.SortOrder,
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
          console.log("insertResponsible item : ", insertResponsible);
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
        console.log("insertResponsible Item Error :", error);
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
          console.log("updateResponsible item : ", updateResponsible);
          response(true);
        }
        else {
          response(false);
        }
      }).catch(error => {
        console.log("updateResponsible item error : ", error);
        response(false);
      });
    });
  }

  //Responsible list method end

  //Category list method start

  public insertCategoryItem(listName: string, item: ICategory): Promise<ICategory> {
    let obj = {};
    if(item.Group && item.Parent){
      obj["Title"] = item.Title;
      obj["SortOrder"] = item.SortOrder;
      obj["ParentId"] = item.Parent.Id;
      obj["GroupId"] = item.Group.Id;
    }
    if(item.Group)
    {
      obj["Title"] = item.Title;
      obj["SortOrder"] = item.SortOrder;
      obj["GroupId"] = item.Group.Id;
    }
    else if(item.Parent){
      obj["Title"] = item.Title;
      obj["SortOrder"] = item.SortOrder;
      obj["ParentId"] = item.Parent.Id;
    }
    else{
      obj["Title"] = item.Title;
      obj["SortOrder"] = item.SortOrder;
    }

    console.log(obj);

    return new Promise<ICategory>((response) => {
      this.web.lists.configure(this.configOptions).getByTitle(listName).items.add(obj).then(insertCategory => {
        if (insertCategory) {
          console.log("Insert category item : ", insertCategory);
          let category : ICategory = {
            Title: insertCategory.data.Title,
            SortOrder: insertCategory.data.SortOrder,
            Group: {
              Id:insertCategory.data.GroupId
            },
            Parent: insertCategory.data.Parent,
            ID: insertCategory.data.ID,
            GUID: insertCategory.data.GUID,
            children: [],
            key: insertCategory.data.ID,
            text: insertCategory.data.Title
          };
          response(category);
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
        SortOrder: items.SortOrder,
        GroupId:  items.Group ? items.Group.Id : null,
        ParentId: items.Parent ? items.Parent.Id : null
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
          console.log(groupresult.data.Id);
          this.groupListGUID = groupresult.data.Id;
          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("SortOrder")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="SortOrder" Name="SortOrder" Required="TRUE" />'
                );
            });

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("IsDefault")
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

      }).catch(error => {
        console.log("Group List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async commonlistViewCreation(listName: string, items: string[]): Promise<boolean> {
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
          console.log(responsibleresult.data.Id);
          this.responsibleListGUID = responsibleresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("FontColor")
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
            .fields.getByInternalNameOrTitle("FillColor")
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
          console.log(statusresult.data.Id);
          this.statusListGUID = statusresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("SortOrder")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="SortOrder" Name="SortOrder" Required="TRUE"/>'
                );
            });

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("FontColor")
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
            .fields.getByInternalNameOrTitle("FillColor")
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
      }).catch(error => {
        console.log("Status List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async categoryMappingAfterGroup(listName:string,defaultGroup:string):Promise<boolean>{
    if (!this.groupListGUID) {
      this.getListGUID(this.listNames.groupListName).then((value: string) => {
        this.groupListGUID = value;
      });
    }
    return new Promise<boolean>((resolve)=>{
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async categoryresult => {

        await this.web.lists.configure(this.configOptions)
        .getByTitle(listName)
        .fields.getByInternalNameOrTitle("Group")
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
              '" ShowField="Title" RelationshipDeleteBehavior="None"><Default>'+defaultGroup+'</Default></Field>'
            );
        });

        batch.execute().then(() => {
          resolve(true);
        });
      }).catch(error => {
        console.log("Category List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async taskMappingAfterGroup(listName:string,defaultGroup:string):Promise<boolean>{
    if (!this.groupListGUID) {
      this.getListGUID(this.listNames.groupListName).then((value: string) => {
        this.groupListGUID = value;
      });
    }
    return new Promise<boolean>((resolve)=>{
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 107, true).then(async categoryresult => {

        await this.web.lists.configure(this.configOptions)
        .getByTitle(listName)
        .fields.getByInternalNameOrTitle("Group")
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
              '" ShowField="Title" RelationshipDeleteBehavior="None"><Default>'+defaultGroup+'</Default></Field>'
            );
        });

        batch.execute().then(() => {
          resolve(true);
        });
      }).catch(error => {
        console.log("Task List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async categoryListCreation(listName: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async categoryresult => {
          console.log(categoryresult.data.Id);
          this.categoryListGUID = categoryresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("SortOrder")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="SortOrder" Name="SortOrder" Required="TRUE" />'
                );
            });

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Parent")
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

          batch.execute().then(() => {
            resolve(true);
          });
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
            resolve(true);
          }
        }).catch(error => {
          console.log("Document Library Exists Or Not : ", error);
          resolve(false);
        });
    });
  }

  public async taskListCreation(listName: string): Promise<boolean> {
    if (!this.responsibleListGUID) {
      this.getListGUID(this.listNames.responsibleListName).then((value: string) => {
        this.responsibleListGUID = value;
      });
    }
    if (!this.statusListGUID) {
      this.getListGUID(this.listNames.statusListName).then((value: string) => {
        this.statusListGUID = value;
      });
    }
    if (!this.categoryListGUID) {
      this.getListGUID(this.listNames.categoryListName).then((value: string) => {
        this.categoryListGUID = value;
      });
    }
    if(!this.documentLibraryGUID){
      this.getListGUID(TaskDataProvider.libraryName).then((value:string)=>{
        this.documentLibraryGUID = value;
      });
    }
    if(!this.commentListGUID){
      this.getListGUID(this.listNames.commentsListName).then((value:string)=>{
        this.commentListGUID = value;
      });
    }
    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 107, true).then(async taskresult => {

          console.log(taskresult.data.Id);
          this.taskListGUID = taskresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("SortOrder")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Number" DisplayName="SortOrder" Name="SortOrder" Required="TRUE" />'
                );
            });

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Parent")
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
            .fields.getByInternalNameOrTitle("Category")
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
            .fields.getByInternalNameOrTitle("Task Status")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Task Status" Name="Task Status" Required="TRUE" List="' +
                  this.statusListGUID +
                  '" ShowField="Title" RelationshipDeleteBehavior="None"/>'
                );
            });

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Responsible")
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
            .fields.getByInternalNameOrTitle(this.DocumentsColumnTitle)
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

            await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Comments")
            .get()
            .then(isItem => {
            })
            .catch(error => {
              console.log("isisItem Error : ", error);
              this.web.lists.configure(this.configOptions)
                .getByTitle(listName)
                .fields.inBatch(batch)
                .createFieldAsXml(
                  '<Field Type="Lookup" DisplayName="Comments" Name="Comments" Required="TRUE" List="'+
                  this.commentListGUID+
                  '" ShowField="ID" RelationshipDeleteBehavior="None" Mult="TRUE"/>'
                );
            });
          batch.execute().then(() => {
            resolve(true);
          });
      }).catch(error => {
        console.log("Task List Exists Or Not : ", error);
        resolve(false);
      });
    });
  }

  public async commentsListCreation(listName: string): Promise<boolean> {
    if (!this.taskListGUID) {
      this.getListGUID(this.listNames.taskListName).then((value: string) => {
        this.taskListGUID = value;
      });
    }
    return new Promise<boolean>((resolve) => {
      const batch = this.web.createBatch();
      this.web.lists.configure(this.configOptions).ensure(listName, "", 100, true).then(async commentresult => {
          console.log(commentresult.data.Id);
          this.commentListGUID = commentresult.data.Id;

          await this.web.lists.configure(this.configOptions)
            .getByTitle(listName)
            .fields.getByInternalNameOrTitle("Comment")
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

          batch.execute().then(() => {
            resolve(true);
          });
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
            this.createFolderInDocument(libraryName, this.utilities.GetLeafName(folderRelativePath))
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
        let fileName = this.utilities.EscapeSpecialCharacters(file.name);
        folderRelativePath = this.utilities.EscapeSpecialCharacters(folderRelativePath);
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
          + this.utilities.EscapeSpecialCharacters(webRelativeUrl + "/" + folderRelativePath) + "'&@a2='"
          + this.utilities.EscapeSpecialCharacters(file.name) + "'&@a3=guid'" + fileGuid + "'";
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
        + this.utilities.EscapeSpecialCharacters(webRelativeUrl + "/" + folderRelativePath + "/" + file.name) + "'&@a2='"
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
      path = this.utilities.EscapeSpecialCharacters(path);
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
      url = this.utilities.EscapeSpecialCharacters(folderRelativePath);
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

  //List Delete start

  public deleteList(listName:string):Promise<boolean>{
    return new Promise<boolean>((resolve)=>{
      this.web.lists.getByTitle(listName).delete().then(deleteresult =>{
        resolve(true);
      }).catch(error =>{
        console.log("List delete error message : ",error);
      });
    });
  }

  public deleteListField(listName:string,fieldName:string):Promise<boolean>{
    return new Promise<boolean>((resolve)=>{
      this.web.lists.getByTitle(listName).fields.getByTitle(fieldName).delete().then((deletefield)=>{
        console.log("Delete field : ",deletefield);
        resolve(true);
      }).catch(error=>{
        console.log("Field deleted error message : ",error);
        resolve(false);
      });
    });
  }
  //List Delete End

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
      let parentFolderPath = this.utilities.GetParentFolderPath(foldeRelativePath);
      let folderName = this.utilities.GetLeafName(foldeRelativePath);
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
      let parentFolderPath = this.utilities.GetParentFolderPath(foldeRelativePath[0]);
      let folderName = this.utilities.GetLeafName(foldeRelativePath[0]);
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
                    parentFolderPath = this.utilities.GetParentFolderPath(relPath);
                    folderName = this.utilities.GetLeafName(relPath);
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
      let parentFolderPath = this.utilities.GetParentFolderPath(foldeRelativePath);
      let folderName = this.utilities.GetLeafName(foldeRelativePath);
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

  public async listExists(listname: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
         this.web.lists.filter("Title eq '" + listname + "'")
              .get()
              .then((islistExists) => {
                   if (islistExists.length > 0) {
                        TaskDataProvider.documentLibraryUniqueID = islistExists[0].Id;
                        resolve(true);
                   }
                   else {
                        resolve(false);
                   }
              }).catch(error => {
                   console.log("Closing CheckList Exists Or Not : ", error);
                   resolve(false);
              });
    });
}

public async libraryExists(libraryName: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
         this.web.lists.filter("Title eq '" + libraryName + "'").get().then((islibraryExists) => {
              if (islibraryExists.length > 0) {
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

}
