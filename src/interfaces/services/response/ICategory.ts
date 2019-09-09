export interface ICategory {
  Group?: GroupOrParentCategory;
  Title: string;
  CategorySort: number;
  ID?: number;
  GUID?:string;
  children : ICategory[];
  Parent?: GroupOrParentCategory;
  key : string;
  text : string;
  isExisting?: boolean;
}



export interface GroupOrParentCategory {
  Title: string;
  Id: number;
}
