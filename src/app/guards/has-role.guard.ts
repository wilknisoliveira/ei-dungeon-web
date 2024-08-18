import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';
import { inject } from '@angular/core';
//import { SnackbarService } from '../service/snackbar/snackbar.service';

export const HasRoleGuard: CanActivateFn = (route, state) => {
    const router: Router = inject(Router);
    const authService: AuthService = inject(AuthService);
    //const snackBar: SnackbarService = inject(SnackbarService);

    const rolesRoute = route.data['roles'] as string[];
    const userRoles = authService.getRoles();

    const isAuthorized = rolesRoute.some((role) => userRoles.includes(role));

    if (!isAuthorized) {
        console.error("You don't has access to this route.");
        //snackBar.addError("You don't has access to this route.");
        router.navigate(['home']);
    }

    return isAuthorized || false;
};
