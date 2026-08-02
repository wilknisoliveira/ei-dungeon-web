import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    standalone: false,
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
    data = inject<string>(MAT_DIALOG_DATA);

    onConfirm(result: boolean): void {
        this.dialogRef.close(result);
    }
}
