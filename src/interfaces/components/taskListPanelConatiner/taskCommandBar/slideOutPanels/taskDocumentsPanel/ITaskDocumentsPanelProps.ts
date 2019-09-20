import { IWebPartContext } from "@microsoft/sp-webpart-base";
import { PermissionKind } from "sp-pnp-js";
import { ITaskList } from "../../../../..";

export interface ITaskDocumentsPanelProps {
  hidePanel: (isDirty: boolean) => void;
  currentItem: ITaskList;  
  libraryName: string;
  listName: string;
  WebPartContext: IWebPartContext;
  alwaysDownloadFiles: boolean;
  onClickDownloadAllDocuments: (currentItem: ITaskList) => void;
  listPermissions: { permission: PermissionKind, allowed: boolean }[];
  libraryPermissions: { permission: PermissionKind, allowed: boolean }[];
}
