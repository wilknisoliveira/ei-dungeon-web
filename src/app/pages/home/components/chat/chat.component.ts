import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { PlayService } from 'src/app/service/play/play.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { Play } from 'src/app/types/play/play';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnChanges {
    @Input() gameId: string = '';

    pageSize: number = 0;
    enableShowMoreAction = true;
    playsPagedSearch: PagedSearch<Play> | null = null;

    newMessage: string = '';

    constructor(
        private snackBar: SnackbarService,
        private playService: PlayService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['gameId']) {
            this.pageSize = 0;
            this.showMore();
        }
    }

    ngOnInit(): void {
        this.showMore();
    }

    async getPlays(size: number): Promise<PagedSearch<Play> | null> {
        let result: PagedSearch<Play> | null = null;

        try {
            result = await this.playService.getPlays(this.gameId, size);
        } catch (error) {
            this.snackBar.addError(
                'Something went wrong while attempting to get the play list.'
            );
            console.log(`Error: ${error}`);
        }

        return result;
    }

    async showMore() {
        this.pageSize = this.pageSize + 20;

        this.playsPagedSearch = await this.getPlays(this.pageSize);

        if (
            this.playsPagedSearch != null &&
            this.pageSize >= this.playsPagedSearch.totalResults
        ) {
            this.enableShowMoreAction = false;
        }
    }

    async onSubmit() {
        try {
            //const result = await this.authService.login(this.userLogin);
        } catch (error) {
            this.snackBar.addError(
                'Something went wrong while attempting to send your play.'
            );
            console.log(`Error: ${error}`);
        }
    }

    adjustTextAreaHeight(event: Event) {
        const textArea = event.target as HTMLTextAreaElement;
        textArea.style.height = 'auto';
        textArea.style.height = `${textArea.scrollHeight}px`;
    }
}
