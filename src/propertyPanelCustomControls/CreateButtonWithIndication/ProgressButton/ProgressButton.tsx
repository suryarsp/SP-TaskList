import * as React from "react";
import { IProgressButtonProps, IProgressButtonState, IDataProvider, IGroup, ICategory } from '../../../interfaces';
import { PrimaryButton, Spinner, SpinnerSize, css, Label } from "office-ui-fabric-react";
import styles from './ProgressButton.module.scss';
import TaskDataProvider from "../../../services/TaskDataProvider";
import { TaskListConstants } from "../../../common/defaults/taskList-constants";
import { ListDetailsConstants } from "../../../common/defaults/listView-constants";
import { ThemeProvider } from "@microsoft/sp-component-base";

export default class ProgressButton extends React.Component<IProgressButtonProps, IProgressButtonState> {

  public dataProvider: IDataProvider;

  constructor(props: IProgressButtonProps) {
    super(props);
    this.state = {
      creationSuccess: false,
      creationFailed: false,
      creationInProgress: false,
      disabled: false
    };
    TaskDataProvider.context = this.context;
    this.dataProvider = TaskDataProvider.Instance;
    this.checkListAndLibrary().then((isCreated) => {
      this.setState({
        disabled: isCreated
      });
    });
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
        >
          {
          this.state.creationInProgress ? <Spinner size={SpinnerSize.medium} hidden={this.state.creationInProgress} /> : null
          }
        </PrimaryButton>

      </div>
    );
  }

  public async onClickCreateListAndLibrary() {
    this.setState({
      disabled: true,
      creationInProgress: true
    });

    const {statusListName, responsibleListName, categoryListName, taskListName, commentsListName, libraryName } = this.props;

    this.dataProvider.statusListCreation(statusListName).then(
      (isStatusCreated) => {
        if (isStatusCreated) {
          this.dataProvider.responsibleListCreation(responsibleListName).then(
            (isResponsibleCreated) => {
              if (isResponsibleCreated) {
                this.dataProvider.categoryListCreation(categoryListName).then(
                  (isCategoryCreated) => {
                    if (isCategoryCreated) {
                      if(isCategoryCreated) {
                        const defaultcategory: ICategory = {
                          Title: "All tasks category",
                          SortOrder: 1.00000000001,
                          children: [],
                          key: "1",
                          text: "All tasks category"
                        };
                        this.dataProvider.insertCategoryItem(categoryListName, defaultcategory).then(
                          () => {
                          }).catch((e) => console.log(e));
                      }
                      this.dataProvider.documentLibraryCreation(libraryName).then(
                        (isLibraryCreated) => {
                          if (isLibraryCreated) {
                            this.dataProvider.commentsListCreation(commentsListName).then(
                              (isCommentsCreated) => {
                                if (isCommentsCreated) {
                                  this.dataProvider.taskListCreation(taskListName).then(
                                    (isTaskListCreated) => {
                                      if (isTaskListCreated) {
                                        TaskDataProvider.listNames = {
                                          categoryListName : categoryListName,
                                          commentsListName: commentsListName,
                                          responsibleListName: responsibleListName,
                                          statusListName: statusListName,
                                          taskListName: taskListName
                                        };
                                              this.setState({
                                                creationSuccess: true,
                                                creationInProgress: false,
                                                disabled: true,
                                                creationFailed: false
                                              });
                                      }
                                    });
                                }
                              });
                          }
                        });
                    }
                  });
              }
            });
        }
      });
  }

   public async checkListAndLibrary() : Promise<boolean> {
        const { responsibleListName, statusListName, categoryListName, commentsListName, libraryName, taskListName } = this.props;
        let promises = new Array<Promise<boolean>>();
        promises = [
          this.dataProvider.libraryExists(libraryName),
          this.dataProvider.listExists(categoryListName),
          this.dataProvider.listExists(responsibleListName),
          this.dataProvider.listExists(statusListName),
          this.dataProvider.listExists(commentsListName),
          this.dataProvider.listExists(taskListName)
        ];

    return new Promise<boolean>(async (resolve) => {
      await Promise.all(promises).then((values) => {
        if (values.filter(v => !v).length === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(() => {
        resolve(false);
      });
    });
  }
}
