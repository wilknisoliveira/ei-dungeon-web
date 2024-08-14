import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserLogin } from 'src/app/types/auth/user-login';
import { BehaviorSubject, Observable, lastValueFrom, map, tap } from 'rxjs';
import { TokenObject } from 'src/app/types/auth/token-object';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = 'https://localhost:7114';
    private headers;
    private tokenSubject = new BehaviorSubject<any>(null);

    private tokenInfo: any;

    constructor(private http: HttpClient) {
        const tokenInfo = sessionStorage.getItem('tokenInfo');
        if (tokenInfo) {
            this.tokenSubject.next(JSON.parse(tokenInfo));
        }

        this.headers = {
            'Content-Type': 'application/json',
        };
    }

    async login(userLogin: UserLogin): Promise<TokenObject> {
        const tokenObject$ = this.http
            .post<TokenObject>(
                `${this.baseUrl}/api/user/Auth/signin`,
                userLogin,
                {
                    headers: this.headers,
                }
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
}
