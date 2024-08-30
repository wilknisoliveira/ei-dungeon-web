import { Component, Input, OnInit } from '@angular/core';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
    @Input() gameId: string = '';

    messages: { user: string; message: string; type: number }[] = [
        {
            user: 'User 1',
            message: 'sdgsgs sdgds g s dgs ',
            type: 1,
        },
        {
            user: 'User 2',
            message: 'sdg sg dsg s dgdg',
            type: 0,
        },
        {
            user: 'User 1',
            message: 'ds gdsggs dgdsg sd',
            type: 1,
        },
        {
            user: 'User 2',
            message: ' sdgdsg sdgdg sgd ',
            type: 0,
        },
        {
            user: 'User 1',
            message: ' sgddg sddg sgs ',
            type: 1,
        },
    ];

    newMessage: string = '';

    constructor(private snackBar: SnackbarService) {}

    ngOnInit(): void {}

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
