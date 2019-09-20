import * as React from "react";
import { IDataProvider, IDynamicColumnProps, IDynamicColumnState, DragDropResult, ICustomizedColumn, IColumn } from '../../../interfaces';
import { Spinner, SpinnerSize, TextField, Checkbox, IconButton, Dropdown, DropdownMenuItemType, PrimaryButton, IDropdownOption, DefaultButton } from "office-ui-fabric-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from './DynamicColumns.module.scss';
import TaskDataProvider from "../../../services/TaskDataProvider";
import { PermissionKind, FieldTypes } from "sp-pnp-js";
import _ from "lodash";
import { Guid } from "guid-typescript";
import { Utilties } from "../../../common/helper/Utilities";


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
  private newItem: IColumn;
  private isDirty: boolean;
  private utilities: Utilties;

  constructor(props: IDynamicColumnProps) {
    super(props);
    this.state ={
      isAllowed: false,
      displayedColumns: props.displayedColumns,
      isAddClicked: false,
      columns: []
    };
    this.isDirty = false;
  }

  public componentDidMount() {
    this.dataProvider = TaskDataProvider.Instance;
    TaskDataProvider.context = this.context;
    this.utilities = Utilties.Instance;
    this.checkListAndPermissions().then((isAllowed) => {
      this.dataProvider.getTaskListFields(this.props.taskListName).
      then((columns) => {
        let filteredColumns = this.utilities.filterColumnsByType(columns);
        let manualItems: IColumn[] = [
        {
          FieldTypeKind : FieldTypes.DateTime,
          key: 'Created',
          text: 'Created',
          InternalName: "Created_x0020_Date",
          ID: "8c06beca-0777-48f7-91c7-6da68bc07b69",
          isUserDefined : false,
          disabled: false,
          isFixed: false,
          label: "Created"
        },
        {
          FieldTypeKind : FieldTypes.User,
          key: 'Created By',
          text: 'Created By',
          InternalName: "Created",
          ID: "998b5cff-4a35-47a7-92f3-3914aa6aa4a2",
          isUserDefined : false,
          disabled: false,
          isFixed: false,
          label: "Created By"
        },
        {
          FieldTypeKind : FieldTypes.User,
          key: 'Modified By',
          text: 'Modified By',
          InternalName: "Last_x0020_Modified",
          ID: "173f76c8-aebd-446a-9bc9-769a2bd2c18f",
          isUserDefined : false,
          disabled: false,
          isFixed: false,
          label: "Modified By"
        }
      ];
      filteredColumns.push(...manualItems);
      let disabledItems = this.props.displayedColumns.filter(c => c.isUserDefined).map((i)=> {
        i.disabled = true;
        return i;
      });
      filteredColumns.push(...disabledItems);
        this.setState({
          columns: filteredColumns
        });
      });

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
    const { source, destination }  = result;
    if (!result.destination) {
      return;
    }

    let updatedColumns = this.reorder(_.cloneDeep(this.state.displayedColumns.filter(c => !c.isDisabledInColumn)),source.index, destination.index);
    updatedColumns = updatedColumns.map((col, index) => {
      col.sortOrder = index + 1;
      return col;
    });

    this.setState({
      displayedColumns: updatedColumns
    });
    this.props.onChangeColumns(updatedColumns);
  }


  public reorder(list: IColumn[], startIndex: number, endIndex: number) {
    const result = _.cloneDeep(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  public onChangeColumnType(option, column: IColumn) {
    const selectedOption: IColumn = option;
    let displayedColumns = _.cloneDeep(this.state.displayedColumns);
    let columns = _.cloneDeep(this.state.columns);
    displayedColumns = displayedColumns.map(dc => {
      if(dc.ID === column.ID) {
        return selectedOption;
      }
      return dc;
    });
    columns = columns.map((c) => {
      if(_.findIndex(displayedColumns.filter(dc => !dc.isDisabledInColumn), dc => dc.ID === c.ID) >= 0) {
        c.disabled = true;
      } else {
        c.disabled = false;
      }
      return c;
    });

    this.setState({
      displayedColumns: displayedColumns,
      columns: columns
    });
    this.props.onChangeColumns(displayedColumns);
  }

  public onChangeColumnLabel(column: IColumn, newValue: string) {
    let displayedColumns = _.cloneDeep(this.state.displayedColumns);
    column.label = newValue;
    displayedColumns = displayedColumns.map((col) => col.ID === column.ID ? column : col);
    this.setState({
      displayedColumns: displayedColumns
    });
    this.props.onChangeColumns(displayedColumns);
  }

  public onRemoveColumn(column: IColumn) {
      let displayedColumns = _.cloneDeep(this.state.displayedColumns);
      let columns = _.cloneDeep(this.state.columns);
      displayedColumns = displayedColumns.map((dc) => {
        if(dc.ID === column.ID) {
          dc.isDisabledInColumn = true;
        }
        return dc;
      });
      columns  = columns.map((c) => {
        if( _.findIndex(displayedColumns.filter(dc => dc.isDisabledInColumn), dc => dc.ID === c.ID)) {
          c.disabled = false;
        }
        return c;
      });
      this.setState({
        displayedColumns: displayedColumns,
        columns: columns
      });
      this.props.onChangeColumns(displayedColumns);
  }

  public onClickAddColumn() {
    this.newItem = {
      FieldTypeKind : 0,
      isFixed: false,
      isUserDefined: true,
      label: "",
      ID: Guid.create().toString(),
      disabled: false,
      sortOrder: this.state.displayedColumns.length + 1,
      key: "",
      text: ""
    };
    this.setState({
      isAddClicked: true
    });
  }

  public onChangeNewColumnType(option) {
      const selectedOption: IColumn = option;
      let columns = _.cloneDeep(this.state.columns);
      let displayedColumns = _.cloneDeep(this.state.displayedColumns);
      this.isDirty = true;
      this.newItem = selectedOption;
      this.newItem.disabled = false;
      this.newItem.isUserDefined = true;
      this.newItem.isFixed = false;
      this.newItem.sortOrder = displayedColumns.length + 1;
      columns = columns.map(col =>{
        if(_.findIndex(displayedColumns.filter(c => !c.isDisabledInColumn), dc => dc.ID === col.ID) >= 0) {
          col.disabled = true;
        } else {
          col.disabled = false;
        }

        if(col.ID === selectedOption.ID) {
          col.disabled = true;
        }
        return col;
      });
      this.setState({
        columns: columns
      });

  }

  public onChangeNewColumnLabel(newValue: string) {
    this.isDirty = true;
    this.newItem.label = newValue;
    // setTimeout(() => {
    //   this.forceUpdate();
    // }, 500);
  }

  public onSaveNewColumn() {
    if(!this.checkValidation()) {
      this.isDirty = true;
      this.forceUpdate();
      return;
    }
    let columns = _.cloneDeep(this.state.columns);
    let displayedColumns = _.cloneDeep(this.state.displayedColumns);
    this.newItem.sortOrder = displayedColumns.length + 1;
    if(_.findIndex(displayedColumns.filter(c => !c.isDisabledInColumn), dc => dc.ID === this.newItem.ID) >= 0) {
      displayedColumns = displayedColumns.map((dc) => {
        if(dc.ID === this.newItem.ID) {
          return this.newItem;
        }
        return dc;
      });
      displayedColumns = _.orderBy(displayedColumns, s => s.sortOrder, "asc");
    } else {
      displayedColumns.push(this.newItem);
    }
    columns = columns.map(col =>{
      if(_.findIndex(displayedColumns.filter(c => !c.isDisabledInColumn), dc => dc.ID === col.ID) >= 0) {
        col.disabled = true;
      } else {
        col.disabled = false;
      }
      return col;
    });
    this.newItem = null;
    this.isDirty = false;
    this.setState({
      displayedColumns: displayedColumns,
      isAddClicked: false,
      columns: columns
    });
    this.props.onChangeColumns(displayedColumns);
  }

  public checkValidation() {
    let isValid = false;
    if(!this.newItem) {
      return true;
    }

    if(this.newItem.label.length > 0 && this.newItem.FieldTypeKind !== 0) {
      isValid = true;
    }

    return isValid;
  }

  public onCancelNewColumn() {
    this.isDirty = false;
    let columns = _.cloneDeep(this.state.columns);
    const displayedColumns = _.cloneDeep(this.state.displayedColumns);
    this.newItem = null;
    columns = columns.map(col =>{
      if(_.findIndex(displayedColumns.filter(c => !c.isDisabledInColumn), dc => dc.ID === col.ID) >= 0) {
        col.disabled = true;
      } else {
        col.disabled = false;
      }
      return col;
    });
    this.setState({
      isAddClicked: false,
      columns: columns
    });
  }

  public render() {
    const {isAllowed, displayedColumns, isAddClicked, columns} = this.state;
    if(isAllowed) {
      return(
        <div>
          <div className={styles.columnContainer}>
            <div className={styles.columnHeaderValue}>Columns</div>
            <div className={styles.columnHeaderValue}>Label</div>
          </div>
        <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <Droppable
        droppableId="droppable">
          {(p) => (
            <div
              ref={p.innerRef}
            >
              {displayedColumns.filter(c => !c.isDisabledInColumn).map((col, index) => (
                <Draggable
                  draggableId={col.ID}
                  index={index}
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
                                  { col.text }
                                </span>
                            ) : (
                                <Dropdown
                                style={{width: 135}}
                                selectedKey={ col.key}
                                onChange={(e, option) => {this.onChangeColumnType(option, col);}}
                                placeholder="Select type"
                                options={columns}
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
            errorMessage = { (this.newItem.FieldTypeKind === 0 && this.isDirty) ? "You can't leave this blank": '' }
            options={columns}
            style={{  padding: "10px"}}
          />

        <TextField
          style={{ padding: "10px"}}
          autoFocus={true}
          defaultValue = { this.newItem.label}
          onBlur= { (e) => { console.log(e.target.value);}}
          errorMessage = { (this.newItem.label.length === 0 && this.isDirty) ? "You can't leave this blank": '' }
          onChange={(e, newValue) => { this.onChangeNewColumnLabel(newValue); }} />
          {/* Button */}
          <div >
        <PrimaryButton
        style={{margin: '10px'}}
        text="Save"
        onClick={this.onSaveNewColumn.bind(this)}/>
        <DefaultButton
        style={{margin: '10px'}}
        text="Cancel"
        onClick={this.onCancelNewColumn.bind(this)}/>
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
