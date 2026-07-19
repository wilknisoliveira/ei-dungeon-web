import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

import { SmallLoadingComponent } from './small-loading/small-loading.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { BrandingIconComponent } from './components/branding-icon/branding-icon.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
    ],
    exports: [
        LoadingComponent,
        SmallLoadingComponent,
        ConfirmationDialogComponent,
        ThemeToggleComponent,
        BrandingIconComponent,
    ],
    declarations: [
        LoadingComponent,
        SmallLoadingComponent,
        ConfirmationDialogComponent,
        ThemeToggleComponent,
        BrandingIconComponent,
    ],
})
export class SharedModule {}
