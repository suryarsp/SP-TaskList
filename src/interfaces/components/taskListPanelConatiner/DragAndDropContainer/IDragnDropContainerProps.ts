import { IDirectory, IFolderLink } from "../../..";

export interface IDragnDropContainerProps {
    onDirectoryDrop(directory: IDirectory): void;
    onDrop(link: IFolderLink, files: any[]);
  }