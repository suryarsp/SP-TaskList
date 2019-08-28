export interface ITaskGroupingControlComponentProps {
    isGroupingEnabled: boolean;
    isCategoryUniqueEnabled: boolean;
    selectedViewType: string;
    onEnableOrDisableGroup: (checked: boolean) => void;
    onEnableOrDisableUniqueCategory: (checked: boolean) => void;
    onChangeGroupView: (type: string) => void;
}
