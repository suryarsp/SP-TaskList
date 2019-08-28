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
}
