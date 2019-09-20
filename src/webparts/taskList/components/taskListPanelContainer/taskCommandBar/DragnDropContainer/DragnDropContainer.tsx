import * as React from "react";
import styles from "./DragnDropContainer.module.scss";
import { isIE, isEdge, isFirefox, isChrome, isMobile } from "react-device-detect";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { IDragnDropContainerProps, IDragnDropContainerState, IDirectory } from "../../../../../../interfaces";


export default class DragnDropContainer extends React.Component<
     IDragnDropContainerProps,
     IDragnDropContainerState
> {
     constructor(props: IDragnDropContainerProps) {
          super(props);
          this.state = {
               styleSheetClasses: [styles.dropDiv]
          };
     }

     public render(): React.ReactElement<IDragnDropContainerProps> {
               if(!isMobile) {
                    return(
                         <div
                              className={this.state.styleSheetClasses.join(" ")}
                              onDragEnter={this.onDragEnter.bind(this)}
                              onDragOver={this.onDragOver.bind(this)}
                              onDragEnd={this.onDragLeave.bind(this)}
                              onDragLeave={this.onDragLeave.bind(this)}
                              onDrop={this.onFolderOrFilesDrop.bind(this)}
                         >
                              {this.props.children}
                         </div>
                    );
               } else {
                    return (
                         <div
                         className={this.state.styleSheetClasses.join(" ")}
                    >
                         {this.props.children}
                    </div>
                    );
               }
          //  if (isChrome && Environment.type === EnvironmentType.ClassicSharePoint) {
          //    return (
          //      <Dropzone
          //        acceptStyle={{}}
          //        activeStyle={{}}
          //        acceptClassName={styles.dropZoneAccept}
          //        activeClassName={styles.dropZoneActive}
          //        onDrop={this.props.onDrop.bind(this)}
          //        disableClick={true}
          //      >
          //        {this.props.children}
          //      </Dropzone>);
          //  }
          //  else {
          //    return (
          //      <div className={styles.folderDropDiv}>
          //        <div className={this.state.styleSheetClasses.join(" ")}
          //          onDragEnter={this.onDragEnter.bind(this)}
          //          onDragOver={this.onDragOver.bind(this)}
          //          onDragEnd={this.onDragLeave.bind(this)}
          //          onDragLeave={this.onDragLeave.bind(this)}
          //          onDrop={this.onFolderOrFilesDrop.bind(this)}>
          //          {this.props.children}
          //        </div>
          //      </div>
          //    );
          //  }
          //}
          //     else {
          //       if (isChrome && Environment.type === EnvironmentType.ClassicSharePoint) {
          //         return (
          //           <Dropzone
          //             acceptStyle={{}}
          //             activeStyle={{}}
          //             acceptClassName={styles.dropZoneAccept}
          //             activeClassName={styles.dropZoneActive}
          //             onDrop={(files) => { alert(files.length); this.props.onDrop(files); }}
          //             disableClick={true}
          //           >
          //             {this.props.children}
          //           </Dropzone>);
          //       }
          //       else {
          //         return (
          //           <div className={this.state.styleSheetClasses.join(" ")}
          //             onDragEnter={this.onDragEnter.bind(this)}
          //             onDragOver={this.onDragOver.bind(this)}
          //             onDragEnd={this.onDragLeave.bind(this)}
          //             onDragLeave={this.onDragLeave.bind(this)}
          //             onDrop={this.onFolderOrFilesDrop.bind(this)}>
          //             {this.props.children}
          //           </div>
          //         );
          //       }
          // }
     }

     public onDragLeave(e) {
          this.setState({
               styleSheetClasses: [styles.dropDiv]
          });
          e.preventDefault();
     }

     public onDragEnter(e) {
          if (this.state.styleSheetClasses.length === 1) {
               this.setState({
                    styleSheetClasses: [
                         styles.dropDiv,
                         styles.dropDivIsDragEnter
                    ]
               });
          }
          e.preventDefault();
     }

     public onDragOver(e) {
          if (this.state.styleSheetClasses.length === 1) {
               this.setState({
                    styleSheetClasses: [
                         styles.dropDiv,
                         styles.dropDivIsDragEnter
                    ]
               });
          }
          e.preventDefault();
     }

     public cancelEvent(e) {
          e.preventDefault();
     }

     public iterateEntries(entry, directory: IDirectory): Promise<boolean> {
          return new Promise<boolean>(async resolve => {
               if (entry.isDirectory) {
                    let dir: IDirectory = {
                         Title: entry.name,
                         Files: [],
                         ChildDirectories: []
                    };
                    directory.ChildDirectories.push(dir);
                    let requests: Array<Promise<boolean>> = new Array();
                    var reader = entry.createReader();
                    reader.readEntries(async readEntries => {
                         for (var i = 0; i < readEntries.length; i++) {
                              requests.push(
                                   this.iterateEntries(readEntries[i], dir)
                              );
                         }
                         await Promise.all(requests).then(
                              resultCollection => {}
                         );
                         resolve(true);
                    });
               } else if (entry.isFile) {
                    if (entry.file) {
                         entry.file(file => {
                              directory.Files.push(file);
                              resolve(true);
                         });
                    }
               } else {
                    let requests: Array<Promise<boolean>> = new Array();
                    entry.forEach(element => {
                         requests.push(this.iterateEntries(element, directory));
                    });
                    await Promise.all(requests).then(resultCollection => {});
                    resolve(true);
               }
          });
     }

     private readReaderUntilAllFilesFound(
          reader: any,
          childDirectory: any,
          requests: any,
          rootDirectory,
          index,
          itemsLength
     ) {
          reader.readEntries(async readEntries => {
               for (var j = 0; j < readEntries.length; j++) {
                    requests.push(
                         this.iterateEntries(readEntries[j], childDirectory)
                    );
               }
               if (readEntries.length > 0) {
                    await Promise.all(requests).then(resultCollection => {
                         requests = [];
                         this.readReaderUntilAllFilesFound(
                              reader,
                              childDirectory,
                              requests,
                              rootDirectory,
                              index,
                              itemsLength
                         );
                    });
               } else {
                    if (index + 1 >= itemsLength) {
                         this.props.onDirectoryDrop(rootDirectory);
                    }
               }
          });
     }

     public onFolderOrFilesDrop(event: any) {
          this.setState({
               styleSheetClasses: [styles.dropDiv]
          });
          let rootDirectory: IDirectory = {
               Title: "Root",
               Files: [],
               ChildDirectories: []
          };
          if (
               isEdge ||
               isIE ||
               isFirefox ||
               (isChrome &&
                    Environment.type === EnvironmentType.ClassicSharePoint)
          ) {
               if (event.dataTransfer && event.dataTransfer.items) {
                    let itemsLength = event.dataTransfer.items.length;
                    let filesCount = 0;
                    for (
                         var index = 0;
                         index < event.dataTransfer.items.length;
                         index++
                    ) {
                         var item = event.dataTransfer.items[index];
                         if (item.webkitGetAsEntry) {
                              var entry = item.webkitGetAsEntry();
                              let isFolder = entry ? entry.isDirectory : false;
                              if (isFolder) {
                                   let childDirectory: IDirectory = {
                                        Title: entry.name,
                                        Files: [],
                                        ChildDirectories: []
                                   };
                                   rootDirectory.ChildDirectories.push(
                                        childDirectory
                                   );
                                   let requests: Array<
                                        Promise<boolean>
                                   > = new Array();
                                   var reader = entry.createReader();
                                   if (isEdge || isChrome) {
                                        this.readReaderUntilAllFilesFound(
                                             reader,
                                             childDirectory,
                                             requests,
                                             rootDirectory,
                                             index,
                                             itemsLength
                                        );
                                   } else {
                                        reader.readEntries(
                                             async readEntries => {
                                                  for (
                                                       var j = 0;
                                                       j < readEntries.length;
                                                       j++
                                                  ) {
                                                       requests.push(
                                                            this.iterateEntries(
                                                                 readEntries[j],
                                                                 childDirectory
                                                            )
                                                       );
                                                  }
                                                  await Promise.all(
                                                       requests
                                                  ).then(resultCollection => {
                                                       if (
                                                            index + 1 >=
                                                            itemsLength
                                                       ) {
                                                            this.props.onDirectoryDrop(
                                                                 rootDirectory
                                                            );
                                                            event.preventDefault();
                                                       }
                                                  });
                                             }
                                        );
                                   }
                              } else {
                                   filesCount += 1;
                                   if (entry) {
                                        entry.file(file => {
                                             rootDirectory.Files.push(file);
                                             filesCount -= 1;
                                             if (filesCount === 0) {
                                                  this.props.onDirectoryDrop(
                                                       rootDirectory
                                                  );
                                                  event.preventDefault();
                                             }
                                        });
                                   }
                              }
                         }
                    }
               } else if (isIE) {
                    if (
                         event.dataTransfer &&
                         event.dataTransfer.files &&
                         event.dataTransfer.files.length > 0
                    ) {
                         for (
                              var idx = 0;
                              idx < event.dataTransfer.files.length;
                              idx++
                         ) {
                              rootDirectory.Files.push(
                                   event.dataTransfer.files[idx]
                              );
                         }
                         this.props.onDirectoryDrop(rootDirectory);
                         event.preventDefault();
                    }
               }
          }
          //     else if (isIE) {
          //       if (event.dataTransfer && event.dataTransfer.files) {
          //         for (var idx = 0; idx < event.dataTransfer.files.length; idx++) {
          //           rootDirectory.Files.push(event.dataTransfer.files[idx]);
          //         }
          //         this.props.onDirectoryDrop(rootDirectory);
          //       }
          //     }
          else {
               if ("getFilesAndDirectories" in event.dataTransfer) {
                    event.dataTransfer
                         .getFilesAndDirectories()
                         .then(async filesAndDirs => {
                              await this.iterateFilesAndDirs(
                                   filesAndDirs,
                                   "/",
                                   rootDirectory
                              );
                              if (
                                   rootDirectory.ChildDirectories.length > 0 ||
                                   rootDirectory.Files.length > 0
                              ) {
                                   this.props.onDirectoryDrop(rootDirectory);
                              }
                         });
               }
          }
          event.preventDefault();
     }

     public async iterateFilesAndDirs(
          filesAndDirs,
          path,
          directory: IDirectory
     ) {
          for (var i = 0; i < filesAndDirs.length; i++) {
               if (filesAndDirs[i]) {
                    if (
                         typeof filesAndDirs[i].getFilesAndDirectories ===
                         "function"
                    ) {
                         directory.ChildDirectories.push({
                              Title: filesAndDirs[i].name,
                              Files: [],
                              ChildDirectories: []
                         });
                         await filesAndDirs[i]
                              .getFilesAndDirectories()
                              .then(async subFilesAndDirs => {
                                   await this.iterateFilesAndDirs(
                                        subFilesAndDirs,
                                        filesAndDirs[i].path,
                                        directory.ChildDirectories[
                                             directory.ChildDirectories.length -
                                                  1
                                        ]
                                   );
                              });
                    } else {
                              directory.Files.push(filesAndDirs[i]);
                    }
               }
          }
     }
}
