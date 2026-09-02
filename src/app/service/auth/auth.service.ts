import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserLogin } from 'src/app/types/auth/user-login';
import { BehaviorSubject, Observable, lastValueFrom, tap } from 'rxjs';
import { TokenObject } from 'src/app/types/auth/token-object';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';
import { UserSignUp } from 'src/app/types/auth/user-signup';
import { UserInfoCheckResponse } from 'src/app/types/auth/user-info-check-response';
import { LOCAL_STORAGE } from 'src/app/core/storage/app-storage';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);
    private storage = inject(LOCAL_STORAGE);
    private baseUrl = environment.api;
    private tokenSubject = new BehaviorSubject<any>(null);

    private tokenInfo: any;

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
        this.storage.setItem('tokenInfo', JSON.stringify(token));
        this.tokenSubject.next(token);
    }

    logout(): void {
        this.storage.removeItem('tokenInfo');
        this.tokenSubject.next(null);
    }

    getAuthToken(): string {
        const tokenJson = this.storage.getItem('tokenInfo');

        if (tokenJson) {
            try {
                const tokenObject: TokenObject = JSON.parse(tokenJson);
                return tokenObject.accessToken || '';
            } catch {
                this.storage.removeItem('tokenInfo');
            }
        } else return '';

        return '';
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

    getRole(): string {
        const token = this.getAuthToken();

        if (token) {
            const decoded: any = jwtDecode(token);
            return decoded.role || '';
        }
        return '';
    }

    async signup(userSignUp: UserSignUp): Promise<any> {
        const result$ = this.http.post<any>(
            `${this.baseUrl}/api/user`,
            userSignUp
        );

        return lastValueFrom(result$);
    }

    async refreshToken(accessToken: string, refreshToken: string): Promise<TokenObject> {
        const result$ = this.http
            .post<TokenObject>(`${this.baseUrl}/api/user/auth/refresh`, {
                accessToken,
                refreshToken,
            })
            .pipe(
                tap((tokenObject) => {
                    this.setTokenSubject(tokenObject);
                })
            );
        return lastValueFrom(result$);
    }

    async checkAvailability(username?: string, email?: string): Promise<UserInfoCheckResponse> {
        let params = new HttpParams();
        if (username) params = params.set('username', username);
        if (email) params = params.set('email', email);
        const result$ = this.http.get<UserInfoCheckResponse>(
            `${this.baseUrl}/api/user/check-userinfo`,
            { params }
        );
        return lastValueFrom(result$);
    }

    getUserInfo(): { id: string; username: string; role: string; fullName: string; email: string } | null {
        const token = this.getAuthToken();
        if (!token) return null;
        const decoded: any = jwtDecode(token);
        return {
            id: decoded.sub || '',
            username: decoded.unique_name || decoded.sub || '',
            role: this.getRole(),
            fullName: decoded.fullName || '',
            email: decoded.email || '',
        };
    }

    setTokens(tokenObject: TokenObject): void {
        this.setTokenSubject(tokenObject);
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<any> {
        const result$ = this.http.patch<any>(
            `${this.baseUrl}/api/user/auth/change-password`,
            { currentPassword, newPassword },
        );
        return lastValueFrom(result$);
    }

    deleteUser(id: string): Observable<Object> {
        return this.http.delete(`${this.baseUrl}/api/user/${id}`);
    }

    async serverLogout(): Promise<void> {
        const tokenJson = this.storage.getItem('tokenInfo');
        let refreshToken = '';
        if (tokenJson) {
            const tokenObject: TokenObject = JSON.parse(tokenJson);
            refreshToken = tokenObject.refreshToken;
        }
        try {
            if (refreshToken) {
                await lastValueFrom(
                    this.http.post(`${this.baseUrl}/api/user/auth/logout`, {
                        refreshToken,
                    })
                );
            }
        } finally {
            this.logout();
        }
    }
}
