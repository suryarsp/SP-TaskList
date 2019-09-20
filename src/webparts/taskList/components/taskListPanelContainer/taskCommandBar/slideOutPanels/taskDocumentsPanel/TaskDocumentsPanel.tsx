import * as React from 'react';
import styles from './TaskDocumentsPanel.module.scss';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import {
  ITaskDocumentsPanelProps, ITaskDocumentsPanelState, IDataProvider,
  IActivityItem,
  IDocument,
  IDirectory,
  IFile, ITaskList
} from '../../../../../../../interfaces/index';
import {
  Icon,
  ActivityItem,
  Dialog,
  DialogType,
  DialogFooter,
  DefaultButton,
  Spinner,
  PrimaryButton,
  SpinnerSize,
  Label,
  ProgressIndicator,
  Layer,
  IconButton
} from "office-ui-fabric-react";
import { saveAs } from "file-saver";
import { PermissionKind } from "sp-pnp-js";
import * as JSZip from "jszip";
import * as JSZipUtils from "jszip-utils";
import { isMobile, isChrome } from "react-device-detect";
import * as _ from "lodash";
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
JavascriptTimeAgo.locale(en);

import ReactTimeAgo from "react-time-ago";
import { Utilties } from '../../../../../../../common/helper/Utilities';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';

const DocumentDeleteErrorMessage: string = "Sorry, something went wrong while deleting the document(s).";
const CommandTypes = {
  None: "None",
  DocumentDeleteConfirmation: "DocumentDeleteConfirmation",
  DocumentDeleteInProgress: "DocumentDeleteInProgress",
  DocumentDeleteError: "DocumentDeleteError",
  FilesUploadInProgress: "FilesUploadInProgress",
  FileUploadAccessDenied: "FileUploadAccessDenied"
};

export default class TaskDocumentsPanel extends React.Component<ITaskDocumentsPanelProps, ITaskDocumentsPanelState> {

  private dataProvider: IDataProvider;
  private Utilities = new Utilties();
  private filesToBeUploaded: IFile[];
  private totalFiles: number;
  private fileCounter: number;
  private uploadedDocumentsIds = new Array<number>();
  private fileInput: any;
  private currentItem: ITaskList;
  private folderServerRelativePath: string;
  private isDirty: boolean;
  constructor(props: ITaskDocumentsPanelProps) {
    super(props);
    this.state = {
      currentCommandType: CommandTypes.None,
      currentDocument: null,
      errorMessage: "",
      completionPercentage: 0,
      conflictFiles: [],
      message: "",
      uploadProgressstatus: "",
      isLoading: true
    };
    this.dataProvider = TaskDataProvider.Instance;
    this.fileInput = React.createRef();
    this.filesToBeUploaded = [];
    this.currentItem = props.currentItem;
    this.currentItem.Directory = null;
    this.currentItem.Files = [];
    this.folderServerRelativePath = this.props.libraryName + "/" + this.currentItem.GUID;
    this.isDirty = false;
  }

  public componentDidMount() {
    this.getDocuments();
  }

  private getDocuments() {
    const itemIds = this.currentItem.Documents.map(s => s['Id']);
    this.dataProvider.getAllDocumentsForTasklist(itemIds, this.props.libraryName)
      .then((value) => {
        const sortedDocuments = _.orderBy(value, f => new Date(f.Modified), "desc");
        this.currentItem.Files = sortedDocuments;
        this.setState({
          isLoading: false
        });
      });
  }

  public componentWillReceiveProps(props: ITaskDocumentsPanelProps) {

  }

  public downloadExisitingFile(file: IDocument) {

    if (isMobile) {
      window.open(file.File.ServerRelativeUrl, "_blank");
    } else {
      saveAs(file.File.ServerRelativeUrl, file.File.Name);
    }
  }
  public onDeleteExistingFile() {
    // delete the exisiting file and update the files
    if (this.state.currentDocument) {
      this.isDirty = true;
      this.setState({
        currentCommandType: CommandTypes.DocumentDeleteInProgress
      });
      let file = this.state.currentDocument;
      this.dataProvider
        .deletedocumentsFromLibrary(this.props.libraryName, file.ID)
        .then(isDeleted => {
          if (isDeleted) {
            const item = this.currentItem;
            this.currentItem.Files = item.Files.filter(f => f.ID !== file.ID);
            this.setState({
              currentCommandType: CommandTypes.None,
              currentDocument: null
            });
            this.onCancelDialogs();
          }
          else {
            this.setState({
              currentCommandType: CommandTypes.DocumentDeleteError,
              errorMessage: DocumentDeleteErrorMessage
            });
          }
        }).catch((ex) => {
          this.setState({
            currentCommandType: CommandTypes.DocumentDeleteError,
            errorMessage: DocumentDeleteErrorMessage
          });
        });
    }
    else {
      this.onCancelDialogs();
    }
  }

