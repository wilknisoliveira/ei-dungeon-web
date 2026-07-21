import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, Observable } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';
import { SnackbarService } from '../service/snackbar/snackbar.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
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

        if (token != '') {
            request = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`),
            });
        }

        return next.handle(request).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        if (error.status === 401) {
            this.authService.logout();
            this.snackBar.addError('Session expired. Please log in again.');
            this.router.navigate(['login']);
            return EMPTY;
        }

        if (error.error instanceof ErrorEvent) {
            console.error('Something went wrong: ', error.error.message);
        } else {
            console.error(
                `Error code: ${error.status}` +
                    `Error: ${JSON.stringify(error.error)}`
            );
        }

        throw error;
    }
}
