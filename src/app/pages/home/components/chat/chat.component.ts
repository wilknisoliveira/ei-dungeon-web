import { HttpErrorResponse } from '@angular/common/http';
import {
    AfterViewChecked,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timeout } from 'rxjs';
import { PlayService } from 'src/app/service/play/play.service';
import { SnackbarService } from 'src/app/service/snackbar/snackbar.service';
import { PagedSearch } from 'src/app/types/general/paged-search';
import { NewPlay } from 'src/app/types/play/new-play';
import { Play } from 'src/app/types/play/play';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnChanges, AfterViewChecked {
    @Input() gameId: string = '';
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('textAreaContainer') textAreaContainer!: ElementRef;

    pageSize: number = 0;
    enableShowMoreAction = true;
    playsPagedSearch: PagedSearch<Play> | null = null;
    newPlayFormGroup: FormGroup;
    goToBotton: boolean = false;
    loading: boolean = false;

    constructor(
        private snackBar: SnackbarService,
        private playService: PlayService,
        private _formBuilder: FormBuilder
    ) {
        this.newPlayFormGroup = this._formBuilder.group({
            newPlayControl: ['', Validators.required],
        });
    }

    ngAfterViewChecked(): void {
        this.adjustAllReadyOnlyTextArea();

        if (this.goToBotton) {
            this.scrollBotton();
            this.goToBotton = false;
        }
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes['gameId']) {
            this.pageSize = 0;
            await this.showMore();
            this.goToBotton = true;
        }
    }

    async ngOnInit(): Promise<void> {
        await this.showMore();
        this.scrollBotton();
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

    async showMore(): Promise<void> {
        this.pageSize = this.pageSize + 20;

        this.playsPagedSearch = await this.getPlays(this.pageSize);

        if (
            this.playsPagedSearch != null &&
            this.pageSize >= this.playsPagedSearch.totalResults
        ) {
            this.enableShowMoreAction = false;
        }
    }

    async onSubmit(): Promise<void> {
        this.loading = true;
        let newPlay: NewPlay = {
            gameId: this.gameId,
            prompt: this.newPlayFormGroup.get('newPlayControl')?.value ?? '',
        };

        this.playService
            .newPlay(newPlay)
            .then(async () => {
                this.loading = false;
                this.playsPagedSearch = await this.getPlays(this.pageSize);
                this.newPlayFormGroup.reset();

                if (this.textAreaContainer) {
                    this.adjustTextAreaHeightElement(
                        this.textAreaContainer
                            .nativeElement as HTMLTextAreaElement
                    );
                }

                this.goToBotton = true;
            })
            .catch((error: HttpErrorResponse) => {
                //TODO: Exibir erro e tratar
                this.loading = false;
                this.snackBar.addError(
                    'Something went wrong while attempting to send your play. Verify with the admin if you have the permissions.'
                );
            });
    }

    adjustTextAreaHeightEvent(event: Event): void {
        const textArea = event.target as HTMLTextAreaElement;
        this.adjustTextAreaHeightElement(textArea);
    }

    adjustTextAreaHeightElement(textArea: HTMLTextAreaElement): void {
        textArea.style.height = 'auto';
        textArea.style.height = `${textArea.scrollHeight}px`;
    }

    scrollBotton(): void {
        if (this.messagesContainer) {
            const container: HTMLDivElement =
                this.messagesContainer.nativeElement;
            container.scrollTop = container.scrollHeight;
        }
    }

    adjustAllReadyOnlyTextArea(): void {
        const readyOnlyTextAreas: NodeListOf<Element> =
            document.querySelectorAll('textarea[readonly]');

        readyOnlyTextAreas.forEach((textarea) => {
            this.adjustTextAreaHeightElement(textarea as HTMLTextAreaElement);
        });
    }
}
