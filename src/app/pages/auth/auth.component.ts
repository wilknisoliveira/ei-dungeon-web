import { Component, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
    emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);

    hide = signal(true);
}
