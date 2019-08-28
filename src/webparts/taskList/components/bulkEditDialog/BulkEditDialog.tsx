
import * as React from 'react';
import styles from './BulkEditDialog.module.scss';
import { IBulkEditDialogProps, IBulkEditDialogState } from '../../../../interfaces/index';
export default class BulkEditDialog extends React.Component< IBulkEditDialogProps, IBulkEditDialogState> {
  public render(): React.ReactElement<IBulkEditDialogProps> {
    return (
        <h4>BulkEditDialog</h4>
    );
  }
}
