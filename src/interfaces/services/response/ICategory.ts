export interface ICategory {
  Title: string;
  SortOrder: number;
  key : string;
  text : string;
  children : ICategory[];
  Group?: Group;
  isExisting?: boolean;
  ID?: number;
  GUID?:string;
  Parent?: Group | Category;
}



interface Group {
  Title: string;
  Id: number;
}

interface Category {
  Title: string;
  Id: number;
}
