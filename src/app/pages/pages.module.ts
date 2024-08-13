import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutingModule } from './routing.modules';
import { AuthComponent } from './auth/auth.component';
import { MatIconModule } from '@angular/material/icon';
import { EmailInputComponent } from '../shared/email-input/email-input.component';
import { PasswordInputComponent } from '../shared/password-input/password-input.component';
import { ButtonFlatComponent } from '../shared/button-flat/button-flat.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    declarations: [AuthComponent],
    imports: [
        CommonModule,
        RoutingModule,
        MatIconModule,
        EmailInputComponent,
        PasswordInputComponent,
        ButtonFlatComponent,
        MatButtonModule,
        MatDividerModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
})
export class PagesModule {}
