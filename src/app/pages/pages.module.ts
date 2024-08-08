import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutingModule } from './routing.modules';
import { AuthComponent } from './auth/auth.component';
import { MatIconModule } from '@angular/material/icon';
import { EmailInputComponent } from '../shared/email-input/email-input.component';
import { PasswordInputComponent } from '../shared/password-input/password-input.component';

@NgModule({
    declarations: [AuthComponent],
    imports: [
        CommonModule,
        RoutingModule,
        MatIconModule,
        EmailInputComponent,
        PasswordInputComponent,
    ],
})
export class PagesModule {}
