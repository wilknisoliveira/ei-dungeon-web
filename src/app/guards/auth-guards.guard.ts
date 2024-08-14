import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuardsGuard: CanActivateFn = (route, state) => {
    const router: Router = inject(Router);

    const token = localStorage.getItem('tokenInfo');

    if (token) {
        return true;
    } else {
        router.navigate(['login']);
        return false;
    }
};
