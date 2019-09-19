import { ITaskList } from "../../../../..";

export interface IEditTaskPanelProps {
  hidePanel: (isDirty: boolean) => void;
  selectedItem:ITaskList;
  allTaskItems:ITaskList[];
}
