import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserLogin } from 'src/app/types/auth/user-login';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
import { TokenObject } from 'src/app/types/auth/token-object';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = environment.api;
    private tokenSubject = new BehaviorSubject<any>(null);

    private tokenInfo: any;

    constructor(private http: HttpClient) {
        const tokenInfo = sessionStorage.getItem('tokenInfo');
        if (tokenInfo) {
            this.tokenSubject.next(JSON.parse(tokenInfo));
        }
    }

    async login(userLogin: UserLogin): Promise<TokenObject> {
        const tokenObject$ = this.http
            .post<TokenObject>(
                `${this.baseUrl}/api/user/Auth/signin`,
                userLogin
            )
            .pipe(
                tap((tokenObject) => {
                    this.tokenInfo = tokenObject;
                    this.setTokenSubject(tokenObject);
                })
            );

        return lastValueFrom(tokenObject$);
    }

    private setTokenSubject(token: TokenObject) {
        localStorage.setItem('tokenInfo', JSON.stringify(token));
        this.tokenSubject.next(token);
    }

    getAuthToken(): string {
        const tokenJson = window.localStorage.getItem('tokenInfo');

        if (tokenJson) {
            const tokenObject: TokenObject = JSON.parse(tokenJson);
            return tokenObject.accessToken;
        } else return '';
    }

    isUserLoggedIn(): boolean {
        const token = this.getAuthToken();

        if (!token) {
            return false;
        } else if (this.isTokenExpired(token)) {
            return false;
        }

        return true;
    }

    isTokenExpired(token?: string): boolean {
        if (!token) {
            return true;
        }

        const expirationDate = this.getTokenExpirationDate(token);
        if (expirationDate === undefined || expirationDate == null) {
            return false;
        }

        let date: Date = expirationDate;
        return !(date.valueOf() > new Date().valueOf());
    }

    getTokenExpirationDate(token: string) {
        const decoded: any = jwtDecode(token);

        if (decoded.exp === undefined) {
            return null;
        }

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }

    getRoles(): string[] {
        const token = this.getAuthToken();

        if (token != '') {
            const decoded: any = jwtDecode(token);

            if (decoded.roles !== undefined) {
                return JSON.parse(decoded.roles);
            } else return [''];
        } else return [''];
    }
}
