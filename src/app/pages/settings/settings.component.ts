import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
    userInfo: { id: string; username: string; role: string; fullName: string; email: string } | null = null;
    changePasswordForm: FormGroup;
    loading = false;
    activeSection = 'account';

    constructor(
        private authService: AuthService,
        private snackBar: SnackbarService,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private router: Router,
    ) {
        this.changePasswordForm = this.fb.group({
            currentPassword: [
                '',
                [
                    Validators.required,
                    Validators.minLength(4),
                    Validators.maxLength(50),
                ],
            ],
            newPassword: [
                '',
                [
                    Validators.required,
                    Validators.minLength(4),
                    Validators.maxLength(50),
                ],
            ],
        });
    }

    ngOnInit(): void {
        this.userInfo = this.authService.getUserInfo();
    }

    selectSection(section: string): void {
        this.activeSection = section;
    }

    async onChangePassword(): Promise<void> {
        if (this.changePasswordForm.invalid) return;
        this.loading = true;
        try {
            const { currentPassword, newPassword } =
                this.changePasswordForm.value;
            await this.authService.changePassword(currentPassword, newPassword);
            this.snackBar.addSuccess('Password changed successfully.');
            this.changePasswordForm.reset();
        } catch (error: any) {
            if (error.status === 400) {
                this.snackBar.addError('Current password is incorrect.');
            } else {
                this.snackBar.addError('Something went wrong.');
            }
        } finally {
            this.loading = false;
        }
    }

    openDeleteAccountDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: 'Tem certeza que deseja apagar sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente perdidos.',
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.deleteAccount();
            }
        });
    }

    async deleteAccount(): Promise<void> {
        if (!this.userInfo?.id) return;
        this.loading = true;
        try {
            await new Promise<void>((resolve, reject) => {
                this.authService.deleteUser(this.userInfo!.id).subscribe({
                    next: () => resolve(),
                    error: (error) => reject(error),
                });
            });
            this.authService.logout();
            this.router.navigate(['signup']);
        } catch {
            this.snackBar.addError('Something went wrong while attempting to delete the account.');
            this.loading = false;
        }
    }
}
