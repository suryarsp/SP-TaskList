import { IDataProvider, IResponsibleParty, IGroup, IColumn, IStatus, ICategory } from "../interfaces/index";

export class MockupDataProvider implements IDataProvider {
  public getGroups(listname: string): Promise<IGroup[]> {
    return new Promise<IGroup[]>((resolve) => resolve([
      {
        SortOrder: 1,
        ID: 1,
        IsDefault: true,
        Title: "Group 1",
        GUID: "1"
      },
      {
        SortOrder: 2,
        ID: 2,
        IsDefault: false,
        Title: "Group 2",
        GUID: "2"
      },
      {
        SortOrder: 3,
        ID: 3,
        IsDefault: false,
        Title: "Group 3",
        GUID: "3"
      },
      {
        SortOrder: 4,
        ID: 4,
        IsDefault: false,
        Title: "Group 4",
        GUID: "4"
      },
      {
        SortOrder: 5,
        ID: 5,
        IsDefault: false,
        Title: "Group 5",
        GUID: "5"
      }
    ]));
  }

  public getResponsibleParties(listname: string): Promise<IResponsibleParty[]> {
    return new Promise<IResponsibleParty[]>((resolve) => resolve([]));
  }

  public getStatuses(listname: string): Promise<IStatus[]> {
    return new Promise<IStatus[]>((resolve) => resolve([
      {
        Title: 'Not Started',
        SortOrder: 1.00000000001,
        FontColor: '#161515',
        FillColor: '#4f07f5',
        ID: 1,
        GUID: "9627a854-b28e-4d3f-8fd7-73b077b6a22e"
      },
      {
        Title: "In Progress",
         SortOrder: 0, 
         FontColor: null, 
         FillColor: null,
          ID: 2,
        GUID: "06d53485-d96d-4a6b-92d7-44e813d9048c"
      },
      {
        Title: "c", 
        SortOrder: 1.50000000001, 
        FontColor: "#fcf8f8", 
        FillColor: "#1e08f2",
         ID: 4,
        GUID: "e9a43205-f48f-4090-987b-955dbe7b3681"
      },
      {
        Title: "Name", 
        SortOrder: 4, 
        FontColor: "#fbf6f6",
         FillColor: "#3738b9", 
         ID: 5,
        GUID: "17300e12-2856-4665-8fdf-f855bce2b268"
      }]));
  }

  public getCategories(listname: string): Promise<ICategory[]> {
    return new Promise<ICategory[]>((resolve) => resolve([
      {
        Title:"Category 1",
        SortOrder:1,
        Group:{
          Id:1,
          Title:"Group 1"
        },
        children:[{
          Title:"Category 1.1",
        SortOrder:1,
        Group:{
          Id:1,
          Title:"Group 1"
        },
        children:[],
        key:"1",
        text:"Category 1",
        ID:1,
        GUID:"1"
        }],
        key:"1",
        text:"Category 1",
        ID:1,
        GUID:"1"
      },
      {
        Title:"Category 2",
        SortOrder:2,
        Group:{
          Id:1,
          Title:"Group 1"
        },
        children:[],
        key:"2",
        text:"Category 2",
        ID:2,
        GUID:"2"
      },
      {
        Title:"Category 3",
        SortOrder:3,
        Group:{
          Id:2,
          Title:"Group 2"
        },
        children:[],
        key:"3",
        text:"Category 3",
        ID:3,
        GUID:"3"
      },
      {
        Title:"Category 4",
        SortOrder:4,
        Group:{
          Id:3,
          Title:"Group 3"
        },
        children:[],
        key:"4",
        text:"Category 4",
        ID: 4,
        GUID:"4"
      }
    ]));
  }

  public getTaskListFields(listname: string): Promise<IColumn[]> {
    return new Promise<IColumn[]>((resolve) => resolve([]));
  }

  public insertGroupItem(listName: string): Promise<IGroup> {
    return null;
  }

  public updateGroupItem(listname: string, itemId: number): Promise<boolean> {
    return null;
  }

  public deleteItem(listname: string, itemId: number): Promise<boolean> {

    return null;
  }

  public insertStatusItem(listName: string, items: IStatus): Promise<IStatus> {
    return null;
  }

  public updateStatusItem(listname: string, itemId: number, items: IStatus): Promise<boolean> {
    return null;
  }
}
