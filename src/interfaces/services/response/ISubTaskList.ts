import { Category, TaskStatus, Responsible, ParentTask, Comments } from "../..";

import { Group } from "@microsoft/microsoft-graph-types";

export interface ISubTaskList {
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
    Comments?:Comments[];
    CommentsId?:number[];
  }
  