  public onDrop(directory: IDirectory) {
    if (directory) {
      let files: IFile[] = directory.Files.map((file) => {
        let outPut: IFile = {
          File: file,
          Name: file.name,
          FolderPath: this.folderServerRelativePath
        };
        return outPut;
      });
      this.isDirty = true;
      this.UploadFiles(files, this.currentItem.ID);
    }
  }

  public onDirectoryDrop(directory: IDirectory) {
    if (directory) {
      let files: IFile[] = directory.Files.map((file) => {
        let outPut: IFile = {
          File: file,
          FolderPath: this.folderServerRelativePath,
          Name: file.name
        };
        return outPut;
      });
      this.isDirty = true;
      this.UploadFiles(files, this.currentItem.ID);
    }
  }

  private UploadFiles(files: IFile[], cclistitemid: number)
    : Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      let dataProvider = TaskDataProvider.Instance;
      this.setState({
        message: "",
        currentCommandType: CommandTypes.FilesUploadInProgress,
        completionPercentage: 0,
        uploadProgressstatus: ""
      });
      if (!this.filesToBeUploaded) {
        this.filesToBeUploaded = [];
      }
      this.filesToBeUploaded.push(...files);
      this.totalFiles = this.filesToBeUploaded.length;
      this.fileCounter = 0;
      let conflictFilesClone = [...this.state.conflictFiles];
      for (let index = 0; index < this.filesToBeUploaded.length; index++) {
        var fl = this.filesToBeUploaded[index];
        let file = fl.File;
        let isFileExists = this.currentItem.Files.filter((f) => f.Title.toLowerCase() === file.name.toLowerCase()).length > 0;
        if (!isFileExists) {
          await dataProvider.isFileExistsByFile(fl.FolderPath, fl.File)
            .then(async (res: boolean) => {
              if (!res) {
                await this.uploadFile(fl.File, fl.FolderPath)
                  .then((num) => {
                    this.uploadedDocumentsIds.push(num);
                    const newUploadedFile: IDocument = {
                      Title: fl.Name,
                      File: {
                        Name: fl.Name,
                        ServerRelativeUrl: fl.FolderPath
                      },
                      DocIcon: "",
                      ID: num,
                      Modified: new Date().toString(),
                      UniqueId: "",
                      Editor: {
                        Id: 0,
                        Title: this.props.WebPartContext.pageContext.user.displayName,
                        FirstName: this.props.WebPartContext.pageContext.user.displayName,
                        LastName: ""
                      }
                    };
                    const currentFiles = [...this.currentItem.Files];
                    this.currentItem.Files = [newUploadedFile, ...currentFiles];
                    if (this.fileCounter >= this.totalFiles) {
                      this.filesToBeUploaded = [];
                      this.fileCounter = 0;
                      this.totalFiles = 0;
                      this.setState({
                        currentCommandType: CommandTypes.None,
                        conflictFiles: [],
                        completionPercentage: 0,
                        errorMessage: "",
                        message: "",
                        uploadProgressstatus: ""
                      });
                    }
                    else {
                      this.forceUpdate();
                    }
                  });
              } else {
                conflictFilesClone.push({
                  Name: fl.File.name,
                  File: fl.File,
                  FolderRelativePath: fl.FolderPath
                });
                this.setState({
                  conflictFiles: conflictFilesClone,
                  currentCommandType: CommandTypes.FilesUploadInProgress
                });
              }
            });
        }
        else {
          conflictFilesClone.push({
            Name: fl.File.name,
            File: fl.File,
            FolderRelativePath: fl.FolderPath
          });
          this.setState({
            conflictFiles: conflictFilesClone,
            currentCommandType: CommandTypes.FilesUploadInProgress
          });
        }
      }
      const exisitingDocumentIds = this.currentItem.Documents.map(s => s["Id"]);
      this.uploadedDocumentsIds.push(...exisitingDocumentIds);
      dataProvider.updateDocumentIdToTaskList(this.props.listName, cclistitemid, this.uploadedDocumentsIds)
        .then(resultdata => {
          resolve(true);
        })
        .catch(error => {
          resolve(false);
        });
    });
  }


  private uploadFile(file, folderRelativePath: string): Promise<number> {
    return new Promise<number>(resolve => {
      let dataProvider = TaskDataProvider.Instance;
      dataProvider.uploadFile(this.props.libraryName, folderRelativePath, file)
        .then(f => {
          this.fileCounter += 1;
          if (this.fileCounter >= this.totalFiles) {
            this.totalFiles = 0;
            this.fileCounter = 0;
            this.filesToBeUploaded = [];
            this.setState({
              conflictFiles: [],
              currentCommandType: CommandTypes.None
            });
          } else {
            this.setState(
              {
                completionPercentage: this.fileCounter / this.totalFiles,
                uploadProgressstatus: "Uploaded " + this.fileCounter + "/" + this.totalFiles
              }
            );
          }
          resolve(Number(f));
        })
        .catch(ex => {
          var conflictFilesClone = [...this.state.conflictFiles];
          conflictFilesClone.push({
            Name: file.name,
            File: file,
            FolderRelativePath: folderRelativePath
          });
          this.setState({
            conflictFiles: conflictFilesClone
          });
          resolve(null);
        });
    });
  }

  private _onCancelAllDocuments() {
    this.fileCounter += this.state.conflictFiles.length;
    this.setState({
      conflictFiles: [],
      currentCommandType: this.fileCounter >= this.totalFiles ? CommandTypes.None
        : CommandTypes.FilesUploadInProgress
    });
    if (this.fileCounter >= this.totalFiles) {
      this.totalFiles = 0;
      this.fileCounter = 0;
      this.filesToBeUploaded = [];
    }
  }

  private _onCancelReplaceDocument(fileInfo: any, skipFileCounter: boolean): void {
    if (!skipFileCounter) {
      this.fileCounter += 1;
    }
    let conflictFiles = [...this.state.conflictFiles];
    let fileIndex = -1;
    conflictFiles.forEach((file, index) => {
      if (file.Name === fileInfo.Name) {
        fileIndex = index;
      }
    });
    if (fileIndex > -1) {
      conflictFiles.splice(fileIndex, 1);
      this.setState({
        conflictFiles: conflictFiles,
        currentCommandType: this.fileCounter >= this.totalFiles ? CommandTypes.None
          : CommandTypes.FilesUploadInProgress,
        uploadProgressstatus: "Uploaded " + this.fileCounter + "/" + this.totalFiles
      });
      if (this.fileCounter >= this.totalFiles) {
        this.totalFiles = 0;
        this.fileCounter = 0;
        this.filesToBeUploaded = [];
      }
    }
  }

  private _onReplaceDocument(fileInfo: any) {
    this.uploadFile(fileInfo.File, fileInfo.FolderRelativePath);
    this._onCancelReplaceDocument(fileInfo, true);
  }

  private async _onFileUpload(event) {
    if (event && event.target && event.target.files && event.target.files.length > 0) {
      if (this.props.listPermissions.length === 0)
        return;
      let canAddItem = this.props.listPermissions.filter(item => item.permission == PermissionKind.AddListItems)[0].allowed;
      if (!canAddItem) {
        this.setState({
          currentCommandType: CommandTypes.FileUploadAccessDenied,
          message: "Access denied."
        });
        return;
      }
      let filesToUpload: IFile[] = [];
      for (let index = 0; index < event.target.files.length; index++) {
        let file = event.target.files[index];
        filesToUpload.push({
          File: file,
          FolderPath: this.folderServerRelativePath,
          Name: file.name
        });
      }
      this.isDirty = true;
      this.UploadFiles(filesToUpload, this.currentItem.ID);
      if (this.fileInput && this.fileInput.current) {
        (this.fileInput.current as HTMLInputElement).value = null;
      }
    }
  }

  public onClickBrowseFiles() {
    (this.fileInput.current as HTMLInputElement).click();
  }

  private _onRenderFooterContent = () => {
    return (
      <div>
        <DefaultButton onClick={() => this.props.hideDocumentsPanel(this.isDirty)}>
          Cancel
        </DefaultButton>
      </div>
    );
  }

  public onCancelDialogs() {
    this.setState({
      currentCommandType: CommandTypes.None,
      currentDocument: null,
      errorMessage: ""
    });
  }


  public render(): React.ReactElement<ITaskDocumentsPanelProps> {
    return (
      <div>
        <Panel
          isOpen={true}
          type={PanelType.medium}
          onDismiss={() => { this.props.hideDocumentsPanel(this.isDirty); }}
          headerText="Documents"
          closeButtonAriaLabel="Close"
        >
        </Panel>
      </div>
    );
  }
}
