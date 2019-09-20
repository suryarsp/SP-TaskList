export interface IDocument {
  File: File;
  Title: string;
  ID: number;
  Modified: string;
  UniqueId: string;
  DocIcon: string;
  Editor: Editor;
}

export interface File {
  Name: string;
  ServerRelativeUrl: string;
}

export interface Editor {
	Title: string;
     Id: number;
     LastName: string;
     FirstName: string;
}

export interface IDocumentId{
  Id:number[];
}
