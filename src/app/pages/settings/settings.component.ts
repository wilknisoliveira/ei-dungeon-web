import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
    userInfo: { username: string; roles: string[] } | null = null;
    changePasswordForm: FormGroup;
    loading = false;
    activeSection = 'account';

    constructor(
        private authService: AuthService,
        private snackBar: SnackbarService,
        private fb: FormBuilder,
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
}
