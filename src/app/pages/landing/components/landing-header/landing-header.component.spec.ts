import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LandingHeaderComponent } from './landing-header.component';

describe('LandingHeaderComponent', () => {
    let component: LandingHeaderComponent;
    let fixture: ComponentFixture<LandingHeaderComponent>;

    const host = (): HTMLElement => fixture.nativeElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LandingHeaderComponent,
                RouterTestingModule,
                NoopAnimationsModule,
            ],
        });
        fixture = TestBed.createComponent(LandingHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should link to login when logged out', () => {
        fixture.componentRef.setInput('isLoggedIn', false);
        fixture.detectChanges();

        expect(host().querySelector('.signin')?.getAttribute('href')).toBe(
            '/login',
        );
    });

    it('should link to home when logged in', () => {
        fixture.componentRef.setInput('isLoggedIn', true);
        fixture.detectChanges();

        expect(host().querySelector('.signin')?.getAttribute('href')).toBe(
            '/home',
        );
    });

    it('should show only one action control in either state', () => {
        fixture.componentRef.setInput('isLoggedIn', true);
        fixture.detectChanges();
        expect(host().querySelectorAll('.signin').length).toBe(1);

        fixture.componentRef.setInput('isLoggedIn', false);
        fixture.detectChanges();
        expect(host().querySelectorAll('.signin').length).toBe(1);
    });

    it('should show the short logo with localized alt text', () => {
        const logo = host().querySelector<HTMLImageElement>('.brand img');

        expect(logo?.getAttribute('src')).toBe('assets/logo_short.webp');
        expect(logo?.alt.length).toBeGreaterThan(0);
    });

    it('should render the language selector', () => {
        expect(host().querySelector('app-language-selector')).toBeTruthy();
    });

    it('should not render a theme toggle', () => {
        expect(host().querySelector('app-theme-toggle')).toBeNull();
    });
});
