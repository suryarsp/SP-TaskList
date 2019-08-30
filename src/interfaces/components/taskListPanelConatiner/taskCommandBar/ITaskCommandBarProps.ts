export interface ITaskCommandBarProps {
  onClickDelete: () => void;
  onCancelSelection: () => void;
  onRefreshPage: () => void;
  totalItemCount: number;
  isAllItemsSelected: boolean;
  selectedCount: number;
}
