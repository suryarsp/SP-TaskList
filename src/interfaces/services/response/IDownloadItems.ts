export default interface IDownloadItems {
    items: IItem[];
}

export interface IItem {
    name: string;
    docId: string;
    isFolder: boolean;
}