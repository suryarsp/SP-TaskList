import { IDocument } from "../../../../..";

export interface ITaskDocumentsPanelState {
    currentCommandType: string;
    currentDocument: IDocument;
    errorMessage: string;
    conflictFiles: { Name: string, File: File, FolderRelativePath: string }[];
    completionPercentage: number;
    uploadProgressstatus: string;
    message: string;
    isLoading: boolean;
}
