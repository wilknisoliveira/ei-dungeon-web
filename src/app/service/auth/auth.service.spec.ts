import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { AppStorage, LOCAL_STORAGE } from 'src/app/core/storage/app-storage';

describe('AuthService', () => {
    let service: AuthService;
    let values: Map<string, string>;
    let storage: AppStorage;

    beforeEach(() => {
        values = new Map<string, string>();
        storage = {
            getItem: (key) => values.get(key) ?? null,
            setItem: (key, value) => values.set(key, value),
            removeItem: (key) => values.delete(key),
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: LOCAL_STORAGE, useValue: storage }],
        });
        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return no token when storage is empty', () => {
        expect(service.getAuthToken()).toBe('');
        expect(service.isUserLoggedIn()).toBeFalse();
    });

    it('should read a stored access token', () => {
        values.set(
            'tokenInfo',
            JSON.stringify({ accessToken: tokenExpiringAt(4102444800) }),
        );

        expect(service.getAuthToken()).toBe(tokenExpiringAt(4102444800));
        expect(service.isUserLoggedIn()).toBeTrue();
    });

    it('should remove malformed stored token data', () => {
        values.set('tokenInfo', '{broken');

        expect(service.getAuthToken()).toBe('');
        expect(values.has('tokenInfo')).toBeFalse();
    });

    it('should reject an expired token', () => {
        values.set(
            'tokenInfo',
            JSON.stringify({ accessToken: tokenExpiringAt(1) }),
        );

        expect(service.isUserLoggedIn()).toBeFalse();
    });

    it('should persist and clear token objects through the adapter', () => {
        const token = {
            authenticated: true,
            created: '2026-09-01T00:00:00Z',
            expiration: '2100-01-01T00:00:00Z',
            accessToken: tokenExpiringAt(4102444800),
            refreshToken: 'refresh',
        };

        service.setTokens(token);
        expect(values.get('tokenInfo')).toBe(JSON.stringify(token));

        service.logout();
        expect(values.has('tokenInfo')).toBeFalse();
    });

    function tokenExpiringAt(exp: number): string {
        const body = btoa(JSON.stringify({ exp }));
        return `eyJhbGciOiJub25lIn0.${body}.signature`;
    }
});
