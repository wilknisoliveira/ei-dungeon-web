import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/service/auth/auth.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { UserLogin } from 'src/app/types/auth/user-login';
import { LoadingComponent } from 'src/app/shared/loading/loading.component';
import { LanguageSelectorComponent } from 'src/app/shared/components/language-selector/language-selector.component';
import { ThemeToggleComponent } from 'src/app/shared/theme-toggle/theme-toggle.component';
import { BrandingIconComponent } from 'src/app/shared/components/branding-icon/branding-icon.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        LoadingComponent,
        LanguageSelectorComponent,
        ThemeToggleComponent,
        BrandingIconComponent,
    ],
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

    loading: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: SnackbarService,
    ) {}

    async onSubmit() {
        try {
            this.loading = true;
            const result = await this.authService.login(this.userLogin);
            this.router.navigate(['home']);
        } catch (error) {
            this.loading = false;
            this.snackBar.addError('Something went wrong :(');
            console.log(`Login error: ${error}`);
        }
    }
}
