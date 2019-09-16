export interface ITaskList {
  Category: Category;
  TaskStatus: TaskStatus;
  Responsible: Responsible;
  Group ?: Group;
  Title: string;
  SortOrder: number;
  Parent:ParentTask;
  ID ?: number;
  GUID ?: string;
  Documents ?: Document[];
}

 interface Category {
  Id: number;
  Title?: string;
}

 interface ParentTask {
  Id: number;
  Title?: string;
}

interface TaskStatus{
    Id:number;
    Title?:string;
}

 interface Responsible{
    Id:number;
    Title?:string;
}

 interface Group{
    Id:number;
    Title?:string;
}


interface Document {
	Title: string;
	ID: number;
}
