import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FirstStepsComponent } from './first-steps.component';

describe('FirstStepsComponent', () => {
    let component: FirstStepsComponent;
    let fixture: ComponentFixture<FirstStepsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FirstStepsComponent,
                HttpClientTestingModule,
                NoopAnimationsModule,
            ],
        });
        fixture = TestBed.createComponent(FirstStepsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
