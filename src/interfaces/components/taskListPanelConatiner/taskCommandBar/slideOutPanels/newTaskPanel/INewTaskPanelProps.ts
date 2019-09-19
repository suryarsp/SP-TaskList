import { ITaskList } from "../../../../..";

export interface INewTaskPanelProps {
  hidePanel: (isDirty: boolean) => void;
  allTaskItems:ITaskList[];
}
