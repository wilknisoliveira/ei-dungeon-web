import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { UserSignUp } from 'src/app/types/auth/user-signup';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
    hide = signal(true);
    emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);
    userSignUp: UserSignUp = {
        userName: '',
        fullName: '',
        email: '',
        password: '',
    };
    loading: boolean = false;

    usernameAvailable: boolean | null = null;
    emailAvailable: boolean | null = null;
    usernameChecking = false;
    emailChecking = false;
    private usernameDebounce: any = null;
    private emailDebounce: any = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: SnackbarService,
    ) {}

    async onSubmit() {
        try {
            this.loading = true;
            const result = await this.authService.signup(this.userSignUp);
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
        if (!this.userSignUp.userName.trim()) {
            this.usernameAvailable = null;
            return;
        }
        this.usernameChecking = true;
        this.usernameDebounce = setTimeout(async () => {
            try {
                const result = await this.authService.checkAvailability(
                    this.userSignUp.userName,
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
        if (!this.userSignUp.email.trim() || this.emailFormControl.invalid) {
            this.emailAvailable = null;
            return;
        }
        this.emailChecking = true;
        this.emailDebounce = setTimeout(async () => {
            try {
                const result = await this.authService.checkAvailability(
                    undefined,
                    this.userSignUp.email,
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
