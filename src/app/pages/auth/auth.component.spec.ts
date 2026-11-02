import { AuthService } from 'src/app/service/auth/auth.service';
import { EmailAuthFlowService } from 'src/app/service/auth/email-auth-flow.service';
import { SESSION_STORAGE } from 'src/app/core/storage/app-storage';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
    let component: AuthComponent;
    let fixture: ComponentFixture<AuthComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SESSION_STORAGE, useValue: { getItem: () => null, setItem: () => undefined } }],
            imports: [
                AuthComponent,
                RouterTestingModule,
                HttpClientTestingModule,
                NoopAnimationsModule,
            ],
        });
        fixture = TestBed.createComponent(AuthComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('routes only the specific unverified response to verification without inferring email', async () => {
        const auth = TestBed.inject(AuthService);
        spyOn(auth, 'login').and.rejectWith(new HttpErrorResponse({ status: 403, error: { code: 'email_verification_required' } }));
        const router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        component.userLogin = { userName: 'player', password: 'password' };
        await component.onSubmit();
        expect(router.navigate).toHaveBeenCalledWith(['/email-verification']);
        expect(TestBed.inject(EmailAuthFlowService).context('verification').email).toBe('');
        expect(component.userLogin.password).toBe('');
    });
    it('keeps incorrect credentials on login with localized error', async () => {
        spyOn(TestBed.inject(AuthService), 'login').and.rejectWith(new HttpErrorResponse({ status: 401 }));
        const router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        component.userLogin = { userName: 'player', password: 'wrong' };
        await component.onSubmit();
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.error).toContain('Invalid username or password');
    });
});
