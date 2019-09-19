import { ICategory, IColumn } from "../../interfaces";
import _ from "lodash";
import { FieldTypes } from "sp-pnp-js";

export class Utilties {
     public static instance: Utilties;

     public constructor() {

    }

     public static get Instance() {
          if (!Utilties.instance) {
               Utilties.instance = new Utilties();
          }
          return Utilties.instance;
     }

     /**
  * Returns the site relative url from an absolute url
  */
     public GetRelativePathFromAbsolute(absoluteUrl) {

          var serverRelativeUrl =
               absoluteUrl.toLowerCase().replace(window.location.protocol.toLowerCase() + "//" + window.location.host.toLowerCase(), "");
          return serverRelativeUrl;
     }
     /**
      * Returns the site relative url from an absolute url
      */

     /**
       * Returns image url for the given filename.
       * The urls points to https://spoprod-a.akamaihd.net..... !!!
       */
     public GetImgUrl(fileName: string): string {
          let fileNameItems = fileName.split('.');
          let fileExtenstion = fileNameItems[fileNameItems.length - 1];
          return this.GetImgUrlByFileExtension(fileExtenstion);
     }

     public GetFieldInteralName(fileName:string):string{
          if(fileName){
               return fileName.toString().replace(" ", "_x0020_");
          }
     }


     /**
        * Returns image url for the given extension.
        * The urls points to https://spoprod-a.akamaihd.net..... !!!
        */
     public GetImgUrlByFileExtension(extension: string): string {
          // cuurently in SPFx with React I didn't find different way of getting the image
          // feel free to improve this
          let imgRoot: string = "https://spoprod-a.akamaihd.net/files/odsp-next-prod_ship-2017-04-21-sts_20170503.001/odsp-media/images/filetypes/16/";

          let imgType = "genericfile.png";
          imgType = extension + ".png";
          switch (extension) {
               case "ico":
               case "PNG":
                    imgType = "photo.png";
                    break;
               case "jpg":
                    imgType = "photo.png";
                    break;
               case "jpeg":
                    imgType = "photo.png";
                    break;
               case "jfif":
                    imgType = "photo.png";
                    break;
               case "gif":
                    imgType = "photo.png";
                    break;
               case "png":
                    imgType = "photo.png";
                    break;
               case "folder":
                    imgType = "folder.svg";
                    break;
               case "url":
                    imgType = "link.png";
                    break;
               case "ppt":
                    imgType = "pptx.png";
                    break;
               case "doc":
                    imgType = "docx.png";
                    break;
               case "js":
               case "css":
               case "onetoc2":
               case "vb":
               case "sql":
               case "nfo":
               case "mak":
               case "rb":
               case "json":
               case "nsi":
               case "py":
               case "rc":
               case "xls":
               case "ink":
               case "java":
               case "manifest":
               case "so":
               case "ini":
               case "chk":
               case "aspx":
               case "sig":
               case "ja":
               case "ps1":
               case "md":
               case "mp3":
               case "mp4":
               case "lnk":
               case "xsl":
               case "in":
               case "eot":
               case "svg":
               case "woff":
               case "woff2":
               case "otf":
               case "ttf":
               case "msg":
               case "xpi":
               case "rar":
               case "":
               case "config":
               case null:
                    imgType = "genericfile.png";
                    break;
          }
          return imgRoot + imgType;
     }

     public GetWebRelativeURL(DocumentTemplateUrl: string): string {
          let stringArray: string[] = DocumentTemplateUrl.split("/");
          if (stringArray.length > 2)
               return stringArray.splice(0, stringArray.length - 3).join("/");
          return "";
     }

     public GetListRelativeURL(DocumentTemplateUrl: string): string {
          let stringArray: string[] = DocumentTemplateUrl.split("/");
          if (stringArray.length > 2)
               return stringArray.splice(0, stringArray.length - 2).join("/");
          return "";
     }

     public GetListInternalName(DocumentTemplateUrl: string, listName: string): string {
          let stringArray: string[] = DocumentTemplateUrl.split("/");
          if (stringArray.length > 2)
               return stringArray[stringArray.length - 3].replace("_x0020_", " ");
          else {
               return listName.replace(" ", "");
          }
     }


     public EscapeSpecialCharactersForDownload(content: string): string {
          let result = encodeURIComponent(content);
          return result.replace(/\./g, "%2E");
     }


