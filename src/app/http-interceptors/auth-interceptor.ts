import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshSubject = new BehaviorSubject<TokenObject | null>(null);

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackBar: SnackbarService
    ) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token = this.authService.getAuthToken();
        let request: HttpRequest<any> = req;

        if (token) {
            request = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`),
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    return this.handle401Error(request, next);
                }
                return this.handleOtherError(error);
            })
        );
    }

    private handle401Error(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if (request.url.includes('/auth/refresh')) {
            this.authService.logout();
            this.router.navigate(['login']);
            return throwError(() => new Error('Refresh token expired'));
        }

        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshSubject.next(null);

            const token = this.authService.getAuthToken();
            const refreshToken = this.getStoredRefreshToken();

            if (!token || !refreshToken) {
                this.isRefreshing = false;
                this.authService.logout();
                this.snackBar.addError('Session expired. Please log in again.');
                this.router.navigate(['login']);
                return throwError(() => new Error('No tokens available'));
            }

            return from(
                this.authService.refreshToken(token, refreshToken)
            ).pipe(
                switchMap((tokenObject: TokenObject) => {
                    this.isRefreshing = false;
                    this.refreshSubject.next(tokenObject);
                    return this.retryRequest(
                        request,
                        next,
                        tokenObject.accessToken
                    );
                }),
                catchError((refreshError) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    this.snackBar.addError(
                        'Session expired. Please log in again.'
                    );
                    this.router.navigate(['login']);
                    return throwError(() => refreshError);
                })
            );
        } else {
            return this.refreshSubject.pipe(
                filter(
                    (result): result is TokenObject => result !== null
                ),
                take(1),
                switchMap((tokenObject) =>
                    this.retryRequest(request, next, tokenObject.accessToken)
                )
            );
        }
    }

    private handleOtherError(error: HttpErrorResponse): Observable<never> {
        if (error.error instanceof ErrorEvent) {
            console.error('Something went wrong: ', error.error.message);
        } else {
            console.error(
                `Error code: ${error.status}` +
                    `Error: ${JSON.stringify(error.error)}`
            );
        }
        return throwError(() => error);
    }

    private getStoredRefreshToken(): string {
        const tokenJson = localStorage.getItem('tokenInfo');
        if (tokenJson) {
            return JSON.parse(tokenJson).refreshToken;
        }
        return '';
    }

    private retryRequest(
        request: HttpRequest<any>,
        next: HttpHandler,
        newToken: string
    ): Observable<HttpEvent<any>> {
        const cloned = request.clone({
            headers: request.headers.set(
                'Authorization',
                `Bearer ${newToken}`
            ),
        });
        return next.handle(cloned);
    }
}
