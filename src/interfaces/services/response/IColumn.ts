import { FieldTypes } from "sp-pnp-js";

export interface IColumn{
    key:string;
    text:string;
    InternalName ?: string;
    FieldTypeKind ?: FieldTypes;
    ID ?: string;
}
