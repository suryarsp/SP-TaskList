import { IDataProvider } from "../interfaces/index";

export class MockupDataProvider implements IDataProvider {

  public getPermissions(listTitle: string): Promise<{ permission: import("sp-pnp-js").PermissionKind; allowed: boolean; }[]> {
    return null;
  }


  constructor() {
  }
}
