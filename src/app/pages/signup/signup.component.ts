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

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: SnackbarService
    ) {}

    async onSubmit() {
        try {
            const result = await this.authService.signup(this.userSignUp);
            this.router.navigate(['login']);
        } catch (error) {
            this.snackBar.addError('Something went wrong :(');
            console.log(`Sign Up error: ${error}`);
        }
    }
}
