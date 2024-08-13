import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-button-flat',
    templateUrl: './button-flat.component.html',
    styleUrls: ['./button-flat.component.scss'],
    standalone: true,
    imports: [MatButtonModule, MatDividerModule, MatIconModule],
})
export class ButtonFlatComponent {
    @Input() buttonName: string = 'default name';
}
