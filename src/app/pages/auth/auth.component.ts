import { Component, inject, Inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { UserLogin } from 'src/app/types/auth/user-login';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
    hide = signal(true);
    userLogin: UserLogin = {
        userName: '',
        password: '',
    };

    //test: SnackbarService = inject(SnackbarService);

    constructor(
        private authService: AuthService,
        private router: Router //private snackBar: SnackbarService
    ) {}

    async onSubmit() {
        try {
            const result = await this.authService.login(this.userLogin);
            this.router.navigate(['home']);
        } catch (error) {
            //this.snackBar.addError("You don't has access to this route.");
            console.log(`Login error: ${error}`);
        }
    }
}
