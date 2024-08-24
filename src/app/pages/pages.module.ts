import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutingModule } from './routing.modules';
import { AuthComponent } from './auth/auth.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { SignupComponent } from './signup/signup.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChatComponent } from './home/components/chat/chat.component';
import { MatListModule } from '@angular/material/list';
import { FirstStepsComponent } from './home/components/first-steps/first-steps.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
    declarations: [
        AuthComponent,
        HomeComponent,
        SignupComponent,
        ChatComponent,
        FirstStepsComponent,
    ],
    imports: [
        CommonModule,
        RoutingModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatSidenavModule,
        MatListModule,
        MatStepperModule,
        MatSliderModule,
    ],
    exports: [ChatComponent, FirstStepsComponent],
})
export class PagesModule {}
