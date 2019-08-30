import { PermissionKind } from "sp-pnp-js";

export interface IPermissions {
  permission: PermissionKind;
  allowed: boolean;
}
