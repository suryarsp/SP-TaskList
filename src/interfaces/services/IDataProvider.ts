import { PermissionKind } from "sp-pnp-js";

export interface IDataProvider {
  getPermissions(listTitle: string): Promise<Array<{ permission: PermissionKind, allowed: boolean }>>;
}
