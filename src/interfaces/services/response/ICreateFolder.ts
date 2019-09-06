export interface ICreateFolder {
    data: Data;
  }
  
 export interface Data { 
    Exists: boolean;
    IsWOPIEnabled: boolean;
    ItemCount: number;
    Name: string;
    ProgID?: any;
    ServerRelativeUrl: string;
    TimeCreated: string;
    TimeLastModified: string;
    UniqueId: string;
    WelcomePage: string;
  }