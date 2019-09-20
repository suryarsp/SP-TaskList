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
import DragnDropContainer from '../../DragnDropContainer/DragnDropContainer';

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

  public openDocument(document: IDocument) {
    let file = document.File;
    if (document.DocIcon !== "url") {
      if (this.props.alwaysDownloadFiles && document.DocIcon !== "one") {
        if (isMobile) {
          window.open(file.ServerRelativeUrl, "_blank");
        } else {
          saveAs(file.ServerRelativeUrl, file.Name);
        }
      }
      else {
        window.open(this.Utilities.GetOfficeEditUrl(TaskDataProvider.documentLibraryUniqueID, document.UniqueId,
          "edit", document.File.Name,
          this.props.WebPartContext.pageContext.web.absoluteUrl,
          document.File.ServerRelativeUrl,
          document.ID.toString()), '_blank');
      }
    } else {
      if (isMobile) {
        window.open(file.ServerRelativeUrl, "_blank");
      } else {
        saveAs(file.ServerRelativeUrl, file.Name);
      }
    }
  }

  public displayExistingFiles(): IActivityItem[] {
    const existingFiles: IActivityItem[] = [];
    if (this.currentItem.Files && this.currentItem.Files.length > 0) {
      this.currentItem.Files.forEach((f, index) => {
        const file: IActivityItem = {
          key: index,
          activityDescription: [
            <div className={styles.fileDetails}>
              <span
                key={index}
                className={styles.docFileName}
              >
                <a onClick={() => this.openDocument(f)}> {f.File.Name} </a>
              </span>
              <span
                key={index}
                className={styles.docFileActions}
              >
                {
                  !(isMobile && isChrome) ? (<Icon
                    iconName="Download"
                    onClick={() => {
                      this.downloadExisitingFile(f);
                    }}
                    style={{
                      cursor: "pointer"
                    }}
                  />) : null
                }

                <Icon
                  iconName="Delete"
                  style={{
                    cursor: "pointer"
                  }}
                  onClick={() =>
                    this.setState({
                      currentCommandType: CommandTypes.DocumentDeleteConfirmation,
                      currentDocument: f
                    })
                  }
                />
              </span>
            </div>
          ],
          activityIcon: (
            <img src={this.Utilities.GetImgUrl(f.File.Name)} />
          ),
          comments: [
            <React.Fragment>
              <span key={index} className={styles.modifiedDoc}>
                Modified: {(f.Editor.LastName.trim() !== "" ? (f.Editor.LastName + ", ") : "") + f.Editor.FirstName + " - "}
                {f.Modified ? (
                  <ReactTimeAgo locale="en" date={new Date(f.Modified.toString())} />
                ) : null}
              </span>
            </React.Fragment>
          ]
        };
        existingFiles.push(file);
      });
    }
    return existingFiles;
  }


  public render(): React.ReactElement<ITaskDocumentsPanelProps> {
    let commands: JSX.Element = null;
    switch (this.state.currentCommandType) {
      case CommandTypes.DocumentDeleteInProgress:
      case CommandTypes.DocumentDeleteError:
      case CommandTypes.DocumentDeleteConfirmation: {
        commands = (<Dialog
          className="deleteDialog"
          hidden={false}
          onDismiss={this.onCancelDialogs.bind(this)}
          dialogContentProps={{
            type: DialogType.normal,
            title: this.state.currentCommandType === CommandTypes.DocumentDeleteInProgress ? "Deleting" : "Delete",
            subText: "Are you sure you want to send the item(s) to the site Recycle Bin?"
          }}
          modalProps={{
            titleAriaId: 'myLabelId',
            subtitleAriaId: 'mySubTextId',
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          <Icon iconName="FileTemplate" className="ms-IconExample" />
          {this.state.currentCommandType === CommandTypes.DocumentDeleteError ? (
            <label className={styles.errorInfo} >
              {this.state.errorMessage}
            </label>
          ) : null}
          <DialogFooter>
            <DefaultButton onClick={this.onCancelDialogs.bind(this)} text="Cancel" />
            <DefaultButton
              className="ms-Button--danger"
              disabled={
                this.state.currentCommandType === CommandTypes.DocumentDeleteInProgress
              }
              onClick={this.onDeleteExistingFile.bind(this)} text="Delete" >
              {this.state.currentCommandType === CommandTypes.DocumentDeleteInProgress ? (
                <div className="ms-Grid-col">
                  <Spinner size={SpinnerSize.medium} />
                </div>
              ) : null}
            </DefaultButton>
          </DialogFooter>
        </Dialog>);
      }
    }

    let conflictElements: JSX.Element = null;
    if (this.state.conflictFiles.length > 0) {
      conflictElements = (
        <div className="UploadFileContainer">
          <label className="ReplaceFileHead">{this.state.conflictFiles.length} item(s) wasn't uploaded</label>
          <div className={styles.textRight}>
            <DefaultButton onClick={this._onCancelAllDocuments.bind(this)} text="Cancel All" />
          </div>
          <hr />
          {
            this.state.conflictFiles.map((item: any) => {
              return <div className={styles.replaceContainer}>
                <label className={styles.FileNameLabel}>{item.Name}</label>

                <label className={styles.errorInfo} >
                  A file with this name already exists. Would you like to replace the existing one?
                                        </label>
                <div className={styles.FileActionBtn}>
                  <DefaultButton onClick={() => { this._onReplaceDocument(item); }} text="Replace" />
                  <DefaultButton onClick={() => { this._onCancelReplaceDocument(item, false); }} text="Cancel" />
                </div>
                <hr />
              </div>;
            })
          }
        </div>
      );
    }

    const files: Array<JSX.Element> = [];
    if (!this.state.isLoading) {
      const displayedFiles = this.displayExistingFiles();
      displayedFiles.forEach((item: { key: string | number }) => {
        const props = item;
        files.push(
          <ActivityItem
            {...props}
            key={item.key}
          />
        );
      });
    }
    return (
      <Layer>
        <div className={styles.slidePaneloverlay}>
          <div className={styles.commentspanel}>
            <div className={styles.header}>
              <div className={styles.closeButton}>
                <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() =>
                  this.props.hideDocumentsPanel(this.isDirty)} />
              </div>
              <div className={styles.commentsTitle}>
                {this.currentItem.Files.length > 0 ? "Documents (" +
                  this.currentItem.Files.length + ")" : "Documents"}

              </div>
            </div>
            <div className={styles.commentspanelInnerWrapper}>

              <div className={styles.groupTitle}>
                {this.currentItem.Group.Title.toUpperCase()}
              </div>

              <div className={styles.modifiedcontainer}>
                <span className={styles.modifiedtitleicon}>
                  <span className={styles.modifiedtitle}
                    dangerouslySetInnerHTML={{ __html: this.props.currentItem.Title }} />
                </span>
                <div className={styles.verticalSeperator}></div>
              </div>

              {/* Container */}
              {this.state.isLoading ? (
                <div className={styles.spinnerWrapper}>
                  <Spinner className={styles.spinnerWheel} label="loading..." />
                </div>
              ) : null}
              {(this.currentItem.Files.length > 0) && !(isMobile && isChrome) ? (
                <span className={styles.downloadAllDocument}
                  onClick={() =>
                    this.props.onClickDownloadAllDocuments(this.currentItem)}>
                  <i className={"ms-Icon ms-Icon--TextDocument"} aria-hidden="true"></i>
                  <span>Download all</span>
                </span>
              ) : null}
              {this.state.currentCommandType === CommandTypes.FilesUploadInProgress ? (
                <div>
                  <ProgressIndicator barHeight={5} progressHidden={false} label="Upload progress"
                    description={this.state.uploadProgressstatus}
                    percentComplete={this.state.completionPercentage} />
                  {conflictElements}
                </div>
              ) : null}
              {this.currentItem.Files.length > 0 ? (
                <div className={styles.documentScrollContent}>
                  {files}
                </div>
              ) : (
                  <div className={styles.documentScrollContent}>
                    <div className={styles.boldText}>
                      No documents attached to this task.
                                        </div>
                  </div>
                )}
              {/* Files Drop Section */}
              <div className={styles.DropZone}>
                <DragnDropContainer onDirectoryDrop={this.onDirectoryDrop.bind(this)}
                      onDrop={this.onDrop.bind(this)}>
                      <div className={styles.notification}>
                          {!isMobile ?
                                <div className={styles["emptyFoldersubText"]}>
                                    <span>Drag files here to upload (or)</span>
                                </div> : null
                          }
                          <div className={styles["emptyFoldersubText"]}>
                                <span><a href="javascript:void(0);"
                                    onClick={this.onClickBrowseFiles.bind(this)}>
                                    Click here to browse</a></span>
                          </div>
                      </div>
                </DragnDropContainer>
              </div>
              {commands}
              <div className={styles.hidden}>
                <input type="file" className={styles.inputHide} multiple ref={this.fileInput}
                  onChange={(event) => this._onFileUpload(event)} />
              </div>
              {/* End of container */}
            </div>
          </div>
        </div>
      </Layer>
    );
  }

}
