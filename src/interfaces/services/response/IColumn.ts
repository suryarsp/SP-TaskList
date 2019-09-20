import { FieldTypes } from "sp-pnp-js";

export interface IColumn{
    key:string;
    text:string;
    isFixed: boolean;
    isUserDefined: boolean;
    disabled: boolean;
    InternalName ?: string;
    FieldTypeKind ?: FieldTypes;
    ID ?: string;
    label: string;
    sortOrder ?: number;
    isDisabledInColumn ?: boolean;
}
