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
}

export interface Category {
  Id: number;
  Title?: string;
}


export interface ParentTask {
  Id: number;
  Title?: string;
}

export interface TaskStatus{
    Id:number;
    Title?:string;
}

export interface Responsible{
    Id:number;
    Title?:string;
}

export interface Group{
    Id:number;
    Title?:string;
}