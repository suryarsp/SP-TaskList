export interface IGroupingCustomizationProps {
  isGroupingEnabled: boolean;
  isCategoryUniqueEnabled: boolean;
  selectedViewType: string;
  groupListName: string;
  onEnableOrDisableGroup: (checked: boolean) => void;
  onEnableOrDisableUniqueCategory: (checked: boolean) => void;
  onChangeGroupView: (type: string) => void;
  onChangeGroupListName: (newValue: string) =>  void;
}
