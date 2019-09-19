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
  private newItem: ICustomizedColumn;
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
          ID: "8c06beca-0777-48f7-91c7-6da68bc07b69"
        },
        {
          FieldTypeKind : FieldTypes.User,
          key: 'Created By',
          text: 'Created By',
          InternalName: "Created",
          ID: "998b5cff-4a35-47a7-92f3-3914aa6aa4a2"
        },
        {
          FieldTypeKind : FieldTypes.DateTime,
          key: 'Modified',
          text: 'Modified',
          InternalName: "Modified",
          ID: "28cf69c5-fa48-462a-b5cd-27b6f9d2bd5f"
        },
        {
          FieldTypeKind : FieldTypes.User,
          key: 'Modified By',
          text: 'Modified By',
          InternalName: "Last_x0020_Modified",
          ID: "173f76c8-aebd-446a-9bc9-769a2bd2c18f"
        },
        {
          FieldTypeKind : FieldTypes.Lookup,
          key: 'Documents',
          text: 'Documents',
          InternalName: "Documents",
          ID: "6bd9b06c-c42f-4a5c-8edb-29722bc62566"
        },
        {
          FieldTypeKind : FieldTypes.Lookup,
          key: 'Comments',
          text: 'Comments',
          InternalName: "Comments",
          ID: "72a0f53f-961b-4af3-a7cb-4bd4b9af139b"
        }

      ];
      filteredColumns.push(...manualItems);
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

    let updatedColumns = this.reorder(_.cloneDeep(this.state.displayedColumns),source.index, destination.index);
    updatedColumns = updatedColumns.map((col, index) => {
      col.sortOrder = index + 1;
      return col;
    });

    this.setState({
      displayedColumns: updatedColumns
    });
  }


  public reorder(list: ICustomizedColumn[], startIndex: number, endIndex: number) {
    const result = _.cloneDeep(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  public onChangeColumnType(option) {

  }

  public onChangeColumnLabel(column: ICustomizedColumn, newValue: string) {
    let displayedColumns = _.cloneDeep(this.state.displayedColumns);
    column.label = newValue;
    displayedColumns = displayedColumns.map((col) => col.id === column.id ? column : col);
    this.setState({
      displayedColumns: displayedColumns
    });
  }

  public onRemoveColumn(column: ICustomizedColumn) {
      let displayedColumns = _.cloneDeep(this.state.displayedColumns);
      displayedColumns = displayedColumns.map((col) => {
        if(col.id === column.id) {
          col.disabled = true;
        }
        return col;
      });
      this.setState({
        displayedColumns: displayedColumns
      });
  }

  public onClickAddColumn() {
    this.newItem = {
      columnType :"",
      isFixed: false,
      isPresentDefault: false,
      label: "",
      id: Guid.create().toString(),
      disabled: false,
      sortOrder: this.state.displayedColumns.length + 1
    };
    this.setState({
      isAddClicked: true
    });
  }

  public onChangeNewColumnType(option: IDropdownOption) {
      this.isDirty = true;
      this.newItem.columnType = option.text;
  }

  public onChangeNewColumnLabel(newValue: string) {
    this.isDirty = true;
    this.newItem.label = newValue;
  }

  public onSaveNewColumn() {
    if(!this.checkValidation()) {
      return;
    }
    const displayedColumns = _.cloneDeep(this.state.displayedColumns);
    displayedColumns.push(this.newItem);
    this.newItem = null;
    this.setState({
      displayedColumns: displayedColumns,
      isAddClicked: false
    });
  }

  public checkValidation() {
    let isValid = false;
    if(!this.newItem) {
      return true;
    }

    if(this.newItem.label.length > 0 && this.newItem.columnType.length > 0) {
      isValid = true;
    }

    return isValid;
  }

  public onCancelNewColumn() {
    this.isDirty = false;
    this.setState({
      isAddClicked: false
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
              {displayedColumns.filter(c => !c.disabled).map((col, index) => (
                <Draggable
                  draggableId={col.id}
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
                                  { col.columnType }
                                </span>
                            ) : (
                                <Dropdown
                                style={{width: 135}}
                                selectedKey={ col.columnType}
                                onChange={(e, option) => {this.onChangeColumnType(option);}}
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
            errorMessage = { (this.newItem.columnType.length === 0 && this.isDirty) ? "You can't leave this blank": '' }
            options={columns}
            style={{ margin: "10px"}}
          />

        <TextField
          style={{ margin: "10px"}}
          autoFocus={true}
          onBlur= { (e) => { console.log(e.target.value);}}
          errorMessage = { (this.newItem.label.length === 0 && this.isDirty) ? "You can't leave this blank": '' }
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
