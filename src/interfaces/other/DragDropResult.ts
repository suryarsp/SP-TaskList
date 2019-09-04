export interface DragDropResult {
  draggableId: number;
  type: string;
  source: Data;
  reason: string;
  mode: string;
  destination: Data;
  combine?: any;
}

interface Data {
  index: number;
  droppableId: string;
}