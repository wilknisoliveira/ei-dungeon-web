import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

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

        return next.handle(request).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Something went wrong: ', error.error.message);
        } else {
            console.error(
                `Error code: ${error.status}` +
                    `Error: ${JSON.stringify(error.error)}`
            );
        }

        return throwError(() => new Error('Something went wrong :('));
    }
}
