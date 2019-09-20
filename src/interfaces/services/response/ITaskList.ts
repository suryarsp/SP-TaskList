import { ISubTaskList, IDirectory, IDocument } from "../..";

export interface ITaskList {
  Category: Category;
  SubCategory:SubCategory;
  TaskStatus: TaskStatus;
  Responsible: Responsible;
  Group ?: Group;
  Title: string;
  SortOrder: number;
  Parent:ParentTask;
  ID ?: number;
  GUID ?: string;
  Documents ?: Document[];
  Comments?:Comments[];
  CommentsId?:number[];
  children : ISubTaskList[];
  key:string;
  text:string;
  Directory?: IDirectory;
	Files?: IDocument[];
}

export interface Comments{
  Id:number;
}

export interface Category {
  Id: number;
  Title?: string;
}

export interface SubCategory {
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


export interface Document {
	Title: string;
	ID: number;
}
