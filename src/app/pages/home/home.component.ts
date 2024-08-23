import { Component } from '@angular/core';
import { ChatComponent } from './components/chat/chat.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    plays: string[] = [
        'Play 1',
        'Play 2',
        'Play 3',
        'Play 4',
        'Play 5',
        'Play 6',
        'Play 1',
        'Play 2',
        'Play 3',
        'Play 4',
        'Play 5',
        'Play 6',
        'Play 1',
        'Play 2',
        'Play 3',
        'Play 4',
        'Play 5',
        'Play 6',
    ];

    newRole() {}
}
