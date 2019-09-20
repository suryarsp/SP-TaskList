
export interface IDirectory {
    Title: string;
    Files: File[];
    ChildDirectories: IDirectory[];
  }
  