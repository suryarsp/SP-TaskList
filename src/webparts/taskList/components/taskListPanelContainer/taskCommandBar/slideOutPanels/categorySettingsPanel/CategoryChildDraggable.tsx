import * as React from 'react';
import styles from './CategorySettingsPanel.module.scss';
import { ICategorySettingsPanelProps, ICategorySettingsPanelState, IDataProvider, ICategory } from '../../../../../../../interfaces/index';
import { IconButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import TaskDataProvider from '../../../../../../../services/TaskDataProvider';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ProgressStatusType } from '../../../../../../../interfaces/enums/progressStatusType';
import { MessageBarType, DialogType, Dialog, DialogFooter, Layer, MessageBar, TextField, Checkbox } from 'office-ui-fabric-react';
import { TaskListConstants } from '../../../../../../../common/defaults/taskList-constants';
import { MockupDataProvider } from '../../../../../../../services';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';



const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => {
  if (isDragging) {
    return {
      margin: `0 0 8px 0`,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // change background colour if dragging
      background: isDragging ? '#F4F4F4' : '#FFFFFF',
      // styles we need to apply on draggables
      ...draggableStyle,
      transform: draggableStyle.transform ? `translate(0, ${draggableStyle.transform.substring(draggableStyle.transform.indexOf(',') + 1, draggableStyle.transform.indexOf(')'))})` : `none`,
    };
  }
  else {
    return {
      margin: `0 0 8px 0`,
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      // change background colour if dragging
      background: isDragging ? '#F4F4F4' : '#FFFFFF',
      // styles we need to apply on draggables
      transform: `none`,
      ...draggableStyle
    };
  }
};


const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "#FFFFF"
});

export default class CategoryChildDraggable extends React.Component<ICategoryChildDraggableProps> {

  public render() {

    return (
      <Droppable
      droppableId={this.props.droppableId}
      type={`droppableSubItem-${this.props.droppableId}`}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}
        >
          {this.props.subItems.map((item, index) => (
            <Draggable key={item.GUID} draggableId={item.GUID} index={index}>
              {(p, s) => (
                <div style={{ display: "flex" }}>
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    style={getItemStyle(
                      s.isDragging,
                      p.draggableProps.style
                    )}
                  >
                  <div className={styles.categoryContainer}>
                              <div {...p.dragHandleProps} style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                <h6>Drag Handle</h6>
                              </div>

                              <IconButton
                                  disabled={item.Title.trim().length === 0 }
                                  iconProps={{ iconName: 'RevToggleKey' }}
                                 // onClick={() => { this.onDeleteGroup(group); }}
                                  />

                              <TextField
                                value={item.Title}
                                styles={{ fieldGroup: { width: 200 } }}
                                autoFocus={true}
                              //  onChange={(e, newValue) => { this.onChangeGroupTitle(newValue, group); }}
                                errorMessage ={ item.isExisting ? "Value already exists" : ""}
                               />

                                <IconButton
                                  disabled={item.Title.trim().length === 0 }
                                  iconProps={{ iconName: 'Delete' }}
                                 // onClick={() => { this.onDeleteGroup(group); }}
                                  />
                            </div>
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
    );
  }
}

export interface ICategoryChildDraggableProps {
  subItems: ICategory[];
  droppableId: number;
}
