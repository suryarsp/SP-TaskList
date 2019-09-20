import { INavLink } from 'office-ui-fabric-react/lib/Nav';
export interface ICommonFolderLink {
     name: string;
     icon: string;
     url: string;
     relativePath: string;
     isExpanded: boolean;
     key: string;
     Id: string;
     Guid: string;
     ItemCount: number;
     disabled: boolean;
     Sort: number;
     onClick: (event: React.MouseEvent<HTMLElement>, item?: INavLink) => void;
}
export interface IFolderLink extends ICommonFolderLink {
     links: IFolderLinkLevel2[];
}

export interface IFolderLinkLevel2 extends ICommonFolderLink {
     links: IFolderLinkLevel3[];
}

export interface IFolderLinkLevel3 extends ICommonFolderLink {
     links: IFolderLinkLevel2[];
}

export interface IFolderLinkLevel4 extends ICommonFolderLink {
}
