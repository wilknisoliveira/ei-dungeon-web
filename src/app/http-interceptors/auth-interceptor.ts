import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    BehaviorSubject,
    catchError,
    filter,
    from,
    Observable,
    switchMap,
    take,
    throwError,
} from 'rxjs';
import { AuthService } from '../service/auth/auth.service';
import { SnackbarService } from '../service/snackbar/snackbar.service';
import { TokenObject } from '../types/auth/token-object';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<TokenObject | null>(null);

function getStoredRefreshToken(): string {
    const tokenJson = localStorage.getItem('tokenInfo');
    if (tokenJson) {
        return JSON.parse(tokenJson).refreshToken;
    }
    return '';
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const snackBar = inject(SnackbarService);

    const token = authService.getAuthToken();
    let request = req;

    if (token) {
        request = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
    }

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                if (request.url.includes('/auth/refresh')) {
                    authService.logout();
                    router.navigate(['login']);
                    return throwError(() => new Error('Refresh token expired'));
                }

                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshSubject.next(null);

                    const currentToken = authService.getAuthToken();
                    const refreshToken = getStoredRefreshToken();

                    if (!currentToken || !refreshToken) {
                        isRefreshing = false;
                        authService.logout();
                        snackBar.addError('Session expired. Please log in again.');
                        router.navigate(['login']);
                        return throwError(() => new Error('No tokens available'));
                    }

                    return from(
                        authService.refreshToken(currentToken, refreshToken)
                    ).pipe(
                        switchMap((tokenObject: TokenObject) => {
                            isRefreshing = false;
                            refreshSubject.next(tokenObject);
                            const cloned = request.clone({
                                headers: request.headers.set(
                                    'Authorization',
                                    `Bearer ${tokenObject.accessToken}`
                                ),
                            });
                            return next(cloned);
                        }),
                        catchError((refreshError) => {
                            isRefreshing = false;
                            authService.logout();
                            snackBar.addError('Session expired. Please log in again.');
                            router.navigate(['login']);
                            return throwError(() => refreshError);
                        })
                    );
                } else {
                    return refreshSubject.pipe(
                        filter((result): result is TokenObject => result !== null),
                        take(1),
                        switchMap((tokenObject) => {
                            const cloned = request.clone({
                                headers: request.headers.set(
                                    'Authorization',
                                    `Bearer ${tokenObject.accessToken}`
                                ),
                            });
                            return next(cloned);
                        })
                    );
                }
            }

            if (error.error instanceof ErrorEvent) {
                console.error('Something went wrong: ', error.error.message);
            } else {
                console.error(
                    `Error code: ${error.status}` +
                        `Error: ${JSON.stringify(error.error)}`
                );
            }
            return throwError(() => error);
        })
    );
};
