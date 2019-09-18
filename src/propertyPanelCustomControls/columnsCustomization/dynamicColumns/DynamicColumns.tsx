import * as React from "react";
import { IDataProvider, IDynamicColumnProps, IDynamicColumnState, DragDropResult, ICustomizedColumn } from '../../../interfaces';
import { Spinner, SpinnerSize, TextField, Checkbox, IconButton, Dropdown, DropdownMenuItemType } from "office-ui-fabric-react";
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

  public dataProvider: IDataProvider;

  constructor(props: IDynamicColumnProps) {
    super(props);
    this.state ={
      isAllowed: false,
      columns: props.displayedColumns
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

  public render() {
    const {isAllowed, columns} = this.state;
    if(isAllowed) {
      return(

        <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <Droppable droppableId="droppable">
          {(p) => (
            <div
              ref={p.innerRef}
            >
              {columns.map((col, index) => (
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
                        <div {...provided.dragHandleProps}>
                          <h6>Drag</h6>
                        </div>
                        {
                          col.isFixed ? (
                            <span>
                              { col.columnType }
                            </span>
                          ) : (
                            <Dropdown
                            selectedKey={ col.columnType}
                            onChange={(e, option) => {this.onChangeColumnType(option);}}
                            placeholder="Select type"
                            options={[
                              { key: 1, text: 'Sort' },
                              { key: 2, text: 'Task Name' },
                              { key: 3, text: 'Responsible Party / Status' },
                              { key: 4, text: 'Last Updated' },
                              { key: 5, text: 'Documents' },
                              { key: 6, text: 'Comments' }
                            ]}
                            styles={{ dropdown: { width: 100 } }}
                          />
                          )
                        }

                        <TextField
                          value={col.label}
                          styles={{ fieldGroup: { width: 100 } }}
                          autoFocus={true}
                          onBlur= { (e) => { console.log(e.target.value);}}
                          onChange={(e, newValue) => { this.onChangeColumnLabel(col, newValue); }} />


                        {/* {
                          !group.IsDefault && this.canDeleteItem ? (<IconButton
                            disabled={group.Title.trim().length === 0 || group.isSaving}
                            iconProps={{ iconName: 'Delete' }}
                            onClick={() => { this.onDeleteGroup(group); }} />) : null
                        }

                        {  group.isNew ?
                          (<IconButton
                             iconProps={{ iconName: 'Cancel' }}
                             onClick={() => { this.onClickCancel(group); }} />)
                             : null}
                        {
                            group.isSaving ?
                            (<Spinner
                            size={SpinnerSize.medium}/>) : null
                        } */}
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

      );
    } else {
      return null;
    }
  }

}
