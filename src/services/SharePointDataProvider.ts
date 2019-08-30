import { IDataProvider } from "../interfaces/index";

import { IWebPartContext } from "@microsoft/sp-webpart-base";

import { Utilties } from "../common/helper/Utilities";
import { Web, util, ConfigOptions, ODataBatch, PermissionKind, ListItemFormUpdateValue } from "sp-pnp-js";

export class SharePointDataProvider implements IDataProvider {

  private _absoluteUrl: string;
  private _context: IWebPartContext;
  private _relativeUrl: string;
  private web: Web;
  private utility = new Utilties();
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
    return new Promise<Array<{ permission: PermissionKind, allowed: boolean }>>((resolve) => {
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
}
