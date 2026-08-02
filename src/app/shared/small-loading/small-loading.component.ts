import { Component, Input } from '@angular/core';

@Component({
    standalone: false,
    selector: 'app-small-loading',
    templateUrl: './small-loading.component.html',
    styleUrls: ['./small-loading.component.scss'],
})
export class SmallLoadingComponent {
    @Input() isLoading: boolean = false;
}
