import * as React from "react";
import { IDataProvider, IDynamicColumnProps, IDynamicColumnState, DragDropResult, ICustomizedColumn } from '../../../interfaces';
import { Spinner, SpinnerSize, TextField, Checkbox, IconButton, Dropdown, DropdownMenuItemType, PrimaryButton, IDropdownOption, DefaultButton } from "office-ui-fabric-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from './DynamicColumns.module.scss';
import TaskDataProvider from "../../../services/TaskDataProvider";
import { PermissionKind } from "sp-pnp-js";


const getItemStyle = (isDragging, draggableStyle) => {
  if (isDragging) {
    return {
      padding: 2,
      margin: `0 0 2px 0`,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // styles we need to apply on draggables
      ...draggableStyle,
      transform: draggableStyle.transform ? `translate(0, ${draggableStyle.transform.substring(draggableStyle.transform.indexOf(',') + 1, draggableStyle.transform.indexOf(')'))})` : `none`,
    };
  }
  else {
    return {
      padding: 2,
      margin: `0 0 2px 0`,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // styles we need to apply on draggables
      transform: `none`,
      ...draggableStyle
    };
  }
};

export default class DynamicColumns extends React.Component<IDynamicColumnProps, IDynamicColumnState> {

  private dataProvider: IDataProvider;
  private newItem: ICustomizedColumn;

  constructor(props: IDynamicColumnProps) {
    super(props);
    this.state ={
      isAllowed: false,
      displayedColumns: props.displayedColumns,
      isAddClicked: false,
      columns: []
    };
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    TaskDataProvider.context = this.context;
    this.checkListAndPermissions().then((isAllowed) => {
      this.setState({
       isAllowed: isAllowed
      });
    });
  }

  public checkListAndPermissions() : Promise<boolean>{
      return new Promise(async (resolve) => {
        await Promise.all([this.dataProvider.listExists(this.props.taskListName), this.dataProvider.getPermissions(this.props.taskListName)])
        .then((results) => {
          const isTaskListCreated = results[0];
          const permissions = results[1];
          const isAllowed = permissions.filter(p => p.permission === PermissionKind.ManageLists)[0].allowed;
          if(isAllowed && isTaskListCreated) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
  }

  public onDragEnd(result: DragDropResult){
    console.log(result);
  }

  public onChangeColumnType(type) {

  }

  public onChangeColumnLabel(column: ICustomizedColumn, newValue: string) {

  }

  public onRemoveColumn(col: ICustomizedColumn) {

  }

  public onClickAddColumn() {

    this.setState({
      isAddClicked: true
    });
    this.newItem = {
      columnType :"",
      isFixed: false,
      isPresentDefault: false,
      label: "",
      sortOrder: this.state.displayedColumns.length + 1
    };
  }

  public onChangeNewColumnType(option: IDropdownOption) {
      this.newItem.columnType = option.text;
  }

  public onChangeNewColumnLabel(newValue: string) {
    this.newItem.label = newValue;
  }

  public onSaveNewColumn() {

  }

  public onCancelNewColumn() {
    this.setState({
      isAddClicked: false
    });
  }

  public render() {
    const {isAllowed, displayedColumns, isAddClicked} = this.state;
    if(isAllowed) {
      return(
        <div>
          <div className={styles.columnContainer}>
            <div className={styles.columnHeaderValue}>Columns</div>
            <div className={styles.columnHeaderValue}>Label</div>
          </div>
        <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <Droppable droppableId="droppable">
          {(p) => (
            <div
              ref={p.innerRef}
            >

              {displayedColumns.map((col, index) => (
                <Draggable
                  draggableId={col.columnType}
                  index={index}
                  isDragDisabled={ col.isFixed }
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}

                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <div className={styles.columnContainer}>
                        <div className={[styles.columnValue, styles.iconInnerWrapper].join(" ")}>
                          <span className={styles.iconValue} {...provided.dragHandleProps}>
                            <i className={"ms-Icon ms-Icon--Move"} aria-hidden="true"></i>
                          </span>
                          {
                            col.isFixed ? (
                                <span>
                                  { col.columnType }
                                </span>
                            ) : (
                                <Dropdown
                                style={{width: 135}}
                                selectedKey={ col.columnType}
                                onChange={(e, option) => {this.onChangeColumnType(option);}}
                                placeholder="Select type"
                                options={[
                                  { key: 'Sort', text: 'Sort' },
                                  { key: 'Task Name', text: 'Task Name' },
                                  { key: 'Responsible Party / Status', text: 'Responsible Party / Status' },
                                  { key: 'Last Updated', text: 'Last Updated' },
                                  { key: 'Documents', text: 'Documents' },
                                  { key: 'Comments', text: 'Comments' }
                                ]}
                              />
                            )
                          }
                        </div>
                        <div className={styles.columnValue}>
                          <TextField
                            value={col.label}
                            autoFocus={true}
                            onBlur= { (e) => { console.log(e.target.value);}}
                            onChange={(e, newValue) => { this.onChangeColumnLabel(col, newValue); }} />
                          </div>

                        {  !col.isFixed ?
                          (
                            <div className={[styles.columnValue, styles.columnCancel].join(" ")}>
                              <IconButton
                                iconProps={{ iconName: 'Cancel' }}
                                onClick={() => { this.onRemoveColumn(col); }} />
                            </div>
                          )
                          : null}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {p.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>




    {/* Add Column Container */}
    {
      isAddClicked ? (<div>
        <Dropdown
            onChange={(e, option) => {this.onChangeNewColumnType(option);}}
            placeholder="Select type"
            options={[
              { key: 1, text: 'Sort' },
              { key: 2, text: 'Task Name' },
              { key: 3, text: 'Responsible Party / Status' },
              { key: 4, text: 'Last Updated' },
              { key: 5, text: 'Documents' },
              { key: 6, text: 'Comments' }
            ]}
          />

        <TextField
          autoFocus={true}
          onBlur= { (e) => { console.log(e.target.value);}}
          onChange={(e, newValue) => { this.onChangeNewColumnLabel(newValue); }} />

          {/* Button */}
          <div>
        <PrimaryButton
        onClick={this.onSaveNewColumn.bind(this)}>
          Save
        </PrimaryButton>
        <DefaultButton
        onClick={this.onCancelNewColumn.bind(this)}>
          Cancel
        </DefaultButton>
      </div>
      </div>) :
      (<PrimaryButton
        text="Add column"
        onClick={ this.onClickAddColumn.bind(this)}
        allowDisabledFocus />) }
      </div>

      );
    } else {
      return null;
    }
  }

}
