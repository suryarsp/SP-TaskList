export interface ITaskCommandBarProps {
  onClickNew: () => void;
  onClickEdit: () => void;
  onClickUploadTaskList: () => void;
  onClickDelete: () => void;
  onClickAlertMe: () => void;
  onClickManageMyAlerts: () => void;
  onCancelSelection: () => void;
  onRefreshPage: () => void;
  onClickExportToPdf: () => void;
  totalItemCount: number;
  isAllItemsSelected: boolean;
  selectedCount: number;
}
