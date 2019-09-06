import * as React from "react";
import { IProgressButtonProps, IProgressButtonState, IDataProvider } from '../../../interfaces';
import { PrimaryButton, Spinner, SpinnerSize, css, Label } from "office-ui-fabric-react";
import styles from './ProgressButton.module.scss';
import TaskDataProvider from "../../../services/TaskDataProvider";

export default class ProgressButton extends React.Component<IProgressButtonProps, IProgressButtonState> {

     public dataProvider: IDataProvider;

     constructor(props: IProgressButtonProps) {
          super(props);
          this.state = {
               creationSuccess: false,
               creationFailed: false,
               creationInProgress: false,
               disabled : false
          };
          TaskDataProvider.context = this.context;
          this.dataProvider = TaskDataProvider.Instance;
          // this.checkListAndLibrary().then((isCreated) => {
          //      this.setState({
          //           disabled: isCreated
          //      });
          // });
     }

     public render() {
          return (
               <div className={styles.progressButton}>
                    {
                         this.state.creationSuccess ?
                              <Label className={css(styles.success)}> The configuration lists created successfully. Please reload the page to continue. </Label> : null
                    }
                    {
                         this.state.creationFailed ?
                              <Label className={css(styles.error)}> There must be something wrong while creating the lists. Please ensure you have the required permission before re-trying. </Label> : null
                    }
                    <PrimaryButton
                         disabled={this.state.disabled}
                         text={"Enable TaskList"}
                         onClick={this.onClickCreateListAndLibrary.bind(this)}
                    />
                    {
                         this.state.creationInProgress ? <Spinner size={SpinnerSize.medium} hidden={this.state.creationInProgress} /> : null
                    }
               </div>
          );
     }

     public async onClickCreateListAndLibrary() {
          this.setState({
               disabled: true,
               creationInProgress: true
          });

          const { groupListName, statusListName, responsibleListName, categoryListName, taskListName, commentsListName, libraryName } =  this.props;
          this.dataProvider.groupListCreation(groupListName).then(
            (isGroupCreated) => {
              if(isGroupCreated) {
                this.dataProvider.statusListCreation(statusListName).then(
                  (isStatusCreated) => {
                    if(isStatusCreated) {
                      this.dataProvider.responsibleListCreation(responsibleListName).then(
                        (isResponsibleCreated) => {
                          if(isResponsibleCreated) {
                            this.dataProvider.categoryListCreation(categoryListName).then(
                              (isCategoryCreated) => {
                                if(isCategoryCreated) {
                                  this.dataProvider.documentLibraryCreation(libraryName).then(
                                    (isLibraryCreated) => {
                                      if(isLibraryCreated) {
                                        this.dataProvider.taskListCreation(taskListName).then(
                                          (isTaskListCreated) => {
                                            if(isTaskListCreated) {
                                              this.dataProvider.commentsListCreation(commentsListName).then(
                                                (isCommentsCreated) => {
                                                  if(isCommentsCreated) {
                                                    //this.dataProvider.commonlistViewCreation(groupListName)
                                                  }
                                                });
                                            }
                                          });}
                                    });
                                }
                              });
                          }
                        });
                    }
                  });
              }
            }
          );

          // this.dataProvider.listorLibraryCreation(this.props.listName, this.props.libraryName)
          // .then((isCreated) => {
          //      if(!isCreated) {
          //           return;
          //      }
          //      this.dataProvider.listViewCreation(this.props.listName).then((isViewCreated) => {
          //           this.setState({
          //                creationSuccess: true,
          //                creationInProgress: false,
          //                disabled: true,
          //                creationFailed: false
          //           });
          //      });
          // });
     }

    //  public async checkListAndLibrary() : Promise<boolean> {
    //       const promises = new Array<Promise<boolean>>(this.dataProvider.listExists(this.props.listName),
    //            this.dataProvider.libraryExists(this.props.libraryName));

    //       return new Promise<boolean>(async (resolve) => {
    //            await Promise.all(promises).then((values) => {
    //                 if (values[0] && values[1]) {
    //                      resolve(true);
    //                 } else {

    //                      resolve( false);
    //                 }
    //            }).catch(() => {
    //            resolve( false);
    //            });
    //       });
    //  }
}
