export interface ICategory {
  Group: GroupOrParentCaetgory;
  Title: string;
  CategorySort: number;
  ID: number;
  children: ICategory[];
  Parent?: GroupOrParentCaetgory;
}



export interface GroupOrParentCaetgory {
  Title: string;
  Id: number;
}
