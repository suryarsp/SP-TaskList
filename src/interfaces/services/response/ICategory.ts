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
  Parent?: ParentCategory;
  isNew ?: boolean;
  isSaving ?: boolean;
}



interface Group {
  Title ?: string;
  Id: number;
}

interface ParentCategory {
  Title ?: string;
  Id: number;
}
