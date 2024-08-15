import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';

export const authGuardsGuard: CanActivateFn = (route, state) => {
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);

    if (authService.isUserLoggedIn()) {
        return true;
    } else {
        router.navigate(['login']);
        return false;
    }
};
