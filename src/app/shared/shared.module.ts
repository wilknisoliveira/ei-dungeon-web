import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { SmallLoadingComponent } from './small-loading/small-loading.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@NgModule({
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    exports: [
        LoadingComponent,
        SmallLoadingComponent,
        ConfirmationDialogComponent,
    ],
    declarations: [
        LoadingComponent,
        SmallLoadingComponent,
        ConfirmationDialogComponent,
    ],
})
export class SharedModule {}
