export interface IComment {
  Task: ICommentTask;
  Comment: string;
  ID?: number;
  GUID?:string;
}

 interface ICommentTask {
  Title: string;
  ID: number;
}
