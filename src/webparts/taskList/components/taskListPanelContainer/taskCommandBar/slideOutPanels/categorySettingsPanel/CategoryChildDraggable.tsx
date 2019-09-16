import * as React from 'react';
import styles from './CategorySettingsPanel.module.scss';
import { ICategory } from '../../../../../../../interfaces/index';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Droppable, Draggable } from "react-beautiful-dnd";
import { TextField, Spinner, SpinnerSize } from 'office-ui-fabric-react';




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


const getListStyle = () => ({
  // background: isDraggingOver ? "lightblue" : "#FFFFF"
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
        >
          {this.props.subItems.map((item, index) => (
            <Draggable
            key={item.GUID}
            draggableId={item.GUID} index={index}
            >
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
                                  onClick={() => { this.props.onRevokeSubCategory(item, index);}}
                                  />

                              <TextField
                                value={item.Title}
                                styles={{ fieldGroup: { width: 200 } }}
                                autoFocus={true}
                                onBlur= {(e) => {console.log(e);}}
                                onChange={(e, newValue) => { this.props.onChangeSubCategoryTitle(item, newValue); }}
                                errorMessage ={ item.isExisting ? "Value already exists" : ""}
                               />

                                <IconButton
                                  disabled={item.Title.trim().length === 0 }
                                  iconProps={{ iconName: 'Delete' }}
                                 onClick={() => { this.props.onDeleteSubCategory(item,index); }}
                                  />

                                   {
                                    item.isSaving ?
                                    (<Spinner
                                    size={SpinnerSize.medium}/>) : null
                                }
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
  onRevokeSubCategory: (subCategory: ICategory, index: number) => void;
  onDeleteSubCategory: ( subCategory: ICategory, index: number) => void;
  onChangeSubCategoryTitle: (category: ICategory, newValue: string) => void;
}
