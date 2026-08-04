import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { LoadingComponent } from 'src/app/shared/loading/loading.component';
import { LanguageSelectorComponent } from 'src/app/shared/components/language-selector/language-selector.component';
import { ThemeToggleComponent } from 'src/app/shared/theme-toggle/theme-toggle.component';
import { BrandingIconComponent } from 'src/app/shared/components/branding-icon/branding-icon.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        LoadingComponent,
        LanguageSelectorComponent,
        ThemeToggleComponent,
        BrandingIconComponent,
    ],
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
    hide = signal(true);
    formGroup: FormGroup;
    loading: boolean = false;

    usernameAvailable: boolean | null = null;
    emailAvailable: boolean | null = null;
    usernameChecking = false;
    emailChecking = false;
    private usernameDebounce: any = null;
    private emailDebounce: any = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: SnackbarService,
    ) {
        this.formGroup = this.fb.group({
            userName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(4),
                    Validators.maxLength(20),
                ],
            ],
            fullName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(4),
                    Validators.maxLength(50),
                ],
            ],
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(50),
                ],
            ],
        });
    }

    async onSubmit() {
        try {
            this.loading = true;
            const result = await this.authService.signup(this.formGroup.value);
            this.snackBar.addSuccess(
                'Account created successfully. Please log in.',
            );
            this.router.navigate(['login']);
        } catch (error) {
            this.loading = false;
            this.snackBar.addError('Something went wrong :(');
            console.log(`Sign Up error: ${error}`);
        }
    }

    onUsernameBlur(): void {
        if (this.usernameDebounce) clearTimeout(this.usernameDebounce);
        const userName = this.formGroup.get('userName')?.value?.trim();
        if (!userName || this.formGroup.get('userName')?.invalid) {
            this.usernameAvailable = null;
            return;
        }
        this.usernameChecking = true;
        this.usernameDebounce = setTimeout(async () => {
            try {
                const result = await this.authService.checkAvailability(
                    userName,
                    undefined,
                );
                this.usernameAvailable = result.usernameAvailable;
            } catch (error: any) {
                if (error.status === 429) {
                    this.snackBar.addError(
                        'Too many requests. Please wait a moment.',
                    );
                } else {
                    this.usernameAvailable = null;
                }
            } finally {
                this.usernameChecking = false;
            }
        }, 300);
    }

    onEmailBlur(): void {
        if (this.emailDebounce) clearTimeout(this.emailDebounce);
        const emailControl = this.formGroup.get('email');
        if (!emailControl?.value?.trim() || emailControl.invalid) {
            this.emailAvailable = null;
            return;
        }
        this.emailChecking = true;
        this.emailDebounce = setTimeout(async () => {
            try {
                const result = await this.authService.checkAvailability(
                    undefined,
                    emailControl.value,
                );
                this.emailAvailable = result.emailAvailable;
            } catch (error: any) {
                if (error.status === 429) {
                    this.snackBar.addError(
                        'Too many requests. Please wait a moment.',
                    );
                } else {
                    this.emailAvailable = null;
                }
            } finally {
                this.emailChecking = false;
            }
        }, 300);
    }
}
