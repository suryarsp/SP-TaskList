export interface IDocument {
  File: File;
  Title: string;
  ID: number;
  Modified: string;
  UniqueId: string;
  DocIcon: string;
}

export interface File {
  Name: string;
  ServerRelativeUrl: string;
}
