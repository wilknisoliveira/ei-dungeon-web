import { Component } from '@angular/core';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    messages: string[] = [
        'Message 1',
        'Message 2',
        'Message 3',
        'Message 4',
        'Message 5',
        'Message 6',
    ];

    newMessage: string = '';

    constructor(private snackBar: SnackbarService) {}

    async onSubmit() {
        try {
            //const result = await this.authService.login(this.userLogin);
        } catch (error) {
            this.snackBar.addError('Something went wrong :(');
            console.log(`Login error: ${error}`);
        }
    }

    adjustTextAreaHeight(event: Event) {
        const textArea = event.target as HTMLTextAreaElement;
        textArea.style.height = 'auto';
        textArea.style.height = `${textArea.scrollHeight}px`;
    }
}