     public EscapeSpecialCharacters(content: string): string {
          let result = this.fixedEncodeURIComponent(content);
          return result.replace(/\./g, "%2E");
          //     return this.fixedEncodeURIComponent_2(content).replace(/\%/g, "%25")
          //      .replace(/\*/g, "%2A")
          //      .replace(/\(/g, "%28")
          //      .replace(/\)/g, "%29")
          //      .replace(/\-/g, "%2D")
          //      .replace(/\#/g, "%23")
          //      .replace(/\$/g, "%24")
          //      .replace(/\^/g, "%5E")
          //      .replace(/\./g, "%2E")
          //      .replace(/\@/g, "%40")
          //      .replace(/\(/g, "%28")
          //      .replace(/\)/g, "%29")
          //      .replace(/\!/g, "%21")
          //      .replace(/\+/g, "%2B")
          //      .replace(/\=/g, "%3D")
          //      .replace(/\~/g, "%7E")
          //      .replace(/\[/g, "%5B")
          //      .replace(/\]/g, "%5D")
          //      .replace(/\{/g, "%7B")
          //      .replace(/\}/g, "%7D")
          //      .replace(/\‘/g, "%E2%80%98")
          //      .replace(/\_/g, "%5F")
          //      .replace(/\&/g, "%26")
          //      .replace(/\,/g, "%2C")
          //      .replace(/\//g, "%2F")
          //      .replace(/\ /g, "%20")
          //      .replace(/-/g, "%2D")
          //      .replace(/\'/g, "%E2%80%98");
     }
     public fixedEncodeURIComponent(src) {
          return encodeURIComponent(src).replace(/[']/g, (c) => {
               return '%' + c.charCodeAt(0).toString(16) + '%' + c.charCodeAt(0).toString(16);
          });
     }

     public GetParentFolderPath(path: string): string {
          let split: string[] = path.split("/");
          if (split.length > 0)
               return split.slice(0, split.length - 1).join("/");
          return path;
     }

     public GetLeafName(path: string): string {
          if (path) {
               let items = path.split("/");
               return items[items.length - 1];
          }
          return "";
     }

     public convertCurrentDate(): string {
          let dateString = new Date().toString();
          let convertedDateStrings = new Date().toDateString().split(" ");
          let timezone = dateString
               .replace(/^.*GMT.*\(/, "")
               .replace(/\)$/, "");
          let timeString = new Date().toLocaleTimeString();
          let time = timeString.slice(0, timeString.lastIndexOf(":"));
          let returnDateString =
               convertedDateStrings[1] +
               " " +
               convertedDateStrings[2] +
               ", " +
               convertedDateStrings[3];
          returnDateString += " " + time + " " + "(" + timezone + ")";
          return returnDateString;
     }


     public GetOfficeEditUrl(listGuid: string, uniqueId: string,
          action: string, libFileName: string, absoluteUrl: string,
          relativeurl: string, ListItemid: string): string {
          let extension = this.splitDocIcon(relativeurl);
          let webUrl = "";
          let siteRelativeUrl = this.GetRelativePathFromAbsolute(absoluteUrl);

          if (extension == "docx") {
               webUrl = "/:w:/r" + siteRelativeUrl;
               return webUrl + "/_layouts/15/Doc.aspx?sourcedoc={" + uniqueId.toUpperCase() + "}&action=" + action + "&file=" + libFileName + "&mobileredirect=true";
          }
          else if (extension == "xlsx") {
               webUrl = "/:x:/r" + siteRelativeUrl;
               return webUrl + "/_layouts/15/Doc.aspx?sourcedoc={" + uniqueId + "}&action=" + action + "&uid={" + uniqueId.toUpperCase() + "}&ListItemId=" + ListItemid + "&ListId={" + listGuid.toUpperCase() + "}&odsp=1&env=prod";
          }
          else if (extension == "pptx") {
               webUrl = "/:p:/r" + siteRelativeUrl;
               return webUrl + "/_layouts/15/Doc.aspx?sourcedoc={" + uniqueId.toUpperCase() + "}&action=" + action + "&uid={" + uniqueId.toUpperCase() + "}&ListItemId=" + ListItemid + "&ListId={" + listGuid.toUpperCase() + "}&odsp=1&env=prod";
          }
          else if (extension == "one") {
               webUrl = "/:o:/r" + siteRelativeUrl;
               return webUrl + "/_layouts/15/WopiFrame.aspx?sourcedoc={" + uniqueId.toUpperCase() + "}&action=" + action + "&file=OneNote&IsFolder=1&ListId={" + listGuid + "}&ListItemId=" + ListItemid;
          }
          else {
               return relativeurl;
          }
     }

     public splitDocIcon(Name) {
          if (Name != "") {
               let splitIcon = Name.split('.');
               return splitIcon[splitIcon.length - 1].toLowerCase();
          }
          else {
               return "";
          }
     }

     public mapCategoryItems(categories: ICategory[]) {
       let newCategories: ICategory[] = [];
       categories.map((category) => {
        if(category.Parent) {
          const parentIndex = _.findIndex(newCategories, c => c.ID === category.Parent.Id);
          newCategories[parentIndex].children.push(category);
        } else {
          newCategories.push(category);
        }
      });

       return newCategories;
     }

     public filterColumnsByType(columns: IColumn[]) {
        let filteredColumns: IColumn[] = [];
        debugger;
        filteredColumns  = columns.filter((col) =>
          (col.FieldTypeKind === FieldTypes.DateTime ||
          col.FieldTypeKind === FieldTypes.Choice ||
          col.FieldTypeKind === FieldTypes.Integer ||
          col.FieldTypeKind === FieldTypes.MultiChoice ||
          col.FieldTypeKind === FieldTypes.Text ||
          col.FieldTypeKind === FieldTypes.User ||
          col.FieldTypeKind === FieldTypes.Boolean ||
          col.FieldTypeKind === FieldTypes.Note ||
          col.FieldTypeKind === FieldTypes.Number) && col.InternalName !== "SortOrder" && col.InternalName !== "Title"
        );
        return filteredColumns;
     }
}
