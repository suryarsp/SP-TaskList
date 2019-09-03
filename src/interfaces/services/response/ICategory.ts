export interface ICategory {
  Group: GroupOrParentCategory;
  Title: string;
  CategorySort: number;
  ID: number;
  children : ICategory[];
  Parent?: GroupOrParentCategory;
  key : string;
  text : string;
}



export interface GroupOrParentCategory {
  Title: string;
  Id: number;
}
